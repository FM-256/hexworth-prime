# The Hexworth Ecosystem

A field guide to the organized chaos.

---

## What Is This?

Hexworth is a gamified cybersecurity education platform. Students join houses, complete modules, earn XP, hack CTF boxes, and level up. Handlers (instructors) manage classes, track progress, and assign content through a dashboard.

It looks like a hacking academy crossed with Hogwarts, rendered in neon cyan on black.

There are three products, three repos, three Firebase projects:

| Product | What | Status |
|---------|------|--------|
| **Arena** | Card game — incident response tabletop sim | Alpha, proof of concept |
| **Colosseum** | Arena v2 — the product sandbox | Beta |
| **Prime** | The platform — B2B educational product | Production, v5.0.0 "THE ARCHITECT" |

This repo is **Prime**. 1,085 commits, 1,997 HTML files, 213 JS components, 142MB, 417 sprint items (201 done).

---

## The Platform (_app/)

Static frontend + Firebase backend. No build step, no bundler, no framework. Raw HTML/CSS/JS served by Firebase Hosting. Firestore for data, Cloud Functions for server authority.

### Houses

Students are sorted into houses by interest. Each house is a domain with its own content, theme, mascot, and emblem.

| House | Domain | Vibe |
|-------|--------|------|
| **Shield** | Defense, compliance, GRC | The protectors |
| **Dark Arts** | Offensive security, ethical hacking | The attackers |
| **Eye** | Threat intel, forensics, OSINT | The watchers |
| **Cloud** | Cloud infra, Azure, AWS | The architects |
| **Forge** | Sysadmin, Windows, CompTIA | The builders |
| **Web** | Networking, protocols, HTTP | The connectors |
| **Code** | Programming, Python, algorithms | The makers |
| **Key** | Cryptography | The ciphers |
| **Script** | Linux, Bash, automation | The automators |
| **AI** | Machine learning, agents, prompt eng | The machines |
| **Matrix** | Prestige tier — cross-domain mastery | The chosen |

### Key Components

- **Dashboard** (`dashboard.html`) — student home: progress, XP, leaderboard, activity feed, daily missions
- **Handler Dashboard** (`handler-dashboard.html`) — instructor view: roster, analytics, assignments, exports, 7 analytics features
- **CTF Arena** (`arena/`) — capture-the-flag boxes with real exploitation scenarios
- **Global Search** (`components/GlobalSearch.js`) — Ctrl+K overlay, searches all content
- **Content Catalog** (`components/ContentCatalog.js`) — registry of every module, quiz, lab, presentation
- **Learning Paths** (`components/LearningPaths.js`) — prerequisite chains and course progression
- **StateFederation** (`components/StateFederation.js`) — cross-device progress sync

### Content Types

