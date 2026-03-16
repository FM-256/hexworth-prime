# Marathon Plan — March 2026

**Activation:** User says "marathon mode" → read this file → find the first unchecked wave → execute
**Permissions:** All file edits, bash commands, and agent launches pre-approved. Do NOT ask questions. Make best judgment on all design decisions.
**Autonomy:** Full. No AskUserQuestion. No confirmation prompts. Commit after each wave. Push + deploy after final wave.
**Recovery:** If context resets, read this file first. Resume from the first unchecked item.
**Parallel strategy:** 5-8 agents for different files. 2-3 max for shared files. Serialize ForgeData.js edits.
**Completed waves are removed.** Sprint Master tracks historical completion.

---

## Wave 1: Secret Protection — Answer Keys (2 parallel agents)
*Sprints: SEC-4 + SEC-5 — move answer validation server-side*

**Agent 1: SEC-4 — Operator Objective Keys**
- [x] Audit all 24 operator configs — 103 objectives with client-side check expressions
- [x] Design server-side validation: evaluateCheck() mirrored server-side with state sanitization
- [x] Implement `validateMissionCompletion` Cloud Function in functions/index.js
- [x] Migration script: `functions/migrate-operator-keys.js` (--dry-run, --export-keys) — 103 objectives extracted
- [x] OperatorEngine.js: `_validateCompletionViaServer()` with server-first, local fallback
- [x] Fixed latent `.indexOf()` evaluateCheck bug in OperatorEngine.js

**Agent 2: SEC-5 — Quiz Engine Server-Side**
- [x] Audit quiz answer storage pattern — 228 quiz files scanned, 185 keys extracted
- [x] Design quiz validation Cloud Function — `gradeQuiz` callable, returns score + per-question correct/incorrect (never reveals answers)
- [x] Implement server-side quiz grading endpoint — added to functions/index.js
- [x] Migrate quiz engine — QuizEngine.js has `serverGrading: true` config + `_gradeViaServer()` + fallback
- [x] Migration script — `functions/migrate-quiz-keys.js` (--dry-run, --export-keys, --strip-answers)
- [x] Run migration: 185 keys exported to quiz_keys.json, 225 files stripped, serverGrading:true injected
- [x] Mark SEC-4 and SEC-5 done in sprints.json

---
## Wave 2: Secret Protection — Box Flag Migration (1 agent)
*Sprint: SEC-9 — remove all plaintext flags from client-side*

- [x] Audit all box configs — 26 boxes, 45+ flags (20 arena + 1 pr7 + 1 nt1-arena + 5 dispatch)
- [x] Add `_validateFlagViaServer()` to BoxEngine.js — calls validateFlag CF, falls back to local hash
- [x] Migration script: `functions/migrate-box-flags.js` (--dry-run, --export-keys) covers all flags
- [x] Seeding script: `functions/seed-box-flags.js` — reads box_flags.json, writes to Firestore flag_registry
- [x] Dispatch plaintext already stripped (null values), arena base64 already clean
- [x] Mark SEC-9 done in sprints.json

---
## Wave 3: Learning Path Alignment (1 agent)
*Sprints: QC-14 (1,844 findings) → QC-15 (949 findings, chains after QC-14)*

- [x] **LP-006** (478→1): Fixed 477 module ID mismatches (prefix renames, href-based renames, house-level renames)
- [x] **LP-007** (1530→1209): Wired 321 orphaned modules into learning paths via ID reconciliation
- [x] Reconcile LearningPaths and ContentCatalog entries — 482 IDs renamed across all cert tracks
- [x] **FLOW-001**: 114 unchained files wired — forge (42), code (31), cloud (7), ai (4), eye/shield/web (10), signal toolkit (20)
- [x] Run EduScan flow scan — 1568/1568 chained, 0 unchained
- [x] Mark QC-14 and QC-15 done in sprints.json

