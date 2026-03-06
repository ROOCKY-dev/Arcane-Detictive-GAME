'use client';

import { useState } from 'react';
import { ForgeStep1, ForgeStep2, ForgeStep3, ForgeStep4 } from './ForgeSteps';
import { ForgeDbStep } from './ForgeDbStep';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { FORGE_STEPS, FORGE_INITIAL } from './types';
import type { ForgeFormData } from './types';
import type { ForgeResult } from './forgeActions';

export function QuestForge() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ForgeFormData>(FORGE_INITIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ForgeResult | null>(null);

  function update(patch: Partial<ForgeFormData>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function canAdvance(): boolean {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.narrative.trim().length > 0;
    if (step === 3) return form.expectedSql.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setResult(null);
    try {
      const { compileAndUploadForge } = await import('./forgeActions');
      const res = await compileAndUploadForge(form);
      setResult(res);
      if (res.ok) {
        setForm(FORGE_INITIAL);
        setStep(1);
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Unknown error.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLastStep = step === FORGE_STEPS.length;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Step indicator */}
      <StepIndicator current={step} onJump={(n) => n < step && setStep(n)} />

      {/* Step content panel */}
      <div className="border border-border-gold/20 rounded-lg p-6 bg-parchment-dark/40">
        {step === 1 && <ForgeStep1 form={form} update={update} />}
        {step === 2 && <ForgeStep2 form={form} update={update} />}
        {step === 3 && <ForgeStep3 form={form} update={update} />}
        {step === 4 && <ForgeStep4 form={form} update={update} />}
        {step === 5 && <ForgeDbStep form={form} update={update} />}
      </div>

      {/* Result banner */}
      {result && (
        <div
          role="alert"
          className={[
            'border rounded p-3 text-sm font-inter',
            result.ok
              ? 'border-arcane-green/40 bg-arcane-green/5 text-arcane-green'
              : 'border-arcane-red/30 bg-arcane-red/5 text-arcane-red',
          ].join(' ')}
        >
          {result.message}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {step > 1 ? (
          <MagicalButton variant="gold" size="sm" onClick={() => setStep((s) => s - 1)}>
            ← Back
          </MagicalButton>
        ) : (
          <div />
        )}

        {isLastStep ? (
          <MagicalButton
            variant="green"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.ddlSql.trim()}
            isLoading={isSubmitting}
          >
            ⚒️ Forge Quest
          </MagicalButton>
        ) : (
          <MagicalButton
            variant="gold"
            size="sm"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Next →
          </MagicalButton>
        )}
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  onJump,
}: {
  current: number;
  onJump: (n: number) => void;
}) {
  return (
    <div className="flex items-center">
      {FORGE_STEPS.map((s, idx) => (
        <div key={s.num} className="flex items-center flex-1 last:flex-none">
          <button
            type="button"
            onClick={() => onJump(s.num)}
            disabled={current <= s.num}
            className="flex items-center gap-1.5 shrink-0"
            title={s.description}
          >
            <span
              className={[
                'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-cinzel font-bold transition-colors',
                current === s.num
                  ? 'border-arcane-gold bg-arcane-gold/20 text-arcane-gold'
                  : current > s.num
                  ? 'border-arcane-green bg-arcane-green/10 text-arcane-green cursor-pointer'
                  : 'border-parchment/20 text-parchment-light/30',
              ].join(' ')}
            >
              {current > s.num ? '✓' : s.num}
            </span>
            <span
              className={[
                'text-xs font-inter hidden sm:block',
                current === s.num
                  ? 'text-arcane-gold'
                  : current > s.num
                  ? 'text-arcane-green'
                  : 'text-parchment-light/30',
              ].join(' ')}
            >
              {s.label}
            </span>
          </button>
          {idx < FORGE_STEPS.length - 1 && (
            <div
              className={[
                'flex-1 h-px mx-2',
                current > s.num ? 'bg-arcane-green/40' : 'bg-parchment/10',
              ].join(' ')}
            />
          )}
        </div>
      ))}
    </div>
  );
}
