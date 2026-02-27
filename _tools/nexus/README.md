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

## Planned Command Reference

| Command | Description | Phase |
|---------|-------------|-------|
| `nexus status` | Unified dashboard — counts from all connected spokes | 2 |
| `nexus scan` | Trigger EduScan + collect findings into shared store | 2 |
| `nexus triage` | Pipe new findings into Sprint Master as backlog items | 3 |
| `nexus report` | Generate cross-tool summary (markdown or JSON) | 3 |
| `nexus gate` | Deploy gate check — block on critical findings from any spoke | 4 |
| `nexus sync` | Pull latest data from all spokes into findings store | 3 |

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

**Phase 1 — Documentation** (current)

This is the documentation foundation. No code has been written yet.

See also:
- `_tools/NEXUS_DESIGN.md` — Design document (problem, solution, architecture)
- `_planning/NEXUS_HUB_ARCHITECTURE.md` — Architecture deep-dive (adapters, pipes, storage)
- `_planning/ARCHITECTURE_DECISIONS.md` — AD-011: Hub & Spoke decision rationale

---

## License

Internal tool for Hexworth Prime educational platform.
