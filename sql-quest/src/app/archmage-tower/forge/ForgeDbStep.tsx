'use client';

import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import type { ForgeFormData } from './types';
import { Field, inputClass } from './ForgeSteps';

interface ForgeDbStepProps {
  form: ForgeFormData;
  update: (patch: Partial<ForgeFormData>) => void;
}

const DDL_PLACEHOLDER = `-- Define your tables and seed data for this quest.
-- This SQL will be compiled into a private .sqlite file.

CREATE TABLE suspects (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  guild TEXT,
  seen_at TEXT
);

INSERT INTO suspects VALUES
  (1, 'Aldric Vane',    'Merchants',  '2024-01-15 23:47'),
  (2, 'Sera Nightfall', 'Thieves',    '2024-01-15 23:55'),
  (3, 'Tobias Greyhelm', 'Merchants', '2024-01-14 18:00');`;

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'rgba(45, 27, 14, 0.8)',
    color: '#F5E6D3',
    borderRadius: '0.375rem',
    border: '1px solid rgba(201, 160, 78, 0.3)',
    fontSize: '13px',
  },
  '.cm-content': { padding: '10px 0', fontFamily: 'var(--font-fira, monospace)' },
  '.cm-line': { padding: '0 12px' },
  '.cm-gutters': { backgroundColor: 'rgba(62, 39, 35, 0.5)', border: 'none', color: '#8B7355' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255, 215, 0, 0.08)' },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 215, 0, 0.04)' },
  '.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#FFD700' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(255, 215, 0, 0.15) !important' },
  '.tok-keyword': { color: '#00E5FF', fontWeight: '600' },
  '.tok-string': { color: '#69FF47' },
  '.tok-number': { color: '#FFAB40' },
  '.tok-comment': { color: '#8B7355', fontStyle: 'italic' },
  '.tok-typeName': { color: '#FFAB40' },
  '.tok-name': { color: '#F5E6D3' },
  '.tok-operator': { color: '#D500F9' },
  '.tok-punctuation': { color: '#C9A04E' },
});

export function ForgeDbStep({ form, update }: ForgeDbStepProps) {
  return (
    <div className="space-y-5">
      <div className="mb-1">
        <h3 className="font-cinzel text-arcane-gold font-bold text-base">Database Initialization</h3>
        <p className="text-parchment-light/40 text-xs font-inter mt-0.5">
          Write the DDL and seed data for your custom dataset. This will be compiled locally via
          sql.js and uploaded as a private <code className="text-arcane-blue">.sqlite</code> file.
        </p>
      </div>

      <Field label="DDL / DML SQL" required>
        <CodeMirror
          value={form.ddlSql}
          placeholder={DDL_PLACEHOLDER}
          extensions={[sql(), editorTheme]}
          onChange={(val) => update({ ddlSql: val })}
          minHeight="220px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: true,
          }}
        />
      </Field>

      <div className="border border-arcane-blue/20 bg-arcane-blue/5 rounded p-3 space-y-1">
        <p className="text-arcane-blue/80 text-xs font-cinzel font-semibold tracking-wide">
          How compilation works
        </p>
        <ul className="text-parchment-light/40 text-xs font-inter space-y-0.5 list-disc list-inside leading-relaxed">
          <li>Your SQL runs in an in-browser <strong className="text-parchment-light/60">sql.js</strong> instance — no server needed.</li>
          <li>The resulting database is exported as a binary and uploaded to Supabase Storage.</li>
          <li>Students&apos; queries will run against this private dataset.</li>
          <li>Syntax errors here will surface before the quest is saved.</li>
        </ul>
      </div>

      {!form.ddlSql.trim() && (
        <p className="text-arcane-red/60 text-xs font-inter">
          Database SQL is required to forge the quest.
        </p>
      )}
    </div>
  );
}
