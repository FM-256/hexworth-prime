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

## OPERATOR DECISION — sign-in is now required on these 4 quizzes

**Decided 2026-07-31 by the operator, in chat, on an explicit three-way choice.**

Server-side grading cannot work without auth: `gradeQuiz` throws `unauthenticated` with no
`request.auth` (`functions/index.js:1640-1643`). These 4 pages were previously reachable by
anyone merely "sorted" — `AccessGuard`'s `sorted` level is satisfied by `isSorted()` or
`isTourist()`, both localStorage-only, with no Firebase account. So closing the key leak
necessarily locks that population out. The size of it is **unmeasurable**: the old quizzes never
wrote to Firestore, so no attempt log exists to count against. Nancy raised this and asked for
a number or an operator sign-off; no number can exist, so it went to the operator.

The three options put forward, and the outcome:

| Option | Outcome |
|---|---|
| **Ship with the sign-in gate** | **CHOSEN.** Blocked students get a clear up-front panel before spending an attempt. |
| Ship with no gate | Same lockout, unannounced — 15 silent "could not verify" results. Matches `cr-w1-osi.quiz.html`, which additionally marks the student's picks red as if wrong. |
| Don't ship | Key stays readable via Ctrl-U; install quiz stays passable by always clicking B (12 of 15 answers are index 1). |

Supporting precedent, surfaced by Chris: **BUG-050** (fixed 2026-07-30) — Frank ruled that
anonymous Firebase identity does not count as a real account for platform participation, and
lab-manager was hardened to reject anonymous tokens on that reasoning. Also, 6 of the 9 OpenStack
labs already require sign-in ("Personal cloud required... Sign in and launch below",
`cloud-openstack-neutron-live.lab.html:128-129`), and a signed-out student's quiz completion
never persisted anyway — `ProgressManager.syncToFirestore` returns early when unauthenticated.

## An incomplete run is never scored and never recorded

Found by Chris after the first implementation shipped a subtler unfairness than the one it fixed.

`gradeQuiz` always computes `total = answerKey.length`. A question the grading service could not
reach is simply absent from the `answers` object, so the server scores it `isCorrect: false` and
it lowers the percentage **exactly as if the student had answered wrong** — enough to tip a pass
into a fail. The UI was simultaneously telling the student it was "not counted as correct."

So: if any question goes ungraded, the quiz does not submit, does not record a `quiz_attempts`
row, does not award `ModuleProgress`, and does not persist a score. The student is shown how they
did on the questions that *were* graded, told plainly that it is not a quiz score and does not
count, and asked to retake.

`functions/index.js` was deliberately NOT changed. Adjusting `total` there would alter grading
semantics for all 615 seeded quizzes to solve a 4-quiz problem; refusing to submit an incomplete
attempt achieves the same honesty with no blast radius.

## Not yet done

The four pages still need `submitAnswer()`/`showResults()` rewritten to consume an async verdict
— `q.correct` is read at FOUR sites per file, not one, including `opts[q.correct]` which throws
on `undefined` and a review screen that prints the correct answer's text. Seeding `quiz_keys`
is a production Firestore write and is held pending explicit operator go-ahead.
