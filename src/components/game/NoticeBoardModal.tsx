'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { getCustomQuest, isSupabaseConfigured } from '@/lib/supabase';

interface NoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoticeBoardModal({ isOpen, onClose }: NoticeBoardModalProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured) {
      setError('Connect Supabase to access custom quests.');
      return;
    }

    setIsChecking(true);
    setError(null);

    const quest = await getCustomQuest(trimmed);
    setIsChecking(false);

    if (!quest) {
      setError('No quest found with that code. Check the code and try again.');
      return;
    }

    onClose();
    router.push(`/play/custom/${quest.id}`);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-sm mx-4 bg-parchment-dark border-2 border-border-gold/50 rounded-lg shadow-arcane-gold p-6">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-parchment-light/30 hover:text-parchment-light/70 transition-colors text-xl leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2" aria-hidden="true">📋</div>
          <h2 className="font-cinzel text-arcane-gold text-lg font-bold">Notice Board</h2>
          <p className="text-parchment-light/40 text-xs font-inter mt-1">
            Enter the quest code given by your Archmage.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="quest-code"
              className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide"
            >
              Quest Code
            </label>
            <input
              id="quest-code"
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              placeholder="e.g. 3f7a2b1c-..."
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-fira text-parchment-light placeholder:text-parchment-light/20 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
            />
          </div>

          {error && (
            <p role="alert" className="text-arcane-red text-xs font-inter border border-arcane-red/30 bg-arcane-red/5 rounded px-3 py-2">
              {error}
            </p>
          )}

          <MagicalButton
            variant="gold"
            size="md"
            type="submit"
            disabled={isChecking || !code.trim()}
            isLoading={isChecking}
            className="w-full"
          >
            Seek the Quest
          </MagicalButton>
        </form>
      </div>
    </div>
  );
}
