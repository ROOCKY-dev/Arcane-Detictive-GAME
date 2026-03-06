/**
 * NPC (Non-Player Character) data — all 4 location guides.
 */

import type { NPC } from '@/types/game';

export const NPCS: NPC[] = [
  {
    id: 'archmage-codex',
    name: 'Archmage Codex',
    title: 'Chief Archivist of the Grand Archives',
    personality:
      'Patient, encouraging, speaks in a slightly formal academic tone. Celebrates every success warmly. Treats every student as a brilliant future scholar.',
    appearance:
      'Old wizard with a white beard, round spectacles perched on his nose, kind blue eyes, and flowing blue robes covered in faintly glowing runes. Carries a quill that writes by itself.',
    locationId: 'archives',
    portraitPath: '/assets/npcs/archmage-codex.webp',
  },
  {
    id: 'elara-the-mixer',
    name: 'Elara the Mixer',
    title: 'Chief Alchemist of the Apothecary Syndicate',
    personality:
      'Frantic, apologetic, speaks in run-on sentences. Always in a rush. Terrible at bookkeeping but brilliant at brewing. Grateful when you solve her chaotic record problems.',
    appearance:
      'Young woman with messy green hair (stained that way from an accident), a perpetually stained apron over colorful robes, and a nervous smile. Three cauldrons always bubbling behind her.',
    locationId: 'apothecary',
    portraitPath: '/assets/npcs/elara-the-mixer.webp',
  },
  {
    id: 'gruff',
    name: 'Gruff',
    title: 'Senior Ranger of the Beastmaster\'s Outpost',
    personality:
      'Grumpy, monosyllabic, annoyed at paperwork. Prefers animals over people (and certainly over databases). Warms up slightly when you help him. Speaks in short, blunt sentences.',
    appearance:
      'Burly ranger with a scarred face, weathered leather armor covered in claw marks, and a no-nonsense expression. A tiny pixie named Spark sits on his shoulder and occasionally offers more helpful hints than Gruff does.',
    locationId: 'beast',
    portraitPath: '/assets/npcs/gruff.webp',
  },
  {
    id: 'null',
    name: '"Null"',
    title: 'Information Broker of the Shadow Market',
    personality:
      'Cryptic, teasing, uses database puns. Speaks in riddles that are actually hints about query structure. Seems to know everything about everyone — especially the things they want kept secret.',
    appearance:
      'A mysterious figure in a hooded cloak of shifting shadows. Only two glowing purple eyes are visible. Their actual name, like their face, is unknown. They chose "Null" deliberately — a value that is absent, yet present.',
    locationId: 'underworld',
    portraitPath: '/assets/npcs/null.webp',
  },
];

/** Look up an NPC by ID */
export function getNPC(npcId: string): NPC {
  const npc = NPCS.find((n) => n.id === npcId);
  if (!npc) throw new Error(`Unknown NPC: ${npcId}`);
  return npc;
}

/** Get the NPC for a given location */
export function getNPCForLocation(locationId: string): NPC {
  const npc = NPCS.find((n) => n.locationId === locationId);
  if (!npc) throw new Error(`No NPC for location: ${locationId}`);
  return npc;
}
