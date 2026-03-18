# Marathon Plan — March 2026

**Activation:** User says "marathon mode" → read this file → find the first unchecked wave → execute
**Permissions:** All file edits, bash commands, and agent launches pre-approved. Do NOT ask questions. Make best judgment on all design decisions.
**Autonomy:** Full. No AskUserQuestion. No confirmation prompts. Commit after each wave. Push + deploy after final wave.
**Recovery:** If context resets, read this file first. Resume from the first unchecked item.
**Parallel strategy:** 5-8 agents for different files. 2-3 max for shared files. Serialize ForgeData.js edits.
**Completed waves are removed.** Sprint Master tracks historical completion.
**Previously completed:** Waves 1-22 (archived) — Secret Protection, Learning Paths, Accessibility, Code Armory, Backbone, Algorithm Chamber, Cortex AI/ML, API Foundations, Messaging, Social/Multiplayer, Content/Branding, Tooling/Analytics, Sprint Audit, TripWire Hardening, Explore-All Hub Addition.

---

## Wave 1: Signal Visual Testbed — SG-32 Prototype (2-3 parallel agents)
*Sprint: SIG-1 through SIG-5 — Visual enhancements prototyped on SG-32 (Build USB Drive)*

SG-32 becomes the testbed for rich visuals that will roll out to all 32 Signal guides. All visuals must be self-contained (no CDN, no build step), SVG preferred, CSS animations over JS.

- [x] **SIG-1** — Inline SVG wiring/component diagrams replacing ASCII art (dark-theme, interactive hover for labels)
- [x] **SIG-2** — Step-by-step photo strips / looping WebP animations (visual checkpoints per build step)
- [x] **SIG-3** — Annotated component callouts (hover/tap for name, purpose, specs) + USB PCB teardown
- [x] **SIG-4** — Visual diff: correct vs common mistakes (side-by-side, red highlights on errors)
- [x] **SIG-5** — USB enumeration flow animation (host↔device communication sequence diagram)

**Commit message:** `feat: SIG-1 through SIG-5 — Signal visual testbed on SG-32 (SVGs, animations, callouts, diffs)`

---

## Wave 2: Signal Visual Template Extraction & Rollout (4-5 parallel agents)
*Sprint: SIG-6 through SIG-10 — Extract pattern from SG-32, apply to all guides*

- [x] **SIG-6** — Extract proven visual pattern into reusable CSS/JS template for all guides
- [x] **SIG-7** — Roll out to Foundations (SG-01 through SG-05)
- [x] **SIG-8** — Roll out to Network Recon (SG-06 through SG-10)
- [x] **SIG-9** — Roll out to Security Tools (SG-11 through SG-15)
- [x] **SIG-10** — Roll out to remaining sections (Privacy SG-16-20, Firmware SG-21-25, Arcade SG-26-30, Field Prep SG-31)

**Commit message:** `feat: SIG-6 through SIG-10 — Signal visual template rollout to all 32 guides`

---

## Wave 3: Full WCAG 2.1 AA Accessibility Audit (3-4 parallel agents)
*Sprint: AC-5 through AC-10 — comprehensive ADA compliance pass*

- [x] **AC-5** — Screen reader audit: all pages must be navigable with NVDA/JAWS/VoiceOver. Semantic HTML, heading hierarchy, landmark regions, live regions for dynamic content
- [x] **AC-6** — Keyboard navigation: full tab order audit, focus trapping in modals/dialogs, skip-nav links, visible focus indicators on every interactive element, no keyboard traps
- [x] **AC-7** — Image & media audit: alt text on all images, decorative images marked aria-hidden, video captions/transcripts where applicable, SVG accessibility
- [x] **AC-8** — Form accessibility: all inputs have associated labels, error messages linked via aria-describedby, required fields marked, autocomplete attributes, validation announcements
- [x] **AC-9** — Motion & cognitive: prefers-reduced-motion media queries on all animations/particles, prefers-contrast support, touch target minimum 44x44px, reading level review
- [x] **AC-10** — Automated + manual testing: axe-core scan across all 700+ pages, generate remediation report, fix all critical/serious violations, document remaining known issues

