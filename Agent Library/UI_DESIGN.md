# UI/UX Design Specification

## Art Style: "Cozy Arcane Pixel Art"
- High-fidelity pixel art with vibrant fantasy colors
- Soft glowing volumetric lighting
- Cozy, warm atmosphere
- Clean lines inspired by classic 2D adventure games

## Color Palette
| Use | Color | Hex |
|---|---|---|
| Primary Background | Deep Parchment Brown | #2D1B0E |
| Secondary Background | Warm Leather | #4A3520 |
| Text (Light) | Cream Parchment | #F5E6C8 |
| Text (Dark) | Dark Ink | #1A0E05 |
| Accent (Magic Glow) | Arcane Gold | #FFD700 |
| Accent (Code/Active) | Mystic Blue | #4A9EFF |
| Accent (Success) | Emerald Green | #2ECC71 |
| Accent (Error/Misfire) | Spell Purple | #9B59B6 |
| Accent (Danger) | Fire Red | #E74C3C |
| UI Border Glow | Soft Gold | #C9A04E |

## Typography
- **Headings:** A fantasy/medieval-styled web font (e.g., "MedievalSharp" from Google Fonts, 
  or "Cinzel")
- **Body Text:** Clean sans-serif (e.g., "Inter" or "Nunito") for readability
- **Code/SQL Editor:** Monospace font (e.g., "Fira Code" or "JetBrains Mono")

## Screen Layouts

### 1. Title Screen / Landing Page
```
┌─────────────────────────────────────────────────┐
│                                                  │
│           🏰 SQL QUEST 🏰                       │
│        The Realm of Syntaxia                     │
│                                                  │
│     [pixel art castle/landscape backdrop]         │
│                                                  │
│         ┌──────────────────────┐                 │
│         │   ⚔️ Begin Quest     │                 │
│         └──────────────────────┘                 │
│         ┌──────────────────────┐                 │
│         │   📖 Continue        │                 │
│         └──────────────────────┘                 │
│         ┌──────────────────────┐                 │
│         │   🔑 Login/Register  │                 │
│         └──────────────────────┘                 │
│                                                  │
│                    v0.1.0                        │
└─────────────────────────────────────────────────┘
```

