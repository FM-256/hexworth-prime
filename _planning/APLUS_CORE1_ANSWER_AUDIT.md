# A+ Core 1 — Answer Validation Audit

**Date:** 2026-03-18
**Sprint:** QC-21 (Wave — Forge House / A+ Core 1)
**Location:** `_app/houses/forge/applets/comptia-aplus/core-1/`
**Status:** AUDIT COMPLETE — Migration not started

---

## Summary

| Content Type | Total Files | Has Client-Side Answers | Needs Migration |
|-------------|-------------|------------------------|-----------------|
| Chapter presentations | 12 | 9 of 12 | 9 |
| Domain reviews | 4 | 0 | 0 |
| Standalone prep quizzes | 3 | 3 | 3 |
| Labs with answer data | 34 (3 with answers) | 3 | 3 |
| Course hub (index.html) | 1 | 0 | 0 |
| **TOTAL** | **54** | **15** | **15** |

---

## Chapter Presentations (12 files)

Each chapter is a multi-tab presentation page with content, practice activities, and an
embedded quiz tab. The quiz uses a custom inline `quizQuestions` array with `correct: N`
plaintext indices. This is NOT QuizEngine — it's hand-coded JavaScript per chapter.

| Chapter | File | Quiz Questions | Answers in HTML | Validation Pattern |
|---------|------|---------------|----------------|-------------------|
| Ch01 Motherboards | `chapters/ch01-motherboards/index.html` | 15 | YES | `correct: N` inline |
| Ch02 Expansion & Storage | `chapters/ch02-expansion-storage/index.html` | 15 | YES | `correct: N` inline |
| Ch03 Peripherals | `chapters/ch03-peripherals/index.html` | 15 | YES | `correct: N` inline |
| Ch04 Printers | `chapters/ch04-printers/index.html` | 0 | NO | Interactive game only (no quiz) |
| Ch05 Networking | `chapters/ch05-networking/index.html` | 0 | NO | Interactive game only (no quiz) |
| Ch06 TCP/IP | `chapters/ch06-tcpip/index.html` | 15 | YES | `correct: N` inline |
| Ch07 Wireless | `chapters/ch07-wireless/index.html` | 15 | YES | `correct: N` inline |
| Ch08 Cloud | `chapters/ch08-cloud/index.html` | 15 | YES | `correct: N` inline |
| Ch09 Laptops | `chapters/ch09-laptops/index.html` | 15 | YES | `correct: N` inline |
| Ch10 Mobile | `chapters/ch10-mobile/index.html` | 0 | NO | Interactive game only (no quiz) |
| Ch11 Troubleshooting | `chapters/ch11-troubleshooting/index.html` | 20 | YES | `correct: N` inline |
| Ch12 HW/Net Troubleshooting | `chapters/ch12-hw-network-troubleshooting/index.html` | 27 | YES | `correct: N` inline |

**Chapters without quizzes (Ch04, Ch05, Ch10):** These have interactive matching/drag
games instead of MCQ quizzes. The games use their own answer logic — not a priority
for this migration since they're interactive exercises, not graded assessments.

**Total chapter quiz questions:** 152 across 9 chapters.

---

## Domain Review Pages (4 files)

| Domain | File | Has Quiz |
|--------|------|----------|
| Cloud & Virtualization | `domains/cloud-virtualization/index.html` | NO |
| Mobile Devices | `domains/mobile-devices/index.html` | NO |
| Networking | `domains/networking/index.html` | NO |
| Troubleshooting | `domains/troubleshooting/index.html` | NO |

These are study-guide / reference pages with no embedded quizzes. No action needed.

---

## Standalone Prep Quizzes (3 files)

These are dedicated quiz pages (NOT QuizEngine). They use custom inline quiz code
with `correct:` values in the HTML, similar to the chapter quizzes.

| File | Questions | Answers in HTML |
|------|-----------|----------------|
| `quizzes/forge-aplus-core1-prep-round-2.quiz.html` | ~24 | YES |
| `quizzes/forge-aplus-core1-prep-round-3.quiz.html` | ~23 | YES |
| `quizzes/forge-aplus-core1-prep-round-4.quiz.html` | ~24 | YES |

**Note:** There is no "round 1" — it may have been removed or renamed.

---

## Labs with Answer Data (3 of 34 labs)

Most labs are interactive exercises (drag-and-drop, simulation, terminal) without
traditional quiz-style answer checking. Three labs contain plaintext `correct:` values:

| Lab | Answers in HTML | Type |
|-----|----------------|------|
| `labs/forge-diagnostic-tools.lab.html` | 10 | Scenario quiz |
| `labs/forge-dns-config.lab.html` | 10 | Configuration quiz |
| `labs/forge-protocol-analysis.lab.html` | 6 | Analysis quiz |

The remaining 31 labs use interactive validation (matching, drag-drop, terminal commands)
that doesn't have traditional `correct: N` answer keys.

