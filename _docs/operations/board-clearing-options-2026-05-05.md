# Options to clear the board — corrected after Nancy's review

## State (verified live as of `b90e79d3`)

- **Live EduScan issues**: 8,135 (syntax-only scan)
- **Critical**: 0 · **High**: 29 · **Medium**: 994 · **Warning**: 77 · **Suspect**: 61 · **Low**: 6,584 · **Info**: 390
- **Live PROG-003**: 20 (was 132 at SYM-15 start; -59 fixed via Section A+B + -53 allowlisted = -112)
- **Bulk LOW codes (live)**: LP-007 (2,295), NAME-003 (1,904), SEM-001 (792), BLOB-001 (612), BLOB-004 (551), BLOB-002 (346), PATH-003 (253)
- **Stale-in-Nexus-store**: REG-001 (2,241) and FLOW-001 (1,188) are in `_tools/nexus/findings.json` but NOT in the current EduScan scan — they came from earlier scans / a retired validator and need a Nexus refresh to clear

## Note on stale Nexus data

The Nexus findings store accumulates from multiple scans/spokes and currently has 12,833 findings vs the live EduScan's 8,135. The 4,698-finding gap is mostly stale (REG-001, FLOW-001, older code numbers from previous validator versions). Running `nexus full --publish` would reconcile the store but writes to Firestore (Rule #10 — needs explicit auth).

## A. Deploy current master to production

**What:** `./deploy.sh` to ship the 22 commits since `841e70a3`.

**What's actually in those 22 commits** (verified):
- `_tools/eduscan/validators/*` — 10+ validator-accuracy improvements (no `_app/` impact)
- `_tools/eduscan/config/prog003-allowlist.json` — adds 53 allowlist entries (validator-only)
- `_tools/confluence/*` — Confluence inventory regen tooling (no `_app/` impact)
- `_tools/sprint-master/sprints.json` — sprint backlog updates
- `_docs/operations/*` — ~10 new ops docs
- `deploy.sh` — added Confluence regen step + Tier-1-Minimal smoke targets
- `firebase.json` — `.bak`/`.pyc`/`.backup`/__pycache__ ignore patterns

**Effective production-impact delta** (only files in `_app/` or affecting hosting):
- `firebase.json` ignore rules → ~295 MB stops shipping
- `deploy.sh` change is meta (affects future deploys)
- ZERO `_app/` files modified in this batch

| Pro | Con |
|---|---|
| ~295 MB deploy size reduction kicks in | Bisection difficulty: 22 commits is a wide net IF anything regresses |
| `firebase.json` ignore patterns prevent future bloat | But: zero `_app/` files changed → regression surface is `firebase.json` config only (deploy.sh + ignore patterns), which is much smaller than 22-commit count suggests |
| Closes the deploy gap so master = prod | None significant beyond above |

**Risk:** **LOW** — the regression surface is the firebase.json change (3 new ignore globs) and the deploy.sh post-deploy Confluence step. Worst case: the new `.bak` ignore is too broad and excludes a real file with a `.bak` suffix that isn't a backup; or the Confluence regen step has an issue (already wrapped non-blocking).

## B. SYM-1 — Branch archival

**What:** Move 3 stale branches (`Stragglers`, `feat/stragglers-content`, `fix/dashboard-divergent-card-onclick`) into `refs/archive/*` namespace.

| Pro | Con |
|---|---|
| Cleans `git branch` view (5 → 2) | Cosmetic; no platform impact |
| Non-destructive (refs preserved) | Per Rule #10 needs your auth per branch |
| Free reversibility | Origin branch handling is a separate later auth |

**Risk:** very low.

## C. SYM-3 — Tiered alerts MVP

**What:** Cloud Monitoring log-based alert + email channel for runtime-monitor failures.

