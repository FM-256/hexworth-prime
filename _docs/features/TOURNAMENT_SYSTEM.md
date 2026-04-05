# CTF Tournament System

**Status:** SHIPPED
**Components:** `tournament-board.html`, `tournament-lobby.html`, `tournament-podium.html`, `ctfSubmitFlag` (Cloud Function), admin console tournament panel
**Location:** `_app/arena/tournament-*.html` (3 pages), `_app/admin/console.html` (management), `functions/index.js` (flag validation)
**Added:** v5.0.0, admin panel expanded in v6.0.0
**Last reviewed:** 2026-04-05

## Purpose

The Tournament System transforms Hexworth Prime's CTF Arena from solo practice into
live, team-based competitions. An instructor creates a tournament with challenges, teams
register via join code, and teams race to capture flags on a live scoreboard. The system
supports both static and dynamic scoring, Jeopardy-style and box-style boards, scoreboard
freezing, and full results export.

This is designed for classroom CTF events, inter-school competitions, and training
exercises where time pressure and team coordination matter.

## Architecture

Three student-facing pages + one admin panel + one Cloud Function:

```
Admin Console (console.html)
  |-- Create tournament (draft)
  |-- Add challenges (flag hashing with per-tournament salt)
  |-- Open registration → status: "lobby"
  |-- Start tournament → status: "active"
  |
  v
Tournament Lobby (tournament-lobby.html)
  |-- Students join via join code
  |-- Join existing team (6 default teams auto-created)
  |-- See challenge preview (read-only)
  |
  v
Tournament Board (tournament-board.html)
  |-- Jeopardy grid or Box card layout (set by admin)
  |-- Click challenge → modal with description, hints, flag input
  |-- Submit flag → ctfSubmitFlag Cloud Function
  |-- Real-time score updates via Firestore onSnapshot
  |
  v
Tournament Podium (tournament-podium.html)
  |-- Public (no auth required)
  |-- Live scoreboard with top-3 pedestal display
  |-- Real-time team rankings via Firestore subscription
  |-- Countdown timer (turns red < 5 minutes)
```

## Tournament Lifecycle

| Transition | Trigger | Effect |
|-----------|---------|--------|
| `draft` → `lobby` | Admin clicks "Open Registration" | Join code becomes active, teams can register |
| `lobby` → `active` | Admin clicks "Start Tournament" | `startTime` set, flag submissions accepted, timer begins |
| `lobby` → `draft` | Admin clicks "Back to Draft" | Reverts to draft (edits allowed) |
| `active` → `frozen` | Admin clicks "Freeze Scoreboard" | Submissions still accepted, podium shows freeze message |
| `active` → `ended` | Admin clicks "End Tournament" | All submissions stop, export available |
| `frozen` → `ended` | Admin clicks "End Tournament" | Final standings revealed |
| `frozen` → `active` | Admin clicks "Unfreeze" | Scoreboard live again |

## Flag Submission (Server-Side)

All flag validation happens in the `ctfSubmitFlag` Cloud Function:

```
Student submits flag
  |
  |-- Validate: user authenticated
  |-- Validate: tournament status is "active" or "frozen"
  |-- Validate: user is member of a registered team
  |-- Validate: team hasn't already solved this challenge
  |-- Rate limit: max 1 submission per team per challenge per 10 seconds
  |
  |-- Load challenge doc (flagHash, flagSalt — NEVER sent to client)
  |-- Compute: sha256(flagSalt + ':' + submittedFlag)
  |-- Compare to stored flagHash
  |
  |-- If correct:
  |     team.score += challenge.currentPoints
  |     team.solves.push(challengeId)
  |     team.lastSolveTime = serverTimestamp()
  |     challenge.solveCount += 1
  |     If dynamic scoring: recalculate currentPoints
  |     Write submission record (correct: true, points awarded)
  |
  |-- If incorrect:
  |     Write submission record (correct: false, points: 0)
  |     Return generic "Incorrect flag" (no information leakage)
```

**Flag hashing:** Salt is `{joinCode}-{challengeId}`. Flags from one tournament don't work
in another. The admin console hashes flags client-side during challenge creation using
`crypto.subtle.digest('SHA-256', ...)` — the plaintext flag is never stored.

## Scoring Models

### Static Scoring
Fixed points per challenge. Set at creation, never changes.

### Dynamic Scoring
Points decay as more teams solve a challenge:

```
currentPoints = max(minPoints, floor(initialPoints * (decayRate ^ solveCount)))
```

Example with initialPoints=500, decayRate=0.85, minPoints=50:
- 0 solves: 500 pts
- 1 solve: 425 pts
- 5 solves: 222 pts
- 10 solves: 98 pts
- 15+ solves: 50 pts (floor)

This rewards teams who solve challenges first while preventing point inflation.

## Board Styles

| Style | Layout | Best for |
|-------|--------|----------|
| **Jeopardy** | CSS grid with categories as columns, challenges sorted by points | Classic CTF format, category-focused |
| **Box** | Responsive card grid with metadata badges | Narrative/scenario-based events |

