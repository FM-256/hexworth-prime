# Incident: Stale Tourist Visa Silently Blocked Progress Saves (2026-07-09)

*Live as of 2026-07-09 · production hexworth.com*

## TLDR

A+ Core 1 chapter completions acknowledged on the "Mark Complete" button but never turned green and never appeared in `localStorage.hexworth_progress`. No console error. Root cause: `TouristVisa.js` wraps `ModuleProgress.complete` / `ModuleProgress.completeQuiz` and silently returns `false` (no throw) whenever `localStorage.hexworth_tourist_active === 'true'`. That flag was never cleared when a tourist later got sorted, so one past tourist-mode visit permanently swallowed every future completion for that browser profile. The button set "Completed!" before calling `complete()`, so the failure was invisible to the student. Fixed via a self-healing `isActive()` check, an honest button that checks the return value, and an additive hub read for both completion key shapes. Fix is live and verified on production. Three related call-site gaps remain open as sprint tasks #70-72.

## Root Cause

`_app/components/TouristVisa.js` `installBlockers()` (lines 224-258) wraps `ModuleProgress.complete` and `ModuleProgress.completeQuiz`:

```
obj[methodName] = function () {
    if (isActive()) {
        console.log('[TouristVisa] Blocked ' + label + ' — tourist mode');
        return false;
    }
    return original.apply(obj, arguments);
};
```

When `isActive()` is true, the wrapper returns `false` and never calls the original method. No exception, no `console.error`, only a `console.log`. Nothing in `localStorage.hexworth_progress` changes.

The `hexworth_tourist_active` flag was written the first time a user browsed a house before sorting, and nothing ever cleared it once the user was sorted. `_app/sorting.html` writes `hexworth_house` at four call sites (lines 1072, 1099, 1703, 1833) but never called `TouristVisa.disable()`. A user who browsed as a tourist once, then completed the Sorting Quiz weeks or months later, kept `hexworth_tourist_active=true` forever: every `ModuleProgress.complete` call from that point on silently failed.

The chapter's `markComplete()` set the button text to `"Completed!"` and disabled the button BEFORE calling `ModuleProgress.complete()` (pre-fix `_app/houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html`, commit `020800c43`). The UI reported success regardless of whether the save happened. This is why the operator and student report described "acknowledged on the button but never turned green" with zero console signal.

### Why headless QC missed it

`TouristVisa.js` is injected asynchronously by `AccessGuard.js` (`_app/components/AccessGuard.js:1010-1012`, the tourist-visa auto-loader IIFE). Headless QC that stubbed `AccessGuard` never loaded `TouristVisa.js` at all, so the blocker was never in the test's execution path: every pre-fix QC run passed while production failed. Root cause was found only by running the full flow against the live preview channel with zero stubs; the tell was an unexpected redirect to `/components/tourist-visa-prompt.html`.

### Debugging trail: theories eliminated

