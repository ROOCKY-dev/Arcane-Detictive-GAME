/**
 * Quests for The Beastmaster's Outpost — focuses on COUNT, GROUP BY, SUM, HAVING.
 */

import type { Quest } from '@/types/game';

export const BEAST_QUESTS: Quest[] = [
  {
    id: 'beast-q1',
    locationId: 'beast',
    buildingId: 'ranger-station',
    title: 'The Feeding Fiasco',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'COUNT', 'GROUP BY', 'HAVING'],
    order: 1,
    prerequisiteQuestIds: [],
    narrative:
      'Three dragons fell sick overnight and Gruff suspects overfeeding. He needs to see which creatures are being fed more than 3 times in the feeding schedule — the overfed ones are the likely culprits.',
    npcDialogue:
      'Ugh. Paperwork. Three dragons got sick. Overfeeding. Count how many times each creature appears in feeding_schedules, grouped by creature_id. Show me only the ones fed more than 3 times. Hate spreadsheets.',
    hints: [
      {
        order: 1,
        text: 'Use COUNT with GROUP BY: SELECT creature_id, COUNT(*) as feed_count FROM feeding_schedules GROUP BY creature_id',
      },
      {
        order: 2,
        text: 'Filter grouped results with HAVING (not WHERE): HAVING COUNT(*) > 3',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT creature_id, COUNT(*) as feed_count FROM feeding_schedules GROUP BY creature_id HAVING COUNT(*) > 3',
      },
    ],
    expectedResult: {
      columns: ['creature_id', 'feed_count'],
      rows: [
        [1, 4],
        [10, 4],
      ],
    },
    sampleSolution:
      'SELECT creature_id, COUNT(*) as feed_count FROM feeding_schedules GROUP BY creature_id HAVING COUNT(*) > 3;',
    successMessage:
      "Creature 1 — that's Ember the dragon. And creature 10 — Frost. Both fed 4 times when they should only get 2. Hilda's been doubling up their evening feeds. I'll have a word. Good work.",
  },
  {
    id: 'beast-q2',
    locationId: 'beast',
    buildingId: 'ranger-station',
    title: 'The Damage Report',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'SUM', 'GROUP BY', 'ORDER BY'],
    order: 2,
    prerequisiteQuestIds: ['beast-q1'],
    narrative:
      'The kingdom\'s treasury has demanded a full damage report from the outpost. Gruff needs the total gold damage caused by each creature, sorted so the biggest troublemakers are listed first.',
    npcDialogue:
      "Treasury wants a report. Total damage gold per creature from incident_reports. Group by creature_id, sum the damage_gold. Sort it. Most damage first. Don't ask me why they need this. Bureaucrats.",
    hints: [
      {
        order: 1,
        text: 'Sum damage per creature: SELECT creature_id, SUM(damage_gold) as total_damage FROM incident_reports',
      },
      {
        order: 2,
        text: 'Group results: GROUP BY creature_id ORDER BY total_damage DESC',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT creature_id, SUM(damage_gold) as total_damage FROM incident_reports GROUP BY creature_id ORDER BY total_damage DESC',
      },
    ],
    expectedResult: {
      columns: ['creature_id', 'total_damage'],
      rows: [
        [1, 1300],
        [9, 1000],
        [10, 300],
        [7, 200],
        [4, 50],
        [8, 10],
        [2, 0],
        [6, 0],
        [11, 0],
      ],
    },
    sampleSolution:
      'SELECT creature_id, SUM(damage_gold) as total_damage FROM incident_reports GROUP BY creature_id ORDER BY total_damage DESC;',
    successMessage:
      "Ember caused 1,300 gold in damage. Not surprised. Boulder destroyed a bridge — 1,000 gold. The treasury is not going to be happy. This report is going to be... unpleasant to submit. Thanks for the help.",
  },
  {
    id: 'beast-q3',
    locationId: 'beast',
    buildingId: 'ranger-station',
    title: 'The Unresolved Incidents',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'COUNT', 'WHERE', 'GROUP BY'],
    order: 3,
    prerequisiteQuestIds: ['beast-q2'],
    narrative:
      'The outpost inspector is arriving next week. Gruff needs to know how many unresolved incidents exist for each location, so he knows where to send rangers first.',
    npcDialogue:
      'Inspector coming. Need to know unresolved incidents. Count the unresolved ones (resolved = 0) from incident_reports, grouped by location. How many at each location. Do not want surprises.',
    hints: [
      {
        order: 1,
        text: 'Filter for unresolved: SELECT location, COUNT(*) as open_incidents FROM incident_reports WHERE resolved = 0',
      },
      {
        order: 2,
        text: 'Group by location: GROUP BY location',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT location, COUNT(*) as open_incidents FROM incident_reports WHERE resolved = 0 GROUP BY location',
      },
    ],
    expectedResult: {
      columns: ['location', 'open_incidents'],
      rows: [
        ['Castle Airspace', 1],
        ['Meditation Garden', 1],
        ['Outpost Well', 1],
        ['River Crossing', 1],
        ['Town Square', 1],
      ],
    },
    sampleSolution:
      'SELECT location, COUNT(*) as open_incidents FROM incident_reports WHERE resolved = 0 GROUP BY location;',
    successMessage:
      "Five unresolved incidents spread across five locations. At least nothing's on fire right now. That we know of. You've actually been useful today, Inquisitor. Don't tell anyone I said that.",
  },
];

export const BEAST_QUEST_MAP = Object.fromEntries(
  BEAST_QUESTS.map((q) => [q.id, q])
);
