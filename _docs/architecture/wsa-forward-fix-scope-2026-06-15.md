# WSA Forward Fix — Implementation Scope (preview-channel, tested)

| | |
|---|---|
| **Status** | Scoped, not started. Implementation block — build on a preview channel, test, then prod. |
| **Date** | 2026-06-15 |
| **Prereq reading** | `wsa-progress-recovery-findings-2026-06-15.md` (root cause, recovery shipped, forward-fix investigation) |
| **Goal** | New WSA completions flow to the tenant class doc automatically, so analytics stay current without re-running the backfill. |

## TLDR
WSA progress is marked generously into the browser store `wsa-course-progress`, but only a small slice ever reaches the standard pipeline (`ModuleProgress` → `syncClassProgress` CF → tenant class doc): quizzes never call `ModuleProgress` at all, and presentations/labs call it only on an explicit completion action students rarely take. Fix: bridge the one WSA chokepoint (`WSAProgress.markComplete`, `progress.js:88`) to `ModuleProgress` with canonical ids, so everything that reaches `wsa-course-progress` also reaches the tenant class doc. Build + verify on a preview channel with a test enrollment before prod.

## Acceptance criteria
1. As a test student in a test tenant class, completing each WSA component type (presentation, GUI lab, PS lab, quiz) results in the corresponding id appearing in that class's tenant progress doc (`modulesCompleted` / `quizScores`) within seconds — verified by read-only query of the preview/test class doc.
2. The instructor view for that test class renders the completion (uses the already-deployed `wsa-map.js`).
3. **No regression:** existing student progress is never deleted/overwritten (add-only path only); ALA and other courses still sync exactly as before; the WSA hub's own localStorage display is unchanged.
4. Idempotent: repeated marking does not corrupt or double-count (the CF uses `arrayUnion` / per-key set; the dashboard counts each map id once).

## Root cause (refined)
- **Quiz bypass (hard):** WSA quiz engine calls only `WSAProgress.markQuizPassed` → localStorage; never `ModuleProgress.completeQuiz`. 0 WSA quiz pages touch `ModuleProgress`.
- **Completion-trigger mismatch (presentations/labs):** WSA pages DO call `ModuleProgress.complete('cloud', '<full-id>', {returnUrl})` — ids verified consistent with the map (e.g. `cloud-wsa-m01-guilab`; presentations split `wsa-m##-pres` vs `cloud-wsa-m##-presentation` for m05/06/10/11/12/13; no `type` arg → routes to `modulesCompleted`). But that call fires only on an explicit "complete" action, while `wsa-course-progress` is marked far more readily. Net: the browser store fills up; the standard pipeline (and the tenant doc) gets very little. Pre-backfill the tenant class doc was essentially empty despite rich localStorage.
- **CF is fine:** `syncClassProgress` (`functions/index.js:5174`) looks up `enrollments/{uid}` (WSA students ARE enrolled) and writes the class doc by type. The gap is upstream (the trigger), not the CF.
- **Cloud Sync button does NOT cover this:** it writes handler-side (`AssignmentManager.submitProgress` → `classes/{c}/progress`), not the tenant path. See findings doc.

## The fix (single chokepoint)
Bridge `WSAProgress.markComplete(moduleId, component, metadata)` (`_app/houses/cloud/modules/wsa/progress.js:88`) to `ModuleProgress` after its existing localStorage write. Because every WSA completion (presentation/guiLab/psLab/quiz) funnels through `markComplete` (via `markPresentationViewed`/`markGuiLabComplete`/`markPsLabComplete`/`markQuizPassed`), one bridge covers all four types — including the quiz gap — and makes the standard pipeline as well-populated as the localStorage store.

