'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { MagicalButton } from '@/components/ui/MagicalButton';

interface CaseSolvedProps {
  isOpen: boolean;
  questTitle: string;
  npcName: string;
  successMessage: string;
  timeSeconds: number;
  hintsUsed: number;
  onNextCase: () => void;
  onBackToMap: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function CaseSolved({
  isOpen,
  questTitle,
  npcName,
  successMessage,
  timeSeconds,
  hintsUsed,
  onNextCase,
  onBackToMap,
}: CaseSolvedProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Magical golden confetti burst
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#C9A04E', '#4A9EFF', '#2ECC71'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#C9A04E', '#4A9EFF', '#2ECC71'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-parchment-dark border-2 border-arcane-gold shadow-arcane-gold rounded-xl max-w-md w-full p-8 text-center"
          >
            <div className="text-4xl mb-3 animate-float" aria-hidden="true">
              ⚔️
            </div>
            <h2 className="font-cinzel text-arcane-gold text-2xl font-bold tracking-wide mb-1">
              CASE SOLVED
            </h2>
            <p className="text-parchment-light/70 font-inter text-sm mb-4">
              &ldquo;{questTitle}&rdquo;
            </p>

            <div className="bg-parchment/5 border border-border-gold/30 rounded-lg p-4 mb-4">
              <p className="text-arcane-gold text-xs font-cinzel mb-1">{npcName}</p>
              <p className="text-parchment-light/85 text-sm font-inter italic leading-relaxed">
                &ldquo;{successMessage}&rdquo;
              </p>
            </div>

            <div className="flex justify-center gap-6 mb-5">
              <div className="text-center">
                <div className="text-arcane-blue text-lg font-cinzel font-bold">
                  {formatTime(timeSeconds)}
                </div>
                <div className="text-parchment-light/40 text-xs font-inter">Time</div>
              </div>
              <div className="text-center">
                <div
                  className={[
                    'text-lg font-cinzel font-bold',
                    hintsUsed === 0 ? 'text-arcane-green' : 'text-arcane-gold',
                  ].join(' ')}
                >
                  {hintsUsed}
                </div>
                <div className="text-parchment-light/40 text-xs font-inter">
                  Hints Used
                </div>
              </div>
              {hintsUsed === 0 && (
                <div className="text-center">
                  <div className="text-arcane-green text-lg">🛡️</div>
                  <div className="text-arcane-green text-xs font-cinzel">No Hints!</div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <MagicalButton variant="gold" onClick={onNextCase}>
                Next Case →
              </MagicalButton>
              <MagicalButton variant="blue" onClick={onBackToMap}>
                Back to Map
              </MagicalButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
