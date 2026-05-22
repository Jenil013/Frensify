-- ============================================================
-- Migration 003: Row Level Security
-- FastAPI uses the service role key (bypasses RLS).
-- RLS protects against direct anon/browser access.
-- ============================================================

-- profiles: keyed on id, not user_id
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- completed_exercises
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "completed_exercises_own" ON public.completed_exercises
  FOR ALL USING (auth.uid() = user_id);

-- module_scores
ALTER TABLE public.module_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "module_scores_own" ON public.module_scores
  FOR ALL USING (auth.uid() = user_id);

-- mock_test_scores
ALTER TABLE public.mock_test_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock_test_scores_own" ON public.mock_test_scores
  FOR ALL USING (auth.uid() = user_id);

-- writing_submissions
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "writing_submissions_own" ON public.writing_submissions
  FOR ALL USING (auth.uid() = user_id);

-- speaking_sessions
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "speaking_sessions_own" ON public.speaking_sessions
  FOR ALL USING (auth.uid() = user_id);

-- study_plans
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_plans_own" ON public.study_plans
  FOR ALL USING (auth.uid() = user_id);

-- ai_usage_logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_logs_own" ON public.ai_usage_logs
  FOR ALL USING (auth.uid() = user_id);

-- weekly_usage
ALTER TABLE public.weekly_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_usage_own" ON public.weekly_usage
  FOR ALL USING (auth.uid() = user_id);

-- vocabulary_cards: platform seeds (user_id IS NULL) are readable by all authenticated users;
--                   user rows are private to their owner
ALTER TABLE public.vocabulary_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocabulary_cards_read" ON public.vocabulary_cards
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "vocabulary_cards_write" ON public.vocabulary_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vocabulary_cards_update" ON public.vocabulary_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vocabulary_cards_delete" ON public.vocabulary_cards
  FOR DELETE USING (auth.uid() = user_id);

-- questions: read-only for authenticated users (FastAPI service role writes)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_read" ON public.questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- exercise_items: read-only for authenticated users
ALTER TABLE public.exercise_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_items_read" ON public.exercise_items
  FOR SELECT USING (auth.role() = 'authenticated');
