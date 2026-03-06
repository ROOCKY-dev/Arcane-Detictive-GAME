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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
          hints: string[] | null;
          npc_name: string | null;
          npc_dialogue: string | null;
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
          hints?: string[] | null;
          npc_name?: string | null;
          npc_dialogue?: string | null;
        };
        Update: {
          title?: string;
          narrative?: string;
          expected_sql?: string;
          requires_strict_order?: boolean;
          database_url?: string | null;
          hints?: string[] | null;
          npc_name?: string | null;
          npc_dialogue?: string | null;
        };
        Relationships: [];
      };
    };
    // Required by supabase-js v2.x for full type compatibility
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TypedSupabaseClient = SupabaseClient<Database>;

// Convenience row aliases used for explicit casts when supabase-js generic
// inference collapses to {} (known supabase-js v2.98 behaviour without codegen).
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type QuestProgressRow = Database['public']['Tables']['quest_progress']['Row'];

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

  // Pass username + role as metadata — the DB trigger reads these to auto-create
  // the profile row even if email confirmation is enabled (no client session yet).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, role } },
  });
  if (error) return error.message;
  if (!data.user) return 'Registration failed — no user returned.';

  // Also attempt a client-side insert for environments where email confirmation
  // is disabled (user gets a session immediately). ON CONFLICT DO NOTHING is
  // enforced by the trigger, so a duplicate insert is harmless.
  await supabase.from('profiles').insert({ id: data.user.id, username, role }).maybeSingle();

  return null;
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
export async function getProfile(
  userId: string
): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Database['public']['Tables']['profiles']['Row'];
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

  const rows = data as QuestProgressRow[];
  return rows.map((row) => ({
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
  const { data: classesRaw } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);

  const classes = classesRaw as { id: string }[] | null;
  if (!classes || classes.length === 0) return [];

  const classIds = classes.map((c) => c.id);

  // Fetch profiles enrolled in those classes
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at')
    .in('class_id', classIds);

  const students = studentsRaw as Pick<
    ProfileRow,
    'id' | 'username' | 'display_name' | 'avatar_url' | 'created_at'
  >[] | null;
  if (!students) return [];

  // Fetch completion counts per student
  const studentIds = students.map((s) => s.id);
  const { data: progressRaw } = await supabase
    .from('quest_progress')
    .select('user_id, quest_id, completed, hints_used, completed_at')
    .in('user_id', studentIds)
    .eq('completed', true);

  const progressRows = progressRaw as Pick<
    QuestProgressRow,
    'user_id' | 'quest_id' | 'completed' | 'hints_used' | 'completed_at'
  >[] | null;

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
  const { data: classesRaw2 } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', teacherId);

  const classes2 = classesRaw2 as { id: string }[] | null;
  if (!classes2 || classes2.length === 0) return [];

  const classIds = classes2.map((c) => c.id);

  // All students enrolled in those classes
  const { data: studentsRaw2 } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('class_id', classIds)
    .eq('role', 'student');

  const students2 = studentsRaw2 as Pick<
    ProfileRow,
    'id' | 'username' | 'display_name' | 'avatar_url'
  >[] | null;
  if (!students2 || students2.length === 0) return [];

  const studentIds = students2.map((s) => s.id);

  // All quest_progress rows for these students (completed + in-progress)
  const { data: allProgressRaw } = await supabase
    .from('quest_progress')
    .select('user_id, completed, attempts, completed_at')
    .in('user_id', studentIds);

  const rows = (allProgressRaw as Pick<
    QuestProgressRow,
    'user_id' | 'completed' | 'attempts' | 'completed_at'
  >[] | null) ?? [];

  return students2.map((student) => {
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

  const blob = new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer], { type: 'application/x-sqlite3' });
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
  hints?: string[] | null;
  npcName?: string | null;
  npcDialogue?: string | null;
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
  hints: string[] | null;
  npc_name: string | null;
  npc_dialogue: string | null;
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
export async function saveCustomQuest(quest: CustomQuestInsert): Promise<{ error: string | null; id: string | null }> {
  if (!supabase) return { error: 'Supabase is not configured.', id: null };

  const { data, error } = await supabase.from('custom_quests').insert({
    teacher_id: quest.teacherId,
    title: quest.title,
    location_id: quest.locationId,
    difficulty: quest.difficulty,
    narrative: quest.narrative,
    expected_sql: quest.expectedSql,
    requires_strict_order: quest.requiresStrictOrder,
    database_url: quest.databaseUrl,
    hints: quest.hints ?? null,
    npc_name: quest.npcName ?? null,
    npc_dialogue: quest.npcDialogue ?? null,
  }).select('id').single();

  if (error) return { error: error.message, id: null };
  return { error: null, id: (data as { id: string }).id };
}

/** Fetch all custom quests created by a teacher. */
export async function getTeacherQuests(teacherId: string): Promise<CustomQuestRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as CustomQuestRow[];
}

/** Delete a custom quest by ID. Returns error string or null on success. */
export async function deleteCustomQuest(questId: string): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';
  const { error } = await supabase.from('custom_quests').delete().eq('id', questId);
  return error ? error.message : null;
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

/** Update mutable profile fields for a user. Returns error string or null. */
export async function updateProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string }
): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return error ? error.message : null;
}

