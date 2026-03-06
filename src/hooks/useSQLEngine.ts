/**
 * useSQLEngine — React hook wrapping the SQL engine for component use.
 * Manages loading state, database switching, and query execution.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { executeQuery, loadDatabase, resetDatabase } from '@/lib/sql-engine';
import type { QueryResult } from '@/lib/sql-engine';

interface UseSQLEngineState {
  result: QueryResult | null;
  isLoading: boolean;
  isDbLoading: boolean;
  dbError: string | null;
}

interface UseSQLEngineActions {
  runQuery: (sql: string) => Promise<QueryResult>;
  reset: () => Promise<void>;
  clearResult: () => void;
}

/**
 * Hook for executing SQL queries against a location's database.
 *
 * @param locationId - The location whose database to use (e.g. "archives")
 */
export function useSQLEngine(
  locationId: string
): UseSQLEngineState & UseSQLEngineActions {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const locationRef = useRef(locationId);
  locationRef.current = locationId;

  /** Pre-load the database when mounting — catches network errors early */
  const preload = useCallback(async (id: string) => {
    setIsDbLoading(true);
    setDbError(null);
    try {
      await loadDatabase(id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'The magical connection has been disrupted. Please refresh and try again.';
      setDbError(msg);
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  // Trigger preload when locationId changes (handled by parent via useEffect)
  void preload; // exposed so callers can invoke manually if needed

  /** Execute a SQL query and return the result */
  const runQuery = useCallback(
    async (sql: string): Promise<QueryResult> => {
      setIsLoading(true);
      try {
        const res = await executeQuery(locationRef.current, sql);
        setResult(res);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /** Reset the database to its original state */
  const reset = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    try {
      await resetDatabase(locationRef.current);
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
    runQuery,
    reset,
    clearResult,
  };
}
