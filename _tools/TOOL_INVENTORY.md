# Hexworth Prime — Developer Tool Inventory

> Last updated: 2026-02-27

## Overview

Over the course of building Hexworth Prime, six core developer tools emerged organically to handle different aspects of quality, tracking, and diagnostics. A seventh — Nexus — was designed to connect them. This document catalogs what exists, how they relate, and where the integration opportunities are.

---

## The Six Core Tools

### 1. EduScan — Build-Time Code Scanner

| | |
|---|---|
| **Type** | CLI (Node.js) |
| **Location** | `_tools/eduscan/` |
| **Data** | `_tools/reports/` (JSON scan history, backups) |
| **Run** | `npm run scan:syntax`, `npm run scan:quick` |

Signature-based scanner modeled after antivirus software. Every bug found gets its signature added to test fixtures for regression. Runs at build-time against the full codebase.

**Components:**
- 14 syntax validators: HTML, JS, Engine, Path, LearningPaths, AssignmentLinks, Naming, Heuristics, ContentCatalog, DependencyCheck, CSP, Navigation, Emoji, ContentDiscovery
- 12 auto-fixers in `fixers/` for targeted pattern repairs
- Quarantine allowlist for known false positives
- Drift tracking via scan history diffs
- Test suite with fixture-based expectations

**Outputs:** JSON scan reports, HTML backups of fixed files, console summary

---

### 2. Sprint Master — Sprint Backlog Tracker

| | |
|---|---|
| **Type** | CLI (Node.js) |
| **Location** | `_tools/sprint-master/sprint.js` |
| **Data** | `_tools/sprint-master/sprints.json` |
| **Run** | `node _tools/sprint-master/sprint.js <command>` |

JSON-based sprint backlog manager with series prefixes for categorization.

**Status lifecycle:** `backlog` → `open` → `in-progress` → `partial` → `awaiting-qc` → `done` (also: `blocked`, `deferred`)

**Series prefixes:** A (Architecture), AR (Arena), DA (Dark Arts), ES (EduScan), F (Feature), HD (Handler Dashboard), L (Linux), M (Migration), MX (Matrix), PR (Product Readiness), QC (Quality Control), R (Registration), WSA (Windows Server Admin), TC (Theme/Cosmetic)

**Commands:** `list`, `show`, `add` (interactive), `update`, `delete`, `triage`, `dashboard`, `next`, `blocked`, `search`, `stats`, `export --md`

**Outputs:** Terminal dashboard, markdown export

---

### 3. Spellbook — Feature Ticketing System

| | |
|---|---|
| **Type** | Markdown files + Python server + HTML viewer |
| **Location** | `_spellbook/` |
| **Data** | `_spellbook/spells/`, `incantations/`, `brews/`, `spell-index.json` |
| **Run** | `python _spellbook/server.py` (port 31337), or `Start-Spellbook-Viewer.bat` |

Markdown-based ticketing system for feature-level work tracking. Each "spell" is a full work item with lifecycle tracking.

**Terminology:** Ticket=Spell, Rescue Log=Incantation, KBA=Brew, Check out=Cast, Check in=Seal, Sub-ticket=Charm

**Lifecycle:** `SCRIBED` → `CAST` → `SEALED` → (optionally) `BREWED`

**Components:**
- `spells/` — Active and resolved tickets (SPELL-001 through SPELL-060+)
- `incantations/` — Transaction logs for complex operations
- `brews/` — Knowledge Base Articles distilled from completed spells
- `viewer.html` — Browser-based spell viewer (73KB, full-featured)
- `server.py` — Python HTTP server for local viewing
- Manifest files tracking changes by date range

**Outputs:** Markdown tickets, HTML viewer, KBA articles

---

### 4. ToDo CLI — Quick Task Manager

| | |
|---|---|
| **Type** | CLI (Bash + jq) |
| **Location** | `~/.local/bin/todo` (system-wide) |
| **Data** | `~/.todo-data.json` |
| **Run** | `todo <command>` |

