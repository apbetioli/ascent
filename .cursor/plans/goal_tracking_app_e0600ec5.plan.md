---
name: Goal Tracking App
overview: Build a full-stack goal tracking application with Next.js 16.1.4 (App Router), TailwindCSS 4, Supabase (PostgreSQL + Auth + Realtime), Stripe one-time payment, and a beautiful landing page.
todos:
  - id: setup
    content: Initialize Next.js 16.1.4, TailwindCSS 4, shadcn/ui, Supabase project + local dev
    status: completed
  - id: database
    content: Create Supabase tables (users, boards, goals, records) with RLS policies
    status: completed
  - id: auth
    content: Configure Supabase Auth with Google OAuth and Magic Link
    status: completed
  - id: boards-crud
    content: Build boards CRUD with auto-creation on first login
    status: completed
  - id: goals-crud
    content: Build goals CRUD with color picker, recurrence, deadline (timestamp) options
    status: completed
  - id: records-crud
    content: Build records CRUD with timestamp picker and amount input
    status: completed
  - id: progress
    content: Implement progress calculation with recurrence windows, timezone support, and surpassed state
    status: completed
  - id: realtime
    content: Add Supabase Realtime subscriptions for live goal updates
    status: completed
  - id: embed
    content: Create embeddable goal widget via embed_id (UUID) for public boards
    status: completed
  - id: public-boards
    content: Add public board sharing with public_slug (UUID)
    status: completed
  - id: api
    content: Build public API v1 with token auth and Upstash rate limiting
    status: completed
  - id: stripe
    content: Integrate Stripe checkout and webhooks for one-time payment
    status: completed
  - id: landing
    content: Create landing page with Hero, Features, Pricing, FAQ components
    status: completed
  - id: polish
    content: Add loading states, error handling, mobile optimization, SEO meta tags
    status: completed
isProject: false
---

# Goal Tracking App - Implementation Plan

## Tech Stack

- **Framework**: Next.js 16.1.4 with App Router (for SEO-friendly pages)
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (magic link + Google OAuth built-in)
- **Realtime**: Supabase Realtime (table subscriptions)
- **Payments**: Stripe Checkout (one-time payment) + Webhooks
- **Rate Limiting**: Upstash Redis + @upstash/ratelimit (for public API)
- **Validation**: Zod schemas
- **Local Dev**: Supabase CLI (`supabase start`)

---

## Project Structure

```
/app
  /(marketing)          # Landing page, pricing (public)
    /page.tsx           # Landing page
    /pricing/page.tsx
  /(auth)               # Auth pages (Supabase handles magic link/OAuth)
    /login/page.tsx
    /auth/callback/route.ts  # Supabase auth callback
  /(dashboard)          # Protected app routes
    /boards/page.tsx
    /boards/[boardId]/page.tsx
    /goals/[goalId]/page.tsx
    /settings/page.tsx
  /public/[publicSlug]/page.tsx  # Public board view (read-only)
  /embed/[embedId]/page.tsx      # Embeddable goal widget (iframe-friendly)
  /api
    /webhooks/stripe/route.ts
    /v1                 # Public API (token auth)
      /goals/route.ts
      /goals/[goalId]/route.ts
      /goals/[goalId]/records/route.ts
/components
  /landing              # Landing page sections
  /dashboard            # App components
  /ui                   # shadcn/ui components
/lib
  /supabase             # Supabase client (browser + server)
  /payments             # Payment provider abstraction
    /types.ts           # PaymentProvider interface
    /stripe.ts          # Stripe implementation (default)
  /rate-limit           # Upstash rate limiter
  /validations          # Zod schemas
  /utils                # Helpers (colors, progress calc, timezone)
/supabase
  /migrations           # SQL migrations
  /seed.sql             # Dev seed data
```

---

## Database Schema (Supabase/PostgreSQL)

### profiles (extends Supabase auth.users)

```sql
create table profiles (
  id uuid references auth.users primary key,
  name text,
  avatar_url text,
  payment_provider text,       -- 'stripe' | 'lemonsqueezy' | etc.
  payment_customer_id text,    -- Provider-agnostic customer ID
  has_paid boolean default false,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: Users can only read/update their own profile
```

### api_tokens

```sql
create table api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  hashed_token text not null,
  created_at timestamptz default now()
);
-- Index: (hashed_token) for API auth lookup
-- RLS: Users can only manage their own tokens
```

### boards

```sql
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  is_public boolean default false,
  public_slug uuid unique,  -- Generated when is_public = true
  theme text default 'default',
  -- Future (Google Sheets): source text default 'app', google_sheet_id text
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Index: (user_id), (public_slug) unique where not null
-- RLS: Owner full access; public boards readable by anyone
```

### goals

```sql
create table goals (
  id uuid primary key default gen_random_uuid(),
  embed_id uuid unique default gen_random_uuid(),
  board_id uuid references boards on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,  -- CACHED for fast reads
  deadline bigint,  -- Unix timestamp ms (optional)
  recurrence text default 'none'
    check (recurrence in ('none','daily','weekly','monthly','yearly')),
  is_reverse boolean default false,
  color text not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Index: (board_id, sort_order), (embed_id) unique, (user_id)
-- Future (Google Sheets): unique index on (board_id, name) for upsert by name
-- RLS: Owner full access; public board goals readable via public_slug
```

