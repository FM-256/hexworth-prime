# EduScan Safety Net Deployment — 2026-05-03

> Handoff doc. If a session crashes mid-work or you (or another contributor) come back later, read this first to know exactly where things stand and what's next.

## TL;DR

A marathon session built and shipped a multi-layer safety net to prevent another v7.1.0 ZION-class outage:

- Two new EduScan validators (HEUR-029, XREF-001) catch the bug classes that surfaced during the post-v7.1.0 chaos
- 30 new test assertions (24 → 54 in EduScan suite, all passing)
- A pre-deploy headless smoke gate that verifies 6 critical pages render in a real browser before `firebase deploy` proceeds
- A smoke-gated deploy wrapper (`_tools/eduscan/smoke/deploy.sh`) that enforces master-only deploys + smoke pass
- 3 real bugs surfaced by the new validators were fixed and shipped to production

All work is on `master`, all four commits are pushed to `origin/master`, and all _app/ changes are live on hexworth.com as of this doc's date.

---

## Current State (as of 2026-05-03 evening)

### Git
- Branch: `master`
- HEAD: `1a101dcb` (origin/master in sync)
- 4 commits since the v7.1.0 ZION revert (`165ab73a`):
  1. `de755090` — fix(dashboard): add onclick to 16 divergent-mode hub destination cards
  2. `a308fbe9` — feat(eduscan): HEUR-029 + XREF-001 validators, fixture backfill
  3. `47a99917` — feat(eduscan/smoke): pre-deploy headless render gate
  4. `1a101dcb` — fix: close 2 bugs surfaced by HEUR-029 + XREF-001, tighten XREF baseline to 0

### Production
- hexworth.com hosting: live at `1a101dcb`
- Firestore rules / indexes / functions: untouched this session
- Preview channels still up:
  - `dashboard-fix` → https://hexworth-prime--dashboard-fix-pqknvt2n.web.app (expires 2026-05-10)
  - `stragglers-diag` → https://hexworth-prime--stragglers-diag-63kf7zgm.web.app (expires 2026-05-09)

### Test posture
- EduScan: 54/54 passing (`node _tools/eduscan/tests/run.js`)
- Smoke gate: 6/6 targets passing (`node _tools/eduscan/smoke/run.js`)
- HEUR-029 hits across `_app/`: 0 (down from 2 at session start)
- XREF-001 hits across `_app/`: 0 (down from 1 at session start) — baseline locked at 0

### Stragglers branch
- Status: PARKED. Not merged. Not safe to merge as-is.
- Known issues still on it (would be flagged by the new validators):
  - `firebase.json`: redirect uses `:splat` (broken syntax) — should be `:rest*`
  - WSA hub HTML uses renamed `data-module="wsa-module01..wsa-module20-failsafe"` while `progress.js` MODULES still has `'m01'..'m20'` — XREF-001 catches this (47 mismatches snapshotted)

---

## What Was Built — File Map

### New EduScan validators
| File | Purpose | Codes |
|---|---|---|
| `_tools/eduscan/validators/syntax/heuristics.js` (modified) | Added `checkLooksClickableButIsnt()` method, header doc, dispatch | HEUR-029 |
| `_tools/eduscan/validators/syntax/xref.js` (new) | Cross-layer ID coupling between progress.js MODULES and hub data-module attrs | XREF-001 |

### New test fixtures
| File | Triggers |
|---|---|
| `_tools/eduscan/tests/fixtures/dep-issues.html` | DEP-001..005 |
| `_tools/eduscan/tests/fixtures/blob-issues.module.html` | BLOB-001..004 |
| `_tools/eduscan/tests/fixtures/heur-029-issues.html` | HEUR-029 (×2) |

### Smoke gate
| File | Purpose |
|---|---|
| `_tools/eduscan/smoke/run.js` | Headless smoke gate runner. Spins up local Node http server pointed at `_app/`, launches Puppeteer headless, hits 6 critical URLs with localStorage seeding, asserts no JS errors + DOM selector counts |
| `_tools/eduscan/smoke/deploy.sh` | Wrapper script: checks branch is master → runs smoke → forwards args to `firebase deploy`. Exit 1 blocks deploy if any step fails |

