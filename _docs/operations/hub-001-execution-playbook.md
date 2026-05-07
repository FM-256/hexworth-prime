# HUB-001 — Execution Playbook (10 of 10 hubs ready)

## Status: 10 of 10 hubs analyzed

Every HUB-001 hub now has a READY artifact in `_docs/operations/`. Operator can sequence the rollout per the recommendations below.

## Quick reference — what each hub needs

| Hub | Artifact | Operator decision | Patch size |
|---|---|---|---|
| `web/ccna` | `hub-001-ccna-catalog-patch.md` | Paste-and-deploy approval | 31 entries |
| `divergent/ethics-it` | `hub-001-ethics-it-catalog-patch.md` | Paste-and-deploy approval | 30 entries |
| `matrix/adv-linux` | `hub-001-adv-linux-catalog-patch.md` | Paste-and-deploy approval | 20 entries |
| `web/network-plus` | `hub-001-network-plus-catalog-patch.md` | Paste-and-deploy approval | **74 entries (largest)** |
| `forge/intro-computers` | `hub-001-forge-intro-computers-proposal.md` | Unit 1 paste + Unit 2 UX path A/B/C | 3 + 23 |
| `shield/isc2-cc` | `hub-001-isc2-cc-proposal.md` | Unit 1 paste + Unit 2 UX path | 22 + 11 (Unit 2 dead) |
| `shield/security-plus` | `hub-001-security-plus-proposal.md` | Unit 1-sp paste (28 sp-only after isc2-cc Unit 1) | 28 + 17 (Unit 2 dead) |
| `code/python-for-it` | `hub-001-pfi-catalog-patch.md` | **Pick PFI Option 1/2/3/4** | varies by option |
| `cloud/modules/wsa` | `hub-001-wsa-catalog-patch.md` | **Pick A/B/C** (paired with server-plus) | 23 entries (Option A) |
| `cloud/server-plus` | `hub-001-server-plus-proposal.md` (existing, pre-marathon) | **Pick A/B/C** | 21 entries |

## Recommended execution sequence

### Phase 1 — The single decision that cascades (PFI Option 1)

**Decision: PFI Option 1 (validator widening) yes/no.**

If yes:
- 10-line edit to `_tools/eduscan/validators/syntax/hub-refs.js` adds component-suffix tolerance
- 68 refs across 4 hubs (PFI + network-plus + matrix/adv-linux + security-plus) clear immediately with **no catalog or hub HTML changes**
- This is the lowest-risk, highest-leverage change in the entire HUB-001 backlog

The PFI doc has the analysis. If the operator agrees, this is the first commit.

### Phase 2 — Mechanical paste-and-deploy patches (4 hubs)

These are pure catalog additions — no curriculum decisions, no hub edits, no analytics-continuity risk:

| Hub | Entries | Effect |
|---|---|---|
| `web/ccna` | 31 | 0% → 100% live |
| `divergent/ethics-it` | 30 | 32% → 100% live |
| `matrix/adv-linux` | 20 | (with Phase 1) 11% → 100% live |
| `web/network-plus` | 74 | (with Phase 1) 20% → 100% live |
| **Total Phase 2** | **155 entries** | 4 hubs from broken to clean |

Each is one commit. Operator can approve all four in a single review pass since the methodology is identical.

### Phase 3 — Naming-convention picks (3 hubs)

These need the operator to pick a direction, but the directions are well-documented and the recommended choices are noted in each artifact.

| Hub | Decision required | Recommended choice |
|---|---|---|
| `code/python-for-it` | Option 1/2/3/4 | Phase 1 already covers this |
| `cloud/modules/wsa` | Option A/B/C | A (23 aliases) — matches PFI's Option 2 if that's also picked |
| `cloud/server-plus` | Option A/B/C | A (21 aliases) — same reasoning as wsa; consider together |

**If operator picks Option A consistently for both wsa + server-plus**: 44 alias entries land, both hubs clear, two-namespace pattern stays consistent across the platform.

### Phase 4 — Class C cross-hub patches (shield)

Shared `pis-*` and `ms-sec-*` curriculum across `shield/isc2-cc` + `shield/security-plus`:

1. Land isc2-cc Unit 1 (22 entries) — clears 19 refs in security-plus simultaneously
2. Land sp Unit 1-sp (28 sp-only entries) — clears the rest of sp's catalog gap
3. **Result**: isc2-cc 100% via catalog gap closed; sp 86% — remaining 14% is curriculum scaffold (Unit 2)

### Phase 5 — Curriculum decisions (3 hubs)

These need real curriculum input before any code changes:

| Hub | Issue | Decision required |
|---|---|---|
| `forge/intro-computers` | 23 unbuilt cards (88% of hub) | UX path A (`coming-soon` placeholders) / B (suppress) / C (hide hub) |
| `shield/isc2-cc` Unit 2 | 11 dead `pis-NN` refs | Same UX path question |
| `shield/security-plus` Unit 2 | 17 dead `pis-NN` refs (superset of isc2-cc Unit 2) | Same UX path question |

Operator should pick one UX path that applies to all three hubs to keep the platform consistent.

## Aggregate impact

If the entire playbook is executed:

- HUB-001 finding count: **10 hubs broken → 0 hubs broken** (all cleared or explicitly placeholder-tolerated)
- Refs resolved: **507 → 507 LIVE-or-explicitly-handled** (out of which a small per-hub residual stays as `coming-soon` placeholders if Path A is chosen)
- Catalog growth: **+199 net new entries** (Phase 2: 155 + Phase 3 aliases: 44 + Phase 4: 50 + Phase 5: ~50 placeholders if Path A)
- Validator change: **1 file, ~10 lines** (Phase 1)
- Hub HTML changes: **0** (none of the recommended paths touch hub HTML — analytics-continuity preserved)

## What I will not do autonomously

- Approve any of the above
- Apply any catalog patches
- Make the validator change
- Pick UX paths for Phase 5
- Decide Phase 3 alias-vs-rename direction

## Cross-references

- Full per-hub artifacts: `_docs/operations/hub-001-*.md` (10 files)
- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Original strategy doc: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix (per-hub status table): `hub-001-all-hubs-analysis.md`
- Consolidated finding origin: `_tools/reports/TREASURE_MAP.json` filter `code: HUB-001`
