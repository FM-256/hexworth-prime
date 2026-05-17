# Web Flasher Smoke — Operations Guide

**Status:** SHIPPED as a Nexus deploy-gate spoke 2026-05-17 (commit `97512d4a`).
**Source:** `functions/_smoke_web_flasher_cf.js` (assertion harness) + `_tools/nexus/adapters/web-flasher-smoke.js` (Nexus adapter).
**Runs:** every `nexus full` (which is part of every `./deploy.sh`), plus the bc1 daily 07:00 UTC cron.
**Coverage:** 38 assertions across Cloud Functions + Firestore rules for the Web Flasher backend.

---

## What it tests

End-to-end behavioral verification of every backend the Web Flasher touches, against production Firestore. Two assertion categories with different severity weight:

| Category | Severity on fail | What it covers | Why this severity |
|---|---|---|---|
| `rules` | **CRITICAL** | Firestore rule access-control: owner can read their own `c2_devices` / `c2_pairing_codes` / `student_pairing_state`; non-owner gets HTTP 403 on the same docs; non-owner blocked from `c2DecommissionDevice` | Access-control regression = data exposure. Block the deploy. |
| `cf-behavioral` | **HIGH** | CF logic: code mint shape + owner threading; active-code gate; rate-limit gate; `c2RegisterWithCode` ownership threading + in-tx state clear; `c2DecommissionDevice` owner success + doc deletion; `c2Dispatch` admin gate rejecting non-admins | Functional regression OR transient network flake. Surface in gate output without auto-blocking. |

The complete assertion list lives in `functions/_smoke_web_flasher_cf.js` — read the source for the canonical truth.

---

## How it runs

### Inside the deploy pipeline (automatic)

```
./deploy.sh
  └─> nexus full
        └─> [step 3a] warm-up: await adapter.prepare()
              └─> runSmoke() — creates anonymous test users, exercises CFs,
                              cleans up. ~10-17s.
        └─> [step 3] sync all spokes (memoized result, no second run)
        └─> [step 5] gate poll (includes web-flasher-smoke)
        └─> findings with severity:'critical' → blocking
```

The smoke happens in the **warm-up** phase that `nexus.js` runs before its synchronous steps. The result is memoized for 60s so the same `nexus full` invocation doesn't double-run.

### Manually (operator)

```bash
# Run the smoke directly, pretty output, exit 0 on all-pass:
cd functions
GOOGLE_CLOUD_QUOTA_PROJECT=hexworth-prime node _smoke_web_flasher_cf.js

# Run via the Nexus spoke (uses the memoized 60s result if recent):
node _tools/nexus/nexus.js web-flasher-smoke
node _tools/nexus/nexus.js wfs            # alias

# JSON output (machine-readable):
node _tools/nexus/nexus.js wfs --json
```

### Disabling (legitimate use cases only)

```bash
NEXUS_SMOKE_DISABLED=1 ./deploy.sh
NEXUS_SMOKE_DISABLED=1 node _tools/nexus/nexus.js full
```

**When to set `NEXUS_SMOKE_DISABLED=1`:**

| Situation | Disable? |
|---|---|
| Known Identity Toolkit outage (Google Cloud Status page reports incident) | Yes |
| Smoke is flaking for a clear external reason and you need to ship an unrelated change | Yes (document why in the deploy commit message) |
| Smoke is reporting a real CRITICAL failure | **NO** — fix the failure or roll back |
| Smoke is reporting a real HIGH failure you don't want to fix right now | **NO** — investigate first |
| It's slow | **NO** — 10s isn't slow enough to skip a deploy gate |

The off-switch exists for outages, not for ignoring failures.

---

## Reading a smoke failure

### CRITICAL (rules category)

Example output:
```
[rules] non-owner BLOCKED from c2_devices (403) — got 200
```

**What it means:** A second student's auth token was able to read another student's device document via the Firestore REST API. The rule `c2_devices.read = isAdmin() || resource.data.ownerUid == request.auth.uid` is broken or was reverted.

**First steps:**
1. Read the actual rule in `firestore.rules` at the relevant line range
2. Compare against the last green deploy (`git log -p firestore.rules`)
3. If a recent rules change is the cause, revert + re-deploy
4. If the rule is unchanged, suspect Firestore's rules cache OR a config drift between code and the deployed rules; re-deploy rules: `_tools/eduscan/smoke/deploy.sh --only firestore:rules`

**Don't ship through it.** Rules failures are access-control regressions; if a smoke says non-owner can read, every student in the system has the same exposure until it's fixed.

### HIGH (cf-behavioral category)

Example output:
```
[cf-behavioral] HTTP 201 on register — got 500 {"error":"Registration failed."}
```

**What it means:** The `/c2RegisterWithCode` HTTP endpoint returned 500 when the smoke tried to register a test device. Could be:
- A code regression in `functions/index.js` (functions deploy went bad)
- A Firestore transaction abort (rare; would be in Cloud Logging)
- A change in the rate-limit / state-clear logic (more recent culprit)
- An Identity Toolkit / network flake (re-run the smoke to confirm)

