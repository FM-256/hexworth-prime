# CTF Arena

**Status:** SHIPPED
**Components:** BoxEngine.js, Terminal.js, CoOpSync.js, CoOpLobby.js, VsBridge.js, BriefingPage.js, BlueTeam.js
**Location:** `_app/arena/`
**Dashboard Section:** Dark Arts Division > Arena
**Added:** v4.0.0 | CTF stats sync: v5.0.0 (2026-03-01)
**Last reviewed:** 2026-04-05

## Purpose

The CTF Arena is a hands-on offensive security training ground. Students hack into simulated machines (boxes) by finding vulnerabilities, running commands, and capturing flags — text strings hidden in `user.txt` and `root.txt` files that prove they compromised the target.

It exists because cybersecurity can't be learned passively. Reading about SQL injection doesn't stick. Exploiting it in a sandboxed terminal against a fictional target does. The arena turns theory into muscle memory.

## What It Does

### Boxes (BoxEngine.js)

Each box is a self-contained hacking challenge with a simulated filesystem, terminal, and flag submission system. The engine handles:

- **Simulated terminal** — command execution against a virtual filesystem (no real systems are harmed)
- **Flag capture** — hashed flag comparison prevents students from reading answers from source code (AR-11)
- **Scoring** — base score + flag points - hint penalties - wrong flag penalties + speed bonus
- **Phases** — boxes can have multi-stage progression (RECON → EXPLOIT → EXTRACTION)
- **Hints** — progressive hint system with point penalties (doubles in hard mode)
- **Event logging** — every command, navigation, flag attempt, and hint reveal is timestamped for research instrumentation

**20 boxes in A-series** (A1–A20), with B/C/D/E series slots reserved for future content.

### Storage

**Per-box localStorage** (`hexworth_ctf_a1` through `hexworth_ctf_a20`):

Arena engine format:
```json
{
  "score": 1000,
  "flagsFound": ["user", "root"],
  "hintsUsed": [],
  "wrongFlags": 0,
  "completed": false,
  "startTime": 1700000000000,
  "events": []
}
```

Workshop format (A1, A2):
```json
{
  "score": 1000,
  "userFlag": false,
  "rootFlag": false,
  "hintsUsed": [],
  "wrongFlags": 0,
  "completed": false
}
```

### CTF Stats Sync to Firestore

On box completion, `_reportCompletion()` aggregates stats from all localStorage CTF keys and writes two fields to the user's Firestore profile:

- `ctfBoxesPwned` — count of boxes with `completed: true`
- `ctfFlagsCaptured` — total flags found (sum of `flagsFound.length` or boolean flag counts)

These fields are displayed in the User Profile Modal as "Boxes Pwned" (skull icon) and "Flags" (footprint icon).

**Backfill:** On dashboard load, existing localStorage CTF data is synced to Firestore for users who completed boxes before this feature was added. The backfill runs on every auth callback in the `firebaseAuthStateChanged` handler.

**CTF boxes count as labs:** The profile stats backfill also scans `hexworth_ctf_*` keys and adds completed boxes to the `labsCompleted` array in Firestore (as `arena-a1`, `arena-a2`, etc.). This is the most reliable source of lab count because per-box keys survive even when the main `hexworth_progress` object gets reset. See `USER_PROFILE_MODAL.md` > Stats Data Pipeline for the full 5-source merge.

**Firestore rules:** `ctfBoxesPwned` and `ctfFlagsCaptured` are in the user profile field whitelist (`firestore.rules` line 22-29).

### Completion Reporting

When a box is completed, `_reportCompletion()` fires a chain of integrations:

| System | What it writes | Where |
|--------|---------------|-------|
| ProgressManager | Module completion + XP (500 per box) | `hexworth_progress` (localStorage) |
| GameTracker | Session stats (score, time, commands) | Game tracking system |
| AssignmentManager | `arena_complete` event | Firestore class activity log (if enrolled) |
| FirestoreManager | Aggregate CTF stats | Firestore user profile |
| _bridgeProgress | Flat + structured format + XP | `hexworth_progress` (localStorage fallback) |

### CTF Leaderboard (ctf-leaderboard.applet.html)

Standalone scoreboard page with two modes:

- **Arena Scores** — personal progress across all 20 boxes (reads localStorage, solo view)
- **Team CTF** — team-vs-team leaderboard for live CTF events (admin-editable, stored in `hexworth_darkarts_ctf`)

### Game Modes

- **Solo** — standard single-player box hacking
- **Co-Op** — two players share a session via Firestore sync (CoOpSync)
- **VS** — head-to-head race to capture all flags first

## Architecture

```
Box page loads
  │
  ├── BoxEngine.init(config)       ← Load box config (flags, filesystem, scoring)
  ├── BoxEngine.load()             ← Restore state from localStorage
  │
  │  Player submits flag
  │  ├── _hashFlag(input, seed)    ← SHA-256 hash for comparison (AR-11)
  │  ├── _checkCompletion()        ← All flags found?
  │  │   └── _reportCompletion()   ← Write to ProgressManager, GameTracker,
  │  │       │                        AssignmentManager, Firestore profile
  │  │       └── _aggregateCTFStats() ← Scan all hexworth_ctf_* keys
  │  └── save()                    ← Write state to localStorage
  │
  Dashboard load (backfill)
  └── Scan hexworth_ctf_* keys → write ctfBoxesPwned/ctfFlagsCaptured to Firestore
```

**Script load:** BoxEngine.js loads on individual box pages (`/arena/a1/`, `/arena/a2/`, etc.), not on the dashboard. The dashboard only runs the backfill aggregation.

## Scoring

