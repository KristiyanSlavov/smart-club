-- Smart Club: Initial Schema
-- Run this in the Supabase SQL Editor

-- 1. Create the player_status enum
create type player_status as enum ('paid', 'warning', 'overdue');

-- 2. Clubs table
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 3. Players table
create table public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  full_name text not null,
  nfc_tag_id text not null unique,
  status player_status not null default 'paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Indexes
create index idx_players_nfc_tag_id on public.players(nfc_tag_id);
create index idx_players_club_id on public.players(club_id);

-- 5. Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_players_updated
  before update on public.players
  for each row
  execute function public.handle_updated_at();

-- 6. Enable RLS
alter table public.clubs enable row level security;
alter table public.players enable row level security;

-- 7. RLS Policies

-- Public: anyone can read a player profile by nfc_tag_id (used by /p/[tagId])
create policy "Public profiles are viewable by everyone"
  on public.players for select
  using (true);

-- Public: anyone can read clubs (needed for join)
create policy "Clubs are viewable by everyone"
  on public.clubs for select
  using (true);

-- Allow all mutations on players via anon key (no auth yet).
-- Tighten these policies once authentication is added.
create policy "Players can be inserted"
  on public.players for insert
  with check (true);

create policy "Players can be updated"
  on public.players for update
  using (true);

create policy "Players can be deleted"
  on public.players for delete
  using (true);

-- 8. Enable Realtime for players table
alter publication supabase_realtime add table public.players;

-- 9. Seed data (optional - one demo club + player)
insert into public.clubs (id, name, slug)
values ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ФК Вихър Войводиново', 'vihar');

insert into public.players (id, club_id, full_name, nfc_tag_id, status)
values (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Демо Играч',
  'vihar_01',
  'paid'
);
