-- TCF/TEF multi-task writing combinations (3 tâches kept together per row).
ALTER TABLE public.exercise_items
  ADD COLUMN IF NOT EXISTS module_id text,
  ADD COLUMN IF NOT EXISTS combination_index integer,
  ADD COLUMN IF NOT EXISTS tasks jsonb;

COMMENT ON COLUMN public.exercise_items.tasks IS
  'Writing module sections: [{ "section_id": "1"|"2"|"3", "prompt": "...", "stimulus": "..." }]';

CREATE INDEX IF NOT EXISTS exercise_items_writing_combo_idx
  ON public.exercise_items (exam_type, module_id, combination_index)
  WHERE skill = 'writing' AND tasks IS NOT NULL;