---
## Wave 4: Accessibility Audit (2 parallel agents)
*Sprints: AC-1 + AC-4 — WCAG AA compliance*

**AC-4 — Color Contrast (DONE)**
- [x] Dark Arts primary: #6b21a8→#9b59d0 (2.27:1→4.46:1), fixed across 50 files
- [x] Muted text #555→#808080, #666→#8a8a8a, #444→#808080 — all now 4.5:1+
- [x] Handler dashboard light mode gold/muted text fixed
- [x] Wall of Shame alpha greens converted to solid WCAG-passing equivalents
- [x] Landing page tagline animation decoded states fixed
- [x] ~100 files modified (components, CSS, dark-arts content, arena configs)

**AC-1 — Audit (DONE)**
- [x] Full ARIA/keyboard/screen reader audit — 7 core components: dashboard, HouseRenderer, CertPathRenderer, GlobalSearch, BoxEngine, Terminal, arena.css
- [x] Mark AC-1 and AC-4 done in sprints.json

---
## Wave 5: Code Armory — Hub Design (1 agent)
*Sprint: PL-1 — head of the programming languages chain*

- [x] Design Code Armory hub page — 16 languages across 5 categories
- [x] Cert alignment tags, difficulty filters, category groupings
- [x] Breadcrumb navigation, language recommendation quiz
- [x] Mark PL-1 done in sprints.json

---
## Wave 6: Code Armory — Core Languages (5 parallel agents)
*Sprints: PL-2, PL-3, PL-4, PL-10, PL-12 — depends on Wave 23*

- [x] **PL-2** — Python: 10 modules, security-focused examples (port scanning, log parsing)
- [x] **PL-3** — JavaScript & TypeScript: 10 modules, CLI project capstone
- [x] **PL-4** — C programming: 10 modules, buffer overflows, compiler hardening
- [x] **PL-10** — Bash scripting: 10 modules, sysadmin automation, integrity monitors
- [x] **PL-12** — SQL: 10 modules, injection defense, incident response forensics

---
## Wave 7: Code Armory — Systems Languages (4 parallel agents)
*Sprints: PL-5, PL-6, PL-7, PL-15*

- [x] **PL-5** — C++ (OOP, STL, modern C++ — depends on PL-4)
- [x] **PL-6** — Go (cloud tooling, concurrency)
- [x] **PL-7** — Rust (memory-safe systems programming)
- [x] **PL-15** — Assembly (x86/x64, reverse engineering — depends on PL-4)

---
## Wave 8: Code Armory — Enterprise & Web (5 parallel agents)
*Sprints: PL-8, PL-9, PL-11, PL-13, PL-14*

- [x] **PL-8** — Java (enterprise, Android)
- [x] **PL-9** — C# & .NET (Windows development)
- [x] **PL-11** — PowerShell (Windows administration)
- [x] **PL-13** — PHP (web development, legacy systems)
- [x] **PL-14** — Ruby (scripting, web development)

---
## Wave 9: Code Armory — Extras & Cross-Cutting (4 parallel agents)
*Sprints: PL-16, PL-17, PL-18, PL-19, PL-20, PL-21*

- [x] **PL-16** — Swift & Kotlin (modern mobile development)
- [x] **PL-17** — Lua, Perl, R (specialized scripting)
- [x] **PL-18** — Language comparison tool & recommendation engine
- [ ] **PL-19** — Per-language coding challenges (depends on PL-2/3/4/6/7)
- [ ] **PL-20** — Security-focused language selection guide
- [ ] **PL-21** — Python Graphics (turtle, pygame — depends on PL-2)

---
## Wave 10: The Backbone — Hub Design (1 agent)
*Sprint: AN-1 — advanced networking course track*

- [x] Design The Backbone hub page and curriculum structure
- [x] Map content to CCNA/CCNP/Network+ cert objectives
- [x] Mark AN-1 done in sprints.json

