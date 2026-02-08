# Hexworth Prime - Developer Solutions Knowledge Base

**Purpose:** Quick-reference problem/solution database for common development issues.
**Format:** Problem → Solution → Why it works
**Usage:** Search by category or keyword when you hit a known issue.

---

## Table of Contents

- [CSS](#css)
- [JavaScript](#javascript)
- [Navigation & Paths](#navigation--paths)
- [Terminal/Lab Simulators](#terminallab-simulators)
- [Firebase/Deployment](#firebasedeployment)

---

## CSS

### Flex Container Won't Scroll (Content Overflows)

**Problem:**
You have a flex layout with `overflow-y: auto` on a child element, but instead of scrolling, the content overflows or the whole page scrolls.

**Solution:**
```css
/* Parent flex container */
.parent {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;    /* KEY FIX */
}

/* Scrollable child */
.scrollable-child {
    flex: 1;
    overflow-y: auto;
    min-height: 0;    /* KEY FIX */
}

/* Lock viewport if needed */
body {
    height: 100vh;
    overflow: hidden;
}
```

**Why it works:**
By default, flex items have `min-height: auto`, which prevents them from shrinking below their content size. This breaks `overflow: auto` because the element can't be smaller than its content. Setting `min-height: 0` allows the flex item to shrink, enabling overflow scrolling.

**Example:**
`security-fundamentals-lab.html` - Terminal output scrolls independently while input stays fixed at bottom.

**Date Added:** 2026-02-04

---

### Centered Modal/Overlay

**Problem:**
Need to center a modal both horizontally and vertically.

**Solution:**
```css
.modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
}

.modal {
    /* Content styles */
}
```

**Why it works:**
`inset: 0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`, making the overlay fill the viewport. Flexbox centering then positions the modal.

**Date Added:** 2026-02-04

---

## JavaScript

### Template Literals Break Regex Extraction

**Problem:**
Regex like `/function\s+name\s*\{([\s\S]*?)\}/` stops at the `}` inside template literals like `${var}`.

**Solution:**
Don't use regex to extract function bodies. Use full-text search instead:

```javascript
// Instead of parsing function bodies:
const matches = [...html.matchAll(/coming\s*soon/gi)];

// Get line numbers for each match:
for (const match of matches) {
    const beforeMatch = html.substring(0, match.index);
    const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
}
```

**Why it works:**
Full-text search doesn't care about JavaScript syntax. It finds all occurrences regardless of where they appear.

**Reference:** `LESSONS_LEARNED.md` (2025-12-28) - Complete investigation of audit tool bug.

**Date Added:** 2026-02-04

---

### Command History in Terminal Simulators

**Problem:**
Want up/down arrow keys to cycle through previously entered commands.

**Solution:**
```javascript
let commandHistory = [];
let historyIndex = -1;

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
        commandHistory.push(input.value);
        historyIndex = commandHistory.length;
        processCommand(input.value);
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    }
});
```

**Why it works:**
`historyIndex` tracks position in history array. Up decrements (older), down increments (newer). At the end, clear input.

**Date Added:** 2026-02-04

---

## Navigation & Paths

### Relative Path from Labs Folder

**Problem:**
Links in lab files (e.g., `core-2/labs/my-lab.html`) point to wrong locations.

**Solution:**
From `labs/` folder, use `../` to go up one level:

| Target | Path from labs/ |
|--------|-----------------|
| Chapter index | `../chapters/ch19-security/index.html` |
| Presentation | `../presentations/security-fundamentals.html` |
| Quiz | `../quizzes/ch19-quiz.html` |
| Course index | `../index.html` |

**Common mistake:**
Using `../../` (two levels up) when the file is only one level deep.

**Date Added:** 2026-02-04

---

## Terminal/Lab Simulators

### Auto-Advance to Next Task on Completion

**Problem:**
When a task is completed, the hint and active task indicator should automatically move to the next incomplete task.

**Solution:**
```javascript
function completeTask(taskNum) {
    if (!completedTasks.has(taskNum)) {
        completedTasks.add(taskNum);
        // ... update UI ...

        if (completedTasks.size < totalTasks) {
            // Find next incomplete task
            for (let i = 1; i <= totalTasks; i++) {
                if (!completedTasks.has(i)) {
                    selectTask(i);  // Updates hint and active state
                    break;
                }
            }
        }
    }
}
```

**Why it works:**
Loop through all tasks, find first one not in `completedTasks` Set, select it.

**Date Added:** 2026-02-04

---

### Simulated File System for cat/ls/cd Commands

**Problem:**
Want terminal simulator to support basic file system commands.

**Solution:**
```javascript
let currentDir = 'C:\\Users\\Admin';

const fileSystem = {
    'C:\\Users\\Admin': {
        type: 'dir',
        contents: ['README.txt', 'Documents']
    },
    'C:\\Users\\Admin\\README.txt': {
        type: 'file',
        content: 'File contents here...'
    }
};

function resolvePath(path) {
    if (!path) return currentDir;
    if (path.includes(':')) return path;  // Absolute
    if (path === '..') {
        const parts = currentDir.split('\\');
        parts.pop();
        return parts.length > 1 ? parts.join('\\') : 'C:\\';
    }
    return currentDir + '\\' + path;
}
```

**Commands:** `ls`/`dir`, `cd`, `pwd`, `cat`/`type`

**Date Added:** 2026-02-04

---

## Firebase/Firestore

### Firestore arrayUnion/arrayRemove for Membership Arrays

**Problem:**
Need to add/remove a user's UID from a class memberUids array atomically, without reading the full array first.

**Solution:**
```javascript
const { updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp } = window.firebaseFirestore;

// Join: add UID
await updateDoc(classRef, {
    memberUids: arrayUnion(user.uid),
    memberCount: increment(1),
    updatedAt: serverTimestamp()
});

// Leave: remove UID
await updateDoc(classRef, {
    memberUids: arrayRemove(user.uid),
    memberCount: increment(-1),
    updatedAt: serverTimestamp()
});
```

**Why it works:**
`arrayUnion` adds the value only if it doesn't already exist (idempotent). `arrayRemove` removes all instances. Combined with `increment()`, this keeps the denormalized count in sync. All three fields update atomically in a single write.

**Caveat:** If the write partially fails (e.g., arrayUnion succeeds but increment doesn't), the count can drift. Use the actual subcollection count as the source of truth for display.

**Date Added:** 2026-02-05

---

### Firestore Field-Level Security Rules (affectedKeys)

**Problem:**
Students should be able to update a class document (to join/leave), but only modify specific fields — not the class name, handler, or other settings.

**Solution:**
```
allow update: if request.auth != null && (
  // Student joining
  request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['memberUids', 'memberCount', 'updatedAt'])
  && request.resource.data.memberUids.hasAll(resource.data.memberUids)
  && request.resource.data.memberUids.size() == resource.data.memberUids.size() + 1
  && request.auth.uid in request.resource.data.memberUids
  && !(request.auth.uid in resource.data.memberUids)
);
```

**Why it works:**
`affectedKeys()` returns only the fields that changed between old (`resource.data`) and new (`request.resource.data`). `hasOnly()` ensures no other fields were touched. The remaining checks validate that exactly one UID was added and it belongs to the requesting user.

**Key patterns:**
- `hasAll()` = new array contains all old values (nothing removed)
- `size() == size() + 1` = exactly one element added
- `request.auth.uid in request.resource.data` = the added element is the requester

**Date Added:** 2026-02-05

---

### CSV Export with RFC 4180 Escaping (Blackboard-Compatible)

**Problem:**
Need to export roster and assignment data as CSV that can be imported into Blackboard LMS. Fields may contain commas, quotes, or newlines that break naive CSV generation.

**Solution:**
```javascript
function csvEscape(val) {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Blackboard-compatible columns
const header = 'Last Name,First Name,Student ID,Email,House,Joined';
const rows = members.map(m =>
    [m.lastName, m.firstName, m.studentId, m.email, m.house, joinDate]
    .map(csvEscape).join(',')
);
downloadCSV(`${className}-roster.csv`, header + '\n' + rows.join('\n'));
```

**Why it works:**
RFC 4180 requires fields containing commas, double-quotes, or newlines to be wrapped in double-quotes, with internal double-quotes escaped as `""`. Blackboard's CSV import expects `Last Name, First Name` as separate columns. The Blob + anchor approach works in all modern browsers without server-side generation.

**Date Added:** 2026-02-05

---

### Firestore User Profile with Merge (setUserProfile)

**Problem:**
Need to save user profile fields (firstName, lastName, studentId) without overwriting other existing fields in the user document.

**Solution:**
```javascript
// In FirestoreManager (or equivalent):
async setUserProfile(uid, data) {
    const { doc, setDoc } = window.firebaseFirestore;
    const db = this.getDb();
    await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// Usage:
await FirestoreManager.setUserProfile(user.uid, {
    firstName: 'Jane',
    lastName: 'Doe',
    studentId: 'STU-12345'
});
```

**Why it works:**
`setDoc` with `{ merge: true }` creates the document if it doesn't exist, or merges the provided fields into the existing document without overwriting unspecified fields. This is safer than `updateDoc` (which throws if the doc doesn't exist) and more targeted than a full `setDoc` (which overwrites everything).

**Date Added:** 2026-02-05

---

### Firestore Nested Map vs Flat Dot-Key (submitProgress Bug)

**Problem:**
`AssignmentManager.submitProgress()` used JS computed property keys with dots:
```javascript
await setDoc(progressRef, {
    [`completions.${contentId}`]: { completed: true, score: null, completedAt: '...' }
}, { merge: true });
```
This created **flat top-level fields** literally named `completions.code-git-basics` instead of a nested `completions` map. The handler dashboard read `doc.completions` and got `undefined` — no student activity rendered.

**Solution:**
Use a proper nested object. Firestore `merge: true` merges at each nesting level:
```javascript
await setDoc(progressRef, {
    completions: {
        [contentId]: { completed: true, score: null, completedAt: '...' }
    }
}, { merge: true });
```

**Backward compatibility:** Existing flat-key docs in Firestore need normalization on read:
```javascript
// In loadClassProgress — normalize legacy flat keys into nested map
classProgressData.forEach(doc => {
    if (!doc.completions) doc.completions = {};
    Object.keys(doc).forEach(key => {
        if (key.startsWith('completions.')) {
            const contentId = key.substring('completions.'.length);
            if (!doc.completions[contentId]) {
                doc.completions[contentId] = doc[key];
            }
        }
    });
});
```

**Why it works:**
In JavaScript, `{ ["a.b"]: value }` creates a single key named `"a.b"`. Firestore's `merge: true` with `setDoc` does NOT interpret JS object keys as field paths — only `updateDoc` with `FieldPath` does that. Nesting the object explicitly creates the intended map structure.

**Files:** `_app/components/AssignmentManager.js`, `_app/handler-dashboard.html`
**Date Added:** 2026-02-07

---

### Dual Progress System Mismatch (ModuleProgress vs ProgressManager)

**Problem:**
Two separate progress systems exist that don't communicate:
- `ModuleProgress.js` — lightweight, localStorage-only, loaded by all content pages
- `ProgressManager.js` — full Firestore sync, only loaded on dashboard.html

Content pages (presentations, quizzes) call `ModuleProgress.complete()` which saves to localStorage but never syncs to Firestore. The v3.11.1 `syncToFirestore()` fix was added to `ProgressManager`, but content pages don't load `ProgressManager`.

**Solution:**
`ModuleProgress.js` now lazy-loads Firebase dependencies on completion:
```javascript
async function ensureFirestoreDeps() {
    if (typeof ProgressManager !== 'undefined' && ProgressManager.syncToFirestore) return true;

    const scripts = document.querySelectorAll('script[src*="ModuleProgress"]');
    let basePath = scripts.length > 0
        ? scripts[0].getAttribute('src').substring(0, scripts[0].getAttribute('src').lastIndexOf('/') + 1)
        : '';

    const deps = ['FirebaseAuth.js', 'FirestoreManager.js', 'ClassManager.js',
                  'AssignmentManager.js', 'ProgressManager.js'];

    for (const dep of deps) {
        if (document.querySelector(`script[src*="${dep}"]`)) continue;
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = basePath + dep;
            s.onload = resolve;
            s.onerror = () => reject(new Error(`Failed to load ${dep}`));
            document.head.appendChild(s);
        });
    }

    if (typeof FirebaseAuth !== 'undefined') await FirebaseAuth.init();
    return typeof ProgressManager !== 'undefined' && ProgressManager.syncToFirestore;
}
```

**Critical:** The page redirect must wait for the sync. Loading 5 scripts + 2 Firebase CDN modules + auth init takes 3-5 seconds. A 1500ms `setTimeout` redirect kills the sync:
```javascript
// BAD — redirect kills pending sync
setTimeout(() => navigateToDashboard(), 1500);

// GOOD — wait for sync with safety timeout
const timeout = new Promise(r => setTimeout(r, 8000));
Promise.race([syncPromise, timeout]).then(() => navigateToDashboard());
```

**Why it works:**
Lazy-loading avoids modifying every content page. The dependency chain is loaded once and cached in a promise. `Promise.race` ensures the user isn't stuck if sync fails.

**Files:** `_app/components/ModuleProgress.js`
**Date Added:** 2026-02-07

---

### checkLocalCompletion Key Mismatch

**Problem:**
`dashboard.html`'s `checkLocalCompletion('code-git-basics')` splits the contentId using regex:
```javascript
const houseMatch = contentId.match(/^(script|shield|web|forge|cloud|code|key|eye)-(.+)$/);
// house = 'code', moduleKey = 'git-basics'
```
Then looks up `hexworth_progress.code['git-basics']`.

But `ModuleProgress.complete('code', 'code-git-basics')` stores the full ID as the key:
```javascript
progress['code']['code-git-basics'] = { completed: true, date: '...' };
```

The stripped key `git-basics` never matches the stored key `code-git-basics`.

**Solution:**
Check both the stripped key and the full contentId:
```javascript
const moduleData = houseProgress[moduleKey] || houseProgress[contentId];
```

**Why it works:**
The fallback to `contentId` catches cases where `ModuleProgress` stored the full ID (which includes the house prefix). Either key format will match.

**Files:** `_app/dashboard.html` (`checkLocalCompletion` function)
**Date Added:** 2026-02-07

---

### FirestoreManager mergeProgress TypeError (modulesCompleted as Object)

**Problem:**
`ProgressManager.completeModule()` uses a "DUAL-WRITE" strategy — stores completions in both an array (`completedModules`) and an object map (`progress.houseId.moduleId`). Over time, `modulesCompleted` in Firestore became an object instead of an array. `FirestoreManager.mergeProgress()` then crashed:
```
TypeError: (cloudData.modulesCompleted || []) is not iterable
```
This blocked user initialization on every page load.

**Solution:**
A `normalizeToArray` helper that safely converts any format:
```javascript
const normalizeToArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) return Object.keys(data);
    return [];
};

// Usage in mergeProgress:
modulesCompleted: [...new Set([
    ...normalizeToArray(cloudData.modulesCompleted),
    ...normalizeToArray(localData.modulesCompleted)
])],
```

**Why it works:**
Handles all three possible states — array (expected), object (corrupted), or null/undefined — without throwing. `Object.keys()` extracts the module IDs from the object format.

**Files:** `_app/components/FirestoreManager.js` (`mergeProgress` function)
**Date Added:** 2026-02-07

---

### Null Score Showing as "(null%)" in Activity Feed

**Problem:**
Presentations don't have scores (score is `null`). The handler dashboard activity feed used:
```javascript
const scoreText = event.score !== undefined ? ` (${event.score}%)` : '';
```
Since `null !== undefined` is `true`, it rendered `(null%)`.

**Solution:**
```javascript
const scoreText = event.score != null ? ` (${event.score}%)` : '';
```

**Why it works:**
`!= null` catches both `null` and `undefined` (loose equality). Only actual numeric scores pass the check.

**Files:** `_app/handler-dashboard.html` (`renderActivityFeed` function)
**Date Added:** 2026-02-07

---

## Firebase/Deployment

### Cache Busting After Deploy

**Problem:**
Changes deployed but browser still shows old version.

**Solution:**
Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

Or open in incognito/private window.

**Date Added:** 2026-02-04

---

## Adding New Entries

When adding a new solution, use this template:

```markdown
### Short Problem Title

**Problem:**
What goes wrong / what you're trying to do.

**Solution:**
Code or steps to fix it.

**Why it works:**
Brief explanation of the underlying cause.

**Date Added:** YYYY-MM-DD
```

---

*This document captures reusable solutions. For deep-dive investigations, see `LESSONS_LEARNED.md`.*
