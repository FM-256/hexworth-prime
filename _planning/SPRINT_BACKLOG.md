# Hexworth Prime - Sprint Backlog

**Created:** December 16, 2025
**Status:** Active
**Methodology:** Agile sprints with flexible duration

---

## Sprint Categories

| Prefix | Category | Focus |
|--------|----------|-------|
| **A-** | Architecture | Structure, tech stack, infrastructure |
| **DL-** | Digital Life | Firefly ecosystem evolution |
| **M-** | Migration | Moving Academy content to Prime |
| **F-** | Feature | New Prime-specific features |
| **DA-** | Dark Arts | Security training content |
| **L-** | Linux | Linux tutorials and interactive labs |
| **MX-** | Matrix | Matrix/Operator path enhancements |
| **HD-** | Handler Dashboard | Instructor class management system |
| **R-** | Registration & Rebuild | Content catalog coverage + Hype applet native rebuilds |
| **CLH-** | CLH Course | Command Line Heroes course (Script House) |
| **AR-** | Arena | CTF Arena engine, box builds, and Instructional Design Packets |

---

## Current Sprint

### Overnight Marathon (February 17, 2026)
**Status:** ✅ Complete
**Scope:** 4 tasks in a single autonomous session

| Task | Sprint | Deliverable | Status |
|------|--------|-------------|--------|
| Arena VS Mode | AR-8 | Team-based competitive CTF battles (CoOpSync + CoOpLobby + CoOpUI + BoxEngine + arena.css) | ✅ |
| Assessment Mode | AR-7 | Wire BoxEngine into ProgressManager + AssignmentManager + GameTracker (6 hook points) | ✅ |
| Host Error Detector | HED-1 | Floating diagnostic panel upgrade — admin-gated indicator dot + error list + Copy Log | ✅ |
| Boxes A6–A10 | AR-9 | 5 new boxes: Crypto, NoSQL, File Upload, Deserialization, SSRF (5,269 lines, bench/QC) | ✅ |

**Commits:**
- `e08e5069` — Arena VS Mode: team-based competitive CTF battles
- `202ecd30` — Arena assessment mode: wire boxes into instructor analytics pipeline
- `60002bc5` — HED-1: Floating diagnostic panel — live runtime error overlay (admin-gated)
- `d2fd3dd7` — Arena Boxes A6-A10: Crypto, NoSQL, File Upload, Deserialization, SSRF

**Next up:** OB-1 (3 remaining), AR-2 (IDPs for all 20 boxes)

---

### Post-Marathon Fixes (February 17, 2026)
**Status:** ✅ Complete

| Task | Deliverable | Status |
|------|-------------|--------|
| WSA Gauntlet fixes | Per-module briefings, state persistence, impossible objectives | ✅ |
| OUTPOST Midterm fixes | AD management, terminal parity, ADUC refresh | ✅ |
| GUISimulator fix | Windows going empty on tab switch | ✅ |
| Disk Management fix | Graphical view allocated vs unallocated | ✅ |
| Dashboard footer | Pad to clear fixed buttons | ✅ |
| Arena Boxes A11-A20 | Genesis Collective arc (AR-10) | ✅ |

**Commits:** `d187aad8`, `c9560ce1`, `0f5a1ff0`, `51d64c6a`, `889ea229`, `bf86faf2`, `c8846f29`, `baafd3d3`, `ab89d786`

---

### Sprint F-15: CMMC Domain Applets + OSINT Lab + Career Explorer
**Status:** ✅ Complete (February 13, 2026)
**Priority:** High — Eliminated all 201 HIGH EduScan issues from broken Articulate Storyline wrappers
**Scope:** 4 shared engines, 17 consumer pages, 16 old wrappers deleted, registry + index updated

**Problem:** 16 applets in Shield house were broken Articulate Storyline wrappers — `data/common/script.js` and `data/player/player.js` were never committed. These accounted for all HIGH issues in EduScan.

**Architecture:** Shared renderer pattern (proven by CertPathRenderer.js) — one shared component + tiny consumer HTML pages that pass a domain code.

| Deliverable | File | Details |
|-------------|------|---------|
| **NEW** CMMCDomainData.js | `components/CMMCDomainData.js` | All 14 CMMC domains, 110 practices from NIST SP 800-171, 80+ assessment questions (~55KB) |
| **NEW** CMMCDomainRenderer.js | `components/CMMCDomainRenderer.js` | 4-tab UI (Overview, Practices, Self-Assessment, Resources), level guide with L1/L2/L3 breakdown, FCI/CUI definitions, cross-domain distribution chart, practice filtering, assessment scoring via GameTracker |
| **NEW** OSINTLabEngine.js | `components/OSINTLabEngine.js` | 5-stage OSINT investigation sim against fictional "MeridianTech Corp" (~680 lines) |
| **NEW** CareerExplorerEngine.js | `components/CareerExplorerEngine.js` | 4-tab career browser: 8 domains, 28 roles, cert map, NICE framework (~460 lines) |
| **NEW** 14 CMMC consumer pages | `shield/applets/compliance/cmmc_*/shield-cmmc-*.applet.html` | ~15 lines each, call `CMMCDomainRenderer.init('AC')` etc. |
| **NEW** OSINT lab page | `shield/applets/threats/osint_challenge/shield-osint-lab.applet.html` | Loads OSINTLabEngine |
| **NEW** Career explorer page | `shield/applets/fundamentals/career_exploration/shield-career-explorer.applet.html` | Loads CareerExplorerEngine |
| **UPDATED** content-registry.js | `config/content-registry.js` | 16 entries changed from CloudFront URLs to local paths |
| **UPDATED** Shield house index | `houses/shield/index.html` | 18 href entries updated, Career status changed to 'available' |
| **DELETED** 16 old wrappers | Various `shield-*v2.applet.html` files | Broken Articulate shells removed |

**EduScan Results:**
- HIGH: 201 → 0
- CRITICAL: 1 → 0
- Baseline archived: 2026-02-13 (CRITICAL:0, HIGH:0, MED:192, LOW:1, WARN:869)

**Known remaining issues (carry forward to R-8):**
- `shield-cui-2.applet.html`, `shield-cmmc-frameworkv2.applet.html`, `shield-cmmc-test-knowledge2.applet.html` — 3 non-domain applets still using old Articulate wrappers (CUI overview, CMMC framework overview, CMMC comprehensive quiz). Need new native interactive content.

---

### Sprint HD-6: Persistent Classroom Progress
**Status:** ✅ Complete (February 15, 2026)
**Commit:** `b4ef6b3a`
**Priority:** High — Instructor visibility into student progress without login dependency
**Estimated Scope:** 3 phases, ~4-6 deliverables

#### Problem Statement

Currently, student progress lives in two places with a gap between them:

| Storage | Persists? | Visible to Instructor? | Requires Login? |
|---------|-----------|----------------------|-----------------|
| **localStorage** | Yes (per-browser, survives deploys) | No | No |
| **Firestore** (user profile) | Yes (cloud) | Indirectly via dashboard | Yes (Google sign-in) |
| **Firestore** (class progress) | Yes (cloud) | Yes (instructor dashboard) | Yes (enrolled in class) |

**Gap:** If a student never logs in, or logs in but hasn't joined a class, the instructor sees nothing. Progress exists on the student's device but is invisible to the professor. Additionally, there's no guarantee that progress survives device changes or browser clears without login.

**User Requirements:**
1. Classroom progress must be capturable for instructor review — even without login
2. User data must only be refreshed/deleted by the user — deploys must never erase progress
3. Progress should persist across devices and sessions

#### Architecture Audit (Current State)

The existing pipeline already handles most of this when students ARE logged in:
```
Module complete → localStorage (immediate)
                → FirestoreManager.completeModule() (user profile)
                → ProgressManager.syncToFirestore() (instructor dashboard)
                → AssignmentManager.submitProgress() (class/assignment tracking)
                → AssignmentManager.logActivity() (activity feed)
```

**What works:** localStorage survives deploys. Firestore data survives everything. Bidirectional sync on login merges local↔cloud.

**What's missing:** No mechanism for anonymous/offline progress to reach the instructor.

#### Proposed Solution: 3-Phase Approach

##### Phase 1: Class Code Without Login (Anonymous Enrollment)
**Goal:** Students can join a class with just a class code — no Google sign-in required.

| Deliverable | Description |
|-------------|-------------|
| **Anonymous class binding** | Store `classId` + `classCode` in localStorage when student enters a code. No auth needed. |
| **Device fingerprint** | Generate a stable `deviceId` (UUID stored in localStorage) as anonymous student identity |
| **Anonymous sync endpoint** | New Firestore path: `classes/{classId}/anonymous/{deviceId}` — progress writes don't require auth |
| **Dashboard: anonymous students** | Instructor sees anonymous students as "Device-XXXX" until they claim an identity |
| **Claim flow** | When a student later signs in with Google, their anonymous progress merges into their authenticated profile |

**Key design decision:** Use Firestore security rules that allow writes to `classes/{classId}/anonymous/{deviceId}` without auth, but scope writes to only progress data (no reads of other students, no class admin).

##### Phase 2: Auto-Sync on Every Completion
**Goal:** Every module/quiz/lab completion immediately syncs to the class — no manual step, no login required.

| Deliverable | Description |
|-------------|-------------|
| **ProgressSync enhancement** | If `classId` is in localStorage (from Phase 1), sync progress on every completion event — even without Firebase auth |
| **Offline queue** | If network is down, queue progress events in localStorage. Flush on next successful connection. |
| **Heartbeat** | Periodic sync (every 5 minutes during active session) catches any missed events |
| **Conflict resolution** | Same as existing: take max values, union arrays, never delete student data |

##### Phase 3: Progress Protection & Export
**Goal:** Guarantee student data sovereignty — user controls their data.

| Deliverable | Description |
|-------------|-------------|
| **Progress backup/restore** | "Export My Progress" button in settings → JSON file download. "Import Progress" → restore from file. |
| **Data deletion** | "Clear My Data" button with confirmation — only way to erase progress. Deploys never touch localStorage or Firestore user data. |
| **Instructor CSV export** | Enhanced export: include anonymous students, merge with authenticated, full grade book format |
| **Data integrity check** | On app load, verify localStorage keys exist and are valid. If corrupted, attempt Firestore restore before zeroing. |

#### Technical Notes

**Firestore Security Rules (Phase 1):**
```javascript
match /classes/{classId}/anonymous/{deviceId} {
  // Anyone can write their own progress (device-scoped)
  allow write: if request.resource.data.deviceId == deviceId;
  // Only class handler can read all anonymous progress
  allow read: if isClassHandler(classId);
}
```

**Data Flow After Phase 1+2:**
```
Module complete → localStorage (immediate, always)
              ↓
        classId in localStorage?
         ├─ YES + authenticated → Firestore classes/{id}/progress/{uid}
         ├─ YES + anonymous    → Firestore classes/{id}/anonymous/{deviceId}
         └─ NO                 → localStorage only (personal tracking)
```

**What Deploys CANNOT Touch:**
- localStorage (browser-side, completely separate from hosting)
- Firestore data (separate service, not affected by `firebase deploy --only hosting`)
- This is already true today — no code changes needed for deploy safety

#### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Anonymous writes could be abused | Rate limiting via Firestore rules, device-scoped writes only |
| Device fingerprint changes (new browser/cleared storage) | Progress backup/restore (Phase 3), Firestore merge on login |
| Stale anonymous entries | Instructor can archive/clean anonymous entries older than N days |
| Firestore costs from anonymous writes | Progress data is tiny (JSON objects, ~1KB per completion). Even 100 students × 100 completions = 10K writes/semester — well within free tier. |

#### Sprint Sequencing

Phase 1 is the highest-value piece — it solves the core problem (instructor can see progress without student login). Phases 2 and 3 are quality-of-life hardening.

**Recommendation:** Phase 1 as Sprint HD-6, Phase 2 as HD-7, Phase 3 as HD-8. Or combine 1+2 into a single sprint if scope allows.

---

### Sprint F-13: Cert Path Landing Pages + Bug Fixes
**Status:** ✅ Complete (February 12, 2026)

EduScan reported 8 ASGN-003 HIGH issues because `resolveAssignmentHref()` in dashboard.html generates URLs like `houses/{certPathId}/index.html` for certification paths, but those pages didn't exist. Created dedicated landing pages for all 8 cert paths with shared renderer.

**Delivered:**

| Deliverable | File | Notes |
|-------------|------|-------|
| **NEW** Shared Renderer | `components/CertPathRenderer.js` | Dynamic module list, progress tracking, themed UI |
| **NEW** DevOps Landing | `houses/devops-fundamentals/index.html` | Code House modules |
| **NEW** Linux+ Landing | `houses/comptia-linux/index.html` | Script House modules |
| **NEW** A+ Core 1 Landing | `houses/aplus-core1/index.html` | Forge House modules |
| **NEW** A+ Core 2 Landing | `houses/aplus-core2/index.html` | Forge House modules |
| **NEW** Security+ Landing | `houses/security-plus/index.html` | Shield House modules |
| **NEW** Network+ Landing | `houses/comptia-network/index.html` | Web House modules |
| **NEW** Crypto Track Landing | `houses/cryptography-track/index.html` | Key House modules |
| **NEW** Sec+ Crypto Landing | `houses/security-plus-crypto/index.html` | Key House modules |
| courseHref routing | `components/LearningPaths.js` | Added courseHref to 6 paths for runtime routing |
| Cipher Cracker nav fix | `houses/key/games/cipher-cracker.html` | Back button 404: `../../index.html` → `../index.html` |
| Tor/Darkweb title fix | `houses/shield/games/tor-darkweb.html` | ASCII art unreadable: added `white-space: pre` + responsive font-size |
| SQL Injection score fix | `houses/shield/games/sql-injection-defense.html` | GameTracker total: 200 → `rounds.length * 10` |

**EduScan Results:**
- ASGN-003: 8 → 0
- HIGH issues: 135 → 127
- Total issues: 1630 → 1620

**Actionable Notes (Carry Forward):**
- [ ] Cloud Hop vertical direction — User wants runner to go upward instead of rightward (major mechanic change, needs design discussion)
- [ ] SQL Injection Defense — User reported "still broken" but code review found no breaking bug; needs live browser testing to reproduce
- [ ] 127 HIGH issues remain — mostly PATH-001 (broken script paths), HTML-001 (unclosed tags), JS-001 (unbalanced brackets) in Cloud House labs/games
- [ ] `save-the-pod.html` has severe JS bracket imbalance (off by 5 parens, 10 braces) — likely non-functional
- [ ] `cloud-cse-module05.lab.html` has unclosed `<script>` tag — page broken
- [ ] `dont-lose-your-domain.html` references jQuery but no jQuery script loaded
- [ ] 2 Cloud labs (`cloud-gui.lab.html`, `cloud-ps.lab.html`) reference `../progress.js` but file is at `../modules/wsa/progress.js`

**Next:** Address remaining HIGH issues (Cloud House cleanup sprint), or Cloud Hop vertical runner redesign

---

### A+ Core 2 & WSA Content Audit + Build
**Status:** ✅ Complete (February 8, 2026)
**Deployed:** Firebase Hosting — 7,101 files → hexworth-prime.web.app

Full content audit and enhancement of A+ Core 2 and WSA courses. 28 files modified/created.

**Hotfix:**
- WSA 404: Fixed `resolveAssignmentHref()` in `dashboard.html` — now uses LearningPaths lookup instead of naive `houses/{contentId}/index.html` concatenation. WSA resolves correctly to `houses/cloud/modules/wsa/index.html`.

**A+ Core 2 Delivered:**

| Deliverable | File | Before | After |
|-------------|------|--------|-------|
| **NEW** Midterm Exam | `core-2/quizzes/forge-core2-midterm.quiz.html` | — | 638 lines, 45 Qs |
| Presentation: Malware | `core-2/presentations/forge-malware.presentation.html` | 316 | 688 (22 slides) |
| Presentation: Incident Response | `core-2/presentations/forge-incident-response.presentation.html` | 332 | 660 (22 slides) |
| Presentation: Physical Security | `core-2/presentations/forge-physical-security.presentation.html` | 337 | 656 (21 slides) |
| Presentation: Documentation | `core-2/presentations/forge-documentation.presentation.html` | 405 | 665 (21 slides) |
| Presentation: Change Management | `core-2/presentations/forge-change-management.presentation.html` | 430 | 708 (20 slides) |
| Lab: Physical Security | `core-2/labs/forge-physical-security.lab.html` | 369 | 801 (13 tasks) |
| Lab: Users & Groups | `core-2/labs/forge-users-groups.lab.html` | 419 | 784 (13 tasks) |
| Lab: Incident Response | `core-2/labs/forge-incident-response.lab.html` | 476 | 825 (8 tasks) |
| Lab: Documentation | `core-2/labs/forge-documentation.lab.html` | 569 | 980 (8 tasks) |
| Lab: Change Management | `core-2/labs/forge-change-management.lab.html` | 617 | 881 (8 tasks) |
| Lab: Malware | `core-2/labs/forge-malware.lab.html` | 683 | 913 (11 tasks) |
| Index update | `core-2/index.html` | — | Midterm link added |

**WSA Delivered:**

