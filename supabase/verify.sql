-- Run this in Supabase Studio after all migrations + seed to confirm setup.

-- 1. All 12 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Auth trigger is wired
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Storage buckets
SELECT id, name, public FROM storage.buckets;

-- 5. Question and exercise counts
SELECT 'listening_questions' AS tbl, COUNT(*) FROM public.listening_questions
UNION ALL
SELECT 'reading_questions', COUNT(*) FROM public.reading_questions
UNION ALL
SELECT 'exercise_items', COUNT(*) FROM public.exercise_items;

-- 6. No stale data from trigger test (profiles table should be empty if test user was deleted)
SELECT COUNT(*) AS profile_count FROM public.profiles;
