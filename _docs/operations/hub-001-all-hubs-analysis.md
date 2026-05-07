# HUB-001 — Consolidated 10-hub analysis (operator decision artifact)

## Summary

EduScan flags 10 hubs as referencing module IDs that don't exist in `ContentCatalog.js`. **Total: ~383 unmatched IDs across 10 files.**

After investigating each hub's naming pattern + the catalog's actual mapping, the patterns split into three classes that need different fixes. This doc enumerates each hub, identifies the class, and proposes the mechanical fix per class.

| Hub | Unmatched | Pattern | Class | Fix complexity |
|---|---|---|---|---|
| `cloud/server-plus` | 21 | `wsa-m{NN}-pres` | A — presentation-only of existing module | Add 21 alias entries OR rename hub IDs |
| `cloud/modules/wsa` | 22 | `m{NN}`, `capstone`, `gauntlet` (in-tree relative IDs) | A — short names of existing module entries | Same approach |
| `code/python-for-it` | 37 | `pfi-course-intro`, `pfi-op-{NN}` | B — ContentCatalog has different shape (`pfi-w{N}-{topic}`) | Need cross-walk |
| `divergent/ethics-it` | 30 | `eth-{NN}` | B — catalog has `eth-w{N}-{topic}` | Need cross-walk |
| `forge/intro-computers` | 25 | `fb-w{N}-{topic}-{kind}` | A — naming actually matches catalog if `forge-fb-` prefix added | Check prefix |
| `matrix/adv-linux` | 34 | `ala-l{NN}`, `ala-final` | B — catalog likely has different shape | Need cross-walk |
| `shield/isc2-cc` | 33 | `ms-sec-{NN}`, `pis-{NN}` | C — mixed; some are MS-SEC items shared with security-plus | Per-id review |
| `shield/security-plus` | 64 | `ms-sec-{NN}` (heavily) | C — shared MS-SEC namespace; some valid in catalog | Per-id review |
| `web/ccna` | 25 | `ccna-{NN}` | A — short names; catalog has full descriptive ones | Same approach |
| `web/network-plus` | 92 | `gui-*` heavily | D — `gui-` prefix suggests "guided/interactive" sub-content | Catalog convention question |

## Class A — short names of existing modules (4 hubs, ~93 IDs)

The hub uses short navigational IDs (`m01`, `ccna-01`, `wsa-m01-pres`) that map deterministically to descriptive catalog entries (`wsa-module01`, etc.).

**Two mechanical options identical to server-plus proposal:**
- **A1: Add catalog aliases** with `aliasOf` pointing to canonical entry
- **A2: Rename hub IDs** to match catalog

Recommendation: A1 (add aliases). Matches existing `forge-md101-m*` pattern in catalog. Lower-risk than touching hub HTMLs.

**Hubs in this class:** `cloud/server-plus` (21), `cloud/modules/wsa` (22), `web/ccna` (25), possibly `forge/intro-computers` (25).

## Class B — different shape entirely (3 hubs, ~101 IDs)

The hub uses one taxonomy (e.g., `eth-{NN}` numeric) but the catalog uses another (e.g., `eth-w{N}-{topic-slug}` week-and-topic). This isn't just a naming alias — it's a structural mismatch.

**Resolution requires curriculum decision:**
- Were the hub IDs created as a simpler navigational scheme that should be backfilled into the catalog?
- Or are the catalog IDs the canonical curriculum and the hub should be updated to match?

**Hubs in this class:** `code/python-for-it` (37), `divergent/ethics-it` (30), `matrix/adv-linux` (34).

These need operator-level curriculum review. Each hub has 30+ items. Cannot be resolved by mechanical alias.

## Class C — shared cross-track namespace (2 hubs, ~97 IDs)

`ms-sec-{NN}` IDs appear in both `shield/isc2-cc` and `shield/security-plus`. Some are valid catalog entries; some are not. The shared namespace suggests these were imported as a Microsoft Security curriculum and reused.