---
## Wave 11: The Backbone — Core Courses (5 parallel agents)
*Sprints: AN-2, AN-3, AN-4, AN-6, AN-11 — depends on Wave 28*

- [x] **AN-2** — BGP (Border Gateway Protocol)
- [x] **AN-3** — MPLS and service provider technologies
- [x] **AN-4** — Data center networking and fabric architectures
- [x] **AN-6** — Software-Defined Networking (SDN)
- [x] **AN-11** — Network security architecture

---
## Wave 12: The Backbone — Advanced Topics (5 parallel agents)
*Sprints: AN-5, AN-7, AN-8, AN-9, AN-10, AN-12, AN-13, AN-14, AN-15, AN-16*

- [x] **AN-5** — InfiniBand, RDMA, high-performance networking
- [x] **AN-7** — Advanced SD-WAN and WAN optimization
- [x] **AN-8** — Advanced wireless (Wi-Fi 6/6E/7, mesh)
- [x] **AN-9** — Optical networking and physical layer
- [x] **AN-10** — Advanced IPv6 and internet protocols
- [x] **AN-12** — Network forensics and deep packet analysis
- [x] **AN-13** — Advanced QoS and traffic engineering
- [x] **AN-14** — IS-IS, EIGRP advanced, routing deep dive
- [x] **AN-15** — 5G, cellular, and carrier networking
- [x] **AN-16** — Network design and architecture capstone

---
## Wave 13: Algorithm Chamber (5 parallel agents → serial chain)
*Sprints: CS-1 through CS-12 — dependency chain*

- [x] **CS-1** — Design Algorithm Chamber hub page and curriculum
- [x] **CS-2** — Discrete mathematics (← CS-1)
- [x] **CS-3** — Graph theory and network algorithms (← CS-2)
- [x] **CS-4** — Big O notation and complexity analysis (← CS-2)
- [x] **CS-5** — Data structures deep dive (← CS-4)
- [x] **CS-6** — Sorting and searching algorithms (← CS-5)
- [x] **CS-7** — Greedy algorithms and optimization (← CS-5)
- [x] **CS-8** — Divide and conquer, dynamic programming (← CS-5)
- [x] **CS-9** — String algorithms and pattern matching (← CS-5)
- [x] **CS-10** — Applied algorithms capstone (← CS-4, CS-7)
- [x] **CS-11** — Computational geometry (← CS-5)
- [x] **CS-12** — Algorithm challenge platform (← CS-6, CS-7, CS-8)

---
## Wave 14: The Cortex — AI/ML Track (5 parallel agents → serial chain)
*Sprints: ML-1 through ML-15 — dependency chain*

- [x] **ML-1** — Design Cortex hub page and AI/ML curriculum
- [x] **ML-2** — AI foundations, history, and ethics (← ML-1)
- [x] **ML-3** — Mathematics for machine learning (← ML-1)
- [x] **ML-4** — Classical ML: supervised learning (← ML-3)
- [x] **ML-5** — Classical ML: unsupervised learning (← ML-3)
- [x] **ML-6** — Deep learning fundamentals (← ML-4)
- [x] **ML-7** — Convolutional Neural Networks (← ML-6)
- [x] **ML-8** — Recurrent Neural Networks and transformers (← ML-6)
- [x] **ML-9** — Natural Language Processing (← ML-8)
- [x] **ML-10** — Reinforcement learning (← ML-6)
- [x] **ML-11** — Generative AI: GANs, diffusion, LLMs (← ML-7)
- [x] **ML-12** — Adversarial machine learning (← ML-6)
- [x] **ML-13** — ML for cybersecurity: detection models (← ML-4, ML-5)
- [x] **ML-14** — MLOps, deployment, and production (← ML-4, ML-6)
- [x] **ML-15** — AI/ML hands-on capstone projects (← ML-4, ML-5, ML-6, ML-13)

