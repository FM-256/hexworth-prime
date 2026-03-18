# Hub Index Page Audit

> Comparison of each hub/house index page against owned content (per CONTENT_MAP and HUB_REGISTRY).
> Identifies navigation gaps where the index does not link to all owned content.
> Generated: 2026-03-18 | Wave: CA-9

---

## Structural Pattern Summary

All 9 house index pages use **HouseRenderer.js** -- a shared JS-rendered layout with 5 tabs (Learning Paths, House Content, Explore All, Profile, Instructor). Content is surfaced through two mechanisms:

1. **CATEGORIES array** -- Hardcoded in the index HTML; defines topic sections with path prefixes and counts
2. **ContentCatalog.getHouseModules()** -- JS call that pulls modules from `ContentCatalog.js` for the House Content tab

Standalone hubs (Signal, Forensics) use their own engines (SignalEngine, ForensicsEngine) with dedicated data files (SignalData.js, ForensicsData.js).

**Key implication:** Content not registered in ContentCatalog.js or CATEGORIES is invisible from the index page, even if the files exist on disk.

---

## House-by-House Findings

### Script House

| Metric | Value |
|--------|-------|
| **Total owned files** | 505 |
| **CATEGORIES sections** | 8 (linux, python, powershell, sysadmin, presentations, tutorials, clh, linux-labs) |
| **Paths listed** | 6 (Linux+, Zero to Python, DevOps Fundamentals, Linux Mastery, Command Line Hacker, Grep & Pipe Mastery) |
| **ContentCatalog coverage** | Partial -- 119 modules cataloged |

**Missing from index navigation:**
- `labs/linux/` (48 files) -- No CATEGORIES entry; only reachable via ContentCatalog search if cataloged
- `courses/clh/` companion modules (94 files) -- Not linked from CLH course or index
- `applets/linux/` CLH applets (38 files) -- CATEGORIES entry exists but count=6, actual ~38
- `modules/databases/` (35 files) -- No CATEGORIES entry, no path card
- `games/` (6 games) -- No CATEGORIES entry
- `reviews/` (5 files) -- No CATEGORIES entry
- `linux/` track (57 files) -- Partially covered by CATEGORIES linux (count=6) and presentations (count=2); actual content much larger
- `quizzes/` (6 files) -- No CATEGORIES entry
- Python exams (9 files) -- No CATEGORIES entry

**CATEGORIES count accuracy:**
- `linux`: count=6 but actual applets in `applets/linux/` = 38
- `presentations`: count=2 but actual = 23 (12 linux + 9 python + 2 misc)
- `clh`: count=30 but listed as "30-module" in description

**Assessment:** Significant navigation gap. ~300+ files unreachable from index. The CATEGORIES counts are stale and undercount actual content.

---

### Cloud House

| Metric | Value |
|--------|-------|
| **Total owned files** | 306 |
| **CATEGORIES sections** | 6 (fundamentals, aws-services, architecture, presentations, labs, games) |
| **Paths listed** | 3 (AWS CCP, Azure Fundamentals, WSA) |
| **ContentCatalog coverage** | 83 modules cataloged |

**Missing from index navigation:**
- `api/` API Security track (94 files) -- No CATEGORIES entry, no path card
- `modules/wsa/` (107 files) -- Path card exists (WSA) but no CATEGORIES entry for the 107 individual modules
- `openstack/` (13 files) -- No CATEGORIES entry, no path card
- `cse/` Cloud Security Essentials (2 files) -- No CATEGORIES entry
- `tools/` (15 files) -- No CATEGORIES entry
- `quizzes/` (24 files) -- No CATEGORIES entry
- `games/` -- CATEGORIES entry exists but count=1; actual = 12 games

**CATEGORIES count accuracy:**
- `fundamentals`: count=4, reasonable
- `aws-services`: count=18, reasonable
- `games`: count=1 but actual = 12

**Assessment:** Major gap. The API Security track (94 files) and WSA modules (107 files) are the two largest content areas but neither has a CATEGORIES entry. Only WSA has a path card.

---

### Code House

| Metric | Value |
|--------|-------|
| **Total owned files** | 550 |
| **CATEGORIES sections** | 8 (version-control, devops-automation, api-development, infrastructure-as-code, cicd, containerization, python-engineering, python-hub) |
| **Paths listed** | 4 (DevOps Fundamentals, Python Engineering, Python Hub, AWS Developer Associate) |
| **ContentCatalog coverage** | 194 modules cataloged |

**Missing from index navigation:**
- `armory/` Code Armory (192 files) -- No CATEGORIES entry, no path card
- `algorithm-chamber/` (122 files) -- No CATEGORIES entry, no path card
- `devops/` section modules (129 files) -- CATEGORIES has "devops-automation" (count=3) but actual = 129+
- `games/` (9 games) -- No CATEGORIES entry
- `labs/` (6 labs) -- No CATEGORIES entry
- `presentations/` (9 files) -- No CATEGORIES entry
- `quizzes/` (7 files) -- No CATEGORIES entry
- `tools/` (5 files) -- No CATEGORIES entry
- `applets/` (6 files) -- No CATEGORIES entry

