# PROG-003 Shared Progress Key Reconciliation (2026-05-09)

**Detection:** EduScan PROG-003 — `ModuleProgress.complete('HOUSE', 'KEY', ...)` called with the same key from multiple files.
**Status:** Read-only investigation complete. Operator decisions required for all 67 findings.
**Severity:** P1 active XP-suppression bug (revised from medium per validator).

## Executive summary

All 67 PROG-003 findings are in **ACTIVE-DUAL** routing state — both files in each pair are referenced by ContentCatalog, content-registry, and/or hub `index.html` files. This means every finding represents an active student-facing bug, not a zombie-file false positive.

**The bug:** `ModuleProgress.isFirstCompletion` (`_app/components/ModuleProgress.js:376` and `:530`) checks bare `moduleId` against `progress.completedModules` — no `houseId` scoping. When two files share the same `(houseId, moduleId)` key, only whichever the student completes FIRST records XP/badge/Firestore push. The second completion is silently suppressed.

**Operator must address:** 67 unique (house, moduleId) collisions across 4 distinct structural patterns. None are zombies. None are deferrable as documentation-only.

## Reproducibility

```bash
node _tools/eduscan/prog003-classifier.js              # human-readable
node _tools/eduscan/prog003-classifier.js --json       # machine-readable
```

The classifier verifies catalog/registry/hub references for each file in each pair, distinguishing ACTIVE-DUAL (both routed = real bug) from ZOMBIE-FILE (one path silently dead = validator FP).

## Routing-state classification

| State | Count | Meaning |
|---|---|---|
| ACTIVE-DUAL | 67 | Both files referenced from catalog/registry/hub — both have student traffic |
| ZOMBIE-FILE | 0 | One path has zero references — file exists but unreachable |
| ORPHANED-BOTH | 0 | Neither path referenced — collision but inert |

## Structural buckets

### Bucket 1 — CLH applet/module (13 findings)

CLH-003-intro through CLH-015-intro. Each has both a legacy applet wrapper AND a current module file. **Both confirmed live:**

- **Applet path** (`houses/script/clh/script-clh-NNN-intro.applet.html`): registered in ContentCatalog, content-registry.js, content-registry-migrated.js. ID `clh-NNN-presentation`.
- **Module path** (`houses/script/courses/clh/modules/clh-NNN/script-intro.module.html`): registered in ContentCatalog AND linked from `_app/houses/script/incubator/index.html`. ID `script-intro-N` (the CLH sequence).

**Two distinct student populations both affected:**
- **Population A** — students entering CLH via the sequential applet path (catalog ID `clh-NNN-presentation`). Their applet completion records `script-clh-NNN-intro` first; if they later access the module, no XP.
- **Population B** — students entering via the script `incubator/` hub or Eye/CyberOps cross-house links (catalog ID `script-intro-N`). Their module completion records first; if they later access the applet, no XP.

Cross-enrolled students (CLH sequential + Eye CyberOps integration) hit both paths within the same curriculum.

**Memory ref:** `reference_clh_three_layer_architecture.md` documents this as SYM-17 ("renaming applets is a 4-system change"). However, the existing memory description framed SYM-17 as architectural cleanup — this PROG-003 evidence reframes it as P1 with active XP suppression on two student populations simultaneously.

**Operator decisions required:**
1. Designate the canonical file (recommend the `.module.html` since `incubator/` hub already routes there for the active CLH curriculum).
2. Plan migration of student progress from `script-clh-NNN-intro` (legacy key) to whatever new keys the deduplication produces — see [`reference_module_progress_migrate_legacy_key.md`](../../.claude/projects/-home-eq-ai-content-hexworth-prime/memory/reference_module_progress_migrate_legacy_key.md).
3. Phase out the redundant catalog entries (see Bucket 1 sub-decision below).

### Bucket 2 — Network+ presentations dual-routed (30 findings)

`web-arp`, `web-cables`, ..., `web-wireless` — 30 (house='web', moduleId='web-XXX') collisions.

