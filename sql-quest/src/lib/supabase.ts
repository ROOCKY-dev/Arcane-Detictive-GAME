/**
 * Supabase client — the single point of contact for all server-side operations.
 * The game works fully without Supabase (guest mode via localStorage).
 * Configure with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types/user';

// ─── Database type definitions (mirrors SUPABASE_SCHEMA.md) ──────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          class_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          class_id?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          class_id?: string | null;
          updated_at?: string;
        };
      };
      quest_progress: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          location_id: string;
          completed: boolean;
          hints_used: number;
          attempts: number;
          time_seconds: number | null;
          submitted_query: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          quest_id: string;
          location_id: string;
          completed?: boolean;
          hints_used?: number;
          attempts?: number;
          time_seconds?: number | null;
          submitted_query?: string | null;
          completed_at?: string | null;
        };
        Update: {
          completed?: boolean;
          hints_used?: number;
          attempts?: number;
          time_seconds?: number | null;
          submitted_query?: string | null;
          completed_at?: string | null;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: Record<string, never>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          teacher_id: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          invite_code: string;
          teacher_id: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      custom_quests: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          location_id: string;
          difficulty: string;
          narrative: string;
          expected_sql: string;
          requires_strict_order: boolean;
          database_url: string | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          title: string;
          location_id: string;
          difficulty: string;
          narrative: string;
          expected_sql: string;
          requires_strict_order?: boolean;
          database_url?: string | null;
        };
        Update: {
          title?: string;
          narrative?: string;
          expected_sql?: string;
          requires_strict_order?: boolean;
          database_url?: string | null;
        };
      };
    };
  };
}

export type TypedSupabaseClient = SupabaseClient<Database>;

// ─── Singleton client ─────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your-anon-key-here';

export const supabase: TypedSupabaseClient | null = isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const isSupabaseConfigured = isConfigured;

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Sign in with email + password. Returns error string or null on success. */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

/** Register a new user. Creates auth user + inserts profile row. */
export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
  role: UserRole
): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return error.message;
  if (!data.user) return 'Registration failed — no user returned.';

  // Insert the profile row with the chosen role
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username,
    role,
  });

  return profileError ? profileError.message : null;
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

/** Get the current session synchronously from storage (no network call). */
export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

/** Fetch the full profile for a user ID. */
export async function getProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

// ─── Progress sync ────────────────────────────────────────────────────────────

export interface CloudQuestProgress {
  questId: string;
  locationId: string;
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  timeSeconds: number;
  lastQuery: string;
  completedAt: number | null;
}

/**
 * Upsert a single quest's progress to the cloud.
 * Uses UNIQUE(user_id, quest_id) conflict target to update-or-insert.
 */
export async function syncQuestProgressToCloud(
  userId: string,
  progress: CloudQuestProgress
): Promise<void> {
  if (!supabase) return;

  await supabase.from('quest_progress').upsert(
    {
      user_id: userId,
      quest_id: progress.questId,
      location_id: progress.locationId,
      completed: progress.completed,
      hints_used: progress.hintsUsed,
      attempts: progress.attempts,
      time_seconds: progress.timeSeconds,
      submitted_query: progress.lastQuery || null,
      completed_at: progress.completedAt
        ? new Date(progress.completedAt).toISOString()
        : null,
    },
    { onConflict: 'user_id,quest_id' }
  );
}

/**
 * Load all quest progress rows for a user from the cloud.
 * Returns an array mapped to the local QuestProgress shape.
 */
export async function loadQuestProgressFromCloud(
  userId: string
): Promise<CloudQuestProgress[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('quest_progress')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((row) => ({
    questId: row.quest_id,
    locationId: row.location_id,
    completed: row.completed,
    hintsUsed: row.hints_used,
    attempts: row.attempts,
    timeSeconds: row.time_seconds ?? 0,
    lastQuery: row.submitted_query ?? '',
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
  }));
}

/** Upsert an earned achievement to the cloud. */
export async function syncAchievementToCloud(
  userId: string,
  achievementId: string
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('user_achievements')
    .upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id' }
    );
}

// ─── Teacher helpers ──────────────────────────────────────────────────────────

/**
 * Fetch all student profiles in classes taught by the given teacher.
 * Returns profile rows enriched with per-student quest completion count.
 */
