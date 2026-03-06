'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { getCustomQuest, isSupabaseConfigured } from '@/lib/supabase';

export default function NoticeBoardPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);

    startTransition(async () => {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured — custom quests are unavailable.');
        return;
      }
      const quest = await getCustomQuest(trimmed).catch(() => null);
      if (!quest) {
        setError('No quest found with that code. Check the code and try again.');
        return;
      }
      router.push(`/play/custom/${trimmed}`);
    });
  }

  return (
    <div
      className="min-h-screen bg-parchment-dark flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center top, #3A2810 0%, #2D1B0E 50%, #1A0E05 100%)' }}
    >
      {/* Navbar */}
      <header className="border-b border-border-gold/20 px-4 py-3 flex items-center justify-between bg-parchment-dark/80">
        <Link href="/play" className="font-cinzel text-arcane-gold font-bold text-sm tracking-wider hover:opacity-80 transition-opacity">
          ← The Realm
        </Link>
        <span className="font-cinzel text-parchment-light/40 text-xs hidden sm:block">Notice Board</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-5xl" aria-hidden="true">📜</div>
            <h1 className="font-cinzel text-arcane-gold text-2xl font-bold tracking-wide">
              Notice Board
            </h1>
            <p className="text-parchment-light/50 text-sm font-inter leading-relaxed">
              Your Archmage has assigned a special investigation.<br />
              Enter the Quest Code they shared to begin.
            </p>
          </div>

          {/* Code entry */}
          <div className="border border-border-gold/30 rounded-lg p-6 bg-parchment-dark/60 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="quest-code"
                  className="block text-xs font-cinzel text-parchment-light/60 mb-2 tracking-wide"
                >
                  Quest Code
                </label>
                <input
                  id="quest-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste the code from your Archmage..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-parchment-dark/80 border border-border-gold/30 rounded px-3 py-2.5 text-sm font-mono text-arcane-gold placeholder:text-parchment-light/20 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-arcane-red text-xs font-inter border border-arcane-red/30 bg-arcane-red/5 rounded px-3 py-2"
                >
                  {error}
                </p>
              )}

              <MagicalButton
                variant="gold"
                size="md"
                type="submit"
                disabled={!code.trim() || isPending}
                isLoading={isPending}
                className="w-full"
              >
                {isPending ? 'Searching the archives...' : 'Open the Assignment'}
              </MagicalButton>
            </form>
          </div>

          {/* Help text */}
          <p className="text-center text-parchment-light/25 text-xs font-inter">
            Don&apos;t have a code?{' '}
            <Link href="/play" className="text-parchment-light/40 hover:text-parchment-light/70 underline underline-offset-2 transition-colors">
              Return to the world map
            </Link>{' '}
            to explore standard quests.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
