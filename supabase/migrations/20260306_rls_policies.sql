-- =============================================================================
-- SQL Quest: Row Level Security Policies
-- Run this in the Supabase SQL Editor before deploying to production.
-- =============================================================================

-- ─── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quests    ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- profiles
-- • Users may read and update only their own row.
-- • Teachers may read all student profiles (needed for roster page).
-- =============================================================================

DROP POLICY IF EXISTS "profiles: own read"          ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update"        ON public.profiles;
DROP POLICY IF EXISTS "profiles: teacher reads students" ON public.profiles;

CREATE POLICY "profiles: own read"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Teachers can read all student profiles so they can build their roster.
CREATE POLICY "profiles: teacher reads students"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
    AND role = 'student'
  );

-- =============================================================================
-- quest_progress
-- • Users may insert / update their own progress rows.
-- • Users may read their own rows.
-- • Teachers may read all rows (to display roster stats).
-- =============================================================================

DROP POLICY IF EXISTS "quest_progress: own insert"  ON public.quest_progress;
DROP POLICY IF EXISTS "quest_progress: own update"  ON public.quest_progress;
DROP POLICY IF EXISTS "quest_progress: own read"    ON public.quest_progress;
DROP POLICY IF EXISTS "quest_progress: teacher read" ON public.quest_progress;

CREATE POLICY "quest_progress: own insert"
  ON public.quest_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quest_progress: own update"
  ON public.quest_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quest_progress: own read"
  ON public.quest_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quest_progress: teacher read"
  ON public.quest_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- =============================================================================
-- user_achievements
-- • Users may insert and read their own achievement rows.
-- =============================================================================

DROP POLICY IF EXISTS "achievements: own insert" ON public.user_achievements;
DROP POLICY IF EXISTS "achievements: own read"   ON public.user_achievements;

CREATE POLICY "achievements: own insert"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements: own read"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================================================
-- classes
-- • Teachers may create and manage their own classes.
-- • Students may read classes (to display class info).
-- =============================================================================

DROP POLICY IF EXISTS "classes: teacher manage" ON public.classes;
DROP POLICY IF EXISTS "classes: all read"       ON public.classes;

CREATE POLICY "classes: teacher manage"
  ON public.classes
  FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "classes: all read"
  ON public.classes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- custom_quests
-- • Teachers may insert and update their own quests.
-- • Anyone authenticated (or anon) may read — students need to load quest metadata.
-- =============================================================================

DROP POLICY IF EXISTS "custom_quests: teacher insert" ON public.custom_quests;
DROP POLICY IF EXISTS "custom_quests: teacher update" ON public.custom_quests;
DROP POLICY IF EXISTS "custom_quests: public read"    ON public.custom_quests;

CREATE POLICY "custom_quests: teacher insert"
  ON public.custom_quests
  FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

CREATE POLICY "custom_quests: teacher update"
  ON public.custom_quests
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Students and guests can read any custom quest (needed to load a quest by code).
CREATE POLICY "custom_quests: public read"
  ON public.custom_quests
  FOR SELECT
  USING (true);

-- =============================================================================
-- custom_databases (Storage bucket)
-- Run these separately via: Dashboard > Storage > Policies
-- Or use the Supabase JS client / CLI to create storage policies.
-- =============================================================================

-- NOTE: Storage bucket policies cannot be set via standard SQL ALTER TABLE.
-- Apply the following rules in the Supabase Dashboard under
-- Storage > custom_databases > Policies:
--
-- INSERT (upload):
--   Policy name : "Teachers can upload databases"
--   Target roles: authenticated
--   Expression  : (auth.role() = 'authenticated'
--                  AND EXISTS (
--                    SELECT 1 FROM public.profiles
--                    WHERE id = auth.uid() AND role = 'teacher'
--                  ))
--
-- SELECT (download):
--   Policy name : "Public can download databases"
--   Target roles: public
--   Expression  : true
--
-- Alternatively, run these via the Supabase CLI:
--   supabase storage policies create ...
-- =============================================================================

-- Create the custom_databases bucket if it does not exist.
-- (Safe to re-run — INSERT ... ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom_databases', 'custom_databases', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object INSERT policy (teachers only)
DROP POLICY IF EXISTS "Teachers can upload databases" ON storage.objects;
CREATE POLICY "Teachers can upload databases"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'custom_databases'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Storage object SELECT policy (public read)
DROP POLICY IF EXISTS "Public can download databases" ON storage.objects;
CREATE POLICY "Public can download databases"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'custom_databases');