### Test runner additions
| File | What was added |
|---|---|
| `_tools/eduscan/tests/run.js` | Imports + instantiations for `DependencyCheckValidator` and `ContentBlobValidator`. New global integration test blocks for CSP, PALETTE, ASGN, XREF, BLOB+DEP cross-validator integration |
| `_tools/eduscan/tests/expectations.js` | New entries: `dep-issues.html`, `blob-issues.module.html`, `heur-029-issues.html` |

### Bug fixes (production-affecting)
| File | Change |
|---|---|
| `_app/houses/web/index.html` | Added `onclick` + `onkeydown` + `tabindex` + `role="link"` to Network+ section (line 136) and CCNA section (line 151). They were styled clickable but had no click handler. |
| `_app/houses/cloud/modules/wsa/progress.js` | Removed `'m20'` from `MODULES` array. `m20` was an orphan key — the m20-failsafe-capstone module writes to `'capstone'`, not `'m20'`. Comment added explaining why. |
| `_app/dashboard.html` | (Earlier in session) added `onclick` to all 16 divergent/explorer-mode mini-house-card destination divs at lines 5945-6024. Mouse clicks were silently dead for divergent users; only keyboard Enter worked. |

---

## How to Use

### Run the EduScan test suite
```bash
node _tools/eduscan/tests/run.js
# Expect: Results: 54/54 passed, 0 failed
```

### Run the smoke gate standalone (verification only, no deploy)
```bash
node _tools/eduscan/smoke/run.js
# Or with a custom port if 8765 is in use:
SMOKE_PORT=8766 node _tools/eduscan/smoke/run.js
# Expect: SMOKE GATE: PASS — deploy may proceed
```

### Smoke-gated deploy (the "do this" command for any future hosting deploy)
```bash
# Replace the bare `firebase deploy --only hosting` with:
_tools/eduscan/smoke/deploy.sh --only hosting

# It will:
# 1. Verify you're on master (block otherwise — preview channels for branches)
# 2. Run the smoke gate
# 3. Only proceed to firebase deploy if both pass
```

### Emergency override (rare — only if smoke gate is wrong)
```bash
SKIP_SMOKE=1 SKIP_SMOKE_REASON="describe why this skip is justified" \
  _tools/eduscan/smoke/deploy.sh --only hosting
# Reason gets printed to stdout for audit trail
```

---

## Key Decisions Made (and Why)

### HEUR-029 severity is `'suspect'`, not `'high'`
Other HEUR rules use `'suspect'` for "needs human review" and `'high'` for "confirmed broken." Even with proximity-based suppression, HEUR-029 can still produce false positives on JS-wired patterns we haven't anticipated. Using `'suspect'` lets it flag without hard-blocking pre-merge gates. Confirmed bugs found this way still get fixed manually.

### HEUR-029 suppression: per-element class/id JS-wiring detection
Initial implementation triggered 100% false positives (Nancy caught it). Refined to:
1. Window-based: `querySelector*('.X')` followed within 500 chars by `.onclick =` or `.addEventListener('click', ...)` → element is JS-wired, suppress
2. Variable-based: `var X = getElementById(id)` paired with `X.onclick = ...` or `X.addEventListener('click', ...)` anywhere in the file → suppress

Result: 16/16 hits on the original dashboard divergent-cards bug, only 2 hits on master (both real bugs, now fixed).

### XREF-001 skips courses whose hub uses no data-module attrs
python-hub and python-engineering hubs render progress via a different mechanism (no `data-module=` pattern). XREF-001 was originally firing on them as false positives (35 hits). Now it only fires when the hub actually uses the data-module pattern — which means the validator only flags genuine coupling drift.

### XREF-001 baseline tightened to 0
Originally set to 1 (the WSA `m20` orphan). Now that we fixed it, baseline is 0, so any new mismatch fails the test. Future renames must update both layers in lockstep or be fixed before merge.

### Smoke gate uses real-browser (Puppeteer headless), not curl
Curl + status-code checks are what we ran post-v7.1.0 — they reported all green while the actual deploy was broken. Real-browser checks catch render-time JS errors and missing DOM elements, which is the failure mode that actually happened.

