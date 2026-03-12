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

**Total: 24 waves, ~75 agents across all waves**
**Phase 1 (Waves 1-14): 14 GH Actions modules + 6 API modules + 7 hub pages + 2 games + 1 asymmetric box + Security-101 course + universal stamps**
**Phase 2 (Waves 15-19): AI exploit lab enhancements + bug bounty simulation platform**
**Phase 3 (Wave 20): ContentCatalog registration for all marathon-created content**
**Phase 4 (Waves 21-22): Operator expansion registration + TripWire honeypot defense system**
**Phase 5 (Wave 23): Progress sync for priority courses (A+ Core 2, CLH, Linux Mastery, Linux Admin) + protection layer**
**Phase 6 (Wave 24): Handler dashboard redesign — drill-down sports analytics model with predictive layer**
**Engine: BoxEngine blue team extensions (AR-6), AI exploit hint/explanation/logs system**
**Quality: ~5,000+ EduScan findings resolved + accessibility audit + CAT-002 zero**

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
*Updated: March 11, 2026 — expanded to 14 waves (added API-2-7, F-39, AR-6, PR-7)*
