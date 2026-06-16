-- Split monolithic questions table into skill-specific tables.

CREATE TABLE public.listening_questions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type      text        NOT NULL CHECK (exam_type IN ('TCF', 'TEF')),
  module_id      text        NOT NULL,
  prompt         text        NOT NULL,
  audio_path     text,
  image_path     text,
  choices        jsonb       NOT NULL,
  correct_index  int         NOT NULL,
  explanation    text,
  difficulty     text,
  sort_order     int,
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reading_questions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type      text        NOT NULL CHECK (exam_type IN ('TCF', 'TEF')),
  module_id      text        NOT NULL,
  prompt         text        NOT NULL,
  passage        text,
  choices        jsonb       NOT NULL,
  correct_index  int         NOT NULL,
  explanation    text,
  difficulty     text,
  sort_order     int,
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX listening_questions_exam_module_idx
  ON public.listening_questions (exam_type, module_id);

CREATE INDEX reading_questions_exam_module_idx
  ON public.reading_questions (exam_type, module_id);

INSERT INTO public.listening_questions (
  id, exam_type, module_id, prompt, audio_path, image_path,
  choices, correct_index, explanation, difficulty, created_at
)
SELECT
  id, exam_type, module_id, prompt, audio_path, image_path,
  choices, correct_index, explanation, difficulty, created_at
FROM public.questions
WHERE module_id = 'comprehension-orale';

INSERT INTO public.reading_questions (
  id, exam_type, module_id, prompt, passage,
  choices, correct_index, explanation, difficulty, created_at
)
SELECT
  id, exam_type, module_id, prompt, passage,
  choices, correct_index, explanation, difficulty, created_at
FROM public.questions
WHERE module_id = 'comprehension-ecrite';

ALTER TABLE public.listening_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listening_questions_read" ON public.listening_questions
  FOR SELECT TO authenticated
  USING (true);

ALTER TABLE public.reading_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reading_questions_read" ON public.reading_questions
  FOR SELECT TO authenticated
  USING (true);

GRANT SELECT ON public.listening_questions TO anon, authenticated;
GRANT SELECT ON public.reading_questions TO anon, authenticated;

DROP POLICY IF EXISTS "questions_read" ON public.questions;
DROP TABLE public.questions;
