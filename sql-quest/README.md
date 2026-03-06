# SQL Quest: The Realm of Syntaxia

A fantasy-themed SQL learning game built with Next.js 14. Players solve mysteries across magical locations by writing real SQL queries against in-browser SQLite databases. Teachers can create custom quests and track student progress through a dedicated dashboard.

---

## Features

- **Guest mode** — play fully offline, no account required; progress saved to localStorage
- **5 built-in locations** — each with themed SQLite databases and multi-step mystery quests
- **In-browser SQL engine** — powered by [sql.js](https://sql.js.org/) (SQLite compiled to WASM); no server needed
- **NPC dialogue** with typewriter effect and skip support
- **Hint system** with escalating clue tiers
- **Achievement engine** — auto-awarded based on play behavior
- **Case Solved overlay** with animated summary
- **Procedural sound effects** via Web Audio API
- **Auth and cloud sync** (optional) — Supabase auth, per-quest progress synced to cloud
- **Teacher dashboard** — live roster with quest completion stats and efficiency metrics
- **Quest Forge** — teachers design custom quests with DDL/DML, compiled to `.sqlite` in-browser, uploaded to Supabase Storage
- **Notice Board** — students enter a quest code to load and play teacher-created quests
- **Row Level Security** — Supabase RLS policies enforce data isolation between students and teachers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| SQL Engine | sql.js (SQLite WASM) |
| DB Build | better-sqlite3 (build-time only) |
| State | Zustand + `persist` middleware |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror` |
| Animations | Framer Motion |
| Sound | Web Audio API (procedural, no assets) |
| Styling | Tailwind CSS |
| Backend | Supabase (auth, Postgres, Storage) |
| Auth middleware | `@supabase/auth-helpers-nextjs` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### 1. Clone and install

```bash
git clone <repo-url>
cd sql-quest
npm install
```

### 2. Generate SQLite databases

The built-in location databases are compiled from seed scripts at build time. Run this once after cloning:

```bash
npm run build:db
```

This writes `.sqlite` files to `public/databases/`. The script uses `better-sqlite3` (Node.js only) and is not shipped to the browser.

### 3. Configure environment (optional)

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Without Supabase configured the game runs entirely in guest mode (100% offline, localStorage only). Auth, cloud sync, and teacher features require a Supabase project.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public key** into `.env.local`.
3. In the Supabase SQL Editor, run the full migration:
   ```
   supabase/migrations/20260306_rls_policies.sql
   ```
   This creates all tables, enables Row Level Security, and sets up the `custom_databases` Storage bucket.
4. Verify the `custom_databases` bucket exists under **Storage** in your Supabase dashboard.

### Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User profile — username, role (`student` / `teacher`), class membership |
| `quest_progress` | Per-user quest state — attempts, hints used, completion time, last query |
| `user_achievements` | Earned achievement IDs per user |
| `classes` | Teacher-owned classes with invite codes |
| `custom_quests` | Teacher-authored quests — narrative, expected SQL, link to custom `.sqlite` |

---

## Project Structure

```
src/
  app/
    page.tsx                      # Home / world map
    play/
      [locationId]/               # Built-in location lobby
        [buildingId]/             # Quest interior + SQL terminal
      custom/[questId]/           # Custom quest player
    archmage-tower/
      apprentices/                # Teacher roster page
      forge/                      # Quest Forge (5-step form)
    auth/login/                   # Auth page
  components/
    game/                         # NPCDialogue, CaseFile, HintSystem, CaseSolved, WorldMap, ...
    ui/                           # MagicalButton, shared primitives
  hooks/
    useAuth.ts                    # Supabase auth state
    useCustomSQLEngine.ts         # Loads remote .sqlite, runs expected SQL
    useSQLEngine.ts               # Built-in location SQL execution
    useGameStore.ts               # Zustand store (progress, achievements, sync)
  lib/
    sql-engine.ts                 # sql.js wrapper, DB cache, loadDatabaseFromUrl
    supabase.ts                   # Typed Supabase client + all DB helpers
    achievements.ts               # Achievement definitions and evaluator
    quests/                       # Quest data for each location
  middleware.ts                   # Teacher-only route guard for /archmage-tower
scripts/
  build-databases.ts              # Generates public/databases/*.sqlite at build time
supabase/
  migrations/
    20260306_rls_policies.sql     # Full RLS + Storage bucket setup
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:db` | Compile SQLite databases from seed scripts |
| `npm run lint` | ESLint check |

---

## Custom Quest Flow

1. **Teacher** opens the Quest Forge (`/archmage-tower/forge`) and completes the 5-step form:
   - Quest metadata (title, location, difficulty)
   - Narrative / case description
   - Expected SQL answer
   - DDL + seed data SQL
   - Review and publish
2. The DDL runs in an in-browser sql.js instance. The resulting database is exported as a binary and uploaded to Supabase Storage.
3. The quest record (including the public database URL) is saved to the `custom_quests` table.
4. **Students** click the Notice Board on the world map, enter the quest code, and are routed to `/play/custom/[questId]`.
5. The custom quest player fetches the remote `.sqlite`, executes the teacher's `expectedSql` to derive the correct result set, then validates student submissions against it.

---

## Production Deployment

1. Run `npm run build:db` to generate SQLite files.
2. Run `npm run build` to verify a clean production build.
3. Apply `supabase/migrations/20260306_rls_policies.sql` in your production Supabase project.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your hosting environment.
5. Deploy — the app is compatible with Vercel, Netlify, and any Node.js host.