---
## Wave 15: API Foundations (3 parallel agents → serial chain)
*Sprints: API-2 through API-9 — dependency chain*

- [x] **API-2** — Authentication & Authorization (← API-1 done)
- [x] **API-3** — API Design & Documentation (← API-1 done)
- [x] **API-4** — Rate Limiting, Throttling & Caching (← API-2)
- [x] **API-5** — OWASP API Top 10 (← API-2)
- [x] **API-6** — Hands-On API Penetration Testing (← API-5)
- [x] **API-7** — Cloud APIs: AWS, Azure & GCP Patterns (← API-3)
- [x] **API-8** — Webhooks, WebSockets & Event-Driven (← API-1 done)
- [x] **API-9** — API Capstone: Build & Secure a Full API (← API-4, API-5, API-6)

---
## Wave 16: Messaging System (serial chain)
*Sprints: F-23 → F-23A/B/C/D/E/F — largest feature build*

- [x] **F-23** — Epic: design decisions (moderation policy, privacy, instructor visibility)
- [x] **F-23A** — Firestore data model & security rules (← F-23)
- [x] **F-23B** — Cloud Functions: send, purge, rate-limit (← F-23A)
- [x] **F-23C** — Client service: MessagingManager.js (← F-23B)
- [x] **F-23D** — Inbox & conversation UI (← F-23C)
- [x] **F-23E** — Dashboard integration: badge, preview panel (← F-23D)
- [x] **F-23F** — Moderation, reporting & handler controls (← F-23A)

---
## Wave 17: Social & Multiplayer (3 parallel agents)
*Sprints: F-21, F-25, F-26*

- [x] **F-21** — Public user profiles (view by UID, privacy controls, Firestore public doc)
- [x] **F-25** — 2-player mode for arcade games (split-screen, turn-based, ghost mode)
- [x] **F-26** — Hive multiplayer exploration (co-op, competitive, asymmetric Red Queen)

---
## Wave 18: Content & Branding (4 parallel agents)
*Sprints: M-10, M-11, BR-19, A-4*

- [x] **M-10** — Network-Essentials + Web house content gaps
- [x] **M-11** — Microsoft Security-101 course (Shield house onboarding track)
- [x] **BR-19** — Mascot Digital Life System (idle animations, reactions, cross-mascot encounters, seasonal, terrarium)
- [x] **A-4** — Tourist Visa: sorting quiz bypass for unsorted explorers

---
## Wave 19: Tooling & Analytics (4 parallel agents)
*Sprints: HD-8/9/10, NXS-1, SC-5, AR-5, DA-20, RS-2, ES-14*

- [x] **HD-8** — Engagement metrics: login frequency, session duration (← HD-7 done)
- [x] **HD-9** — Attendance/login tracking: pattern heatmaps (← HD-8)
- [x] **HD-10** — Student satisfaction pulse surveys (← HD-7 done)
- [x] **NXS-1** — Nexus hexcontent spoke adapter (bc1 content shuttle)
- [x] **SC-5** — Scraper content classifier & auto-tagger
- [x] **AR-5** — IDP drafting: Series B-H (140 boxes) — partial, continue
- [x] **DA-20** — Tennessee Security Labs extraction (Canvas .imscc → Prime modules)
- [x] **RS-2** — Repo Scout: GitHub API scraper (← RS-1 done)
- [x] **ES-14** — SEM-001 heading hierarchy fixes (overlaps QC-13, resolve remainder)

---
## Wave 20: Sprint Backlog Audit (1 agent)
*Full reconciliation of sprints.json against actual project state*

