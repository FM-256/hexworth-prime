# XP Pipeline — Full Code Trace

**Components:** XPCalculator.js, ModuleProgress.js, ProgressManager.js, FirestoreManager.js, Cloud Functions
**Location:** `_app/components/`, `functions/index.js`
**Last audited:** 2026-03-08 (dual-authority fix + re-pollution fix deployed, 3 migration passes)

---

## Purpose

XP drives the leveling system, leaderboard rankings, and profile display. XP is derived deterministically from completion state by `XPCalculator.recalculate()` — the sole XP authority. Cloud Functions no longer touch XP.

---

## Architecture: 4 Layers

### Layer 1 — Cloud Functions (Data Only, No XP)

Located in `functions/index.js`. Called over HTTPS from client code.

**`recordProgress(type, itemId, house, score)`** — Records completions. **Does not award XP.**

| type | Firestore field updated |
|------|------------------------|
| module | `modulesCompleted` (arrayUnion) |
| lab | `labsCompleted` (arrayUnion) |
| quiz | `quizzes.{itemId}` (map) |
| achievement | `achievements` (arrayUnion) |

XP increments removed 2026-03-08 (`2598ef9f`).

**`addXP(amount, reason)`** — Audit trail only. Appends to `xpHistory[]`. **Does not increment `xp` field.** Games and RingManager call this CF; game XP is tracked deterministically via `hexworth_game_tracker` (localStorage) and XPCalculator awards 100 XP per unique game.

**`updateStreak()`** — **REMOVED 2026-08-31. This is no longer a Cloud Function.** It had no caller anywhere in `_app`, so it never ran in production, and it computed a streak from `users/{uid}.lastLoginDate` while the client computes a different one from `hexworth_last_study` — two definitions of one fact, the dead one waiting to be wired up wrong. Archived with its reasoning at `functions/_archive/updateStreak-orphaned-2026-08-31.js`. See BUG-237.

Streak XP is still derived by XPCalculator (25/day, capped at 365), unchanged. The `Math.max(local, cloud)` streak reconciliation in `FirestoreManager.syncBidirectional` was deliberately KEPT: it is cross-device reconciliation, not part of that defect, and removing it would let a long-idle device sync its stale 0 over a real streak.

**`syncProgress(modulesCompleted, labsCompleted, quizzes, xp, streak, ...)`** — Bidirectional merge. Writes client-supplied XP directly (from XPCalculator). Union for arrays. Writes via `set({ merge: true })`.

### Layer 2 — ModuleProgress.js (Completion Entry Point)

The primary completion API called by all presentations, modules, and quiz pages.

**`ModuleProgress.complete(houseId, moduleId, options)`** does:

1. **Flat write:** `progress[houseId][moduleId] = { completed: true, date }` (line 281)
2. **Bridge to structured:** calls `bridgeStructuredProgress()` which pushes `moduleId` into `progress.completedModules[]` and accumulates XP into `progress.xp` (line 288)
3. **Local XP accumulation:** `bridgeStructuredProgress` awards XP using its own rate table (line 205-208):
   - presentation/tool/applet: 100, quiz: 100 (200 if 90%+), lab: 500, module: 1000
   - `options.type` defaults to `'presentation'` (line 271)
4. **Firestore push:** `pushToUserProfile()` routes to the correct FirestoreManager method based on type (quiz -> passQuiz, lab -> completeLab, else -> completeModule). Type is passed from `options.type` (line 299).
5. **CompletionStamp:** writes to `hexworth_completion_stamps` (line 291)
6. **Counter:** increments `hexworth_modules_completed` standalone key (line 302-303)

**`ModuleProgress.completeQuiz(houseId, quizId, score, options)`** does the same pattern but:
- Bridge uses type `'quiz'` with the actual score
- Firestore push goes through `FirestoreManager.passQuiz()` -> `recordProgress({ type: 'quiz', score })`
- Also writes to `progress.quizHistory[]`

**`ModuleProgress.completeLab(houseId, labId, options)`** — same pattern with type `'lab'`.

