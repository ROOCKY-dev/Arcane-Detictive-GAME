# Game Data: World, Locations, NPCs, Databases, and Quests

## The "Magical" Database Dictionary (Theming)
| Real Concept | In-Game Term |
|---|---|
| Database | The Grand Grimoire / Kingdom Census / Guild Ledger |
| SQL Terminal / Console | Enchanted Parchment / Summoning Circle / Scrying Orb |
| SQL Query | Incantation / Spell / Rune of Seeking |
| SELECT | Reveal / Summon |
| JOIN | Bind / Link |
| WHERE | Filter / Condition Rune |
| Syntax Error | Magical Misfire / Fizzled Spell 💨 |
| Query Result | Revelation / Vision |
| Table | Scroll / Ledger / Registry |
| Column | Attribute / Rune Field |
| Row | Entry / Record / Soul |
| Teacher Admin Panel | The Archmage's Tower |
| Student | Apprentice |
| Achievement | Rune Mastery / Spell Badge |

---

## 🗺️ Locations

### Location 1: The Grand Archives
- **Description:** An ancient magical library filled with towering shelves of glowing books, 
  dust motes dancing in sunbeams, enchanted scrolls floating between shelves.
- **Vibe:** Warm, welcoming, safe. This is the tutorial area.
- **Key NPC:** Archmage Codex — An old, patient wizard. White beard, spectacles, kind eyes, 
  blue robes covered in faintly glowing runes. Acts as the tutorial guide.
- **NPC Personality:** Patient, encouraging, speaks in slightly formal academic tone. 
  Celebrates every success warmly.
- **Database:** `archives_db`
- **Tables:**
  - `apprentices` (id, name, age, guild, enrollment_year, specialization, graduated)
  - `grimoires` (id, title, author, subject, pages, restricted, shelf_number)
  - `checkout_logs` (id, apprentice_id, grimoire_id, checkout_date, return_date, returned)
- **SQL Focus:** Basic syntax — `SELECT`, `WHERE`, `AND`/`OR`, `SELECT *`, column selection
- **Unlock:** Available from start

### Location 2: The Apothecary Syndicate
- **Description:** A chaotic potion shop. Bubbling cauldrons, shelves of colorful bottles, 
  ingredient jars with strange labels, a perpetual haze of fragrant smoke.
- **Vibe:** Chaotic but colorful. Slightly messy. Fun.
- **Key NPC:** Elara the Mixer — A chaotic alchemist with messy green hair, stained apron, 
  nervous smile. Terrible at bookkeeping.
- **NPC Personality:** Frantic, apologetic, speaks in run-on sentences. Always in a rush. 
  Grateful when you solve cases.
- **Database:** `apothecary_db`
- **Tables:**
  - `potions_inventory` (id, name, type, effect, price_gold, quantity_in_stock, expiry_date)
  - `ingredients` (id, name, rarity, cost_per_unit, supplier, magical)
  - `sales_receipts` (id, customer_name, potion_id, quantity, total_price, sale_date, 
    payment_method)
- **SQL Focus:** Sorting — `ORDER BY`, `LIMIT`, basic `JOIN`s
- **Unlock:** After completing 2 quests in The Grand Archives

### Location 3: The Beastmaster's Outpost
- **Description:** A rugged outpost at the edge of the forest. Pens with magical creatures, 
  feeding troughs, incident report boards, a grizzled ranger's desk.
- **Vibe:** Outdoorsy, rustic, slightly dangerous. Animal sounds in the background.
- **Key NPC:** Gruff — A burly ranger who prefers animals over people (and certainly over 
  databases). Scarred face, leather armor, a tiny pixie sitting on his shoulder.
- **NPC Personality:** Grumpy, monosyllabic, annoyed at paperwork. Warms up slightly 
  when you help him. Speaks in short, blunt sentences.
- **Database:** `beast_db`
- **Tables:**
  - `creature_registry` (id, species, name, habitat, danger_level, registered_owner, 
    registration_date)
  - `feeding_schedules` (id, creature_id, food_type, quantity_kg, time_of_day, 
    fed_by_ranger)
  - `incident_reports` (id, creature_id, incident_type, description, date, location, 
    damage_gold, resolved)
- **SQL Focus:** Aggregation — `COUNT()`, `GROUP BY`, `SUM()`, `HAVING`
- **Unlock:** After completing 2 quests in The Apothecary Syndicate

### Location 4: The Shadow Market
- **Description:** A dark, underground marketplace lit by floating lanterns. Hooded figures, 
  mysterious stalls, encoded messages on walls. Data here is deliberately messy/incomplete.
- **Vibe:** Mysterious, noir, slightly dangerous. The "boss level."
- **Key NPC:** "Null" — A mysterious rogue who speaks in riddles and corrupted data. 
  Face hidden under a hood, only glowing eyes visible. Name is literally the SQL keyword.
- **NPC Personality:** Cryptic, teasing, uses database puns. Speaks in riddles that are 
  actually hints about query structure.