**CATEGORIES count accuracy:**
- `devops-automation`: count=3 but DevOps track has 129 files
- `cicd`: count=0, marked available=false
- `containerization`: count=0, marked available=false
- `python-hub`: count=42, reasonable for modules/python-hub

**Assessment:** Critical gap. The Code Armory (192 files, 17 languages) and Algorithm Chamber (122 files) are the two largest content areas in Code House but have zero representation on the index page. The DevOps CATEGORIES count (3) severely undercounts 129 files.

---

### Web House

| Metric | Value |
|--------|-------|
| **Total owned files** | 300 |
| **CATEGORIES sections** | 7 (visualizers, ip-addressing, presentations, routing-switching, simulators, wireless, labs) |
| **Paths listed** | 2 (Network Fundamentals / Network+, Cisco Networking / CCNA) |
| **ContentCatalog coverage** | 2 modules cataloged |

**Missing from index navigation:**
- `backbone/` (166 files) -- No CATEGORIES entry; listed nowhere on index. No path card.
- `network-essentials/` (11 files) -- No CATEGORIES entry, no path card
- `tools/` (27 tools) -- No CATEGORIES entry
- `textbook/` (2 files) -- Referenced in inline afterStatsHTML textbook unlock section
- `games/` (10 games) -- No CATEGORIES entry
- `quizzes/` (7 files) -- Referenced only via inline path (ports quiz)
- `exams/` (3 files) -- Referenced via inline midterm path
- `reviews/` (5 files) -- No CATEGORIES entry
- `troubleshooting/` (2 files) -- No CATEGORIES entry
- `modules/` (3 files) -- Referenced via inline path cards
- `applets/services/` (4 files) -- No CATEGORIES entry

**Assessment:** The Backbone (166 files, the largest section) is entirely absent from the index. The custom afterStatsHTML adds a Network Master Certification path with inline links but this covers only 4-5 items. 27 tools are invisible.

---

### Forge House

| Metric | Value |
|--------|-------|
| **Total owned files** | 281 |
| **CATEGORIES sections** | 9 (aplus-core1, windows-os, hardware-components, bios-boot, storage-tech, memory-processing, display-tech, peripheral-devices, troubleshooting) |
| **Paths listed** | 4 (A+ Core 1, A+ Core 2, MD-100, MD-101) |
| **ContentCatalog coverage** | Partial |

**Missing from index navigation:**
- `games/` (8 games) -- No CATEGORIES entry
- `tools/` (8 tools) -- No CATEGORIES entry
- `reviews/` (6 files) -- No CATEGORIES entry
- `quizzes/` (4 files) -- No CATEGORIES entry (may be linked from applets)

**CATEGORIES coverage:** The 9 CATEGORIES map well to A+ Core 1 applet subdirectories. The `applets/comptia-aplus/` content (127 files) is likely well-covered by these category paths. Hardware applets (20 files) may be partially covered.

**Assessment:** Moderate gap. CATEGORIES cover the A+ applet structure well, and all four cert path cards link to their indexes. Games, tools, reviews, and quizzes (~26 files) are not navigable from the index.

---

### Shield House

| Metric | Value |
|--------|-------|
| **Total owned files** | 263 |
| **CATEGORIES sections** | 9 (fundamentals, threats, cryptography, network-security, access-control, risk-management, architecture, operations, compliance) |
| **Paths listed** | 3 (Security+, CySA+, CASP+) |
| **ContentCatalog coverage** | Partial |

**Missing from index navigation:**
- `cyber-framework/` (26 files) -- No CATEGORIES entry
- `security-101/` (9 files) -- No CATEGORIES entry
- `ms-security/` (11 files) -- No CATEGORIES entry
- `labs/` general (11 files) -- No CATEGORIES entry
- `labs/linux/` (15 files) -- No CATEGORIES entry
- `games/` (16 games) -- No CATEGORIES entry
- `presentations/` (8 files) -- No CATEGORIES entry
- `quizzes/` (10 files) -- No CATEGORIES entry
- `tools/` (10 tools) -- No CATEGORIES entry

**CATEGORIES accuracy:** The 9 CATEGORIES map to applet subdirectories (fundamentals=9, threats=14, crypto=14, network=9, access=3, risk=7, architecture=2, operations=5, compliance=5 = ~68 applets listed but actual ~146 applets). Counts undercount total.

**Assessment:** Moderate-to-significant gap. CATEGORIES cover the applet taxonomy well but undercount. The Cyber Framework (26 files), Security 101 (9), MS Security (11), all labs (26), games (16), presentations (8), quizzes (10), and tools (10) have no navigation entry = ~116 files invisible.