- [x] **Status drift**: Scan all 537 sprint items — verify statuses match reality (done items actually shipped? blocked items still blocked? dependencies still valid?)
- [x] **Stale items**: Flag items created before 2026-02-01 that haven't been touched — are they still relevant or should they be archived/closed?
- [x] **Missing work**: Review git log since last audit — identify shipped features/fixes not tracked by any sprint item. Create backlog entries for undocumented work.
- [x] **Dependency accuracy**: Verify all `depends` chains — are blockers actually blocking? Have dependencies been resolved but downstream items not unblocked?
- [x] **Marathon coverage**: Cross-reference marathon waves against sprint backlog — any sprint items not captured in a wave? Any waves referencing items that don't exist?
- [x] **Duplicate detection**: Identify overlapping sprint items (e.g., ES-14 vs QC-13 heading fixes) — consolidate or link
- [x] **Priority recalibration**: Review priority assignments — have circumstances changed? (e.g., items marked low that are now needed for grants, items marked critical that were addressed by other work)
- [x] **Series health**: Check each series (DO, F, DA, AR, PL, etc.) — any series with all items done that can be closed? Any series missing items for planned features?
- [x] **Blocked item triage**: For each blocked item — is the blocker real? Can it be unblocked? Should it be deferred or redesigned?
- [x] Generate audit report: `_planning/SPRINT_AUDIT_REPORT.md` with findings, actions taken, and recommendations

---

## Colosseum Multiplayer (separate repo — not numbered)
*Sprints: AR-23 through AR-28 — `~/ai-content/hexworth-colosseum/`*

- [ ] **AR-23** — Firebase SDK init & auth
- [ ] **AR-24** — Co-op sync engine (← AR-23)
- [ ] **AR-25** — Lobby host/join flow (← AR-24)
- [ ] **AR-26** — Board real-time sync (← AR-24)
- [ ] **AR-27** — Activity panel & player status (← AR-26)
- [ ] **AR-28** — Polish, edge cases & deploy (← AR-27)

---

## Neon Server (physical hardware — not numbered)
*Sprints: NE-1 through NE-10 — serial dependency chain, requires physical access*

- [ ] **NE-1** (CRITICAL) — Hardware inventory, drive assessment
- [ ] **NE-2** (CRITICAL) — OS installation and base system (← NE-1)
- [ ] **NE-3** (CRITICAL) — Storage pool setup and mount (← NE-2)
- [ ] **NE-4** — Database server installation (← NE-3)
- [ ] **NE-5** — Network configuration and remote access (← NE-2)
- [ ] **NE-6** — Docker and container runtime (← NE-2)
- [ ] **NE-7** — Backup strategy and DR (← NE-3, NE-4)
- [ ] **NE-8** — Monitoring, alerting, health checks (← NE-6)
- [ ] **NE-9** — Security hardening and access control (← NE-2, NE-5)
- [ ] **NE-10** — Dev environment integration (← NE-3, NE-4, NE-5)

---

## Scraper Completion (external — not numbered)
*Sprints: SC-4, SC-6, SC-7 — partial, requires bc1 access*

- [ ] **SC-4** (partial) — AI Certification full sweep
- [ ] **SC-6** (partial) — Security Certification content extraction
- [ ] **SC-7** — Azure & Cloud Certification content

---

## Job Search — Career Launchpad (future track — not numbered)
*Sprints: JS-1 through JS-10 — new feature track*

- [ ] **JS-1** — Design Career Launchpad hub page
- [ ] **JS-2** — Build job board scraper/aggregator (← JS-1)
- [ ] **JS-3** — Build job listings browser UI (← JS-2)
- [ ] **JS-4** — Map certifications to job requirements (← JS-2)
- [ ] **JS-5** — Career path explorer linking houses to careers (← JS-1)
- [ ] **JS-6** — Resume and cover letter builder (← JS-1)
- [ ] **JS-7** — Interview prep question bank (← JS-1)
- [ ] **JS-8** — Job alerts and saved searches (← JS-3)
- [ ] **JS-9** — Salary and market data dashboard (← JS-2)
- [ ] **JS-10** — Internship and apprenticeship finder (← JS-2)

---

## Grant Finder — Funding Hub (future track — not numbered)
*Sprints: GF-1 through GF-9 — new feature track*

