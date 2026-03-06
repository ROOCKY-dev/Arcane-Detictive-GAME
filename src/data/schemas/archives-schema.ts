import type { SchemaTable } from './types';

export const ARCHIVES_SCHEMA: SchemaTable[] = [
  {
    name: 'apprentices',
    description: 'Registry of all students enrolled in the Grand Archives',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'name', type: 'TEXT', description: "Apprentice's full name" },
      { name: 'age', type: 'INTEGER', description: "Apprentice's age" },
      { name: 'guild', type: 'TEXT', description: 'Guild affiliation (Mage, Rogue, Warrior, etc.)' },
      { name: 'enrollment_year', type: 'INTEGER', description: 'Year they enrolled' },
      { name: 'specialization', type: 'TEXT', description: 'Magic specialization (may be NULL)' },
      { name: 'graduated', type: 'INTEGER', description: '1 = graduated, 0 = still enrolled' },
    ],
  },
  {
    name: 'grimoires',
    description: 'Catalog of all books and tomes in the Archives',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'title', type: 'TEXT', description: 'Book title' },
      { name: 'author', type: 'TEXT', description: "Author's name" },
      { name: 'subject', type: 'TEXT', description: 'Subject category' },
      { name: 'pages', type: 'INTEGER', description: 'Number of pages' },
      { name: 'restricted', type: 'INTEGER', description: '1 = restricted access, 0 = public' },
      { name: 'shelf_number', type: 'INTEGER', description: 'Physical shelf location' },
    ],
  },
  {
    name: 'checkout_logs',
    description: 'Records of every book checkout and return',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'apprentice_id', type: 'INTEGER', description: 'References apprentices(id)', isForeignKey: true },
      { name: 'grimoire_id', type: 'INTEGER', description: 'References grimoires(id)', isForeignKey: true },
      { name: 'checkout_date', type: 'TEXT', description: 'Date checked out (YYYY-MM-DD)' },
      { name: 'return_date', type: 'TEXT', description: 'Date returned — NULL if not returned' },
      { name: 'returned', type: 'INTEGER', description: '1 = returned, 0 = still out' },
    ],
  },
];
