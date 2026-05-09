# QC-46 — Ethics in IT Presentation Duplication Audit

**Date:** 2026-05-09
**Status:** Operator decision pending
**Scope:** `_app/houses/divergent/ethics-it/` — presentation file inventory

## Finding

The Ethics in IT course has **TWO PARALLEL presentation structures** living side-by-side:

- **Old structure** — sequential `eth-01` through `eth-15` (15 files)
- **New structure** — weekly `eth-w1-*`, `eth-w2-*`, `eth-w3-*`, `eth-w4-*` (11 files)

Both are catalog-registered. Both are referenced from the hub (`_app/houses/divergent/ethics-it/index.html`). Students see duplicate cards for the same content.

## Topic-by-topic mapping

| Old (eth-NN) | New (eth-wN) | Topic |
|---|---|---|
| `eth-01-overview` | `eth-w1-ethics-overview` | Ethics Overview / Foundations |
| `eth-02-it-professionals` | `eth-w1-it-professionals` | IT Professionals & Ethics |
| `eth-03-cybersecurity-ethics` | `eth-w1-cybersecurity-ethics` | Cybersecurity Ethics |
| `eth-04-week1-checkpoint` | (no equivalent) | Week 1 Checkpoint |
| `eth-05-privacy` | `eth-w2-privacy` | Privacy |
| `eth-06-freedom-expression` | `eth-w2-freedom-expression` | Freedom of Expression |
| `eth-07-intellectual-property` | `eth-w2-intellectual-property` | Intellectual Property |
| `eth-08-week2-checkpoint` | (no equivalent) | Week 2 Checkpoint |
| `eth-09-software-development` | `eth-w3-software-ethics` | Software Ethics & Quality (renamed) |
| `eth-10-it-impact` | `eth-w3-it-impact` | IT Impact on Society |
| `eth-11-week3-checkpoint` | (no equivalent) | Week 3 Checkpoint |
| `eth-12-social-media` | `eth-w4-social-media` | Social Media Ethics |
| `eth-13-it-organizations` | `eth-w4-it-organizations` | IT Organizations & Work |
| `eth-14-codes-of-ethics` | `eth-w4-codes-of-ethics` | Codes of Ethics |
| `eth-15-final-assessment` | (no equivalent) | Final Assessment review |

11 of 15 old files have a new-structure counterpart.
4 old files (checkpoints + final assessment review) have no new-structure equivalent.

## Operator decision required

**Option α — Keep new structure (eth-wN), delete old (eth-NN-*).**

Removes 15 catalog entries + 15 HTML files. Loses 4 standalone files (4 checkpoints + final review). Migration cost: zero per-content rebuild — content has already been moved to the new structure.

Risk: students who bookmarked old paths or have completed-state in old IDs lose continuity. Migration shim like `migrateLegacyKey` in ModuleProgress would transfer completion. Memory note `reference_firestore_sync_migration_pingpong.md` warns: do NOT add `migrateLegacyKey` blocks when cloud has old keys — migration must run server-side first.

**Option β — Keep old structure (eth-NN), delete new (eth-wN-*).**

Removes 11 catalog entries + 11 HTML files. The 4 checkpoint/review files are preserved as part of the old structure. Migration cost: zero — old structure is still complete.

Risk: the new structure was likely built for a curriculum reason (4-week instructional pacing). Reverting loses that organization.

**Option γ — Keep both, mark old as deprecated/hidden.**

Add a `status: 'deprecated'` field to old catalog entries; hide from hub by filtering on `status !== 'deprecated'`. Files stay on disk for student-progress lookup but disappear from the UI.

Risk: codebase complexity grows. Two structures persist, neither is canonical. Future contributors don't know which to add to.

## Recommendation

**Option α with server-side migration first.** The new weekly structure aligns with how the course is actually taught (per CIS4253 build plan in memory). 4 standalone files (checkpoints, final review) need decision — could be folded into the new structure as `eth-w1-checkpoint`, `eth-w2-checkpoint`, etc., or dropped if students don't need them.