**Commit message:** `feat: AC-5 through AC-10 — full WCAG 2.1 AA accessibility audit and remediation`

---

## Wave 4: Code Armory WASM Sandboxes — In-Browser Code Runners (3 parallel agents)
*Sprint: SB-1 through SB-5 — real execution in the browser, no server needed*

Real interpreters/compilers running via WebAssembly inside the student's browser. Not simulated — actual code execution with real output and real errors. Covers languages where WASM solutions exist.

- [x] **SB-1** — Python sandbox: Pyodide (CPython compiled to WASM), pre-bundled security libs (hashlib, socket stubs, struct), inline "Run Code" button on all 10 Python modules
- [x] **SB-2** — C/C++ sandbox: Emscripten-based WASM compiler, gcc-like flags, memory visualization, inline runner on all 20 C/C++ modules (Phase 2 — shows info message pointing to Container Sandbox)
- [x] **SB-3** — SQL sandbox: sql.js (SQLite compiled to WASM), pre-loaded sample databases (incident logs, user tables), inline runner on all 10 SQL modules
- [x] **SB-4** — JavaScript sandbox: iframe-based execution (already native to browser), console output capture, inline runner on all 10 JS modules
- [x] **SB-5** — Shared sandbox UI component: `CodeRunner.js` — universal "Run Code" button, output panel, error formatting, reset button, copy-to-clipboard. All language sandboxes use this component.

**Limitations (documented to students):** No sudo, no apt/pip install, no networking, no filesystem. For full labs, use the Container Sandbox (Wave 27).

**Commit message:** `feat: SB-1 through SB-5 — WASM in-browser code runners for Python, C/C++, SQL, JavaScript`

---
*Note: Container Sandbox (Phase 2 — SB-6 through SB-14) is tracked in the sprint backlog, not the marathon. Depends on Neon Server (NE-1 through NE-6) being built first.*

---

## Wave 5: Digital Forensics Hub — Infrastructure (2 parallel agents)
*Sprints: DF-1, DF-2 — hub landing page + dashboard integration*

Top-level forensics hub at `/forensics/index.html`, same tier as Operator/Signal/Dispatch. Owned by House of the Eye. 6 learning tracks, 60 total modules (17 existing integrated + 43 new).

- [x] **DF-1** — Hub landing page: `forensics/index.html` + `ForensicsEngine.js` (config-driven track renderer). Eye house branding, hero section with stats, 6 track cards with icons/descriptions/completion%, responsive grid. Back-link to dashboard. Accent color palette (evidence blue/UV purple).
- [x] **DF-2** — Dashboard Explore All card (both hardcoded HTML grid and JS-generated section in dashboard.html). Cross-link from Eye house index page. Register forensics hub in ContentCatalog.

**Commit message:** `feat: DF-1, DF-2 — Digital Forensics Hub infrastructure + dashboard integration`

---

## Wave 6: Digital Forensics Hub — Tracks 1-3 (3 parallel agents, 30 modules)
*Sprints: DF-3, DF-4, DF-5 — Evidence Foundations, Disk Forensics, Memory Forensics*

Each track = 10 modules. Mix of conceptual depth, tool walkthroughs, and hands-on simulation labs. Every track ends with a capstone investigation lab. Integrates 9 existing modules across Eye/Shield/Script houses.

- [x] **DF-3** — Track 1: Evidence Foundations & Legal Framework (10 modules)
  - Evidence types (real/demonstrative/documentary/testimonial)
  - Chain of custody procedures & documentation
  - NIST SP 800-86 framework walkthrough
  - RFC 3227 order of volatility
  - CFAA & federal computer crime laws
  - ECPA/wiretap/stored communications laws
  - Fourth Amendment search & seizure in digital context
  - Expert witness testimony & courtroom procedures
  - Ethics in digital forensics (IACIS/ISFCE codes of ethics)
  - Evidence preservation & documentation capstone lab

