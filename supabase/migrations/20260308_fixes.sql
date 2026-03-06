-- =============================================================================
-- SQL Quest: Auth & RLS Fixes
-- 1. Profile INSERT policy so sign-up works with RLS enabled
-- 2. Custom quests DELETE policy for teachers
-- 3. Auto-create profile trigger (runs as SECURITY DEFINER — bypasses RLS)
--    Acts as a safety net when client-side insert fails (e.g. email confirmation
--    is enabled and user has no session at sign-up time).
-- =============================================================================

-- ─── profiles: INSERT policy (own row) ────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;

CREATE POLICY "profiles: own insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── custom_quests: DELETE policy ─────────────────────────────────────────────

DROP POLICY IF EXISTS "custom_quests: teacher delete" ON public.custom_quests;

CREATE POLICY "custom_quests: teacher delete"
  ON public.custom_quests
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- ─── Auto-create profile on auth.users INSERT ─────────────────────────────────
-- Reads username and role from raw_user_meta_data (passed via signUp options.data).
-- Falls back to email prefix / 'student' when metadata is absent.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'role'), ''),
      'student'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