### records

```sql
create table records (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  amount numeric not null,  -- Can be negative
  description text,
  timestamp bigint not null  -- Unix timestamp ms (the record date)
);
-- Index: (goal_id, timestamp desc), (user_id)
-- RLS: Owner full access
```

### Trigger: Auto-update current_amount

```sql
create or replace function update_goal_current_amount()
returns trigger as $$
begin
  update goals set
    current_amount = coalesce((
      select sum(amount) from records where goal_id = NEW.goal_id
    ), 0),
    updated_at = now()
  where id = NEW.goal_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_record_change
after insert or update or delete on records
for each row execute function update_goal_current_amount();
```

**Notes:**

- Row Level Security (RLS) enforces authorization at database level
- `current_amount` auto-updated via trigger on record changes
- Supabase Realtime subscribes to `goals` table for live updates
- Recurrence window filtering done in app layer (needs user timezone)
- All goals on public boards are embeddable via `embed_id`

---

## Key Implementation Details

### 1. Progress Calculation

```typescript
function calculateProgress(goal, records, userTimezone: string) {
  let relevantRecords = records;

  // Filter by recurrence window
  if (goal.recurrence !== "none") {
    const windowStart = getRecurrenceWindowStart(goal.recurrence, userTimezone);
    relevantRecords = records.filter((r) => r.timestamp >= windowStart);
  }

  const total = relevantRecords.reduce((sum, r) => sum + r.amount, 0);
  const percentage = (total / goal.targetAmount) * 100;

  // For reverse goals: starts at 100%, decreases as progress is made
  // For normal goals: starts at 0%, increases (can exceed 100%)
  return goal.isReverse ? Math.max(0, 100 - percentage) : percentage; // No cap - goals can be surpassed
}

// UI renders surpassed goals (>100%) with special styling (e.g., gold border, confetti)
```

### 2. Real-time Updates with Supabase Realtime

```typescript
// Subscribe to goal changes (e.g., current_amount updates)
const channel = supabase
  .channel("goal-updates")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "goals",
      filter: `id=eq.${goalId}`,
    },
    (payload) => setGoal(payload.new)
  )
  .subscribe();

// Cleanup on unmount
return () => supabase.removeChannel(channel);
```

- Built-in reconnection handling
- Subscribe to specific goal or entire board's goals
- No custom SSE implementation needed

### 3. API Rate Limiting

```typescript
// Using @upstash/ratelimit
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests/hour
});
```

### 4. Payment Provider Abstraction

Abstraction layer for easy provider switching (Stripe → Lemon Squeezy, etc.):

```typescript
// lib/payments/types.ts
export interface PaymentProvider {
  createCheckoutUrl(userId: string, email: string): Promise<string>;
  handleWebhook(req: Request): Promise<WebhookResult>;
}

export interface WebhookResult {
  userId: string;
  customerId: string;
  paid: boolean;
}

// lib/payments/stripe.ts
export const stripeProvider: PaymentProvider = {
  async createCheckoutUrl(userId, email) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      metadata: { userId },
      // ...
    });
    return session.url;
  },
  async handleWebhook(req) {
    /* ... */
  },
};
```

To switch providers later: create `lib/payments/lemonsqueezy.ts` and swap the import.

### 5. Default Color Palette for Goals

Pre-defined palette with 12 colors (auto-assigned on goal creation):

`#EF4444` (red), `#F97316` (orange), `#EAB308` (yellow), `#22C55E` (green), `#14B8A6` (teal), `#3B82F6` (blue), `#6366F1` (indigo), `#8B5CF6` (violet), `#EC4899` (pink), `#F43F5E` (rose), `#64748B` (slate), `#78716C` (stone)

**Future**: Board themes will override individual goal colors with a cohesive palette.

### 6. Embeddable Widget

