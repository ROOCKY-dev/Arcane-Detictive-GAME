/**
 * SQL Engine — wraps sql.js (SQLite compiled to WASM) for in-browser execution.
 * All SQL runs locally; no server-side database calls.
 */

import type { SqlJsStatic, Database } from 'sql.js';

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  rowCount: number;
  error?: string;
}

// Cache of loaded databases keyed by locationId
const dbCache = new Map<string, Database>();
// Raw file bytes cache so we can reset without re-fetching
const fileCache = new Map<string, ArrayBuffer>();

let sqlJs: SqlJsStatic | null = null;

/** Initialize sql.js WASM module (idempotent — safe to call multiple times) */
async function initSqlJs(): Promise<SqlJsStatic> {
  if (sqlJs) return sqlJs;

  const initSqlJsFn = (await import('sql.js')).default;
  sqlJs = await initSqlJsFn({
    locateFile: () => '/sql-wasm.wasm',
  });
  return sqlJs;
}

/**
 * Fetch and cache the raw .sqlite bytes for a given location.
 * Returns the ArrayBuffer, downloading it only on first call.
 */
async function fetchDatabaseFile(locationId: string): Promise<ArrayBuffer> {
  const cached = fileCache.get(locationId);
  if (cached) return cached;

  const url = `/databases/${locationId}_db.sqlite`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `The magical connection has been disrupted. Could not load the ${locationId} grimoire database. (HTTP ${response.status})`
    );
  }
  const buffer = await response.arrayBuffer();
  fileCache.set(locationId, buffer);
  return buffer;
}

/**
 * Load (or retrieve cached) the database for a given location.
 * @param locationId - e.g. "archives", "apothecary", "beast", "underworld"
 */
export async function loadDatabase(locationId: string): Promise<Database> {
  const cached = dbCache.get(locationId);
  if (cached) return cached;

  const SQL = await initSqlJs();
  const buffer = await fetchDatabaseFile(locationId);
  const db = new SQL.Database(new Uint8Array(buffer));
  dbCache.set(locationId, db);
  return db;
}

/**
 * Load a database from a remote URL (e.g. Supabase Storage) and cache it under
 * the given cacheKey so subsequent calls are instant.
 *
 * @param url      - Full URL of the .sqlite file to fetch
 * @param cacheKey - Unique identifier used for the in-memory cache (e.g. "custom-<questId>")
 */
export async function loadDatabaseFromUrl(
  url: string,
  cacheKey: string
): Promise<Database> {
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  const SQL = await initSqlJs();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch custom database. (HTTP ${response.status})`
    );
  }
  const buffer = await response.arrayBuffer();
  fileCache.set(cacheKey, buffer);
  const db = new SQL.Database(new Uint8Array(buffer));
  dbCache.set(cacheKey, db);
  return db;
}

/**
 * Reset the database for a location by reloading it from the cached file bytes.
 * Closes the existing in-memory instance and creates a fresh one.
 * @param locationId - e.g. "archives"
 */
export async function resetDatabase(locationId: string): Promise<void> {
  const existing = dbCache.get(locationId);
  if (existing) {
    existing.close();
    dbCache.delete(locationId);
  }
  // Re-load from cached file bytes (no re-fetch)
  await loadDatabase(locationId);
}

/**
 * Execute a SQL query against the specified location's database.
 * Returns a typed QueryResult — never throws.
 * SQL errors are returned as themed "spell misfire" messages.
 *
 * @param locationId - which database to query
 * @param sql - the SQL string to execute
 */
export async function executeQuery(
  locationId: string,
  sql: string
): Promise<QueryResult> {
  try {
    const db = await loadDatabase(locationId);
    const results = db.exec(sql);

    if (results.length === 0) {
      // Query ran but returned no rows (e.g. INSERT/UPDATE or empty SELECT)
      return { columns: [], rows: [], rowCount: 0 };
    }

    const { columns, values } = results[0];
    return {
      columns,
      rows: values as (string | number | null)[][],
      rowCount: values.length,
    };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    // Return a themed error — the actual error is still shown to help learning
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: formatSpellMisfireError(raw),
    };
  }
}

/**
 * Format a raw SQL error message as a themed "spell misfire" message.
 * Keeps the original technical message so students can learn from it.
 */
function formatSpellMisfireError(raw: string): string {
  // Strip the common "Error: " prefix from sql.js
  const clean = raw.replace(/^Error:\s*/i, '');
  return clean;
}
