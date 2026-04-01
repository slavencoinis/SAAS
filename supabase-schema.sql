-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  url text,
  price numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  billing_cycle text not null default 'monthly', -- monthly, yearly, weekly, one-time
  start_date date,
  renewal_date date,
  status text not null default 'active', -- active, inactive, cancelled, trial
  usage_status text not null default 'medium', -- high, medium, low, unused
  category text, -- productivity, development, design, marketing, communication, storage, other
  notes text,
  api_key_linked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at();

-- User settings table (budget limit)
create table if not exists public.user_settings (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null unique,
  monthly_budget numeric(10, 2),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function update_updated_at();
