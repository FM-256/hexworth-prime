# Marathon Session Handoff — 2026-05-09

**Status:** Operator review pending on 8 prioritized decisions
**Scope:** Single-day autonomous platform-improvement work
**Commits:** 28 day + 10 evening tick = 38 total. Evening tick deliveries:
1. `2b5d44b8` — nexus isClosed reconciliation (status='completed' from Stragglers honored)
2. `2afd2a63` — PATH-003 FP fix (249 of 253 false positives eliminated)
3. `01516e94` — cyberops div-mismatch root-cause + fix recipe (6 files documented)
4. `373481b7` — projects double-skeleton finding (12 files identified, 2 surgery options)
5. `cb048622` — projects family expansion (10 -3 delta + 2 -8 delta = full 12 confirmed)
6. **`0a862c8d`** — dark-arts code-block fix (3 files, 22 invalid `</code-block>` tokens; REAL FIX)
7. `214afcdd` — cyberops doc update with Nancy DOM-extent analysis (PAUSE held)
8. `63f45bb0` — handoff doc update with full evening commit list
9. **`52bb8b64`** — `</td>` -> `</div>` typo fix (2 card-label divs in eth-w2-privacy + forge-md101-m03)
10. **`734e2535`** — 4 div-imbalance fixes (forge mobile-devices `</ul>` -> `</div>`, script-linux-file-ops orphan delete, key-attack and web-subnetting `</code>` -> `</div>`)

