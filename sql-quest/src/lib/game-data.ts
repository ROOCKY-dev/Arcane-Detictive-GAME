/**
 * Central game data registry — combines all quests, schemas, and lookups.
 */

import { ARCHIVES_QUESTS } from '@/data/quests/archives-quests';
import { APOTHECARY_QUESTS } from '@/data/quests/apothecary-quests';
import { BEAST_QUESTS } from '@/data/quests/beast-quests';
import { UNDERWORLD_QUESTS } from '@/data/quests/underworld-quests';
import { ARCHIVES_SCHEMA } from '@/data/schemas/archives-schema';
import { APOTHECARY_SCHEMA } from '@/data/schemas/apothecary-schema';
import { BEAST_SCHEMA } from '@/data/schemas/beast-schema';
import { UNDERWORLD_SCHEMA } from '@/data/schemas/underworld-schema';
import type { Quest } from '@/types/game';
import type { SchemaTable } from '@/data/schemas/types';

export const ALL_QUESTS: Quest[] = [
  ...ARCHIVES_QUESTS,
  ...APOTHECARY_QUESTS,
  ...BEAST_QUESTS,
  ...UNDERWORLD_QUESTS,
];

const QUEST_MAP = new Map(ALL_QUESTS.map((q) => [q.id, q]));

const SCHEMA_MAP: Record<string, SchemaTable[]> = {
  archives: ARCHIVES_SCHEMA,
  apothecary: APOTHECARY_SCHEMA,
  beast: BEAST_SCHEMA,
  underworld: UNDERWORLD_SCHEMA,
};

/** Get a quest by ID — throws if not found */
export function getQuest(questId: string): Quest {
  const quest = QUEST_MAP.get(questId);
  if (!quest) throw new Error(`Unknown quest: ${questId}`);
  return quest;
}

/** Get all quests for a specific location */
export function getQuestsForLocation(locationId: string): Quest[] {
  return ALL_QUESTS.filter((q) => q.locationId === locationId).sort(
    (a, b) => a.order - b.order
  );
}

/** Get the database schema for a location */
export function getSchemaForLocation(locationId: string): SchemaTable[] {
  return SCHEMA_MAP[locationId] ?? [];
}

/** Get the first available (unlocked) quest for a location given completed quest IDs */
export function getNextQuest(
  locationId: string,
  completedQuestIds: string[]
): Quest | null {
  const quests = getQuestsForLocation(locationId);
  for (const quest of quests) {
    const prerequisitesMet = quest.prerequisiteQuestIds.every((id) =>
      completedQuestIds.includes(id)
    );
    const notYetCompleted = !completedQuestIds.includes(quest.id);
    if (prerequisitesMet && notYetCompleted) {
      return quest;
    }
  }
  return null;
}
