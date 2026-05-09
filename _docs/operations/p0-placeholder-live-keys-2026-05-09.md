# P0 — Placeholder LIVE Quiz Keys (2026-05-09)

**Detection method:** `node functions/placeholder-detector.js classify` (consolidated module from commit 1c644716) + cross-reference with `_tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json` orphan list.
**Status:** Static-only audit complete. 35 LIVE placeholder keys identified — these have HTML callsites AND non-real answer arrays. Students hitting these quizzes get wrong scores.
**Operator action:** content-judgment work — each key needs real answers from the quiz HTML or solutions doc. Reseeding is gated on production write authorization.

## Headline

| Status | Count | Risk |
|---|---|---|
| **LIVE + placeholder (P0)** | **35** | Students get wrong scores on every attempt |
| ORPHAN + placeholder | 24 | No HTML callsite — safe deletion candidates |
| **Total placeholder candidates** | **59** | (37 ALL-SAME + 10 ALL-ZEROS + 4 CLASSIC-CYCLING + 3 NEAR-CYCLING + 5 PERIOD-CYCLING) |

481 keys total in `functions/quiz_keys.json`. 422 classified as REAL.

## P0 LIVE placeholder keys (35) — grouped by course

### Comprehensive Final Exams (4 keys, 125 questions total)

These are the highest-blast-radius — students taking course-final exams getting all-zeros or all-cycling keys.

| Key | Length | Pattern | Course |
|---|---|---|---|
| `divergent-cse-final` | 25 | all-zeros | Cybersecurity Essentials final |
| `divergent-cse-midterm` | 25 | all-zeros | Cybersecurity Essentials midterm |
| `divergent-eth-final` | 35 | all-zeros | Ethics in IT final |
| `divergent-eth-midterm` | 25 | all-zeros | Ethics in IT midterm |
| `fw-final` | 40 | classic-cycling [0,1,2,3,...] | Firewall course final |
| `fl-final` | 40 | classic-cycling [0,1,2,3,...] | (likely Forensics or similar) |

### CCNA Cluster (5 keys, 140 questions total) — all all-zeros

| Key | Length |
|---|---|
| `ccna-comprehensive-quiz` | 50 |
| `ccna-domain1-quiz` | 20 |
| `ccna-domain2-quiz` | 20 |
| `ccna-domain3-quiz` | 20 |
| `ccna-domain456-quiz` | 30 |

### CLH Cluster (4 keys)

| Key | Length | Pattern |
|---|---|---|
| `clh-001-legacy` | 5 | all-1s |
| `clh-029` | 5 | all-1s |
| `clh-022` | 5 | classic-cycling |
| `clh-015` | 10 | period-cycling [1,1,2,1,1,1,1,2,1,1] |

### AZ Cluster (2 keys)

| Key | Length | Pattern |
|---|---|---|
| `az104-ch02-quiz` | 15 | all-1s |
| `az900-ch03-quiz` | 15 | classic-cycling |

### CSE Cluster (3 keys, all all-1s)

| Key | Length |
|---|---|
| `cse-04-network` | 10 |
| `cse-06-monitoring` | 10 |
| `cse-08-compliance` | 10 |

### CySA+ (eye) Cluster (3 keys)

| Key | Length | Pattern |
|---|---|---|
| `eye-cysa-ch12-quiz` | 10 | all-1s |
| `eye-cysa-ch13-quiz` | 10 | period-cycling [1,1,1,2,1,1,1,2,1,1] |
| `eye-cysa-ch14-quiz` | 10 | all-1s |

### Dark-Arts FEH Cluster (3 keys, all all-1s)

| Key | Length |
|---|---|
| `feh-08` | 15 |
| `feh-09` | 15 |
| `feh-10` | 15 |

### Forensics PC-ARD Cluster (4 keys)

| Key | Length | Pattern |
|---|---|---|
| `pc-ard-04-quiz` | 15 | near-cycling |
| `pc-ard-05-quiz` | 14 | near-cycling |
| `pc-ard-14-quiz` | 15 | near-cycling |
| `pc-ard-19-quiz` | 15 | all-1s |

