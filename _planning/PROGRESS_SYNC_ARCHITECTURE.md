# Progress Sync Architecture

**Created:** February 6, 2026
**Purpose:** Document the data flow for Handler Dashboard progress tracking
**Status:** DIAGNOSTIC - Maps current (broken) architecture

---

## File Hierarchy

```
_app/
├── dashboard.html                    ← Student dashboard
│   ├── checkLocalCompletion()        ← Reads localStorage, checks formats
│   └── syncProgressToFirestore()     ← Pushes to Firestore on dashboard visit
│
├── handler-dashboard.html            ← Handler view
│   └── loadClassProgress()           ← Reads from Firestore only
│
├── components/
│   ├── QuizEngine.js                 ← Quiz component
│   │   ├── saveQuizStats()           ← Writes to hexworth_quiz_stats (achievements)
│   │   └── trackQuizCompletion()     ← Calls ProgressManager.completeModule()
│   │
│   ├── ProgressManager.js            ← Central progress tracker
│   │   └── completeModule()          ← Writes to hexworth_progress (multiple formats)
│   │
│   ├── AssignmentManager.js          ← Firestore assignment CRUD
│   │   ├── submitProgress()          ← Writes to Firestore
│   │   └── getClassProgress()        ← Reads from Firestore
│   │
│   └── LearningPaths.js              ← Module definitions, path sequences
│
└── config/
    └── content-registry.js           ← All content metadata
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STUDENT SIDE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   QuizEngine     │                                                        │
│  │   (quiz page)    │                                                        │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           │ Quiz passed + trackProgress=true                                 │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    ProgressManager.completeModule()                    │   │
│  │                                                                        │   │
│  │  INPUT: moduleId='cia-triad', houseId='shield', type='quiz'           │   │
│  │                                                                        │   │
│  │  WRITES TO hexworth_progress:                                          │   │
│  │  {                                                                     │   │
│  │    completedModules: ['cia-triad', ...],        ← Array format         │   │
│  │    houses: {                                                           │   │
│  │      shield: {                                                         │   │
│  │        modulesCompleted: ['cia-triad', ...],    ← Array format         │   │
│  │        quizzesPassed: ['cia-triad', ...]                               │   │
│  │      }                                                                 │   │
│  │    },                                                                  │   │
│  │    shield: {                                    ← DUAL-WRITE (new)     │   │
│  │      'cia-triad': {                             ← Object format        │   │
│  │        completed: true,                                                │   │
│  │        completedAt: '2026-02-05T...',                                  │   │
│  │        score: 95                                                       │   │
│  │      }                                                                 │   │
│  │    }                                                                   │   │
│  │  }                                                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│           │                                                                  │
│           │ Student visits dashboard.html                                    │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    syncProgressToFirestore()                           │   │
│  │                                                                        │   │
│  │  1. Get student's enrolled classes                                     │   │
│  │  2. For each class, get assignments                                    │   │
│  │  3. For each assignment:                                               │   │
│  │     - Call checkLocalCompletion(assignment.contentId)                  │   │
│  │     - If found, submit to Firestore                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│           │                                                                  │
│           │ checkLocalCompletion('shield-cia-triad')                         │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    checkLocalCompletion()                              │   │
│  │                                                                        │   │
│  │  PARSES contentId: 'shield-cia-triad'                                  │   │
│  │    → house = 'shield'                                                  │   │
│  │    → moduleKey = 'cia-triad'                                           │   │
│  │                                                                        │   │
│  │  LOOKS FOR:                                                            │   │
│  │    hexworth_progress['shield']['cia-triad'].completed === true         │   │
│  │                                                                        │   │
│  │  SPECIAL CASES:                                                        │   │
│  │    - aplus-core1-ch01 → aplus-core1-progress['ch01']                   │   │
│  │    - aplus-core2-ch13 → aplus-core2-progress['ch13']                   │   │
│  │    - script-clh-001   → hexworth_progress['script']['clh-001']         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ AssignmentManager.submitProgress()
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FIRESTORE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  classes/{classId}/progress/{studentUid}                                     │
│  {                                                                           │
│    'shield-cia-triad': { completed: true, score: 95, completedAt: ... }     │
│  }                                                                           │
│                                                                              │
│  classes/{classId}/activity/{eventId}                                        │
│  { type: 'quiz_passed', contentId: 'shield-cia-triad', ... }                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ AssignmentManager.getClassProgress()
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HANDLER SIDE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  handler-dashboard.html                                                      │
│    └── loadClassProgress() → Reads Firestore → Displays completion %        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Storage Keys Reference

| Key | Purpose | Format | Used By |
|-----|---------|--------|---------|
| `hexworth_progress` | Main progress store | Complex object (see below) | ProgressManager, checkLocalCompletion |
| `hexworth_quiz_stats` | Quiz achievements | `{quizzesPassed: N, quizzesCompleted: [...]}` | QuizEngine (achievements only) |
| `hexworth_achievements` | Unlocked achievements | `['achievement-id', ...]` | AchievementSystem |
| `aplus-core1-progress` | A+ Core 1 chapters | `{ch01: {completed, score, lastAttempt}}` | A+ quizzes, checkLocalCompletion |
| `aplus-core2-progress` | A+ Core 2 chapters | `{ch13: {completed, score, lastAttempt}}` | A+ quizzes, checkLocalCompletion |
| `hexworth_synced_activity` | Tracks synced events | `{'classId:contentId': timestamp}` | syncProgressToFirestore |

---

## hexworth_progress Structure (Current)

```javascript
{
  // Metadata
  version: 1,
  createdAt: 1707123456789,
  updatedAt: 1707234567890,
  xp: 1250,
  level: 3,
  currentPath: null,
  divergentBranches: [],

  // Array format (used by ProgressManager internally)
  completedModules: ['cia-triad', 'network-intro', ...],
  quizHistory: [{moduleId, houseId, score, attempts, completedAt}],
  labsCompleted: ['linux-lab-1', ...],

  // House-specific arrays
  houses: {
    shield: {
      unlocked: true,
      modulesCompleted: ['cia-triad', ...],
      quizzesPassed: ['cia-triad', ...],
      labsCompleted: [],
      progressPercent: 15,
      lastAccessed: 1707234567890
    },
    web: { ... },
    // etc.
  },

  // DUAL-WRITE: Flat object format (for checkLocalCompletion)
  shield: {
    'cia-triad': { completed: true, completedAt: '...', score: 95 },
    'access-control': { completed: true, completedAt: '...', score: null }
  },
  web: {
    'osi-model': { completed: true, completedAt: '...', score: 88 }
  }
}
```

---

## The Matching Problem

### For sync to work:

```
Handler assigns contentId:     'shield-cia-triad'
                                   │
