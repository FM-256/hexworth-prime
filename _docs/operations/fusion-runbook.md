# Phase 3 Fusion Runbook

> Stragglers branch → master merge, gated through the safety net built 2026-05-03/04.
> This is the v7.1.0 ZION redo — but with HEUR-029, XREF-001, smoke gate, runtime monitor, and the gated `deploy.sh` chain catching every failure mode that wasn't caught last time.

## Pre-flight checklist

Verify these BEFORE starting:

```bash
cd /home/eq/ai-content/hexworth-prime

# On master, clean
git checkout master
git status -s        # must be empty
git pull --ff-only origin master

# Stragglers fully pushed
git fetch origin Stragglers
[ "$(git rev-parse Stragglers)" = "$(git rev-parse origin/Stragglers)" ] && echo "Stragglers in sync"

# Safety net working on master
node _tools/eduscan/tests/run.js | tail -1   # expect: 58/58 passed
node _tools/eduscan/smoke/run.js | tail -3   # expect: SMOKE GATE: PASS

# Runtime monitor still healthy (most recent Cloud Run run)
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor" AND jsonPayload.allPassed=true' --limit 1 --format="value(timestamp,jsonPayload.passed,jsonPayload.failed)"
```

If any of those fail, STOP and investigate — do not start fusion.

## Step 1 — Merge Stragglers into master

```bash
cd /home/eq/ai-content/hexworth-prime
git checkout master
git merge --no-ff Stragglers
```

Expected output:
```
Auto-merging _app/houses/cloud/modules/wsa/index.html
Auto-merging _app/houses/cloud/modules/wsa/progress.js
Auto-merging _tools/eduscan/tests/run.js
CONFLICT (content): Merge conflict in _tools/eduscan/tests/run.js
Auto-merging firebase.json
CONFLICT (content): Merge conflict in firebase.json
Automatic merge failed; fix conflicts and then commit the result.
```

**Two conflicts expected.** No others. If more appear, STOP — Stragglers state may have changed since this runbook was written. Investigate before resolving.

## Step 2 — Resolve `firebase.json`

The conflict is around lines 99-110. Master HEAD has nothing in the conflict zone (it had the `redirects` block reverted in `165ab73a`). Stragglers has the redirect block we want.

Keep the Stragglers section. Remove all conflict markers. Final state:

```json
      }
    ],
    "redirects": [
      {
        "source": "/forensics/**",
        "destination": "/houses/eye/forensics/:rest*",
        "type": 301
      }
    ]
  }
}
```

(Note: master also added `https://fonts.googleapis.com https://fonts.gstatic.com` to `style-src` earlier; that auto-merged correctly higher up in the file — you should NOT see it as a conflict.)

## Step 3 — Resolve `_tools/eduscan/tests/run.js`

The conflict is on the `KNOWN_XREF_BASELINE` constant. Master has `0` (we tightened it in `1a101dcb`). Stragglers has `1` (cherry-pick of older version).

Keep master's `0`. Final state:

```js
    // Regression gate: baseline is 0 (WSA m20 orphan resolved on master 2026-05-03; on Stragglers 2026-05-04 P2-3).
    // Any new mismatch must either be fixed or this baseline must be raised with justification.
    const KNOWN_XREF_BASELINE = 0;
```

## Step 4 — Verify the merged tree before committing

```bash
# No conflict markers anywhere
grep -rE "^<<<<<<<|^=======$|^>>>>>>>" _app _tools _docs functions firebase.json package.json deploy.sh 2>/dev/null | grep -v "node_modules"
# Must be empty

# Mark the conflicts resolved
git add firebase.json _tools/eduscan/tests/run.js

# Run the full safety net on the merged tree
node _tools/eduscan/tests/run.js     # expect: 58/58 passed
SMOKE_PORT=8780 node _tools/eduscan/smoke/run.js   # expect: 6/6 PASS
```

If either fails, do NOT proceed. Investigate which fixture or target fails. Revert with `git merge --abort` if you need a clean reset.

## Step 5 — Complete the merge commit

