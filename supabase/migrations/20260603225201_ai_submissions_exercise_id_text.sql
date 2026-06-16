-- AI submission rows reference app exercise slugs (e.g. w1, TEF-expression-ecrite-A),
-- not UUIDs from exercise_items.

ALTER TABLE public.writing_submissions
  DROP CONSTRAINT IF EXISTS writing_submissions_exercise_id_fkey;

ALTER TABLE public.writing_submissions
  ALTER COLUMN exercise_id TYPE text USING exercise_id::text;

ALTER TABLE public.speaking_sessions
  DROP CONSTRAINT IF EXISTS speaking_sessions_exercise_id_fkey;

ALTER TABLE public.speaking_sessions
  ALTER COLUMN exercise_id TYPE text USING exercise_id::text;