- [x] **DF-4** — Track 2: Disk & File System Forensics (10 modules)
  - File system internals — NTFS/ext4/FAT32/APFS/HFS+
  - Disk imaging — dd/dcfldd/FTK Imager/Guymager
  - Autopsy walkthrough — full case creation & analysis
  - File carving & recovery — PhotoRec/Scalpel/foremost
  - Metadata extraction — ExifTool/FOCA deep-dive
  - Deleted file recovery simulation lab
  - MFT analysis & inode examination
  - Slack space/unallocated space/hidden data detection
  - Write blockers & forensic integrity — hash verification (MD5/SHA-256)
  - Disk forensics capstone investigation lab

- [x] **DF-5** — Track 3: Memory Forensics (10 modules)
  - Volatile vs non-volatile evidence & acquisition order
  - Memory acquisition tools — FTK Imager/WinPmem/LiME/DumpIt
  - Volatility framework setup & profile selection
  - Process analysis — pslist/pstree/psscan
  - DLL injection & code injection detection
  - Malware artifact recovery from RAM
  - Registry hive extraction from memory dumps
  - Network connections from memory — netscan/connscan
  - Memory forensics workflow simulation lab
  - Memory analysis capstone — full investigation lab

**Commit message:** `feat: DF-3, DF-4, DF-5 — Forensics Hub Tracks 1-3 (30 modules: evidence/legal, disk, memory)`

---

## Wave 7: Digital Forensics Hub — Tracks 4-6 (3 parallel agents, 30 modules)
*Sprints: DF-6, DF-7, DF-8 — Network Forensics, Log/Timeline, Advanced Topics*

- [x] **DF-6** — Track 4: Network Forensics (10 modules)
  - Packet capture fundamentals — tcpdump/Wireshark/tshark
  - Wireshark deep-dive — filters/coloring rules/protocol dissection
  - TCP stream reconstruction & session analysis
  - DNS exfiltration detection lab
  - Encrypted traffic analysis — TLS/SSL behavioral indicators
  - NetFlow/IPFIX/sFlow analysis
  - PCAP evidence extraction — files/credentials/IoCs
  - IDS/IPS log correlation — Snort/Suricata rule forensics
  - Wireless forensics — 802.11 capture/rogue AP detection
  - Network forensics capstone investigation lab

- [x] **DF-7** — Track 5: Log & Timeline Analysis (10 modules)
  - Windows Event Log architecture — Security/System/Application/Sysmon
  - Linux syslog/journald/auth.log analysis
  - Log correlation techniques — cross-source evidence linking
  - Super Timeline — log2timeline/plaso setup & usage
  - Timeline construction simulation lab
  - SIEM integration — Splunk/ELK query patterns for forensics
  - Browser forensics — history/cache/cookies/downloads/IndexedDB
  - Email header analysis — SMTP trace/SPF/DKIM/ARC
  - Windows Registry forensics — SAM/SYSTEM/SOFTWARE/NTUSER.DAT
  - Timeline capstone — reconstruct full attack timeline lab

- [x] **DF-8** — Track 6: Advanced & Specialized Forensics (10 modules)
  - Anti-forensics techniques & detection — timestomping/log clearing/encryption
  - Cloud forensics — AWS CloudTrail/Azure Activity Logs/GCP audit
  - Mobile forensics intro — iOS/Android acquisition & artifacts
  - IoT & embedded device forensics
  - Malware forensics — static/dynamic analysis integration
  - Steganography detection — stegdetect/zsteg/binwalk
  - Incident response integration — NIST 800-61R2 lifecycle
  - Forensic tool validation — Daubert standard/ISO 17025
  - Live forensics vs dead-box analysis — when and how
  - Advanced capstone — full multi-source investigation lab