### Smoke gate filter list is permissive about external services
Aminos chat plugin, Firebase Auth, GitHub release checks, mascot 404s, TripWire educational warnings — all filtered out as ignored noise. They fail constantly in headless without prod credentials or external network access. Filtering them is safe because none of them are render-blockers; they're all optional add-ons.

### Smoke-gated deploy uses soft gate with logged override
Hard-blocking deploys would prevent emergency hotfixes if a flaky test fires at the wrong time. Soft gate (block by default, `SKIP_SMOKE` override with logged reason) is the right balance — most days it prevents bad deploys; emergencies aren't fully blocked, but the skip is auditable.

### EduScan work lives on master, not Stragglers
The safety net is platform infrastructure benefiting all future work. Putting it on master means everyone — including a future Stragglers retry — gets the protection. Putting it on Stragglers would have coupled it to that branch's merge fate. EduScan files are also `gitignored` under `_tools/`, requiring `git add -f`, which prevents accidental deploys (Firebase only deploys `_app/` anyway).

---

## What's Pending / Could Continue Next

### Original strategy plan, status
| # | Item | Status |
|---|---|---|
| 1 | Update EduScan fixtures | ✅ Done (DEP, BLOB fixtures + integration tests for CSP/PALETTE/ASGN/XREF) |
| 2 | New rules HEUR-029, XREF-001 | ✅ Done |
| 3 | Stage rules by deployment phase | ⚠️ Partial — pre-deploy gate built, pre-commit/pre-merge buckets not yet formalized |
| 4 | Pre-deploy headless smoke gate | ✅ Done (`_tools/eduscan/smoke/`) |
| 5 | Cloud Run runtime monitor (continuous live-site sweeping) | ❌ Not started |
| 6 | Tiered alert plumbing (Pulse + push notification + email Cloud Function) | ❌ Not started |

### Stragglers branch decisions still pending
- Cherry-pick HUB-001, TAG-001, TAG-002 validators from Stragglers to master (would expand coverage)
- Decide direction on WSA: full canonicalization (update progress.js + migrate Firestore) OR revert the rename (keep `m01..m20` keys). XREF-001 will catch either resolution; the question is which is right semantically.
- Decide whether Stragglers branch is worth retrying or whether to selectively cherry-pick its content work onto master

### Bugs surfaced post-2026-05-03 (running log — populate as work continues)

**2026-05-04 — Runtime monitor MVP built (`_tools/runtime-monitor/run.js`)**
- Hits 5 critical hexworth.com URLs from a real browser, outputs structured JSON
- First run caught Google Fonts CSP block on `index.html` Landing page (4/5 pass)
- Designed for Cloud Run scheduled job; SB-3 deploy is the open follow-up

**2026-05-04 — CSPValidator over-permissive `default-src` fallback (FIXED)**
- **What:** `isDomainCovered()` always fell back to `default-src` even when the specific directive was present-but-restrictive. Browsers don't fall back when the directive is present.
- **Surfaced by:** Runtime monitor caught Google Fonts CSS being CSP-blocked on live `index.html`. Validator had reported 0 issues because it incorrectly thought `default-src 'self' https:` covered the gap in `style-src 'self' 'unsafe-inline'`.
- **Fixed in:** `_tools/eduscan/validators/syntax/csp.js` — fallback now only happens when the directive is `undefined` (absent from policy).
- **Production fix:** `firebase.json` CSP `style-src` augmented with `https://fonts.googleapis.com https://fonts.gstatic.com`.

**2026-05-04 — CSPValidator `<link>` context detection too broad (TODO)**
- **What:** All `<link>` tags map to `style` context. But `<link rel="preconnect">`, `<link rel="prefetch">`, `<link rel="dns-prefetch">`, `<link rel="preload" as="font">` should map differently (preconnect → connect-src, font preload → font-src, etc.).
- **Why deferred:** Pragmatic fix (adding gstatic.com to style-src) resolved the immediate blocker. Validator improvement is correctness-positive but doesn't unblock anything.
- **Where:** `_tools/eduscan/validators/syntax/csp.js` `scanForExternalDomains()` (the `<link>` regex around line 237).