### Layer 3 — ProgressManager.completeModule (Alternative Completion Path)

Called by **QuizEngine** (the main quiz framework). Separate from ModuleProgress.

`ProgressManager.completeModule(moduleId, houseId, moduleType, metadata)` (line 442):
1. Pushes to `progress.completedModules[]` (line 469)
2. Updates `progress.houses[houseId].modulesCompleted[]` (line 474)
3. Dual-writes flat format: `progress[houseId][moduleId]` (line 490-495)
4. Awards XP into `progress.xp` using its own rate table
5. **Does NOT call any Cloud Function.** No `recordProgress`, no `FirestoreManager.completeModule()`.

**This means:** Quizzes completed through QuizEngine -> ProgressManager never fire `recordProgress`, so the completion data only exists in localStorage until `syncBidirectional` runs on next dashboard load.

### Layer 4 — XPCalculator.js (Sole XP Authority)

Pure function that recomputes XP from scratch. **The single source of truth for all XP values.**

**`XPCalculator.recalculate()`** reads from `ProgressManager.getProgress()` (or raw `hexworth_progress` localStorage) and classifies items:

**Data sources:**
- `progress.completedModules[]` — iterated and classified by `_resolveType()`
- `progress.quizHistory[]` — quiz scores, also catches quizzes not in completedModules
- `progress.labsCompleted[]` — also catches labs not in completedModules
- `hexworth_game_tracker` — unique games with scores
- `hexworth_achievements` / `hexworth_achievements_v2` — badge points
- `gate{1-10}_complete` keys — gate clearances
- `hexworth_house_completions` — course completion flags
- `hexworth_streak` / `hexworth_stats.totalLogins` — login days

**Type resolution for each completedModules[] item** (`_resolveType`):
1. In quizHistory -> quiz (100 or 200 XP)
2. In labsCompleted -> lab (500 XP)
3. LearningPaths.getModule() -> explicit type field (added 2026-03-07)
4. ContentCatalog.getModule() -> check href suffix
5. ID suffix heuristic (-quiz, -lab, -tool, -presentation)
6. **Default: presentation (100 XP)**

**XP_RATES.MODULE_COMPLETE** (1000 XP) is defined but reserved for future chapter-completion detection. Individual presentations default to 100 XP via `PRESENTATION_VIEW`. Type resolution now uses LearningPaths (Tier 2) for accurate classification.

---

## The Sync Flow (syncBidirectional)

`FirestoreManager.syncBidirectional(uid)` runs on every dashboard auth state change. Here is the exact flow:

### Step 1-2: Fetch cloud profile (line 1160)
Reads the user's Firestore document.

### Step 3: Cloud -> Local (lines 1175-1224)
For each `cloudModules[]` and `cloudLabs[]` and `cloudQuizzes{}`:
- Writes to flat format: `localProgress[house][key] = { completed: true, restoredFromCloud: true }`
- Also pushes to `localProgress.completedModules[]`, `labsCompleted[]`, and `quizHistory[]`
- Uses `parseModuleId()` to split `"forge-md100-m01"` into `{ house: 'forge', key: 'md100-m01' }`
- `parseModuleId` handles multi-segment `dark-arts-` prefix and includes `ai` in known houses (fixed 2026-03-08)

### Step 4: Local -> Cloud (lines 1260-1276)
Filters and deduplicates `localProgress.completedModules[]` and `localProgress.labsCompleted[]` **in place**, then unions with cloud arrays. The in-place filter is critical: it ensures Step 6's localStorage write and Step 9's XPCalculator read both use clean data.

```javascript
const _validHouses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'linux', 'arena'];
const _isValidId = (id) => {
    if (!id || typeof id !== 'string') return false;
    if (id.startsWith('dark-arts-') && id.length > 10) return true;
    const dash = id.indexOf('-');
    if (dash < 1) return false;
    const house = id.slice(0, dash);
    const key = id.slice(dash + 1);
    if (!key || !_validHouses.includes(house)) return false;
    if (key.startsWith(house + '-')) return false;  // double-prefixed
    if (_validHouses.includes(key)) return false;   // key is a house name
    return true;
};
// Cleaned IN PLACE — not just filtered copies
localProgress.completedModules = [...new Set(localProgress.completedModules.filter(_isValidId))];
localProgress.labsCompleted = [...new Set(localProgress.labsCompleted.filter(_isValidId))];
```

