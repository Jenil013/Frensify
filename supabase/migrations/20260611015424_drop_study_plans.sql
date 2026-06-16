-- Remove AI Study Plan feature artifacts

DELETE FROM public.ai_usage_logs WHERE endpoint = 'study_plan';

DROP POLICY IF EXISTS "study_plans_own" ON public.study_plans;
DROP TABLE IF EXISTS public.study_plans;

ALTER TABLE public.weekly_usage
  DROP COLUMN IF EXISTS study_plan_count;

ALTER TABLE public.ai_usage_logs
  DROP CONSTRAINT IF EXISTS ai_usage_logs_endpoint_check;

ALTER TABLE public.ai_usage_logs
  ADD CONSTRAINT ai_usage_logs_endpoint_check
  CHECK (endpoint IN ('writing_eval', 'speaking_eval', 'vocab_explain'));
