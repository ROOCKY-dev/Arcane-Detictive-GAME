/**
 * Query Validator — compares a player's query result against the expected result.
 * Validates on result content (columns + rows), NOT on query text.
 * Multiple valid SQL solutions can solve the same quest.
 */

import type { QueryResult, QuestResult } from '@/types/game';

export interface ValidationResult {
  correct: boolean;
  feedback: string;
  /** True if the player's result is a superset of the expected (extra columns OK) */
  partialCredit?: boolean;
}

/**
 * Normalize a cell value for comparison:
 * - Numbers and numeric strings are compared numerically
 * - Strings are trimmed and lowercased
 * - null stays null
 */
function normalizeCell(value: string | number | null): string | number | null {
  if (value === null) return null;
  if (typeof value === 'number') return value;
  const trimmed = String(value).trim();
  const asNumber = Number(trimmed);
  if (!isNaN(asNumber) && trimmed !== '') return asNumber;
  return trimmed.toLowerCase();
}

/** Normalize a row for comparison */
function normalizeRow(row: (string | number | null)[]): (string | number | null)[] {
  return row.map(normalizeCell);
}

/** Convert a row array to a stable string key for set comparison */
function rowKey(row: (string | number | null)[]): string {
  return JSON.stringify(normalizeRow(row));
}

/**
 * Compare two sets of rows (order-insensitive).
 * Returns true if they contain the same rows (ignoring order).
 */
function rowSetsMatch(
  actual: (string | number | null)[][],
  expected: (string | number | null)[][]
): boolean {
  if (actual.length !== expected.length) return false;
  const actualKeys = actual.map(rowKey).sort();
  const expectedKeys = expected.map(rowKey).sort();
  return actualKeys.every((k, i) => k === expectedKeys[i]);
}

/**
 * Compare two row arrays with strict index-by-index ordering.
 * Used when a quest tests ORDER BY / LIMIT and the row sequence matters.
 * Returns true only if every row at position i matches exactly.
 */
function rowsMatchOrdered(
  actual: (string | number | null)[][],
  expected: (string | number | null)[][]
): boolean {
  if (actual.length !== expected.length) return false;
  return actual.every((row, i) => rowKey(row) === rowKey(expected[i]));
}

/**
 * Check if the player's result columns match the expected columns.
 * Comparison is case-insensitive on column names.
 */
function columnsMatch(actual: string[], expected: string[]): boolean {
  if (actual.length !== expected.length) return false;
  const normalActual = actual.map((c) => c.toLowerCase().trim()).sort();
  const normalExpected = expected.map((c) => c.toLowerCase().trim()).sort();
  return normalActual.every((c, i) => c === normalExpected[i]);
}

export interface ValidateOptions {
  /**
   * When true, rows are compared in exact sequence order (index-by-index).
   * Use for quests that explicitly test ORDER BY or LIMIT.
   * Default: false (order-insensitive set comparison).
   */
  requiresStrictOrder?: boolean;
}

/**
 * Validate a player's query result against the quest's expected result.
 *
 * @param result - The actual QueryResult from executeQuery()
 * @param expected - The expected QuestResult from the quest definition
 * @param options - Optional validation flags (e.g. requiresStrictOrder)
 * @returns ValidationResult with correct flag and human-readable feedback
 */
export function validateResult(
  result: QueryResult,
  expected: QuestResult,
  options: ValidateOptions = {}
): ValidationResult {
  const { requiresStrictOrder = false } = options;
  // If there was a SQL error, it cannot be correct
  if (result.error) {
    return {
      correct: false,
      feedback: `Your incantation misfired! ${result.error}`,
    };
  }

  // Check if result is completely empty and expected is not
  if (result.rowCount === 0 && expected.rows.length > 0) {
    return {
      correct: false,
      feedback: `The spell revealed nothing... but ${expected.rows.length} ${expected.rows.length === 1 ? 'revelation was' : 'revelations were'} expected. Try a different incantation.`,
    };
  }

  // Check row count first for quick feedback
  if (result.rows.length !== expected.rows.length) {
    const diff = result.rows.length - expected.rows.length;
    const direction = diff > 0 ? 'too many' : 'too few';
    const count = Math.abs(diff);
    return {
      correct: false,
      feedback: `Your spell revealed ${result.rows.length} entries, but the answer requires ${expected.rows.length}. You have ${direction} — ${count} ${count === 1 ? 'record' : 'records'} off. Check your filter conditions.`,
    };
  }

  // Check columns (we allow extra columns — player may SELECT *)
  const colsMatch = columnsMatch(result.columns, expected.columns);
  if (!colsMatch) {
    // Check if expected columns are a subset of actual (player used SELECT *)
    const actualLower = result.columns.map((c) => c.toLowerCase().trim());
    const expectedLower = expected.columns.map((c) => c.toLowerCase().trim());
    const allExpectedPresent = expectedLower.every((c) => actualLower.includes(c));

    if (!allExpectedPresent) {
      const missingCols = expectedLower.filter((c) => !actualLower.includes(c));
      return {
        correct: false,
        feedback: `Your revelation is missing required columns: ${missingCols.join(', ')}. Make sure your SELECT includes the right fields.`,
      };
    }

    // All expected columns are present — extract and compare just those columns
    const expectedIndices = expectedLower.map((col) =>
      actualLower.indexOf(col)
    );

    const projectedActualRows = result.rows.map((row) =>
      expectedIndices.map((i) => row[i])
    );

    const rowsOk = requiresStrictOrder
      ? rowsMatchOrdered(projectedActualRows, expected.rows)
      : rowSetsMatch(projectedActualRows, expected.rows);

    if (!rowsOk) {
      return {
        correct: false,
        feedback: requiresStrictOrder
          ? 'The columns look right, but the records are in the wrong order. Check your ORDER BY clause — sequence matters for this incantation.'
          : 'The columns look right, but the data does not match. Check your WHERE conditions, JOIN logic, or filter values.',
      };
    }

    // Correct, just has extra columns
    return {
      correct: true,
      feedback: 'The revelation is correct! (Your spell revealed extra columns too — that is fine.)',
      partialCredit: false,
    };
  }

  // Both column count and names match — compare rows
  const finalRowsOk = requiresStrictOrder
    ? rowsMatchOrdered(result.rows, expected.rows)
    : rowSetsMatch(result.rows, expected.rows);

  if (!finalRowsOk) {
    return {
      correct: false,
      feedback: requiresStrictOrder
        ? 'The records are correct but in the wrong order. This incantation requires a specific sequence — review your ORDER BY clause.'
        : 'The columns are correct, but the records do not match. Double-check your filter conditions and values.',
    };
  }

  return {
    correct: true,
    feedback: 'Your incantation is perfect! The revelation matches exactly.',
  };
}
