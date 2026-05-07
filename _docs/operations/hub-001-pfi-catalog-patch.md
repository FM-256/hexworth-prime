# HUB-001 — `code/python-for-it` analysis (operator decision required)

## TL;DR

Unlike `web/ccna` (which was a clean catalog gap), **PFI is a naming-convention drift, not a content gap**. The catalog already has 33 of 39 hub-referenced items; they just live under different IDs (`code-pfi-{slug}-{component}`) than the hub uses (`pfi-{slug}`). The HUB-001 finding is a real mismatch but it does not represent broken cards for students — every reference resolves to a real file.

This means PFI is **not a paste-31-entries fix like ccna**. It is an architecture decision about which ID convention is canonical and how to align the two surfaces. **Operator must pick the direction before any code changes.**

## Verified state

```
houses/code/python-for-it/index.html
  refs: 39  |  live: 0  broken: 0  fileNoCatalog: 34  dead: 5
```

The catalog-aware audit reports 0 LIVE because it does literal ID matching. The HUB-001 validator does the same with house-prefix tolerance only (it tries `pfi-{x}` and `code-pfi-{x}` but not `code-pfi-{x}-pres`). Neither tool models the catalog's component-suffix convention.

## The actual mapping (33 of 39 already cataloged)

Suffix-strip resolution (`{house}-{id}-{pres|lab|quiz|classroom|inclass}`) finds existing catalog entries for 33 hub IDs:

| Hub `data-module` | Existing catalog id | Component |
|---|---|---|
| `pfi-course-intro` | `code-pfi-course-intro-pres` | presentation |
| `pfi-sandbox-tour` | `code-pfi-sandbox-tour-lab` | lab |
| `pfi-w1-checkpoint` | `code-pfi-w1-checkpoint-lab` | lab |
| `pfi-w1-conditionals` | `code-pfi-w1-conditionals-pres` | presentation |
| `pfi-w1-datatypes` | `code-pfi-w1-datatypes-pres` | presentation |
| `pfi-w1-loops` | `code-pfi-w1-loops-pres` | presentation |
| `pfi-w1-project` | `code-pfi-w1-project-lab` | lab |
| `pfi-w1-quiz` | `code-pfi-w1-quiz-quiz` | quiz |
| `pfi-w1-sandbox` | `code-pfi-w1-sandbox-lab` | lab |
| `pfi-w2-builtins` | `code-pfi-w2-builtins-pres` | presentation |
| `pfi-w2-checkpoint` | `code-pfi-w2-checkpoint-lab` | lab |
| `pfi-w2-dicts` | `code-pfi-w2-dicts-pres` | presentation |
| `pfi-w2-lists` | `code-pfi-w2-lists-pres` | presentation |
| `pfi-w2-project` | `code-pfi-w2-project-lab` | lab |
| `pfi-w2-quiz` | `code-pfi-w2-quiz-quiz` | quiz |
| `pfi-w2-sandbox` | `code-pfi-w2-sandbox-lab` | lab |
| `pfi-w2-strings` | `code-pfi-w2-strings-pres` | presentation |
| `pfi-w3-checkpoint` | `code-pfi-w3-checkpoint-lab` | lab |
| `pfi-w3-functions` | `code-pfi-w3-functions-pres` | presentation |
| `pfi-w3-graphics` | `code-pfi-w3-graphics-pres` | presentation |
| `pfi-w3-oop` | `code-pfi-w3-oop-pres` | presentation |
| `pfi-w3-project` | `code-pfi-w3-project-lab` | lab |
| `pfi-w3-project-oop` | `code-pfi-w3-project-oop-lab` | lab |
| `pfi-w3-quiz` | `code-pfi-w3-quiz-quiz` | quiz |
| `pfi-w3-random` | `code-pfi-w3-random-pres` | presentation |
| `pfi-w3-sandbox` | `code-pfi-w3-sandbox-lab` | lab |
| `pfi-w4-applied` | `code-pfi-w4-applied-pres` | presentation |
| `pfi-w4-checkpoint` | `code-pfi-w4-checkpoint-lab` | lab |
| `pfi-w4-final-project` | `code-pfi-w4-final-project-lab` | lab |
| `pfi-w4-gui` | `code-pfi-w4-gui-pres` | presentation |
| `pfi-w4-gui-classroom` | `code-pfi-w4-gui-classroom` | presentation |
| `pfi-w4-gui-inclass` | `code-pfi-w4-gui-inclass` | lab |
| `pfi-w4-sandbox` | `code-pfi-w4-sandbox-lab` | lab |

