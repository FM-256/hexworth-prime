## Known Issues

### Digital Life Performance
- **Planet Overload Bug**: After many planets are created, the screen performance degrades significantly
- **Solution Needed**: Implement max planet cap OR automatic cleanup of old/off-screen planets
- **Location**: _app/digital-life/entities/Planet.js and Ecosystem.js
- **Priority**: High - affects user experience

---
*Added: 2025-12-18*

### ~~Instructor Dashboard Cannot See Student Activity~~ FIXED
- **Issue**: Instructor/handler dashboard showed no student completions, activity feed empty, analytics blank
- **Root Causes** (5 cascading bugs):
  1. Content pages used `ModuleProgress.js` (localStorage only) — never called `ProgressManager.syncToFirestore()` which has Firestore sync
  2. `ModuleProgress` redirect (1500ms) killed async Firestore sync before it completed
  3. `checkLocalCompletion()` stripped house prefix from key — `git-basics` vs stored `code-git-basics`
  4. `FirestoreManager.mergeProgress()` crashed on `modulesCompleted` stored as object instead of array
  5. `AssignmentManager.submitProgress()` used JS dot-notation keys creating flat `completions.xxx` fields instead of nested `completions` map
- **Affected Files**: `ModuleProgress.js`, `AssignmentManager.js`, `FirestoreManager.js`, `dashboard.html`, `handler-dashboard.html`
- **Status**: FIXED — all 5 bugs resolved, full pipeline working (localStorage → Firestore → instructor dashboard)

---
*Added: 2026-02-07 | Fixed: 2026-02-07*

### ~~showStageDetail Crash on Page Load~~ FIXED
- **Issue**: `code-git-basics.presentation.html` threw `TypeError: Cannot read properties of undefined (reading 'add')` on load
- **Root Cause**: `showStageDetail()` referenced `event.currentTarget` but was called from `DOMContentLoaded` (no click event)
- **Fix**: Find element by selector instead of relying on event object
- **Affected Files**: `_app/houses/code/presentations/code-git-basics.presentation.html`
- **Status**: FIXED

---
*Added: 2026-02-07 | Fixed: 2026-02-07*

### ~~ProgressManager.getProfile Crash~~ FIXED
- **Issue**: `TypeError: Cannot read properties of undefined (reading 'length')` at `ProgressManager.js:481`
- **Root Cause**: `progress.completedModules` was an object (not array) due to dual-write contamination, `.length` failed
- **Fix**: Safe type checking with `Array.isArray()` fallback to `Object.keys().length`
- **Affected Files**: `_app/components/ProgressManager.js`
- **Status**: FIXED

---
*Added: 2026-02-07 | Fixed: 2026-02-07*

### ~~getUserXP Crash on Null Values~~ FIXED
- **Issue**: `TypeError: Cannot convert undefined or null to object` in `dashboard.html` `getUserXP()`
- **Root Cause**: `hexworth_progress` localStorage contained non-object values (`xp: null`, `updatedAt: timestamp`) from ProgressManager. `Object.values(null)` throws.
- **Fix**: Added null guard: `typeof houseProgress === 'object' && houseProgress !== null`
- **Affected Files**: `_app/dashboard.html`
- **Status**: FIXED

---
*Added: 2026-02-07 | Fixed: 2026-02-07*

### ~~Broken Visualizer-to-Presentation Links~~ FIXED
- **Issue**: Visualizers in `applets/visualizers/` have buttons linking to presentations with incorrect relative paths
- **Example**: `osi-visualizer.html` links to `osi-presentation.html` (same folder) but file is at `../../presentations/osi-presentation.html`
- **Affected Files**: 1 (osi-visualizer.html)
- **Status**: ✅ FIXED - Updated path to `../../presentations/osi-presentation.html`

---
*Added: 2025-12-27 | Fixed: 2025-12-27*
