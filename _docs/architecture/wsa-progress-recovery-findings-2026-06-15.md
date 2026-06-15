# WSA Progress Recovery — Findings & Plan

| | |
|---|---|
| **Status** | Diagnosed · data located & proven recoverable · WSA map built · backfill dry-run passed · **NOT YET WRITTEN/DEPLOYED** (awaiting operator go-ahead on the gated write) |
| **Date** | 2026-06-15 |
| **Scope** | Tenant `summer-2026` WSA class (`tenants/summer-2026/classes/87KLCXr9hYSgdIKNuqXE`, courseId `wsa`, 17 students) |
| **Verdict** | **No data lost.** WSA progress is intact in Firestore but stored in a place the analytics never reads. Recoverable via backfill. |
| **Related** | `analytics-silo-bridging-scope-2026-06-14.md` (ALA fix, shipped) · memory `reference_analytics_silo_architecture` |
| **PII note** | Per-student names/grades are deliberately NOT in this doc (FERPA). Aggregate scope + the instructor's own account only. Per-student detail: re-run the read-only diagnostics in `_tools/diagnostics/tenant-analytics/`. |

## TLDR
The WSA instructor analytics were blank even though every student had done real work. Root cause: **WSA tracks progress in the browser** (`localStorage['wsa-course-progress']`, a nested per-module structure). A generic sync mirrors that whole blob into `users/{uid}/sync/localStorage` — so it reaches Firestore — **but it is never converted** into the flat `modulesCompleted[]` / `quizScores{}` shape that the tenant class doc and the dashboard read. ALA uses the standard `ModuleProgress` path (so it flows through cleanly); WSA rolled its own localStorage system the rest of the platform doesn't understand. The fix: populate the WSA course map (denominator) + backfill the class doc from the mirror (recovery) + make WSA write through the standard path (forward fix).

## Symptom
- ALA analytics render correctly (fixed + shipped 2026-06-15, commit `53d9ad2be`). WSA analytics show nothing.
- The WSA hub (`houses/cloud/modules/wsa/`) shows students modules **COMPLETED**, but those completions do not appear in the instructor analytics.

## Root cause — two progress systems
| | ALA (works) | WSA (blank) |
|---|---|---|
| Where the page records progress | `ModuleProgress.complete('matrix', id)` → flat ids | `WSAProgress` → `localStorage['wsa-course-progress']`, nested `{ m01: { presentation, guiLab, psLab, quiz } }` |
| Reaches Firestore? | Yes — flat `modulesCompleted[]`/`quizScores{}` per user, then synced into the class doc | Only as a **raw localStorage blob** in `users/{uid}/sync/localStorage.data['wsa-course-progress']` |
| Converted to the flat shape the class doc/analytics read? | Yes | **No** — never translated; the dashboard's read finds an empty class doc |
| Result | Analytics populated | Analytics blank despite real work |

The generic localStorage→Firestore mirror (`users/{uid}/sync/localStorage`: `{ data, keyCount, syncedAt }`) is what saved the day — it preserved the WSA progress server-side even though the course's own system never wrote the flat records.

## Evidence
1. **Instructor's own account (TNT XTRA, `PjfqXptQ6sdLJbgPHr6DB2geZ5y2` = `instructorUid`):** the WSA hub shows M01–M05 COMPLETED on screen, but the flat `modulesCompleted` field held **zero** WSA items. The completions were all in `localStorage['wsa-course-progress']`, mirrored to Firestore.
2. **Class-wide survey (read-only, from the mirror):** **all 17 students** have real WSA progress — ranging from 1 module to 11 fully-complete modules, with real quiz scores (70–100). The earlier "7 students / 14 items" count was a severe undercount because it only inspected the flat field, not the mirror.
3. **Nothing deleted:** the data present is consistent and complete; no orphaned/half-removed records. The analytics fix shipped 2026-06-15 was read/compute-only (zero writes).

## Recovery source (where the data actually lives)
```
users/{uid}/sync/localStorage
  ├─ data: { ...all localStorage keys... }
  │     └─ "wsa-course-progress": "{ \"m01\": { \"presentation\": true, \"guiLab\": true,
  │                                   \"psLab\": true, \"quiz\": { \"passed\": true, \"score\": 100 } }, ... }"
  ├─ keyCount
  └─ syncedAt
```
Other WSA localStorage keys also mirrored (not the core denominator): `wsa-gauntlet-state`, `wsa-failsafe-capstone`, `wsa-save-the-pod`, `hexworth_review_wsa`, `hexworth_progress_wsa`, per-slide keys.

## The fix (three parts)

### 1. Course map (denominator) — BUILT
`_app/tenant/wsa-map.js` populated: 19 module-chapters × 4 tracked components = **76 items**. Generated from a single source of truth (`/tmp/wsa_idmap.js` at build time) so map ids and backfill ids are guaranteed identical. Id scheme (matches the live page-emitted format, verified per-page):