## The 6 truly missing items (real catalog gaps)

These have files on disk but no catalog entry under any naming convention:

| Hub `data-module` | File on disk | Notes |
|---|---|---|
| `pfi-w4-final-exam` | `_app/houses/code/python-for-it/exams/pfi-w4-final-exam.exam.html` | True catalog gap — final exam not registered |
| `pfi-setup-guide` | `_app/houses/code/python-for-it/setup-guide.html` | File-stem mismatch (no `pfi-` prefix); standalone reference doc |
| `pfi-op-01` | `_app/operator/missions/pfi-op-01.mission.html` | Cross-house ref — Operator track |
| `pfi-op-02` | `_app/operator/missions/pfi-op-02.mission.html` | Cross-house ref — Operator track |
| `pfi-op-03` | `_app/operator/missions/pfi-op-03.mission.html` | Cross-house ref — Operator track |
| `pfi-op-04` | `_app/operator/missions/pfi-op-04.mission.html` | Cross-house ref — Operator track |

The 4 op-* refs deserve special attention. They cross hub boundaries (`code/python-for-it` references content under `operator/missions/`). The HUB-001 validator flags this as a missing catalog entry. Whether the cross-house render is correct at runtime depends on how the renderer handles paths with `../../../` — needs verification before recommending a fix.

## Four options (operator picks)

### Option 1 — Widen the HUB-001 validator's tolerance algorithm

The validator already does house-prefix tolerance (lines 56-62 of `_tools/eduscan/validators/syntax/hub-refs.js`). Add component-suffix tolerance: try `{house}-{id}-{pres|lab|quiz|classroom|inclass|module|exam|presentation}` resolutions before flagging.

**This is a cross-hub fix, not just PFI.** Running suffix-tolerance resolution against all 10 HUB-001 hubs:

| Hub | refs | currently resolved | with suffix tolerance | newly cleared |
|---|---|---|---|---|
| `code/python-for-it` | 39 | 2 | 33 | **+31** |
| `web/network-plus` | 115 | 23 | 41 | **+18** |
| `matrix/adv-linux` | 38 | 4 | 18 | **+14** |
| `shield/security-plus` | 118 | 54 | 59 | **+5** |
| Other 6 hubs | — | — | — | +0 |
| **Total** | | | | **+68 refs across 4 hubs** |

- **Effect**: 68 ref resolutions clear from 4 hubs in one validator change.
- **Risk**: low. Validator is the only consumer; behavioral change is "fewer false positives," not "fewer real catches."
- **Touches**: 1 file (`_tools/eduscan/validators/syntax/hub-refs.js`), ~10 lines.
- **Open question**: does this hide a real architecture-debt smell, or codify a legitimate two-namespace pattern (catalog-id ≠ hub-data-module)? The fact that 4 different hubs (4 different course teams) independently arrived at the same naming pattern is evidence the two-namespace pattern is intentional.

### Option 2 — Add 33 short-id catalog aliases

Add 33 entries to `ContentCatalog.js` with the short hub IDs (e.g. `pfi-w1-conditionals`) pointing to the same hrefs as the existing canonical entries.