| Deliverable | File | Before | After |
|-------------|------|--------|-------|
| **NEW** M01 GUI Lab | `wsa/m01-fundamentals/cloud-gui.lab.html` | — | 2,041 lines (9 tasks) |
| **NEW** M01 PS Lab | `wsa/m01-fundamentals/cloud-ps.lab.html` | — | 968 lines (12 tasks) |
| **NEW** M01 Quiz | `wsa/m01-fundamentals/cloud-quiz.quiz.html` | — | 832 lines (10 Qs) |
| Quiz: M04 Hyper-V | `wsa/m04-hyperv/cloud-quiz.quiz.html` | 189 | 831 (10 Qs) |
| Quiz: M05 Containers | `wsa/m05-containers/cloud-quiz.quiz.html` | 189 | 831 (10 Qs) |
| Quiz: M06 Clustering | `wsa/m06-clustering/cloud-quiz.quiz.html` | 189 | 831 (10 Qs) |
| Quiz: M07 Monitoring | `wsa/m07-monitoring/cloud-quiz.quiz.html` | 189 | 831 (10 Qs) |
| PS Lab: M04 Hyper-V | `wsa/m04-hyperv/cloud-ps.lab.html` | 314 | 554 (14 tasks) |
| PS Lab: M05 Containers | `wsa/m05-containers/cloud-ps.lab.html` | 226 | 557 (14 tasks) |
| PS Lab: M06 Clustering | `wsa/m06-clustering/cloud-ps.lab.html` | 229 | 552 (14 tasks) |
| PS Lab: M07 Monitoring | `wsa/m07-monitoring/cloud-ps.lab.html` | 212 | 561 (14 tasks) |
| PS Lab: M18 Automation | `wsa/m18-powershell-automation/cloud-ps.lab.html` | 206 | 555 (14 tasks) |
| PS Lab: M19 Troubleshoot | `wsa/m19-troubleshooting-migration/cloud-ps.lab.html` | 207 | 552 (14 tasks) |
| Presentation: M11 IIS | `wsa/m11-iis/cloud-presentation.module.html` | 315 | 839 (23 slides) |
| Presentation: M12 RDS | `wsa/m12-remote-desktop/cloud-presentation.module.html` | 354 | 793 (21 slides) |
| Presentation: M13 PKI | `wsa/m13-certificate-services/cloud-presentation.module.html` | 377 | 824 (22 slides) |
| Presentation: M14 Network | `wsa/m14-advanced-networking/cloud-presentation.module.html` | 377 | 842 (21 slides) |

**Next:** All content complete. No outstanding gaps in A+ Core 2 or WSA.

---

### CLH Path Action Modal + Course Home Page
**Status:** ✅ Complete (February 5, 2026) — v3.10.5

CLH certification path card on Script House now launches a 3-option modal (Course Home, Browse Modules, Cancel) instead of navigating directly. Modal lives in `houses/script/index.html` where the CLH category card actually lives (fix: was incorrectly placed in dashboard.html). CLH course home page with 31 modules across 7 tiers, full content registry of all 31 CLH modules with slides/labs/quizzes, search discoverability via ContentCatalog, and fixed self-referential prerequisites.

**Delivered:**
- 3-option action modal (Course Home, Browse Modules, Cancel)
- CLH course home page with 31 modules / 7 tiers
- Full registry of all 31 CLH modules (slides, labs, quizzes)
- Search discoverability across all CLH content
- Fixed self-referential prerequisites bug

**Next:** HD-4 — Activity Log  OR  HD-6 — Analytics Dashboard

---

## Matrix Terminal Enhancement (MX-Series)

**Problem:** Matrix (Operator) path missing Skill Tree and Explore All sections
**Solution:** Add tab-based navigation to terminal.html
**Detailed Plan:** `_planning/MATRIX_TERMINAL_PLAN.md`
**Status:** ✅ Complete (6/6 sprints complete)

### Sprint MX-1: Tab Infrastructure
**Status:** ✅ Complete (Dec 29, 2025)
**Files:** terminal.html

| Task | Status |
|------|--------|
| Add tab navigation UI (PROGRAMS, SKILL TREE, EXPLORE ALL) | ✅ |
| Create content containers for each tab | ✅ |
| Implement tab switching JavaScript | ✅ |
| Wrap existing PROGRAMS content | ✅ |
| Matrix green styling for tabs | ✅ |
| Default to PROGRAMS tab on load | ✅ |

**Implementation Notes:**
- Added `.terminal-tabs` nav with three `tab-btn` buttons
- Tab content divs with `.tab-content` class, `.active` toggles visibility
- `initTabs()` and `switchTab(tabId)` functions handle switching
- Added command-line tab switching: `programs`, `skills`, `explore`, `search`
- Responsive: tabs stack vertically on mobile (768px breakpoint)

### Sprint MX-2: Skill Tree Integration
**Status:** ✅ Complete (Dec 29, 2025)
**Depends on:** MX-1
**Files:** terminal.html, FileTreeExplorer.js, skill-tree.js, content-registry.js

| Task | Status |
|------|--------|
| Load FileTreeExplorer component | ✅ |
| Create skill tree container | ✅ |
| Apply Matrix green theme to FileTreeExplorer | ✅ |
| Verify SkillTree data loads correctly | ✅ |