| Component | Flat id | Goes to |
|---|---|---|
| presentation | `wsa-m##-pres` (m01–04, 07–09, 14–19) · `cloud-wsa-m##-presentation` (m05, 06, 10–13) | `modulesCompleted[]` |
| GUI lab | `cloud-wsa-m##-guilab` | `modulesCompleted[]` |
| PowerShell lab | `cloud-wsa-m##-pslab` | `modulesCompleted[]` |
| quiz | `wsa-m##` | `quizScores{}` (numeric score) or `modulesCompleted[]` (boolean-only completion) |

Mapping from the nested mirror → flat ids:
- `m##.presentation = true` → add `presId(##)` to `modulesCompleted`
- `m##.guiLab = true` → add `cloud-wsa-m##-guilab`
- `m##.psLab = true` → add `cloud-wsa-m##-pslab`
- `m##.quiz = { score: N }` → set `quizScores["wsa-m##"] = N`
- `m##.quiz = true` (passed, no score) → add `wsa-m##` to `modulesCompleted` (completion marked; **no fabricated score**)

### 2. Backfill (recovery) — DRY-RUN PASSED, not yet written
A one-time, **add-only** migration: read each student's `wsa-course-progress` from the mirror, convert to flat ids, and `arrayUnion`/`merge` into the class progress doc. Existing entries untouched; idempotent/re-runnable; students' own records and localStorage are not modified.

Dry-run aggregate (no writes performed): would add **325 module-completions + 97 quiz scores** across the 17 students; resulting per-student completion ranges from 1% to 58% against the full-course 76-item denominator (caps in the 50s because even the most active students have completed ~11 of 19 modules — accurate, not a bug).

Scope decisions (verified by enumerating every top-level key in all 17 mirrors):
- Only the 19 module keys `m01..m19` feed the denominator. The only non-module keys present are `midterm` (1 student) and `capstone` (1 student) — both the instructor's own test account; no `gauntlet`/`gauntlet-advanced` keys in this blob. They are **intentionally excluded** from the 76-item denominator (separate experiences, different structure). If they should be graded later, add to both the map and the converter.
- 2 quiz components are stored as boolean `quiz:true` (vs 97 as `{score:N}`); these are recorded as completions in `modulesCompleted` (no fabricated score), so they count toward completion but not the quiz average.
- A legitimate quiz `score:0` is routed to `quizScores` (not lost) and counts as both complete and scored.
- Backfill safety hardened after adversarial review: guards a stray `quiz:false`; logs (not silently swallows) any mirror parse error so corruption is distinguishable from no-activity.

### 3. Forward fix (stop the bleed) — SCOPED, not started
Make the WSA pages record completions through the standard `ModuleProgress`/class-sync path (as ALA does) so new work flows to Firestore + the class doc automatically, instead of only to localStorage. Requires tracing the WSA save path in the hub/page code. Until this lands, the backfill is a point-in-time snapshot and would need periodic re-runs.

## Progress safety (operator's hard gate)
- Map population: a static data file — no writes.
- Backfill: **add-only** (`arrayUnion`/`merge`) into the class doc — never deletes or overwrites; idempotent. **Backup-first** (snapshot the WSA class docs to a file) before any write. Dry-run reviewed before apply.
- Source data (`users/{uid}` + localStorage mirror) is read-only throughout.

## Status & gated next steps
1. WSA map — **built** (`_app/tenant/wsa-map.js`, 76 items), pending Nancy + Chris.
2. Backfill script — **dry-run passed**, pending Nancy + Chris.
3. Backup WSA class docs → file. *(gate: operator go-ahead)*
4. Apply backfill (add-only write). *(gate: operator go-ahead)*
5. Deploy map via `./deploy.sh`. *(gate: operator go-ahead — production write)*
6. Verify analytics render the recovered numbers.
7. Forward fix (separate work block).

## Diagnostics (read-only, reusable)
`_tools/diagnostics/tenant-analytics/` — all read-only (`.get()`/`listCollections()` only, no writes):
- `_diag_tenant_progress_universe.js` — captured ids per class
- `_diag_wsa_why.js` — sync-gap vs no-activity discriminator
- `_diag_wsa_survey.js` — true per-student WSA progress from the mirror
- `_diag_wsa_backfill_dryrun.js` — backfill preview (what would be written)
- `_diag_tnt_wsa_locate.js` / `_diag_tnt_localstorage_wsa.js` / `_diag_tnt_wsa_progresskey.js` — locating the data in the mirror
- `wsa_idmap.js` — shared id logic (map ↔ backfill consistency); `gen_wsa_map.js` — map generator
- Note: the survey/dry-run scripts reference `/tmp/wsa_idmap.js`; point them at the copy in this folder when re-running.
