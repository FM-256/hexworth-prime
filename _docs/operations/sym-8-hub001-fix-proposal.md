# SYM-8 — HUB-001 Fix Strategy Proposal

> 27 hubs, 503 broken `data-module` refs total. Each broken ref = a hub card pointing at content with no ContentCatalog metadata = a card that students see but cannot interact with normally (or that silent-fails to render content).
> Awaiting user direction on fix approach before any platform edits.

## Discovery summary

```
Hubs scanned:                 651
Hubs with broken refs:         27
Total broken refs:            503
```

### Top offenders (HIGH severity, ≥20 broken refs)

| Hub | Broken | Sample |
|---|---|---|
| `houses/web/network-plus/index.html` | 92 | web-network-essentials, web-ne-01, web-osi, web-osi-deep-dive, web-osi-tool, ... |
| `houses/shield/security-plus/index.html` | 64 | pis-01, pis-02, shield-five-pillars, shield-cybersecurity-controls, ... |
| `houses/code/python-for-it/index.html` | 37 | pfi-setup-guide, pfi-course-intro, pfi-w1-datatypes, pfi-w1-conditionals, ... |
| `houses/matrix/adv-linux/index.html` | 34 | ala-r1, ala-r2, ala-r3, ala-r4, ala-r5, ... |
| `houses/shield/isc2-cc/index.html` | 33 | pis-01, pis-02, pis-03, pis-04, pis-19, ... |
| `houses/divergent/ethics-it/index.html` | 30 | eth-r1, eth-r2, eth-r3, eth-01, eth-02, ... |
| `houses/forge/intro-computers/index.html` | 25 | fb-w1-word-pres, fb-w1-fundamentals-lab, fb-w1-word-lab, ... |
| `houses/web/ccna/index.html` | 25 | ccna-01, ccna-02, ccna-03, ccna-04, ccna-05, ... |
| `houses/cloud/modules/wsa/index.html` | 22 | m01..m22 (already fixed via P2-3, but hub still references old) |
| `houses/cloud/server-plus/index.html` | 21 | wsa-m01-pres, wsa-m03-pres, ... (cross-house refs) |

### Mid-tier hubs (MEDIUM, 10-19 broken)

`houses/shield/infosec` (19), `houses/eye/cysa` (16), `houses/script/linux` (12), `houses/forge/md-100` (11), `houses/shield/ms-security` (10).

### Small hubs (MEDIUM, 2-9 broken)

12 hubs, 52 refs total. Common pattern: hub renderer expects midterm/final exam entries that catalog doesn't have:

| Hub | Broken refs |
|---|---|
| `cloud/cloud-essentials` | cb-midterm, cb-final |
| `divergent/cybersecurity-policy` | csp-midterm, csp-final |
| `web/intro-networks` | fl-midterm, fl-final |
| `code/python-programming` | sp-w1-datatypes-lab, sp-w2-midterm, sp-w4-final |
| `forge/hardware-support` | bm-w1-mobo-pres, bm-midterm-exam, bm-final-exam |
| `shield/intro-security` | fw-midterm, fw-w3-social-pres, fw-final |
| `cloud/openstack` | lesson1, lesson2, lesson3, lesson4 |
| `forge/server-management` | sr-w2-virtual-pres, sr-midterm-exam, sr-w3-monitor-pres, sr-final-exam |
| `web/net-essentials` | cr-w2-network-pres, cr-midterm, cr-w3-app-pres, cr-final |
| `cloud/cse` | module01..module08 |
| `shield/cyber-framework` | mm01..mm08 |
| `forge/md-101` | m01..m09 |

---

## Why each ref is broken

Three observed root causes:

