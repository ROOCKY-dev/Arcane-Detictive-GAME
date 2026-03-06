'use client';

import { useState } from 'react';
import type { SchemaTable } from '@/data/schemas/types';

interface SchemaViewerProps {
  tables: SchemaTable[];
}

export function SchemaViewer({ tables }: SchemaViewerProps) {
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

  function toggleTable(tableName: string) {
    setOpenTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  }

  if (tables.length === 0) {
    return <p className="text-parchment-light/40 text-xs italic">No schema available.</p>;
  }

  return (
    <div className="space-y-1.5">
      {tables.map((table) => {
        const isOpen = openTables.has(table.name);
        return (
          <div key={table.name} className="border border-border-gold/25 rounded">
            <button
              onClick={() => toggleTable(table.name)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-parchment/10 transition-colors group"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2">
                <span className="text-arcane-gold text-sm" aria-hidden="true">
                  {isOpen ? '▼' : '▶'}
                </span>
                <span className="font-fira text-arcane-blue text-xs font-semibold">
                  {table.name}
                </span>
              </div>
              <span className="text-parchment-light/30 text-xs group-hover:text-parchment-light/50">
                {table.columns.length} fields
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border-gold/20 px-3 py-2 space-y-0.5 bg-parchment-dark/40">
                <p className="text-parchment-light/50 text-xs italic mb-2">
                  {table.description}
                </p>
                {table.columns.map((col) => (
                  <div key={col.name} className="flex items-start gap-2 py-0.5">
                    <span
                      className={[
                        'font-fira text-xs mt-0.5 shrink-0',
                        col.isPrimaryKey
                          ? 'text-arcane-gold'
                          : col.isForeignKey
                          ? 'text-arcane-blue'
                          : 'text-parchment-light/75',
                      ].join(' ')}
                    >
                      {col.name}
                    </span>
                    <span className="text-arcane-purple/70 font-fira text-xs shrink-0">
                      {col.type}
                    </span>
                    <span className="text-parchment-light/40 text-xs leading-tight">
                      {col.description}
                    </span>
                    {col.isPrimaryKey && (
                      <span className="text-arcane-gold text-xs ml-auto shrink-0" title="Primary Key">
                        PK
                      </span>
                    )}
                    {col.isForeignKey && (
                      <span className="text-arcane-blue text-xs ml-auto shrink-0" title="Foreign Key">
                        FK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
