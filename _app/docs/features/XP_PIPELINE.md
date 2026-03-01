# XP Pipeline

**Components:** XPCalculator.js, FirestoreManager.js (syncBidirectional), Cloud Functions (addXP, recordProgress, syncProgress)
**Location:** `_app/components/`, `functions/index.js`
**Added:** Deterministic XP engine added v4.x, Cloud Functions from v3.x

## Purpose

XP drives the leveling system, leaderboard rankings, and profile display. It must be derived deterministically from completion state — never accumulated blindly — to prevent drift, inflation, and desync across devices.

## Architecture: 3 Layers

### Layer 1 — Cloud Functions (Server Authority)

Located in `functions/index.js`. Three Cloud Functions handle server-side XP:

- **`addXP(amount, reason)`** — Direct server-side increment via `FieldValue.increment()`. Appends to immutable `xpHistory[]` audit trail.
- **`recordProgress(type, itemId, house, score)`** — Records a completion and auto-awards XP:
  - Module: +1000 XP
  - Lab: +500 XP
  - Quiz: +200 XP (100% score) or +100 XP (≥70%)
  - Achievement: no XP (handled separately)
- **`syncProgress(modulesCompleted, labsCompleted, quizzes, xp, streak, ...)`** — Bidirectional server-side merge. Takes `Math.max(cloudXP, localXP)`. Validates/sanitizes all inputs (arrays capped at 1000, XP capped at 1,000,000).

All three require authentication. XP writes use `FieldValue.increment()` — monotonic, can only go up.

### Layer 2 — Client Orchestration (FirestoreManager.syncBidirectional)

Located in `FirestoreManager.js`. Runs on every dashboard auth state change.

**Flow:**
1. Fetch cloud profile from Firestore (completions + XP)
2. Cloud → Local: Apply cloud `modulesCompleted[]` to localStorage (restores cross-device progress)
3. Local → Cloud: Collect all local completions into flat sets
4. Merge scalars: `mergedXP = XPCalculator.recalculate().xp` (or `Math.max(cloud, local)` as fallback)
5. Call `syncProgress()` Cloud Function with merged data
6. Restore sync blob (cross-device localStorage state)
7. **Step 9 — Final XP Correction**: Re-runs `XPCalculator.recalculate()`, writes result to BOTH localStorage AND Firestore

### Layer 3 — Deterministic Re-derivation (XPCalculator)

Located in `XPCalculator.js`. Pure function that recomputes XP from scratch — never reads stored XP values.

**Canonical XP Rates:**
| Activity | XP |
|----------|-----|
| Presentation viewed | 50 |
| Tool explored | 50 |
| Quiz passed (70-89%) | 100 |
| Quiz perfect (90%+) | 200 |
| Gate cleared | 500 |
| Lab completed | 500 |
| Game played (unique) | 100 |
| Course completed | 10,000 |
| Daily login | 25 |

**Level Formula (quadratic):**
```
level = max(1, floor((1 + sqrt(1 + xp/12.5)) / 2))
```

**Data sources read (localStorage ONLY):**
- `progress.completedModules[]` — iterated and classified by type
- `progress.quizHistory[]` — quiz scores for perfect bonus
- `progress.labsCompleted[]` — lab identification
- `hexworth_game_tracker` — unique games with scores
- `hexworth_achievements` / `hexworth_achievements_v2` — badge points
- `gate{1-10}_complete` keys — gate clearances
- `hexworth_house_completions` — course completion flags
- `hexworth_streak` / `hexworth_stats.totalLogins` — login days (capped 365)

**Type Resolution (multi-tier):**
1. quizHistory lookup → quiz
2. labsCompleted lookup → lab
3. ContentCatalog.getModule() → check href/type
4. ID suffix heuristic (-quiz, -lab, -tool, -presentation)
5. Default: presentation (conservative fallback, 50 XP)

## The Dual-Authority Problem

### Two Sources of Truth

1. **Firestore** — canonical record across all devices. Has the full completion history from all sessions, all devices.
2. **localStorage** — current session truth. May have completions not yet synced. May also be incomplete if data was corrupted or device is new.

Neither can blindly overwrite the other:
- If Firestore wins → you lose in-progress local work not yet synced
- If localStorage wins → you lose completions from other devices or past sessions where sync was spotty

