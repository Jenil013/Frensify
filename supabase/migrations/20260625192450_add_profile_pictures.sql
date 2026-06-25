-- ============================================================
-- Migration: profile pictures storage + profiles.profile_picture
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_picture text;

COMMENT ON COLUMN public.profiles.profile_picture IS
  'Storage object path in profile-pictures bucket';

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may manage objects in their own folder only.
-- Reads for display go through FastAPI signed URLs (service role).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'profile_pictures_own_insert'
  ) THEN
    CREATE POLICY "profile_pictures_own_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'profile-pictures'
        AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'profile_pictures_own_update'
  ) THEN
    CREATE POLICY "profile_pictures_own_update" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'profile-pictures'
        AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
      )
      WITH CHECK (
        bucket_id = 'profile-pictures'
        AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'profile_pictures_own_delete'
  ) THEN
    CREATE POLICY "profile_pictures_own_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'profile-pictures'
        AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
      );
  END IF;
END $$;
