# ToDo CLI — Quick Task Manager

Lightweight personal task list for quick capture during development sessions.

## Installation

The script lives at `~/.local/bin/todo` (system-wide, not project-specific). Requires `jq` for JSON processing.

## Usage

```bash
todo add "Fix the broken link in shield house"
todo add Review PR for gauntlet scoring
todo list                    # Show pending tasks
todo list --all              # Show pending + completed
todo done 3                  # Mark task #3 as complete
todo undo 3                  # Reopen a completed task
todo remove 5                # Delete a task permanently
todo clear                   # Remove all completed tasks
todo help                    # Show help
```

## Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `add <task>` | | Add a new task |
| `list [--all]` | `ls` | Show tasks (--all includes completed) |
| `done <id>` | `complete`, `finish` | Mark a task as complete |
| `undo <id>` | `reopen` | Mark a completed task as pending |
| `remove <id>` | `rm`, `delete` | Delete a task permanently |
| `clear` | | Remove all completed tasks |
| `help` | `--help`, `-h` | Show help |

## Data Storage

- **File:** `~/.todo-data.json`
- **Format:** `{ "todos": [...], "next_id": N }`
- Each todo: `{ "id": N, "task": "...", "done": bool, "created": "YYYY-MM-DD HH:MM" }`

## Implementation

- **Language:** Bash + jq
- **Dependencies:** `jq` (JSON processor)
- **Colors:** ANSI terminal colors for status indicators

## Nexus Integration

The Nexus ToDo spoke adapter (`_tools/nexus/adapters/todo.js`) reads `~/.todo-data.json` and surfaces pending items as low-severity findings. This is read-only — Nexus does not create or modify todos.