```bash
git commit -m "$(cat <<'EOF'
fusion: merge Stragglers into master — v7.1.0 ZION redo with full safety net

Phase 3 fusion. Brings Stragglers content payload onto master with the
safety net (HEUR-029, XREF-001, smoke gate, runtime monitor, gated
deploy.sh, CSPValidator fixes) catching every failure mode that v7.1.0
ZION exhibited.

PHASE 2 PREP (already on Stragglers, now landing):
  - firebase.json :splat → :rest* (forensics 301 redirect)
  - WSA hub data-module attrs realigned with leaf-key writes (Option B)
  - STR-30 PROG-003: 5 web-troubleshooting modules now credit
    independently with migration shim preserving legacy progress

CONTENT PAYLOAD:
  - Forensics relocated _app/forensics/ → _app/houses/eye/forensics/
  - 8 incubator hubs (per house)
  - 3 new curriculum hubs (databases, bash, cmmc)
  - ContentCatalog id canonicalization (suffix removal, tag lowercase)
  - PROG-003 fixes across 65 files (Stragglers' original work)
  - Many small UX + QC fixes

CONFLICTS RESOLVED (per fusion-runbook.md):
  - firebase.json: kept Stragglers' redirects block (master had it reverted)
  - _tools/eduscan/tests/run.js: kept master's stricter XREF baseline=0

VERIFIED ON MERGED TREE (pre-deploy):
  - EduScan suite: 58/58 passing
  - Smoke gate: 6/6 targets passing
  - PROG-003 critical: 0
  - XREF-001: 0 (baseline 0)
  - HUB-001: ≤28 (baseline)
  - TAG: ≤24 (baseline)
  - CSP-001: 0
  - ASGN-001: 0
EOF
)"
```

## Step 6 — Push to origin/master

```bash
git push origin master
```

This is the visible-to-others moment. Once pushed, other contributors see the new master.

## Step 7 — Production deploy via gated chain

```bash
./deploy.sh
```

The chain runs four gates in order. Expected output:

```
[1/4] Branch safety check...
✓ on master

[2/4] Running Nexus deploy gate...
GATE PASSED  No blocking findings.

[3/4] Running real-browser smoke gate...
✓ Landing
✓ Sorting
✓ Dashboard (housed user)
✓ House of Web
✓ House of Forge
✓ WSA Hub (last-incident blast zone)
SMOKE GATE: PASS — deploy may proceed

[4/4] Deploying to Firebase...
✔  Deploy complete!

Deploy complete.
```

If any gate fails, the deploy aborts. Investigate the specific gate failure. The smoke gate failures will print the exact target and JS error — fix the underlying code, then re-run `./deploy.sh`.

## Step 8 — Post-deploy verification

```bash
# Wait ~15 sec for CDN to update, then probe live state
curl -sI https://hexworth.com/dashboard.html | head -1   # expect: HTTP/2 200

# Check the Network+ section onclick now exists in production
curl -sf "https://hexworth.com/houses/web/index.html?v=$(date +%s)" | grep -c 'onclick="window.location.href'
# Expect: 16+

# Check WSA hub uses correct data-module attrs
curl -sf 'https://hexworth.com/houses/cloud/modules/wsa/index.html' | grep -oE 'data-module="m0[1-3]"' | head -3
# Expect: m01, m02, m03 (the leaf-key-aligned values)

# Force a runtime monitor execution
gcloud scheduler jobs run runtime-monitor-15min --location us-central1
sleep 60
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor" AND jsonPayload.allPassed=true' --limit 1 --format="value(timestamp,jsonPayload.passed,jsonPayload.failed)"
# Expect a recent timestamp with passed=5, failed=0
```

## Rollback procedure (if production breaks)

If the live site shows critical regressions after the deploy:

```bash
# Revert the merge commit on master
git revert -m 1 HEAD
git push origin master

# Re-deploy the reverted master
./deploy.sh
```

This restores the pre-fusion master state to production. Stragglers branch on origin is preserved — re-attempt fusion after fixing whatever broke.

## What "success" looks like at the end

| Indicator | Expected |
|---|---|
| `git log --oneline master -1` | The fusion commit |
| `node _tools/eduscan/tests/run.js` | 58/58 passing |
| `./deploy.sh` | All 4 gates pass, firebase deploys successfully |
| Runtime monitor next run | 5/5 allPassed=true |
| `curl https://hexworth.com/houses/eye/forensics/index.html` | 200 (forensics relocation lands) |
| Test in real browser as divergent user | Dashboard cards click; STR-30 modules each credit independently |

After all of those: fusion complete. Stragglers branch can be retained on origin for a recovery window then deleted.