- Route: `/embed/[embedId]` (uses goal's UUID `embed_id`)
- Renders minimal card with progress bar, percentage, and remaining value
- Uses `X-Frame-Options: ALLOWALL` for iframe embedding
- Automatically available for all goals on public boards
- Displays surpassed goals with special overflow styling

### 7. Public Board Access

- Route: `/public/[publicSlug]`
- UUID `public_slug` generated only when board is made public
- No auth required, read-only view of all goals
- All goals on public boards are embeddable via their `embed_id`

---

## Landing Page Components

```
/components/landing/
  Hero.tsx              # Main hero with CTA
  Features.tsx          # Feature grid
  HowItWorks.tsx        # 3-step process
  Testimonials.tsx      # Social proof
  Pricing.tsx           # Pricing cards
  FAQ.tsx               # Accordion FAQ
  CTA.tsx               # Final call-to-action
  Footer.tsx            # Links and legal
```

---

## Authentication Flow (Supabase Auth)

1. User visits `/login`
2. Chooses Google OAuth or Magic Link (email)
3. Supabase handles OAuth redirect or sends magic link email
4. On callback (`/auth/callback`), exchange code for session
5. Check `profiles.has_paid` - if false, redirect to Stripe Checkout
6. Stripe webhook sets `has_paid = true` in profiles table
7. On first login, auto-create default board via database trigger or API
8. Redirect to `/boards`

```typescript
// Supabase Auth - Magic Link
await supabase.auth.signInWithOtp({ email });

// Supabase Auth - Google OAuth
await supabase.auth.signInWithOAuth({ provider: "google" });
```

---

## API Structure (Public API v1)

| Method | Endpoint | Description |

| ------ | -------------------------------- | ------------------ |

| GET | `/api/v1/goals` | List user's goals |

| GET | `/api/v1/goals/:id` | Get goal details |

| POST | `/api/v1/goals/:id/records` | Add record to goal |

| GET | `/api/v1/goals/:id/records` | List records |

| PUT | `/api/v1/goals/:id/records/:rid` | Update record |

| DELETE | `/api/v1/goals/:id/records/:rid` | Delete record |

Auth via `Authorization: Bearer <api-token>` header.

---

## Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (PostgreSQL, Auth, Realtime, Studio)
supabase start

# Apply migrations
supabase db push

# Access local Studio at http://localhost:54323
```

No separate Docker Compose needed - Supabase CLI handles everything.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # or production URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Server-side only

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID=...  # One-time payment product

# Upstash Redis (API rate limiting only)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Implementation Order

The implementation will follow this sequence to build incrementally:

1. **Project Setup** - Initialize Next.js 16.1.4, TailwindCSS 4, shadcn/ui, Supabase CLI
2. **Database Schema** - Create tables, indexes, RLS policies, triggers
3. **Authentication** - Supabase Auth with Google OAuth + Magic Link
4. **Core CRUD** - Boards, Goals, Records with UI
5. **Progress Logic** - Calculation with recurrence windows + surpassed state
6. **Real-time** - Supabase Realtime subscriptions for live updates
7. **Public Features** - Embeddable widgets (via embed_id), public boards
8. **API Layer** - Public API with token auth and Upstash rate limiting
9. **Payments** - Stripe one-time checkout and webhook handling
10. **Landing Page** - Marketing page with all sections
11. **Polish** - Loading states, error handling, mobile optimization

---

## Future: Google Sheets Integration

Sync goals directly from a Google Spreadsheet - no code or Apps Script required.

### Concept

- **1 Spreadsheet = 1 Board** - Each connected sheet maps to a board
- **1 Row = 1 Goal** - Spreadsheet rows become goals
- **Single source of truth** - Board is EITHER app-managed OR sheet-managed (not both)
- **Direct current_amount** - No records needed; progress comes from the sheet

### Board Source Modes

| Board Source | Create/Edit Goals | Delete Goals | Records | Progress |

|--------------|-------------------|--------------|---------|----------|

| `app` | In-app UI | In-app UI | Yes | Calculated from records |

| `google_sheets` | Only via spreadsheet | Only via spreadsheet | No | Direct from sheet |

Sheet-managed boards show "Edit in Google Sheets" link instead of edit forms.

### User Spreadsheet Format

| Name | Target | Current | Deadline | Notes |

|------|--------|---------|----------|-------|

| Save for vacation | 5000 | 2300 | 2026-06-01 | |

| Pay off credit card | 8000 | 6500 | | |

| Read 50 books | 50 | 23 | 2026-12-31 | |

User just updates the "Current" column - no technical knowledge needed.

### Database Changes

```sql
-- Add to boards table
source text default 'app',  -- 'app' | 'google_sheets'
google_sheet_id text,       -- Only set when source = 'google_sheets'
google_sheet_last_sync timestamptz,

-- Goals matched by name within board (no external_id needed)
create unique index idx_goals_board_name
  on goals(board_id, name);
```

### Sync Flow

1. User creates a new board and clicks "Connect Google Sheet"
2. OAuth flow grants read access to Google Sheets API
3. User selects spreadsheet and sheet tab
4. Board `source` set to `'google_sheets'`
5. User clicks "Sync Now" (or enable auto-sync polling)
6. App syncs:
  - Rows in sheet → upsert goals by name
  - Goals NOT in sheet → delete from database

```typescript
async function syncSheetBoard(boardId: string, rows: SheetRow[]) {
  const sheetGoalNames = rows.map((r) => r.name);

  // Upsert all goals from sheet
  for (const row of rows) {
    await supabase.from("goals").upsert(
      {
        board_id: boardId,
        name: row.name,
        target_amount: row.target,
        current_amount: row.current,
        deadline: row.deadline,
      },
      { onConflict: "board_id,name" }
    );
  }

  // Delete goals removed from sheet
  await supabase
    .from("goals")
    .delete()
    .eq("board_id", boardId)
    .not("name", "in", `(${sheetGoalNames.join(",")})`);
}
```

### Key Points

- **No Apps Script** - Pure Google Sheets API via OAuth
- **No records** - `current_amount` set directly from spreadsheet
- **No orphans** - Deleted/renamed rows handled automatically on sync
- **Clean separation** - Board is fully app-managed OR fully sheet-managed
- **Name as identifier** - Goal name must be unique within board

