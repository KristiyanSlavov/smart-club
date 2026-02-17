-- Add emblem URL to clubs table (club-level asset, not per-player)

alter table public.clubs
  add column emblem_url text;
