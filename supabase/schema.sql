-- UPay schema
-- Run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ─── merchants ────────────────────────────────────────────────────────────────
create table if not exists merchants (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text not null unique,
  settlement_address  text not null,
  settlement_token    text not null default 'USDC',
  settlement_chain    text not null default 'base',
  created_at          timestamptz not null default now()
);

-- ─── api_keys ─────────────────────────────────────────────────────────────────
create table if not exists api_keys (
  id          uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  key_prefix  text not null,   -- e.g. "pk_live_8Kwz0…" shown in dashboard
  key_hash    text not null,   -- sha256 of full key — raw key never stored
  type        text not null check (type in ('publishable', 'secret')),
  revoked     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists api_keys_hash_idx on api_keys (key_hash) where not revoked;

-- ─── checkout_sessions ────────────────────────────────────────────────────────
create table if not exists checkout_sessions (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references merchants(id) on delete cascade,
  amount       numeric(20,6) not null,
  settle_token text not null,
  settle_chain text not null,
  recipient    text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'paid', 'failed', 'expired')),
  metadata     jsonb,
  success_url  text,
  cancel_url   text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '30 minutes'
);

create index if not exists sessions_merchant_status_idx
  on checkout_sessions (merchant_id, status, created_at desc);

-- ─── payments ─────────────────────────────────────────────────────────────────
create table if not exists payments (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references checkout_sessions(id),
  merchant_id      uuid not null references merchants(id),
  payer_address    text not null,
  settle_token     text not null,
  settle_chain     text not null,
  amount           numeric(20,6) not null,
  source_breakdown jsonb,
  tx_hashes        jsonb not null,
  status           text not null default 'settled'
                     check (status in ('pending', 'settled', 'failed')),
  settled_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists payments_merchant_idx
  on payments (merchant_id, created_at desc);
create unique index if not exists payments_session_unique_idx
  on payments (session_id) where status = 'settled';

-- ─── Row-Level Security ────────────────────────────────────────────────────────
-- Service-role key (used in all server API routes) bypasses RLS automatically.
-- Anon client + merchant JWT → policies below restrict reads to that merchant's data.
-- The merchant JWT is minted server-side and contains claim: merchant_id = uuid.

alter table merchants         enable row level security;
alter table api_keys          enable row level security;
alter table checkout_sessions enable row level security;
alter table payments          enable row level security;

-- Merchants: each merchant can only read their own row
create policy "merchant_select_own" on merchants
  for select using (
    (auth.jwt() ->> 'merchant_id') = id::text
  );

-- API keys: merchant sees only their own keys
create policy "merchant_select_own" on api_keys
  for select using (
    (auth.jwt() ->> 'merchant_id') = merchant_id::text
  );

-- Checkout sessions: public read (checkout page fetches by session id without auth)
-- plus merchant-scoped read via JWT
create policy "public_read_sessions" on checkout_sessions
  for select using (true);

-- Payments: merchant sees only their own payments
create policy "merchant_select_own" on payments
  for select using (
    (auth.jwt() ->> 'merchant_id') = merchant_id::text
  );
