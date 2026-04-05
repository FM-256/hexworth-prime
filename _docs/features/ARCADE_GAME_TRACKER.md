# Arcade & Game Tracker

**Status:** SHIPPED
**Components:** `GameTracker.js` (570 lines), `GameScoreboard.js` (330 lines), `ArcadeScoreModal.js` (300 lines), `MultiPlayer.js` (340 lines), `FlappyEngine.js`
**Location:** `_app/games.html` (arcade page), `_app/components/Game*.js`, game files across `_app/houses/*/games/`
**Added:** v4.0.0, audit + reclassification in v5.0.0, 2-player in v6.0.0
**Last reviewed:** 2026-04-05

## Purpose

The Arcade is Hexworth Prime's gamified learning layer — 75+ games across 9 houses,
spanning text adventures, pixel runners, survival challenges, retro arcade remakes, and
hands-on security labs. The GameTracker records every session, maintains local and global
leaderboards, awards tiered XP for high scores, and runs a compounding "Score Reign"
system that pays passive XP to #1 holders.

Games aren't filler — they reinforce house-specific skills through play. `sudo su`
teaches privilege escalation, `Don't Get Phished` trains email analysis, `Packet Run`
builds protocol intuition.

## Game Categories

After the 2026-02-11 professor audit, games were reclassified into three content types:

| Type | Count | What it is | Examples |
|------|-------|-----------|---------|
| **Games** | ~36 | Real mechanics (survival, platforming, branching narrative) | Don't Brick the PC, Shell Sprint, sudo su, Packet Flap |
| **Reviews** | ~11 | Knowledge checks, Jeopardy-style assessment | Protocol Stack, DNS Resolver Race, A+ Jeopardy, Hash Cracker |
| **Labs** | ~12 | Hands-on builders and analyzers | Cron Builder, Firewall Builder, Log Detective, Threat Modeler |

### Game Types

| Type | Count | Mechanic |
|------|-------|---------|
| Text Adventures | 15 | CLI simulations with branching paths (sudo su, nmap, gpg --decrypt, etc.) |
| Don't... Survival | 11 | High-pressure scenarios (Don't Drop the Packet, Don't Kill the Server, etc.) |
| Pixel Runners | 6 | Side-scrolling dodge/platform (Packet Run, Shell Sprint, Cloud Hop, etc.) |
| Flappy | 5 | Flappy Bird variants (Packet Flap, Crypto Flap, etc.) |
| Retro Arcade | 11 | Classic remakes (Pipe Snake, Crypto Pong, Packet Invaders, Log Centipede, etc.) |
| AI Simulations | 3 | Agent Builder Sim, Triage Trainer, Guardrail Challenge |
| Arcade | 2 | Root Access (digger), Life Force (shmup) |

### House Distribution

Every house has games themed to its domain:

| House | Games | Signature titles |
|-------|-------|-----------------|
| Web | 8+ | nmap, Packet Run, Don't Drop Packet, DNS Race, Subnet Siege |
| Script | 8+ | sudo su, Shell Sprint, Don't Kill Server, Terminal Velocity, Pipe Snake |
| Key | 6+ | gpg --decrypt, Crypto Flap, Don't Leak Key, Cipher Bubbles, Crypto Pong |
| Eye | 7+ | grep -rn, Don't Feed Troll, Log Detective, Alert Triage, Memory Forensics |
| Code | 7+ | git blame, Don't Deploy Friday, Pipeline Panic, Docker Escape, Build Breaker |
| Forge | 9+ | fsck, Don't Brick PC, Bit Dash, Don't Anger Printer, RAID Calculator |
| Shield | 10+ | --incident, Don't Get Phished, Life Force, SQL Injection Defense, ThreatDex |
| Cloud | 8+ | aws sts, Don't Check Bill, Cloud Hop, IAM Debugger, Cloud Destroyer |
| AI | 3 | Agent Builder Sim, Triage Trainer, Guardrail Challenge |

