# Safety Net Architecture

> Formal contract for which validator runs at which deployment stage and why.
> Built post-v7.1.0 ZION; refined post-Phase 3 fusion (2026-05-04).

## The four stages

Every code change moves through four checkpoints between developer keyboard and live student:

```
[1] PRE-COMMIT      [2] PRE-MERGE       [3] PRE-DEPLOY      [4] CONTINUOUS
single file         cross-file          full safety net     live production
~1 sec              ~5 sec              ~60 sec             every 15 min
local hook          local script        deploy.sh chain     Cloud Run job
```

Each stage has a specific job. Earlier stages should be FAST and BLOCK only on high-confidence signals (false positives at pre-commit annoy the developer; false positives at pre-deploy abort a deploy). Later stages can be SLOWER, MORE EXPENSIVE, and run rules that need a full picture.

The Hexworth platform serves real students. The architecture's purpose is: **catch every regression before a student sees it, with the highest-leverage validator running at the earliest stage where it can produce a correct verdict.**

---

## Stage 1 — Pre-commit (single-file fast lint)

**Status:** Planned (SYM-5).

**Trigger:** `git commit` via `.git/hooks/pre-commit` or husky.
**Target latency:** under 2 seconds for typical commit (5-10 changed files).
**Blocking:** Yes — fails the commit. `--no-verify` escape hatch with logged reason.

### Validators that belong here

These run their PER-FILE methods (`.validate(file)`) — single-file checks that produce a correct verdict without cross-file context:

| Validator | Codes | Per-file scope notes |
|---|---|---|
| `emoji.js` | EMOJI-001..006 | Full coverage in `.validate()` |
| `naming.js` | NAME-001..004 | Full coverage in `.validate()` |
| `paths.js` | PATH-001..005 | Per-file; **caveat**: a new file's relative refs may point at uncommitted siblings — see "Stage 1 caveats" below |
| `heuristics.js` | HEUR-001..028 | **Partial** — `.validate()` covers single-file rules; HEUR-006 (renderer-link) and HEUR-008 (position-fixed overlay) live in `.validateRendererLinks()` / `.validateFixedPositionOverlays()` global methods, deferred to Stage 2 |
| `html.js` | HTML-001..009 | Full coverage in `.validate()` |
| `js.js` | JS-001..006, SCOPE-001 | Full coverage in `.validate()` |
| `progress-keys.js` (per-file) | PROG-001, PROG-002 | PROG-003 stays in Stage 2 (cross-file via `.validateAll()`) |
| `dependency-check.js` | DEP-001..005 | Full coverage in `.validate()` |
| `engine.js` | ENG-001..003 | Full coverage in `.validate()` |
| `flex-overflow.js` | FLEX-001 | Full coverage in `.validate()` |
| `navigation.js` | NAV-001..004 | Full coverage in `.validate()` |
| `semantic.js` | SEM-001..005 | Full coverage in `.validate()` |
| `ux.js` | UX-001 | Full coverage in `.validate()` |
| `linux-terminal.js` | LT-001..004 | Full coverage in `.validate()` |
| `sandbox.js` | SANDBOX-001..008 | **Partial** — `.validate()` checks single-file iframe patterns; `.validateGlobal()` builds the cross-repo sandbox map, deferred to Stage 2 |
| `turtle.js` | TURTLE-001..002 | Full coverage in `.validate()` |
| `xp-audit.js` | XP-001..004 | **Partial** — `.validate()` covers in-file XP grants; `.validateGlobal()` sweeps `components/` and Cloud Functions, deferred to Stage 2 |
| `content-blob.js` | BLOB-001..004 | Full coverage in `.validate()` |

**Stage 1 caveats** (validators marked "Partial" above, plus edge cases):

