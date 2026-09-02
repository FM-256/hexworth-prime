# Hexworth Prime

**Gamified Cybersecurity Education Platform**
v7.2.0 "HARDLINE" | 5,200+ pages | 16 languages | 136 Arena boxes + 95 Dispatch tickets

A browser-based training platform for IT and cybersecurity instruction. Students join houses, complete modules, hack CTF boxes, earn XP, and level up. Instructors manage classes, track progress, assign content, and export grades. Built for real classroom deployment -- no installs, no build step, no excuses.

**Live:** [https://hexworth.com](https://hexworth.com)

---

## Quick Start

1. **Extract** the ZIP to any folder
2. **Open** `START.html` in Chrome, Edge, or Firefox
3. **Take** the sorting quiz to join a house
4. **Start learning**

No internet required after download (offline mode). For class enrollment, sign in with Google and enter your instructor's HEX-XXXX code.

---

## Table of Contents

- [What Is Hexworth Prime](#what-is-hexworth-prime)
- [The Houses](#the-houses)
- [Hex OS](#hex-os)
- [CTF System](#ctf-system)
- [Code Armory](#code-armory)
- [Sandboxes](#sandboxes)
- [Signal -- Hardware Projects Hub](#signal----hardware-projects-hub)
- [Instructor Features](#instructor-features)
- [For Students](#for-students)
- [Gamification](#gamification)
- [Digital Life Ecosystem](#digital-life-ecosystem)
- [Accessibility](#accessibility)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Settings & Data](#settings--data)
- [Troubleshooting](#troubleshooting)

---

## What Is Hexworth Prime

Hexworth Prime is a gamified education platform purpose-built for college-level IT and cybersecurity courses. Students are sorted into domain-specific houses, work through structured learning paths, compete in capture-the-flag challenges, and build practical skills across networking, security operations, cloud infrastructure, programming, and offensive security.

The platform runs entirely in the browser. Firebase Hosting serves static HTML/CSS/JS with zero build step. Firestore handles user data, class management, and progress sync. Cloud Functions enforce server-side validation. No frameworks, no bundlers, no node_modules.

**Two modes of operation:**
- **Offline (default)** -- Download, open START.html, learn. No account needed. Progress saved to localStorage.
- **Online (classes)** -- Sign in with Google, join a class via handler code, sync progress with your instructor.

---

## The Houses

Students are sorted into houses based on interest and career goals. Each house is a domain with its own content, theme, and learning paths.

| House | Domain | Focus |
|-------|--------|-------|
| **Shield** | Defense & Compliance | GRC, policy, risk management |
| **Dark Arts** | Offensive Security | Ethical hacking, exploit development (requires Five Gates CTF) |
| **Eye** | Threat Intelligence | Forensics, OSINT, incident analysis |
| **Cloud** | Cloud Infrastructure | AWS, Azure, cloud architecture |
| **Forge** | System Administration | Windows, CompTIA A+, hardware |
| **Web** | Networking | Protocols, HTTP, network fundamentals |
| **Code** | Software Development | Programming, algorithms, DevOps |
| **Key** | Cryptography | Encryption, PKI, cipher systems |
| **Script** | Linux & Automation | Bash, Linux administration, scripting |

Additional tracks: **AI** (machine learning, prompt engineering), **Matrix** (prestige tier, cross-domain mastery), plus 15 certification-aligned tracks (CompTIA A+ Core 1/2, Network+, Security+, CySA+, CASP+, AWS CCP, AWS Developer, Azure Fundamentals, CCNA, Linux+, and more).

---

## Hex OS

One place to launch everything on the platform. Every lab, course, hub, game and tool is listed in a single manifest, and Hex OS gives students two ways into it: a command line at `/hex/` and an icon grid at `/hex/apps.html`. Same list behind both.

It exists because things went quietly unreachable. Vault cards rendered as clickable and did nothing; a final exam had no link from its own hub. The fix was not to hunt for orphans by hand but to make one index authoritative and let a deploy gate fail when an entry points at a file that is not there.

**The shell.** 12 commands, each with a manual page:

| Command | Does |
|---------|------|
| `ls`, `search`, `info` | find things |
| `run`, `cd` | open things |
| `ps`, `stop`, `restart` | manage running lab sessions |
| `help`, `man`, `pwd`, `clear` | the shell itself |

`ls` with no argument prints categories and how many apps each holds; `ls <house>` or `ls <category>` lists what is inside. `run <id>` opens an app. `cd` scopes the shell to a house or category so later commands stay in that context. `ps`, `stop` and `restart` drive real container sessions through the lab manager, so a student with a frozen box can restart it without leaving the shell.

Everything is case-insensitive: `RUN ARCTIC`, `Man cd` and `LS clo` + Tab all work. Tab completes commands, app ids, places and manual pages. When there is nothing to complete, the shell says so rather than going quiet, because silence is indistinguishable from a broken key.

**Installable.** `/hex/` ships a web app manifest, so Chrome offers *Install page as app* on a Chromebook, laptop or Android device, and iOS offers *Add to Home Screen*. It then opens in its own window with its own icon and no browser chrome. There is deliberately no service worker: a worker scoped to `/hex/` would outrank the root-scoped tenant worker that white-label containment depends on, and scope matching prefers the longest match. Offline support belongs in that root worker, not a second one competing for these two pages.

**Home directory.** `/home.html` renders what the server actually knows about a student: server-proven awards, gates passed, quiz attempts and flag captures, each labelled with where the fact came from. It never writes, and it distinguishes a read failure from a real zero rather than showing an empty page either way.

**Gates.** A dead-entry gate runs in the deploy chain and fails the deploy if any manifest entry points at a missing file or at a page nothing links to. The manifest currently indexes 192 apps across 7 categories and 13 houses.

---

## CTF System

### Arena -- Red Team Operations

136 offensive security boxes with simulated terminal environments, listed in `_app/arena/box-catalog.json`. Students exploit vulnerabilities, escalate privileges, extract flags, and score points.

**What's inside:**
- Simulated Linux/Windows terminals with realistic filesystem navigation
- Multi-flag scenarios with tiered difficulty
- Hint systems that trade points for guidance
- Solo, co-op, and versus modes
- God mode for instructors to demonstrate solutions

**Box categories:** Linux privilege escalation, web application attacks, forensic analysis, network exploitation, Docker container breakouts, mobile security, cryptographic attacks, Active Directory compromise, and multi-stage red team operations.

### Dispatch -- Blue Team Helpdesk

Troubleshooting scenarios simulating a real IT helpdesk environment. Students sit at a virtual desk and triage incoming tickets.

95 tickets in the registry (`_app/dispatch/boxes.json`), spanning hardware diagnosis, Windows boot and recovery, printer failures, network connectivity, Active Directory lockouts, and certification-aligned scenarios tagged to specific exam objectives.

**Representative tickets:**
- **HW-001** Dead Workstation -- hardware inspection and diagnosis
- **OS-001** Boot Failure -- Windows Recovery Environment procedures
- **PR-001** Printer Nightmare -- 5 printer failure scenarios
- **NT1** Network Troubleshoot -- connectivity diagnosis
- **AD-001** Lockout Storm -- Active Directory account lockout triage

Cards on a course hub carry the objective the box actually declares, and a gate checks that the hub card, the box config and the Dispatch Board all agree, so a card cannot promise a module the briefing screen will contradict one click later.

The desk environment includes interactive elements, an ammo-based launcher with tier unlocks, a stats panel, and unlockable achievements. The experience simulates what it actually feels like to work a helpdesk.

### Why CTFs Matter

Capture-the-flag challenges force students to apply knowledge under pressure against realistic scenarios. Reading about SQL injection is theory. Extracting a flag from a vulnerable database is practice. Arena develops offensive instincts. Dispatch develops diagnostic discipline. Both develop the judgment that separates operators from textbook readers.

---

## Code Armory

16 programming languages. 160+ modules. Organized into 6 tracks.

| Track | Languages |
|-------|-----------|
| **Systems & Low-Level** | C, C++, Rust, Assembly |
| **Scripting & Automation** | Python, Bash, PowerShell, Lua/Perl/R |
| **Web & Full-Stack** | JavaScript/TypeScript, PHP, Ruby |
| **Enterprise & Mobile** | Java, C#/.NET, Swift/Kotlin |
| **Data & Query** | SQL, Lua/Perl/R |

Every language track includes security-relevant examples: Python covers port scanning and log parsing. C covers buffer overflows and compiler hardening. SQL covers injection defense and forensic queries. Assembly covers shellcode and reverse engineering. Ruby covers Metasploit module development. PowerShell covers Active Directory forensics and incident response.

**Features:**
- Per-language progress tracking
- Cert alignment tags (CompTIA, OSCP, AWS, Azure, Oracle, CKA)
- "Pick Your Weapon" recommendation quiz (10 questions)
- Language comparison tool with side-by-side analysis
- Difficulty ratings: beginner, intermediate, advanced
- Per-language coding challenges (planned)

---

## Sandboxes

### Phase 1: WASM In-Browser Execution (Live)

Real interpreters running via WebAssembly inside the student's browser. Not simulated -- actual code execution with real output and real errors.

- **Python** -- Pyodide (CPython compiled to WASM), loaded on demand; reaches students through the Python for IT sandbox labs and the shared Python sandbox component on 14 pages
- **SQL** -- sql.js (SQLite compiled to WASM) with pre-loaded databases, on 33 pages
- **JavaScript** -- iframe-based execution with console capture

Limitations: no sudo, no package managers, no networking. That is what Phase 2 is for.

### Phase 2: Container Sandboxes (Live)

Real Linux terminals with sudo, real package managers and networking tools, running as per-student containers behind a lab manager rather than in the browser.

Students reach them from 38 course and lab pages, or from the Hex OS shell, where `ps`, `stop` and `restart` manage their own running sessions. Sessions are owned by the signed-in user, hold a capacity slot while they exist, and can be restarted from a clean state without leaving the page.

Current labs include the DO-100 series, the Arctic Linux practice box, a SQL box, Cell-Sigma, Linux Command Mastery, the free-play Linux sandbox and an OpenStack CLI environment.

---

## Signal -- Hardware Projects Hub

32 hands-on hardware and security project guides across 7 sections.

| Section | Guides | Topics |
|---------|--------|--------|
| Foundations | SG-01 to SG-05 | Hardware basics, component identification |
| Network Recon | SG-06 to SG-10 | Network scanning, packet analysis |
| Security Tools | SG-11 to SG-15 | Security hardware, hardening tools |
| Privacy Builds | SG-16 to SG-20 | Privacy-focused hardware projects |
| Firmware Ops | SG-21 to SG-25 | Firmware analysis, embedded systems |
| Arcade Ops | SG-26 to SG-30 | Retro hardware, arcade projects |
| Field Prep | SG-31 to SG-32 | Field readiness, USB drive builds |

### Signal Toolkit Library

20 deep-dive tool reference pages covering hardware and security tools. Platform filtering (Arduino, ESP32, Raspberry Pi), parts lists, cost estimates, prerequisite chains, and "Build Your Kit" cost summaries.

---

## Instructor Features

### Handler Dashboard

Full classroom management system with LMS-compatible exports.

- **Class creation** with auto-generated HEX-XXXX join codes
- **Student roster** with real-time progress bars (color-coded: green/yellow/red)
- **Content assignments** -- assign learning paths, courses, or individual modules with due dates
- **Student detail view** -- per-student assignment breakdown with scores and dates
- **At-risk alerts** -- automatically flags students falling behind

### Exports

| Export | Format | Compatible With |
|--------|--------|-----------------|
| Roster | CSV | Blackboard, Canvas |
| Assignments | CSV | Blackboard, Canvas |
| Grades | CSV | Blackboard, Canvas |
| Progress Summary | CSV | Blackboard, Canvas |
| Class Report | Print-ready | PDF via browser |

### Admin Console

Platform-level management (5 tabs): user management, handler codes, account merging, account unlocking, and system health monitoring. Backed by Cloud Functions for server-side authority.

---

## For Students

### Joining a Class
1. **Sign in** with Google from the dashboard
2. **Complete your profile** in Settings (first name, last name, student ID)
3. **Click "Join Class"** in the dashboard
4. **Enter the HEX-XXXX code** provided by your instructor
5. Your class, assignments, and instructor info appear in the **My Classes** section

Progress syncs automatically -- complete assigned content and your instructor sees it reflected in their dashboard.

---

## Gamification

### XP & Levels
- Module completion awards XP
- Daily streaks earn bonus XP
- Leaderboards rank students within their house

### Achievements
Unlock achievements for milestones: streaks, completions, time-of-day activity, Dark Arts gate progression, and system exploration. Three-layer architecture tracking student progress.

---

## Digital Life Ecosystem

The dashboard background is a living ecosystem of digital organisms.

- **Binary Fireflies** -- 1s and 0s with unique behaviors across 5 evolution tiers
- **Rare variants** -- Golden, Diamond, Glitch, Ancient types
- **Cosmic events** -- Solar flares, meteor showers, void storms, eclipses, nebula drifts
- **Ecosystem entities** -- Planets, black holes, energy wells, predators
- **Audio atmosphere** -- Optional ambient soundscape

Press **D** for debug controls. Press **1-5** for player tools.

---

## Accessibility

- **WCAG AA color contrast** -- All text meets 4.5:1 minimum contrast ratio across 100+ files
- **ARIA labels and landmarks** -- Applied to core UI components
- **Keyboard navigation** -- Core components support tab navigation and focus management
- **Semantic HTML** -- Heading hierarchy audited across core components

Full WCAG 2.1 AA audit with screen reader testing, prefers-reduced-motion support, and automated axe-core scanning is planned on the roadmap.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Hosting** | Firebase Hosting (CDN, 99.95% SLA) |
| **Database** | Cloud Firestore |
| **Auth** | Firebase Authentication (Google sign-in) |
| **Server Logic** | Firebase Cloud Functions (Node.js) |
| **Frontend** | Raw HTML, CSS, JavaScript -- no framework, no build step |
| **Icons** | 125 custom webp icons |

No React. No Vue. No webpack. No node_modules. Every page is a self-contained HTML file. Works offline from a USB drive with zero toolchain requirements.

---

## Roadmap

### Shipped

These were on the roadmap and are now live. Left listed rather than deleted, so the list reads as a record instead of quietly shrinking.

- **The Backbone** -- Advanced networking track (BGP, MPLS, SDN, 5G)
- **The Cortex** -- AI/ML track (foundations through adversarial ML)
- **Algorithm Chamber** -- CS fundamentals (data structures, complexity, dynamic programming)
- **WASM Sandboxes** -- in-browser Python and SQL execution, see [Sandboxes](#sandboxes)
- **Container Sandboxes** -- full Linux terminals with sudo and package managers, see [Sandboxes](#sandboxes)
- **Hex OS** -- one index for everything launchable, with a shell and a launcher grid, see [Hex OS](#hex-os)

All three tracks are indexed in the Hex OS manifest, which means a deploy gate checks every one of their entries still resolves.

### Open

- **Messaging System** -- Student/instructor messaging with moderation
- **Full WCAG 2.1 AA Audit** -- Screen reader testing, axe-core scanning
- **Signal Visual Enhancements** -- SVG diagrams and annotated callouts across all 32 guides
- **Career Launchpad** -- job board aggregator, resume builder, interview prep. Partly built: a career area and a career quiz are live, the rest is in progress.
- **Hex OS offline** -- installing changes how Hex OS opens, not what it can reach without a network. Offline belongs in the root-scoped service worker, not a second one.
- **Per-language coding challenges** -- the runner component exists but is not yet on any page.

---

## FAQ

### 1. What is Hexworth Prime?
A gamified cybersecurity education platform built for college-level IT instruction. Houses, modules, CTFs, XP, leaderboards. Runs in-browser, works offline.

### 2. What are CTFs and what's the point?
Simulated hacking and troubleshooting scenarios where students find hidden flags by exploiting vulnerabilities or solving problems. CTFs build pattern recognition, tool fluency, and pressure tolerance that separates capable operators from credential holders.

### 3. What's the difference between Arena and Dispatch?
Arena is red team -- attack simulated systems, exploit vulnerabilities, extract data. Dispatch is blue team -- troubleshoot incoming tickets at a virtual IT helpdesk. Arena trains attackers. Dispatch trains defenders. Both are essential.

### 4. What programming languages are available?
16 languages across 6 tracks: Python, JavaScript/TypeScript, C, Bash, SQL, PowerShell, Go, Java, C#/.NET, PHP, Ruby, C++, Rust, Assembly, Swift/Kotlin, and Lua/Perl/R. 160+ modules with security-relevant examples throughout.

### 5. What do the sandboxes offer?
Both phases are live. Phase 1 is WASM in-browser execution: real Python and SQL interpreters running in WebAssembly, with actual output and actual errors, no server involved. Phase 2 is containerized Linux terminals with sudo, package managers and networking, reachable from 38 course and lab pages or from the Hex OS shell, where `ps`, `stop` and `restart` manage a student's own running sessions.

### 6. What analytics does the instructor get?
Class rosters with color-coded progress bars, per-student assignment breakdowns with scores and dates, at-risk student alerts, and CSV exports compatible with Blackboard and Canvas gradebook import.

### 7. Is the platform accessible (ADA/WCAG)?
Initial WCAG AA pass complete (color contrast, ARIA labels, keyboard navigation). Full WCAG 2.1 AA audit including screen reader testing is planned on the roadmap.

### 8. What certifications does content align to?
CompTIA (A+, Network+, Security+, CySA+, CASP+, Linux+, PenTest+, Data+), AWS (CCP, Developer), Azure (AZ-900), CCNA, GIAC GREM, and OSCP-adjacent skills.

### 9. How does the platform protect data integrity?
Hexworth Prime includes multi-layered integrity monitoring. Progress data is protected against unauthorized modification. Answer validation is handled server-side. Violations result in account restrictions that require instructor intervention.

### 10. What's the tech stack?
Firebase Hosting + Firestore + Cloud Functions. Raw HTML/CSS/JS frontend with no framework and no build step. Works offline from a USB drive.

### 11. Is this open source?
Hexworth Prime is a proprietary education platform. The codebase is not publicly licensed.

### 12. Can I deploy Hexworth Prime at my institution?
Hexworth Prime is available as a white-label solution for educational institutions. For licensing, partnership, and deployment inquiries, contact the development team.

---

## Settings & Data

### Data Backup
1. Go to **Settings**
2. Click **Export Progress** to download a JSON backup
3. To restore: Click **Import Progress** and select your backup file

Automatic backups are created before version updates and offered for restore when opening a new version.

### What Gets Backed Up
- House assignment and module completion
- Achievement unlocks and streak data
- Dark Arts / Five Gates progress
- All settings and preferences

---

## Troubleshooting

### "My progress is gone after updating"
1. Check if a restore banner appears at the top of the dashboard
2. If yes, click "Restore Progress"
3. If no, use Settings > Import Progress with your backup file

### "The page is blank or won't load"
1. Make sure you're opening `START.html`, not another file
2. Try a different browser (Chrome recommended)
3. Check that JavaScript is enabled

### "I want to start completely fresh"
1. Go to Settings
2. Click "Reset All Data"
3. Confirm twice (this cannot be undone)

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome / Edge (Chromium) | Recommended |
| Firefox | Supported |
| Safari | Supported |
| Internet Explorer | Not supported |

---

## About

Hexworth Prime is an education platform designed and developed for IT and cybersecurity instruction at the college level. Every feature exists because a real class needed it.

For licensing, white-label deployments, or partnership inquiries, contact the development team.

---

*v7.2.0 "HARDLINE" -- 2026-09-02*
