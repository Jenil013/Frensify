-- Migration 005: Make speaking_sessions.transcript nullable
-- The transcript is no longer supplied by the client; Gemini evaluates
-- the audio directly and the column is no longer required.
ALTER TABLE public.speaking_sessions
  ALTER COLUMN transcript DROP NOT NULL;
