-- Migration: Ensure nfc_tag_id constraints & set up avatars storage bucket
-- Run this in the Supabase SQL Editor

-- 1. nfc_tag_id is already TEXT NOT NULL UNIQUE from 00001_init_schema.sql
--    This is a safety check: if the constraint was somehow dropped, re-add it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'players_nfc_tag_id_key'
  ) THEN
    ALTER TABLE public.players ADD CONSTRAINT players_nfc_tag_id_key UNIQUE (nfc_tag_id);
  END IF;
END $$;

-- 2. Create the 'avatars' storage bucket (public, so images load without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow public reads on the avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. Allow uploads/upserts via anon key (used by the import script)
CREATE POLICY "Anyone can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');