Set at tournament creation, cannot change after.

## Scoreboard Freeze

When the admin freezes the scoreboard:
- Tournament status transitions to `"frozen"`
- Flag submissions continue to be accepted and scored server-side
- The podium page displays a message: "Scoreboard is frozen. Final standings will be revealed when the tournament ends."
- Real-time score updates still reach the podium (scores visible but marked as frozen)
- Designed for the final minutes of competition — prevents last-minute strategy adjustments based on visible scores

## Team Management

6 default teams are auto-created with each tournament:

| Team | Color |
|------|-------|
| Red Cell | `#ef4444` |
| Blue Shield | `#3b82f6` |
| Green Ops | `#22c55e` |
| Gold Strike | `#f59e0b` |
| Purple Haze | `#a855f7` |
| Cyan Storm | `#06b6d4` |

Students join teams from the lobby page. Teams have a configurable `maxTeamSize` (default 4)
and `maxTeams` (default 32). Team membership is stored as a `members[]` array of UIDs
with a denormalized `memberNames[]` for display.

## Firestore Data Model

```
tournaments/{tournamentId}
  |-- name, description, status, joinCode
  |-- boardStyle: "jeopardy" | "box"
  |-- scoringModel: "static" | "dynamic"
  |-- dynamicConfig: { initialPoints, minPoints, decayRate }
  |-- duration (minutes), freezeMinutes
  |-- maxTeamSize, maxTeams, teamCount
  |-- startTime, createdAt, createdBy
  |-- totalSubmissions, totalSolves
  |
  |-- challenges/{challengeId}
  |     |-- title, category, description, points, currentPoints
  |     |-- flagHash (sha256:...), flagSalt (joinCode-chId)
  |     |-- solveCount, hints[], boxId, order, visible
  |
  |-- teams/{teamId}
  |     |-- name, color, captain
  |     |-- members[], memberNames[], score
  |     |-- solves[], lastSolveTime, hintPenalty
  |
  |-- submissions/{submissionId}
        |-- teamId, teamName, challengeId
        |-- submittedFlag, correct, points
        |-- submittedBy, submittedByName, timestamp
```

**No localStorage keys.** Tournament state is entirely Firestore-backed with real-time
subscriptions. No client-side state persists between page loads.

## Admin Panel Features

The tournament management panel in `console.html` provides:

- **Create:** Name, join code, board style, scoring model, team config, duration, challenges
- **Challenge editor:** Title, category (web/crypto/pwn/forensics/misc/reverse/network), points, flag, description, hints (cost|text format)
- **Live monitoring:** Real-time team standings, submission feed (scrolling log), challenge solve counts, countdown timer
- **Status controls:** All lifecycle transitions with confirmation dialogs
- **Export:** JSON file with full standings, all submissions, timestamps — `ctf-results-{id}.json`

## Key Decisions

- **Server-side flag validation only** — Unlike solo Arena boxes (which use client-side
  hash comparison), tournament flags are validated exclusively by the `ctfSubmitFlag` Cloud
  Function. No hashes are ever sent to the client. This prevents team members from
  extracting flags from network traffic or source code.

- **Per-tournament flag salting** — Salt is `{joinCode}-{challengeId}`. Even if two
  tournaments use the same flag text, the hashes differ. Flags captured in one event
  cannot be replayed in another.

- **6 default teams** — Auto-created to reduce setup friction. Instructors don't need
  to pre-assign students; students self-select in the lobby. Custom teams can be added
  but the defaults cover most classroom scenarios.

- **Podium requires no auth** — The scoreboard page is public. This allows projecting
  the podium on a classroom screen without logging in. Team boards and flag submission
  require authentication.

- **Submissions recorded even when incorrect** — Every attempt is logged with team, user,
  timestamp, and the submitted flag. This enables post-event forensics (detecting brute
  force, analyzing team strategy, identifying struggling students).

## Known Limitations

- **Hint system partially implemented** — Hints are defined and displayed in the challenge
  modal, but `hintPenalty` on the team doc is never decremented. Clicking a hint reveals
  the text but does not deduct points. This is a known gap.

- **No custom team creation from lobby** — Students can only join the 6 (or more) pre-created
  teams. There is no "Create Team" button in the lobby. Teams must be set up in the admin panel.

- **18 pinned SDK path issues** — The memory file flags 18 tournament SDK path issues +
  3 variant h1 issues + 1 missing icon. These are tracked and should not be fixed without
  discussion.

- **No automatic freeze** — Scoreboard freeze is manual (admin clicks button). There is no
  auto-freeze at `endTime - freezeMinutes`. The `freezeMinutes` config field exists but is
  not enforced automatically.

- **No tournament templates** — Each tournament is created from scratch. There is no way
  to duplicate or template a previous tournament's challenge set.

- **Real-time podium shows scores even when frozen** — The freeze message is displayed,
  but the underlying Firestore subscription still updates scores in real-time. A team
  watching the podium during freeze can still see score changes. The freeze is more
  psychological than technical.
