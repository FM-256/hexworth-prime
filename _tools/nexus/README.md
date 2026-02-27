# Nexus — Hub & Spoke Tool Orchestrator

> **Connect existing tools without replacing them.**

Nexus is a CLI orchestrator that connects Hexworth Prime's six developer tools through a shared findings format and spoke adapters. It does not replace, merge, or modify any tool — it sits in the center and routes data between them.

---

## What Nexus Is (and Isn't)

**Nexus IS:**
- A hub that connects existing tools
- A shared language (findings format) that all tools can speak
- A CLI that gives you one view of all tool outputs
- An automation layer for detection → tracking handoffs

**Nexus is NOT:**
- A replacement for any tool
- A monolithic rewrite
- A new scanner, tracker, or monitor
- Required for any tool to work (all tools remain standalone)

---

## Architecture Overview

```
                         ┌─────────────────────┐
                         │                     │
                         │    NEXUS HUB        │
                         │                     │
                         │  ┌───────────────┐  │
                         │  │ Findings Store │  │
                         │  └───────────────┘  │
                         │  ┌───────────────┐  │
                         │  │ Router/Pipes  │  │
                         │  └───────────────┘  │
                         │                     │
                         └──────────┬──────────┘
                                    │
              ┌─────────┬───────────┼───────────┬──────────┐
              │         │           │           │          │
              ▼         ▼           ▼           ▼          ▼
        ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐
        │ EduScan  │ │ Sprint  │ │  HED /  │ │ Audit  │ │Spellbook│
        │          │ │ Master  │ │ Health  │ │ Tool   │ │         │
        │ (build)  │ │ (track) │ │ (run)   │ │ (audit)│ │ (ticket)│
        └──────────┘ └─────────┘ └─────────┘ └────────┘ └─────────┘
              ▲                                                ▲
              │              ┌──────────┐                      │
              └──────────────│  ToDo    │──────────────────────┘
                             │  (tasks) │
                             └──────────┘
```

Each tool connects to the hub through a **spoke adapter** — a small module that translates between the tool's native format and the shared findings format.

---

## Command Reference

| Command | Description | Status |
|---------|-------------|--------|
| `nexus status` | Unified dashboard — live counts from all connected spokes | **Implemented** (Phase 2) |
| `nexus scan` | Run EduScan + sync findings into shared store | **Implemented** (Phase 2) |
| `nexus sync [spoke]` | Pull latest data from all spokes (or one named) into findings store | **Implemented** (Phase 2) |
| `nexus sync --prune` | Sync and remove stale findings no longer in source data | **Implemented** (Phase 3) |
| `nexus triage` | Auto-create Sprint Master backlog items from high-severity findings | **Implemented** (Phase 3) |
| `nexus report` | Cross-tool summary (markdown or JSON to stdout) | **Implemented** (Phase 3) |
| `nexus gate` | Deploy gate — block on critical findings from configured spokes | **Implemented** (Phase 4) |
| `nexus pipe hed-github` | Auto-create GitHub issues from HED runtime errors | **Implemented** (Phase 5) |

### Usage

```bash
# Unified status dashboard
node _tools/nexus/nexus.js status

# Run EduScan and sync results
node _tools/nexus/nexus.js scan

# Sync all spokes into findings store
node _tools/nexus/nexus.js sync

# Sync one specific spoke
node _tools/nexus/nexus.js sync eduscan
node _tools/nexus/nexus.js sync sprint

# Sync and prune stale findings
node _tools/nexus/nexus.js sync --prune

# Triage: preview what Sprint Master items would be created (dry run)
node _tools/nexus/nexus.js triage

# Triage: actually create the items
node _tools/nexus/nexus.js triage --apply

# Triage only critical findings
node _tools/nexus/nexus.js triage --severity critical --apply

# Deploy gate (blocks on critical)
node _tools/nexus/nexus.js gate

# Deploy gate (blocks on critical + high)
node _tools/nexus/nexus.js gate --strict

# Gate result as JSON (for CI)
node _tools/nexus/nexus.js gate --json

# Create GitHub issues from HED errors
node _tools/nexus/nexus.js pipe hed-github

# Preview without creating issues
node _tools/nexus/nexus.js pipe hed-github --dry-run

# Custom occurrence threshold
node _tools/nexus/nexus.js pipe hed-github --threshold 5

# Cross-tool report (markdown)
node _tools/nexus/nexus.js report

# Cross-tool report (JSON, pipe-friendly)
node _tools/nexus/nexus.js report --json
```

### Triage

Triage groups findings by issue code (not by file) and creates one Sprint Master backlog item per code. For example, 47 files with `SEM-001` become a single sprint item: `"SEM-001: Heading hierarchy skip (47 files)"`.

- **Default: dry-run.** Shows what would be created without writing anything.
- **`--apply`** writes items to `sprints.json`.
- **`--severity`** filters which severities to triage (default: `critical,high`).
- Sprint items get a `nexusKey` field (e.g., `"eduscan::SEM-001"`) for dedup — re-running triage skips already-tracked codes.
- Items use the `ES` series prefix for EduScan-sourced findings.

### Gate

The deploy gate polls configured spokes and blocks if any findings match the `failOn` severity list.

- **Default:** blocks on `critical` findings only.
- **`--strict`** blocks on `critical` + `high`.
- **`--json`** outputs machine-readable JSON with exit code 0 (pass) or 1 (fail).
- Spokes without data are **skipped**, not treated as failures.
- Gate policy is configured in `nexus.config.json` under `"gate"`.
- `deploy.sh` uses `nexus gate` as its pre-deploy check (replaces inline EduScan logic).

