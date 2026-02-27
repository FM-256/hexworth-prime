# Nexus - Design Document

**Created:** February 27, 2026
**Status:** DESIGN PHASE
**Author:** Hexworth Prime Development Team
**Version:** 1.0.0-draft

---

## Executive Summary

Nexus is a Hub & Spoke CLI orchestrator that connects Hexworth Prime's six existing developer tools — EduScan, Sprint Master, Spellbook, ToDo CLI, HED/HealthPanel, and Audit Tool — through spoke adapters and a shared findings format. It automates the manual handoffs between detection, tracking, and reporting without replacing or merging any tool.

---

## The Problem

Six developer tools have emerged organically during Hexworth Prime development:

| Tool | Role | Output |
|------|------|--------|
| EduScan | Build-time code scanning | JSON scan reports |
| Sprint Master | Sprint backlog tracking | sprints.json |
| Spellbook | Feature ticket management | Markdown spell files |
| ToDo CLI | Quick task capture | ~/.todo-data.json |
| HED + HealthPanel | Runtime error monitoring | localStorage + Firestore |
| Audit Tool | Content & structural auditing | Browser UI + HTML reports |

**The problem is not the tools.** Each tool is good at what it does. The problem is the gaps between them:

1. **No automated detection → tracking path.** EduScan finds PATH-001. A human reads the report, decides it matters, opens Sprint Master, types a new item. Every finding requires this manual loop.

2. **No cross-tool visibility.** There's no single place to see: "How many open issues exist across all tools right now?" Each tool has its own view, its own format, its own storage.

3. **No runtime → build feedback loop.** HED catches a TypeError in production. That error never becomes an EduScan signature or a Sprint Master item without manual intervention.

4. **No deploy gate across tools.** EduScan has its own gate (`--fail-on critical`), but it only sees its own findings. HED errors and audit findings don't participate.

5. **Tracker fragmentation.** Sprint Master tracks sprints, Spellbook tracks features, ToDo tracks quick tasks. No cross-references between them.

---

## The Solution

**Hub & Spoke architecture** — one hub (Nexus) connecting six spokes (the existing tools) through a shared data format.

```
                    ┌─────────────┐
                    │   NEXUS     │
          ┌────────│   HUB       │────────┐
          │        │             │        │
          │        │  findings[] │        │
          │        │  pipes[]    │        │
          │        │  status     │        │
          │        └──────┬──────┘        │
          │               │               │
    ┌─────┴─────┐   ┌────┴────┐   ┌──────┴─────┐
    │  EduScan  │   │  Sprint │   │  Spellbook  │
    │  adapter  │   │  Master │   │  adapter    │
    │           │   │  adapter│   │             │
    └───────────┘   └─────────┘   └─────────────┘
          │               │               │
    ┌─────┴─────┐   ┌────┴────┐   ┌──────┴─────┐
    │   HED     │   │  Audit  │   │   ToDo     │
    │  adapter  │   │  Tool   │   │  adapter   │
    │           │   │  adapter│   │             │
    └───────────┘   └─────────┘   └─────────────┘
```

### Key Design Principles

1. **Tools stay independent.** Every tool works exactly as it does today with no Nexus dependency. Remove Nexus and nothing breaks.

2. **Adapters are small.** Each spoke adapter is a single module (~50-100 lines) that translates between the tool's native format and the shared findings format.

3. **Shared format is the contract.** All tools communicate through a common JSON findings format. The format is the lingua franca.

4. **Pipes define data flow.** Each integration scenario (e.g., "EduScan findings → Sprint Master items") is a named pipe with clear source, destination, and transformation logic.

5. **Incremental adoption.** Spokes can be connected one at a time. You don't need all six adapters to get value from the first two.

---

## What Makes Nexus Different from a Merge

A merge would combine tools into one. Nexus explicitly avoids that.

| Aspect | Merge Approach | Nexus Approach |
|--------|---------------|----------------|
| Tool independence | Tools absorbed into monolith | Tools remain standalone |
| Failure blast radius | One bug breaks everything | One adapter fails, others work |
| Development velocity | Must coordinate across subsystems | Each tool evolves independently |
| Adoption | All-or-nothing | Incremental (one spoke at a time) |
| Maintenance cost | One large codebase | Small adapters + hub core |
| Rollback | Painful (untangle merged code) | Disconnect one spoke |

---

## Architecture

### Hub Core

The hub is a Node.js CLI with three responsibilities:

1. **Findings Store** — Aggregates findings from all connected spokes into a unified JSON store (`_tools/nexus/findings.json`)
2. **Pipe Router** — Routes findings between spokes based on configured pipes
3. **Status Dashboard** — Renders a unified view of all tool states

### Spoke Adapter Interface

Each spoke adapter implements three methods:

```javascript
class SpokeAdapter {
    /**
     * Pull findings from this tool in shared format.
     * @returns {Finding[]} Array of findings in shared format
     */
    getFindings() { }

    /**
     * Get current status summary from this tool.
     * @returns {object} { total, bySeverity, lastRun, healthy }
     */
    getStatus() { }

    /**
     * Accept a finding from another spoke (cross-tool routing).
     * @param {Finding} finding - Finding in shared format
     * @returns {object} { accepted, reference } - reference to created item
     */
    acceptFinding(finding) { }
}
```

**Example: EduScan adapter**

