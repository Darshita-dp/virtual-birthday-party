-- ─────────────────────────────────────────────────────────────────────────
-- Darshita's Virtual Birthday — Memory Capsule (M15)
-- Shared persistent guests, shared wishes, and click counters.
-- Run in the Supabase SQL Editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────────────────

-- Guests: one row per browser session_id, upserted on (re-)join. Never deleted.
create table if not exists party_guests (
  id          uuid primary key default gen_random_uuid(),
  session_id  text unique not null,
  name        text not null check (char_length(name) between 1 and 24),
  avatar_id   text not null,
  x_pct       numeric not null,
  y_pct       numeric not null,
  height_pct  numeric not null,
  joined_at   timestamptz not null default now()
);
create index if not exists party_guests_joined_at_idx on party_guests (joined_at);

-- Wishes: append-only memory capsule. No edit, no delete.
create table if not exists party_wishes (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  name        text not null check (char_length(name) between 1 and 24),
  avatar_id   text,
  body        text not null check (char_length(body) between 1 and 280),
  created_at  timestamptz not null default now()
);
create index if not exists party_wishes_created_at_idx on party_wishes (created_at desc);

-- Click events: minimal tally source for the Viewers counter (no PII).
create table if not exists party_events (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('accept', 'accepted')),
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
-- No auth in this app (name-only identity), so we allow the public anon role
-- to select + insert, guests to update (needed for re-RSVP under the same
-- session_id), and DENY delete everywhere (memory capsule is permanent).
alter table party_guests enable row level security;
alter table party_wishes enable row level security;
alter table party_events enable row level security;

drop policy if exists guests_select on party_guests;
drop policy if exists guests_insert on party_guests;
drop policy if exists guests_update on party_guests;
create policy guests_select on party_guests for select to anon using (true);
create policy guests_insert on party_guests for insert to anon with check (true);
create policy guests_update on party_guests for update to anon using (true) with check (true);

drop policy if exists wishes_select on party_wishes;
drop policy if exists wishes_insert on party_wishes;
create policy wishes_select on party_wishes for select to anon using (true);
create policy wishes_insert on party_wishes for insert to anon with check (true);

drop policy if exists events_select on party_events;
drop policy if exists events_insert on party_events;
create policy events_select on party_events for select to anon using (true);
create policy events_insert on party_events for insert to anon with check (true);

-- ── Realtime ──────────────────────────────────────────────────────────────
-- Publish INSERT/UPDATE so every connected client sees live changes.
alter publication supabase_realtime add table party_guests;
alter publication supabase_realtime add table party_wishes;
alter publication supabase_realtime add table party_events;
