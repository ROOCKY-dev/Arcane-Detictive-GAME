/**
 * Apprentices roster — teacher overview of student progress.
 * Fetches live data from Supabase; falls back to mock data when unconfigured.
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApprenticeRoster, getTeacherClasses, isSupabaseConfigured } from '@/lib/supabase';
import type { ApprenticeRosterRow, ClassRow } from '@/lib/supabase';

const TOTAL_QUESTS = 13; // 4 archives + 3 apothecary + 3 beast + 4 underworld

const TODAY = new Date().toISOString().slice(0, 10);

// ─── Mock fallback (used when Supabase is not configured) ─────────────────────

const MOCK_APPRENTICES: ApprenticeRosterRow[] = [
  { id: '1', username: 'seraphine',  displayName: 'Seraphine Dawnwhisper', avatarUrl: null, questsSolved: 11, totalAttempts: 18, lastActive: '2026-03-05' },
  { id: '2', username: 'tobias',     displayName: 'Tobias Runeforge',      avatarUrl: null, questsSolved: 7,  totalAttempts: 22, lastActive: '2026-03-06' },
  { id: '3', username: 'mira',       displayName: 'Mira of the Tides',     avatarUrl: null, questsSolved: 13, totalAttempts: 14, lastActive: '2026-03-04' },
  { id: '4', username: 'eldon',      displayName: 'Eldon Ashveil',          avatarUrl: null, questsSolved: 4,  totalAttempts: 31, lastActive: '2026-02-28' },
  { id: '5', username: 'lyra',       displayName: 'Lyra Emberbane',         avatarUrl: null, questsSolved: 0,  totalAttempts: 2,  lastActive: '2026-02-20' },
  { id: '6', username: 'corvin',     displayName: 'Corvin Nighthollow',     avatarUrl: null, questsSolved: 13, totalAttempts: 13, lastActive: '2026-03-06' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprenticesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [apprentices, setApprentices] = useState<ApprenticeRosterRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isSupabaseConfigured || !user) {
      setApprentices(MOCK_APPRENTICES);
      setUsingMock(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all([
      getApprenticeRoster(user.id),
      getTeacherClasses(user.id),
    ])
      .then(([rows, cls]) => {
        if (cancelled) return;
        setApprentices(rows);
        setClasses(cls);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load roster.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, authLoading]);

  // NOTE: ApprenticeRosterRow doesn't currently include class_id; filter applies when classes exist
  const filtered = useMemo(() => {
    let list = apprentices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.displayName.toLowerCase().includes(q) || a.username.toLowerCase().includes(q));
    }
    return list;
  }, [apprentices, search]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalEnrolled = filtered.length;
  const avgSolved =
    totalEnrolled > 0
      ? (filtered.reduce((s, a) => s + a.questsSolved, 0) / totalEnrolled).toFixed(1)
      : '0';
  const topScore =
    totalEnrolled > 0 ? Math.max(...filtered.map((a) => a.questsSolved)) : 0;
  const activeToday = filtered.filter(
    (a) => a.lastActive?.slice(0, 10) === TODAY
  ).length;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="font-cinzel text-arcane-gold text-xl font-bold mb-1">My Apprentices</h2>
        <p className="text-parchment-light/40 text-sm font-inter">
          Overview of your class&apos;s progress through the Realm of Syntaxia.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border border-arcane-red/30 bg-arcane-red/5 rounded p-3 text-arcane-red text-sm font-inter">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-1.5 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors w-52"
        />
        {classes.length > 0 && (
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-1.5 text-sm font-inter text-parchment-light focus:outline-none focus:border-arcane-gold/60 transition-colors"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {(search || selectedClass !== 'all') && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedClass('all'); }}
            className="text-parchment-light/40 hover:text-parchment-light/70 text-xs font-inter transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Enrolled"        value={String(totalEnrolled)}          icon="👥" />
            <StatCard label="Avg. Cases Solved" value={`${avgSolved} / ${TOTAL_QUESTS}`} icon="⚗️" />
            <StatCard label="Top Score"        value={`${topScore} / ${TOTAL_QUESTS}`} icon="🏆" />
            <StatCard label="Active Today"     value={String(activeToday)}             icon="🔮" />
          </>
        )}
      </div>

      {/* Roster table */}
      <div className="border border-border-gold/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-inter">
          <thead>
            <tr className="bg-arcane-gold/10 border-b border-border-gold/20">
              <Th>Apprentice Name</Th>
              <Th align="center">Quests Solved</Th>
              <Th align="center">Total Attempts</Th>
              <Th align="center">Efficiency</Th>
              <Th align="right">Last Active</Th>
              <Th align="right">Detail</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} idx={i} />)
              : filtered.map((apprentice, idx) => (
                  <ApprenticeRow key={apprentice.id} apprentice={apprentice} idx={idx} />
                ))}
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && !error && (
          <div className="text-center py-12 text-parchment-light/30 font-inter text-sm">
            No apprentices enrolled yet. Share your class invite code to get started.
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-parchment-light/20 text-xs font-inter italic">
        {usingMock
          ? '* Showing demo data. Configure Supabase to display live class progress.'
          : `Last refreshed at ${new Date().toLocaleTimeString()}.`}
      </p>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ApprenticeRow({ apprentice, idx }: { apprentice: ApprenticeRosterRow; idx: number }) {
  const efficiency =
    apprentice.totalAttempts > 0
      ? Math.round((apprentice.questsSolved / apprentice.totalAttempts) * 100)
      : 0;
  const isComplete = apprentice.questsSolved >= TOTAL_QUESTS;

  return (
    <tr
      className={[
        'border-b border-border-gold/10 transition-colors',
        idx % 2 === 0 ? 'bg-parchment-dark' : 'bg-parchment-dark/60',
        'hover:bg-arcane-gold/5',
      ].join(' ')}
    >
      <td className="px-4 py-3 font-cinzel text-parchment-light text-sm">
        <span className="flex items-center gap-2">
          {isComplete && <span title="All quests complete" aria-label="Complete">⭐</span>}
          {apprentice.displayName}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <ProgressPill solved={apprentice.questsSolved} total={TOTAL_QUESTS} />
      </td>
      <td className="px-4 py-3 text-center text-parchment-light/70">
        {apprentice.totalAttempts}
      </td>
      <td className="px-4 py-3 text-center">
        <EfficiencyBadge pct={efficiency} />
      </td>
      <td className="px-4 py-3 text-right text-parchment-light/40 text-xs">
        {apprentice.lastActive ? formatDate(apprentice.lastActive) : 'Never'}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/archmage-tower/apprentices/${apprentice.id}`}
          className="text-arcane-blue/60 hover:text-arcane-blue text-xs font-inter underline underline-offset-2 transition-colors"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="border border-border-gold/20 rounded-lg p-4 bg-parchment-dark animate-pulse space-y-2">
      <div className="h-6 w-6 rounded bg-parchment/10" />
      <div className="h-5 w-16 rounded bg-parchment/10" />
      <div className="h-3 w-20 rounded bg-parchment/10" />
    </div>
  );
}

function RowSkeleton({ idx }: { idx: number }) {
  return (
    <tr
      className={[
        'border-b border-border-gold/10 animate-pulse',
        idx % 2 === 0 ? 'bg-parchment-dark' : 'bg-parchment-dark/60',
      ].join(' ')}
    >
      {[160, 60, 60, 60, 80, 40].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded bg-parchment/10 mx-auto"
            style={{ width: w, maxWidth: '100%' }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="border border-border-gold/20 rounded-lg p-4 bg-parchment-dark">
      <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
      <div className="font-cinzel text-arcane-gold text-lg font-bold leading-none">{value}</div>
      <div className="text-parchment-light/40 text-xs font-inter mt-1">{label}</div>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  return (
    <th
      className={[
        'px-4 py-2.5 font-cinzel text-arcane-gold/80 text-xs tracking-wider font-semibold',
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function ProgressPill({ solved, total }: { solved: number; total: number }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const color =
    pct === 100
      ? 'text-arcane-green'
      : pct >= 60
      ? 'text-arcane-gold'
      : 'text-parchment-light/60';
  return (
    <span className={`font-cinzel font-semibold text-sm ${color}`}>
      {solved}/{total}
    </span>
  );
}

function EfficiencyBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80
      ? 'border-arcane-green/40 text-arcane-green bg-arcane-green/10'
      : pct >= 50
      ? 'border-arcane-gold/40 text-arcane-gold bg-arcane-gold/10'
      : 'border-arcane-red/30 text-arcane-red/80 bg-arcane-red/5';
  return (
    <span className={`inline-block border rounded px-2 py-0.5 text-xs font-inter ${color}`}>
      {pct}%
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