Previous behavior (pre-2026-03-08): iterated `localProgress[house][key]` flat entries and reconstructed `"${house}-${key}"` IDs. This generated garbage entries by iterating non-module properties (xp, updatedAt, etc.) as keys, and double-prefixed IDs when cloud-restored entries were re-scanned. The initial `_isValidId` fix (commit `5e00b5c7`) created filtered copies but didn't clean `localProgress` in place, allowing garbage to persist in localStorage and inflate XPCalculator results.

### Step 5: Merge XP (lines 1278-1284)
```javascript
if (typeof XPCalculator !== 'undefined') {
    mergedXP = XPCalculator.recalculate().xp;
} else {
    mergedXP = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.xp) || '0');
}
```
No Math.max ratchet. XPCalculator result is authoritative.

### Step 6: Write merged data to localStorage (line 1309)
Writes the cleaned `localProgress` (filtered in Step 4, enriched in Step 3), plus `hexworth_xp`, `hexworth_streak`, etc.

### Step 7: Send to Firestore via `syncProgress` CF (line 1351)
Sends merged module/lab arrays and `mergedXP` to the Cloud Function. The CF validates both client-sent and existing cloud data with `_isValidModuleId()` before merging (server-side gatekeeper, added commit `a03245ed`). Writes client-supplied XP directly (no Math.max).

### Step 8: Sync blob restore/write (lines 1367-1385)
Cross-device localStorage blob restoration via `_restoreSyncBlob` (deep merge). Followed by **Step 8a**: re-reads `hexworth_progress` from localStorage and re-applies `_isValidId` filter to `completedModules[]` and `labsCompleted[]`. This catches garbage re-introduced by the sync blob's deep merge with old data.

### Step 9: Final XP correction (lines 1388-1408)
```javascript
const finalCalc = XPCalculator.recalculate();
const finalXP = finalCalc.xp;
const finalLevel = finalCalc.level;
// ...
await setUserProfile(uid, { xp: finalXP, level: finalLevel });
```
XPCalculator is sole authority. No Math.max ratchet. Reads from localStorage cleaned by Steps 4 and 8a. Writes deterministic result to localStorage and Firestore.

---

## Deployment Log

### 2026-03-08: Dual-Authority Fix (Commits `2598ef9f`, `5e00b5c7`)

**Problem:** Four Cloud Functions incremented XP via `FieldValue.increment()` while XPCalculator also derived XP deterministically. Combined with `Math.max` ratchets in FirestoreManager Steps 5 and 9, XP could only go up, never correct down. Data pollution (duplicate IDs, garbage entries from flat-format reconstruction) further inflated counts.

Evidence: @VORYX had 49K XP with 30 unique modules. @EQ6 had 45K XP with 62 unique modules.

**Commit `2598ef9f` — "Fix XP dual-authority bug":**
1. `functions/index.js` — Removed `FieldValue.increment()` XP writes from `recordProgress`, `updateStreak`, `addXP`, `syncProgress`
2. `_app/components/FirestoreManager.js` — Replaced Step 4 flat-format reconstruction with direct array union; removed Math.max from Steps 5 and 9; fixed `parseModuleId` for dark-arts and ai houses
3. `functions/migrate-xp.js` — Created one-time migration script (dedup + recalculate)

**Commit `5e00b5c7` — "Add module ID validation to migration script and sync filter":**
1. `functions/migrate-xp.js` — Added `isValidModuleId()` that rejects bare house names, double-prefixed IDs, non-module properties, and entries without a known house prefix
2. `_app/components/FirestoreManager.js` — Added `_isValidId` filter to Step 4 local->cloud union to prevent garbage from localStorage re-polluting Firestore

