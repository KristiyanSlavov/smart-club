-- Add digital card fields to players table

alter table public.players
  add column jersey_number text,
  add column birth_date date,
  add column team_group text,
  add column last_payment_date timestamptz;

-- Update seed data with card fields
update public.players
set
  jersey_number = '№14',
  birth_date = '2016-08-18',
  team_group = 'U10',
  last_payment_date = now()
where id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