### Misc (7 keys)

| Key | Length | Pattern |
|---|---|---|
| `cert` | 10 | period-cycling [1,1,2,1,1,1,1,2,1,1] |
| `md100-m11` | 15 | all-1s |
| `quizzes` | 5 | all-1s |
| `security` | 25 | all-zeros |
| `threat-hunting` | 10 | period-cycling [1,1,1,1,2,1,1,1,1,2] |

(Note: `cert` and `quizzes` may be ambiguous IDs that need investigation — they don't fit a course namespace.)

## Orphan placeholder keys (24) — safe deletion candidates

These keys have placeholder answers AND no HTML callsite (per XREF-002 audit). They can likely be deleted from Firestore + `quiz_keys.json` without student impact:

- 14 eth-NN-quiz (eth-02 through eth-14) — orphaned by commit ec3056f0 (2026-04-28) per MEMORY entry
- 5 pis-NN-quiz (pis-12 through pis-16-checkpoint)
- 3 ala-NN (ala-12, ala-17, ala-18)
- 3 wsa-mNN (wsa-m09, wsa-m15, wsa-m16) — but wait, this artifact says all 19 wsa-m* are orphans per earlier audit; only 3 of those are placeholder

Cross-check the strict orphan audit (`QUIZ_KEY_STRICT_ORPHAN_AUDIT.json`) before deletion. The strict audit narrowed 88 XREF-002 orphans down to 7 true-strict-orphans; the remaining 81 may have callsites the validator missed (#87 follow-up needed).

## Recommended fix path

### Phase 1 — Investigate the LIVE 35 (per cluster)

For each cluster, the operator must:
1. Locate the quiz HTML file (find by ID via `grep -rln "quizId.*<KEY>"` in `_app/`)
2. Extract the actual correct-answer array from the HTML (read the rendered question/option text + correct-answer markup)
3. OR find the corresponding solutions doc in `~/hexworth-shared/Solutions/` and use its answer key
4. Verify via Karl Mode-2 that the answers align with the questions

This is content-judgment work, NOT mechanical. Each cluster (CCNA, CLH, CSE, etc.) is its own batch with its own answer-key source.

### Phase 2 — Reseed batch (operator-gated, production write)

Use the existing `seed-p0-batch-2026-05-08.js` pattern (or build a successor) to:
1. Stage real answers in a JSON manifest
2. Nancy-review the manifest
3. Run `verify-quiz-keys.js` per ID
4. Seed Firestore + update static `quiz_keys.json`
5. Deploy hosting (which serves the static fallback)

### Phase 3 — Cleanup orphans (operator-gated)

After Phase 2 ships, delete the 24 orphan placeholder keys from Firestore + static. Schedule under Nancy + operator review per `feedback_we_do_not_destroy.md` rule.

## Why this matters

A student taking `ccna-comprehensive-quiz` today picks 50 answers; the server compares each against `[0, 0, 0, 0, ..., 0]`. Students who picked option A on every question score 50/50; everyone else scores below pass threshold. This is silent academic-integrity failure — the score reported to instructors is structurally wrong, not just inaccurate.

The 35 LIVE quizzes likely affect a meaningful slice of platform users — operator should check completion-rate metrics for these IDs in the analytics-v2 events to estimate blast radius (`ModuleProgress.completeQuiz` events filtered by `quizId IN <35-list>`).

## Architecture refs

- Detector: `functions/placeholder-detector.js` (consolidated 2026-05-09 from 5 prior copies)
- Detector blind-spot memory: `reference_placeholder_detector_blind_spot.md`
- Strict orphan audit: `_tools/reports/QUIZ_KEY_STRICT_ORPHAN_AUDIT.json`
- Callsite audit: `_tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json`
- Static keys: `functions/quiz_keys.json`
- Prior reseed batch script: `functions/seed-p0-batch-2026-05-08.js`
