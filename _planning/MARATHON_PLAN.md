# Marathon Plan — March 2026

**Activation:** User says "marathon mode" → read this file → find the first unchecked wave → execute
**Permissions:** All file edits, bash commands, and agent launches pre-approved. Do NOT ask questions. Make best judgment on all design decisions.
**Autonomy:** Full. No AskUserQuestion. No confirmation prompts. Commit after each wave. Push + deploy after final wave.
**Recovery:** If context resets, read this file first. Resume from the first unchecked item.
**Parallel strategy:** 5-8 agents for different files. 2-3 max for shared files. Serialize ForgeData.js edits.

---

## Wave 1: GitHub Actions Presentations — Core Concepts (5 Parallel Agents)
*Each agent creates one new presentation HTML in `_app/houses/code/devops/sections/cicd/`*
*Pattern: Copy style/structure from `do-21-github-actions.html` (84KB reference module)*
*Source: Scraped content at `bc1:~/hexworth/content/github-actions/learn/`*

- [x] **do-100** — Workflow Fundamentals: Triggers, Jobs & Steps
  - Sources: `Workflows`, `Understanding GitHub Actions`, `Quickstart`, `Triggering a workflow` (34K chars), `Using jobs in a workflow`, `Events that trigger workflows` (78K chars)
  - Cover: YAML structure, event triggers (push/PR/schedule/manual), jobs & steps, runners, status checks
  - Include: Visual workflow anatomy diagram, live YAML examples, trigger comparison table

- [x] **do-101** — Workflow Syntax Mastery: The YAML Deep Dive
  - Sources: `Workflow syntax for GitHub Actions` (160K chars), `Evaluate expressions`, `Workflow commands` (48K chars)
  - Cover: Complete syntax reference, `on:`, `jobs:`, `steps:`, `if:` conditionals, expressions `${{ }}`, functions, workflow commands
  - Include: Syntax cheat sheet cards, expression playground examples, common patterns grid

- [x] **do-102** — Variables, Secrets & Contexts
  - Sources: `Using secrets in GitHub Actions` (23K), `Store information in variables` (20K), `Contexts reference` (61K), `GITHUB_TOKEN` (3K)
  - Cover: Environment variables, secrets management, contexts (github/env/job/steps/runner/matrix), GITHUB_TOKEN, OIDC tokens
  - Include: Context hierarchy diagram, secrets best practices callouts, variable scope comparison table

- [x] **do-103** — Custom Actions: Build Your Own Automation
  - Sources: `Creating a JavaScript action` (20K), `Creating a Docker container action` (18K), `Creating a composite action` (19K), `Metadata syntax reference` (29K), `Publishing actions in GitHub Marketplace` (9K)
  - Cover: Action types (JS/Docker/composite), action.yml metadata, inputs/outputs, publishing to Marketplace, versioning
  - Include: Side-by-side comparison of action types, step-by-step creation walkthrough, marketplace publishing checklist

- [x] **do-104** — Runners: Hosted, Self-Hosted & ARC
  - Sources: `GitHub-hosted runners` (8K), `Adding self-hosted runners` (13K), `Actions Runner Controller` (19K), `Self-hosted runners reference` (19K), `Deploying runner scale sets with ARC` (58K), `Monitoring and troubleshooting self-hosted runners` (19K)
  - Cover: GitHub-hosted vs self-hosted, runner labels, runner groups, ARC on Kubernetes, custom images, proxy config, monitoring
  - Include: Decision matrix (when to use which), ARC architecture diagram, runner troubleshooting flowchart

**Commit message:** `feat: DO-100 through DO-104 — GitHub Actions presentations (fundamentals, syntax, secrets, custom actions, runners)`

---

## Wave 2: GitHub Actions Presentations — Advanced Topics (5 Parallel Agents)
*Same pattern as Wave 1*

- [x] **do-105** — Security Hardening & OIDC
  - Sources: `Compromised runners` (12K), `Script injections` (4K), `OpenID Connect` (8K), `Secure use reference` (39K), `Artifact attestations` (5K), all OIDC provider configs (AWS/Azure/GCP/Vault — ~60K total)
  - Cover: Threat model for CI/CD, script injection prevention, OIDC federation (no long-lived secrets), artifact attestations/SLSA, least-privilege workflows
  - Include: Vulnerable vs hardened workflow comparison, OIDC flow diagram, security checklist

- [x] **do-106** — Deployment Pipelines: Environments & Strategies
  - Sources: `Deploying with GitHub Actions` (13K), `Managing environments for deployment` (14K), `Configuring custom deployment protection rules` (6K), all "Deploying to X" pages (AWS ECS, AKS, GKE, Azure App Service — ~100K total)
  - Cover: Environments, protection rules, required reviewers, deployment branches, cloud provider deployments, rollback strategies
  - Include: Environment pipeline flow diagram, provider deployment comparison grid, protection rules config examples

- [x] **do-107** — Advanced Patterns: Matrix, Caching & Reusable Workflows
  - Sources: `Running variations of jobs in a workflow` (12K), `Dependency caching reference` (21K), `Reuse workflows` (21K), `Control the concurrency of workflows and jobs` (9K), `Reusing workflow configurations` (9K)
  - Cover: Matrix strategies, dependency caching (npm/pip/gradle), reusable workflows with inputs/outputs/secrets, concurrency groups, workflow_call
  - Include: Matrix strategy examples, cache hit/miss flow diagram, reusable workflow architecture

- [x] **do-108** — Building & Testing: Language Pipelines
  - Sources: All "Building and testing X" pages — Go (11K), Java/Gradle (11K), Java/Maven (9K), .NET (10K), Node.js (16K), Python (26K), Ruby (16K), Rust (10K), Swift (8K), PowerShell (11K)
  - Cover: CI pipeline per language, test frameworks, coverage, linting, build artifacts, multi-version testing
  - Include: Language pipeline comparison grid, starter workflow for each language, common pitfalls per ecosystem

- [x] **do-109** — Publishing & Artifact Management
  - Sources: `Publishing Docker images` (27K), `Publishing Node.js packages` (13K), `Publishing Java packages with Maven` (19K), `Publishing Java packages with Gradle` (21K), `Store and share data with workflow artifacts` (12K)
  - Cover: Container registry publishing (GHCR, DockerHub, ECR), npm/Maven/NuGet publishing, artifact upload/download, retention policies
  - Include: Multi-registry publish workflow, artifact lifecycle diagram, versioning strategy comparison

**Commit message:** `feat: DO-105 through DO-109 — GitHub Actions presentations (security, deployment, advanced, languages, publishing)`

---

## Wave 3: Interactive Labs & Simulations (3-4 Parallel Agents)
*These are standalone HTML files — no shared dependencies*
*Follow existing lab patterns (see `do-22-cicd-lab.html`, `do-16-git-lab.html`)*

- [x] **do-110** — Workflow Builder Sandbox
  - Interactive YAML editor with live validation
  - Drag-and-drop: pick triggers (push, PR, schedule, manual) → add jobs → add steps (checkout, setup-node, run, uses)
  - Live YAML preview panel updates as user builds
  - Syntax highlighting, error detection with inline hints
  - Template library: "Node.js CI", "Docker Build & Push", "Deploy to Production"
  - Challenge mode: "Build a workflow that..." prompts with validation
  - Completion tracking via ModuleProgress

- [x] **do-111** — Pipeline Debugger Simulation
  - Simulated GitHub Actions run log viewer
  - Pre-built scenarios with intentional failures:
    - Scenario 1: Missing secret (auth failure in deploy step)
    - Scenario 2: Cache miss causing slow builds
    - Scenario 3: Matrix job failure on specific OS/version combo
    - Scenario 4: Concurrency conflict — workflow canceled by newer push
    - Scenario 5: Self-hosted runner offline
  - Student inspects logs, identifies root cause, selects fix from options
  - Progressive difficulty: simple → complex multi-job failures
  - Scoring: time to diagnose, correct fix on first attempt

- [x] **do-112** — CI/CD Pipeline Lab: Build, Test, Deploy
  - Full pipeline construction walkthrough (guided lab format)
  - Phase 1: Create workflow file, add checkout + setup steps
  - Phase 2: Add linting (ESLint), unit tests (Jest), coverage reporting
  - Phase 3: Add build step, artifact upload
  - Phase 4: Add deployment job with environment protection
  - Phase 5: Add notification step (Slack/Discord webhook)
  - Each phase has a simulated terminal showing the workflow run
  - Real YAML validation at each step

- [x] **do-113** — Actions Security Audit Simulation
  - Given a repository with 3-5 workflow files containing vulnerabilities:
    - Untrusted input in `run:` (script injection)
    - Over-permissive `permissions:`
    - Pinned to branch instead of SHA (`uses: action@main`)
    - Secrets exposed in logs
    - Missing `if:` guard on fork PRs
  - Student scans workflows, flags issues, applies fixes
  - Scoring based on vulnerabilities found vs total
  - "Attacker mode" bonus round: exploit the vulnerable workflow
  - Security report generation at end

**Commit message:** `feat: DO-110 through DO-113 — GitHub Actions labs (workflow builder, debugger, pipeline lab, security audit)`

---

## Wave 4: ForgeData.js Update & Section Registration (SINGLE AGENT — Shared File)
*Must run AFTER Waves 1-3 complete to register all new modules*

- [x] **Expand cicd section in ForgeData.js** — Add all new modules (do-100 through do-113) to the cicd section's modules array. Group them under a "GitHub Actions" subsection after the existing DO-21 entry.
- [x] **Update ContentCatalog.js** — Register all new modules with correct hrefs, types, house mappings
- [x] **Update content-registry.js** — Add entries for all new presentation/lab files
- [x] **Update sprint backlog** — Mark DO-21 as done, create tracking entries for new modules

**Commit message:** `chore: Register GitHub Actions modules in ForgeData, ContentCatalog, content-registry`

---

## Wave 5: QC & Deploy
*Single agent — validation and ship*

- [x] Run `npm run scan` — full EduScan, fix any CRITICAL/HIGH issues
- [x] Run `npm run scan:test` — signature tests must pass
- [x] Spot-check 3 random new modules in browser (if functional tests available)
- [x] Run `npm run scan:archive` — save baseline
- [x] Commit all remaining changes
- [x] `git push`
- [x] `npx firebase deploy --only hosting`
- [x] Update sprint backlog — mark completed items

