-- ============================================================
-- Migration 008: Add image_path to questions
-- Listening items (e.g. TCF compréhension orale "match the image")
-- reference an illustration stored in the listening-images bucket.
-- ============================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS image_path text;
