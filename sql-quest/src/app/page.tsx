'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';

export default function TitleScreen() {
  const { completedQuestIds } = useGameState();
  const hasSavedProgress = completedQuestIds.length > 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-parchment-dark relative overflow-hidden px-4">
      {/* Background atmospheric gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, #4A3520 0%, #2D1B0E 50%, #1A0E05 100%)',
        }}
        aria-hidden="true"
      />

      {/* Floating particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {['✦', '✧', '⋆', '✦', '✧', '⋆', '✦'].map((star, i) => (
          <motion.span
            key={i}
            className="absolute text-arcane-gold/20 text-xs select-none"
            style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 20}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {star}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-5xl mb-3 animate-float" aria-hidden="true">🏰</div>
          <h1 className="font-cinzel text-arcane-gold text-4xl sm:text-5xl font-black tracking-widest mb-1 leading-tight">
            SQL QUEST
          </h1>
          <p className="font-cinzel text-parchment-light/70 text-lg sm:text-xl tracking-wider mb-2">
            The Realm of Syntaxia
          </p>
          <p className="font-inter text-parchment-light/40 text-sm">
            Cast spells. Solve mysteries. Master SQL.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-arcane-gold/40 to-transparent my-8"
        />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col gap-3 max-w-xs mx-auto"
        >
          <Link href="/play">
            <TitleButton icon="⚔️" label="Begin Quest" variant="primary" />
          </Link>

          {hasSavedProgress && (
            <Link href="/play">
              <TitleButton
                icon="📖"
                label={`Continue (${completedQuestIds.length} cases solved)`}
                variant="secondary"
              />
            </Link>
          )}

          <Link href="/auth/login">
            <TitleButton icon="🔑" label="Login / Register" variant="tertiary" />
          </Link>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="font-inter text-parchment-light/20 text-xs mt-10"
        >
          v0.1.0 — Free to play, no account required
        </motion.p>
      </div>
    </main>
  );
}

function TitleButton({
  icon,
  label,
  variant,
}: {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary';
}) {
  const variantClasses = {
    primary:
      'border-arcane-gold text-arcane-gold hover:bg-arcane-gold/10 hover:shadow-arcane-gold text-base',
    secondary:
      'border-arcane-blue text-arcane-blue hover:bg-arcane-blue/10 hover:shadow-arcane-blue text-sm',
    tertiary:
      'border-parchment/20 text-parchment-light/50 hover:border-parchment/40 hover:text-parchment-light/70 text-sm',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'w-full py-3.5 px-6 rounded border-2',
        'font-cinzel font-semibold tracking-wide',
        'transition-all duration-200',
        'flex items-center justify-center gap-3',
        variantClasses[variant],
      ].join(' ')}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </motion.div>
  );
}