**Commit message:** `chore: GitHub Actions marathon — QC, deploy, sprint cleanup`

---

## Wave 6: Content Hub Landing Pages (6 Parallel Agents)
*Each agent builds one hub landing page. Follow existing hub patterns (DevOps Forge, Arctic, Dark Arts).*
*Each hub: hero section, curriculum map, difficulty tiers, section cards with progress, dark theme.*
*Register in content-registry.js and update dashboard destination cards.*
*Note: BH-1 (Hunting Grounds) already exists at `_app/dark-arts/vault/bug-hunting/` — 48 files, full curriculum.*

- [x] **PL-1** — The Code Armory (Code house)
  - Route: `_app/houses/code/armory/index.html`
  - Language cards grid with icons, difficulty, industry relevance tags
  - "Pick Your Weapon" quiz recommending languages by career goals
  - Tracks: Python, JavaScript/TS, C, C++, Go, Rust, Bash, SQL + more

- [x] **AN-1** — The Backbone (Web house)
  - Route: `_app/houses/web/backbone/index.html`
  - Advanced networking above Network+ level
  - Tracks: Data Center, Service Provider, High-Performance, Programmability, Wireless, WAN, Security
  - Prerequisite checker (Network+/CCNA completion)

- [x] **CS-1** — The Algorithm Chamber (Code house)
  - Route: `_app/houses/code/algorithms/index.html`
  - Discrete math, data structures, algorithm design, advanced topics
  - Inspired by "Algorithms to Live By" framing
  - 4 tracks: Discrete Math, Data Structures, Algorithm Design, Applied

- [x] **ML-1** — The Cortex (Code house)
  - Route: `_app/houses/code/cortex/index.html`
  - AI + ML curriculum with cybersecurity application lens
  - 4 tracks: AI Foundations, Classical ML, Deep Learning, AI for Cybersecurity
  - Difficulty: Novice (concepts) -> Practitioner (Python) -> Engineer

- [x] **JS-1** — Career Launchpad (cross-house)
  - Route: `_app/career/index.html`
  - Job board aggregator, resume builder, interview prep, career path explorer, salary research
  - Target: students finishing coursework transitioning to first IT/cyber role

- [x] **GF-1** — Funding Hub / Grant Finder (cross-house)
  - Route: `_app/funding/index.html`
  - Grant aggregator, scholarship search, funding calendar, application tracker
  - Audiences: students (tuition/cert funding), educators (program grants), small biz (cyber resilience)

**Commit message:** `feat: 6 content hub landing pages — Armory, Backbone, Algorithm Chamber, Cortex, Career, Funding`

---

## Wave 7: Quality Fixes & EduScan Triage (4 Parallel Agents)
*Each agent handles one triage batch. Run EduScan after to verify fixes.*

- [x] **QC-12** — Gate Blockers (CRITICAL)
  - Fix XP-004: remove client setUserProfile XP write (server-side now)
  - Fix HTML-001: 2 unclosed `<script>` tags
  - Fix CFG-001: 3 quizzes missing moduleId
  - Fix PATH-001: 16 AccessGuard script paths not found

- [x] **QC-13** — Semantic HTML Batch (2,943 findings)
  - Write an EduScan auto-fixer script for heading hierarchy
  - SEM-001: fix h2->h4 skips (1,625 files) — insert missing h3 or demote h4
  - SEM-003: add h1 to pages missing it (771 files)
  - SEM-002: consolidate multiple h1 elements (547 files)

- [x] **QC-17** — Infra & Naming Batch (~250 findings)
  - NAME-003: add house prefix to 157 files
  - FLEX-001: fix 121 flex column overflows
  - DEP-004: add missing ModuleProgress.js to 3 files
  - PALETTE-001: fix 5 house color mismatches
  - NAV-001: add back navigation to 14 files

- [x] **ES-14** — SEM-001 Deep Fix (heading hierarchy across 1,480 files)
  - Overlap with QC-13 — coordinate: QC-13 writes the auto-fixer, ES-14 runs it on remaining files
  - Focus on Dark Arts vault files first (highest concentration)

**Commit message:** `fix: EduScan triage — gate blockers, semantic HTML, infra fixes`

---

## Wave 8: New Games, Features & Engine Extensions (4 Parallel Agents)
*Each agent builds one standalone HTML game/feature. Follow existing game patterns.*

- [x] **F-45** — Root Access (Dig Dug clone)
  - File: `_app/houses/forge/games/forge-root-access.applet.html`
  - Dig through system layers (filesystem, registry, firmware) to quarantine malware
  - Tile-based grid, terrain types, inflate-and-pop threats
  - Score tracking via GameTracker

- [x] **F-52** — Life Force (Shmup)
  - File: `_app/houses/shield/games/shield-life-force.applet.html`
  - Konami Life Force-inspired side-scrolling shooter
  - Network defense theme — protect infrastructure from incoming threats
  - Gradius-style powerup bar, 6 stages

- [x] **F-28** — Announcement Board
  - Firestore collection: `announcements/{id}` (title, body, author, priority, created, expires, houses[])
  - Dashboard widget: pinned announcements at top
  - Handler/admin create UI
  - Cloud Function for expiration cleanup

- [x] **AR-6** — BoxEngine v2 Blue Team Extensions
  - Extend BoxEngine.js with defensive/blue team primitives
  - New device types: monitoring dashboard, log viewer, firewall rule builder, IDS alert panel
  - Blue team mechanics: detect anomalies, write firewall rules, triage alerts, analyze logs
  - Series B boxes need different interaction models than Series A offensive boxes
  - Depends: AR-3 (done)
  - **Must complete before Wave 12 (PR-7 needs these primitives)**

**Commit message:** `feat: Root Access game, Life Force shmup, announcement board, BoxEngine blue team extensions`

---

## Wave 9: Content Expansion & Polish (5 Parallel Agents)

- [x] **M-11** — Microsoft Security-101 Course (Shield house)
  - Source: FM-256/Security-101 fork (8 lessons)
  - Convert markdown to Prime module format
  - Route: `_app/houses/shield/security-101/`

- [x] **L-14** — Linux Admin Completion Stamps (Script house)
  - Add visual completion stamps to all 36 Linux Admin modules
  - Pattern: check localStorage progress, render stamp/badge on module card
  - First pass for one district — template for F-39 universal rollout

- [x] **F-39** — Universal Completion Stamps + Mastery XP System
  - Extend L-14's stamp pattern to ALL houses and module types
  - Visual completion indicators on every module card across the platform
  - Mastery XP tier system (completion → mastery via repeated practice)
  - Touches shared components — serialize after L-14 if contention arises
  - **Pairs with L-14**: L-14 builds the template, F-39 rolls it out everywhere

- [x] **M-10** — Network Essentials + Web Gaps (Web house)
  - Audit comptia-network content, fill gaps
  - Build missing modules for Network+ coverage

- [x] **AC-1** — Accessibility Audit (all houses)
  - Run axe-core/Lighthouse across all presentation HTML
  - Check: heading hierarchy, lang attribute, color contrast (WCAG 2.1 AA), focus indicators, keyboard nav
  - Generate baseline report with severity levels
  - Fix critical/high violations

**Commit message:** `feat: Security-101 course, completion stamps, Network+ gaps, accessibility audit`

---

## Wave 10: Infrastructure & Integration (2 Parallel Agents)

- [x] **AR-23** — Colosseum Firebase Init
  - Add Firebase JS SDK to game pages
  - Create `firebase-init.js` (initializeApp, anonymous auth)
  - Verify Firestore rules for `runs/{runId}`
  - Test auth flow local + hosted

- [x] **NXS-1** — Nexus hexcontent Spoke Adapter
  - File: `_tools/nexus/adapters/hexcontent.js`
  - Read bc1 cold storage and workbench state via SSH/cached JSON
  - Show: items in cold storage, items in workbench, disk usage
  - Add to `nexus.config.json`

**Commit message:** `feat: Colosseum Firebase init, Nexus hexcontent adapter`

---

## Wave 11: API Foundations (2 Parallel Agents)
*API-1 is done. API-2 and API-3 are both unblocked.*

- [x] **API-2** — Authentication & Authorization
  - Route: `_app/houses/cloud/api/cloud-api-002.presentation.html`
  - API keys, Bearer tokens, OAuth 2.0 flows (auth code, client credentials)
  - JWT structure (header.payload.signature), token expiration and refresh
  - Interactive lab: decode a JWT, identify claims, spot expired token
  - Lab 2: walk through OAuth flow step-by-step
  - Quiz on auth patterns

- [x] **API-3** — API Design & Documentation
  - Route: `_app/houses/cloud/api/cloud-api-003.presentation.html`
  - RESTful design principles, resource naming, versioning strategies
  - OpenAPI/Swagger specification, API documentation best practices
  - Interactive lab: design an API from requirements
  - Quiz on design patterns

**Commit message:** `feat: API-2 and API-3 — authentication, authorization, API design`

---

## Wave 12: API Security & Cloud APIs (4 Parallel Agents)
*Depends on Wave 11 (API-2, API-3 complete)*

- [x] **API-4** — Rate Limiting, Throttling & Resilience
  - Route: `_app/houses/cloud/api/cloud-api-004.presentation.html`
  - Rate limiting algorithms (token bucket, sliding window), throttling, backoff
  - Circuit breakers, retry strategies, API gateway patterns
  - Interactive lab: configure rate limits, test behavior under load
  - Depends: API-2

- [x] **API-5** — OWASP API Security Top 10
  - Route: `_app/houses/cloud/api/cloud-api-005.presentation.html`
  - All 10 vulnerabilities (2023): BOLA, broken auth, BOPLA, unrestricted resource consumption, BFLA, SSRF, security misconfig, automated threats, improper asset mgmt, unsafe consumption
  - Real-world breach examples for each
  - Interactive lab: identify vulnerabilities in sample API code snippets
  - Depends: API-2

- [x] **API-6** — Hands-On API Penetration Testing
  - Route: `_app/houses/cloud/api/cloud-api-006.lab.html`
  - API recon (endpoint discovery, parameter fuzzing)
  - Testing for BOLA/IDOR, broken auth bypass, mass assignment, injection, SSRF
  - Tools: Burp Suite, Postman, curl, ffuf
  - CTF-style lab: exploit a vulnerable API (3-4 flags)
  - Builds on BoxEngine pattern but API-focused
  - Depends: API-5

