/**
 * Achievement definitions for SQL Quest.
 */

import type { Achievement } from '@/types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-incantation',
    title: 'First Incantation',
    description: 'Complete your first quest',
    icon: '✨',
    condition: { type: 'first_quest' },
  },
  {
    id: 'scholars-mark',
    title: "Scholar's Mark",
    description: 'Complete all Grand Archives quests',
    icon: '📚',
    condition: { type: 'complete_location', locationId: 'archives' },
  },
  {
    id: 'alchemists-friend',
    title: "Alchemist's Friend",
    description: 'Complete all Apothecary Syndicate quests',
    icon: '🧪',
    condition: { type: 'complete_location', locationId: 'apothecary' },
  },
  {
    id: 'beast-whisperer',
    title: 'Beast Whisperer',
    description: "Complete all Beastmaster's Outpost quests",
    icon: '🐉',
    condition: { type: 'complete_location', locationId: 'beast' },
  },
  {
    id: 'shadow-walker',
    title: 'Shadow Walker',
    description: 'Complete all Shadow Market quests',
    icon: '🌑',
    condition: { type: 'complete_location', locationId: 'underworld' },
  },
  {
    id: 'speed-caster',
    title: 'Speed Caster',
    description: 'Solve a case in under 60 seconds',
    icon: '⚡',
    condition: { type: 'solve_fast', seconds: 60 },
  },
  {
    id: 'hint-free-archives',
    title: 'Hint-Free Scholar',
    description: 'Complete the Grand Archives with no hints',
    icon: '🛡️',
    condition: { type: 'no_hints_location', locationId: 'archives' },
  },
  {
    id: 'master-inquisitor',
    title: 'Master Inquisitor',
    description: 'Complete all quests across the Realm of Syntaxia',
    icon: '👑',
    condition: { type: 'complete_all_quests' },
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
