-- ============================================================
-- Migration 004: Storage buckets and access policies
-- listening-audio: public (no auth needed for playback)
-- speaking-recordings: private (signed URLs only)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('listening-audio',      'listening-audio',      true),
  ('speaking-recordings',  'speaking-recordings',  false)
ON CONFLICT (id) DO NOTHING;

-- listening-audio: anyone can read (public bucket for pre-recorded clips)
CREATE POLICY "listening_audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'listening-audio');

-- speaking-recordings: authenticated users upload into their own subfolder (uid/filename)
-- Read and delete are handled by FastAPI using the service role key (bypasses RLS),
-- so no SELECT or DELETE policies are needed here.
CREATE POLICY "speaking_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'speaking-recordings'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
