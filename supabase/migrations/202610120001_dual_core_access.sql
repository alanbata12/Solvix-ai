-- Solvix dual-core access and AIL report foundation.
-- Apply this migration in Supabase before enabling the new vertical gates.
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vertical text not null check (vertical in ('FOREX', 'AIL')),
  plan_tier text not null default 'FREE_TRIAL'
    check (plan_tier in ('FREE_TRIAL', 'PRO', 'ENTERPRISE')),
  status text not null default 'incomplete'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  active_until timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, vertical)
);

create index if not exists user_subscriptions_user_status_idx
  on public.user_subscriptions (user_id, status);

alter table public.user_subscriptions enable row level security;
drop policy if exists "Users can read their own vertical subscriptions" on public.user_subscriptions;
create policy "Users can read their own vertical subscriptions"
  on public.user_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);
-- No client insert/update/delete policy: subscription grants must be written by trusted server code.

create table if not exists public.ail_threat_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  severity text not null default 'info'
    check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  title text not null,
  summary text not null,
  source text,
  indicators jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ail_threat_reports_user_created_idx
  on public.ail_threat_reports (user_id, created_at desc);

alter table public.ail_threat_reports enable row level security;
drop policy if exists "Users can read their own AIL reports" on public.ail_threat_reports;
create policy "Users can read their own AIL reports"
  on public.ail_threat_reports for select
  to authenticated
  using (auth.uid() = user_id);
-- Reports are written by trusted server/Edge Function code only.
