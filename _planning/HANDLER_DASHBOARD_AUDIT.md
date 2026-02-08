# Handler Dashboard Sync Audit

**Created:** February 5, 2026
**Status:** CRITICAL - Multiple blocking issues identified
**Priority:** P0 - Core functionality broken

---

## Executive Summary

The Handler Dashboard progress tracking is not working. Students complete assignments but handlers see 0% completion. Root cause is a fragmented data architecture with multiple incompatible storage formats and incorrect path mappings.

---

## Issue 1: Multiple Incompatible Storage Formats

### Problem
Different components save completion data to different locations/formats in localStorage:

| Component | Storage Key | Format |
|-----------|-------------|--------|
| Presentations (saveProgress) | `hexworth_progress` | `{shield: {'cia-triad': {completed, completedAt, score}}}` |
| QuizEngine | `hexworth_quiz_stats` | `{quizzesPassed, quizzesCompleted: [...]}` |
| ProgressManager | `hexworth_progress` | `{completedModules: [...], houses: {shield: {modulesCompleted: [...]}}}` |
| A+ Core 1/2 Quizzes | `aplus-core1-progress` | `{ch01: {completed, score, lastAttempt}}` |

### What checkLocalCompletion() expects
```javascript
hexworth_progress.{house}['{moduleKey}'] = { completed: true, completedAt: '...', score: X }
```

### Impact
- QuizEngine completions are invisible to sync
- ProgressManager completions use array format, not object format
- A+ quizzes use separate storage keys entirely

### Fix Required
- [ ] Standardize ALL completion saves to one format
- [ ] Update checkLocalCompletion() to check all formats OR migrate all saves to one format
- [ ] Add dual-write to ProgressManager (DONE - Feb 5, 2026)

---

## Issue 2: Quiz moduleId Mismatches

### Problem
Quizzes have `moduleId` set to `'house-xxx-quiz'` instead of matching their parent module.

**Example:**
- Handler assigns: `shield-cia-triad` (the module)
- Quiz saves as: `shield-cia-triad-quiz` (different ID)
- Sync looks for: `shield-cia-triad` → not found

### Files Needing Audit
All quiz files with `moduleId` config:
- `_app/houses/*/quizzes/*.html`
- Any file using `new QuizEngine({moduleId: ...})`

### Fix Required
- [ ] Audit all quizzes for moduleId values
- [ ] Change moduleId to match parent module (e.g., `'cia-triad'` not `'shield-cia-triad-quiz'`)
- [ ] Fixed: `cia-triad-quiz.html` (Feb 5, 2026)

---

## Issue 3: Wrong House ID in URL Construction

### Problem
When student clicks "Go to Task", the URL is constructed incorrectly:

```
Generated: houses/linux-mastery/modules/linux-mastery/lm-02-first-commands.html (404)
Correct:   houses/script/modules/linux-mastery/lm-02-first-commands.html
```

### Root Cause
`resolveAssignmentHref()` in dashboard.html:
```javascript
return 'houses/' + (mod.houseId || assignment.house) + '/' + mod.href;
```

`mod.houseId` is returning path name (`linux-mastery`) instead of house name (`script`).

### Location
- `_app/dashboard.html` line ~4476
- `_app/components/LearningPaths.js` - module data structure

### Fix Required
- [ ] Audit LearningPaths.js module definitions for correct houseId
- [ ] Verify PATH_HOUSE_MAP in handler-dashboard.html covers all paths
- [ ] Fix resolveAssignmentHref() fallback logic

---

## Issue 4: Content Not Registered

### Problem
Some assignable content doesn't exist in content-registry.js, causing:
- No metadata available
- Incorrect paths constructed
- Search doesn't find content

### Example
`linux-mastery` modules not found in content-registry.js search.

### Fix Required
- [ ] Audit all assignable content against content-registry.js
- [ ] Add missing entries
- [ ] Ensure components paths are correct

---

## Issue 5: Sync Only Triggers on Dashboard Visit

### Problem
Progress sync only runs when student visits `dashboard.html`:
```javascript
// In dashboard.html auth state handler
if (e.detail.user) {
    loadMyClasses();
    syncProgressToFirestore();  // Only runs here
}
```

### Impact
- Student completes quiz → closes browser → progress never syncs
- Handler sees stale data until student revisits dashboard

### Fix Required
- [ ] Consider sync on content completion (not just dashboard visit)
- [ ] Or add periodic background sync
- [ ] Or sync before page unload

---

## Issue 6: Handler Dashboard Reads from Firestore Only

### Problem
Handler dashboard calls `AssignmentManager.getClassProgress(classId)` which reads from Firestore.
If student's localStorage never synced to Firestore, handler sees nothing.

### Data Flow
```
Student localStorage → (sync on dashboard visit) → Firestore → Handler Dashboard
                           ↑
                     THIS STEP FAILS
```

### Fix Required
- [ ] Ensure sync is reliable
- [ ] Add visual indicator when student has unsynced progress
- [ ] Consider direct Firestore write on completion (requires auth)

---

## Test Case for Validation

Once fixes are applied, test with:

1. **Simple content:** A presentation with "Mark Complete" button
2. **Handler assigns** the content to a class
3. **Student (signed in, enrolled):**
   - Opens content
   - Clicks "Mark Complete"
   - Visits dashboard.html
4. **Check:** localStorage has correct format
5. **Check:** Console shows `[ProgressSync]` success logs
6. **Check:** Firestore has progress document
7. **Handler dashboard:** Shows completion

---

## Files to Audit

### Core Sync Logic
- [ ] `_app/dashboard.html` - checkLocalCompletion(), syncProgressToFirestore()
- [ ] `_app/handler-dashboard.html` - loadClassProgress(), renderActivityFeed()
- [ ] `_app/components/AssignmentManager.js` - submitProgress(), getClassProgress()
- [ ] `_app/components/ProgressManager.js` - completeModule(), storage format

### Content Components
- [ ] `_app/components/QuizEngine.js` - where/how it saves
- [ ] `_app/components/LearningPaths.js` - module definitions, houseId values
- [ ] `_app/config/content-registry.js` - all entries, component paths

### All Quizzes
- [ ] `_app/houses/shield/quizzes/*.html`
- [ ] `_app/houses/forge/applets/comptia-aplus/*/quizzes/*.html`
- [ ] `_app/houses/*/quizzes/*.html` (all houses)

### All Presentations with saveProgress
- [ ] Verify saveProgress() uses correct house/moduleId format

---

## Priority Order

1. **P0:** Fix storage format standardization (Issue 1)
2. **P0:** Fix URL construction (Issue 3)
3. **P1:** Audit and fix quiz moduleIds (Issue 2)
4. **P1:** Register missing content (Issue 4)
5. **P2:** Improve sync reliability (Issues 5, 6)

---

## Session Notes (Feb 5, 2026)

- Discovered issue when Frank Mora completed CIA Triad quiz (95%) but handler showed 0%
- Quiz was saving to wrong location and with wrong moduleId
- Added dual-write to ProgressManager as partial fix
- Fixed CIA Triad quiz moduleId as example
- Found URL 404 issue with linux-mastery assignment
- User requested full audit document (this file)