---

### Dark Arts House

| Metric | Value |
|--------|-------|
| **Total owned files** | 47 (house) + 228 (vault hub) = 275 |
| **CATEGORIES sections** | 4 (feh-course, certifications, gates, vault) |
| **Paths listed** | 6 (FEH, EHE, CyberOps, WiFi Arsenal, Bug Hunting, The Vault) |
| **Rendering method** | HouseRenderer + extensive custom afterStatsHTML |

**Coverage:** The Dark Arts index is the most custom of all houses. It has:
- Full FEH module grid (10 modules) with presentation/quiz/lab links -- **fully navigable**
- CyberOps course card (links to Eye house) -- **navigable**
- Five Gates CTF section with gate cards -- **navigable**
- Vault section (locked/unlocked) -- **navigable**
- Path cards for EHE, WiFi Arsenal, Bug Hunting -- **navigable**
- Games section -- placeholder text saying "coming soon", but 8 games exist

**Missing from index navigation:**
- `games/` (8 games) -- Placeholder says "coming soon" but games exist
- Individual FEH labs and quizzes are linked per module -- good
- Vault content (228 files) is accessible via Vault link but individual vault labs, tools, and modules are not enumerated on this page (by design -- they are behind gate access)

**Assessment:** Best-covered house index. The afterStatsHTML provides comprehensive navigation for the FEH course and gate system. Only games (8) are missing a real navigation link. The Vault's internal navigation is a separate concern (addressed in orphan analysis).

---

### AI House (House of the Machine)

| Metric | Value |
|--------|-------|
| **Total owned files** | 190 |
| **CATEGORIES sections** | 6 (foundations, architecture, building, cybersecurity, safety, games) |
| **Paths listed** | 3 (AI Foundations, Agent Builder, Security Automation) |
| **ContentCatalog coverage** | Partial |

**Missing from index navigation:**
- `cortex/` (155 files) -- No CATEGORIES entry, no path card. This is 82% of AI House content.
- `labs/` (7 labs) -- No CATEGORIES entry
- `presentations/` (6 files) -- No CATEGORIES entry
- `quizzes/` (3 files) -- No CATEGORIES entry
- `tools/` (6 tools) -- No CATEGORIES entry

**CATEGORIES accuracy:** CATEGORIES cover only the `modules/` directory (7 agent-focused modules) and `games/` (count=3 but actual=5). The Cortex ML/AI curriculum (155 files, 14 tracks) is entirely absent.

**Assessment:** Critical gap. The Cortex (155 files, 14 ML/AI tracks at 11 modules each) is AI House's primary content and has zero presence on the index page. The index presents AI House as a small agent-focused hub with ~10 modules when it actually has 190 files.

---

### Eye House

| Metric | Value |
|--------|-------|
| **Total owned files** | 190 |
| **CATEGORIES sections** | 8 (log-analysis, siem-fundamentals, network-monitoring, threat-detection, incident-investigation, forensics-basics, security-operations, reporting-metrics) |
| **Paths listed** | 2 (CySA+ / Security Analysis, Security Operations / SOC) |
| **ContentCatalog coverage** | Partial |

**Missing from index navigation:**
- `cysa/` (50 files) -- No CATEGORIES entry; path card exists but no direct module links
- `applets/cyberops/` (99 files) -- No CATEGORIES entry
- `applets/osint/` (1 file) -- No CATEGORIES entry
- `modules/cyberops/` (2 files) -- No CATEGORIES entry
- `games/` (11 games) -- No CATEGORIES entry
- `labs/` (7 labs) -- No CATEGORIES entry
- `presentations/` (6 files) -- No CATEGORIES entry
- `quizzes/` (5 files) -- No CATEGORIES entry
- `tools/` (6 tools) -- No CATEGORIES entry

**CATEGORIES accuracy:** The 8 CATEGORIES define topic areas with counts (8, 10, 12, 15, 11, 9, 13, 7 = 85 total) but these map to ContentCatalog entries, not directly to file paths. The CyberOps applets (99 files) are the largest content set and have no CATEGORIES entry.

**Assessment:** Significant gap. CyberOps applets (99 files) and CySA+ track (50 files) are the two largest content sets but neither has a CATEGORIES entry. Only ContentCatalog search can surface them.

---

### Key House

| Metric | Value |
|--------|-------|
| **Total owned files** | 51 |
| **CATEGORIES sections** | 8 (encryption-fundamentals, symmetric-crypto, asymmetric-crypto, hashing-algorithms, pki-certificates, key-management, crypto-protocols, practical-applications) |
| **Paths listed** | 2 (Cryptography Track, Security+ Crypto Domain) |
| **ContentCatalog coverage** | Partial |