**Resolution requires:**
- Audit which ms-sec-{NN} IDs ARE in the catalog vs which aren't
- For missing ones: are they meant to be created (catalog needs new entries) or are they vestigial references that should be removed from hubs?

**Hubs in this class:** `shield/isc2-cc` (33), `shield/security-plus` (64).

## Class E — DEAD REFERENCES TO NONBUILT CONTENT (severity: STUDENT-IMPACT)

**New class added 2026-05-07 after deeper investigation of `forge/intro-computers`.**

The hub references content IDs that have NO matching files on disk and NO catalog entries. Students hitting these card slots see content that was never built. This is qualitatively different from naming/aliasing issues — it's a direct user-facing bug.

**Confirmed for `forge/intro-computers`:** 25 unmatched IDs investigated:
- 3 have actual files in `presentations/` directory (catalog entries needed)
- 22 reference nonexistent files (dead card slots)

**Operator-action priority on this hub:** HIGH.

**Catalog-aware auditor v2 at `_tools/audit-hub-deadrefs-v2.js`** — produces trustworthy 4-bucket classification:
- LIVE = catalog entry exists AND href file exists (good state)
- BROKEN = catalog has entry, href file missing (catalog drift)
- FILE_NO_CATALOG = file exists but no catalog entry (catalog gap)
- DEAD = no catalog entry AND no matching file stem

**Platform totals across 10 HUB-001 hubs (507 references):**
- 79 LIVE (16%)
- **0 BROKEN** (no catalog drift! catalog entries always have valid hrefs)
- **78 FILE_NO_CATALOG** (15% — real content needs catalog entries)
- **350 DEAD** (69% — needs operator review per ID: alias-to-existing OR true dead-ref)

The DEAD bucket overcounts true Class E by some fraction — many DEAD entries are likely Class A "needs alias to existing catalog entry whose href points to a file with a different stem" (e.g., `wsa-m01-pres` → catalog has `wsa-module01` whose href is `modules/wsa/m01-fundamentals/cloud-presentation.module.html`). The auditor cannot resolve this fuzzy mapping autonomously.

**Per-hub breakdown:**
| Hub | refs | live | fileNoCatalog | dead |
|---|---|---|---|---|
| `web/ccna` | 25 | 0 | **25** | 0 |
| `forge/intro-computers` | 26 | 0 | 0 | 26 |
| `code/python-for-it` | 39 | 0 | 0 | 39 |
| `divergent/ethics-it` | 44 | 14 | 0 | 30 |
| `matrix/adv-linux` | 38 | 0 | 0 | 38 |
| `cloud/modules/wsa` | 23 | 0 | 0 | 23 |
| `cloud/server-plus` | 21 | 0 | 0 | 21 |
| `shield/isc2-cc` | 58 | 15 | 0 | 43 |
| `shield/security-plus` | 118 | 33 | 0 | 85 |
| `web/network-plus` | 115 | 17 | 0 | 98 |

**Easiest win:** `web/ccna` — 25 file_no_catalog entries, all `ccna-01` through `ccna-25` style. Add 25 catalog entries → entire hub goes from 0% live to 100% live in one commit.

**Resolution options:**
- E1: Remove the 22 dead references from the hub HTML (truncate hub scope to what exists)
- E2: Build the 22 missing pieces of content (multi-week curriculum work)
- Hybrid: keep the 3 working items active, hide the 22 dead ones with a `data-status="planned"` attribute the hub renderer skips

**Recommendation:** E1 (remove dead refs) immediately + E2 if the curriculum genuinely needs the missing pieces.

**Auditing the other hubs for Class E:**
Run `node` script comparing each hub's `data-module` IDs to actual files on disk. For each hub:
- count(IDs) − count(files-on-disk) = dead card slots

Hubs likely affected (need verification): all of them, since none of the unmatched-ID samples appeared in the catalog and at least one (intro-computers) is largely dead refs.

## Class D — `gui-*` content convention (1 hub, 92 IDs)

