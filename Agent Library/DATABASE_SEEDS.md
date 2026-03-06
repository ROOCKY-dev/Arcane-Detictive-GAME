# Database Seed Data

## Instructions
Each location has its own SQLite database. Use the `scripts/build-databases.ts` script 
to generate `.sqlite` files from these SQL seeds. The generated files go in 
`public/databases/`.

---

## archives_db (The Grand Archives)

```sql
-- apprentices table
CREATE TABLE apprentices (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    guild TEXT NOT NULL,
    enrollment_year INTEGER NOT NULL,
    specialization TEXT,
    graduated INTEGER DEFAULT 0
);

INSERT INTO apprentices VALUES 
(1, 'Aldric Flamebinder', 19, 'Mage', 2021, 'Evocation', 0),
(2, 'Brenna Stoneweaver', 22, 'Artificer', 2019, 'Enchantment', 1),
(3, 'Cedric Nightwhisper', 20, 'Rogue', 2020, 'Illusion', 0),
(4, 'Diana Ironheart', 21, 'Warrior', 2020, 'Abjuration', 0),
(5, 'Eldrin Stargazer', 18, 'Mage', 2023, NULL, 0),
(6, 'Freya Windrunner', 23, 'Ranger', 2018, 'Divination', 1),
(7, 'Gareth Doomhammer', 20, 'Warrior', 2021, 'Conjuration', 0),
(8, 'Helena Brightmoon', 19, 'Cleric', 2022, 'Restoration', 0),
(9, 'Ivan Shadowstep', 24, 'Rogue', 2017, 'Necromancy', 1),
(10, 'Jasmine Thornveil', 21, 'Mage', 2020, 'Transmutation', 0);

-- grimoires table
CREATE TABLE grimoires (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    subject TEXT NOT NULL,
    pages INTEGER NOT NULL,
    restricted INTEGER DEFAULT 0,
    shelf_number INTEGER NOT NULL
);

INSERT INTO grimoires VALUES
(1, 'Introduction to Cantrips', 'Archmage Codex', 'Basics', 120, 0, 1),
(2, 'Advanced Warding Techniques', 'Brenna Stoneweaver Sr.', 'Abjuration', 340, 0, 3),
(3, 'The Forbidden Tome of Shadows', 'Unknown', 'Necromancy', 666, 1, 13),
(4, 'Herbalism and Magical Plants', 'Elara Greenthumb', 'Alchemy', 200, 0, 5),
(5, 'Grimoire of Eternal Flames', 'Pyraxis the Wise', 'Evocation', 450, 1, 7),
(6, 'Beasts and Where to Bind Them', 'Gruff the Elder', 'Conjuration', 280, 0, 7),
(7, 'Starlight Divination Methods', 'Seer Lunara', 'Divination', 190, 0, 9),
(8, 'Runes of the Ancient Dwarves', 'Thorin Runemaster', 'Enchantment', 510, 1, 7),
(9, 'A Beginner Guide to Illusions', 'Mirage the Trickster', 'Illusion', 150, 0, 2),
(10, 'Transmutation: Lead to Gold', 'Alchemist Rex', 'Transmutation', 300, 1, 11);

-- checkout_logs table
CREATE TABLE checkout_logs (
    id INTEGER PRIMARY KEY,
    apprentice_id INTEGER NOT NULL,
    grimoire_id INTEGER NOT NULL,
    checkout_date TEXT NOT NULL,
    return_date TEXT,
    returned INTEGER DEFAULT 0,
    FOREIGN KEY (apprentice_id) REFERENCES apprentices(id),
    FOREIGN KEY (grimoire_id) REFERENCES grimoires(id)
);

INSERT INTO checkout_logs VALUES
(1, 1, 5, '2024-01-15', NULL, 0),
(2, 3, 9, '2024-01-10', '2024-01-17', 1),
(3, 5, 1, '2024-02-01', NULL, 0),
(4, 2, 4, '2023-12-20', '2024-01-05', 1),
(5, 7, 6, '2024-01-25', NULL, 0),
(6, 1, 1, '2023-11-01', '2023-11-15', 1),
(7, 4, 2, '2024-02-10', NULL, 0),
(8, 8, 7, '2024-01-30', '2024-02-05', 1),
(9, 10, 10, '2024-02-12', NULL, 0),
(10, 3, 3, '2024-02-14', NULL, 0);
```

## apothecary_db (The Apothecary Syndicate)

