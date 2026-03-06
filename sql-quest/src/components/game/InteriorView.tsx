'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SQLTerminal } from './SQLTerminal';
import { QueryResults } from './QueryResults';
import { CaseFile } from './CaseFile';
import { HintSystem } from './HintSystem';
import { CaseSolved } from './CaseSolved';
import { NPCDialogue } from './NPCDialogue';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { sfx } from '@/lib/audio';
import { useSQLEngine } from '@/hooks/useSQLEngine';
import { useGameState } from '@/hooks/useGameState';
import { validateResult } from '@/lib/query-validator';
import { getSchemaForLocation, getNextQuest } from '@/lib/game-data';
import { getNPCForLocation } from '@/data/npcs';
import type { Quest } from '@/types/game';

interface InteriorViewProps {
  quest: Quest;
  locationId: string;
}

export function InteriorView({ quest, locationId }: InteriorViewProps) {
  const router = useRouter();
  const { runQuery, reset, result, isLoading } = useSQLEngine(locationId);
  const { completeQuest, useHint: recordHint, getQuestProgress, completedQuestIds } =
    useGameState();

  const [showDialogue, setShowDialogue] = useState(true);
  const [showSolved, setShowSolved] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [timeSeconds, setTimeSeconds] = useState(0);

  const schema = getSchemaForLocation(locationId);
  const npc = getNPCForLocation(locationId);
  const progress = getQuestProgress(quest.id);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleExecute(sql: string) {
    const queryResult = await runQuery(sql);
    if (queryResult.error) {
      sfx.play('misfire');
    } else {
      const validation = validateResult(queryResult, quest.expectedResult, {
        requiresStrictOrder: quest.requiresStrictOrder,
      });
      if (validation.correct) {
        sfx.play('success');
        completeQuest(quest.id, {
          hintsUsed,
          timeSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          lastQuery: sql,
        });
        setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        setShowSolved(true);
      }
    }
  }

  function handleHintUsed() {
    setHintsUsed((h) => h + 1);
    recordHint(quest.id);
  }

  function handleNextCase() {
    setShowSolved(false);
    const nextQuest = getNextQuest(locationId, completedQuestIds);
    if (nextQuest) {
      router.push(`/play/${locationId}/${nextQuest.buildingId}`);
    } else {
      router.push(`/play/${locationId}`);
    }
  }

  async function handleReset() {
    await reset();
  }

  return (
    <div className="min-h-screen bg-parchment-dark text-parchment-light">
      {/* Top bar */}
      <header className="border-b border-border-gold/20 px-4 py-2.5 flex items-center justify-between bg-parchment-dark/90 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <MagicalButton
            variant="gold"
            size="sm"
            onClick={() => router.push(`/play/${locationId}`)}
          >
            ← Back
          </MagicalButton>
          <span className="text-parchment-light/60 text-xs font-inter hidden sm:block">
            {npc.name}&apos;s Case
          </span>
        </div>
        <h1 className="font-cinzel text-arcane-gold text-sm font-bold hidden md:block">
          {quest.title}
        </h1>
        <div className="flex items-center gap-2 text-parchment-light/40 text-xs font-inter">
          <span>{Math.floor(timeSeconds / 60)}:{String(timeSeconds % 60).padStart(2, '0')}</span>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 p-4 max-w-7xl mx-auto">
        {/* Left panel: Case File */}
        <div className="w-full lg:w-[420px] shrink-0">
          <CaseFile quest={quest} npcName={npc.name} schema={schema} />
        </div>

        {/* Right panel: Terminal + Results */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <SQLTerminal
            onExecute={handleExecute}
            onReset={handleReset}
            isLoading={isLoading}
          />

          {/* Hints */}
          <HintSystem hints={quest.hints} onHintUsed={handleHintUsed} />

          {/* Results */}
          <div className="border border-border-gold/20 rounded bg-parchment-dark/60 p-3">
            <div className="text-xs text-parchment-light/40 font-cinzel tracking-wider uppercase mb-2">
              Revelation
            </div>
            <QueryResults result={result} isLoading={isLoading} />

            {/* Validation feedback */}
            {result && !result.error && !showSolved && (
              <ValidationFeedback result={result} quest={quest} />
            )}
          </div>
        </div>
      </div>

      {/* NPC intro dialogue */}
      <NPCDialogue
        npcName={npc.name}
        npcTitle={npc.title}
        dialogue={quest.npcDialogue}
        isOpen={showDialogue && !progress?.completed}
        onDismiss={() => setShowDialogue(false)}
        avatarUrl={npc.portraitPath}
      />

      {/* Case solved overlay */}
      <CaseSolved
        isOpen={showSolved}
        questTitle={quest.title}
        npcName={npc.name}
        successMessage={quest.successMessage}
        timeSeconds={timeSeconds}
        hintsUsed={hintsUsed}
        onNextCase={handleNextCase}
        onBackToMap={() => router.push('/play')}
      />
    </div>
  );
}

function ValidationFeedback({
  result,
  quest,
}: {
  result: { columns: string[]; rows: (string | number | null)[][]; rowCount: number };
  quest: Quest;
}) {
  const validation = validateResult(result, quest.expectedResult, {
    requiresStrictOrder: quest.requiresStrictOrder,
  });
  if (validation.correct) return null;
  if (result.rowCount === 0) return null;

  return (
    <div className="mt-2 border border-arcane-gold/20 bg-arcane-gold/5 rounded p-2">
      <p className="text-arcane-gold/80 text-xs font-inter">{validation.feedback}</p>
    </div>
  );
}
