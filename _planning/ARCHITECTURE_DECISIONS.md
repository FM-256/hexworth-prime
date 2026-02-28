# Hexworth Prime - Architecture Decisions

**Created:** December 16, 2025
**Status:** Active - Foundational Decisions

---

## Decision Log

| ID | Decision | Date | Rationale |
|----|----------|------|-----------|
| AD-001 | Single entry point (START.html) | Dec 16, 2025 | Clean UX, no confusion |
| AD-002 | Path encoding with Caesar-17 | Dec 16, 2025 | Protect proprietary content |
| AD-003 | Config file uses obvious naming | Dec 16, 2025 | Security through encoding, not obscurity |
| AD-004 | Quiz Button Pattern (merge + persistent) | Dec 24, 2025 | Clean UI, guided flow, reusable access |
| AD-005 | CloudFront CDN for Heavy Content | Dec 27, 2025 | HTML5Point presentations need data/ folders |
| AD-006 | Dual Content System (SAMPLE_MODULES + ContentRegistry) | Dec 27, 2025 | Different entry points need same data |
| AD-007 | Member Profile Subcollection | Feb 5, 2026 | Efficient roster queries, small class docs |
| AD-008 | Student Join via Firestore Rules (No Cloud Functions) | Feb 5, 2026 | Field-level security, no server infrastructure |
| AD-009 | Centralized User Profile (`users/{uid}`) | Feb 5, 2026 | Single identity source, Blackboard export, profile gate |
| AD-010 | Two-Layer Progress Architecture | Feb 8, 2026 | Separate academic tracking (Layer 1) from gamification (Layer 2) |
| AD-011 | Hub & Spoke Tool Integration (Nexus) | Feb 27, 2026 | Connect 6 dev tools via orchestrator, not merge |
| AD-012 | Domain Hub Architecture (Cross-House Specialization) | Feb 27, 2026 | Each house owns one domain hub; other houses reference, not rebuild |

---

## AD-001: Single Entry Point

### The Problem
When users extract a zip, seeing multiple files/folders creates confusion:
- "Which one do I click?"
- "Is it index.html or start.html?"
- "Do I need to run a server?"

### The Solution
```
Hexworth Prime/
├── START.html          ← THE ONLY VISIBLE ENTRY POINT
├── app/                ← All application code (hidden complexity)
├── assets/             ← Images, audio, etc.
└── config/             ← Configuration files
```

### Behavior
1. User extracts zip
2. User sees ONE file: `START.html`
3. User double-clicks `START.html`
4. Immediately loads "Choose Your Reality" screen
5. User selects Magic or Matrix theme
6. App proceeds from there

### Implementation
- `START.html` is minimal - just loads the app
- All complexity lives in subdirectories
- No server required - pure static files
- Works offline

---

## AD-002: Path Encoding System

### The Problem
Proprietary paths, sensitive content locations, and unique features are visible in plain text to anyone who views source code. This includes:
- Dark Arts gate locations
- Vault paths
- Hidden content paths
- Any unique/proprietary features

### The Solution
Caesar cipher encoding with shift key **17** for all sensitive paths.

### What Gets Encoded
| Category | Examples |
|----------|----------|
| Sensitive paths | Dark Arts gates, Vault, hidden content |
| Proprietary routes | Unique features, premium content |
| Internal structure | Module locations that reveal architecture |
| Easter eggs | Hidden features, secrets |

### What Stays Plain
| Category | Examples |
|----------|----------|
| Public paths | Main house pages, public presentations |
| External URLs | CDN links, public resources |
| Standard assets | CSS, JS library paths |

### Encoding Specification

**Algorithm:** Caesar Cipher
**Shift Key:** 17
**Character Set:** a-z, A-Z, 0-9, special chars pass through

