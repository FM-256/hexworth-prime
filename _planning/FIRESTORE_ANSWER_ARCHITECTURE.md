# Firestore Answer Validation Architecture

**Date:** 2026-03-18
**Sprint:** QC-21
**Status:** Reference documentation for server-side answer migration

---

## Overview

Hexworth Prime uses Firebase Cloud Functions + Firestore to validate student answers
server-side. The client NEVER sees correct answers — it submits responses, the server
grades them, and returns only right/wrong per question.

This document maps every Firestore collection, Cloud Function, security rule, and
migration tool involved in the answer validation pipeline.

---

## Cloud Functions (functions/index.js)

### 1. `gradeQuiz()` — Quiz Answer Validation

**Purpose:** Grade multiple-choice quizzes server-side.

```
Client sends:  { quizId: "clh-001", answers: { "0": 1, "1": 3, "2": 2 } }
Server returns: { score: 2, total: 3, percentage: 67, passed: false, results: [{correct: true}, {correct: true}, {correct: false}] }
```

| Field | Description |
|-------|-------------|
| **Input: quizId** | String — matches Firestore doc ID in `quiz_keys/{quizId}` |
| **Input: answers** | Object — keys are question indices (as strings), values are selected option indices |
| **Output: score** | Number of correct answers |
| **Output: total** | Total number of questions |
| **Output: percentage** | Score as percentage (rounded) |
| **Output: passed** | Boolean — percentage >= passingScore |
| **Output: results** | Array of `{correct: boolean}` per question — NEVER reveals the right answer |

**Security:**
- Requires authentication (`request.auth`)
- Rate limited: 10 attempts per quiz per 60 seconds (via `users/{uid}/quiz_attempts`)
- Answer key never sent to client

**Location:** `functions/index.js` lines 1488–1548

---

### 2. `validateFlag()` — CTF Flag Validation

**Purpose:** Validate flag submissions for Arena/Dispatch boxes.

```
Client sends:  { boxId: "A01", flagId: "flag1", submission: "flag{s3cr3t}" }
Server returns: { correct: true, flagId: "flag1" }
```

