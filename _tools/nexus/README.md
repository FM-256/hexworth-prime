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
| `nexus gate` | Deploy gate check — block on critical findings from any spoke | Planned (Phase 4) |

### Usage

```bash
# Unified status dashboard
npm run nexus:status
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

---

## Spoke Registry

| Spoke | Tool | Provides to Hub | Receives from Hub |
|-------|------|-----------------|-------------------|
| `eduscan` | EduScan | Scan findings (JSON) | Gate policies, finding status |
| `sprint` | Sprint Master | Sprint item statuses | Auto-created items from findings |
| `hed` | HED + HealthPanel | Runtime error logs | Finding status updates |
| `audit` | Audit Tool | Content audit findings | Scan signatures (from EduScan) |
| `spellbook` | Spellbook | Feature ticket statuses | Cross-references from findings |
| `todo` | ToDo CLI | Quick task list | Auto-created tasks from findings |

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

## Current Status

**Phase 3 — Triage, Report, and Stale Pruning** (current)

- [x] Phase 1 — Documentation (README, design doc, architecture, AD-011)
- [x] Phase 2 — CLI entry point (`nexus.js`), hub core (`hub.js`), EduScan adapter, Sprint Master adapter, `status`/`scan`/`sync` commands
- [x] Phase 3 — Triage routing (findings → Sprint Master), report generation, stale finding pruning
- [ ] Phase 4 — Deploy gate, CI integration

### Files

| File | Purpose |
|------|---------|
| `nexus.js` | CLI entry point — command dispatch, flag parsing |
| `hub.js` | Core module — config, findings store, spoke registry, triage, formatters |
| `adapters/eduscan.js` | EduScan spoke adapter (read-only) |
| `adapters/sprint-master.js` | Sprint Master spoke adapter (read-write: accepts triaged findings) |
| `nexus.config.json` | Auto-generated spoke configuration |
| `findings.json` | Dedup-merged findings store (created on first sync) |

See also:
- `_tools/NEXUS_DESIGN.md` — Design document (problem, solution, architecture)
- `_planning/NEXUS_HUB_ARCHITECTURE.md` — Architecture deep-dive (adapters, pipes, storage)
- `_planning/ARCHITECTURE_DECISIONS.md` — AD-011: Hub & Spoke decision rationale

---

## License

Internal tool for Hexworth Prime educational platform.
