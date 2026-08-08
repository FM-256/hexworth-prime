# #297 — revealToAll partial-call key harvest

**Status: REPRODUCED. Fix designed, NOT built. Needs an operator green light (CLAUDE.md rule 7).**

## The finding, reproduced

`functions/tests/reveal-harvest-exploit.test.js` drives the real exported grading functions.
No credentials, no network, runs in CI:

```
harvested 12/12 answers in 12 calls, then scored 100% with zero knowledge.
an honest blind guess on the same quiz scored 25%.
```

The attack:

```
for i in 0..N-1:  gradeQuiz({quizId, answers: {i: 0}, partial: true})
                  -> reveals results[i].correctAnswer AND results[i].explanation
then:             gradeQuiz({quizId, answers: <every harvested answer>})
                  -> 100%, written to users/{uid}/quiz_attempts as a genuine pass
```

Every call is a legitimately authenticated request from a real enrolled student. Structurally
it is **identical** to instant-feedback pedagogy: one partial call per question index, exactly
as `InstantQuizGrader.gradeOne` makes them. Nothing in the current server path can tell them
apart.

**Blast radius: 122 of 621 `quiz_keys` entries carry `revealToAll: true`.** Only 4 quizzes
(the OpenStack set) actually use `InstantQuizGrader`, but that is irrelevant to an attacker —
the exploit calls the Cloud Function directly and never loads the page.

Nancy framed this as an escalation caused by pool-draw during the #295 review. It is not: a
non-pooled `revealToAll` quiz is already a guaranteed 100%, so pooling does not make it worse.

## What is NOT the fix

**Refusing credit for revealed questions.** The legitimate flow is partial-per-question and
*then* a full `gradeAll` of the same answers (`InstantQuizGrader.gradeAll`, and
`showResults()` in each OpenStack quiz). Zeroing revealed questions would zero every honest
score.

**Revealing only on a correct answer.** Instant feedback exists to tell a student the answer
when they are *wrong*. This removes the pedagogy to save it.

**Rate-limiting partial calls.** A patient attacker is indistinguishable from a slow student,
and the harvest needs only N calls total.

## The proposed fix: first answer wins

Record, per student per quiz attempt, the answer submitted at reveal time. On the full
submission, score each revealed index against the **recorded** answer, not the resubmitted one.

```
users/{uid}/quiz_progress/{quizId}
  { attemptId, revealed: { "0": 2, "1": 0, ... }, startedAt }
```

- **Partial call**: read the doc, record `revealed[i] = submittedAnswer` if `i` is not already
  present, then reveal as today. A second partial call on an index that is already recorded
  reveals the same thing and changes nothing.
- **Full call**: for every index present in `revealed`, grade the recorded answer and ignore
  what the client just sent. Then clear the doc so the next attempt starts fresh.

Harvesting still works — the student still learns the correct answers, which is the point —
but the harvested answers are worth nothing, because index `i` was already committed the
moment feedback was requested.

## Why this is behaviour-neutral for honest students

Verified by reading the only pages that make partial calls, all four OpenStack quizzes:

| | evidence |
|---|---|
| A question locks after feedback | `opts.forEach(o => o.classList.add('disabled'))`, re-enabled **only** on a grading failure |
| There is no back navigation | `currentQ++` is the only movement; no `prevBtn`, no `currentQ--` |
| The final submit sends what was already graded | `gradeAll(picks)`, where `picks[i]` was set at submit time |

So for every honest student on every quiz that uses this feature, the answer recorded at
reveal time **is already** the answer sent in the full submission. The rule cannot change
their score. It only binds the case the UI already prevents and the server currently allows.

For the other 118 `revealToAll` quizzes, no partial call is ever made, so no record exists and
the full submission is untouched.

## The cost, stated honestly

One extra Firestore read + write per partial call: for a 15-question quiz, 15 reads and 15
writes per attempt against one document.

**This contradicts a deliberate prior decision.** `functions/index.js` currently says:

> Log the attempt to Firestore for analytics — full submissions only. Per-question partial
> calls would write ~15 misleading near-zero "failed" records per real quiz attempt.

That decision was about *analytics noise*, not cost, and this writes one document rather than
15 records — but it is the same "partial calls should not write" instinct, and it deserves to
be overturned deliberately rather than by accident.

## Decision needed

1. **Accept the write cost** for `revealToAll` quizzes, or restrict the mechanism to quizzes
   that opt in?
2. **What happens to a student mid-attempt when this ships?** A stale `quiz_progress` doc
   cannot exist yet, so the first submission after deploy behaves exactly as today. No
   migration is needed, but confirm that is the intent.
3. **Does the same record satisfy #295's pool-draw problem?** The task notes both need a
   server-recorded served-set. A `served: [...]` field on the same document would give the
   pooled path its authoritative draw, and `poolSize` could then be enabled safely. That is a
   larger change and should be decided as one, not bolted on.

## What is committed today

- `functions/tests/reveal-harvest-exploit.test.js` — the reproduction. It asserts CURRENT
  behaviour, so it passes today. Its last assertion is named `DOCUMENTED GAP` and is written
  to **fail once a fix lands**, with a message telling the reader to invert it. That way the
  fix cannot ship without someone revisiting this file.
- No change to `functions/index.js` or `functions/quiz-grading.js`. Nothing deployed.
