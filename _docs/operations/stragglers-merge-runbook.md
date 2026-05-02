# Stragglers — Merge Runbook

> **Audience:** Operator executing the merge. Every step is verbatim copy-paste.
> **Authorization required:** Yes — per CLAUDE.md Rule #10. This runbook does not bypass that.

---

## Pre-flight checklist

Verify before starting:

- [ ] You are on a machine with push access to `origin`.
- [ ] You have authorized the deploy decision (see "Deploy decision tree" at end).
- [ ] No other deploys / publishes are in flight.
- [ ] You've read `_docs/operations/stragglers-deploy-notes.md` (PROG-003 regression scheduling).
- [ ] Confluence Stragglers page (id 6062082) v7 reviewed.

---

## Step 1 — Push branch to origin

The branch lives only locally as of writing. Push so PR can be reviewed.

```bash
cd /home/eq/ai-content/hexworth-prime
git branch --show-current        # must print: Stragglers
git status                       # must print: working tree clean (or only acceptable .gitignored)
git rev-list --count master..HEAD  # confirm 32 commits ahead

# Push to origin/Stragglers (not master)
git push -u origin Stragglers
```

Expected output: `* [new branch]      Stragglers -> Stragglers` OR fast-forward update.

---

## Step 2 — Create PR (DRAFT)

Use the prepared PR body:

```bash
cd /home/eq/ai-content/hexworth-prime
gh pr create \
  --base master \
  --head Stragglers \
  --title "Stragglers — Orphan placement, EduScan validators, production-bug remediation" \
  --body-file _docs/operations/stragglers-pr-body.md \
  --draft
```

Expected: prints PR URL like `https://github.com/<org>/hexworth-prime/pull/<N>`.

Mark as ready for review only after final review on the rendered PR description.

---

## Step 3 — STR-24 Preview channel deploy (verification)

Per CLAUDE.md Rule #10 — preview channel is NOT production deploy.

```bash
cd /home/eq/ai-content/hexworth-prime
git branch --show-current        # must print: Stragglers (deploy from branch is OK for preview channel)
firebase hosting:channel:deploy stragglers --expires 7d
```

Expected: ephemeral URL like `https://hexworth-prime--stragglers-XXXXX.web.app/`. Visual smoke test:

- [ ] 8 incubator hubs render — visit `houses/<each-house>/incubator/` (script, shield, web, forge, dark-arts, cloud, code, eye)
- [ ] 3 new curriculum hubs render — `houses/script/modules/databases/`, `houses/script/labs/linux/bash/`, `houses/shield/compliance/cmmc/`
- [ ] House indices show secondary-tier "Incubator" footer link
- [ ] WSA + A+ Core 2 module pages load (per-module progress now scoped)
- [ ] `/forensics/foo` 301 redirects to `/houses/eye/forensics/foo`
- [ ] DevTools console clean on each page (no JS errors)

If any visual check fails: STOP. Do not proceed to merge. File issue against the PR.

---

## Step 4 — Final pre-merge verification

After preview channel sign-off:

```bash
cd /home/eq/ai-content/hexworth-prime
git checkout master
git pull origin master                           # ensure local master fresh
git rev-list --count master..origin/Stragglers   # confirm still 32 ahead
git rev-list --count origin/Stragglers..master   # confirm 0 behind (fast-forward eligible)
git merge-tree master origin/Stragglers > /dev/null && echo "merge clean" || echo "MERGE WOULD CONFLICT — STOP"
```

If "MERGE WOULD CONFLICT" appears: STOP. Branch needs reconciliation.

---

## Step 5 — Merge (fast-forward)

```bash
cd /home/eq/ai-content/hexworth-prime
# You should be on master after step 4
git branch --show-current        # must print: master
git merge --ff-only Stragglers   # fast-forward only — refuses if not possible
git log -3 --oneline             # confirm Stragglers commits now on master
```

If `--ff-only` refuses: master moved during your session. Re-do steps 4-5 after pulling latest master.

---

## Step 6 — Push master + close branch