**First steps:**
1. Re-run the smoke manually (`node functions/_smoke_web_flasher_cf.js`). If it passes, it was likely transient.
2. If persistent, check Cloud Logging for errors during the smoke window: filter on `resource.labels.function_name = c2RegisterWithCode` with severity ≥ ERROR.
3. Inspect the diff of `functions/index.js` against the last green deploy.

HIGH failures don't auto-block the deploy gate (the gate `failOn: ['critical']`), but they show up prominently in the gate output. Don't ignore them.

---

## Failure-mode triage table

Specific assertion labels → most likely root cause. When the smoke fails, scan this table first.

| Failing assertion | Most likely root cause |
|---|---|
| `signUp returned ID token` | Identity Toolkit REST quota / Web API key restriction / network. Almost always transient — re-run. If persistent, check API key referrer config. |
| `HTTP 200 on first mint` (got 4xx) | `c2RequestStudentPairingCode` rejected an auth'd caller. Either the rate-limit logic is broken (rejecting clean callers) or the auth token validation regressed. Inspect Cloud Logging. |
| `HTTP 200 on first mint` (got 5xx) | CF crash. Cloud Logging will show the stack trace. Recent edit to `functions/index.js` is the prime suspect. |
| `code shape HEX-PAIR-XXXXXX` | `generatePairingCodeString()` regression or alphabet change. Read the CF. |
| `code.ownerUid == TEST_UID` | Ownership threading regression in `c2RequestStudentPairingCode`. The transactional write isn't setting `ownerUid` correctly. |
| `code.issuedTo == 'student'` | Same — `issuedTo` field missing from the write. |
| `state.activeCodeId == code` | `student_pairing_state` write inside the mint tx isn't persisting `activeCodeId`. |
| `HTTP 4xx on second mint (active code outstanding)` | Active-code gate broken — second simultaneous mint is succeeding when it shouldn't. Most likely culprit: the transaction wrapping the rate-limit check was unwrapped (regression to the v1 bug Nancy caught). |
| `HTTP 201 on register` (got 4xx) | `c2RegisterWithCode` validation regression. Check the request payload assertions in the CF. |
| `HTTP 201 on register` (got 5xx) | CF crash. Cloud Logging. |
| `device.ownerUid == TEST_UID` | `c2RegisterWithCode` not copying `ownerUid` from code doc onto device doc. Critical for the "My Devices" feature — devices stop being student-readable. |
| `state.activeCodeId cleared after redeem` | The in-tx state-clear logic in `c2RegisterWithCode` (the Nancy-caught hoisted read) was reverted. |
| `last24h has 3 entries` | Rate-limit `last24h` array isn't being appended on each successful mint. |
| `HTTP 4xx on 4th mint (rate limit)` | Rate-limit gate broken — 4th mint succeeds when it shouldn't. |
| `owner reads own c2_devices doc (200)` | **CRITICAL.** Firestore rule for `c2_devices` owner-read regressed. Owner can no longer see their own device — feature breaks for every student. |
| `owner reads own c2_pairing_codes doc (200)` | **CRITICAL.** Same shape — student can't see their own code expiry status. |
| `owner reads own student_pairing_state (200)` | **CRITICAL.** Student can't query their own rate-limit state. My Devices "active code" panel breaks. |
| `non-owner BLOCKED from c2_devices (403)` | **CRITICAL — DATA EXPOSURE.** Any student can read any other student's device. Fix immediately or roll back. |
| `non-owner BLOCKED from c2_pairing_codes (403)` | **CRITICAL — DATA EXPOSURE.** Pairing codes (including their `usedAt` timing) leak across students. |
| `non-owner BLOCKED from student_pairing_state (403)` | **CRITICAL — DATA EXPOSURE.** Student rate-limit state leaks across students. |
| `non-admin BLOCKED from c2Dispatch (permission-denied)` | Admin gate on `c2Dispatch` broken. Any signed-in user can dispatch commands to any device. |
| `non-owner BLOCKED from c2DecommissionDevice (permission-denied)` | **CRITICAL.** Any signed-in user can decommission anyone else's device. |
| `device doc survives non-owner decommission attempt` | Same issue — the non-owner attempt actually deleted the doc. Either ownership check OR rule deploy failed. |
| `owner decommissions own device (200)` | `c2DecommissionDevice` rejecting valid owner calls. Auth token / ownerUid mismatch. |
| `device doc deleted after owner decommission` | Successful CF response but the delete didn't take. Could be a Firestore consistency issue or the CF code is returning success without actually deleting. |
| `smoke setup did not throw` | Smoke crashed before any real assertion. Read the detail field; usually a network error or admin-SDK config issue. |
| `smoke runner crashed` | The adapter caught a thrown error from `runSmoke()`. Cloud Logging on Firebase Functions side + the detail field have the trace. |

---

## How `transient: true` keeps smoke out of triage

