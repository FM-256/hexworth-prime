# CLH-031 Operation BLACKOUT - Level System Design

**Version:** 1.0
**Date:** 2026-01-29
**Status:** APPROVED CONCEPT - Ready for Implementation

---

## Overview

Transform Operation BLACKOUT from a loose collection of puzzles into a structured **9-level tactical operation** with clear progression, ratings, and dynamic SPECTER interruptions.

### Core Principles
1. **One puzzle = One level** - Clear focus, no cognitive overload
2. **Pre-level intel** - Handler provides context BEFORE puzzle activates (solves discoverability issues)
3. **Spy hat ratings** - Performance tracking per level (replaces generic stars)
4. **SPECTER side missions** - Mid-level interruptions add tension and variety

---

## Level Structure

### The 9 Phases

| Level | Codename | Puzzle | Handler Intel Preview |
|-------|----------|--------|----------------------|
| 1 | **LIFELINE** | Patch Panel | "Backup node is offline. Route: A1→B2→C3 to restore connection." |
| 2 | **FORTRESS** | Firewall Config | "Hostile traffic from 10.13.37.66. Your relay is 10.13.37.100. Configure accordingly." |
| 3 | **BREADCRUMB** | Log Analysis | "Check auth.log for anomalies. SPECTER leaves traces - find them." |
| 4 | **CIPHER** | Hash Crack | "Intercepted hash: [hash]. Intel suggests it's MD5. Crack it." |
| 5 | **NEEDLEPOINT** | Regex Filter | "Extract all IP addresses from the dump. Pattern matters." |
| 6 | **KEYMASTER** | Fix Permissions | "Critical files locked down wrong. Restore proper access." |
| 7 | **ROSETTA** | Binary Decode | "Intercepted transmission in binary. Decode the message." |
| 8 | **GHOSTHUNT** | Process Tree | "SPECTER spawned rogue processes. Find and terminate." |
| 9 | **IGNITION** | Restart Services | "Systems are down. Bring critical services back online." |

### Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      LEVEL FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [HANDLER BRIEFING]                                         │
│       ↓                                                     │
│  "Incoming intel..."                                        │
│  Handler types out context with relevant details            │
│  (IPs, file paths, hints - everything user needs)           │
│       ↓                                                     │
│  [PHASE ANNOUNCEMENT]                                       │
│       ↓                                                     │
│  ══════════════════════════════                             │
│   PHASE 2: FORTRESS                                         │
│   "Lock down the perimeter"                                 │
│  ══════════════════════════════                             │
│       ↓                                                     │
│  [PUZZLE ACTIVATES]                                         │
│       ↓                                                     │
│  User solves puzzle (with possible SPECTER interrupts)      │
│       ↓                                                     │
│  [LEVEL COMPLETE CELEBRATION]                               │
│       ↓                                                     │
│  ┌─────────────────────────────┐                            │
│  │  PHASE: FORTRESS COMPLETE   │                            │
│  │                             │                            │
│  │      🎩  🎩  🕵️             │                            │
│  │     (2/3 hats earned)       │                            │
│  │                             │                            │
│  │  ✓ Level completed          │                            │
│  │  ✓ No hints used            │                            │
│  │  ✗ Over par time            │                            │
│  └─────────────────────────────┘                            │
│       ↓                                                     │
│  [NEXT LEVEL HANDLER BRIEFING]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Spy Hat Rating System

### Visual Design

```
Earned:    🎩  (solid fedora/spy hat)
Unearned:  🕵️  (silhouette/outline - or dimmed hat)
```

Alternative: Custom SVG hats that can be filled/unfilled for cleaner look.

### Rating Criteria

| Hat | Name | Requirement |
|-----|------|-------------|
| 🎩 | **Completion** | Finish the level |
| 🎩 | **Silent Op** | No hints requested |
| 🎩 | **Speed Demon** | Under par time + zero mistakes |

### Par Times (Per Level)

| Level | Codename | Recruit Par | Operator Par | Ghost Par |
|-------|----------|-------------|--------------|-----------|
| 1 | LIFELINE | 3 min | 2 min | 1 min |
| 2 | FORTRESS | 4 min | 2.5 min | 1.5 min |
| 3 | BREADCRUMB | 5 min | 3 min | 2 min |
| 4 | CIPHER | 4 min | 2.5 min | 1.5 min |
| 5 | NEEDLEPOINT | 5 min | 3 min | 2 min |
| 6 | KEYMASTER | 4 min | 2.5 min | 1.5 min |
| 7 | ROSETTA | 3 min | 2 min | 1 min |
| 8 | GHOSTHUNT | 5 min | 3 min | 2 min |
| 9 | IGNITION | 4 min | 2.5 min | 1.5 min |

*Note: Par times are estimates - will need playtesting to balance.*

