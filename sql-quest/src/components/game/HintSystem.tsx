'use client';

import { useState } from 'react';
import type { QuestHint } from '@/types/game';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { sfx } from '@/lib/audio';

interface HintSystemProps {
  hints: QuestHint[];
  onHintUsed?: () => void;
}

export function HintSystem({ hints, onHintUsed }: HintSystemProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  function revealNextHint() {
    if (revealedCount < hints.length) {
      sfx.play('hint');
      setRevealedCount((c) => c + 1);
      onHintUsed?.();
    }
  }

  const revealedHints = hints.slice(0, revealedCount).sort((a, b) => a.order - b.order);
  const hasMoreHints = revealedCount < hints.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-parchment-light/60 text-xs font-inter">
          {revealedCount > 0
            ? `${revealedCount} of ${hints.length} whispers revealed`
            : 'Magical whispers available'}
        </span>
        {hasMoreHints && (
          <MagicalButton
            variant="blue"
            size="sm"
            onClick={revealNextHint}
            title="Reveal next hint"
          >
            💡 Hint ({hints.length - revealedCount} left)
          </MagicalButton>
        )}
      </div>

      {revealedHints.length > 0 && (
        <div className="space-y-1.5">
          {revealedHints.map((hint) => (
            <div
              key={hint.order}
              className="border border-arcane-blue/30 bg-arcane-blue/5 rounded px-3 py-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-arcane-blue text-xs font-cinzel shrink-0 mt-0.5">
                  #{hint.order}
                </span>
                <p className="text-parchment-light/80 text-xs font-inter leading-relaxed">
                  {hint.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasMoreHints && hints.length > 0 && (
        <p className="text-parchment-light/30 text-xs italic font-inter text-center">
          All whispers have been revealed.
        </p>
      )}
    </div>
  );
}
