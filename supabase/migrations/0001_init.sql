-- ============================================================
-- Cosco Overseas — admin backend schema
-- Tables that receive website submissions + RLS policies.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Enquiries (website contact / enquiry form) ----------
create table if not exists public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text not null,
  destination  text,
  message      text,
  source       text default 'website',
  status       text not null default 'new',   -- new | contacted | closed
  notes        text
);

-- ---------- Mega Lucky Draw registrations ----------
create table if not exists public.lucky_draw_entries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  lot_number   text not null,
  name         text not null,
  age          int,
  phone        text not null,
  email        text not null,
  country      text,
  course       text,
  prize        text,                            -- set when a winner is chosen
  is_winner    boolean not null default false
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists lucky_created_idx     on public.lucky_draw_entries (created_at desc);
create index if not exists lucky_phone_idx       on public.lucky_draw_entries (phone);

-- ============================================================
-- Row Level Security
--   anon (website publishable key)  -> INSERT only
--   authenticated (admin users)     -> SELECT + UPDATE
-- Public sign-ups should be DISABLED in Supabase Auth so that the
-- only authenticated users are admins you create manually.
-- ============================================================
alter table public.enquiries          enable row level security;
alter table public.lucky_draw_entries enable row level security;

-- --- inserts from the public website ---
drop policy if exists "anon insert enquiries" on public.enquiries;
create policy "anon insert enquiries" on public.enquiries
  for insert to anon with check (true);

drop policy if exists "anon insert lucky" on public.lucky_draw_entries;
create policy "anon insert lucky" on public.lucky_draw_entries
  for insert to anon with check (true);

-- --- admin reads / updates ---
drop policy if exists "auth read enquiries" on public.enquiries;
create policy "auth read enquiries" on public.enquiries
  for select to authenticated using (true);

drop policy if exists "auth update enquiries" on public.enquiries;
create policy "auth update enquiries" on public.enquiries
  for update to authenticated using (true) with check (true);

drop policy if exists "auth read lucky" on public.lucky_draw_entries;
create policy "auth read lucky" on public.lucky_draw_entries
  for select to authenticated using (true);

drop policy if exists "auth update lucky" on public.lucky_draw_entries;
create policy "auth update lucky" on public.lucky_draw_entries
  for update to authenticated using (true) with check (true);

-- ============================================================
-- Base table GRANTs. RLS only takes effect once a role has these
-- table-level privileges. (The dashboard applies these automatically;
-- when running via the Management API we must add them explicitly.)
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

grant insert on public.enquiries          to anon;   -- public website submits
grant insert on public.lucky_draw_entries to anon;

grant select, update on public.enquiries          to authenticated;  -- admins
grant select, update on public.lucky_draw_entries to authenticated;

grant all on public.enquiries          to service_role;
grant all on public.lucky_draw_entries to service_role;