- **Effect**: catalog has 33 new entries (with explicit `aliasOf:` field — a new convention since `grep aliasOf` shows zero existing aliases).
- **Risk**: medium. New entries surface in search/discovery, ContentRegistry progress tracking, and LearningPaths mapping. Two entries for the same content can double-count.
- **Touches**: 1 file, +33 entries.

### Option 3 — Rename hub `data-module` values to canonical catalog IDs

Edit `_app/houses/code/python-for-it/index.html` to replace 33 `data-module="pfi-{slug}"` with `data-module="code-pfi-{slug}-{component}"`.

- **Effect**: hub's progress-tracking key changes from `pfi-{slug}` to `code-pfi-{slug}-{component}`. **This is a load-bearing change.**
- **Risk**: HIGH for analytics continuity. `ModuleProgress.complete(houseId, moduleId)` builds compound progress keys from data-module values. Existing student progress records keyed under the old short-ID would orphan unless migrated.
- **Required investigation before approving this option**: how many active progress records exist under `pfi-{slug}` keys today; whether `migrateLegacyKey` covers this case; the existing memory `reference_module_progress_migrate_legacy_key.md`.

### Option 4 — Status quo + treat HUB-001 PFI finding as known-tolerated

Acknowledge the catalog-id-vs-data-module mismatch as architectural by design (catalog IDs identify content metadata; data-module values identify progress slots). Document the convention. Suppress HUB-001 for PFI specifically until validator is widened (Option 1).

- **Effect**: HUB-001 stays HIGH; finding is tracked but not flagged as actionable.
- **Risk**: low. No code changes.
- **Cost**: living with a HIGH finding indefinitely (per `feedback_no_architectural_debt.md` — this is exactly the "accept the debt" pattern that memory says NOT to accept).

## What needs separate triage (regardless of option chosen)

The 6 truly missing catalog entries:

1. **`pfi-w4-final-exam`** — straightforward catalog add. File exists, just needs an entry. ~1 line.
2. **`pfi-setup-guide`** — straightforward catalog add. File at `setup-guide.html`. ~1 line.
3. **`pfi-op-01..04`** — cross-house refs. Need:
   - Verification that operator-track missions render correctly when navigated from PFI hub
   - Decision on whether catalog should have 4 cross-house entries with `house: 'code'` and `href: '../../operator/missions/pfi-op-NN.mission.html'`, OR whether the operator-mission catalog (if any) should own these
   - Confirmation that the operator track is even part of PFI's intended scope

## What I will not do autonomously

- Pick the option. Each has different long-term consequences for catalog architecture.
- Touch `data-module` values without explicit operator approval AND a verified migration plan (Option 3 risk).
- Add the 4 op-* catalog entries without confirming the cross-house render behavior.

## Recommendation framing (no ranking yet)

Both Option 1 (validator widening) and Option 2 (catalog aliases) are mechanical, low-risk, and clear the finding. Option 3 is the highest-quality long-term fix but carries analytics-continuity risk requiring its own investigation. Option 4 violates `feedback_no_architectural_debt.md`.

The choice between Option 1 and Option 2 hinges on a question only the operator can answer: **is the catalog-id ≠ data-module mismatch a legitimate two-namespace pattern, or is it convention drift that should be unified?**

If "legitimate two-namespace": pick Option 1 (widen validator).
If "drift that should be unified": pick Option 3 (rename hub) plus migration planning.
If "punt the architecture decision but clear the finding": pick Option 2 (aliases).

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Validator: `_tools/eduscan/validators/syntax/hub-refs.js`
- Consolidated analysis: `_docs/operations/hub-001-all-hubs-analysis.md`
- ccna patch (different shape): `_docs/operations/hub-001-ccna-catalog-patch.md`
- HUB-001 finding: `_tools/reports/TREASURE_MAP.json` filter `code: HUB-001 file: houses/code/python-for-it/index.html`
- Memory: `reference_module_progress_migrate_legacy_key.md` (relevant to Option 3)
- Memory: `feedback_no_architectural_debt.md` (Option 4 is precluded)
