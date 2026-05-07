# HUB-001 — `cloud/modules/wsa` proposal (operator decision required)

## TL;DR

WSA is the same shape as PFI: **catalog already has all 23 hub-referenced items** under canonical IDs (`wsa-module01..wsa-module19`, `wsa-module20-failsafe`, `wsa-midterm-outpost`, `wsa-gauntlet`, `wsa-gauntlet-advanced`). The hub uses short navigational shorthand (`m01..m19`, `capstone`, `midterm`, `gauntlet`, `gauntlet-advanced`).

**Crucial difference from PFI**: WSA's mapping is **not algorithmic**. There is no `{house}-{id}-{suffix}` rule that derives `m01 → wsa-module01`. The mapping `capstone → wsa-module20-failsafe` requires curriculum knowledge. PFI's Option 1 (suffix-tolerance widening) does not apply here.

## Verified state

```
houses/cloud/modules/wsa/index.html
  refs: 23  |  live: 0  broken: 0  fileNoCatalog: 0  dead: 23
```

The "dead: 23" is misleading — the auditor doesn't traverse hrefs. Inspecting the hub anchors confirms every card points to a real file that has a catalog entry under a different ID:

| Hub `data-module` | Hub href | Catalog id |
|---|---|---|
| `m01`..`m19` (19 entries) | `mNN-{topic}/cloud-presentation.module.html` | `wsa-module01`..`wsa-module19` |
| `gauntlet` | `gauntlet/index.html` (lobby) | `wsa-gauntlet` (href: `modules/wsa/gauntlet/cloud-gauntlet.module.html`) |
| `gauntlet-advanced` | `gauntlet-advanced/index.html` (lobby) | `wsa-gauntlet-advanced` |
| `midterm` | `midterm-outpost/index.html` (lobby) | `wsa-midterm-outpost` |
| `capstone` | `m20-failsafe-capstone/index.html` (lobby) | `wsa-module20-failsafe` |

**Note on the lobby/content divergence**: For gauntlet/midterm/capstone, the hub points to an `index.html` lobby and the catalog points to the actual content file (`cloud-gauntlet.module.html`, `cloud-simulation.module.html`). Both files exist in each directory. This is a deliberate two-step entry pattern (lobby → content) for the more complex assessments, distinct from the m01..m19 direct-to-presentation pattern.

## Three options

### Option A — Add 23 alias entries to catalog

Each entry has a short ID matching the hub plus `aliasOf` referencing the canonical entry. ~30 minute effort once approved.

- **Pros**: hub HTML untouched; matches the implied design intent of using short IDs for hub navigation; no analytics continuity risk
- **Cons**: 23 new catalog entries (catalog grows from ~2727 to ~2750); introduces `aliasOf` as a new convention (`grep aliasOf` shows zero existing uses); two entries per piece of content can confuse search/discovery

### Option B — Rename 23 hub `data-module` values to canonical catalog IDs

Edit `_app/houses/cloud/modules/wsa/index.html`: replace `data-module="m01"` with `data-module="wsa-module01"`, etc.

- **Pros**: single source of truth; catalog stays clean
- **Cons**: HIGH analytics continuity risk. `ModuleProgress.complete(houseId, moduleId)` builds compound progress keys from data-module values. Existing student progress under `cloud-m01..cloud-m19` would orphan unless `migrateLegacyKey` covers WSA. Same risk as PFI Option 3.
- **Required investigation before approving**: count of active progress records under the legacy `cloud-m{NN}` keys; verification that `ModuleProgress.migrateLegacyKey` is generic (not WSA-specific)

### Option C — Path-aware validator tolerance (new convention)

Extend the HUB-001 validator: when a hub references an unresolved ID, also try matching against catalog entries where `category` matches a curriculum-shorthand-to-canonical map declared in the validator. E.g., for `cloud/modules/wsa`: `m{NN}` → `wsa-module{NN}`, `capstone` → `wsa-module20-failsafe`.

- **Pros**: no catalog edits, no hub edits, no analytics risk; clears WSA HUB-001 finding
- **Cons**: requires per-curriculum config in the validator (NOT generalizable like PFI Option 1's suffix rule); maintenance burden grows with each new course; codifies a divergent ID convention rather than fixing it

## Cross-reference to `cloud/server-plus` proposal

Server-plus references the same WSA content but with yet another naming scheme: `wsa-m01-pres..wsa-m19-pres`, `wsa-m10-sec`. See `hub-001-server-plus-proposal.md`. Three different IDs (server-plus's `wsa-m01-pres`, wsa hub's `m01`, catalog's `wsa-module01`) all point at the same `m01-fundamentals/cloud-presentation.module.html` file.

The decision on WSA Option A vs B should consider what is decided for server-plus. If both are resolved by aliases (Option A on each), the catalog grows by ~44 alias entries. If server-plus picks rename (B) and WSA picks alias (A), the platform has two divergent precedents.

**Operator should pick a consistent direction across both hubs.**

## What I will not do autonomously

- Pick Option A/B/C
- Apply Option A's 23 alias entries (catalog mutations affect search, LearningPaths, ContentRegistry)
- Apply Option B's hub rename (analytics continuity risk requires investigation first)
- Apply Option C's validator config (codifies a convention that should be approved at architecture level)

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Validator: `_tools/eduscan/validators/syntax/hub-refs.js`
- Sister proposals (same shape as Class A naming-mismatch): `hub-001-pfi-catalog-patch.md`, `hub-001-ccna-catalog-patch.md`
- Sister proposal (same WSA content, different hub): `hub-001-server-plus-proposal.md`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
- Memory: `reference_module_progress_migrate_legacy_key.md` (relevant to Option B)
- Memory: `feedback_no_architectural_debt.md` (Option C may violate this)
