# Nexus Hub & Spoke Architecture

**Created:** February 27, 2026
**Purpose:** Architecture deep-dive for the Nexus tool orchestrator
**Status:** COMPLETE (all 5 phases shipped)

---

## Architectural Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXUS HUB                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Spoke       │    │  Pipe        │    │  Findings    │                  │
│  │  Registry    │    │  Router      │    │  Store       │                  │
│  │              │    │              │    │              │                  │
│  │  adapters[]  │───▶│  pipes[]     │───▶│  findings[]  │                  │
│  │  status()    │    │  route()     │    │  query()     │                  │
│  │  health()    │    │  transform() │    │  aggregate() │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                    │                    │                         │
│         └────────────────────┴────────────────────┘                         │
│                              │                                              │
│                         CLI Interface                                       │
│                    nexus <command> [options]                                 │
│                                                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│   SOURCE SPOKES   │ │  SINK SPOKES  │ │ BIDIRECTIONAL     │
│   (emit findings) │ │  (accept)     │ │ (both)            │
├───────────────────┤ ├───────────────┤ ├───────────────────┤
│ EduScan           │ │ Sprint Master │ │ Audit Tool        │
│ HED / HealthPanel │ │ Spellbook     │ │                   │
│                   │ │ ToDo CLI      │ │                   │
│                   │ │ GitHub Issues │ │                   │
└───────────────────┘ └───────────────┘ └───────────────────┘
```

---

## Full Data Flow

```
BUILD TIME                         NEXUS HUB                        TRACKING
──────────                         ─────────                        ────────

 EduScan                    ┌──────────────────┐
 (scans code)               │                  │              Sprint Master
      │                     │   Findings       │              (sprint items)
      │  getFindings()      │   Store          │                    ▲
      ├────────────────────▶│                  │  acceptFinding()   │
      │                     │   ┌──────────┐   │────────────────────┘
      │                     │   │ finding  │   │
      │                     │   │ finding  │   │              Spellbook
RUNTIME                     │   │ finding  │   │              (feature tickets)
───────                     │   │ finding  │   │                    ▲
                            │   │ ...      │   │  acceptFinding()   │
 HED / HealthPanel          │   └──────────┘   │────────────────────┘
 (captures errors)          │                  │
      │                     │                  │              GitHub Issues
      │  getFindings()      │   Pipe Router    │              (auto-created)
      ├────────────────────▶│                  │                    ▲
      │                     │   eduscan→sprint │  create issue      │
      │                     │   hed→github     │────────────────────┘
ON-DEMAND                   │   audit→eduscan  │
─────────                   │   all→status     │              ToDo CLI
                            │                  │              (quick tasks)
 Audit Tool                 │                  │                    ▲
 (checks content)           │                  │  acceptFinding()   │
      │                     │                  │────────────────────┘
      │  getFindings()      │                  │
      ├────────────────────▶│                  │
      │                     └──────────────────┘
      │  acceptFinding()           │
      ◀────────────────────────────┘
      (audit←eduscan signatures)
