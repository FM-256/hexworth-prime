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

Signature-based code scanner. Every bug found gets its signature added as a test fixture for regression. Currently tracks 7,312 issues across 30+ rule codes.

20+ validators including HEUR-029 (looks-clickable, isn't), XREF-001 (cross-layer ID coupling), DEP-* (dependency check), BLOB-* (content blob detection), CSP, PALETTE, ASGN, plus the originals: HTML, JS, Engine, Path, LearningPaths, Naming, Heuristics, ContentCatalog, Navigation, Emoji, Semantic.

The Emoji validator alone has 6 rules, decodes Unicode surrogate pairs, and scans 162 JS files. The codebase has 0 decorative emoji — all 125 webp icons generated via fal.ai.

```
node cli.js -p ../../_app           # full scan, reports to TREASURE_MAP.json
node tests/run.js                   # 54 regression tests (all passing as of 2026-05-03)
```

#### EduScan Smoke Gate (pre-deploy)
`_tools/eduscan/smoke/`

Real-browser pre-render check that runs before `firebase deploy`. Spins up a local HTTP server pointed at `_app/`, launches Puppeteer headless, hits 6 critical pages with localStorage seeding, and asserts:
- Zero unfiltered JS errors (pageerror + console.error + requestfailed)
- Required DOM elements present (e.g., dashboard mini-house-cards, house module-cards, WSA hub data-module attrs)

Catches the v7.1.0 ZION class of failure (JS cascade leaves cards visible-but-dead, smoke battery returns HTTP 200s).

```
node _tools/eduscan/smoke/run.js              # standalone — exit 0 pass, 1 fail
SKIP_SMOKE=1 SKIP_SMOKE_REASON="why"          # emergency override (audit-logged)
```

**Canonical deploy command** (replaces bare `firebase deploy --only hosting`):
```
./deploy.sh                                   # branch check → Nexus → smoke → firebase deploy → Confluence inventory regen
./deploy.sh --strict                          # Nexus blocks on HIGH too
./deploy.sh --force                           # skip Nexus only
./deploy.sh --skip-smoke                      # skip smoke only
./deploy.sh --skip-inventory                  # skip Confluence inventory post-deploy hook only
./deploy.sh --force --skip-smoke              # skip both gates (explicit, audit-friendly)
```

The Confluence inventory step is non-blocking by contract — it logs warnings but never fails the deploy. Implementation: `_tools/confluence/push_hub_inventory.sh`. Note: Confluence silently dedups identical content (PUT returns 200 but version stays same); the script treats that as a normal "no semantic change" outcome rather than a warning.

For non-hosting deploys (functions, firestore rules), use the standalone smoke wrapper:
```
_tools/eduscan/smoke/deploy.sh --only functions
_tools/eduscan/smoke/deploy.sh --only firestore:rules,firestore:indexes
```

#### Runtime Monitor (continuous)
`_tools/runtime-monitor/`

Cloud Run job triggered by Cloud Scheduler every 15 min. Same Puppeteer headless probes as the smoke gate, but pointed at LIVE production (`https://hexworth.com`) instead of a local server. Outputs structured JSON to Cloud Logging.

Catches outages that occur AFTER deploy passed: CDN propagation issues, Firestore index changes, third-party degradation, slow-burn JS errors that only surface after auth-token refresh.

Live status:
```
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' --limit 1 --format='value(timestamp,jsonPayload.allPassed,jsonPayload.passed,jsonPayload.failed)'
```

Deploy + scheduler details: `_tools/runtime-monitor/DEPLOY.md`.

**Email alert MVP (shipped 2026-05-05):** Cloud Monitoring log-based metric `runtime_monitor_failure` (counts cycles where `jsonPayload.allPassed=false`) wired to alert policy `runtime-monitor WARN — failures detected in last 30 min`. Threshold: any failure in rolling 30-min window. Notification: email to `f.mora80@gmail.com`. Auto-close: 30 min. Full design (Phase A/B/C) in `_docs/operations/sym-3-tiered-alerts-design.md`; Phases B (Cloud Function watcher + push notifications) and C (PAGE-tier email via SendGrid) deferred.

#### Cost Monitor (shipped 2026-05-05)
GCP Cloud Billing budget alert at $30/month for the `hexworth-prime` project, attached to the Firebase Payment billing account (`0123C4-A62FA8-F61316`). Three thresholds:
- 50% ($15) — INFO email (validates the alert pipeline)
- 100% ($30) — WARNING email (the actual page)
- 110% ($33) — CRITICAL email (cost has overshot)

Catches cost regressions early without paging on every $5 fluctuation. Current baseline ~$5-15/month for the runtime monitor stack. Setup runbook + per-service breakdown queries: `_docs/operations/sym-13-gcp-cost-monitoring.md`.

#### Safety net architecture (full picture)

```
[1] PRE-COMMIT      [2] PRE-MERGE       [3] PRE-DEPLOY      [4] CONTINUOUS
single-file lint    cross-file checks   smoke + nexus       runtime monitor
~1 sec              ~5 sec              ~60 sec             every 15 min
local hook (SYM-5)  local script        deploy.sh chain     Cloud Run job
                                          ↓                   ↓
                                          confluence sync     log-based metric
                                                              ↓
                                                              alert policy (SYM-3)
                                                              ↓
                                                              email to operator
                                                              + GCP cost budget
                                                              ($30/mo, SYM-13)
```

Per-stage validator matrix and override rules: `_docs/operations/safety-net-architecture.md`.
What humans do when a stage fires after deploy: `_docs/operations/incident-response-playbook.md`.
How to use the architecture for a high-stakes merge: `_docs/operations/fusion-runbook.md`.

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

Ubuntu 24.04 box. Always on. The warehouse, the scraper farm, the AI workbench. The laptop stays lean — bc1 does the heavy lifting.

**Connection:**
- `ssh bc1` — works from anywhere (Tailscale mesh VPN, IP `100.96.136.114`)
- LAN IP: `192.168.1.176` (home network only)
- User: `eq1`, passwordless sudo, Docker-ready
- Runtime: Python 3.12, Node 22, full dev toolchain

**Directory layout on bc1:**
```
~/hexworth/
├── content/                ← COLD STORAGE (not synced — the warehouse)
│   ├── mdn/               ← Mozilla Developer Network scrape
│   ├── w3schools/          ← W3Schools scrape
│   ├── react/              ← React docs scrape
│   ├── nodejs/             ← Node.js docs scrape
│   ├── git/                ← Git reference scrape
│   ├── geeksforgeeks/      ← GeeksforGeeks scrape
│   ├── javascript-info/    ← javascript.info scrape
│   └── ... (12 libraries, ~30MB total)
└── tools/                  ← SYNCED to laptop via Syncthing
    ├── workbench/          ← Content loading dock (fetched items land here)
    └── icon-library.html   ← Shared tools/reports
```

**Syncthing (real-time file sync):**
- bc1 `~/hexworth/tools/` ↔ laptop `~/hexworth-shared/`
- Bidirectional, ~15 second propagation, systemd user services on both machines
- Tailscale IP primary, LAN fallback. No relays, no public discovery — private mesh only.
- HTTP server on bc1: `http://192.168.1.176:8090/` serves the tools folder

### AI Engines on bc1

bc1 has multiple AI models installed for delegating work — scraping, content research, brainstorming, and automation. The idea: offload long-running AI tasks to bc1 so the laptop isn't tied up.

| Engine | How to Run | Auth Status |
|--------|-----------|-------------|
| **Gemini API** | Python `google-genai` SDK | Ready — key in `/etc/environment` |
| **Gemini CLI** | `ssh bc1 -t "gemini"` | Needs browser auth (Google Pro account) |
| **Claude Code** | `ssh bc1 -t "claude"` | Needs browser auth |
| **OpenAI SDK** | Python `openai` SDK | Key set, needs billing credits |
| **GitHub Copilot** | `gh copilot` | Needs `ssh bc1 -t "gh auth login"` |

**Primary use case:** Gemini on bc1 runs scrapers. Gemini has 1M token context and 1000 req/day on the Pro subscription — ideal for parsing large documentation sites, extracting structured content, and converting to markdown.

**Running AI tasks on bc1:**
```bash
# Quick test
ssh bc1 'python3 -c "from google import genai; import os; c=genai.Client(api_key=os.environ[\"GEMINI_API_KEY\"]); print(c.models.generate_content(model=\"gemini-2.5-flash\", contents=\"hello\").text)"'

# Fire and forget a scraper
ssh bc1 'cd ~/hexworth/tools && nohup python3 scraper.py --source mdn > scraper.log 2>&1 &'

# Check results later
ssh bc1 'cat ~/hexworth/tools/scraper.log'
ssh bc1 'hexcontent list'
```

### Content Pipeline

This is how content flows from the internet into student-facing modules:

```
┌─────────────────────────────────────────────────────────────┐
│                        bc1 (server)                         │
│                                                             │
│   Gemini scrapes docs ──→ ~/hexworth/content/ (cold)       │
│                               │                             │
│                     hexcontent fetch                         │
│                               │                             │
│                     ~/hexworth/tools/workbench/              │
│                               │                             │
│                          Syncthing                           │
└───────────────────────────────┼─────────────────────────────┘
                                │ (~15 sec)
┌───────────────────────────────┼─────────────────────────────┐
│                        Laptop (msi)                         │
│                               │                             │
│                     ~/hexworth-shared/workbench/             │
│                               │                             │
│                     Build module in _app/                    │
│                               │                             │
│                     firebase deploy                          │
└─────────────────────────────────────────────────────────────┘
```

1. **Scrape** — Gemini on bc1 scrapes documentation sites → saves to cold storage
2. **Fetch** — `ssh bc1 "hexcontent fetch mdn"` → copies to workbench → Syncthing syncs to laptop
3. **Build** — We build the module on the laptop using the scraped content as reference
4. **Stash** — `ssh bc1 "hexcontent stash mdn"` → content goes back to cold, laptop stays clean
5. **Deploy** — `npx firebase deploy --only hosting`

**Key principle:** Content never lives on the laptop permanently. bc1 is the warehouse. The workbench is just a loading dock — fetch what you need, build with it, stash it back.

### Scraper Architecture (Planned)

Sprint items SC-1 and SC-2 define the scraper framework (`_tools/scraper-core/`). Not yet built, but the design is locked:

- **BaseScraper class** (Python) — rate limiting, retry logic, User-Agent rotation, response caching, HTML-to-markdown, resume capability
- **Storage schema** — `output/{source}/{category}/{item-slug}/content.md` + `metadata.json`
- **Content sources** — Microsoft Learn, GitHub repos, documentation sites (MDN, W3Schools, etc.)
- **Related sprint series**: RS (Repo Scout — GitHub/GitLab discovery), JS (Job Search scraper), GF (Grant Finder scraper), BH (Hunting Grounds — CTF content), AI (AI House content hubs)

All scrapers run on bc1. All output goes to cold storage. The laptop only sees content when explicitly fetched via `hexcontent`.

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
- **Private/Sensitive Files (gitignored, local-only):** Four directories — `_hex/` (operator vault: CTF flags, secrets), `_planning/` (active design workspace), `_archive/` (deprecated content kept for retrieval), `_spellbook/` (change manifests). Different semantics each. Authoritative policy: [`_docs/architecture/private-directories.md`](../_docs/architecture/private-directories.md).
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
