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
      <StepHeader title="Quest Metadata" hint="Define the identity of your mystery and the NPC guide." />

      <Field label="Quest Title" required>
        <input type="text" value={form.title} onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g. The Vanishing Ledger" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Location" required>
          <select value={form.locationId} onChange={(e) => update({ locationId: e.target.value })} className={inputClass}>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.iconEmoji} {loc.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty" required>
          <select value={form.difficulty} onChange={(e) => update({ difficulty: e.target.value as QuestDifficulty })} className={inputClass}>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="border-t border-border-gold/10 pt-4">
        <p className="text-parchment-light/40 text-xs font-inter mb-3">
          NPC Guide — the character who briefs the apprentice. Leave blank for a generic prompt.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="NPC Name">
            <input type="text" value={form.npcName} onChange={(e) => update({ npcName: e.target.value })}
              placeholder="e.g. Archmage Codex" className={inputClass} />
          </Field>
          <Field label="NPC Role / Title">
            <input type="text" value={form.npcDialogue && form.npcName ? '' : ''}
              placeholder="e.g. Keeper of Records"
              className={`${inputClass} opacity-60`}
              disabled
              title="Set via the dialogue field below" />
          </Field>
        </div>
        <Field label="NPC Opening Dialogue">
          <textarea value={form.npcDialogue} onChange={(e) => update({ npcDialogue: e.target.value })}
            placeholder="Welcome, young Inquisitor! A most troubling matter has come to my attention..."
            rows={3} className={`${inputClass} resize-y leading-relaxed mt-2`} />
        </Field>
      </div>
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

// ─── Step 4: Hints + Validation ───────────────────────────────────────────────

export function ForgeStep4({ form, update }: StepProps) {
  function setHint(idx: number, val: string) {
    const next = [...form.hints] as [string, string, string];
    next[idx] = val;
    update({ hints: next });
  }

  return (
    <div className="space-y-5">
      <StepHeader
        title="Hints & Validation"
        hint="Author up to 3 progressive hints and set answer-checking rules."
      />

      <div className="space-y-3">
        {(['First hint — general direction', 'Second hint — narrow it down', 'Third hint — near-complete example'] as const).map((placeholder, idx) => (
          <Field key={idx} label={`Hint ${idx + 1}${idx === 0 ? ' (broadest)' : idx === 2 ? ' (most specific)' : ''}`}>
            <textarea
              value={form.hints[idx]}
              onChange={(e) => setHint(idx, e.target.value)}
              placeholder={placeholder}
              rows={2}
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </Field>
        ))}
      </div>

      <div className="border-t border-border-gold/10 pt-4">
        <StepHeader title="Validation Rule" hint="Control how strictly student answers are checked." />
        <label className="flex items-start gap-4 cursor-pointer group mt-3">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={form.requiresStrictOrder}
              onChange={(e) => update({ requiresStrictOrder: e.target.checked })}
              className="sr-only"
            />
            <div className={['w-10 h-6 rounded-full border-2 transition-all duration-200', form.requiresStrictOrder ? 'bg-arcane-gold/20 border-arcane-gold' : 'bg-parchment/5 border-parchment/20'].join(' ')}>
              <div className={['absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200', form.requiresStrictOrder ? 'left-4 bg-arcane-gold' : 'left-0.5 bg-parchment-light/30'].join(' ')} />
            </div>
          </div>
          <div>
            <p className="font-cinzel text-parchment-light text-sm font-semibold">Require Strict Row Ordering</p>
            <p className="text-parchment-light/40 text-xs font-inter mt-0.5 leading-relaxed">
              Student rows must appear in exactly the same order as your solution. Use for <code className="text-arcane-blue">ORDER BY</code> / <code className="text-arcane-blue">LIMIT</code> quests.
            </p>
          </div>
        </label>
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
