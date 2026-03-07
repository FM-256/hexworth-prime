# XP Pipeline — Full Code Trace

**Components:** XPCalculator.js, ModuleProgress.js, ProgressManager.js, FirestoreManager.js, Cloud Functions
**Location:** `_app/components/`, `functions/index.js`
**Last audited:** 2026-03-07 (code trace, fixes applied same day)

---

## Purpose

XP drives the leveling system, leaderboard rankings, and profile display. The intent is deterministic derivation from completion state — never accumulated blindly — to prevent drift, inflation, and desync across devices.

Three independent XP systems previously conflicted. As of 2026-03-07, rates are aligned at 100 XP for presentations/tools, and the sync flow no longer deflates XP.

---

## Architecture: 4 Layers

### Layer 1 — Cloud Functions (Server-Side XP)

Located in `functions/index.js`. Called over HTTPS from client code.

**`recordProgress(type, itemId, house, score)`** — Awards XP via `FieldValue.increment()`:

| type | XP awarded | Firestore field updated |
|------|-----------|------------------------|
| module | +100 | `modulesCompleted` (arrayUnion), `xp` (increment) |
| lab | +500 | `labsCompleted` (arrayUnion), `xp` (increment) |
| quiz | +100 or +200 (if score=100) | `quizzes.{itemId}` (map), `xp` (increment) |
| achievement | 0 | `achievements` (arrayUnion) |

**`addXP(amount, reason)`** — Direct increment. Appends to `xpHistory[]` audit trail.

**`updateStreak()`** — +25 XP per daily login via `FieldValue.increment(25)`.

**`syncProgress(modulesCompleted, labsCompleted, quizzes, xp, streak, ...)`** — Bidirectional merge. Uses `Math.max(cloudXP, localXP)` for XP. Union for arrays. Writes via `set({ merge: true })`.

**Key property:** `recordProgress` uses `FieldValue.increment()` — monotonic, can only go up. But `syncProgress` uses `set()` with a max-merged value — this CAN go down if the local XP fed to it is lower than what `FieldValue.increment()` accumulated.

### Layer 2 — ModuleProgress.js (Completion Entry Point)

The primary completion API called by all presentations, modules, and quiz pages.

**`ModuleProgress.complete(houseId, moduleId, options)`** does:

1. **Flat write:** `progress[houseId][moduleId] = { completed: true, date }` (line 281)
2. **Bridge to structured:** calls `bridgeStructuredProgress()` which pushes `moduleId` into `progress.completedModules[]` and accumulates XP into `progress.xp` (line 288)
3. **Local XP accumulation:** `bridgeStructuredProgress` awards XP using its own rate table (line 205-208):
   - presentation/tool/applet: 100, quiz: 100 (200 if 90%+), lab: 500, module: 1000
   - `options.type` defaults to `'presentation'` (line 271)
4. **Firestore push:** `pushToUserProfile()` routes to the correct FirestoreManager method based on type (quiz → passQuiz, lab → completeLab, else → completeModule). Type is passed from `options.type` (line 299).
5. **CompletionStamp:** writes to `hexworth_completion_stamps` (line 291)
6. **Counter:** increments `hexworth_modules_completed` standalone key (line 302-303)

**`ModuleProgress.completeQuiz(houseId, quizId, score, options)`** does the same pattern but:
- Bridge uses type `'quiz'` with the actual score
- Firestore push goes through `FirestoreManager.passQuiz()` → `recordProgress({ type: 'quiz', score })`
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

**This means:** Quizzes completed through QuizEngine → ProgressManager never fire `recordProgress`, so the server-side `FieldValue.increment()` XP is never awarded for those quiz completions. The XP only exists in localStorage `progress.xp`.

### Layer 4 — XPCalculator.js (Deterministic Re-derivation)

Pure function that recomputes XP from scratch. Intended to be the single source of truth.

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
1. In quizHistory → quiz (100 or 200 XP)
2. In labsCompleted → lab (500 XP)
3. LearningPaths.getModule() → explicit type field (added 2026-03-07)
4. ContentCatalog.getModule() → check href suffix
5. ID suffix heuristic (-quiz, -lab, -tool, -presentation)
6. **Default: presentation (100 XP)**

**XP_RATES.MODULE_COMPLETE** (1000 XP) is defined but reserved for future chapter-completion detection. Individual presentations default to 100 XP via `PRESENTATION_VIEW`. Type resolution now uses LearningPaths (Tier 2) for accurate classification.

---

## The Sync Flow (syncBidirectional)

`FirestoreManager.syncBidirectional(uid)` runs on every dashboard auth state change. Here is the exact flow with line numbers:

### Step 1-2: Fetch cloud profile (line 1160)
Reads the user's Firestore document.

