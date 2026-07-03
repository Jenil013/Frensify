-- ============================================================
-- Security fix: prevent clients from self-upgrading tier/billing
-- Replaces blanket profiles_own FOR ALL with column-scoped UPDATE.
-- FastAPI (service role) still updates tier/stripe fields via webhooks.
-- ============================================================

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;

CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Column-level grants: authenticated may update profile prefs only.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  name,
  target_exam,
  target_score,
  current_level,
  exam_date,
  profile_picture,
  last_active_date
) ON public.profiles TO authenticated;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