**Encode Function:**
```javascript
function encodePathC17(str) {
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        // Lowercase letters
        if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + 17) % 26) + 97);
        }
        // Uppercase letters
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + 17) % 26) + 65);
        }
        // Numbers (shift within 0-9)
        if (code >= 48 && code <= 57) {
            return String.fromCharCode(((code - 48 + 7) % 10) + 48);
        }
        // Everything else passes through
        return char;
    }).join('');
}

function decodePathC17(str) {
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        // Lowercase letters
        if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 - 17 + 26) % 26) + 97);
        }
        // Uppercase letters
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 - 17 + 26) % 26) + 65);
        }
        // Numbers (shift within 0-9)
        if (code >= 48 && code <= 57) {
            return String.fromCharCode(((code - 48 - 7 + 10) % 10) + 48);
        }
        // Everything else passes through
        return char;
    }).join('');
}
```

### Example Transformations

| Original | Encoded (C17) |
|----------|---------------|
| `dark-arts` | `urix-rkzj` |
| `vault` | `mrlck` |
| `gate1.html` | `xrkv8.yczd` |
| `secrets/hidden` | `jvtivkj/yeuuvi` |

### Storage Location
```
config/
├── config.js           ← Public configuration
└── paths.js            ← Encoded paths (this file)
```

**paths.js structure:**
```javascript
const ENCODED_PATHS = {
    // Dark Arts
    darkArtsEntry: 'yflivi/urix-rkzj/xrkv.yczd',
    darkArtsGate2: 'yflivi/urix-rkzj/xrkvj/xrkv-9.yczd',
    darkArtsVault: 'yflivi/urix-rkzj/mrlck/zeuvo.yczd',

    // Hidden features
    easterEgg1: 'rjjvkj/yeuuvi/jvtivk.yczd',

    // Premium content
    advancedLabs: 'crsi/rumritvu/zeuvo.yczd'
};

// Decode at runtime
function getPath(key) {
    return decodePathC17(ENCODED_PATHS[key]);
}
```

### Security Notes
- This is **obscurity**, not encryption
- Determined reverse engineers can decode
- Purpose: Prevent casual copying, protect IP at surface level
- For true security, use server-side auth (future consideration)

---

## AD-003: Obvious Config Naming

### The Problem
Should config files be hidden/obscured?

### The Decision
**No.** Use obvious names: `config.js`, `paths.js`

### Rationale
- Security comes from encoding the VALUES, not hiding the files
- Obscured filenames add maintenance complexity
- "Security through obscurity" is weak anyway
- Clear naming helps development and debugging

---

## AD-004: Quiz Button Pattern

### The Problem
Module cards and quiz cards were separate entities:
- Docker Basics card → links to presentation
- Docker Quiz card → links to quiz

This caused:
1. **UI clutter** - Two cards for one topic
2. **Broken learning flow** - Quiz disconnected from content
3. **No progression gating** - Users could skip to quiz without learning
4. **Inconsistency** - Some houses did it differently

### The Decision
**Merge quizzes into parent modules + persistent unlock button**

### The Pattern

```
┌─────────────────────────────────────────┐
│ 🐳  Docker Basics                       │
│                                         │
│ Container fundamentals: images,         │
│ containers, and Docker commands         │
│                                         │
│ [📊 Slides] [🎮 Interactive] [🧪 Lab]   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  📝 Take Quiz                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Button States

| State | Visibility | Label |
|-------|------------|-------|
| Content incomplete | Greyed/locked | `🔒 Complete content first` |
| Content complete, quiz not taken | **Visible & prominent** | `📝 Take Quiz` |
| Content complete, quiz passed | **Visible (stays)** | `✓ Quiz Passed - Retake?` |

### Key Behavior: "Unlocks but Never Re-locks"

Once content is completed:
- Quiz button appears and **stays permanently**
- Allows quick access for review/retake (cert exam prep)
- Respects learning flow for first-time users
- Supports returning users who need quick assessment

### Implementation Requirements

1. Track content completion per module in localStorage
2. Conditional render for quiz button based on completion state
3. Button states: locked → available → completed (with retake option)
4. Quiz moved from standalone card into parent's `components` array
5. Remove standalone quiz cards from SAMPLE_MODULES

### Rationale

| Factor | Before (Separate) | After (Merged) |
|--------|-------------------|----------------|
| Cards per topic | 2 | 1 |
| Learning flow | Disconnected | Guided |
| Quiz access | Always available | Unlocked on completion |
| Review access | Always available | **Still available** (persistent button) |
| Progression system | Not supported | Supports tier advancement |

### Applies To

All houses with quiz content:
- House of the Code (Docker, K8s, Terraform quizzes, etc.)
- House of the Shield
- House of the Web
- All other houses with assessments

---

## AD-005: CloudFront CDN for Heavy Content

### The Problem
Some educational content (especially HTML5Point presentations) requires:
- Large `data/` folders with scripts, images, and player assets
- Files like `data/player/player.js`, `data/common/script.js`, `data/player/pre.gif`
- These folders are ~5-20MB per presentation
- Including all this in the local deployment bloats the package

### The Solution
Host heavy content on CloudFront CDN: `https://d2hie3dpn9wvbb.cloudfront.net/`

