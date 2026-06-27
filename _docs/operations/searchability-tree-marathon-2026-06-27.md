# Searchability + Catalog/Hub-Tree Marathon (started 2026-06-27)

**Sprint:** `MARA-SEARCH-1`. **Trigger:** operator found the Security+ hub wasn't findable in
GlobalSearch — it had no `ContentCatalog` entry. Goal: **every content item findable in search AND
present in the catalog/hub tree.**

## The two completeness axes (both have scan rules)
1. **Searchable** — content FILE has a `ContentCatalog` entry. GlobalSearch runs
   `ContentCatalog.search()`, so a file with no catalog entry is invisible.
   - **Scan rule: CAT-002** ("Content file X not declared in ContentCatalog"), in
     `_tools/eduscan/strict-orphan-scanner.js` / `validators/syntax/content-catalog.js`.
2. **In the tree** — catalog ITEM is in a hub / learning path (reachable, not stranded).
   - **Scan rule: strict-orphan-scanner** (`node _tools/eduscan/strict-orphan-scanner.js`, read-only,
     writes `_tools/reports/STRICT_ORPHAN_MAP.json`). Hub signals it recognizes: `data-module` refs,
     `LearningPaths.PATHS`, dedicated-engine refs, inline-hub script id arrays (e.g. CORE1_REGISTRATIONS).

## Current scan baseline (2026-06-27)
- **CAT-002 (not searchable):** 25 in stale findings → **15 truly current** (10 were the archived
  Security+ quiz-labs). Of 15, `forge-command-line` was already catalogued → **14 needed entries.**
- **strict-orphan (not in tree):** 77 orphans (catalog total 3646, 98% in-hub). Per house: shield 50,
  platform 9, web 7, others 1 each. NB: the shield 50 are largely Security+ items (hub entry + 9 arena
  boxes + PBQs + games) that ARE in the manifest-driven hub but the scanner doesn't read the JSON
  manifest as a hub signal → false-orphan. This is a SCANNER-COVERAGE gap as much as a content gap.

## DONE (2026-06-27) — CAT-002 searchability backfill (14 entries)
Added to `ContentCatalog.js` (verified searchable via `ContentCatalog.search`). IDs match each hub's
`data-module` refs where one exists, so they reconcile in-hub (not new orphans):
- **4 Security+ PBQs:** shield-pbq-{firewall-config,control-classification,attack-identification,crypto-selection}
- **5 forge A+ Core 1 physical labs:** forge-{cable-building,cpu-install,front-panel-header,keystone-jack,ram-install}
- **4 ALA lectures:** ala-w{1..4}-lecture (house matrix)
- **1 WSA game:** cloud-wsa-w3-module-studio
- Plus earlier this session: `shield-security-plus-cert-prep` hub entry (the original trigger).

## REMAINING (marathon tail)
- **Strict-orphan 77** — esp. resolve whether the manifest-driven Security+ hub should emit a hub
  signal the scanner recognizes (so its 9 boxes + PBQs + games stop reading as orphans), vs registering
  them via an inline id array. DECISION NEEDED (operator): teach the scanner to read manifests, OR add
  an inline-registration array to the Security+ hub. Then sweep platform/web/other-house orphans.
- **Broader CAT-002 sweep** — the 14 came from a stale-findings cross-check; run a fresh full content-vs-
  catalog diff per house to catch any not in the stale set (cannot run `nexus scan` — production write;
  use the read-only strict-orphan-scanner or a local glob-vs-catalog diff).

## METHOD (read-only, no production writes)
- `node _tools/eduscan/strict-orphan-scanner.js` → `_tools/reports/STRICT_ORPHAN_MAP.json` (in-hub vs orphan).
- Local glob of `_app/houses/**/*.{presentation,lab,applet,tool,quiz,module}.html` vs `ContentCatalog`
  hrefs → undeclared (CAT-002) list.
- For each gap: add a catalog entry (house + href relative to house, title, rich `keywords` so
  GlobalSearch matches), id = hub's data-module ref where present. Verify with `ContentCatalog.search`.
