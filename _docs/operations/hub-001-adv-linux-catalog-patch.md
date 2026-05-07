# HUB-001 — `matrix/adv-linux` catalog patch (ready to merge)

## Summary

Same shape as `divergent/ethics-it`: clean Class A finding, **all 20 dead references resolve to real files**, single-commit catalog patch flips the hub from current 11% live → 100% live (with Option 1 suffix-tolerance) or 11% → 53% live (without Option 1).

## Verified state

```
houses/matrix/adv-linux/index.html
  refs: 38
  live (current validator):           4   (house-prefix tolerance only)
  live (with Option 1 suffix tol.):  18   (+14 if PFI Option 1 approved)
  catalog gap (file exists):         20   (paste-ready below)
  true dead:                          0
```

The 14 LIVE-with-Option-1 entries are presentation IDs that resolve to canonical `matrix-ala-w{N}-{topic}-pres` catalog entries — same pattern PFI uses. They remain "dead" in HUB-001 reports until the validator is widened.

The 20 paste-ready entries split:

| Group | Count | File location |
|---|---|---|
| `ala-l{NN}` labs (CTF Lab series) | 12 | `labs/ala-l{NN}-{topic}/index.html` |
| `ala-r{1..5}` review docs | 5 | `ala-r{N}.html` (hub-root level) |
| `ala-midterm`, `ala-final` exams | 2 | `exams/ala-{midterm|final}.exam.html` |
| `ala-w1-cli` presentation | 1 | `presentations/ala-w1-cli-operations.presentation.html` |

The `ala-w1-cli` presentation has no canonical `matrix-ala-w1-cli-*-pres` entry — it's a real catalog gap, not a naming-drift case.

## Patch (paste into `_app/components/ContentCatalog.js`)

Insert near other `house: 'matrix'` ALA entries.

```js
        // ALA — labs (CTF Lab series, 12)
        { house: 'matrix', id: 'ala-l01', title: 'ALA-L01: Dead Cell Recovery', description: 'CTF lab — dead cell recovery scenario', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l01-dead-cell-recovery/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l02', title: 'ALA-L02: Grid Handshake', description: 'CTF lab — grid handshake protocol', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l02-grid-handshake/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l03', title: 'ALA-L03: Signal in the Noise', description: 'CTF lab — signal extraction from noise', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l03-signal-in-the-noise/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l04', title: 'ALA-L04: Lockdown Protocol', description: 'CTF lab — system lockdown procedure', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l04-lockdown-protocol/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l05', title: 'ALA-L05: The Insider', description: 'CTF lab — insider threat scenario', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l05-the-insider/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l06', title: 'ALA-L06: Field Assembly', description: 'CTF lab — field assembly drill', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l06-field-assembly/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l07', title: 'ALA-L07: Name Authority', description: 'CTF lab — name authority operations', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l07-name-authority/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l08', title: 'ALA-L08: The Night Shift', description: 'CTF lab — night shift operations', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l08-the-night-shift/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l09', title: 'ALA-L09: Poisoned Records', description: 'CTF lab — poisoned records detection', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l09-poisoned-records/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l10', title: 'ALA-L10: Ghost in the Cell', description: 'CTF lab — ghost-in-the-cell detection', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l10-ghost-in-the-cell/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l11', title: 'ALA-L11: Flatline', description: 'CTF lab — flatline scenario', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l11-flatline/index.html', category: 'ala' },
        { house: 'matrix', id: 'ala-l12', title: 'ALA-L12: Full Cell Audit', description: 'CTF lab — full cell audit', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'adv-linux/labs/ala-l12-full-cell-audit/index.html', category: 'ala' },
        // ALA — review docs (5)
        { house: 'matrix', id: 'ala-r1', title: 'ALA-R1: Cell Navigation', description: 'Foundational review on cell navigation', icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'adv-linux/ala-r1.html', category: 'ala' },
        { house: 'matrix', id: 'ala-r2', title: 'ALA-R2: Access Control', description: 'Foundational review on access control', icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'adv-linux/ala-r2.html', category: 'ala' },
        { house: 'matrix', id: 'ala-r3', title: 'ALA-R3: Process Authority', description: 'Foundational review on process authority', icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'adv-linux/ala-r3.html', category: 'ala' },
        { house: 'matrix', id: 'ala-r4', title: 'ALA-R4: Grid Basics', description: 'Foundational review on grid basics', icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'adv-linux/ala-r4.html', category: 'ala' },
        { house: 'matrix', id: 'ala-r5', title: 'ALA-R5: Signal Processing', description: 'Foundational review on signal processing', icon: '/assets/images/icons/icon-scroll.webp', status: 'available', components: ['review'], href: 'adv-linux/ala-r5.html', category: 'ala' },
        // ALA — exams (2)
        { house: 'matrix', id: 'ala-midterm', title: 'ALA Midterm Exam', description: 'Midterm exam covering weeks 1-2', icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['exam'], href: 'adv-linux/exams/ala-midterm.exam.html', category: 'ala' },
        { house: 'matrix', id: 'ala-final', title: 'ALA Final Exam', description: 'Final exam covering all 4 weeks', icon: '/assets/images/icons/icon-notepad.webp', status: 'available', components: ['exam'], href: 'adv-linux/exams/ala-final.exam.html', category: 'ala' },
        // ALA — additional presentation (1)
        { house: 'matrix', id: 'ala-w1-cli', title: 'Advanced CLI Operations', description: 'Week 1 advanced CLI operations presentation', icon: '/assets/images/icons/icon-terminal.webp', status: 'available', components: ['presentation'], href: 'adv-linux/presentations/ala-w1-cli-operations.presentation.html', category: 'ala' },
```