Lightweight personal task list for quick capture during development sessions.

**Commands:** `add <task>`, `list [--all]`, `done <id>`, `undo <id>`, `remove <id>`, `clear`

**Outputs:** Colored terminal output with pending/completed counts

---

### 5. HED + HealthPanel — Runtime Error Monitor

| | |
|---|---|
| **Type** | Browser runtime (auto-loaded on every page) |
| **Location** | `_app/components/HED.js` + `_app/components/HealthPanel.js` |
| **Data** | `localStorage` (ring buffer, max 100) + Firestore `hed_reports` collection |
| **Run** | Auto-loaded by FluxCapacitor.js; admin floating panel or dashboard tab |

Two-layer runtime error monitoring system that captures errors in student browsers.

**HED.js (Host Error Detector):**
- `HED-001`: JS runtime errors (window.onerror)
- `HED-002`: Unhandled promise rejections
- `HED-003`: console.error interception
- `HED-004`: Resource load failures (scripts, images, CSS)
- Benign filter (skips Firebase, CORS, mixed-content noise)
- Cloud reporting: buffers up to 10 errors per session, flushes to Firestore with session ID, user ID, house
- Floating diagnostic dot (bottom-left, admin-gated): green=healthy, red pulse=errors

**HealthPanel.js:**
- Full dashboard panel with stats grid (total + per-code breakdown)
- Filter buttons by error type
- Card-based error list (newest first)
- Export JSON + Clear Log actions
- Real-time updates via `hexworth:hedError` event

**Outputs:** localStorage log, Firestore reports, floating overlay, dashboard panel, JSON export

---

### 6. Audit Tool — Content & Structural Auditor

| | |
|---|---|
| **Type** | Browser-based admin tool + CLI scripts |
| **Location** | `_app/admin/audit-tool.html` + `_app/scripts/audit-*.js` |
| **Data** | In-memory + HTML reports in `_planning/reports/` |
| **Run** | Dashboard footer → "Audit Tool" link, or `node _app/scripts/audit-*.js` |

Admin-only browser tool for content validation and structural auditing. Accessible from dashboard footer.

**Phases:**
| Phase | Purpose | Status |
|-------|---------|--------|
| 1 | SAMPLE_MODULES ↔ ContentRegistry sync check | Complete |
| 2 | House structural audit (missing paths, placeholder functions, coming-soon) | Complete |
| 2.5 | Fix Forge — generates copyable code fixes | Complete |
| 3 | CloudFront URL validation | Not started |
| 4 | Local file existence check | Not started |
| 5 | Orphan detection (HTML files not in any registry) | Not started |

**CLI Scripts:**
- `audit-registry.js` — verify content-registry paths exist on disk
- `audit-categories.js` — check SAMPLE_MODULES for required properties
- `generate-audit-report.js` — full HTML audit report with dashboards
- `audit-house-indexes.js` — validate house index.html files
- `coming-soon-scanner.js` — multi-pattern "coming soon" content detection
- `js-syntax-checker.js` — JS syntax validation via vm.Script

**Outputs:** Browser UI, HTML reports, JSON export, console output

---

### 7. Nexus — Hub & Spoke Tool Orchestrator

| | |
|---|---|
| **Type** | CLI (Node.js) |
| **Location** | `_tools/nexus/` |
| **Data** | `_tools/nexus/findings.json` (aggregated findings) |
| **Run** | `node _tools/nexus/nexus.js <command>` |

Hub & Spoke orchestrator that connects the other six tools through spoke adapters and a shared findings format. Automates the manual handoffs between detection, tracking, and reporting.

**Spoke adapters:** EduScan (source), Sprint Master (sink), Spellbook (sink), ToDo (sink), HED (source), Audit Tool (bidirectional)

**Planned commands:** `nexus status`, `nexus scan`, `nexus triage`, `nexus report`, `nexus gate`, `nexus sync`

