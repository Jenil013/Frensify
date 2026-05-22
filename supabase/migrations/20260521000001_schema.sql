-- ============================================================
-- Migration 001: Full schema
-- Tables listed in dependency order (parents before children)
-- ============================================================

-- profiles: one row per auth user, auto-created by trigger (Task 3)
CREATE TABLE public.profiles (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text,
  target_exam      text        CHECK (target_exam IN ('TEF', 'TCF')),
  target_score     text,
  current_level    text,
  streak_days      int         NOT NULL DEFAULT 0,
  last_active_date date,
  tier             text        NOT NULL DEFAULT 'Free' CHECK (tier IN ('Free', 'Pro', 'Max')),
  created_at       timestamptz NOT NULL DEFAULT NOW()
);

-- questions: platform MCQ content, seeded once
CREATE TABLE public.questions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type      text        NOT NULL CHECK (exam_type IN ('TCF', 'TEF')),
  module_id      text        NOT NULL,
  prompt         text        NOT NULL,
  passage        text,
  audio_path     text,
  choices        jsonb       NOT NULL,
  correct_index  int         NOT NULL,
  explanation    text,
  difficulty     text,
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

-- exercise_items: writing/speaking/reading/listening practice prompts
CREATE TABLE public.exercise_items (
  id               uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type        text  NOT NULL CHECK (exam_type IN ('TCF', 'TEF')),
  skill            text  NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  title            text  NOT NULL,
  prompt           text  NOT NULL,
  difficulty       text,
  duration_minutes int,
  question_type    text  NOT NULL CHECK (question_type IN ('essay', 'oral-response', 'multiple-choice')),
  tier_required    text  NOT NULL DEFAULT 'Free' CHECK (tier_required IN ('Free', 'Pro', 'Max'))
);

-- completed_exercises: which user finished which exercise
CREATE TABLE public.completed_exercises (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id  uuid        NOT NULL REFERENCES public.exercise_items(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT NOW()
);

-- module_scores: individual MCQ module attempt results
CREATE TABLE public.module_scores (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_type    text        NOT NULL,
  module_id    text        NOT NULL,
  raw_score    int         NOT NULL,
  max_score    int         NOT NULL,
  exam_context text        NOT NULL DEFAULT 'practice' CHECK (exam_context IN ('practice', 'mock')),
  taken_at     timestamptz NOT NULL DEFAULT NOW()
);

-- mock_test_scores: full exam results with per-module breakdown
CREATE TABLE public.mock_test_scores (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_name        text        NOT NULL,
  score_pct        int         NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
  cefr             text        NOT NULL,
  module_breakdown jsonb,
  taken_at         timestamptz NOT NULL DEFAULT NOW()
);

-- writing_submissions: user essay + AI feedback
CREATE TABLE public.writing_submissions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id  uuid        NOT NULL REFERENCES public.exercise_items(id) ON DELETE CASCADE,
  essay_text   text        NOT NULL,
  word_count   int         NOT NULL,
  exam_type    text        NOT NULL,
  ai_feedback  jsonb,
  cefr_score   text,
  score_range  text,
  submitted_at timestamptz NOT NULL DEFAULT NOW()
);

-- speaking_sessions: transcript + audio path + AI feedback
CREATE TABLE public.speaking_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id      uuid        NOT NULL REFERENCES public.exercise_items(id) ON DELETE CASCADE,
  transcript       text        NOT NULL,
  recording_path   text,
  duration_seconds int,
  exam_type        text        NOT NULL,
  ai_feedback      jsonb,
  cefr_level       text,
  submitted_at     timestamptz NOT NULL DEFAULT NOW()
);

-- vocabulary_cards: platform seeds (user_id IS NULL) + user custom words
CREATE TABLE public.vocabulary_cards (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  word         text        NOT NULL,
  translation  text        NOT NULL,
  category     text,
  difficulty   text        CHECK (difficulty IN ('A1','A2','B1','B2','C1','C2')),
  mastered     bool        NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

-- study_plans: AI-generated multi-week study plan JSON
CREATE TABLE public.study_plans (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_type     text        NOT NULL,
  current_level text        NOT NULL,
  target_score  text        NOT NULL,
  weeks_count   int         NOT NULL,
  daily_minutes int         NOT NULL,
  plan_data     jsonb       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

-- ai_usage_logs: audit trail — one row per AI call
CREATE TABLE public.ai_usage_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint   text        NOT NULL CHECK (endpoint IN ('writing_eval','speaking_eval','study_plan','vocab_explain')),
  context    text        NOT NULL CHECK (context IN ('practice','mock')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- weekly_usage: enforcement counter — one row per (user, week)
CREATE TABLE public.weekly_usage (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start          date        NOT NULL,
  writing_eval_count  int         NOT NULL DEFAULT 0,
  speaking_eval_count int         NOT NULL DEFAULT 0,
  study_plan_count    int         NOT NULL DEFAULT 0,
  vocab_explain_count int         NOT NULL DEFAULT 0,
  updated_at          timestamptz DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);