**Commit message:** `feat: DF-6, DF-7, DF-8 — Forensics Hub Tracks 4-6 (30 modules: network, logs/timeline, advanced)`

---

## Wave 8: Digital Forensics Hub — Catalog, Certs & Imagery (3 parallel agents)
*Sprints: DF-9, DF-10, DF-11 — ContentCatalog registration + certification mapping + AI-generated visuals*

- [x] **DF-9** — Register all 60 forensics modules in ContentCatalog.js. Add forensics search tags. Cross-link 17 existing modules from Eye/Shield/Script/Dark Arts into hub tracks. Ensure global search discovery.
- [x] **DF-10** — Map all 60 modules to certification objectives: CompTIA CySA+ (CS0-003) Domain 4, Security+ forensics objectives, EC-Council CHFI domains, GIAC GCFE/GCFA objectives. Integrate existing CySA+ Ch13 presentation/lab into hub. Add cert alignment badges to module cards.
- [ ] **DF-11** — Generate AI imagery via fal/Nano Banana: hub hero banner, 6 track header images, module thumbnails for key concepts (evidence collection, disk imaging, memory dumps, packet capture, timeline analysis, anti-forensics), forensic lab environment visuals, tool icons, capstone scene art. All saved as webp to /assets/images/.

**Commit message:** `feat: DF-9, DF-10, DF-11 — Forensics Hub catalog, cert alignment + AI-generated imagery`

---

## Wave 9: Content Architecture — Full Platform Audit (2 serial agents)
*Sprints: CA-1, CA-2 — automated crawl + orphan/ghost detection*

The foundation for the entire content architecture project. Every file in _app/ gets cataloged, cross-referenced against ContentCatalog.js and hub index pages. Orphans (unlinked content), ghosts (broken links), and overlaps identified.

- [x] **CA-1** — Full platform crawl: scan entire _app/ tree for every .html, .applet.html, .lab.html, .module.html, .presentation.html, .mission.html, .tool.html. Record path, title, type, house/hub assignment, catalog status, linked-from references. Output: _tools/reports/CONTENT_AUDIT.json
- [x] **CA-2** — Cross-reference audit against ContentCatalog.js, hub indexes, house indexes. Identify orphans, ghosts, duplicates, overlaps. Output: _tools/reports/CONTENT_ORPHANS.json + CONTENT_GHOSTS.json

**Commit message:** `feat: CA-1, CA-2 — full platform content audit + orphan/ghost detection`

---

## Wave 10: Content Architecture — Hub Registry & Master Content Map (2 serial agents)
*Sprints: CA-3, CA-4 — define hub scopes + map every module to a hub*

The strategic work. Define what every hub owns, then assign every module to exactly one primary hub. This becomes the single source of truth.

- [x] **CA-3** — Canonical hub registry: every hub (8 houses + all standalone hubs + cert tracks) gets a formal scope definition. What belongs, what doesn't. Output: _app/docs/HUB_REGISTRY.md
- [x] **CA-4** — Master content map: every module assigned to one primary hub. Cross-link table for secondary appearances. Module counts per hub. Coverage heat map by domain. Output: _app/docs/CONTENT_MAP.md

**Commit message:** `feat: CA-3, CA-4 — canonical hub registry + master content map`

---

## Wave 11: Content Architecture — Gap Analysis & Reconciliation (4 parallel agents)
*Sprints: CA-5, CA-6, CA-7, CA-8 — gaps, orphan fixes, ghost cleanup, catalog sync*

Fix everything the audit found. Assign orphans to hubs, fix dead links, reconcile the catalog, and document what's missing.