**Implementation Notes:**
- Added script tags for content-registry.js, skill-tree.js, FileTreeExplorer.js
- Container: `#operator-skill-tree` in SKILL TREE tab
- Lazy loading: `initSkillTree()` called on first tab click
- Matrix CSS overrides force green (#00ff41) on non-green elements
- Error handling shows terminal-style error messages
- Console log: "⚡ OPERATOR SKILL TREE ONLINE"

### Sprint MX-3: Explore Basic
**Status:** ✅ Complete (Dec 29, 2025)
**Depends on:** MX-1
**Files:** terminal.html (inline, no separate component)

| Task | Status |
|------|--------|
| Create ExploreAll component | ✅ |
| Add search box with keyword search | ✅ |
| Display search results | ✅ |
| Matrix green styling | ✅ |

**Implementation Notes:**
- Built inline in terminal.html (not separate component)
- `.explore-container` with search input and results area
- 200ms debounced search via `performSearch(query)`
- Relevance scoring: title(+10/+5), description(+5), topics(+3), house(+2), id(+1)
- Results show: icon, title, description, house, type, difficulty
- Click result → navigates via PageTransition (applet > presentation > lab > quiz priority)
- Focus on empty input shows first 20 items

### Sprint MX-4: Certification Filter
**Status:** ✅ Complete (Dec 29, 2025)
**Depends on:** MX-3
**Files:** terminal.html

| Task | Status |
|------|--------|
| Add "By Certification" dropdown filter | ✅ |
| Enumerate all available cert paths | ✅ |
| Filter content by selected certification | ✅ |
| Combine with keyword search | ✅ |

**Implementation Notes:**
- `#certFilter` dropdown auto-populated from ContentRegistry.content[].paths
- `populateCertFilter()` extracts unique paths, sorts alphabetically
- Display name mapping: `comptia-aplus` → "CompTIA A+"
- `currentFilters` object tracks active filters
- Filter-only mode: select cert without query shows all cert content
- Active filter tags with ✕ remove button
- `[ CLEAR ]` button resets all filters and search
- Console log shows count of loaded cert paths

### Sprint MX-5: Additional Filters
**Status:** ✅ Complete (Dec 29, 2025)
**Depends on:** MX-4
**Files:** terminal.html

| Task | Status |
|------|--------|
| Add "By House" filter | ✅ |
| Add "By Type" filter (presentation, lab, quiz, applet) | ✅ |
| Add "By Difficulty" filter | ✅ |
| Multi-filter combination support | ✅ |

**Implementation Notes:**
- `#houseFilter` dropdown with 8 houses (web, shield, cloud, forge, script, code, key, eye)
- `#typeFilter` dropdown with 4 types (presentation, lab, quiz, applet)
- `#difficultyFilter` dropdown with 3 levels (beginner, intermediate, advanced)
- `currentFilters` object extended to track all 4 filter types
- `performSearch()` applies all filters with AND logic (early return pattern)
- `hasActiveFilters()` checks all 4 filter types
- `updateActiveFilters()` shows tags for all active filters
- `removeFilter(filterType)` unified function for removing any filter
- `clearAllFilters()` resets all 4 filters and search input
- "No results" message now shows all active filters, not just certification

### Sprint MX-6: Certification Mapping Completion
**Status:** ✅ Complete (Dec 29, 2025)
**Priority:** Medium

| Task | Status |
|------|--------|
| Audit current content-to-cert mappings | ✅ |
| Identify unmapped content | ✅ |
| Assign certifications to all content | ✅ |
| Verify complete coverage | ✅ |

**Implementation Notes:**
- **Before:** 96 mapped, 433 unmapped (18% coverage)
- **After:** 529 mapped, 0 unmapped (100% coverage)
- Used intelligent mapping: house affinity + keyword matching
- House mappings: forge→comptia-aplus, shield→comptia-security, web→comptia-network, etc.
- Keyword detection for: AWS services, crypto terms, security concepts, Linux commands
- 17 total certification paths now populated
- Top paths by usage: comptia-security (210), security-fundamentals (137), comptia-network (111)

---

## Handler Dashboard & Class Management (HD-Series)

**Location:** `_app/handler-dashboard.html`, `_app/components/ClassManager.js`, `_app/components/AssignmentManager.js`
**Status:** 🟢 Phase 2 Complete (HD-2 includes user profiles + basic export)
**Priority:** High — **Enterprise-Critical Path**
**Started:** February 2026
**Firestore Collection:** `classes`, `classes/{id}/assignments`
**Planning Docs:** `_planning/CLASSROOM_DASHBOARD_PLAN.md`, `_planning/PRODUCT_DIRECTION.md`

> **Philosophy:** Handlers (instructors) manage classes through a gold-themed dashboard.
> Students join via unique HEX-XXXX codes. Progress tracking and analytics build incrementally.
> **Strategic goal:** Each sprint moves Hexworth closer to institutional sales readiness.
> See `PRODUCT_DIRECTION.md` for business context and pricing strategy.

### Sprint HD-1: Handler Dashboard + Class CRUD
**Status:** ✅ Complete (February 4, 2026) — v3.9.0

| Task | Status |
|------|--------|
| ClassManager.js IIFE component | ✅ |
| HEX-XXXX code generation (crypto.getRandomValues) | ✅ |
| Firestore classes collection schema | ✅ |
| Create/Read/Update/Delete class operations | ✅ |
| Ownership-verified update and soft-delete | ✅ |
| handler-dashboard.html (3-column gold layout) | ✅ |
| Access gate (redirects non-handlers) | ✅ |
| Class list sidebar with selection | ✅ |
| Stats grid (Enrolled, Completion, Labs, Time) | ✅ |
| Class code display with copy-to-clipboard | ✅ |
| Create/Edit/Delete modals | ✅ |
| Responsive breakpoints (3-col, 2-col, 1-col) | ✅ |
| Dashboard footer link (handler-only, gold) | ✅ |
| Firestore security rules deployed | ✅ |
| AccessGuard bug fix (auto-hide conflict) | ✅ |

### Sprint HD-1.5: Content Assignments
**Status:** ✅ Complete (February 5, 2026) — v3.10.0

| Task | Status |
|------|--------|
| AssignmentManager.js IIFE component | ✅ |
| Firestore assignments subcollection (`classes/{id}/assignments/{id}`) | ✅ |
| Assignment CRUD (create, read, delete, update) | ✅ |
| Ownership verification via parent class doc | ✅ |
| Content browser modal (full-screen, two tabs) | ✅ |
| Courses tab (WSA, non-house learning paths) | ✅ |
| Full House Paths tab (8 houses) | ✅ |
| Individual Items tab with filters (house, type, difficulty, search) | ✅ |
| Course type filter in Individual Items | ✅ |
| Multi-selection with gold highlight | ✅ |
| Optional due dates on assignments | ✅ |
| Optional handler notes (500 char max) | ✅ |
| Assignment cards in class detail view | ✅ |
| Delete assignments with confirmation | ✅ |
| Firestore security rules for assignments subcollection | ✅ |
| WSA learning path added to LearningPaths.js (20 modules) | ✅ |
| PATH_HOUSE_MAP for non-house path filtering | ✅ |
| WSA certification path card on Cloud house page | ✅ |
| ContentCatalog WSA href fix | ✅ |

### Sprint HD-2: Student Join Flow
**Status:** ✅ Complete (February 5, 2026)
**Depends on:** HD-1
**Why blocking:** Nothing downstream works without students in classes.

| Task | Status |
|------|--------|
| "Join Class" UI on student dashboard | ✅ |
| ClassManager.joinClass(code) method | ✅ |
| Add student uid to class memberUids array | ✅ |
| Enforce 50-student cap per cohort | ✅ |
| Student class view (see assigned content) | ✅ |
| Handler roster shows real student names (Last, First format) | ✅ |
| Member count auto-updates in handler dashboard | ✅ |
| Leave class functionality for students | ✅ |
| Remove student functionality for handlers | ✅ |
| Centralized user profile (firstName, lastName, studentId) | ✅ |
| Profile gate on join flow (must complete profile first) | ✅ |
| CSV export: Blackboard-compatible roster (Last Name, First Name, Student ID, Email) | ✅ |
| CSV export: assignments (Title, Type, House, Difficulty, Due Date, Notes) | ✅ |

### Sprint HD-3: Progress Tracking + Roster Bars
**Status:** ✅ Complete (February 5, 2026) — v3.10.3
**Depends on:** HD-2
**Sales impact:** Makes the dashboard feel powerful at a glance.

| Task | Status |
|------|--------|
| Per-student progress tracking (module/lab/quiz completions) | ✅ Firestore progress subcollection + auto-sync |
| Completion percentage per student | ✅ getStudentCompletion() + Avg Completion stat |
| Visual progress bars in roster (next to each student name) | ✅ Color-coded thin bars |
| Color-coded status: green (>70%), yellow (40-70%), red (<40%) | ✅ progressColorClass() |
| Stats grid shows real aggregated data (not placeholder) | ✅ updateCompletionDisplay() |
| Student detail view (click name for full breakdown) | ✅ showStudentDetail() modal |

### Sprint HD-4: Activity Log
**Status:** ✅ Complete (February 5, 2026) — v3.10.11
**Depends on:** HD-2
**Sales impact:** Proves the platform is alive; admins love logs.

| Task | Status |
|------|--------|
| Activity event collection (module started, lab completed, quiz passed/failed) | ✅ logActivity() in AssignmentManager.js |
| Firestore activity subcollection (`classes/{id}/activity/{eventId}`) | ✅ Firestore rules + schema |
| Live feed panel in handler dashboard | ✅ Already existed, enhanced with filtering |
| Timestamps and student attribution | ✅ formatTimeAgo() + student names |
| Filter activity by student | ✅ Dropdown filter in activity header |
| Activity indicators/badges in roster | ✅ "Active" badge with pulse animation |

### Sprint HD-5: Export / Reports
**Status:** ✅ Complete (February 5, 2026)
**Depends on:** HD-3
**Sales impact:** CRITICAL — "Can I export to Canvas/Blackboard?" = instant purchase decision.

| Task | Status |
|------|--------|
| CSV export (roster: Last Name, First Name, Student ID, Email, House, Joined) | ✅ Done in HD-2 |
| CSV export (assignments: Title, Type, House, Difficulty, Due Date, Notes) | ✅ Done in HD-2 |
| LMS-compatible format (Blackboard gradebook CSV) | ✅ Done in HD-2 |
| Export buttons in dashboard UI | ✅ Done in HD-2 |
| CSV export (grades: student, assignment, status, score, date) | ✅ Done post-HD-3 |
| CSV export (progress summary: student, completed, total, completion %) | ✅ Done post-HD-3 |
| Class summary report (overall stats, at-risk students) | ✅ Print-friendly report with alerts |
| Print-friendly view for class reports | ✅ @media print CSS + full-screen report overlay |

### Sprint HD-6: Analytics Dashboard + Leaderboard
**Status:** ✅ Complete (February 5, 2026) — v3.10.12
**Depends on:** HD-3, HD-4
**Sales impact:** Demo polish — impressive for sales presentations.

| Task | Status |
|------|--------|
| Completion trend chart (line graph over time) | ✅ Chart.js cumulative line chart |
| Module difficulty heatmap (where students struggle) | ✅ Horizontal bar chart sorted by completion % |
| Time-on-task analysis (average time per module/lab) | ✅ HD-7: start time recording in 4 components, duration computation in ProgressSync, Firestore storage, horizontal bar chart with color coding |
| Gamified leaderboard per class (opt-in) | ✅ Top 10 with medals, toggle visibility |
| Comparative analytics (cohort vs cohort) | ⏸️ Deferred (multi-class feature) |

### Sprint HD-7: Time-on-Task Analytics
**Status:** ✅ Complete (February 9, 2026)
**Depends on:** HD-6
**Sales impact:** Answers "How long does Module X take students?" — helps handlers plan schedules and identify struggle points.

| Task | Status |
|------|--------|
| Record start times in PSTerminal.js `init()` | ✅ `hexworth_start_times` localStorage, first-write-wins |
| Record start times in GUISimulator.js `init()` | ✅ Same pattern |
| Record start times in QuizEngine.js `start()` | ✅ Same pattern, guarded by `moduleId` check |
| Record start times in WSAProgress `markPresentationViewed()` | ✅ Key format: `wsa-{moduleId}` |
| Compute duration in ProgressSync.js `sync()` | ✅ Seconds from start to completedAt, sanity check for negative |
| Store duration in AssignmentManager.js `submitProgress()` | ✅ `duration` field in Firestore progress doc (merge: true) |
| Time-on-task chart in handler-dashboard.html | ✅ Horizontal bar chart, color-coded (green < 30m, yellow 30-60m, red > 60m), tooltip shows sample size |

**Implementation Notes:**
- Start times stored in `localStorage['hexworth_start_times']` as `{ "wsa-m01": timestamp, ... }`
- First-write-wins: reopening content doesn't overwrite the original start time
- Duration computed as `Math.round((completedAt - startedAt) / 1000)` seconds
- Graceful degradation: pre-existing completions without duration show as `null`, chart shows "No time data yet" until new data arrives
- No new files created — 7 existing files modified

---

## CTF Arena & Instructional Design (AR-Series)

**Location:** `_app/arena/`, `_planning/_CTF/`, `_planning/_IDP/`
**Status:** 🟢 Engine v1 shipped, A1 box live, IDP pipeline active
**Priority:** High — **Product-defining feature** (160 boxes across 8 series)
**Started:** February 2026
**Planning Docs:** `_planning/_CTF/CTF_ARENA_VISION.md` (v1.3), `_planning/INSTRUCTIONAL_DESIGN_TEMPLATE.md`, `_planning/COMMERCIALIZATION_STRATEGY.md`

> **Philosophy:** Every box starts from a POWERED-OFF DEVICE. Boot sequence → desktop → discover target → enumerate → exploit → flags.
> The BoxEngine is extracted from Gate 8's proven patterns (1,227-line shared.js).
> Every box requires an IDP (Instructional Design Packet) — without IDPs, Hexworth is a hobby; with IDPs, Hexworth is a product.
> Box inventory: 160 boxes across 8 series (A–H), defined in CTF_ARENA_VISION.md.

### Sprint AR-1: BoxEngine v1 + Box A1
**Status:** ✅ Complete (February 15, 2026)
**Priority:** Critical — Foundation for all Arena content
**Commit:** `32fc848`

Built the Arena engine from scratch and shipped the first box (A1 — The Ancient Ledger).

| Deliverable | File | Lines | Details |
|-------------|------|:-----:|---------|
| **NEW** BoxEngine.js | `arena/engine/BoxEngine.js` | ~600 | Boot sequence, desktop shell, window manager, state, scoring, hints, flags, notifications, god mode |
| **NEW** Terminal.js | `arena/engine/Terminal.js` | ~400 | Terminal emulator, virtual filesystem, command history, box-defined commands |
| **NEW** Browser.js | `arena/engine/Browser.js` | ~300 | Web browser sim, URL bar, page registry, form handling |
| **NEW** arena.css | `arena/engine/arena.css` | ~400 | Boot, desktop, windows, taskbar, terminal, browser, modals, notifications |
| **NEW** A1 config.js | `arena/boxes/a1-ancient-ledger/config.js` | ~500 | Database (3 tables), SQL injection engine (13 patterns), filesystem, flags, hints, lore |
| **NEW** A1 index.html | `arena/boxes/a1-ancient-ledger/index.html` | ~60 | Thin consumer, loads engine + config |
| **UPDATED** Workshop | `workshop/index.html` | — | A1 moved from prototype to Arena build, status: testing |

**Engine Capabilities (v1):**
- Boot sequence: BIOS → GRUB → login → desktop (skippable, skip on reload)
- Desktop: icon grid, taskbar, clock, score badge, window manager with z-stacking
- Terminal: ls, cd, pwd, cat, find, whoami, id, file, head, tail, clear, help, history + box-defined commands (nmap, curl, sqlmap)
- Browser: address bar, page registry, form handlers, navigation history
- Scoring: base 1000, hint penalties, wrong flag penalties, flag bonuses, speed bonus
- Flags: submission modal, completion celebration, score breakdown
- Hints: 4-tier slide-out panel (Nudge → Direction → Partial → Solution)
- State: localStorage persistence, cross-tab sync, god mode (Ctrl+Shift+G)
- Notifications: queued slide-in from top-right, auto-dismiss

**SQL Injection Engine (A1-specific):**
13/13 injection patterns verified: tautology bypass, ORDER BY enumeration, UNION SELECT, version/user/database extraction, information_schema tables/columns, data dumps from 3 tables, LOAD_FILE filesystem access, realistic MySQL error messages.

**Workshop Status:** A1 moved to "Behind the Barricade" shelf, pointing to Arena build.
**Deployed:** Firebase hosting (February 15, 2026).

---

### Sprint AR-2: Instructional Design Packets — Template + A1 IDP
**Status:** ✅ Complete (February 15, 2026)
**Priority:** Critical — IDPs are what make institutional sales possible

Created the IDP template and completed the A1 IDP as the gold standard. Gemini is drafting A2–A20.

| Deliverable | File | Details |
|-------------|------|---------|
| **NEW** IDP Template | `_planning/INSTRUCTIONAL_DESIGN_TEMPLATE.md` | 8-section template with Bloom's taxonomy guide, cert mapping table, job role reference, grading scale, A1 gold-standard example |
| **NEW** A1 IDP (Gemini draft) | `_planning/_IDP/Box_A1_IDP.md` | Gemini's draft, evaluated 3 times (5.1 → 6.75 → 7.25/8), used to calibrate quality bar |
| **NEW** Gemini Drafting Prompt | `_planning/_IDP/GEMINI_IDP_DRAFTING_PROMPT.md` | Concise prompt pointing Gemini at template file + box schematics, 7 critical rules |
| **UPDATED** CTF Arena Vision | `_planning/_CTF/CTF_ARENA_VISION.md` | v1.2 → v1.3: added IDP requirement section, updated to 160 boxes / 8 series (A–H), added F/G/H inventory tables |
| **UPDATED** Commercialization Strategy | `_planning/COMMERCIALIZATION_STRATEGY.md` | Phase 2 now includes IDP completion as prerequisite |
| **UPDATED** Lessons Learned | `_planning/LESSONS_LEARNED.md` | IDP gap analysis, Gate 8 proves 5 capabilities, PhD alignment insight |

**IDP Template Sections:**
1. Box Overview (scenario, difficulty, prerequisites)
2. Learning Objectives (Bloom's verbs, measurable skills)
3. Skills Mapping (tool → job role → cert objective code)
4. Assessment Criteria (rubric, 100 pts, Documentation always 25 pts)
5. Instructor Notes (mistakes, 4-tier hints, talking points, when to assign)
6. Real-World Connection (real CVE case study, discussion prompts)
7. Research Metrics (ECER/CERBI framework, IRB note)
8. Curriculum Placement (target course, week, prerequisites, follow-up, cross-series)

**Quality Standards Established:**
- Documentation category: 25 pts (highest), non-negotiable
- Exactly 4 hints per box (Nudge → Direction → Partial → Solution)
- Every Skills Mapping row needs specific cert objective codes
- Real CVEs only — no fabricated case studies
- Cross-series connections from lore only

**Gemini IDP Pipeline:**
- Batch 1 (A2–A20): In progress — Gemini drafting from schematics
- Batches 2–8 (B through H): Queued — 140 remaining boxes
- Review process: Grade each IDP against template, iterate until 7+/8

---

### Sprint AR-3: Box A2–A5 Builds
**Status:** ✅ Complete (February 17, 2026) — On bench for QC/QA
**Priority:** High — Validation requires 5 working boxes
**Depends on:** AR-1 (engine), AR-2 (IDPs for reference)

Build the next 4 boxes to reach the critical 5-box validation threshold (per Commercialization Strategy Phase 1).

| Task | Box | Theme | Status |
|------|-----|-------|--------|
| A2 config.js — The Shadow Encoder | A2 | Command Injection + Client-Side Bypass | ⬜ |
| A3 config.js — {title from schematic} | A3 | XSS | ⬜ |
| A4 config.js — {title from schematic} | A4 | {from schematic} | ⬜ |
| A5 config.js — {title from schematic} | A5 | {from schematic} | ⬜ |
| Update Workshop with A2–A5 entries | — | — | ⬜ |
| Run EduScan after each box | — | — | ⬜ |

**Architecture note:** Each box is a thin consumer (~60 lines index.html + ~500 lines config.js). The engine handles everything else. Box builds are primarily content work, not engineering.

---

### Sprint AR-4: IDP Review & Finalization (Series A)
**Status:** ⬜ Backlog
**Priority:** High — Required before classroom use or sales
**Depends on:** AR-2 (Gemini drafts complete)

Review, grade, and finalize Gemini's IDP drafts for Series A (A2–A20).

| Task | Status |
|------|--------|
| Grade each Gemini IDP against template (target: 7+/8) | ⬜ |
| Fix Documentation weighting (must be 25 pts in every rubric) | ⬜ |
| Verify cert objective codes are real and specific | ⬜ |
| Verify case studies are real CVEs with correct details | ⬜ |
| Ensure hints follow 4-tier Nudge → Direction → Partial → Solution | ⬜ |
| Ensure cross-series connections match actual schematic lore | ⬜ |
| Finalize 19 IDPs (A2–A20) | ⬜ |

---

### Sprint AR-5: IDP Drafting — Series B–H
**Status:** ⬜ Backlog
**Priority:** Medium — Follows Series A validation
**Depends on:** AR-4 (Series A IDPs finalized, quality bar proven)

Draft and review IDPs for remaining 7 series (140 boxes).

| Batch | Series | Boxes | Status |
|-------|--------|:-----:|--------|
| 2 | B — Defensive / Blue Team | 20 | ⬜ |
| 3 | C — Multi-Stage Campaigns | 20 | ⬜ |
| 4 | D — Future-State Threats | 20 | ⬜ |
| 5 | E — Ecosystem & Infrastructure | 20 | ⬜ |
| 6 | F — Theoretical AI Warfare | 20 | ⬜ |
| 7 | G — Existential Cybersecurity | 20 | ⬜ |
| 8 | H — Architectural Metamorphosis | 20 | ⬜ |

---

### Sprint AR-6: BoxEngine v2 — Blue Team Extensions
**Status:** ⬜ Backlog
**Priority:** Medium — Required for Series B boxes
**Depends on:** AR-3 (v1 validated with 5 boxes)

Extend the engine for defensive/blue team scenarios (Series B requires different mechanics than Series A offensive boxes).

| Task | Status |
|------|--------|
| SSH terminal mode (connect to remote host, not local Kali desktop) | ⬜ |
| Log viewer component (simulated /var/log, journalctl, Event Viewer) | ⬜ |
| Service status panel (systemctl-style service monitoring) | ⬜ |
| Configuration file editor (edit configs, restart services, observe results) | ⬜ |
| Diagnostic mode (students fix broken systems rather than exploit them) | ⬜ |

---

### Sprint AR-7: Assessment Mode + Instructor Integration
**Status:** 🟡 Partially Complete (February 17, 2026)
**Priority:** Medium — Required for accreditation play
**Depends on:** AR-3 (5 boxes), existing instructor pipeline (HD-series)

Wire Arena boxes into the existing instructor analytics pipeline and add assessment mode reporting.

| Task | Status |
|------|--------|
| BoxEngine calls ProgressManager.completeModule() on box completion | ✅ |
| BoxEngine calls AssignmentManager.logActivity() for key events (flag found, hint used) | ✅ |
| BoxEngine calls GameTracker.record() for score persistence | ✅ |
| Assessment mode: certObjectives mapping per box (from IDP Skills Mapping) | ⬜ |
| Assessment mode report: CSV export with cert objective completion evidence | ⬜ |
| Instructor dashboard: Arena panel showing per-student box progress | ⬜ |

**Completed (Feb 17):** 3 new methods in BoxEngine.js (`_reportCompletion`, `_reportFlagCapture`, `_reportHintReveal`) hooked into 6 code paths: solo flag capture, co-op flag capture, solo/VS completion, solo/co-op hint reveal. All calls are try/catch wrapped with `typeof` existence checks for graceful degradation.

---

### Sprint AR-8: Arena VS Mode — Competitive CTF
**Status:** ✅ Complete (February 17, 2026)
**Priority:** Medium — Multiplayer engagement differentiator
**Depends on:** AR-1 (engine), Co-op mode (CoOpSync/CoOpLobby/CoOpUI)

Team-based competitive CTF battles. Teams race each other with separate scores, live scoreboard, and cross-team psychological pressure notifications.

| Task | Status |
|------|--------|
| CoOpSync.js — VS mode branching: per-team state, team auto-balance, atomic flag/hint ops | ✅ |
| CoOpLobby.js — VS lobby flow: format select (1v1–5v5), time limit, dual team columns | ✅ |
| CoOpUI.js — VS scoreboard, team-grouped players, cross-team activity tags | ✅ |
| BoxEngine.js — VS mode init, winner detection, victory/defeat overlay | ✅ |
| arena.css — Full VS visual theme: lobby, scoreboard, team colors, result overlay | ✅ |

**Architecture:** Per-team Firestore state at `teams.alpha.state` / `teams.bravo.state`. Shared activity subcollection with `teamId` field. Winner set atomically inside `submitFlagAtomically()` transaction. Auto-balance assigns new players to smaller team.

---

### Sprint AR-9: Arena Boxes A6–A10
**Status:** ✅ Complete (February 17, 2026) — On bench for QC/QA
**Priority:** Medium — Expands the box library to 10 offensive scenarios
**Depends on:** AR-1 (engine)

| Box | Title | Theme | Faction | Lines | Status |
|-----|-------|-------|---------|:-----:|--------|
| A6 | The Broken Cipher | Weak Cryptography | Silent Cipher Order | 931 | ✅ bench |
| A7 | The Hollow Database | NoSQL Injection | Void Collective | 1,027 | ✅ bench |
| A8 | The Forgotten Upload | File Upload Vuln | Ashen Archive | 1,018 | ✅ bench |
| A9 | The Rusted Lock | Insecure Deserialization | Forge Remnants | 1,087 | ✅ bench |
| A10 | The Glass Tunnel | SSRF | Glass Corridor | 1,021 | ✅ bench |

**Total:** 5,084 lines of config across 5 boxes + 5 index.html consumers. All registered in arena index.html as `coming-soon`.

---

### Sprint AR-10: Arena Boxes A11–A20
**Status:** ✅ Complete (February 17, 2026) — On bench for QC/QA
**Priority:** Medium — Completes Series A with the Genesis Collective narrative arc
**Depends on:** AR-1 (engine)
**Commit:** `ab89d786`

| Box | Title | Theme | Faction | Status |
|-----|-------|-------|---------|--------|
| A11 | The Dockerized Data Vault | Container Escape | Archivist Guild | ✅ bench |
| A12 | The Mobile Scapegoat | Android Exploitation | Digital Nomads | ✅ bench |
| A13 | The Rogue Sensor Node | IoT Exploitation | Arboreal Collective | ✅ bench |
| A14 | The Ghost in the Machine | Red Team Evasion | Vanguard Network | ✅ bench |
| A15 | The Spectral Interceptor | Signal Intelligence | Silent Broadcast | ✅ bench |
| A16 | The Corrupted Core | Malware Analysis | Crimson Ghost | ✅ bench |
| A17 | The Whisper Campaign | Steganography | The Whispering Eye | ✅ bench |
| A18 | The Ghost in the RAM | Memory Forensics | Chronos Collective | ✅ bench |
| A19 | The Foundation's Fault | Kernel Exploitation | The Foundation | ✅ bench |
| A20 | Project Chimera: The Genesis | APT Simulation | Genesis Collective | ✅ bench |

**Total:** 14,617 lines across 10 boxes + 10 index.html consumers. All on bench for QC/QA.

---

## Operational & Sales Readiness (OB-Series)

**Context:** External audits identified that the code/features are built, but operational presentation lags behind. These sprints close the gap between "what we built" and "what people can see we built."

### Sprint OB-1: Onboarding & Trust
**Status:** 🟡 In Progress (7/10 Complete)
**Depends on:** None (documentation/assets only — no code)
**Sales impact:** CRITICAL — this is the difference between "GitHub project" and "SaaS vendor"

| Task | Status |
|------|--------|
| Product one-pager (PDF): what it is, features, cost, pilot offer | ✅ product-info.html |
| Trust / About page: Firebase hosting, Google Auth, data handling | ✅ about.html |
| Privacy statement: data residency, FERPA considerations, no third-party sharing | ✅ about.html |
| Uptime statement: "Google Firebase infrastructure, 99.95% SLA" | ✅ about.html + product-info.html |
| Instructor quickstart: "Create class → share code → done" | ✅ InstructorDashboard.js |
| Offline vs Online mode explanation in README | ✅ README.md "Start Here" |
| Capture 5 key screenshots for README | ⬜ |
| Architecture diagram for README | ✅ README.md |
| 30-day accelerated class template (syllabus) | ⬜ |
| 60-second walkthrough GIF or video | ⬜ |

---

## Windows Server Administration Course (WSA-Series)

**Location:** `_app/houses/cloud/modules/wsa/`
**Status:** ✅ Complete (M01-M20 + Midterm + Capstone, all modules fully populated)
**Priority:** High
**Started:** January 2026
**Completed:** February 2026
**Structure:** 20 Modules + Midterm Project + Final Capstone
**Content Audit (Feb 8, 2026):** All 20 modules have presentation + GUI lab + PS lab + quiz. No gaps.

> **Philosophy:** Open world exploration - all GUI elements functional, users can get "lost"
> learning the actual Windows Server interface. Hidden filesystem content adds discovery element.

### Course Learning Objectives
1. Installation, configuration, and maintenance of server environment
2. Storage and file systems management with high availability
3. Virtualization solutions implementation
4. Highly available resource deployment
5. Environment stability and monitoring
6. Container understanding and deployment
7. Backup and disaster recovery procedures
8. Troubleshooting and migration skills

### First Half: Foundation & Core Services (M01-M10)

| Module | Title | Status | Focus |
|--------|-------|--------|-------|
| M01 | Server Installation & Initial Configuration | ✅ Complete | Roles, features, basic config. GUI lab, PS lab, quiz all present. |
| M02 | Active Directory Domain Services | ✅ Complete | Users, groups, OUs, domain setup |
| M03 | Storage & File Systems | ✅ Complete | Disks, volumes, shares, RAID |
| M04 | Hyper-V Virtualization | ✅ Complete | VMs, switches, checkpoints. Quiz expanded to 10 Qs. PS lab expanded to 14 tasks. |
| M05 | Docker Containers | ✅ Complete | Images, containers, networking. Quiz expanded to 10 Qs. PS lab expanded to 14 tasks. |
| M06 | Failover Clustering | ✅ Complete | Nodes, roles, validation. Quiz expanded to 10 Qs. PS lab expanded to 14 tasks. |
| M07 | Monitoring & Performance | ✅ Complete | Event logs, performance counters. Quiz expanded to 10 Qs. PS lab expanded to 14 tasks. |
| M08 | DNS & Name Resolution | ✅ Complete | Zones, records, forwarding, troubleshooting |
| M09 | DHCP Services | ✅ Complete | Scopes, reservations, options, failover |
| M10 | Group Policy | ✅ Complete | GPO creation, linking, preferences, security |

### 🎯 MIDTERM PROJECT: "OUTPOST"
**Status:** ✅ Complete (3,934 lines)
**Objective:** Deploy a functional branch office environment

| Requirement | Description |
|-------------|-------------|
| Domain Controller | AD DS with integrated DNS |
| DHCP | Scopes and reservations for client network |
| Group Policy | Password policy, desktop lockdown, mapped drives |
| File Share | NTFS permissions and share permissions |
| Monitoring | Event log collection and basic alerting |

*No hand-holding - hints discoverable through exploration*

### Second Half: Advanced Services & Operations (M11-M19)

| Module | Title | Status | Focus |
|--------|-------|--------|-------|
| M11 | IIS & Web Services | ✅ Complete | Websites, app pools, SSL, bindings. Presentation expanded to 839 lines (23 slides). |
| M12 | Remote Desktop Services | ✅ Complete | RD Gateway, session hosts, licensing. Presentation expanded to 793 lines (21 slides). |
| M13 | Certificate Services (PKI) | ✅ Complete | CA setup, templates, enrollment, revocation. Presentation expanded to 824 lines (22 slides). |
| M14 | Advanced Networking | ✅ Complete | NIC teaming, VLANs, subnets, routing. Presentation expanded to 842 lines (21 slides). |
| M15 | AD Sites & Replication | ✅ Complete | Site links, replication topology, FSMO |
| M16 | Backup & Disaster Recovery | ✅ Complete | Windows Server Backup, restore, bare metal |
| M17 | Windows Firewall & Security | ✅ Complete | Firewall rules, IPsec, security baselines |
| M18 | PowerShell Automation | ✅ Complete | Scripting, DSC, scheduled tasks, remoting. PS lab expanded to 555 lines (14 tasks). |
| M19 | Troubleshooting & Migration | ✅ Complete | Diagnostics, common issues, server migration. PS lab expanded to 552 lines (14 tasks). |

### 🏆 M20: FAILSAFE Capstone (Final Exam)
**Status:** ✅ Complete (1,316 lines)
**Objective:** Full enterprise deployment combining all course topics

| Requirement | Description |
|-------------|-------------|
| Complete Environment | Build from scratch - no templates |
| All Services | AD, DNS, DHCP, IIS, PKI, file services |
| High Availability | Clustering, redundancy, backup |
| Security | Firewall, GPO hardening, PKI |
| Documentation | Discoverable hints only - no hand-holding |

*Functions as hands-on final exam testing all learning objectives*

### Sprint WSA-1: Foundation Modules (M01-M03)
**Status:** ✅ Complete (January 2026)

| Task | Status |
|------|--------|
| M01: Server Manager simulation | ✅ |
| M01: Role/feature installation wizard | ✅ |
| M02: ADUC tree/list simulation | ✅ |
| M02: User/Group/OU wizards | ✅ |
| M03: Disk Management simulation | ✅ |
| M03: Initialize, partition, format workflows | ✅ |

### Sprint WSA-2: Virtualization & Containers (M04-M05)
**Status:** ✅ Complete (January 2026)

| Task | Status |
|------|--------|
| M04: Hyper-V Manager simulation | ✅ |
| M04: VM creation wizard | ✅ |
| M04: Virtual switch configuration | ✅ |
| M05: Docker container management | ✅ |
| M05: Image operations | ✅ |
| M05: Network/volume creation | ✅ |

### Sprint WSA-3: High Availability & Monitoring (M06-M07)
**Status:** ✅ Complete (January 2026)

| Task | Status |
|------|--------|
| M06: Cluster Manager simulation | ✅ |
| M06: Node/role management | ✅ |
| M06: Cluster validation | ✅ |
| M07: Event Viewer simulation | ✅ |
| M07: Performance Monitor simulation | ✅ |
| M07: Multiple graph types (line, bar, area) | ✅ |

### Sprint WSA-4: Core Services (M08-M10)
**Status:** ✅ Complete (February 2026)
**Note:** Content audit confirmed all modules exist with presentations, GUI labs, PS labs, and quizzes

| Task | Status |
|------|--------|
| M08: DNS Manager simulation | ✅ |
| M08: Zone creation/management | ✅ |
| M08: Record types (A, CNAME, MX, PTR, SRV) | ✅ |
| M09: DHCP console simulation | ✅ |
| M09: Scope creation and options | ✅ |
| M09: Reservations and failover | ✅ |
| M10: Group Policy Management Console | ✅ |
| M10: GPO creation and linking | ✅ |
| M10: Security and preferences | ✅ |

### Sprint WSA-5: Midterm Project
**Status:** ✅ Complete (February 2026)
**Note:** OUTPOST midterm implemented in M10-Midterm

| Task | Status |
|------|--------|
| OUTPOST project environment design | ✅ |
| Hint system implementation | ✅ |
| Objective validation | ✅ |
| Scoring and feedback | ✅ |

### Sprint WSA-6: Web & Remote Services (M11-M12)
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| M11: IIS Manager simulation | ✅ |
| M11: Website/app pool management | ✅ |
| M11: SSL certificate binding | ✅ |
| M12: RDS console simulation | ✅ |
| M12: Session host configuration | ✅ |

### Sprint WSA-7: Security & PKI (M13, M17)
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| M13: Certificate Authority simulation | ✅ |
| M13: Certificate templates | ✅ |
| M17: Windows Firewall console | ✅ |
| M17: Security baseline implementation | ✅ |

### Sprint WSA-8: Networking & AD Advanced (M14-M15)
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| M14: NIC teaming configuration | ✅ |
| M14: VLAN and subnet setup | ✅ |
| M15: AD Sites and Services simulation | ✅ |
| M15: Replication topology | ✅ |
| M15: FSMO role management | ✅ |

### Sprint WSA-9: Operations & Automation (M16, M18-M19)
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| M16: Windows Server Backup console | ✅ |
| M16: Bare metal restore scenarios | ✅ |
| M18: PowerShell scripting labs | ✅ |
| M18: DSC configuration | ✅ |
| M19: Troubleshooting scenarios | ✅ |
| M19: Migration procedures | ✅ |

### Sprint WSA-10: FAILSAFE Capstone (M20)
**Status:** ✅ Complete (February 2026)
**Note:** M20-Capstone FAILSAFE project implemented

| Task | Status |
|------|--------|
| M20: Full environment design | ✅ |
| M20: Objective system | ✅ |
| M20: Hint discovery mechanism | ✅ |
| M20: Scoring and completion | ✅ |

### Technical Components

| Component | File | Purpose |
|-----------|------|---------|
| WSAState.js | `_app/components/WSAState.js` | Central state store for GUI/Terminal sync |
| GUISimulator.js | `_app/components/GUISimulator.js` | Reusable GUI framework |
| PSTerminal.js | `_app/components/PSTerminal.js` | PowerShell simulation with filesystem |
| gui-simulator.css | `_app/components/styles/gui-simulator.css` | Shared GUI styling |

### Open World Features
- All GUI elements functional (no dead ends)
- Context menus on all list items
- Working dialogs and wizards
- Rich hidden filesystem with discoverable content
- Hidden files require `-Force` to view in PowerShell
- Content themes: spy craft, conspiracies, historical mysteries, sci-fi
- Continue Exploring option after lab completion

---

## EduScan Content Scanner (ES-Series)

**Location:** `_tools/eduscan/`
**Status:** 🟢 Phase 5 Complete (ES-10: ContentCatalog validation + 84 dead link fixes)
**Priority:** Medium — Developer tooling
**Started:** February 2026

> **Philosophy:** EduScan crawls the content topology to catch issues before students see them.
> Validates registry consistency, detects orphaned content, and catches syntax errors that cause blank screens.

### Sprint ES-1: Core Scanner ✅
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| File system scanner | ✅ |
| Content parsers (quiz, lab, presentation, applet) | ✅ |
| Registry validation | ✅ |
| Console/JSON/Markdown reporters | ✅ |
| CLI with npm scripts | ✅ |

### Sprint ES-2: Severity Model + Drift Tracking ✅
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| 5-level severity (critical, high, medium, low, warning) | ✅ |
| Auto-fix suggestions with confidence scoring | ✅ |
| Drift tracking (--diff, --archive) | ✅ |
| History comparison | ✅ |

### Sprint ES-3: Orphan Detection ✅
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| Registry orphans (declared but missing) | ✅ |
| Filesystem orphans (exist but unreachable) | ✅ |
| Reachability graph crawl | ✅ |
| Reason codes (NOT-IN-REGISTRY, NOT-LINKED, etc.) | ✅ |
| Dynamic routing awareness (--reachability links+registry) | ✅ |
| Remediation suggestions with confidence | ✅ |
| Lifecycle directives (draft, archive) | ✅ |
| CI gate policy (--fail-on, --warn-only) | ✅ |

### Sprint ES-4: Gated Content + Syntax Validation ✅
**Status:** ✅ Complete (February 2026)

| Task | Status |
|------|--------|
| status="gated" lifecycle directive | ✅ |
| gates=N attribute parsing | ✅ |
| LIFECYCLE_GATED reason code | ✅ |
| Gated content → INFO severity (intentional) | ✅ |
| GATE-ROOT-001: missing gate entry | ✅ |
| GATE-CHAIN-001: broken gate sequence | ✅ |
| HTML syntax validation (unclosed tags, duplicate IDs) | ✅ |
| JavaScript syntax validation (bracket balance, strings) | ✅ |
| Engine/library detection (missing includes) | ✅ |
| Path validation (broken script/link/img refs) | ✅ |
| --syntax-only CLI flag | ✅ |
| npm run scan:syntax command | ✅ |

### Sprint ES-5: Curriculum Coverage Metrics
**Status:** ✅ Complete (February 6, 2026)
**Priority:** Medium

| Task | Status |
|------|--------|
| Labs per module count | ✅ |
| Quizzes per module count | ✅ |
| Modules with zero assessments | ✅ |
| House completeness score | ✅ |
| Coverage report output | ✅ |

**Implementation Notes:**
- CoverageAnalyzer in `validators/coverage.js` (760 lines)
- Tracks per-module: hasQuiz, hasLab, hasPresentation, assessmentCount
- Per-house metrics: modules, coverage %, quiz/lab density
- Per-path metrics: same as house but scoped to learning paths (WSA, CLH, CompTIA, etc.)
- Gap detection: modules without assessments, low coverage houses/paths
- CLI: `eduscan --coverage` for standalone coverage report
- Console output with visual coverage bars and color-coded percentages

### Sprint ES-6: Remediation Batching
**Status:** ✅ Complete (February 6, 2026)
**Priority:** Low

| Task | Status |
|------|--------|
| Patch plan file output | ✅ |
| Suggested edits grouped by rule | ✅ |
| Highest confidence first ordering | ✅ |
| Scripted apply step (manual approval) | ✅ |

**Implementation Notes:**
- RemediationPlanner in `utils/remediation.js` generates PATCH_PLAN.json/md
- Groups issues into: SAFE_AUTO_FIX (≥95%), REVIEW_NEEDED (70-94%), MANUAL_ONLY (<70%)
- Organizes by subtree (houses/forge, houses/script, etc.)
- CLI: `eduscan --syntax=ci --remediation` generates patch plan
- apply-fixes.js script applies safe auto-fixes with duplicate detection
- First batch applied: 69 Core 2 path fixes (Feb 6, 2026)

### Sprint ES-7: False Positive Reduction
**Status:** ✅ Complete (February 6, 2026)
**Priority:** High — Reduces noise by 80-95%
**Result:** 13,527 → 352 issues (**97.4% reduction**)

| Task | Status |
|------|--------|
| **Syntax Profiles** | |
| --syntax=ci (critical/high only, conservative) | ✅ |
| --syntax=strict (full coverage, hygiene) | ✅ |
| --syntax=inventory (stats only, no failures) | ✅ |
| **Severity Remapping** | |
| CRITICAL: JS parse errors, unclosed script/style | ✅ |
| HIGH: missing local scripts, broken paths, unclosed structural tags | ✅ |
| MEDIUM: duplicate IDs, CSS issues | ✅ |
| LOW: missing DOCTYPE, minor nesting | ✅ |
| **External Resource Whitelisting** | |
| Skip http://, https://, //, data: URLs | ✅ |
| Known CDN whitelist (CloudFront, jsDelivr, unpkg, Google) | ✅ |
| Template placeholder detection | ✅ |
| **JS Parser Compatibility** | |
| Handle template literals (`...${}...`) | ✅ |
| Strip comments/strings before bracket counting | ✅ |
| CI mode: only severely unbalanced (off by >3) | ✅ |
| **Template Placeholder Handling** | |
| Whitelist {{...}} mustache/handlebars | ✅ |
| Whitelist <% %> EJS/ERB | ✅ |
| Whitelist ${...}, <?...?>, @{...}, {%...%} | ✅ |
| **Engine Scope Modeling** | |
| Define global engines (AccessGuard, ProgressTracker, etc.) | ✅ |
| Shell inheritance detection for house content | ✅ |
| Only flag critical engines in CI mode | ✅ |

**CI Trust Policy:**
- Enforce: sync integrity, registry orphans, JS parse errors, missing local scripts
- Warn/Info: everything else (trend over time)

### Sprint ES-8: PATH Intelligence
**Status:** ✅ Complete (February 6, 2026)
**Priority:** High — Enables auto-fix pipeline

| Task | Status |
|------|--------|
| Intelligent issue bucketing | ✅ |
| Nearest-match suggestions with confidence scoring | ✅ |
| Structural depth rules (proactive prevention) | ✅ |
| Anchor directory detection | ✅ |
| Auto-fix candidacy assessment | ✅ |

**Implementation Notes:**
- Bucket types: WRONG_RELATIVE_DEPTH, CASE_MISMATCH, MOVED_RENAMED, MISSING_LOCAL, DYNAMIC_LOAD, STRUCTURAL_DEPTH, STRUCTURAL_OVERSHOOT, WRONG_ANCHOR
- Structural depth rules prevent CyberOps-class bugs proactively based on file location patterns
- Rules for: house index (2 levels), applet root (4), week-level (5), labs (6), CompTIA (6)
- Anchor directories: components, assets, config, styles, utils, houses, digital-life
- Confidence scoring: 95%+ for auto-fix, 70-94% for review, <70% manual only
- PATH-DEPTH-001 (undershoot) and PATH-DEPTH-002 (overshoot) codes

### Sprint ES-9: Functional Validation (Headless Browser)
**Status:** ✅ Complete (February 13, 2026)
**Priority:** High — First behavioral/runtime validation layer
**Dependency:** puppeteer (devDependency)

| Task | Status |
|------|--------|
| Puppeteer browser pool (launch, page management, request interception) | ✅ |
| Runtime error detection (FUNC-001 through FUNC-005) — all HTML pages | ✅ |
| Smoke test harness + 8 core system scenarios (FUNC-010 through FUNC-017) | ✅ |
| CLI integration (--functional, --smoke-only, --runtime-only) | ✅ |
| npm scripts (scan:functional, scan:functional:smoke, scan:functional:runtime) | ✅ |
| Verification: 12/12 existing tests pass, 8/8 smoke tests pass | ✅ |

**Implementation Notes:**
- Two layers: Runtime checks (all 1249 HTML pages, ~8min) + Smoke tests (8 scenarios, ~13s)
- Separate command — NOT part of `npm run scan` (too slow for regular workflow)
- Runtime checks capture: JS errors, promise rejections, console.error(), resource 404s, blank screens
- Smoke tests verify: ProgressManager XP, AchievementRegistry v2 persistence, GameTracker record/scores, AccessGuard gating, QuizEngine instantiation, v1/v2 bridge, level calculation
- Smoke harness loads 11 core scripts in dependency order (SkillTreeData before ProgressManager critical)
- Browser: headless Chromium, --no-sandbox (WSL2), external domains silently blocked
- FUNC-004 capped at 3 per page to reduce noise from .hyperesources asset directories
- Initial scan found 187 real issues: LinuxTerminal not a constructor, FluxCapacitor export, ModuleProgress.trackView, missing assets

**Files Created (7):**
- `_tools/eduscan/validators/functional/index.js` (orchestrator)
- `_tools/eduscan/validators/functional/browser.js` (browser pool)
- `_tools/eduscan/validators/functional/runtime.js` (runtime checks)
- `_tools/eduscan/validators/functional/smoke.js` (8 smoke scenarios)
- `_tools/eduscan/tests/fixtures/smoke-harness.html` (script loader)
- `_tools/eduscan/tests/fixtures/smoke-guard.html` (AccessGuard test)
- `_tools/eduscan/tests/fixtures/functional-issues.html` (test fixture)

**Files Modified (2):**
- `_tools/eduscan/cli.js` (--functional flags + runFunctional async handler)
- `package.json` (puppeteer devDependency + 3 scan:functional scripts)

**Gap Identified:** ContentCatalog.js declares 749 modules with hrefs but EduScan never validates those hrefs against the filesystem. `pod-crossing.html` (status: 'available', file doesn't exist) is the proof case. → See ES-10.

---

### Sprint ES-10: ContentCatalog Href Validation
**Status:** ✅ Complete (February 13-14, 2026)
**Priority:** High — Closes the catalog→filesystem blind spot
**Trigger:** pod-crossing.html 404 found via live site, not detected by EduScan

| Task | Status |
|------|--------|
| Parse ContentCatalog.js module entries + hrefs programmatically | ✅ VM sandbox loader |
| CAT-001: Module with status 'available' but href file missing on disk | ✅ |
| CAT-002: HTML file exists on disk but not declared in ContentCatalog | ✅ |
| CAT-003: Module with status 'available' but empty/missing href | ✅ |
| Test signature fixture — zero-dead-links regression | ✅ |
| Integration with existing EduScan pipeline | ✅ |
| Fix all 84 CAT-001 dead hrefs (81 path corrections + 4 coming-soon) | ✅ |
| Promote PATH-004 anchor href checks from strict to CI profile | ✅ |
| Fix 60 broken Core 2 cross-links (wrong filenames + wrong depth) | ✅ |

**Baseline after:** CRITICAL:0, HIGH:0, MED:676, LOW:242, SUSPECT:114, WARN:869

### Sprint HED-1: Host Error Detector — Live Runtime Immune System
**Status:** 🟡 Partially Complete (February 17, 2026)
**Priority:** High — Closes the post-deploy blind spot
**Inspiration:** Biological immune system — lightweight sentinels always on patrol, signal heavier response when threats detected
**Prefix:** HED (new series — live monitoring, distinct from batch scanning)

#### Problem Statement

EduScan catches issues **before** deploy. The functional validator catches runtime errors in a **simulated** environment. But after deploy — when students are actually using the platform — **nothing is watching**. The pod-crossing.html 404 was found by manually browsing the live site, not by any automated system. Every student session is an untapped test run.

| When | Tool | Coverage |
|------|------|----------|
| Before deploy | EduScan (static) | Syntax, orphans, paths, coverage |
| Before deploy | Functional validator (headless) | Runtime errors on page load |
| **After deploy** | **Nothing → HED** | **Real user errors, real browsers, real click paths** |

#### Architecture: Immune System Model

| Component | Analogy | Role |
|-----------|---------|------|
| **HED Agent** (`HED.js`) | Antibody / Sentinel cell | ~100-150 line JS agent loaded on every page. Listens for errors, buffers locally, signals upstream |
| **HED Dashboard** | Immune response display | Widget in admin footer showing error count, recent captures, exportable log |
| **EduScan** | Adaptive immune system | Classifies HED signals against known signatures (FUNC-*, CAT-*, PATH-*) |
| **Firebase Reporter** (optional) | Nervous system | Cloud Function endpoint — connected students auto-report errors to instructor dashboard |

#### HED Agent Capabilities

**Sensors (what it listens for):**
- `window.onerror` → JS runtime errors (maps to FUNC-001)
- `window.onunhandledrejection` → Promise rejections (maps to FUNC-002)
- Resource `onerror` events → Script/CSS/image 404s (maps to FUNC-004)
- Navigation failures → 404 pages, dead links (maps to CAT-001)
- `console.error` interception → Application-level errors (maps to FUNC-003)

**Buffer (how it stores):**
- localStorage ring buffer (`hexworth_hed_log`), capped at ~50 entries
- Each entry: `{ code, message, url, timestamp, userAgent }`
- Benign error filtering (same patterns as functional validator's browser.js — Firebase CORS, CDN 404s on file://, AccessGuard redirects)

**Signal (how it reports):**
- **Offline students (file://):** Buffer locally → surface in dashboard "Health" tab
- **Connected students (Firebase):** Auto-report to Cloud Function → aggregated in instructor dashboard
- **Developer mode:** `HED.dump()` console command for manual inspection

#### Tasks

| Task | Status |
|------|--------|
| HED.js core agent — error listeners, benign filtering, ring buffer | ✅ (v1.1.0) |
| Inject HED.js into shared page template (single script tag, all pages) | ✅ (via FluxCapacitor.js auto-load) |
| Dashboard footer "Health" tab — surfaces local HED buffer | ✅ (HealthPanel.js) |
| HED issue codes (HED-001 through HED-004) mapping to EduScan FUNC-* codes | ✅ |
| Cloud reporting — Firestore `hed_reports` collection, dedup + batch flush | ✅ (v1.1.0) |
| **Floating diagnostic panel** — admin-gated indicator dot + error list + Copy Log | ✅ (v1.2.0, Feb 17) |
| Firebase Cloud Function endpoint for connected student reporting (optional Phase 2) | ⬜ |
| Instructor dashboard aggregation — error heatmap by page/house (optional Phase 2) | ⬜ |
| EduScan integration — `npm run scan:hed` ingests HED reports as issue source | ⬜ |

#### Design Constraints

- **Tiny footprint:** <3KB minified, non-blocking, async-only. Must not slow page loads.
- **Privacy-safe:** Captures error + URL + timestamp only. No PII, no student identity in offline mode. Firebase mode uses existing auth context.
- **Noise filtering:** Port benign-error patterns from `_tools/eduscan/validators/functional/browser.js` directly.
- **Graceful degradation:** If localStorage is full, HED silently stops buffering. If Firebase is unreachable, falls back to local-only. Zero user-visible impact on failure.

#### Success Criteria

The pod-crossing.html 404 scenario: a student clicks a dead catalog link → HED captures `{ code: 'HED-NAV-404', message: 'games/pod-crossing.html not found', url: '...', timestamp }` → surfaces in Health tab → instructor sees it without running EduScan manually.

---

## Backlog - Future Enhancements

### Sprint F-4: User Accounts (If Needed)
**Status:** ⬜ Backlog
**Priority:** Low

| Task | Status |
|------|--------|
| Auth system selection | ⬜ |
| Login/signup flow | ⬜ |
| Profile management | ⬜ |
| Cloud progress sync | ⬜ |

---

### Sprint F-38: Advanced Career Sorting Quiz
**Status:** ⬜ Backlog
**Priority:** Medium
**Prerequisite:** Current sorting quiz (F-31/V2 merge) stable and deployed

**Concept:** An optional, deeper sorting experience that goes beyond house assignment to identify career aptitude. The current quiz answers "who are you?" — this quiz answers "where are you going?"

**Design Principles:**
- **Optional, not a replacement** — unlockable from dashboard or offered after initial house sort
- **Knowledge-free questions** — strictly personality/behavioral/scenario-based, no tech terminology required
- **Longer format** — 30-40 questions with richer scenario-based prompts (incident response situations, team dynamics, work environment preferences, problem-solving style)
- **Career output** — top 3 career matches with fit percentages, mapped to real IT/cyber roles

**Target Career Tracks:**
| Career | Description |
|--------|-------------|
| Network Engineer | Connectivity, infrastructure, routing/switching |
| Software Engineer | Application development, coding, system design |
| Systems Administrator | Server management, maintenance, uptime |
| Systems/Cloud Architect | Large-scale design, cloud strategy, scalability |
| Data Center Technician | Hardware, cabling, physical infrastructure |
| Security Analyst (SOC) | Monitoring, alert triage, incident detection |
| Penetration Tester | Offensive security, vulnerability discovery |
| Digital Forensics Analyst | Evidence collection, investigation, chain of custody |
| GRC Analyst | Governance, risk, compliance, policy, audit |
| DevOps/SRE Engineer | CI/CD, automation, reliability, deployment |
| Cybersecurity Engineer | Security architecture, hardening, defense design |
| IT Project Manager | Planning, coordination, stakeholder communication |

**Integration Points:**
- Results persist alongside house assignment (separate localStorage key)
- Career results feed into LearningPaths — recommended cert tracks per career match
- Links to relevant house content and CareerExplorerEngine (already built in F-15)
- Instructor dashboard visibility — career distribution across class roster
- Commercialization value — schools want career aptitude tools for student advising

**Deliverables:**

| Task | Status |
|------|--------|
| Question bank design (30-40 scenario-based questions) | ⬜ |
| Career scoring algorithm (weighted multi-factor) | ⬜ |
| Results page with top 3 careers + fit percentages | ⬜ |
| Career detail cards (role description, day-in-the-life, salary range, cert path) | ⬜ |
| LearningPaths integration (career → recommended cert track) | ⬜ |
| Dashboard unlock trigger (badge, XP threshold, or manual opt-in) | ⬜ |
| Instructor dashboard: class career distribution panel | ⬜ |

---

## Linux Content Initiative (L-Series)

**Source:** [FM-256/linux-free-tutorials](https://github.com/FM-256/linux-free-tutorials)
**Scope:** 270 tutorial topics → Original interactive Hexworth content
**Status:** ⬜ Planned
**Priority:** High (scheduled after current tasks)
**Design Guide:** `_planning/COURSE_DESIGN_PRINCIPLES.md`

> **Philosophy:** The Linux knowledge is open source (man pages, documentation).
> What makes Hexworth unique is HOW we teach it - interactive applets, simulated
> terminals, gamification, and the house system.
>
> **Pedagogical Framework: Crawl-Walk-Run + 4-Week Accelerated Model**
> Every sprint produces: Quick Reference (CRAWL) → Concept Visualizers (CRAWL) →
> Warmup Micro-Labs (WALK) → Mission Prep Labs (WALK) → Full Missions (RUN) →
> Hint System (WALK/RUN) → "Why This Matters" callouts (ALL).
> Content maps to a 4-week delivery cycle: Week 1 (Foundations + Confidence),
> Week 2 (Controlled Challenge), Week 3 (Realism + Complexity), Week 4 (Capstone).
> See `COURSE_DESIGN_PRINCIPLES.md` for full framework and classroom management practices.

### Sprint L-0: Linux Infrastructure & Scaffolding
**Status:** ✅ Complete (February 9, 2026)
**Priority:** Do first — enables all subsequent L-sprints
**Destination:** Platform-wide

| Task | Status |
|------|--------|
| Linux Quick Reference page template (commands, flags, patterns) | ✅ Pre-existing (1886 lines, 58 commands, 8 categories) |
| Concept Visualizer: interactive directory tree explorer | ✅ Pre-existing (1441 lines, full FHS tree) |
| Concept Visualizer: permission matrix (rwx calculator) | ✅ Pre-existing (967 lines, presets + octal calc) |
| Concept Visualizer: process lifecycle diagram | ✅ NEW — `script-process.tool.html` (1280 lines, SVG state machine, 6 states, 8 transitions, signal + command reference) |
| Concept Visualizer: service dependency map | ✅ NEW — `script-service.tool.html` (16 services, SVG graph, start/stop simulation, cascade warnings) |
| Warmup micro-lab template (5-10 min, low-stakes, timed optional) | ✅ Pre-existing (1278 lines, standalone quiz) |
| Progressive hint system component (Hint 1 → Hint 2 → Solution) | ✅ Pre-existing — `ProgressiveHints.js` (UMD, 4-level hints) |
| Checkpoint save system (localStorage state snapshots) | ✅ NEW — `CheckpointSave.js` (IIFE, save/load/clear/hasSave/promptResume) |
| Context callout component (`.context-callout` styled block) | ✅ CSS-only pattern added to all mission labs + both new visualizers |
| "Are you stuck?" idle detection prompt | ✅ NEW — `IdleDetector.js` (IIFE, 2-min timeout, ProgressiveHints integration) |

**Also completed (not in original backlog):**
- Extended `LinuxTerminal.js` public API with `print()`, `clear()`, `getCwd()`, `getFs()`, `getHistory()`
- Fixed 5 broken labs: rewrote from `new LinuxTerminal()` constructor to `LinuxTerminal.init()` IIFE API
- Added `ProgressiveHints.js` + 4-level hints to 3 mission labs (file-search, permissions, text-viewing)
- Added `FluxCapacitor.js` to all 5 labs
- Added context callouts to 4 mission labs

### Sprint L-1: Linux Fundamentals
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Est. Labs:** 40-50
**Destination:** Script House

**CRAWL:**

| Task | Status |
|------|--------|
| Quick Reference: file operations, permissions, search commands | ⬜ |
| Visualizer: directory tree (interactive, expandable) | ⬜ |
| Visualizer: permission matrix (rwx visual calculator) | ⬜ |
| Context callouts: real-world purpose for each command group | ⬜ |

**WALK:**

| Task | Status |
|------|--------|
| Warmup: navigate to 5 directories (timed drill) | ⬜ |
| Warmup: find files using find, locate, which | ⬜ |
| Warmup: set correct permissions on files | ⬜ |
| Prep Lab: guided log file analysis (grep + permissions) | ⬜ |
| Prep Lab: guided file management (cp, mv, mkdir, rm chain) | ⬜ |

**RUN:**

| Task | Status |
|------|--------|
| File operations mission (ls, cd, cp, mv, rm, mkdir) | ⬜ |
| File permissions mission (chmod, chown, umask) | ⬜ |
| User/group management mission (useradd, groupadd, passwd) | ⬜ |
| Wildcards and globbing patterns mission | ⬜ |
| Text viewing mission (cat, less, head, tail, grep) | ⬜ |
| File searching mission (find, locate, which) | ⬜ |
| Links mission (ln, symlinks vs hardlinks) | ⬜ |
| Compression mission (tar, gzip, zip, unzip) | ⬜ |

### Sprint L-2: Shell Scripting & Automation
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Est. Labs:** 30-40
**Destination:** Script House

**CRAWL:**

| Task | Status |
|------|--------|
| Quick Reference: bash syntax, variables, operators | ⬜ |
| Visualizer: script execution flow (conditionals, loops) | ⬜ |
| Visualizer: I/O redirection pipeline diagram | ⬜ |
| Context callouts: automation real-world scenarios | ⬜ |

**WALK:**

| Task | Status |
|------|--------|
| Warmup: variable assignment and expansion drills | ⬜ |
| Warmup: conditional syntax practice (test expressions) | ⬜ |
| Prep Lab: guided script that processes a log file | ⬜ |
| Prep Lab: guided cron job setup | ⬜ |

**RUN:**

| Task | Status |
|------|--------|
| Bash basics mission (variables, quoting, expansion) | ⬜ |
| Conditionals mission (if/else, case, test) | ⬜ |
| Loops mission (for, while, until) | ⬜ |
| Functions and arguments mission | ⬜ |
| Arrays and arithmetic mission | ⬜ |
| Input/output redirection mission | ⬜ |
| Pipes and command chaining mission | ⬜ |
| Cron jobs and scheduling mission | ⬜ |

### Sprint L-3: System Administration
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Est. Labs:** 40-50
**Destination:** Script House + Forge House

**CRAWL:**

| Task | Status |
|------|--------|
| Quick Reference: process, service, disk, network commands | ⬜ |
| Visualizer: process lifecycle (fork → exec → exit) | ⬜ |
| Visualizer: service dependency tree (systemd units) | ⬜ |
| Visualizer: disk/partition layout diagram | ⬜ |
| Context callouts: sysadmin real-world scenarios | ⬜ |

**WALK:**

| Task | Status |
|------|--------|
| Warmup: identify and kill runaway processes | ⬜ |
| Warmup: start/stop/restart services | ⬜ |
| Prep Lab: guided log investigation (journalctl + grep pipeline) | ⬜ |
| Prep Lab: guided disk partition and mount workflow | ⬜ |

**RUN:**

| Task | Status |
|------|--------|
| Process management mission (ps, top, kill, jobs, bg, fg) | ⬜ |
| Service management mission (systemctl, journalctl) | ⬜ |
| Disk management mission (df, du, fdisk, mount) | ⬜ |
| Package management mission (apt, yum, dnf) | ⬜ |
| Log analysis mission (/var/log, syslog, dmesg) | ⬜ |
| Network configuration mission (ip, ss, netstat) | ⬜ |
| SSH and remote access mission | ⬜ |
| Environment variables and profiles mission | ⬜ |

### Sprint L-4: Security Hardening
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Est. Labs:** 25-30
**Destination:** Shield House

**CRAWL:**

| Task | Status |
|------|--------|
| Quick Reference: firewall rules, SELinux modes, audit commands | ⬜ |
| Visualizer: firewall rule chain flow (INPUT/OUTPUT/FORWARD) | ⬜ |
| Visualizer: SELinux context labels diagram | ⬜ |
| Context callouts: breach scenarios prevented by each hardening step | ⬜ |

**WALK:**

| Task | Status |
|------|--------|
| Warmup: write 5 firewall rules (allow/deny practice) | ⬜ |
| Warmup: audit log interpretation drill | ⬜ |
| Prep Lab: guided SSH hardening (disable root, key-only, port change) | ⬜ |
| Prep Lab: guided sudo policy configuration | ⬜ |

**RUN:**

| Task | Status |
|------|--------|
| Firewall configuration mission (iptables, ufw, firewalld) | ⬜ |
| SELinux/AppArmor basics mission | ⬜ |
| File integrity monitoring mission | ⬜ |
| Audit logging mission (auditd, ausearch) | ⬜ |
| Secure SSH configuration mission | ⬜ |
| sudo and privilege management mission | ⬜ |
| Password policies mission (PAM, /etc/shadow) | ⬜ |
| System hardening checklist mission (full server lockdown) | ⬜ |

### Sprint L-5: Dark Arts - Offensive Linux Tools
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Est. Labs:** 15-20
**Destination:** Dark Arts Vault (Behind Five Gates)
**Access:** Restricted - requires CTF completion

**CRAWL:**

| Task | Status |
|------|--------|
| Quick Reference: offensive tool syntax and common flags | ⬜ |
| Visualizer: attack chain diagram (recon → exploit → post) | ⬜ |
| Context callouts: defensive perspective for each technique | ⬜ |

**WALK:**

| Task | Status |
|------|--------|
| Warmup: basic nmap scan types drill | ⬜ |
| Warmup: hash identification and format practice | ⬜ |
| Prep Lab: guided enumeration workflow (target → scan → analyze) | ⬜ |

**RUN:**

| Task | Status |
|------|--------|
| Nmap advanced scanning techniques mission | ⬜ |
| Hashcat password cracking mission | ⬜ |
| Hydra brute force attacks mission | ⬜ |
| Metasploit exploitation basics mission | ⬜ |
| Privilege escalation techniques mission | ⬜ |
| Enumeration scripts mission (LinPEAS, etc.) | ⬜ |
| Reverse shells and persistence mission | ⬜ |
| Post-exploitation methodology mission | ⬜ |

---

## Completed Systems

### Architecture ✅
- Static modular architecture (vanilla JS, no build step)
- Firebase hosting
- Component-based structure
- House theming system
- Navigation via FluxCapacitor

### Digital Life v3.8.0 ✅ (8 Phases Complete)
- Life cycle: birth → growing → mature → dying → dead
- 5 evolution tiers: Basic → Charged → Radiant → Prismatic → Ascended
- Collision system with cooldowns
- Predator/prey dynamics (1s hunt 0s)
- Reproduction/mitosis system
- Genetics and trait inheritance
- Pheromone communication
- Constellation formation
- Cosmic events: solar flare, meteor shower, void storm, eclipse, nebula
- Entities: planets, moons, black holes, energy wells, portals, sanctuaries
- Predators: shadow fireflies, void serpent, parasites
- Player tools (5 intervention tools)
- Achievements system (~35 achievements)
- Statistics HUD
- Procedural audio

### Dark Arts ✅ (6 Sprints Complete)
- Five Gates CTF (hex, CSS, stego, DTMF, synthesis)
- Vault with 20+ security labs
- Topics: OWASP, malware, network attacks, privilege escalation, etc.

### Migration ✅
- All 8 houses fully populated with content
- Web, Shield, Cloud, Forge, Script, Code, Key, Eye
- Visualizers, quizzes, labs, presentations migrated

### Handler Dashboard Phase 1-3 ✅
- ClassManager.js component (Firestore CRUD + join/leave/roster)
- HEX-XXXX class code generation
- 3-column gold-themed handler dashboard
- Create/edit/delete classes with modals
- AssignmentManager.js component (assignments subcollection)
- Content browser modal (courses, house paths, individual items)
- Content assignments with due dates and notes
- Student join flow (HEX-XXXX code entry, My Classes section)
- Real student roster with avatars, house badges, join dates
- Remove student functionality for handlers
- Leave class functionality for students
- Firestore security rules (classes + assignments + members subcollections)
- Dashboard integration (handler-only + join class footer links)

---

## Completed Sprints

### Sprint A-0 through A-2: Architecture ✅
**Completed:** December 2025
- Static modular architecture chosen (vanilla JS, no build step)
- Firebase hosting configured
- Component-based structure established
- House theming system implemented
- Navigation via FluxCapacitor

### Sprint DL-1 through DL-5: Digital Life v3.8.0 ✅
**Completed:** December 2025 (8 Phases)
- Phase 1: Visual Polish (trails, death particles, planet visuals)
- Phase 2: Ecosystem Depth (energy wells, genetics, pheromones)
- Phase 3: Cosmic Events (solar flare, meteor shower, void storm, eclipse)
- Phase 4: Planet Expansion (moons, volcanoes, lifecycle)
- Phase 5: Predator Variety (shadow fireflies, void serpent, parasites)
- Phase 6: Player Tools (5 tools, portals, sanctuaries)
- Phase 7: Meta Systems (achievements, statistics HUD, event log)
- Phase 8: Audio (procedural sounds, ambient atmosphere)

### Sprint M-1 through M-3: Content Migration ✅
**Completed:** December 2025
- All 8 houses fully populated
- 100+ visualizers, quizzes, labs, presentations
- Full AWS/Cloud content (25 applets)

### Sprint DA-1: Gate 1 - "See Beyond the Surface" ✅
**Completed:** December 2025
- Dark minimal landing page with hex challenge
- Hidden HTML comment with encoded message
- Trail Guide help system integrated

### Sprint DA-2: Gate 2 - "Shadows Speak in Color" ✅
**Completed:** December 2025
- CSS hidden text challenge (same color as background)
- Base64 encoded clue
- Terminal green aesthetic

### Sprint DA-3: Gate 3 - "The Image Holds More" ✅
**Completed:** December 2025
- Steganography image challenge
- Hidden path discovery
- Visual progression

### Sprint DA-4: Gate 4 - "Listen Closely" ✅
**Completed:** December 2025
- DTMF audio decoding challenge
- Glitch/corruption aesthetic

### Sprint DA-5: Gate 5 - "Synthesis" ✅
**Completed:** December 2025
- Combined all gate pieces
- Final passphrase entry
- Portal to Vault

### Sprint DA-6: The Vault ✅
**Completed:** December 2025
- Vault dashboard with 20+ security labs
- Module categories: OWASP, malware, network attacks, etc.
- Full content structure

### Sprint DA-7: Gates 6 & 7 (Already Built — Untracked)
**Status:** ✅ Complete (pre-existing, discovered Feb 13, 2026)
- **Gate 6: Static Analysis Investigation** — 5-step PE binary dissection (hex headers, import table, string analysis, entropy, malware classification). 500 pts with hint deductions. ~1,183 lines.
- **Gate 7: Operation Shadow Hunt** — Threat attribution challenge. 4 evidence categories (malware metadata, network IOCs, MITRE ATT&CK TTPs, historical intelligence) + final attribution to APT group. 600 pts. ~1,338 lines.
- **Note:** Both built but never tracked. Gate 7 missing AccessGuard gate. Neither registered in ContentCatalog/content-registry. Registration deferred to R-2.

### Sprint DA-7.1: Gate 6 Realism Overhaul + Documentation Audit
**Status:** ✅ Complete (February 13, 2026)
**Priority:** High — Gate answers were visually obvious, MASTER_SECRETS.md was out of sync with code

**Problem:** Gate 6 had multiple issues making it trivial: Step 2 used `class="suspicious"` (red/bold text), Step 3 used `class="indicator"` (red borders), Step 4 used color-coded entropy bars with pulsing red on `.rsrc`. MASTER_SECRETS.md documented wrong answers (e.g., `0x1400` instead of actual `0xF8`).

| Task | Status |
|------|--------|
| Sync MASTER_SECRETS.md Gate 6 section to match actual code answers | ✅ |
| Step 2: Remove `class="suspicious"`, expand import table to ~28 realistic entries across 5 DLLs | ✅ |
| Step 3: Remove `class="indicator"`, expand string list to ~35 entries with benign noise | ✅ |
| Step 4: Replace flat bar chart with 4-tab PE section viewer (Overview, Hex Preview, Entropy, Permissions) | ✅ |
| Remove entropy color-coding (all bars uniform purple), remove pulse animation | ✅ |
| Update hint text to not reference removed visual cues | ✅ |
| **Audit task:** All future gate implementations must update MASTER_SECRETS.md in the same sprint | ✅ Policy |

### Sprint DA-8: Gate 8 — Dynamic Analysis Sandbox
**Status:** ⬜ Backlog
**Priority:** Medium
**Depends on:** DA-7 registered, R-2 complete
**Location:** `_app/dark-arts/vault/gates/gate-8.html`
**Est. Student Completion Time:** 30-45 minutes

Simulated dynamic analysis environment where the student executes a malware sample in a controlled sandbox and observes its behavior in real-time. Teaches the complementary skill to Gate 6 — static tells you what malware *could* do, dynamic tells you what it *actually does*.

| Task | Status |
|------|--------|
| Build sandbox UI — simulated VM desktop with filesystem panel, registry monitor, network capture, process tree | ⬜ |
| Integrated terminal — command line alongside GUI panels for filesystem exploration | ⬜ |
| Malware execution timeline — behavioral events fire in sequence (file drops, registry writes, network callbacks, process spawning) | ⬜ |
| Student must identify and document: dropped files, persistence mechanisms, C2 callouts, evasion techniques | ⬜ |
| Behavioral indicators vs static indicators — teach the difference | ⬜ |
| IOC extraction challenge — pull indicators from observed behavior | ⬜ |
| Discoverable hint system — hidden files in sandbox filesystem (see Hint Architecture below) | ⬜ |
| Score system — points for each correctly identified behavior, no hint button, no deductions | ⬜ |
| Gate completion → unlock Tier 4 vault modules | ⬜ |

**Educational Focus:** MITRE ATT&CK execution techniques (T1059, T1547, T1055), behavioral analysis methodology, sandbox evasion awareness

**Hint Architecture — Discoverable Filesystem:**
No hint buttons. No point deductions. Hints are hidden files in the sandbox filesystem that students find by exploring with the terminal (`ls -la`, `cat`, `find`). Finding hints IS the skill being tested — real analysts dig through documentation, previous case notes, and tool references.

```
/home/analyst/
├── notes/
│   ├── .previous-case-notes.txt          (hidden — needs ls -la)
│   │   "Last time we saw VirtualAlloc + WriteProcessMemory
│   │    together, following the TCP stream in Wireshark
│   │    revealed the C2 protocol structure"
│   │
│   └── .supervisor-feedback.txt          (hidden)
│       "Remember: persistence mechanisms often write to
│        HKCU\Software\Microsoft\Windows\CurrentVersion\Run
│        Check registry monitor BEFORE and AFTER execution"
│
├── tools/
│   └── cheatsheet.md
│       "When analyzing network callbacks, check the
│        User-Agent string — commodity malware often
│        reuses default strings from public frameworks"
│
└── .sandbox-config/                      (hidden directory)
    └── evasion-notes.txt
        "Some samples check for VMware tools, vboxservice,
         or specific registry keys before executing payload.
         Compare behavior with/without VM artifacts present"
```

Students who never open the terminal can still complete the gate — they just work harder. Students who explore get a more realistic analyst experience.

---

### Sprint DA-9: Gate 9 — Reverse Engineering Challenge
**Status:** ⬜ Backlog
**Priority:** Medium
**Depends on:** DA-8
**Location:** `_app/dark-arts/vault/gates/gate-9.html`
**Est. Student Completion Time:** 40-60 minutes

Assembly-level reverse engineering challenge. Student analyzes disassembled code to understand malware functionality without execution.

| Task | Status |
|------|--------|
| Build disassembly viewer — simulated IDA/Ghidra-style interface with x86 assembly | ⬜ |
| Integrated terminal — explore the RE workstation filesystem for analyst notes and tool docs | ⬜ |
| Function identification — student maps subroutines to behaviors (encryption routine, C2 protocol, keylogger, etc.) | ⬜ |
| Control flow analysis — follow conditional branches to understand logic | ⬜ |
| String decryption challenge — XOR/Caesar encoded strings the student must decode | ⬜ |
| API call reconstruction — map assembly `call` instructions to Windows API functions | ⬜ |
| Final report — student writes a malware analysis report summarizing capabilities | ⬜ |
| Discoverable hint system — hidden files in RE workstation filesystem (see below) | ⬜ |
| Score system — no hint buttons, no deductions | ⬜ |
| Gate completion → unlock Tier 5 vault modules | ⬜ |

**Educational Focus:** x86 assembly basics, control flow graphs, string obfuscation, API hashing, malware capabilities classification

**Hint Architecture — Discoverable Filesystem:**

```
/home/analyst/
├── reference/
│   ├── x86-quick-ref.md                  (visible — basic assembly reference card)
│   ├── .api-hash-lookup.txt              (hidden)
│   │   "Common API hashing: CRC32 of function name.
│   │    0x6A4ABC5B = CreateRemoteThread
│   │    0x54CAAF70 = GetProcAddress
│   │    Try hashing the constants you see in the disassembly"
│   │
│   └── .xor-patterns.txt                 (hidden)
│       "Single-byte XOR is the most common string obfuscation.
│        Look for a loop with XOR instruction + incrementing index.
│        The key byte is usually loaded into a register before the loop"
│
├── previous-samples/
│   └── .sample-2847-notes.txt            (hidden)
│       "Similar packing observed in 2847. The unpacking stub
│        always calls VirtualAlloc then copies decrypted payload.
│        Set breakpoint after the memcpy-equivalent loop"
│
└── .ghidra-plugins/                      (hidden directory)
    └── tips.txt
        "Ghidra's decompiler view (F5) converts assembly to
         pseudo-C. Compare both views to confirm your analysis.
         Focus on function call parameters, not instruction details"
```

---

### Sprint DA-10: Gate 10 — Full Incident Response Scenario
**Status:** ⬜ Backlog
**Priority:** Medium
**Depends on:** DA-9
**Location:** `_app/dark-arts/vault/gates/gate-10.html`
**Est. Student Completion Time:** 60-90 minutes

Capstone gate tying together all previous skills. Full incident response scenario from initial alert through containment, eradication, and lessons learned. The student operates as lead analyst coordinating the response.

| Task | Status |
|------|--------|
| SIEM alert simulation — student receives initial detection alert with raw log data | ⬜ |
| Integrated terminal — access to the SOC workstation filesystem with IR playbooks, previous incidents, escalation docs | ⬜ |
| Triage phase — determine scope, severity, affected systems from network/endpoint logs | ⬜ |
| Containment decisions — student chooses isolation strategy (network segment, host, account disable) with consequences for wrong choices | ⬜ |
| Evidence collection — forensic acquisition of memory dumps, disk images, network captures (simulated) | ⬜ |
| Root cause analysis — combine static analysis (Gate 6), dynamic analysis (Gate 8), and reverse engineering (Gate 9) skills | ⬜ |
| Eradication + recovery — remove persistence, patch vulnerability, restore services | ⬜ |
| Lessons learned report — student writes executive summary with timeline, impact, recommendations | ⬜ |
| Discoverable hint system — hidden files across the SOC workstation (see below) | ⬜ |
| Scoring based on speed, accuracy, and minimizing business impact — no hint buttons | ⬜ |
| Gate completion → "Dark Arts Master" achievement + full vault access | ⬜ |

**Educational Focus:** NIST IR lifecycle (SP 800-61), chain of custody, executive communication, incident timeline reconstruction, coordination between teams

**Hint Architecture — Discoverable Filesystem:**

```
/home/analyst/
├── playbooks/
│   ├── ir-playbook-v3.md                 (visible — org's IR procedure doc)
│   ├── .containment-priority-matrix.txt  (hidden)
│   │   "Containment priority: credential compromise > lateral
│   │    movement > C2 active > data staging. Isolate the
│   │    credential source FIRST, then work outward"
│   │
│   └── escalation-contacts.md            (visible — who to call)
│
├── previous-incidents/
│   ├── .incident-2024-017.txt            (hidden)
│   │   "Similar TTPs observed Nov 2024. Attacker pivoted via
│   │    SMB admin shares after LSASS dump. Check for scheduled
│   │    tasks created in the last 72 hours on adjacent hosts"
│   │
│   └── .lessons-learned-template.txt     (hidden)
│       "Executive summary format: 1) What happened (2 sentences)
│        2) Business impact 3) Root cause 4) What we're doing
│        about it. Keep it under one page. No jargon."
│
├── forensics/
│   └── .chain-of-custody-checklist.txt   (hidden)
│       "Before imaging: photograph screen, note running processes,
│        record time/date, hash everything. Order matters —
│        volatile evidence (RAM) before non-volatile (disk)"
│
└── .senior-analyst-notes/                (hidden directory)
    └── gut-check.txt
        "When the timeline doesn't make sense, check for
         timestomping. Compare $MFT timestamps against
         USN journal entries. Attackers modify $SI but
         rarely touch $FN timestamps"
```

**Gate Progression Summary:**

| Gate | Focus | Hints | Est. Time | Tier Unlock |
|------|-------|-------|-----------|-------------|
| 1-5 | CTF entry challenges | Built-in (learning phase) | 10-20 min | Vault access |
| 6 | Static Analysis | Hint buttons with -50 pt deduction | 20-30 min | Tier 2 |
| 7 | Threat Attribution | Hint buttons with -25 pt deduction | 30-40 min | Tier 3 |
| **8** | **Dynamic Analysis** | **Discoverable filesystem — no buttons, no deductions** | **30-45 min** | **Tier 4** |
| **9** | **Reverse Engineering** | **Discoverable filesystem — no buttons, no deductions** | **40-60 min** | **Tier 5** |
| **10** | **Incident Response Capstone** | **Discoverable filesystem — no buttons, no deductions** | **60-90 min** | **Dark Arts Master** |

---

### Sprint F-1: Progress Tracking ✅
**Completed:** December 25, 2025 (v2.9.0 "Journey")
- ProgressManager with XP/leveling system
- Dashboard integration with stats display
- Real-time progress updates

### Sprint F-2: House Progress ✅
**Completed:** December 25, 2025 (v2.10.0 "Pathfinder")
- HouseProgressPanel component
- Per-house progress visualization
- Continue Learning navigation
- Integrated into all 8 houses

### Sprint F-3: Quiz System ✅
**Completed:** December 2025
- QuizEngine.js - Full reusable quiz component (33KB)
- quiz-engine.css - Complete styling with house themes
- quiz-template.html - Ready-to-use template
- Features: timer, randomization, achievements, progress tracking, retry

---

## Sprint Velocity Tracking

| Sprint | Planned | Completed | Notes |
|--------|---------|-----------|-------|
| A-0/A-2 | 15 | 15 | Architecture complete |
| DL-1/DL-5 | 40 | 40 | Digital Life v3.8.0 (8 phases) |
| M-1/M-3 | 20 | 20 | Full content migration |
| DA-1/DA-6 | 20 | 20 | Dark Arts complete |
| F-1 | 3 | 3 | Progress tracking |
| F-2 | 4 | 4 | House progress |
| F-3 | 4 | 4 | Quiz system |
| WSA-1/3 | 30 | 30 | WSA M01-M07 complete with open world |
| HD-1 | 15 | 15 | Handler Dashboard Phase 1 complete |
| HD-1.5 | 18 | 18 | Content assignments + browser (v3.10.0) |
| HD-2 | 13 | 13 | Student join flow + roster + profile + export (Feb 5, 2026) |
| HD-3 | 6 | 6 | Progress tracking + roster bars (Feb 5, 2026) |
| HD-5 | 8 | 8 | Export / Reports — grades CSV, progress CSV, class summary (Feb 5, 2026) |
| CLH | 5 | 5 | CLH action modal + course home + 31-module registry (Feb 5, 2026) |
| Content Audit | 28 | 28 | Core 2 midterm + 11 enhanced presentations + 12 enhanced labs + 3 new WSA M01 files + WSA 404 fix (Feb 8, 2026) |
| HD-7 | 7 | 7 | Time-on-task analytics: start recording, duration compute, Firestore storage, chart (Feb 9, 2026) |
| L-0 | 10 | 10 | Linux infrastructure: 2 new visualizers, 2 new components, 5 lab fixes, LinuxTerminal API extension, context callouts (Feb 9, 2026) |
| F-15 | 20 | 20 | CMMC: 4 engines, 17 consumer pages, 16 old wrappers deleted, registry + index updated, level guide (Feb 13, 2026) |
| AR-1 | 8 | 8 | BoxEngine v1 + A1 Ancient Ledger: engine (4 files), box config, index, workshop update, deploy (Feb 15, 2026) |
| AR-2 | 7 | 7 | IDP Template + A1 IDP + Gemini prompt + CTF Vision v1.3 + Commercialization update + Lessons Learned (Feb 15, 2026) |

**Total: ~266 tasks completed**

---

## Notes

- Sprints are flexible duration (1-3 sessions)
- Digital Life is priority track
- Architecture must be decided before heavy development
- Migration can happen in parallel with feature development
- Dark Arts complete and operational
- **Linux Initiative (L-Series):** 5 sprints planned, ~150-170 original interactive labs
  - Based on 270 topic curriculum from FM-256/linux-free-tutorials
  - Creates ORIGINAL content using Hexworth's interactive infrastructure
  - Offensive tools (Hashcat, Metasploit, etc.) gated behind Dark Arts Five Gates

---

## December 31, 2025 - SPELL-023 Sealed

### 🔮 SPELL-023: EC-Council CSE Course ✅
**Completed:** December 31, 2025
**Status:** SEALED
**Location:** `_app/houses/cloud/modules/cse/`

| Deliverable | Count | Details |
|-------------|-------|---------|
| Modules | 8 | M01-M08 full course |
| HTML Files | 24 | presentation + lab + quiz per module |
| Lab Commands | 120+ | Terminal-based CLI simulations |
| Quiz Questions | 160 | 20 per module with cumulative review |

**Features:**
- Progressive difficulty: Beginner → Intermediate → Advanced → Capstone
- Terminal-based CLI labs (not quiz-style)
- Cumulative learning: quizzes review previous 3 modules
- Color-coded themes per module
- Full navigation: Presentation → Lab → Quiz → Next Module
- Instructor documentation + quick reference card

**Documentation:**
- `_planning/CSE_COURSE_DOCUMENTATION.md`
- `_planning/CSE_QUICK_REFERENCE.md`

**Deployed:** Firebase v2.55.0
**Live:** https://hexworth-prime.web.app/houses/cloud/

---

## January 31, 2026 - WSA Open World Complete

### WSA M01-M07: Open World Enhancement ✅
**Completed:** January 31, 2026
**Status:** FUNCTIONAL
**Location:** `_app/houses/cloud/modules/wsa/m01-m07/`

| Enhancement | Details |
|-------------|---------|
| Context Menus | All list items have right-click menus |
| Dialogs | All toolbar buttons open functional dialogs |
| State Sync | GUI and PowerShell share state via WSAState |
| Graph Types | Performance Monitor supports line/bar/area |
| Validation | Cluster validation shows detailed report |

### PSTerminal.js: Rich Filesystem ✅
**Completed:** January 31, 2026

Added 600+ lines of hidden filesystem content:
- **Spy Craft:** Dead drops, agent codenames, surveillance logs
- **Conspiracies:** Majestic-12, mind control, UFO crash sites
- **Nuclear:** Launch codes, facility locations, protocols
- **Historical:** Pirate treasure coordinates, lost civilizations
- **Urban Legends:** Government experiments, secret bases
- **Black Projects:** Aurora, stealth programs, advanced tech

All hidden files require `Get-ChildItem -Force` to discover.

### Course Restructure ✅
**Completed:** January 31, 2026
**Updated:** February 8, 2026 — Full course now M01-M20 (all complete)

| Change | Details |
|--------|---------|
| M01-M07 | Foundation modules (Jan 2026) |
| M08-M10 | Core Services: DNS, DHCP, Group Policy (Feb 2026) |
| M10-Midterm | OUTPOST midterm project (Feb 2026) |
| M11-M14 | Web, RDS, PKI, Advanced Networking (Feb 2026) |
| M15-M19 | AD Sites, Backup, Firewall, Automation, Troubleshooting (Feb 2026) |
| M20 | FAILSAFE Capstone final exam (Feb 2026) |

All 20 modules now have: presentation + GUI lab + PS lab + quiz.
Content audit (Feb 8) confirmed no gaps remain.

---

## February 5, 2026 - CLH Course Path + Action Modal

### CLH Path Action Modal + Course Home Page ✅
**Completed:** February 5, 2026 — v3.10.5
**Status:** DEPLOYED
**Location:** `_app/houses/script/courses/clh/`, `_app/houses/script/index.html`

| Deliverable | Details |
|-------------|---------|
| Action Modal | 3-option modal (Course Home, Browse Modules, Cancel) on Script House CLH card |
| Modal Fix | Moved from dashboard.html to houses/script/index.html where CLH category card lives |
| Course Home Page | 31 modules across 7 tiers with collapsible tier sections |
| Content Registry | All 31 CLH modules registered with slides, labs, and quizzes |
| Search Discoverability | All CLH modules discoverable via ContentCatalog and Explore search |
| Prerequisite Fix | Fixed self-referential prerequisites bug in content-registry.js |

**7 Tiers:**
1. Foundation (Modules 1-5)
2. System Administration (Modules 6-10)
3. Networking (Modules 11-15)
4. Security (Modules 16-20)
5. Automation & Scripting (Modules 21-24)
6. Advanced Topics (Modules 25-28)
7. Capstone (Modules 29-31)

---

## February 8, 2026 - A+ Core 2 & WSA Content Audit + Build

### Content Audit & Enhancement Sprint ✅
**Completed:** February 8, 2026
**Status:** DEPLOYED
**Agent:** CCode-Opus4.6
**Locations:** `_app/houses/forge/applets/comptia-aplus/core-2/`, `_app/houses/cloud/modules/wsa/`

| Category | Count | Details |
|----------|-------|---------|
| Hotfix | 1 | WSA 404 — `resolveAssignmentHref()` in `dashboard.html` |
| New files | 4 | Core 2 midterm + WSA M01 GUI lab + PS lab + quiz |
| Enhanced presentations | 9 | 5 Core 2 (656-708 lines) + 4 WSA (793-842 lines) |
| Enhanced labs | 12 | 6 Core 2 (784-980 lines) + 6 WSA PS labs (552-561 lines) |
| Enhanced quizzes | 4 | WSA m04-m07 (189→831 lines each, 5→10 questions) |
| **Total files touched** | **28** | All deployed to Firebase (7,101 total files) |

**A+ Core 2 — Before/After Audit:**

| Component | Before | After |
|-----------|--------|-------|
| Presentations | 13 (5 thin: 316-430 lines) | 13 (all 600+ lines, 20-22 slides each) |
| Labs | 14 (6 thin: 369-683 lines) | 14 (all 784+ lines, 8-13 tasks each) |
| Quizzes | 15 | 15 (no changes needed, already solid) |
| Midterm | **NONE** | **1** (638 lines, 45 Qs, 4-domain scoring, 70% pass) |

**WSA — Before/After Audit:**

| Component | Before | After |
|-----------|--------|-------|
| M01 Components | Presentation only | Presentation + GUI lab + PS lab + quiz (complete) |
| Quizzes m04-m07 | 189 lines each (5 Qs) | 831 lines each (10 Qs, m02 gold-standard pattern) |
| PS Labs m04-m07, m18-m19 | 206-314 lines | 552-561 lines (14 tasks each) |
| Presentations m11-m14 | 315-377 lines | 793-842 lines (21-23 slides each) |
| Midterm | Already complete (3,934 lines) | No changes needed |
| Capstone M20 | Already complete (1,316 lines) | No changes needed |

**Execution approach:** 8 parallel background agents handled the content build concurrently, with the orchestrator managing task dependencies and verifying outputs.

---

## Planned Sprints (Backlog)

### F-12: Universal Search — Every Page Gets a Search Bar
**Status:** Planned
**Priority:** High
**Rationale:** Search exists in the 9 main house index pages via ContentCatalog + ContentDiscovery, but coverage is incomplete. The Dark Arts Vault (30+ labs/tools), Matrix (doesn't exist yet), and Factionless (dashboard divergent state) have no search at all. ContentDiscovery.js needs to become a true universal component — drop it in anywhere and it works.

#### Current State Audit

| Location | Has Search? | Implementation | Gap |
|----------|-------------|----------------|-----|
| 9 house index pages (Eye, Code, Key, Shield, Script, Cloud, Web, Forge, Dark Arts) | Yes | ContentCatalog + ContentDiscovery + local `filterModules()` | Consistent but ContentDiscovery loads as secondary — local filter does the actual work |
| Dark Arts Vault (`vault/index.html`) | **No** | No search — 30+ labs/tools in flat grid, 4 tiered module sections | Needs search bar that filters across tiers + tools |
| Dark Arts house index (`houses/dark-arts/index.html`) | Partial | ContentCatalog + ContentDiscovery loaded but **no visible search input** | Wire up the search bar UI |
| Dashboard Explore tab | Partial | Custom `exploreSearchInput` — not ContentDiscovery | Should use ContentDiscovery for consistency |
| Games page (`games.html`) | Custom | Own filter with `search-input` ID | Works but not unified with ContentDiscovery |
| Matrix / Operator path | **Doesn't exist** | No dedicated page — MX-1 through MX-6 are pending | Page creation is MX-1 scope; search should be wired in from day one |
| Factionless (dashboard divergent) | **No** | FileTreeExplorer only — no search bar | Needs search across all houses (factionless = access everything) |
| Cert path landing pages (8) | **No** | CertPathRenderer.js — module list only | Optional — small content sets, search adds less value |

#### Phase 1: Universal Search Component

Upgrade ContentDiscovery.js into a drop-in universal search component that auto-configures based on context.

| Task | Details | Status |
|------|---------|--------|
| Refactor ContentDiscovery.js into self-initializing component | Auto-detect page context (house index, vault, dashboard, games). No need for SAMPLE_MODULES — pull from ContentCatalog directly. | ⬜ |
| Add fuzzy search | Levenshtein distance or simple token matching — "encryptin" finds "Encryption Basics", "nmap" finds "Nmap Scanning Lab" | ⬜ |
| Add tag-based discovery | ContentCatalog modules already have `tags[]` — surface them as clickable filter chips below search bar | ⬜ |
| Add content type filter chips | Filter by: presentation, lab, quiz, applet, game, tool — visual chips, AND logic with search text | ⬜ |
| Add cross-house toggle | "Search this house" vs "Search all houses" toggle. Default: current house. Global shows house badges on results. | ⬜ |
| Keyboard shortcut | `/` or `Ctrl+K` focuses search bar from anywhere on the page | ⬜ |

#### Phase 2: Wire Search Into Every Page

| Page | Task | Status |
|------|------|--------|
| **Dark Arts Vault** (`vault/index.html`) | Add search bar above tier sections. Filters across all tiers + tools section. Results show tier badge + module status. | ⬜ |
| **Dark Arts house index** (`houses/dark-arts/index.html`) | Wire up visible search input — scripts already loaded, just needs the UI element + `filterModules()` | ⬜ |
| **Factionless (dashboard divergent)** | Add search bar to factionless explorer section. Uses ContentCatalog global search across all 9 houses. Results grouped by house with house icon badges. | ⬜ |
| **Matrix page** (when MX-1 creates it) | Include ContentDiscovery from day one. Search across operator-path-specific content. | ⬜ |
| **Dashboard Explore tab** | Replace custom `exploreSearchInput` with ContentDiscovery component for consistency | ⬜ |
| **Games page** (`games.html`) | Replace custom filter with ContentDiscovery component filtered to `type: game` | ⬜ |
| **9 house index pages** | Replace local `filterModules()` with ContentDiscovery component — same UI, unified backend | ⬜ |

#### Phase 3: ContentCatalog Completeness

| Task | Details | Status |
|------|---------|--------|
| Audit ContentCatalog entries against actual files | Currently 180 modules indexed — but 1,176+ HTML files exist. After R-1/R-2 registration, re-audit. | ⬜ |
| Index Dark Arts Vault content | 30+ labs/tools not in ContentCatalog (SQL injection lab, XSS lab, Nmap training, etc.) — add them | ⬜ |
| Index games | 56 games exist but most aren't in ContentCatalog — add with `type: 'game'` | ⬜ |
| Verify all hrefs resolve | Every ContentCatalog entry's href must point to an existing file — EduScan REG-001 catches mismatches | ⬜ |
| Add missing tags | Ensure every module has 3-5 meaningful tags for tag-based discovery | ⬜ |

#### Phase 4: Search UX Polish

| Task | Details | Status |
|------|---------|--------|
| Recent searches | Store last 5 searches in localStorage, show as suggestions on focus | ⬜ |
| "No results" state | Helpful message with suggestions: "Try searching for 'encryption' or 'linux'" + link to browse all | ⬜ |
| Search analytics | Track what users search for (localStorage counter) — helps identify content gaps | ⬜ |
| Highlight matches | Bold the matching text in search results | ⬜ |
| Responsive design | Search bar collapses to icon on mobile, expands on tap | ⬜ |

#### Technical Notes

**ContentDiscovery.js upgrade pattern:**
```javascript
// Current: requires SAMPLE_MODULES and CATEGORIES on the page
// New: auto-detects context and pulls from ContentCatalog
ContentDiscovery.init({
    scope: 'house',        // 'house' | 'vault' | 'global' | 'games'
    house: 'shield',       // auto-detected from URL if not provided
    container: '#searchArea', // where to inject the search UI
    showTags: true,        // tag chip filters
    showTypeFilter: true,  // content type chips
    globalToggle: true     // show "search all houses" toggle
});
```

**Vault-specific search considerations:**
- Must search across locked AND unlocked tiers (show lock icon on locked results)
- Tools section content isn't in ContentCatalog yet — needs indexing first
- Gate entries should not appear in search results (they're challenges, not content)

**Factionless search considerations:**
- Always global scope (factionless = all houses)
- Results grouped by house with color-coded badges
- Should feel like the "power user" search — show everything

#### Dependencies

| Dependency | Required For | Sprint |
|------------|-------------|--------|
| Dark Arts Vault content indexed in ContentCatalog | Phase 2 (vault search) | R-2 or this sprint |
| Games indexed in ContentCatalog | Phase 2 (games search) | R-1/R-2 or this sprint |
| Matrix page exists | Phase 2 (matrix search) | MX-1 |
| R-1/R-2 content registration | Phase 3 (completeness audit) | R-1, R-2 |

#### Sprint Sequencing

Phase 1 (component upgrade) and Phase 2 (wire into pages) can be done together — that's the core sprint. Phase 3 depends on R-series registration work. Phase 4 is polish that can come later.

**Recommendation:** Phases 1+2 as Sprint F-12. Phase 3 folds into R-10 (final verification). Phase 4 as optional follow-up or folded into a future UX sprint.

**Scope:** ContentCatalog.js, ContentDiscovery.js, vault/index.html, dashboard.html, games.html, all 9 house index pages, Dark Arts house index

---

### F-13: Certification Path Build-Out (All Houses)
**Status:** Planned
**Priority:** High
**Rationale:** 12 cert path cards across 7 houses navigate to `path-view.html` but have no matching entries in `LearningPaths.js`. Only Script House paths work (`comptia-linux`, `linux-mastery`, `devops-fundamentals`). All others 404. Each needs a LearningPaths entry mapping existing content + identifying gaps.

**Broken cert path cards (12 total):**

| House | Path ID | Card Label | Cert |
|-------|---------|------------|------|
| Shield | `security-plus` | Security Fundamentals | CompTIA Security+ SY0-701 |
| Shield | `cysa-plus` | Security Analysis | CompTIA CySA+ CS0-003 |
| Shield | `casp-plus` | Security Architecture | CompTIA CASP+ CAS-004 |
| Key | `cryptography-track` | Cryptography Track | Primary Learning Path |
| Key | `security-plus-crypto` | Security+ Crypto Domain | CompTIA Security+ |
| Web | `comptia-network` | Network Fundamentals | CompTIA Network+ N10-009 |
| Web | `ccna` | Cisco Networking | Cisco CCNA 200-301 |
| Cloud | `aws-ccp` | Cloud Fundamentals | AWS Cloud Practitioner |
| Cloud | `azure-fundamentals` | Azure Fundamentals | Microsoft AZ-900 |
| Code | `aws-developer` | AWS Developer | AWS Developer Associate |
| Eye | `cysa-plus` | Security Analysis | CompTIA CySA+ CS0-003 |
| Eye | `security-operations` | Security Operations | SOC Analyst Path |

**Goals per path:**
- [ ] Create LearningPaths.js entry with cert domain/objective structure
- [ ] Map existing house content (presentations, labs, quizzes) to cert domains
- [ ] Identify content gaps and build missing modules
- [ ] Wire path-view.html to correctly load and display each certification path
- [ ] Add progress tracking per domain/objective

**Suggested build order (by existing content density):**
1. `security-plus` (Shield has most content already)
2. `comptia-network` (Web has Network+ aligned content)
3. `cryptography-track` + `security-plus-crypto` (Key house)
4. `aws-ccp` + `azure-fundamentals` (Cloud house — WSA content maps well)
5. `cysa-plus` + `security-operations` (Shield/Eye — shared CySA+ path)
6. `ccna` (Web — needs Cisco-specific content)
7. `aws-developer` (Code house)
8. `casp-plus` (Shield — advanced, build last)

**Scope:** LearningPaths.js, path-view.html, all house content directories

---

### F-14: STRIDE Threat Modeler Audit & Rebuild (Eye House)
**Status:** Planned
**Priority:** Medium
**Rationale:** The STRIDE Threat Modeler (`houses/eye/games/threat-modeler.html`) is categorized as a lab but its purpose and quality are unclear. Needs a full audit to determine what it does, whether it's functional, and how to improve it into a proper STRIDE methodology training tool.

**Goals:**
- [ ] Audit current implementation — what does it actually do?
- [ ] Determine if it's a tool, lab, or interactive tutorial
- [ ] Fix any broken functionality
- [ ] Enhance into a proper STRIDE threat modeling workflow (identify assets → map threats → categorize by S/T/R/I/D/E → generate report)
- [ ] Add educational content explaining each STRIDE category with examples
- [ ] Ensure it fits Eye House theming and educational goals

**Scope:** `houses/eye/games/threat-modeler.html`

---

---

## Content Registration & Rebuild Initiative (R-Series)

**Context:** Comprehensive audit (Feb 13, 2026) revealed 1,176 HTML content files across all houses but only 180 (15%) are discoverable via ContentCatalog. 81 Tumult Hype legacy applets need rebuilding as native HTML/JS. 537 files lack progress tracking. Zero broken content — this is a discoverability and modernization initiative.

**Audit Summary:**

| House | Files on Disk | In ContentCatalog | Hype Applets | Upgrade Effort |
|-------|:---:|:---:|:---:|---|
| Script | 322 | 91 (28%) | 0 | Small — already highest quality |
| Forge | 188 | 31 (16%) | 2 | Small — Core 1/2 complete |
| Code | 42 | 5 (12%) | 1 | Small — well-structured |
| Key | 44 | 7 (16%) | 0 | Small-Medium — needs catalog + TLS module |
| Eye | 132 | 14 (11%) | 0 | Medium — CyberOps needs catalog/tracking |
| Cloud | 171 | 5 (3%) | 0 | Medium — WSA/CSE need catalog/tracking |
| Dark Arts | 53 | 0 (0%) | 0 | Medium — vault needs registration + tracking |
| Web | 100 | 20 (20%) | 13 | Medium-Large — Hype IP applets + lab gap |
| Shield | 156 | 5 (3%) | 55 | Large — 55 Hype applets to rebuild |
| **Totals** | **1,176** | **180 (15%)** | **81** | |

**Quality Tiers:**
- **Tier 1 (Production):** CLH (31), Zero to Python (8), A+ Core 1+2 (24), CMMC Domains (14), WSA (20)
- **Tier 2 (Good, needs registration):** CyberOps (70+), CSE (8), Key crypto (30+), Code (42), Web tools (22), Dark Arts vault (40+), FEH (10)
- **Tier 3 (Functional, legacy Hype format):** Shield (55), Web IP suite (13), Forge (2), Code (1)

### Sprint R-1: Content Registration Wave 1 — Code, Key, Forge
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** High — Quick wins, highest ROI per effort
**Estimated Scope:** ~80 files to register

Register all unregistered content in the three smallest/cleanest houses into ContentCatalog and content-registry.js.

| Task | House | Files | Status |
|------|-------|:---:|--------|
| Register Code presentations, labs, quizzes, tools, games | Code | ~37 | ⬜ |
| Register Key presentations, labs, quizzes, tools, games | Key | ~37 | ⬜ |
| Register Forge standalone applets (multimeter, RAID, CPU, etc.) | Forge | ~6 | ⬜ |
| Verify all registered content has correct href paths | All 3 | — | ⬜ |
| Run EduScan to confirm REG-001 reduction | — | — | ⬜ |

**Expected EduScan Impact:** REG-001 warnings reduced by ~80

---

### Sprint R-2: Content Registration Wave 2 — Cloud, Eye, Web, Dark Arts
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** High — Makes the biggest hidden content libraries visible
**Estimated Scope:** ~400+ files to register
**Depends on:** R-1 (establish registration patterns)

| Task | House | Files | Status |
|------|-------|:---:|--------|
| Register WSA course (20 modules × 4 components) | Cloud | ~80 | ⬜ |
| Register CSE course (8 modules × 3 components) | Cloud | ~24 | ⬜ |
| Register Cloud standalone tools (ch01-ch12) | Cloud | ~15 | ⬜ |
| Register Cloud games and applets | Cloud | ~10 | ⬜ |
| Register CyberOps 200-201 weekly modules + applets | Eye | ~70 | ⬜ |
| Register Eye standalone tools and labs | Eye | ~15 | ⬜ |
| Register Web presentations, tools, reviews | Web | ~60 | ⬜ |
| Register Dark Arts vault labs, tools, modules | Dark Arts | ~40 | ⬜ |
| Register FEH presentations (feh-01 through feh-10) | Dark Arts | ~10 | ⬜ |
| Fix Eye Week 5 nav (shows "Week 6: Coming Soon" but Week 6-7 exist) | Eye | 1 | ⬜ |
| Run EduScan to confirm REG-001 reduction | — | — | ⬜ |

**Expected EduScan Impact:** REG-001 warnings reduced by ~500+

---

### Sprint R-3: Progress Tracking Pass
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium — Enables instructor visibility into student activity
**Estimated Scope:** ~50 highest-priority files
**Depends on:** R-1, R-2 (content must be registered first)

Add ProgressManager integration to the most impactful untracked content. Focus on files that are already assigned in classes or part of learning paths.

| Task | Scope | Status |
|------|-------|--------|
| Add progress tracking to CSE module labs (m01-m08) | Cloud | ⬜ |
| Add progress tracking to WSA presentations (m01-m05+) | Cloud | ⬜ |
| Add progress tracking to CyberOps weekly evaluations | Eye | ⬜ |
| Add progress tracking to Key crypto labs | Key | ⬜ |
| Add progress tracking to Dark Arts vault labs | Dark Arts | ⬜ |
| Add progress tracking to Web standalone presentations | Web | ⬜ |
| Run EduScan to confirm TRACK-002/003 reduction | — | ⬜ |

**Expected EduScan Impact:** TRACK-002/003 warnings reduced by ~200+

---

### Sprint R-4: Shield Hype Rebuild — Crypto Applets (14)
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium — Largest single batch in Shield
**Estimated Scope:** 14 applets → 1 shared engine + 14 consumer pages
**Depends on:** R-1 (registration patterns established)

Rebuild Shield house's 14 Tumult Hype crypto applets as native HTML/JS using the shared renderer pattern proven by CMMC.

| Task | Status |
|------|--------|
| Audit existing 14 Hype crypto applets — catalog topics, interactivity, content | ⬜ |
| Design CryptoAppletData.js — data for all 14 crypto topics | ⬜ |
| Build CryptoAppletRenderer.js — shared interactive renderer | ⬜ |
| Create 14 consumer HTML pages | ⬜ |
| Update content-registry.js and Shield house index.html | ⬜ |
| Delete old Hype directories | ⬜ |
| Run EduScan to verify no regressions | ⬜ |

**Hype Crypto Topics (14):** AES, Block Ciphers, Caesar Cipher, Crypto Protocols, Diffie-Hellman, Digital Signatures, Hashing, HMAC, Key Exchange, PKI, RSA, Steganography, Stream Ciphers, Symmetric vs Asymmetric

---

### Sprint R-5: Shield Hype Rebuild — Threat Applets (16)
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium
**Estimated Scope:** 16 applets → 1 shared engine + 16 consumer pages
**Depends on:** R-4 (refine the rebuild pattern)

| Task | Status |
|------|--------|
| Audit existing 16 Hype threat applets — catalog topics, interactivity | ⬜ |
| Design ThreatAppletData.js — data for all 16 threat topics | ⬜ |
| Build ThreatAppletRenderer.js — shared interactive renderer | ⬜ |
| Create 16 consumer HTML pages | ⬜ |
| Update content-registry.js and Shield house index.html | ⬜ |
| Delete old Hype directories | ⬜ |
| Run EduScan to verify | ⬜ |

**Hype Threat Topics (16):** APT, Botnets, Buffer Overflow, Cryptojacking, DDoS, DNS Attacks, Insider Threats, IoT Threats, Man-in-the-Middle, Phishing, Privilege Escalation, Ransomware, Rootkits, Social Engineering, Supply Chain, Zero-Day

---

### Sprint R-6: Shield Hype Rebuild — Fundamentals + Network + Remaining (18+)
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium
**Estimated Scope:** ~18 applets → shared engines + consumer pages
**Depends on:** R-4, R-5

Rebuild remaining Shield Hype applets: fundamentals (~10), network (~8), access (~3), risk (~5), operations, governance.

| Task | Status |
|------|--------|
| Audit remaining Shield Hype applets by category | ⬜ |
| Group by shared-renderer feasibility (may need 2-3 engines) | ⬜ |
| Build shared engines + consumer pages per group | ⬜ |
| Update registry and index | ⬜ |
| Delete old Hype directories | ⬜ |
| Run EduScan to verify | ⬜ |

---

### Sprint R-7: Web Hype Rebuild — IP Addressing Suite (13)
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium — Core networking tools used across courses
**Estimated Scope:** 13 applets → 1 shared engine + 13 consumer pages
**Depends on:** R-4 (shared renderer pattern refined)

Rebuild the entire IP addressing/subnetting Hype applet collection as native interactive tools.

| Task | Status |
|------|--------|
| Audit existing 13 Hype IP applets — catalog features and interactivity | ⬜ |
| Design IPToolsData.js — data for all 13 IP/subnet topics | ⬜ |
| Build IPToolsRenderer.js — shared interactive renderer with calculators | ⬜ |
| Create 13 consumer HTML pages | ⬜ |
| Update content-registry.js and Web house index.html | ⬜ |
| Delete old Hype directories | ⬜ |
| Run EduScan to verify | ⬜ |

**Hype IP Topics (13):** Binary IP, CIDR Notation, IPv4 Classes, IPv6 Addressing, NAT/PAT, Network Classes, Private vs Public, Subnet Calculator, Subnet Masks, Subnetting Practice, Supernetting, VLSM, Wildcard Masks

---

### Sprint R-8: Shield Remaining 3 — CUI, Framework, Quiz
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Medium — Last 3 broken Articulate wrappers from F-15
**Estimated Scope:** 3 new applets (small)

Build native interactive content for the 3 non-domain Shield applets that still reference missing `data/player/player.js`:

| Task | Status |
|------|--------|
| Build CUI Overview applet — what is CUI, categories, marking, handling | ⬜ |
| Build CMMC Framework Overview applet — history, levels, assessment process, timeline | ⬜ |
| Build CMMC Comprehensive Quiz — 30-50 questions covering all 14 domains | ⬜ |
| Update content-registry.js and Shield house index.html | ⬜ |
| Delete old wrapper files | ⬜ |
| Run EduScan to verify | ⬜ |

---

### Sprint R-9: Gap Fill — TLS/SSL Module, Web Labs, Eye Nav
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Low-Medium — New content to fill identified gaps
**Depends on:** R-1 through R-3 (registration complete)

| Task | House | Status |
|------|-------|--------|
| Build TLS/SSL Explained module (marked 'coming-soon' in Key house) | Key | ⬜ |
| Build 3-5 additional Web house labs (only 2 exist for 100 files) | Web | ⬜ |
| Fix Eye house CyberOps Week 5 nav → link to existing Week 6-7 | Eye | ⬜ |
| Rebuild Forge Hype applets (multimeter, hard drive geometry — 2) | Forge | ⬜ |
| Rebuild Code Hype applet (config management — 1) | Code | ⬜ |

---

### Sprint R-10: Polish + Verify — 100% Catalog Coverage
**Status:** ✅ Complete (February 16, 2026 — Marathon)
**Priority:** Low — Final cleanup pass
**Depends on:** R-1 through R-9

| Task | Status |
|------|--------|
| Run EduScan full scan — target: 0 CRITICAL, 0 HIGH, REG-001 < 50 | ⬜ |
| Verify every house index page links to correct local paths (no CloudFront) | ⬜ |
| Verify ContentCatalog has entries for all registered content | ⬜ |
| Verify all learning paths in LearningPaths.js resolve to existing files | ⬜ |
| Archive final EduScan baseline | ⬜ |
| Cross-reference with F-12 (Centralized Search) — ensure search covers all new catalog entries | ⬜ |

**Target EduScan State:** CRITICAL: 0, HIGH: 0, REG-001: < 50, TRACK: < 100

---

### BUG: Encryption Basics 404
**Status:** ✅ Fixed (February 14, 2026)

**Fixed:**
- ✅ `ContentCatalog.js` — corrected href (ES-10 CAT-001 bulk fix)
- ✅ `TrailHunter.js` — corrected href (line 38) + display name key (line 774)

---

### BUG: Core 2 Duplicate Progress Tracking
**Status:** 🐛 Open (February 12, 2026)
**Priority:** High — User-facing confusion, progress appears lost depending on entry point

**Problem:** CompTIA A+ Core 2 content exists at two locations with independent progress tracking:

| View | Path | Storage Keys |
|------|------|-------------|
| **Core 2 Applet Hub** | `forge/applets/comptia-aplus/core-2/index.html` | `aplus-core2-progress`, `core2-ch13-quiz`, `core2-ch18-lab`, etc. |
| **Forge House Index** | `forge/index.html` (module catalog) | `hexworth_progress.forge['forge-windows-editions']`, etc. |

Completing a standalone presentation (e.g., `forge-windows-editions.presentation.html`) from the Forge house index writes to `hexworth_progress.forge` but NOT to `aplus-core2-progress`. The Core 2 applet hub shows 0 completions while Forge house index shows 13-15.

**Root Cause:** Content was built at two different times. Standalone modules at forge root came first, then the comprehensive Core 2 applet hub was built later. They were never wired together.

**Fix Options:**
1. **Sync both systems** — Make the applet hub check both key sets bidirectionally
2. **Consolidate to one path** — Make one the canonical entry and redirect/remove the other
3. **Bridge layer** — Add a progress adapter that normalizes reads/writes across both key patterns

**Also found during Core 2 QC:**
- 3 broken tool paths in chapter indexes (ch15, ch16, ch17) — wrong relative paths
- 7 broken back-link paths in quizzes (ch18-ch24) — missing `../../`
- 7 broken lab links in presentations — wrong filename format
- Missing emoji icons in ch21-ch24

**Scope:** `houses/forge/applets/comptia-aplus/core-2/`, `houses/forge/presentations/`, `houses/forge/labs/`, `houses/forge/quizzes/`

---

*Last Updated: February 13, 2026*
