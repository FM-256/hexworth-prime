# Multiplayer & Hive System

**Status:** SHIPPED
**Components:** `MultiplayerManager.js`, `turn-based.js`, `ghost-mode.js` (arcade multiplayer); `HiveManager.js`, `HiveEngine.js` (collaborative exploration); `CoOpSync.js`, `CoOpLobby.js`, `VsBridge.js` (CTF arena multiplayer)
**Location:** `_app/components/multiplayer/` (arcade), `_app/hive/` (Hive), `_app/arena/engine/` (CTF co-op/vs)
**Added:** v5.0.0 (Hive), v6.0.0 F-25 (2-player arcade)
**Last reviewed:** 2026-04-05

## Purpose

Hexworth Prime has two distinct multiplayer ecosystems serving different pedagogical
goals:

1. **Arcade Multiplayer** — Lightweight 2-player modes for arcade games (split controls,
   turn-based, ghost replay). Makes games social and competitive.

2. **Hive** — Cooperative/competitive facility exploration with roles, puzzles, and an
   antagonist AI (Red Queen). Teaches teamwork, incident response coordination, and
   adversarial thinking.

Both use Firestore for real-time sync. The CTF Arena has its own multiplayer layer
(CoOpSync/VsBridge) that integrates with the tournament system.

## Arcade Multiplayer (MultiplayerManager)

### Room-Based Architecture

Students create or join game rooms via 6-character codes:

```
Host creates room → Code: "A3X9K2"
  |-- Room status: WAITING
  |-- Firestore: gameRooms/{roomId}
  |
Guest joins with code
  |-- Room status: READY
  |-- Both players in players[] array
  |
Game starts
  |-- Room status: PLAYING
  |-- Players send gameState updates via onSnapshot
  |
Game ends
  |-- Room status: FINISHED
  |-- Auto-cleanup after 1 hour
```

**Code format:** 6 chars from `A-Z, 2-9` (no I/O/0/1 — ambiguity removed)

### Three Modes

| Mode | Mechanic | Sync Model |
|------|---------|------------|
| **Realtime** | Both players play simultaneously | Continuous Firestore updates |
| **Turn-Based** | Alternating turns with optional timer | Move-by-move Firestore updates |
| **Ghost** | Record session, others race against replay | Async — recorded frames stored, replayed locally |

### Realtime Mode

Both players send state updates continuously via `MultiplayerManager.sendGameState()`.
Firestore `onSnapshot` delivers opponent's state in real-time. Each game decides what
state to sync (position, score, actions).

### Turn-Based Mode (TurnBasedManager)

Layered on top of MultiplayerManager for alternating-turn games:

- Configurable turn duration (seconds)
- `validateMove()` callback prevents illegal moves
- `checkWin()` callback evaluates after each move
- Move history stored in `sharedState.moves[]`
- Timeout actions: skip, forfeit, or random move

### Ghost Mode (Asynchronous)

Record one player's session as timestamped frames, let others race the ghost:

```
Recording:
  GhostMode.startRecording('threatswarm')
  GhostMode.recordFrame({ x, y, score, action })  // called from game loop
  GhostMode.stopRecording({ finalScore, result })  // saves to Firestore

Replay:
  ghost = await GhostMode.loadGhost(ghostId)
  GhostMode.startReplay(ghost, (frame) => renderGhostAt(frame))
```

- Sampled every 3rd frame (~20fps at 60fps)
- Max 18,000 frames (~5 min)
- Stored in `gameGhosts/{ghostId}` collection

### Firestore Model (Arcade)

```
gameRooms/{roomId}
  |-- code, gameId, status, mode
  |-- players: [{ uid, displayName, ready, lastHeartbeat }]
  |-- gameState: { player1: {...}, player2: {...}, shared: {...} }
  |-- createdAt, createdBy

gameGhosts/{ghostId}
  |-- gameId, playerUid, playerName
  |-- frames: [{ t: ms_offset, d: { x, y, score, action } }]
  |-- frameCount, duration
  |-- summary: { finalScore, result }
```

## Hive System (Collaborative Exploration)

### Three Game Modes

| Mode | Players | Dynamic |
|------|---------|---------|
| **Co-Op** | 2-4 | Shared workspace, team solves puzzles together, pooled score |
| **Competitive** | 2 teams | Separate workspaces, race to complete, can't see each other's progress |
| **Red Queen** | 1 attacker + 2-3 challengers | Asymmetric — attacker finds backdoor, challengers defend facility |

### Hive Lifecycle

1. Creator starts Hive session with mode, title, max players, time limit
2. Generates invite code (6-char)
3. Participants join via code → assigned roles
4. Status transitions: `lobby` → `active` → `completed`
5. Real-time presence tracking (30s heartbeat, 90s timeout)
6. Actions broadcast to all participants via Firestore subcollection

### Roles

**Co-Op:** Leader, Solver, Scout, Recorder
**Competitive:** Each team gets independent roles
**Red Queen:** Attacker (sees different room set) vs Defenders

### HiveEngine (Facility Explorer)