### Step 3: Cloud → Local (lines 1175-1224)
For each `cloudModules[]` and `cloudLabs[]` and `cloudQuizzes{}`:
- Writes to flat format: `localProgress[house][key] = { completed: true, restoredFromCloud: true }`
- Also pushes to `localProgress.completedModules[]`, `labsCompleted[]`, and `quizHistory[]` (fixed 2026-03-07)
- Uses `parseModuleId()` to split `"forge-md100-m01"` into `{ house: 'forge', key: 'md100-m01' }`

### Step 4: Local → Cloud (lines 1230-1246)
Scans flat `localProgress[house][key]` entries, builds `allModuleIds` set by reconstructing `"${house}-${key}"`. This correctly picks up both local and cloud-restored flat entries.

### Step 5: Merge XP (line 1251-1252)
```javascript
mergedXP = XPCalculator.recalculate().xp;
```
XPCalculator reads `completedModules[]`, which is now populated in step 3 (fixed 2026-03-07).

### Step 6: Write merged data to localStorage (line 1281-1286)
Writes the enriched localProgress (with cloud-restored flat entries), plus `hexworth_xp`, `hexworth_streak`, etc.

### Step 7: Send to Firestore via `syncProgress` CF (line 1323)
Sends merged module/lab arrays and `mergedXP` to the Cloud Function. The CF applies `Math.max(cloudXP, localXP)`.

### Step 8: Sync blob restore/write (line 1340-1342)
Cross-device localStorage blob restoration.

### Step 9: Final XP correction (lines 1346-1363)
```javascript
const finalCalc = XPCalculator.recalculate();
const finalXP = Math.max(finalCalc.xp, cloudProfile.xp || 0);
const finalLevel = XPCalculator.calculateLevel(finalXP);
// ...
await setUserProfile(uid, { xp: finalXP, level: finalLevel });
```
- Runs XPCalculator with complete data (completedModules[] now populated from cloud in step 3)
- Takes `Math.max` of recalculated vs cloud XP — prevents deflation (fixed 2026-03-07)
- Writes guarded result to localStorage and Firestore

---

## Bugs (Fixed 2026-03-07)

### Bug 1: XP rate disagreement — FIXED

All 4 systems (XPCalculator, ProgressManager, ModuleProgress bridge, Cloud Functions) now agree:

| Event | XP awarded |
|-------|-----------|
| Presentation/tool/applet completed | 100 |
| Lab completed | 500 |
| Quiz passed (70-89%) | 100 |
| Quiz perfect (90%+) | 200 |
| Daily login | 25 |
| MODULE_COMPLETE (full chapter) | 1000 (future — requires chapter-completion detection) |

CF `recordProgress` type `'module'` awards 100 XP (was 1000). The 1000 XP MODULE_COMPLETE bonus is reserved for future chapter-completion detection.

### Bug 2: syncBidirectional didn't populate completedModules[] — FIXED

Step 3 now pushes cloud-restored items into `completedModules[]`, `labsCompleted[]`, and `quizHistory[]` so XPCalculator sees them.

### Bug 3: Step 9 bypassed Math.max protection — FIXED

Step 9 now takes `Math.max(recalculated, cloudProfile.xp)` before writing to Firestore, preventing deflation.

### Bug 4: ProgressManager path skips Cloud Functions — OPEN (low priority)