### What Goes to CloudFront

| Category | Examples | Reason |
|----------|----------|--------|
| CMMC Modules | All 17 domains (AC, AU, AT, CM, etc.) | HTML5Point presentations with data/ folders |
| Large Presentations | Multi-slide interactive content | Reduces local package size |
| Media-Heavy Content | Video-embedded modules | Bandwidth optimization |

### What Stays Local

| Category | Examples | Reason |
|----------|----------|--------|
| Simple Applets | Framework Selector, Calculators | Self-contained, no external dependencies |
| Lightweight HTML | Single-file tools | No data/ folder needed |
| Core App | Dashboard, Houses, Navigation | Must work offline |

### CloudFront URL Pattern
```
https://d2hie3dpn9wvbb.cloudfront.net/CMMC/{module}/{file}.html

Examples:
- CMMC/ACv2/ACv2.html           (Access Control)
- CMMC/frameworkv2/CMMCFrameworkv2.html  (Framework Overview)
- CMMC/CMMCTestKnowledge/CMMCTestKnowledge2.html (Quiz)
```

### CMMC Module Inventory (17 modules)

| ID | Module | CloudFront Path |
|----|--------|-----------------|
| AC | Access Control | `CMMC/ACv2/ACv2.html` |
| AU | Audit & Accountability | `CMMC/AUv2/AUv2.html` |
| AT | Awareness Training | `CMMC/ATv2/ATv2.html` |
| CM | Config Management | `CMMC/CMv2/CMv2.html` |
| CUI | Controlled Unclassified Info | `CMMC/CUI/CUI_2.html` |
| Framework | CMMC Framework | `CMMC/frameworkv2/CMMCFrameworkv2.html` |
| IA | Identification & Auth | `CMMC/IAv2/IAv2.html` |
| IR | Incident Response | `CMMC/IRv2/IRv2.html` |
| MA | Maintenance | `CMMC/MAv2/MAv2.html` |
| MP | Media Protection | `CMMC/MPv2/MPv2.html` |
| PS | Personnel Security | `CMMC/PSv2/PSv2.html` |
| PE | Physical Protection | `CMMC/PEv2/PEv2.html` |
| Quiz | CMMC Knowledge Test | `CMMC/CMMCTestKnowledge/CMMCTestKnowledge2.html` |
| RA | Risk Assessment | `CMMC/RAv2/RAv2.html` |
| CA | Security Assessment | `CMMC/CAv2/CAv2.html` |
| SC | System/Comm Protection | `CMMC/SCv2/SCv2.html` |
| SI | System/Info Integrity | `CMMC/SIv2/SIv2.html` |

### Implementation Notes
- External URLs work with `PageTransition.navigateTo()` - just `window.location.href = url`
- Dashboard detects external URLs (starts with `http`) and navigates directly
- CMMC landing page: `https://d2hie3dpn9wvbb.cloudfront.net/CMMC/CMMC.html`

