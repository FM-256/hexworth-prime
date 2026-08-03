# Server-Graded Exam Go-Live Checklist

Every server-graded exam (any page calling `gradeQuiz`) ships through ALL of these, in
order. Written 2026-08-02 after the CSE final briefly reached production unseeded and
unregistered (Nexus QUIZ-006 / EduScan REG-001; a correctly-answered submission rendered
as 0/40 because the key doc did not exist). The checklist is the fix for that class.

## TLDR

| Step | Command / file | Gate |
|---|---|---|
| 1. Author + adversarial review | exam HTML stays OUTSIDE `_app` (e.g. `_tools/staging-exam/`) until step 8 | Nancy: every answer verified, cross-file consistency re-derived |
| 2. Static key registry | `functions/quiz_keys.json` entry (answers, passingScore, questionCount, reviewAfterFails if the page promises reveal) | EduScan QUIZ-series validates against this |
| 3. Content registry | `_app/config/content-registry.js` entry so the exam is reachable from its hub | EduScan REG-001 |
| 4. Student-experience gate | render, mobile, instructions, submit payload shape, error-state honesty | Chris |
| 5. Backup live keys | `cd functions && node backup-quiz-keys-pre-seed.js` | before ANY seed |
| 6. Seed live Firestore | seed script writing `quiz_keys/{quizId}` (pattern: existing `seed-*-key.js`) | operator-authorized production write |
| 7. Verify the bridge | `cd functions && node verify-quiz-keys.js <quizId>` must print `Verification PASSED` | CLAUDE.md rule 9 -- paste the output, never claim it |
| 8. Move exam into `_app` + deploy | `./deploy.sh` (Chris pass recorded) | post-verify green |
| 9. Live probe | signed-in production submission returns a real score (not 0/N, not an error) | mechanical, not eyeballed |

## Why the exam file stays out of `_app` until the end

`deploy.sh` ships the working tree. An authored-but-ungated exam sitting in `_app` rides
along with ANY unrelated hosting deploy -- that is exactly how the CSE final reached
production early. Staging location: `_tools/staging-exam/` (gitignored parent, harmless).

## The error-state rule (Chris, 2026-08-02)

The page's `gradeQuiz` catch must render an explicit "grading service unavailable, nothing
recorded, try again" state. It must NEVER fall through to the results panel with zeroed
defaults -- a service error shown as 0/N FAIL is indistinguishable from failing, and a
student will believe it.

## Related

- `functions/verify-quiz-keys.js` -- the bridge verifier (also `--missing` for platform sweeps)
- `_docs/operations/FIRESTORE_ANSWER_ARCHITECTURE.md` -- why answers live server-side only
- `_app/houses/matrix/adv-linux/exams/ala-final.exam.html` -- the proven page pattern
