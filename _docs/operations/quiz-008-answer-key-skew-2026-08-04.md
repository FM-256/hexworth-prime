# QUIZ-008 — Skewed Answer Keys

**Status:** CloudMaster remediation in progress. Everything outside CloudMaster is DOCUMENTED, NOT ACTIONED.
**Raised:** 2026-08-04
**Scope ruling (operator):** CloudMaster hub only. Other houses are out of scope for this pass.

---

## What the defect is

A quiz whose correct answers cluster on one option index can be passed by guessing that
letter. `az104-ch02-quiz` held `[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]` — every answer was B, so
answering all-B scored 100%. The quiz assessed nothing, and it silently inflated every grade
in the course.

This is a teaching defect, not a lint warning. A student finds the pattern faster than they
find the material.

**Root cause, per `_tools/quiz/ala-shuffle.js`'s own header:** the generator that produced
these quizzes "generated all 4 with the correct answer at position 1 (B) ~80% of the time."
The same bias shows up across houses, which is consistent with a generation-time artifact
rather than per-course authoring error.

**It is bias, not error.** A three-way audit (bridget, 2026-08-04) re-derived the correct
answer for all 90 AZ-104 questions independently from their `explanation` text and found
**0 wrong answers**. The generator was lazy about position, not wrong about content. Do not
assume the same holds for other houses without re-auditing — it was verified only for AZ-104.

---

## Scale

421 files platform-wide carry a QUIZ-008 finding (one per skewed quiz file).

| House | Files | In scope this pass |
|---|---:|---|
| script | 86 | no |
| matrix | 83 | no |
| forge | 51 | no |
| **cloud (CloudMaster)** | **50** | **YES** |
| shield | 33 | no |
| web | 33 | no |
| eye | 28 | no |
| code | 19 | no |
| dark-arts | 10 | no |
| ai | 9 | no |
| divergent | 8 | no |
| key | 7 | no |
| vault | 4 | no |

CloudMaster breakdown: `quizzes/` 16, `cloud-essentials` 10, `ms-102` 8, `pl-300` 5,
`az-104` 4, `openstack` 4, `ms-900` 3.

---

## The hard part: two incompatible quiz formats

Any fix MUST branch on which of these a file is, because applying the wrong one corrupts
grades.

**Format A — answer in the HTML (browser-graded).** e.g. the ALA quizzes.
```js
{ q: '...', opts: ['...'], ans: 2, exp: '...' }
```
Grading compares `idx === q.ans` client-side. The Firestore `quiz_keys/{id}` doc is inert at
runtime. A shuffle tool can read ground truth from the same file it rewrites, and shipping
the HTML alone is sufficient. `_tools/quiz/ala-shuffle.js` handles this case.

**Format B — answer only in Firestore (genuinely server-graded).** e.g. AZ-104.
```js
{ question: '...', options: ['...'], explanation: '...' }   // NO answer field
```
`QuizEngine.js:621` calls the `gradeQuiz` Cloud Function, which reads `quiz_keys/{quizId}`
from Firestore at submit time. The HTML supplies only option ORDER. Consequences:
- The only source of the correct index is `functions/quiz_keys.json`.
- HTML question N maps to `answers[N]` by **array position alone** — there is no shared id.
  Nothing in this repo had ever verified that correspondence. Verify it before every run.
- HTML and Firestore deploy through separate paths, so a shuffle is a two-system change.

`_tools/quiz/az104-shuffle.js` handles Format B for AZ-104.

---

## The deployment hazard (Format B only)

There is **no atomic swap** and no mechanism that provides one:
- `gradeQuiz` reads `quiz_keys/{quizId}` live at submit time. No version field, no
  key-version parameter, no maintenance flag (verified by reading `functions/index.js`).
- The quiz HTML embeds its questions as a **static JS array loaded once at page load**; it is
  never re-fetched.

So any student holding the page across the key write is graded against option positions that
no longer exist. Only a moment with no in-flight sessions removes this.

### The trap that blocked the first attempt

The obvious plan — "push keys, then run `./deploy.sh` immediately after" — is **wrong**, and
was caught at QC on 2026-08-04. `deploy.sh` does not go straight to `firebase deploy`. It
runs a branch check, the Chris marker check, the Nexus gate, `hub-registry-audit`, a
Puppeteer smoke gate, and an unconditional EduScan drift report before reaching the hosting
deploy. That drift step alone was **timed at 29m49s**.

Result: a ~30 minute window in which live Firestore holds the NEW indices while production
still serves the OLD option order — mis-grading not just in-flight sessions but every fresh
page load. Worse than shipping nothing.

**The two operations that must be adjacent are the Firestore write and the actual
`firebase deploy` binary call — NOT the write and the wrapper script.**

Correct sequence:
1. Run the full gate pipeline first as a validation pass, with no writes. Confirm green.
2. Record the Chris pass.
3. `node functions/push-quiz-keys.js --filter <prefix>` — scope it; never push all keys.
4. `npx firebase deploy --only hosting` **immediately** after, bypassing the wrapper's
   30-minute gate re-run for that one moment.
5. Post-verify, Confluence regen and IndexNow follow; they are non-blocking by design.

---

## Downstream: the solution manual goes stale

Confluence solution pages under the Quiz Solutions Manual state answers as **both letter and
full text**: `Correct Answer: B) The deployment and management layer...`.

Reordering options invalidates the letter. Measured for AZ-104: **71 of 90 (79%)** letters
went stale. The named concept stays correct, but a student cross-checking "the manual says B"
ticks the wrong box in the live quiz.

Any Format B shuffle must be followed by regenerating the affected solution pages, in the
same session. AZ-104 pages: ch01 `3407881`, ch02 `2982980`, ch03 `3015392`, ch04 `2851885`,
ch05 `2950389`, ch06 `3473409` — all v1 since 2026-04-26, none Karl-audited.

---

## Unrelated bug found while auditing

Live Firestore `quiz_keys/az104-ch06-quiz` holds a **16-element** answers array
(`questionCount: 16`) against 15 HTML questions — a spurious trailing `1`, seeded
2026-04-24, months before this work. Confirmed directly against production. The corrected
15-length key fixes it as a side effect of the push.

Worth checking whether other quizzes carry the same length mismatch; `verify-quiz-keys.js
--missing` is the tool.

---

## Partial-remediation risk

Fixing CloudMaster leaves ~371 files skewed in other houses, with nothing marking which
courses are fair and which are guessable. That is a different platform state from uniformly
bad, and it is a deliberate operator decision recorded here, not an oversight.

Related: `_tools/quiz/ala-shuffle.js`, `_tools/quiz/az104-shuffle.js`,
`_tools/eduscan/validators/syntax/heuristics.js` (the QUIZ-008 rule).
