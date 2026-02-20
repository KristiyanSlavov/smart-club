-- Migration: Convert team_group from TEXT to INTEGER (birth year)
-- Run this in the Supabase SQL Editor

-- Step 1: Populate team_group from birth_date for rows that have a birth_date
-- This handles all formats: 'U8', 'U10', 'U2014', or any other text value
UPDATE public.players
SET team_group = EXTRACT(YEAR FROM birth_date)::text
WHERE birth_date IS NOT NULL;

-- Step 2: Convert the column type from text to integer
ALTER TABLE public.players
  ALTER COLUMN team_group TYPE integer USING team_group::integer;
