# Stragglers — Orphan placement, EduScan validators, production-bug remediation

> **Status:** READY FOR REVIEW. Branch passed QC-1..5 + Nancy round-4.
> **Merge type:** fast-forward eligible (master has not moved since branch base — `2404dadf`).
> **Production:** untouched. No firebase deploy, no nexus publish.

## Summary

This branch (32 commits, 258 files) closes the orphan placement task and uses the safe-branch context to harden the platform's QC infrastructure. It also fixes a **live production XP/Firestore suppression bug** found during the work.

| Metric | Before branch | After branch |
|---|---:|---:|
| Strict orphans | 1616 (54% of catalog) | 0 (100% in-hub) |
| Catalog modules | 2996 | 2997 (+1: forensics df-61) |
| Suffix-polluted ids (CAT-006) | 164 | 0 |
| Tag case-variants (TAG-001) | 23 pairs | 0 |
| EduScan validators | 5 (CAT-001..005, PROG-001/002) | 11 (+CAT-006/007, PROG-003, TAG-001/002, HUB-001) |
| New curriculum hubs | — | 3 (script/databases, script/labs/linux/bash, shield/compliance/cmmc) |
| Per-house incubator hubs | — | 8 (489 modules absorbed across 267 sub-clusters) |
| WSA + A+ Core 2 PROG-003 buggy files | 70 (silent XP suppression) | 5 (one cluster deferred for operator decision) |

## What changed

### Forensics relocation (Phase 1-3)
- `_app/forensics/` → `_app/houses/eye/forensics/` (full directory move)
- 3 cert hubs: CHFI, GCFA, GCFE
- `firebase.json` 301 redirect: `/forensics/**` → `/houses/eye/forensics/:splat`
- Hub render-order: cert paths now prominent after hero (was buried)

### Orphan placement
- 4 new EduScan tools: `strict-orphan-scanner`, `orphan-cluster-analyzer`, `placement-recommender`, `incubator-generator`
- `INCUBATION_HUBS.md` design doc + 8 generated incubator hubs
- 3 truly-new curriculum hubs (databases, bash, cmmc)
- Bulk Mech-4 inline-id registration into 25+ existing hubs (~1063 modules)
- Catalog cleanup: 164 suffix-polluted ids fixed, 23 tag case-variants canonicalized
- Forensics catalog: df-61 added (was undeclared file)

### Production bug remediation (PROG-003)
- Discovered via new validator: 5 critical clusters / 70 .module.html files all wrote to the same `ModuleProgress.complete()` key. `isFirstCompletion` uses bare moduleId — only first file's completion pushed XP/badges to Firestore; rest silently suppressed.
- Fixed 4 of 5 (65 files): WSA cloud-guilab/pslab/presentation series + A+ Core 2 chapters.
- Renamed each shared key to module-scoped (e.g., `cloud-guilab` → `cloud-wsa-m04-guilab`, `forge/index` → `forge-aplus-core2-ch17`).
- Deferred 1 (web-troubleshooting 5 files) — STR-30 operator decision pending (intentional vs bug).

### EduScan hardening — 6 new validators (all wired into `npm run scan`)

| Code | Severity | What it catches | Findings |
|---|---|---|---:|
| **PROG-003** | critical (≥5 files), medium (2-4) | Cross-file shared `ModuleProgress.complete()` keys → XP/Firestore suppression | 5 critical / 70 files (4 fixed, 1 deferred) + 132 medium (review) |
| **CAT-006** | medium | Catalog ids ending in `.module/.tool/.lab/.quiz/.applet` — CAT-002 deriveModuleId artifact | 164 → 0 (cleaned) |
| **CAT-007** | medium | Multiple catalog entries pointing to same `(house, href)` | 51 dup pairs / 104 modules (operator decision STR-33) |
| **TAG-001** | medium | Tag case variants (`SIEM` vs `siem`) | 23 → 0 (canonicalized) |
| **TAG-002** | info | Modules with no tags (discoverability gap) | 2564 of 2997 (large content gap, deferred) |
| **HUB-001** | medium / high (20+) | Hub `data-module="X"` refs to nonexistent catalog ids | 503 → 481 (-22 via WSA hub fix; STR-44 for rest) |