**Deploy order:**
1. `firebase deploy --only functions` — stopped CFs from incrementing XP
2. `firebase deploy --only hosting` — deployed client fixes
3. `cd functions && node migrate-xp.js` — dry run (52 users)
4. `node migrate-xp.js --apply` — first pass: dedup only (37 users updated)
5. Discovered VORYX re-inflated on login (garbage entries counted as modules). Updated migration with `isValidModuleId()`.
6. `firebase deploy --only hosting` — deployed `_isValidId` filter
7. `node migrate-xp.js --apply` — second pass: dedup + garbage filter (34 users updated, 942 garbage entries removed)

### 2026-03-08: Re-Pollution Fix (Commit `a03245ed`)

**Problem:** After the second migration pass, EQ6 re-inflated to 45.6K XP on dashboard load. Root cause: `_isValidId` in Step 4 created filtered copies for the Firestore merge but didn't clean `localProgress` arrays in place. Step 6 wrote dirty `localProgress` to localStorage. Step 9 XPCalculator read dirty localStorage and computed inflated XP. Also, `_isValidId` didn't reject key-is-house-name entries (`script-script`, `forge-forge`), and `syncProgress` CF had no ID validation at all.

**Three fixes in commit `a03245ed`:**
1. `_app/components/FirestoreManager.js` — Filter `localProgress.completedModules/labsCompleted` **in place** (not copies) before Step 6 localStorage write. Added Step 8a post-sync-blob cleanup. Fixed `_isValidId` to reject `_validHouses.includes(key)`.
2. `functions/index.js` — Added `_isValidModuleId()` to `syncProgress` CF. Filters both client-sent arrays and existing cloud data during merge. Server-side gatekeeper prevents any client (including old cached JS) from writing garbage.

**Deploy + migration (3rd pass):**
1. `firebase deploy --only functions` — CF now validates all module IDs
2. `firebase deploy --only hosting` — client filters in place + post-blob cleanup
3. `node migrate-xp.js --apply` — 3 users updated (EQ6, VORYX, HACKERMAN), 77 garbage entries removed

**Final results:**

| User | Before | After | Change |
|------|-------:|------:|--------|
| @HACKERMAN | 528,750 | 1,025 | -99% (2 clean modules) |
| @VORYX | 49,004 | 15,650 | -68% (30 clean modules) |
| @EQ6 | 45,635 | 23,875 | -48% (62 clean modules) |

49 other users unchanged — data was already clean from 2nd pass. XP will be slightly higher on next login as XPCalculator includes game/badge XP from localStorage that the migration script skips.

### 2026-03-07: Rate Alignment + Sync Fixes (pre-dual-authority)

- Aligned XP rates across all 4 systems (100 for presentations, was 50 in some places)
- Fixed syncBidirectional Step 3 to populate `completedModules[]` from cloud
- Added LearningPaths as Tier 2 type resolver in XPCalculator
- Fixed ModuleProgress.pushToUserProfile to route by actual type

---

## Module ID Validation

Three parallel validators ensure only valid module IDs enter the system. All use the same logic:

**`_isValidId()` in FirestoreManager.js (client-side runtime filter):**
Applied in Step 4 (in-place array cleanup) and Step 8a (post-sync-blob cleanup). Filters `localProgress.completedModules` and `localProgress.labsCompleted` before localStorage write and XPCalculator read.

**`_isValidModuleId()` in syncProgress CF (server-side gatekeeper):**
Filters both client-sent arrays and existing Firestore data during merge. Prevents any client — including old cached JS — from writing garbage to Firestore.

**`isValidModuleId()` in migrate-xp.js (batch cleanup):**
Same validation logic for one-time migration runs.

**Valid houses:** web, shield, forge, script, cloud, code, key, eye, ai, linux, arena, dark-arts (multi-segment)