(20 entries total: 12 labs + 5 reviews + 2 exams + 1 presentation)

## Coverage table after both patches land

| Status | Count | Path |
|---|---|---|
| LIVE today (house-prefix only) | 4 | (4 of 38 = 11%) |
| + this patch (20 entries) | 24 | (63%) |
| + PFI Option 1 (suffix tolerance, +14) | **38** | (100% — full hub clears) |

## Pairing with PFI Option 1

This hub is a **cross-hub Option 1 candidate**. If PFI Option 1 is approved:
- 14 of 38 refs resolve via suffix tolerance (no code change for matrix needed)
- This patch (20 entries) closes the rest
- Hub goes 100% live in one validator change + one catalog commit

If PFI Option 1 is NOT approved, the 14 presentation IDs remain HUB-001 findings until separate alias entries are added (~14 more catalog entries, similar to PFI Option 2). This patch alone would not clear the hub.

**Operator decision sequencing**:
1. Decide PFI Option 1 first (covers 4 hubs at once, including matrix)
2. Apply this matrix patch (clears the remaining 20 catalog gaps)
3. Hub HUB-001 finding fully cleared

## Verification

All 20 paths verified to exist on disk by `_tools/audit-hub-deadrefs-v2.js` run on 2026-05-07. Titles extracted from each file's `<title>` tag.

## How to apply (if approved)

```bash
# After operator approves:
# 1. Open _app/components/ContentCatalog.js
# 2. Find a 'matrix' house section (search: house: 'matrix')
# 3. Paste the 20 entries above
# 4. Save
# 5. node _tools/eduscan/cli.js --files _app/components/ContentCatalog.js,_app/houses/matrix/adv-linux/index.html
#    Verify HUB-001 cleared (or reduced from 38 to 14 if Option 1 not yet applied)
# 6. git add _app/components/ContentCatalog.js && git commit
# 7. ./deploy.sh --only hosting
```

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Sister proposals (Class A paste-and-deploy): `hub-001-ccna-catalog-patch.md`, `hub-001-ethics-it-catalog-patch.md`
- Cross-hub Option 1 dependency: `hub-001-pfi-catalog-patch.md`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