```

---

## Spoke Adapter Specifications

### EduScan Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Source (emits findings) |
| **Native format** | `_tools/reports/TREASURE_MAP.json` — issues array |
| **getFindings()** | Reads TREASURE_MAP.json, maps each issue to shared Finding |
| **getStatus()** | Returns `{ total, bySeverity, lastRun, scanDuration }` |
| **acceptFinding()** | Read-only — returns `{ accepted: false }` |

**Field mapping:**

| TREASURE_MAP field | Finding field |
|-------------------|---------------|
| `code` | `code` |
| `severity` | `severity` |
| `message` | `message` |
| `file` | `file` |
| `line` | `line` |
| (scan timestamp) | `timestamp` |
| `{ validator, autoFixable, fix, suggested }` | `meta` |

---

### Sprint Master Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Sink (accepts findings, creates items) |
| **Native format** | `_tools/sprint-master/sprints.json` |
| **getFindings()** | Returns open/blocked items as findings (for status dashboard) |
| **getStatus()** | Returns `{ open, inProgress, blocked, done, currentSprint }` |
| **acceptFinding()** | Creates new sprint item with mapped priority and series |

**Severity → Priority mapping:**

| Finding severity | Sprint priority | Series prefix |
|-----------------|-----------------|---------------|
| `critical` | P0 | Source-dependent (ES, QC, etc.) |
| `high` | P1 | Source-dependent |
| `medium` | P2 | Source-dependent |
| `low` | Backlog | Source-dependent |

**Deduplication:** Match by `source + code + file`. If an open item already exists for the same finding, skip creation and return existing reference.

---

### HED Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Source (emits findings) |
| **Native format** | localStorage ring buffer (browser) + Firestore `hed_reports` |
| **getFindings()** | Reads exported JSON (from HealthPanel "Export JSON") or Firestore |
| **getStatus()** | Returns `{ total, byCode, uniqueSignatures, lastError }` |
| **acceptFinding()** | Read-only — returns `{ accepted: false }` |

**Field mapping:**

| HED field | Finding field |
|-----------|---------------|
| `code` (HED-001..004) | `code` |
| `severity` (always high for HED) | `severity` |
| `message` | `message` |
| `source` (URL) | `file` |
| `line` | `line` |
| `timestamp` | `timestamp` |
| `{ stack, type, sessionId, userId }` | `meta` |

---

### Audit Tool Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Bidirectional (emits audit findings, accepts signatures) |
| **Native format** | HTML reports in `_planning/reports/`, browser UI |
| **getFindings()** | Parses audit report JSON or reads from Audit Tool export |
| **getStatus()** | Returns `{ phases, openFindings, lastAudit }` |
| **acceptFinding()** | Accepts findings from EduScan to inform next audit cycle |

**Note:** Audit Tool runs in-browser. The adapter reads its exported data, not the live browser state.

---

### Spellbook Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Sink (accepts findings as new spells) |
| **Native format** | Markdown files in `_spellbook/spells/` |
| **getFindings()** | Returns CAST spells as in-progress findings |
| **getStatus()** | Returns `{ scribed, cast, sealed, brewed }` |
| **acceptFinding()** | Creates new SCRIBED spell from finding |

---

### ToDo Adapter

| Aspect | Detail |
|--------|--------|
| **Direction** | Sink (accepts findings as quick tasks) |
| **Native format** | `~/.todo-data.json` |
| **getFindings()** | Returns pending tasks as findings |
| **getStatus()** | Returns `{ pending, done }` |
| **acceptFinding()** | Creates new todo item from finding |

---

## Shared Findings Format (JSON Schema)

```json
{
    "source": "eduscan",
    "code": "PATH-001",
    "severity": "high",
    "message": "Broken <script src> — file not found",
    "file": "houses/shield/labs/firewall.lab.html",
    "line": 42,
    "timestamp": "2026-02-27T14:30:00Z",
    "meta": {
        "validator": "paths",
        "autoFixable": true,
        "fix": "Update path to ../../components/LabEngine.js"
    }
}
```

### Field Specification

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `source` | string | yes | Registered spoke ID: `eduscan`, `sprint`, `hed`, `audit`, `spellbook`, `todo` |
| `code` | string | yes | Issue code from source tool (e.g., `PATH-001`, `HED-003`) |
| `severity` | string | yes | One of: `critical`, `high`, `medium`, `low`, `info` |
| `message` | string | yes | Human-readable description (max 200 chars) |
| `file` | string | no | Relative path from project root |
| `line` | number | no | 1-indexed line number |
| `timestamp` | string | yes | ISO 8601 with timezone |
| `meta` | object | no | Free-form, source-specific. Hub passes through without interpretation. |

### Severity Normalization

Different tools use different severity scales. Adapters normalize to the shared scale:

| Shared | EduScan | HED | Audit |
|--------|---------|-----|-------|
| `critical` | critical | — | Phase 1 blockers |
| `high` | high | HED-001, HED-002 | Phase 2 structural |
| `medium` | medium | HED-003 | Phase 2 cosmetic |
| `low` | low, suspect, warning | HED-004 | Informational |
| `info` | info | — | Stats |

---

## Event Bus Design

Nexus uses a pull-based model, not push-based events.

**Why pull, not push:**
- Existing tools don't emit events (they write files/JSON)
- No daemon or long-running process needed
- Simpler to implement and debug
- CLI-native: `nexus sync` pulls on demand

**How it works:**

```
User runs: nexus sync
                │
                ▼
    ┌───────────────────────┐
    │  For each spoke:      │
    │    adapter.getFindings │
    │    adapter.getStatus   │
    └───────────┬───────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Merge into findings  │
    │  store (dedup by      │
    │  source+code+file)    │
    └───────────┬───────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Run configured pipes │
    │  (route new findings  │
    │  to destination       │
    │  spokes)              │
    └───────────┬───────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Write updated        │
    │  findings.json        │
    │  Print summary        │
    └───────────────────────┘
