import type { SchemaTable } from './types';

export const BEAST_SCHEMA: SchemaTable[] = [
  {
    name: 'creature_registry',
    description: 'Official registry of all magical creatures at the outpost',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'species', type: 'TEXT', description: 'Creature species (Dragon, Griffin, etc.)' },
      { name: 'name', type: 'TEXT', description: "Creature's name" },
      { name: 'habitat', type: 'TEXT', description: 'Natural habitat' },
      { name: 'danger_level', type: 'INTEGER', description: 'Danger rating 1-10 (10 = most dangerous)' },
      { name: 'registered_owner', type: 'TEXT', description: "Owner's name — NULL if unowned/wild" },
      { name: 'registration_date', type: 'TEXT', description: 'Date registered (YYYY-MM-DD)' },
    ],
  },
  {
    name: 'feeding_schedules',
    description: 'Log of every feeding event for each creature',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'creature_id', type: 'INTEGER', description: 'References creature_registry(id)', isForeignKey: true },
      { name: 'food_type', type: 'TEXT', description: 'Type of food provided' },
      { name: 'quantity_kg', type: 'REAL', description: 'Amount in kilograms' },
      { name: 'time_of_day', type: 'TEXT', description: 'Feeding time (Morning, Afternoon, Evening, Night)' },
      { name: 'fed_by_ranger', type: 'TEXT', description: "Ranger who performed the feeding" },
    ],
  },
  {
    name: 'incident_reports',
    description: 'Filed reports of creature-related incidents and damages',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'creature_id', type: 'INTEGER', description: 'References creature_registry(id)', isForeignKey: true },
      { name: 'incident_type', type: 'TEXT', description: 'Category of incident' },
      { name: 'description', type: 'TEXT', description: 'Full incident description' },
      { name: 'date', type: 'TEXT', description: 'Incident date (YYYY-MM-DD)' },
      { name: 'location', type: 'TEXT', description: 'Where the incident occurred' },
      { name: 'damage_gold', type: 'INTEGER', description: 'Estimated gold damage (0 = no damage)' },
      { name: 'resolved', type: 'INTEGER', description: '1 = resolved, 0 = still open' },
    ],
  },
];
