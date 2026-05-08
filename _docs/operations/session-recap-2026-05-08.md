# Session Recap — 2026-05-08

## Headline

Closed all CRITICAL and HIGH eduscan findings (gate FAIL → PASS), shipped 226 cumulative grading-bug corrections via Karl Mode-2 (across 4 commits), discovered + scoped a 95-quiz platform-wide client-grading violation as new sprint QC-57, and pre-staged a single-command atomic-deploy bundling 7 production writes pending user authorization.

## Production-write status

**Pending user authorization** — single command:

```
cd functions && bash atomic-deploy-2026-05-08.sh
```

Covers in order (all dry-run gates currently PASS):

| # | Item | Sprint |
|---|------|--------|
| 1 | Reseed `clh-022` answers `[0,1,2,3,0]` | QC-53 POC |
| 2 | Reseed `clh-023` answers `[2,0,1,3,0]` | QC-53 POC |
| 3 | Reseed `clh-027` answers `[1,3,0,2,0]` | QC-53 POC |
| 4 | Reseed `security` answers 25-zeros (Discipline A) | QC-55 |
| 5 | Reseed `ms900-ch02-quiz` from static | Task #67 SAFE-SUBSET |
| 6 | Reseed `pc-ard-01-quiz` from static | Task #67 SAFE-SUBSET |
| 7 | Reseed `shield-pis-final` from static | Task #67 SAFE-SUBSET |
| → | `verify-quiz-keys.js` for all 7 | gate |
| → | `./deploy.sh` (pushes today's HTML changes including PULSE-1 + PARSE-SUSPECT fixes) | hosting |

Each seed has a drift-gate pre-flight that ABORTS if static doesn't match Karl-verified expected. Branch gate enforces `master` only.

`--dry` flag runs all gates without writes.

## Critical-class bugs resolved

**Both critical findings cleared at the data layer (no validator changes):**

- `az104-ch06-quiz` — Q11 explanation contained the literal substring `the question: "..."` which tripped eduscan's question-counter regex (validator counted 16, file actually has 15). Reworded explanation to remove the substring; meaning preserved (commit `400dcf17`).
- `security` — HTML had 25 questions, static had 15 (Q16-Q25 silently graded against `undefined`). Karl Mode-2 audit confirmed Discipline A (place-at-zero + render-shuffle); static expanded to 25-zeros (commit `eb9f4718`). Q1 spot-check verified.

## Karl Mode-2 audits this session

| Audit | Scope | MISMATCH | Artifact |
|-------|-------|----------|----------|
| Batch 1 (QC-51) | initial pc-esp + AMBIGUOUS sweep | 8 / 26 | already in audit folder |
| Batch 2 (QC-51) | pv-mp + pv-m + pv-f | 41 / 116 | already in audit folder |
| Batch 3 (QC-51) | pv-b + pv-e | 31 / 53 | `karl-static-verify-AMBIGUOUS-RESOLUTION-batch3.md` |
| pv-f MATCH spot-check (Nancy flag) | 20 MATCH bucket items | 0 (all verified) | `karl-pvf-match-spot-check-2026-05-08.md` |
| QC-53 POC rebalance | clh-022/023/027 (15 questions) | 0 (ALL-PASS) | `karl-clh-poc-rebalance-2026-05-08.md` |
| QC-55 security | 25 questions Q1-Q25 | n/a — Discipline A all-zeros canonical | `karl-security-25q-audit-2026-05-08.md` |

**Cumulative QC-51 (Karl + bulk patch): 226 grading-bug corrections, 0 position-overlap reconciled.**  
Reconciliation: `reconciliation-quiz-keys-2026-05-08.txt`.

## New sprints filed

| ID | Title | Priority |
|----|-------|----------|
| QC-53 | Platform-wide Rule 6 rebalance — 75 quizzes | medium |
| QC-54 | A+ Core 1 prep-rounds client-grading + orphan static | high |
| QC-55 | ai-security silent partial-grading bug Q16-Q25 | high (in-progress) |
| QC-56 | Divergent weekly client-grading (eth-w + cse-w, 6) | high |
| QC-57 | Platform-wide client-grading — **95 quizzes / 15 tracks** | **critical** |
| QC-58 | Lab template dual-h1 cleanup (SEM-002, 34 files) | low |
| QC-59 | **PFI 33/39 hub modules missing from ContentCatalog (active COP1034C)** | **critical** |
| (Task #75) | Promote PARSE-SUSPECT to EduScan QUIZ-010 | DONE this session |
| (Task #76) | Sync-helper HTML resolver — 277 false positives | new |

QC-57 is the platform-wide superset; QC-54 and QC-56 are slices. Inventory artifact: `_docs/operations/qc-57-client-grading-inventory.md` (174 lines, 95 quizzes grouped by 15 tracks).

**QC-59 finding (added late session):** Hub-vs-catalog audit ran across 8 house hubs. Python for IT (COP1034C, code house) has **33 of 39 hub modules missing** from ContentCatalog — broken progress tracking, achievements, search, and tenant assignment for 85% of an active live course. Only 6 modules in catalog: pfi-setup-guide, pfi-op-01..04, pfi-w4-final-exam. All Week 1-4 instructional content, sandboxes, quizzes, projects are catalog-orphaned. Worst-affected hub by ~10x vs the next gappiest (PIS at 21/40 prefix-mismatched, separate case in QC-47).

QC-47 PIS gap is a NAMING MISMATCH (catalog uses `shield-pis-w*-` prefix, hub uses bare `pis-w*-`), not missing entries. Direction needs operator decision per `shield-pis-w*-quiz` static-key consistency tradeoff.

## EduScan / Nexus state

- **CRITICAL: 0** (was 2)
- **HIGH: 0** (was 2)
- MEDIUM: 980 (mostly CAT-007 dual-naming = SYM-17 known, QUIZ-008 distribution skew = QC-53 territory)
- Self-heal pipeline: working (auto-resolved 4 triage items on this session's nexus runs)
- bc1 cron: PASS (07:00:59 UTC fired correctly, gatePass=true)

## QUIZ-010 validator added

Per Task #75: PARSE-SUSPECT detection promoted to eduscan as QUIZ-010 (HIGH severity). Catches the over-escaped-apostrophe class (`\\'` instead of `\'`) and any other JS-parse failure in `questions: [...]` blocks. 9 instances caught and fixed this session (3 pv-e earlier + 6 Network+).

## Network+ recovery

Six Network+ quizzes (switching, tcpip, wireless, wan-cloud, troubleshooting, operations) were UNLOADABLE for ~12 days due to over-escaped apostrophes. Mechanical fix (`\\'` → `\'`) applied with self-validating parse-after gate. Network+ cert prep track restored (commit `1d48ace6`).

## Other meaningful changes

- **clh-027 explanations authored** (5/5) — unblocks Karl Mode-2 reseed gate (commit `d5535798`)
- **az900-ch03 reclassified** Discipline B with intentional cycling (was wrongly tagged Discipline A in memory; corrected)
- **Rule 6 allowlist extended** for az900-ch03-quiz (commit `7e9902fb`)
- **Quiz authoring rules formalized** at `_docs/architecture/quiz-authoring-rules.md` (8 canonical rules including Rule 6 distribution balance)
- **Memory file `project_placeholder_keys_audit.md` corrected** with Karl batch 3 progress + az900-ch03 reclassification

## Remaining for next session

| Item | Status | Blocking |
|------|--------|----------|
| Atomic deploy (7 writes + hosting) | pre-staged, dry-run PASS | user authorization |
| QC-57 sub-batch migration plan | inventory ready | sequencing decision (recommend: python-for-it 3 quizzes first as POC for active COP1034C track) |
| QC-54 A+ Core 1 prep-rounds refactor | scoped | sequencing |
| QC-56 eth/cse weekly migration | answer arrays pre-extracted | sequencing |
| Solutions Manual platform-wide (#10) | 56 remaining | per-batch user direction |
| QC-50 PIS distribution rebalance | open | sequencing |
| QC-52 dashboard tenant-mode escape hatch | Nancy PAUSE | design call |

## How to verify state without running

```bash
git log --oneline --since="2026-05-08 00:00" | head -45
node functions/seed-clh-poc-rebalance-2026-05-08.js --dry-run
node functions/seed-security-25q-2026-05-08.js --dry-run
node functions/seed-placeholder-fix-2026-05-08.js --safe-subset --dry-run
bash functions/atomic-deploy-2026-05-08.sh --dry
```

All should report PASS / DRY RUN clean.