```

**Future consideration:** If HED grows a WebSocket feed or Firestore listener, a push adapter can be added without changing the hub architecture.

---

## Storage Strategy

### Findings Store

**Location:** `_tools/nexus/findings.json`
**Format:** JSON array of Finding objects
**Lifecycle:** Findings persist until resolved or aged out (configurable TTL)
**Size estimate:** ~1000 findings at peak (all six tools combined)

```json
{
    "version": 1,
    "lastSync": "2026-02-27T14:30:00Z",
    "findings": [
        { "source": "eduscan", "code": "PATH-001", "..." : "..." },
        { "source": "hed", "code": "HED-001", "..." : "..." }
    ],
    "stats": {
        "total": 47,
        "bySeverity": { "critical": 0, "high": 3, "medium": 12, "low": 27, "info": 5 },
        "bySource": { "eduscan": 30, "hed": 7, "audit": 10 }
    }
}
```

### Spoke Configuration

**Location:** `_tools/nexus/nexus.config.json`
**Purpose:** Register spokes, configure pipes, set policies

```json
{
    "spokes": {
        "eduscan": {
            "adapter": "./adapters/eduscan.js",
            "dataPath": "../reports/TREASURE_MAP.json",
            "enabled": true
        },
        "sprint": {
            "adapter": "./adapters/sprint-master.js",
            "dataPath": "../sprint-master/sprints.json",
            "enabled": true
        }
    },
    "pipes": [
        {
            "name": "eduscan-to-sprint",
            "source": "eduscan",
            "destination": "sprint",
            "filter": { "severity": ["critical", "high"] },
            "enabled": true
        }
    ],
    "gate": {
        "failOn": ["critical"],
        "sources": ["eduscan", "hed", "audit"]
    }
}
```

---

## The Six Integration Pipes

### Pipe 1: EduScan → Sprint Master

**Purpose:** Auto-create sprint items from scan findings.

```
EduScan TREASURE_MAP.json
        │
        │  getFindings() → Finding[]
        ▼
┌──────────────────────────┐
│  Filter:                 │
│    severity ∈ {critical, │
│    high}                 │
│                          │
│  Dedup:                  │
│    source+code+file      │
│    vs existing items     │
└────────────┬─────────────┘
             │
             │  acceptFinding(finding)
             ▼
Sprint Master sprints.json
  → New item: "ES-0XX: PATH-001 in firewall.lab.html"
  → Status: backlog
  → Priority: P0 (critical) or P1 (high)
```

---

### Pipe 2: HED → GitHub Issues

**Purpose:** Auto-create GitHub issues from runtime errors.

```
HED exported JSON / Firestore
        │
        │  getFindings() → Finding[]
        ▼
┌──────────────────────────┐
│  Deduplicate by error    │
│  signature (message +    │
│  file + line hash)       │
│                          │
│  Threshold: only if      │
│  errorCount >= 3         │
└────────────┬─────────────┘
             │
             │  gh issue create
             ▼
GitHub Issues
  → Title: "[HED-001] TypeError in shield/labs/firewall.lab.html"
  → Body: stack trace, session count, first/last seen
  → Labels: bug, hed-auto
```

---

### Pipe 3: Audit Tool → EduScan

**Purpose:** Audit findings become EduScan signatures for permanent detection.

```
Audit Tool findings
        │
        │  getFindings() → Finding[]
        ▼
┌──────────────────────────┐
│  Filter: patterns that   │
│  can be expressed as     │
│  regex/AST rules         │
│                          │
│  Transform: finding →    │
│  EduScan fixture +       │
│  expectation entry       │
└────────────┬─────────────┘
             │
             │  Write fixture file + update expectations.js
             ▼
EduScan test suite
  → New fixture: tests/fixtures/audit-sourced.html
  → New expectation: { 'audit-sourced.html': ['AUDIT-001'] }
```

**Note:** This pipe is semi-automated. It generates the fixture; a human reviews before committing.

---

### Pipe 4: EduScan → Deploy Gate

**Purpose:** Block deploys on critical findings from any tool (not just EduScan).

```
deploy.sh calls: nexus gate
        │
        ▼
┌──────────────────────────┐
│  Poll all source spokes: │
│    eduscan.getFindings()  │
│    hed.getFindings()      │
│    audit.getFindings()    │
│                          │
│  Apply gate policy:      │
│    failOn: [critical]     │
└────────────┬─────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    PASS         FAIL
  (deploy)    (block + report)
```

**Enhancement:** Today, `deploy.sh` only checks EduScan. With Nexus gate, HED runtime errors and Audit findings also participate.

---

### Pipe 5: HED → Audit Tool

**Purpose:** Runtime errors feed back into audit reports.

```
HED findings (runtime errors)
        │
        │  Filter: content-related errors
        │  (404s, TypeErrors in house content)
        ▼
┌──────────────────────────┐
│  Classify:               │
│    Resource 404 → Phase 3│
│    (CloudFront check)    │
│                          │
│    TypeError → Phase 2   │
│    (structural audit)    │
└────────────┬─────────────┘
             │
             │  acceptFinding(finding)
             ▼
Audit Tool
  → Finding added to next audit report
  → Links back to HED source for details
```

---

### Pipe 6: All → Nexus Status

**Purpose:** Unified dashboard view across all tools.

```
nexus status
        │
        ▼
