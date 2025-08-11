
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  store text not null check (store in ('Shopee','Lazada','TikTok Shop','Etsy','Shopify Local','Shopify International')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null check (currency in ('PHP','USD')),
  factory_price numeric(12,2) not null check (factory_price >= 0),
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists public.settings (
  id int primary key,
  usd_to_php numeric(12,4) not null default 56,
  monthly_goal_amount numeric(12,2) not null default 0,
  monthly_goal_currency text not null default 'PHP' check (monthly_goal_currency in ('PHP','USD')),
  updated_at timestamp with time zone default now()
);

-- Seed a single settings row
insert into public.settings (id, usd_to_php, monthly_goal_amount, monthly_goal_currency)
values (1, 56, 0, 'PHP')
on conflict (id) do nothing;

-- RLS
alter table public.transactions enable row level security;
alter table public.settings enable row level security;

-- WARNING: For quick start only. These policies allow full access with the anon key.
-- Lock down for production as needed.

create policy "Allow all on transactions"
  on public.transactions for all
  using (true)
  with check (true);

create policy "Allow all on settings"
  on public.settings for all
  using (true)
  with check (true);