Bridge logic (component → canonical flat id, MUST match `wsa-map.js` / the backfill):
- `presentation` → `presId(n)` = `wsa-m##-pres`, except m05/06/10/11/12/13 = `cloud-wsa-m##-presentation`
- `guiLab` → `cloud-wsa-m##-guilab`
- `psLab` → `cloud-wsa-m##-pslab`
- `quiz` with numeric score → `ModuleProgress.completeQuiz('cloud', 'wsa-m##', score)`; `quiz` without score → `ModuleProgress.complete('cloud', 'wsa-m##')`

Implementation notes:
- Guard `typeof ModuleProgress !== 'undefined'`; wrap in try/catch so the localStorage path is never affected if ModuleProgress is absent (it's loaded on 79/83 WSA pages; confirm/load on the rest).
- `silent: true` (no extra UI) — markComplete is a background mark.
- Idempotent: pages that ALSO call `ModuleProgress.complete` directly will double-call, but `arrayUnion`/per-key set make this harmless.
- Single source of truth for the id map: reuse the same module list + `LONG_PRES` split as `wsa-map.js`/`wsa-class-backfill.js` (consider extracting a tiny shared id helper to avoid drift).

## Open items to confirm DURING the block (before/with the fix)
1. **Live trace (Step 0):** on the preview channel with a test account, mark one WSA component and confirm `markComplete` → bridge → `tryClassProgressSync` → CF → class doc, observing the actual payload + write. Confirms the trigger-mismatch theory and that the bridge closes it.
2. **Presentation id split per module:** verify each `m##` presentation page's emitted id so the bridge's `presId()` matches reality for all 19 (sample showed m05/06/10 = long form).
3. **ModuleProgress availability** on the 4 WSA pages that don't currently load it.
4. **Auth/guest sessions:** confirm the CF call succeeds for the session types WSA students use (the CF requires `request.auth`).

## Test plan (preview channel)
1. **Fixture:** a test tenant + class with `courseId: wsa`, and a test student account enrolled (own `enrollments/{uid}` + class progress doc). (No proper test-fixture tenant exists yet — see memory `project_proper_test_environment`; build a minimal one here.)
2. **Deploy to preview:** `firebase hosting:channel:deploy wsa-forward-fix` (ephemeral; zero prod impact).
3. **Exercise as the test student:** complete one presentation, one GUI lab, one PS lab, one quiz on the preview channel.
4. **Verify (read-only):** query the test class's tenant progress doc — confirm the 4 canonical ids land in `modulesCompleted`/`quizScores`; confirm the instructor view renders them.
5. **Regression:** complete one ALA item as a test ALA student → still lands; spot-check another course; confirm no existing-progress mutation (diff a student doc before/after — only additions).
6. **Idempotency:** re-mark the same components → no duplicates, no corruption.

## Safety / rollout / gates
- All work on a **preview channel** first; prod only after the acceptance criteria pass.
- Nancy + Chris before prod (live-pipeline change touching all WSA students).
- Ship via `./deploy.sh` (smoke + gates).
- The recovery backfill (`wsa-class-backfill.js`) remains the catch-up for any progress made before the fix lands; once the forward fix is verified, re-run it once to capture the gap between recovery and deploy, then retire routine re-runs.

## Rollback
The change is additive (bridge calls only). To revert: remove the bridge block from `progress.js` and redeploy. No data migration to undo; the CF/class-doc writes are add-only.

## Files touched (expected)
- `_app/houses/cloud/modules/wsa/progress.js` — the bridge (primary).
- `_app/houses/cloud/modules/wsa/quiz-engine.js` — only if the quiz path doesn't route through `markQuizPassed`/`markComplete` (verify; the chokepoint bridge should cover it).
- Possibly a tiny shared id-helper to keep map/backfill/bridge ids identical.
- Test fixtures (preview/test tenant + account) — scaffolding, not prod content.

## Related
`wsa-progress-recovery-findings-2026-06-15.md` · `analytics-silo-bridging-scope-2026-06-14.md` · memory `reference_analytics_silo_architecture`, `project_proper_test_environment`
