-- =============================================================================
-- SQL Quest: Initial Schema
-- Creates all tables before RLS policies are applied.
-- =============================================================================

-- ─── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url    TEXT,
  class_id      UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── classes ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.classes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  invite_code  TEXT NOT NULL UNIQUE,
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from profiles.class_id → classes.id (deferred so both tables exist)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_class_id_fkey
  FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- ─── quest_progress ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quest_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id         TEXT NOT NULL,
  location_id      TEXT NOT NULL,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  hints_used       INTEGER NOT NULL DEFAULT 0,
  attempts         INTEGER NOT NULL DEFAULT 0,
  time_seconds     INTEGER,
  submitted_query  TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quest_id)
);

-- ─── user_achievements ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- ─── custom_quests ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.custom_quests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  location_id           TEXT NOT NULL,
  difficulty            TEXT NOT NULL,
  narrative             TEXT NOT NULL,
  expected_sql          TEXT NOT NULL,
  requires_strict_order BOOLEAN NOT NULL DEFAULT FALSE,
  database_url          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