Every finding the spoke emits carries `transient: true`. `_tools/nexus/publish.js` honors this in two places:

1. **Group propagation** (line ~285): a finding group inherits `transient` via AND-aggregation. A group is transient only if ALL its findings are transient. This prevents a mixed-source group from accidentally hiding a non-transient finding.

2. **Triage skip** (line ~315): when iterating groups for triage-queue creation, transient groups get a `continue` before the queue write. They don't enter `_triage_queue`, don't auto-create sprint items.

**Critically:** the transient flag does NOT affect the deploy gate. `runGate()` in `hub.js` iterates findings directly via `adapter.getFindings()`, counts by severity, blocks on critical. A transient CRITICAL still blocks. A transient HIGH still surfaces in the gate counts. The flag only suppresses long-lived sprint-item creation.

This is the right semantics for a smoke test: a transient flake shouldn't haunt the triage queue for weeks, but a real regression detected by smoke should still block a deploy until fixed.

---

## Cleanup behavior

Every smoke run creates ephemeral test users + Firestore docs against production. The try/finally block at the end of `runSmoke()` deletes:

- Both anonymous Firebase Auth users (primary + secondary "non-owner")
- All minted pairing codes (`c2_pairing_codes/{code}`)
- All registered devices (`c2_devices/{deviceId}`)
- The student rate-limit state doc (`student_pairing_state/{uid}`)

A crash mid-run leaves orphans. Two characteristics make this safe-by-design:
- **Each run uses fresh anonymous-signUp uids.** Two runs never collide on uid space. Orphans from a prior crash don't break subsequent runs.
- **The orphans don't grow forever in a load-bearing way.** Anonymous auth users and a few orphan Firestore docs cost effectively nothing.

If residue ever becomes operationally noticeable (e.g. inflated anonymous user count in the Firebase console), the operator can run a one-off cleanup script. The proper long-term fix is a scheduled CF that sweeps orphans older than 24h with the smoke marker prefix — flagged as a future improvement in `_planning/web-flasher-upgrades-2026-05-17.md`.

---

## Architecture references

| File | Purpose |
|---|---|
| `functions/_smoke_web_flasher_cf.js` | Assertion harness. Exports `runSmoke({verbose})` returning structured findings. CLI mode at the bottom. |
| `_tools/nexus/adapters/web-flasher-smoke.js` | Nexus spoke adapter. Implements `prepare()`, `getStatus()`, `getFindings()`, and the command handler. 60s result memoization. `NEXUS_SMOKE_DISABLED=1` off-switch. |
| `_tools/nexus/publish.js` (~line 285, ~line 315) | Transient propagation + triage skip. |
| `_tools/nexus/nexus.js` (cmdFull warm-up loop) | Calls `adapter.prepare()` in parallel for every spoke that defines it, before the synchronous sync/gate steps. |
| `_tools/nexus/nexus.config.json` | Registers the spoke + lists it in `gate.sources` so the deploy gate actually polls it. |

---

## Related docs

- [`_docs/features/WEB_FLASHER.md`](../features/WEB_FLASHER.md) — feature overview
- [`_docs/operations/web-flasher-runbook.md`](web-flasher-runbook.md) — student-side failure-mode triage (hardware + browser)
- [`_docs/operations/web-flasher-hardware-smoke-2026-05-17.md`](web-flasher-hardware-smoke-2026-05-17.md) — operator-driven hardware smoke test plan
- [`_app/signal/firmware-bins/README.md`](../../_app/signal/firmware-bins/README.md) — manifest schema (related: FIRM-001 validator)
- Confluence KBA #12 v2 — Hexworth Web Flasher (operator-facing)

---

## Known limitations + future improvements

| Item | Status |
|---|---|
| Runs against production Firestore (real auth users, real CF writes) | Accept; revisit when fleet grows. Properly fixed by a second Firebase project for the smoke. |
| 38 assertions share two rule codes (`SMOKE-WF-RULES`, `SMOKE-WF-BEHAV`) | Acceptable — `transient: true` skips triage so grouping doesn't matter for queue tracking. If gate-side per-assertion tracking ever becomes important, split rule codes per assertion. |
| No per-run history dashboard | Deferred per Nancy review. Don't write what nothing reads. Wire up when an admin surface materializes. |
| No automated cleanup CF for crashed-run residue | Deferred. Real long-term hygiene improvement; ship when residue becomes operationally visible. |
| Wall-clock SLO not enforced | Currently the smoke takes ~10-17s. If it ever exceeds ~30s, that's a CF perf regression worth flagging. Add a duration check as a separate cf-behavioral assertion when noticed. |

---

## When to update this doc

- Adding a new assertion → add a row to the failure-mode triage table.
- Changing severity assignment → update the "What it tests" table.
- Changing the off-switch behavior → update the "Disabling" section.
- Adding a new rule code → update "Architecture references" + the grouping note.
- Refactoring the spoke adapter → update the "How it runs" section.

The doc is the team's interface to the smoke. Out-of-date doc beats no doc, but in-sync doc is the goal.
