# Incident Response Playbook

> Codified from the v7.1.0 ZION outage (2026-04-30) and the Phase 3 fusion experience (2026-05-03/04).
> When production breaks, work this playbook top to bottom.

## Table of contents

1. [Detection](#1-detection) — what each safety net layer catches and how it reaches a human
2. [Triage](#2-triage) — severity classification, who responds, what to communicate
3. [Rollback](#3-rollback) — restore production to the last-known-good state
4. [Diagnosis](#4-diagnosis) — find the root cause without disturbing live state
5. [Recovery](#5-recovery) — re-deploy a fix, verify, document, hand back to normal cadence

---

## 1. Detection

The platform has four detection layers, in order from earliest to latest:

| Layer | What it catches | Where the signal lands | Latency |
|---|---|---|---|
| **Pre-commit** (planned, SYM-5) | Single-file lint: emoji, paths, syntax, naming, heuristics | Developer terminal — blocks commit | Instant |
| **Pre-deploy gates** (active) | Cross-file consistency, Nexus diagnostic, real-browser smoke | `./deploy.sh` terminal output — aborts deploy | ~1-2 min |
| **Runtime monitor** (active) | Live production smoke from Cloud Run every 15 min | Cloud Logging — `jsonPayload.allPassed=false` | ~15 min |
| **Tiered alerts** (planned, SYM-3) | Cloud Function watching the runtime monitor | Pulse, push, email by severity | ~16 min |

**The v7.1.0 ZION lesson:** the first three layers existed in skeleton form but were not gated; the fourth layer didn't exist. The outage went live and stayed live because no alert path reached a human. Phase 1 of the recovery was building the gated chain; Phase 4 (SYM-3) closes the alert loop.

### How to know if something is currently broken

```bash
# Latest runtime monitor result
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' \
  --limit 1 \
  --format="value(timestamp,jsonPayload.allPassed,jsonPayload.passed,jsonPayload.failed)"

# Last 5 results (look for any allPassed=false)
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' \
  --limit 5 \
  --format="value(timestamp,jsonPayload.allPassed,jsonPayload.failed)"

# Failed targets specifically
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor" AND jsonPayload.allPassed=false' \
  --limit 3 \
  --format="value(timestamp,jsonPayload.targets)"
```

If `allPassed=true` is the most recent: **the safety net says nothing is broken right now.** A user-reported issue may still be real (the runtime monitor only probes 5 critical paths) — proceed to diagnosis with the user-reported reproduction.

---

## 2. Triage

### Severity classes

| Class | Definition | Example | Response |
|---|---|---|---|
| **SEV-1** | Site down or core flow broken for all users | Hub buttons silently fail (v7.1.0 ZION); 500 errors on landing | Roll back IMMEDIATELY (§3) before diagnosing |
| **SEV-2** | Important feature broken for many users | A specific house's content all 404s; quiz grading reverts to client-side | Roll back if isolation possible; otherwise emergency fix-forward |
| **SEV-3** | Single-feature regression, workaround exists | One module's progress key shared with another; one CTF box flag wrong | Fix-forward in next deploy cycle. No rollback. |
| **SEV-4** | Cosmetic, non-blocking | Misaligned card; wrong tag casing | Sprint backlog item. No action. |

### Decision: rollback vs fix-forward

Rollback when:
- Bug affects critical user flow (sign-in, dashboard, navigation)
- Bug surface is wide (whole house, whole site)
- Diagnosis will take longer than rollback
- A clean rollback target exists (tag, recent commit)

Fix-forward when:
- Bug is narrow (one module, one quiz)
- Rollback would lose other valid work shipped in the same deploy
- Fix is obvious and testable in the safety net

### Communication

For SEV-1 / SEV-2 — even on solo operation, write a one-paragraph state summary in the operations log immediately:

```bash
echo "
## $(date -Iseconds) — INCIDENT
Severity: SEV-X
Symptom: <user-visible behavior>
Suspected cause: <best guess at this moment>
Action: <rolling back | fix-forward | investigating>
" >> _docs/operations/incident-log.md
```

This becomes the post-mortem timeline. Time-stamp every state change.

---

## 3. Rollback

### 3a. Identify the rollback target

Look for a recent rollback tag:
```bash
git tag --list 'pre-*' --sort=-creatordate | head -5
```

Convention: every fusion / risky deploy creates a `pre-<event>-YYYY-MM-DD` tag on the last-known-good master HEAD. Examples:
- `pre-fusion-2026-05-04` — pre-Stragglers fusion (the most recent)
- `pre-restructure-backup` — pre-content-restructure

If no tag exists, find the commit before the breaking deploy:
```bash
git log --oneline master --since="3 days ago"
# Pick the SHA of the last-good commit before the breakage
```

### 3b. Pause the runtime monitor

Stop scheduled probes during rollback so the monitor doesn't alert on the rollback transition itself:
```bash
gcloud scheduler jobs pause runtime-monitor-15min --location us-central1
```

### 3c. Revert to the rollback target

**Option 1 — revert the breaking commit (preferred when scope is clear):**
```bash
git revert -m 1 <breaking-commit-sha>
git push origin master
```
This preserves history. The breaking commit stays in the log; a revert commit undoes its effect.

**Option 2 — hard-reset to the rollback tag (use only when revert is too messy):**
```bash
# CONFIRM the tag is correct first
git log --oneline pre-fusion-2026-05-04 -1

# Reset master to the tag
git checkout master
git reset --hard pre-fusion-2026-05-04

# Force-push (this rewrites origin/master — irreversible without backup)
git push origin master --force-with-lease
```
**Only do Option 2 if Option 1 produces unresolvable conflicts and you have an explicit go from the user. Force-push to master is destructive.**

### 3d. Re-deploy via the gated chain

```bash
./deploy.sh
```

Expected:
- All 4 gates pass
- `firebase deploy` completes
- Live site reflects the rollback target

### 3e. Verify rollback success

```bash
# Probe the broken-in-prod URL — should now respond as it did before the breakage
curl -sI https://hexworth.com/<broken-path>

# Resume the runtime monitor
gcloud scheduler jobs resume runtime-monitor-15min --location us-central1

# Force one runtime monitor cycle and confirm 5/5 passing
gcloud scheduler jobs run runtime-monitor-15min --location us-central1
sleep 60
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' \
  --limit 1 \
  --format="value(jsonPayload.allPassed,jsonPayload.passed,jsonPayload.failed)"
# Expect: True 5 0
```

If the runtime monitor goes 5/5 PASS, rollback succeeded. Move to §4 to diagnose what was wrong with the reverted commit.

---

## 4. Diagnosis

### 4a. Capture the breaking state

Before deleting any branches or commits, **capture diagnostic state**:
```bash
# Branch from the breaking commit so you can investigate without polluting master
git checkout -b incident/<short-name>-<date> <breaking-commit-sha>

# Run the safety net against the breaking state — find what gate would have caught it
node _tools/eduscan/tests/run.js
SMOKE_PORT=8780 node _tools/eduscan/smoke/run.js
node nexus.js full --no-publish    # diagnostic only — never publish during incident
```

Save outputs to `_docs/operations/incident-log.md` for the post-mortem.

### 4b. Common failure patterns and where to look

| Symptom | First suspect | Verification command |
|---|---|---|
| Hub buttons don't navigate | HEUR-029 (clickable-looking elements without onclick) | `grep -n "onclick=" _app/houses/<house>/index.html` |
| Page loads but JS stops cold | CSP violation (look in browser console) | `node _tools/eduscan/validators/syntax/csp.js` |
| 404 on a previously-working URL | firebase.json redirect change OR file moved without redirect | `grep -A 3 '"redirects"' firebase.json` |
| Module progress not crediting | PROG-003 shared key OR PROG-002 2-arg call | Run `validateAll()` on `_tools/eduscan/validators/syntax/progress-keys.js` |
| Quiz returns 0/N | quiz_keys/{quizId} bridge missing | `cd functions && node verify-quiz-keys.js <quizId>` |
| WSA-style hub mismatch | data-module attribute ≠ progress.js MODULES key | `node _tools/eduscan/validators/syntax/xref.js` |

### 4c. When the safety net DIDN'T catch it

If the runtime monitor was 5/5 passing while production was actually broken: the failure is outside the 5 probed paths. Add the broken path as a smoke-gate target (SYM-6) so the next deploy catches a regression in the same place.

If EduScan was clean but the bug was real: write a new validator rule. Pattern: identify the syntactic fingerprint, encode in `_tools/eduscan/validators/syntax/<category>.js`, add a fixture in `_tools/eduscan/tests/fixtures/`, wire to `_tools/eduscan/tests/run.js`. The HEUR-029 and XREF-001 validators were both built this way after v7.1.0 ZION.

### 4d. When the bug is in a deploy artifact, not code

Check for stale Firestore state:
- `_quality_reports/latest` — Nexus output. Restore from a known-good backup if Stragglers-style pollution occurred.
- `_triage_queue` / `_auto_fix_queue` — Nexus side-tables. Same.
- `quiz_keys/{quizId}` — Cloud Function bridge. Re-run `cd functions && node deploy-quiz-keys.js <quizId>` if missing.

---

## 5. Recovery

### 5a. Build the fix on a branch (never on master)

```bash
git checkout master
git pull --ff-only
git checkout -b fix/<incident>-<date>
```

Make the minimal change. Run the safety net locally:
```bash
node _tools/eduscan/tests/run.js
SMOKE_PORT=8780 node _tools/eduscan/smoke/run.js
```

### 5b. Tag a new rollback point before re-merging

```bash
git checkout master
git tag -a pre-<event>-<date> -m "Pre-<event> rollback target"
```

Future you (or future Claude) will need this if the fix itself misbehaves.

### 5c. Merge the fix and deploy

```bash
git merge --no-ff fix/<incident>-<date>
git push origin master
./deploy.sh
```

### 5d. Verify

- Live URL responds correctly
- Runtime monitor next cycle: 5/5 PASS
- The originally-broken user flow works in a real browser

### 5e. Post-incident bookkeeping

After production is stable for at least 24 hours:

| Task | Cadence |
|---|---|
| Branch cleanup | Delete `incident/<name>` and `fix/<name>` branches once landed |
| Tag retention | Keep `pre-<event>-<date>` tags for at least 30 days, then prune |
| Doc updates | Add the incident to `_docs/operations/incident-log.md` with timeline |
| Sprint backlog | Open SYM ticket for any new validator/smoke target the incident motivated |
| Memory entry | If the incident teaches a durable lesson, write a `feedback_*.md` memory |

### 5f. Did the safety net work?

For every incident, answer these in the post-mortem:

- Which detection layer fired first?
- How long from first failure to first human signal?
- Did rollback work as documented? If not, update §3.
- Did diagnosis converge on the right root cause? If not, what was misleading?
- What new validator, smoke target, or runbook entry would have shortened the incident?

The answer to the last question becomes the next sprint item. The safety net only stays effective if it grows with each incident.

---

## Appendix A — Critical infrastructure cheat sheet

| Resource | Where | Command |
|---|---|---|
| Production hosting | Firebase Hosting (`hexworth-prime`) | `firebase hosting:channel:list` |
| Cloud Functions | Firebase Functions | `firebase functions:log` |
| Firestore | `hexworth-prime` project | Firebase Console → Firestore |
| Runtime monitor | Cloud Run job `runtime-monitor` | `gcloud run jobs describe runtime-monitor --region us-central1` |
| Scheduler | Cloud Scheduler `runtime-monitor-15min` | `gcloud scheduler jobs describe runtime-monitor-15min --location us-central1` |
| Container | Container Registry | `gcloud container images list --repository=gcr.io/hexworth-prime` |

## Appendix B — Forbidden during incident

These actions are forbidden during active incident response without explicit user authorization (per CLAUDE.md Rule #10):

- Any direct Firestore writes (`firebase-admin` SDK, `nexus full --publish`)
- Force-push to master
- Skipping the gated deploy chain (calling `firebase deploy` directly)
- Deleting branches that contain in-flight work
- Modifying the runtime monitor schedule without rollback considered first

When in doubt: **pause, ask, document.**

## Appendix C — Reference incidents

| Date | Incident | Severity | Response | Lessons baked in |
|---|---|---|---|---|
| 2026-04-30 | v7.1.0 ZION — Stragglers deploy broke hub buttons + Firestore polluted via Nexus | SEV-1 | Revert (165ab73a) + manual Firestore cleanup | HEUR-029 validator + smoke gate + Rule #10 expansion |
| 2026-05-04 | Phase 3 fusion partial-merge (15 files instead of 263) | SEV-3 (caught pre-deploy) | revert-the-revert on scratch branch + re-merge | Cherry-pick effects on later merges; revert-the-revert technique |