### Existing validators improved
- **CAT-002**: skip `_source/` dirs alongside `_archive/` (eliminated 16 false positives in divergent/cybersecurity-policy)
- **LP-006**: prefix-tolerant matching (44 → 22 — eliminated false positives where catalog house-prefixes ids while LP doesn't)
- **LP-003**: severity downgraded `warning` → `info` (132 instances are intentional cross-cert overlaps)
- **PATH-001 etc.**: centralized `_source/_archive` skip in syntax/index.js per-file loop (-170 false positives platform-wide)

## QC results

| Phase | Status |
|---|---|
| QC-1 baseline validators | PASS — 0 strict orphans · all CAT/LP/PROG/TAG/HUB clean except documented STR backlog |
| QC-2 regression | PASS — catalog + LearningPaths load · all hub HTML balanced · incubators retain content |
| QC-3 commit hygiene | PASS — 32 conventional commits · no AI attribution (Rule #1) · no secrets · 0 deletions |
| QC-4 Nancy round-4 | PASS — only blocker (STR-42 SEC audit) resolved: 9/11 intentional CTF, 2/11 false positives, 0 real leaks |
| QC-5 merge-readiness doc | DONE — Confluence Stragglers page (id 6062082) at v7 with full QC record |
| SM-1 master state | PASS — local master == origin/master, no divergence, no in-flight work |
| SM-2 dry-merge | PASS — fast-forward eligible, 0 conflicts |

## Pre-deploy gates (NOT merge blockers — items for the deploy decision after merge)

| Gate | Status | Action before next deploy |
|---|---|---|
| **PROG-003 student progress regression** | DOCUMENTED | See `_docs/operations/stragglers-deploy-notes.md`. WSA + A+ Core 2 students lose phantom completion credit (was bug-induced anyway). Schedule deploy outside class hours OR post heads-up. |
| **STR-40 (16 quizzes failing server grading)** | TOOL BUILT, OPERATOR REVIEW REQUIRED | Pre-existing master defect (commit `6357eb71`), not introduced by this branch. `functions/draft-fw-quiz-keys.js` produces draft; operator reviews 237 flagged questions per Rule #9, then seeds Firestore. |
| **Incubator visual hierarchy** | FIXED on branch | All 8 house indices now have secondary-tier "Incubator" footer link with visual distinction. |
| **Card description truncation** | FIXED on branch | CSS `line-clamp` + ellipsis, applied to all 8 incubator HTMLs + generator. |

## Open STR backlog (45 items — none merge-blocking)

- 1 CRITICAL: STR-40 (16 quizzes — pre-existing, see above)
- 16 HIGH: deploy gates (STR-24/25), original placement-plan items now satisfied via Mech 4 (close at next backlog grooming), STR-43 HEUR eval audit
- 16 MEDIUM: STR-44 HUB-001 (26 hubs), STR-45 HEUR-018 (398 scroll auto-complete), STR-26/29/30 operator decisions
- 12 LOW: STR-32/33 triage, STR-46 SEC validator allowlisting, STR-23 scanner Mech 5

## Test plan

- [ ] Operator reviews this PR description against Confluence page 6062082 (Stragglers branch — v7)
- [ ] STR-24 preview channel deploy: `firebase hosting:channel:deploy stragglers --expires 7d` (per CLAUDE.md Rule #10 requires explicit authorization)
- [ ] Visual smoke test on preview channel:
  - 8 incubator hubs render with footer-link from house indices
  - 3 new curriculum hubs render (script/databases, script/labs/linux/bash, shield/compliance/cmmc)
  - WSA + A+ Core 2 modules complete cleanly (per-module XP not suppressed)
  - Forensics relocation: `/forensics/*` 301 redirects to new path
- [ ] STR-25 merge to master via fast-forward
- [ ] Single firebase deploy from master (after merge, with explicit authorization)
- [ ] Post-deploy: `node nexus.js full` from master to refresh Firestore quality reports

## Files changed

258 total (69 new, 125 modified, 0 deleted). Major categories:
- `_app/houses/**/index.html`: 25+ files for inline-id registration blocks
- `_app/houses/**/incubator/index.html` + README.md: 8 incubators
- `_app/houses/script/modules/databases/`, `_app/houses/script/labs/linux/bash/`, `_app/houses/shield/compliance/cmmc/`: 3 new curriculum hubs
- `_app/houses/cloud/modules/wsa/m**/*.module.html`: 53 files renamed shared progress keys
- `_app/houses/forge/applets/comptia-aplus/core-2/chapters/ch**/index.html`: 12 chapter applets renamed
- `_app/components/ContentCatalog.js`: 164 suffix cleanup + tag canonicalization + df-61 add
- `_tools/eduscan/validators/syntax/`: PROG-003, CAT-006/007, TAG-001/002, HUB-001 + 4 existing validators improved
- `_tools/eduscan/`: 4 new orphan-pipeline tools
- `_tools/sprint-master/sprints.json`: 24 new STR items (STR-1..46 minus a few that were merged)
- `_docs/features/INCUBATION_HUBS.md`: design doc
- `_docs/operations/stragglers-deploy-notes.md`: pre-deploy gate disclosure

## Notes

- **No production deploy from this branch.** Per CLAUDE.md Rule #10 + branch discipline, all deploys gated to operator authorization.
- **Merge mechanic:** fast-forward via `git merge --ff-only Stragglers` from master. No merge commit needed.
- **Post-merge `nexus.js full` is required** to refresh `_quality_reports/latest`, `_triage_queue`, `_auto_fix_queue` in Firestore (per CLAUDE.md Rule #10 nexus full publishes by default).

🤖 No AI attribution per CLAUDE.md Rule #1.