- [x] **CA-5** — Gap analysis: cross-reference content map against CompTIA/NICE/NIST objectives. Identify missing topics, thin hubs, uncovered cert objectives. Output: _app/docs/GAP_ANALYSIS.md
- [x] **CA-6** — Orphan reconciliation: assign every orphaned module to its correct hub per the content map. Update index pages, move files if needed, fix breadcrumbs. Goal: zero orphans.
- [x] **CA-7** — Ghost & dead link cleanup: fix or remove every broken reference. Update moved links, remove deleted references, create placeholder sprints for content that should exist but doesn't.
- [x] **CA-8** — ContentCatalog.js full reconciliation: mirror the content map exactly. Every module has an entry, every entry points to a real file. Validate with EduScan CAT-001/002/003.

**Commit message:** `feat: CA-5 through CA-8 — gap analysis, orphan/ghost fixes, catalog reconciliation`

---

## Wave 12: Content Architecture — Hub Indexes, Dashboard & Final Docs (3 parallel agents)
*Sprints: CA-9, CA-10, CA-11 — hub page audit, Explore All completeness, documentation package*

Polish pass. Every hub index links all its content, every hub appears in Explore All, and the full documentation package is finalized as the authoritative reference for all future development.

- [x] **CA-9** — Hub index page audit: every hub links ALL modules it owns, organized into tracks/categories, shows module counts and completion tracking, consistent navigation and design.
- [x] **CA-10** — Dashboard Explore All completeness: every hub in the registry has a card (both hardcoded HTML + JS-generated). Correct icons, names, descriptions, links. Remove stale cards.
- [x] **CA-11** — Final documentation package: HUB_REGISTRY.md, CONTENT_MAP.md, GAP_ANALYSIS.md, ARCHITECTURE_OVERVIEW.md (platform architecture diagram, content flow, hub relationships, house ownership model). These become the authoritative reference for all future content development.

**Commit message:** `feat: CA-9, CA-10, CA-11 — hub index audit, Explore All completeness, architecture docs`

---

## Wave 13: Mascot Digital Life System (1 agent)
*Sprint: BR-19 — ambient mascot behaviors, reactions, and encounters*

Bring house mascots to life across the platform. Progressive enhancement only — no impact on core learning. All animations respect prefers-reduced-motion.

- [x] **BR-19** — Mascot Digital Life System:
  - Idle animations (10s inactivity triggers): Weaver spins webs, Nyx preens, Bastion yawns, Glyph chases tail, Ember flickers, Vigil rotates head
  - Reaction triggers: celebration on module complete, encouragement on quiz fail, achievement presentation
  - Cross-mascot encounters: rare events when visiting another house (home mascot + host mascot interaction)
  - Seasonal behaviors: Halloween (Nyx ravens), exam season (Vigil glow), holidays
  - Mascot whispers: tooltip lore fragments on hover
  - Divergent special: Flux morphs between forms, settles on highest-progress house
  - Matrix special: Ghost glitches through UI on non-Matrix pages (easter egg)
  - Digital terrarium: profile page widget — mascot in animated habitat
  - Implementation: CSS animations (idle), canvas overlays (reactions), IntersectionObserver gated, prefers-reduced-motion respected

**Commit message:** `feat: BR-19 — Mascot Digital Life System (idle animations, reactions, encounters, seasonal, terrarium)`

---

## Wave 14: Scraper Fix + AI House Content (2 serial → 6 parallel agents)
*Sprints: SC-4 (fix), AI-13, AI-14, AI-15, AI-16, AI-17, AI-18 — scraper config repair then full AI content build*

**Phase A (serial, 1 agent — must complete first):**
- [ ] **SC-4** — Fix mslearn scraper config on bc1:
  - Add AI-102 (Azure AI Engineer) learning paths to `~/hexworth/scrapers/mslearn/paths.json`
  - Expand AI-900 from 1 path to all ~6 official learning paths
  - Add AI-050 (Develop Generative AI Solutions) if learning paths available
  - Run `python3 scrape.py ai-900 ai-102` manually to pull content immediately
  - Verify content lands in `~/hexworth/content/mslearn/ai-102/`
  - Mark SC-4 done