`web/network-plus` references 92 IDs prefixed `gui-` (suggesting "guided" or "interactive"). The convention isn't documented in catalog. Either:
- These represent guided-walkthrough content the catalog doesn't describe yet
- OR the catalog convention should add a `gui-` prefix for interactive-mode counterparts of existing entries

**Hubs in this class:** `web/network-plus` (92). Largest single hub by far.

Per memory `feedback_no_architectural_debt.md` — never accept the debt; find broken architecture, propose only the fix. The fix here is: either build the catalog entries OR remove the dead references from the hub. Not "keep them flagged."

## Decision matrix for operator review

**Updated 2026-05-07 with cross-hub validator-widening evidence.** Suffix tolerance (component-suffix in addition to existing house-prefix) clears 68 refs across 4 hubs from a single 10-line validator change. See `hub-001-pfi-catalog-patch.md` Option 1.

| Hub | Status | Action |
|---|---|---|
| `web/ccna` | **READY** — paste-and-deploy | Operator approves `hub-001-ccna-catalog-patch.md` (31 entries, 25 modules + 6 labs) |
| `code/python-for-it` | **READY** — analysis complete | Operator picks Option 1/2/3/4 per `hub-001-pfi-catalog-patch.md` (31 of 39 refs clear via Option 1) |
| `cloud/server-plus` | Pending | Operator picks A/B/C per `hub-001-server-plus-proposal.md` |
| `cloud/modules/wsa` | **READY** — 3-option analysis | Operator picks per `hub-001-wsa-catalog-patch.md`; consider together with server-plus |
| `web/network-plus` | Cross-hub Option 1 candidate (+18 clears) | Pair with PFI Option 1 decision — same validator change |
| `matrix/adv-linux` | Cross-hub Option 1 candidate (+14 clears) | Pair with PFI Option 1 decision — same validator change |
| `shield/security-plus` | **READY** — partner doc to isc2-cc | See `hub-001-security-plus-proposal.md` (28 sp-only paste-ready + 19 shared with isc2-cc Unit 1 + 17 dead pis-NN). After both Unit 1's land: 86% of hub clears |
| `shield/isc2-cc` | **READY (split)** — 3 work units | See `hub-001-isc2-cc-proposal.md` (Unit 1: 22 paste-ready cross-house catalog entries; Unit 2: 11 dead pis-NN need curriculum; Unit 3: sp parity audit) |
| `divergent/ethics-it` | **READY** — paste-and-deploy | Operator approves `hub-001-ethics-it-catalog-patch.md` (30 entries: 15 numbered + 10 labs + 3 reviews + 2 exams). Same shape as ccna. |
| `forge/intro-computers` | **READY (split)** — Unit 1 paste-ready, Unit 2 awaits curriculum decision | See `hub-001-forge-intro-computers-proposal.md` |

## Recommended sequencing

1. **Quick wins (Class A — 4 hubs, ~93 IDs):** alias-add per existing MD-101 pattern. ~20 min total once intent confirmed. Eliminates ~25% of HUB-001 findings immediately.
2. **Class C audit (2 hubs, ~97 IDs):** which `ms-sec-{NN}` are valid. Eliminates HIGH severity on shield hubs.
3. **Class B curriculum review (3 hubs, ~101 IDs):** schedule a proper review session. These are real curriculum decisions.
4. **Class D (1 hub, 92 IDs):** depends on what `gui-*` actually represents. Likely needs operator-author input.

## What I will/won't do autonomously

**Will:** apply mechanical alias diffs for any hub the operator approves Class A treatment for. Each approved hub: ~5 min commit-ready diff.

**Won't:** invent catalog entries for unfamiliar IDs (Class B), guess at curriculum decisions, or touch the hub HTMLs without explicit "rename" approval.

## Cross-references

- Server-plus deep-dive: `_docs/operations/hub-001-server-plus-proposal.md`
- EduScan findings: `_tools/reports/TREASURE_MAP.json` (filter `code: HUB-001`)
- Triage queue: `_triage_queue` open items
- Catalog: `_app/components/ContentCatalog.js`
- Existing alias pattern reference: `forge-md101-m*` entries (search: "LearningPaths alias")
