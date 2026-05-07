# HUB-001 — `shield/isc2-cc` proposal (split into 3 work units)

## TL;DR — split, like forge

`shield/isc2-cc` is a mixed-pattern hub: 25 of 58 references already resolve via house-prefix tolerance (live), 22 reference real cross-house files but lack catalog entries (catalog gap), 11 reference files that don't exist (true dead refs).

Three independent work units:

| Work unit | Scope | Risk | Operator decision |
|---|---|---|---|
| **Unit 1 — Cross-house catalog patch (22 entries)** | Add catalog entries for ms-sec-*, pis-l*, and shield-* refs whose files exist outside the hub directory | LOW. All hrefs verified. | Approve paste-and-deploy |
| **Unit 2 — Dead `pis-NN` refs (11 IDs)** | Files at `_app/houses/shield/infosec/pis-NN.html` do NOT exist | MEDIUM. Same shape as forge Unit 2 — needs UX path (A/B/C) + curriculum decision | Curriculum review |
| **Unit 3 — security-plus parity audit** | 48 of these 58 IDs are also in `shield/security-plus/index.html` (118 total). Decisions for isc2-cc must be applied consistently to security-plus | n/a (next firing) | Tracked separately |

Lead with Unit 1. Unit 2 needs curriculum input. Unit 3 next firing.

## Verified state

```
houses/shield/isc2-cc/index.html
  refs: 58  |  live: 0  broken: 0  fileNoCatalog: 0  dead: 43
```

The "dead: 43" overcounts because the auditor only stem-matches inside the hub's own directory. Manual href + house-prefix audit corrects:

| Bucket | Count | Resolution |
|---|---|---|
| **LIVE via house-prefix tolerance** | 25 | catalog has `shield-{id}` (validator already resolves) |
| **CATALOG GAP — file exists** | 22 | href points to real file; no catalog entry |
| **TRUE DEAD — file missing** | 11 | href points at nonexistent file |

## Unit 1 — Cross-house catalog patch (22 entries, paste-ready)

Three sub-groups by file location:

### 1a. ms-security curriculum (4 entries)

Files at `_app/houses/shield/ms-security/ms-sec-NN.html` — Microsoft Security curriculum shared with `security-plus`.

```js
// MS-SEC curriculum — Microsoft Security shared content
{ house: 'shield', id: 'ms-sec-01', title: 'MS-SEC-01: Microsoft Security Fundamentals', description: 'Microsoft Security curriculum module 01', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-01.html', category: 'ms-security' },
{ house: 'shield', id: 'ms-sec-03', title: 'MS-SEC-03: Identity & Access Management', description: 'Microsoft Security curriculum module 03', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-03.html', category: 'ms-security' },
{ house: 'shield', id: 'ms-sec-05', title: 'MS-SEC-05: Threat Protection', description: 'Microsoft Security curriculum module 05', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-05.html', category: 'ms-security' },
{ house: 'shield', id: 'ms-sec-10', title: 'MS-SEC-10: Compliance & Governance', description: 'Microsoft Security curriculum module 10', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-10.html', category: 'ms-security' },
```

**Operator note**: Titles are placeholders ("MS-SEC-NN: <topic>"). Actual curriculum titles should be extracted from each file's `<h1>` or `<title>` tag before merging — verify before approving.

### 1b. PIS lab curriculum (9 entries)

Files at `_app/houses/shield/infosec/labs/pis-lNN-{topic}/index.html`.

```js
// PIS lab curriculum
{ house: 'shield', id: 'pis-l01', title: 'PIS Lab L01: Specimen Classification', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l01-specimen-classification/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l02', title: 'PIS Lab L02: Human Vector Drill', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l02-human-vector-drill/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l05', title: 'PIS Lab L05: Field Equipment Audit', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l05-field-equipment-audit/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l07', title: 'PIS Lab L07: Lab Isolation Protocol', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l07-lab-isolation-protocol/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l08', title: 'PIS Lab L08: Clearance Forge', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l08-clearance-forge/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l09', title: 'PIS Lab L09: Outbreak Detection', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l09-outbreak-detection/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l10', title: 'PIS Lab L10: Dual Integrity Access', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l10-dual-integrity-access/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l11', title: 'PIS Lab L11: Containment Breach', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l11-containment-breach/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l12', title: 'PIS Lab L12: Full Facility Inspection', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l12-full-facility-inspection/index.html', category: 'pis' },
```

### 1c. Shield applets/presentations (9 entries)

Files at various applet/presentation paths in `_app/houses/shield/`.