Pattern (representative example for `web-arp`):
- **Legacy file** (`houses/web/presentations/web-arp.presentation.html`): 1268 lines, simpler structure, 0 sections. Catalog ID `web-arp-pres`. Also referenced from `_app/components/LearningPaths.js:4832`, `_app/config/content-registry.js`, and `_app/config/content-registry-migrated.js`.
- **Network+ file** (`houses/web/network-plus/presentations/arp.presentation.html`): 1642 lines, 10 sections, Network+ N10-009 styled. Catalog IDs `web-arp` (category netplus) AND `web-np-arp-pres` (alternate alias). Linked from `_app/houses/web/network-plus/index.html:1073` (`data-module="web-arp"`).

Both files DIFFER in content but BOTH internally call `ModuleProgress.complete('web', 'web-arp', ...)`.

**Operator decisions:**
1. Confirm Network+ files are the canonical (current course rebuild). Likely yes given `_app/houses/web/network-plus/index.html` is the active course hub.
2. For each pair: determine if (a) legacy file should be deleted entirely, (b) legacy ID should be redirected to Network+ file at catalog level, OR (c) both kept but distinct keys assigned (`web-arp-pres` vs `web-arp` per the catalog IDs).
3. Verify `LearningPaths.js` and `content-registry*.js` references — these may be load-bearing for legacy-link redirects.
4. Plan key migration for any students currently holding `web-arp` completions in Firestore.

### Bucket 3 — Network+ tools dual-routed (3 findings)

`web-ospf-cost`, `web-port`, `web-qos`. Same pattern as Bucket 2 but for `tools/` files. Smallest cluster.

### Bucket 4 — Network+ labs dual-routed (9 findings)

`web-ne01-osi-scenario` through `web-ne08-wireless-scenario`, plus `web-packet-analysis`, `web-subnetting-practice`, `web-troubleshooting-lab`, `web-vlan-config`. Same pattern; legacy `web/labs/` vs Network+ `web/network-plus/labs/`.

Verified via `web-ne01-osi-scenario`:
- `web-ne01-osi-scenario` (catalog) → `labs/web-ne01-osi-scenario.lab.html`
- `web-np-ne01-osi-scenario-lab` (catalog) → `network-plus/labs/ne01-osi-scenario.lab.html`
- Both files exist and differ; both call `ModuleProgress.complete('web', 'web-ne01-osi-scenario', ...)`.

### Bucket 5 — Network Essentials → Network+ modules (10 findings)

`web-ne-01` through `web-ne-10`. Pattern: legacy `web/network-essentials/ne-NN.html` vs new `web/network-plus/modules/ne-NN.html`.

The "Network Essentials" course was the predecessor to the current Network+ rebuild. These modules likely should be deduplicated (delete legacy, point any redirects to network-plus).

### Bucket 6 — Network+ quiz (1 finding)

`web-networking-ch7-20`. Single finding pairing `web/quizzes/web-networking-ch7-20.quiz.html` vs `web/network-plus/quizzes/ch7-20.quiz.html`.

### Bucket 7 — Dark-arts CTF leaderboard (1 finding)

- `dark-arts/ctf-leaderboard.applet.html` — registered as ID `dark-arts-ctf-leaderboard` in ContentCatalog.js (vault-tools category). The catalog `href` is `../../dark-arts/ctf-leaderboard.applet.html` — UNUSUAL relative-path prefix; investigate during cleanup.
- `houses/dark-arts/tools/ctf-leaderboard/index.html` — exists; not directly registered in ContentCatalog.js but classifier finds it referenced (likely from another hub or tool registry).

Both call `ModuleProgress.complete('dark-arts', 'dark-arts-ctf-leaderboard', ...)`. Operator must decide canonical surface.

## Why this is P1 not medium

The validator marks PROG-003 as medium severity. That severity reflects the validator's pattern-detection scope, not the user impact. Concrete user impact:

- A student in CLH-003 sequential track completes the applet → `script-clh-003-intro` recorded, `+1000 XP`, badge logic fires.
- Same student opens CLH-003 module via Eye CyberOps cross-link → `isFirstCompletion=false`, no XP, no badge, `pushToUserProfile` skipped (line 565 — gated on `isFirstCompletion`).
- Student sees the module marked complete (because their bare `moduleId` is in `completedModules` from the applet hit) BUT instructor dashboards show only one of the two completions per session.