**Garbage patterns rejected:**
- Bare house names: `forge`, `shield`, `cloud`
- Key-is-house-name: `script-script`, `forge-forge`, `code-code`
- Double-prefixed: `forge-forge-md100`, `shield-shield-cia`
- Non-module properties: `xp`, `updatedAt`, `completedModules`
- Bare keys without prefix: `cia-triad`, `md100-m01`
- Underscore-separated: `ctf_a2` (CTF tracked via separate `ctfBoxesPwned` field)

---

## Bugs (Status as of 2026-03-08)

### Bug 1: XP rate disagreement — FIXED (2026-03-07)

All systems now agree on rates. See Canonical XP Rate Table below.

### Bug 2: syncBidirectional didn't populate completedModules[] — FIXED (2026-03-07)

Step 3 now pushes cloud-restored items into `completedModules[]`, `labsCompleted[]`, and `quizHistory[]`.

### Bug 3: Dual-authority XP (CFs + XPCalculator) — FIXED (2026-03-08)

CFs no longer increment XP. XPCalculator is sole authority. Math.max ratchets removed from Steps 5, 9, and syncProgress CF.

### Bug 4: Data pollution from flat-format reconstruction — FIXED (2026-03-08)

Step 4 no longer iterates `localProgress[house][key]`. Uses direct array union with `_isValidId` filter. Migration cleaned 942 garbage entries from Firestore.

### Bug 5: ProgressManager path skips Cloud Functions — OPEN (low priority)

QuizEngine calls `ProgressManager.completeModule()`, which writes to localStorage but never calls `recordProgress`. Mitigated by syncBidirectional populating completedModules[] and XPCalculator being the sole XP authority.

### Bug 6: XPCalculator type resolution missed LearningPaths — FIXED (2026-03-07)

`_resolveType()` now checks `LearningPaths.getModule(id)` as Tier 2.

### Bug 7: ModuleProgress.pushToUserProfile hardcoded type — FIXED (2026-03-07)

`pushToUserProfile()` now routes labs to `FirestoreManager.completeLab()` and passes actual type.

### Bug 8: parseModuleId missing houses — FIXED (2026-03-08)

Added `dark-arts-` multi-segment prefix handling and `ai` to known houses.

### Bug 9: XP re-pollution from dirty localStorage — FIXED (2026-03-08)

`_isValidId` filter created filtered copies for Firestore write but didn't clean `localProgress` in place. Step 6 wrote dirty arrays to localStorage. XPCalculator in Step 9 read dirty localStorage, computed inflated XP, and wrote it back to Firestore — undoing the migration. Additionally, sync blob restore (Step 8) could reintroduce garbage via deep merge. Fixed by filtering arrays in place before Step 6 and adding Step 8a post-blob cleanup. Also added `_isValidModuleId()` to `syncProgress` CF as server-side gatekeeper.

---

## Where XP Is Awarded (Complete Map)

```
Student completes a module page:
  ModuleProgress.complete()
    +-- localStorage flat: progress[houseId][moduleId] = { completed }
    +-- localStorage structured: progress.completedModules.push(moduleId)
    +-- localStorage accumulator: progress.xp += 100 (bridge)
    +-- localStorage counter: hexworth_modules_completed++
    +-- Firestore (via CF): recordProgress({ type }) -> arrayUnion only (NO XP increment)
    +-- CompletionStamp: hexworth_completion_stamps[id] = { completed }

Student passes a quiz via QuizEngine:
  ProgressManager.completeModule()
    +-- localStorage structured: progress.completedModules.push(moduleId)
    +-- localStorage structured: progress.quizHistory.push({ moduleId, score })
    +-- localStorage flat: progress[houseId][moduleId] = { completed, score }
    +-- localStorage accumulator: progress.xp += 100 or 200
    +-- (NO Cloud Function call -- mitigated by syncBidirectional)

Dashboard loads (auth state change):
  syncBidirectional()
    +-- Step 3: Cloud -> Local (flat + structured arrays)
    +-- Step 4: Filter localProgress arrays IN PLACE (_isValidId + dedup)
    +-- Step 5: XPCalculator.recalculate() (reads cleaned localStorage)
    +-- Step 6: Write cleaned localProgress to localStorage
    +-- Step 7: Send to syncProgress CF (server validates with _isValidModuleId)
    +-- Step 8: Sync blob restore + Step 8a: re-clean post-merge
    +-- Step 9: Final XPCalculator.recalculate() -> setUserProfile()
```