- **Presentations** — slide-based lessons with progress tracking
- **Labs/Applets** — interactive hands-on exercises (native HTML, no iframes)
- **Quizzes** — scored assessments with hash-verified answers
- **Games** — gamified learning (Cookie Caper, What's My Crime, IDS Evasion, etc.)
- **CTF Boxes** — multi-flag hacking challenges with hint systems

---

## The Toolchain (_tools/)

All custom-built. All CLI. All interconnected.

### Nexus — The Command Center
`_tools/nexus/`

Hub-and-spoke aggregator. Pulls data from every other tool into one dashboard. Gate system blocks deploys on critical findings. Pipe system routes findings to GitHub issues.

6 spoke adapters: EduScan, Sprint Master, HED, Audit, Spellbook, ToDo.

```
node nexus.js status     # unified dashboard
node nexus.js findings   # all findings across all spokes
node nexus.js gate       # pass/fail deploy check
```

### EduScan — The Antivirus
`_tools/eduscan/`

Signature-based code scanner. Every bug found gets its signature added as a test fixture for regression. Currently tracks 7,312 issues across 30 rule codes.

14 validators: HTML, JS, Engine, Path, LearningPaths, AssignmentLinks, Naming, Heuristics, ContentCatalog, DependencyCheck, CSP, Navigation, Emoji, Semantic.

The Emoji validator alone has 6 rules, decodes Unicode surrogate pairs, and scans 162 JS files. The codebase has 0 decorative emoji — all 125 webp icons generated via fal.ai.

```
node cli.js -p ../../_app           # full scan, reports to TREASURE_MAP.json
node tests/run.js                   # 36 regression tests
```

### Sprint Master — The Backlog
`_tools/sprint-master/`

JSON-based sprint tracker. 417 items across 30+ series (Architecture, Arena, Dark Arts, EduScan, Features, Handler Dashboard, Linux, Migration, etc.). Dependencies, blocking chains, priority triage.

```
node sprint.js list                 # full backlog
node sprint.js dashboard            # summary view
node sprint.js search <term>        # find items
node sprint.js next                 # what to work on
```

### hexcontent — The Loading Dock
`_tools/hexcontent` (also `/usr/local/bin/hexcontent` on bc1)

Content shuttle between bc1 cold storage and the Syncthing shared folder. Laptop stays lean — bc1 is the warehouse, workbench is the loading dock.

```
hexcontent list                     # cold storage inventory
hexcontent fetch mdn                # copy to workbench → syncs to laptop
hexcontent stash mdn                # done → back to cold storage
hexcontent status                   # what's checked out
```

### Icon Library
`_tools/icon-library.html`

Visual catalog of all 125 webp icons. Searchable grid, click-to-copy paths, reference counts. Also served on bc1 at `http://192.168.1.176:8090/icon-library.html`.

### Other Tools
- **Repo Scout** (`_tools/repo-scout/`) — GitHub/GitLab content discovery (planned)
- **Scraper Core** (`_tools/scraper-core/`) — shared scraper framework (planned)
- **AI Scraper** (`_tools/ai-scraper/`) — Microsoft Learn content scraper
- **PraxisProctor** (`_tools/PraxisProctor/`) — exam proctoring system
- **ToDo** (`_tools/todo/`) — simple task tracker (Nexus spoke)

---

## Infrastructure

### bc1 — The Home Server
Ubuntu 24.04 box on the local network. Always on. Runs scrapers, stores content, hosts tools.

- **Tailscale**: mesh VPN — `ssh bc1` works from anywhere (100.96.136.114)
- **Syncthing**: bidirectional real-time sync — `~/hexworth/tools/` ↔ `~/hexworth-shared/` on laptop
- **Cold storage**: `~/hexworth/content/` — 12 scraped content libraries (MDN, W3Schools, React, Node.js, etc.)
- **AI engines**: Claude Code CLI, Gemini CLI, OpenAI SDK, GitHub Copilot

### Content Pipeline
1. Gemini scrapes on bc1 → stores in cold storage
2. `hexcontent fetch` → moves to workbench → Syncthing syncs to laptop
3. We build the module on the laptop
4. `hexcontent stash` → back to cold storage, laptop stays clean
5. Deploy to Firebase Hosting

### Firebase
- **Hosting**: static files, zero build step
- **Firestore**: user profiles, progress, class data, activity feeds
- **Cloud Functions**: XP authority, HED export, server-side validation
- **Security Rules**: field whitelist for profile updates (must update when adding fields)

---

## Conventions

- **No emoji.** All replaced with webp icons from `/assets/images/icons/`. EduScan enforces this.
- **No AI attribution** in commits. Global git hook blocks "Co-Authored-By: Claude" etc.
- **No build step.** Raw HTML/CSS/JS. If it needs a bundler, rethink the approach.
- **Test modes in tools.** Every scraper/script gets a `--test` flag.
- **Fire and forget.** Long-running tasks get `nohup`, check results later.
- **Plan before building.** Architectural changes get a green light first.
- **`_tools/` is gitignored** — files must be `git add -f` to track.
- **position:fixed is broken** when `body.style.filter` is set. Use `position: absolute` + scroll offset. EduScan rule HEUR-008 catches this.

---

## The Arena (Card Game)

Separate product, separate repo (`hexworth-arena`). Cybersecurity incident response card game.

- 230 cards across 6 decks (Core, Cloud, General, Insider Threat, ICS/OT, Social Engineering)
- 7 scenarios with pacing modes
- 5 card types: Attack, Response, Inject, Role, Consultant
- Resolver engine: pure functions, deep-clone state
- Public view: stock price, news ticker, security rating

---

## Quick Reference

```
# Deploy
npx firebase deploy --only hosting

# Scan
cd _tools/eduscan && node cli.js -p ../../_app

# Sprint
cd _tools/sprint-master && node sprint.js dashboard

# Nexus
cd _tools/nexus && node nexus.js status

# Content shuttle (on bc1)
hexcontent list / fetch / stash / status

# SSH to server (works anywhere)
ssh bc1
```

---

*Last updated: 2026-03-02 · v5.0.0 "THE ARCHITECT" · 1,085 commits and counting*
