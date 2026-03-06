# Agent Instructions

## Project Context
You are building "SQL Quest: The Realm of Syntaxia" — an educational web app game where 
players learn SQL by solving medieval fantasy mysteries through a point-and-click interface. 
This is a free, browser-based game aimed at college students.

## Your Role
You are the primary developer building this from scratch. Follow these principles:

### Development Priorities (in order)
1. **Core gameplay loop first** — Player can navigate to a location, see a quest, write SQL, 
   execute it, and get feedback (correct/incorrect)
2. **Content second** — Add all 4 locations with their databases, NPCs, and quests
3. **Polish third** — Animations, sound effects, achievements, responsive design
4. **Auth & backend fourth** — User accounts, progress saving, teacher features

### Technical Guidelines
- Use **TypeScript** strictly — no `any` types unless absolutely necessary
- Use **Next.js 14+** with App Router
- Use **Tailwind CSS** for all styling — no separate CSS files except globals.css
- Use **CodeMirror 6** for the SQL editor (NOT Monaco — too heavy for this use case)
- Use **sql.js** for in-browser SQL execution
- Use **Framer Motion** for animations
- Use **Supabase** for auth and server-side data (but the game MUST work without login 
  using localStorage)
- All game state should work offline/without auth; Supabase is for persistence only

### Code Style
- Functional components only (no class components)
- Custom hooks for all reusable logic
- Keep components small and focused (<150 lines)
- Use descriptive variable names that match the game's medieval theme in comments 
  but standard naming in code
- All data files (quests, NPCs, locations) should be typed TypeScript objects, NOT JSON files
- Write JSDoc comments for all exported functions and hooks

### File Organization Rules
- Game components go in `src/components/game/`
- UI primitives go in `src/components/ui/`
- Teacher/admin components go in `src/components/teacher/`
- All Supabase calls go through `src/lib/supabase.ts`
- All sql.js calls go through `src/lib/sql-engine.ts`
- Quest data is organized by location in `src/data/quests/`

### SQL Engine Rules
- The `sql-engine.ts` module should:
  - Fetch and cache `.sqlite` files (don't re-fetch if already loaded)
  - Expose a simple `executeQuery(sql: string): QueryResult` interface
  - Handle errors gracefully and return user-friendly error messages themed as 
    "spell misfires"
  - Support loading different databases when player changes location
  - Include a `resetDatabase(locationId: string)` function

### Query Validation Rules
- The `query-validator.ts` module should:
  - Compare query results against expected results (not the query text itself)
  - Multiple valid queries can solve the same case (don't check exact SQL match)
  - Check that the result set matches expected columns AND rows
  - Optionally award "bonus" for optimal queries (fewer characters, no unnecessary columns)

### Quest Data Structure
Each quest should contain:
  - `id`: unique identifier
  - `locationId`: which location this quest belongs to
  - `title`: the quest name (e.g., "The Stolen Artifact")
  - `difficulty`: 'beginner' | 'intermediate' | 'advanced'
  - `sqlConcepts`: array of SQL concepts tested (e.g., ['SELECT', 'WHERE', 'AND'])
  - `narrative`: the story text shown to the player
  - `npcDialogue`: what the NPC says when presenting the case
  - `hints`: array of progressive hints (revealed one at a time)
  - `expectedResult`: the correct query result (columns + rows)
  - `sampleSolution`: one valid SQL solution (shown after solving or giving up)
  - `successMessage`: congratulatory text from NPC
  - `prerequisiteQuestIds`: quests that must be completed first (for ordering)

### Accessibility
- All images must have descriptive alt text
- The SQL editor must be keyboard-navigable
- Color is never the sole indicator of state (use icons + text too)
- Minimum font size 14px for body text, 16px for code

### Performance
- Lazy-load `.sqlite` files only when a location is accessed
- Lazy-load location images
- Use Next.js Image component for all images
- Keep the initial bundle under 500KB (before images)

### Error Handling
- SQL errors display as themed "spell misfire" messages with the actual error underneath
- Network errors (loading .sqlite) show a "The magical connection has been disrupted" message
- Always provide a retry option
- Never show raw stack traces to users