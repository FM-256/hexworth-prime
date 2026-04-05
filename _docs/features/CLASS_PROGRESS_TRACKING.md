# Class Progress Tracking — Bug Post-Mortem & Architecture

**Components:** handler-dashboard.html, dashboard.html, InstructorDashboard.js, ProgressManager.js, AssignmentManager.js, LearningPaths.js, ContentRegistry.js
**Location:** `_app/handler-dashboard.html`, `_app/dashboard.html`, `_app/components/`
**Last audited:** 2026-03-10 (three-layer fix deployed)

---

## Summary

Handler dashboard showed 100% completion for MD-100 class when the student had only completed 1 of 22 modules. Root cause was three independent bugs, each capable of corrupting progress data or display. All three were fixed on 2026-03-10.

---

## Bug #1: ProgressManager Syncing to All Classes (Data Pollution)

**File:** `_app/components/ProgressManager.js` (line ~401)
**Symptom:** Every module completion was written to every enrolled class, regardless of whether the module belonged to that class's curriculum.

**Root cause:** `ProgressManager.syncToFirestore()` iterated all enrolled classes and called `AssignmentManager.submitProgress()` for every completion without checking if the module was assigned to that class.

**Fix:** Added curriculum check — before submitting to a class, verify the module belongs to the class by checking against `AssignmentManager.getClassAssignments()` + `ContentRegistry.getPath()` module lists.

**Firestore path affected:** `classes/{classId}/progress/{studentUid}.completions`

---

## Bug #2: syncAllLocalProgress Dumping All localStorage (Data Pollution)

**File:** `_app/dashboard.html` (line ~8159, inline function `syncAllLocalProgress()`)
**Symptom:** On every auth callback, ALL localStorage completions (100+ keys from every course the user ever touched) were written to EVERY enrolled class's Firestore progress doc.

**Root cause:** `syncAllLocalProgress()` scanned all `hexworth_` localStorage keys, collected every completion, and wrote them to every class via `AssignmentManager.submitProgress()` — with zero filtering by class curriculum.

**Fix:** Built a `validIds` Set per class from assignments + `ContentRegistry.getPath()` module lists. Only completions matching `validIds` are synced to each class.

**Why it kept re-polluting:** Even after cleaning Firestore data manually, the next page load of `dashboard.html` would re-dump all 100+ completions right back.

---

## Bug #3: shareCommonCore Fuzzy Matching (Display Corruption)

**File:** `_app/handler-dashboard.html` (line ~6771, inline function `shareCommonCore()`)
**Symptom:** Handler dashboard showed 22/22 (100%) for MD-100 when only 1 module was actually completed.

**Root cause:** `shareCommonCore(id1, id2)` checks if two module IDs share any 2 consecutive hyphenated segments. All `forge-md100-*` modules share the consecutive segments `forge` + `md100`:

```
forge-md100-m01      → [forge, md100, m01]
forge-md100-m02      → [forge, md100, m02]
forge-md100-m01-lab  → [forge, md100, m01, lab]
```

`forge` at index 0 matches `forge` at index 0, AND `md100` at index 1 matches `md100` at index 1 → `shareCommonCore` returns `true` for ANY pair of MD-100 modules. Completing `forge-md100-m01-lab` fuzzy-matched all 22 modules.

This fuzzy matching was originally added as a legacy fallback for A+ Core 2 modules, where the same content existed under multiple ID formats. It was never intended to be used for path module expansion where LearningPaths provides authoritative module IDs.

**Fix:** Added `exactOnly` parameter to `isModuleCompleted()` and `findModuleCompletion()`:

```javascript
function isModuleCompleted(moduleId, completions, keys, exactOnly) {
    if (completions[moduleId]?.completed) return true;
    if (exactOnly) return false;
    return keys.some(k => completions[k]?.completed && shareCommonCore(moduleId, k));
}
```

All 14 path module expansion callers (using `mod.id` from LearningPaths) now pass `exactOnly=true`. Individual item assignment callers (`a.contentId`) retain fuzzy fallback for legacy Core 2 compatibility.

---

## Architecture: How Class Progress Works

### Data Flow

```
Student completes module
    → ModuleProgress.markComplete()
    → ProgressManager.syncToFirestore()
        → checks: is this module in the class curriculum?
        → if yes: AssignmentManager.submitProgress(classId, moduleId, data)
            → Firestore: classes/{classId}/progress/{uid}.completions.{moduleId}
```

### Handler Dashboard Read Path