Sequence:
1. Server-side migration script (CF or admin-script) to copy student progress from `eth-NN` to mapped `eth-wN-*` keys in `users/{uid}/progress`. Idempotent.
2. Run migration once on production.
3. Remove old catalog entries + delete old HTML files in same commit.
4. Hub cleanup commit removes the duplicate cards.
5. Operator visual-verification before deploy.

Step 1 is the gating item. Per memory note `reference_firestore_sync_migration_pingpong.md`, the migration MUST happen on server BEFORE client-side `migrateLegacyKey` blocks (otherwise `syncBidirectional` ping-pongs the old keys back).

## Files

**Old structure (15 files, ~570KB combined):**
```
_app/houses/divergent/ethics-it/presentations/eth-01-overview.presentation.html
_app/houses/divergent/ethics-it/presentations/eth-02-it-professionals.presentation.html
... (eth-03 through eth-15)
```

**New structure (11 files):**
```
_app/houses/divergent/ethics-it/presentations/eth-w1-cybersecurity-ethics.presentation.html
_app/houses/divergent/ethics-it/presentations/eth-w1-ethics-overview.presentation.html
... (10 more)
```

**Hub:** `_app/houses/divergent/ethics-it/index.html` (line scan shows interleaved old + new cards)

**Catalog:** `_app/components/ContentCatalog.js` — both naming patterns registered.

## Update — Third layer of duplication discovered (CAT-007)

Running `ContentCatalogValidator.validate()` against the current code surfaces **15 CAT-007 findings** on Ethics in IT: each `eth-NN-*` presentation has TWO catalog entries pointing to the same file path:

1. Hand-curated (e.g., `eth-01` with title "ETH-01: Overview of Ethics", category "eth")
2. Auto-generated `divergent-eth-NN-*-pres` (e.g., `divergent-eth-01-overview-pres`, category "general", title appended with " | Ethics in IT | The Factionless")

So Ethics in IT actually has THREE structures, not two:
1. Old `eth-NN-*` files + 15 hand-curated catalog entries
2. New `eth-wN-*` files + 11 hand-curated catalog entries
3. Auto-generated `divergent-eth-NN-*-pres` entries (15) pointing to old-structure files

**Catalog total:** 26 file paths, 41 catalog entries, 15 duplicate registrations.

This is the same pattern as QC-90 (Catalog dual-registration cleanup — 251 clusters platform-wide). Ethics in IT contributes ~15 of those clusters.

**Implication for cleanup options:**
- Option α (delete old structure) → also delete the 15 auto-generated `divergent-eth-NN-*-pres` entries that reference now-deleted files. Would otherwise become REG-ORPHAN-001 findings.
- Option β (delete new structure) → can leave old structure + auto-generated as-is, but the 15 CAT-007 dup-registration findings persist.
- Option γ (hide old) → 15 CAT-007 findings persist.

**Recommendation update:** Option α (delete old) becomes more attractive — single commit removes all three layers cleanly: 15 old files + 15 hand-curated old catalog entries + 15 auto-generated dup catalog entries.

## Out of scope for this audit