| Pro | Con |
|---|---|
| Closes safety-net loop — production failures finally page a human | UI clicks (you do, per Rule #10) |
| Unblocks SYM-4 (Pulse) + SYM-14 (auth probe) | 5 design decisions to make first |
| Free GCP feature, no code | Production has been silent — no urgent failure to alert on |
| Detects post-deploy regressions | Alert tuning needed if thresholds wrong |

**Risk:** low (reversible).

## D. SYM-13 — GCP cost monitor

**What:** Cloud Billing budget alert at $30/month.

| Pro | Con |
|---|---|
| Catches surprise GCP cost spikes | You execute the gcloud commands |
| ~5 min total | Currently ~$5-15/month, ample buffer |
| Pure observability | None |

**Risk:** very low.

## E. SYM-8 — HUB-001 cleanup

**What:** Fix 503 broken hub data-module refs across 27 hubs.

| Pro | Con |
|---|---|
| Closes baselined finding (HUB-001 ≤ 28) | **VERIFIED non-defect**: cards render, links work, files exist |
| Improves search/LP discoverability | ~135 manual decisions; multi-day work |
| Catalog cleanup | Pure cosmetic for student experience |

**Risk:** medium effort, low payoff. **Recommend defer.**

## F. SYM-10 — TAG-002 untagged taxonomy

**What:** Tag 2,563 untagged catalog modules.

| Pro | Con |
|---|---|
| Closes baselined finding | **No tag-based UI feature exists yet** |
| Future tag-filter UI ready | Multi-day taxonomy work |
| | Premature for a feature that doesn't exist |

**Risk:** premature. **Recommend defer until tag UI exists.**

## G. SYM-15 deferred renames (20 collisions)

**What:** Resolve the 20 PROG-003 collisions still live in baseline.

Breakdown:
- 4 'other' bucket bugs: rename + canonical-naming choices (proposed names in deferred doc)
- 16 CLH curriculum mismatches: which CLH-NNN topic is canonical (applet's or module's)?

| Pro | Con |
|---|---|
| Closes PROG-003 entirely (live count: **20 → 0**) | 16 of 20 require curriculum judgment |
| Each fix is small (~50-line edit + cross-credit shim) | Per-pair decisions; multi-session |
| | The 4 'other' have proposed names but you should review |

**Risk:** low per-fix; high decision volume.

## H. HEUR-018 — 398 scroll-trigger fixes

**What:** Replace scroll-listener auto-completion with Mark Complete buttons.

| Pro | Con |
|---|---|
| Real UX bug fix (auto-credit at 80% scroll) | **Changes student behavior** — extra click step |
| 398 medium → 0 | 398 file edits |
| Pedagogically more correct | Could reduce reported completion rates |

**Risk:** high UX disruption. Decision needed: bulk / selective / accept.

## I. NAME-003 (1,904 LOW) — file renames

**What:** Files in `houses/` missing the canonical house prefix; rename each.

| Pro | Con |
|---|---|
| Naming convention compliance | Cascading hrefs: each rename breaks references in catalog, learning paths, hubs |
| Closes the largest LOW bucket | Multi-day cleanup |
| | Files work today; rename is cosmetic |

**Risk:** high regression risk from cascade.

## J. SEM-001 (792) heading hierarchy

**What:** Fix h1→h3 skips and similar.

| Pro | Con |
|---|---|
| Real accessibility improvement | Per-page semantic judgment |
| | 792 individual decisions |
| | Custom heading structures in presentations need review |

**Risk:** medium effort, accessibility benefit.

## K. BLOB-001/004 (1,164) — extract inline styles/scripts

**What:** Move large inline `<style>`/`<script>` blocks to external files.

| Pro | Con |
|---|---|
| Better deploy-cache behavior | Changes deploy structure |
| Smaller per-page payload | 1,164 files to refactor |
| | Risk of breaking inline-dependent code |

**Risk:** high effort.

## L. Refresh stale Nexus findings store

**What:** `node nexus.js full --publish` to reconcile the 12,833-finding store against current 8,135 EduScan reality.

| Pro | Con |
|---|---|
| Drops ~4,698 stale findings (incl. 2,241 REG-001, 1,188 FLOW-001) | Writes to Firestore (Rule #10 — needs explicit auth) |
| Clean baseline for future scans | Net change is informational; no platform behavior impact |
| Removes dead-validator findings | None significant |

**Risk:** low. Write is to `_quality_reports/latest`; reversible by re-running.

## What was NOT included as an option (out of scope)

**Severity reclassification of LP-007 / FLOW-001 / similar to `info`** — even though the validator authors' comments say they're informational, the user's standing rule is "never change the rule to clear the issue." Reclassifying severity to drop count is a category error per that rule. If the user wants to revisit the rule, that's a separate conversation, not a tactical option.

## Agent's suggested sequence (not authoritative — pick freely)

If forced to recommend a path:
1. **Quick wins** (~10 min total): A (deploy), D (gcloud), B (branch archival), L (nexus refresh)
2. **MVP setup** (~10 min UI): C (alerts)
3. **Decision-heavy work**: G (SYM-15), H (HEUR-018)
4. **Deferred until trigger**: E (HUB-001), F (TAG-002)
5. **Deep cleanup** (multi-day): I, J, K