```js
// Shield curriculum — applets and presentations
{ house: 'shield', id: 'shield-bcp', title: 'Business Continuity Planner', description: 'BCP risk applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/risk/shield-business-continuity-planner.applet.html', category: 'risk' },
{ house: 'shield', id: 'shield-cfr-310', title: 'CFR-310 Incident Response', description: 'Incident response operations applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/operations/shield-cfr-310-incident-response.applet.html', category: 'operations' },
{ house: 'shield', id: 'shield-change-management', title: 'Change Management', description: 'Change management risk applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/risk/shield-change-management.applet.html', category: 'risk' },
{ house: 'shield', id: 'shield-cse-06', title: 'CSE-06: Security Monitoring & Incident Response', description: 'CSE curriculum module 06', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'presentations/shield-cse-06-security-monitoring-incident-response.presentation.html', category: 'cse' },
{ house: 'shield', id: 'shield-cybersecurity-controls', title: 'Cybersecurity Controls', description: 'Fundamentals applet on cybersecurity controls', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/fundamentals/cybersecurity_controls/shield-cybersecurity-controls.applet.html', category: 'fundamentals' },
{ house: 'shield', id: 'shield-firewalls', title: 'Firewalls', description: 'Network firewalls applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/network/firewalls/shield-firewalls.applet.html', category: 'network' },
{ house: 'shield', id: 'shield-five-pillars', title: 'Five Pillars of Security', description: 'Fundamentals applet on the five pillars', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/fundamentals/five_pillars/shield-five-pillars.applet.html', category: 'fundamentals' },
{ house: 'shield', id: 'shield-nat', title: 'NAT/PAT', description: 'Network NAT/PAT applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/network/nat_pat/shield-nat.applet.html', category: 'network' },
{ house: 'shield', id: 'shield-wireless-security', title: 'Wireless Security', description: 'Network wireless security applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/network/wireless_security/shield-wireless-security.applet.html', category: 'network' },
```

**Important**: Titles and descriptions above are concise summaries written from filenames + path context. Operator should extract canonical titles from each file's `<h1>` or `<title>` tag before merging. I do not have time-budget this firing to extract them all.

## Unit 2 — Dead `pis-NN` refs (11 IDs, awaits curriculum decision)

Files at `_app/houses/shield/infosec/pis-NN.html` do NOT exist for these 11 IDs:

```
pis-01  pis-02  pis-03  pis-04  pis-08  pis-12
pis-15  pis-17  pis-18  pis-19  pis-20
```

Pattern: `pis-{NN}` numeric module IDs. The hub references these as if they're a complete numeric sequence (`pis-01..pis-20`) but only 11 of those 20 are referenced and ZERO have files on disk. Same shape as `forge/intro-computers` Unit 2 — curriculum scaffold for content that was never built.

Operator must pick:
- **Path A** — Add `coming-soon` placeholder catalog entries (visible-but-inert tiles)
- **Path B** — Suppress these 11 cards from the hub
- **Path C** — Hide the entire hub until ≥80% built

Note: the hub renders 58 cards total. 25 (live) + 22 (Unit 1 patch) = 47 working. 11 of 58 = 19% of the hub is broken card slots. Less severe than forge (88% empty) but still student-visible.

## Unit 3 — security-plus parity audit (next firing)

`shield/security-plus/index.html` references 118 IDs. **48 are shared with isc2-cc** — meaning Unit 1's 22 catalog entries, once approved, would also resolve a chunk of security-plus's HUB-001 finding.

Open questions for next firing:
1. How many of security-plus's 70 unique-to-itself IDs are also catalog gaps with existing files (Unit 1 candidates)?
2. How many are dead-ref-curriculum-scaffold (Unit 2 candidates)?
3. Are there shield-* IDs (`shield-cia`, `shield-crypto-*`, `shield-threat-*`) that follow new patterns not yet seen?

This audit will reuse the same methodology applied here: hub-href verification + cross-house file existence check + classify into LIVE / CATALOG-GAP / TRUE-DEAD buckets.

## What I will not do autonomously

- Apply Unit 1's 22 catalog entries before operator review (and before titles/descriptions are pulled from file `<h1>` tags)
- Pick UX path for Unit 2
- Invent curriculum titles for unbuilt `pis-NN` content

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Sister proposals: `hub-001-ccna-catalog-patch.md`, `hub-001-pfi-catalog-patch.md`, `hub-001-forge-intro-computers-proposal.md`, `hub-001-wsa-catalog-patch.md`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