---

## Where XP Is Displayed

| Location | Source | Method |
|----------|--------|--------|
| Dashboard header | localStorage | `ProgressManager.getProfile()` -> `XPCalculator.recalculate()` |
| Dashboard profile tab | localStorage | reads `hexworth_xp` / `hexworth_level` |
| User Profile Modal | Firestore | `FirestoreManager.getUserProfile(uid)` -> `p.xp`, `p.level` |
| Leaderboard | Firestore | Queries users sorted by `xp` field |

All four locations show consistent XP after syncBidirectional runs on dashboard load.

---

## Canonical XP Rate Table

| Event | XP (1st) | Repeat XP | Notes |
|-------|---:|---:|-------|
| Presentation viewed | 100 | Diminishing | `floor(100 * 0.5^(n-1))` per repeat |
| Tool/applet explored | 100 | Diminishing | Same formula as presentation |
| Quiz passed (70-89%) | 100 | None | One-and-done |
| Quiz perfect (90%+) | 200 | None | One-and-done |
| Lab completed | 500 | Diminishing | `floor(500 * 0.5^(n-1))` per repeat |
| Gate cleared | 500 | None | Dark Arts gates |
| Game played | 100 | None | Flat rate per unique game with score |
| MODULE_COMPLETE | 1000 | None | Future: full chapter (all presentations + quiz + labs) |
| Course complete | 10,000 | None | All modules in a house path |
| Daily login | 25 | None | Capped at 365 days |

**Key decisions:**
- Presentations get 100 XP each. The old 50 XP rate was too low.
- MODULE_COMPLETE (1000 XP) is reserved for future chapter-completion detection, not per-page.
- XP is derived deterministically by XPCalculator. No Math.max guards, no CF increments.
- CFs handle data persistence (arrayUnion, quiz maps). XP is purely client-derived.

---

## Diminishing XP Returns on Repeat Completions (2026-03-07)

Repeat completions of presentations, tools, and labs award diminishing XP. Quizzes remain one-and-done (no repeat XP). Formula: `floor(baseXP * 0.5^(n-1))` where n is the completion number (1-indexed).

### Diminishing XP Schedule

| View | Pres/Tool (base 100) | Lab (base 500) |
|------|---:|---:|
| 1st | 100 | 500 |
| 2nd | 50 | 250 |
| 3rd | 25 | 125 |
| 4th | 12 | 62 |
| 5th | 6 | 31 |
| 6th | 3 | 15 |
| 7th | 1 | 7 |
| 8th+ | 0 | 3/1/0 |
| **Max total** | **~197** | **~994** |

### Data Model

Completion counts are stored inside `hexworth_progress` (no new localStorage keys, no Firestore schema change):

```javascript
progress.completionCounts = { "module-id": 3, "lab-id": 2, ... }
```

- Syncs via existing blob sync. `SyncUtils.deepMerge` uses `Math.max` for numbers, so higher count wins across devices.
- Missing count = 1 (backwards-compatible, no XP change for existing users).
- Quizzes are tracked in completionCounts but ignored for XP (one-and-done).

### Implementation (3 files)

**XPCalculator.js:**
- `_diminishingXPSum(baseXP, count)` — private helper that sums the diminishing series
- `_categorizeCompletions()` reads `progress.completionCounts` and uses `_diminishingXPSum` for labs/tools/presentations (quizzes unchanged)
- `_counts` still tracks unique modules (not total views)

**ModuleProgress.js (`bridgeStructuredProgress`):**
- Always increments `progress.completionCounts[moduleId]`
- First completion: existing flow (push to arrays + full XP)
- Repeat quiz: returns early (one-and-done)
- Repeat non-quiz: awards `floor(baseXP * 0.5^(count-1))` instead of returning early
- `complete()` skips `pushToUserProfile` CF call on repeats (CF only fires once)