// ─── Class helpers ────────────────────────────────────────────────────────────

export interface ClassRow {
  id: string;
  name: string;
  invite_code: string;
  teacher_id: string;
  description: string | null;
  created_at: string;
  studentCount?: number;
}

/** Generate a short random invite code. */
function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Create a new class for a teacher. Returns { inviteCode } or error string. */
export async function createClass(
  teacherId: string,
  name: string,
  description: string
): Promise<{ inviteCode: string; id: string } | string> {
  if (!supabase) return 'Supabase is not configured.';

  const invite_code = generateInviteCode();
  const { data, error } = await supabase
    .from('classes')
    .insert({ teacher_id: teacherId, name, description: description || null, invite_code })
    .select('id')
    .single();

  if (error) return error.message;
  return { inviteCode: invite_code, id: (data as { id: string }).id };
}

/** Fetch all classes owned by a teacher with student counts. */
export async function getTeacherClasses(teacherId: string): Promise<ClassRow[]> {
  if (!supabase) return [];

  const { data: classesRaw } = await supabase
    .from('classes')
    .select('id, name, invite_code, teacher_id, description, created_at')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  const classes = (classesRaw as ClassRow[] | null) ?? [];
  if (classes.length === 0) return [];

  const classIds = classes.map((c) => c.id);
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select('class_id')
    .in('class_id', classIds);

  const students = (studentsRaw as { class_id: string }[] | null) ?? [];

  return classes.map((cls) => ({
    ...cls,
    studentCount: students.filter((s) => s.class_id === cls.id).length,
  }));
}

/** Enroll a student in a class by invite code. Returns error string or null. */
export async function joinClassByCode(
  userId: string,
  inviteCode: string
): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.';

  const { data: cls } = await supabase
    .from('classes')
    .select('id')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single();

  if (!cls) return 'Invalid invite code. Double-check it and try again.';

  const { error } = await supabase
    .from('profiles')
    .update({ class_id: (cls as { id: string }).id })
    .eq('id', userId);

  return error ? error.message : null;
}

// ─── Student detail (teacher view) ───────────────────────────────────────────

export interface StudentQuestProgressRow {
  quest_id: string;
  location_id: string;
  completed: boolean;
  hints_used: number;
  attempts: number;
  time_seconds: number | null;
  submitted_query: string | null;
  completed_at: string | null;
}

export interface StudentDetail {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  progress: StudentQuestProgressRow[];
}

/**
 * Fetch a student's full profile + quest progress for the teacher dashboard.
 * The teacher RLS policies allow reading student profiles and quest_progress.
 */
export async function getStudentDetail(studentId: string): Promise<StudentDetail | null> {
  if (!supabase) return null;

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, role, created_at')
    .eq('id', studentId)
    .single();

  if (!profileRaw) return null;
  const p = profileRaw as {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
  };

  const { data: progressRaw } = await supabase
    .from('quest_progress')
    .select('quest_id, location_id, completed, hints_used, attempts, time_seconds, submitted_query, completed_at')
    .eq('user_id', studentId)
    .order('completed_at', { ascending: false, nullsFirst: false });

  const progress = (progressRaw as StudentQuestProgressRow[] | null) ?? [];

  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name ?? p.username,
    avatarUrl: p.avatar_url,
    role: p.role,
    createdAt: p.created_at,
    progress,
  };
}