- **Database:** `underworld_db`
- **Tables:**
  - `aliases` (id, real_name, alias, known_guild, last_seen_location, danger_rating)
  - `smuggled_artifacts` (id, item_name, origin, estimated_value_gold, seller_alias_id, 
    buyer_alias_id, transaction_date)
  - `bounties` (id, target_alias_id, crime, reward_gold, posted_by, status, posted_date)
- **SQL Focus:** Complex queries — Multiple `JOIN`s, Subqueries, `LIKE`, `IN`, nested logic
- **Unlock:** After completing 2 quests in The Beastmaster's Outpost

---

## 📜 Quest Examples

### Quest 1.1: "The Missing Grimoire" (The Grand Archives — Beginner)
**NPC Dialogue (Archmage Codex):**
> "Welcome, young Inquisitor! A most troubling matter. The Grimoire of Eternal Flames has 
> vanished from Shelf 7. Before we panic, let us simply check if it is listed in our records. 
> Could you cast a revealing spell to show me all grimoires on shelf 7?"

**Hint 1:** "To reveal all entries from a scroll, use: SELECT * FROM [scroll_name]"
**Hint 2:** "You need to filter for a specific shelf. Use WHERE shelf_number = 7"

**Expected Query Concept:**
```sql
SELECT * FROM grimoires WHERE shelf_number = 7;
```

**Expected Result:** Returns 3-4 rows of grimoires on shelf 7, including "Grimoire of Eternal Flames"

**Success Message (Archmage Codex):**
> "Splendid! The grimoire IS in our records. So it has been physically moved, not erased 
> from existence. Your first spell was cast perfectly, Inquisitor. Now, let us check who 
> last borrowed it..."

---

### Quest 1.2: "The Overdue Apprentice" (The Grand Archives — Beginner)
**NPC Dialogue (Archmage Codex):**
> "Now that we know the Grimoire of Eternal Flames exists, we need to find who checked it 
> out last. Check the checkout logs for grimoire_id 5 (that's our missing book) and find 
> entries that haven't been returned yet."

**Hint 1:** "You need to look at the checkout_logs table"
**Hint 2:** "Filter by grimoire_id AND by returned status"

**Expected Query Concept:**
```sql
SELECT * FROM checkout_logs WHERE grimoire_id = 5 AND returned = 0;
```

---

### Quest 2.1: "The Counterfeit Customer" (Apothecary — Intermediate)
**NPC Dialogue (Elara):**
> "Inquisitor! Disaster! Someone bought ALL my Mandrake Root Elixirs yesterday and paid 
> with counterfeit gold! I need you to find their name! Check who bought potions 
> yesterday... oh, and sort by the biggest purchase first, the thief surely bought the most!"

**Expected Query Concept:**
```sql
SELECT customer_name, total_price 
FROM sales_receipts 
JOIN potions_inventory ON sales_receipts.potion_id = potions_inventory.id 
WHERE potions_inventory.name = 'Mandrake Root Elixir' 
ORDER BY total_price DESC 
LIMIT 1;
```

---

### Quest 3.1: "The Feeding Fiasco" (Beastmaster — Intermediate)
**NPC Dialogue (Gruff):**
> "Ugh. Paperwork. Three dragons got sick. I think someone's been overfeeding them. 
> Count how many times each creature was fed today and show me only the ones fed 
> more than 3 times. I hate spreadsheets."

**Expected Query Concept:**
```sql
SELECT creature_id, COUNT(*) as feed_count 
FROM feeding_schedules 
WHERE time_of_day = 'today' 
GROUP BY creature_id 
HAVING COUNT(*) > 3;
```

---

### Quest 4.1: "The Phantom Fence" (Shadow Market — Advanced)
**NPC Dialogue ("Null"):**
> "Looking for a ghost, Inquisitor? Someone sold three artifacts worth more than 500 gold 
> each... but their alias doesn't appear in our registry. Find the alias_id of the seller 
> who doesn't exist in our aliases table. A null in the shadows, you might say... 😏"

**Expected Query Concept:**
```sql
SELECT DISTINCT seller_alias_id 
FROM smuggled_artifacts 
WHERE estimated_value_gold > 500 
AND seller_alias_id NOT IN (SELECT id FROM aliases);
```

---

## 🏆 Achievements System
```
| Achievement | Condition | Icon Idea |
|---|---|---|
| First Incantation | Complete your first quest | ✨ Glowing quill |
| Scholar's Mark | Complete all Grand Archives quests | 📚 Golden book |
| Alchemist's Friend | Complete all Apothecary quests | 🧪 Bubbling potion |
| Beast Whisperer | Complete all Beastmaster quests | 🐉 Dragon scale |
| Shadow Walker | Complete all Shadow Market quests | 🌑 Dark moon |
| Speed Caster | Solve a case in under 60 seconds | ⚡ Lightning bolt |
| Efficient Mage | Solve a case with an optimal query | 💎 Crystal |
| Hint-Free Hero | Complete a location with no hints | 🛡️ Shield |
| Master Inquisitor | Complete all quests | 👑 Crown |
| Misfire Survivor | Get 10 syntax errors in one session | 💨 Purple smoke |
```