- [x] **API-7** — Cloud APIs: AWS, Azure & GCP Patterns
  - Route: `_app/houses/cloud/api/cloud-api-007.presentation.html`
  - AWS API Gateway + Lambda, Azure API Management, GCP Cloud Endpoints
  - Authentication patterns per provider (IAM roles, managed identity, service accounts)
  - Cross-cloud comparison grid
  - Interactive lab: trace an API request through cloud infrastructure
  - Depends: API-3

**Commit message:** `feat: API-4 through API-7 — rate limiting, OWASP API Top 10, API pentest lab, cloud APIs`

---

## Wave 13: Red vs Blue — First Asymmetric Box (1 Agent)
*Depends on AR-6 from Wave 8*

- [x] **PR-7** — Red vs Blue Asymmetric Box
  - First box with two player perspectives: attacker and defender
  - Red team: recon, exploit, pivot, exfiltrate (existing BoxEngine mechanics)
  - Blue team: monitor, detect, contain, remediate (AR-6 blue team primitives)
  - Same scenario, two configs — student plays both sides to learn full kill chain + defense
  - Uses AR-6 blue team extensions (monitoring dashboard, log viewer, firewall rules, IDS alerts)
  - Standalone config file: `_app/arena/boxes/pr7-red-vs-blue/config.js`
  - Product differentiator — no other platform does this

**Commit message:** `feat: PR-7 Red vs Blue — first asymmetric arena box`

---

## Wave 14: QC Pass & Deploy
*Single agent — final validation and ship*

- [x] Run `npm run scan` — full EduScan, fix any CRITICAL/HIGH issues
- [x] Run `npm run scan:test` — signature tests must pass (40/40)
- [x] Run `npm run scan:archive` — save baseline
- [x] Commit all remaining changes
- [x] `git push`
- [x] `npx firebase deploy --only hosting`
- [x] Update sprint backlog — mark all completed items

**Final commit:** `chore: Marathon complete — deployed`

---

## Wave 15: AI Exploit Lab — Hints, Explanations & Pre-Briefs (SERIAL — same file)
*All three touch `bh-lab-ai-exploit.html` — must serialize*

- [x] **BH-AI-1** — Progressive Hint System
  - Add 3 tiered hints per level with point deductions (-10, -20, -30)
  - HUD shows hint cost before reveal, confirms before deducting
  - Hint content stored server-side (validateChallenge CF), only hint text returned on request
  - Pattern: HackTheBox-style progressive hints
  - Files: `_app/dark-arts/vault/bug-hunting/labs/bh-lab-ai-exploit.html`, `functions/index.js`

- [x] **BH-AI-2** — Post-Exploit Explanation Engine
  - After each level exploit, show expandable "What You Learned" panel
  - Content: Attack Technique, Why It Worked, Real-World Incidents (Bing prompt leak, Copilot jailbreak, etc.), Defense Strategies
  - Map each level to OWASP LLM Top 10 category (LLM01-LLM10)
  - Explanation data returned from server after successful exploit
  - Files: `bh-lab-ai-exploit.html`, Cloud Function response expansion

- [x] **BH-AI-3** — Micro-Lesson Pre-Brief Panel
  - Before each level, show learning context card: what you're learning, OWASP LLM category, attack class
  - "Begin Challenge" button gates the chat interface until brief is acknowledged
  - Connects pedagogically: pre-brief → challenge → post-exploit explanation
  - Files: `bh-lab-ai-exploit.html`

**Commit message:** `feat: BH-AI-1/2/3 — progressive hints, post-exploit explanations, micro-lesson pre-briefs`

---

## Wave 16: AI Exploit Lab — System Logs & Architecture View (1 Agent)

- [x] **BH-AI-4** — System Logs Viewer
  - After level completion, "View AI Internal Logs" button reveals:
    - System prompt sent to model
    - User prompt (the attack)
    - Defense evaluation chain (which filters triggered, which passed)
    - Model output before/after filtering
  - Teaches AI security architecture — students see how the LLM processes attacks
  - Toggle panel, only available after level exploit (not during)
  - Files: `bh-lab-ai-exploit.html`, Cloud Function returns log data on success

**Commit message:** `feat: BH-AI-4 — system logs viewer for AI security architecture education`

---

## Wave 17: Leaderboard + Instructor Mode (2 Parallel Agents)

- [x] **BH-AI-5** — Leaderboard + Attack Analytics
  - Firestore leaderboard: top scores, fastest completions per level
  - Track: most common exploit prompts, success patterns, bypass methods
  - Leaderboard panel in lab UI (collapsible sidebar or tab)
  - Anonymized by default, opt-in display names
  - Attack analytics aggregation for research (PhD data collection)
  - Files: `bh-lab-ai-exploit.html`, new Cloud Function for leaderboard CRUD, Firestore rules

- [x] **BH-AI-6** — Instructor Mode
  - Handler-gated instructor view panel (AccessGuard handler check)
  - Shows: per-student progress across all 8 levels, attempts per level, common failure patterns, exploit success rate
  - Class aggregate view with export
  - Integrates with existing InstructorDashboard.js + ProgressManager pipeline
  - Files: `handler-dashboard.html` (new AI exploit analytics panel), Firestore queries

**Commit message:** `feat: BH-AI-5/6 — leaderboard, attack analytics, instructor mode`

---

## Wave 18: Bug Bounty Simulation Platform (2-3 Parallel Agents)

- [x] **BH-AI-7a** — Bug Bounty Process Modules
  - `bh-mod-bounty-process.html` — The bug bounty lifecycle: recon, scope analysis, hunting, reporting, payout
  - `bh-mod-recon-tools.html` — Recon toolchain: subfinder, amass, httpx, nuclei, recon-ng (simulated CLI)
  - `bh-mod-vuln-reporting.html` — Professional vulnerability report writing (Summary, Steps to Reproduce, Impact, PoC, Mitigation)
  - `bh-mod-bounty-economics.html` — Severity tiers, payout ranges, platform comparison (HackerOne vs Bugcrowd)

- [x] **BH-AI-7b** — Simulated Bug Bounty Program
  - `bh-lab-bounty-sim.html` — Full simulated bounty program:
    - Company: "NovaTech Corp" (fictional target)
    - Scope definition panel (allowed targets, out-of-scope assets, rules of engagement)
    - Simulated recon terminal (subdomain discovery, port scanning, directory enumeration)
    - Vulnerability submission form with scoring rubric
    - Bounty payout simulation based on finding severity
  - Multiple target assets: web app, API, mobile endpoint
  - 5+ plantable vulnerabilities across the simulated scope

- [x] **BH-AI-7c** — AI Bug Bounty Specialization Track
  - `bh-mod-ai-bounty.html` — AI-specific bug bounty: LLM exploitation, AI guardrail bypass, prompt injection, AI data leaks
  - Position Hexworth as THE platform for AI bug bounty training
  - Map to emerging AI bug bounty programs (OpenAI, Anthropic, Google)
  - Connect to existing `bh-lab-ai-exploit.html` as prerequisite

**Commit message:** `feat: BH-AI-7 — bug bounty simulation platform, recon tools, AI bounty specialization`

---

## Wave 19: Final QC & Deploy
*Single agent — validation and ship*

- [x] Run `npm run scan` — full EduScan, fix any CRITICAL/HIGH issues
- [x] Run `npm run scan:test` — signature tests must pass (40/40)
- [x] Run `npm run scan:archive` — save baseline
- [x] Commit all remaining changes
- [x] `git push`
- [x] `npx firebase deploy --only hosting`

**Final commit:** `chore: Marathon phase 2 complete — deployed`

---

## Wave 20: CAT-002 Cleanup — Register All Undeclared Files
*98 files on disk not declared in ContentCatalog.js — register them all (verified 2026-03-12)*

**By house (agent allocation):**

- [x] **Agent 1 — Script CLH (36 files):** 31 standalone labs + 5 extras (031 briefing/quiz, course quiz/intro)
- [x] **Agent 2 — Script Database (35 files):** DB-01 through DB-35 (modules, labs, quizzes)
- [x] **Agent 3 — Shield (10 files):** 8 Security 101 presentations + Contra + ThreatDex games
- [x] **Agent 4 — Cloud + Web + Forge + Code (17 files):** 6 Cloud API + 5 Web N+ presentations + 4 Forge (A+ prep rounds 2-4, MD-100 midterm) + 2 PYE (midterm, capstone)
- [x] Run `npm run scan` — CAT-002: 0 (was 98)
- [x] Commit: `fix: Register 98 undeclared content files in ContentCatalog (CAT-002 zero)`
- [x] Deployed 2026-03-12

**Rules:**
- Read each file's `<title>` and first few lines for accurate description
- Match existing catalog entry format exactly (house, id, title, description, icon, status, components, href, category)
- href is relative to house basePath — NOT absolute
- content-registry paths are relative to `_app/`
- Serialize ContentCatalog.js edits — only one agent writes at a time (contention bottleneck)

---

## Wave 21: Operator Hub Overhaul — Intro + Mission Registration
*The Operator hub drops users in cold with no context. Fix that, then register the 4 new missions.*

**Current state:**
- Hub page: `_app/operator/index.html` (~620 lines, inline CSS+JS)
- 20 missions across 4 tiers, rendered from TIERS array in inline JS
- Hero section: icon + "OPERATOR" title + one-liner quote — no explanation of what this is or how it works
- 4 built but unregistered missions exist on disk:
  - `missions/recon-03.mission.html` + `configs/recon-03.config.js`
  - `missions/linux-fs-03.mission.html` + `configs/linux-fs-03.config.js`
  - `missions/incident-response-03.mission.html` + `configs/incident-response-03.config.js`
  - `missions/forensics-03.mission.html` + `configs/forensics-03.config.js`
- Progress bar hardcoded to `/20`, needs update to `/24`

**Wave 21a: Operator Introduction Section**
- [x] Collapsible briefing panel below hero — what Operator is, how it works, tiers, domains, scoring
- [x] CRT/terminal aesthetic maintained — styled as mission briefing with grid cards
- [x] Auto-expands for first-time visitors (localStorage `hexworth_operator_briefing_seen`), collapsed for returning