QuizEngine calls `ProgressManager.completeModule()`, which writes to localStorage but never calls `recordProgress`. Mitigated by syncBidirectional now correctly populating completedModules[] (fix #2), so XPCalculator counts these on next dashboard load.

### Bug 5: XPCalculator type resolution missed LearningPaths — FIXED

`_resolveType()` now checks `LearningPaths.getModule(id)` as Tier 2, before ContentCatalog (Tier 3). This provides explicit type data for all 368 modules.

### Bug 6: ModuleProgress.pushToUserProfile hardcoded type — FIXED

`pushToUserProfile()` now routes labs to `FirestoreManager.completeLab()` and passes the actual type from `options.type` instead of hardcoding `'module'`.

---

## Post-Fix XP Notes

After the 2026-03-07 fixes:
- syncBidirectional now populates completedModules[] from cloud, so all completions are visible to XPCalculator
- Presentations award 100 XP (was 50), roughly doubling presentation-based XP
- Math.max guard prevents any sync cycle from deflating XP below its current cloud value
- On next dashboard load, XP should increase and stabilize at the correct deterministic value

---

## Where XP Is Awarded (Complete Map)

```
Student completes a module page:
  ModuleProgress.complete()
    ├─ localStorage flat: progress[houseId][moduleId] = { completed }
    ├─ localStorage structured: progress.completedModules.push(moduleId)
    ├─ localStorage accumulator: progress.xp += 100 (bridge, type defaults to 'presentation')
    ├─ localStorage counter: hexworth_modules_completed++
    ├─ Firestore (via CF): recordProgress({ type: options.type }) → xp += 100
    └─ CompletionStamp: hexworth_completion_stamps[id] = { completed }

Student passes a quiz via QuizEngine:
  ProgressManager.completeModule()
    ├─ localStorage structured: progress.completedModules.push(moduleId)
    ├─ localStorage structured: progress.quizHistory.push({ moduleId, score })
    ├─ localStorage flat: progress[houseId][moduleId] = { completed, score }
    ├─ localStorage accumulator: progress.xp += 100 or 200
    └─ (NO Cloud Function call — mitigated by syncBidirectional)

Dashboard loads (auth state change):
  syncBidirectional()
    ├─ Cloud → Local: flat + structured (completedModules, labsCompleted, quizHistory)
    ├─ Local → Cloud: reads flat format, sends to syncProgress CF
    ├─ XPCalculator.recalculate(): reads completedModules[] (complete)
    └─ setUserProfile({ xp: Math.max(calc, cloud), level }): guarded write
```

---

## Where XP Is Displayed

| Location | Source | Method |
|----------|--------|--------|
| Dashboard header | localStorage | `ProgressManager.getProfile()` → `XPCalculator.recalculate()` |
| Dashboard profile tab | localStorage | reads `hexworth_xp` / `hexworth_level` |
| User Profile Modal | Firestore | `FirestoreManager.getUserProfile(uid)` → `p.xp`, `p.level` |
| Leaderboard | Firestore | Queries users sorted by `xp` field |

After the 2026-03-07 fixes, all four locations show consistent XP. Step 9 uses Math.max to prevent deflation.

---

## Canonical XP Rate Table (Resolved 2026-03-07)

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
- XP is derived deterministically by XPCalculator, with Math.max guard against deflation.
- CF `recordProgress` type `'module'` awards 100 XP per page, matching XPCalculator.

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
- `complete()` skips `pushToUserProfile` CF call on repeats (CF `FieldValue.increment` isn't diminishing-aware)

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

## Firestore Security Rules

XP-related fields in the user profile whitelist (`firestore.rules` line 22-29):
```
xp, level, modulesCompleted, labsCompleted, quizzes, achievements, streak
```

`xp` and `level` are client-writable because XPCalculator derives them deterministically. The Math.max guard in step 9 prevents deflation — XP can only go up or stay the same.

---

## Key File Locations

| File | Line(s) | What |
|------|---------|------|
| `_app/components/XPCalculator.js` | 76-138 | `recalculate()` — main entry point |
| `_app/components/XPCalculator.js` | 159-235 | `_categorizeCompletions()` — where Bug 1 lives |
| `_app/components/XPCalculator.js` | 245-278 | `_resolveType()` — no 'module' case |
| `_app/components/ModuleProgress.js` | 270-348 | `complete()` — main completion API |
| `_app/components/ModuleProgress.js` | 166-218 | `bridgeStructuredProgress()` — local XP accumulation |
| `_app/components/ModuleProgress.js` | 109-123 | `pushToUserProfile()` — fires CF with hardcoded type:'module' |
| `_app/components/ProgressManager.js` | 442-524 | `completeModule()` — alternative path (no CF) |
| `_app/components/ProgressManager.js` | 897-915 | `_reconcileCounts()` — reads all formats (XPCalculator doesn't use this) |
| `_app/components/FirestoreManager.js` | 1154-1370 | `syncBidirectional()` — the 9-step sync flow |
| `_app/components/FirestoreManager.js` | 1175-1224 | Steps 3: Cloud → Local (flat only, Bug 2) |
| `_app/components/FirestoreManager.js` | 1251-1252 | Step 5: `mergedXP = XPCalculator.recalculate().xp` |
| `_app/components/FirestoreManager.js` | 1346-1363 | Step 9: the clobber (Bug 3) |
| `_app/components/FirestoreManager.js` | 346-365 | `setUserProfile()` — direct Firestore write, no Math.max |
| `_app/components/FirestoreManager.js` | 1475-1545 | `recalculateXP()` — also overwrites Firestore |
| `functions/index.js` | 564-621 | `recordProgress` CF — awards 1000 XP for modules |
| `functions/index.js` | 675-766 | `syncProgress` CF — Math.max merge |

---

## Related Docs

- [User Profile Modal](USER_PROFILE_MODAL.md) — Stats display, backfill pipeline, storage formats
- [CTF Arena](CTF_ARENA.md) — Box completion reporting, CTF stats sync
- [Handler Comms](HANDLER_COMMS.md) — Activity feed that references XP events
