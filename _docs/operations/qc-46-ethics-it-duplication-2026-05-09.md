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

## Status

Documenting only. No file deletions, no catalog changes, no hub edits made by this audit. Operator decides which option to execute.