- [ ] **GF-1** — Design Funding Hub page and grant categories
- [ ] **GF-2** — Build federal grant scraper (← GF-1)
- [ ] **GF-3** — Build private/industry funding scraper (← GF-1)
- [ ] **GF-4** — Build grant listings browser UI (← GF-2, GF-3)
- [ ] **GF-5** — Funding deadline calendar (← GF-4)
- [ ] **GF-6** — Application tracker and status board (← GF-4)
- [ ] **GF-7** — Proposal writing resources and templates (← GF-1)
- [ ] **GF-8** — Eligibility matcher based on institution profile (← GF-4)
- [ ] **GF-9** — Small business cyber grant specialization (← GF-3)

---
## Wave 21: TripWire Hardening — Close Hackerman Bypass Vectors (1 agent)
*TripWire has 6 known bypass vectors that hackerman is exploiting*

- [x] **Wrap `localStorage.removeItem()`** — already existed from prior session
- [x] **Wrap `localStorage.clear()`** — already existed from prior session
- [x] **Wrap direct property access** — NEW Proxy on localStorage with set/get/deleteProperty traps, console stack detection, graceful fallback
- [x] **Fix cross-tab bypass** — `_isSuspiciousCrossTabWrite` already existed from prior session
- [ ] **Add race condition defense** — inline `<head>` script (deferred — needs HTML template changes across all pages)
- [x] **Add dispatch box keys to PROTECTED_KEYS** — `hexworth_lab_` prefix already present
- [x] **Add `dispatch_desk_toys` to PROTECTED_KEYS** — already present
- [x] **Wrap `Object.defineProperty` on Storage.prototype** — NEW, intercepts attempts to redefine setItem/removeItem/clear
- [x] **Add Proxy on `window.localStorage` getter** — included in the Proxy implementation
- [x] **Added `hexworth_level`, `hexworth_modules`, `hexworth_labs`** to PROTECTED_KEYS
- [x] Run `npm run scan` — CRITICAL: 0, no new issues
- [x] Add new bypass categories to TripWireEffects.js effect messages (6 new visual effects + 6 audio + 11 category messages, v4.0.0)

---
## Wave 22: Explore-All Hub Addition — Cert/Track Houses (1 agent)
*Sprint: QC-18 — 15 cert/track houses missing explore-all content discovery*

The 9 main houses (forge, shield, web, cloud, code, script, eye, key, ai) have an "Explore All" tab via HouseRenderer + ContentDiscovery.js. The 15 cert/track houses use CertPathRenderer which lacks this feature:

- [x] Audit CertPathRenderer.js — understand tab system, identify injection point for explore-all tab
- [x] Add "Explore All" tab to CertPathRenderer (after existing tabs) that mirrors HouseRenderer's explore panel
- [x] Inject `<div id="discoveryAnchor"></div>` in the new tab panel for ContentDiscovery.js auto-init
- [x] ContentDiscovery.js + ContentCatalog.js lazy-loaded on first tab click — zero consumer page changes needed
- [x] Verify all 15 cert houses get the explore tab:
  - `aplus-core1`, `aplus-core2`, `aws-ccp`, `aws-developer`, `azure-fundamentals`
  - `casp-plus`, `ccna`, `comptia-linux`, `comptia-network`, `cryptography-track`
  - `cysa-plus`, `devops-fundamentals`, `security-operations`, `security-plus`, `security-plus-crypto`
- [x] Test: click Explore All tab → ContentDiscovery search works, can find modules from any house
- [ ] Run `npm run scan` to verify no new issues (deferred to batch scan)
- [x] Mark QC-18 done in sprints.json

---
## Wave 23: Signal Visual Testbed — SG-32 Prototype (2-3 parallel agents)
*Sprint: SIG-1 through SIG-5 — Visual enhancements prototyped on SG-32 (Build USB Drive)*

