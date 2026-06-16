-- ============================================================
-- Migration 009: listening-images storage bucket
-- Public bucket for listening-question illustrations, mirroring
-- the listening-audio bucket (no auth needed for display).
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('listening-images', 'listening-images', true)
ON CONFLICT (id) DO NOTHING;

-- listening-images: anyone can read (public bucket for question illustrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'listening_images_public_read'
  ) THEN
    CREATE POLICY "listening_images_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'listening-images');
  END IF;
END $$;