┌──────────────────────────┐
│  For each spoke:         │
│    adapter.getStatus()   │
│                          │
│  Aggregate:              │
│    total findings        │
│    by severity           │
│    by source             │
│    last activity         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ NEXUS STATUS — 2026-02-27 14:30                          │
│ ──────────────────────────────────────────────────────── │
│  EduScan     │ 0 crit │ 3 high │ 12 med  │ scan: 2h ago │
│  Sprint      │ 4 open │ 2 wip  │ 1 block │ sprint: S-14 │
│  HED         │ 7 errors (3 unique)       │ last: 45m    │
│  Audit       │ Phase 2 done │ 14 open    │              │
│  Spellbook   │ 3 CAST │ 1 SCRIBED        │ 57 SEALED   │
│  ToDo        │ 5 pending │ 2 done today  │              │
│ ──────────────────────────────────────────────────────── │
│  COMBINED    │ 2 crit │ 9 high │ 26 med │ 41 low       │
└──────────────────────────────────────────────────────────┘
```

---

## Directory Structure

**Planned (from design phase):**
```
_tools/nexus/
├── adapters/
│   ├── eduscan.js, sprint-master.js, hed.js, audit-tool.js, spellbook.js, todo.js
├── pipes/
│   ├── eduscan-to-sprint.js, hed-to-github.js, etc.
└── reporters/
    ├── console.js, json.js, markdown.js
```

**Actual (shipped implementation):**
```
_tools/nexus/
├── README.md               # Tool documentation + inner workings
├── nexus.js                # CLI entry point — commands, flag parsing, rendering
├── hub.js                  # Hub core — config, store, sync, gate, pipes, formatters
├── nexus.config.json       # Spoke config + gate policy + pipe settings
├── findings.json           # Aggregated findings store (created on first sync)
├── hed-export.json         # HED export target (created by user via HED panel)
└── adapters/
    ├── eduscan.js          # EduScan spoke adapter (read-only)
    ├── sprint-master.js    # Sprint Master spoke adapter (read-write)
    ├── hed.js              # HED spoke adapter (read-only, reads export JSON)
    ├── audit.js            # Audit spoke adapter (read-only, JSON/HTML fallback)
    ├── spellbook.js        # Spellbook spoke adapter (read-only, parses spell MD)
    └── todo.js             # ToDo CLI spoke adapter (read-only, reads ~/.todo-data.json)
```

**Key difference from plan:** Pipes and reporters were consolidated into `hub.js` and `nexus.js` instead of separate modules. The triage pipe is `hub.triageToSpoke()`, the HED-GitHub pipe is `hub.pipeHedToGithub()`, and report formatting is inline in `nexus.js`. This kept the codebase at 2 core files + 6 adapters instead of 15+ modules.

---

## Phase Roadmap

### Phase 1: Documentation + Shared Format

- [x] README.md — tool documentation
- [x] NEXUS_DESIGN.md — design document
- [x] NEXUS_HUB_ARCHITECTURE.md — this document
- [x] AD-011 — architecture decision record
- [x] TOOL_INVENTORY.md — updated with Nexus entry
- [x] Shared findings format finalized

### Phase 2: CLI Hub + Status Command

- [x] `nexus.js` CLI scaffolding
- [x] `hub.js` core (spoke registry, findings store)
- [x] EduScan adapter (first source)
- [x] Sprint Master adapter (first sink)
- [x] `nexus status` command
- [x] `nexus scan` command (wraps EduScan)

### Phase 3: Auto-Triage + Report

- [x] Triage routing (`hub.triageToSpoke()`, `nexus triage --apply`)
- [x] `nexus sync` command with `--prune` for stale finding removal
- [x] `nexus report` command (markdown + JSON output)
- [x] Deduplication logic (`source::code::file` key, nexusKey for sprint items)

### Phase 4: Deploy Gate + All Adapters

- [x] `nexus gate` command with `--strict` and `--json` flags
- [x] Gate policy in nexus.config.json (`failOn`, `sources`)
- [x] Cross-tool severity aggregation
- [x] HED adapter (reads exported JSON, dedup by code|message)
- [x] Audit adapter (JSON-first, HTML-fallback, graceful empty)
- [x] Spellbook adapter (YAML/legacy markdown parsing, SCRIBED/CAST)
- [x] ToDo adapter (reads ~/.todo-data.json with tilde expansion)
- [x] Generic spoke display in status/report (any spoke renders automatically)

### Phase 5: GitHub Pipe + Deploy Integration

- [x] `nexus pipe hed-github` command with `--dry-run` and `--threshold`
- [x] Issue deduplication via `gh issue list --search` for `[HED-001]` signature
- [x] Label management (`bug`, `hed-auto` from config)
- [x] deploy.sh rewritten: 60-line inline EduScan check → single `nexus gate` call

---

*This document defines the full architecture of the Nexus hub & spoke system. All phases are shipped. Revisit here for architectural context when extending adapters or adding new pipes.*
