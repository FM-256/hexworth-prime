# InlineQuizShuffler — Design + Integration Plan

**Status:** Phase 1 — component shipped, no quiz integrations yet
**Sprint:** Resolves Bridget recommendation from `bridget-pis-2026-05-09.md`
**Related:** Solutions Manual Quality memo "9-quiz cluster" (reclassified CRITICAL → HIGH cheatability)

## The bug being fixed

Bridget's 2026-05-09 audit confirmed structural cheatability across 4 PIS weekly quizzes. All 4 share the answer-position pattern `[0,0,2,3,2,3,1,0,3,2,1,3,1,0,1]` across 60 questions of disjoint subject domains (CIA triad, malware, threat actors, etc.). A student who memorizes the W1 pattern gets 100% on W2/W3/W4 without reading any question.

Karl Mode-2 confirmed the answers are semantically correct. The bug is NOT wrong-grading; it is structural cheatability through shared-pattern memorization.

## Scope clarification (corrected this session)

**Original cluster finding:** 9 quizzes share answer array (4 PIS + 5 fw-w*).

**Refined this session:** Only the 4 PIS quizzes have the cheatability bug. Investigation:
- The 5 fw-w* quizzes (`fw-w2-wireless`, `fw-w3-os-security`, `fw-w3-workstation`, `fw-w4-mobile`, `fw-w4-soho`) use **QuizEngine + serverGrading: true**
- QuizEngine.js:138-148 already performs Fisher-Yates option shuffle on every render, with `_originalIndex`/`_originalOptions` tracking for server-grading mapping
- Students opening those 5 fw-w* quizzes see DIFFERENT positions per render — no shared-pattern memorization possible

**The 4 PIS quizzes (`pis-w1`, `pis-w2`, `pis-w3`, `pis-w4`)** use a custom inline rendering pattern:
```js
var questions = [{ q: '...', opts: [...], ans: <int> }, ...];
function loadQuestion() { /* renders q.opts in source order */ }
function selectAnswer(idx) { if (idx === q.ans) ... }
```

No shuffle. Positions are stable across renders. Cluster pattern visible to students.

## Solution

`_app/components/InlineQuizShuffler.js` (NEW, ~135 lines including header + guards).

API:
```js
InlineQuizShuffler.shuffleQuestion(question)
  // Fisher-Yates on question.opts, remap question.ans index. Mutates in place.
  // Throws on non-integer ans, out-of-range ans, non-array opts.

InlineQuizShuffler.shuffleQuiz(questions)
  // Calls shuffleQuestion on each. Sniff-tests document for serverGrading
  // markers and refuses to run if found (prevents misuse on QuizEngine quizzes).
```

Phase 2 integration pattern (per quiz, 1 line + 1 import):
```html
<script src="/components/InlineQuizShuffler.js"></script>
<script>
    var questions = [...];  // existing question data
    InlineQuizShuffler.shuffleQuiz(questions);  // ONCE at quiz init
    // existing render code unchanged
</script>
```

Shuffles run ONCE at script load — not per render. A page refresh (= new quiz attempt) re-shuffles, which is the intended behavior. Mid-quiz refresh effectively re-randomizes question order, which matches existing QuizEngine behavior on server-graded quizzes.

## Why per-question shuffle, not per-render

Per-render shuffle would re-randomize every question display, breaking quiz-state continuity (student sees Q1 in position A; clicks next; clicks back; Q1 now in position B). Once-at-init shuffle gives students a stable but uniformly-randomized experience for the duration of the attempt.

## Nancy review (2026-05-09)

Verdict: **PROCEED-WITH-CHANGES** on:
1. ✓ Add `typeof question.ans !== 'number'` guard with thrown error — implemented
2. ✓ Confirm `ans` field is integer in all PIS quizzes — verified via grep
3. ✓ Verify no quiz has post-submission "review mode" that re-renders opts — PIS quizzes have `restartQuiz` (full reload, fine) and `showResults` (no answer-reveal)

Additional implementation hardening:
- Out-of-range guard on `question.ans`
- Document-level serverGrading/gradeQuiz sniff test in `shuffleQuiz`
- Length-1 opts handled gracefully (returns unchanged)

## Test results (Phase 1)

```
Test 1 (preserves correctness across shuffle): PASS
Test 2 (throws on string ans): PASS
Test 3 (throws on out-of-range ans): PASS
Test 4 (length-1 opts unchanged): PASS
Test 5 (shuffleQuiz preserves all correctness): PASS
Test 6 (1000-trial distribution uniform): PASS — [235, 261, 256, 248]
```

Distribution test confirms Fisher-Yates is unbiased — over 1000 trials, the original-position-0 answer landed in each of the 4 shuffled positions roughly 25% of the time.

## Phase 2 — Operator-authorized wire-in

Each of the 4 PIS quizzes needs a 2-line edit:

```html
<!-- Before: -->
<script>
    var questions = [...];
    // ... render code ...
</script>

<!-- After: -->
<script src="/components/InlineQuizShuffler.js"></script>
<script>
    var questions = [...];
    InlineQuizShuffler.shuffleQuiz(questions);
    // ... render code ...
</script>
```

Files:
- `_app/houses/shield/infosec/quizzes/pis-w1.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w2.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w3.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w4.quiz.html`

After wire-in:
- Run smoke gate (PIS hub already covered at threshold min: 30)
- Smoke run verifies no JS errors
- Operator visual-tests one quiz (e.g., load pis-w1 twice, verify positions differ)
- Deploy with `./deploy.sh`

Risk: Low — additive, isolated, fully-tested component.

## Out-of-scope for this design

- Other inline-pattern quizzes platform-wide. The cluster finding only confirmed the 4 PIS quizzes have the bug. Other client-graded quizzes (ethics-it, etc.) might benefit from shuffle but are NOT in this sprint.
- Server-graded quizzes — already protected by QuizEngine's built-in shuffle.
- The Pattern D citation rebuild (28 docs).
- Ethics IT R1 architecture intent decision.

## Architectural references

- Bridget audit: `~/hexworth-shared/Solutions/_audit/bridget-pis-2026-05-09.md`
- Bridget Ethics audit (different quizzes, also client-graded but DIFFERENT answer arrays): `~/hexworth-shared/Solutions/_audit/bridget-ethics-it-2026-05-09.md`
- QuizEngine shuffle reference: `_app/components/QuizEngine.js:138-148`
- Solutions manual quality memo: `_docs/operations/solutions-manual-quality-2026-05-09.md`