**Wave 21b: Register 4 New Missions**
- [x] RECON-03 (Phantom Network, Tier 2), LINUX-FS-03 (Privilege Escalation, Tier 2), IR-03 (Supply Chain, Tier 3), FORENSICS-03 (Insider Threat, Tier 3)
- [x] Progress counter updated /20 → /24, bar calc updated
- [x] All 4 registered in ContentCatalog.js (house: matrix)

**Wave 21c: Validation**
- [x] EduScan clean (CAT-001: 0, CAT-002: 0, no new CRITICAL)
- [x] Deployed 2026-03-12

---

## Wave 22: TripWire + Wall of Shame
*Honeypot defense system — detect, neutralize, log, display. Sprint plan: `_planning/TRIPWIRE_WALL_OF_SHAME.md`*

**Wave 22a: Foundation (2 parallel agents)**
- [x] **TripWire.js** — Core detection engine + Sensors 1-3 (Storage Integrity, Runtime Freeze+Proxy, DOM MutationObserver)
- [x] **Firestore rules** — tripwire_events + tripwire_stats collections, rate limiting, nonce validation

**Wave 22b: Remaining Sensors (2 parallel agents)**
- [x] **Sensors 4-5** — Console Injection Detection + Timer Manipulation Guard
- [x] **Sensors 6-7** — Decoy Flags (planted in BoxEngine/Operator configs) + XSS Pattern Detection

**Wave 22c: Wall of Shame (1 agent)**
- [x] **WallOfShame.js** — Display component, Firestore sync, entry rendering
- [x] **wall-of-shame/index.html + CSS** — CRT aesthetic, local rap sheet, global stats, leaderboard

**Wave 22d: Integration + Achievements (3 parallel agents)**
- [x] **9 TripWire achievements** — Busted!, Repeat Offender, Script Kiddie, The Manipulator, Storage Raider, Time Bandit, Decoy Victim, XSS Artist, Hall of Fame (title: "the Notorious")
- [x] **FluxCapacitor auto-load** — TripWire.js + TripWireEffects.js loads on every page
- [x] **Engine integration** — BoxEngine decoy flags, OperatorEngine decoy commands, XPCalculator integrity cross-ref

**Wave 22e: Polish + Validation**
- [x] Run `npm run scan` — fix any new issues
- [x] TripWireEffects.js — 10 escalating visual tiers + Web Audio API synthesis + speech synthesis
- [x] False positive fixes — stack trace inspection for storage sensor, tab visibility check for timer sensor
- [x] Deployed v3.0.0
- [x] Feature doc: `_app/docs/features/TRIPWIRE_DEFENSE.md`

---

## Wave 23: Progress Sync — Priority Courses + Protection
*Full scoping doc: `_planning/INSTRUCTOR_HOOKS_SCOPE.md`*
*Priority: A+ Core 2, CLH, Linux Mastery, Linux Administration*
*IMPORTANT: Progress is to be PROTECTED — TripWire + server validation*

**Current sync state:**
- A+ Core 1: SYNCING (ProgressSync `checkLocalCompletion()`)
- A+ Core 2: SYNCING (ProgressSync `checkLocalCompletion()`)
- WSA: SYNCING (ProgressSync `checkWSAModule()`)
- CLH: SYNCING (ProgressSync via `hexworth_progress.script.clh-*`)
- Linux Mastery: NOT SYNCING — need to identify storage keys + add check function
- Linux Administration: NOT SYNCING — need to identify storage keys + add check function
- Games (81): NOT SYNCING
- Dark Arts gates (8): NOT SYNCING
- Reviews (6): NOT SYNCING
- CMMC (14): NOT SYNCING

**Wave 23a: Audit Current Sync Coverage**
- [x] All 4 priority courses already sync via generic `hexworth_progress.script` handler
  - A+ Core 2: syncs via contentId `script-*` → `hexworth_progress.script[key]`
  - CLH: syncs via dedicated handler + generic fallback
  - Linux Mastery: 53 modules, syncs via generic handler (`hexworth_progress.script[filename]`)
  - Linux Admin: 37 items (12 pres + 12 labs + 12 quizzes + 1 review), syncs via generic handler
- [x] Linux Mastery also has `hexworth_arctic_progress` (dual-store) — ProgressSync checks this as fallback
- [x] Linux Admin quiz keys use abbreviated format (`la-chXX-quiz`) — ProgressSync handles via `hp[contentId]` fallback

**Wave 23b: ProgressSync already covers priority courses** (no new handlers needed)
- [x] Generic handler at line 157 matches all `script-*` contentIds
- [x] Falls back to `hp[contentId]` which catches full key format

**Wave 23c: Progress Protection Layer**
- [x] TripWire: added `hexworth_arctic_progress` to PROTECTED_KEYS
- [x] TripWire: added `hexworth_synced_activity` to protect sync tracking
- [x] TripWire: added `hexworth_operator_` prefix match (all Operator mission keys)
- [x] Firestore rules already enforce: field whitelist on user profile, gate writes Cloud Function only, progress writes auth-gated per student

**Wave 23d: Sync Gap Closure**
- [x] Added `checkGameData()` — reads `hexworth_game_tracker`, checks played/won/completed
- [x] Added `checkGateData()` — reads `gate{N}_complete` key, handles string and JSON formats
- [x] Added `checkOperatorMission()` — reads `hexworth_operator_{slug}` key

**Wave 23e: Validation**
- [x] EduScan clean — no new issues
- [x] Deployed 2026-03-12

---

## Wave 24: Handler Dashboard Redesign — Drill-Down Analytics
*Full plan: `_planning/HANDLER_DASHBOARD_REDESIGN.md`*
*Sports analytics model — no scroll, click-to-drill, predictive layer*

**Wave 24a: File Extraction + View Engine Foundation**
- [x] Extracted 9,091-line monolith → 4 files (HTML 461 lines + CSS 3,704 + JS 4,985 + Charts 82)
- [x] View engine: drillDown(), goBack(), breadcrumb navigation, save/restore Level 0
- [x] Kept 3-column layout (sidebar still useful for class switching)

**Wave 24b: KPI Cards + Clickable Drill-Downs**
- [x] Enrolled, Avg Completion, Total Completions cards clickable with keyboard support
- [x] drillDownEnrolled(): student table with house, level, join date, last active
- [x] drillDownCompletion(): SVG donut chart + per-student completion bars
- [x] drillDownCompletions(): per-assignment table with rates and avg scores
- [x] HandlerCharts.js: donut, barChart, sparkline, histogram (SVG/Canvas, no library)

**Wave 24c: Student Profile — Global/Class Tabs**
- [x] Roster cards clickable → student profile drill-down
- [x] Student header: avatar, callsign, house, level, XP, dates
- [x] CLASS tab: assignment completion, per-assignment status, risk badge
- [x] GLOBAL tab: 6 stat cards (Quiz Avg, Modules, Labs, XP, Level, Streak)
- [x] Stat cards clickable → Level 2 detail view
- [x] Profile data fetched from Firestore users/{uid}, cached in _profileCache

**Wave 24d: Polish + Export**
- [x] CSV export from any drill-down view (tables + bar charts)
- [x] Escape key navigates back through drill-down stack
- [x] Roster pagination (15 per page, Prev/Next controls)
- [x] Risk score engine: completion deficit (0.4) + inactivity (0.3) + overdue velocity (0.3)
- [x] EduScan clean, deployed 2026-03-12

**Commit message:** `feat: Handler dashboard redesign — drill-down analytics, predictive layer, zero-scroll`

---

## Wave Summary

| Wave | Agents | Creates | Est. Time |
|------|:------:|---------|-----------|
| 1 — GH Actions core | 5 parallel | do-100 through do-104 (5 HTML) | 2-3 hrs |
| 2 — GH Actions advanced | 5 parallel | do-105 through do-109 (5 HTML) | 2-3 hrs |
| 3 — GH Actions labs | 4 parallel | do-110 through do-113 (4 HTML) | 3-4 hrs |
| 4 — GH Actions registration | 1 serial | ForgeData, ContentCatalog, content-registry | 30 min |
| 5 — GH Actions QC & deploy | 1 | EduScan + git + firebase | 15 min |
| 6 — Content hub pages | 6 parallel | 6 new hub landing pages (BH already exists) | 2-3 hrs |
| 7 — EduScan triage | 4 parallel | QC-12/13/17, ES-14 fixes | 2-3 hrs |
| 8 — Games, features & engine | 4 parallel | 2 games + announcement board + AR-6 blue team | 2-3 hrs |
| 9 — Content expansion | 5 parallel | Security-101, stamps (L-14+F-39), Net+, a11y | 2-3 hrs |
| 10 — Infrastructure | 2 parallel | Firebase init, Nexus adapter | 1 hr |
| 11 — API foundations | 2 parallel | API-2 (auth) + API-3 (design) | 2-3 hrs |
| 12 — API security & cloud | 4 parallel | API-4/5/6/7 (rate limit, OWASP, pentest, cloud) | 2-3 hrs |
| 13 — Red vs Blue | 1 | PR-7 asymmetric arena box | 2-3 hrs |
| 14 — Final QC & deploy | 1 | EduScan + git + firebase | 15 min |
| 15 — AI hints/explanations/briefs | 1 serial | BH-AI-1/2/3 (same file) | 2-3 hrs |
| 16 — System logs viewer | 1 | BH-AI-4 architecture education | 1-2 hrs |
| 17 — Leaderboard + instructor | 2 parallel | BH-AI-5 leaderboard + BH-AI-6 instructor | 2-3 hrs |
| 18 — Bug bounty sim platform | 2-3 parallel | 4 modules + bounty sim lab + AI track | 3-4 hrs |
| 19 — Final QC & deploy | 1 | EduScan + git + firebase | 15 min |
| 20 — CAT-002 cleanup | 4 parallel → serial | Register 99 undeclared files | 2-3 hrs |
| 21 — Operator expansion reg | 1 serial | Register 4 new missions in ContentCatalog + content-registry | 30 min |
| 22 — TripWire + Wall of Shame | 5 waves | TripWire.js (8 sensors), WallOfShame.js, wall page, 9 achievements | 6-8 hrs |
| 23 — Progress Sync + Protection | 5 waves | Priority course sync, TripWire protection, sync gap closure | 4-6 hrs |
| 24 — Handler Dashboard Redesign | 4 waves | Drill-down analytics, prediction engine, zero-scroll, charts | 12-18 hrs |

