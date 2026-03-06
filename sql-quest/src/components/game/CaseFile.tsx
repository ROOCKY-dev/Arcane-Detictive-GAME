'use client';

import type { Quest } from '@/types/game';
import type { SchemaTable } from '@/data/schemas/types';
import { SchemaViewer } from './SchemaViewer';
import { ParchmentPanel } from '@/components/ui/ParchmentPanel';

interface CaseFileProps {
  quest: Quest;
  npcName: string;
  schema: SchemaTable[];
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-arcane-green border-arcane-green/50',
  intermediate: 'text-arcane-gold border-arcane-gold/50',
  advanced: 'text-arcane-red border-arcane-red/50',
};

export function CaseFile({ quest, npcName, schema }: CaseFileProps) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Case header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-arcane-gold text-xs font-cinzel tracking-widest uppercase">
            Case File
          </span>
          <span
            className={[
              'border rounded px-1.5 py-0.5 text-xs font-cinzel uppercase tracking-wide',
              difficultyColors[quest.difficulty],
            ].join(' ')}
          >
            {quest.difficulty}
          </span>
        </div>
        <h2 className="font-cinzel text-parchment-light text-lg font-bold leading-tight">
          {quest.title}
        </h2>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {quest.sqlConcepts.map((concept) => (
            <span
              key={concept}
              className="bg-arcane-blue/10 border border-arcane-blue/30 text-arcane-blue text-xs font-fira px-1.5 py-0.5 rounded"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      {/* NPC dialogue */}
      <ParchmentPanel>
        <div className="flex items-start gap-2">
          <div className="shrink-0 w-8 h-8 rounded bg-parchment border border-border-gold/40 flex items-center justify-center text-lg">
            🧙
          </div>
          <div>
            <p className="text-arcane-gold text-xs font-cinzel mb-1">{npcName}</p>
            <p className="text-parchment-light/85 text-sm font-inter leading-relaxed italic">
              &ldquo;{quest.npcDialogue}&rdquo;
            </p>
          </div>
        </div>
      </ParchmentPanel>

      {/* Narrative */}
      <div>
        <p className="text-parchment-light/70 text-sm font-inter leading-relaxed">
          {quest.narrative}
        </p>
      </div>

      {/* Schema */}
      <ParchmentPanel title="Available Scrolls (Tables)" titleIcon="📋">
        <SchemaViewer tables={schema} />
      </ParchmentPanel>
    </div>
  );
}
