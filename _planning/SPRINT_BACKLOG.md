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
| **CLH-** | CLH Course | Command Line Heroes course (Script House) |

---

## Current Sprint

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
**Status:** 🟢 Phase 4 Complete
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
**Status:** ⬜ Backlog
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
**Status:** ⬜ Backlog
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
**Status:** ⬜ Backlog
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
**Status:** ⬜ Backlog
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
**Status:** ⬜ Backlog
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

**Total: ~231 tasks completed**

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

*Last Updated: February 9, 2026*