Split-screen layout (60% map / 40% room panel):

- **Left:** SVG map showing facility rooms as nodes with connections
- **Right:** Room details, puzzle UI, hint system
- **Navigation:** Click rooms on map to move
- **Fog of war:** Rooms unlock based on puzzle dependency chains
- **Red Queen narration:** Ambient antagonist dialogue every ~8 moves

**State:**
```javascript
{
  floor: 'b1',
  currentRoom: 'entry',
  visited: ['entry', 'room-02'],
  puzzlesSolved: ['puzzle-01'],
  puzzleProgress: { 'puzzle-02': 0.5 },
  moveCount: 15,
  integrity: 'pristine'  // changes with progression
}
```

**Save:** `hexworth_hive_save` localStorage

### Firestore Model (Hive)

```
hives/{hiveId}
  |-- mode, title, maxPlayers, timeLimit, difficulty
  |-- inviteCode, status, creatorUid
  |-- participantCount, startedAt, endedAt
  |
  |-- participants/{uid}
  |     |-- displayName, house, role, online
  |     |-- score, progress, lastSeen, joinedAt
  |
  |-- actions/{actionId}
        |-- type ('flag_found', 'hint_used', 'room_entered')
        |-- playerName, roomId, timestamp
```

## CTF Arena Multiplayer (CoOp + VS)

Separate from arcade multiplayer, specifically for CTF boxes:

### CoOpSync
Firestore-based real-time sync for squad play:
- Squad sizes: 2, 3, or 5 players
- Shared activity log (flag found, hint used, wrong flag)
- Atomic flag submissions (server-validated)
- Host migration if host leaves
- Auto-rejoin via localStorage session persistence

### CoOpLobby
Pre-game overlay UI:
- Mode selection: Solo, Co-Op (squad size), VS
- Difficulty: Easy/Normal/Hard (affects hint penalties)
- Rejoin detection: Auto-detects active session, prompts to rejoin or start new

### VsBridge (Red vs Blue)
Bidirectional action-to-alert bridge:

| Red Team Action | Blue Team Alert |
|----------------|-----------------|
| nmap scan | "Port scan detected" |
| curl LFI | "Local File Inclusion attempt" |
| SSH lateral movement | "Lateral movement to internal server" |
| sqlmap | "SQL injection attempt" |

| Blue Team Response | Red Team Effect |
|-------------------|-----------------|
| Firewall block | Commands blocked |
| Credentials revoked | Auth failures |
| Session killed | Disconnected |
| Host isolated | No network commands |

## Key Decisions

- **Two separate multiplayer systems** — Arcade multiplayer (lightweight, any game) and
  Hive (heavyweight, exploration-focused) serve different needs. Merging them would
  over-engineer simple 2-player games and under-serve collaborative scenarios.

- **Firestore over WebSocket** — Real-time sync via Firestore `onSnapshot` instead of
  custom WebSocket server. Higher latency (~200-500ms) but zero infrastructure to
  maintain. Acceptable for turn-based and strategy games; less ideal for twitch gameplay.

- **Ghost mode as async multiplayer** — Not everyone is online at the same time. Ghost
  mode lets students compete against recorded sessions asynchronously. Frame sampling
  (every 3rd frame) keeps Firestore document sizes manageable.

- **Role-based Hive modes** — Co-op assigns roles (Leader, Solver, Scout, Recorder) to
  prevent the "one person does everything" problem in group work. Red Queen mode creates
  an adversarial dynamic that teaches both offensive and defensive thinking.

- **VsBridge action mapping** — Red team actions generate Blue team SIEM alerts, and
  Blue team containment responses affect Red team capabilities. This creates a realistic
  SOC vs attacker dynamic where both sides must adapt in real-time.

- **6-char join codes** — Same pattern as tournament system. Ambiguous characters removed.
  Short enough to verbally share in a classroom. Collision probability is negligible
  for classroom-scale use.

## Known Limitations

- **Firestore latency** — Real-time games with fast inputs (shooters, platformers)
  experience 200-500ms sync delay. Arcade multiplayer is best suited for turn-based,
  strategy, or score-comparison games, not twitch gameplay.

- **No spectator mode** — There's no way to watch a Hive session or multiplayer game
  without being a participant. Instructors can't observe student multiplayer sessions.

- **Ghost frame limit** — 18,000 frames (~5 min at 60fps) caps ghost recording length.
  Longer games can't be fully ghosted. No compression or delta-encoding is applied.

- **Hive puzzles are placeholder** — The Hive engine (map, navigation, fog of war) is
  complete, but the puzzle content (Floor B1) is minimal. The facility needs more rooms
  and challenges to be a full experience.

- **No matchmaking** — Students must share codes manually (verbally or via chat). No
  automatic matchmaking, no skill-based pairing, no lobby browser. This is by design
  for classroom use but limits asynchronous competitive play.

- **Stale room cleanup** — Client-side cleanup runs when creating new rooms, but there's
  no server-side Cloud Function for scheduled cleanup. Long-running stale rooms
  accumulate in Firestore until manually purged.
