/**
 * useCustomSQLEngine — variant of useSQLEngine that hydrates from a remote URL.
 * Used by the custom quest player to load a teacher-compiled .sqlite from Storage.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { loadDatabaseFromUrl, executeQuery, resetDatabase } from '@/lib/sql-engine';
import type { QueryResult } from '@/lib/sql-engine';
import type { QuestResult } from '@/types/game';

interface UseCustomSQLEngineReturn {
  result: QueryResult | null;
  isLoading: boolean;
  isDbLoading: boolean;
  dbError: string | null;
  /** The expected result set, computed by running the teacher's SQL on first load. */
  expectedResult: QuestResult | null;
  runQuery: (sql: string) => Promise<QueryResult>;
  reset: () => Promise<void>;
  clearResult: () => void;
}

/**
 * @param questId     - Unique ID used as the db cache key ("custom-<id>")
 * @param databaseUrl - Public URL of the .sqlite file in Supabase Storage
 * @param expectedSql - Teacher's SQL whose result set students must match
 */
export function useCustomSQLEngine(
  questId: string,
  databaseUrl: string,
  expectedSql: string
): UseCustomSQLEngineReturn {
  const cacheKey = `custom-${questId}`;
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [expectedResult, setExpectedResult] = useState<QuestResult | null>(null);

  // Hydrate DB and compute expected result on mount
  useEffect(() => {
    if (!databaseUrl) return;
    let cancelled = false;

    async function hydrate() {
      setIsDbLoading(true);
      setDbError(null);
      try {
        await loadDatabaseFromUrl(databaseUrl, cacheKey);
        // Compute expected result by running teacher's SQL against the loaded DB
        const expRes = await executeQuery(cacheKey, expectedSql);
        if (!cancelled) {
          setExpectedResult(
            expRes.error
              ? null
              : { columns: expRes.columns, rows: expRes.rows }
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDbError(
            err instanceof Error
              ? err.message
              : 'Failed to load custom quest database.'
          );
        }
      } finally {
        if (!cancelled) setIsDbLoading(false);
      }
    }

    void hydrate();
    return () => { cancelled = true; };
  }, [databaseUrl, cacheKey, expectedSql]);

  const runQuery = useCallback(
    async (sql: string): Promise<QueryResult> => {
      setIsLoading(true);
      try {
        const res = await executeQuery(cacheKeyRef.current, sql);
        setResult(res);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    try {
      await resetDatabase(cacheKeyRef.current);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => setResult(null), []);

  return {
    result,
    isLoading,
    isDbLoading,
    dbError,
    expectedResult,
    runQuery,
    reset,
    clearResult,
  };
}
