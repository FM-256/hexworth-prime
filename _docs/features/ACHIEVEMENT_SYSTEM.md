# Achievement System

**Status:** SHIPPED
**Components:** `AchievementManager.js` (1,769 lines), `AchievementSystem.js` (2,973 lines), `AchievementRegistry.js` (802 lines), `AchievementPanel.js` (1,153 lines)
**Location:** `_app/components/Achievement*.js`
**Added:** v3.0.0 (Manager), expanded through v6.0.0 (Registry + auto-generation)
**Last reviewed:** 2026-04-05

## Purpose

The Achievement System is the gamification backbone of Hexworth Prime. It tracks student
progress across every dimension — modules completed, quizzes passed, streaks maintained,
houses explored, secrets discovered, games won — and rewards milestones with badges,
titles, XP, and visual notifications.

With ~1,900-2,300 total achievements (120 hand-crafted + ~1,400 system-defined +
~400-600 auto-generated from content), it's one of the largest subsystems in the platform.

## Architecture — Four Components

The system evolved over three phases, resulting in four components that work together:

```
AchievementManager.js (v1 — legacy)
  |-- Original 120+ hand-crafted achievements
  |-- Title building system ("Alice, Master of Shadows, the Swift")
  |-- Discovery points (separate XP pool)
  |-- Writes to localStorage v1: hexworth_achievements (array)

AchievementSystem.js (v2 — modern)
  |-- 1,400+ system-wide definitions (incl. per-module, per-house)
  |-- Category-based organization (20+ categories)
  |-- Rarity tiers (Common, Uncommon, Rare, Epic)
  |-- Writes to localStorage v2: hexworth_achievements_v2 (object)

AchievementRegistry.js (merge engine)
  |-- Unifies Manager + System into single API
  |-- Auto-generates achievements from ContentCatalog
  |-- Handles v1→v2 migration and reconciliation
  |-- 13 overlapping IDs merged (System description + Manager title)

AchievementPanel.js (UI)
  |-- Gallery with search, filter, sort, pagination (60 per page)
  |-- Toast notifications with particle effects and audio
  |-- Rarity-based visual styles (glitch, golden, cosmic, retro)
  |-- Category sidebar with progress bars
```

## Achievement Categories

| Category | Examples | Count |
|----------|---------|-------|
| Getting Started | first_visit, sorted, first_module | ~10 |
| Quizzes | first_quiz, perfect_score, quiz_master_10/25 | ~20 |
| House Mastery | {house}_apprentice, {house}_master (per house) | ~80 |
| Level & XP | auto_xp_1000 through auto_xp_100000 (6 tiers) | ~6 |
| Streaks | auto_streak_3 through auto_streak_365 (8 tiers) | ~8 |
| Dark Arts | gate_1 through gate_5, dark-arts-master | ~10 |
| Games | game_brick, game_printer, game_jeopardy + 50 more | ~55 |
| CLI Mastery | cli_recruit through cli_master (10 tiers) | ~10 |
| Pixel Runners | game_packetrun, game_bitdash, game_shellsprint | ~10 |
| Text Adventures | game_sudo, game_nmap, game_incident + 7 more | ~10 |
| Career Paths | career branch achievements | varies |
| Operator | matrix-related achievements | varies |
| Seasonal | time-based, seasonal events | varies |
| Easter Eggs | konami, the_answer, world_traveler, source_code | ~10 |
| Prestige | all houses complete, legendary tiers | ~5 |
| Auto-generated | per-module quiz/lab, house milestones, streaks, XP | ~400-600 |

## Unlock Flow

```
Event triggers (quiz passed, module completed, game won, etc.)
  |
  |-- AchievementManager.unlock(id) OR AchievementSystem.unlock(id)
  |     |-- Write to localStorage (v1 array AND/OR v2 object)
  |     |-- Add discovery points to hexworth_discovery_points
  |
  |-- Notification chain:
  |     |-- AchievementPanel.queueNotification(def) if loaded
  |     |-- Fallback: showUnlockNotification() (built-in toast)
  |     |-- Audio: 3-note arpeggio (C5-E5-G5), 4-note for legendary (adds C6)
  |     |-- Particle burst: 8 radiating particles
  |
  |-- Meta-achievement check (delayed 1.5s):
  |     |-- "secret_hunter" if 5+ secrets unlocked
  |     |-- "completionist" if all achievements unlocked
  |     |-- House milestone tiers (25%, 50%, 75%, 100%)
  |
  |-- Activity queue:
  |     |-- Push to hexworth_activity_queue (dashboard feed)
  |     |-- Fire hexworth:achievementUnlocked CustomEvent
  |
  |-- Firestore sync (if authenticated):
        |-- achievements[] array in user profile
        |-- XP recalculation
```

## Retroactive Checking

On every page load, the system scans localStorage for achievements that should
have been granted but weren't (e.g., student completed modules before the
achievement system was added):

**AchievementManager.checkImplicitAchievements():**
- House sorting status → `sorted`
- Divergent/house hopper flags → `divergent`, `house_hopper`
- God mode session flag → `god_mode`
- Streak counts → `streak_3`, `streak_7`, `streak_30`
- Time of day → `night_owl` (0:00-4:00 AM), `early_bird` (5:00-7:00 AM)
- Dark Arts gate flags → `gate_1` through `gate_5`
- Module counts per house → `{house}_apprentice` (5+), `{house}_master` (all)
- Quiz counts → `first_quiz`, `quiz_master_10`, `quiz_master_25`
- CLI module ranges → `cli_recruit` through `cli_master`

## Auto-Generation from ContentCatalog

When ContentCatalog is available, **AchievementRegistry.generateFromCatalog()** creates:

