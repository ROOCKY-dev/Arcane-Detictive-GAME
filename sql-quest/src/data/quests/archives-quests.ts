/**
 * Quests for The Grand Archives — focuses on basic SELECT, WHERE, AND/OR.
 */

import type { Quest } from '@/types/game';

export const ARCHIVES_QUESTS: Quest[] = [
  {
    id: 'archives-q1',
    locationId: 'archives',
    buildingId: 'main-hall',
    title: 'The Missing Grimoire',
    difficulty: 'beginner',
    sqlConcepts: ['SELECT', 'WHERE'],
    order: 1,
    prerequisiteQuestIds: [],
    narrative:
      'Archmage Codex has noticed that the legendary "Grimoire of Eternal Flames" is not on its usual shelf. Before sounding the alarm, he needs you to verify it is actually recorded in the archives at all — and check which other grimoires share Shelf 7.',
    npcDialogue:
      'Welcome, young Inquisitor! A most troubling matter. The Grimoire of Eternal Flames has vanished from Shelf 7. Before we panic, let us simply check if it is listed in our records. Could you cast a revealing spell to show me all grimoires on shelf 7?',
    hints: [
      {
        order: 1,
        text: 'To reveal all entries from a scroll (table), use: SELECT * FROM [table_name]',
      },
      {
        order: 2,
        text: 'You need to filter results for a specific shelf. Add: WHERE shelf_number = 7',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT * FROM grimoires WHERE shelf_number = 7',
      },
    ],
    expectedResult: {
      columns: ['id', 'title', 'author', 'subject', 'pages', 'restricted', 'shelf_number'],
      rows: [
        [5, 'Grimoire of Eternal Flames', 'Pyraxis the Wise', 'Evocation', 450, 1, 7],
        [6, 'Beasts and Where to Bind Them', 'Gruff the Elder', 'Conjuration', 280, 0, 7],
        [8, 'Runes of the Ancient Dwarves', 'Thorin Runemaster', 'Enchantment', 510, 1, 7],
      ],
    },
    sampleSolution: 'SELECT * FROM grimoires WHERE shelf_number = 7;',
    successMessage:
      'Splendid! The grimoire IS in our records — so it has been physically moved, not erased from existence! Your first spell was cast perfectly, Inquisitor. Now, let us check who last borrowed it...',
  },
  {
    id: 'archives-q2',
    locationId: 'archives',
    buildingId: 'main-hall',
    title: 'The Overdue Apprentice',
    difficulty: 'beginner',
    sqlConcepts: ['SELECT', 'WHERE', 'AND'],
    order: 2,
    prerequisiteQuestIds: ['archives-q1'],
    narrative:
      'The Grimoire of Eternal Flames is confirmed in the records. Now Archmage Codex needs to find out who checked it out and never returned it. The grimoire\'s ID is 5. Find the checkout log entries for this book that are still outstanding.',
    npcDialogue:
      'Excellent work! Now that we know the Grimoire of Eternal Flames exists, we must find who checked it out last. The grimoire\'s id is 5. Check the checkout_logs for grimoire_id 5 — and filter for entries that have NOT been returned yet. That is the culprit!',
    hints: [
      {
        order: 1,
        text: 'You need to look at the checkout_logs table. Start with: SELECT * FROM checkout_logs',
      },
      {
        order: 2,
        text: 'Filter by grimoire_id = 5. In SQLite, false is stored as 0, so: WHERE grimoire_id = 5 AND returned = 0',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT * FROM checkout_logs WHERE grimoire_id = 5 AND returned = 0',
      },
    ],
    expectedResult: {
      columns: ['id', 'apprentice_id', 'grimoire_id', 'checkout_date', 'return_date', 'returned'],
      rows: [[1, 1, 5, '2024-01-15', null, 0]],
    },
    sampleSolution: 'SELECT * FROM checkout_logs WHERE grimoire_id = 5 AND returned = 0;',
    successMessage:
      'Apprentice_id 1! That would be Aldric Flamebinder — checked it out on January 15th and never returned it! I shall have a stern word with him immediately. Wonderful work, Inquisitor. You are showing great promise!',
  },
  {
    id: 'archives-q3',
    locationId: 'archives',
    buildingId: 'main-hall',
    title: 'The Restricted Section Breach',
    difficulty: 'beginner',
    sqlConcepts: ['SELECT', 'WHERE', 'AND', 'OR'],
    order: 3,
    prerequisiteQuestIds: ['archives-q2'],
    narrative:
      'With the missing grimoire case solved, a new mystery emerges. Someone has been checking out restricted grimoires WITHOUT authorization. Archmage Codex needs a list of all restricted grimoires that are currently checked out — to see which ones may have left authorized hands.',
    npcDialogue:
      'Most troubling, Inquisitor. I have reason to believe a student may have accessed restricted materials illegally. Can you find all restricted grimoires — those with restricted = 1 — and also show me which ones are currently checked out? Look in both the grimoires table AND the checkout_logs table. First, let us find all restricted grimoires.',
    hints: [
      {
        order: 1,
        text: 'Start by finding restricted grimoires: SELECT * FROM grimoires WHERE restricted = 1',
      },
      {
        order: 2,
        text: 'In the grimoires table, restricted = 1 means it is a restricted tome. Run that query to see all restricted books.',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT id, title, subject FROM grimoires WHERE restricted = 1',
      },
    ],
    expectedResult: {
      columns: ['id', 'title', 'subject'],
      rows: [
        [3, 'The Forbidden Tome of Shadows', 'Necromancy'],
        [5, 'Grimoire of Eternal Flames', 'Evocation'],
        [8, 'Runes of the Ancient Dwarves', 'Enchantment'],
        [10, 'Transmutation: Lead to Gold', 'Transmutation'],
      ],
    },
    sampleSolution: 'SELECT id, title, subject FROM grimoires WHERE restricted = 1;',
    successMessage:
      'Four restricted tomes! And I can already see that grimoire id 3 — The Forbidden Tome of Shadows — has a checkout entry that has not been returned! Necromancy texts in the wrong hands... This investigation has only just begun. You are becoming a true Inquisitor!',
  },
  {
    id: 'archives-q4',
    locationId: 'archives',
    buildingId: 'main-hall',
    title: 'The Mage Guild Enrollment',
    difficulty: 'beginner',
    sqlConcepts: ['SELECT', 'WHERE', 'AND'],
    order: 4,
    prerequisiteQuestIds: ['archives-q2'],
    narrative:
      'The Archmage is compiling a list of current (non-graduated) Mage guild apprentices for an urgent assembly. He needs only those who are still enrolled — not yet graduated.',
    npcDialogue:
      'One more task, while I have your assistance! I need to send an urgent notice to all active Mage guild apprentices. Could you find all apprentices who belong to the Mage guild AND have not yet graduated? The guild administrators are quite impatient.',
    hints: [
      {
        order: 1,
        text: 'You need the apprentices table: SELECT * FROM apprentices',
      },
      {
        order: 2,
        text: "Filter for Mage guild: WHERE guild = 'Mage'. Note that text values need single quotes.",
      },
      {
        order: 3,
        text: "Full incantation: SELECT name, age, enrollment_year FROM apprentices WHERE guild = 'Mage' AND graduated = 0",
      },
    ],
    expectedResult: {
      columns: ['name', 'age', 'enrollment_year'],
      rows: [
        ['Aldric Flamebinder', 19, 2021],
        ['Eldrin Stargazer', 18, 2023],
        ['Jasmine Thornveil', 21, 2020],
      ],
    },
    sampleSolution:
      "SELECT name, age, enrollment_year FROM apprentices WHERE guild = 'Mage' AND graduated = 0;",
    successMessage:
      'Three active Mage apprentices — Aldric, Eldrin, and Jasmine. I shall summon them at once! You have a knack for this, Inquisitor. The Archives are safer with you on the case. I may have a word with the Apothecary Syndicate about needing your particular talents...',
  },
];

export const ARCHIVES_QUEST_MAP = Object.fromEntries(
  ARCHIVES_QUESTS.map((q) => [q.id, q])
);
