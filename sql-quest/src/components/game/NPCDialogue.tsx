'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicalButton } from '@/components/ui/MagicalButton';

interface NPCDialogueProps {
  npcName: string;
  npcTitle: string;
  dialogue: string;
  onDismiss: () => void;
  isOpen: boolean;
  /** Path to NPC portrait image (relative to /public). Falls back to emoji. */
  avatarUrl?: string;
}

export function NPCDialogue({
  npcName,
  npcTitle,
  dialogue,
  onDismiss,
  isOpen,
  avatarUrl,
}: NPCDialogueProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsDone(false);
      return;
    }
    setDisplayedText('');
    setIsDone(false);

    let i = 0;
    const interval = setInterval(() => {
      if (i < dialogue.length) {
        setDisplayedText(dialogue.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [dialogue, isOpen]);

  function handleClick() {
    if (!isDone) {
      // Skip typewriter — show full text
      setDisplayedText(dialogue);
      setIsDone(true);
    } else {
      onDismiss();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={handleClick}
          role="dialog"
          aria-modal="true"
          aria-label={`${npcName} speaks`}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-parchment-dark border-2 border-border-gold/60 rounded-lg shadow-arcane-gold max-w-lg w-full p-6"
          >
            {/* NPC identity */}
            <div className="flex items-center gap-4 mb-4">
              <div className="shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={npcName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-yellow-600 shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full border-4 border-yellow-600 shadow-lg bg-parchment-dark flex items-center justify-center text-4xl"
                    aria-hidden="true"
                  >
                    {npcName.includes('Codex')
                      ? '🧙'
                      : npcName.includes('Elara')
                      ? '🧪'
                      : npcName.includes('Gruff')
                      ? '🪖'
                      : '👤'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-cinzel text-arcane-gold font-bold text-lg">{npcName}</p>
                <p className="text-parchment-light/50 text-xs font-inter">{npcTitle}</p>
              </div>
            </div>

            {/* Dialogue */}
            <div className="bg-parchment/5 border border-border-gold/20 rounded p-4 mb-4 min-h-[80px]">
              <p className="text-parchment-light/90 font-inter text-sm leading-relaxed italic">
                &ldquo;{displayedText}
                {!isDone && (
                  <span className="inline-block w-0.5 h-3.5 bg-arcane-gold ml-0.5 animate-pulse" />
                )}
                &rdquo;
              </p>
            </div>

            <div className="flex justify-end">
              <MagicalButton variant="gold" onClick={handleClick}>
                {isDone ? 'Continue' : 'Skip'} →
              </MagicalButton>
            </div>

            <p className="text-center text-parchment-light/20 text-xs mt-2 font-inter">
              Click anywhere to {isDone ? 'continue' : 'skip'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