### 2. World Map
```
┌──────────────────────────────────────────────────┐
│ ☰ Menu    SQL Quest    🏆 Achievements    👤     │
├──────────────────────────────────────────────────┤
│                                                   │
│          [Illustrated Kingdom Map]                │
│                                                   │
│     📚 Grand Archives        🧪 Apothecary       │
│     (3/4 completed)          (🔒 Locked)          │
│                                                   │
│     🐉 Beastmaster's         🌑 Shadow Market     │
│     (🔒 Locked)              (🔒 Locked)          │
│                                                   │
│  ┌────────────────────────────────────────────┐   │
│  │ Current Quest: "The Missing Grimoire"      │   │
│  │ Location: The Grand Archives               │   │
│  │ [Continue Quest →]                         │   │
│  └────────────────────────────────────────────┘   │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 3. Street View (Location Exterior)
```
┌──────────────────────────────────────────────────┐
│ ← Back to Map    The Grand Archives District     │
├──────────────────────────────────────────────────┤
│                                                   │
│     [2D illustrated street scene background]      │
│                                                   │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│   │ Library  │    │ Reading │    │ Scroll  │     │
│   │ Main     │    │ Room    │    │ Storage │     │
│   │ Hall     │    │         │    │         │     │
│   │ [Click]  │    │ [🔒]   │    │ [🔒]   │     │
│   └─────────┘    └─────────┘    └─────────┘     │
│                                                   │
│  💬 Archmage Codex awaits you in the Main Hall   │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 4. Interior View — SQL Terminal (MAIN GAMEPLAY SCREEN)
```
┌──────────────────────────────────────────────────────────┐
│ ← Back    The Grand Archives — Main Hall    💡 Hint (2)  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─ Case File ──────────────┐  ┌─ Enchanted Terminal ──┐ │
│  │                          │  │                        │ │
│  │ 📜 The Missing Grimoire  │  │  -- Cast your spell    │ │
│  │                          │  │  SELECT * FROM         │ │
│  │ Archmage Codex says:     │  │  grimoires             │ │
│  │ "The Grimoire of Eternal │  │  WHERE shelf_number    │ │
│  │  Flames has vanished..." │  │  = 7;                  │ │
│  │                          │  │                        │ │
│  │ ─── Schema ───           │  │                        │ │
│  │ 📋 apprentices           │  │                        │ │
│  │   id | name | age |...   │  │                        │ │
│  │ 📋 grimoires             │  │  ┌──────────────────┐  │ │
│  │   id | title | author |  │  │  │ ✨ Cast Spell    │  │ │
│  │ 📋 checkout_logs         │  │  │    (Execute)     │  │ │
│  │   id | apprentice_id |   │  │  └──────────────────┘  │ │
│  │                          │  │  ┌──────────────────┐  │ │
│  └──────────────────────────┘  │  │ 🔄 Reset DB      │  │ │
│                                 │  └──────────────────┘  │ │
│  ┌─ Results ───────────────────┴────────────────────────┐ │
│  │                                                       │ │
│  │  id │ title                    │ author        │ ...  │ │
│  │  ───┼──────────────────────────┼───────────────┼───── │ │
│  │  5  │ Grimoire of Eternal Flam │ Pyraxis the W │ ...  │ │
│  │  6  │ Beasts and Where to Bind │ Gruff the Eld │ ...  │ │
│  │  8  │ Runes of the Ancient Dwa │ Thorin Runema │ ...  │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 5. NPC Dialogue Overlay
```
┌──────────────────────────────────────────┐
│                                           │
│    [Background dimmed]                    │
│                                           │
│    ┌────────────────────────────────┐     │
│    │  ┌──────┐                     │     │
│    │  │ NPC  │  Archmage Codex     │     │
│    │  │ IMG  │                     │     │
│    │  └──────┘  "Welcome, young    │     │
│    │            Inquisitor! A most  │     │
│    │            troubling matter..." │     │
│    │                                │     │
│    │            [Continue →]        │     │
│    └────────────────────────────────┘     │
│                                           │
└──────────────────────────────────────────┘
```

### 6. Case Solved Animation
```
┌──────────────────────────────────────────┐
│                                           │
│         ✨ ✨ ✨ ✨ ✨ ✨ ✨              │
│                                           │
│           ⚔️ CASE SOLVED ⚔️              │
│          "The Missing Grimoire"           │
│                                           │
│     Archmage Codex:                       │
│     "Splendid! Your first spell was       │
│      cast perfectly, Inquisitor!"         │
│                                           │
│     🏆 Achievement: First Incantation     │
│     ⏱️ Time: 2m 34s                      │
│     💡 Hints used: 1                      │
│                                           │
│         [Next Case →]  [Back to Map]      │
│                                           │
│         ✨ ✨ ✨ ✨ ✨ ✨ ✨              │
└──────────────────────────────────────────┘
```

### 7. SQL Error State ("Spell Misfire")
```
┌─────────────────────────────────────┐
│  💨 SPELL MISFIRE! 💨               │
│                                      │
│  Your incantation fizzled...         │
│                                      │
│  Error: no such column: namee        │
│  near "namee": syntax error          │
│                                      │
│  [Try Again]                         │
└─────────────────────────────────────┘
```

## Responsive Design
- **Desktop (>1024px):** Split-screen layout (case file left, terminal right)
- **Tablet (768-1024px):** Tabbed layout (switch between case file and terminal)
- **Mobile (<768px):** Stacked layout (case file on top, terminal below, results at bottom)

## UI Elements (Built with CSS, NOT AI-generated)
- Parchment-textured panels (CSS gradient + AI-generated texture as background-image)
- Glowing runic borders (CSS box-shadow with gold/blue glow)
- Magical buttons (hover animation: gentle pulse glow)
- Results table styled as a medieval ledger
- Schema viewer styled as a collapsible scroll
```