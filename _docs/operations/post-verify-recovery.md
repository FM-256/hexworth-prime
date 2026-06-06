# Post-Verify Recovery Runbook

When `_tools/deploy/post-verify.sh` exits non-zero, the deploy has already shipped to production. This runbook covers what to do.

## Exit codes

- **0** — all checks passed; nothing to do
- **1** — caller misuse (flag conflict); fix the invocation and re-run post-verify standalone
- **2** — verification flagged divergence; deploy SHIPPED but a regression was detected
- **3** — post-verify infrastructure failure; deploy SHIPPED but verification couldn't complete

## Exit 2 — divergence flagged (regression in production)

Source the specific finding from post-verify's stdout. Common cases:

### Functions ACTIVE check failed

A Cloud Function is in non-ACTIVE state after deploy.

1. `gcloud functions list --project=hexworth-prime --regions=us-central1 --format="value(name,state)"` — confirm which CF
2. Check Firebase console / Cloud Logging for the failing function's deploy logs
3. Common causes: missing IAM grant, missing env var, syntax error not caught by lint
4. Recovery: revert the offending commit (`git revert <sha>`) and re-deploy via `_tools/eduscan/smoke/deploy.sh --only functions`

### EduScan critical+high gate failed post-deploy

Critical or high findings appeared that weren't present pre-deploy.

1. `node _tools/eduscan/cli.js --severity critical,high` — see the findings
2. **Triage by source — which case is this?**
   - **(a) Real bugs introduced by the deploy:** revert the change and re-deploy
   - **(b) Validator false positives:** tune the validator (separate commit, with Nancy review) — DO NOT bypass via `--skip-post-verify` without operator-logged reason
   - **(c) NEW HIGH-severity detection rule shipped in this deploy that surfaces PRE-EXISTING inventory:** these are not regressions — they're the rule's design intent. Confirm by:
     - Diff: `git log -p master -- _tools/eduscan/validators/` since previous deploy — does the diff add a new HIGH-severity rule?
     - Cross-check: do the new findings' code IDs match a rule added in this deploy's `_tools/eduscan/validators/syntax/heuristics.js` diff?
     - If yes, **accept the flag as expected.** No revert needed; the rule did its job. Document the count delta in the deploy's commit message / sprint notes so future deploys see the same baseline.
     - Example case: marathon 2026-06-06 shipped QUIZ-002b (Pattern A1+A2) catching 79 pre-existing client-graded quizzes — flagged post-verify but expected by design. Per memory `project_marathon_2026_06_06_complete`.

## Exit 3 — infrastructure failure (verification incomplete)

Verification couldn't run, not necessarily a regression. Common cases:

### `gcloud` not installed or not authenticated

Skipped — verification ran with reduced coverage.

1. Manually verify functions ACTIVE state via Firebase console
2. Manually check Cloud Logging error-spike

### `nexus full --publish` failed

Likely Firebase admin credential or network issue.

1. Run `node _tools/nexus/nexus.js full --publish` standalone (with explicit operator authorization per CLAUDE.md rule 10)
2. If credential failure: re-auth via `firebase login` or refresh service account key
3. If transient network: re-run

## When to use `--skip-post-verify`

Only when:
- An emergency hotfix needs to ship and post-verify is failing for unrelated infrastructure reasons
- Post-verify would otherwise prevent shipping a critical fix

Required: `--skip-post-verify --skip-post-verify-reason "<reason>"` — the reason is logged to `_planning/reports/skip-post-verify-audit.log`.

After shipping with `--skip-post-verify`, manually run post-verify standalone (`bash _tools/deploy/post-verify.sh --hosting`) once the underlying issue is resolved, to confirm the deploy did not introduce a regression.

## NEVER

- Re-run the deploy script just because post-verify exited non-zero. The deploy already shipped. Re-running deploys the same code again, doesn't fix the regression.
- Bypass post-verify silently. Use `--skip-post-verify` with reason, or fix the underlying issue.