- **Partial-only validators** — `heuristics.js`, `sandbox.js`, `xp-audit.js` expose both `.validate()` (per-file) and `.validateGlobal()` (cross-file). Stage 1 runs `.validate()` only. Stage 2 picks up the global half. This means: at pre-commit, you get HEUR-001..005, 007, 009..028 (single-file rules); HEUR-006 and HEUR-008 surface at pre-merge.
- **paths.js disk vs. index** — `.validate()` does `fs.existsSync` against the working tree. For staged-but-uncommitted siblings (e.g., new file A.html references new image B.png that's also staged), the check sees them on disk because `git add` writes to working tree first. For renames staged via `git mv`, the source path may not exist in working tree — pre-commit should pass the resolved post-rename path to the runner.

### What does NOT belong here

- **Cross-file validators** — pre-commit only sees the staged delta, not the whole tree. PROG-003 (cross-file shared keys), HUB-001 (catalog ↔ HTML refs), XREF-001 (catalog ↔ HTML ↔ progress.js coupling) all need the full tree.
- **Headless browser checks** — too slow for pre-commit. Smoke gate stays at pre-deploy.
- **Nexus quality gate** — diagnostic-heavy; targets the full tree state, not a delta.

### Implementation contract

```bash
# .git/hooks/pre-commit (skeleton)
#!/usr/bin/env bash
set -e
# Use null-delimited list to handle filenames with spaces/newlines safely.
mapfile -d '' STAGED < <(git diff --cached --name-only --diff-filter=ACM -z | \
  grep -zE '\.(html|js|css|json)$' || true)
if [ ${#STAGED[@]} -eq 0 ]; then exit 0; fi
node _tools/eduscan/<staged-runner> "${STAGED[@]}"
```

`<staged-runner>` is `_tools/eduscan/staged.js` — a thin standalone runner (~80 lines) that loads ONLY the per-file validators above and runs them against the named files. **Decision (2026-05-04): Option B over modifying the main `cli.js`.** Reasoning:

1. The main `cli.js` is critical infrastructure used by every other developer flow (full scans, archive, drift, fixers). A new flag would mean every cli.js change risks breaking the pre-commit path.
2. A separate runner can be reasoned about in isolation — the file is short enough to fully audit on every change.
3. If Option B proves inadequate, the migration cost to fold it into cli.js is small (move the loader + main loop).
4. The cost of duplication is low because both code paths share the SAME validator classes — only the orchestration is duplicated, not the rules.

Exit code 0 = pass, 1 = block. Profile excludes any global validator (PROG-003, HUB-001, XREF-001, content-catalog, assignment-links, learning-paths, csp, palette, tags) and the `.validateGlobal()` halves of partial validators (heuristics, sandbox, xp-audit).

---

## Stage 2 — Pre-merge (cross-file consistency)

**Status:** Partial — `_tools/eduscan/tests/run.js` covers the suite but is run on demand, not automatically pre-merge.

**Trigger:** Currently manual; should be automated as a `pre-push` hook or PR check.
**Target latency:** Under 30 seconds.
**Blocking:** Yes — fails the merge / push.

### Validators that belong here

Cross-file validators that need the FULL tree but NOT a running browser:

| Validator | Codes | Why pre-merge |
|---|---|---|
| `progress-keys.js` (PROG-003) | PROG-003 | Cross-file shared-key detection — needs all .html files |
| `hub-refs.js` | HUB-001 | Validates hub data-module ↔ ContentCatalog mapping |
| `xref.js` | XREF-001 | Catalog ↔ HTML data-module ↔ progress.js MODULES coupling |
| `content-catalog.js` | CAT-001..007 | Catalog id uniqueness, href resolution, suffix patterns |
| `assignment-links.js` | ASGN-001..006 | Cross-file assignment link integrity |
| `learning-paths.js` | LP-000..007 | Learning-path node + prerequisite consistency |
| `csp.js` | CSP-001 | Single firebase.json CSP audit (technically per-file but lives at root) |
| `palette.js` | PALETTE-001..003 | Cross-file color palette consistency |
| `tags.js` | TAG-001, TAG-002 | Catalog tag casing + coverage analysis |

### Why not pre-commit

Each of these REQUIRES reading every .html file (or the full catalog) to produce a correct verdict. PROG-003 against a single staged file would miss the OTHER file at the shared key. HUB-001 against a single staged hub would miss whether the referenced module IDs exist elsewhere.

### Why not pre-deploy only

Pre-deploy is the LAST gate before live. Catching a HUB-001 break here means the developer's branch sat broken between commit and push. Pre-merge is the right place: branch is integration-ready or it isn't.

---

## Stage 3 — Pre-deploy (smoke gate + Nexus)

**Status:** Active — `./deploy.sh` chain.

**Trigger:** `./deploy.sh` (the only sanctioned production deploy path).
**Target latency:** Under 2 minutes.
**Blocking:** Yes — aborts the deploy.

### The four-gate chain

```
[1/4] Branch safety check       enforce master-only deploys
[2/4] Nexus diagnostic gate     full quality scan (no publish)
[3/4] Smoke gate                real-browser navigation of 6 critical paths
[4/4] firebase deploy           ship to hosting + functions + rules
```

### Validators that belong here

| Validator/gate | Why pre-deploy specifically |
|---|---|
| All Stage 2 validators (re-run) | Last chance to catch what slipped through pre-merge |
| `validators/functional/smoke.js` | Real-browser headless navigation — too slow for earlier stages |
| `validators/functional/browser.js` | DOM checks that need a rendered page |
| `_tools/eduscan/smoke/run.js` | The 15-target smoke gate (HEUR-029 detection + dispatch hub + per-course hubs) |
| `nexus.js full --no-publish` | Cross-house diagnostic, orphan detection, content-tree integrity |
| **BOX-* cascade** (see table below) | 21 validators for CTF-engine box configs — too cross-file for pre-commit |
| `firmware-manifest-audit.js` (FIRM-001) | C2-device firmware manifest schema check |
| `quiz-key-callsite-audit.js` (XREF-002) | Verify quiz HTML calls into a registered key in quiz_keys.json |
| `meta-rule-registry-audit.js` (META-001) | Self-check: every validator file declares a code that's in this doc |
| `meta-orphan-registry-audit.js` (META-002) | Self-check: every code in this doc has a validator file that implements it (inverse of META-001) |
| `meta-smoke-wiring-audit.js` (META-003) | Self-check: every Stage-3 validator file (BOX-*, META-*) is wired into the smoke gate's BOX_VALIDATORS array |

### Smoke gate targets (15 — last updated 2026-05-23)

```
 1. /index.html                                            landing page
 2. /sorting.html                                          divergent vs. housed branch
 3. /dashboard.html                                        housed user dashboard
 4. /houses/web/index.html                                 house index (HEUR-029 zone)
 5. /houses/forge/index.html                               house index
 6. /houses/cloud/modules/wsa/index.html                   WSA hub (last-incident blast zone)
 7. /houses/eye/index.html                                 house index
 8. /houses/script/index.html                              house index
 9. /houses/dark-arts/index.html                           house index
10. /houses/divergent/ethics-it/index.html                 Ethics in IT course hub
11. /houses/shield/infosec/index.html                      PIS course hub
12. /houses/code/python-for-it/index.html                  Python for IT course hub
13. /houses/web/network-plus/index.html                    Network+ course hub
14. /houses/divergent/ethics-it/labs/eth-l14-the-reckoning/index.html  Capstone lab (selector-count assertions)
15. /dispatch/index.html                                   Dispatch hub (manifest + tour + filters)
```

Plus 2 functional smokes (PIS-M2 midterm, PIS-FINAL practical) and the BOX-* cascade — total 38 checkpoints.

Each target gets headless Puppeteer navigation, JS error capture, and assertion-based pass/fail. If any target throws a JS error or fails its assertions, the deploy aborts with the exact error.

### BOX-* cascade — CTF-engine box config validators

Every box config in `_app/{arena,dispatch,houses}/.../config.js` that calls `BoxEngine.init` is scanned by the BOX-* cascade. Each validator has a JSDoc header in its own file with detection algorithm + self-validation cases. Each run writes a JSON report to `_tools/reports/BOX_*.json` and exits non-zero if it finds critical/high.

| Code | File | Severity | Catches |
|---|---|---|---|
| **BOX-001** | `box-flag-registry-audit.js` | CRITICAL | Box has flag IDs but no Firestore `flag_registry/{boxId}` entry — bridge cannot validate submissions. |
| **BOX-002a** | `box-walkthrough-audit.js` | MEDIUM | Box has no walkthrough at `~/hexworth-shared/Solutions/`. |
| **BOX-002b** | `box-walkthrough-flag-audit.js` | MEDIUM | Walkthrough exists but is missing flag-value entries. |
| **BOX-002c** | `box-walkthrough-flag-drift.js` | HIGH | Walkthrough flag values disagree with `box_flags.json`. |
| **BOX-003** | `box-engine-api-lint.js` | HIGH | Config calls a non-existent engine method (typo'd `engine.awardFlg`, `engine.complete()` etc.). |
| **BOX-004** | `box-gate-exclusivity-lint.js` | HIGH | Multi-action gate logic where two scenarios can be satisfied simultaneously (ambiguous flag award). |
| **BOX-005** | `box-scoring-floor-audit.js` | HIGH | Config missing `scoring.minScore` floor — score can go negative. |
| **BOX-006** | `box-state-reset-audit.js` | HIGH | Config has mutable `_state` but no `resetState()` — session bleed across student visits. |
| **BOX-007** | `box-recoverable-action-audit.js` | HIGH | Config levies a penalty (`engine.addScore(-N, ...)`) but has no undo/reset path — soft-lock risk. |
| **BOX-008** | `box-flag-shell-safety.js` | MEDIUM | Flag value contains shell metacharacters that break copy-paste into a terminal. |
| **BOX-009** | `box-decoy-provenance-lint.js` | MEDIUM | Decoy artifacts not surfaced/labeled — students can't tell decoy from real evidence. |
| **BOX-010** | `box-hint-help-level-lint.js` | MEDIUM | Help-Level in hint metadata doesn't match the hint's actual cost/disclosure. |
| **BOX-011** | `box-flag-leak-audit.js` | HIGH (CTF flag) / INFO (narrative) | Flag value appears as literal in client-shipped `config.js`. |
| **BOX-013** | `box-registry-id-dirname.js` | CRITICAL | `config.registryId` does not equal directory basename — Firestore lookup silently fails. |
| **BOX-014** | `box-content-catalog-orphan.js` | HIGH | Box exists on disk but isn't referenced from ContentCatalog or any hub HTML — student can't navigate to it. |
| **BOX-016** | `box-html-bootstrap-audit.js` | CRITICAL / HIGH | index.html missing `config.js`, `BoxEngine.js`, or `FirebaseAuth.js` script imports. |
| **BOX-020** | `box-flag-count-consistency.js` | HIGH | `config.flags[]` declared IDs disagree with `box_flags.json` registered IDs (mechanism-aware — handles request/auto-only/dispatch/config-embedded). |
| **BOX-024** | `box-flag-value-duplicates.js` | HIGH | Two flags in same box share the same normalized value — Mode-2 validateFlag awards the wrong scenario. |
| **BOX-035** | `box-asset-existence-audit.js` | HIGH | Box references `/assets/...` or relative image/audio paths that don't exist on disk. |
| **BOX-037** | `box-localstorage-flag-bypass.js` | HIGH | Config writes flag-capture state to `localStorage` directly, bypassing the server-side `validateFlag` bridge. |
| **BOX-042** | `box-storage-key-uniqueness.js` | CRITICAL (collision) / HIGH (missing) | Two boxes share `storageKey` — progress cross-pollutes between labs. |

### What does NOT belong here

- **Single-file lint** — already caught at pre-commit (cheaper).
- **Authenticated user flows** — current smoke runs anonymous. SYM-14 adds an authenticated probe mode.

---

## Stage 4 — Continuous (runtime monitor)

**Status:** Active — Cloud Run job `runtime-monitor` triggered every 15 min by Cloud Scheduler.

**Trigger:** Cloud Scheduler `runtime-monitor-15min` (cron `*/15 * * * *`).
**Target latency:** N/A (runs out-of-band).
**Blocking:** No — observability only. Failure goes to Cloud Logging.

### What it does

Runs the smoke gate against LIVE PRODUCTION (`https://hexworth.com`) every 15 min. Same 5-6 critical paths, headless Puppeteer, structured JSON to Cloud Logging.

### Why this stage exists

A perfect Stage 3 would catch every regression before deploy. In practice:

1. Stage 3 only sees the deploy moment. Cache invalidation, CDN propagation, third-party CSP edge cases, and time-of-day-dependent bugs can break AFTER deploy passes.
2. Some failures are environment-specific (a Cloud Function cold-start error, a Firestore rule that blocks the test user but allows the operator).
3. Long-running content erosion (a subtle JS error that only triggers after a Firebase Auth token refresh) requires periodic re-check.

The runtime monitor is the safety net's last layer: if production breaks for any reason after deploy, this catches it within ~15 min.

### Tiered alerts (planned, SYM-3)

The runtime monitor currently writes to Cloud Logging only. Failures sit there until someone looks. SYM-3 builds:

- **Pulse dashboard** — passive, always-on visualization of last N runs
- **Push notification** — medium severity (one or two probes failing)
- **Email** — high severity (3+ probes failing or sustained failure across 4+ cycles)

Alert ladders prevent alert fatigue. A single transient failure (CDN blip) shouldn't page anyone; sustained or expanding failure should.

---

## Per-validator stage assignment matrix

The single source of truth — which stage owns each validator:

| Validator | Pre-commit | Pre-merge | Pre-deploy | Continuous |
|---|:-:|:-:|:-:|:-:|
| emoji | X | | (re-run) | |
| naming | X | | (re-run) | |
| paths | X | | (re-run) | |
| heuristics (incl HEUR-029) | X | | (re-run) | |
| html | X | | (re-run) | |
| js | X | | (re-run) | |
| dependency-check | X | | (re-run) | |
| engine | X | | (re-run) | |
| flex-overflow | X | | (re-run) | |
| navigation | X | | (re-run) | |
| semantic | X | | (re-run) | |
| ux | X | | (re-run) | |
| linux-terminal | X | | (re-run) | |
| sandbox | X | | (re-run) | |
| turtle | X | | (re-run) | |
| xp-audit | X | | (re-run) | |
| content-blob | X | | (re-run) | |
| progress-keys (PROG-001/002) | X | | (re-run) | |
| progress-keys (PROG-003) | | X | (re-run) | |
| hub-refs | | X | (re-run) | |
| xref | | X | (re-run) | |
| content-catalog | | X | (re-run) | |
| assignment-links | | X | (re-run) | |
| learning-paths | | X | (re-run) | |
| csp | | X | (re-run) | |
| palette | | X | (re-run) | |
| tags | | X | (re-run) | |
| smoke gate (6 targets) | | | X | X |
| nexus diagnostic | | | X | |
| runtime monitor (5 targets) | | | | X |

---

## Override mechanisms

Each stage has an escape hatch for when the validator is wrong (false positive) or the developer has explicit reason to bypass:

| Stage | Override | When to use |
|---|---|---|
| Pre-commit | `git commit --no-verify` | Validator known false-positive; emergency hotfix |
| Pre-merge | `--force` flag on the runner | Same |
| Pre-deploy | No override — failures must be fixed OR the validator's baseline updated | Production gate; never bypass |
| Continuous | N/A — observability only | N/A |

**Pre-deploy has no override by design.** v7.1.0 ZION shipped despite the developer suspecting issues; a hard gate prevents that. If a validator at pre-deploy fires incorrectly, the FIX is to update its baseline or rule, not bypass the gate.

---

## Baselines

Some validators carry "known-issue baselines" — accepted findings that don't fail the build but new findings would:

| Validator | Current baseline | Tightening goal |
|---|---|---|
| HUB-001 | 28 broken hub data-module refs | 0 (SYM-8) |
| TAG-001 | 23 case-variant tag pairs | 1 (SYM-9) |
| TAG-002 | 1 (the 2564-untagged summary) | 0 (SYM-10) |
| XREF-001 | 0 (tightened post-fusion) | Maintain 0 |
| PROG-003 critical | 0 | Maintain 0 |
| PROG-003 medium | 73 (live as of 2026-05-04 19:18 UTC; was 132 pre-Section-A) | Continue per Option B Sections C/D |

Baselines live in `_tools/eduscan/tests/run.js` as named constants. Every change to a baseline requires a comment explaining why and a sprint item to drive it back to zero.

---

## What this architecture does NOT cover

- **Performance regressions** — no perf budget enforcement. Lighthouse / Web Vitals integration is a future stage.
- **Accessibility regressions** — no axe-core or WCAG auditing in any stage. Future work.
- **Visual regressions** — no screenshot diff. Manual QC continues to cover this.
- **Authenticated user flows** — current smoke is anonymous-user only. SYM-14 adds auth probe.
- **Database migrations** — no schema-version gate before Firestore rule deploys. Manual review continues.

These gaps are known; addressing each is a future sprint item.

---

## Reference

- `_tools/eduscan/` — all validators
- `_tools/eduscan/tests/run.js` — Stage 2 runner (also re-run at Stage 3)
- `_tools/eduscan/smoke/run.js` — Stage 3 smoke gate
- `_tools/runtime-monitor/` — Stage 4 Cloud Run job
- `deploy.sh` — Stage 3 chain, the only sanctioned deploy path
- `_docs/operations/incident-response-playbook.md` — what to do when a stage fails after deploy
- `_docs/operations/fusion-runbook.md` — example of using the architecture for a high-stakes merge
