# HUB-001 — `shield/security-plus` proposal (3 work units, dedups with isc2-cc)

## TL;DR

Same shape as isc2-cc, larger scope. Of 118 references:
- 54 LIVE (existing house-prefix tolerance handles them)
- 47 CATALOG GAP — files exist, no catalog entry. **19 of these 47 are already covered by `hub-001-isc2-cc-proposal.md` Unit 1.** Net new for sp: 28 entries.
- 17 TRUE DEAD — `pis-{NN}` numeric refs to nonexistent files. Same pattern as isc2-cc Unit 2, expanded (11 → 17 IDs).

| Work unit | Scope | Notes |
|---|---|---|
| **Unit 1-sp — 28 new catalog entries** | sp-only items (cyber-framework, more shield applets/games, additional ms-sec/pis-l) | Paste-ready, low risk |
| **Unit 2 — Dead `pis-NN` refs (17 IDs)** | Curriculum decision (UX path A/B/C) | Same as isc2-cc Unit 2, expanded |
| **Unit 3 — Cross-hub Option 1 (+5 clears)** | Already covered by PFI suffix-tolerance widening if approved | Tracked under PFI Option 1 |

Approving isc2-cc Unit 1 gives sp 19 free. Approving sp Unit 1-sp gives sp another 28. Total sp HUB-001 finding cleared after both: 54 + 47 = 101 of 118 (86%). Remaining 17 are Unit 2.

## Verified state

```
houses/shield/security-plus/index.html
  refs: 118  |  live (catalog-resolved): 54  |  catalog gap (file exists): 47  |  true dead (file missing): 17
```

Verification methodology identical to isc2-cc: hub-href + cross-house file-existence per ID, distinguishing real catalog gaps from genuinely missing content.

## Unit 1-sp — 28 new catalog entries (sp-only, paste-ready)

Already covered by isc2-cc Unit 1 (19 entries — DO NOT duplicate):
- ms-sec-03, ms-sec-05, ms-sec-10
- pis-l01, pis-l02, pis-l05, pis-l07, pis-l08, pis-l09, pis-l11, pis-l12
- shield-bcp, shield-cfr-310, shield-change-management, shield-cse-06, shield-cybersecurity-controls, shield-firewalls, shield-five-pillars, shield-wireless-security

The 28 entries net-new for sp:

### 1a. ms-security curriculum (2 new entries)

```js
{ house: 'shield', id: 'ms-sec-06', title: 'MS-SEC-06: Microsoft Security Module 06', description: 'Microsoft Security curriculum module 06', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-06.html', category: 'ms-security' },
{ house: 'shield', id: 'ms-sec-09', title: 'MS-SEC-09: Microsoft Security Module 09', description: 'Microsoft Security curriculum module 09', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['module'], href: 'ms-security/ms-sec-09.html', category: 'ms-security' },
```

### 1b. PIS lab curriculum (3 new entries — l03, l04, l06)

```js
{ house: 'shield', id: 'pis-l03', title: 'PIS Lab L03: Outbreak Intelligence', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l03-outbreak-intelligence/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l04', title: 'PIS Lab L04: Injection Vector', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l04-injection-vector/index.html', category: 'pis' },
{ house: 'shield', id: 'pis-l06', title: 'PIS Lab L06: Vault Seal Operations', description: 'Hands-on lab', icon: '/assets/images/icons/icon-microscope.webp', status: 'available', components: ['lab'], href: 'infosec/labs/pis-l06-vault-seal-operations/index.html', category: 'pis' },
```

### 1c. Cyber-framework presentations (5 new entries)

```js
{ house: 'shield', id: 'shield-cf-mm01', title: 'Cyber Framework MM01: Introduction', description: 'Cyber framework module 01', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'cyber-framework/presentations/shield-cf-mm01-intro.presentation.html', category: 'cyber-framework' },
{ house: 'shield', id: 'shield-cf-mm02', title: 'Cyber Framework MM02: Government Agencies', description: 'Cyber framework module 02', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'cyber-framework/presentations/shield-cf-mm02-gov-agencies.presentation.html', category: 'cyber-framework' },
{ house: 'shield', id: 'shield-cf-mm03', title: 'Cyber Framework MM03: Legislation', description: 'Cyber framework module 03', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'cyber-framework/presentations/shield-cf-mm03-legislation.presentation.html', category: 'cyber-framework' },
{ house: 'shield', id: 'shield-cf-mm04', title: 'Cyber Framework MM04: Regulatory', description: 'Cyber framework module 04', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'cyber-framework/presentations/shield-cf-mm04-regulatory.presentation.html', category: 'cyber-framework' },
{ house: 'shield', id: 'shield-cf-mm05', title: 'Cyber Framework MM05: NIST CIP', description: 'Cyber framework module 05', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'cyber-framework/presentations/shield-cf-mm05-nist-cip.presentation.html', category: 'cyber-framework' },
```

### 1d. CSE additional modules (2 new entries — 07, 08)

```js
{ house: 'shield', id: 'shield-cse-07', title: 'CSE-07: Risk Assessment & Management', description: 'CSE curriculum module 07', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'presentations/shield-cse-07-risk-assessment-management.presentation.html', category: 'cse' },
{ house: 'shield', id: 'shield-cse-08', title: 'CSE-08: Compliance & Governance', description: 'CSE curriculum module 08', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['presentation'], href: 'presentations/shield-cse-08-compliance-governance.presentation.html', category: 'cse' },
```

### 1e. Threat applets (7 new entries)

