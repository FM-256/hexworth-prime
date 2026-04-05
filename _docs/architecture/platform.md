# Hexworth Prime -- Architecture Overview

> Authoritative reference for platform architecture, content organization, component systems, and conventions.
> Generated: 2026-03-18 | Wave: CA-11

---

## Table of Contents

1. [Platform Architecture](#platform-architecture)
2. [Content Organization](#content-organization)
3. [Hub Relationships](#hub-relationships)
4. [Key Components](#key-components)
5. [Rendering Systems](#rendering-systems)
6. [Progress Tracking](#progress-tracking)
7. [Access Control](#access-control)
8. [File Naming Conventions](#file-naming-conventions)
9. [Content Delivery Structure](#content-delivery-structure)
10. [Configuration Files](#configuration-files)
11. [Infrastructure Components](#infrastructure-components)

---

## Platform Architecture

### Stack

- **Hosting:** Firebase Hosting (static site)
- **Backend:** Firebase Cloud Functions (Node.js) for auth, Firestore sync, admin operations
- **Database:** Firebase Firestore (user profiles, progress sync, leaderboards, class management)
- **Authentication:** Firebase Auth (Google sign-in, anonymous auth, custom claims for admin)
- **Build Step:** None. Raw HTML/CSS/JS served directly. No bundler, no transpiler, no framework.
- **CDN:** Firebase Hosting CDN (global edge distribution)

### Design Principles

1. **Zero build step** -- Every file is served as-is. If it needs a bundler, it does not belong.
2. **No emoji** -- All visual indicators use `.webp` icon images from `/assets/images/icons/`. Enforced by EduScan heuristic HEUR-003.
3. **No `position: fixed`** -- Body filter effects break fixed positioning. Use `position: absolute` + scroll offset instead. Enforced by EduScan HEUR-008.
4. **Component IIFE pattern** -- All shared JS components are IIFEs (Immediately Invoked Function Expressions) exposing a single global object. No ES modules, no import/export.
5. **Config-driven content** -- Large content areas (houses, boxes, forensics, signal) are driven by JS config objects, not hardcoded HTML.

### File Structure

```
_app/                          # Application root (Firebase Hosting serves from here)
  |-- index.html               # Landing page
  |-- dashboard.html           # Student dashboard (436KB, largest file)
  |-- sorting.html             # House sorting quiz
  |-- config/                  # Global configuration
  |     |-- content-registry.js  # Central content + learning path definitions
  |     |-- house-palette.js     # House color themes
  |     |-- mascot-lore.js       # House mascot data
  |     |-- skill-tree.js        # Skill tree definitions
  |     |-- cipher.js            # Gate cipher rotations
  |     |-- paths.js             # Learning path definitions
  |-- components/              # 131 shared JS components + subdirectories
  |     |-- AccessGuard.js       # Access control
  |     |-- ContentCatalog.js    # Module search/filter (1,832 entries)
  |     |-- FluxCapacitor.js     # Navigation widget + sub-loaders
  |     |-- HouseRenderer.js     # Shared house index renderer
  |     |-- ModuleProgress.js    # Progress tracking
  |     |-- AchievementSystem.js # Achievement engine
  |     |-- ...                  # 125+ more components
  |-- houses/                  # 12 house directories
  |     |-- script/              # 505 files
  |     |-- code/                # 550 files
  |     |-- cloud/               # 306 files
  |     |-- web/                 # 300 files
  |     |-- forge/               # 281 files
  |     |-- shield/              # 263 files
  |     |-- ai/                  # 190 files
  |     |-- eye/                 # 190 files
  |     |-- key/                 # 51 files
  |     |-- dark-arts/           # 47 files (house-level)
  |     |-- matrix/              # 1 file (index only)
  |     |-- signal/              # 0 files (content in standalone hub)
  |-- dark-arts/               # 228 files (standalone vault hub)
  |-- signal/                  # 61 files (standalone hub)
  |-- forensics/               # 27 files (standalone hub)
  |-- arena/                   # 23 files (CTF BoxEngine)
  |-- dispatch/                # 6 files (IT troubleshooting BoxEngine)
  |-- operator/                # 25 files (terminal missions)
  |-- arctic/                  # 17 files (CLI districts)
  |-- projects/                # 89 files (cross-house capstones)
  |-- hive/                    # 5 files (multiplayer prototype)
  |-- oasis/                   # 2 files (challenge area)
  |-- workshop/                # 7 files (recalled content shelf)
  |-- admin/                   # 2 files (instructor console)
  |-- career/                  # Career launchpad
  |-- funding/                 # Grants/scholarships
  |-- utils/                   # Utility scripts
  |-- docs/                    # Documentation
assets/                        # Static assets (images, icons, fonts)
functions/                     # Firebase Cloud Functions
```

**Total: 3,231 content files across all areas.**

---

## Content Organization

### Hierarchy

Content follows a three-level hierarchy:

```
House (or Standalone Hub)
  |-- Section (track, course, or topic area)
  |     |-- Module (individual learning unit)
```

### Houses

Houses are the primary organizational and identity units. Each student is sorted into a house during onboarding. There are 12 houses, 10 with substantial content:

| House | Domain | Files | Primary Content |
|-------|--------|-------|-----------------|
| Script | Automation & Efficiency | 505 | Linux CLI, Bash, Python, PowerShell |
| Code | Development & Engineering | 550 | 17 languages, DevOps, algorithms, DSA |
| Cloud | Infrastructure & Scale | 306 | AWS, Azure, OpenStack, API security, WSA |
| Web | Networking & Connections | 300 | Network+, CCNA, Backbone advanced networking |
| Forge | Hardware & Systems | 281 | CompTIA A+ Core 1/2, MD-100/101 |
| Shield | Security & Defense | 263 | Security+, CASP+, threat analysis, compliance |
| AI (Machine) | AI & Intelligent Automation | 190 | Cortex ML/AI (14 tracks), agent building |
| Eye | Monitoring & Analysis | 190 | CySA+, SOC, SIEM, CyberOps, threat hunting |
| Key | Cryptography & Secrets | 51 | Encryption, hashing, PKI, post-quantum |
| Dark Arts | Offensive Security | 47+228 | FEH course (house), Vault (standalone hub) |
| Matrix | Data Science | 1 | Index only (content via Projects) |
| Signal | Hardware/IoT (identity) | 0 | Content in standalone Signal hub |

### Standalone Hubs

Hubs that exist outside the `houses/` directory:

| Hub | Path | Files | Description |
|-----|------|-------|-------------|
| Dark Arts Vault | `dark-arts/` | 228 | Gated offensive security: Bug Hunting, EHE, WiFi Arsenal, malware analysis |
| Signal | `signal/` | 61 | Hardware projects: Arduino, ESP32, Raspberry Pi builds |
| Forensics | `forensics/` | 27 | Digital forensics: evidence, disk, memory (expanding to 60) |
| Arena | `arena/` | 23 | CTF challenges (BoxEngine-powered terminal simulation) |
| Operator | `operator/` | 25 | Guided terminal missions (config-driven CLI challenges) |
| Dispatch | `dispatch/` | 6 | IT helpdesk troubleshooting (BoxEngine-powered) |
| Arctic | `arctic/` | 17 | Curated CLI learning paths organized by district |
| Projects | `projects/` | 89 | Cross-house capstone projects (88 projects, 12 domains) |
| Hive | `hive/` | 5 | Multiplayer game modes (prototype) |

### Sub-Hubs (Mega-Sections Inside Houses)

Large content areas that function as independent hubs but live inside a house:

| Sub-Hub | Location | Files | Description |
|---------|----------|-------|-------------|
| Code Armory | `houses/code/armory/` | 192 | 17 programming language tracks (11 modules each) |
| Algorithm Chamber | `houses/code/algorithm-chamber/` | 122 | 11 algorithm/DSA topic tracks |
| DevOps | `houses/code/devops/` | 129 | 128 DevOps section modules |
| Backbone | `houses/web/backbone/` | 166 | 15 advanced networking tracks |
| Cortex | `houses/ai/cortex/` | 155 | 14 ML/AI tracks (11 modules each) |
| API Security | `houses/cloud/api/` | 94 | 8 API security/design tracks |
| WSA | `houses/cloud/modules/wsa/` | 107 | Web Services Architecture curriculum |
| CLH | `houses/script/courses/clh/` | 94 | Command Line Hacker companion modules |
| Bug Hunting | `dark-arts/vault/bug-hunting/` | 55 | Security research academy |
| EHE | `dark-arts/vault/ehe/` | 45 | Ethical Hacking Essentials track |

### Certification Track Landing Pages

15 certification index pages under `houses/` aggregate content from primary houses:

CompTIA A+ Core 1/2, Network+, Security+, Security+ Crypto, CySA+, CASP+, Linux+, Cisco CCNA, AWS CCP, AWS Developer, Azure Fundamentals, Cryptography Track, DevOps Fundamentals, Security Operations

These are navigation/aggregation pages -- they contain no unique content, only links to house modules mapped to certification objectives.

---

## Hub Relationships

### House Ownership

Each piece of content has a primary house owner. Cross-references exist but ownership is singular.

```
Script ----owns----> CLH, Linux Mastery, Python Fundamentals, Linux Labs
Code ------owns----> Armory, Algorithm Chamber, DevOps, Python Hub/Engineering
Cloud -----owns----> API Security, WSA, OpenStack, CSE
Web -------owns----> Backbone, Network Essentials, IP Addressing Applets
Forge -----owns----> A+ Applets, MD-100, MD-101, Hardware Applets
Shield ----owns----> Security Applets (146), Cyber Framework, Security 101, MS Security
AI --------owns----> Cortex (14 tracks), Agent Modules, AI Labs
Eye -------owns----> CyberOps Applets (99), CySA+ Track, SOC Labs
Key -------owns----> Crypto Labs, Presentations, Tools
Dark Arts --owns----> FEH Course (house), Vault/EHE/WiFi Arsenal/Bug Hunting (hub)
```

### Cross-Links

| Content | Primary Owner | Also Referenced By |
|---------|---------------|-------------------|
| Crypto labs | Key | Shield (crypto applets) |
| Linux security labs | Shield, Dark Arts | Script (CLI foundations) |
| Network forensics | Web (Backbone) | Forensics Hub |
| Python content | Script (fundamentals), Code (engineering) | Projects Hub |
| API Security | Cloud | Code (DevOps), Shield (security) |
| Vulnerability content | Dark Arts (Bug Hunting) | Eye (detection), Shield (defense) |
| Forensics | Forensics Hub | Eye (CySA+), Script (disk forensics), Dark Arts |
| Operator missions | Operator Hub | Script, Shield, Eye, Key (cross-domain) |

---

## Key Components

### Core Infrastructure (131 components in `_app/components/`)

#### AccessGuard.js
Access control gatekeeper. Loaded on every protected page.

- **Protection levels:** SORTED (must complete sorting), HOUSE (must belong to specific house), GATE (must pass Dark Arts gate), ADMIN (Firebase Admin or God Mode), ADMIN-ONLY (Firebase Admin strictly)
- **Trust-then-verify:** Synchronous localStorage check for instant UX, async Firebase custom claims verification for security
- **Storage keys:** `hexworth_house`, `hexworth_god_mode`, `hexworth_divergent`, `hexworth_house_hopper`, `hexworth_master_key`

#### ModuleProgress.js
Unified module completion handler.

- **Functions:** `complete(house, moduleId)`, `completeQuiz(house, quizId, score)`
- **Tracks:** Module completion, quiz scores, learning streaks, time spent
- **Storage:** `hexworth_progress` (nested object: `{house: {moduleId: {completed, timestamp}}}`)
- **Sync:** Lazy-loads Firebase/Firestore for instructor dashboard sync
- **Activity queue:** Writes to `hexworth_activity_queue` for dashboard ActivityFeed

#### FluxCapacitor.js
Floating navigation widget + component bootstrapper.

- **Primary function:** House navigation button visible on all content pages
- **Sub-loaders:** Automatically loads HED.js (Host Error Detector), GlobalSearch.js (Ctrl+K), TripWire.js (anti-cheat honeypot)
- **Pattern:** Self-contained IIFE, no dependencies beyond DOM

#### HouseRenderer.js
Shared renderer for all 9 house index pages. Each house provides a thin config (~50-80 lines) and HouseRenderer generates the complete page.

- **5-tab layout:** Learning Paths, House Content, Explore All (ContentDiscovery), Profile, Instructor
- **Input:** `HouseRenderer.init({ houseId, icon, title, fullTitle, domain, description, certBadges, paths, modules, categories, afterStatsHTML })`
- **Module source:** `ContentCatalog.getHouseModules(houseId)` for House Content tab
- **Pattern:** Follows CMMCDomainRenderer.js IIFE pattern -- CSS injected as `<style>` string, all HTML generated in JS

#### ContentCatalog.js
Module search and filter system. Contains metadata for 1,832 modules.

- **API:** `getHouseModules(house)`, `search(query)`, `getByType(type)`
- **Entry fields:** id, title, description, house, type, difficulty, duration, topics, paths, components (presentation/applet/lab)
- **Limitation:** 994 HTML files exist on disk but are NOT in the catalog -- these are invisible to search

#### BoxEngine.js
CTF Arena and Dispatch terminal simulation engine.

- **Architecture:** Config-driven. Each box has a `config.js` defining filesystem, flags, hints, scoring, and available commands
- **Features:** Desktop simulation, windowed apps, terminal emulator, flag capture, scoring, hints, time tracking
- **Modes:** Solo, Co-Op (via CoOpLobby), VS (competitive)
- **Components:** BoxEngine.js (orchestrator), Terminal.js (terminal emulator), per-box config.js files

#### ForensicsEngine.js
Forensics Hub rendering engine.

- **Data source:** ForensicsData.js (6 tracks, 60 modules defined, 27 files exist)
- **Features:** Track cards, module listings, progress tracking, cross-linked existing modules from other houses
- **Progress:** `hexworth_forensics_progress` localStorage key

#### SignalEngine.js
Signal Hub rendering engine.

- **Data source:** SignalData.js (7 sections, hardware platform definitions, project listings)
- **Features:** Section cards, project guides, hardware platform requirements, toolkit library
- **Progress:** `hexworth_signal_progress` localStorage key

#### ContentRegistry (content-registry.js)
Central content management system used by the dashboard.

- **Content items:** Detailed metadata with house, type, difficulty, duration, topics, paths, prerequisites, objectives, component URLs
- **Houses definition:** 10 houses with id, name, shortName, icon, emblem, domain, description, color, mascot
- **Learning paths:** Ordered sequences pulling from any house
- **API:** `getHouseContent(houseId)`, `getPathsForHouse(house)`, `getPathProgress(pathId)`

---

## Rendering Systems

The platform uses multiple rendering paradigms for different content types:

### 1. Shared Renderer Pattern (HouseRenderer)

Used by: All 9 active house index pages (Script, Cloud, Code, Web, Forge, Shield, Dark Arts, AI, Eye, Key)

```
index.html (thin config: HOUSE_ID, CATEGORIES, HouseRenderer.init({...}))
    |-- loads HouseRenderer.js
    |-- loads ContentCatalog.js
    |-- HouseRenderer generates full page DOM
    |-- ContentCatalog provides module data
```

### 2. Custom Engine Pattern

Used by: Signal Hub, Forensics Hub

```
index.html (minimal: loads Engine + Data, calls Engine.renderHub())
    |-- loads [Hub]Data.js (all content definitions)
    |-- loads [Hub]Engine.js (rendering + interaction logic)
    |-- Engine generates full page DOM from Data
```

### 3. Domain Renderer Pattern

Used by: CMMC compliance applets, crypto applets, threat applets, security fundamentals applets

```
applet.html (loads Data + Renderer)
    |-- loads CMMCDomainData.js / CryptoAppletData.js / etc.
    |-- loads CMMCDomainRenderer.js / CryptoAppletRenderer.js / etc.
    |-- Renderer generates interactive content from Data definitions
```

### 4. BoxEngine Pattern

Used by: Arena CTF boxes (22), Dispatch troubleshooting boxes (5)

```
index.html (loads BoxEngine + Terminal + config)
    |-- loads BoxEngine.js (orchestrator)
    |-- loads Terminal.js (terminal emulator)
    |-- loads boxes/{box-name}/config.js (box definition)
    |-- BoxEngine simulates desktop + terminal from config
```

### 5. Static HTML Pattern

Used by: Presentations, labs, quizzes, standalone modules, textbook pages

```
module.html (self-contained HTML)
    |-- loads AccessGuard.js (access control)
    |-- loads ModuleProgress.js (completion tracking)
    |-- loads FluxCapacitor.js (navigation widget)
    |-- contains all content as static HTML
    |-- may load ContentDecoder.js for encoded content
```

### 6. CLH Terminal Pattern

Used by: Command Line Hacker applets (31 units)

```
applet.html (loads CLH components)
    |-- loads CLHConfig.js (unit definition)
    |-- loads CLHTerminal.js (terminal simulation)
    |-- loads CLHInsightValidator.js (answer validation)
    |-- Terminal simulates real investigation scenarios
```

---

## Progress Tracking

### localStorage Keys

Progress is tracked entirely in localStorage with Firestore sync for instructor visibility.

| Key | Format | Purpose |
|-----|--------|---------|
| `hexworth_progress` | `{house: {moduleId: {completed: bool, timestamp: number}}}` | Module completion by house |
| `hexworth_modules_completed` | number | Total module count |
| `hexworth_quizzes_passed` | number | Total quiz count |
| `hexworth_streak` | number | Current day streak |
| `hexworth_last_study` | ISO date string | Last study date |
| `hexworth_house` | string | User's sorted house (web, shield, code, etc.) |
| `hexworth_divergent` | 'true' | Whether user is Divergent (house hopper) |
| `hexworth_house_hopper` | 'true' | Whether user has hopped houses |
| `hexworth_god_mode` | 'true' | Admin override mode |
| `hexworth_master_key` | string | Temporary admin access key |
| `hexworth_master_key_expiry` | number | Master key expiration timestamp |
| `hexworth_xp` | number | Experience points |
| `hexworth_level` | number | Current level |
| `hexworth_night_sessions` | number | Count of late-night study sessions |
| `hexworth_last_visited` | `{url, title, section, timestamp}` | Continue Learning banner |
| `hexworth_activity_queue` | array of events | Pending activity feed events |
| `hexworth_signal_progress` | object | Signal Hub module progress |
| `hexworth_forensics_progress` | object | Forensics Hub module progress |
| `hexworth_web_midterm_passed` | 'true' | Web House midterm unlock |
| `aplus-core1-progress` | `{ch01: {completed}}` | A+ Core 1 chapter progress |
| `aplus-core2-progress` | `{ch13: {completed}}` | A+ Core 2 chapter progress |
| `gate[N]_complete` | 'true' | Dark Arts gate N cleared |
| `gate[N]_timestamp` | number | Gate completion time |
| `dark_arts_unlocked` | 'true' | All gates cleared |
| `dark_arts_[moduleId]_completed` | 'true' | Dark Arts FEH module completion |

### Firestore Sync

ModuleProgress.js lazy-loads Firebase SDK and syncs completion data to Firestore for instructor dashboards. This is non-blocking and fails silently if offline or unauthenticated.

Key Firestore collections:
- `users/` -- User profiles (callsign, house, progress, XP)
- `classes/` -- Class enrollment and management
- Field whitelist enforced in `firestore.rules` (line 22-29)

---

## Access Control

### AccessGuard Protection Levels

| Level | Requirement | Redirect |
|-------|-------------|----------|
| `sorted` | User has completed house sorting quiz | `/sorting.html` |
| `house` | User belongs to specified house (or has God Mode) | `/dashboard.html` |
| `gate` | User has passed specified Dark Arts gate | `/dark-arts/gate-1.html` |
| `admin` | Firebase Admin, God Mode, or Master Key | `/unauthorized.html` |
| `admin-only` | Firebase Admin custom claim only | `/unauthorized.html` |

### God Mode / Master Key

- **God Mode** (`hexworth_god_mode`): Bypasses all house and gate restrictions
- **Master Key** (`hexworth_master_key`): Temporary admin access (5-minute expiry)
- **Firebase Admin**: Server-verified custom claims on Firebase Auth token

### Dark Arts Gate System

The Vault (advanced offensive security content) is gated behind 5 challenges:
1. Gate 1: Source code inspection, hex encoding
2. Gate 2: CSS inspection, Base64 decoding
3. Gate 3: Steganography
4. Gate 4: DTMF audio analysis
5. Gate 5: Synthesis (combine all clues)

Gate ciphers rotate periodically (managed by `config/cipher.js` and `dark-arts/gate-cipher.js`).

---

## File Naming Conventions

### Module Types

| Extension | Type | Example |
|-----------|------|---------|
| `.module.html` | Guided learning module | `script-lm-01-welcome.module.html` |
| `.lab.html` | Hands-on lab | `eye-cysa-ch13-forensics.lab.html` |
| `.applet.html` | Interactive applet | `shield-threats-malware-types.applet.html` |
| `.presentation.html` | Slide deck presentation | `forge-windows-editions.presentation.html` |
| `.quiz.html` | Quiz/assessment | `web-networking-fundamentals-ports.quiz.html` |
| `.tool.html` | Interactive tool | `ventoy.tool.html` |
| `.exam.html` | Formal exam | `web-networking-midterm.exam.html` |
| `.textbook.html` | Textbook chapter | `web-networking-textbook-ch7-20.textbook.html` |
| `.game.html` or game name | Educational game | `pipe-snake`, `cloud-hop` |
| `config.js` | Box configuration (Arena/Dispatch) | `boxes/a1-ancient-ledger/config.js` |
| `.mission.html` | Operator terminal mission | `forensics-01.mission.html` |

### Naming Pattern

```
{house-prefix}-{section}-{identifier}.{type}.html
```

Examples:
- `script-lm-42-variables.module.html` (Script house, Linux Mastery, module 42)
- `eye-cysa-ch13-forensics.lab.html` (Eye house, CySA+ chapter 13)
- `shield-threats-malware-types.applet.html` (Shield house, threats section)
- `cloud-api-006.lab.html` (Cloud house, API track, lab 6)
- `forge-md100-m01.presentation.html` (Forge house, MD-100, module 1)

### House Prefixes

| Prefix | House |
|--------|-------|
| `script-` | Script |
| `code-` | Code |
| `cloud-` | Cloud |
| `web-` | Web |
| `forge-` | Forge |
| `shield-` | Shield |
| `ai-` | AI |
| `eye-` | Eye |
| `key-` | Key |
| `dark-arts-` or `da-` | Dark Arts |
| `df-` | Forensics |
| `sg-` | Signal |

---

## Content Delivery Structure

### Page Load Sequence (Typical Module)

```
1. Browser loads module.html
2. AccessGuard.js executes (synchronous)
   - Checks localStorage for sorting/house/gate requirements
   - Redirects if requirements not met
3. AchievementManager.js loads
4. ModuleProgress.js loads
5. Page renders content (static HTML or renderer-generated)
6. FluxCapacitor.js loads (deferred)
   - Injects navigation widget
   - Loads HED.js, GlobalSearch.js, TripWire.js
7. ContentDiscovery.js loads (if present)
8. TrailHunter.js loads (patronus guide system)
9. MasteryXP.js loads (XP calculation)
10. StampRollout.js loads (completion stamps)
```

### Page Load Sequence (House Index)

```
1. AccessGuard.js (sorted check)
2. AchievementManager.js, ModuleProgress.js
3. HOUSE_ID and CATEGORIES defined (inline script)
4. SkillTreeData.js, LearningPaths.js, AchievementSystem.js, ProgressManager.js
5. HouseProgressPanel.js
6. FluxCapacitor.js
7. ContentCatalog.js (1,832 module definitions)
8. mascot-lore.js
9. FavoritesManager.js
10. HouseRenderer.js -- init() called with config
    - Generates complete 5-tab page DOM
    - Populates Learning Paths from config.paths
    - Populates House Content from ContentCatalog
    - Populates categories from config.categories
11. ContentDiscovery.js (search/filter for Explore tab)
12. TrailHunter.js (patronus guide)
13. MasteryXP.js, StampRollout.js
```

### Dashboard Load Sequence

```
1. AccessGuard.js (sorted check)
2. 30+ component scripts loaded
3. content-registry.js (central content definitions)
4. Dashboard controller initializes:
   - Determines user house from localStorage
   - Applies house theme
   - Populates Learning Paths tab
   - Populates House Content tab
   - Populates Explore All tab
   - Initializes stats, community, leaderboard
5. Firebase Auth check (async)
6. Firestore sync (async, non-blocking)
```

---

## Configuration Files

### `config/content-registry.js`

Central content management. Defines:
- All content items with full metadata (house, type, difficulty, topics, prerequisites, objectives, component URLs)
- House definitions (10 houses with visual identity)
- Learning path definitions (ordered sequences)
- Utility functions for content retrieval and progress tracking

### `config/house-palette.js`

House color themes: primary, secondary, glow, bg, border CSS custom properties for each house.

### `config/mascot-lore.js`

House mascot definitions: name, species, personality, lore text, badge image paths.

### `config/skill-tree.js`

Skill tree node definitions for the visual skill tree component.

### `config/cipher.js`

Dark Arts gate cipher rotation schedules. Controls which cipher set is active for gate challenges.

### `config/paths.js`

Learning path definitions (may be supplemental to content-registry paths).

---

## Infrastructure Components

### Anti-Cheat / Integrity

- **TripWire.js** -- Honeypot defense system. Detects DevTools, inspects localStorage tampering, triggers effects on detected cheating
- **TripWireEffects.js** -- Visual/behavioral effects triggered by TripWire (page distortion, Desktop Goose, rickroll)
- **HED.js** -- Host Error Detector. Loaded via FluxCapacitor on every page
- **ContentDecoder.js** -- Decodes encoded content (prevents casual source-code cheating on quizzes)
- **WallOfShame.js** -- Public display of caught cheaters

### Analytics / Instructor

- **InstructorDashboard** -- Analytics for instructors (lazy-loaded in house index Instructor tab)
- **ClassManager.js** -- Class enrollment and management
- **AssignmentManager.js** -- Assignment creation and tracking
- **XPMasterLedger.js** -- Canonical XP calculation and audit trail
- **GameTracker** -- Arcade game score tracking and leaderboards

### Social / Community

- **messaging/** -- Direct messaging system between users
- **multiplayer/** -- Real-time multiplayer infrastructure (WebSocket/Firestore)
- **hive/** -- Multiplayer game mode components (competitive, co-op, Red Queen)
- **LeaderboardManager** -- House and global leaderboards
- **ActivityFeed.js** -- Dashboard activity stream
- **DailyDirectives.js** -- Daily challenge/task system

### UI / UX

- **FluxCapacitor.js** -- Floating navigation widget (visible on all pages)
- **GlobalSearch.js** -- Ctrl+K search overlay (loaded by FluxCapacitor)
- **AmbientMusic.js** -- Background audio system
- **SpriteRotator.js** -- Animated sprite system
- **AudioReactivity.js** -- Audio-reactive visual effects
- **SoundToggle.js** -- Audio enable/disable control
- **TouristVisa.js** -- First-visit flow for unsorted users

### Achievement System (3 layers)

1. **AchievementManager.js** -- Core unlock/check logic, retroactive badge checking
2. **AchievementRegistry.js** -- Achievement definitions (IDs, names, conditions)
3. **AchievementSystem.js** -- Achievement UI rendering, notification toasts
4. **AchievementPanel.js** -- Full achievement panel display

### Specialized Engines

- **SQLEngine.js** / **SQLTerminal.js** -- In-browser SQL execution for database labs
- **SkulptRunner.js** -- In-browser Python execution (via Skulpt)
- **CodeRunner.js** -- Multi-language code execution
- **TurtleCanvas.js** -- Python turtle graphics renderer
- **SecurityTerminal.js** -- Security-themed terminal simulation
- **BlacksiteTerminal.js** -- Dark Arts blacksite terminal variant
- **CareerExplorerEngine.js** -- Career path exploration tool
- **CertPathRenderer.js** -- Certification path visualization
- **CertificateRenderer.js** -- Completion certificate generation

---

*Architecture Overview version: 1.0 | Source: Codebase analysis of 3,231 files, 131 components, and all hub/house index pages*
