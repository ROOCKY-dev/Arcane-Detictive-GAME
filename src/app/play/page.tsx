'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { WorldMap } from '@/components/game/WorldMap';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { useProgress } from '@/hooks/useProgress';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { LOCATIONS } from '@/data/locations';

export default function WorldMapPage() {
  return (
    <Suspense>
      <WorldMapInner />
    </Suspense>
  );
}

function WorldMapInner() {
  const { locationProgress } = useProgress();
  const { unlockedLocationIds } = useGameState();
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

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
        {authLoading ? (
          <div className="w-5 h-5 border-2 border-arcane-gold/30 border-t-arcane-gold rounded-full animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {user.role === 'teacher' && (
              <Link href="/archmage-tower">
                <MagicalButton variant="blue" size="sm">🏰 Tower</MagicalButton>
              </Link>
            )}
            <Link href="/profile">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border-gold/30 hover:border-arcane-gold/50 transition-colors text-xs font-inter text-parchment-light/70 hover:text-parchment-light">
                <span aria-hidden="true">{user.role === 'teacher' ? '🧙' : '⚔️'}</span>
                <span className="max-w-[80px] truncate">{user.username}</span>
              </button>
            </Link>
          </div>
        ) : (
          <Link href="/auth/login">
            <MagicalButton variant="gold" size="sm">👤 Login</MagicalButton>
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        {reason === 'teacher_only' && (
          <div className="mb-6 border border-arcane-red/30 bg-arcane-red/5 rounded p-3 text-arcane-red text-xs font-inter text-center">
            The Archmage Tower is restricted to teachers. Sign in with a teacher account to access it.
          </div>
        )}

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

        {/* Notice Board — for students with class assignments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 border border-border-gold/20 rounded-lg p-5 bg-parchment-dark/40 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-cinzel text-arcane-gold font-bold text-sm">📜 Notice Board</p>
            <p className="text-parchment-light/40 text-xs font-inter mt-0.5">
              Received a Quest Code from your Archmage? Enter it here to begin your assignment.
            </p>
          </div>
          <Link href="/play/notice-board" className="shrink-0">
            <MagicalButton variant="blue" size="sm">Open Assignment</MagicalButton>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