### Why Not Include data/ Folders Locally?
1. **Size**: 17 modules × ~10MB = 170MB added to deployment
2. **Complexity**: HTML5Point player needs exact folder structure
3. **Maintenance**: Updating content means re-deploying entire app
4. **CDN Benefits**: Faster loading, global distribution, caching

---

## AD-006: Dual Content System

### The Problem
Content can be accessed from multiple entry points:
1. **Dashboard Search/Explore** → Uses `ContentRegistry.js`
2. **House Pages** → Uses `SAMPLE_MODULES` in each house's `index.html`

If these systems have different data, content appears broken from one entry point.

### The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ENTRY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Dashboard                          House Page                │
│    ┌─────────────┐                   ┌─────────────┐           │
│    │ Search Box  │                   │ Shield Home │           │
│    │ Explore All │                   │ Module Grid │           │
│    └──────┬──────┘                   └──────┬──────┘           │
│           │                                  │                  │
│           ▼                                  ▼                  │
│    ContentRegistry.js              SAMPLE_MODULES array         │
│    (config/content-registry.js)    (houses/shield/index.html)   │
│           │                                  │                  │
│           └──────────────┬───────────────────┘                  │
│                          │                                      │
│                          ▼                                      │
│                   Navigation Handler                            │
│                   (PageTransition)                              │
│                          │                                      │
│           ┌──────────────┴──────────────┐                      │
│           │                             │                       │
│           ▼                             ▼                       │
│    Local Content              External Content (CloudFront)     │
│    houses/shield/...          https://d2hie3dpn9wvbb...        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Rule
**Both systems must have identical URLs for the same content.**

When updating content URLs:
1. Update `ContentRegistry.js` (for Dashboard access)
2. Update house `index.html` SAMPLE_MODULES (for House page access)

### Example: CMMC Config Management

**ContentRegistry.js:**
```javascript
'shield-cmmc-cm': {
    id: 'shield-cmmc-cm',
    title: 'CMMC Config Management',
    components: {
        applet: 'https://d2hie3dpn9wvbb.cloudfront.net/CMMC/CMv2/CMv2.html'
    }
}
```

**Shield index.html SAMPLE_MODULES:**
```javascript
{
    id: 'shield-cmmc-cm',
    title: 'CMMC Config Management',
    href: 'https://d2hie3dpn9wvbb.cloudfront.net/CMMC/CMv2/CMv2.html'
}
```

### Content System Comparison

| Aspect | SAMPLE_MODULES | ContentRegistry |
|--------|----------------|-----------------|
| Location | Each house's `index.html` | `config/content-registry.js` |
| Used By | House page module grid | Dashboard search, explore |
| Format | Simple array with `href` | Detailed object with `components` |
| Metadata | Basic (title, description, icon) | Rich (topics, paths, objectives, prerequisites) |
| Navigation | Direct link via `href` | Type-aware via `components.applet/presentation/quiz` |

### Audit Tool Implications
When auditing content:
1. Check **both** locations for each content item
2. Verify URLs match between systems
3. External URLs should start with `https://`
4. Local paths are relative to house directory (for SAMPLE_MODULES)

### Future Consideration: Single Source of Truth
Eventually migrate to:
- ContentRegistry as **sole source**
- House pages **pull from** ContentRegistry
- Eliminates dual-maintenance burden

For now, maintain both systems in sync.

---

## AD-007: Member Profile Subcollection

### The Problem
When students join a class, the handler needs to see their names, avatars, and house affiliations in a roster. Storing all member data in the class document would bloat it (especially with 50 students). Querying individual user docs for each member is N reads.

### The Decision
Store student profiles in a subcollection: `classes/{classId}/members/{uid}`

### Why This Works
- **Class document stays small** — only stores a `memberUids[]` array (for `array-contains` queries and rules validation)
- **Roster queries are efficient** — single collection read gets all member profiles
- **Class-specific data** — can store joinDate, house-at-join-time, class-specific roles
- **Follows existing pattern** — same subcollection approach as `assignments/`
- **Self-service writes** — students create their own profile doc (rules: `auth.uid == memberId`)

