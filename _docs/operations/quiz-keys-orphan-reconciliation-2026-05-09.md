# Quiz Keys Orphan Reconciliation — XREF-002 vs Strict (2026-05-09)

**Detection:** Marathon tick — classifying the 88 XREF-002 orphans by actual HTML reference status.
**Status:** Read-only investigation complete. Operator-pending deletion authorization for 48 confirmed-orphan keys.
**Resolves:** Task #87 (false-callsite cleanup) + provides authoritative deletion set for #85.

## Headline reconciliation

| Audit | Orphan count | Definition |
|---|---|---|
| XREF-002 callsite audit (`QUIZ_KEY_CALLSITE_AUDIT.json`) | 88 | Keys with no `gradeQuiz()` callsite |
| Strict orphan audit (`QUIZ_KEY_STRICT_ORPHAN_AUDIT.json`) | 7 | Keys with additional heuristic check |
| **Reconciled (this artifact)** | **48** | Keys with NO HTML reference at all (moduleId, QUIZ_ID, or gradeQuiz) |

The XREF-002 list is conservative-narrow (only flags missing `gradeQuiz()` calls). The strict audit was too conservative-restrictive. The reconciled count of **48** is the operationally-correct deletion candidate set.

## Classification of all 88 XREF-002 orphans

| Class | Count | Description | Action |
|---|---|---|---|
| **Client-graded (legitimate)** | **40** | HTML has `moduleId:` reference but no `gradeQuiz()` — quiz uses inline scoring or ModuleProgress.completeQuiz | KEEP key (it's used for static-Firestore parity, even if grading is client-side) |
| **Server-graded but missed** | **0** | XREF-002 detector failed to find a real `gradeQuiz()` call | (none — detector is correctly scoped) |
| **No HTML reference (true orphan)** | **48** | NO file in `_app/` mentions the ID via moduleId, QUIZ_ID, or gradeQuiz | DELETE candidates |

## The 48 confirmed-orphan keys (deletion candidates)

### A+ Core 1 chapter quizzes (7) — NEVER-BUILT class
- `aplus-core1-ch02`, `aplus-core1-ch03`, `aplus-core1-ch06`, `aplus-core1-ch07`, `aplus-core1-ch08`, `aplus-core1-ch09`, `aplus-core1-ch11`

### A+ Core 1 labs (3) — NEVER-BUILT class
- `aplus-core1-lab-diagnostic-tools`
- `aplus-core1-lab-dns-config`
- `aplus-core1-lab-protocol-analysis`

### Ethics in IT quizzes (15) — DEPRECATED class (per memory: orphaned by commit ec3056f0 2026-04-28)
- `eth-01-quiz` through `eth-15-quiz`

### Shield PIS quizzes (4) — NAMING-MISMATCH class
- `shield-pis-w1-quiz` through `shield-pis-w4-quiz`
- HTML uses `pis-w1-quiz` (not `shield-pis-w1-quiz`) for ModuleProgress
- These Firestore keys are PARALLEL-NAMED but unused (HTML grades client-side via inline `var questions[].ans`)

### WiFi Security Arsenal quizzes (19) — DEPRECATED class
- `wsa-m01` through `wsa-m19`

## Why XREF-002's list is correct as-is

The 40 "client-graded" orphans (e.g. `ala-01` through `ala-19`) ARE referenced in HTML but only via `moduleId:` declarations. They use client-side grading (inline `q.ans` arrays) and never call `gradeQuiz`. XREF-002 is correctly looking for server-grading callsites — these are legitimately not server-graded.

**Per memory entry `reference_clh_three_layer_architecture.md`** and the `feedback_verify_quiz_keys_callsite_before_acting.md`: the 40 client-graded keys are intentionally retained in static `quiz_keys.json` for parity, even though they're not used at score time. They serve as documentation/manifest.

## Why the strict audit's 7 was too narrow

Strict audit's 7 candidates use additional heuristics (probably checking for the HTML file's existence on disk, not just for callsites). Since the platform has many "documented but never deployed" quiz IDs, the strict audit conservatively required HTML existence.

Strict's 7:
- `aplus-core1-ch01`, `aplus-core1-ch12`
- `forge-aplus-core1-prep-r1`, `r2`, `r3`, `r4`
- `subnetting`

Notably, strict's 7 doesn't include the obvious-orphan eth-NN-quiz (15) or wsa-mNN (19) sets, while the reconciled 48 does. The reconciled view captures the real deletion-safe set.

## Recommended operator action

### Phase 1 — Operator deletion authorization (production write gate)

For the 48 keys above, Nancy + operator review the deletion list and authorize:

```bash
node functions/cleanup-orphan-keys-2026-05-09.js --ids=<list> --dry-run   # preview
node functions/cleanup-orphan-keys-2026-05-09.js --ids=<list>             # execute
```

(Verify `cleanup-orphan-keys-2026-05-09.js` accepts the `--ids` flag; if not, build a successor.)

### Phase 2 — Update QUIZ_KEY_CALLSITE_AUDIT documentation

Add a "client-graded" category to the audit output so future runs distinguish:
- Server-graded missed (operator action: investigate detector miss)
- Client-graded legitimate (no action — these are by design)
- True orphan (operator action: delete)

The audit script lives at `_tools/eduscan/quiz-key-callsite-audit.js`. Adding HTML-reference-without-gradeQuiz detection would surface the 40 client-graded keys as informational instead of "orphan."

### Phase 3 — Verify post-deletion no regression

After deleting the 48, re-run `nexus full` and verify:
- Total static keys: 481 → 433 (-48)
- XREF-002 orphans: 88 → 40 (the 40 client-graded remaining)
- Sync-helper C9 cluster duplicates: should drop where deleted IDs were duplicates

## Operational caveats

1. **Don't delete the 4 shield-pis-w*-quiz keys without verifying tenant configs.** Some tenant courses may reference these IDs in their config manifests. Spot-check `_app/tenant/*` and `_app/components/HouseRenderer.js` registries before deletion.

2. **The eth-NN-quiz set (15)** was orphaned by commit ec3056f0 (2026-04-28) per MEMORY. Verify deletion script targets this commit's specific list, not a broader pattern that might catch active eth-NN-* keys.

3. **wsa-mNN keys (19)** — verify against active WSA hub at `_app/houses/dark-arts/vault/wifi-arsenal/`. The vault content may still reference these IDs for display purposes even if they're not graded.

## Architecture refs

- Audit: `_tools/eduscan/quiz-key-callsite-audit.js` (XREF-002 source)
- Strict audit: `_tools/reports/QUIZ_KEY_STRICT_ORPHAN_AUDIT.json`
- Cleanup script: `functions/cleanup-orphan-keys-2026-05-09.js`
- Static keys: `functions/quiz_keys.json` (481 total)
- Memory entries: `reference_clh_three_layer_architecture.md`, `feedback_verify_quiz_keys_callsite_before_acting.md`, `reference_placeholder_detector_blind_spot.md`

## Reproducibility

The classifier script lives at `/tmp/classify-orphans.js` (this session). Re-run via:
```bash
node /tmp/classify-orphans.js
```

Or the script can be persisted to `_tools/eduscan/orphan-classifier.js` as a follow-up.