```
Handler opens handler-dashboard.html
    → loadClassProgress()
        → AssignmentManager.getClassProgress(classId)
        → reads: classes/{classId}/progress/* (all students)
    → getStudentCompletion(uid)
        → for each assignment:
            → resolveAssignmentProgress(assignment, completions)
                → if path: expand via LearningPaths.PATHS[contentId].modules
                    → isModuleCompleted(mod.id, completions, keys, true)  // exact only
                → if item: direct lookup + fuzzy fallback
        → sum completed / total → percentage
```

### Key Data Stores

| Store | Path | Purpose |
|-------|------|---------|
| Firestore | `classes/{classId}/progress/{uid}` | Per-student completions map for a class |
| Firestore | `classes/{classId}/assignments/{id}` | Assigned content (type: path or item, contentId) |
| LearningPaths.js | `LearningPaths.PATHS[contentId].modules` | Authoritative module list for path assignments |
| ContentRegistry.js | `ContentRegistry.getPath(contentId)` | Extended module list (includes prereqs, quizzes, reviews) |
| localStorage | `hexworth_*` keys | Client-side completion cache |

### Two Dashboards (Important Distinction)

| File | URL | Purpose | Progress Logic |
|------|-----|---------|----------------|
| `dashboard.html` | `/dashboard.html` | Student dashboard with Instructor tab | `InstructorDashboard.js` (external component) |
| `handler-dashboard.html` | `/handler-dashboard.html` | Standalone handler/instructor dashboard | All progress logic inline (~2000 lines) |

These are completely separate pages with independent codebases for progress calculation. Fixes to one do NOT affect the other. The handler dashboard (`handler-dashboard.html`) is the primary instructor-facing tool.

### Matching Functions in handler-dashboard.html

| Function | Purpose | exactOnly behavior |
|----------|---------|-------------------|
| `shareCommonCore(id1, id2)` | Returns true if 2 consecutive hyphenated segments match | N/A (raw matcher) |
| `isModuleCompleted(id, completions, keys, exactOnly)` | Boolean: is this module completed? | `true` = exact key match only, `false`/undefined = fuzzy fallback |
| `findModuleCompletion(id, completions, keys, exactOnly)` | Returns completion data object or null | Same as above |
| `resolveAssignmentProgress(assignment, completions)` | Returns `{completed, total, pct}` for an assignment | Passes `exactOnly=true` for path modules |

---

## Firestore Cleanup

When data pollution occurs, the fix is to delete non-curriculum completion keys from the class progress doc:

```javascript
// Get valid module IDs for the class
const assignDocs = await db.collection('classes').doc(classId).collection('assignments').get();
const validPrefixes = assignDocs.docs.map(a => a.data().contentId);

// Read student progress
const progressDoc = await db.collection('classes').doc(classId).collection('progress').doc(uid).get();
const completions = progressDoc.data().completions || {};

// Delete keys that don't belong to any assigned content
const updates = {};
for (const key of Object.keys(completions)) {
    if (!validPrefixes.some(prefix => key.startsWith(prefix))) {
        updates[`completions.${key}`] = admin.firestore.FieldValue.delete();
    }
}
if (Object.keys(updates).length > 0) {
    await progressDoc.ref.update(updates);
}
```

---

## Commits

| Hash | Date | Description |
|------|------|-------------|
| `a35a12dc` | 2026-03-10 | Fix handler dashboard fuzzy matching — exactOnly for path modules |
| Prior commit | 2026-03-10 | Fix syncAllLocalProgress curriculum filtering in dashboard.html |
| Prior commit | 2026-03-10 | Fix ProgressManager + InstructorDashboard curriculum filtering |

---

## Lessons Learned

1. **Fuzzy matching is dangerous at scale.** `shareCommonCore` was fine for a handful of Core 2 modules but catastrophic when applied to 22 modules sharing a common prefix. Always prefer exact matching where authoritative IDs exist.

2. **Sync pipelines must filter by curriculum.** Any code that writes to `classes/{classId}/progress` must verify the module belongs to that class. There were THREE independent sync paths doing unfiltered writes.

3. **Two dashboards, two codebases.** `handler-dashboard.html` has all progress logic inline. Fixing `InstructorDashboard.js` (loaded by `dashboard.html`) does not fix the handler dashboard. Always verify which page the user is actually on.

4. **Clean data + dirty display logic = same bug.** Firestore data was verified clean multiple times, but the fuzzy matching in the display layer made 3 completions appear as 22. Data audits alone aren't sufficient — the rendering pipeline must also be verified.