**Phase B (6 parallel agents — after SC-4 completes):**
- [x] **AI-13** — AI House: Agent Architecture Content Hub (LangChain, CrewAI, AutoGen, agent patterns, tool use, RAG architectures). Build from scraped content + public docs.
- [x] **AI-14** — AI House: CLI & Developer Tools Content Hub (Azure CLI AI extensions, OpenAI CLI, Ollama, LM Studio, prompt engineering tools). Build from scraped content + public docs.
- [x] **AI-15** — AI House: N8N & Automation Content Hub (n8n workflows, Zapier alternatives, AI-powered automation, webhook integrations). Build from scraped content + public docs.
- [x] **AI-16** — AI House: Advanced AI Features Content Hub (fine-tuning, embeddings, vector databases, prompt engineering, AI safety). Build from scraped content + public docs.
- [x] **AI-17** — AI House: AI-102 Azure AI Engineer Certification Track. Full cert track using scraped mslearn AI-102 modules. Map to exam objectives.
- [x] **AI-18** — AI House: Azure OpenAI Service Content Hub (GPT deployment, embeddings API, content filtering, responsible AI). Build from scraped content + public docs.

**Commit message:** `feat: SC-4, AI-13 through AI-18 — scraper fix + full AI House content hubs`

---

## Wave 15: House AI Chatbots — Design & Deployment (2 serial → 5 parallel agents)
*Sprints: F-53, F-54 through F-65 — Aminos bot design packages + embed integration*

