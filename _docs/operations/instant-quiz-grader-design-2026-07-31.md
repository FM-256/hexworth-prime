# InstantQuizGrader — why a third shuffle mechanism exists

**Date:** 2026-07-31 · **Status:** built, harness green, pages not yet migrated
**Driver:** BUG-065 (answer keys in page source) + BUG-067 (keys guessable by always-picking-B)
**Convention:** written per the precedent of `inline-quiz-shuffler-design-2026-05-09.md`, at
Nancy's condition — a new mechanism overlapping two existing ones needs its rationale recorded
before it ships, or the next person cannot tell which to reach for.

## TLDR

Four live OpenStack quizzes shipped their answer keys in the page source AND could be passed by
clicking the second option every time. Fixing both at once needs a component that neither
existing mechanism provides: **server-held answers with per-question instant feedback**.

## The three mechanisms, and when each applies

| Mechanism | Grading | Feedback | Shuffle | Use when |
|---|---|---|---|---|
| `QuizEngine.js` | server, ONE full call | end-of-quiz review screen | Fisher-Yates, built in (QC-8, enforced) | the standard path for graded quizzes |
| `InlineQuizShuffler.js` | client | instant | Fisher-Yates, index-based | client-graded inline quizzes ONLY |
| `InstantQuizGrader.js` | server, `partial: true` per question + one full call | instant, per question | Fisher-Yates, index-based, cached per question | a quiz that must keep instant feedback AND must not ship its key |

## Why not just use one of the existing two

**QuizEngine** would fix both defects with battle-tested code, and it was seriously considered.
It grades in a single full call, so feedback becomes an end-of-quiz review. These four quizzes
give feedback after every question — highlighting the correct option and showing an explanation
immediately. Migrating them changes the pedagogy of live content, which is a content decision
nobody asked for. If that decision is ever taken deliberately, migrating to QuizEngine is the
right move and this component should be retired.

**InlineQuizShuffler** cannot be used here at all, and not by oversight: it explicitly throws on
any document containing `gradeQuiz(` or `serverGrading: true` (`InlineQuizShuffler.js:101`).
Including it on these pages once they call `gradeQuiz` would take the quiz down at load. Its own
header explains why — shuffling a display whose key lives on the server desynchronises them
unless the remap is deliberate. **Its Fisher-Yates algorithm was copied into InstantQuizGrader
rather than imported**, precisely because importing it is designed to fail.

## The invariant

The student sees a SHUFFLED order. The server only ever knows ORIGINAL indices. Every crossing
goes through the permutation:

    display  -> original :  perm[displayIndex]        (what we submit)
    original -> display  :  perm.indexOf(originalIdx) (where to highlight the answer)

If those disagree by one position, every student is graded wrong — strictly worse than the leak
being fixed. This is the whole risk of the change.

## Two deliberate divergences from QuizEngine

1. **Index-based remap, not text-based.** QuizEngine matches original↔shuffled by option TEXT
   (`_originalOptions.indexOf(selectedText)`), which collides when two options share text. These
   quizzes contain short, duplicate-prone options, so that is a live hazard here rather than a
   theoretical one. The harness includes questions with duplicate option text (`['1','2','2','3']`,
   `['same','same','other']`) that a text-based remap would fail.
2. **Permutation cached per question, not regenerated per render.** Same reasoning as the
   InlineQuizShuffler design note: a re-rendered question must not move its options, or a
   returning student sees them shift and a stored answer points at the wrong row. These four
   quizzes are forward-only today so it is currently unobservable — which is exactly why it is
   asserted in the harness, since a future edit could silently violate it.

## `revealToAll` is REQUIRED on the seeded key

`gradeQuiz` reveals `correctAnswer`/`explanation` only inside
`if (passed || keyData.revealToAll || revealForReview)` (`functions/index.js:1764`). A partial
call submits 1 of 15, scores ~7%, and never satisfies `passed`; `revealForReview` is
`!isPartial`-guarded (:1745). **Without `revealToAll: true` the feedback box renders empty on
every question** — the change would look fine and be silently broken. Found by Nancy in review,
confirmed in code.

This is safe: the reveal loop hard-scopes partial calls to the submitted question
(`if (isPartial && !(String(i) in answers)) continue;`). On the final full call it reveals all
answers, which is the intended formative-quiz behaviour and is what the end-of-quiz review needs.

## Harness

`_tools/instant-quiz-grader-test.js` — 200 seeds × 4 questions, asserting: the display order is a
true permutation; the submitted original index always resolves to the option the student clicked;
the reverse map returns the same row; and the permutation is stable across re-renders. It ends
with an **ablation** — an off-by-one is injected into the display→original crossing and the run
must FAIL. Current result: normal PASS, ablated 5668 failures, shuffle distribution 24/26/26/25%
across 4000 shuffles.

The ablation is not optional. Earlier the same day, a grep-honesty harness reported ALL PASS
against a deliberately broken engine because it was asserting on the wrong text. A harness that
cannot fail converts an untested change into a "verified" one.

## Not yet done

The four pages still need `submitAnswer()`/`showResults()` rewritten to consume an async verdict
— `q.correct` is read at FOUR sites per file, not one, including `opts[q.correct]` which throws
on `undefined` and a review screen that prints the correct answer's text. Seeding `quiz_keys`
is a production Firestore write and is held pending explicit operator go-ahead.
