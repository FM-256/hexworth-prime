# MARA-SEARCH-1 — Make all platform content searchable (DONE 2026-06-27)

**Goal:** every student-facing content page is findable in GlobalSearch (Ctrl+K), i.e. has an entry in
`_app/components/ContentCatalog.js` (GlobalSearch runs `ContentCatalog.search` only — no separate index).

## The lazy first pass (corrected)
The original attempt sized the gap from a STALE `_tools/nexus/findings.json` (CAT-002) and claimed ~14 items.
Operator flagged it: "you did your lazy shortcuts instead of doing the work... over 100 items." See
[[feedback_follow_instructions_not_commentary]].

## The real scan (2026-06-27)
Fresh comprehensive content-vs-catalog scan over actual current state:
- Enumerate every student-facing content file under `_app/` (suffixes .presentation/.lab/.quiz/.applet/
  .tool/.exam/.review/.game/.mission .html + chapter/games index.html; exclude _source/_archive/partials/
  vendor/_removed/etc.).
- Flag any whose canonical path is NOT a registered catalog href. Validated two ways (path-match AND
  basename-match) — they AGREE with **0 ambiguous** (no basename collisions), so the count is trustworthy.
- **Result: 595 true orphans** (was lazily "14"). By house: matrix 366 (piverse 150 + protocore 102 +
  adv-linux 18 + operator missions 96), cloud 75, web 57, script 35, dark-arts 30, signal 22, shield 6,
  divergent 4. By type: lab 172, presentation 146, quiz 131, mission 96, tool 27, exam 13, review 9.
- Nancy review caught: naive path-matching had ~270 FALSE matrix orphans (catalog uses `../houses/matrix/`
  hrefs + `_app/dark-arts/` vs `_app/houses/dark-arts/` dual location). Fixed with canonical-path normalization.

## Scope (operator sign-off 2026-06-27)
Operator chose to register ALL 595 — live courses (~470: PiVerse, ProtoCore, MS-102/AZ-104/PL-300, Network+/
CCNA, Root Access Linux, Signal Toolkit) + operator missions (96) + dark-arts vault/old (30).

## Execution
Automated generator: read each file's `<title>`/`<h1>` (cleaned), infer type from suffix, map house from path,
compute href via `os.path.relpath(file, house_basePath)` so every href reconstructs EXACTLY to its file
(handles the `../houses/matrix/` and `../../dark-arts/` forms), generate id from full path (unique),
keywords from title+course+type+house, description + tags + icon + category.

## Verification (all passed)
- `node --check` parses. 595 entries inserted (total 2719 → 3314). 0 id collisions with existing.
- **All 595 hrefs resolve to a REAL file — 0 404s.**
- Headless GlobalSearch.search() finds samples across every house (signal/cloud/matrix/dark-arts/web/
  divergent); each result's fullHref navigates to an existing file. 0 page errors.
- ContentCatalog.js now ~1.6MB (lazy-loaded only on first Ctrl+K; in-memory filter over 3314 entries is fast).

**Status: COMPLETE — all platform content is now searchable.**
