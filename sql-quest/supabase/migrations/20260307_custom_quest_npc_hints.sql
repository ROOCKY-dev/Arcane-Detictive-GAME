-- =============================================================================
-- SQL Quest: Add NPC dialogue and hints columns to custom_quests
-- =============================================================================

ALTER TABLE public.custom_quests
  ADD COLUMN IF NOT EXISTS hints       JSONB,
  ADD COLUMN IF NOT EXISTS npc_name    TEXT,
  ADD COLUMN IF NOT EXISTS npc_dialogue TEXT;