## GameTracker Data Model

**Storage:** `hexworth_game_tracker` localStorage key (JSON)

### Per-Game Entry

```javascript
{
  [gameId]: {
    plays: number,
    wins: number,
    losses: number,
    bestTime: seconds | null,
    totalCommands: number,
    firstPlayed: timestamp,
    lastPlayed: timestamp,

    // Last 10 sessions
    history: [{ result, time, commands, achievements, score, date }],

    // Top 5 local high scores (score-based games only)
    topScores: [{ score, date, name }],

    // Score Reign (passive XP for #1 holder)
    reign: {
      active: boolean,
      startDate: ISO string,
      lastPaidDay: number,    // max 90
      totalPaid: number
    }
  },

  _aggregate: {
    totalGames: number,       // 64 in registry
    gamesPlayed: number,
    gamesWon: number,
    totalPlays: number,
    overallWinRate: percent,
    fastestWin: seconds,
    allComplete: boolean
  }
}
```

### Two Scoring Models

**Win/Loss games** (text adventures, runners, Don't series):
- Tracked as plays/wins/losses, bestTime, session history
- No numeric score — outcome is binary (success/failure/timeout)
- No XP award for winning (XP comes from achievements, not game wins)

**Score-based games** (arcade, flappy, retro, challenges):
- Tracked as `topScores[]` (top 5 local) + Firestore global leaderboard (top 10)
- High score placements award tiered XP:

| Rank | XP Award |
|------|----------|
| #1 | 1,000 XP (triggers Score Reign) |
| #2 | 750 XP |
| #3 | 500 XP |
| #4 | 250 XP |
| #5 | 100 XP |
| #6+ | None |

## Score Reign System

The most unique XP mechanic in the platform. Holding the #1 score on any game earns
compounding passive XP:

- **Base:** 25 XP/day
- **Compound rate:** 5% daily
- **Daily cap:** 500 XP/day
- **Max duration:** 90 days per reign
- **Formula:** `min(25 * (1.05 ^ dayNumber), 500)`

**Example progression:**
- Day 1: 25 XP, Day 10: 40 XP, Day 30: 108 XP, Day 60: 468 XP, Day 90: 500 XP (capped)
- Full 90-day reign: ~22,000 total XP

**Lifecycle:**
1. Player sets #1 score → `_startReign()` begins 90-day clock
2. Dashboard load → `collectReigns()` calculates and bridges XP to `hexworth_progress`
3. Player beats own #1 → reign resets (rewards improvement)
4. Another player takes #1 → `reign.active = false` (previous earnings kept)

## Arcade Page (`games.html`)

### Layout

1. **Sticky header** — "The Hexworth Arcade | Games, Reviews & Labs"
2. **Search** — Full-width search across all games
3. **Category tabs** — All (75+), Games (36), Reviews (11), Labs (5), Favorites
4. **Type filters** — adventure, runner, challenge, dont, retro, arcade, simulation
5. **House filters** — 9 colored buttons matching house palette
6. **OASIS banner** — Animated promo linking to special content
7. **Game grid** — Responsive (4→3→2→1 columns), cards with hover effects

### Game Cards

Each card displays:
- Favorite heart button (top right)
- Trophy button (shows global #1 score)
- Cover image (optional)
- Title and description tagline
- Category badge (GAME / REVIEW / LAB) + House badge
- Score badge slot (lazy-loaded)

## UI Components

### GameScoreboard.js (In-Game Widget)

Fixed widget on game pages showing top 3 local high scores + play stats:
- Auto-detects gameId from page's `GameTracker.record()` call
- Medal icons for ranks 1-3
- Plays/Wins counter
- Flash animation on new high score
- Collapsible (header-only toggle)
- Listens for `hexworth:gameRecorded` and `hexworth:newHighScore` events

### ArcadeScoreModal.js (Global Leaderboard)

Modal popup combining global + local scores:
- **Global Top 10** — Fetched from Firestore via `FirestoreManager.getGameScoreboard()`
- **Local Top 5** — From `GameTracker.getTopScores()`
- Current user highlighted with blue border + "YOU" badge
- "Play" button linking back to game
- 2-minute Firestore cache to avoid excessive reads

## Multiplayer (F-25)

All games can opt into 2-player mode via `MultiPlayer.js`:

| Mode | Mechanic |
|------|---------|
| **Solo** | Default single-player |
| **Split Controls** | Simultaneous play — P1: WASD+Space, P2: Arrows+Enter |
| **Turn-Based** | Alternating turns with optional timer |
| **Ghost** | Record + replay inputs for asynchronous competition |

**API pattern:** Game calls `MultiPlayer.showModeSelect()` at start, uses
`MultiPlayer.getControls(playerNum)` in game loop, `MultiPlayer.renderScoreboard()`
for display, `MultiPlayer.announceWinner()` at end.

## Firestore Integration

```
game_scores/{gameId}
  |-- topScores: [{ uid, callsign, score, timestamp }]  // Top 10 global
  |-- lowestTopScore: number
  |-- entryCount: number
  |-- updatedAt: timestamp
```

**Submit:** `FirestoreManager.submitGameScore(gameId, score, meta)` — Cloud Function
validates and inserts if score qualifies for top 10.

**Fetch:** `FirestoreManager.getGameScoreboard(gameId)` — 2-minute cache, returns top 10.

## Key Decisions

- **64-game registry, not dynamic** — GameTracker.GAME_REGISTRY is hardcoded, not
  auto-discovered from the filesystem. This is intentional: only curated, quality-checked
  games get tracked. Adding a game to the registry is a deliberate act.

- **Two scoring models** — Win/loss (for narrative games where score is meaningless) vs
  numeric score (for competitive games). Not everything needs a leaderboard. Text
  adventures reward completion, not speed.

- **Score Reign as passive XP** — Incentivizes students to improve scores over time. The
  compounding mechanic means long-held records are progressively more valuable, encouraging
  competition. 90-day cap prevents permanent XP generation.

- **Professor audit reclassification** — The 2026-02-11 audit physically reviewed all
  games and reclassified 23 items from "game" to "review" or "lab" based on whether they
  had real game mechanics or were knowledge-check wrappers. This distinction matters for
  the arcade page's category tabs.

- **Event-driven architecture** — Games fire `hexworth:gameRecorded` and
  `hexworth:newHighScore` CustomEvents. GameScoreboard, ArcadeScoreModal, and the
  dashboard listen independently. This decouples game code from tracking UI.

- **Local-first, cloud-second** — All game data persists to localStorage immediately.
  Firestore submission is fire-and-forget. If the cloud call fails, the local record
  survives. Global leaderboard is a bonus, not a requirement.

## Known Limitations

- **No XP for win/loss games** — Text adventures and Don't series grant zero XP for
  completion. Students who prefer narrative games over score-based games earn less XP.
  Achievement system compensates partially (game-specific achievements grant discovery points).

- **localStorage-only game state** — Clearing browser data wipes all play history, high
  scores, and active reigns. No Firestore backup for local game state (global leaderboard
  is backed up but not personal stats).

- **GameTracker registry manually maintained** — New games must be added to
  GAME_REGISTRY by hand. If a game exists on disk but isn't in the registry, it won't
  be tracked. No EduScan rule validates registry completeness.

- **FlappyEngine high scores stored separately** — The 5 Flappy games use their own
  `flappy_{variant}_highscore` localStorage keys, separate from GameTracker's topScores.
  This is a legacy pattern that hasn't been unified.

- **Multiplayer is local-only** — The 2-player modes are same-screen only (split controls).
  There is no networked multiplayer for games. The Hive system handles networked play
  separately but isn't integrated with the arcade games.
