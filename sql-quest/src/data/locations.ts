/**
 * Location data for all 4 areas in The Realm of Syntaxia.
 */

import type { Location } from '@/types/game';

export const LOCATIONS: Location[] = [
  {
    id: 'archives',
    name: 'The Grand Archives',
    description:
      'An ancient magical library filled with towering shelves of glowing books, dust motes dancing in sunbeams, enchanted scrolls floating between shelves.',
    vibe: 'Warm, welcoming, safe. This is the tutorial area.',
    databaseId: 'archives',
    npcId: 'archmage-codex',
    iconEmoji: '📚',
    imageUrl: '/assets/locations/archives_bg.webp',
    unlockRequirement: null, // Available from start
    buildings: [
      {
        id: 'main-hall',
        locationId: 'archives',
        name: 'Main Hall',
        description: 'The great vaulted entrance hall where apprentices register their grimoires.',
        isLocked: false,
        questIds: ['archives-q1', 'archives-q2', 'archives-q3', 'archives-q4'],
        imageUrl: '/assets/locations/archives_interior.webp',
      },
      {
        id: 'reading-room',
        locationId: 'archives',
        name: 'Reading Room',
        description: 'A quiet alcove where scholars study the ancient texts.',
        isLocked: true,
        questIds: [],
      },
      {
        id: 'scroll-storage',
        locationId: 'archives',
        name: 'Scroll Storage',
        description: 'Deep vaults containing the most rare and restricted scrolls.',
        isLocked: true,
        questIds: [],
      },
    ],
  },
  {
    id: 'apothecary',
    name: 'The Apothecary Syndicate',
    description:
      'A chaotic potion shop. Bubbling cauldrons, shelves of colorful bottles, ingredient jars with strange labels, a perpetual haze of fragrant smoke.',
    vibe: 'Chaotic but colorful. Slightly messy. Fun.',
    databaseId: 'apothecary',
    npcId: 'elara-the-mixer',
    iconEmoji: '🧪',
    imageUrl: '/assets/locations/apothecary_bg.webp',
    unlockRequirement: {
      locationId: 'archives',
      requiredCompletedQuests: 2,
    },
    buildings: [
      {
        id: 'potion-shop',
        locationId: 'apothecary',
        name: 'Potion Shop',
        description: 'The front counter where potions are sold and records are kept — badly.',
        isLocked: false,
        questIds: ['apothecary-q1', 'apothecary-q2', 'apothecary-q3'],
        imageUrl: '/assets/locations/apothecary_interior.webp',
      },
      {
        id: 'back-lab',
        locationId: 'apothecary',
        name: 'Back Laboratory',
        description: 'Where the real brewing happens. Strictly off-limits... or is it?',
        isLocked: true,
        questIds: [],
      },
    ],
  },
  {
    id: 'beast',
    name: "The Beastmaster's Outpost",
    description:
      'A rugged outpost at the edge of the forest. Pens with magical creatures, feeding troughs, incident report boards, a grizzled ranger\'s desk.',
    vibe: 'Outdoorsy, rustic, slightly dangerous. Animal sounds in the background.',
    databaseId: 'beast',
    npcId: 'gruff',
    iconEmoji: '🐉',
    imageUrl: '/assets/locations/beast_bg.webp',
    unlockRequirement: {
      locationId: 'apothecary',
      requiredCompletedQuests: 2,
    },
    buildings: [
      {
        id: 'ranger-station',
        locationId: 'beast',
        name: "Ranger's Station",
        description: "Gruff's office — a cluttered desk buried under incident reports and feeding logs.",
        isLocked: false,
        questIds: ['beast-q1', 'beast-q2', 'beast-q3'],
        imageUrl: '/assets/locations/beast_interior.webp',
      },
      {
        id: 'creature-pens',
        locationId: 'beast',
        name: 'Creature Pens',
        description: 'Reinforced enclosures housing everything from pixies to dragons.',
        isLocked: true,
        questIds: [],
      },
    ],
  },
  {
    id: 'underworld',
    name: 'The Shadow Market',
    description:
      'A dark, underground marketplace lit by floating lanterns. Hooded figures, mysterious stalls, encoded messages on walls. Data here is deliberately messy/incomplete.',
    vibe: 'Mysterious, noir, slightly dangerous. The "boss level."',
    databaseId: 'underworld',
    npcId: 'null',
    iconEmoji: '🌑',
    imageUrl: '/assets/locations/underworld_bg.webp',
    unlockRequirement: {
      locationId: 'beast',
      requiredCompletedQuests: 2,
    },
    buildings: [
      {
        id: 'black-exchange',
        locationId: 'underworld',
        name: 'The Black Exchange',
        description: 'Where aliases are traded, artifacts fenced, and bounties posted. Trust nothing.',
        isLocked: false,
        questIds: ['underworld-q1', 'underworld-q2', 'underworld-q3', 'underworld-q4'],
        imageUrl: '/assets/locations/underworld_interior.webp',
      },
    ],
  },
];

/** Look up a location by ID — throws if not found */
export function getLocation(locationId: string): Location {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  if (!loc) throw new Error(`Unknown location: ${locationId}`);
  return loc;
}

/** Look up a building by location + building ID */
export function getBuilding(locationId: string, buildingId: string) {
  const loc = getLocation(locationId);
  const building = loc.buildings.find((b) => b.id === buildingId);
  if (!building) throw new Error(`Unknown building: ${buildingId} in ${locationId}`);
  return building;
}
