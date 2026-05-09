# Zero-Issues Roadmap — Hexworth Prime

**Created:** 2026-05-09
**Owner:** Platform team (operator) + autonomous marathon agents
**Goal:** Drain platform-wide audit backlog to zero, with crisp signal differentiation between student-impacting bugs and noise.

---

## Why this doc exists

Today the PULSE health score reads **100**. That number reflects a narrow gate metric, not a "platform is clean" reality. The actual backlog at the time of writing is **9,343 open findings** invisible to PULSE, plus a known set of student-impact bugs that live in a different signal entirely (drift audits, Karl, Bridget — not EduScan).

This doc gives a phased, dependency-aware path to zero, with explicit entry/exit criteria so any agent or operator picking it up at any tick knows what to do next.

**This doc is the source of truth for "what's the plan." Update it as phases complete.**

---

## The PULSE 100% gap

`pulse.html` lines 2176-2180:

```js
score = 100
score -= min(60, criticals × 15)
score -= min(30, round(highs / 8))
if (gate FAIL): score = min(score, 60)
clamp 0..100
```

| What it counts | What it ignores |
|---|---|
| `critical` severity findings | `medium` severity (currently 1,013) |
| `high` severity findings (round-up after /8) | `low` severity (currently 8,330) |
| Deploy gate PASS/FAIL | All findings outside Nexus pipeline (drift audits, Karl, Bridget) |

**A `critical` or `high` is gate-blocking. Below that, findings can pile up indefinitely while PULSE still reads 100.** This is correct as a gate, wrong as a health metric.

**Future work:** add a separate "Hygiene Score" widget that includes medium/low counts so operator sees the full picture. Tracked as Task TBD (file new sprint item when Phase 4 begins).

---

## Snapshot — 2026-05-09

| Channel | Count | Source |
|---|---|---|
| EduScan critical | 0 | `_quality_reports/latest` |
| EduScan high | 0 | `_quality_reports/latest` |
| EduScan medium | 1,013 | `_quality_reports/latest` |
| EduScan low | 8,330 | `_quality_reports/latest` |
| PULSE score | 100 | `pulse.html` |
| Quiz P0 (placeholder Firestore) | 70 | `placeholder-drift-audit.js` |
| Quiz drift (BOTH-REAL-DIVERGENT) | 13 | `_diff-class-triage-2026-05-08.json` |
| Orphan quiz_keys | 88 | `_tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json` |
| Sync-helper BLOCK_HTML_NOT_FOUND | 149 | `node _tools/quiz-sync/sync-helper.js` |
| bc1 cron staleness | 12+ hours | `_quality_reports/scanHeartbeat` (last fire 2026-05-08T18:42) |

Update this section after each scan. The phase definitions below reference these numbers as the baseline.

---

## Phase 1 — Hidden student-impact bugs

**Why first:** these are wrong grades on real students RIGHT NOW. Highest stakes by definition. Lives in drift-audit + Karl signal, NOT in EduScan severity counts.

### 1A — Orphan quiz_keys cleanup
- **Entry:** `functions/cleanup-orphan-keys-2026-05-09.js` exists (✅ untracked draft, dry-run-validated, Nancy-cleared). Run `git status` and confirm the file shows under "Untracked files".
- **Action:** operator runs `node cleanup-orphan-keys-2026-05-09.js --confirm-orphan-deletion-2026-05-09` from master after reviewing dry-run output.
- **Exit:** XREF-002 reports 0 orphans across all 6 categories. Sync-helper BLOCK count drops by ~88 simultaneously. Confirms eth-NN-quiz (15), ala-NN (19), pis-NN-* (21), aplus-core1-* (10), wsa-mNN (19), shield-pis-w[1-4]-quiz (4) all gone.
- **Owner:** OPERATOR. Production-write gated; agents cannot execute.
- **References:** Task #85, `~/hexworth-shared/Solutions/_audit/orphan-quiz-keys-finding-2026-05-08.md`.
- **Note:** Phase 1A also resolves the 13 entries previously categorized as "Sub-class 2 FIRESTORE-NEWER" in `_diff-class-triage-2026-05-08.json` — those eth-NN-quiz IDs ARE the orphan eth-NN-quiz IDs. Tick 26 ground-truth confirmed they have zero HTML callsites and the static all-1s placeholder is irrelevant because no student can reach the orphan quiz to be graded.
- **Risk:** low (orphans have zero callsites by definition; backup file written before delete).

