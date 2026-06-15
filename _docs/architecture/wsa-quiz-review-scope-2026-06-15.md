# WSA Quiz Answer-Review — Implementation Scope (additive)

| | |
|---|---|
| **Status** | Scoped, ready to implement. Pilot M01 first, then author M02–M19. |
| **Date** | 2026-06-15 |
| **Goal** | After submitting a WSA quiz, a student sees per-question review: their answer, the correct answer, why it's correct, and why each wrong option is wrong — without exposing answers before submission. |
| **Constraint** | Additive only — no change to scoring, saved progress, or grading; build/test on a preview channel before prod. |

## TLDR
The review UI already exists in the WSA quiz engine; it's just starved of data because WSA quizzes are server-graded (answers deliberately not on the page) and explanations were never authored. Fix, additively: (1) store per-question explanations in `quiz_keys` (server-side), (2) have `gradeQuiz` return correct-answer + explanation **after** submission, (3) feed the engine's existing review mode from that response. Content for M01 already exists at gold standard (rationale + per-distractor analysis + citations); M02–M19 need authoring to the same pattern.

## What already exists (verified)
- **Review UI:** `_app/houses/cloud/modules/wsa/quiz-engine.js` has a review mode (✓/✗ per option + `q.explanation`), lines 113–137. It currently shows nothing useful because `q.correct`/`q.explanation` are undefined in the page data.
- **Server grading:** WSA quizzes call `gradeQuiz` (quiz-engine.js:255) → reads `quiz_keys/{quizId}` (`functions/index.js:1521`) → returns per-question right/wrong `results` + score. Answers are NOT in the page (anti-cheat — keep it that way).
- **quiz_keys:** exist for all WSA quizzes (`wsa-m01`…`wsa-m19`) with `{ answers, passingScore, questionCount, source, createdAt }` — **no `explanations` field yet**.
- **Content:** `~/hexworth-shared/Solutions/WSA/WSA-M01-Quiz-SOLUTIONS.md` — per question: correct answer, **Rationale**, **Distractor Analysis** (why each wrong option is wrong), Microsoft Learn **Citation**, Verification. Follows `KBA/quiz-solutions-manual-architecture.md`. **Only M01 of 19 is authored.**

## Decisions (resolved by the findings)
- **Depth = per-distractor.** The M01 content already includes "why each wrong option is wrong," which is exactly the user complaint. We hit that bar.
- **Source = existing pattern, not freehand.** M01 is the template; M02–M19 authored to the same structure with verifiable citations (Microsoft Learn primary), through the content + citation gates — not invented.
- **Rollout = pilot M01 end-to-end, then the rest.** Prove the flow + UX on one fully-authored module; get sign-off; then author/seed M02–M19.

## The change (3 additive parts)

### 1. quiz_keys — add `explanations` (server-side)
Add a per-question `explanations` array to each `quiz_keys/{wsa-m##}` doc:
```
explanations: [
  { rationale: "<why the correct option is correct>",
    distractors: { "0": "<why option 0 is wrong>", "2": "...", "3": "..." } },  // keyed by ORIGINAL option index
  ... one per question
]
```
- Seeded from the solutions docs (M01 first). Add-only field; does NOT touch `answers` → grading unchanged.
- Indices are ORIGINAL (pre-shuffle) option indices; the engine maps to displayed positions (it owns the shuffle).

### 2. gradeQuiz CF — return review data POST-submission (`functions/index.js:1521`)
In the per-question `results` it already builds, additionally include (only in the response, only after grading): `correct` (original correct index) and `explanation` ({rationale, distractors}) pulled from `keyData.explanations[i]`. No scoring change; purely an additive return payload. If a key has no `explanations` (e.g. not-yet-authored module), omit gracefully (review still shows ✓/✗, just no "why").

### 3. quiz-engine.js — render review from the server response
The engine currently expects client-side `q.correct`/`q.explanation` (absent). Change review mode to consume the `gradeQuiz` response: map each question's server `correct` (original index) → its shuffled display position, mark ✓/✗, and render rationale + the distractor note for the option the student picked (and/or all wrong options). Display-only change; no grading/progress impact.

## Content work (the bulk, after the pilot)
Author M02–M19 quiz solutions (18 modules × 10 = 180 questions) to the M01 gold-standard pattern: correct answer + rationale + per-distractor analysis + verifiable citation. Pipeline: `edu-content-designer` to draft → `karl` (citation/URL verification) → `bridget` (HTML ↔ quiz_keys ↔ Confluence sync, since quiz_keys is the seed source) → seed to `quiz_keys`. This is the largest, slowest part and is content-quality-gated, separate from the code.

## Pilot (M01) — end to end
1. Seed `explanations` into `quiz_keys/wsa-m01` from `WSA-M01-Quiz-SOLUTIONS.md` (after a `quiz_keys` backup).
2. Implement the CF + engine changes.
3. Deploy to a **preview channel** (hosting) + a preview/functions path for `gradeQuiz`.
4. Test as a student: submit `wsa-m01`, confirm review shows correct answer + rationale + distractor "why wrong" for each question, mapped correctly through the shuffle.
5. Confirm a NOT-yet-authored module (e.g. `wsa-m02`) still grades and shows ✓/✗ gracefully with no explanation (no crash).
6. Operator sign-off on the experience → then author M02–M19.

## Safety / gates (additive)
- **No scoring/progress impact:** grading logic and `answers` unchanged; CF change is additive to the return; engine change is display-only; `explanations` is a new key field.
- **Anti-cheat preserved:** answers/explanations stay server-side, returned only after submission. Do NOT put `correct`/`explanation` back into the page.
- **quiz_keys writes:** backup `quiz_keys` first; seed add-only; run `functions/verify-quiz-keys.js wsa-m01` after to confirm keys intact (per CLAUDE.md server-graded exam rule).
- **Gates:** Nancy + Chris on the code; Karl on citations; Bridget on quiz_keys/HTML/Confluence sync. Functions deploy via `_tools/eduscan/smoke/deploy.sh --only functions:gradeQuiz`; hosting via `./deploy.sh`.
- **Rollback:** remove the added CF return fields + revert the engine review block; `explanations` field can remain (unused) or be removed. No data migration to undo.

## Files touched (expected)
- `functions/index.js` — `gradeQuiz` return payload (additive).
- `_app/houses/cloud/modules/wsa/quiz-engine.js` — review rendering from server response.
- `quiz_keys/{wsa-m##}` — new `explanations` field (seeded, add-only).
- A seed script (read solutions .md → write `quiz_keys.explanations`), parallel to the existing key-seeding tooling.
- Content: `~/hexworth-shared/Solutions/WSA/WSA-M##-Quiz-SOLUTIONS.md` for M02–M19.

## Open items to confirm during implementation
- Exact `gradeQuiz` request payload from the WSA engine (indices vs text) and how `results` indices map to the engine's shuffle — so the returned `correct` lands on the right displayed option.
- Whether other server-graded courses share `gradeQuiz`'s return shape (the additive fields must not break them — additive should be safe; verify).
- Retake behavior: review reveals answers post-grade; confirm acceptable for retakes (standard formative tradeoff).

## Related
`KBA/quiz-solutions-manual-architecture.md` · memory `reference_karl_citation_auditor`, `reference_bridget_sync_auditor`, `feedback_cert_hubs_server_graded`, `project_proper_test_environment`