**Waves 1-24 COMPLETE.** All checked off.

---

### Active Backlog (Waves 1-38)

| Wave | Agents | Scope | Est. Time |
|------|:------:|-------|-----------|
| **DISPATCH & DESK TOYS** | | | |
| 1 — Additional Targets | 3 parallel | Bottle, clown, cup stack + target selector | 3-4 hrs |
| 2 — Ammo + Tier Unlocks | 1 | 4 ammo types, tier gate system, unlock UX | 2-3 hrs |
| 3 — Desk Toys | 4 parallel | Drinking bird, Newton's cradle, plasma ball, desk fan | 3-4 hrs |
| 4 — Toy Selector + Stats | 1 | Selector UI, stats panel, 9 achievements, special toys | 2-3 hrs |
| 5 — Dispatch Box Migration | 1 | Move NT1 to dispatch/boxes/, update all paths | 1 hr |
| 6 — PR-001 Printer Nightmare | 1 | 5 scenarios, Print Mgmt/Queue/Services GUIs, 10 commands | 4-5 hrs |
| 7 — OS-001 Boot Failure | 1 | 5 scenarios, WinRE environment, Startup Settings/Repair GUIs | 5-6 hrs |
| 8 — HW-001 Dead Workstation | 1 | 5 scenarios, hardware inspection SVG panel, Parts Bin, POST codes | 6-8 hrs |
| 9 — AD-001 Lockout Storm | 1 | 5 scenarios, ADUC/Event Viewer/GPO GUIs, 50+ user objects, PS cmdlets | 8-10 hrs |
| **QUALITY & SECURITY** | | | |
| 10 — QC Gate Blockers | 1 | QC-12: 22 fixes (XP-004, HTML-001, CFG-001, PATH-001) | 1-2 hrs |
| 11 — Quality Sweep | 2 parallel | QC-13: heading hierarchy auto-fix (2,943) + QC-17: infra/naming (250) | 3-4 hrs |
| 12 — BoxEngine Blue Team | 1 | AR-6: defensive scenario extensions for Series B boxes | 3-4 hrs |
| 13 — Secret Protection: Answers | 2 parallel | SEC-4: CLH answer keys + SEC-5: quiz engine server-side | 4-6 hrs |
| 14 — Secret Protection: Flags | 1 | SEC-9: migrate all box flags to Cloud Function, remove client-side | 3-4 hrs |
| 15 — Secret Protection: Labs | 1 | SEC-7: Key House lab answer key evaluation | 2-3 hrs |
| 16 — Learning Path Alignment | 1 | QC-14: fix 1,844 LP-006/007 findings + QC-15: wire 949 orphan pages | 4-6 hrs |
| 17 — Quick Wins | 1 | M-1: HTML imports cleanup across forge/shield/web/code/key | 2-3 hrs |
| 18 — Signal Toolkit Library | 4 parallel | SG-LIB: 20 tool deep-dive reference pages (install, usage, gotchas) | 3-4 hrs |
| 19 — Accessibility Audit | 2 parallel | AC-1: audit all presentations + AC-4: fix color contrast (WCAG AA) | 4-6 hrs |
| 20 — Difficulty Metrics | 1 | PR-5: measurable learning analytics layer (grant-ready) | 3-4 hrs |
| **XP & PROGRESS** | | | |
| 21 — XP Master Ledger | 1 | QC-9: true content inventory + XP audit tool | 4-6 hrs |
| 22 — XP Rewire | 1 | QC-10: rewire XP Calculator against master ledger (← QC-9) | 3-4 hrs |
| 23 — Progress Refactor | 1 | QC-6: progress architecture cleanup | 3-4 hrs |
| **COURSE TRACKS** | | | |
| 24 — Code Armory Hub | 1 | PL-1: design programming languages hub page + curriculum | 3-4 hrs |
| 25 — Code Armory: Core Languages | 5 parallel | PL-2 Python, PL-3 JS/TS, PL-4 C, PL-10 Bash, PL-12 SQL | 15-20 hrs |
| 26 — Code Armory: Systems Languages | 4 parallel | PL-5 C++, PL-6 Go, PL-7 Rust, PL-15 Assembly | 12-16 hrs |
| 27 — Code Armory: Enterprise & Web | 5 parallel | PL-8 Java, PL-9 C#, PL-11 PowerShell, PL-13 PHP, PL-14 Ruby | 15-20 hrs |
| 28 — Code Armory: Extras | 4 parallel | PL-16 Swift/Kotlin, PL-17 Lua/Perl/R, PL-18 comparison tool, PL-19 challenges, PL-20 security, PL-21 graphics | 10-14 hrs |
| 29 — The Backbone Hub | 1 | AN-1: advanced networking hub page + curriculum design | 3-4 hrs |
| 30 — The Backbone: Courses | 5 parallel | AN-2 BGP, AN-3 MPLS, AN-4 DC networking, AN-6 SDN, AN-11 net security | 15-20 hrs |
| 31 — The Backbone: Advanced | 5 parallel | AN-5 InfiniBand, AN-7 SD-WAN, AN-8 Wi-Fi 6, AN-9 optical, AN-10 IPv6, AN-12 forensics, AN-13 QoS, AN-14 EIGRP, AN-15 5G, AN-16 design | 20-30 hrs |
| 32 — Algorithm Chamber | 5 parallel | CS-1 hub, CS-2 discrete math, CS-3 graph theory, CS-4 Big O, CS-5 data structures → CS-6/7/8/9/10/11/12 | 20-30 hrs |
| 33 — The Cortex (AI/ML) | 5 parallel | ML-1 hub, ML-2 foundations, ML-3 math → ML-4/5/6/7/8/9/10/11/12/13/14/15 | 25-35 hrs |
| 34 — API Foundations | 3 parallel | API-2 auth, API-3 design, API-4 rate limiting → API-5/6/7/8/9 | 12-16 hrs |
| **FEATURES & PLATFORM** | | | |
| 35 — Messaging System | serial | F-23 → F-23A/B/C/D/E/F: Firestore DMs, inbox, moderation, dashboard | 15-20 hrs |
| 36 — Social & Multiplayer | 3 parallel | F-21 public profiles, F-25 2-player arcade, F-26 Hive multiplayer | 10-15 hrs |
| 37 — Content & Branding | 4 parallel | M-10 web gaps, M-11 Security-101, BR-19 mascot life, A-4 tourist visa | 8-12 hrs |
| 38 — Tooling & Analytics | 4 parallel | HD-8/9/10 engagement metrics, NXS-1 Nexus spoke, SC-5 classifier, AR-5 IDPs, DA-20 TN labs | 10-15 hrs |
| **MAINTENANCE** | | | |
| 39 — Sprint Backlog Audit | 1 | Full reconciliation: stale items, missing work, status drift, dependency accuracy | 2-3 hrs |

---

## Wave 1: Desk Toys — Additional Targets (3 parallel agents)
*Full spec: `_app/docs/features/DESK_TOYS.md`*
*Hub: `_app/dispatch/index.html` (monitor-on-desk layout)*
*Launcher + bullseye + zeroing mechanic already shipped (2026-03-13)*

- [x] **Bottle target** — glass bottle on shelf, wobble on near-miss, shatter particle effect on hit, auto-reset after 2s
- [x] **Clown target** — jack-in-the-box on spring, dodge+laugh on miss, Looney Tunes char on hit (face blackens, eyes blink, smoke), 3-hit spin+fall combo
- [x] **Cup Stack target** — pyramid of 6 paper cups, physics tumble on hit, per-cup scoring, full-clear confetti
- [x] Target selector UI: row of icons below target stand, click to swap active target

---

## Wave 2: Ammo Types + Tier Unlocks (1 agent)

- [x] Ammo selector tray: foam dart (default), suction cup (sticks), nerf ball (bounces), rubber band (3-shot burst)
- [x] Each ammo type has distinct projectile SVG, arc behavior, and visual feedback
- [x] Tier unlock system — read ticket completion from localStorage, gate by tier:
  - T1 (0 tickets): launcher + bullseye + foam dart
  - T2 (3 tickets): bottle + suction cup
  - T3 (8 tickets): clown + nerf ball
  - T4 (15 tickets): cup stack + rubber band + golden launcher skin
- [x] Unlock notification: glow/pulse on new items, tooltip message
- [x] Silhouette placeholders for locked items

---

## Wave 3: Additional Desk Toys (4 parallel agents)

- [x] **Drinking Bird** — click to start bobbing, physics pendulum for 30s, placed left of monitor
- [x] **Newton's Cradle** — drag to pull ball, momentum transfer physics, placed right of monitor
- [x] **USB Plasma Ball** — hover/touch to arc lightning toward cursor, placed right side
- [x] **Desk Fan** — toggle on/off, blows the post-it notes (CSS animation), placed lower-right

---

## Wave 4: Toy Selector + Stats + Achievements (1 agent)

- [x] Toy selector tray/drawer at desk edge, grid of unlocked toys (locked = silhouettes)
- [x] Stats panel on launcher base: total shots, hits, accuracy %, bullseye high score, bottles broken, clowns charred
- [x] 9 achievements wired to AchievementRegistry: First Blood, Bullseye, Sharpshooter, Glass Cannon, Send in the Clowns, Dead Eye, Zeroed In, Cup Sweep, Desk General
- [x] Special unlock toys:
  - Mini Basketball Hoop (100% accuracy achievement)
  - Fidget Spinner (5-day streak)
  - Stress Ball (fail a box 3 times)

---

## Wave 5: Dispatch Box Migration (1 agent)

- [x] Move `_app/arena/boxes/nt1-network-troubleshoot/` to `_app/dispatch/boxes/nt1-network-troubleshoot/`
- [x] Update MD-100 connector link (`_app/houses/forge/md-100/index.html` line ~686)
- [x] ContentCatalog.js + content-registry.js — no NT1 entries found, N/A
- [x] Dispatch hub link already uses absolute path `/dispatch/boxes/` — verified working
- [x] Update `index.html` in the box — relative paths updated from `../../engine/` to `../../arena/engine/`

---

