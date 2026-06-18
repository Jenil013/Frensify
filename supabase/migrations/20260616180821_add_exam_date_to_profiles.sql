ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS exam_date date;

COMMENT ON COLUMN public.profiles.exam_date IS 'User-scheduled official exam date for countdown and study planning';