```javascript
class EduScanAdapter {
    getFindings() {
        // Read TREASURE_MAP.json
        // Transform each issue into shared Finding format
        // Return findings[]
    }

    getStatus() {
        // Read TREASURE_MAP.json summary
        // Return { total, bySeverity, lastRun }
    }

    acceptFinding(finding) {
        // EduScan doesn't accept external findings
        // (it's a source, not a sink)
        return { accepted: false, reason: 'read-only spoke' };
    }
}
```

**Example: Sprint Master adapter**

```javascript
class SprintMasterAdapter {
    getFindings() {
        // Read sprints.json
        // Return open/blocked items as findings
    }

    getStatus() {
        // Return { open, inProgress, blocked, done }
    }

    acceptFinding(finding) {
        // Create new sprint item from finding
        // Map severity → priority, source → series prefix
        // Return { accepted: true, reference: 'ES-042' }
    }
}
```

### Shared Findings Format

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

The `meta` field is free-form and source-specific. The hub passes it through without interpretation. Destination spokes decide what to do with it.

---

## Integration Scenarios

### 1. EduScan → Sprint Master (Auto-Triage)

**Trigger:** `nexus triage` or `nexus scan --triage`
**Flow:** EduScan scan runs → new critical/high findings → Sprint Master items auto-created
**Mapping:** `severity:critical` → `priority:P0`, `severity:high` → `priority:P1`, code prefix → series prefix (e.g., `PATH-*` → `ES`)
**Dedup:** Findings matched by `source + code + file` — no duplicate items

### 2. HED → GitHub Issues (Auto-Report)

**Trigger:** `nexus sync hed` when error count exceeds threshold
**Flow:** HED error buffer → deduplicate → create GitHub issue per unique error signature
**Mapping:** `HED-001` (runtime) → issue with stack trace, `HED-004` (resource 404) → issue with URL
**Dedup:** Issue title includes error signature hash — GitHub search prevents duplicates

### 3. Audit Tool → EduScan (Signature Feed)

**Trigger:** Manual — `nexus pipe audit eduscan`
**Flow:** Audit finding → EduScan signature format → new test fixture
**Purpose:** When the Audit Tool discovers a new bug pattern, it becomes a permanent EduScan check

### 4. EduScan → Deploy Gate (Cross-Tool Gate)

**Trigger:** `nexus gate` (called from deploy.sh)
**Flow:** Aggregate findings from all spokes → apply gate policy → pass/fail
**Policy:** Configurable — default blocks on any critical finding from any source
**Enhancement over current:** Today only EduScan findings gate deploys; Nexus gates across all tools

### 5. HED → Audit Tool (Runtime → Content Feedback)

**Trigger:** `nexus sync hed` or periodic
**Flow:** HED runtime errors → filtered for content-related issues → fed into audit reports
**Purpose:** Runtime 404s and TypeErrors inform the next content audit cycle

### 6. All → Nexus Status (Unified Dashboard)

**Trigger:** `nexus status`
**Flow:** Poll all spoke adapters → aggregate → render dashboard
**Output:**
```
NEXUS STATUS — 2026-02-27 14:30
────────────────────────────────────────────────
 EduScan     │ 0 critical │ 3 high │ 12 medium │ last scan: 2h ago
 Sprint      │ 4 open │ 2 in-progress │ 1 blocked │ sprint: S-14
 HED         │ 7 errors (3 unique) │ last: 45min ago
 Audit       │ Phase 2 complete │ 14 open findings
 Spellbook   │ 3 CAST │ 1 SCRIBED │ 57 SEALED
 ToDo        │ 5 pending │ 2 done today
────────────────────────────────────────────────
 COMBINED    │ 2 critical │ 9 high │ 26 medium │ 41 low
```

---

## Phase Roadmap

| Phase | Scope | Deliverables |
|-------|-------|-------------|
| **1** | Documentation + shared format | README, design doc, architecture doc, AD-011 |
| **2** | CLI hub + status command | `nexus status`, EduScan adapter, Sprint Master adapter |
| **3** | Auto-triage pipe + sync | `nexus triage`, `nexus sync`, remaining adapters |
| **4** | Deploy gate (cross-tool) | `nexus gate`, deploy.sh integration |
| **5** | GitHub issue automation | `nexus report --github`, HED → GitHub pipe |

Each phase is independently deployable. Phase 1 (this document) has no code dependencies.

---

## Trade-off Acknowledgments

| Trade-off | Accepted Because |
|-----------|------------------|
| Adds a 7th tool to maintain | Hub is small (~500 lines core). Adapters are ~50-100 lines each. The coordination value exceeds the maintenance cost. |
| Spoke adapters must stay in sync with their tools | Each adapter depends on one tool's output format. When a tool changes its format, only its adapter needs updating. |
| Shared format is a contract all tools must honor | The format is deliberately minimal (7 required fields). It's easy to emit and easy to consume. |
| CLI-only (no GUI yet) | Matches existing tool pattern (EduScan, Sprint Master are CLI). GUI can wrap CLI later. |
| Findings store is flat JSON | Good enough for Phase 2-3 scale (~1000 findings). Can migrate to SQLite if needed. |

---

## References

- `_tools/nexus/README.md` — Tool documentation and command reference
- `_planning/NEXUS_HUB_ARCHITECTURE.md` — Architecture deep-dive (adapters, pipes, storage)
- `_planning/ARCHITECTURE_DECISIONS.md` — AD-011: Hub & Spoke decision rationale
- `_tools/TOOL_INVENTORY.md` — All six tools cataloged
- `_tools/EDUSCAN_DESIGN.md` — Pattern reference (EduScan design document)

---

*This document defines Nexus's purpose, architecture, and integration strategy. Revisit here if direction is lost.*