**2026-05-04 — Link-context detection in CSPValidator (FIXED)**
- **What:** All `<link>` tags were mapped to `style` context regardless of `rel` attribute. Browsers actually apply different directives based on `rel` (preconnect → connect-src, preload as=font → font-src, etc.).
- **Surfaced by:** Today's CSPValidator fix flagged `fonts.gstatic.com` in style-src for a `<link rel="preconnect">` — false positive.
- **Fixed in:** `_tools/eduscan/validators/syntax/csp.js`:
  - `relToContext(rel, as)` helper maps rel/as to correct context (connect/font/script/img/style/manifest/etc.)
  - Multi-rel tokens handled via token-presence check
  - Unknown rel returns `null` → skip emission (no false positive on novel rel values)
  - `getDirectiveForContext` map gained `connect` and `manifest` keys
  - `<link>` tags now scanned file-wide (supports multi-line tags)

**2026-05-04 — Cherry-picked HUB-001 + TAG-001/002 validators from Stragglers**
- **HUB-001:** `_tools/eduscan/validators/syntax/hub-refs.js` — flags hubs that reference module ids not in ContentCatalog. **28 real hits on master** (regression-locked at baseline 28). Each is a hub card that resolves to nothing.
- **TAG-001:** Catches case-variant tags (e.g., `siem`/`SIEM`, `linux`/`Linux`). **23 real hits on master**. Tag filtering is case-sensitive — variants split discovery.
- **TAG-002:** Single summary issue counting tagless modules. **2564 of 2993 modules currently lack tags.**
- Wired into run.js with code-validity + baseline regression assertions.
- Test count: 54 → 58.

**2026-05-04 — Runtime monitor Cloud Run deploy assets ready, then ACTIVATED**
- Assets: `_tools/runtime-monitor/Dockerfile`, `package.json`, `DEPLOY.md` (full gcloud runbook with cost/rollback/Pulse-upgrade)
- **Activated 2026-05-04 19:08Z** with recommended defaults:
  - Cadence: `*/15 * * * *` America/New_York (every 15 min always)
  - Alert sink: Cloud Logging only (Firestore→Pulse upgrade path documented in DEPLOY.md, deferred)
- **Live GCP resources:**
  - Image: `gcr.io/hexworth-prime/runtime-monitor:latest` (digest `sha256:8d438dd7...`)
  - Cloud Run job: `runtime-monitor` (region us-central1, 1 vCPU / 1Gi RAM / 300s timeout)
  - Cloud Scheduler: `runtime-monitor-15min` (us-central1, ENABLED)
- **Verified end-to-end:**
  - Manual `gcloud run jobs execute` from Cloud Run → 5/5 targets pass against hexworth.com
  - Manual `gcloud scheduler jobs run` → triggers Cloud Run job → executes
  - Output structured JSON in Cloud Logging via `gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"'`
- **Inspect status anytime:**
  ```bash
  gcloud run jobs executions list --job=runtime-monitor --region=us-central1 --limit=5
  gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' --limit 3 --format="value(jsonPayload)"
  ```
- **Pause / disable** (zero cost, easy reactivate):
  ```bash
  gcloud scheduler jobs pause runtime-monitor-15min --location us-central1
  ```

**2026-05-04 — `deploy.sh` enhanced with branch check + smoke gate chain**
- Now: branch (master only) → Nexus → smoke → firebase deploy
- Bypass flags: `--force` (skip Nexus only), `--skip-smoke` (skip smoke only), or both
- `npm run deploy` is the canonical entry point — wrapper at `_tools/eduscan/smoke/deploy.sh` stays alive for non-hosting deploys

**2026-05-04 — STR-30 PROG-003 resolved on Stragglers (Option C + migration shim)**
- **What:** 5 web-troubleshooting modules shared one progress key. Only first-completed got XP; other 4 silently failed. Pre-existing on master too — Stragglers' enhanced progress-keys validator caught it as critical.
- **Fix scope:** 5 module HTMLs + ContentCatalog (orphan deleted) + LearningPaths (id + prerequisites) + content-registry (entry + path) + skill-tree (contentId) + network-plus hub HTML (data-module attr) + ModuleProgress.js (new `migrateLegacyKey` function) + tool HTML (calls migrate before complete). 11 changes across 9 files.
- **Why Option C not B:** Allowlisting suppresses the symptom; the bug was actively losing student XP in production. Comprehensive cross-system update aligns all consumers with catalog-canonical IDs. Migration shim preserves any existing single-completion legacy data.
- **Verified:** EduScan critical 1 → 0, suite 58/58, smoke 6/6, ASGN-001 still 0 (LP rename safe).
- **Commit:** Stragglers `66e123a3`.

