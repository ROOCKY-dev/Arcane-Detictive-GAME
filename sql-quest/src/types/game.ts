/**
 * Core game type definitions for SQL Quest: The Realm of Syntaxia.
 */

// ─── Location & Navigation ────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  description: string;
  vibe: string;
  databaseId: string;
  npcId: string;
  buildings: Building[];
  unlockRequirement: UnlockRequirement | null;
  iconEmoji: string;
  /** Path to location background art (relative to /public) */
  imageUrl?: string;
}

export interface Building {
  id: string;
  locationId: string;
  name: string;
  description: string;
  isLocked: boolean;
  questIds: string[];
  /** Path to building interior art (relative to /public) */
  imageUrl?: string;
}

export interface UnlockRequirement {
  locationId: string;
  requiredCompletedQuests: number;
}

// ─── NPC ──────────────────────────────────────────────────────────────────────

export interface NPC {
  id: string;
  name: string;
  title: string;
  personality: string;
  appearance: string;
  locationId: string;
  /** Path to portrait image (relative to /public/images/npcs/) */
  portraitPath: string;
}

// ─── Quests ───────────────────────────────────────────────────────────────────

export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuestHint {
  order: number;
  text: string;
}

export interface QuestResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface Quest {
  id: string;
  locationId: string;
  buildingId: string;
  title: string;
  difficulty: QuestDifficulty;
  sqlConcepts: string[];
  narrative: string;
  npcDialogue: string;
  hints: QuestHint[];
  expectedResult: QuestResult;
  sampleSolution: string;
  successMessage: string;
  prerequisiteQuestIds: string[];
  order: number;
  /**
   * When true, the validator performs an exact index-by-index row comparison
   * instead of an order-insensitive set comparison. Use this for quests that
   * explicitly test ORDER BY or LIMIT to ensure the player produces the correct
   * row sequence, not just the correct set of rows.
   */
  requiresStrictOrder?: boolean;
}

// ─── Query Results ────────────────────────────────────────────────────────────

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  rowCount: number;
  error?: string;
}

export interface QueryError {
  raw: string;
  themed: string;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export interface QuestProgress {
  questId: string;
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  completedAt: number | null;
  timeSpentSeconds: number;
  lastQuery: string;
}

export interface GameState {
  completedQuestIds: string[];
  questProgress: Record<string, QuestProgress>;
  unlockedLocationIds: string[];
  earnedAchievementIds: string[];
  currentLocationId: string | null;
  currentQuestId: string | null;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'first_quest' }
  | { type: 'complete_location'; locationId: string }
  | { type: 'complete_all_quests' }
  | { type: 'solve_fast'; seconds: number }
  | { type: 'no_hints_location'; locationId: string }
  | { type: 'misfire_count'; count: number };

// ─── Player Progress ──────────────────────────────────────────────────────────

export interface PlayerProgress {
  totalQuestsCompleted: number;
  totalHintsUsed: number;
  totalAttempts: number;
  achievementsEarned: string[];
  locationProgress: Record<string, LocationProgress>;
}

export interface LocationProgress {
  locationId: string;
  questsCompleted: number;
  totalQuests: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}