```bash
cd /home/eq/ai-content/hexworth-prime
git push origin master
# DO NOT delete the Stragglers branch yet — keep until post-deploy verification done
# Eventually:
# git push origin --delete Stragglers
# git branch -d Stragglers   # local cleanup
```

---

## Step 7 — Production deploy (REQUIRES EXPLICIT AUTHORIZATION)

Per CLAUDE.md Rule #10. Confirm in chat / commit before running.

```bash
cd /home/eq/ai-content/hexworth-prime
git branch --show-current   # must print: master
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

Wait for deploy to complete. Watch console for errors.

---

## Step 8 — Post-deploy nexus refresh

Per CLAUDE.md Rule #10 — `nexus full` writes to production Firestore EVEN WITHOUT `--publish`.

```bash
cd /home/eq/ai-content/hexworth-prime
git branch --show-current   # must print: master (NEVER run nexus full from a branch)
node _tools/nexus/nexus.js full
```

This refreshes `_quality_reports/latest`, `_triage_queue`, `_auto_fix_queue` in Firestore with the post-merge state.

---

## Step 9 — Post-deploy verification

```bash
# Verify the 301 redirect is live
curl -sI https://hexworth.com/forensics/index.html | head -5
# Expect: HTTP/2 301 + Location header pointing to /houses/eye/forensics/

# Verify a sample new hub
curl -sI https://hexworth.com/houses/script/modules/databases/index.html | head -3
# Expect: HTTP/2 200

# Re-run strict scanner against deployed state (via local catalog — should still be 0)
node _tools/eduscan/strict-orphan-scanner.js | head -8
# Expect: ORPHANS: 0
```

---

## Deploy decision tree

```
Are you ready to deploy WSA + A+ Core 2 PROG-003 fix?
│
├── YES, immediately ─ STR-40 quizzes will continue returning "Quiz key not found"
│                       ↓
│                   Schedule deploy outside WSA/A+ Core 2 class hours
│                   OR post heads-up: "completion records on these series will reset"
│                       ↓
│                   Proceed to Step 7
│
├── NO, fix STR-40 first
│       ↓
│   cd functions
│   node draft-fw-quiz-keys.js                 # produces fw-quiz-keys-DRAFT.json
│   # Manually review 237 flagged questions per Rule #9
│   mv fw-quiz-keys-DRAFT.json fw-quiz-keys.json
│   # Write seed-fw-keys.js (model on seed-aplus-core1-keys.js)
│   node seed-fw-keys.js --dry-run
│   node seed-fw-keys.js
│   node verify-quiz-keys.js fw-w1-logical fw-w1-physical ... etc.
│       ↓
│   Proceed to Step 7
│
└── DEFER deploy entirely (merge only)
        ↓
    Skip Steps 7-9. Branch is on master but not deployed.
    Operator decides timing for next deploy.
```

---

## Rollback procedure (if Step 7 deploy goes wrong)

Per CLAUDE.md Rule #10 + "we do not destroy" rule. Same pattern as 2026-04-30 Stragglers branch deploy mistake recovery:

```bash
cd /home/eq/ai-content/hexworth-prime
git branch --show-current   # confirm: master
git log -10 --oneline       # find pre-Stragglers commit (commit 2404dadf or similar)

# Option A: Revert merge commit (keeps history clean)
git revert -m 1 <merge-commit-sha>
git push origin master
firebase deploy --only hosting

# Option B: Reset to pre-merge state (if step 5 was --ff-only and you haven't pushed yet)
git reset --hard 2404dadf
firebase deploy --only hosting
# DO NOT use this if you've already pushed — would force-push to master (forbidden)
```

Verify rollback:
```bash
curl -sI https://hexworth.com/<known-changed-path> | head -5
# Should reflect pre-Stragglers state
```

---

## Notes for the agent (Claude) re-running this runbook

- Do NOT execute Step 1-9 autonomously. Each requires explicit operator authorization in chat.
- Per CLAUDE.md Rule #10: `firebase deploy` and `nexus full` are FORBIDDEN unless current branch is `master` AND user explicitly OK'd THIS specific operation.
- This runbook is documentation. The operator runs it.
