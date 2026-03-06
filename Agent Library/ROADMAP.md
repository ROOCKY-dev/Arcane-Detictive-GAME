# Development Roadmap

## Phase 1: Foundation (Week 1-2)
### Goal: Basic game loop works — navigate, read quest, write SQL, get feedback

- [ ] Initialize Next.js project with TypeScript + Tailwind CSS
- [ ] Set up project directory structure
- [ ] Install and configure sql.js (WebAssembly SQLite)
- [ ] Create `sql-engine.ts` wrapper module
  - [ ] Load .sqlite files from /public
  - [ ] Execute queries and return typed results
  - [ ] Error handling with themed messages
  - [ ] Database reset functionality
- [ ] Create first seed database (`archives_db`) and build script
- [ ] Build `SQLTerminal` component with CodeMirror 6
  - [ ] SQL syntax highlighting
  - [ ] Execute button ("Cast Spell")
  - [ ] Results table display
  - [ ] Error display ("Spell Misfire")
- [ ] Build `CaseFile` component (quest narrative + schema viewer)
- [ ] Build `QueryResults` component (styled table)
- [ ] Implement `query-validator.ts` (compare results against expected)
- [ ] Build basic Interior View page with split-screen layout
- [ ] Create first 2 quests for The Grand Archives
- [ ] Test full gameplay loop: read quest → write SQL → execute → correct/incorrect feedback

## Phase 2: Navigation & World (Week 2-3)
### Goal: Full point-and-click navigation with all 4 locations

- [ ] Build `WorldMap` component with clickable location nodes
- [ ] Build `StreetView` component with clickable buildings
- [ ] Build `InteriorView` component as the gameplay screen wrapper
- [ ] Implement location unlocking logic (progressive access)
- [ ] Create placeholder images for all locations (can use solid colors initially)
- [ ] Build `NPCDialogue` component (modal overlay with portrait + text)
- [ ] Create all 4 seed databases and build script
- [ ] Implement navigation state management (current location, accessible buildings)
- [ ] Add page transitions with Framer Motion
- [ ] Create route structure: `/play` → `/play/[locationId]` → `/play/[locationId]/[buildingId]`

## Phase 3: Content & Polish (Week 3-4)
### Goal: All quests created, hints system, achievements, visual polish

- [ ] Write all 12-15 quests across 4 locations with:
  - [ ] Quest narrative text
  - [ ] NPC dialogue
  - [ ] Progressive hints (3 per quest)
  - [ ] Expected results
  - [ ] Sample solutions
  - [ ] Success messages
- [ ] Build `HintSystem` component (progressive reveal, timed or on-demand)
- [ ] Build `CaseSolved` component (celebration animation)
- [ ] Implement achievements system
- [ ] Build `AchievementBadge` component
- [ ] Build `SchemaViewer` component (collapsible table/column browser)
- [ ] Add all AI-generated art assets
- [ ] Apply medieval CSS theming (parchment textures, glowing borders)
- [ ] Add sound effects (optional: magical chime, spell misfire poof)
- [ ] Progress saving to localStorage (for guest users)
- [ ] Responsive design pass (mobile + tablet)

## Phase 4: Auth & Backend (Week 4-5)
### Goal: User accounts with persistent progress

- [ ] Set up Supabase project
- [ ] Create Supabase tables:
  - [ ] `profiles` (id, username, email, role, created_at)
  - [ ] `progress` (user_id, quest_id, completed, hints_used, time_seconds, completed_at)
  - [ ] `achievements` (user_id, achievement_id, earned_at)
- [ ] Implement Supabase Auth (email/password registration + login)
- [ ] Build Login/Register pages
- [ ] Sync localStorage progress → Supabase on login
- [ ] Build user profile page (show progress, achievements)
- [ ] Add role selection (Student / Teacher) during registration

## Phase 5: Teacher Features (Week 5-6)
### Goal: Teacher admin panel with analytics and custom case creation

- [ ] Build teacher dashboard layout (`/dashboard`)
- [ ] Implement class creation (invite codes for students)
- [ ] Build `StudentList` component (see enrolled students + their progress)
- [ ] Build `AnalyticsChart` component:
  - [ ] Which quests are completed most/least
  - [ ] Where students get stuck (most failed attempts)
  - [ ] Average time per quest
  - [ ] Hints usage statistics
- [ ] Build `CaseCreator` component (stretch goal):
  - [ ] Upload CSV → auto-generate SQLite database
  - [ ] Write quest narrative, hints, expected result
  - [ ] Publish custom cases to their class
- [ ] Teacher can view individual student's query history

## Phase 6: Launch Prep (Week 6-7)
### Goal: Production-ready deployment

- [ ] Set up Vercel deployment with GitHub auto-deploy
- [ ] Configure environment variables (.env for Supabase keys)
- [ ] SEO meta tags and Open Graph images
- [ ] Landing page with game description + screenshots
- [ ] Add optional ad placement (non-intrusive sidebar banner)
- [ ] Add "Buy me a coffee" donation link
- [ ] Performance audit (Lighthouse score >90)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Write README.md for GitHub (portfolio piece)
- [ ] Create demo video / GIF for README
- [ ] Deploy to production! 🚀

## Stretch Goals (Post-Launch)
- [ ] Leaderboard (fastest solve times)
- [ ] Daily challenge quests
- [ ] Multiplayer mode (race to solve)
- [ ] New expansion locations (Dwarven Forge, Pirate Harbor, etc.)
- [ ] Community-submitted quests
- [ ] Localization (multiple languages)
- [ ] Dark mode / Light mode toggle (Dark Sorcery vs Light Magic theme)
- [ ] PWA support (installable on phone)