---

## Access Control

All 12 chapter pages use `AccessGuard.require('sorted')` — students must be sorted
into a house before accessing content. This is working correctly.

---

## Current Client-Side Quiz Pattern

Every chapter with a quiz uses the same pattern (example from Ch01):

```javascript
const quizQuestions = [
    {
        q: "Which motherboard form factor is the largest?",
        options: ["Micro-ATX", "Mini-ITX", "ATX", "Nano-ITX"],
        correct: 2    // <-- PLAINTEXT IN HTML, visible via F12
    },
    // ... more questions
];

// Grading happens client-side:
function submitQuiz() {
    quizQuestions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.correct;  // <-- LOCAL CHECK
        // ...
    });
}
```

**Problem:** Any student can open DevTools and inspect `quizQuestions` to see all answers.

---

## Migration Plan

### Per-Chapter Migration Steps:

1. **Extract answer key** from `quizQuestions[].correct` values
2. **Upload key** to Firestore at `quiz_keys/aplus-core1-ch{NN}`
3. **Remove `correct:` property** from each question in the HTML
4. **Replace `submitQuiz()`** to call `gradeQuiz()` Cloud Function
5. **Handle response** — server returns `{ results: [{correct: true/false}, ...] }`
6. **Test** — verify grading works without client-side answers

### Suggested Quiz IDs:

| Chapter | Quiz ID |
|---------|---------|
| Ch01 | `aplus-core1-ch01` |
| Ch02 | `aplus-core1-ch02` |
| Ch03 | `aplus-core1-ch03` |
| Ch06 | `aplus-core1-ch06` |
| Ch07 | `aplus-core1-ch07` |
| Ch08 | `aplus-core1-ch08` |
| Ch09 | `aplus-core1-ch09` |
| Ch11 | `aplus-core1-ch11` |
| Ch12 | `aplus-core1-ch12` |
| Prep 2 | `aplus-core1-prep-02` |
| Prep 3 | `aplus-core1-prep-03` |
| Prep 4 | `aplus-core1-prep-04` |
| Lab: Diagnostic | `aplus-core1-lab-diagnostic` |
| Lab: DNS | `aplus-core1-lab-dns` |
| Lab: Protocol | `aplus-core1-lab-protocol` |

### Decision Needed:

- **Option A:** Keep the custom inline quiz JS but swap the grading call to the server.
  Faster to implement. Keeps existing UI unchanged.
- **Option B:** Convert all chapter quizzes to QuizEngine with `serverGrading: true`.
  Cleaner long-term, but requires restructuring each chapter's quiz tab.

---

## File Map

```
core-1/
├── index.html                          (hub — no quiz)
├── chapters/
│   ├── ch01-motherboards/index.html    (15 Qs — NEEDS MIGRATION)
│   ├── ch02-expansion-storage/         (15 Qs — NEEDS MIGRATION)
│   ├── ch03-peripherals/               (15 Qs — NEEDS MIGRATION)
│   ├── ch04-printers/                  (game only — SKIP)
│   ├── ch05-networking/                (game only — SKIP)
│   ├── ch06-tcpip/                     (15 Qs — NEEDS MIGRATION)
│   ├── ch07-wireless/                  (15 Qs — NEEDS MIGRATION)
│   ├── ch08-cloud/                     (15 Qs — NEEDS MIGRATION)
│   ├── ch09-laptops/                   (15 Qs — NEEDS MIGRATION)
│   ├── ch10-mobile/                    (game only — SKIP)
│   ├── ch11-troubleshooting/           (20 Qs — NEEDS MIGRATION)
│   └── ch12-hw-network-troubleshoot/   (27 Qs — NEEDS MIGRATION)
├── domains/
│   ├── cloud-virtualization/           (reference — SKIP)
│   ├── mobile-devices/                 (reference — SKIP)
│   ├── networking/                     (reference — SKIP)
│   └── troubleshooting/               (reference — SKIP)
├── labs/
│   ├── forge-diagnostic-tools.lab      (10 answers — NEEDS MIGRATION)
│   ├── forge-dns-config.lab            (10 answers — NEEDS MIGRATION)
│   ├── forge-protocol-analysis.lab     (6 answers — NEEDS MIGRATION)
│   └── ... (31 other labs — interactive, SKIP)
└── quizzes/
    ├── forge-aplus-core1-prep-round-2  (~24 Qs — NEEDS MIGRATION)
    ├── forge-aplus-core1-prep-round-3  (~23 Qs — NEEDS MIGRATION)
    └── forge-aplus-core1-prep-round-4  (~24 Qs — NEEDS MIGRATION)
```

**15 files need migration. 39 files are clean.**

---

*This audit is part of QC-21 — Server-Side Answer Validation Bridge.*
*Next: A+ Core 2 audit, then execution.*
