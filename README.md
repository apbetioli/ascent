# GoalTrack

A beautiful and simple goal tracking app built with Next.js, Supabase, and Stripe.

## Features

- **Visual Progress Tracking** - Beautiful progress bars with color customization
- **Forward & Reverse Goals** - Track savings (increasing) or debt payoff (decreasing)
- **Recurring Goals** - Daily, weekly, monthly, or yearly goals with automatic reset
- **Due Dates** - Set target dates and see countdown
- **Public Boards** - Share your progress with others via unique URL
- **Embeddable Widgets** - Embed goal progress on any website
- **Real-time Updates** - See changes instantly across all devices
- **Public API** - Automate goal updates via REST API
- **One-time Payment** - Pay once, use forever (Stripe integration)

## Tech Stack

- **Framework**: Next.js 16.1.4 with App Router
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link + Google OAuth)
- **Real-time**: Supabase Realtime
- **Payments**: Stripe Checkout
- **Rate Limiting**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI (`npm install -g supabase`)
- Stripe account (for payments)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd gtapp
   npm install
   ```

2. **Set up Supabase**
   ```bash
   # Start local Supabase (PostgreSQL, Auth, Realtime)
   supabase start
   
   # This will output your local credentials
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example env file
   cp .env.local.example .env.local
   
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

### Stripe Setup (for payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a one-time payment product and price
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
4. Add your keys to `.env.local`

### Upstash Setup (for rate limiting)

1. Create an Upstash account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Add the REST URL and token to `.env.local`

## Project Structure

```
/src
  /app
    /(marketing)     # Landing page, pricing
    /(auth)          # Login, auth callback
    /(dashboard)     # Boards, goals, settings
    /public          # Public board view
    /embed           # Embeddable widget
    /api             # API routes
  /components
    /landing         # Landing page sections
    /dashboard       # App components
    /ui              # shadcn/ui components
  /lib
    /supabase        # Supabase client
    /payments        # Payment provider abstraction
    /rate-limit      # Upstash rate limiter
    /validations     # Zod schemas
    /utils           # Helpers
    /hooks           # React hooks
/supabase
  /migrations        # SQL migrations
```

## API Documentation

### Authentication

All API requests require a Bearer token:
```
Authorization: Bearer gt_xxx...
```

Create API tokens in Settings.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/goals` | List all goals |
| GET | `/api/v1/goals/:id` | Get goal details |
| POST | `/api/v1/goals/:id/records` | Add record to goal |
| GET | `/api/v1/goals/:id/records` | List records |
| PUT | `/api/v1/goals/:id/records/:rid` | Update record |
| DELETE | `/api/v1/goals/:id/records/:rid` | Delete record |

### Example

```bash
# Add progress to a goal
curl -X POST https://yourapp.com/api/v1/goals/xxx/records \
  -H "Authorization: Bearer gt_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "description": "Weekly deposit"}'
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

### Supabase Production

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations: `supabase db push --linked`
3. Update your production environment variables

## License

MIT
