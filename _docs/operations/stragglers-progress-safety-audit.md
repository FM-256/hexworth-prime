# Stragglers — User Progress Safety Audit

> **Purpose:** For every change in this branch, identify whether it touches student progress data (localStorage `hexworth_progress`, Firestore user docs, achievement records, completion flags). For each affected change, identify the impact and the safeguard.
>
> **Bottom line up front:** ONE class of changes (PROG-003 fix, 65 files) has a **known, documented, bounded impact** that is itself a CORRECTION of a pre-existing bug. All other changes are **progress-safe**.

---

## Audit by category

### Category A — PROG-003 progress-key rename (65 files, KNOWN IMPACT, documented)

**Files:** WSA child modules (53) + A+ Core 2 chapters (12)
- `_app/houses/cloud/modules/wsa/m{01..19}-*/cloud-{guilab,pslab,presentation}.module.html` (53)
- `_app/houses/forge/applets/comptia-aplus/core-2/chapters/ch{13..24}-*/index.html` (12)

**What changed:** Each file's `ModuleProgress.complete('house', 'OLD_SHARED_KEY', ...)` was rewritten to use a module-scoped key.

| Old shared key | New per-module pattern |
|---|---|
| `cloud-guilab` (17 files writing to same key) | `cloud-wsa-mNN-guilab` |
| `cloud-pslab` (17 files) | `cloud-wsa-mNN-pslab` |
| `cloud-presentation` (19 files) | `cloud-wsa-mNN-presentation` |
| `index` (12 A+ chapters writing to same key) | `forge-aplus-core2-chNN` |

**Impact on existing students:**
- localStorage `hexworth_progress.cloud.cloud-guilab = {completed: true}` was being OVERWRITTEN every time ANY of the 17 files marked complete. Net result: students had at most 1 completion recorded per series, regardless of how many they actually finished.
- Firestore XP/badge push: the `isFirstCompletion` check uses bare moduleId — only the FIRST writer per shared key triggered Firestore sync. So students who completed multiple modules in a series got XP credit for ONE only.

**Net effect post-deploy:** Students with old-shared-key completion records will see "0/N complete" on these series after deploy. Their NEW completions (re-completion of the same module they originally finished, OR completion of any other module in the series) will write to per-module keys correctly. Each per-module completion will trigger its own Firestore XP/badge push (was being suppressed before).

**This is a CORRECTION, not a loss.** The phantom 1-of-17 credit students had under the old shared key was an artifact of the bug. The fix makes XP per-completion accurate going forward.

**Documented in:** `_docs/operations/stragglers-deploy-notes.md` (Nancy round-2 verdict: acceptable regression; migration option-b "fan out to all N" was ruled a lie because it would invent which of N modules a student completed).

**Safeguard:**
- **Schedule deploy outside WSA + A+ Core 2 active class hours** (per deploy notes).
- **Optional pre-deploy:** post a heads-up notice on affected hub indices explaining the one-time progress reset and the bug fix it enables.
- **No client-side migration shim** — Nancy round-2 ruled migration would be dishonest (cannot determine which of N modules a student actually completed from a single shared-key record).

---

### Category B — Catalog id rename via CAT-006 cleanup (164 ids, NO PROGRESS IMPACT)

**Files:** `_app/components/ContentCatalog.js` (164 catalog entries)

**What changed:** Stripped `.module / .tool / .lab / .quiz / .applet` suffix from 164 catalog ids.
- Example: `code-arm-asm-01-intro.module` → `code-arm-asm-01-intro`

**Impact analysis:**
- Catalog ids are used for: catalog listings, search/discovery, hub data-module attrs, LearningPath references.
- Student progress keys are written by each `.module.html` file's `ModuleProgress.complete(houseId, moduleId, ...)` call. The moduleId argument comes from the FILE's own constant, not the catalog. The 164 file's calls were ALREADY using the clean form (`arm-asm-01-intro`) — that's why scanner Mech 4 had to strip the suffix to match.
- Therefore: existing progress records under clean-form keys (`hexworth_progress.code.arm-asm-01-intro`) are UNCHANGED. The catalog rename brings catalog ids INTO ALIGNMENT with what student progress already uses.

**Verified:** Nancy round-3 audit confirmed no runtime consumers reference the suffix-form catalog ids (only EduScan does, for in-hub matching).

**Safeguard:** None needed. Pure data alignment, no progress impact.

---

### Category C — Hub `data-module` rename (WSA hub only, LOW IMPACT, display-only)

**Files:** `_app/houses/cloud/modules/wsa/index.html`

**What changed:** WSA hub's 22 `data-module` attrs renamed from short navigation ids (`m01..m19`, `midterm`, `capstone`, `gauntlet`, `gauntlet-advanced`) to catalog ids (`wsa-module01..wsa-module19`, `wsa-midterm-outpost`, etc.).

**Impact analysis:**
- `data-module` attr is read by `HouseRenderer` to display per-module completion checkmarks on hub cards. The renderer reads `hexworth_progress[house][data-module-value]`.
- BEFORE: hub looked up `hexworth_progress.cloud.m01` → empty (no file was writing to `m01`). Display always 0/N regardless of student progress.
- AFTER: hub looks up `hexworth_progress.cloud.wsa-module01` → may or may not have a record depending on whether ANY child file wrote to it. Likely still empty since the actual writes are now per-module-scoped (`cloud-wsa-m01-presentation` etc.) — different keys.

**Net effect:** Hub display behavior is unchanged from the student's perspective — still 0/N. The fix is upstream of the display problem.

**Safeguard:** None needed. Display behavior unchanged.

