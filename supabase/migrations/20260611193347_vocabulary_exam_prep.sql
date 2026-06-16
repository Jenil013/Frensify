-- Extend vocabulary_cards for exam-aligned decks + per-user review progress

ALTER TABLE public.vocabulary_cards
  ADD COLUMN IF NOT EXISTS example_sentence text;

ALTER TABLE public.vocabulary_cards
  ADD COLUMN IF NOT EXISTS exam_type text;

UPDATE public.vocabulary_cards
SET exam_type = 'both'
WHERE exam_type IS NULL;

ALTER TABLE public.vocabulary_cards
  ALTER COLUMN exam_type SET DEFAULT 'both';

ALTER TABLE public.vocabulary_cards
  ALTER COLUMN exam_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vocabulary_cards_exam_type_check'
  ) THEN
    ALTER TABLE public.vocabulary_cards
      ADD CONSTRAINT vocabulary_cards_exam_type_check
      CHECK (exam_type IN ('TEF', 'TCF', 'both'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_exam_type ON public.vocabulary_cards(exam_type);
CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_category ON public.vocabulary_cards(category);

CREATE TABLE IF NOT EXISTS public.user_vocabulary_progress (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.vocabulary_cards(id) ON DELETE CASCADE,
  mastered boolean NOT NULL DEFAULT false,
  last_reviewed_at timestamptz,
  review_count int NOT NULL DEFAULT 0,
  ease int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_user ON public.user_vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_reviewed ON public.user_vocabulary_progress(user_id, last_reviewed_at);

ALTER TABLE public.user_vocabulary_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_vocabulary_progress'
      AND policyname = 'user_vocab_progress_all'
  ) THEN
    CREATE POLICY user_vocab_progress_all ON public.user_vocabulary_progress
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