### Schema
```javascript
// classes/{classId}/members/{uid}
{
    uid: "firebase-uid",
    displayName: "Student Name",
    email: "student@example.com",
    photoURL: "https://...",
    house: "shield",
    callsign: "@hacker",
    joinedAt: serverTimestamp()
}
```

### Date
February 5, 2026

---

## AD-008: Student Join via Firestore Rules (No Cloud Functions)

### The Problem
Students need to join classes by adding their UID to `memberUids`. This requires write access to class documents — but students shouldn't be able to modify other fields (name, description, handlerUid, etc.).

### The Decision
Use Firestore security rules with `affectedKeys()` to allow field-level updates. No Cloud Functions needed.

### Rule Logic
- **Join:** Only `['memberUids', 'memberCount', 'updatedAt']` can change. New array must contain all old UIDs plus exactly one new one (the requesting user). User must not already be a member. Class must be below capacity.
- **Leave:** Same fields. Old array must contain all new UIDs plus one removed (the requesting user). User must be a current member.
- **Members subcollection:** Students can create/update their own profile (`auth.uid == memberId`). Students and handlers can delete (handler via parent class ownership check).

### Why Not Cloud Functions?
- Hexworth Prime is a static app (no server infrastructure)
- Rules are sufficient for field-level validation
- Avoids cold start latency, billing, and deployment complexity
- All validation happens at the database layer

### Trade-offs
- Rules are harder to debug than function logic
- Complex rule expressions can be brittle
- No server-side side effects (e.g., sending join notifications)

### Date
February 5, 2026

---

## AD-009: Centralized User Profile (`users/{uid}`)

### The Problem
Students join classes, and handlers need to export rosters to Blackboard LMS. Blackboard requires real institutional names (Last Name, First Name) and Student IDs. Google Auth `displayName` is unreliable — users set it themselves and it's a single string, not split into first/last.

An initial approach of collecting names per-class (during join) was rejected: students would re-enter their name for every class they join.

### The Decision
Store institutional identity in a centralized `users/{uid}` Firestore document. Snapshot relevant fields into the member subcollection at join time.

### Why This Works
- **Enter once, use everywhere** — student fills out profile once in Settings
- **Blackboard compatibility** — First Name, Last Name, Student ID as separate fields
- **Pre-fill from Google** — splits `displayName` into firstName/lastName on first load
- **Profile gate** — students can't join classes without completing their profile
- **Snapshot pattern** — member subcollection gets a copy at join time for efficient roster reads

### Schema
```javascript
// users/{uid} — Source of truth
{
    firstName: "Jane",
    lastName: "Doe",
    studentId: "STU-12345"     // Optional, supports institutional ID
}

// classes/{classId}/members/{uid} — Snapshot at join time
{
    uid, firstName, lastName, displayName, studentId,
    email, photoURL, house, callsign, joinedAt
}
```

### Data Flow
```
Settings Modal → users/{uid}  (source of truth)
                      ↓
joinClass() reads → copies to classes/{classId}/members/{uid}
                      ↓
Handler roster reads ← member subcollection
                      ↓
Export CSV ← "Last Name, First Name, Student ID, Email"
```