For Network+ students hitting the canonical N10-009 course content AFTER having previously visited a legacy `web-arp` page (e.g., via an old syllabus link), the canonical completion is silently rejected.

## Operator action plan (proposed sequencing)

This must be operator-driven; it is not autonomous-friendly. Proposed phasing:

### Phase 1 — Catalog cleanup (no Firestore writes)

For each bucket:
- Decide canonical file per finding (recommend Network+ files for buckets 2-6; recommend `.module.html` for CLH per existing memory).
- Remove redundant catalog entries OR mark them with `status: 'deprecated'` and a redirect target.
- Run `nexus full` (gated) and verify CAT-001/002/003 deltas.

### Phase 2 — Internal moduleId rename (per file, no student-data touch)

For each file determined "non-canonical":
- Change its internal `ModuleProgress.complete('web', 'web-XXX', ...)` to a distinct key (e.g., `web-XXX-legacy`) IF the file remains live as a redirect target.
- For files being deleted: skip; their key call is moot.

### Phase 3 — Student-data migration

Where the canonical key changes (rare; only if buckets 2-6 keep distinct legacy IDs), use `ModuleProgress.migrateLegacyKey` per memory `reference_module_progress_migrate_legacy_key.md`. Idempotent shim already exists for this exact purpose.

### Phase 4 — File deletion (only after Phases 1-3)

Delete or archive non-canonical files per `reference_we_do_not_destroy.md`. Diagnostic scripts and old reference content stay; only files confirmed redundant in catalog AND Firestore lineage are removed.

## Why "defer to SYM-17" was wrong (Nancy correction)

An earlier framing of this work suggested deferring the 13 CLH findings to the existing SYM-17 architectural cleanup ticket. Nancy correctly pushed back: SYM-17's existing description treats the applet-vs-module situation as an architectural quirk, not an active student-facing bug. The catalog-routing evidence in this reconciliation document shows both paths are LIVE for distinct student populations — the bug is firing every time a cross-enrolled student completes the same module via a second surface. Deferral framed as "architectural cleanup" would understate the urgency.

The 13 CLH findings should be addressed in Phase 1-3 above on the same priority as the Network+ rebuild duplicates. They are not lower priority just because they have a memory entry.

## Why "file deletion" alone does not fix this (Nancy correction)

A naive operator response to PROG-003 might be "delete the redundant file." That silences the validator (which requires two files calling the same key) but does NOT fix the underlying Firestore-key risk. Three separate decisions exist:

1. **Catalog dedup** — remove redundant route entry. Closes the "two student paths" problem at the routing layer.
2. **Key rename** — change the internal `ModuleProgress.complete()` key in non-canonical files to make them distinct. Closes the underlying validator finding even if both files survive.
3. **Migration** — if Firestore already holds completions under the soon-to-be-deprecated key, migrate them via `migrateLegacyKey` before key rename ships. Otherwise existing student progress orphans silently.

These three decisions must be sequenced per finding, not collapsed.

## Architecture refs

- Validator: `_tools/eduscan/validators/syntax/heuristics.js` (PROG-003)
- Classifier: `_tools/eduscan/prog003-classifier.js` (this artifact)
- ModuleProgress source: `_app/components/ModuleProgress.js` (lines 376, 530 — bare moduleId checks)
- Migration shim: `_app/components/ModuleProgress.js` `migrateLegacyKey` method, see `reference_module_progress_migrate_legacy_key.md`
- Catalog: `_app/components/ContentCatalog.js`
- Hub direct links: `_app/houses/web/network-plus/index.html`, `_app/houses/script/incubator/index.html`

## Caveats

1. **The classifier reports ACTIVE-DUAL based on text-grep references**, not runtime behavior. A reference in a `content-registry-migrated.js` file may be inert if the registry has been wholly replaced by ContentCatalog at runtime. Spot-check the registry-vs-catalog contract before treating "registry-only reference" as live.

2. **PROG-003 only fires for 2-file collisions** at this rule version. If a third file shares the same key (currently 0 cases per inspection but possible in the future), the validator may need widening — track separately.

3. **Bucket 7 dark-arts ctf-leaderboard** uses an unusual `../../dark-arts/...` relative path in its catalog `href`. This may indicate a different routing layer (admin panel? vault tool registry?). Investigate before deduplicating.
