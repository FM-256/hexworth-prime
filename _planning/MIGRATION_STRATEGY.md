# Hexworth Prime - Content Migration Strategy

**Created:** December 18, 2025
**Status:** Phase 1b - House Infrastructure COMPLETE
**Last Checkpoint:** December 18, 2025

---

> **CHECKPOINT DOCUMENT**: This file persists the migration plan across sessions.
> If context resets, read this file first to resume work.

---

## Overview

Migrating educational content from Hexworth Academy (network-essentials) catalog into the Hexworth Prime house system.

### Source
- **Location:** `/home/eq/Ai content creation/network-essentials/`
- **Content Type:** Educational modules, labs, applets, presentations
- **Structure:** Organized by topic in catalog system

### Destination
- **Location:** `/home/eq/Ai content creation/Hexworth Prime/_app/houses/`
- **Content Type:** Same content, reorganized by "house" (learning track)
- **Structure:** House-based with tiered progression

---

## The Houses (9 Total)

Infrastructure complete for all 9 houses. Colors from `content-registry.js` (source of truth).

| House | Icon | Domain | Color | Cert Alignment |
|-------|------|--------|-------|----------------|
| **Web** | 🕸️ | Networking & Connections | `#60a5fa` | Network+, CCNA |
| **Shield** | 🛡️ | Security & Defense | `#f87171` | Security+, CySA+ |
| **Cloud** | ☁️ | Infrastructure & Scale | `#38bdf8` | AWS CCP, Azure |
| **Forge** | ⚒️ | Hardware & Systems | `#fbbf24` | A+ Core 1 & 2 |
| **Script** | 📜 | Automation & Efficiency | `#a78bfa` | Linux+, Python |
| **Code** | 💻 | Development & Engineering | `#4ade80` | DevOps path |
| **Key** | 🔑 | Cryptography & Secrets | `#f472b6` | Crypto specialty |
| **Eye** | 👁️ | Monitoring & Analysis | `#c084fc` | CySA+, SIEM |
| **Dark Arts** | 🌑 | Offensive Security | `#6b21a8` | PenTest+ |

**Note:** Dark Arts has tiered vault system (Apprentice/Journeyman/Adept) with skill-based gates.

---

## Migration Phases

### Phase 1: Inventory & Categorization
**Status:** COMPLETE

**Goal:** Create complete inventory of catalog content and assign each item to a house.

**Tasks:**
- [x] Scan network-essentials directory structure
- [x] List all modules, labs, applets, presentations
- [x] Categorize each item into destination house
- [x] Document rationale for edge cases
- [x] Create MIGRATION_MANIFEST.md with full inventory

**Output:** `_planning/MIGRATION_MANIFEST.md` (250+ items cataloged)

---

### Phase 1b: House Infrastructure
**Status:** COMPLETE

**Goal:** Build the house system before content migration.

**Tasks:**
- [x] Audit existing 9-house structure (already in place)
- [x] Verify house definitions in content-registry.js
- [x] Create house directory structures (all 9 exist)
- [x] Create house landing pages (all 9 complete)
- [x] Update MIGRATION_MANIFEST with 9-house structure
- [x] Establish navigation patterns (back to dashboard, badges)

**Decision:** Keep existing 9 houses. Web house covers Network+/CCNA content (no separate "Net" house needed).

---

### Phase 2: Dashboard & Navigation
**Status:** COMPLETE

**Goal:** Ensure all houses are accessible from the main dashboard.

**Tasks:**
- [x] Verify dashboard shows all 9 house cards (uses ContentRegistry.houses)
- [x] Verify sorting quiz includes all 9 houses (15 questions, 9 house mappings)
- [x] Fix dashboard CSS colors to match content-registry.js (source of truth)
- [x] Fix sorting quiz CSS colors to match content-registry.js
- [x] Verify house landing pages exist (8 standard + Dark Arts gated)

**Fixes Applied:**
- Dashboard CSS house colors aligned with content-registry.js
- Sorting quiz CSS house colors aligned with content-registry.js
- Digital Life firefly colors aligned with content-registry.js

---

### Phase 3: Content Migration (House by House)
**Status:** NOT STARTED

**Goal:** Migrate content one house at a time, fully completing each before moving to the next.

**Migration Order:**

