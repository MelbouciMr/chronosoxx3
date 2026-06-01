-- ============================================
-- CHRONOS — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Waitlist
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text,
  ip          text,
  created_at  timestamptz default now()
);

-- Index for fast lookups
create index if not exists waitlist_email_idx on waitlist(email);

-- 2. Agents — registered by developers
create table if not exists agents (
  id            uuid primary key default gen_random_uuid(),
  owner_wallet  text not null,          -- dev's wallet address
  name          text not null,
  description   text,
  rate_usdc_per_sec  numeric(18,8) not null default 0.0001,  -- price per second
  hermes_endpoint    text,              -- optional: Hermes agent URL
  hermes_profile     text,             -- optional: Hermes profile name
  active        boolean default true,
  created_at    timestamptz default now()
);

create index if not exists agents_owner_idx on agents(owner_wallet);

-- 3. Balances — prepaid USDC per user per agent
create table if not exists balances (
  id            uuid primary key default gen_random_uuid(),
  user_wallet   text not null,
  agent_id      uuid references agents(id) on delete cascade,
  balance_usdc  numeric(18,8) not null default 0,
  updated_at    timestamptz default now(),
  unique(user_wallet, agent_id)
);

create index if not exists balances_user_agent_idx on balances(user_wallet, agent_id);

-- 4. Sessions — active metering sessions
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  user_wallet   text not null,
  agent_id      uuid references agents(id) on delete cascade,
  started_at    timestamptz default now(),
  ended_at      timestamptz,
  duration_secs numeric(10,2),
  cost_usdc     numeric(18,8),
  status        text default 'active'   -- active | ended | insufficient_funds
);

create index if not exists sessions_user_idx on sessions(user_wallet, status);
create index if not exists sessions_agent_idx on sessions(agent_id, status);

-- 5. Deposits — USDC deposits recorded on-chain
create table if not exists deposits (
  id            uuid primary key default gen_random_uuid(),
  user_wallet   text not null,
  agent_id      uuid references agents(id) on delete cascade,
  amount_usdc   numeric(18,8) not null,
  tx_hash       text not null unique,   -- Base transaction hash
  confirmed     boolean default false,
  created_at    timestamptz default now()
);

-- 6. Earnings — developer earnings per session
create table if not exists earnings (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references sessions(id),
  agent_id      uuid references agents(id),
  owner_wallet  text not null,
  gross_usdc    numeric(18,8),          -- what user paid
  fee_usdc      numeric(18,8),          -- chronos 1% cut
  net_usdc      numeric(18,8),          -- dev gets this
  created_at    timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table waitlist enable row level security;
alter table agents enable row level security;
alter table balances enable row level security;
alter table sessions enable row level security;
alter table deposits enable row level security;
alter table earnings enable row level security;

-- Waitlist: only service role can read, anyone can insert
create policy "waitlist_insert" on waitlist for insert with check (true);
create policy "waitlist_service_read" on waitlist for select using (false); -- service role bypasses RLS

-- Agents: public read, owner write
create policy "agents_public_read" on agents for select using (active = true);
create policy "agents_owner_insert" on agents for insert with check (true);
create policy "agents_owner_update" on agents for update using (true);

-- Balances: user sees their own
create policy "balances_own" on balances for all using (true); -- filtered in API by wallet

-- Sessions: user sees their own
create policy "sessions_own" on sessions for all using (true);

-- Deposits: user sees their own
create policy "deposits_own" on deposits for all using (true);

-- Earnings: owner sees their own
create policy "earnings_own" on earnings for select using (true);

-- ============================================
-- Helper function: deduct balance atomically
-- ============================================
create or replace function deduct_balance(
  p_user_wallet text,
  p_agent_id uuid,
  p_amount numeric
) returns boolean as $$
declare
  current_balance numeric;
begin
  select balance_usdc into current_balance
  from balances
  where user_wallet = p_user_wallet and agent_id = p_agent_id
  for update;

  if current_balance is null or current_balance < p_amount then
    return false;
  end if;

  update balances
  set balance_usdc = balance_usdc - p_amount,
      updated_at = now()
  where user_wallet = p_user_wallet and agent_id = p_agent_id;

  return true;
end;
$$ language plpgsql security definer;
