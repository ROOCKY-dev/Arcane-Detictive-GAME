'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WorldMap } from '@/components/game/WorldMap';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { useProgress } from '@/hooks/useProgress';
import { useGameState } from '@/hooks/useGameState';
import { LOCATIONS } from '@/data/locations';

export default function WorldMapPage() {
  const { locationProgress } = useProgress();
  const { unlockedLocationIds } = useGameState();

  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Navbar */}
      <header className="border-b border-border-gold/20 px-4 py-3 flex items-center justify-between bg-parchment-dark/90 sticky top-0 z-10">
        <Link href="/">
          <span className="font-cinzel text-arcane-gold font-bold text-sm tracking-wider hover:text-arcane-gold/80 transition-colors">
            🏰 SQL Quest
          </span>
        </Link>
        <h1 className="font-cinzel text-parchment-light/70 text-sm hidden sm:block">
          The Realm of Syntaxia
        </h1>
        <Link href="/auth/login">
          <MagicalButton variant="gold" size="sm">
            👤 Login
          </MagicalButton>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-cinzel text-arcane-gold text-2xl font-bold mb-2">
            The Realm of Syntaxia
          </h2>
          <p className="text-parchment-light/50 text-sm font-inter">
            Choose a location to investigate. Solve magical crimes by casting SQL spells.
          </p>
        </motion.div>

        <WorldMap
          locations={LOCATIONS}
          locationProgress={locationProgress}
          unlockedLocationIds={unlockedLocationIds}
        />
      </main>
    </div>
  );
}