### Mission Summary

At mission complete, show total hats earned:

```
OPERATION BLACKOUT - DEBRIEF

PHASE RESULTS:
LIFELINE    🎩🎩🎩
FORTRESS    🎩🎩🕵️
BREADCRUMB  🎩🎩🎩
CIPHER      🎩🕵️🕵️
...

TOTAL: 21/27 HATS
RATING: SENIOR OPERATIVE
```

### Rating Tiers

| Hats | Title |
|------|-------|
| 27/27 | **LEGENDARY OPERATIVE** |
| 22-26 | **SENIOR OPERATIVE** |
| 16-21 | **FIELD AGENT** |
| 10-15 | **JUNIOR AGENT** |
| 0-9 | **TRAINEE** |

---

## SPECTER Side Missions

### Concept

SPECTER doesn't passively wait - he actively disrupts your mission with **quick mini-game interruptions**. These can trigger mid-level at random intervals (based on difficulty).

### Trigger Frequency

| Difficulty | Side Mission Chance | Max Per Level |
|------------|---------------------|---------------|
| RECRUIT | 20% per 60s | 1 |
| OPERATOR | 35% per 45s | 2 |
| GHOST | 50% per 30s | 3 |

### Side Mission Types

#### 1. LOCKOUT (Typing Challenge)
```
┌─════════════════════════════════════════┐
│  ⚠️ SPECTER INTRUSION: LOCKOUT ⚠️       │
│                                         │
│  "Trying to lock you out, operator..."  │
│                                         │
│  Type the override sequence:            │
│                                         │
│     K-7-X-9-ALPHA-3                     │
│     > _ _ _ _ _ _ _ _ _                 │
│                                         │
│              ⏱️ 10s                      │
└─════════════════════════════════════════┘
```
- **Success:** +15s bonus time
- **Failure:** -30s penalty

#### 2. SCRAMBLE (Unscramble Command)
```
┌─════════════════════════════════════════┐
│  ⚠️ SPECTER INTRUSION: SCRAMBLE ⚠️      │
│                                         │
│  "I've corrupted your terminal..."      │
│                                         │
│  Unscramble this command:               │
│                                         │
│     TCA /CTE/SAPSWD                     │
│     > _ _ _ _ _ _ _ _ _ _ _             │
│                                         │
│              ⏱️ 12s                      │
└─════════════════════════════════════════┘
```
Answer: `cat /etc/passwd`
- **Success:** SPECTER loses 5% progress
- **Failure:** Terminal disabled 15s

#### 3. INTERCEPT (Click Target)
```
┌─════════════════════════════════════════┐
│  ⚠️ SPECTER INTRUSION: INTERCEPT ⚠️     │
│                                         │
│  "Catch my packet if you can..."        │
│                                         │
│     ┌─────────────────────────────┐     │
│     │    [👻]→                    │     │
│     │         moving target       │     │
│     └─────────────────────────────┘     │
│                                         │
│         Click SPECTER! (3 hits)         │
│              ⏱️ 8s                       │
└─════════════════════════════════════════┘
```
- **Success:** Free powerup charge
- **Failure:** SPECTER gains 10%

#### 4. DECRYPT (Quick Math/Logic)
```
┌─════════════════════════════════════════┐
│  ⚠️ SPECTER INTRUSION: DECRYPT ⚠️       │
│                                         │
│  "Solve this or lose your hints..."     │
│                                         │
│     0x2A + 0x10 = ?                     │
│     > _ _                               │
│                                         │
│              ⏱️ 15s                      │
└─════════════════════════════════════════┘
```
Answer: `58` (or `0x3A`)
- **Success:** Hint cooldown reset
- **Failure:** Hints locked for this level

#### 5. FIREWALL (Pattern Memory)
```
┌─════════════════════════════════════════┐
│  ⚠️ SPECTER INTRUSION: FIREWALL ⚠️      │
│                                         │
│  "Memorize and repeat..."               │
│                                         │
│     [■] [□] [■] [□] [■]                 │
│      1   2   3   4   5                  │
│                                         │
│     (Pattern flashes, then blanks)      │
│     Click the lit squares in order      │
│              ⏱️ 6s                       │
└─════════════════════════════════════════┘
```
- **Success:** SPECTER frozen 10s
- **Failure:** Lose current powerup

### Side Mission UI

Side missions appear as an **overlay** that blocks the main puzzle until resolved. The terminal and panels are dimmed behind it.

Audio cue: Alarm/alert sound when side mission triggers.

---

## Panel Layout Redesign