1. **Missing catalog entries** (most common) — the content file exists at the expected path but no ContentCatalog `MODULES` entry was added. Hub renderer checks the catalog, finds nothing, can't render the card properly.
2. **Naming mismatch** — content file exists, catalog entry exists, but the hub uses a different ID (e.g., hub uses `m01`, catalog has `wsa-module01`). The validator already does house-prefix tolerance — these survived.
3. **Stale references** — hub references content that was moved/deleted but never updated.

---

## Three fix strategies

### Strategy 1 — Per-hub manual fix (most thorough)

For each of the 27 hubs:
1. Open the hub
2. For each broken ref, identify whether the content file exists
3. If exists: add the catalog entry (with proper title, href, type, tags)
4. If missing: remove the hub reference OR build the missing content
5. Verify hub renders cleanly with a smoke gate test

**Pros:**
- Cleanest end state
- Catches stale refs (case 3) that other strategies might paper over
- Hub layouts get reviewed for sanity at the same time
- Each fix is a small, audit-trail-friendly commit

**Cons:**
- 27 hubs × ~5 fixes/hub average = ~135 manual decisions
- Slow if attempted as one bulk pass

### Strategy 2 — Catalog backfill (scripted)

Write a one-shot script that:
1. Reads every hub's `data-module` refs
2. For each unresolved ID, derives a stub catalog entry from the file path (if file exists)
3. Auto-generates `id`, `title` (humanized from filename), `href`, `type`, default `tags`
4. Appends to `_app/components/ContentCatalog.js` MODULES array

**Pros:**
- Single sweep handles all 503 refs
- Validator baseline drops from 27 to 0 in one commit
- Future hub additions don't need manual catalog updates

**Cons:**
- Stub entries get default titles ("M01", "Module01") — discoverability through search/tag remains poor until manually polished
- Catalog explodes in size (~500 stub entries)
- Doesn't catch case 3 (stale refs to nonexistent files) — those become catalog entries pointing at dead paths
- Risk of polluting catalog with low-quality entries

### Strategy 3 — Hybrid by hub size (recommended)

| Hub size | Strategy |
|---|---|
| **HIGH** (≥20 refs, 10 hubs) | Per-hub manual fix — these are the high-blast-radius hubs and benefit from careful review. Each hub is its own commit. |
| **MEDIUM** (10-19 refs, 5 hubs) | Per-hub manual fix in batches of 2-3 hubs per commit |
| **SMALL** (<10 refs, 12 hubs) | Per-hub manual fix in one or two commits — most are just missing midterm/final entries, fast to add |

**Why hybrid:**
- The big hubs (network-plus 92, security-plus 64) deserve attention they wouldn't get from a script
- The small hubs are uniform enough that batched manual edits are fast
- No script means no dead-path catalog pollution

**Implementation order:**
1. Small hubs first (52 refs across 12 hubs, mostly midterm/final additions) — quick win, easy regression check
2. Mid-tier hubs next (~70 refs)
3. Big hubs last, one per commit, with smoke gate run after each

After each commit: re-run HUB-001 standalone, verify baseline drops as expected. Eventually tighten the regression baseline in `_tools/eduscan/tests/run.js` from 28 (current) to 0.

---

## Decision points for user

1. **Strategy 1, 2, or 3?** Strategy 3 (hybrid) recommended.
2. **Order of attack** — small hubs first (recommended) or biggest hubs first?
3. **Stale ref handling** — when a hub references content that doesn't exist on disk, default to (a) remove the hub reference or (b) leave a placeholder card with "coming soon" text?
4. **Pacing** — fix all in this sprint, or land in chunks across sprints?

---

## Reference

- Standalone audit data: `/tmp/hub001.json` (cleared next session — re-run `node -e ...` per validator file header)
- Validator: `_tools/eduscan/validators/syntax/hub-refs.js`
- Baseline lock: `_tools/eduscan/tests/run.js` (`KNOWN_HUB_BASELINE` constant)
- Sister doc: `prog003-rename-plan-2026-05-04.md` (similar pattern: discovery + per-collision plan + execution checklist awaiting approval)
