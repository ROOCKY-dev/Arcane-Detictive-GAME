# SQL Quest: The Realm of Syntaxia

## Overview
An educational web app game where players learn SQL by solving medieval fantasy mysteries. 
Players are "Inquisitors of the Ledger" who cast "spells" (SQL queries) to solve lighthearted 
crimes in a point-and-click medieval world. The game is FREE, browser-based, aimed at 
college students, with optional teacher admin features.

## Core Concept
- **Theme:** Medieval fantasy where magic IS code (SQL queries = incantations/spells)
- **Gameplay:** Point-and-click adventure + SQL query writing
- **Inspiration:** "SQL Murder Mystery" / "Database Detective" style games
- **Target Audience:** College students learning SQL, with teacher oversight features
- **Monetization:** Free with optional unobtrusive banner ads + "Buy me a coffee" donation link

## The Hook
Players don't "write SQL queries" — they "cast spells by inscribing incantations on enchanted 
parchment." Syntax errors are "magical misfires" with a puff of purple smoke. Correct queries 
trigger "CASE SOLVED" animations with magical chimes.

## Key Design Decisions
1. **In-Browser SQL Execution** — SQL runs locally via sql.js (SQLite compiled to WebAssembly). 
   Zero server database costs. Players can safely run destructive queries; just refresh to reset.
2. **Point-and-Click Navigation** — No character movement. Click city → click street → click 
   building → interact with "Enchanted Terminal" to write SQL.
3. **Modular Location System** — Each location has its own `.sqlite` database file, loaded 
   on-demand. New locations = new images + new `.sqlite` + new quest text.
4. **Progressive Difficulty** — Locations unlock sequentially, teaching SQL concepts from 
   basic SELECT to complex JOINs and subqueries.

## Player Role
- **Title:** Inquisitor of the Ledger
- **Job:** Solve magical misdemeanors across the Realm of Syntaxia
- **Tone:** Lighthearted, bureaucratic humor (even powerful wizards deal with paperwork)

## World Name
**The Realm of Syntaxia** — A kingdom governed by absolute logic where "Magic" is the art 
of querying the underlying fabric of reality.

## Game Scale (MVP)
- **4 locations** with unique databases and NPCs
- **12-15 total quests/cases** (~3-4 per location)
- **~1-2 hours** of gameplay
- Expandable: add new location = 1 image + 1 `.sqlite` + 3 quests