Platform: Aminos AI (https://app.aminos.ai). Each bot is created on Aminos, trained on house-specific URLs, styled to house theme, then embedded via script tag. Persistent floating "Need Help?" button on all house content pages (labs, modules, applets). Auto-routes to correct house bot based on page location.

**Phase A (serial, 1 agent — must complete first):**
- [x] **F-53** — Aminos integration spike: embed method, URL training verification, domain whitelisting, theme customization, anti-jailbreak prompt template. Create bot folder structure with per-bot spec files (personality, training URLs, icon, system prompt, embed config).

**Phase B (5 parallel agents — after F-53 completes):**
- [ ] **F-54** — Script House bot (Linux Tutor). Also serves: Arctic, Operator hub.
- [ ] **F-55** — Cloud House bot (Cloud Architect).
- [ ] **F-56** — Dark Arts bot (Cyber Hacker). Also serves: Arena/CTF. Anti-jailbreak hardened — must NOT reveal flags or solutions.
- [ ] **F-57** — Signal House bot (Hardware Tinkerer).
- [ ] **F-58** — Forge House bot (SysAdmin Engineer). Also serves: Dispatch hub.
- [ ] **F-59** — Code House bot (Code Debugger). Also serves: Code Armory, Algorithm Chamber.
- [ ] **F-60** — Shield House bot (Defense Analyst).
- [ ] **F-61** — Eye House bot (Threat Analyst). Also serves: Forensics Hub.
- [ ] **F-62** — Web House bot (Network Engineer). Also serves: Backbone hub.
- [ ] **F-63** — Key House bot (Cryptographer).
- [ ] **F-64** — AI House bot (ML Engineer). Also serves: Cortex hub.
- [ ] **F-65** — Matrix House bot (Cross-Domain Strategist). Also serves: Hive.

**Bot routing map:**
| Page Location | Bot |
|--------------|-----|
| House pages | That house's bot |
| Arctic / Operator | Script bot |
| Dispatch | Forge bot |
| Arena / CTF | Dark Arts bot |
| Forensics Hub | Eye bot |
| Signal | Signal bot |
| Code Armory / Algorithm Chamber | Code bot |
| Backbone | Web bot |
| Cortex / AI hubs | AI bot |
| Hive | Matrix bot |
| Dashboard / Projects / Funding | General Hexworth Assistant (existing) |

**Commit message:** `feat: F-53 through F-65 — 11 house AI chatbots (Aminos) + contextual routing + embed integration`

---

## Wave 16: 2-Player Mode for Arcade Games (1 agent)
*Sprint: F-25 — local multiplayer for existing arcade games*

Add 2-player options to arcade games. MVP: split-screen local (WASD + arrows) or turn-based score comparison. No backend changes required for MVP.

- [x] **F-25** — 2-Player Mode for Arcade Games:
  - Mode select on start screen (1P / 2P)
  - Split-screen local: two players, same device, split keyboard controls (WASD + arrows)
  - Turn-based: players alternate rounds, compare scores
  - Ghost mode: play against a recorded run from another player
  - Target games: Cloud Hop (competitive platforming), SQL Injection Defense (competitive scoring), Don't series (turn-based comparison)
  - Dual score display, player indicators, winner announcement
  - GameTracker integration for 2P stats
  - Achievements for multiplayer wins

**Commit message:** `feat: F-25 — 2-Player Mode for Arcade Games (split-screen, turn-based, ghost mode)`

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

## Scraper Completion & Redesign (external — not numbered)
*Sprints: SC-6, SC-7, SC-8 — partial, requires bc1 access*

- [ ] **SC-8** — Forge Redesign for Resistant Targets:
  - 5 targets failing in scraper-forge (Gemini auto-healer can't discover pages): owasp, cisa-alerts, python-docs, aws-docs, azure-docs
  - Diagnose root causes: anti-scraping protections, dynamic rendering, API gating, missing sitemaps
  - Evaluate alternatives per target: official APIs (OWASP wiki API, CISA KEV JSON feed, Python docs inventory), headless browser (Playwright), sitemap parsing, manual URL seeding
  - Redesign forge template to handle edge cases
  - Update `targets.json` with working configs
  - Test and validate all 5 targets produce usable content
- [ ] **SC-6** (partial) — Security Certification content extraction
- [ ] **SC-7** — Azure & Cloud Certification content

---

## Job Search — Career Launchpad (future track — not numbered)
*Sprints: JS-1 through JS-10 — new feature track*

- [x] **JS-1** — Design Career Launchpad hub page
- [ ] **JS-2** — Build job board scraper/aggregator (← JS-1)
- [ ] **JS-3** — Build job listings browser UI (← JS-2)
- [ ] **JS-4** — Map certifications to job requirements (← JS-2)
- [x] **JS-5** — Career path explorer linking houses to careers (← JS-1)
- [x] **JS-6** — Resume and cover letter builder (← JS-1)
- [x] **JS-7** — Interview prep question bank (← JS-1)
- [ ] **JS-8** — Job alerts and saved searches (← JS-3)
- [ ] **JS-9** — Salary and market data dashboard (← JS-2)
- [ ] **JS-10** — Internship and apprenticeship finder (← JS-2)

---

## Grant Finder — Funding Hub (future track — not numbered)
*Sprints: GF-1 through GF-9 — new feature track*

- [x] **GF-1** — Design Funding Hub page and grant categories
- [ ] **GF-2** — Build federal grant scraper (← GF-1)
- [ ] **GF-3** — Build private/industry funding scraper (← GF-1)
- [ ] **GF-4** — Build grant listings browser UI (← GF-2, GF-3)
- [ ] **GF-5** — Funding deadline calendar (← GF-4)
- [ ] **GF-6** — Application tracker and status board (← GF-4)
- [x] **GF-7** — Proposal writing resources and templates (← GF-1)
- [ ] **GF-8** — Eligibility matcher based on institution profile (← GF-4)
- [ ] **GF-9** — Small business cyber grant specialization (← GF-3)

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
*Updated: March 18, 2026 — archived 22 completed waves, renumbered 15 remaining + unnumbered tracks*