```sql
CREATE TABLE potions_inventory (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    effect TEXT NOT NULL,
    price_gold INTEGER NOT NULL,
    quantity_in_stock INTEGER NOT NULL,
    expiry_date TEXT
);

INSERT INTO potions_inventory VALUES
(1, 'Healing Potion', 'Restoration', 'Restores 50 HP', 25, 100, '2025-06-01'),
(2, 'Mandrake Root Elixir', 'Buff', 'Increases strength for 1 hour', 75, 0, '2025-03-15'),
(3, 'Invisibility Draught', 'Stealth', 'Grants invisibility for 10 minutes', 150, 12, '2025-01-20'),
(4, 'Firebreath Tonic', 'Offense', 'Breathe fire for 30 seconds', 200, 5, '2025-12-01'),
(5, 'Antidote', 'Restoration', 'Cures all poisons', 30, 80, '2025-08-10'),
(6, 'Love Potion No. 9', 'Charm', 'Mild infatuation for 5 minutes', 500, 3, '2024-12-25'),
(7, 'Giant Growth Serum', 'Buff', 'Doubles size for 1 hour', 120, 15, '2025-04-01'),
(8, 'Sleeping Draught', 'Control', 'Induces deep sleep for 8 hours', 45, 40, '2025-07-15'),
(9, 'Liquid Luck', 'Buff', 'Mild fortune enhancement', 1000, 1, '2025-02-28'),
(10, 'Truth Serum', 'Control', 'Compels honesty for 1 hour', 300, 8, '2025-09-01');

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    cost_per_unit INTEGER NOT NULL,
    supplier TEXT NOT NULL,
    magical INTEGER DEFAULT 0
);

INSERT INTO ingredients VALUES
(1, 'Mandrake Root', 'Common', 5, 'Greenfield Farms', 1),
(2, 'Phoenix Feather', 'Legendary', 500, 'The Ember Traders', 1),
(3, 'Moonpetal', 'Rare', 50, 'Night Garden Co.', 1),
(4, 'Troll Blood', 'Uncommon', 25, 'Monster Parts Ltd.', 0),
(5, 'Dragon Scale Dust', 'Legendary', 750, 'Gruff the Ranger', 1),
(6, 'Common Herb', 'Common', 1, 'Greenfield Farms', 0),
(7, 'Fairy Dust', 'Rare', 100, 'Pixie Hollow Export', 1),
(8, 'Snake Venom', 'Uncommon', 15, 'Monster Parts Ltd.', 0),
(9, 'Starlight Essence', 'Legendary', 1000, 'The Astral Weavers', 1),
(10, 'Willow Bark', 'Common', 3, 'Greenfield Farms', 0);

CREATE TABLE sales_receipts (
    id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    potion_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    sale_date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    FOREIGN KEY (potion_id) REFERENCES potions_inventory(id)
);

INSERT INTO sales_receipts VALUES
(1, 'Sir Lancelot', 1, 5, 125, '2024-02-14', 'Gold'),
(2, 'Morgana le Fay', 3, 2, 300, '2024-02-14', 'Gold'),
(3, 'Mysterious Stranger', 2, 20, 1500, '2024-02-13', 'Counterfeit Gold'),
(4, 'Aldric Flamebinder', 4, 1, 200, '2024-02-12', 'Gold'),
(5, 'Helena Brightmoon', 5, 10, 300, '2024-02-14', 'Gold'),
(6, 'Robin Hood', 1, 3, 75, '2024-02-13', 'Gold'),
(7, 'Gareth Doomhammer', 7, 1, 120, '2024-02-11', 'Gold'),
(8, 'Mysterious Stranger', 8, 5, 225, '2024-02-13', 'Counterfeit Gold'),
(9, 'Diana Ironheart', 1, 2, 50, '2024-02-14', 'Gold'),
(10, 'Eldrin Stargazer', 9, 1, 1000, '2024-02-10', 'Trade');
```

## beast_db (The Beastmaster's Outpost)

