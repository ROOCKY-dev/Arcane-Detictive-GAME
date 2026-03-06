/**
 * Quests for The Shadow Market — focuses on multi-JOIN, subqueries, LIKE, IN.
 */

import type { Quest } from '@/types/game';

export const UNDERWORLD_QUESTS: Quest[] = [
  {
    id: 'underworld-q1',
    locationId: 'underworld',
    buildingId: 'black-exchange',
    title: 'The High-Value Suspects',
    difficulty: 'advanced',
    sqlConcepts: ['SELECT', 'JOIN', 'WHERE', 'ORDER BY'],
    order: 1,
    prerequisiteQuestIds: [],
    narrative:
      'The Royal Guard has asked you to identify who has been selling high-value artifacts (worth over 1000 gold). They need the seller\'s alias name linked to the artifact\'s name — the raw IDs are useless to them.',
    npcDialogue:
      'Ah... a new face in the shadows. Seeking names, are we? The scrolls here hold many secrets. Find me the alias names of those who sold artifacts worth over 1,000 gold. You will need to... bind... two tables together. The smuggled_artifacts scroll, and the aliases registry. If they exist in it, of course...',
    hints: [
      {
        order: 1,
        text: 'Join smuggled_artifacts with aliases: SELECT aliases.alias, smuggled_artifacts.item_name FROM smuggled_artifacts JOIN aliases ON smuggled_artifacts.seller_alias_id = aliases.id',
      },
      {
        order: 2,
        text: 'Filter for high value: WHERE smuggled_artifacts.estimated_value_gold > 1000',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT aliases.alias, smuggled_artifacts.item_name, smuggled_artifacts.estimated_value_gold FROM smuggled_artifacts JOIN aliases ON smuggled_artifacts.seller_alias_id = aliases.id WHERE smuggled_artifacts.estimated_value_gold > 1000 ORDER BY smuggled_artifacts.estimated_value_gold DESC',
      },
    ],
    expectedResult: {
      columns: ['alias', 'item_name', 'estimated_value_gold'],
      rows: [
        ['The Fence', 'Ancient Scroll of Power', 1200],
        ['The Hammer', 'Mithril Ingot', 1500],
        ['The Raven', 'Crown of the Lost King', 5000],
        ['Venom', 'Potion of Eternal Youth', 2000],
      ],
    },
    sampleSolution: `SELECT aliases.alias, smuggled_artifacts.item_name, smuggled_artifacts.estimated_value_gold
FROM smuggled_artifacts
JOIN aliases ON smuggled_artifacts.seller_alias_id = aliases.id
WHERE smuggled_artifacts.estimated_value_gold > 1000
ORDER BY smuggled_artifacts.estimated_value_gold DESC;`,
    successMessage:
      'Four names rise from the ledger. The Raven sold a crown worth 5,000 gold... how interesting. Notice, however, that some of the highest-value transactions have no alias in our registry at all. A seller who does not exist in our records... fascinating, is it not?',
  },
  {
    id: 'underworld-q2',
    locationId: 'underworld',
    buildingId: 'black-exchange',
    title: 'The Phantom Fence',
    difficulty: 'advanced',
    sqlConcepts: ['SELECT', 'DISTINCT', 'WHERE', 'NOT IN', 'Subquery'],
    order: 2,
    prerequisiteQuestIds: ['underworld-q1'],
    narrative:
      'Someone has been selling extremely valuable artifacts — but their alias_id does not appear in the aliases registry. This "phantom fence" is invisible to the system. Find them.',
    npcDialogue:
      'Looking for a ghost, Inquisitor? How delightfully fitting for the Shadow Market. Someone sold artifacts worth more than 500 gold each... but their seller_alias_id does not exist in our aliases registry. Find the alias_id of the seller who does not exist in our system. A null in the shadows, you might say...',
    hints: [
      {
        order: 1,
        text: 'You need sellers from smuggled_artifacts whose ID is NOT in the aliases table.',
      },
      {
        order: 2,
        text: 'Use NOT IN with a subquery: WHERE seller_alias_id NOT IN (SELECT id FROM aliases)',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT DISTINCT seller_alias_id FROM smuggled_artifacts WHERE estimated_value_gold > 500 AND seller_alias_id NOT IN (SELECT id FROM aliases)',
      },
    ],
    expectedResult: {
      columns: ['seller_alias_id'],
      rows: [[99]],
    },
    sampleSolution: `SELECT DISTINCT seller_alias_id
FROM smuggled_artifacts
WHERE estimated_value_gold > 500
AND seller_alias_id NOT IN (SELECT id FROM aliases);`,
    successMessage:
      'Alias_id 99... a number that references nothing. A seller who has moved three artifacts totaling over 13,000 gold and left no trace in our records. Someone has deliberately kept them out of the registry. This goes deeper than simple smuggling. Be careful, Inquisitor.',
  },
  {
    id: 'underworld-q3',
    locationId: 'underworld',
    buildingId: 'black-exchange',
    title: 'The Wanted Roster',
    difficulty: 'advanced',
    sqlConcepts: ['SELECT', 'JOIN', 'WHERE', 'LIKE', 'IN'],
    order: 3,
    prerequisiteQuestIds: ['underworld-q2'],
    narrative:
      'The Royal Guard needs a full dossier: all active bounties where the target is a known guild member, and where the crime mentions "theft" or "smuggling". Link the bounty records to the alias registry.',
    npcDialogue:
      'The guards are getting bolder, it seems. They want a full roster of active bounties against guild members for theft-related crimes. Join the bounties with the aliases table. Filter for status Active, and use LIKE to find crimes that mention Theft or Smuggling. The IN operator might serve you well for the guild filter...',
    hints: [
      {
        order: 1,
        text: "Join bounties with aliases: SELECT aliases.alias, aliases.known_guild, bounties.crime, bounties.reward_gold FROM bounties JOIN aliases ON bounties.target_alias_id = aliases.id WHERE bounties.status = 'Active'",
      },
      {
        order: 2,
        text: "Add crime filter using LIKE: AND (bounties.crime LIKE '%Theft%' OR bounties.crime LIKE '%Smuggling%')",
      },
      {
        order: 3,
        text: "Full incantation: SELECT aliases.alias, aliases.known_guild, bounties.crime, bounties.reward_gold FROM bounties JOIN aliases ON bounties.target_alias_id = aliases.id WHERE bounties.status = 'Active' AND (bounties.crime LIKE '%Theft%' OR bounties.crime LIKE '%Smuggling%')",
      },
    ],
    expectedResult: {
      columns: ['alias', 'known_guild', 'crime', 'reward_gold'],
      rows: [
        ['The Raven', 'Thieves Guild', 'Grand Theft: Crown Jewels', 2000],
        ['The Raven', 'Thieves Guild', 'Fencing Stolen Goods', 1500],
        ['The Hammer', 'Smugglers Ring', 'Smuggling Contraband', 1000],
      ],
    },
    sampleSolution: `SELECT aliases.alias, aliases.known_guild, bounties.crime, bounties.reward_gold
FROM bounties
JOIN aliases ON bounties.target_alias_id = aliases.id
WHERE bounties.status = 'Active'
AND (bounties.crime LIKE '%Theft%' OR bounties.crime LIKE '%Smuggling%');`,
    successMessage:
      'The Raven — two active bounties totaling 3,500 gold. No wonder they\'re so eager to remain unregistered. And The Hammer of the Smugglers Ring. You have served the Crown well today, Inquisitor... though I wonder if you have noticed that the Crown\'s own Intelligence has a bounty posted in this ledger too. Curious, is it not?',
  },
  {
    id: 'underworld-q4',
    locationId: 'underworld',
    buildingId: 'black-exchange',
    title: 'The Identity Web',
    difficulty: 'advanced',
    sqlConcepts: ['SELECT', 'JOIN', 'Subquery', 'WHERE', 'IN'],
    order: 4,
    prerequisiteQuestIds: ['underworld-q3'],
    narrative:
      'Final case: identify all aliases who appear in BOTH the bounties list AND as a buyer of stolen artifacts. These individuals are both wanted AND actively acquiring contraband — the most dangerous targets.',
    npcDialogue:
      'You have come far, Inquisitor. One final revelation awaits. Find me every alias who has an active bounty AND who appears as a buyer in the smuggled_artifacts registry. These are the truly dangerous ones — criminal enough to be hunted, yet bold enough to keep buying. Use your subquery skills. The answer... may surprise you.',
    hints: [
      {
        order: 1,
        text: 'First find all buyer alias IDs: SELECT DISTINCT buyer_alias_id FROM smuggled_artifacts',
      },
      {
        order: 2,
        text: "Use that as a subquery: SELECT aliases.alias FROM aliases JOIN bounties ON aliases.id = bounties.target_alias_id WHERE bounties.status = 'Active' AND aliases.id IN (SELECT DISTINCT buyer_alias_id FROM smuggled_artifacts)",
      },
      {
        order: 3,
        text: "Full incantation: SELECT DISTINCT aliases.alias, aliases.danger_rating FROM aliases JOIN bounties ON aliases.id = bounties.target_alias_id WHERE bounties.status = 'Active' AND aliases.id IN (SELECT DISTINCT buyer_alias_id FROM smuggled_artifacts) ORDER BY aliases.danger_rating DESC",
      },
    ],
    expectedResult: {
      columns: ['alias', 'danger_rating'],
      rows: [
        ['Ghost', 10],
        ['The Raven', 7],
        ['Quickfingers', 3],
        ['The Collector', 4],
      ],
    },
    sampleSolution: `SELECT DISTINCT aliases.alias, aliases.danger_rating
FROM aliases
JOIN bounties ON aliases.id = bounties.target_alias_id
WHERE bounties.status = 'Active'
AND aliases.id IN (SELECT DISTINCT buyer_alias_id FROM smuggled_artifacts)
ORDER BY aliases.danger_rating DESC;`,
    successMessage:
      'Ghost. Danger rating 10. Wanted for multiple crimes. And still buying... that is not recklessness, Inquisitor. That is power. You have solved every case the Shadow Market had to offer. The Realm of Syntaxia is safer for your work here. Or perhaps... the data only reveals what it is allowed to reveal. Think on that.',
  },
];

export const UNDERWORLD_QUEST_MAP = Object.fromEntries(
  UNDERWORLD_QUESTS.map((q) => [q.id, q])
);
