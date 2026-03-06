import type { QuestDifficulty } from '@/types/game';

export interface ForgeFormData {
  title: string;
  locationId: string;
  difficulty: QuestDifficulty;
  npcName: string;
  npcDialogue: string;
  narrative: string;
  expectedSql: string;
  hints: [string, string, string];
  requiresStrictOrder: boolean;
  ddlSql: string;
}

export const FORGE_INITIAL: ForgeFormData = {
  title: '',
  locationId: 'archives',
  difficulty: 'beginner',
  npcName: '',
  npcDialogue: '',
  narrative: '',
  expectedSql: '',
  hints: ['', '', ''],
  requiresStrictOrder: false,
  ddlSql: '',
};

export const FORGE_STEPS = [
  { num: 1, label: 'Metadata',    description: 'Name, location, difficulty and NPC' },
  { num: 2, label: 'Narrative',   description: 'The mystery prompt' },
  { num: 3, label: 'Incantation', description: 'Expected SQL solution' },
  { num: 4, label: 'Hints',       description: 'Progressive clues + validation' },
  { num: 5, label: 'Database',    description: 'DDL/DML for the dataset' },
] as const;