| Order | House | Rationale | Status |
|-------|-------|-----------|--------|
| 1 | **Forge** | A+ content built natively, most complete | ✅ 31 items migrated |
| 2 | **Shield** | Security content most mature; pairs with Dark Arts | ✅ 57 items migrated |
| 3 | **Web** | Networking content for Network+/CCNA | ✅ 67 items migrated |
| 4 | **Script** | Programming fundamentals; high reuse | ✅ 28 items migrated |
| 5 | **Cloud** | AWS/Azure content; self-contained unit | ✅ 27 items migrated |
| 6 | **Code** | DevOps and development content | ✅ 6 items migrated |
| 7 | **Key** | Cryptography (may overlap Shield) | ✅ Audited (no unique content) |
| 8 | **Eye** | Monitoring and SOC content | ✅ Audited (no unique content) |
| 9 | **Dark Arts** | COMPLETE - built natively | ✅ Done |

**Per-House Workflow:**
1. Read manifest for that house's content
2. Copy/adapt each item (checking off in manifest)
3. Update house index.html with new content
4. Test all navigation links
5. Mark house complete in manifest
6. **CHECKPOINT** - Update this document

---

## Anti-Compacting Measures

Strategies to prevent context overflow and lost progress:

### 1. Persistent Documentation
- All decisions written to files, not just discussed
- MIGRATION_MANIFEST.md tracks every item
- This strategy doc captures the plan

### 2. Modular Execution
- One house at a time (not all simultaneously)
- Each house is a discrete, completable unit
- Clear boundaries between phases

### 3. Explicit Checkpoints
- Update this document after each major step
- Mark completion status clearly
- Include "how to resume" instructions

