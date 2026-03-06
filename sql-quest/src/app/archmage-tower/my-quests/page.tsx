'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getTeacherQuests, deleteCustomQuest, isSupabaseConfigured } from '@/lib/supabase';
import type { CustomQuestRow } from '@/lib/supabase';
import { MagicalButton } from '@/components/ui/MagicalButton';
import Link from 'next/link';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'text-arcane-green border-arcane-green/40 bg-arcane-green/10',
  intermediate: 'text-arcane-gold border-arcane-gold/40 bg-arcane-gold/10',
  advanced:     'text-arcane-red border-arcane-red/40 bg-arcane-red/10',
};

export default function MyQuestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [quests, setQuests] = useState<CustomQuestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rows = await getTeacherQuests(user.id);
      setQuests(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function handleDelete(questId: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(questId);
    const err = await deleteCustomQuest(questId);
    if (err) {
      setError(err);
    } else {
      setQuests((prev) => prev.filter((q) => q.id !== questId));
    }
    setDeletingId(null);
  }

  async function copyCode(id: string) {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-cinzel text-arcane-gold text-xl font-bold mb-1">My Forged Quests</h2>
          <p className="text-parchment-light/40 text-sm font-inter">
            Share a Quest Code with your apprentices so they can play on the Notice Board.
          </p>
        </div>
        <Link href="/archmage-tower/forge">
          <MagicalButton variant="green" size="sm">⚒️ Forge New Quest</MagicalButton>
        </Link>
      </div>

      {error && (
        <div className="border border-arcane-red/30 bg-arcane-red/5 rounded p-3 text-arcane-red text-sm font-inter">{error}</div>
      )}

      {!isSupabaseConfigured && (
        <div className="border border-arcane-gold/20 bg-arcane-gold/5 rounded p-3 text-arcane-gold/70 text-sm font-inter">
          Supabase is not configured — quests cannot be loaded.
        </div>
      )}

      <div className="border border-border-gold/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-inter">
          <thead>
            <tr className="bg-arcane-gold/10 border-b border-border-gold/20">
              <Th>Title</Th>
              <Th>Location</Th>
              <Th align="center">Difficulty</Th>
              <Th>Quest Code</Th>
              <Th align="right">Created</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              : quests.map((q, idx) => (
                  <tr key={q.id}
                    className={[
                      'border-b border-border-gold/10 transition-colors hover:bg-arcane-gold/5',
                      idx % 2 === 0 ? 'bg-parchment-dark' : 'bg-parchment-dark/60',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-cinzel text-parchment-light text-sm max-w-[200px] truncate" title={q.title}>
                      {q.title}
                    </td>
                    <td className="px-4 py-3 text-parchment-light/60 text-xs capitalize">{q.location_id}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block border rounded px-2 py-0.5 text-xs font-inter capitalize ${DIFFICULTY_COLORS[q.difficulty] ?? 'text-parchment-light/60'}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => copyCode(q.id)}
                        title="Click to copy quest code"
                        className="flex items-center gap-1.5 font-mono text-xs text-arcane-blue/80 hover:text-arcane-blue transition-colors group"
                      >
                        <span className="truncate max-w-[120px]">{q.id.slice(0, 8)}…</span>
                        <span className="text-[10px] opacity-50 group-hover:opacity-100">
                          {copiedId === q.id ? '✓ copied' : '⎘'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-parchment-light/30 text-xs">
                      {new Date(q.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id, q.title)}
                        disabled={deletingId === q.id}
                        className="text-arcane-red/50 hover:text-arcane-red text-xs font-inter transition-colors disabled:opacity-40"
                      >
                        {deletingId === q.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && quests.length === 0 && !error && (
          <div className="text-center py-12 text-parchment-light/30 font-inter text-sm space-y-2">
            <p>No quests forged yet.</p>
            <Link href="/archmage-tower/forge" className="text-arcane-gold/60 hover:text-arcane-gold underline underline-offset-2 text-xs transition-colors">
              Forge your first quest →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return (
    <th className={`px-4 py-2.5 font-cinzel text-arcane-gold/80 text-xs tracking-wider font-semibold text-${align}`}>
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border-gold/10 animate-pulse bg-parchment-dark">
      {[160, 80, 80, 100, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-parchment/10" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}
