'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentDetail } from '@/lib/supabase';
import type { StudentDetail } from '@/lib/supabase';
import { getQuestsForLocation } from '@/lib/game-data';
import { MagicalButton } from '@/components/ui/MagicalButton';

const TOTAL_QUESTS = 13;

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = typeof params.studentId === 'string' ? params.studentId : '';

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    getStudentDetail(studentId)
      .then((data) => {
        if (!data) setError('Student not found.');
        else setStudent(data);
      })
      .catch(() => setError('Failed to load student data.'))
      .finally(() => setIsLoading(false));
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <span className="animate-spin text-2xl" aria-hidden="true">✨</span>
        <span className="text-parchment-light/50 font-inter text-sm">Loading apprentice record...</span>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <p className="text-arcane-red font-inter text-sm">{error ?? 'Unknown error.'}</p>
        <MagicalButton variant="gold" size="sm" onClick={() => router.back()}>← Back</MagicalButton>
      </div>
    );
  }

  const completedIds = new Set(student.progress.filter((p) => p.completed).map((p) => p.quest_id));
  const totalAttempts = student.progress.reduce((s, p) => s + p.attempts, 0);
  const avgHints =
    completedIds.size > 0
      ? (student.progress.filter((p) => p.completed).reduce((s, p) => s + p.hints_used, 0) / completedIds.size).toFixed(1)
      : '—';

  const LOCATION_IDS = ['archives', 'apothecary', 'beast', 'underworld'];
  const allLocations = LOCATION_IDS.map((id) => [id, getQuestsForLocation(id)] as [string, { id: string; title: string }[]]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/archmage-tower/apprentices">
        <button type="button" className="text-parchment-light/40 hover:text-parchment-light/70 text-xs font-inter transition-colors flex items-center gap-1">
          ← All Apprentices
        </button>
      </Link>

      {/* Identity */}
      <div className="border border-border-gold/20 rounded-lg p-5 bg-parchment-dark flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-arcane-gold/50 bg-parchment-dark flex items-center justify-center text-2xl shrink-0">
          {student.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.avatarUrl} alt={student.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span aria-hidden="true">⚔️</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cinzel text-arcane-gold font-bold text-lg truncate">{student.displayName}</p>
          <p className="text-parchment-light/40 text-xs font-inter truncate">@{student.username}</p>
          <p className="text-parchment-light/25 text-xs font-inter mt-0.5">
            Joined {new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
          <Stat value={`${completedIds.size}/${TOTAL_QUESTS}`} label="Solved" />
          <Stat value={String(totalAttempts)} label="Attempts" />
          <Stat value={avgHints} label="Hints/Quest" />
        </div>
      </div>

      {/* Progress by location */}
      {allLocations.map(([locationId, quests]) => {
        const locationSolved = quests.filter((q) => completedIds.has(q.id)).length;
        return (
          <div key={locationId} className="border border-border-gold/20 rounded-lg overflow-hidden bg-parchment-dark">
            <div className="bg-arcane-gold/10 border-b border-border-gold/20 px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-cinzel text-arcane-gold text-sm font-bold capitalize">
                {locationId.replace(/-/g, ' ')}
              </h3>
              <span className="text-parchment-light/40 text-xs font-inter">
                {locationSolved}/{quests.length} solved
              </span>
            </div>
            <div className="divide-y divide-border-gold/10">
              {quests.map((quest) => {
                const row = student.progress.find((p) => p.quest_id === quest.id);
                const done = completedIds.has(quest.id);
                return (
                  <div key={quest.id} className="px-4 py-3 flex items-center gap-3 hover:bg-arcane-gold/5 transition-colors">
                    <span className="text-base shrink-0" aria-hidden="true">
                      {done ? '✅' : row ? '🔄' : '⬜'}
                    </span>
                    <span className={`font-inter text-sm flex-1 ${done ? 'text-parchment-light' : 'text-parchment-light/50'}`}>
                      {quest.title}
                    </span>
                    {row && (
                      <div className="flex items-center gap-4 text-xs font-inter text-parchment-light/40 shrink-0">
                        {row.attempts > 0 && <span>{row.attempts} attempt{row.attempts !== 1 ? 's' : ''}</span>}
                        {row.hints_used > 0 && <span>{row.hints_used} hint{row.hints_used !== 1 ? 's' : ''}</span>}
                        {row.time_seconds && <span>{formatTime(row.time_seconds)}</span>}
                        {row.completed_at && (
                          <span className="text-arcane-green/60">
                            {new Date(row.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-cinzel text-arcane-gold text-lg font-bold leading-none">{value}</p>
      <p className="text-parchment-light/40 text-[10px] font-inter mt-0.5">{label}</p>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s > 0 ? ` ${s}s` : ''}`;
}
