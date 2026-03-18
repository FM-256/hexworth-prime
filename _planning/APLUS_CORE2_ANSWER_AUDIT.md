# A+ Core 2 — Answer Validation Audit

**Date:** 2026-03-18
**Sprint:** QC-21
**Location:** `_app/houses/forge/applets/comptia-aplus/core-2/`
**Status:** ALREADY MIGRATED — No action needed

---

## Summary

| Content Type | Total Files | Client-Side Answers | Needs Migration |
|-------------|-------------|---------------------|-----------------|
| Chapter presentations | 12 | 0 | 0 |
| Standalone quizzes | 16 | 0 (all serverGrading) | 0 |
| Presentations | 13 | 0 | 0 |
| Labs | 14 | 0 | 0 |
| Domain reviews | 4 | 0 | 0 |
| Reference/Tools | 2 | 0 | 0 |
| Course hub | 1 | 0 | 0 |
| **TOTAL** | **62** | **0** | **0** |

---

## Key Findings

**Core 2 is fully secure.** Every quiz file uses QuizEngine with `serverGrading: true`.
No plaintext answer indices exist anywhere in the HTML. Zero files need migration.

### Architecture (newer pattern — use as model for Core 1 migration):

- **Chapters** = pure content pages (no embedded quizzes)
- **Quizzes** = separate `.quiz.html` files using QuizEngine
- **All 16 quizzes** have `serverGrading: true` — answers validated via `gradeQuiz()` Cloud Function
- **Answer keys** stored in Firestore `quiz_keys/{quizId}`, never exposed to client

### Quiz Inventory (all secure):

| Quiz File | serverGrading |
|-----------|:------------:|
| forge-ch13.quiz.html | YES |
| forge-ch14.quiz.html | YES |
| forge-ch15.quiz.html | YES |
| forge-ch16.quiz.html | YES |
| forge-ch17.quiz.html | YES |
| forge-ch18.quiz.html | YES |
| forge-ch19.quiz.html | YES |
| forge-ch20.quiz.html | YES |
| forge-ch21.quiz.html | YES |
| forge-ch22.quiz.html | YES |
| forge-ch23.quiz.html | YES |
| forge-ch24.quiz.html | YES |
| forge-aplus-core2.quiz.html | YES |
| forge-aplus-core2-ch19-22.quiz.html | YES |
| forge-core2-midterm.quiz.html | YES |
| forge-core2-quiz-ch19-22.quiz.html | YES |

---

## Comparison: Core 1 vs Core 2 Architecture

| Aspect | Core 1 (OLD) | Core 2 (NEW) |
|--------|-------------|-------------|
| Chapter quizzes | Embedded inline in chapter HTML | Separate .quiz.html files |
| Quiz engine | Custom inline JavaScript | QuizEngine.js component |
| Answer location | `correct: N` plaintext in HTML | Firestore `quiz_keys/{id}` |
| Server grading | NO | YES — `serverGrading: true` |
| F12 cheatable | YES | NO |
| Files needing fix | 15 | 0 |

**Core 2 is the reference implementation for how Core 1 should be migrated.**

---

*This audit is part of QC-21 — Server-Side Answer Validation Bridge.*
*Core 2 requires no action. Core 1 has 15 files pending migration.*
