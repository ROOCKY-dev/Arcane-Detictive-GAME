import type { SchemaTable } from './types';

export const UNDERWORLD_SCHEMA: SchemaTable[] = [
  {
    name: 'aliases',
    description: 'Registry of known criminal aliases — real names often withheld',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'real_name', type: 'TEXT', description: "Subject's real name — often NULL (unknown)" },
      { name: 'alias', type: 'TEXT', description: 'Criminal alias / street name' },
      { name: 'known_guild', type: 'TEXT', description: 'Criminal guild affiliation — may be NULL' },
      { name: 'last_seen_location', type: 'TEXT', description: 'Last known whereabouts' },
      { name: 'danger_rating', type: 'INTEGER', description: 'Threat level 1-10' },
    ],
  },
  {
    name: 'smuggled_artifacts',
    description: 'Records of known illegal artifact transactions (incomplete by design)',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'item_name', type: 'TEXT', description: 'Name of the smuggled item' },
      { name: 'origin', type: 'TEXT', description: 'Where the item came from' },
      { name: 'estimated_value_gold', type: 'INTEGER', description: 'Estimated market value' },
      { name: 'seller_alias_id', type: 'INTEGER', description: 'Seller — references aliases(id). Note: some sellers are NOT in the registry.', isForeignKey: true },
      { name: 'buyer_alias_id', type: 'INTEGER', description: 'Buyer — references aliases(id)', isForeignKey: true },
      { name: 'transaction_date', type: 'TEXT', description: 'Date of transaction (YYYY-MM-DD)' },
    ],
  },
  {
    name: 'bounties',
    description: 'Active and historical bounties posted by various authorities',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'target_alias_id', type: 'INTEGER', description: 'Target — references aliases(id)', isForeignKey: true },
      { name: 'crime', type: 'TEXT', description: 'Crime description' },
      { name: 'reward_gold', type: 'INTEGER', description: 'Bounty reward in gold (0 = unconfirmed)' },
      { name: 'posted_by', type: 'TEXT', description: 'Authority who posted the bounty' },
      { name: 'status', type: 'TEXT', description: 'Status: Active, Captured, Unverified' },
      { name: 'posted_date', type: 'TEXT', description: 'Date posted (YYYY-MM-DD)' },
    ],
  },
];