**Shared interface:** Each spoke adapter implements `getFindings()`, `getStatus()`, `acceptFinding()`

**Status:** Phase 1 — Documentation complete. No code yet.

**Outputs:** Unified findings store (JSON), terminal status dashboard, deploy gate pass/fail

---

## Supporting Tools (Not Core Six, But Part of the Ecosystem)

| Tool | Type | Location | Purpose |
|------|------|----------|---------|
| fal.ai Generators | Python | `tools/generate_*.py` | Image generation (trophies, medals, icons) |
| Content Encoder | Python | `_tools/content-encoder.py` | Base64 content encoding |
| Brand Hasher | Python | `_tools/brand_hashing.py` | Consistent brand hash generation |
| Hash Quiz Answers | Node | `_app/scripts/hash-quiz-answers.js` | SHA-256 quiz answer obfuscation |
| Registry Generator | Node | `_tools/eduscan/generate-content-registry.js` | Auto-generate content-registry.js |
| Inject Access Guard | Python | `_tools/inject-access-guard.py` | Insert access-guard.js into HTML pages |
| Firebase Functions | Node | `functions/` | setAdminClaim, validateFlag |
| Git Commit Hook | Bash | `~/.git-hooks/commit-msg` | Block AI attribution in commits |
| deploy.sh | Bash | root | Firebase hosting deploy |
| Repo Scout | Node | `_tools/repo-scout/` | Repository analysis |

---

## Data Flow Today (No Integration)

```
BUILD TIME                    RUNTIME                     ON-DEMAND
──────────                    ───────                     ─────────

 EduScan                       HED                        Audit Tool
 (scans code)                  (captures errors)          (checks content)
     │                             │                           │
     ▼                             ▼                           ▼
 JSON reports               localStorage                  Browser UI
 in _tools/reports/          + Firestore                  + HTML reports
                             hed_reports
     ╳                             ╳                           ╳
     │                             │                           │
     ╳  ── no connection ──  ╳  ── no connection ──  ╳
     │                             │                           │
     ▼                             ▼                           ▼
 (manual review)             (manual review)             (manual review)


TRACKING (all disconnected from detection)
──────────────────────────────────────────

 Sprint Master          Spellbook              ToDo
 (sprint items)         (feature tickets)      (quick tasks)
     │                       │                      │
     ▼                       ▼                      ▼
 sprints.json           .md files              ~/.todo-data.json
```

Every detection → tracking step is manual. Every cross-tool reference is manual.

---

## Planned Data Flow (With Nexus)

```
BUILD TIME                    RUNTIME                     ON-DEMAND
──────────                    ───────                     ─────────

 EduScan                       HED                        Audit Tool
 (scans code)                  (captures errors)          (checks content)
     │                             │                           │
     │  getFindings()              │  getFindings()            │  getFindings()
     │                             │                           │
     └─────────────────┬───────────┴───────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   NEXUS HUB     │
              │                 │
              │  findings[]     │
              │  pipes[]        │
              │  gate policy    │
              └────────┬────────┘
                       │
          ┌────────────┼────────────────┐
          │            │                │
          ▼            ▼                ▼
    Sprint Master   Spellbook       ToDo CLI         GitHub Issues
    (auto-triage)   (feature link)  (quick tasks)    (auto-create)
          │            │                │                  │
          ▼            ▼                ▼                  ▼
    sprints.json   .md files     ~/.todo-data.json   gh issue create
```

Detection → tracking is automated. One unified view via `nexus status`.

---

## Integration Opportunities

See the bridge/merge/hub analysis for detailed scenarios and trade-offs.

Key gaps:
1. **Detection → Tracking**: No automated path from finding a bug to tracking it
2. **Runtime → Build**: HED errors don't inform EduScan signatures
3. **Cross-tool reporting**: No unified view of all findings
4. **GitHub Issues**: HED "Copy Log" exists but no automated issue creation
5. **Tracker overlap**: Sprint Master, Spellbook, and ToDo all track work at different granularities with no cross-references