### Header Bar (New)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  OPERATION BLACKOUT    │  PHASE 3/9: BREADCRUMB    │  ⏱️ 52:17  │  👻 35% │
│                        │  🎩🎩🎩 🎩🎩🕵️ 🕵️🕵️🕵️ ... │            │         │
└─────────────────────────────────────────────────────────────────────────┘
```

Shows: Mission name, current phase with codename, hat progress for all levels, timer, SPECTER progress.

### Left Panel - Tabbed

```
┌─────────────────────────────────┐
│ [NETWORK] [HANDLER]         [⛶] │  ← Tab bar + expand button
├─────────────────────────────────┤
│                                 │
│   (Active tab content)          │
│   - NETWORK: Live network map   │
│   - HANDLER: Comms feed         │
│                                 │
├─────────────────────────────────┤
│ ══ PHASE: FORTRESS ════════════ │  ← Current level indicator
├─────────────────────────────────┤
│                                 │
│   [Current puzzle UI]           │
│                                 │
├─────────────────────────────────┤
│ 🔍 Sniffer  🔒 Rootkit  💉 Exp  │  ← Powerups (always visible)
│    [1]         [2]        [3]   │
└─────────────────────────────────┘
```

**Expand button (⛶):** Opens current tab in modal overlay for detailed viewing.

### Right Panel - Simplified

```
┌─────────────────────────────────┐
│ ══ CURRENT OBJECTIVE ══════════ │
├─────────────────────────────────┤
│                                 │
│  Configure firewall to:         │
│  • DENY hostile IP              │
│  • ALLOW your relay             │
│                                 │
├─────────────────────────────────┤
│ ══ LEVEL PROGRESS ═════════════ │
├─────────────────────────────────┤
│                                 │
│  Par time: 2:30                 │
│  Elapsed:  1:45                 │
│  Mistakes: 0                    │
│                                 │
│  Potential: 🎩🎩🎩              │
│                                 │
├─────────────────────────────────┤
│ ▶ COMMAND REFERENCE (tap)       │  ← Collapsible
├─────────────────────────────────┤
│ ▶ ACHIEVEMENTS (tap)            │  ← Collapsible
└─────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Level System
- [ ] Refactor puzzle activation to level-based flow
- [ ] Add level state tracking (currentLevel, levelStartTime, mistakes, hintsUsed)
- [ ] Create handler briefing system (pre-level intel)
- [ ] Create phase announcement animation ("PHASE X: CODENAME")
- [ ] Create level complete celebration animation
- [ ] Wire up level progression (complete level → briefing → next level)

### Phase 2: Spy Hat System
- [ ] Add hat criteria tracking per level
- [ ] Create hat display UI (earned/unearned)
- [ ] Add par time definitions per level per difficulty
- [ ] Show potential hats during level (real-time feedback)
- [ ] Create end-of-level hat summary
- [ ] Create end-of-mission total hat summary + rating tier

### Phase 3: Panel Redesign
- [ ] Add header bar with phase progress and hat overview
- [ ] Convert left panel to tabbed layout (NETWORK | HANDLER)
- [ ] Add expand button functionality (modal overlay)
- [ ] Simplify right panel with collapsible sections
- [ ] Add level progress section (par time, elapsed, potential hats)

### Phase 4: SPECTER Side Missions
- [ ] Create side mission overlay system
- [ ] Implement LOCKOUT mini-game
- [ ] Implement SCRAMBLE mini-game
- [ ] Implement INTERCEPT mini-game
- [ ] Implement DECRYPT mini-game
- [ ] Implement FIREWALL mini-game
- [ ] Add side mission trigger logic (difficulty-based probability)
- [ ] Add success/failure rewards and penalties
- [ ] Add audio cues for side mission triggers

### Phase 5: Polish & Balance
- [ ] Playtest all levels and adjust par times
- [ ] Tune side mission frequency and difficulty
- [ ] Add sound effects for level transitions
- [ ] Add visual polish (animations, particles)
- [ ] Test on different screen sizes

---

## Design Decisions (FINALIZED)

1. **Hats saved per-attempt or best-ever?** → **BEST-EVER** (like stars in mobile games)
2. **Can users replay individual levels?** → **YES** (level select unlocks after first completion)
3. **Side missions skippable with powerups?** → **YES** (Exploit powerup skips current side mission)
4. **Leaderboard integration?** → **YES** (total hats + completion time shown on leaderboards)

---

## Files to Modify

| File | Changes |
|------|---------|
| `clh-031-blackout.html` | Major refactor - level system, UI redesign |
| `version.json` | Bump version |
| `CLH-031-ISSUES.md` | Mark firewall UX issue as resolved by design |

---

## Success Criteria

- [ ] User never feels "stuck" - handler always provides needed intel before puzzles
- [ ] Clear sense of progression through 9 distinct phases
- [ ] Hat system motivates replay for perfection
- [ ] Side missions add tension without being frustrating
- [ ] Panels are usable without scrolling/overflow issues

---

*Document Created: 2026-01-29*
*Status: Ready for implementation approval*