## Wave 6: PR-001 — Printer Nightmare (1 agent)
*Design spec: `_planning/DISPATCH_BOX_DESIGNS.md` § Box 4*
*Pattern: NT1 config.js — closest match, simplest state machine*
*Location: `_app/dispatch/boxes/pr001-printer-nightmare/`*

- [x] `config.js` — metadata, cert objectives (A+ Core 2), lore, phases, scoring
- [x] 5 scenarios: spooler crash, wrong driver, IP changed, permissions denied, stuck queue
- [x] Per-scenario broken state, fix validation, flag values, hints (4 each)
- [x] Terminal commands: `net stop/start spooler`, `del spool\PRINTERS\*.*`, `ping`, `wmic printer`, `Get-Printer`
- [x] GUI: Print Management (tree view, printer list, tabbed properties: Ports/Advanced/Security)
- [x] GUI: Print Queue (job list with status, right-click cancel/pause, error states)
- [x] GUI: Services (Print Spooler focus, start/stop/restart, corrupt spool file blocking)
- [x] GUI: Network Settings (basic IP check for printer connectivity)
- [x] `index.html` — thin consumer (23 lines, same pattern as NT1)
- [x] 3 printer objects: HP LaserJet (USB), Xerox WorkCentre (net .200), Canon imageCLASS (net .201)
- [x] State machine: `_checkPrintFix()` validates spooler running + correct driver + correct port + correct perms + clear queue

---

## Wave 7: OS-001 — Boot Failure (1 agent)
*Design spec: `_planning/DISPATCH_BOX_DESIGNS.md` § Box 1*
*Pattern: NT1 config.js + boot sequence variant (WinRE instead of desktop)*
*Location: `_app/dispatch/boxes/os001-boot-failure/`*

- [x] `config.js` — metadata, cert objectives (MD-100), lore, phases, scoring
- [x] 5 scenarios: corrupted BCD, bad driver BSOD, stuck update, disk corruption, missing bootloader
- [x] Boot sequence override: POST → Windows logo → FAILURE → "Preparing Automatic Repair" → WinRE menu
- [x] Per-scenario broken state + stateOverrides, fix validation, flags, hints (4 each)
- [x] Terminal commands: `bootrec` (/fixmbr, /fixboot, /rebuildbcd, /scanos), `bcdboot`, `bcdedit`, `sfc`, `dism`, `chkdsk`, `diskpart`
- [x] GUI: Startup Settings (Safe Mode options — interactive menu with numbered choices)
- [x] GUI: Startup Repair (automated diagnostic — progress bar, per-scenario success/failure messages)
- [x] GUI: System Restore (restore point selector, works for S2+S3 only, fails gracefully for others)
- [x] GUI: Uninstall Updates (quality/feature update list, functional for S3 only)
- [x] GUI: Device Manager (Safe Mode only for S2 — driver rollback/uninstall)
- [x] `index.html` — thin consumer
- [x] State machine: `_checkBootFix()` validates boot state restored per scenario

---

## Wave 8: HW-001 — Dead Workstation (1 agent)
*Design spec: `_planning/DISPATCH_BOX_DESIGNS.md` § Box 2*
*Pattern: NT1 config.js + new GUI paradigm (hardware inspection panel)*
*Location: `_app/dispatch/boxes/hw001-dead-workstation/`*

- [x] `config.js` — metadata, cert objectives (A+ Core 1 220-1101), lore, phases, scoring
- [x] 5 scenarios: unseated RAM, dead GPU, failed PSU, overheating CPU, bad SATA cable
- [x] POST code system: 2-digit hex LED display, beep code patterns (visual text)
- [x] Per-scenario broken state + hardware component states, fix validation, flags, hints (4 each)
- [x] Terminal commands: minimal (hardware box, not software) — `systeminfo`, `wmic`, basic diagnostics
- [x] GUI: Hardware Inspection Panel — SVG tower interior with clickable components
- [x] GUI: Parts Bin — grid of replacement components, install mechanic
- [x] GUI: BIOS Setup — tabbed (System Info, Boot Order, Hardware Monitor)
- [x] GUI: Multimeter — PSU voltage readings (+12V, +5V, +3.3V) — dead = all 0V
- [x] GUI: POST Code Reference — lookup table for student to cross-reference LED codes
- [x] `index.html` — thin consumer
- [x] State machine: `_checkHardwareFix()` validates component states (seated, powered, functional)
- [x] Power button mechanic: must press to attempt boot, behavior depends on hardware state

---

## Wave 9: AD-001 — Lockout Storm (1 agent)
*Design spec: `_planning/DISPATCH_BOX_DESIGNS.md` § Box 3*
*Pattern: NT1 config.js + server environment (Domain Controller)*
*Location: `_app/dispatch/boxes/ad001-lockout-storm/`*

- [x] `config.js` — metadata, cert objectives (Security+), lore, phases, scoring
- [x] 5 scenarios: stale creds (scanner), expired service account, brute force attack, GPO misconfig, rogue scheduled task
- [x] Domain data model: 50+ user accounts across 6 OUs (IT, HR, Finance, Marketing, Executives, Service Accounts)
- [x] Per-scenario: locked account list, Event Viewer entries, root cause source, fix validation, flags, hints (4 each)
- [x] Terminal (PowerShell): `Get-ADUser`, `Search-ADAccount -LockedOut`, `Unlock-ADAccount`, `Get-EventLog`, `Set-ADAccountPassword`, `Get-ADDefaultDomainPasswordPolicy`, `gpupdate /force`, `gpresult /r`, `net user`
- [x] GUI: ADUC — OU tree view, user list per OU (Name, Status, Last Logon), click user → Properties (Account tab with unlock, General, Member Of), right-click menu
- [x] GUI: Event Viewer — Security log table (Date, Event ID, Source, Category, Description), filter by Event ID/date/IP, expandable detail view, key events: 4625 (failed logon), 4740 (lockout), 4624 (success)
- [x] GUI: Group Policy Management — tree view, Default Domain Policy, Account Lockout Policy (threshold/duration/reset), editable for S4
- [x] GUI: Firewall Console (S3 only) — rule list, "Add Rule" to block attacker IP
- [x] GUI: Network Management (S5 only) — switch port list, disable rogue machine port
- [x] `index.html` — thin consumer
- [x] State machine: `_checkLockoutFix()` validates root cause addressed + accounts unlocked + policy correct

---

## Wave 10: QC Gate Blockers (1 agent)
*Sprint: QC-12 (CRITICAL) — 22 findings blocking Nexus gate*

- [x] **XP-004** (1 critical): Remove client setUserProfile XP write — syncProgress derives server-side (already resolved)
- [x] **HTML-001** (2 high): Fix unclosed `<script>` tags (already resolved)
- [x] **CFG-001** (3 high): Add missing `moduleId` to quizzes (already resolved)
- [x] **PATH-001** (20 high): Fix dispatch box script paths (../../arena → ../../../arena) + validator JS file fallback
- [x] **ASGN-005** (28 high): Fix PATH_HOUSE_MAP entries + scanner to read external JS
- [x] **ENG-001** (12 high): Add QuizEngine.js to 3 A+ Core 1 prep round quizzes
- [x] **SANDBOX-003/004** (6 high): Add FirebaseAuth.js dep + db-sql lab ID to 3 database labs
- [x] Run `npm run scan` — HIGH: 193→127 (remaining 127 are SEC-001/002 answer key exposure, deferred to Waves 13-15)
- [x] Mark QC-12 done in sprints.json

---

## Wave 11: Quality Sweep (2 parallel agents)
*Sprints: QC-13 + QC-17 — bulk-scriptable fixes*

**Agent 1: QC-13 — Semantic HTML (2,943 findings)**
- [x] Build heading hierarchy auto-fixer script (or fix in-place)
- [x] **SEM-001** (157): Fix heading hierarchy skips (h2 → h4, missing h3) — 157→0
- [x] **SEM-003** (452): Add missing h1 elements to pages — 452→0
- [x] **SEM-002** (67): Remove duplicate h1 elements — 67→0
- [x] Run `npm run scan` to verify SEM counts drop to 0

**Agent 2: QC-17 — Infra & Naming (250 findings)**
- [x] **DEP-004**: Already resolved in prior work
- [x] **PALETTE-001**: Already resolved in prior work
- [x] **NAV-001**: Already resolved in prior work
- [x] **FLEX-001**: Already resolved in prior work
- [x] **CAT-002**: Already resolved in prior work
- [x] **HEUR-008** (58 suspect): Fix position:fixed patterns — 58→0 across 33 component files
- [x] Mark QC-13 and QC-17 done in sprints.json

---

## Wave 12: BoxEngine Blue Team Extensions (1 agent)
*Sprint: AR-6 — feeds Waves 6-9 dispatch box architecture*

- [x] Analyze Series B defensive scenario requirements (IR, forensics, hardening)
- [x] Extend BoxEngine.js: blue team state machine (triage→diagnosis→remediation→verification) with phase bar UI
- [x] Add GUI window framework: event_viewer, tree_panel, properties, hardware_inspector (4 typed builders)
- [x] Add hardware inspection panel — SVG motherboard view with clickable components + status dots
- [x] Add WinRE boot sequence variant — 6-phase BSOD→recovery→advanced options flow
- [x] Ensure backwards compatibility — all features opt-in via config flags, Series A unaffected
- [x] Mark AR-6 done in sprints.json

---

## Wave 13: Secret Protection — Answer Keys (2 parallel agents)
*Sprints: SEC-4 + SEC-5 — move answer validation server-side*

**Agent 1: SEC-4 — CLH Answer Keys**
- [ ] Audit all CLH module objectives (terminal state evaluation functions)
- [ ] Design server-side validation approach for virtual filesystem state
- [ ] Implement Cloud Function endpoint for CLH objective validation
- [ ] Remove client-side answer keys from CLH module files
- [ ] Test all CLH modules still validate correctly

**Agent 2: SEC-5 — Quiz Engine Server-Side**
- [x] Audit quiz answer storage pattern — 228 quiz files scanned, 185 keys extracted
- [x] Design quiz validation Cloud Function — `gradeQuiz` callable, returns score + per-question correct/incorrect (never reveals answers)
- [x] Implement server-side quiz grading endpoint — added to functions/index.js
- [x] Migrate quiz engine — QuizEngine.js has `serverGrading: true` config + `_gradeViaServer()` + fallback
- [x] Migration script — `functions/migrate-quiz-keys.js` (--dry-run, --export-keys, --strip-answers)
- [ ] Run migration: export keys to Firestore, strip answers from quiz files (separate execution step)
- [ ] Mark SEC-4 and SEC-5 done in sprints.json