### 4. Parallel Agents for Research
- Use Explore agents for inventory (doesn't bloat main context)
- Main context stays focused on decisions and execution

### 5. Manifest as Source of Truth
- If uncertain what's done, check MIGRATION_MANIFEST.md
- Never rely on memory for migration status

---

## Current Status

```
Phase 0: Planning     [████████████████████] COMPLETE
Phase 1: Inventory    [████████████████████] COMPLETE (310+ items found)
Phase 1b: House Infra [████████████████████] COMPLETE (9 landing pages)
Phase 2: Dashboard    [████████████████████] COMPLETE (colors aligned)
Phase 3: Migration    [████████████████████] COMPLETE (9/9 houses)
  - Forge             [████████████████████] COMPLETE (41 items)
  - Shield            [████████████████████] COMPLETE (100 items - includes CMMC)
  - Web               [████████████████████] COMPLETE (69 items)
  - Script            [████████████████████] COMPLETE (26 items)
  - Cloud             [████████████████████] COMPLETE (29 items)
  - Code              [████████████████████] COMPLETE (5 items)
  - Key               [████████████████████] COMPLETE (audit only - no unique content)
  - Eye               [████████████████████] COMPLETE (audit only - no unique content)
  - Dark Arts         [████████████████████] COMPLETE (built natively)

Phase 4: Full Catalog [████████████████████] COMPLETE (Dec 19, 2025)
  - Speaker Notes     [████████████████████] COMPLETE (26 files)
  - Tutorials         [████████████████████] COMPLETE (22 PDFs)
  - Troubleshooting   [████████████████████] COMPLETE (7 files)
  - Docs/Handouts     [████████████████████] COMPLETE (12 files)
  - CMMC Modules      [████████████████████] COMPLETE (17 modules)
  - Root Visualizers  [████████████████████] COMPLETE (3 files)
```

---

## How to Resume

If starting a new session or context has reset:

1. **Read this file first** - understand the overall plan
2. **Check MIGRATION_MANIFEST.md** - see what's inventoried/migrated
3. **Check the Current Status section above** - know which phase/house is active
4. **Continue from the last incomplete checkbox**

---

## Decision Log

Record important decisions and their rationale here:

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-18 | Keep 9-house structure | Already defined in content-registry.js |
| 2025-12-18 | Web house = Network+ content | No need for separate "Net" house |
| 2025-12-18 | Colors from content-registry.js | Single source of truth |
| 2025-12-18 | Landing page template from Shield | Consistent structure across houses |
| 2025-12-18 | Dark Arts has tiered vault | Skill-based gates, not bypassable |
| 2025-12-18 | Forge first in migration order | Most content already built natively |
| 2025-12-18 | Aligned dashboard CSS colors | Fixed mismatch between dashboard.html and content-registry.js |
| 2025-12-18 | Aligned sorting quiz CSS colors | Fixed mismatch between sorting.html and content-registry.js |
| 2025-12-18 | Dark Arts uses gate entry | No standard landing page; uses gate-1.html then vault/index.html |
| 2025-12-18 | Shield migration complete | 57 items across 6 categories (fundamentals, threats, crypto, network, access, risk) |
| 2025-12-18 | Shield modules added | 9 modules in content-registry.js, Security+ path has 11 total modules |
| 2025-12-18 | Web migration complete | 60 items (18 visualizers, 14 IP applets, 26 presentations, 2 simulators) |
| 2025-12-18 | Web modules added | 12 modules in content-registry.js, Network+ path has 13 total modules |
| 2025-12-18 | Filtered Web content | Excluded security/automation visualizers - belong in Shield/Script houses |
| 2025-12-18 | Script migration complete | 28 items: Linux, Python (8-chapter), PowerShell, SysAdmin |
| 2025-12-18 | Added Linux+ path | 9 modules covering Linux+ XK0-005 objectives |
| 2025-12-18 | Added Python path | 8-chapter progressive Python course |
| 2025-12-18 | Cloud migration complete | 27 items: fundamentals, AWS (18), architecture, presentations |
| 2025-12-18 | Added AWS CCP path | 18 modules covering CLF-C02 exam objectives |
| 2025-12-18 | Added Azure path | 4 modules for AZ-900 fundamentals |
| 2025-12-19 | Full catalog migration | All content types: speaker notes, tutorials, CMMC, troubleshooting |
| 2025-12-19 | CMMC modules to Shield | 17 compliance modules in shield/applets/compliance/ |
| 2025-12-19 | Game applets to Shield | 6 educational games in shield/applets/games/ |
| 2025-12-19 | Threat applets completed | heartbleed, stuxnet, meltdown_spectre, etc. |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `_planning/MIGRATION_MANIFEST.md` | Item-by-item inventory and tracking |
| `_planning/PROJECT_STATE.md` | Overall project status |
| `_planning/.private/MASTER_SECRETS.md` | CTF answers and secrets |
| `_app/config/content-registry.js` | Central content definitions |
| `CLAUDE.md` | Project guidelines for AI assistant |

---

## Next Action

**Immediate next step:** Migration COMPLETE! Review GAP_INVENTORY.md for content creation priorities.

**Forge Status:** ✅ COMPLETE
- 31 items migrated (OS modules + hardware applets + quiz)
- Content registry updated with 10 modules
- Landing page updated with new modules
- CompTIA A+ learning path expanded

**Shield Status:** ✅ COMPLETE
- 57 items migrated (Security+ applets across 6 categories)
- Content registry updated with 9 modules
- Landing page updated with 6 content categories
- CompTIA Security+ learning path expanded (11 modules)

**Web Status:** ✅ COMPLETE
- 67 items migrated (18 visualizers + 14 IP applets + 26 presentations + 2 simulators + 7 cumulative labs)
- Content registry updated with 13 modules
- Landing page updated with 7 content categories
- CompTIA Network+ learning path expanded (13 modules)

**Script Status:** ✅ COMPLETE
- 28 items migrated (6 Linux + 8 Python + 4 PowerShell + 4 SysAdmin + 2 presentations + 4 tutorials)
- Content registry updated with 22 modules
- Landing page updated with 6 content categories
- CompTIA Linux+ and Python learning paths added

**Cloud Status:** ✅ COMPLETE
- 27 items migrated (4 fundamentals + 18 AWS + 1 architecture + 3 presentations + 1 lab)
- Content registry updated with 18 modules
- Landing page updated with 5 content categories
- AWS CCP (18 modules) and Azure Fundamentals (4 modules) paths added

**Code Status:** ✅ COMPLETE
- 6 items migrated (VERSION_CONTROL_GUIDE, automation presentation/notes/visualizer, DevNet guide, ConfigMgmt applet)
- Landing page updated with 6 content categories (4 available, 2 coming-soon)
- Gaps documented: Docker/K8s, CI/CD pipelines, Terraform, Agile/SDLC

**Key Status:** ✅ COMPLETE (Audit Only)
- All crypto content branded "House of Shield" - no unique content to migrate
- 8 gaps documented in GAP_INVENTORY.md for future creation
- Can reference Shield foundations: RSA, Diffie-Hellman, PKI, GPG lab

**Eye Status:** ✅ COMPLETE (Audit Only)
- All monitoring content already categorized under Shield/Forge/Script
- 11 gaps documented in GAP_INVENTORY.md for future creation
- 1 existing item: log-basics.html (infrastructure setup)
- Can reference: IDS/IPS (Shield), Admin Tools (Forge), Log Management (Script)

---

*This document is the checkpoint. If in doubt, read this first.*