**Missing from index navigation:**
- `labs/` (14 labs) -- No CATEGORIES entry
- `presentations/` (11 presentations) -- No CATEGORIES entry
- `quizzes/` (8 quizzes) -- No CATEGORIES entry
- `games/` (6 games) -- No CATEGORIES entry
- `tools/` (7 tools) -- No CATEGORIES entry

**CATEGORIES accuracy:** The 8 CATEGORIES define topic areas with high counts (10, 8, 12, 9, 11, 7, 13, 10 = 80 total) but Key House only has 51 files total. These counts likely represent ContentCatalog items from Shield crypto applets cross-linked to Key, not actual Key House files.

**Assessment:** The CATEGORIES create a comprehensive topic taxonomy, but the actual labs (14), presentations (11), quizzes (8), games (6), and tools (7) are all orphaned -- 46 of 51 files have no direct navigation link from the index.

---

### Signal Hub

| Metric | Value |
|--------|-------|
| **Total owned files** | 61 |
| **Rendering method** | SignalEngine.js + SignalData.js |
| **Sections defined in data** | 7 (foundations, firmware-ops, network-recon, security-tools, privacy-builds, arcade-ops, field-prep) |
| **Toolkit** | 20 tool pages + index |

**Coverage:** SignalData.js defines 7 sections with individual project entries, each linking to section pages. The section index pages should link to individual guide pages within each section.

**Identified issues:**
- 32 section guide pages are orphaned (per CONTENT_ORPHANS analysis) -- section index pages link to section landing but not to individual guides
- Toolkit Library (20 pages + index) has its own index and is likely linked from the hub

**Assessment:** Moderate gap. The engine-driven rendering covers the section structure, but individual guide pages within sections are not linked from section indexes.

---

### Forensics Hub

| Metric | Value |
|--------|-------|
| **Total owned files** | 27 (existing) |
| **Rendering method** | ForensicsEngine.js + ForensicsData.js |
| **Tracks defined in data** | 6 (evidence-foundations, disk-forensics, memory-forensics, network-forensics, log-timeline, advanced-forensics) |
| **Modules defined** | 60 total (10 per track) |

**Coverage:** ForensicsData.js defines 60 modules across 6 tracks. Of these, only 27 files exist on disk (tracks 1-3 partial). Tracks 4-6 (network-forensics, log-timeline, advanced-forensics) are defined in data but files do not exist yet.

**Identified issues:**
- ForensicsData references 60 module files but only 27 exist
- Tracks 4-6 are ghost entries (data exists, files do not)
- 15 cross-linked existing modules from other houses are properly referenced

**Assessment:** The data file is comprehensive and forward-looking. The engine renders what exists cleanly. The gap is file creation, not navigation.

---

## Summary Matrix

| Hub | Total Files | Linked from Index | Orphaned from Index | Gap Severity |
|-----|------------|-------------------|---------------------|-------------|
| **Code** | 550 | ~70 | ~480 | CRITICAL |
| **AI** | 190 | ~35 | ~155 | CRITICAL |
| **Cloud** | 306 | ~50 | ~256 | CRITICAL |
| **Eye** | 190 | ~20 | ~170 | HIGH |
| **Script** | 505 | ~200 | ~305 | HIGH |
| **Web** | 300 | ~60 | ~240 | HIGH |
| **Shield** | 263 | ~70 | ~193 | HIGH |
| **Key** | 51 | ~5 | ~46 | HIGH |
| **Forge** | 281 | ~255 | ~26 | MODERATE |
| **Dark Arts** | 275 | ~250 | ~25 | LOW |
| **Signal** | 61 | ~29 | ~32 | MODERATE |
| **Forensics** | 27 | ~27 | ~0 | LOW |

### Common Patterns

1. **CATEGORIES arrays are stale** -- Counts do not match actual file counts. Some CATEGORIES have count=0 for sections that have dozens of files.

2. **ContentCatalog is the true bottleneck** -- Houses use `ContentCatalog.getHouseModules()` for the House Content tab. If content is not in ContentCatalog.js, it is invisible regardless of CATEGORIES entries.

3. **No CATEGORIES for games, tools, reviews, quizzes** -- Nearly every house is missing these content types from their CATEGORIES array. This is a systematic omission across all houses.

4. **Major tracks not represented** -- Code Armory (192), Algorithm Chamber (122), Backbone (166), Cortex (155), API Security (94), CyberOps applets (99) are all large content areas with no index representation.

5. **Two rendering paradigms** -- Houses use HouseRenderer (JS-rendered, relies on ContentCatalog), standalone hubs use custom engines (SignalEngine, ForensicsEngine with data files). The custom engines generally do a better job of comprehensive linking.

---

*Hub Index Audit version: 1.0 | Source: Manual index page review against CONTENT_MAP.md and HUB_REGISTRY.md*