export async function getStudentsForTeacher(teacherId: string) {
  if (!supabase) return [];

  // Get all class IDs this teacher owns
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);

  if (!classes || classes.length === 0) return [];

  const classIds = classes.map((c) => c.id);

  // Fetch profiles enrolled in those classes
  const { data: students } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .in('class_id', classIds);

  if (!students) return [];

  // Fetch completion counts per student
  const studentIds = students.map((s) => s.id);
  const { data: progressRows } = await supabase
    .from('quest_progress')
    .select('user_id, quest_id, completed, hints_used, completed_at')
    .in('user_id', studentIds)
    .eq('completed', true);

  return students.map((student) => {
    const studentProgress = (progressRows ?? []).filter(
      (p) => p.user_id === student.id
    );
    return {
      id: student.id,
      username: student.username,
      displayName: student.display_name ?? student.username,
      avatarUrl: student.avatar_url,
      casesSolved: studentProgress.length,
      lastActivity: studentProgress
        .map((p) => p.completed_at)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    };
  });
}

export interface ApprenticeRosterRow {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  questsSolved: number;
  totalAttempts: number;
  lastActive: string | null;
}

/**
 * Fetch a full roster for a teacher's classes, including total attempt counts
 * (across all quest_progress rows, not just completed ones) for Efficiency %.
 * Falls back to an empty array when Supabase is not configured.
 */
export async function getApprenticeRoster(
  teacherId: string
): Promise<ApprenticeRosterRow[]> {
  if (!supabase) return [];

  // Resolve class IDs owned by this teacher
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);

  if (!classes || classes.length === 0) return [];

  const classIds = classes.map((c) => c.id);

  // All students enrolled in those classes
  const { data: students } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('class_id', classIds)
    .eq('role', 'student');

  if (!students || students.length === 0) return [];

  const studentIds = students.map((s) => s.id);

  // All quest_progress rows for these students (completed + in-progress)
  const { data: allProgress } = await supabase
    .from('quest_progress')
    .select('user_id, completed, attempts, completed_at')
    .in('user_id', studentIds);

  const rows = allProgress ?? [];

  return students.map((student) => {
    const studentRows = rows.filter((r) => r.user_id === student.id);
    const questsSolved = studentRows.filter((r) => r.completed).length;
    const totalAttempts = studentRows.reduce((sum, r) => sum + (r.attempts ?? 0), 0);
    const lastActive =
      studentRows
        .map((r) => r.completed_at)
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1) ?? null;

    return {
      id: student.id,
      username: student.username,
      displayName: student.display_name ?? student.username,
      avatarUrl: student.avatar_url,
      questsSolved,
      totalAttempts,
      lastActive,
    };
  });
}

// ─── Quest Forge helpers ───────────────────────────────────────────────────────

/**
 * Upload a compiled .sqlite file to the 'custom_databases' Storage bucket.
 * Returns the public URL on success, or null on failure.
 */
export async function uploadCustomDatabase(
  questId: string,
  data: Uint8Array
): Promise<string | null> {
  if (!supabase) return null;

  const blob = new Blob([data], { type: 'application/x-sqlite3' });
  const path = `${questId}.sqlite`;

  const { error } = await supabase.storage
    .from('custom_databases')
    .upload(path, blob, { contentType: 'application/x-sqlite3', upsert: true });

  if (error) return null;

  const { data: urlData } = supabase.storage
    .from('custom_databases')
    .getPublicUrl(path);

  return urlData.publicUrl ?? null;
}

export interface CustomQuestInsert {
  teacherId: string;
  title: string;
  locationId: string;
  difficulty: string;
  narrative: string;
  expectedSql: string;
  requiresStrictOrder: boolean;
  databaseUrl: string | null;
}

export interface CustomQuestRow {
  id: string;
  teacher_id: string;
  title: string;
  location_id: string;
  difficulty: string;
  narrative: string;
  expected_sql: string;
  requires_strict_order: boolean;
  database_url: string | null;
  created_at: string;
}

/**
 * Fetch a single custom quest by its ID.
 * Returns null if not found or Supabase is unconfigured.
 */
export async function getCustomQuest(questId: string): Promise<CustomQuestRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('id', questId)
    .single();
  if (error || !data) return null;
  return data as CustomQuestRow;
}

/** Insert a new custom quest record. Returns error string or null on success. */
export async function saveCustomQuest(quest: CustomQuestInsert): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';

  const { error } = await supabase.from('custom_quests').insert({
    teacher_id: quest.teacherId,
    title: quest.title,
    location_id: quest.locationId,
    difficulty: quest.difficulty,
    narrative: quest.narrative,
    expected_sql: quest.expectedSql,
    requires_strict_order: quest.requiresStrictOrder,
    database_url: quest.databaseUrl,
  });

  return error ? error.message : null;
}
