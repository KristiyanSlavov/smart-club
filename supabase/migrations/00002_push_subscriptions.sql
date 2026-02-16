-- Push Subscriptions: stores Web Push API subscriptions per player

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Index for looking up subscriptions by player
create index idx_push_subscriptions_player_id on public.push_subscriptions(player_id);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Permissive policies (matching existing pattern — tighten once auth is added)
create policy "Push subscriptions are viewable by everyone"
  on public.push_subscriptions for select
  using (true);

create policy "Push subscriptions can be inserted"
  on public.push_subscriptions for insert
  with check (true);

create policy "Push subscriptions can be updated"
  on public.push_subscriptions for update
  using (true);

create policy "Push subscriptions can be deleted"
  on public.push_subscriptions for delete
  using (true);