### Trade-offs
- Profile snapshot is point-in-time (doesn't auto-update if student changes name later)
- Student ID is optional (not all contexts need it)
- Pre-fill heuristic splits on space — may not work for complex names (handled by letting student correct)

### Date
February 5, 2026

---

## AD-010: Two-Layer Progress Architecture

### The Problem
Progress tracking fuses two fundamentally different concerns into one monolithic `hexworth_progress` object:
- **Academic data** (completions, scores, timestamps) needed by instructors via the Handler Dashboard
- **Gamification data** (XP, level, achievements, streaks) shown to students on the dashboard

This fusion causes: labs writing to keys the dashboard never reads, granular component data trapped in isolated stores, no clean academic feed for Firestore sync, and multiple incompatible storage formats.

### The Decision
Split progress into two layers with a strict directional data flow:

**Layer 1 — Course Progress (Specific/Academic):**
- Per-course, per-module, per-component tracking
- Storage: `{courseId}-progress` (one key per course)
- Written by: labs, quizzes, presentations, applets
- Read by: course index pages, Firestore sync, Handler Dashboard
- WSAProgress is the prototype; generalized as `CourseProgress`

**Layer 2 — Platform Profile (Overall/Gamification):**
- XP, level, achievements, streaks, aggregate stats
- Storage: `hexworth_progress` (gamification only)
- Written by: Layer 2 reacting to Layer 1 events
- Read by: student dashboard, profile tab, achievement system
- NEVER stores per-module completion data

### The Rule
Data flows upward: Specific → Overall. Content writes to Layer 1. Layer 2 derives from Layer 1 events. No content writes to both layers. No reverse flow.

### Generalization Principle
Any pattern that works for one course must generalize to every course. Each course defines its own component schema (WSA: 4 components, A+: 1, Dark Arts: 5 gates), but the storage contract and event interface are uniform.

### Full Design
See: `_planning/TWO_LAYER_PROGRESS_ARCHITECTURE.md`

### Date
February 8, 2026

---

## AD-011: Hub & Spoke Tool Integration (Nexus)

### The Problem
Six developer tools detect, track, and report issues independently: EduScan (build-time scanning), Sprint Master (sprint tracking), Spellbook (feature tickets), ToDo CLI (quick tasks), HED/HealthPanel (runtime errors), and Audit Tool (content auditing). There is no automated path from detection to tracking. No unified view of all findings. Every cross-tool handoff is manual — a human reads one tool's output, then types into another tool.

### The Decision
Build Nexus — a Hub & Spoke CLI orchestrator that connects existing tools through spoke adapters and a shared findings format. Nexus sits in the center and routes data between tools. It does not replace, merge, or modify any tool.

### Architecture
```
                    ┌─────────────┐
          ┌────────│ NEXUS HUB   │────────┐
          │        │ findings[]  │        │
          │        │ pipes[]     │        │
          │        └──────┬──────┘        │
          │               │               │
    ┌─────┴─────┐   ┌────┴────┐   ┌──────┴─────┐
    │ EduScan   │   │ Sprint  │   │ Spellbook   │
    │ adapter   │   │ Master  │   │ adapter     │
    └───────────┘   │ adapter │   └─────────────┘
    ┌───────────┐   └─────────┘   ┌─────────────┐
    │ HED       │   ┌─────────┐   │ ToDo        │
    │ adapter   │   │ Audit   │   │ adapter     │
    └───────────┘   │ adapter │   └─────────────┘
                    └─────────┘
```

Each spoke adapter implements: `getFindings()`, `getStatus()`, `acceptFinding()`.

### Rationale
- **Preserves independence.** Every tool works standalone. Remove Nexus and nothing breaks.
- **Lower risk than a merge.** No rewriting of existing tools. Each adapter is ~50-100 lines.
- **Incremental adoption.** Connect one spoke at a time. Phase 2 starts with just EduScan + Sprint Master.
- **Small, testable surface.** Each adapter depends on exactly one tool's output format.
- **Matches existing patterns.** CLI-native like EduScan and Sprint Master. JSON store like sprints.json.

### Trade-offs
- Adds a 7th tool to maintain (the hub core + 6 adapters)
- Spoke adapters must stay in sync when tools change their output format
- Shared findings format is a contract that all tools must honor (deliberately minimal: 7 required fields)
- Pull-based model (no real-time events) — adequate for current scale, may need push for HED integration later

### Full Design
See:
- `_tools/nexus/README.md` — Tool documentation and command reference
- `_tools/NEXUS_DESIGN.md` — Design document (problem, solution, integration scenarios)
- `_planning/NEXUS_HUB_ARCHITECTURE.md` — Architecture deep-dive (adapters, pipes, storage)

### Date
February 27, 2026

---

## AD-012: Domain Hub Architecture (Cross-House Specialization)

### The Problem
Houses currently operate as silos. When a student in Shield needs to understand cryptography, Shield either builds its own watered-down crypto module or hopes the student already knows it. When Code needs to teach deployment, it rebuilds a lesser version of what Cloud already has. This creates:

1. **Content duplication** — multiple houses teaching the same topic at different quality levels
2. **Maintenance burden** — when TLS 1.3 changes, every house that mentions it needs updating
3. **Inconsistent depth** — Shield's crypto overview contradicts Key's detailed explanation
4. **Wasted effort** — building a "good enough" version of content that already exists elsewhere

### The Decision
Each house owns one **Domain Hub** — the authoritative, deep-dive content for its specialty. Other houses **reference** that hub as prerequisites or supplementary material. No house rebuilds what another house already owns.

### The Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN HUB ECOSYSTEM                        │
│                                                                 │
│   Every house is both a PRODUCER and a CONSUMER.                │
│   Each house owns one domain. Other houses link to it.          │
│                                                                 │
│   ┌─────────┐   references   ┌─────────┐   references          │
│   │  SHIELD  │ ◄──────────── │  CODE   │ ──────────► ┌───────┐ │
│   │ Security │               │ FullDev │             │ CLOUD │ │
│   │  domain  │               │ domain  │             │ Infra │ │
│   └────┬─────┘               └────┬────┘             │domain │ │
│        │                          │                   └───┬───┘ │
│        │ references               │ references            │     │
│        ▼                          ▼                       │     │
│   ┌─────────┐               ┌─────────┐                  │     │
│   │   KEY   │               │ SCRIPT  │ ◄────────────────┘     │
│   │ Crypto  │               │CLI/Auto │                        │
│   │ domain  │               │ domain  │                        │
│   └─────────┘               └─────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Domain Hub Map

| House | Domain Hub | Consumers |
|-------|-----------|-----------|
| **Web** | Networking & Protocols | Shield, Eye, Cloud, Dark Arts |
| **Shield** | Security Principles & Frameworks | Every house |
| **Cloud** | Infrastructure & Deployment | Code, Forge, Script |
| **Forge** | Hardware & OS Internals | Script, Web, Shield |
| **Script** | CLI, Automation & Linux | Dark Arts, Eye, Code, Cloud |
| **Code** | Full Stack Development & DevOps | Cloud, Script, Shield |
| **Key** | Cryptography | Shield, Dark Arts, Web |
| **Eye** | Monitoring, SIEM & Analysis | Shield, Dark Arts, Script |
| **Dark Arts** | Offensive Security | Shield, Eye, Key |
| **Machine** | AI & Intelligent Automation | Eye, Shield, Script |

### How It Works

**Producer side:** Each house maintains its domain hub — a curated set of deep-dive modules flagged as `domainHub: true` in ContentCatalog. These are the authoritative modules for that topic. The house is responsible for keeping them current.

**Consumer side:** When a learning path in another house needs a prerequisite from a different domain, it references the producer's domain hub module directly. The UI renders it with a cross-house badge (e.g., "Visit House of the Key") so the student knows they're leaving their current house for authoritative content.

**Example flow:**
```
Student in Shield → "Web Application Security" module
  → Prerequisite: "TLS & Certificate Chains" (domain: Key)
  → UI shows: "🔑 This module is from House of the Key"
  → Student completes it, returns to Shield path
  → Progress counts for both houses
```

### Rules

1. **One owner per domain.** Cryptography belongs to Key. Period. Shield does not build its own crypto modules — it links to Key's.
2. **Depth lives in the owner.** The domain hub goes deep (15-30 modules). Consumers only need 2-3 of those modules as prerequisites.
3. **Shared foundations, branching tracks.** Some domains (like networking, security principles) are consumed by almost every house. These hubs must be well-structured with clear entry points.
4. **Cross-house progress counts.** Completing a Key module while on a Shield learning path awards progress to both houses. The student shouldn't be penalized for following a cross-house link.
5. **No rebuilding.** If you're writing a module and another house already covers that topic, link to theirs. The question is always: "Does another house own this domain?"

### Implementation

**Phase 1 — Metadata (no UI changes):**
- Add `domainHub: true` flag to qualifying modules in ContentCatalog
- Add `prerequisites: [{ moduleId, house }]` to learning path definitions
- No visual changes yet — just data modeling

**Phase 2 — Cross-House Links:**
- Learning path UI shows prerequisite modules from other houses with house badge
- "Visit House of X" navigation that returns the student to their path after completion
- Progress tracking counts completion toward both source and destination houses

**Phase 3 — Domain Hub Pages:**
- Each house gets a dedicated "Domain Hub" section (like Arctic/Vault)
- Curated entry point for external visitors ("You're here from Shield? Start with these 3 modules")
- Hub overview page shows which houses reference it and why

### Content Strategy: Full Stack Development (First Domain Hub)

The first domain hub to be built under this architecture is **Full Stack Development** inside House of the Code. Structure follows the Arctic/Linux subsection model:

```
Full Stack Development
├── Foundations (shared prerequisite layer)
│   ├── HTML & CSS
│   ├── JavaScript Core
│   ├── HTTP & APIs
│   ├── Git & Version Control
│   └── Databases (SQL + NoSQL)
│
├── Frontend Tracks (parallel, pick one)
│   ├── React Track
│   ├── Vue Track (future)
│   └── Vanilla JS / Web Components (future)
│
├── Backend Tracks (parallel, pick one)
│   ├── Node + Express Track
│   ├── Spring Boot Track (future)
│   └── Python + Django/Flask Track (future)
│
├── Tooling & Ecosystem
│   ├── npm / Package Management
│   ├── Build Tools (Webpack, Vite)
│   ├── Testing (Jest, Cypress)
│   └── Docker for Devs (cross-link to existing Code content)
│
└── Capstone Projects
    ├── Full Stack App (frontend + backend + db)
    ├── API-First Project
    └── Deploy to Cloud (cross-link to Cloud house)
```

**Content sourcing:** Reference material scraped from W3Schools (foundations structure), GeeksForGeeks (framework examples), and MDN (deep-dive reference). Scraped content provides skeleton/structure; interactive applets and labs are built original.

### Rationale

- **Eliminates duplication.** One authoritative source per topic. No more five houses teaching mediocre versions of the same concept.
- **Scales with the platform.** Adding a new house means mapping its domain and its dependencies — not rebuilding content from scratch.
- **Creates gravity.** Each house has a reason to exist beyond its own learning paths. Key isn't just "the crypto house" — it's the crypto authority that Shield, Dark Arts, and Web all depend on.
- **Matches real-world specialization.** In industry, security teams consult crypto experts, not build their own crypto. The platform should model this.

### Trade-offs

- **Cross-house navigation complexity.** Students may feel lost jumping between houses. Mitigated by "return to your path" breadcrumb UI.
- **House coupling.** If Key's crypto hub is broken or incomplete, Shield's learning path is blocked. Mitigated by Phase 1 metadata — links are optional until the hub is ready.
- **Ownership disputes.** Some topics span houses (e.g., "network security" — Web or Shield?). Rule of thumb: the house whose cert covers the topic most deeply owns it.
- **Prerequisite chains.** Long chains (Code → Script → Cloud) can feel heavy. Keep prerequisites to 1-2 modules, not entire tracks.

### Date
February 27, 2026

---

## Implementation Checklist

- [ ] Create START.html as single entry point
- [ ] Create config/ directory structure
- [ ] Implement Caesar-17 encode/decode functions
- [ ] Create paths.js with encoded values
- [ ] Document all encoded paths in secure location (not in repo)
- [ ] Test decode functions work correctly

---

## Secure Documentation (Keep Private)

### Path Mapping Reference
*This section should be kept in a PRIVATE document, not committed to any public repo*

Location: `_planning/.private/PATH_MAPPING.md` (gitignored)

Contains:
- All original paths
- Their encoded equivalents
- What each path leads to
- Access requirements

---

*"Clean on the outside, protected on the inside."*