**Note for future:** STR-44 (HUB-001) tracks the broader pattern. Eventually the hub renderer should look up child completion + roll up to parent completion display, but that's a separate sprint.

---

### Category D — Catalog `df-61` ADDITION (1 entry, NO IMPACT)

**Files:** `_app/components/ContentCatalog.js` (1 new entry: `forensics/df-61`)

**What changed:** Added catalog entry for an existing-on-disk forensics module that was undeclared.

**Impact analysis:** Pure ADD. No existing record affected.

**Safeguard:** None needed.

---

### Category E — Tag canonicalization via TAG-001 (23 case-variant pairs, NO PROGRESS IMPACT)

**Files:** `_app/components/ContentCatalog.js` (433 tag arrays processed)

**What changed:** Lowercased tag string values: `SIEM` → `siem`, `Linux` → `linux`, etc.

**Impact analysis:** Tags are used only for search/discovery filtering. No relation to user progress, achievements, or XP. Localizing tag case affects only what students see when filtering by tag.

**Safeguard:** None needed.

---

### Category F — Forensics file MOVES with redirect (60 files, NO PROGRESS IMPACT, 301 backed)

**Files:**
- 60 files moved from `_app/forensics/` to `_app/houses/eye/forensics/` (R095/R099/R100/R062 — git rename detection)
- `_app/forensics/index.html` simplified to a meta-refresh redirect to new location
- `firebase.json` adds `/forensics/**` → `/houses/eye/forensics/:splat` 301 redirect
- `_app/components/ContentDiscovery.js` + `_app/dashboard.html` updated nav refs

**Impact analysis:**
- Files MOVED but their internal `ModuleProgress.complete()` calls weren't changed. The progress key is the moduleId the file passes (e.g., `df-15-metadata`), not the file path. Existing progress records under those moduleIds are untouched.
- Old URLs (`/forensics/sections/disk-forensics/df-15-metadata.module.html`) → 301 redirect to new location. Bookmarks work.

**Safeguard:** None needed beyond what's already in place (301 redirect + meta-refresh fallback).

---

### Category G — Inline-id registration blocks (additive, NO PROGRESS IMPACT)

**Files:** ~25 hub `index.html` files where this branch APPENDED a `<script>` block with an array like `const NP_REGISTRATIONS = [...]`.

**What changed:** Pure addition of inline JS data. No HTML structure change above the new block. No `ModuleProgress.complete()` modification.

**Impact analysis:** These arrays are read only by EduScan (Mech 4 inline-id detection). Browser sees them but does nothing with them. Zero student-facing effect.

**Safeguard:** None needed.

---

### Category H — New files (71 added, NO PROGRESS IMPACT)

**Files:**
- 8 incubator `index.html` + 8 README.md
- 3 new curriculum hub `index.html` (databases, bash, cmmc)
- 3 forensics cert hub `index.html` (chfi/gcfa/gcfe)
- Plus tools, reports, docs

**Impact analysis:** All NEW. Nothing to overwrite, nothing to lose.

**Safeguard:** None needed.

---

## Verification script (run pre-deploy)

The repo includes a pre-deploy verification that confirms no progress-key risk slipped through unaudited:

```bash
cd /home/eq/ai-content/hexworth-prime
node _tools/eduscan/verify-progress-keys-changed.js
```

This script (added in this audit) walks every modified `.module.html` / `.html` file and reports any `ModuleProgress.complete('h', 'KEY', ...)` literal where the key string differs between master and HEAD. Operator can review the diff against the categories above.

---

## Summary table — branch impact on student progress

| Category | Files | Impact | Safeguard |
|---|---:|---|---|
| A. PROG-003 fix | 65 | **Known reset** of phantom-credit on WSA + A+ Core 2 series | Schedule outside class hours; deploy notes; optional heads-up notice |
| B. Catalog suffix cleanup | 1 (164 ids) | None | None needed |
| C. WSA hub data-module rename | 1 | Display unchanged from student view | None needed |
| D. df-61 addition | 1 | None (additive) | None needed |
| E. Tag canonicalization | 1 (433 tag arrays) | None (search only) | None needed |
| F. Forensics moves | 60 | None (301 + meta-refresh) | Already in place |
| G. Inline registration blocks | ~25 | None (EduScan-only data) | None needed |
| H. New files | 71 | None (additive) | None needed |

**Net student-impact assessment:** ONE bounded category (A) requires deploy scheduling consideration. All others are progress-safe.

**Per CLAUDE.md "we do not destroy" rule:** This branch produced ZERO file deletions. Every change is either an addition, a rename with redirect, or a within-file edit that preserves the file's existence.

---

## Recovery procedure (if something goes wrong post-deploy)

If unexpected progress damage is reported after deploy:

1. **Snapshot first** (no need to deploy anything yet — just collect diagnostics):
   ```bash
   cd functions
   node export-user-progress.js > /tmp/progress-snapshot-$(date +%Y%m%d).json
   ```
   (export-user-progress.js script — to be added if not already present)

2. **Identify scope** — query Firestore for affected user docs:
   ```bash
   node check-progress-keys.js --series wsa --series aplus-core2
   ```

3. **Revert deploy** (per CLAUDE.md Rule #10 + "we do not destroy"):
   ```bash
   git checkout master
   git revert -m 1 <merge-commit-sha>     # or reset to pre-merge if not pushed
   firebase deploy --only hosting          # restore prod to pre-Stragglers state
   ```

4. **Restore progress** if individual records were genuinely lost (not phantom):
   - Use export-user-progress snapshot to identify lost completions.
   - Restore via Firestore Admin SDK (one-off script per affected user).
