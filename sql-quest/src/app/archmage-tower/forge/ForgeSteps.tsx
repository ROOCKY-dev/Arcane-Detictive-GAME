'use client';

import type { ForgeFormData } from './types';
import { LOCATIONS } from '@/data/locations';
import type { QuestDifficulty } from '@/types/game';

interface StepProps {
  form: ForgeFormData;
  update: (patch: Partial<ForgeFormData>) => void;
}

const DIFFICULTIES: { value: QuestDifficulty; label: string }[] = [
  { value: 'beginner',     label: 'Beginner — Simple SELECT / WHERE' },
  { value: 'intermediate', label: 'Intermediate — JOINs & Aggregates' },
  { value: 'advanced',     label: 'Advanced — Subqueries & Complex Filters' },
];

// ─── Step 1: Quest Metadata ───────────────────────────────────────────────────

export function ForgeStep1({ form, update }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeader title="Quest Metadata" hint="Define the identity of your mystery." />

      <Field label="Quest Title" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g. The Vanishing Ledger"
          className={inputClass}
        />
      </Field>

      <Field label="Location" required>
        <select
          value={form.locationId}
          onChange={(e) => update({ locationId: e.target.value })}
          className={inputClass}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.iconEmoji} {loc.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Difficulty" required>
        <select
          value={form.difficulty}
          onChange={(e) => update({ difficulty: e.target.value as QuestDifficulty })}
          className={inputClass}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

// ─── Step 2: Narrative ────────────────────────────────────────────────────────

export function ForgeStep2({ form, update }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="The Narrative"
        hint="Write the story — what happened, who needs help, what the apprentice must investigate."
      />
      <Field label="Quest Prompt" required>
        <textarea
          value={form.narrative}
          onChange={(e) => update({ narrative: e.target.value })}
          placeholder="A mysterious ledger has vanished from the archives. Archmage Codex suspects an inside job. Query the records to find all transactions by users who accessed the vault after midnight..."
          rows={8}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </Field>
      <p className="text-parchment-light/30 text-xs font-inter">
        {form.narrative.length} characters
      </p>
    </div>
  );
}

// ─── Step 3: Expected SQL Incantation ─────────────────────────────────────────

export function ForgeStep3({ form, update }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="The Incantation"
        hint="Write the SQL solution that produces the correct answer. Students' queries will be validated against this result set."
      />
      <Field label="Expected SQL Solution" required>
        <textarea
          value={form.expectedSql}
          onChange={(e) => update({ expectedSql: e.target.value })}
          placeholder={'SELECT u.name, t.amount\nFROM users u\nJOIN transactions t ON u.id = t.user_id\nWHERE t.created_at > \'2024-01-01\'\nORDER BY t.amount DESC;'}
          rows={8}
          spellCheck={false}
          className={`${inputClass} font-fira resize-y text-arcane-blue/90`}
        />
      </Field>
    </div>
  );
}

// ─── Step 4: Validation Rules ─────────────────────────────────────────────────

export function ForgeStep4({ form, update }: StepProps) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="Validation Rules"
        hint="Control how strictly students' answers are checked."
      />

      <label className="flex items-start gap-4 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={form.requiresStrictOrder}
            onChange={(e) => update({ requiresStrictOrder: e.target.checked })}
            className="sr-only"
          />
          <div
            className={[
              'w-10 h-6 rounded-full border-2 transition-all duration-200',
              form.requiresStrictOrder
                ? 'bg-arcane-gold/20 border-arcane-gold'
                : 'bg-parchment/5 border-parchment/20',
            ].join(' ')}
          >
            <div
              className={[
                'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200',
                form.requiresStrictOrder
                  ? 'left-4 bg-arcane-gold'
                  : 'left-0.5 bg-parchment-light/30',
              ].join(' ')}
            />
          </div>
        </div>
        <div>
          <p className="font-cinzel text-parchment-light text-sm font-semibold">
            Require Strict Row Ordering
          </p>
          <p className="text-parchment-light/40 text-xs font-inter mt-0.5 leading-relaxed">
            When enabled, the student&apos;s result rows must appear in exactly the same
            order as your solution. Use this for quests that explicitly test <code className="text-arcane-blue">ORDER BY</code> or <code className="text-arcane-blue">LIMIT</code>.
          </p>
        </div>
      </label>

      <div className="border border-border-gold/10 rounded p-3 bg-parchment/5 text-xs font-inter text-parchment-light/40 leading-relaxed">
        <strong className="text-parchment-light/60">Default behaviour:</strong> Row order is ignored.
        Any query that produces the correct set of columns and values will be accepted,
        regardless of how the student orders their result.
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StepHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-1">
      <h3 className="font-cinzel text-arcane-gold font-bold text-base">{title}</h3>
      <p className="text-parchment-light/40 text-xs font-inter mt-0.5">{hint}</p>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
        {label}
        {required && <span className="text-arcane-red ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  'w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/20 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors';