---

## Wave 14: Secret Protection — Box Flag Migration (1 agent)
*Sprint: SEC-9 — remove all plaintext flags from client-side*

- [x] Audit all box configs — 27 boxes, 74 flags (20 arena + 1 pr7 + 1 nt1-arena + 5 dispatch)
- [x] Add `_validateFlagViaServer()` to BoxEngine.js — calls validateFlag CF, falls back to local hash
- [x] Migration script: `functions/migrate-box-flags.js` (--dry-run, --export-keys) covers all 74 flags
- [ ] Run migration: export flag keys to Firestore, strip plaintext from configs (separate execution)
- [ ] Verify EduScan SEC-8 rule passes after stripping
- [ ] Mark SEC-9 done in sprints.json

---

## Wave 15: Secret Protection — Key House Labs (1 agent)
*Sprint: SEC-7 — evaluate approach for lab answer keys*

- [x] Audit Key House lab answer key patterns — sandbox tools + computed validation, no true secrets
- [x] Determine: exercise inputs, NOT secrets — labs compute answers client-side from given inputs
- [x] Decision: won't-fix — see `_planning/SEC-7-DECISION.md`
- [x] Mark SEC-7 resolved in sprints.json

---

## Wave 16: Learning Path Alignment (1 agent)
*Sprints: QC-14 (1,844 findings) → QC-15 (949 findings, chains after QC-14)*

- [x] **LP-006** (478→1): Fixed 477 module ID mismatches (prefix renames, href-based renames, house-level renames)
- [x] **LP-007** (1530→1209): Wired 321 orphaned modules into learning paths via ID reconciliation
- [x] Reconcile LearningPaths and ContentCatalog entries — 482 IDs renamed across all cert tracks
- [ ] **FLOW-001**: Wire content HTML files not chained into any learning path (remaining work)
- [ ] Run `npm run scan` to verify LP and FLOW counts resolved
- [ ] Mark QC-14 and QC-15 done in sprints.json

---

## Wave 17: Quick Wins — HTML Imports (1 agent)
*Sprint: M-1 — old debt, multi-house cleanup*

- [x] Audit HTML import patterns — zero `<link rel="import">` found, codebase already clean
- [x] No migration needed
- [x] Mark M-1 done in sprints.json

---

## Wave 18: Signal Toolkit Reference Library (4 parallel agents)
*Parent page: `_app/signal/toolkit/index.html` (already live with download cards)*
*Output: `_app/signal/toolkit/tools/` — 20 self-contained HTML reference pages*
*Template per page: What it does, Why you need it, Install steps, Usage (3-5 tasks), Common gotchas, Last reviewed date, Back link*

**Agent 1 — Boot & Imaging (5 tools):**
- [x] **Rufus** — USB bootable drive creator (Windows)
- [x] **Ventoy** — multi-ISO USB boot manager
- [x] **balenaEtcher** — cross-platform image flasher
- [x] **Clonezilla** — disk/partition cloning and imaging
- [x] **GParted** — partition editor (live USB)

**Agent 2 — Development Environments (4 tools):**
- [x] **Arduino IDE** — microcontroller programming
- [x] **PlatformIO** — embedded development platform (VS Code extension)
- [x] **VS Code** — code editor setup for cybersecurity/IT workflows
- [x] **Thonny** — beginner Python IDE (Raspberry Pi default)

**Agent 3 — Network, Security & Forensics (6 tools):**
- [x] **Wireshark** — network protocol analyzer
- [x] **Nmap** — network scanner and host discovery
- [x] **PuTTY** — SSH/serial terminal client (Windows)
- [x] **Hiren's Boot CD PE** — preinstallation environment toolkit
- [x] **memtest86+** — memory diagnostic
- [x] **DBAN** — secure disk erasure

**Agent 4 — Raspberry Pi & Serial/Terminal (5 tools):**
- [x] **Raspberry Pi Imager** — official OS installer
- [x] **RetroPie** — retro gaming on Pi
- [x] **CoolTerm** — serial port terminal (GUI)
- [x] **Screen** — terminal multiplexer + serial console
- [x] **minicom** — serial communication program

**Validation:**
- [x] Update toolkit index page to link to all 20 tool pages
- [x] Signal toolkit outside houses/ dir — no ContentCatalog/content-registry registration needed
- [x] Run `npm run scan` — CRITICAL: 0, no new issues from toolkit pages

**Commit message:** `feat: Signal Toolkit Reference Library — 20 tool deep-dive pages`

---

## Wave 19: Accessibility Audit (2 parallel agents)
*Sprints: AC-1 + AC-4 — WCAG AA compliance*

**AC-4 — Color Contrast (DONE)**
- [x] Dark Arts primary: #6b21a8→#9b59d0 (2.27:1→4.46:1), fixed across 50 files
- [x] Muted text #555→#808080, #666→#8a8a8a, #444→#808080 — all now 4.5:1+
- [x] Handler dashboard light mode gold/muted text fixed
- [x] Wall of Shame alpha greens converted to solid WCAG-passing equivalents
- [x] Landing page tagline animation decoded states fixed
- [x] ~100 files modified (components, CSS, dark-arts content, arena configs)

**AC-1 — Audit (deferred)**
- [ ] Full ARIA/keyboard/screen reader audit — separate from color contrast
- [ ] Mark AC-1 and AC-4 done in sprints.json

---

## Wave 20: Difficulty Metrics & Analysis Layer (1 agent)
*Sprint: PR-5 — grant-ready measurable learning data*

- [x] Design difficulty scoring model — 1-10 scale based on time ratio, retries, hints, score
- [x] Implement DifficultyMetrics.js (402 lines) — startModule, completeModule, recordHint, recordRetry
- [x] Build getDashboardData() — top 10 hardest/easiest, house averages, abandonment, score histogram
- [x] Export format: exportForGrant() — grant-ready JSON with per-module and per-house metrics
- [x] Mark PR-5 done in sprints.json

---

## Wave 21: XP Master Ledger (1 agent)
*Sprint: QC-9 — foundation for XP rewire*

- [x] Create XPMasterLedger.js — 17 category defaults, override map, componentToCategory resolver
- [x] Binary logic: getXP(id, category) returns value, calculateTotal(completedItems) sums
- [x] True asset inventory: 1821 available modules across 9 categories, theoretical max 525,425 XP
- [x] Build xp-audit.js — Node.js audit tool (--verbose, --json), first run: CLEAN
- [x] Mark QC-9 done in sprints.json

---

## Wave 22: XP Calculator Rewire (1 agent)
*Sprint: QC-10 — depends on Wave 20 (QC-9)*

- [x] Rewire XPCalculator.js — _rate() resolves from XPMasterLedger.values, falls back to _FALLBACK_RATES
- [x] XP_RATES wrapped in Proxy — external callers get ledger values transparently
- [x] Per-gate XP overrides enabled (gates 6-8: 600/700/800 via ledger overrides)
- [x] Mark QC-10 done in sprints.json

---

## Wave 23: Progress Architecture Refactor (1 agent)
*Sprint: QC-6 — structural cleanup*

