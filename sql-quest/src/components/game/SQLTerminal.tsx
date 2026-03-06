'use client';

import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { sfx } from '@/lib/audio';

interface SQLTerminalProps {
  onExecute: (query: string) => void;
  onReset: () => void;
  isLoading?: boolean;
  placeholder?: string;
  initialValue?: string;
}

// Custom medieval dark theme for CodeMirror
const medievalTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#1a0e05',
      color: '#F5E6C8',
      fontSize: '14px',
      height: '100%',
      minHeight: '160px',
    },
    '.cm-content': {
      fontFamily: "'Fira Code', monospace",
      caretColor: '#FFD700',
      padding: '12px',
    },
    '.cm-cursor': {
      borderLeftColor: '#FFD700',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#00E5FF18 !important',
    },
    // Gutter blended with the parchment background — no more jarring pure-black bar
    '.cm-gutters': {
      backgroundColor: 'rgba(62, 39, 35, 0.5)',
      color: '#C9A04E70',
      border: 'none',
      borderRight: '1px solid rgba(201, 160, 78, 0.15)',
    },
    '.cm-gutter': {
      minWidth: '2.5em',
    },
    '.cm-activeLine': {
      backgroundColor: '#FFD70008',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(255, 215, 0, 0.12)',
      color: '#C9A04E',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#FFD700',
    },
    // SQL syntax highlighting — high-contrast magical palette
    // Keywords (SELECT, WHERE, FROM…): glowing cyan for max readability
    '.cm-keyword': { color: '#00E5FF', fontWeight: 'bold' },
    // String literals: bright emerald green
    '.cm-string': { color: '#69FF47' },
    // Numeric literals: arcane gold
    '.cm-number': { color: '#FFD700' },
    // Comments: warm amber, italic, subdued
    '.cm-comment': { color: '#C9A04E80', fontStyle: 'italic' },
    // Operators (=, >, <, *…): bright neon purple
    '.cm-operator': { color: '#D500F9' },
    // Punctuation (commas, semicolons…): soft gold
    '.cm-punctuation': { color: '#C9A04E' },
    // Type names / identifiers: cream parchment
    '.cm-typeName': { color: '#F5E6C8' },
    '.cm-variableName': { color: '#F5E6C8' },
    // Builtins / function names: warm orange
    '.cm-name': { color: '#FFAB40' },
  },
  { dark: true }
);

const PLACEHOLDER_TEXT = '-- Cast your spell here...\nSELECT * FROM grimoires\nWHERE shelf_number = 7;';

export function SQLTerminal({
  onExecute,
  onReset,
  isLoading = false,
  placeholder,
  initialValue = '',
}: SQLTerminalProps) {
  const [query, setQuery] = useState(initialValue);

  const handleExecute = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) {
      sfx.play('cast');
      onExecute(trimmed);
    }
  }, [query, onExecute]);

  // Ctrl+Enter keyboard shortcut + keystroke sound
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
        return;
      }
      // Throttled quill-scratch on regular typing
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        sfx.play('keystroke');
      }
    },
    [handleExecute]
  );

  return (
    <div className="flex flex-col gap-3" onKeyDown={handleKeyDown}>
      {/* Editor header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-arcane-gold/70 text-xs font-cinzel tracking-widest uppercase">
          Enchanted Parchment
        </span>
        <span className="text-parchment-light/25 text-xs font-inter">
          Ctrl+Enter to cast
        </span>
      </div>

      {/* CodeMirror editor */}
      <div
        className="rounded border border-border-gold/30 overflow-hidden"
        aria-label="SQL query editor"
        role="textbox"
        aria-multiline="true"
      >
        <CodeMirror
          value={query}
          onChange={setQuery}
          extensions={[sql(), medievalTheme]}
          placeholder={placeholder ?? PLACEHOLDER_TEXT}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            autocompletion: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
          }}
          style={{ maxHeight: '280px' }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <MagicalButton
          variant="gold"
          onClick={handleExecute}
          isLoading={isLoading}
          disabled={!query.trim() || isLoading}
          className="flex-1"
          aria-label="Execute SQL query"
        >
          ✨ Cast Spell
        </MagicalButton>
        <MagicalButton
          variant="blue"
          size="md"
          onClick={onReset}
          disabled={isLoading}
          title="Reset database to original state"
          aria-label="Reset database"
        >
          🔄 Reset DB
        </MagicalButton>
      </div>
    </div>
  );
}