**Net div-mismatch reduction:** 27 broken files → 18 broken files (9 fixed this tick, 27 token swaps total).
Remaining 18 = 6 cyberops applets (Nancy PAUSE on DOM-extent) + 12 projects/* double-skeleton (content-surgery operator decision needed).

This doc consolidates the day's work into one operator-actionable summary. Each prioritized decision links to the underlying detail doc and indicates the gating relationship (what unblocks what).

## Headline numbers

| Metric | Result |
|---|---|
| Stale sprint items closed | **1098** (4 critical + 1092 high + 2 medium) |
| HIGH backlog reduction | **1172 → 80** (93%) |
| Critical backlog reduction | **15 → 11** |
| Smoke gate growth | **9 → 13 hubs** (44%) |
| Karl Mode-1 audits run | 4 (m04/m05/m06 MD-101 + MD-100 Q-M01) |
| Bridget audits run | 2 (Ethics IT + PIS) |
| Nancy adversarial reviews | 7 |
| New components shipped (Phase 1) | 2 (HubRegistry, InlineQuizShuffler) |
| Regression tests added | 6 (InlineQuizShuffler) — suite now 61/61 |

## Operator decisions, prioritized

The 8 decisions below are ordered by **impact-to-effort ratio**. (1) is highest leverage; (8) is lowest.

### 1. PIS quiz cluster cheatability — Phase 2 wire-in (LOW effort, HIGH impact)

**Decision:** Wire `InlineQuizShuffler.shuffleQuiz(questions)` into the 4 PIS weekly quizzes.
**Effort:** 4 quizzes × 2-line edit = 8 lines total.
**Impact:** Eliminates structural cheatability where students who memorize W1's answer pattern get 100% on W2/W3/W4 without reading.
**Risk:** Low — component is fully tested (6/6 unit tests in `_tools/eduscan/tests/run.js`), Phase 1 file shipped 2026-05-09, smoke gate already covers PIS hub.

**Files to edit:**
- `_app/houses/shield/infosec/quizzes/pis-w1.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w2.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w3.quiz.html`
- `_app/houses/shield/infosec/quizzes/pis-w4.quiz.html`

**Wire-in pattern (per file):**
```html
<script src="/components/InlineQuizShuffler.js"></script>
<script>
    var questions = [...];  // existing
    InlineQuizShuffler.shuffleQuiz(questions);  // ADD THIS LINE
    // ... existing render code ...
</script>
```

**Detail:** `_docs/operations/inline-quiz-shuffler-design-2026-05-09.md`

### 2. MD-101 series Pattern E remediation (MEDIUM effort, HIGH impact)

**Decision:** Apply 7 URL swaps + 3 rationale edits + 15 anchor improvements to MD-101 m04/m05/m06 Confluence pages.
**Effort:** ~30 minutes per module (edit + verify) × 3 modules = ~90 min total.
**Impact:** Unblocks Karl-PASS verdict on the entire MD-101 cert-prep series. Currently all 3 modules BLOCK or MIXED.
**Risk:** Low — URLs verified via WebFetch (HTTP 200 + content match) on 2026-05-09; mechanical mostly.

**Detail:**
- `_docs/operations/md101-m05-url-replacements-2026-05-09.md` (3 DENY + 1 REJECT)
- `_docs/operations/md101-m06-url-replacements-2026-05-09.md` (4 DENY + 1 REJECT)
- m04 anchor improvements: 7 WEAK from `~/hexworth-shared/Solutions/_audit/karl-citation-audit-md101-m04.md`

**Special items needing content judgment (not just URL swap):**
- m05 Q2: rationale rephrase (drop "while a password can be used from any device" framing)
- m05 Q12 REJECT: select DHA-specific page (TPM Fundamentals miscited)
- m06 Q8 REJECT: remove "(also called 'Allow overrides')" parenthetical from WIP-modes rationale

### 3. Ethics IT 3-layer cleanup decision (MEDIUM effort, MEDIUM impact)

**Decision:** Pick option α/β/γ for Ethics IT presentation duplication.
**Effort:** Option α = 15 file deletes + 30 catalog removes + hub edit + smoke verify. ~1 hour.
**Impact:** Eliminates 15 CAT-007 dual-registration findings + cleaner hub UX (currently shows duplicate cards for same content).

**Options recap:**
- **α (recommended):** Delete old `eth-NN` files + 15 hand-curated entries + 15 auto-generated `divergent-eth-NN-*-pres` entries. Keep new `eth-wN` weekly structure.
- **β:** Reverse — keep old, delete new. Less aligned with how course is taught.
- **γ:** Mark old as `status: 'deprecated'` and hide from hub. Both structures persist — codebase complexity grows.

**Migration prerequisite:** Per memory `reference_firestore_sync_migration_pingpong.md`, server-side migration script must run BEFORE deleting old keys (otherwise `syncBidirectional` ping-pongs the old keys back from cloud).

**Detail:** `_docs/operations/qc-46-ethics-it-duplication-2026-05-09.md`

### 4. Pattern D citation rebuild sprint scope (HIGH effort, MEDIUM impact)

**Decision:** Schedule the citation rebuild sprint for 28 docs across 4 clusters.
**Effort:** ~529 citation-bearing items = significant content authoring work; multi-week sprint.
**Impact:** Unblocks Karl Mode-1 audits on these docs. Today's Karl rotation currently skips them (BLOCK on Pattern D).

**Cluster inventory:**
- Eye house: 5 (eye-soc, eye-siem, eye-correlation, eye-hunting, eye-traffic) — ~75 questions
- MD-100 quizzes: 11 (Quiz-M01 through Quiz-M11) — 166 questions
- MD-100 reviews: 3 (Comprehensive, Midterm, Final) — ~143 questions (jeopardy format)
- PFI: 4 (W1/W2/W3-Quiz + W4-Final-Exam) — 70 questions
- Ethics in IT: 5 (eth-final, eth-midterm, eth-w1/w2/w3) — ~75 questions

**Detail:** `_docs/operations/solutions-manual-quality-2026-05-09.md`

### 5. Ethics IT + PIS quiz architecture intent (Bridget R1) (MEDIUM effort, MEDIUM impact)

**Decision:** Keep client-graded vs migrate to server-graded.
**Effort:** Migration ~3-4 quizzes (eth-w1/w2/w3 + 4 PIS) = author Firestore quiz_keys + Confluence solutions docs + HTML cutover. Per quiz.
**Impact:** Closes QC-56 (Divergent client-grading) + QC-57 partial (95-quiz scope). Aligns with `feedback_cert_hubs_server_graded.md` mandate.

**Note:** PIS quiz_keys are pre-positioned for migration (seeded earlier today via STR-40 + Phase 1). Ethics needs keys authored from scratch.

**Detail:**
- `~/hexworth-shared/Solutions/_audit/bridget-ethics-it-2026-05-09.md`
- `~/hexworth-shared/Solutions/_audit/bridget-pis-2026-05-09.md`

### 6. HUB-001 execution playbook — Phase 1 validator widening (LOW effort, MEDIUM impact)

**Decision:** Approve the 10-line `_tools/eduscan/validators/syntax/hub-refs.js` widening that adds component-suffix tolerance.
**Effort:** 10 lines of validator code + smoke verify.
**Impact:** Clears 68 refs across 4 hubs (PFI + network-plus + matrix/adv-linux + security-plus) WITHOUT catalog or hub HTML changes.

**Detail:** `_docs/operations/hub-001-execution-playbook.md` (operator-pending since 2026-05-07)

### 7. PROG-003 web-troubleshooting shared key fix (HIGH effort, MEDIUM impact)

**Decision:** Approve the server-side migration CF + per-file unique progress keys.
**Effort:** Build CF + run migration + edit 5 HTMLs. Multi-step + risky.
**Impact:** Fixes student-progress double-counting on web-troubleshooting (5 files share key).

**Risk:** Per memory `reference_firestore_sync_migration_pingpong.md`, the migration MUST run server-side first (otherwise `syncBidirectional` ping-pongs).

**Detail:** ES-1096 sprint item; PROG_003_REPORT.json

### 8. m04 anchor improvements (LOW effort, LOW impact)

**Decision:** Apply 7 anchor additions to m04 Confluence page.
**Effort:** Mechanical — locate section IDs on each page + append `#anchor` to URL.
**Impact:** Upgrades 7 WEAK to PASS on m04. Doesn't unblock anything.

**Detail:** `~/hexworth-shared/Solutions/_audit/karl-citation-audit-md101-m04.md`

## What was delivered (audit trail)

### Stale sprint cleanup (lanes drained)

| Code | Closed | Verification |
|---|---|---|
| ES-87/88/89/90 (forge-windows-editions cluster) | 4 critical | All validators return 0 |
| ES-110 (QUIZ-003 reclassified) | 1 critical | Has correct: fields, rolled into QC-57 |
| SEC-001 + SEC-002 | 692 high | validateGlobal + validate() both 0 across 11K files; isExcluded() handles intentional CTF/training-lab content |
| QUIZ-001 | 14 high | Validator returns 0; logic unchanged since open |
| HEUR-012 | 17 high | 2 fires both in `_archive/` (firebase.json hosting ignore) |
| ES-19 (PATH-001 Firebase /__/) | 1 high | Exclusion at paths.js:1359 |
| QUIZ-002 (largest cluster) | 359 high | Stragglers-pollution + dup; current 4 fires are MEDIUM (practice-mode); TRIAGE_SEVERITY_GATE keeps them out of triage |
| 8 singleton high codes | 8 high | HEUR-027/028, HTML-001, CFG-001, QUIZ-005/006/007, DEP-004 — all 0 fires (or _source/ ignored) |
| QC-43 (QUIZ-002 prep-rounds) | 1 medium | Practice-mode demotion is the architectural resolution |

### New code shipped (Phase 1, file-only — no behavior change)

- `_app/components/HubRegistry.js` — single source of truth for tenant-assignable hubs (Nancy v1 PROCEED-WITH-CHANGES)
- `_app/components/InlineQuizShuffler.js` — Fisher-Yates shuffle for client-graded inline quizzes (Nancy PROCEED-WITH-CHANGES on 3 conditions, all met)
- 6 unit tests in `_tools/eduscan/tests/run.js` (suite 60→61 passing)

### EduScan smoke gate extension

- Added Ethics IT Hub (CIS4253), PIS Hub (CIS2350C) — last tick
- Added Python for IT Hub (COP1034C), Network+ Hub (N10-009) — earlier tick today
- All 13 targets verified PASS on full smoke run

### Documentation

- `_docs/operations/solutions-manual-quality-2026-05-09.md` — Pattern A/B/C/D/E catalog + 9-quiz cluster reclassification (CRITICAL → HIGH cheatability) + Karl results table + Pattern D skip list (28 docs)
- `_docs/operations/qc-46-ethics-it-duplication-2026-05-09.md` — 3-layer duplication audit + Bridget findings + sub-task progress tracker
- `_docs/operations/qc-47-pis-lab-completion-2026-05-09.md` — BoxEngine flag-capture completion gating audit
- `_docs/operations/inline-quiz-shuffler-design-2026-05-09.md` — design + Phase 2 wire-in plan + scope refinement (cluster-of-9 narrows to cluster-of-4)
- `_docs/operations/md101-m05-url-replacements-2026-05-09.md` — Pattern E remediation
- `_docs/operations/md101-m06-url-replacements-2026-05-09.md` — Pattern E remediation
- Memory: `reference_stale_sprint_findings_pattern.md` — SOP for future stale sweeps + final session totals

### Sprint state changes

- 1098 stale items closed (verification trail in each commit message + sprint-master notes pinning git SHA)
- QC-46 + QC-47 sprint notes updated with all sub-task progress trail
- QC-56 sprint notes updated with Bridget verification reference

## Known gaps + ongoing concerns

- **Task #82 / bc1 cron heartbeat absence** — operator-blocked (needs SSH access to verify the bc1 cron actually fires at 07:00 UTC). Memory says LIVE since 2026-05-08 but heartbeat is silent.
- **QUIZ-008 (411 fires, distribution skew)** — 1 sprint item (ES-1115) is META about HOW to handle these. Real ongoing work, not stale.
- **QC-51 (65 quizzes pc-esp + pv-* series)** — 145 VERIFIED-MISMATCH + 214 AMBIGUOUS + 5 PARSE-SUSPECT. ZERO safe to seed without correction. Multi-week content remediation work.
- **HEUR-018 (333 fires, scroll-trigger autocomplete)** — 0 sprint items currently. Validator surfaces in `_quality_reports/latest` but TRIAGE_SEVERITY_GATE keeps medium/low out of triage queue.

## Recommended operator action sequence

1. **Quickest wins first:** Decision (1) PIS shuffler wire-in — 8 lines, smoke-verified, immediate impact on assessment integrity.
2. **Series unblock:** Decision (2) MD-101 URL swaps — restores Karl-PASS on entire MD-101 cert-prep series.
3. **HUB-001 Phase 1:** Decision (6) validator widening — clears 68 refs across 4 hubs in one commit.
4. **Then content scope decisions** (Decisions 3, 4, 5) — these are larger sprints; schedule them deliberately.
5. **Defer Decision 8** (m04 anchors) until everything else is shipped.

After (1)+(2)+(6) ship, the platform's signal-to-noise + assessment integrity reach a meaningful new baseline.

## File map (today's outputs)

```
_app/components/
  HubRegistry.js                         (NEW, Phase 1)
  InlineQuizShuffler.js                  (NEW, Phase 1)

_docs/architecture/
  hub-registry-design.md                 (NEW)

_docs/operations/
  solutions-manual-quality-2026-05-09.md (extended)
  qc-46-ethics-it-duplication-2026-05-09.md
  qc-47-pis-lab-completion-2026-05-09.md
  inline-quiz-shuffler-design-2026-05-09.md
  md101-m05-url-replacements-2026-05-09.md
  md101-m06-url-replacements-2026-05-09.md
  marathon-session-handoff-2026-05-09.md (this file)

_tools/eduscan/smoke/run.js              (4 hubs added)
_tools/eduscan/tests/run.js              (6 tests added)
_tools/sprint-master/sprints.json        (1098 closures + sub-task notes)

~/hexworth-shared/Solutions/_audit/
  karl-citation-audit-md100-m01.md       (NEW)
  karl-citation-audit-md101-m05.md       (NEW)
  karl-citation-audit-md101-m06.md       (NEW)
  bridget-ethics-it-2026-05-09.md        (NEW)
  bridget-pis-2026-05-09.md              (NEW)
```

## Session-end status

No agents in flight. All deliverables committed. Backlog signal-to-noise dramatically improved. 8 prioritized decisions documented for operator review.
