# CAT-007 — catalog dedup analysis (operator decision required)

## TL;DR

50 duplicate catalog ID groups exist. **Zero are safe-remove** — every loser has at least 3 references in the codebase. CAT-007 isn't catalog drift; it's a **two-namespace pattern at the catalog level** (similar shape to HUB-001 PFI's hub-level finding).

Each duplicate is a rename-migration: pick canonical → update all loser refs → remove loser entry. Risk scales with reference count.

## Verified state (catalog-aware audit)

```
Total duplicate groups:                  50
Safe-remove (loser has 0 refs):           0
Rename-migration required (≥1 ref):      50
  Low risk    (loser has ≤5 refs):       18
  Medium risk (loser has 6-25 refs):     17
  High risk   (loser has >25 refs):      15  ← includes 11 CLH course aliases
```

## Audit tool

`_tools/audit-cat-007-dedup.js` — read-only analysis. Run with `--json` for machine-readable output. Lives in repo for re-running after operator decisions.

## Pattern breakdown

### House-prefix-vs-bare (13 groups, mostly CLH course aliases)

Pattern: `clh-001` (bare) AND `script-clh-001` (house-prefixed) both point to same lab file. Same content, two IDs.

| Pattern in this group | Bare-form refs | Prefixed-form refs |
|---|---|---|
| `clh-001..clh-019` | 130-141 each | 45-48 each |

**Decision**: pick one consistent direction across all 11+ CLH module pairs. The bare-form IDs are referenced 3x more. If the operator picks "bare is canonical," migration moves ~500 prefixed refs to bare. If "prefixed is canonical," migration moves ~1500 bare refs to prefixed (much bigger blast radius).

### Categorized-vs-flat naming (35 groups)

Pattern: `web-vlsm` (flat) AND `web-ip-vlsm` (categorized under IP-addressing). Each developer who added an entry chose differently.

Examples:
- `web-vlsm` (29 refs) / `web-ip-vlsm` (6 refs)
- `web-ipv6` (100 refs) / `web-ip-ipv6-addressing` (3 refs)
- `web-binary-ip` (21 refs) / `web-ip-binary-ip` (14 refs)
- `cloud-architecture-designer` / `cloud-architecture`
- `cloud-support-plans` / `cloud-aws-support`

**Decision**: same as CLH — pick one direction (categorized or flat) and migrate. The "most refs wins" heuristic gives a default canonical for each, but cross-house consistency matters: web/cloud/script may end up with mixed conventions.

### 3-way duplicates (2 groups)

Three IDs pointing to one file. Example: `web-ip-addressing` (63) / `web-intro-subnetting` (21) / `web-ip-subnetting` (7) all point at `applets/ip-addressing/subnetting-practice/web-ip-subnetting-practice.applet.html`.

**Decision**: same as 2-way — pick canonical, migrate the other two.

## What this is NOT

- **Not catalog drift** — every duplicate has live refs in both halves
- **Not silent dead code** — removing without migration would break student-facing nav

## What this IS

- **Convention drift across catalog authors** — multiple naming styles emerged organically
- **A coordination problem** — picking canonicals consistently across 50 groups + 9+ houses
- **Adjacent to PFI Option 1 hypothesis** — same shape as HUB-001 PFI ("two namespaces; pick one")

## Three options

### Option A — Status quo (don't dedup)

CAT-007 stays as a permanent MEDIUM finding. The catalog has 50 groups of dual entries; no student-facing harm; new content authors continue the drift.

- **Pros**: zero risk; zero migration cost
- **Cons**: catalog grows; new EduScan rules that depend on canonical IDs may behave unexpectedly; violates `feedback_no_architectural_debt.md`

### Option B — Adopt convention "highest ref count wins"

Per-group: keep the most-referenced ID, rename all loser refs to canonical, remove losers.

- **Pros**: minimizes total platform-wide rename work (operates against the smaller side of each duplicate)
- **Cons**: produces inconsistent results across houses (e.g. `web-vlsm` wins in one place but `web-ip-binary-ip` could win elsewhere); each canonical is locally optimal but globally chaotic

### Option C — Adopt platform-wide convention

Operator declares: "all catalog IDs MUST follow `{house}-{category}-{slug}` form" or "all IDs MUST be flat `{house}-{topic}`." Then per-group: keep the convention-matching ID, migrate the other.

- **Pros**: clean future state; one convention; new content authors know the rule
- **Cons**: highest migration cost — convention-matching ID is sometimes the LESS referenced one (3 refs vs 100), so all 100 references move

### Option D — Aliases (catalog-only fix)

Add `aliasOf:` field to each loser entry; renderer/registry merges progress between aliases.

- **Pros**: zero migration; zero ref updates
- **Cons**: introduces `aliasOf` as a new convention (zero existing uses today — same observation as PFI Option 2 and SYM-8 stale-ref question 4); each alias entry is permanent debt unless something garbage-collects them; downstream consumers (search, LearningPaths, ContentRegistry) need alias-awareness wired in

## Recommendation framing (no ranking)

The decision parallels HUB-001 PFI. If the operator chose PFI Option 1 (validator-widening) for HUB-001, the equivalent for CAT-007 might be: **extend EduScan's CAT-007 rule to recognize the two-namespace pattern as deliberate** — this codifies the drift but eliminates the finding.

If the operator wants a clean catalog (Options B or C), this is multi-session migration work that requires careful per-group review.

## What I will not do autonomously

- Pick A/B/C/D
- Apply any catalog edits
- Run any rename migrations

## Cross-references

- Audit tool: `_tools/audit-cat-007-dedup.js`
- Sister analysis (HUB-001 has the analogous "two-namespace at hub level"): `_docs/operations/hub-001-pfi-catalog-patch.md`
- Strategy umbrella for two-namespace decisions: `_docs/operations/sym-8-hub001-fix-proposal.md`
- Memory: `feedback_no_architectural_debt.md` (Option A is precluded by this rule)
