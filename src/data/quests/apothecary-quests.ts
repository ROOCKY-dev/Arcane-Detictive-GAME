/**
 * Quests for The Apothecary Syndicate — focuses on ORDER BY, LIMIT, JOIN.
 */

import type { Quest } from '@/types/game';

export const APOTHECARY_QUESTS: Quest[] = [
  {
    id: 'apothecary-q1',
    locationId: 'apothecary',
    buildingId: 'potion-shop',
    title: 'The Counterfeit Customer',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'JOIN', 'WHERE', 'ORDER BY', 'LIMIT'],
    order: 1,
    prerequisiteQuestIds: [],
    narrative:
      'Elara is in a panic. Someone bought all the Mandrake Root Elixirs and paid with counterfeit gold! She needs to find who made the biggest purchase of that potion so she can report them to the city guard. The biggest spender is probably the thief.',
    npcDialogue:
      'Inquisitor! Disaster! Someone bought ALL my Mandrake Root Elixirs yesterday and paid with counterfeit gold! I need you to find their name! Check who bought potions from sales_receipts — you\'ll need to join with potions_inventory to filter by potion name — oh, and sort by the biggest purchase first, the thief surely bought the most! Then just give me the top 1!',
    hints: [
      {
        order: 1,
        text: 'You need data from two tables. Start with: SELECT customer_name, total_price FROM sales_receipts',
      },
      {
        order: 2,
        text: "Join with potions_inventory: JOIN potions_inventory ON sales_receipts.potion_id = potions_inventory.id WHERE potions_inventory.name = 'Mandrake Root Elixir'",
      },
      {
        order: 3,
        text: "Full incantation: SELECT customer_name, total_price FROM sales_receipts JOIN potions_inventory ON sales_receipts.potion_id = potions_inventory.id WHERE potions_inventory.name = 'Mandrake Root Elixir' ORDER BY total_price DESC LIMIT 1",
      },
    ],
    expectedResult: {
      columns: ['customer_name', 'total_price'],
      rows: [['Mysterious Stranger', 1500]],
    },
    sampleSolution: `SELECT customer_name, total_price
FROM sales_receipts
JOIN potions_inventory ON sales_receipts.potion_id = potions_inventory.id
WHERE potions_inventory.name = 'Mandrake Root Elixir'
ORDER BY total_price DESC
LIMIT 1;`,
    successMessage:
      "Mysterious Stranger! That's who! They spent 1500 gold — all counterfeit! Oh, I knew something was wrong, they were wearing a very suspicious cloak! Thank you Inquisitor, I'm reporting this to the guard immediately! You're brilliant, absolutely brilliant!",
  },
  {
    id: 'apothecary-q2',
    locationId: 'apothecary',
    buildingId: 'potion-shop',
    title: 'The Expired Inventory',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'WHERE', 'ORDER BY'],
    order: 2,
    prerequisiteQuestIds: ['apothecary-q1'],
    narrative:
      'Elara realizes she\'s been too busy to check expiry dates. She needs a list of all potions with fewer than 5 units in stock, sorted from lowest stock to highest — so she can prioritize restocking.',
    npcDialogue:
      'Oh no, oh no, oh no! I just checked my shelves and half my stock is dangerously low! Could you look at the potions_inventory table and find everything with quantity_in_stock less than 5? And sort it from lowest to highest stock so I know what to brew first? I\'m running out of everything!',
    hints: [
      {
        order: 1,
        text: 'Query the potions_inventory table: SELECT name, quantity_in_stock FROM potions_inventory',
      },
      {
        order: 2,
        text: 'Filter for low stock: WHERE quantity_in_stock < 5',
      },
      {
        order: 3,
        text: 'Full incantation: SELECT name, quantity_in_stock FROM potions_inventory WHERE quantity_in_stock < 5 ORDER BY quantity_in_stock ASC',
      },
    ],
    expectedResult: {
      columns: ['name', 'quantity_in_stock'],
      rows: [
        ['Mandrake Root Elixir', 0],
        ['Liquid Luck', 1],
        ['Love Potion No. 9', 3],
        ['Firebreath Tonic', 5],
      ],
    },
    sampleSolution:
      'SELECT name, quantity_in_stock FROM potions_inventory WHERE quantity_in_stock < 5 ORDER BY quantity_in_stock ASC;',
    successMessage:
      'Four potions running critically low! Mandrake Root Elixir is completely gone — of course it is, thanks to that Mysterious Stranger! Liquid Luck has only 1 left! I need to brew immediately! Thank you so much, I would have been ruined without you!',
  },
  {
    id: 'apothecary-q3',
    locationId: 'apothecary',
    buildingId: 'potion-shop',
    title: 'The Legendary Suppliers',
    difficulty: 'intermediate',
    sqlConcepts: ['SELECT', 'WHERE', 'ORDER BY'],
    order: 3,
    prerequisiteQuestIds: ['apothecary-q2'],
    narrative:
      'Elara needs to budget for restocking. She wants to see all her legendary-rarity ingredients sorted by cost, most expensive first, so she can plan which ones she can afford to reorder.',
    npcDialogue:
      'Now I need to plan my restock budget! Could you look in the ingredients table and find all the Legendary rarity ingredients? Sort them by cost_per_unit from most expensive to cheapest — I need to know where to scrimp and where to splurge! My suppliers are going to rob me blind!',
    hints: [
      {
        order: 1,
        text: "Query the ingredients table: SELECT name, cost_per_unit, supplier FROM ingredients WHERE rarity = 'Legendary'",
      },
      {
        order: 2,
        text: 'Sort descending: ORDER BY cost_per_unit DESC',
      },
      {
        order: 3,
        text: "Full incantation: SELECT name, cost_per_unit, supplier FROM ingredients WHERE rarity = 'Legendary' ORDER BY cost_per_unit DESC",
      },
    ],
    expectedResult: {
      columns: ['name', 'cost_per_unit', 'supplier'],
      rows: [
        ['Starlight Essence', 1000, 'The Astral Weavers'],
        ['Dragon Scale Dust', 750, 'Gruff the Ranger'],
        ['Phoenix Feather', 500, 'The Ember Traders'],
      ],
    },
    sampleSolution:
      "SELECT name, cost_per_unit, supplier FROM ingredients WHERE rarity = 'Legendary' ORDER BY cost_per_unit DESC;",
    successMessage:
      'Starlight Essence at 1000 gold per unit! By the cauldrons, The Astral Weavers are highway robbers! But I need it for the Liquid Luck batch... You have given me exactly what I needed, Inquisitor. Perhaps there is hope for my budget yet!',
  },
];

export const APOTHECARY_QUEST_MAP = Object.fromEntries(
  APOTHECARY_QUESTS.map((q) => [q.id, q])
);
