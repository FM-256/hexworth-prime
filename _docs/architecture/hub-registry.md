# Hub Registry

> Authoritative registry of every hub, house, and content area in Hexworth Prime.
> Generated from CONTENT_AUDIT.json (3,231 files) on 2026-03-18.

---

## Table of Contents

1. [Houses (12)](#houses)
2. [Standalone Hubs](#standalone-hubs)
3. [Certification Tracks](#certification-tracks)
4. [Special Areas](#special-areas)

---

## Houses

Houses are the primary organizational units. Each house has its own index page at `houses/<house>/index.html` and contains modules, labs, presentations, quizzes, games, tools, and reviews.

---

### Script House

| Field | Value |
|-------|-------|
| **URL** | `houses/script/` |
| **Files** | 505 |
| **Description** | Linux CLI, Bash scripting, PowerShell, Python fundamentals, system administration |
| **Owner** | Script House |

**Sections:**
- `clh/` -- Command Line Hero course (94 files) -- 31-unit intro-to-CLI track with applet/lab/quiz triads
- `courses/clh/` -- CLH course companion modules (94 files)
- `courses/grep-pipe-mastery/` -- Grep and pipe mastery (2 files)
- `modules/linux-mastery/` -- 53-module Linux mastery guided walkthrough
- `modules/databases/` -- Database fundamentals (35 files)
- `modules/python/` -- Python modules (10 files)
- `linux/` -- Linux-specific labs (26), presentations (12), quizzes (12), tools (4)
- `labs/linux/` -- Additional Linux hands-on labs (48 files)
- `applets/linux/` -- Interactive Linux applets (38 files)
- `applets/powershell/` -- PowerShell applets (3 files)
- `applets/python/` -- Python applets (8 files)
- `exams/` -- Python chapter exams (8 files)
- `presentations/python/` -- Python presentations (9 files)
- `games/` -- 6 games (pipe-snake, shell-sprint, sudo-flap, etc.)
- `tools/` -- 7 interactive tools (automation, permissions, process management, etc.)
- `reviews/` -- 4 review activities + index

**Content types:** 91 applets, 149 labs, 119 modules, 100 pages, 23 presentations, 11 tools

---

### Cloud House

| Field | Value |
|-------|-------|
| **URL** | `houses/cloud/` |
| **Files** | 306 |
| **Description** | Cloud computing, AWS, Azure, cloud security, API design, OpenStack |
| **Owner** | Cloud House |

**Sections:**
- `api/` -- API Security & Design track (94 files) -- auth, design, OWASP, pentesting, rate-limiting, event-driven, cloud-patterns, capstone (11 modules each)
- `modules/wsa/` -- Web Services Architecture modules (107 files)
- `openstack/` -- OpenStack track (13 files) -- labs, presentations, quizzes
- `cse/` -- Cloud Security Essentials (2 files)
- `labs/` -- 14 labs (AWS, architecture, CSE modules 01-08)
- `presentations/` -- 20 presentations (AWS, Azure, CSE series)
- `quizzes/` -- 24 quizzes
- `tools/` -- 15 interactive tools (AWS services, VPC, storage, IAM, automation)
- `games/` -- 12 games (cloud-hop, destroyer, IAM-debugger, AD-attack-path, etc.)
- `applets/` -- 4 applets (architecture, comparison, fundamentals)

**Content types:** 8 applets, 18 labs, 83 modules, 117 pages, 29 presentations, 15 tools

---

### Code House

| Field | Value |
|-------|-------|
| **URL** | `houses/code/` |
| **Files** | 550 |
| **Description** | Programming languages, DevOps, algorithms, data structures, software engineering |
| **Owner** | Code House |

**Sections:**
- `armory/` -- Code Armory: 17 language tracks (192 files) -- assembly, bash, c, cpp, csharp, go, java, javascript, lua-perl-r, php, powershell, python, python-graphics, ruby, rust, sql, swift-kotlin (11 modules each) + challenges, security guide, compare tool
- `algorithm-chamber/` -- Algorithm Chamber (122 files) -- 11 sections (complexity, data-structures, discrete-math, dp, geometry, graphs, greedy, sorting, strings, capstone) at 11 modules each
- `devops/` -- DevOps track (129 files) -- 128 section modules + index
- `modules/python-hub/` -- Python Hub (47 files)
- `modules/python-engineering/` -- Python Engineering (13 files)
- `labs/` -- 6 labs (CI/CD, Docker, Kubernetes, Terraform, CloudFormation, unit testing)
- `presentations/` -- 9 presentations
- `quizzes/` -- 7 quizzes
- `games/` -- 9 games (build-breaker, docker-escape, git-bisect, pipeline-panic, etc.)
- `tools/` -- 5 tools (Ansible, API, automation, sprint, Terraform)

**Content types:** 8 applets, 10 labs, 194 modules, 262 pages, 19 presentations, 5 tools

---

### Web House

| Field | Value |
|-------|-------|
| **URL** | `houses/web/` |
| **Files** | 300 |
| **Description** | Networking fundamentals, OSI model, routing, switching, wireless, network security |
| **Owner** | Web House |

**Sections:**
- `backbone/` -- Backbone advanced networking (166 files) -- 15 tracks (BGP, carrier, datacenter, forensics, InfiniBand, IPv6, MPLS, netsec, optical, QoS, routing, SDN, SD-WAN, wireless, capstone) at 11 modules each
- `network-essentials/` -- Network Essentials intro series (11 files, NE-01 through NE-10)
- `applets/ip-addressing/` -- IP addressing interactive applets (16 files)
- `applets/services/` -- Network services applets (3 files)
- `presentations/` -- 31 presentations (OSI, DNS, DHCP, OSPF, VLANs, wireless, etc.)
- `labs/` -- 8 labs (DNS, firewalls, subnetting, VLANs, packet analysis, etc.)
- `tools/` -- 27 interactive tools (subnet calculator, port lookup, OSI reference, etc.)
- `simulators/` -- Network simulators (Packet Tracer Lite v3, interactive simulator)
- `textbook/` -- Networking textbook (chapters 7-20)
- `games/` -- 10 games (packet-invaders, subnet-siege, DNS-resolver-race, etc.)
- `exams/` -- 2 exams + index
- `troubleshooting/` -- Troubleshooting reference (2 files)

**Content types:** 27 applets, 8 labs, 2 modules, 180 pages, 31 presentations, 27 tools

---

### Forge House

| Field | Value |
|-------|-------|
| **URL** | `houses/forge/` |
| **Files** | 281 |
| **Description** | Hardware, operating systems, Windows administration, CompTIA A+ content |
| **Owner** | Forge House |

**Sections:**
- `applets/comptia-aplus/` -- CompTIA A+ interactive applets (127 files)
- `applets/hardware/` -- Hardware applets (20 files)
- `md-100/` -- Microsoft MD-100 track (52 files) -- labs (25), presentations (11), quizzes (11), reviews (4)
- `md-101/` -- Microsoft MD-101 track (31 files) -- labs (9), presentations (9), quizzes (9), reviews (3)
- `labs/` -- 8 general labs (admin tools, control panel, hardware, Windows editions/settings)
- `presentations/` -- 6 presentations
- `games/` -- 8 games (bit-dash, chip-match, rack-stack, RAID-calculator, etc.)
- `tools/` -- 8 tools (admin, RAID, OS core, Windows components)
- `reviews/` -- 5 reviews (A+ Core 1, Core 2, jeopardy, binary blitz)

**Content types:** 36 applets, 98 labs, 56 pages, 39 presentations, 12 tools

---

### Shield House

| Field | Value |
|-------|-------|
| **URL** | `houses/shield/` |
| **Files** | 263 |
| **Description** | Cybersecurity fundamentals, compliance, cryptography, threat analysis, incident response |
| **Owner** | Shield House |

**Sections:**
- `applets/` -- 140 interactive applets across 10 categories: threats (30), crypto (40), compliance (21), fundamentals (14), network (11), risk (7), games (7), operations (5), access (4), governance (1)
- `cyber-framework/` -- Cyber Framework track (26 files) -- labs (8), presentations (8), quizzes (8), reviews (1)
- `security-101/` -- Security 101 intro series (9 files, 8 presentation modules)
- `ms-security/` -- Microsoft Security track (11 files, MS-SEC-01 through MS-SEC-10)
- `labs/linux/` -- Linux security labs (15 files)
- `labs/` -- 11 general labs (access control, compliance, cryptography, OSINT, etc.)
- `games/` -- 16 games (contra, debugger, phishing, malware-zoo, threat-runner, etc.)
- `presentations/` -- 8 presentations
- `tools/` -- 10 tools (CVE lookup, incident response, YARA, zero trust, etc.)

**Content types:** 146 applets, 34 labs, 39 pages, 24 presentations, 10 tools

---

### Dark Arts House

| Field | Value |
|-------|-------|
| **URL** | `houses/dark-arts/` |
| **Files** | 47 (house-level) |
| **Description** | Ethical hacking introduction, FEH (Foundations of Ethical Hacking) course, offensive security basics |
| **Owner** | Dark Arts House |

**Sections:**
- `feh/` -- Foundations of Ethical Hacking index (1 file)
- `labs/` -- 10 FEH labs + index
- `presentations/` -- 10 FEH presentations
- `quizzes/` -- 10 FEH quizzes + index
- `games/` -- 8 games (container security, IDS evasion, OSINT recon, phishing, etc.)
- `tools/ctf-leaderboard/` -- CTF leaderboard (2 files)
- `reviews/` -- FEH comprehensive review + index
- `vault/ehe/` -- EHE reference (1 file at house level; main content in Dark Arts Hub)

**Content types:** 8 applets, 11 labs, 11 pages, 10 presentations, 1 tool

---

### AI House

| Field | Value |
|-------|-------|
| **URL** | `houses/ai/` |
| **Files** | 190 |
| **Description** | Artificial intelligence, machine learning, deep learning, NLP, AI agents, AI security |
| **Owner** | AI House |

**Sections:**
- `cortex/` -- Cortex ML/AI track (155 files) -- 14 tracks (adversarial, capstone, CNN, cyber-ML, deep-learning, foundations, generative, math, MLOps, NLP, RL, supervised, transformers, unsupervised) at 11 modules each
- `labs/` -- 7 labs (agent workflow, ethics, fine-tuning, prompt injection, RAG, SOC triage, vector DB)
- `modules/` -- 7 applet-modules (agents, guardrails, prompt engineering, SOC automation, etc.)
- `presentations/` -- 6 presentations
- `quizzes/` -- 3 quizzes
- `games/` -- 5 games (agent-builder, guardrail-challenge, red-team, singularity, triage-trainer)
- `tools/` -- 6 tools (benchmark explorer, cost calculator, LLM comparison, tokenizer, etc.)

**Content types:** 11 applets, 7 labs, 144 pages, 6 presentations, 6 tools

---

### Eye House

| Field | Value |
|-------|-------|
| **URL** | `houses/eye/` |
| **Files** | 190 |
| **Description** | SOC operations, log analysis, SIEM, threat hunting, network traffic analysis, CySA+ prep |
| **Owner** | Eye House |

**Sections:**
- `applets/cyberops/` -- CyberOps interactive applets (99 files)
- `applets/osint/` -- OSINT applet (1 file)
- `cysa/` -- CySA+ certification track (50 files) -- labs (16), presentations (16), quizzes (16), reviews (1)
- `labs/` -- 7 labs (correlation, hunting, incident timeline, log detective, SIEM, SOC, traffic)
- `presentations/` -- 6 presentations
- `quizzes/` -- 5 quizzes
- `games/` -- 11 games (alert-triage, detection-engineering, grep-noir, log-centipede, etc.)
- `tools/` -- 6 tools (correlation, hunt, packet, SIEM, SOC, Wireshark)
- `modules/cyberops/` -- CyberOps modules (2 files)

**Content types:** 56 applets, 65 labs, 1 module, 28 pages, 22 presentations, 6 tools

---

### Key House

| Field | Value |
|-------|-------|
| **URL** | `houses/key/` |
| **Files** | 51 |
| **Description** | Cryptography -- symmetric, asymmetric, hashing, PKI, post-quantum, key management |
| **Owner** | Key House |

**Sections:**
- `labs/` -- 14 labs (AES, ECC, hashing, HMAC, KDF, PQC, steganography, etc.)
- `presentations/` -- 11 presentations
- `quizzes/` -- 8 quizzes
- `games/` -- 6 games (cipher-bubbles, cipher-cracker, crypto-flap, crypto-pong, etc.)
- `tools/` -- 7 tools (AES, ECC, HMAC, KDF, cert, lifecycle, PQC)

**Content types:** 2 applets, 14 labs, 1 module, 12 pages, 12 presentations, 7 tools

---

### Matrix House

| Field | Value |
|-------|-------|
| **URL** | `houses/matrix/` |
| **Files** | 1 (index only) |
| **Description** | Data science, data visualization, analytics, streaming -- content primarily delivered through Projects hub |
| **Owner** | Matrix House |

**Status:** Index page only. 10 projects tagged `matrix-*` exist in the Projects hub.

---

### Signal House (as house)

| Field | Value |
|-------|-------|
| **URL** | `houses/signal/` |
| **Files** | 0 (content lives in standalone Signal Hub) |
| **Description** | House identity for Signal -- hardware, IoT, embedded systems |
| **Owner** | Signal House |

**Note:** All Signal content is served from the standalone `signal/` hub path, not `houses/signal/`.

---

## Standalone Hubs

These hubs exist outside the `houses/` directory and serve specialized purposes.

---

### Dark Arts Hub (The Vault)

| Field | Value |
|-------|-------|
| **URL** | `dark-arts/` |
| **Files** | 228 |
| **Description** | Advanced offensive security content, gated behind progression gates. Contains the Vault (advanced attack labs), Bug Hunting Academy, EHE track, WiFi Arsenal, and malware analysis modules. |
| **Gate System** | 13 gates (gate-1 through gate-13) controlling progressive access |

**Sections:**
- `vault/bug-hunting/` -- Bug Hunting Academy (55 files) -- modules (27), labs (16), quizzes (7), tools (4)
- `vault/ehe/` -- Ethical Hacking Essentials track (45 files) -- modules (13), labs (20), quizzes (11)
- `vault/wifi-arsenal/` -- WiFi Arsenal (27 files) -- modules (10), labs (12), quizzes (3), tools (1)
- `vault/gates/` -- Gate challenges (21 files) -- gate-8 series (13 files), gates 6-7, 9-13
- `vault/labs/linux/` -- Linux offensive labs (24 files)
- `vault/modules/` -- Malware analysis modules (12 files) -- static/dynamic/behavioral analysis, reverse engineering, incident response, sandbox setup
- `vault/tools/` -- Offensive tool training (6 files) -- Nmap, Metasploit, Hydra, John, Hashcat, analysis toolkit
- `vault/` -- 20+ standalone attack labs (SQL injection, XSS, CSRF, SSRF, IDOR, buffer overflow, privilege escalation, etc.)
- `gates/` -- Top-level gates 2-5
- `ctf-leaderboard.applet.html` -- CTF scoreboard

**Content types:** 1 applet, 43 labs, 20 modules, 154 pages, 1 presentation

---

### Signal Hub

| Field | Value |
|-------|-------|
| **URL** | `signal/` |
| **Files** | 61 |
| **Description** | Hardware projects, IoT, embedded systems, Raspberry Pi, firmware, physical security tools |

**Sections:**
- `sections/foundations/` -- Hardware foundations (6 files)
- `sections/firmware-ops/` -- Firmware operations (6 files)
- `sections/network-recon/` -- Network recon hardware (6 files)
- `sections/security-tools/` -- Physical security tools (6 files)
- `sections/privacy-builds/` -- Privacy-focused builds (6 files)
- `sections/arcade-ops/` -- Arcade/retro hardware ops (6 files)
- `sections/field-prep/` -- Field preparation (3 files)
- `toolkit/` -- Signal Toolkit Library (21 files) -- 20 tool deep-dive pages + index

**Content types:** 32 pages, 20 tools, 9 index pages

---

### Forensics Hub

| Field | Value |
|-------|-------|
| **URL** | `forensics/` |
| **Files** | 27 |
| **Description** | Digital forensics -- evidence handling, disk forensics, memory forensics |

**Sections:**
- `sections/evidence-foundations/` -- Evidence foundations (10 modules)
- `sections/disk-forensics/` -- Disk forensics (8 modules)
- `sections/memory-forensics/` -- Memory forensics (8 modules)
- `index.html` -- Hub landing page

**Content types:** 26 modules, 1 index

---

### Arena / CTF Hub

| Field | Value |
|-------|-------|
| **URL** | `arena/` |
| **Files** | 23 |
| **Description** | BoxEngine-powered CTF challenges. Config-driven terminal simulation boxes with flag capture. |

**Boxes (22):**
- A-series (A1-A20): ancient-ledger, whispering-wall, phantom-shell, lost-root, custodians-key, broken-cipher, hollow-database, forgotten-upload, rusted-lock, glass-tunnel, dockerized-vault, mobile-scapegoat, rogue-sensor, ghost-machine, spectral-interceptor, corrupted-core, whisper-campaign, ghost-ram, foundations-fault, project-chimera
- NT1: network-troubleshoot
- PR7: red-vs-blue

---

### Operator Hub

| Field | Value |
|-------|-------|
| **URL** | `operator/` |
| **Files** | 25 |
| **Description** | Guided terminal missions -- scenario-based CLI challenges with config-driven environments |

**Mission Categories (24 missions):**
- Python (4 missions)
- Forensics (3 missions)
- Incident Response (3 missions)
- Linux Filesystem (3 missions)
- Recon (3 missions)
- Crypto (2 missions)
- Firewall (2 missions)
- Log Analysis (2 missions)
- Windows CMD (2 missions)

---

### Dispatch Hub

| Field | Value |
|-------|-------|
| **URL** | `dispatch/` |
| **Files** | 6 |
| **Description** | IT helpdesk troubleshooting scenarios. BoxEngine-powered real-world support ticket simulations. |

**Boxes (5):**
- AD001: Lockout Storm (Active Directory)
- HW001: Dead Workstation (Hardware inspection)
- NT1: Network Troubleshoot
- OS001: Boot Failure
- PR001: Printer Nightmare

---

### Arctic Hub

| Field | Value |
|-------|-------|
| **URL** | `arctic/` |
| **Files** | 17 |
| **Description** | CLI challenge districts -- curated paths through CLI/Linux content organized by skill domain |

**Districts (16):**
- CLI Fundamentals, CLH Fundamentals, CLH Intermediate, CLH Advanced
- Shell Scripting, Text Processing, Linux Admin, Sysadmin
- Databases, Networking, Log Analysis, Hardening
- Incident Response, Offensive Tools, Advanced Topics, Arena

---

### Projects Hub

| Field | Value |
|-------|-------|
| **URL** | `projects/` |
| **Files** | 89 |
| **Description** | Cross-house capstone projects. Each project is tagged to a house domain. |

**Projects by domain:**
- AI: 11 projects (RAG chatbot, face detection, threat classifier, etc.)
- Cloud: 10 projects (AWS VPC, Terraform, Kubernetes, serverless, etc.)
- Code: 10 projects (chat app, ecommerce, Arduino pipeline, etc.)
- Matrix: 10 projects (data viz, Kafka streaming, sentiment NLP, etc.)
- Script: 8 projects (ETL pipeline, GitHub Actions, system monitor, etc.)
- Dark Arts: 6 projects (Metasploit, port scanner, web scraping, etc.)
- Forge: 6 projects (sensor dashboard, Telegram bot, crossword, etc.)
- Key: 6 projects (blockchain, NFT marketplace, password vault, etc.)
- Shield: 6 projects (IDS/ML, log analyzer, AWS Cognito, etc.)
- Web: 6 projects (REST API, topology visualizer, Flask e-learning, etc.)
- Eye: 5 projects (OSINT dashboard, Playwright testing, PyTorch ONNX, etc.)
- Divergent: 4 projects (Discord bot, field terminal, Manim, multi-tool)

---

### Backbone (inside Web House)

| Field | Value |
|-------|-------|
| **URL** | `houses/web/backbone/` |
| **Files** | 166 |
| **Description** | Advanced networking track -- enterprise/carrier-grade topics beyond Network+ level |

**Tracks (15 at 11 modules each):**
BGP, Carrier Networks, Datacenter, Network Forensics, InfiniBand, IPv6, MPLS, Network Security, Optical, QoS, Routing, SDN, SD-WAN, Wireless, Capstone

---

### Cortex (inside AI House)

| Field | Value |
|-------|-------|
| **URL** | `houses/ai/cortex/` |
| **Files** | 155 |
| **Description** | Comprehensive ML/AI curriculum -- foundations through advanced topics |

**Tracks (14 at 11 modules each):**
Adversarial ML, Capstone, CNN, Cyber-ML, Deep Learning, Foundations, Generative AI, Math for ML, MLOps, NLP, Reinforcement Learning, Supervised Learning, Transformers, Unsupervised Learning

---

### Code Armory (inside Code House)

| Field | Value |
|-------|-------|
| **URL** | `houses/code/armory/` |
| **Files** | 192 |
| **Description** | Multi-language programming reference -- 17 language tracks with consistent module structure |

**Languages (17):**
Assembly, Bash, C, C++, C#, Go, Java, JavaScript, Lua/Perl/R, PHP, PowerShell, Python, Python Graphics, Ruby, Rust, SQL, Swift/Kotlin

---

### Algorithm Chamber (inside Code House)

| Field | Value |
|-------|-------|
| **URL** | `houses/code/algorithm-chamber/` |
| **Files** | 122 |
| **Description** | Algorithms and data structures curriculum |

**Sections (11):**
Complexity, Data Structures, Discrete Math, Dynamic Programming, Geometry, Graphs, Greedy Algorithms, Sorting, Strings, Capstone

---

### Hive

| Field | Value |
|-------|-------|
| **URL** | `hive/` + `components/hive/` |
| **Files** | 5 |
| **Description** | Multiplayer/collaborative game modes -- competitive, co-op, Red Queen |

**Components:** hive-competitive, hive-coop, hive-lobby, hive-redqueen

---

### Oasis

| Field | Value |
|-------|-------|
| **URL** | `oasis/` |
| **Files** | 2 |
| **Description** | Challenge area (index + challenge page) |

---

## Certification Tracks

Certification content is organized as index landing pages under `houses/` that aggregate content from multiple houses. Each has 1 index page.

| Cert Track | URL | Exam Code | Primary Houses |
|------------|-----|-----------|----------------|
| CompTIA A+ Core 1 | `houses/aplus-core1/` | 220-1101 | Forge |
| CompTIA A+ Core 2 | `houses/aplus-core2/` | 220-1102 | Forge |
| CompTIA Network+ | `houses/comptia-network/` | N10-009 | Web |
| CompTIA Security+ | `houses/security-plus/` | SY0-701 | Shield |
| Security+ Crypto Domain | `houses/security-plus-crypto/` | SY0-701 | Shield, Key |
| CompTIA CySA+ | `houses/cysa-plus/` | CS0-003 | Eye |
| CompTIA CASP+ | `houses/casp-plus/` | CAS-004 | Shield, Dark Arts |
| CompTIA Linux+ | `houses/comptia-linux/` | XK0-005 | Script |
| Cisco CCNA | `houses/ccna/` | 200-301 | Web |
| AWS Cloud Practitioner | `houses/aws-ccp/` | CLF-C02 | Cloud |
| AWS Developer Associate | `houses/aws-developer/` | DVA-C02 | Cloud |
| Azure Fundamentals | `houses/azure-fundamentals/` | AZ-900 | Cloud |
| Cryptography Track | `houses/cryptography-track/` | -- | Key |
| DevOps Fundamentals | `houses/devops-fundamentals/` | -- | Code |
| Security Operations (SOC) | `houses/security-operations/` | -- | Eye |

---

## Special Areas

### Dashboard

| Field | Value |
|-------|-------|
| **URL** | `dashboard.html` |
| **Files** | 1 |
| **Description** | Student dashboard -- progress tracking, house affiliation, achievements, navigation hub |

### Admin

| Field | Value |
|-------|-------|
| **URL** | `admin/` |
| **Files** | 2 |
| **Description** | Admin console and content audit tool. Instructor-only access. |

### Workshop

| Field | Value |
|-------|-------|
| **URL** | `workshop/` |
| **Files** | 7 |
| **Description** | Recalled/experimental content shelf. Admin-gated. Contains pulled Arena boxes and legacy Hive. |

**Items:** a1-ancient-ledger, a2-shadow-encoder, backup-or-bust, network-forensics-lab, old-hive

### Components

| Field | Value |
|-------|-------|
| **URL** | `components/` |
| **Files** | 18 |
| **Description** | Shared UI components -- analytics dashboards, messaging, multiplayer, mascot, profile, tourist flow |

### Root Pages

| Field | Value |
|-------|-------|
| **URL** | `/` (root) |
| **Files** | 20 |
| **Description** | Top-level pages -- index, about, FAQ, quickstart, sorting, career-quiz, privacy, subscription, terminal, games, etc. |

---

*Registry version: 1.0 -- Source: CONTENT_AUDIT.json (3,231 files)*
