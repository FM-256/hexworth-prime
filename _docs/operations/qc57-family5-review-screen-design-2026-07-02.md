# QC-57 Family-5 (review-screen) server-grading design — PROVEN, awaiting sign-off

**Status:** Design proven end-to-end with a working proof-of-concept (2026-07-02). NOT applied to any live page. Needs operator go/no-go before converting the 55 Family-5 quizzes.

## TLDR

The 55 remaining QC-57 quizzes each render a **review screen** that reads `q.ans` (the client-side answer key) to show every question's correct answer after the quiz. The prior waves (net-essentials, python-programming, linux-essentials) had no review screen, so we simply stripped `q.ans` and graded each pick server-side. Family-5 can't just strip `q.ans` — the review screen would have nothing to render.

**The fix, proven working:** as the student answers each question, the per-question `gradeQuiz` call (already `partial: true`) returns that question's `correctAnswer` **because the key is seeded `revealToAll: true`**. The client accumulates those into a `revealedAnswers` map and the review screen reads the map instead of the stripped `q.ans`. No new server code — this uses the reveal path already deployed in `functions/index.js:1644-1655`.

This keeps the answer key off the client at page-load (the QC-57 goal) while preserving the exact review-screen UX students see today.

## Why this is safe / already server-supported

`gradeQuiz` (deployed) at `functions/index.js:1638-1656`:
- `keyData.revealToAll` → reveal correct answers (line 1644). The comment there explicitly says *"Formative module quizzes set revealToAll"* — these 55 quizzes are exactly that.
- On a `partial` (per-question) call, the reveal is scoped to **only the submitted question** (line 1649: `if (isPartial && !(String(i) in answers)) continue;`). So each click leaks only that one question's answer — never the full set. The student is answering that question anyway, so nothing is leaked earlier than the existing per-question feedback already shows.
- `results[i].correctAnswer = expected` (line 1655) is the field the client reads.

Net exposure vs. today: **strictly better**. Today the entire key ships in view-source at page load. After conversion, the client only ever learns a question's answer at the moment the student answers it — which is when the current page already reveals it in the feedback line.

## The transform (per quiz)

1. **Strip `ans`** from the `questions` array (parse the array, delete the `ans` property, re-serialize — never regex on minified inline objects; zero misorder risk).
2. **Add** `var revealedAnswers = {};` beside the existing `userAnswers`.
3. **`gradeOne(qIndex, idx)`** — the shared per-question server call, plus:
   `if (res && typeof res.correctAnswer !== 'undefined') revealedAnswers[qIndex] = res.correctAnswer;`
4. **`selectAnswer`** — server-graded (`partial: true`), visible "Checking…" state, highlights the server-returned correct option and the student's pick, keeps `userAnswers[current] = idx` for the review screen.
5. **Review screen** — one line changes: `var correct = q.ans;` → `var correct = revealedAnswers[i];`.
6. **CSS** — add the `.feedback.checking` rule (matches the other waves).

## Production dependency (the one thing that MUST accompany the page change)

Each of the 55 quiz keys must be seeded with **`revealToAll: true`** (plus `answers`, `passingScore`, `questionCount`). Without it, `gradeQuiz` returns no `correctAnswer` on partial calls and the review screen renders blank correct-answers. This is the same **seed-before-deploy** coupling as prior waves: the key (now with `revealToAll`) must lead the page. Prior non-Family-5 waves did NOT need `revealToAll`; Family-5 does.

## Proof-of-concept (this is what "proven" means)

Built on a scratchpad copy of the real `_app/houses/divergent/cybersecurity-ethics/quizzes/cse-w1.quiz.html` (10 questions). Not committed, not deployed — lives at `~/hexworth-shared/fam5-qc57-poc-2026-07-02/` (transform script + headless driver + the transformed page).

Headless run drove all 10 questions, deliberately answering Q0 and Q1 **wrong**, using a stub that mimics the deployed `revealToAll` server (returns `correct` + `correctAnswer` per submitted question):
- All 10 review rows rendered the correct answer from the **server-revealed map** (Q0→3, Q1→2, Q2→1 … all matching the key), with `q.ans` fully stripped from the page.
- Q0/Q1 showed both the correct answer AND the student's wrong pick (the review UX is intact).
- 0 console/page errors.

## Decision needed

Approve applying this transform + `revealToAll` key-seed to the 55 Family-5 quizzes (in waves, seed-before-deploy, each wave headless-verified like the prior three)? The tracks are: cybersecurity-ethics/cse (has review), cybersecurity-policy (16), intro-networks (8), server-management (8), hardware-support (8), infosec (4), ethics-it (3), and the rest of the review-screen set.

The alternative — leaving the answer key in view-source for these 55 — is the status quo QUIZ-002b finding.

## Related
- `_docs/operations/qc-57-client-grading-inventory.md` (family taxonomy)
- Memory: `project_qc57_server_grading_marathon.md`
- Prior proven waves: net-essentials/python-programming/linux-essentials (commits in the QC-57 memory).