checkLocalCompletion parses:   house='shield', moduleKey='cia-triad'
                                   │
Looks in localStorage:         hexworth_progress['shield']['cia-triad']
                                   │
Quiz must save with:           moduleId='cia-triad', houseId='shield'
                                   │
ProgressManager writes:        hexworth_progress['shield']['cia-triad'] = {...}
```

### Current failure modes:

| Quiz Config | ProgressManager Saves | checkLocalCompletion Looks For | Result |
|-------------|----------------------|-------------------------------|--------|
| `moduleId: 'cia-triad', houseId: 'shield'` | `progress.shield['cia-triad']` | `progress.shield['cia-triad']` | ✅ MATCH |
| `moduleId: 'shield-cia-triad-quiz'` | `progress.shield['shield-cia-triad-quiz']` | `progress.shield['cia-triad']` | ❌ NO MATCH |
| `moduleId: 'cia-triad-quiz'` | `progress.shield['cia-triad-quiz']` | `progress.shield['cia-triad']` | ❌ NO MATCH |

---

## Breakpoints in the Chain

### Point 1: Quiz moduleId configuration
**File:** Each quiz HTML file
**Issue:** moduleId doesn't match what handler assigns
**Example:** `moduleId: 'shield-cia-triad-quiz'` should be `moduleId: 'cia-triad'`

### Point 2: Sync only on dashboard visit
**File:** dashboard.html line ~4624
**Issue:** syncProgressToFirestore() only called in auth handler
**Impact:** Student completes → closes browser → never syncs

### Point 3: URL construction for "Go to Task"
**File:** dashboard.html resolveAssignmentHref()
**Issue:** Uses wrong houseId from LearningPaths
**Example:** Generates `houses/linux-mastery/...` instead of `houses/script/...`

### Point 4: Content not registered
**File:** content-registry.js
**Issue:** Some assignable content has no entry
**Impact:** No metadata, incorrect paths

---

## Recommended Fix Order

1. **Audit quiz moduleIds** — Ensure all match parent module (not `xxx-quiz` suffix)
2. **Verify dual-write working** — Test that ProgressManager saves flat format
3. **Add sync on completion** — Not just dashboard visit
4. **Fix URL construction** — Correct houseId in LearningPaths or resolveAssignmentHref
5. **Register missing content** — Add to content-registry.js

---

## Test Validation

After fixes, test with:

```javascript
// In browser console after completing a quiz:

// 1. Check localStorage format
const p = JSON.parse(localStorage.getItem('hexworth_progress'));
console.log('shield flat format:', p.shield);
// Should show: { 'cia-triad': { completed: true, ... } }

// 2. Check if checkLocalCompletion finds it
// (Must be on dashboard.html)
const result = checkLocalCompletion('shield-cia-triad');
console.log('checkLocalCompletion result:', result);
// Should show: { completed: true, score: X, completedAt: '...' }

// 3. Check sync logs
// Look for: [ProgressSync] Submitted: shield-cia-triad
```

---

*This document maps the current architecture to identify exactly where sync breaks.*
