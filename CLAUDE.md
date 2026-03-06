# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SQL Quest: The Realm of Syntaxia** — an educational browser-based game where players learn SQL by solving medieval fantasy mysteries through a point-and-click interface. Targeted at college students. Free to play, no login required to start.

## Commands

This project does not yet have a codebase initialized. When the Next.js project is scaffolded, standard commands will be:

```bash
# Development
pnpm dev          # Start Next.js dev server

# Build
pnpm build        # Production build
pnpm start        # Start production server

# Linting & Formatting
pnpm lint         # ESLint
pnpm format       # Prettier

# Database generation (run after editing seed SQL files)
pnpm tsx scripts/build-databases.ts   # Generates .sqlite files into /public/databases/
```

## Tech Stack

- **Next.js 14+** with App Router, TypeScript (strict — no `any`)
- **Tailwind CSS** — all styling; no separate CSS files except `globals.css`
- **sql.js** — SQLite compiled to WASM, runs entirely in-browser
- **CodeMirror 6** via `@uiw/react-codemirror` — SQL editor (not Monaco)
- **Framer Motion** — animations and transitions
- **Supabase** — auth + server-side PostgreSQL (game must work without login via localStorage)
- **Zustand** — state management (alternative: React Context + useReducer)
- **better-sqlite3** — build-time only, in `scripts/build-databases.ts` to generate `.sqlite` files

## Architecture

### Core Gameplay Data Flow
1. Player navigates to a location → React fetches `/public/databases/<location>_db.sqlite`
2. `sql.js` loads the file into browser memory (cached — no re-fetch on revisit)
3. Player writes SQL in CodeMirror → clicks "Cast Spell" → `sql.js` executes locally
4. `query-validator.ts` compares result set (columns + rows) against `expectedResult` — not the query text
5. Correct → "CASE SOLVED" animation + progress saved to Supabase (or localStorage if guest)

### Key Modules
- `src/lib/sql-engine.ts` — wraps sql.js: load/cache databases, execute queries, reset, themed error messages
- `src/lib/query-validator.ts` — result-set comparison (multiple valid queries can solve the same case)
- `src/lib/supabase.ts` — all Supabase calls go here only
- `src/lib/game-data.ts` — quest/case definitions

### Route Structure
```
/                        # Landing/title screen
/play                    # World map
/play/[locationId]       # Street view
/play/[locationId]/[buildingId]  # Interior + SQL terminal (main gameplay)
/auth/login
/auth/register
/dashboard               # Teacher admin panel (Archmage's Tower)
/profile
```

### Game Locations & Databases

| Location | Database | SQL Focus | Unlock Condition |
|---|---|---|---|
| The Grand Archives | `archives_db` | SELECT, WHERE, AND/OR | Available from start |
| The Apothecary Syndicate | `apothecary_db` | ORDER BY, LIMIT, basic JOIN | 2 Archives quests done |
| The Beastmaster's Outpost | `beast_db` | COUNT, GROUP BY, SUM, HAVING | 2 Apothecary quests done |
| The Shadow Market | `underworld_db` | Multi-JOIN, subqueries, LIKE, IN | 2 Beastmaster quests done |

### Quest Data Shape
Each quest in `src/data/quests/` must be a typed TypeScript object (not JSON) with:
- `id`, `locationId`, `title`, `difficulty` (`beginner | intermediate | advanced`)
- `sqlConcepts`, `narrative`, `npcDialogue`, `hints` (array, revealed progressively)
- `expectedResult` (columns + rows), `sampleSolution`, `successMessage`
- `prerequisiteQuestIds`

### Supabase Schema (server-side PostgreSQL)
- `profiles` — user info, role (`student | teacher | admin`)
- `classes` — teacher-student groupings with invite codes
- `quest_progress` — completed quests, hints used, attempts, time, submitted query
- `user_achievements` — earned achievements per user
- `custom_cases` — teacher-created scenarios

All tables have Row Level Security (RLS) enabled.

### Component Organization
- `src/components/game/` — gameplay components (SQLTerminal, WorldMap, NPCDialogue, etc.)
- `src/components/ui/` — reusable UI primitives (MagicalButton, ParchmentPanel, etc.)
- `src/components/teacher/` — admin panel components
- `src/components/layout/` — Navbar, Sidebar, Footer

### sql.js / WASM Setup
Must copy `sql-wasm.wasm` to `/public/` during build. Initialize with:
```ts
initSqlJs({ locateFile: file => `/sql-wasm.wasm` })
```

`next.config.js` requires webpack fallbacks:
```js
config.resolve.fallback = { fs: false, path: false, crypto: false };
```

## Code Style Rules
- Functional components only; no class components
- Custom hooks for all reusable logic (`src/hooks/`)
- Keep components under 150 lines
- All data files (quests, NPCs, locations) are typed TypeScript objects, not JSON
- JSDoc comments on all exported functions and hooks

## Game Theming Vocabulary
SQL errors display as "spell misfires." In UI copy: queries = "incantations/spells," tables = "scrolls/ledgers," results = "revelations." Use standard names in code; theme only in user-facing strings.

## Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_NAME=SQL Quest: The Realm of Syntaxia
NEXT_PUBLIC_APP_URL=
```

## Development Priorities (in order)
1. Core gameplay loop (navigate → read quest → write SQL → feedback)
2. All 4 locations with databases, NPCs, quests
3. Visual polish, animations, achievements
4. Auth & Supabase backend
5. Teacher dashboard features

## Importint notes 
- Use PostgreSQL syntax for Supabase backend queries, but strictly use SQLite syntax for all game-level seed files and in-browser validations.