```sql
CREATE TABLE creature_registry (
    id INTEGER PRIMARY KEY,
    species TEXT NOT NULL,
    name TEXT NOT NULL,
    habitat TEXT NOT NULL,
    danger_level INTEGER NOT NULL,
    registered_owner TEXT,
    registration_date TEXT NOT NULL
);

INSERT INTO creature_registry VALUES
(1, 'Dragon', 'Ember', 'Mountain Cave', 10, 'King Alderon', '2020-01-15'),
(2, 'Griffin', 'Skytalon', 'Cliffside Nest', 7, 'Sir Percival', '2021-06-20'),
(3, 'Unicorn', 'Starlight', 'Enchanted Meadow', 2, 'Princess Lily', '2022-03-01'),
(4, 'Basilisk', 'Stoneye', 'Underground Cavern', 9, NULL, '2019-11-30'),
(5, 'Phoenix', 'Blaze', 'Volcanic Rim', 8, 'Archmage Codex', '2018-07-04'),
(6, 'Dire Wolf', 'Fang', 'Dark Forest', 6, 'Ranger Gruff', '2023-02-14'),
(7, 'Wyvern', 'Windrazor', 'Mountain Peak', 8, 'Merchant Guild', '2021-09-10'),
(8, 'Pixie Swarm', 'The Sparkles', 'Fairy Glen', 1, 'Elara the Mixer', '2023-08-22'),
(9, 'Troll', 'Boulder', 'Bridge Underside', 5, NULL, '2020-05-17'),
(10, 'Dragon', 'Frost', 'Ice Cavern', 10, 'Northern Jarl', '2019-04-01'),
(11, 'Dragon', 'Smoke', 'Abandoned Tower', 9, NULL, '2022-12-12'),
(12, 'Hippogriff', 'Breeze', 'Open Plains', 4, 'Academy Stable', '2023-01-30');

CREATE TABLE feeding_schedules (
    id INTEGER PRIMARY KEY,
    creature_id INTEGER NOT NULL,
    food_type TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    time_of_day TEXT NOT NULL,
    fed_by_ranger TEXT NOT NULL,
    FOREIGN KEY (creature_id) REFERENCES creature_registry(id)
);

INSERT INTO feeding_schedules VALUES
(1, 1, 'Raw Meat', 50.0, 'Morning', 'Gruff'),
(2, 1, 'Raw Meat', 50.0, 'Evening', 'Gruff'),
(3, 1, 'Raw Meat', 45.0, 'Afternoon', 'Hilda'),
(4, 1, 'Raw Meat', 50.0, 'Night', 'Hilda'),
(5, 2, 'Fish', 15.0, 'Morning', 'Torben'),
(6, 2, 'Fish', 15.0, 'Evening', 'Torben'),
(7, 3, 'Enchanted Oats', 5.0, 'Morning', 'Lily'),
(8, 3, 'Enchanted Oats', 5.0, 'Evening', 'Lily'),
(9, 6, 'Raw Meat', 20.0, 'Morning', 'Gruff'),
(10, 6, 'Raw Meat', 20.0, 'Evening', 'Gruff'),
(11, 5, 'Ash Berries', 2.0, 'Morning', 'Torben'),
(12, 10, 'Frozen Fish', 40.0, 'Morning', 'Hilda'),
(13, 10, 'Frozen Fish', 40.0, 'Evening', 'Hilda'),
(14, 10, 'Frozen Fish', 35.0, 'Afternoon', 'Hilda'),
(15, 10, 'Frozen Fish', 40.0, 'Night', 'Torben');

CREATE TABLE incident_reports (
    id INTEGER PRIMARY KEY,
    creature_id INTEGER NOT NULL,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    damage_gold INTEGER DEFAULT 0,
    resolved INTEGER DEFAULT 0,
    FOREIGN KEY (creature_id) REFERENCES creature_registry(id)
);

INSERT INTO incident_reports VALUES
(1, 1, 'Fire Damage', 'Ember sneezed and set the hay bales on fire', '2024-02-10', 'Stable Yard', 500, 1),
(2, 7, 'Illegal Parking', 'Windrazor landed on the town fountain again', '2024-02-12', 'Town Square', 200, 0),
(3, 4, 'Petrification', 'Stoneye escaped and petrified a scarecrow', '2024-02-08', 'Farmland', 50, 1),
(4, 9, 'Property Damage', 'Boulder ate half the bridge', '2024-02-14', 'River Crossing', 1000, 0),
(5, 6, 'Noise Complaint', 'Fang howling at the moon at 3 AM', '2024-02-13', 'Dark Forest Edge', 0, 1),
(6, 1, 'Fire Damage', 'Ember set the stable roof on fire', '2024-02-14', 'Stable Yard', 800, 0),
(7, 11, 'Unauthorized Flight', 'Smoke flew over restricted airspace', '2024-02-11', 'Castle Airspace', 0, 0),
(8, 8, 'Theft', 'The Sparkles stole all the sugar from the kitchen', '2024-02-13', 'Outpost Kitchen', 10, 1),
(9, 10, 'Ice Damage', 'Frost froze the water supply', '2024-02-14', 'Outpost Well', 300, 0),
(10, 2, 'Noise Complaint', 'Skytalon screeching during dawn meditation', '2024-02-12', 'Meditation Garden', 0, 0);
```

## underworld_db (The Shadow Market)