**2026-05-04 — Phase 2 (Stragglers branch fixes) COMPLETE — fusion-ready**
- **Cherry-picked safety net commits** from master onto Stragglers (8 commits — `a308fbe9`, `47a99917`, `21f8f24f`, `b2b95445`, `4ac8fe2e`, `ba951593`, `a9c90daa`, `a741b4e7`). 0 conflicts. Stragglers now has the full safety net AND the Stragglers content payload.
- **P2-2 firebase.json** `:splat` → `:rest*` (commit `07c15cc6`).
- **P2-3 WSA Option B** — reverted Stragglers' wsa-module-prefixed data-module attrs back to leaf-key-aligned m01..m19/midterm/capstone/gauntlet, removed orphan m20 from progress.js MODULES (commit `07c15cc6`).
- **STR-30 PROG-003 Option C + shim** (commit `66e123a3`, doc `dd4e6972`).
- **Stragglers HEAD**: `dd4e6972`. Pushed to `origin/Stragglers`.
- **Dry-merge to master tested** — 2 mechanical conflicts: `firebase.json` (keep Stragglers' `redirects` block, master discarded it in revert) and `_tools/eduscan/tests/run.js` (keep master's stricter XREF baseline=0). Both have obvious resolutions.
- **Stragglers QC posture**: EduScan 58/58, smoke 6/6, critical 0, XREF-001 0, HUB-001 27 (under master baseline 28), TAG 1 (under master baseline 24), CSP-001 0, ASGN-001 0.

**Phase 3 (fusion) ready when authorized:**
1. Switch to master
2. `git merge --no-ff Stragglers`
3. Resolve 2 known conflicts (resolutions documented above)
4. EduScan + smoke verify on merged tree
5. `./deploy.sh` (branch + Nexus + smoke + firebase deploy gates)
6. Verify with runtime monitor
- Production impact: 263+ files including the STR-30 fix that benefits real students immediately.


### Smoke gate could be expanded later (low priority)
Current 6 targets are blast-radius high. Could add:
- Per-house index pages (currently only web + forge tested)
- WSA module pages (m01..m19)
- Operator landing page
- Arena landing page
- One sample CTF box page
- One sample applet page

Don't expand prematurely — every target adds latency to every deploy. Add only if a regression slips past the current 6.

### Severity tuning if HEUR-029 noise emerges
If new content authors start hitting HEUR-029 false positives on patterns the suppression doesn't catch, add to the file's `quarantine-allowlist.json` (existing mechanism). Don't reduce severity without evidence.

---

## How to Resume After a Crash

If you (or a future agent) come back to this work:

1. **Read this doc first** (`_docs/operations/eduscan-safety-net-2026-05-03.md`).
2. **Verify current state matches what this doc describes:**
   ```bash
   cd /home/eq/ai-content/hexworth-prime
   git branch --show-current      # should be master
   git log --oneline -5           # should show the 4 commits listed in "Current State"
   node _tools/eduscan/tests/run.js   # should show 54/54 passing
   node _tools/eduscan/smoke/run.js   # should show 6/6 passing
   ```
3. **If state has drifted** (newer commits, failing tests), do not blindly continue — investigate what changed first.
4. **For the next work**, the pending items above are the natural roadmap. The Cloud Run runtime monitor (#5) is the most impactful next piece — that closes the loop on "actively scanning like a malware scanner" that was the original goal.

---

## Session Memory References

- Marathon mode protocol: `feedback_marathon_protocol.md` in `~/.claude/projects/-home-eq-ai-content-hexworth-prime/memory/`
- Precision-over-speed rule: enforced via SessionStart hook
- We-do-not-destroy rule: applies to anything risky
- Branch deploy gate (CLAUDE.md Rule #10): firebase deploy is master-only, explicit per-operation authorization required

This doc is the source of truth for the 2026-05-03 marathon session. Update it if you make changes to the safety net.
