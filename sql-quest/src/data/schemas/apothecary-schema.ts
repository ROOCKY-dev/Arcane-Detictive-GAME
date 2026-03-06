import type { SchemaTable } from './types';

export const APOTHECARY_SCHEMA: SchemaTable[] = [
  {
    name: 'potions_inventory',
    description: "Elara's current potion stock with prices and expiry dates",
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'name', type: 'TEXT', description: 'Potion name' },
      { name: 'type', type: 'TEXT', description: 'Category (Restoration, Buff, Stealth, etc.)' },
      { name: 'effect', type: 'TEXT', description: 'What the potion does' },
      { name: 'price_gold', type: 'INTEGER', description: 'Selling price in gold coins' },
      { name: 'quantity_in_stock', type: 'INTEGER', description: 'Units currently available' },
      { name: 'expiry_date', type: 'TEXT', description: 'Expiry date (YYYY-MM-DD), may be NULL' },
    ],
  },
  {
    name: 'ingredients',
    description: 'Raw ingredients used to brew potions, with supplier info',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'name', type: 'TEXT', description: 'Ingredient name' },
      { name: 'rarity', type: 'TEXT', description: 'Rarity tier (Common, Uncommon, Rare, Legendary)' },
      { name: 'cost_per_unit', type: 'INTEGER', description: 'Purchase cost per unit' },
      { name: 'supplier', type: 'TEXT', description: 'Supplier name' },
      { name: 'magical', type: 'INTEGER', description: '1 = magical ingredient, 0 = mundane' },
    ],
  },
  {
    name: 'sales_receipts',
    description: 'Record of every potion sale transaction',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique identifier', isPrimaryKey: true },
      { name: 'customer_name', type: 'TEXT', description: "Customer's name" },
      { name: 'potion_id', type: 'INTEGER', description: 'References potions_inventory(id)', isForeignKey: true },
      { name: 'quantity', type: 'INTEGER', description: 'Number of units purchased' },
      { name: 'total_price', type: 'INTEGER', description: 'Total gold paid' },
      { name: 'sale_date', type: 'TEXT', description: 'Date of sale (YYYY-MM-DD)' },
      { name: 'payment_method', type: 'TEXT', description: 'Payment type (Gold, Counterfeit Gold, Trade)' },
    ],
  },
];
