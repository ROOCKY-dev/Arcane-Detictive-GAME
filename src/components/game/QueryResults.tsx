'use client';

import type { QueryResult } from '@/types/game';

interface QueryResultsProps {
  result: QueryResult | null;
  isLoading?: boolean;
}

export function QueryResults({ result, isLoading = false }: QueryResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 text-arcane-gold animate-shimmer">
        <span className="text-2xl animate-spin">✨</span>
        <span className="font-cinzel text-sm tracking-widest">Casting spell...</span>
      </div>
    );
  }

  if (!result) {
    // No query has been run yet
    return (
      <div className="py-8 text-center space-y-1">
        <div className="text-2xl mb-2 opacity-40" aria-hidden="true">📜</div>
        <p className="text-parchment-light/65 font-inter text-sm italic">
          Cast a spell to reveal the hidden knowledge...
        </p>
        <p className="text-parchment-light/35 font-inter text-xs">
          Write your SQL incantation above, then press Ctrl+Enter
        </p>
      </div>
    );
  }

  if (result.error) {
    // SQL syntax / execution error — themed as a "spell misfire" with reddish glow
    return (
      <div
        className="rounded border border-arcane-red/60 bg-arcane-red/8 p-4"
        style={{ boxShadow: '0 0 12px rgba(231, 76, 60, 0.15)' }}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl" aria-hidden="true">💨</span>
          <span className="font-cinzel font-bold text-arcane-red tracking-wide">
            SPELL MISFIRE!
          </span>
        </div>
        <p className="text-parchment-light/75 text-sm font-inter mb-2 italic">
          A magical misfire! The weave rejects your syntax:
        </p>
        <pre className="text-arcane-red/85 text-xs font-fira bg-parchment-dark/70 border border-arcane-red/20 rounded p-2.5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {result.error}
        </pre>
      </div>
    );
  }

  if (result.rowCount === 0) {
    // Query ran successfully but returned no rows
    return (
      <div className="py-8 text-center space-y-1" role="status" aria-live="polite">
        <div className="text-2xl mb-2" aria-hidden="true">🌫️</div>
        <p className="text-parchment-light/70 font-cinzel text-sm tracking-wide">
          The spell revealed nothing!
        </p>
        <p className="text-parchment-light/45 font-inter text-xs italic">
          No records match your incantation. Check your WHERE conditions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="text-right text-xs text-parchment-light/40 font-inter mb-1.5">
        {result.rowCount} {result.rowCount === 1 ? 'record' : 'records'} revealed
      </div>
      <table className="w-full border-collapse text-sm font-inter">
        <thead>
          <tr className="border-b-2 border-border-gold/60">
            {result.columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-cinzel text-arcane-gold/90 text-xs tracking-wider uppercase whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-border-gold/15 hover:bg-parchment/10 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-2 text-parchment-light/85 font-fira text-xs whitespace-nowrap"
                >
                  {cell === null ? (
                    <span className="text-arcane-purple/60 italic">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