SG-32 becomes the testbed for rich visuals that will roll out to all 32 Signal guides. All visuals must be self-contained (no CDN, no build step), SVG preferred, CSS animations over JS.

- [ ] **SIG-1** — Inline SVG wiring/component diagrams replacing ASCII art (dark-theme, interactive hover for labels)
- [ ] **SIG-2** — Step-by-step photo strips / looping WebP animations (visual checkpoints per build step)
- [ ] **SIG-3** — Annotated component callouts (hover/tap for name, purpose, specs) + USB PCB teardown
- [ ] **SIG-4** — Visual diff: correct vs common mistakes (side-by-side, red highlights on errors)
- [ ] **SIG-5** — USB enumeration flow animation (host↔device communication sequence diagram)

**Commit message:** `feat: SIG-1 through SIG-5 — Signal visual testbed on SG-32 (SVGs, animations, callouts, diffs)`

---
## Wave 24: Signal Visual Template Extraction & Rollout (4-5 parallel agents)
*Sprint: SIG-6 through SIG-10 — Extract pattern from SG-32, apply to all guides*

- [ ] **SIG-6** — Extract proven visual pattern into reusable CSS/JS template for all guides
- [ ] **SIG-7** — Roll out to Foundations (SG-01 through SG-05)
- [ ] **SIG-8** — Roll out to Network Recon (SG-06 through SG-10)
- [ ] **SIG-9** — Roll out to Security Tools (SG-11 through SG-15)
- [ ] **SIG-10** — Roll out to remaining sections (Privacy SG-16-20, Firmware SG-21-25, Arcade SG-26-30, Field Prep SG-31)

**Commit message:** `feat: SIG-6 through SIG-10 — Signal visual template rollout to all 32 guides`

---
## Wave 25: Full WCAG 2.1 AA Accessibility Audit (3-4 parallel agents)
*Sprint: AC-5 through AC-10 — comprehensive ADA compliance pass*

Wave 4 (AC-1/AC-4) fixed color contrast and added ARIA to 7 core components. This wave audits the entire platform against the full WCAG 2.1 AA checklist.

- [ ] **AC-5** — Screen reader audit: all pages must be navigable with NVDA/JAWS/VoiceOver. Semantic HTML, heading hierarchy, landmark regions, live regions for dynamic content
- [ ] **AC-6** — Keyboard navigation: full tab order audit, focus trapping in modals/dialogs, skip-nav links, visible focus indicators on every interactive element, no keyboard traps
- [ ] **AC-7** — Image & media audit: alt text on all images, decorative images marked aria-hidden, video captions/transcripts where applicable, SVG accessibility
- [ ] **AC-8** — Form accessibility: all inputs have associated labels, error messages linked via aria-describedby, required fields marked, autocomplete attributes, validation announcements
- [ ] **AC-9** — Motion & cognitive: prefers-reduced-motion media queries on all animations/particles, prefers-contrast support, touch target minimum 44x44px, reading level review
- [ ] **AC-10** — Automated + manual testing: axe-core scan across all 700+ pages, generate remediation report, fix all critical/serious violations, document remaining known issues

**Commit message:** `feat: AC-5 through AC-10 — full WCAG 2.1 AA accessibility audit and remediation`

---
## Wave 26: Code Armory WASM Sandboxes — In-Browser Code Runners (3 parallel agents)
*Sprint: SB-1 through SB-5 — real execution in the browser, no server needed*

Real interpreters/compilers running via WebAssembly inside the student's browser. Not simulated — actual code execution with real output and real errors. Covers languages where WASM solutions exist.