```sql
CREATE TABLE aliases (
    id INTEGER PRIMARY KEY,
    real_name TEXT,
    alias TEXT NOT NULL,
    known_guild TEXT,
    last_seen_location TEXT,
    danger_rating INTEGER NOT NULL
);

INSERT INTO aliases VALUES
(1, 'Marcus Blackwood', 'The Raven', 'Thieves Guild', 'Shadow Market', 7),
(2, NULL, 'Whisper', 'Assassins Brotherhood', 'Unknown', 9),
(3, 'Elena Voss', 'The Fence', 'Merchants Underground', 'Shadow Market', 4),
(4, 'Tormund Ironfist', 'The Hammer', 'Smugglers Ring', 'Docks', 6),
(5, NULL, 'Ghost', NULL, 'Everywhere', 10),
(6, 'Pip Littlefoot', 'Quickfingers', 'Thieves Guild', 'Merchant Quarter', 3),
(7, 'Sable Nightshade', 'Venom', 'Assassins Brotherhood', 'Apothecary District', 8),
(8, NULL, 'Cipher', 'Information Brokers', 'Shadow Market', 5),
(9, 'Dorian Grey', 'The Collector', NULL, 'Noble District', 4),
(10, 'Unknown', 'Phantom', 'Unknown', 'Unknown', 10);

CREATE TABLE smuggled_artifacts (
    id INTEGER PRIMARY KEY,
    item_name TEXT NOT NULL,
    origin TEXT NOT NULL,
    estimated_value_gold INTEGER NOT NULL,
    seller_alias_id INTEGER,
    buyer_alias_id INTEGER,
    transaction_date TEXT NOT NULL,
    FOREIGN KEY (seller_alias_id) REFERENCES aliases(id),
    FOREIGN KEY (buyer_alias_id) REFERENCES aliases(id)
);

INSERT INTO smuggled_artifacts VALUES
(1, 'Crown of the Lost King', 'Royal Tomb', 5000, 1, 9, '2024-01-20'),
(2, 'Enchanted Dagger', 'Dwarven Forge', 800, 4, 1, '2024-02-01'),
(3, 'Void Crystal', 'The Abyss', 3000, 99, 5, '2024-02-10'),
(4, 'Ancient Scroll of Power', 'Grand Archives', 1200, 3, 8, '2024-01-15'),
(5, 'Dragon Egg (Petrified)', 'Northern Wastes', 10000, 99, 9, '2024-02-12'),
(6, 'Potion of Eternal Youth', 'Apothecary Black Lab', 2000, 7, 3, '2024-02-05'),
(7, 'Stolen Guild Seal', 'Warrior Guild HQ', 600, 6, 4, '2024-01-28'),
(8, 'Map to El Dorado', 'Unknown', 750, 99, 1, '2024-02-14'),
(9, 'Cursed Amulet', 'Necromancer Tower', 400, 2, 6, '2024-02-08'),
(10, 'Mithril Ingot', 'Dwarven Mines', 1500, 4, 9, '2024-02-11');

-- Note: seller_alias_id = 99 is intentionally NOT in the aliases table
-- This is for the "Phantom Fence" quest

CREATE TABLE bounties (
    id INTEGER PRIMARY KEY,
    target_alias_id INTEGER NOT NULL,
    crime TEXT NOT NULL,
    reward_gold INTEGER NOT NULL,
    posted_by TEXT NOT NULL,
    status TEXT NOT NULL,
    posted_date TEXT NOT NULL,
    FOREIGN KEY (target_alias_id) REFERENCES aliases(id)
);

INSERT INTO bounties VALUES
(1, 1, 'Grand Theft: Crown Jewels', 2000, 'Royal Guard', 'Active', '2024-01-25'),
(2, 2, 'Murder of Lord Ashton', 5000, 'Noble Council', 'Active', '2023-12-01'),
(3, 5, 'Identity Unknown — Multiple Crimes', 10000, 'Royal Guard', 'Active', '2023-06-15'),
(4, 6, 'Pickpocketing Spree', 200, 'Merchant Guild', 'Captured', '2024-01-10'),
(5, 7, 'Poisoning of Sir Galahad', 3000, 'Knight Order', 'Active', '2024-02-06'),
(6, 4, 'Smuggling Contraband', 1000, 'Port Authority', 'Active', '2024-02-02'),
(7, 10, 'Existence Unconfirmed', 0, 'Unknown', 'Unverified', '2024-02-15'),
(8, 1, 'Fencing Stolen Goods', 1500, 'Merchant Guild', 'Active', '2024-02-01'),
(9, 9, 'Illegal Artifact Collection', 800, 'Arcane Council', 'Active', '2024-01-30'),
(10, 8, 'Information Trafficking', 500, 'Royal Intelligence', 'Active', '2024-02-10');
```