**Two modes:**
- **With flagId:** Check a specific flag
- **Without flagId:** Scan ALL flags for the box, return which one matched (client doesn't know flag IDs)

| Field | Description |
|-------|-------------|
| **Input: boxId** | String — matches Firestore doc in `flag_registry/{boxId}` |
| **Input: flagId** | Optional string — specific flag to check |
| **Input: submission** | String — student's flag submission (normalized: trim + lowercase) |
| **Input: sessionId** | Optional string — for arena session tracking |
| **Output: correct** | Boolean |
| **Output: flagId** | String or null — which flag was matched |

**Security:**
- Requires authentication
- Rate limited: 10 attempts per box per 60 seconds
- Logs all attempts to `users/{uid}/flag_attempts`
- Captures logged to `users/{uid}/flag_captures/{boxId}_{flagId}`

**Location:** `functions/index.js` lines 155–231

---

### 3. `validateChallenge()` — Interactive Challenge Validation

**Purpose:** Validate free-text answers for labs and interactive challenges.

```
Client sends:  { challengeId: "clh-insight", levelId: "clh-003", userInput: "grep" }
Server returns: { blocked: false, success: true, feedback: "Correct!", points: 100, explanation: null }
```

**Routes to challenge handlers via switch(challengeId):**

| challengeId | Handler | Firestore Path |
|-------------|---------|----------------|
| `shopbot` | `evaluateShopbot()` | `challenge_registry/shopbot/levels/{levelNum}` |
| `clh-insight` | `evaluateClhInsight()` | `challenge_registry/clh/insights/{moduleId}` |

**CLH Insight handler:** Case-insensitive comparison against `acceptedAnswers` array.
**ShopBot handler:** Pattern matching against defense/success regex patterns.

**Security:**
- Requires authentication
- Rate limited: 10 attempts per level per 60 seconds
- Logs to `users/{uid}/challenge_attempts`

**Location:** `functions/index.js` lines 1119–1325

---

## Firestore Collections

### Answer Key Collections (Server-Side Only — NO client access)

These collections are locked down with `allow read: if false; allow write: if false;`
in `firestore.rules`. Only Cloud Functions (admin SDK) can read/write them.

#### `quiz_keys/{quizId}`

Stores answer keys for QuizEngine-based quizzes.

```json
{
  "answers": [1, 3, 2, 1, 2, 1],       // Array of correct option indices
  "passingScore": 70,                    // Minimum percentage to pass
  "questionCount": 6                     // Total questions (for validation)
}
```

**Document ID convention:** Matches the `moduleId` from QuizEngine config.
Examples: `clh-001`, `forge-ch13`, `ehe-week01`, `aplus-core1-ch01`

**How keys get here:** `functions/migrate-quiz-keys.js --export-keys` extracts keys
from `*.quiz.html` files and generates `quiz_keys.json` for Firestore import.

---

#### `flag_registry/{boxId}`

Stores CTF flag strings for Arena/Dispatch boxes.

```json
{
  "flags": {
    "flag1": "flag{sql_injection_master}",
    "flag2": "flag{xss_reflected_win}",
    "flag3": "flag{command_injection_root}"
  },
  "aliases": {
    "flag1": "sqli",
    "flag2": "xss",
    "flag3": "cmdi"
  }
}
```

**Document ID convention:** Box identifier (e.g., `A01`, `A02`, `D01`).

**How keys get here:** `functions/seed-box-flags.js` or `functions/seed-flags.js`

---

#### `gate_registry/{setId}`

Stores answer keys for Dark Arts CTF gates.

**Access:** `allow read: if false; allow write: if false;`

---

#### `challenge_registry/{challengeId}/...`

Stores answer data for interactive challenges (CLH insights, ShopBot levels).

**CLH Insights:** `challenge_registry/clh/insights/{moduleId}`
```json
{
  "acceptedAnswers": ["grep", "GREP", "grep command"],
  "correctMessage": "Exactly! grep searches file contents for patterns.",
  "wrongMessage": "Not quite. Think about which command searches inside files."
}
```

**ShopBot Levels:** `challenge_registry/shopbot/levels/{levelNum}`
```json
{
  "defensePatterns": ["ignore.*instructions", "disregard.*above"],
  "successPatterns": ["secret.*code", "admin.*password"],
  "maxTokens": 100
}
```

**How keys get here:** `functions/seed-clh-insights.js`, `functions/seed-challenges.js`

---

### Student Data Collections (User-Scoped)

These live under `users/{uid}/` and track individual student activity.

#### `users/{uid}/quiz_attempts/{attemptId}`

Auto-logged by `gradeQuiz()` on every submission.

```json
{
  "quizId": "clh-001",
  "score": 5,
  "total": 6,
  "percentage": 83,
  "passed": true,
  "timestamp": "2026-03-18T..."
}
```

**Access:** Cloud Functions write only (admin SDK). No client read/write.

---

#### `users/{uid}/flag_attempts/{attemptId}`

Auto-logged by `validateFlag()` on every flag submission.

```json
{
  "boxId": "A01",
  "flagId": "flag1",
  "timestamp": "2026-03-18T...",
  "sessionId": "sess_abc123"
}
```

**Access:** Admin read only. Used for rate limiting (10 per box per 60s).

---

#### `users/{uid}/flag_captures/{boxId}_{flagId}`

Written when a flag is correctly captured.

```json
{
  "boxId": "A01",
  "flagId": "sqli",
  "capturedAt": "2026-03-18T...",
  "sessionId": "sess_abc123"
}
```

**Access:** User + admin read. Cloud Functions write only.

---

#### `users/{uid}/challenge_attempts/{attemptId}`

Auto-logged by `validateChallenge()`.

```json
{
  "challengeId": "clh-insight",
  "levelId": "clh-003",
  "timestamp": "2026-03-18T..."
}
```

---

## Firestore Security Rules Summary

| Collection | Client Read | Client Write | Cloud Functions |
|------------|:-----------:|:------------:|:---------------:|
| `quiz_keys/{quizId}` | BLOCKED | BLOCKED | Read |
| `flag_registry/{boxId}` | BLOCKED | BLOCKED | Read |
| `gate_registry/{setId}` | BLOCKED | BLOCKED | Read |
| `challenge_registry/...` | (not explicitly ruled) | (not explicitly ruled) | Read/Write |
| `users/{uid}/quiz_attempts` | (not explicitly ruled) | (not explicitly ruled) | Write |
| `users/{uid}/flag_attempts` | Admin only | BLOCKED | Write |
| `users/{uid}/flag_captures` | Owner + Admin | BLOCKED | Write |
| `users/{uid}/challenge_attempts` | (not explicitly ruled) | (not explicitly ruled) | Write |
| `users/{uid}/gates/{gateId}` | Owner + Admin | BLOCKED | Write |

---

## Client-Side Components

### QuizEngine.js — Server Grading Path

When `serverGrading: true` is set in the QuizEngine config:

1. Client renders questions WITHOUT knowing correct answers
2. Student selects answers, clicks Submit
3. `_submitQuizToServer()` calls `firebase.functions().httpsCallable('gradeQuiz')`
4. Server looks up `quiz_keys/{quizId}`, compares, returns `{results: [{correct: bool}]}`
5. Client displays green/red per question — NEVER reveals the right answer index

**Key lines in QuizEngine.js:**
- Config flag: `serverGrading: true` (line ~56)
- Server call: `_gradeViaServer(quizId, answers)` (lines 560–569)
- Anti-cheat: `showFeedback: false` ENFORCED, `randomize: true` ENFORCED

### CLHInsightValidator.js — Challenge Bridge

Calls `validateChallenge` Cloud Function for CLH insight phases.

```javascript
CLHInsightValidator.submit('clh-003', userAnswer)
// -> calls firebase.functions().httpsCallable('validateChallenge')
// -> returns { success: boolean, feedback: string }
```

### BoxEngine.js — Flag Validation Bridge

Calls `validateFlag` Cloud Function for Arena/Dispatch boxes.

---

## Migration Tools

### `functions/migrate-quiz-keys.js`

Extracts answer keys from `*.quiz.html` files (QuizEngine-based only).

| Command | Action |
|---------|--------|
| `--dry-run` | Preview extraction results, no file output |
| `--export-keys` | Write `quiz_keys.json` with Firestore-ready data |
| `--strip-answers` | Write modified HTML (correct: removed) to `_output/` |

**Limitations:**
- Only works with QuizEngine-based quizzes (`new QuizEngine({...})`)
- Does NOT handle inline custom quizzes (chapter presentations)
- Does NOT upload to Firestore — generates JSON for manual import

### `functions/seed-*.js` Scripts

| Script | Target Collection | Purpose |
|--------|-------------------|---------|
| `seed-flags.js` | `flag_registry/{boxId}` | Initial flag data |
| `seed-box-flags.js` | `flag_registry/{boxId}` | Box-specific flags |
| `seed-clh-insights.js` | `challenge_registry/clh/insights/` | CLH answer data |
| `seed-challenges.js` | `challenge_registry/shopbot/levels/` | ShopBot level configs |
| `seed-gate-registry.js` | `gate_registry/{setId}` | Dark Arts gate answers |

### Firestore Import Process

1. Run `node migrate-quiz-keys.js --export-keys` to generate `quiz_keys.json`
2. Upload to Firestore via Firebase Console or `firebase-admin` script
3. Verify with `node migrate-quiz-keys.js --dry-run` that IDs match
4. Run `node migrate-quiz-keys.js --strip-answers` to remove client-side answers
5. Review output in `_output/`, copy back to `_app/houses/`
6. Deploy functions + hosting

---

## Data Flow Diagram

```
STUDENT BROWSER                    FIREBASE
─────────────────                  ─────────────────────────────────────

QuizEngine.js                      Cloud Function: gradeQuiz()
  |                                  |
  | {quizId, answers}                | Read quiz_keys/{quizId}
  |  ────────────────────────►       |   answers: [1, 3, 2, ...]
  |                                  |
  |                                  | Compare submitted vs key
  |                                  |
  |  ◄────────────────────────       | Write users/{uid}/quiz_attempts
  | {score, results}                 |
  |                                  |
  | Display green/red                |
  | (never reveals answer)           |


BoxEngine.js                       Cloud Function: validateFlag()
  |                                  |
  | {boxId, submission}              | Read flag_registry/{boxId}
  |  ────────────────────────►       |   flags: {f1: "flag{...}"}
  |                                  |
  |                                  | Normalize + compare
  |                                  |
  |  ◄────────────────────────       | Write flag_captures + flag_attempts
  | {correct, flagId}               |


CLHInsightValidator.js             Cloud Function: validateChallenge()
  |                                  |
  | {challengeId, levelId, input}    | Read challenge_registry/clh/insights/{id}
  |  ────────────────────────►       |   acceptedAnswers: ["grep", ...]
  |                                  |
  |                                  | Case-insensitive compare
  |                                  |
  |  ◄────────────────────────       | Write challenge_attempts
  | {success, feedback, points}      |
```

---

## Gap Analysis for QC-21 Migration

### What EXISTS (server-side ready):
- `gradeQuiz()` Cloud Function — deployed and working
- `quiz_keys/` Firestore collection — has keys for CLH, MD-100, Core 2
- `QuizEngine.js` with `serverGrading` support — tested and deployed
- `migrate-quiz-keys.js` — extracts keys from QuizEngine quiz files
- Firestore security rules — `quiz_keys` locked from client

### What's MISSING for Core 1 chapter quizzes:
1. **No quiz keys in Firestore** — Core 1 chapters aren't in `quiz_keys/` yet
2. **No QuizEngine** — chapters use custom inline JS, not QuizEngine
3. **No migration tool for inline quizzes** — `migrate-quiz-keys.js` only handles `*.quiz.html` with `new QuizEngine()`
4. **Need either:**
   - A new extraction script for inline `quizQuestions` arrays, OR
   - Manual extraction + `firebase-admin` upload, OR
   - Convert chapter quizzes to QuizEngine (bigger refactor)

### Recommended approach:
Build a `migrate-chapter-quizzes.js` script that:
1. Parses `quizQuestions` arrays from chapter HTML files
2. Extracts `correct:` values into Firestore-ready format
3. Generates modified HTML with server-side grading call
4. Outputs to `_output/` for review before deployment

---

*This document is the authoritative reference for the answer validation system.*
*Update it when adding new Cloud Functions, collections, or validation patterns.*
