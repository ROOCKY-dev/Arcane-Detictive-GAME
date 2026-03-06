'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SQLTerminal } from '@/components/game/SQLTerminal';
import { QueryResults } from '@/components/game/QueryResults';
import { CaseFile } from '@/components/game/CaseFile';
import { HintSystem } from '@/components/game/HintSystem';
import { CaseSolved } from '@/components/game/CaseSolved';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { sfx } from '@/lib/audio';
import { useCustomSQLEngine } from '@/hooks/useCustomSQLEngine';
import { validateResult } from '@/lib/query-validator';
import { syncQuestProgressToCloud } from '@/lib/supabase';
import { useGameState } from '@/hooks/useGameState';
import type { CustomQuestRow } from '@/lib/supabase';
import type { Quest } from '@/types/game';

interface CustomInteriorViewProps {
  quest: CustomQuestRow;
}

/** Build a synthetic Quest object from a custom quest DB row for component reuse. */
function toQuest(row: CustomQuestRow, expectedResult: { columns: string[]; rows: (string | number | null)[][] } | null): Quest {
  return {
    id: row.id,
    locationId: row.location_id,
    buildingId: 'custom',
    title: row.title,
    difficulty: row.difficulty as Quest['difficulty'],
    sqlConcepts: [],
    narrative: row.narrative,
    npcDialogue: row.narrative,
    hints: [],
    expectedResult: expectedResult ?? { columns: [], rows: [] },
    sampleSolution: row.expected_sql,
    successMessage: 'Outstanding work, Apprentice! The Archmage\'s mystery is solved.',
    prerequisiteQuestIds: [],
    order: 0,
    requiresStrictOrder: row.requires_strict_order,
  };
}

export function CustomInteriorView({ quest }: CustomInteriorViewProps) {
  const router = useRouter();
  const { cloudSyncUserId } = useGameState();
  const { runQuery, reset, result, isLoading, isDbLoading, dbError, expectedResult } =
    useCustomSQLEngine(quest.id, quest.database_url ?? '', quest.expected_sql);

  const [showSolved, setShowSolved] = useState(false);
  const [hintsUsed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [attemptsRef] = useState({ count: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syntheticQuest = toQuest(quest, expectedResult);

  async function handleExecute(sql: string) {
    attemptsRef.count += 1;
    const queryResult = await runQuery(sql);
    if (queryResult.error) {
      sfx.play('misfire');
    } else if (expectedResult) {
      const validation = validateResult(queryResult, syntheticQuest.expectedResult, {
        requiresStrictOrder: quest.requires_strict_order,
      });
      if (validation.correct) {
        sfx.play('success');
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeSeconds(elapsed);
        setShowSolved(true);
        // Sync to Supabase if authenticated
        if (cloudSyncUserId) {
          void syncQuestProgressToCloud(cloudSyncUserId, {
            questId: quest.id,
            locationId: `custom-${quest.location_id}`,
            completed: true,
            hintsUsed: 0,
            attempts: attemptsRef.count,
            timeSeconds: elapsed,
            lastQuery: sql,
            completedAt: Date.now(),
          });
        }
      }
    }
  }

  if (!quest.database_url) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <p className="text-arcane-red font-inter text-sm">This quest has no compiled database yet.</p>
      </div>
    );
  }

  if (isDbLoading) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center gap-3">
        <span className="animate-spin text-2xl" aria-hidden="true">✨</span>
        <p className="text-parchment-light/50 font-inter text-sm">Loading custom database...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center flex-col gap-3 p-8">
        <p className="text-arcane-red font-inter text-sm text-center">{dbError}</p>
        <MagicalButton variant="gold" size="sm" onClick={() => router.push('/play')}>← Back to Map</MagicalButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-dark text-parchment-light">
      <header className="border-b border-border-gold/20 px-4 py-2.5 flex items-center justify-between bg-parchment-dark/90 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <MagicalButton variant="gold" size="sm" onClick={() => router.push('/play')}>← Back</MagicalButton>
          <span className="text-parchment-light/40 text-xs font-inter hidden sm:block">Custom Assignment</span>
        </div>
        <h1 className="font-cinzel text-arcane-gold text-sm font-bold hidden md:block">{quest.title}</h1>
        <span className="text-parchment-light/40 text-xs font-inter">
          {Math.floor(timeSeconds / 60)}:{String(timeSeconds % 60).padStart(2, '0')}
        </span>
      </header>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 p-4 max-w-7xl mx-auto">
        <div className="w-full lg:w-[420px] shrink-0">
          <CaseFile quest={syntheticQuest} npcName="Archmage Assignment" schema={[]} />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <SQLTerminal onExecute={handleExecute} onReset={reset} isLoading={isLoading} />
          <HintSystem hints={[]} />
          <div className="border border-border-gold/20 rounded bg-parchment-dark/60 p-3">
            <div className="text-xs text-parchment-light/40 font-cinzel tracking-wider uppercase mb-2">Revelation</div>
            <QueryResults result={result} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <CaseSolved
        isOpen={showSolved}
        questTitle={quest.title}
        npcName="Archmage"
        successMessage="Outstanding work, Apprentice! The Archmage's mystery is solved."
        timeSeconds={timeSeconds}
        hintsUsed={hintsUsed}
        onNextCase={() => router.push('/play')}
        onBackToMap={() => router.push('/play')}
      />
    </div>
  );
}
