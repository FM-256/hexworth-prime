# Sprint Master — Sprint Backlog Manager

> **Lean, dependency-aware sprint tracking with zero external dependencies.**

Sprint Master is a JSON-based CLI tool for managing the Hexworth Prime sprint backlog. It provides filtering, dependency resolution, triage, and reporting across 400+ sprint items organized by series prefix and priority. No npm dependencies — just Node.js.

---

## Quick Start

```bash
# What should I work on next?
node _tools/sprint-master/sprint.js next

# See the full dashboard
node _tools/sprint-master/sprint.js dashboard

# List open items
node _tools/sprint-master/sprint.js list

# Search for anything
node _tools/sprint-master/sprint.js search firebase
```

---

## Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `list` | `ls` | Open items grouped by priority (excludes completed by default) |
| `show` | `view` | Full detail panel for a single sprint item |
| `add` | `new`, `create` | Interactive prompted creation of new sprint item |
| `update` | `set` | Update one or more fields on an existing item |
| `delete` | `rm` | Permanently remove a sprint item |
| `triage` | — | Priority-sorted open items, unblocked first |
| `dashboard` | `dash` | Summary statistics: status, series, and priority counts |
| `next` | — | Suggest highest-priority unblocked item to work on |
| `blocked` | — | List items with unresolved dependencies |
| `search` | `find` | Full-text search across ID, title, notes, houses, series |
| `stats` | — | One-liner: total, done, open, blocked counts |
| `export` | — | Generate markdown summary grouped by status |

---

## Usage Examples

### Filtering

```bash
sprint list --all                  # Include completed items
sprint list --series AR            # Filter by series prefix
sprint list --house dark-arts      # Filter by house tag
sprint list --priority high        # Filter by priority
sprint list --status done          # Filter by status
```

### Updating Items

```bash
sprint update AR-4 --status done
sprint update AR-4 --status done --commit 32fc848
sprint update F-12 --priority critical --notes "Blocking deploy"
sprint update DA-3 --houses forge,shield --depends A-1,A-2
```

### Adding Items

```bash
sprint add
# Interactive prompts:
#   Series prefix or full ID (e.g., AR or AR-22)
#   Title
#   Priority (default: medium)
#   Status (default: open)
#   Houses (comma-separated)
#   Dependencies (comma-separated IDs)
#   Notes
```

Entering just a prefix (e.g., `AR`) auto-assigns the next sequential ID.

### Exporting

```bash
sprint export --md > BACKLOG.md    # Markdown table grouped by status
```

---

## Data Format

All data lives in a single JSON file: `sprints.json`

```json
{
  "meta": {
    "version": 1,
    "lastUpdated": "2026-02-27T14:30:00Z",
    "migratedFrom": "SPRINT_BACKLOG.md",
    "migratedAt": "2026-02-21T16:29:10.805Z"
  },
  "sprints": [
    {
      "id": "AR-4",
      "title": "Resolver engine state mutations",
      "series": "AR",
      "status": "done",
      "priority": "high",
      "houses": ["forge"],
      "depends": ["A-1"],
      "commits": ["32fc848"],
      "notes": "Pure function approach, deep-clone state",
      "created": "2026-01-15T00:00:00Z",
      "updated": "2026-02-10T14:22:00Z",
      "completed": "2026-02-10T14:22:00Z"
    }
  ]
}
```

### Item Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID: `PREFIX-NUMBER` (e.g., `AR-4`, `F-12`) |
| `title` | string | Item title |
| `series` | string | Series prefix (e.g., `AR`, `F`, `DA`) |
| `status` | enum | Lifecycle status (see below) |
| `priority` | enum | `critical`, `high`, `medium`, `low` |
| `houses` | string[] | Organizational tags |
| `depends` | string[] | Sprint IDs this item depends on |
| `commits` | string[] | Associated git commit SHAs |
| `notes` | string | Free-form notes |
| `created` | string | ISO 8601 creation date |
| `updated` | string | ISO 8601 last update |
| `completed` | string | ISO 8601 completion date (null if not done) |

---

## Status Lifecycle

```
backlog → open → in-progress → partial → awaiting-qc → done
                      │
                      ├──→ blocked (unresolved dependency)
                      └──→ deferred (postponed)
```

| Status | Icon | Description |
|--------|------|-------------|
| `backlog` | :clipboard: | Not yet scheduled |
| `open` | :white_circle: | Scheduled, not started |
| `in-progress` | :hammer: | Actively being worked on |
| `partial` | :last_quarter_moon: | Some subtasks complete |
| `awaiting-qc` | :mag: | Pending quality control |
| `done` | :white_check_mark: | Completed (auto-sets `completed` date) |
| `blocked` | :no_entry: | Cannot proceed — unresolved dependencies |
| `deferred` | :pause_button: | Postponed indefinitely |

When `status` is updated to `done`, the `completed` field is automatically set to today. When changed away from `done`, `completed` is cleared.

---

## Series Prefixes

| Prefix | Full Name |
|--------|-----------|
| A | Architecture |
| AI | AI & Agents |
| AR | Arena |
| ARC | Arctic |
| CLH | Command Line Heroes |
| DA | Dark Arts |
| DL | Digital Life |
| ES | EduScan |
| F | Feature |
| HD | Handler Dashboard |
| HED | Host Error Detector |
| L | Linux |
| M | Migration |
| MX | Matrix |
| OB | Onboarding |
| PR | Product Readiness |
| QC | Quality Control |
| R | Registration & Rebuild |
| WSA | Windows Server Admin |

---

## Houses

Organizational tags for filtering across product areas:

`forge`, `shield`, `cloud`, `web`, `script`, `code`, `key`, `eye`, `dark-arts`, `multi`, `ai`

---

## Features

### Dependency Management

Items declare dependencies via the `depends` array. The tool checks if all dependencies are `done` before considering an item unblocked.

- `triage` surfaces unblocked items first
- `next` only suggests unblocked items
- `blocked` lists all items with unresolved dependencies
- Missing dependency targets are flagged

### Smart Triage

`sprint triage` sorts by: blocked status (unblocked first) → priority (critical > high > medium > low) → creation date.

### Full-Text Search

`sprint search <query>` searches across ID, title, notes, houses, and series. Matching text in notes is highlighted inline.

### Priority Sorting

All list views sort by priority: critical → high → medium → low.

---

## Architecture

```
_tools/sprint-master/
├── sprint.js       # Main CLI (all commands, zero dependencies)
├── sprints.json    # Data store (~400+ items)
├── sprint.1        # Unix man page
├── migrate.js      # One-time markdown → JSON converter
└── README.md       # This document
```

- **No npm dependencies** — uses only Node.js built-ins (`fs`, `path`, `readline`)
- **Single JSON file** — all reads and writes go to `sprints.json`
- **Auto-dating** — all mutations timestamp the item and update file metadata
- **Case-insensitive lookup** — IDs are matched case-insensitively
- **ANSI color output** — statuses, priorities, and search matches are colorized

---

## History

Sprint Master replaced a 3,500+ line `SPRINT_BACKLOG.md` markdown file. The `migrate.js` script converted all existing items to JSON, preserving IDs, statuses, dependencies, and notes. Filtering and reporting went from manual text search to instant structured queries.

---

## License

Internal tool for Hexworth Prime educational platform.
