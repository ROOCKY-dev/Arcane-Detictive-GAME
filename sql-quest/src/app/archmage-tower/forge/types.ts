import type { QuestDifficulty } from '@/types/game';

export interface ForgeFormData {
  title: string;
  locationId: string;
  difficulty: QuestDifficulty;
  narrative: string;
  expectedSql: string;
  requiresStrictOrder: boolean;
  ddlSql: string;
}

export const FORGE_INITIAL: ForgeFormData = {
  title: '',
  locationId: 'archives',
  difficulty: 'beginner',
  narrative: '',
  expectedSql: '',
  requiresStrictOrder: false,
  ddlSql: '',
};

export const FORGE_STEPS = [
  { num: 1, label: 'Metadata',    description: 'Name, location, and difficulty' },
  { num: 2, label: 'Narrative',   description: 'The mystery and clues' },
  { num: 3, label: 'Incantation', description: 'Expected SQL solution' },
  { num: 4, label: 'Validation',  description: 'Answer rules' },
  { num: 5, label: 'Database',    description: 'DDL/DML for the dataset' },
] as const;
