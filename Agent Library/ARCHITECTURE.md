# Architecture & Technical Stack

## System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client)                  │
│                                                      │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   React.js   │  │  sql.js    │  │  CodeMirror  │ │
│  │   (Next.js)  │  │  (WASM)    │  │  SQL Editor   │ │
│  │              │  │            │  │              │ │
│  │  Game State  │◄─┤ Local DB   │◄─┤ User Queries │ │
│  │  Navigation  │  │ Execution  │  │ Input        │ │
│  │  UI Render   │  │            │  │              │ │
│  └──────┬───────┘  └────────────┘  └──────────────┘ │
│         │                                            │
│         │  Auth / Progress / Analytics               │
└─────────┼────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐     ┌──────────────────────┐
│     Supabase         │     │   Vercel / Netlify   │
│  ┌───────────────┐  │     │   (Static Hosting)   │
│  │ Auth (Users)  │  │     │                      │
│  │ PostgreSQL    │  │     │  - React App Bundle  │
│  │  - profiles   │  │     │  - .sqlite files     │
│  │  - progress   │  │     │  - Asset images      │
│  │  - classes    │  │     └──────────────────────┘
│  │  - custom_cases│ │
│  └───────────────┘  │
└─────────────────────┘
```

## Tech Stack

### 1. Core Engine: In-Browser Database
- **Technology:** `sql.js` (SQLite compiled to WebAssembly)
- **How it works:** When player enters a location, the app fetches a pre-made `.sqlite` file 
  and loads it into the browser's memory
- **Benefits:** 
  - Instant query execution (no network latency)
  - Zero server database costs
  - Safe sandbox (destructive queries only affect local instance)
  - Refresh to reset

### 2. Frontend
- **Framework:** React.js with Next.js (App Router)
- **Styling:** Tailwind CSS
- **SQL Editor:** CodeMirror 6 with SQL language support
  - Custom theme: "enchanted parchment" look with magical glow effects
  - SQL syntax highlighting
- **State Management:** React Context + useReducer (or Zustand)
- **Animations:** Framer Motion (for transitions, spell effects, case-solved animations)

### 3. Backend & Auth
- **Platform:** Supabase (free tier)
- **Auth:** Supabase Auth (email/password, optional Google OAuth)
- **Database (server-side PostgreSQL):**
  - `profiles` — user info, role (student/teacher)
  - `progress` — completed cases, hints used, achievements
  - `classes` — teacher-student groupings
  - `custom_cases` — teacher-created scenarios
  - `analytics` — query attempts, time spent, struggle points

### 4. Hosting & Deployment
- **Platform:** Vercel (free tier, auto-deploy from GitHub)
- **Assets:** Static `.sqlite` files + images served from `/public` directory
- **CI/CD:** Push to `main` → auto-deploy

## Data Flow (Single Query Execution)
1. Player clicks "The Apothecary Syndicate" on the map
2. React fetches `/databases/apothecary_db.sqlite` 
3. `sql.js` loads the file into browser memory
4. Player types query into CodeMirror editor
5. Player clicks "Cast Spell" (execute) button
6. `sql.js` processes the query locally, returns results array
7. React renders results as a styled HTML table ("magical scroll")
8. Game logic compares results against expected answer
9. If correct → trigger "CASE SOLVED" animation + update progress
10. Progress saved to Supabase (if logged in) or localStorage (if guest)

## Directory Structure
```
sql-quest/
├── public/
│   ├── databases/          # Pre-built .sqlite files
│   │   ├── archives_db.sqlite
│   │   ├── apothecary_db.sqlite
│   │   ├── beast_db.sqlite
│   │   └── underworld_db.sqlite
│   ├── images/
│   │   ├── map/            # Overworld map
│   │   ├── locations/      # Street views + interiors
│   │   ├── npcs/           # Character portraits
│   │   ├── items/          # Item icons
│   │   └── ui/             # Textures, borders, effects
│   └── sounds/             # SFX (optional)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Landing / title screen
│   │   ├── play/
│   │   │   ├── page.tsx    # World map
│   │   │   └── [locationId]/
│   │   │       ├── page.tsx          # Street view
│   │   │       └── [buildingId]/
│   │   │           └── page.tsx      # Interior + SQL terminal
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/      # Teacher admin panel
│   │   │   ├── page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── create-case/page.tsx
│   │   └── profile/page.tsx
│   ├── components/
│   │   ├── game/
│   │   │   ├── WorldMap.tsx
│   │   │   ├── StreetView.tsx
│   │   │   ├── InteriorView.tsx
│   │   │   ├── SQLTerminal.tsx
│   │   │   ├── QueryResults.tsx
│   │   │   ├── CaseFile.tsx
│   │   │   ├── SchemaViewer.tsx
│   │   │   ├── NPCDialogue.tsx
│   │   │   ├── HintSystem.tsx
│   │   │   └── CaseSolved.tsx
│   │   ├── ui/
│   │   │   ├── MagicalButton.tsx
│   │   │   ├── ParchmentPanel.tsx
│   │   │   ├── GlowingBorder.tsx
│   │   │   └── AchievementBadge.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── teacher/
│   │       ├── CaseCreator.tsx
│   │       ├── StudentList.tsx
│   │       └── AnalyticsChart.tsx
│   ├── lib/
│   │   ├── sql-engine.ts      # sql.js wrapper
│   │   ├── supabase.ts        # Supabase client
│   │   ├── game-data.ts       # Quest/case definitions
│   │   ├── query-validator.ts # Answer checking logic
│   │   └── achievements.ts    # Achievement definitions
│   ├── hooks/
│   │   ├── useSQLEngine.ts
│   │   ├── useGameState.ts
│   │   ├── useProgress.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   ├── game.ts
│   │   ├── quest.ts
│   │   └── user.ts
│   ├── data/
│   │   ├── locations.ts       # Location metadata
│   │   ├── npcs.ts            # NPC data & dialogue
│   │   ├── quests/
│   │   │   ├── archives-quests.ts
│   │   │   ├── apothecary-quests.ts
│   │   │   ├── beast-quests.ts
│   │   │   └── underworld-quests.ts
│   │   └── schemas/           # Human-readable schema descriptions
│   │       ├── archives-schema.ts
│   │       ├── apothecary-schema.ts
│   │       ├── beast-schema.ts
│   │       └── underworld-schema.ts
│   └── styles/
│       └── globals.css
├── scripts/
│   └── build-databases.ts    # Script to generate .sqlite files from seed data
├── database-seeds/
│   ├── archives_seed.sql
│   ├── apothecary_seed.sql
│   ├── beast_seed.sql
│   └── underworld_seed.sql
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.local
```