### 1B — P0 Firestore reseed batch
- **Entry:** Phase 1A complete (so the batch ID list isn't polluted by orphan-shape entries) AND Karl-confidence resolved on the 7 all-1s static keys + AMBIGUOUS-lineage entries flagged in Task #83.
- **Action 1:** Dispatch Karl (Mode 2) on the 7 all-1s static keys to confirm authoring intent. Dispatch on the AMBIGUOUS-lineage pv-mp/pv-m/pv-f spot-checks if not already done.
- **Action 2:** Operator updates `functions/seed-p0-batch-2026-05-08.js` (currently untracked, Nancy-blocked) ID list from 68 → 81 by adding the 13 entries that the original audit's naive `(i % 4)` detector missed:
  - 2 entries from period-N audit catch (tick 31): `ms900-ch01-quiz`, `ms900-ch03-quiz`
  - 11 entries from sub-class-1 near-cycling triage (Firestore arrays match `(i % 4)` for first N-2 indices, last 1-2 drift):
    `pc-ard-02-quiz`, `pc-ard-06-quiz`, `pc-ard-07-quiz`, `pc-ard-08-quiz`, `pc-ard-09-quiz`, `pc-ard-10-quiz`, `pc-ard-12-quiz`, `pc-ard-13-quiz`, `pc-ard-15-quiz`, `pc-ard-17-quiz`, `pc-ard-18-quiz`
  - **Note on counter discrepancy:** `placeholder-drift-audit.js` STATIC-NEWER count is 70 (period-N catches ms900s but not near-cycling). The 11 pc-ard entries are still in the audit's DIFFERENT bucket; sub-class-1 triage caught them. Total student-impact P0 = 70 + 11 = **81**.
- **Action 3:** Operator runs the seed script with confirmation flag.
- **Exit:** `placeholder-drift-audit.js` reports 0 STATIC-NEWER findings AND `_diff-class-triage-2026-05-08.json` `subClass1_staticNewerMissed` is empty after re-run.
- **Owner:** Karl (audit) + OPERATOR (script execution). Production-write gated.
- **References:** Task #83.
- **Future detector improvement (Phase 4 candidate):** extend `placeholder-drift-audit.js isPeriodCycling` to be lenient on last 1-2 elements (mirror the triage's `isNearCycling`). Once shipped, the audit's STATIC-NEWER bucket will catch all 81 directly and sub-class-1 will collapse to zero by definition.

### 1C — BOTH-REAL-DIVERGENT triage
- **Entry:** Phase 1B complete OR proceeds in parallel.
- **Action:** Dispatch Karl on each of the 13 quizzes in `Sub-class 3` of `_diff-class-triage-2026-05-08.json`. Karl determines which side (static or Firestore) is correct per quiz.
- **Exit:** All 13 quizzes resolved into either STATIC-NEWER (joins 1B batch) or FIRESTORE-NEWER (static updated locally, no production write).
- **Owner:** Karl (per-quiz audit) + agent (apply resolutions).
- **References:** Task #84.

### 1D — Bridget three-way sync verification
- **Entry:** Phases 1A+1B+1C complete.
- **Action:** Run Bridget across the platform (HTML ↔ Firestore ↔ Confluence VAI). Identify any drift not caught by static-Firestore audit.
- **Exit:** Bridget reports zero three-way mismatches.
- **Owner:** Agent dispatch.
- **References:** `reference_bridget_sync_auditor` memory file.

**Phase 1 exit criteria:** all 88 orphans deleted, P0 reseed shipped, 13 sub-class-3 resolved, Bridget clean. Net effect on PULSE: 0 (unrelated channels). Net effect on student impact: zero hidden grading bugs.

---

## Phase 2 — Drain medium backlog (1,013 items)

**Why second:** mediums hide patterns. After Phase 1, signal is uncluttered enough to triage by issue code.

### 2A — Run XREF-002 + sync-helper post-cleanup
- **Entry:** Phase 1A complete.
- **Action:** Run `nexus quiz-key-callsite` and `node _tools/quiz-sync/sync-helper.js`. Capture the new finding counts.
- **Exit:** Updated baseline numbers in this doc's snapshot.

### 2B — Triage HEUR-025 Strategy 2 (97 mixed FPs)
- **Entry:** any time after Phase 1A (orphan cleanup may resolve some HEUR-025 callsite issues).
- **Action:** Per-instance audit of HEUR-025 Strategy 2 findings. Either fix the underlying bug (write key mismatch) or add to quarantine allowlist with explanation. Per `feedback_severity_demotion_pattern`: do NOT demote severity to silence the validator without ground-truth verification.
- **Exit:** HEUR-025 Strategy 2 count drops to <20 with all remaining entries either fixed or quarantine-justified.
- **Owner:** Agent (per-instance) + Nancy (gate before quarantine).
- **References:** Task #81.

### 2C — Sync-helper FP residuals
- **Entry:** Phase 1A complete (drops sync-helper FPs ~88).
- **Action:** Implement ContentCatalog-based prefix mapping for the 5 collision IDs (`cse-06/07/08`, `aplus-core2`, `aplus-core2-ch19-22`). Note from tick 36 investigation: `cse-06/07/08` actually belong to **divergent house** (cybersecurity-ethics) not shield — `cloud-cse-06.quiz.html` has `moduleId: 'cse-06'`, `shield-cse-06.quiz.html` is unrelated. Resolution: ContentCatalog map confirms the right house. Then mass-rename `ehe-week*-quiz.html` → `ehe-week*-quiz.quiz.html` (find exact count first via `find _app/dark-arts/vault/ehe -name '*-quiz.html'`).
- **Pre-rename safety check (CRITICAL):** before renaming any HTML file, grep ALL hub pages, ContentCatalog entries, and other HTML for the OLD filename. Update all references atomically with the rename. The rename triggers a hosting deploy, so this is operator-gated, not agent-autonomous.
- **Exit:** Sync-helper BLOCK_HTML_NOT_FOUND drops to <30.
- **Owner:** Agent for code/catalog changes (Nancy-reviewed) + OPERATOR for the deploy that publishes the rename.
- **References:** Task #76.

### 2D — Address remaining medium-severity codes
- **Entry:** 2A-2C complete.
- **Action:** Group `_quality_reports/latest` findings by `code` field. Take the largest bucket first. For each: fix root cause, batch-quarantine if FP, or escalate to architecture review (HEUR-008 5 platform-component fixes is one such case).
- **Exit:** Medium count <100.
- **Owner:** Agent + Nancy.

**Phase 2 exit criteria:** medium count <100. PULSE unchanged at 100 but signal vastly cleaner.

---

## Phase 3 — Drain low backlog (8,330 items)

**Why third:** by the time Phase 2 completes, the largest low-severity buckets will be visible. Most low findings are noise that should be quarantined or downgraded en masse.

### 3A — Quarantine-eligible audit pass
- **Entry:** Phase 2 complete.
- **Action:** Inspect the largest low-severity buckets. Likely candidates: HEUR-001 inline-script counts (structural in some pages — already 3 quarantined), HEUR-003 TODO markers (some are content), HEUR-004 console.log (some inside instructional code blocks). Extend `_tools/eduscan/quarantine-allowlist.json` with batch entries.
- **Exit:** 50%+ of low findings either fixed or quarantined.

### 3B — Validator threshold review
- **Entry:** 3A complete.
- **Action:** For validators producing >100 findings of low severity, ask: is the rule too eager? If yes, raise the threshold or convert from per-instance to summary finding. Does NOT mean silencing real bugs — means matching validator sensitivity to actual signal-to-noise.
- **Exit:** No single low-severity validator dominates >20% of remaining count.
- **References:** `feedback_severity_demotion_pattern` (Nancy gate before any threshold change).

### 3C — Documentation/style cleanup
- **Entry:** 3A+3B complete.
- **Action:** Remaining low-severity items are mostly real-but-trivial. Address in opportunistic batches; do not block other phases on this.
- **Exit:** Low count <500 (asymptotic; perfectionism here has diminishing returns).

**Phase 3 exit criteria:** low count <500, no single dominant bucket. PULSE remains at 100.

---

## Phase 4 — Fix the audit pipeline itself

**Why fourth:** the pipeline that runs Phases 1-3 needs to be reliable for sustained progress. Some of these can run in parallel with earlier phases.

### 4A — bc1 cron resurrection (Task #82)
- **Entry:** none (can start anytime).
- **Action:** Operator SSH to bc1, diagnose (likely disk-full per `project_bc1_cron_first_run_check` memory), restart systemd timer or rotate logs.
- **Exit:** `_quality_reports/scanHeartbeat` updates within 24h with `scannedBy=bc1` not `MSI`.
- **Owner:** OPERATOR (SSH access required).
- **References:** Task #82.

### 4B — Nexus dedupKey refactor (Task #86)
- **Entry:** any time.
- **Action:** Update `hub.js dedupKey()` to include `finding.id` so per-category findings (XREF-002, QUIZ-DUP) get distinct timestamps on each cron run. Test with quiz-sync + quiz-key-callsite spokes. Backfill check on `findings.json` to ensure no duplicate-key compaction breaks existing data.
- **Exit:** No same-source-code-file dedup collisions in `findings.json`.
- **Owner:** Agent + Nancy (shared infra).
- **References:** Task #86.

### 4C — XREF-002 v2 refinements
- **Entry:** any time after orphan cleanup completes.
- **Action:** (1) Skip HTML comments in callsite count (current false-LIVE on aplus-core1-ch01/ch12 due to JS doc-comments). (2) Extend scope to include `_app/**/*.js` once verified no bulk-ID registry exists.
- **Exit:** Validated against known-LIVE quizzes; zero new false-orphans introduced.

### 4D — Hygiene Score widget
- **Entry:** Phase 2 complete.
- **Action:** Add a second health ring to `pulse.html` that includes medium + low counts in a logarithmic bucket so operator sees the full picture, not just gate-blocking.
- **Exit:** Operator can see hygiene score at a glance separate from PULSE gate score.

**Phase 4 exit criteria:** all four sub-tasks complete; pipeline is reliable.

---

## Phase 5 — Prevent regression

**Why last:** with 1-4 done, the platform is in clean state. Phase 5 keeps it there.

### 5A — Karl on cron schedule
- **Entry:** Phase 1B complete (so Karl has stable inputs).
- **Action:** Run Karl in batch mode on 5-10 quizzes per week (rotation). New citations get verified, drift surfaces early.
- **Owner:** Cron job + Karl agent.

### 5B — Bridget on cron schedule
- **Entry:** Phase 1D complete.
- **Action:** Daily Bridget run (HTML ↔ Firestore ↔ Confluence). Triage queue auto-resolves on remediation.
- **Owner:** Cron + Bridget.

### 5C — Solutions Manual completion
- **Entry:** Phase 1 complete.
- **Action:** Drain Task #10 (56 quizzes pending Solutions Manual entries) per the platform-wide template at Task #70. Each Solutions page enables Karl audits for that quiz, which feeds 5A.
- **Exit:** Task #10 = 0 pending.
- **References:** Tasks #10, #70.

**Phase 5 exit criteria:** sub-tasks 5A, 5B, 5C running on autonomous schedule.

### Standing process (cross-phase, not gated by Phase 5)

**New validator codes for new bug classes** — when a new pattern of bug emerges during ANY phase (template: tick 31 found period-N cycling blind spot in placeholder detector), file a sprint item, write the validator, ship under Nancy review, document in `_docs/eduscan-codes-reference.md` (TBD). This is a continuous practice that runs alongside all phases, not a Phase 5 deliverable.

---

## Operator-only actions (cannot be done by agents)

Per CLAUDE.md rule #10, these require explicit operator authorization in chat:

| Action | Phase | Script |
|---|---|---|
| Run cleanup-orphan-keys (88 deletes) | 1A | `functions/cleanup-orphan-keys-2026-05-09.js` |
| Run seed-p0-batch (70 reseeds) | 1B | `functions/seed-p0-batch-2026-05-08.js` |
| `firebase deploy --only firestore:*` after schema changes | various | `_tools/eduscan/smoke/deploy.sh --only firestore:rules` |
| `./deploy.sh` for hosting after admin/pulse changes | 4D | `./deploy.sh` |
| SSH to bc1 to restart cron | 4A | manual |

Agents queue these as recommendations; operator executes.

---

## Decision blocks (these need a human call)

These items have no agent-autonomous resolution path:

- **Task #83 Karl-confidence on 7 all-1s static keys** — agents can run Karl, but accepting/overriding the result needs operator judgment.
- **Task #84 Sub-class 3 ground truth** — same; Karl gives evidence, operator interprets.
- **Phase 3B threshold tuning** — what's "too eager" is a judgment call.
- **HEUR-008 architectural review** — 5 platform-component findings need design review.

---

## Progress tracking

**On every phase milestone:**
1. Update this doc's "Snapshot" section with new numbers.
2. Update relevant task description in TaskList.
3. Add a one-liner to `_docs/operations/session-recap-<date>.md`.

**Sprint integration:**
- Phase 1A → Task #85 (closes when XREF-002 reports 0 orphans)
- Phase 1B → Task #83 (closes when STATIC-NEWER count = 0)
- Phase 1C → Task #84 (closes when sub-class-3 = 0)
- Phase 2B → Task #81 was closed as "triage complete" (the catalog phase). Phase 2B's REMEDIATION work needs a new sprint item filed when Phase 2 begins. **Action when starting Phase 2B:** verify current HEUR-025 Strategy 2 count via `node _tools/eduscan/index.js | grep HEUR-025` — if still ~97, file new task and run remediation; if <20, mark Phase 2B done.
- Phase 2C → Task #76 (closes when sync-helper BLOCK < 30)
- Phase 4A → Task #82 (closes when bc1 cron heartbeat fresh)
- Phase 4B → Task #86 (closes when no dedup collisions)
- Phase 5C → Tasks #10, #70 (closes when Solutions Manual at 100%)

**Cross-references for future agents:**
- Audit data: `~/hexworth-shared/Solutions/_audit/` (Karl reports, drift audits, orphan finding)
- Memory rules: `feedback_severity_demotion_pattern.md`, `feedback_verify_quiz_keys_callsite_before_acting.md`, `feedback_decision_protocol_with_nancy.md`
- Tooling: `_tools/eduscan/` (validators), `_tools/nexus/` (aggregator), `_tools/quiz-sync/` (sync-helper)
- Scripts staged but not run: `functions/cleanup-orphan-keys-2026-05-09.js`, `functions/seed-p0-batch-2026-05-08.js`

---

## Last updated

2026-05-09 — initial document. Phase 0 (this plan exists) complete.
2026-05-09 (tick 37) — Phase 1B Action 2 prep: `functions/seed-p0-batch-2026-05-08.js` (untracked) expanded 68 → 81 IDs. Drift-gate detector broadened to include period-N + near-cycling so rotated Firestore placeholders aren't misclassified as "real". Dry-run 81/81 OK. Operator action remaining: Karl-confidence on 8 flagged entries (7 all-1s + 1 near-all-zeros pc-ard-15) before live run.
2026-05-09 (ticks 38-40) — **Phase 4B FULLY COMPLETE.** Three commits closed Nexus dedupKey + eduscan adapter id emission + SEM-001 byte offset. Dedup collisions 4,149 → 0 after next eduscan run. Task #86 closed.
2026-05-09 (tick 41) — **Phase 4D shipped (commit 8b426356).** Hygiene Score widget added to `pulse.html` — secondary 110px ring next to PULSE ring, log-bucketed formula on medium + low + warning + suspect. Current state: PULSE=100, Hygiene=25. Code in master; ships on next operator `./deploy.sh`.

When updating: add a one-line entry below noting which phase advanced and what the new snapshot numbers are.