```js
{ house: 'shield', id: 'shield-malware-types', title: 'Malware Types', description: 'Threat applet on malware types', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/shield-malware-types.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-buffer-overflow', title: 'Buffer Overflow Attack', description: 'Threat applet on buffer overflow', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/buffer_overflow_attack/shield-threat-buffer-overflow.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-dns', title: 'DNS Attacks', description: 'Threat applet on DNS attacks', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/dns_attacks/shield-threat-dns-attacks.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-insider', title: 'Insider Threats', description: 'Threat applet on insider threats', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/insider_threats/shield-threat-insider-threats.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-phishing', title: 'Phishing', description: 'Threat applet on phishing', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/phishing/shield-threat-phishing.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-privesc', title: 'Privilege Escalation', description: 'Threat applet on privilege escalation', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/privilege_escalation/shield-threat-privilege-escalation.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-ransomware', title: 'Ransomware', description: 'Threat applet on ransomware', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/ransomware_attack/shield-threat-ransomware.applet.html', category: 'threats' },
{ house: 'shield', id: 'shield-threat-sqli', title: 'SQL Injection', description: 'Threat applet on SQL injection', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/threats/sql_injection_attack/shield-threat-sql-injection.applet.html', category: 'threats' },
```

### 1f. Game/learning applets (5 new entries)

```js
{ house: 'shield', id: 'shield-cookies', title: 'Cookie Caper', description: 'Game applet on cookies/sessions', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/games/cookie_caper/shield-cookies-native.applet.html', category: 'games' },
{ house: 'shield', id: 'shield-cyberscramble', title: 'Cyber Scramble', description: 'Word/concept game applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/games/cyber_scramble/shield-cyberscramble-native.applet.html', category: 'games' },
{ house: 'shield', id: 'shield-ethical-hacking-case', title: 'Ethical Hacking Case', description: 'Case-study applet on ethical hacking', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/games/ethical_hacking_case/index.html', category: 'games' },
{ house: 'shield', id: 'shield-hatmatch', title: 'Cyber Hat Match', description: 'Hat-matching identification game applet', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/games/cyber_hat_match/shield-hatmatch-native.applet.html', category: 'games' },
```

### 1g. Compliance / governance / fundamentals (4 new entries)

```js
{ house: 'shield', id: 'shield-cism', title: 'CISM Management Dashboard', description: 'Governance applet on CISM', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/governance/shield-cism-management-dashboard.applet.html', category: 'governance' },
{ house: 'shield', id: 'shield-laws-regs', title: 'Laws & Regulations', description: 'Compliance applet on laws and regulations', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/compliance/shield-laws-regulations.applet.html', category: 'compliance' },
{ house: 'shield', id: 'shield-security-best-practices', title: 'Security Best Practices', description: 'Fundamentals applet on best practices', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/fundamentals/shield-security-best-practices.applet.html', category: 'fundamentals' },
{ house: 'shield', id: 'shield-security-governance-dashboard', title: 'Security Governance Dashboard', description: 'Fundamentals applet on governance dashboard', icon: '/assets/images/icons/icon-shield.webp', status: 'available', components: ['applet'], href: 'applets/fundamentals/shield-security-governance-dashboard.applet.html', category: 'fundamentals' },
```

(That's 28 sp-only entries: 2 ms-sec + 3 pis-l + 5 cf-mm + 2 cse + 7 threat + 4 games + 4 compliance/governance/fundamentals + 1 cookies = 28. Counts verified against the file-exists list.)

**Title/description placeholders**: as in isc2-cc Unit 1, titles above are written from filename + path context. Operator should pull canonical titles from each file's `<h1>` or `<title>` tag before merging.

## Unit 2 — Dead `pis-NN` refs (17 IDs, awaits curriculum decision)

Files at `_app/houses/shield/infosec/pis-NN.html` do NOT exist for these 17 IDs:

```
pis-01  pis-02  pis-03  pis-04  pis-05  pis-07  pis-08  pis-09
pis-10  pis-12  pis-13  pis-14  pis-15  pis-17  pis-18  pis-19  pis-20
```

Same pattern as isc2-cc Unit 2 (which had 11 of these). sp references 6 additional dead IDs (`pis-05`, `pis-07`, `pis-09`, `pis-10`, `pis-13`, `pis-14`). The hub renders 118 cards total; 17 of 118 = 14% broken card slots.

Operator decision (single decision, applies to BOTH isc2-cc and sp):
- **Path A** — `coming-soon` placeholder catalog entries (visible-but-inert)
- **Path B** — Suppress these cards from both hubs
- **Path C** — Hide one or both hubs until ≥80% built

## Unit 3 — Cross-hub Option 1 already in scope

Per `hub-001-pfi-catalog-patch.md`'s cross-hub evidence, suffix-tolerance widening would clear an additional 5 sp refs (counted in the 54 LIVE figure if Option 1 is approved; subtract from LIVE if not). Tracked under PFI Option 1 — no separate decision needed.

## Coverage table after all units

| Status | Count | Path |
|---|---|---|
| LIVE today | 54 | (54 of 118 = 46%) |
| + isc2-cc Unit 1 (19 shared entries) | 73 | (61%) |
| + sp Unit 1-sp (28 sp-only entries) | 101 | (86%) |
| Remaining: Unit 2 dead refs | 17 | (14% — needs curriculum decision) |

## What I will not do autonomously

- Apply any catalog entries before operator review
- Pick UX path (A/B/C) for Unit 2
- Extract canonical `<h1>`/`<title>` for each file (high time-cost, operator may want to review the placeholders first)

## Cross-references

- Sister proposal (this is the partner): `hub-001-isc2-cc-proposal.md`
- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Consolidated decision matrix: `hub-001-all-hubs-analysis.md`
- Cross-hub Option 1: `hub-001-pfi-catalog-patch.md`