- [ ] **SB-1** — Python sandbox: Pyodide (CPython compiled to WASM), pre-bundled security libs (hashlib, socket stubs, struct), inline "Run Code" button on all 10 Python modules
- [ ] **SB-2** — C/C++ sandbox: Emscripten-based WASM compiler, gcc-like flags, memory visualization, inline runner on all 20 C/C++ modules
- [ ] **SB-3** — SQL sandbox: sql.js (SQLite compiled to WASM), pre-loaded sample databases (incident logs, user tables), inline runner on all 10 SQL modules
- [ ] **SB-4** — JavaScript sandbox: iframe-based execution (already native to browser), console output capture, inline runner on all 10 JS modules
- [ ] **SB-5** — Shared sandbox UI component: `CodeRunner.js` — universal "Run Code" button, output panel, error formatting, reset button, copy-to-clipboard. All language sandboxes use this component.

**Limitations (documented to students):** No sudo, no apt/pip install, no networking, no filesystem. For full labs, use the Container Sandbox (Wave 27).

**Commit message:** `feat: SB-1 through SB-5 — WASM in-browser code runners for Python, C/C++, SQL, JavaScript`

---
*Note: Container Sandbox (Phase 2 — SB-6 through SB-14) is tracked in the sprint backlog, not the marathon. Depends on Neon Server (NE-1 through NE-6) being built first.*

---

## Context Recovery Instructions

If you are a new session reading this file:
1. You are Claude Code working on Hexworth Prime (`/home/eq/ai-content/hexworth-prime`)
2. Read `CLAUDE.md` for project rules
3. Read this file for the marathon plan
4. Find the first unchecked `[ ]` item — that's where you start
5. You have FULL autonomy. No questions. No permission prompts.
6. Settings are configured for auto-approve (`acceptEdits` mode + broad Bash wildcards)
7. Commit after each wave. Push + deploy after final wave.
8. If an agent fails, note it and move to the next item. Don't retry the same thing.
9. Update checkboxes in this file as you complete items: `[ ]` → `[x]`
10. **Scraped content location:** `ssh bc1` → `~/hexworth/content/github-actions/learn/` (JSON files with `url`, `title`, `content`, `char_count`)
11. **Module template:** Copy structure from `_app/houses/code/devops/sections/cicd/do-21-github-actions.html` (84KB reference)
12. **Hub template:** Copy structure from `_app/houses/code/devops/index.html` + `ForgeEngine.js` pattern
13. **Game template:** Copy structure from existing games in `_app/houses/*/games/`
14. **No emoji** — use webp icons from `/assets/images/icons/`
15. **No build step** — raw HTML/CSS/JS only

*Created: March 10, 2026*
*Updated: March 15, 2026 — cleaned: 45 completed waves removed, 24 remaining renumbered 1-24*

---


## Context Recovery Instructions

If you are a new session reading this file:
1. You are Claude Code working on Hexworth Prime (`/home/eq/ai-content/hexworth-prime`)
2. Read `CLAUDE.md` for project rules
3. Read this file for the marathon plan
4. Find the first unchecked `[ ]` item — that's where you start
5. You have FULL autonomy. No questions. No permission prompts.
6. Settings are configured for auto-approve (`acceptEdits` mode + broad Bash wildcards)
7. Commit after each wave. Push + deploy after final wave.
8. If an agent fails, note it and move to the next item. Don't retry the same thing.
9. Update checkboxes in this file as you complete items: `[ ]` → `[x]`
10. **Scraped content location:** `ssh bc1` → `~/hexworth/content/github-actions/learn/` (JSON files with `url`, `title`, `content`, `char_count`)
11. **Module template:** Copy structure from `_app/houses/code/devops/sections/cicd/do-21-github-actions.html` (84KB reference)
12. **Hub template:** Copy structure from `_app/houses/code/devops/index.html` + `ForgeEngine.js` pattern
13. **Game template:** Copy structure from existing games in `_app/houses/*/games/`
14. **No emoji** — use webp icons from `/assets/images/icons/`
15. **No build step** — raw HTML/CSS/JS only

*Created: March 10, 2026*
*Updated: March 15, 2026 — cleaned: 45 completed waves removed, 24 remaining renumbered 1-24*
