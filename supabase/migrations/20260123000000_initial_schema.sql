-- Note: gen_random_uuid() is built into PostgreSQL 13+ (no extension needed)

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  payment_provider text,
  payment_customer_id text,
  has_paid boolean default false,
  timezone text default 'UTC',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for faster lookups
create index idx_profiles_payment_customer on profiles(payment_provider, payment_customer_id) 
  where payment_customer_id is not null;

-- RLS for profiles
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- API TOKENS TABLE
-- ============================================
create table api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  hashed_token text not null,
  created_at timestamptz default now() not null
);

-- Index for API auth lookup
create index idx_api_tokens_hashed on api_tokens(hashed_token);

-- RLS for api_tokens
alter table api_tokens enable row level security;

create policy "Users can view their own tokens"
  on api_tokens for select
  using (auth.uid() = user_id);

create policy "Users can create their own tokens"
  on api_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own tokens"
  on api_tokens for delete
  using (auth.uid() = user_id);

-- ============================================
-- BOARDS TABLE
-- ============================================
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  is_public boolean default false,
  public_slug uuid unique,
  theme text default 'default',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_boards_user on boards(user_id);
create index idx_boards_public_slug on boards(public_slug) where public_slug is not null;

-- RLS for boards
alter table boards enable row level security;

create policy "Users can view their own boards"
  on boards for select
  using (auth.uid() = user_id);

create policy "Anyone can view public boards"
  on boards for select
  using (is_public = true);

create policy "Users can create their own boards"
  on boards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own boards"
  on boards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own boards"
  on boards for delete
  using (auth.uid() = user_id);

-- ============================================
-- GOALS TABLE
-- ============================================
create table goals (
  id uuid primary key default gen_random_uuid(),
  embed_id uuid unique default gen_random_uuid(),
  board_id uuid references boards on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline bigint,
  recurrence text default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  is_reverse boolean default false,
  color text not null,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_goals_board on goals(board_id, sort_order);
create index idx_goals_user on goals(user_id);
create index idx_goals_embed on goals(embed_id);

-- RLS for goals
alter table goals enable row level security;

create policy "Users can view their own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Anyone can view goals on public boards"
  on goals for select
  using (
    exists (
      select 1 from boards 
      where boards.id = goals.board_id 
      and boards.is_public = true
    )
  );

create policy "Users can create goals on their boards"
  on goals for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from boards 
      where boards.id = board_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can update their own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on goals for delete
  using (auth.uid() = user_id);

-- ============================================
-- RECORDS TABLE
-- ============================================
create table records (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  amount numeric not null,
  description text,
  timestamp bigint not null
);

-- Indexes for efficient queries
create index idx_records_goal_timestamp on records(goal_id, timestamp desc);
create index idx_records_user on records(user_id);

-- RLS for records
alter table records enable row level security;

create policy "Users can view their own records"
  on records for select
  using (auth.uid() = user_id);

create policy "Anyone can view records on public board goals"
  on records for select
  using (
    exists (
      select 1 from goals
      join boards on boards.id = goals.board_id
      where goals.id = records.goal_id
      and boards.is_public = true
    )
  );

create policy "Users can create records on their goals"
  on records for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from goals 
      where goals.id = goal_id 
      and goals.user_id = auth.uid()
    )
  );

create policy "Users can update their own records"
  on records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own records"
  on records for delete
  using (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update goal current_amount
-- ============================================
create or replace function update_goal_current_amount()
returns trigger as $$
declare
  target_goal_id uuid;
begin
  -- Get the goal_id from either OLD or NEW depending on operation
  if TG_OP = 'DELETE' then
    target_goal_id := OLD.goal_id;
  else
    target_goal_id := NEW.goal_id;
  end if;

  -- Update the goal's current_amount
  update goals set
    current_amount = coalesce((
      select sum(amount) from records where goal_id = target_goal_id
    ), 0),
    updated_at = now()
  where id = target_goal_id;

  -- Return appropriate value based on operation
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_record_change
  after insert or update or delete on records
  for each row execute function update_goal_current_amount();

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_boards_updated_at
  before update on boards
  for each row execute function update_updated_at();

create trigger update_goals_updated_at
  before update on goals
  for each row execute function update_updated_at();

-- ============================================
-- FUNCTION: Generate public_slug when making board public
-- ============================================
create or replace function generate_public_slug()
returns trigger as $$
begin
  -- If board is being made public and doesn't have a slug, generate one
  if NEW.is_public = true and NEW.public_slug is null then
    NEW.public_slug := gen_random_uuid();
  end if;
  
  -- If board is being made private, optionally keep the slug for later
  -- (user can re-enable public access with same URL)
  
  return NEW;
end;
$$ language plpgsql;

create trigger on_board_public_change
  before update of is_public on boards
  for each row execute function generate_public_slug();

-- ============================================
-- ENABLE REALTIME
-- ============================================
alter publication supabase_realtime add table goals;
alter publication supabase_realtime add table records;
