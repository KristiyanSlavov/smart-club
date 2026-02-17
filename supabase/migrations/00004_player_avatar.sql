-- Add avatar_url column for player photos on the digital card

alter table public.players
  add column avatar_url text;

-- Update seed data with a placeholder
update public.players
set avatar_url = null
where id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