| Theory | Status | Detail |
|---|---|---|
| Hub reads a never-written legacy key `aplus-core1-progress` | Real, secondary | Fixed alongside root cause (see Fix #3 below) |
| `FirestoreManager` cloud-sync key-shape mismatch | Real, secondary | Fixed alongside root cause (see Fix #3 below) |
| `localStorage` quota exhaustion | Disproven | Operator's store measured ~122KB of a ~5MB quota |
| Multi-element completion gating (slides + quiz + lab all required) | Disproven | Core 2 hub uses OR logic (`_app/houses/forge/applets/comptia-aplus/core-2/index.html:917-929`); Core 1 requires only the chapter module |
| Stale tourist visa silently blocking `ModuleProgress.complete` | Confirmed root cause | See above |

## Fix

Master merge `129e0fe91` ("merge: tourist-visa stale-flag fix + Core 1 hub read hardening + diag panel"), deployed and verified live 2026-07-09. Component commits:

| Commit | Change |
|---|---|
| `020800c43` | `ch01` `markComplete()` now checks `complete()`'s return value instead of assuming success (pre-fix baseline; also tagged as rollback point, see below) |
| `6a1c13514` | `fix(tourist)`: stale tourist visa silently blocked all progress saves for sorted users; the core self-heal |
| `00f715285` | `fix(forge-core1)`: hub reads both completion key shapes (local + cloud-stripped) |
| `b9d13b65b` | `diag(forge-core1)`: opt-in `?diag=1` on-screen hub read report |

### 1. Self-healing `isActive()`: `_app/components/TouristVisa.js:83-98`

```js
function isActive() {
    if (localStorage.getItem(STORAGE_KEYS.active) !== 'true') return false;
    try {
        if (localStorage.getItem('hexworth_house')) {
            disable();
            return false;
        }
    } catch (e) { /* storage unavailable; treat flag as authoritative */ }
    return true;
}
```

A sorted user (`hexworth_house` present) is never a tourist. A stale visa is voided via `disable()` the first time `isActive()` is consulted, and completion saving is restored from that point forward. No student action required.

Why: "sorted = `hexworth_house` present" matches `AccessGuard.isSorted()` (`_app/components/AccessGuard.js:418-419`). The only legitimate writers of `hexworth_house` are `_app/sorting.html` (the three Sorting Quiz result paths plus the house-hopper explorer path) and `FirestoreManager`'s cloud profile restore, both of which mean the user is genuinely sorted, so voiding the tourist flag at that point is safe in every real case.

### 2. Honest button: `_app/houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html:1257-1277`

`markComplete()` now checks the return value of `ModuleProgress.complete()` (which returns literal `true` on success, `false` when blocked) and shows `"Not saved (Tourist Mode)"` instead of `"Completed!"` when the call is blocked.

### 3. Additive hub read: `_app/houses/forge/applets/comptia-aplus/core-1/index.html:922-936`

`isModuleComplete()` now reads both completion key shapes:

- Local write shape: `progress.forge['forge-ch01-motherboards']` (how `ModuleProgress.complete()` writes locally)
- Cloud-restored shape: `progress.forge['ch01-motherboards']` (prefix stripped). `FirestoreManager.addCloudCompletion` strips the house prefix when merging cloud completions into local storage (`_app/components/FirestoreManager.js:1188-1198`)

Purely additive: the extra read can only find MORE completions, never mark a completed card incomplete.

### 4. Diagnostic panel: `_app/houses/forge/applets/comptia-aplus/core-1/index.html:975-1016`

Opt-in on-screen diagnostic (`?diag=1` query param, invisible in normal use) reporting: signed-in state, tourist flag, house, `hexworth_progress` size, per-chapter key presence, and whether each card rendered green. This is the first tool to reach for on any future "not turning green" report: it distinguishes a write/sync failure (nothing in the store) from a render failure (data present, card stayed gray).

## Verification

Headless QC ran against the real production pages (real `ModuleProgress`, real `TouristVisa`, not stubbed):

- Genuine tourist (never sorted): still blocked by design, but the button now shows the honest "Not saved (Tourist Mode)" message instead of a false "Completed!".
- Stale flag + sorted user: completion persists and the stale flag auto-clears on first consult.
- Normal sorted path (no tourist history): unchanged, completions save as before.
- Hub read QC: 4/4 key-shape combinations verified.
- Full end-to-end real-click test (button click through to green card): passes.

Nancy (adversarial review): PROCEED. Chris (quality gate): PASS, with an independent re-run of all QC scripts.

Post-deploy: operator confirmed chapters turning green on production.

## Rollback

Git tag `prod-rollback-2026-07-09` marks commit `020800c43`, the pre-fix production state (this commit already carries the "button acknowledges click" partial fix but predates the tourist-visa self-heal). Tag is pushed to `origin`.

```
git checkout prod-rollback-2026-07-09
./deploy.sh
```

Or via Firebase console: Hosting -> release history -> roll back to the release matching `020800c43`.

## Open Follow-Ups (sprint tasks #70-72)

| # | Gap | Location | Risk |
|---|---|---|---|
| 70 | `isTourist()` fallback reads the raw `hexworth_tourist_active` flag directly when `TouristVisa` hasn't finished its async load, bypassing the `isActive()` self-heal in that race window | `_app/components/AccessGuard.js:413` | Wrong tourist banner possible on `requireAll(['house', ...])` pages during the race; access itself is not blocked |
| 71 | Wraps `ModuleProgress.complete` and calls `reveal()` unconditionally, ignoring a `false` (blocked) return | `_app/components/LinuxReplay.js:97-102` | Replay button could reveal on a blocked (non-)completion in the same pre-load race |
| 72 | ch02 through ch12 `markComplete` plus roughly 118 `completeQuiz` call sites platform-wide still set success UI without checking the return value | across the Core 1/Core 2 chapter set and other quiz call sites | Data loss itself is fixed platform-wide by the `isActive()` self-heal; in the narrow pre-load race described in #70, an unfixed page can still show one false "Completed!" |

None of these reproduce the 2026-07-09 incident (permanent silent data loss): the self-heal in `TouristVisa.isActive()` closes that path platform-wide regardless of which call site is used. They are narrower race-window and honesty-of-feedback gaps.

## Related

- `_app/components/TouristVisa.js`
- `_app/components/AccessGuard.js`
- `_app/components/FirestoreManager.js`
- `_app/houses/forge/applets/comptia-aplus/core-1/index.html`
- `_app/houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html`
- `_app/sorting.html`
- `_app/components/LinuxReplay.js`

*Last Updated: 2026-07-09 · v1.0.0*