- [x] Audit ProgressManager, ProgressSync, ModuleProgress — found 4 bugs
- [x] Fix: ModuleProgress writes `completedAt` (was only `date`, ProgressSync couldn't read it)
- [x] Fix: ProgressSync CLH fallback for namespaced key + `hexworth:progressUpdate` listener
- [x] Fix: ProgressManager increments standalone counters on completeModule()
- [x] Mark QC-6 done in sprints.json

---

## Wave 24: Code Armory — Hub Design (1 agent)
*Sprint: PL-1 — head of the programming languages chain*

- [ ] Design Code Armory hub page (programming languages browser)
- [ ] Curriculum structure: language cards, difficulty levels, cert alignment
- [ ] Navigation between languages, shared code playground concept
- [ ] Mark PL-1 done in sprints.json

---

## Wave 25: Code Armory — Core Languages (5 parallel agents)
*Sprints: PL-2, PL-3, PL-4, PL-10, PL-12 — depends on Wave 23*

- [ ] **PL-2** — Python (fundamentals through advanced, scripting, dark-arts applications)
- [ ] **PL-3** — JavaScript & TypeScript (fundamentals, web integration)
- [ ] **PL-4** — C programming (systems programming, memory management)
- [ ] **PL-10** — Bash & shell scripting (sysadmin automation)
- [ ] **PL-12** — SQL (database querying, management, injection defense)

---

## Wave 26: Code Armory — Systems Languages (4 parallel agents)
*Sprints: PL-5, PL-6, PL-7, PL-15*

- [ ] **PL-5** — C++ (OOP, STL, modern C++ — depends on PL-4)
- [ ] **PL-6** — Go (cloud tooling, concurrency)
- [ ] **PL-7** — Rust (memory-safe systems programming)
- [ ] **PL-15** — Assembly (x86/x64, reverse engineering — depends on PL-4)

---

## Wave 27: Code Armory — Enterprise & Web (5 parallel agents)
*Sprints: PL-8, PL-9, PL-11, PL-13, PL-14*

- [ ] **PL-8** — Java (enterprise, Android)
- [ ] **PL-9** — C# & .NET (Windows development)
- [ ] **PL-11** — PowerShell (Windows administration)
- [ ] **PL-13** — PHP (web development, legacy systems)
- [ ] **PL-14** — Ruby (scripting, web development)

---

## Wave 28: Code Armory — Extras & Cross-Cutting (4 parallel agents)
*Sprints: PL-16, PL-17, PL-18, PL-19, PL-20, PL-21*

- [ ] **PL-16** — Swift & Kotlin (modern mobile development)
- [ ] **PL-17** — Lua, Perl, R (specialized scripting)
- [ ] **PL-18** — Language comparison tool & recommendation engine
- [ ] **PL-19** — Per-language coding challenges (depends on PL-2/3/4/6/7)
- [ ] **PL-20** — Security-focused language selection guide
- [ ] **PL-21** — Python Graphics (turtle, pygame — depends on PL-2)

---

## Wave 29: The Backbone — Hub Design (1 agent)
*Sprint: AN-1 — advanced networking course track*

- [ ] Design The Backbone hub page and curriculum structure
- [ ] Map content to CCNA/CCNP/Network+ cert objectives
- [ ] Mark AN-1 done in sprints.json

---

## Wave 30: The Backbone — Core Courses (5 parallel agents)
*Sprints: AN-2, AN-3, AN-4, AN-6, AN-11 — depends on Wave 28*

- [ ] **AN-2** — BGP (Border Gateway Protocol)
- [ ] **AN-3** — MPLS and service provider technologies
- [ ] **AN-4** — Data center networking and fabric architectures
- [ ] **AN-6** — Software-Defined Networking (SDN)
- [ ] **AN-11** — Network security architecture

---

## Wave 31: The Backbone — Advanced Topics (5 parallel agents)
*Sprints: AN-5, AN-7, AN-8, AN-9, AN-10, AN-12, AN-13, AN-14, AN-15, AN-16*

- [ ] **AN-5** — InfiniBand, RDMA, high-performance networking
- [ ] **AN-7** — Advanced SD-WAN and WAN optimization
- [ ] **AN-8** — Advanced wireless (Wi-Fi 6/6E/7, mesh)
- [ ] **AN-9** — Optical networking and physical layer
- [ ] **AN-10** — Advanced IPv6 and internet protocols
- [ ] **AN-12** — Network forensics and deep packet analysis
- [ ] **AN-13** — Advanced QoS and traffic engineering
- [ ] **AN-14** — IS-IS, EIGRP advanced, routing deep dive
- [ ] **AN-15** — 5G, cellular, and carrier networking
- [ ] **AN-16** — Network design and architecture capstone

---

## Wave 32: Algorithm Chamber (5 parallel agents → serial chain)
*Sprints: CS-1 through CS-12 — dependency chain*

- [ ] **CS-1** — Design Algorithm Chamber hub page and curriculum
- [ ] **CS-2** — Discrete mathematics (← CS-1)
- [ ] **CS-3** — Graph theory and network algorithms (← CS-2)
- [ ] **CS-4** — Big O notation and complexity analysis (← CS-2)
- [ ] **CS-5** — Data structures deep dive (← CS-4)
- [ ] **CS-6** — Sorting and searching algorithms (← CS-5)
- [ ] **CS-7** — Greedy algorithms and optimization (← CS-5)
- [ ] **CS-8** — Divide and conquer, dynamic programming (← CS-5)
- [ ] **CS-9** — String algorithms and pattern matching (← CS-5)
- [ ] **CS-10** — Applied algorithms capstone (← CS-4, CS-7)
- [ ] **CS-11** — Computational geometry (← CS-5)
- [ ] **CS-12** — Algorithm challenge platform (← CS-6, CS-7, CS-8)

---

## Wave 33: The Cortex — AI/ML Track (5 parallel agents → serial chain)
*Sprints: ML-1 through ML-15 — dependency chain*

- [ ] **ML-1** — Design Cortex hub page and AI/ML curriculum
- [ ] **ML-2** — AI foundations, history, and ethics (← ML-1)
- [ ] **ML-3** — Mathematics for machine learning (← ML-1)
- [ ] **ML-4** — Classical ML: supervised learning (← ML-3)
- [ ] **ML-5** — Classical ML: unsupervised learning (← ML-3)
- [ ] **ML-6** — Deep learning fundamentals (← ML-4)
- [ ] **ML-7** — Convolutional Neural Networks (← ML-6)
- [ ] **ML-8** — Recurrent Neural Networks and transformers (← ML-6)
- [ ] **ML-9** — Natural Language Processing (← ML-8)
- [ ] **ML-10** — Reinforcement learning (← ML-6)
- [ ] **ML-11** — Generative AI: GANs, diffusion, LLMs (← ML-7)
- [ ] **ML-12** — Adversarial machine learning (← ML-6)
- [ ] **ML-13** — ML for cybersecurity: detection models (← ML-4, ML-5)
- [ ] **ML-14** — MLOps, deployment, and production (← ML-4, ML-6)
- [ ] **ML-15** — AI/ML hands-on capstone projects (← ML-4, ML-5, ML-6, ML-13)

---

## Wave 34: API Foundations (3 parallel agents → serial chain)
*Sprints: API-2 through API-9 — dependency chain*

- [ ] **API-2** — Authentication & Authorization (← API-1 done)
- [ ] **API-3** — API Design & Documentation (← API-1 done)
- [ ] **API-4** — Rate Limiting, Throttling & Caching (← API-2)
- [ ] **API-5** — OWASP API Top 10 (← API-2)
- [ ] **API-6** — Hands-On API Penetration Testing (← API-5)
- [ ] **API-7** — Cloud APIs: AWS, Azure & GCP Patterns (← API-3)
- [ ] **API-8** — Webhooks, WebSockets & Event-Driven (← API-1 done)
- [ ] **API-9** — API Capstone: Build & Secure a Full API (← API-4, API-5, API-6)

---

## Wave 35: Messaging System (serial chain)
*Sprints: F-23 → F-23A/B/C/D/E/F — largest feature build*

- [ ] **F-23** — Epic: design decisions (moderation policy, privacy, instructor visibility)
- [ ] **F-23A** — Firestore data model & security rules (← F-23)
- [ ] **F-23B** — Cloud Functions: send, purge, rate-limit (← F-23A)
- [ ] **F-23C** — Client service: MessagingManager.js (← F-23B)
- [ ] **F-23D** — Inbox & conversation UI (← F-23C)
- [ ] **F-23E** — Dashboard integration: badge, preview panel (← F-23D)
- [ ] **F-23F** — Moderation, reporting & handler controls (← F-23A)

---

## Wave 36: Social & Multiplayer (3 parallel agents)
*Sprints: F-21, F-25, F-26*

- [ ] **F-21** — Public user profiles (view by UID, privacy controls, Firestore public doc)
- [ ] **F-25** — 2-player mode for arcade games (split-screen, turn-based, ghost mode)
- [ ] **F-26** — Hive multiplayer exploration (co-op, competitive, asymmetric Red Queen)

---

## Wave 37: Content & Branding (4 parallel agents)
*Sprints: M-10, M-11, BR-19, A-4*

- [ ] **M-10** — Network-Essentials + Web house content gaps
- [ ] **M-11** — Microsoft Security-101 course (Shield house onboarding track)
- [ ] **BR-19** — Mascot Digital Life System (idle animations, reactions, cross-mascot encounters, seasonal, terrarium)
- [ ] **A-4** — Tourist Visa: sorting quiz bypass for unsorted explorers

---

## Wave 38: Tooling & Analytics (4 parallel agents)
*Sprints: HD-8/9/10, NXS-1, SC-5, AR-5, DA-20, RS-2, ES-14*

- [ ] **HD-8** — Engagement metrics: login frequency, session duration (← HD-7 done)
- [ ] **HD-9** — Attendance/login tracking: pattern heatmaps (← HD-8)
- [ ] **HD-10** — Student satisfaction pulse surveys (← HD-7 done)
- [ ] **NXS-1** — Nexus hexcontent spoke adapter (bc1 content shuttle)
- [ ] **SC-5** — Scraper content classifier & auto-tagger
- [ ] **AR-5** — IDP drafting: Series B-H (140 boxes) — partial, continue
- [ ] **DA-20** — Tennessee Security Labs extraction (Canvas .imscc → Prime modules)
- [ ] **RS-2** — Repo Scout: GitHub API scraper (← RS-1 done)
- [ ] **ES-14** — SEM-001 heading hierarchy fixes (overlaps QC-13, resolve remainder)

---

## Wave 39: Sprint Backlog Audit (1 agent)
*Full reconciliation of sprints.json against actual project state*

- [ ] **Status drift**: Scan all 537 sprint items — verify statuses match reality (done items actually shipped? blocked items still blocked? dependencies still valid?)
- [ ] **Stale items**: Flag items created before 2026-02-01 that haven't been touched — are they still relevant or should they be archived/closed?
- [ ] **Missing work**: Review git log since last audit — identify shipped features/fixes not tracked by any sprint item. Create backlog entries for undocumented work.
- [ ] **Dependency accuracy**: Verify all `depends` chains — are blockers actually blocking? Have dependencies been resolved but downstream items not unblocked?
- [ ] **Marathon coverage**: Cross-reference marathon waves against sprint backlog — any sprint items not captured in a wave? Any waves referencing items that don't exist?
- [ ] **Duplicate detection**: Identify overlapping sprint items (e.g., ES-14 vs QC-13 heading fixes) — consolidate or link
- [ ] **Priority recalibration**: Review priority assignments — have circumstances changed? (e.g., items marked low that are now needed for grants, items marked critical that were addressed by other work)
- [ ] **Series health**: Check each series (DO, F, DA, AR, PL, etc.) — any series with all items done that can be closed? Any series missing items for planned features?
- [ ] **Blocked item triage**: For each blocked item — is the blocker real? Can it be unblocked? Should it be deferred or redesigned?
- [ ] Generate audit report: `_planning/SPRINT_AUDIT_REPORT.md` with findings, actions taken, and recommendations

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

## Wave 40: TripWire Hardening — Close Hackerman Bypass Vectors (1 agent)
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

## Wave 41: Quiz QC — Positional Answer References + Completion Flow (1 agent)
*Fixes quiz answers that reference "A and B" which break under randomization, and adds nextModule/returnLabel config to quizzes missing them*

- [x] Fix "Both A and B" positional references in 7 quiz files (CLH-004, CLH-025, CLH-012, LA-CH03, MD100-M04)
- [x] Audit ALL quizzes — fixed 4 more files with "Option A/B/C/D" in explanations (CLH-031x2, OpenStack, Web OSI)
- [x] Add `nextModule` config to all 10 MD-100 quizzes (m01-m10 point to next, m11 is last)
- [x] Add `returnLabel: 'Back to MD-100 Course'` to all 11 MD-100 quizzes

---

## Wave 42: Explore-All Hub Addition — Cert/Track Houses (1 agent)
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
*Updated: March 13, 2026 — full roadmap: 37 numbered waves + 5 unnumbered tracks (Colosseum, Neon, Scrapers, Job Search, Grant Finder)*