### Pipe: hed-github

Auto-creates GitHub issues from HED (Health Error Diagnostics) findings.

- Requires `gh` CLI to be installed and authenticated.
- **Threshold:** only creates issues for errors with >= N occurrences (default: 3).
- **Dedup:** searches for existing open issues with the same `[HED-001]` signature before creating.
- **Labels:** `bug`, `hed-auto` (configurable in `nexus.config.json`).
- **`--dry-run`** shows what would be created without calling GitHub.
- **`--threshold N`** overrides the configured occurrence threshold.

---

## Spoke Registry

| Spoke | Tool | Adapter | Mode | Notes |
|-------|------|---------|------|-------|
| `eduscan` | EduScan | `adapters/eduscan.js` | read-only | Reads `TREASURE_MAP.json` |
| `sprint` | Sprint Master | `adapters/sprint-master.js` | read-write | Accepts triaged findings as backlog items |
| `hed` | HED + HealthPanel | `adapters/hed.js` | read-only | Reads exported JSON from HED panel |
| `audit` | Audit Tool | `adapters/audit.js` | read-only | JSON-first, HTML-fallback |
| `spellbook` | Spellbook | `adapters/spellbook.js` | read-only | Reads spell markdown (SCRIBED/CAST) |
| `todo` | ToDo CLI | `adapters/todo.js` | read-only | Reads `~/.todo-data.json` |

---

## Data Flow: Detection to Tracking

```
DETECTION                    HUB                         TRACKING
─────────                    ───                         ────────

EduScan finds ──┐
  PATH-001      │
                │     ┌──────────────┐
HED captures ───┤────▶│ Shared       │────▶ Sprint Master
  HED-001       │     │ Findings     │      (auto-create item)
                │     │ Store        │
Audit flags ────┤     │              │────▶ GitHub Issue
  content gap   │     │ { source,    │      (auto-create)
                │     │   code,      │
                │     │   severity,  │────▶ Nexus Report
                │     │   message,   │      (unified view)
                │     │   ... }      │
                │     └──────────────┘
                │
```

---

## Shared Findings Format

Every tool speaks the same language through the hub:

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | yes | Spoke identifier (`eduscan`, `hed`, `audit`, etc.) |
| `code` | string | yes | Issue code from the source tool |
| `severity` | string | yes | `critical`, `high`, `medium`, `low`, `info` |
| `message` | string | yes | Human-readable description |
| `file` | string | no | File path (relative to project root) |
| `line` | number | no | Line number in file |
| `timestamp` | string | yes | ISO 8601 timestamp |
| `meta` | object | no | Source-specific metadata (varies by tool) |

---

## Configuration

`nexus.config.json` controls spoke registration, gate policy, and pipe settings:

```json
{
    "spokes": {
        "eduscan": { "adapter": "./adapters/eduscan.js", "dataPath": "...", "enabled": true }
    },
    "gate": {
        "failOn": ["critical"],
        "sources": ["eduscan", "hed", "audit"]
    },
    "pipes": {
        "hed-github": {
            "source": "hed",
            "target": "github",
            "threshold": 3,
            "labels": ["bug", "hed-auto"]
        }
    }
}
```

- **`gate.failOn`** — severity levels that block deployment (default: `["critical"]`).
- **`gate.sources`** — which spokes to poll during gate check.
- **`pipes.hed-github.threshold`** — minimum error occurrences before creating an issue.
- **`pipes.hed-github.labels`** — GitHub labels applied to auto-created issues.

---

## Current Status

**Phase 5 — Complete** (all phases shipped)

- [x] Phase 1 — Documentation (README, design doc, architecture, AD-011)
- [x] Phase 2 — CLI entry point (`nexus.js`), hub core (`hub.js`), EduScan adapter, Sprint Master adapter, `status`/`scan`/`sync` commands
- [x] Phase 3 — Triage routing (findings → Sprint Master), report generation, stale finding pruning
- [x] Phase 4 — Deploy gate (`nexus gate`), 4 new spoke adapters (HED, Audit, Spellbook, ToDo), generic spoke display
- [x] Phase 5 — GitHub pipe (`nexus pipe hed-github`), deploy.sh integration

### Files

| File | Purpose |
|------|---------|
| `nexus.js` | CLI entry point — command dispatch, flag parsing |
| `hub.js` | Core module — config, findings store, spoke registry, gate, pipes, formatters |
| `adapters/eduscan.js` | EduScan spoke adapter (read-only) |
| `adapters/sprint-master.js` | Sprint Master spoke adapter (read-write: accepts triaged findings) |
| `adapters/hed.js` | HED spoke adapter (read-only, reads exported JSON) |
| `adapters/audit.js` | Audit spoke adapter (read-only, JSON-first with HTML fallback) |
| `adapters/spellbook.js` | Spellbook spoke adapter (read-only, reads spell markdown) |
| `adapters/todo.js` | ToDo spoke adapter (read-only, reads ~/.todo-data.json) |
| `nexus.config.json` | Spoke configuration, gate policy, pipe settings |
| `findings.json` | Dedup-merged findings store (created on first sync) |

See also:
- `_tools/NEXUS_DESIGN.md` — Design document (problem, solution, architecture)
- `_planning/NEXUS_HUB_ARCHITECTURE.md` — Architecture deep-dive (adapters, pipes, storage)
- `_planning/ARCHITECTURE_DECISIONS.md` — AD-011: Hub & Spoke decision rationale

---

## License

Internal tool for Hexworth Prime educational platform.