| Component | Points | Notes |
|-----------|--------|-------|
| Base score | 1000 | Starting points |
| User flag | +250 | Per-box config |
| Root flag | +500 | Per-box config |
| Speed bonus | +100–500 | If completed under time threshold |
| Hint penalty | -50 each | Doubles in hard mode |
| Wrong flag penalty | -25 each | Per incorrect submission |

## Research Instrumentation

Every box completion includes analytics data for pedagogical research:

- Total commands executed
- Total filesystem navigations
- Average time between flag captures
- Hint effectiveness (time from hint reveal to next flag)
- Phase timings (time spent in RECON vs EXPLOIT vs EXTRACTION)
- Pre/post surveys (confidence, difficulty, familiarity, anxiety)

## Why It Exists

1. **Hands-on learning** — cybersecurity requires practice, not just reading. The terminal simulation builds real command-line skills in a safe environment.
2. **Progressive difficulty** — A1 is a guided tutorial, A20 is expert-level. Students self-pace through increasing challenge.
3. **Immediate feedback** — flag submission gives instant pass/fail. No waiting for grading.
4. **Engagement** — gamified scoring with speed bonuses and leaderboards creates competition and replay value.
5. **Assessment** — instructors see exactly what each student did (commands, time, hints used) via the activity log, enabling targeted support.
6. **Social proof** — CTF stats on the public profile (Boxes Pwned, Flags) let students show off their offensive security skills to peers.

## Key Decisions

- **Hashed flags (AR-11)** — Flags are SHA-256 hashed in box configs so students cannot read answers from source code. The seed is per-box, preventing rainbow table attacks across boxes.
- **localStorage per-box keys** — Each box gets its own `hexworth_ctf_a{N}` key rather than one monolithic object. This makes individual box resets clean and survives `hexworth_progress` resets.
- **Config-driven boxes** — Box content (filesystem, flags, hints, scoring) is defined in `config.js` files, not hardcoded in BoxEngine. New boxes require zero engine changes.
- **Backfill on dashboard load** — CTF stats sync was added after boxes shipped. The backfill pattern ensures pre-existing completions are captured without manual migration.
- **Two storage formats** — Workshop boxes (A1, A2) use boolean flags; Arena engine uses arrays. Both are supported because the workshop predates the arena engine.

## Known Limitations

- **No server-side flag validation** — Flag hashing prevents casual source inspection but a determined student could extract the hash and brute-force short flags. The `ctfSubmitFlag` Cloud Function exists for tournament mode but is not used for solo arena.
- **localStorage only (solo mode)** — Solo progress is device-bound. Clearing browser data loses all CTF progress. Firestore sync captures aggregate stats (boxes pwned, flags captured) but not per-box state.
- **B/C/D/E series empty** — Only A-series (20 boxes) has content. Series slots are reserved but no boxes exist yet.

## The Panopticon (Live Spectator Gallery)

**Status:** SHIPPED
**Location:** `_app/arena/spectator.html`
**Cloud Functions:** `getLiveKitToken`, `endLiveStream`
**Firestore:** `spectator_streams` collection
**External Service:** LiveKit Cloud (WebRTC SFU)
**Added:** 2026-04-09

### Purpose

The Panopticon is a live streaming gallery for the CTF Arena. Named after Jeremy Bentham's 1791 prison design — a circular structure where a central observer can watch every cell simultaneously — it lets spectators observe all active tournament participants in real-time. The name itself is a teaching moment: surveillance theory, Bentham, Foucault, and the ethics of observation in cybersecurity.

### What It Does

- **Gallery view** — Grid of 16:9 video tiles showing all active broadcasters. Tiles appear/disappear in real-time as operators go live or disconnect.
- **Expanded view** — Click any tile to expand full-screen. Escape or click "[x] Back to Gallery" to return.
- **Go Live** — Any authenticated user can broadcast their screen via the `getDisplayMedia()` API. Captures at up to 1080p/15fps.
- **Live indicators** — Pulsing red LIVE badges on each tile, live count in header, elapsed time per stream.

### Architecture

```
Broadcaster clicks "Go Live"
  │
  ├── getDisplayMedia()              ← Browser captures screen/tab/window
  ├── getLiveKitToken(broadcaster)   ← Cloud Function generates JWT with publish permissions
  ├── LiveKit Room.connect()         ← Connects to LiveKit Cloud SFU
  ├── publishTrack(screenTrack)      ← Pushes video to LiveKit
  └── Firestore: spectator_streams   ← Marks stream as active
      │
Spectator opens Panopticon
  ├── onSnapshot(spectator_streams)  ← Real-time list of active streams
  ├── For each stream:
  │   ├── getLiveKitToken(spectator)  ← Cloud Function generates JWT with subscribe-only permissions
  │   ├── LiveKit Room.connect()      ← Connects as subscriber
  │   └── TrackSubscribed event       ← Attaches video element to tile
  │
Broadcaster stops
  ├── Room.disconnect()
  ├── endLiveStream CF               ← Marks stream inactive in Firestore
  └── Spectator tiles auto-remove    ← onSnapshot fires, tile removed from grid
```

### Security

- **API secrets** stored in Google Cloud Secret Manager (`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`), never in client code
- **Token-gated access** — Cloud Function generates scoped JWTs: broadcasters get publish+subscribe, spectators get subscribe-only
- **Firestore rules** — `spectator_streams` is read-only for clients (`allow write: if false`), only Cloud Functions can write
- **Unique identities** — Spectators get timestamped identity suffixes to prevent collisions with broadcasters in the same room

### Cost

LiveKit Cloud free tier: 1,000 participant-minutes/month. One participant-minute = one user connected for one minute. A 30-student tournament with 10 spectators watching for 1 hour = ~2,400 minutes. Paid tiers available for larger events.

### Navigation

Arena hub → "The Panopticon" button (cyan accent, top-right header)