**ProgressManager.js (`completeModule`):**
- Always increments `progress.completionCounts[moduleId]`
- Quiz repeat: returns early with no XP (existing behavior)
- Non-quiz repeat: skips array pushes + house tracking, awards diminishing XP
- Shows completion notification with diminished XP amount

### What Did NOT Change

- **Cloud Functions** — `pushToUserProfile` guarded to first-completion only, so CF only fires once.
- **Firestore rules** — `completionCounts` lives inside sync blob, not user doc.
- **SyncUtils** — `deepMerge` already handles numeric `Math.max`.
- **CompletionStamp** — Already idempotent.
- **Activity events** — Still fire on every completion (repeat activity is valid).
- **`hexworth_modules_completed` counter** — Keeps incrementing on every call (total views, not unique).

---

## Migration Script (`functions/migrate-xp.js`)

One-time data cleanup tool. Runs from `functions/` directory using firebase-admin.

### Usage
```
node migrate-xp.js              # Dry run -- prints changes, writes nothing
node migrate-xp.js --apply      # Live run -- writes to Firestore
node migrate-xp.js --user EQ6   # Single user dry run
node migrate-xp.js --user EQ6 --apply   # Single user live
```

### What it does per user:
1. **Deduplicates** `modulesCompleted[]` and `labsCompleted[]` (`[...new Set(array)]`)
2. **Filters garbage** via `isValidModuleId()` (rejects bare houses, double-prefixed, non-module properties)
3. **Recalculates XP** from cleaned data:
   - Classifies each module: quizzes map (tier 1) -> labsCompleted set (tier 1) -> ID suffix heuristic (tier 4) -> default presentation
   - Awards: presentation=100, lab=500, quiz pass=100, quiz perfect=200
   - Gate XP: `gate_N` and `dark_arts_gateN` in achievements x 500
   - Streak XP: streak x 25 (capped at 365)
   - Skips badge and game XP (localStorage only, filled on next login by XPCalculator)
4. **Writes back**: cleaned arrays, recalculated XP, recalculated level, `xpMigratedAt` timestamp

### XP note:
Migration-derived XP is slightly low (missing game/badge XP from localStorage). On each user's next dashboard load, XPCalculator runs with full data and writes the correct (slightly higher) value.

---

## Firestore Security Rules

XP-related fields in the user profile whitelist (`firestore.rules` line 22-29):
```
xp, level, modulesCompleted, labsCompleted, quizzes, achievements, streak
```

`xp` and `level` are client-writable because XPCalculator derives them deterministically. With CFs no longer touching XP, the client is the only writer.

---

## Key File Locations

| File | What |
|------|------|
| `_app/components/XPCalculator.js` | `recalculate()` — sole XP authority |
| `_app/components/ModuleProgress.js` | `complete()` — primary completion API |
| `_app/components/ProgressManager.js` | `completeModule()` — alternative path (QuizEngine) |
| `_app/components/FirestoreManager.js` | `syncBidirectional()` — 9-step sync flow with `_isValidId` filter |
| `functions/index.js` | Cloud Functions: `recordProgress`, `addXP`, `syncProgress` (no XP increments, `_isValidModuleId` gatekeeper). `updateStreak` was removed 2026-08-31, see above |
| `functions/quiz-score-policy.js` | The single definition of which quiz score is the student's score. `recordProgress` builds its quiz payload here, best-score by default (BUG-241) |
| `functions/migrate-xp.js` | One-time migration script with `isValidModuleId()` |

---

## Related Docs

- [User Profile Modal](USER_PROFILE_MODAL.md) — Stats display, backfill pipeline, storage formats
- [CTF Arena](CTF_ARENA.md) — Box completion reporting, CTF stats sync
- [Handler Comms](HANDLER_COMMS.md) — Activity feed that references XP events
- [XP Audit: EQ6 vs VORYX](XP_AUDIT_EQ6_vs_VORYX.md) — Pre-fix investigation data
