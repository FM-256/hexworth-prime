# Handler Comms

**Component:** ActivityFeed.js, HandlerDirectives.js, DailyDirectives.js
**Location:** `_app/components/`
**Dashboard Section:** Community tab > Handler Comms panel
**Added:** v5.0.0 (2026-02-28)

## Purpose

Handler Comms is the activity feed on the student dashboard. It presents platform activity as intercepted intelligence communications between the student (agent) and their handler, reinforcing the spy/handler narrative that runs through the platform.

Without it, students have no sense of momentum — they complete modules and quizzes but nothing reflects that progress back to them in real time. Handler Comms solves this by surfacing achievements, streaks, directives, intel reports, and daily missions in a single feed that feels alive and responsive.

## What It Does

### Activity Feed (ActivityFeed.js)

The core feed that records, stores, and renders activity events. Events appear as styled terminal-style entries with colored left borders, type-specific icons, and military timestamps (e.g., "2H AGO", "JUST NOW", "15/02").

**Event types:**

| Type | Icon | Prefix | Color | Trigger |
|------|------|--------|-------|---------|
| `module_complete` | ✓ | INTEL ACQUIRED | #4ade80 | Student completes a module |
| `achievement_unlock` | ★ | COMMENDATION | #fbbf24 | Achievement unlocked |
| `xp_gain` | + | XP ACQUIRED | #60a5fa | XP awarded |
| `level_up` | ▲ | RANK ADVANCEMENT | #a78bfa | Level threshold crossed |
| `login` | ◉ | CONNECTION | #22d3ee | Daily dashboard visit (1/day max) |
| `streak` | - | STREAK BONUS | #f97316 | Streak milestone |
| `house_join` | ⌂ | ASSIGNMENT | #ec4899 | Student joins a house |
| `mission_complete` | ◆ | MISSION COMPLETE | #10b981 | Mission completed |
| `leaderboard_rank` | ↑ | RANK CHANGE | #8b5cf6 | Leaderboard position change |
| `directive` | ⚐ | DIRECTIVE | #f59e0b | Smart nudge from handler |
| `intel` | ◈ | INTEL REPORT | #38bdf8 | Status/session summary |
| `directive_complete` | ✦ | MISSION COMPLETE | #4ade80 | Daily/weekly mission claimed |
| `system` | ⚡ | HANDLER | #94a3b8 | System message |

**Storage:** `hexworth_activity_feed` (localStorage), max 50 events.

**Deduplication:** Login events are limited to 1 per day. On init, the feed cleans up historical login spam — deduplicates per day and keeps only the 3 most recent login events. All events are sorted by timestamp.

**Event queue:** Module pages don't load ActivityFeed.js. Instead, ModuleProgress.js and AchievementManager.js write events to `hexworth_activity_queue` (localStorage, capped at 50). ActivityFeed drains this queue on dashboard load via `drainQueue()`.

### Smart Nudges (HandlerDirectives.js)

Analyzes student progress on dashboard load and injects up to 3 personalized directive messages into the feed. These act as contextual guidance — the "handler" noticing patterns and nudging the student.

**Nudge categories (priority order):**

| Priority | Nudge | Condition |
|----------|-------|-----------|
| 100 | Inactivity | No visit in 3+ days |
| 90 | Streak at risk | Active streak, last visit was yesterday (not today) |
| 85 | New content | Platform version changed since last visit |
| 80 | Near completion | Any house at 70-99% progress |
| 70 | Resume | Suggests next incomplete module in most recent house |
| 50 | Milestone | Within 2 levels of a milestone (10, 20, 30, 50, 75, 100) |
| 40 | Quiz retry | Any quiz scored below 80% |
| 30 | Explore | 3+ houses unexplored, suggests a random one |

**Same-day dedup:** Each directive message is hashed. Once shown, the hash is stored in `hexworth_directives_shown_v2` and won't repeat that day. Resets at midnight.

### Intel Reports (HandlerDirectives.js)

Status summaries injected as blue `intel` events. Three report types:

- **Session summary** — Fires when last session was 1+ hours ago. Shows modules completed and XP gained last session.
- **Weekly debrief** — Monday only, once per week. Summarizes modules, quizzes, and XP for the past 7 days.
- **Overall status** — Daily. Shows total modules, level, XP, and streak. Counts modules from all storage formats (houses structure, completedModules array, standalone counter).

**Same-day dedup:** Uses `hexworth_intel_shown_v2`, same mechanism as directives.

### Daily Missions (DailyDirectives.js)

Generates 1 daily + 1 weekly micro-mission with bonus XP rewards. Missions are deterministically seeded by date/week number so all students see the same mission on the same day.

**Daily missions (1 per day, rotates):**

| Mission | XP | Check |
|---------|----|-------|
| Complete any module | 50 | Any module completed today |
| Pass a quiz with 80%+ | 75 | Any quiz scored 80%+ today |
| Complete 2 modules in one session | 100 | 2+ modules completed today |
| Visit a house you haven't started | 50 | First module in a new house today |

**Weekly missions (1 per week, rotates):**

| Mission | XP | Check |
|---------|----|-------|
| Complete 5 modules this week | 250 | 5+ modules since Sunday |
| Pass 3 quizzes this week | 200 | 3+ quizzes since Sunday |
| Maintain a 7-day streak | 300 | Streak counter >= 7 |

**Pinned UI:** Missions render as a pinned section at the top of Handler Comms, between the header and the event feed. Each row shows status (pending/ready/claimed), description, and XP reward. Completed missions show a green "claim" button that awards bonus XP on click.

**Storage:** `hexworth_daily_directives` tracks completion and claim state per mission seed.

## Architecture

```
Dashboard load
  │
  ├── ActivityFeed.init()          ← Load events from localStorage, dedup logins
  ├── ActivityFeed.render()        ← Render feed + drain event queue
  │     └── DailyDirectives.renderPinned()  ← Pinned missions section
  │
  ├── HandlerDirectives.inject()   ← Analyze progress → up to 3 directive events
  ├── HandlerDirectives.injectIntel()  ← Session/weekly/overall intel events
  ├── HandlerDirectives.snapshotSession()  ← Save current stats for next session diff
  │
  ├── DailyDirectives.inject()     ← Announce today's mission (once per day)
  │
  └── ActivityFeed.login(streak)   ← Record CONNECTION event (once per day)
```

**Script load order:** ActivityFeed.js → HandlerDirectives.js → DailyDirectives.js

**Data sources:** All read from localStorage — no Firestore calls. Progress data via `ProgressManager.getProgress()` when available, falls back to raw `hexworth_progress` key.

## Theming

Supports two visual themes:
- **Default (cyber):** Dark green terminal aesthetic, green accents, green status dot
- **Magic theme:** Purple accents via `.theme-magic` CSS class overrides

## Why It Exists

1. **Retention loop** — Daily missions and streak tracking give students a reason to return every day. The XP bonuses are small but visible.
2. **Progress visibility** — Students often don't realize how much they've done. The intel reports and overall status surface cumulative progress that would otherwise be invisible.
3. **Guided exploration** — Smart nudges steer students toward incomplete content, retry opportunities, and unexplored houses without being prescriptive.
4. **Narrative immersion** — Every platform interaction is framed as spy communications. This isn't a notification feed — it's intercepted handler traffic. The aesthetic reinforces the world-building.
5. **Session bookmarking** — The feed acts as a log of what the student did and when. Useful for picking up where they left off.