### The Current Bug: Step 9 Clobbers Server XP

`syncBidirectional()` step 9 runs `XPCalculator.recalculate()` which reads ONLY from localStorage structured arrays (`completedModules[]`, `quizHistory[]`, `labsCompleted[]`). If those arrays are incomplete — which they often are due to the platform's 4 overlapping storage formats — the recalculated XP is lower than the true XP.

Step 9 then **overwrites Firestore XP with this lower number**, erasing the correct server-side XP that was built up by Cloud Functions (`recordProgress`, `addXP`).

### Evidence

Profile for @EQ6 (as of 2026-03-01):
- 115 modules, 40 achievements, 47 labs, 19 quizzes, 19-day streak, 1 box pwned, 2 flags
- **Shown XP: 10,600** (Level 15)
- **Estimated XP from stats: 30,000+** (conservative)

The ~3x gap strongly suggests XPCalculator is undercounting completions from localStorage and overwriting the higher server XP.

### Overlapping Storage Formats (Root Cause)

The platform has 4+ localStorage formats accumulated over versions:

1. **Structured** — `hexworth_progress` with `completedModules[]`, `labsCompleted[]`, `quizzesPassed[]`, `quizHistory[]`
2. **Flat** — within same object: `progress[houseId][moduleId] = {completed, score, completedAt}`
3. **Standalone keys** — `hexworth_quiz_scores`, `hexworth_lab_progress`, `hexworth_modules_completed`
4. **Course-specific** — `core2-ch{NN}-quiz`, `hexworth_progress_core1`, `hexworth_progress_core2`

XPCalculator only reads from format 1 (structured arrays). Completions stored in formats 2-4 are invisible to it.

`ProgressManager._reconcileCounts()` (line ~890) uses `Math.max()` across structured, flat, and standalone sources for display counts — but XPCalculator does NOT use this method.

### StateFederation (Cross-Device Sync)

`StateFederation.js` is the latest approach to solving the sync problem — a federated state sync service inspired by roaming profiles. It replaces ~70 lines of repeated sync boilerplate per module with a single `register()` call. API: `fed.save()`, `fed.load()`, `fed.getResume()`, `fed.reset()`, `fed.clearFull()`, `fed.refresh()`.

Uses a 4-tier cascading load: local → sync key → course completion → null. This is the most promising approach to ensuring both truths (Firestore and localStorage) stay in sync without trampling each other.

### What Needs To Be Solved

The reconciliation strategy must:
1. **Union completions** from both Firestore and localStorage (never lose data from either side)
2. **Take max on scalars** (XP, streak — can only go up)
3. **Derive XP from the merged set** (not from one side alone)
4. **Never allow a recalculation to lower XP** below what the server already has
5. **Account for all 4 storage formats** when counting local completions

This is an architectural problem, not a simple bug fix. The fix must be planned carefully to avoid breaking the sync guarantees that StateFederation and syncBidirectional provide.

## Firestore Security Rules

XP-related fields in the user profile whitelist (`firestore.rules` line 22-29):
```
xp, level, modulesCompleted, labsCompleted, quizzes, achievements, streak, ctfBoxesPwned, ctfFlagsCaptured
```

Note: `xp` and `level` are client-writable because XPCalculator derives them deterministically. The comment in firestore.rules says: "XP + level are client-writable because XPCalculator derives them deterministically from completion state — the client can't inflate XP beyond what completions justify."

However, the current bug means the client CAN deflate XP below what the server has, because XPCalculator undercounts.

## Where XP Is Displayed

| Location | Source | Method |
|----------|--------|--------|
| Dashboard header | localStorage | `loadUserStats()` → `ProgressManager.getProfile()` → `XPCalculator.recalculate()` |
| Dashboard profile tab | localStorage | `loadProfileTab()` → reads `hexworth_xp` / `hexworth_level` |
| User Profile Modal | Firestore | `FirestoreManager.getUserProfile(uid)` → reads `p.xp`, `p.level` |
| Leaderboard | Firestore | Queries users sorted by `xp` field |

## Related Docs

- [User Profile Modal](USER_PROFILE_MODAL.md) — Stats display, backfill pipeline, storage formats
- [CTF Arena](CTF_ARENA.md) — Box completion reporting, CTF stats sync
- [Handler Comms](HANDLER_COMMS.md) — Activity feed that references XP events
