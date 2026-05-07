# HUB-001 — Medium-severity batch (17 hubs, 335 entries, all paste-ready)

## TL;DR

The 17 medium-severity HUB-001 hubs (those with <20 broken refs each, not in the high-severity 10) are **the cleanest possible HUB-001 finding**: ALL 335 broken refs across 17 hubs are catalog gaps with files-on-disk. **Zero true dead refs.** Same shape as ethics-it/network-plus, scaled.

A single batch catalog patch (335 entries) clears all 17 medium-severity HUB-001 findings in one commit.

## Verified state

```
Hub                                                refs  live  fileGap  dead
----------------------------------------------------------------------------
houses/cloud/cloud-essentials/index.html             26     0       26     0
houses/cloud/cse/index.html                           8     0        8     0
houses/cloud/openstack/index.html                     4     0        4     0
houses/code/python-programming/index.html            26     0       26     0
houses/divergent/cybersecurity-policy/index.html     50     0       50     0
houses/eye/cysa/index.html                           16     0       16     0
houses/forge/hardware-support/index.html             26     0       26     0
houses/forge/md-100/index.html                       11     0       11     0
houses/forge/md-101/index.html                        9     0        9     0
houses/forge/server-management/index.html            26     0       26     0
houses/script/linux/index.html                       12     0       12     0
houses/shield/cyber-framework/index.html              8     0        8     0
houses/shield/infosec/index.html                     40    21       19     0
houses/shield/intro-security/index.html              32     0       32     0
houses/shield/ms-security/index.html                 10     0       10     0
houses/web/intro-networks/index.html                 26     0       26     0
houses/web/net-essentials/index.html                 26     0       26     0
----------------------------------------------------------------------------
                                            TOTALS  346    21      335     0
```

(`infosec` has 21 LIVE because it shares many IDs with `isc2-cc` whose entries are already in catalog.)

## Why this is "the cleanest possible" finding

For every one of the 335 paste-ready entries:
- Hub has `data-module="ID"` and `<a href="path">`
- The `path` resolves to a real file on disk (verified)
- No catalog entry exists with this ID
- Adding the catalog entry resolves the HUB-001 finding without any other change

No curriculum decisions, no UX paths, no naming-convention picks, no analytics-continuity risk. This is paste-and-deploy at scale.

## Pre-generated entries

`_docs/operations/hub-001-medium-entries.txt` — 335 catalog entries grouped by hub, ready to paste into `_app/components/ContentCatalog.js`. Each entry has:
- `house` — derived from hub path
- `id` — exact ID from hub's `data-module`
- `title` — extracted from each file's `<title>` tag (best-effort; some files have no `<title>` and fall back to the ID)
- `description` — same as title (operator may refine)
- `icon` — chosen by component type (`presentation` → desktop, `lab` → microscope, `quiz`/`exam` → notepad, `module`/`applet` → network, `review` → scroll)
- `status: 'available'`
- `components: ['<kind>']` — single-component (kind inferred from href path/extension)
- `href` — relative to the hub's house directory (e.g., `cloud-essentials/presentations/...`)
- `category` — set to the house name (operator may refine for cross-cutting categories)

## Operator review notes before merging

1. **Title placeholders**: ~10-15 entries have the ID as the title because the source file lacks a `<title>` tag. Search the entries file for `title: "<id-shape>"` patterns (e.g. `title: "sr-w2-virtual-pres"`) and pull canonical titles from `<h1>` or replace from curriculum docs.

2. **Category field**: I defaulted to the house name. Operator may prefer per-course categories (`category: 'cloud-essentials'` rather than `category: 'cloud'`). Existing catalog uses both conventions.

3. **Icon choice**: heuristic by file path. Operator can override per-house style (e.g. shield curriculum may want `icon-shield.webp` not `icon-network.webp` for `module` types).

4. **Component type**: derived from path/extension. Some files in unusual paths (e.g. `applets/` directory but `.module.html` extension) may classify wrong.

## How to apply (if approved)

```bash
# 1. Open _app/components/ContentCatalog.js
# 2. Find a section near other multi-house entries (e.g., the bulk MD-101 alias block)
# 3. Paste the contents of _docs/operations/hub-001-medium-entries.txt
#    OR split into 17 hub-grouped insertions near each house's existing block
# 4. Save
# 5. node _tools/eduscan/cli.js  →  HUB-001 medium count drops from 17 → 0
# 6. git add _app/components/ContentCatalog.js && git commit
# 7. ./deploy.sh --only hosting
```

## Aggregate impact (this proposal + execution playbook)

If THIS proposal lands (335 entries) AND the existing high-severity execution playbook lands (199 entries):

| Status | HIGH HUB-001 | MEDIUM HUB-001 |
|---|---|---|
| Today | 10 hubs broken | 17 hubs broken |
| After playbook + this | 0 broken | 0 broken |
| Net catalog growth | +199 | +335 |

**Total catalog growth: +534 entries. Total HUB-001 findings cleared: 27 hubs.**

## What I will not do autonomously

- Apply the 335-entry patch
- Refine the ~10-15 placeholder titles
- Pick category/icon overrides per house

## Cross-references

- Generated entries file: `_docs/operations/hub-001-medium-entries.txt`
- High-severity execution playbook: `_docs/operations/hub-001-execution-playbook.md`
- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Strategy umbrella: `_docs/operations/sym-8-hub001-fix-proposal.md`
- Methodology proven on 4 high-severity hubs (ccna, ethics-it, adv-linux, network-plus); same algorithm
