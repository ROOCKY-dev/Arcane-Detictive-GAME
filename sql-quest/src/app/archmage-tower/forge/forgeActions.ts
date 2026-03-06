/**
 * forgeActions — client-side compile & publish logic for the Quest Forge.
 * Runs entirely in the browser: sql.js for DB compilation, Supabase for storage.
 */

import { uploadCustomDatabase, saveCustomQuest, supabase } from '@/lib/supabase';
import type { ForgeFormData } from './types';

export interface ForgeResult {
  ok: boolean;
  message: string;
}

/**
 * 1. Compile the teacher's DDL/DML into a fresh sql.js database.
 * 2. Export and upload the resulting .sqlite to Supabase Storage.
 * 3. Insert the quest metadata into the custom_quests table.
 */
export async function compileAndUploadForge(form: ForgeFormData): Promise<ForgeResult> {
  // ── Step 1: Compile with sql.js ─────────────────────────────────────────────
  let dbBytes: Uint8Array;
  try {
    // Dynamic import keeps sql.js WASM out of the initial bundle
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
    const db = new SQL.Database();

    try {
      db.exec(form.ddlSql);
    } catch (execErr: unknown) {
      const msg = execErr instanceof Error ? execErr.message : String(execErr);
      return { ok: false, message: `Database error: ${msg}` };
    }

    dbBytes = db.export();
    db.close();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Failed to initialise sql.js: ${msg}` };
  }

  // ── Step 2: Resolve teacher ID ──────────────────────────────────────────────
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured. Cannot publish quest.' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { ok: false, message: 'You must be signed in to forge a quest.' };
  }
  const teacherId = session.user.id;

  // ── Step 3: Upload .sqlite to Storage ───────────────────────────────────────
  const questId = crypto.randomUUID();
  const databaseUrl = await uploadCustomDatabase(questId, dbBytes);

  if (!databaseUrl) {
    return {
      ok: false,
      message: 'Failed to upload database. Ensure the "custom_databases" Storage bucket exists.',
    };
  }

  // ── Step 4: Save quest record ────────────────────────────────────────────────
  const error = await saveCustomQuest({
    teacherId,
    title: form.title.trim(),
    locationId: form.locationId,
    difficulty: form.difficulty,
    narrative: form.narrative.trim(),
    expectedSql: form.expectedSql.trim(),
    requiresStrictOrder: form.requiresStrictOrder,
    databaseUrl,
  });

  if (error) {
    return { ok: false, message: `Failed to save quest: ${error}` };
  }

  return {
    ok: true,
    message: `"${form.title}" has been forged and is ready for your apprentices!`,
  };
}