This document does not address:
- Ethics in IT lab walkthroughs (eth-l01 through eth-l10) — separate QC-46 sub-task
- Ethics in IT review pages (eth-r1, eth-r2, eth-r3) — separate sub-task
- Quiz citation audit (QC-46 Karl audit completed Task #63)
- Hub-vs-catalog mismatch (QC-46 HUB-001 completed Task #64)
- Bridget three-way sync on Ethics quizzes (in flight as of this writing)

## Bridget three-way sync result (2026-05-09 in-flight, completed)

Sub-task (3) from QC-46 scope. Verdict: **3 quizzes / 0 drift / 0 blockers** — but with significant architectural findings:

**Ethics quizzes are 100% client-graded:**
- `eth-w1-quiz`, `eth-w2-quiz`, `eth-w3-quiz` use `ModuleProgress.completeQuiz('divergent', '<id>', score)` with score computed entirely client-side (`pct >= 70`)
- No `serverGrading`/`gradeQuiz`/`moduleId` markers in any of the 3 HTML files
- **Zero `eth-w*` entries in `functions/quiz_keys.json`** (verified by grep)
- The 15 `eth-NN-quiz` entries that DO exist in quiz_keys are confirmed orphans from commit `ec3056f0` (2026-04-28 embedded-quiz removal) — separate workstream
- `~/hexworth-shared/Solutions/Ethics in IT/` is empty — no Confluence-side answer keys exist
- 12 of 18 Bridget checks resolve to NOT_APPLICABLE (architecturally — only 1 of 3 sources exists); 6 extended HTML-self-consistency checks PASS
- Answer indices extracted: w1 = `[3,2,0,2,1,0,0,1,0,1,3,3,2,3,1]`, w2 = `[2,3,0,3,2,0,3,0,3,1,2,1,2,1,0]`, w3 = `[1,1,0,3,1,2,0,3,2,3]`
- Internal HTML self-consistency: PASS (TOTAL/header/question count agree)
- Hub wire-up: confirmed at `_app/houses/divergent/ethics-it/index.html:1227`

**Implication:** Ethics in IT contributes 3 quizzes to QC-57's 95-quiz client-grading scope. Students can View Source to see answers. There's no Firestore key to seed — any migration to server-grading needs keys created from scratch using Bridget's extracted arrays as the starting point.

**Bridget's R1-R3 recommendations (operator-pending):**
- **R1** — Decide architecture intent: (a) commit to client-graded with explicit marker, or (b) plan migration to server-graded (requires authoring quiz_keys + Confluence docs)
- **R2** — Tooling: mark eth-w[123]-quiz in `_tools/quiz-sync/quiz-pages.json` as `architecture: client-graded, sources: 1` so future Bridget runs classify out-of-scope (but requires sync-helper.js change to honor the new field)
- **R3** — If Confluence solutions are eventually authored: write from HTML (current canonical source); Karl QC-46 reports are a 90% starting point with per-Q correct-option text

Full Bridget report: `~/hexworth-shared/Solutions/_audit/bridget-ethics-it-2026-05-09.md`

## Status

Documenting only. No file deletions, no catalog changes, no hub edits made by this audit. Operator decides which option to execute.

**QC-46 sub-task progress (this document):**
- [x] (3) Bridget three-way sync — complete (0 drift, 3 architectural findings)
- [x] (5) Presentation duplication audit — three-layer finding documented
- [x] (6) Lab walkthrough completion gating — AUDITED: all 10 labs use EDTEngine submission gating (not scroll-trigger). Pattern is architecturally sound — completion requires deliberate student action (evidence tagging + stakeholder selection + code ranking) before submission. ModuleProgress.complete fires only after `submitEDTLab` Cloud Function accepts payload. No HEUR-018 scroll-trigger vulnerability.
- [x] (7) EduScan smoke gate on hub — COMPLETE (commit b6672d33: added Ethics IT Hub + PIS Hub to smoke targets, min: 30 [data-module] threshold)
- [ ] Confluence summary deliverable — pending operator decisions on cleanup option (α/β/γ for presentation duplication)

## Sub-task 6 audit detail

All 10 Ethics IT labs (`eth-l01-vw-emissions` through `eth-l10-the-code`) follow identical architecture:

```
labs/eth-lNN-<topic>/
  ├── index.html  (minimal launcher, calls EDTEngine.init)
  └── config.js   (lab-specific configuration)
```

The lab's `index.html` does NOT call `ModuleProgress.complete` directly. The `config.js` files (~270-314 lines each) define lab content. The completion logic lives in `_app/arena/engine/EDTEngine.js:1283` — fires `ModuleProgress.complete('divergent', _config.id, ...)` only AFTER:
1. Student tags evidence with explanations
2. Student selects stakeholders (depth × count + nonObvious bonus)
3. Student ranks code conflicts
4. Student submits via `submitEDTLab` Cloud Function (or DEV fallback in non-prod)
5. Submission accepted

Auto-scores computed on submission (evidence, stakeholder, codeConflict ratios). Code conflict carries 60% auto-score + 40% instructor spot-check. No completion is registered without a submission. **No HEUR-018 vulnerability** (no scroll listener auto-fires `complete`).