- **Per-module quiz:** `pass_quiz_{id}` (50 pts), `perfect_quiz_{id}` (100 pts, secret), `speed_quiz_{id}` (75 pts, secret)
- **Per-module lab:** `complete_lab_{id}` (75 pts), `speed_lab_{id}` (100 pts, secret)
- **House milestones:** 25%/50%/75%/100% completion + all-perfect + speedrun per house
- **Streak tiers:** 3/7/14/30/60/100/200/365 days
- **XP milestones:** 1K/5K/10K/25K/50K/100K total XP

All auto-generated achievements have `autoGenerated: true` and are assigned
appropriate categories for the panel sidebar.

## Title Building

Achievements grant titles that compose into a dynamic title string:

```
{Username}, {Title1}, {Title2}, {Title3}
```

Examples:
- "Alice, Master of Shadows, the Swift, the Divergent"
- "Bob, Master of Web, Seeker of Knowledge, Dedicated"

**Short title priority** (for space-constrained displays):
1. `cli_master` → "Grandmaster of the CLI"
2. `completionist` → "the Complete"
3. `cli_blackout` → "Shadow Operative"
4. `cli_ghost` → "the Ghost"
5. `first_blood` → "First of Their Name"
6. `divergent` → "the Divergent"
7. `god_mode` → "the All-Seeing"

Some titles use `{house}` substitution: `sorted` → "of House {house}"

## Notification Styles

| Style | Trigger | Visual |
|-------|---------|--------|
| Default | Standard achievements | Gold border, gold glow |
| Glitch | Secret achievements | Magenta border, cyan/red chromatic aberration |
| Golden | god_mode unlock | Warm gold gradient |
| Retro | konami code | Green monospace, CRT scanlines |
| Legendary | legendary category | Prismatic gradient border |
| Cosmic | 100K+ XP milestone | Purple border, orbital glow |

## Storage

| Key | Storage | Format | Purpose |
|-----|---------|--------|---------|
| `hexworth_achievements` | localStorage | Array of string IDs | v1 legacy (content pages write here) |
| `hexworth_achievements_v2` | localStorage | `{ version: 2, unlocked: { [id]: { unlockedAt, source } } }` | v2 unified (O(1) lookups, timestamps) |
| `hexworth_discovery_points` | localStorage | Number | XP earned from achievements (separate pool) |
| `achievements` | Firestore `users/{uid}` | Array of string IDs | Cloud backup, profile display |

**Migration:** On init, Registry reads v2. If missing, reads v1 and reconciles into v2.
Content pages only write to v1 (they don't load Registry). Registry merges on next load.

## XP Integration

Achievements contribute to XP in two ways:

1. **Discovery Points** — Each achievement has a `points` field (25-2500 range).
   Accumulated in `hexworth_discovery_points`, added to total XP.

2. **Leaderboard calculation:**
   ```
   totalXP = (modulesCompleted * 75) + (streak * 10) + discoveryPoints
   ```

## Panel UI

The AchievementPanel renders a full gallery:

- **Stats bar:** Unlocked/total count, discovery points, completion percentage
- **Category sidebar:** Per-category progress bars, click to filter
- **Search:** Fuzzy match on ID, name, description
- **Filters:** All / Unlocked / Locked / Secret
- **Sort:** Name (A-Z), Points (high→low), Date (newest first)
- **Pagination:** 60 cards per page
- **Card states:** Unlocked (full color, badge image), Locked (grayscale), Secret locked ("???")
- **NEW badge:** Shown for 48 hours after unlock

## Key Decisions

- **Four components instead of one** — The system evolved across three development phases.
  Manager was v1 (hand-crafted), System was v2 (scalable), Registry merges them. Rewriting
  into a single component would break backward compatibility with content pages that
  reference AchievementManager directly.

- **v1 + v2 dual storage** — Content pages (3,884 HTML files) only write to v1 array.
  Loading the full Registry on every page would add 5KB+ of JavaScript. Instead, content
  pages write to v1, and Registry reconciles v1→v2 on dashboard/panel load.

- **Auto-generation from ContentCatalog** — Instead of manually defining achievements for
  every new module/quiz/lab, the Registry generates them dynamically. Adding a new module
  to ContentCatalog automatically creates 2-3 new achievements with no code changes.

- **Discovery points as separate pool** — Achievement XP is tracked independently from
  module XP. This allows leaderboard calculations to weight different XP sources and
  prevents achievement farming from dominating the leaderboard.

- **Secret achievements hidden until unlocked** — Locked secrets show "???" for name and
  description. This encourages exploration and prevents students from gaming the system
  by reading unlock conditions from the panel.

## Known Limitations

- **13 overlapping IDs** — Manager and System both define `sorted`, `first_module`,
  `first_quiz`, `perfect_score`, and 9 others. Registry merges them (System description +
  Manager title), but the overlap creates maintenance confusion.

- **No server-side achievement validation** — All achievements are client-side localStorage.
  A student who manually writes to localStorage can fake any achievement. TripWire detects
  some tampering, but achievement-specific validation doesn't exist.

- **Tourist mode blocks achievements** — `TouristVisa.js` intercepts achievement saves.
  Students browsing without sorting cannot earn achievements, which may confuse users
  who complete content but see no unlock notifications.

- **Panel pagination at 60 cards** — With ~2,000 achievements, browsing is slow.
  Category filtering helps but the "All" view loads 60 cards at a time across 30+ pages.

- **Audio notifications require user interaction** — Browser autoplay policies block the
  achievement sound on first unlock if the user hasn't interacted with the page. The
  arpeggio plays silently on first load, then works on subsequent unlocks.
