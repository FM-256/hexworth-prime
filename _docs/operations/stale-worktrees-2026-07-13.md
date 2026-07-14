# Frozen stale worktrees — inventory (2026-07-13)

**Decision: FREEZE, do not delete.** These git worktrees under `.claude/worktrees/` are inert
(they never touch master, never deploy, never commit anywhere but their own branch). Rather than
remove them, they are **locked** (`git worktree lock`), **archived** (copy + patch), and documented
here. Every step is reversible; nothing was deleted.

## Why freeze instead of delete
Deletion is irreversible and leaves no visual of what was lost. Freezing keeps a labeled, backed-up,
inspectable copy while defusing the only real risk (a future agent *reusing* a stale worktree and
colliding — see `feedback_parallel_agents_shared_tree_collide`). See `feedback_freeze_dont_delete`.

## Inventory

| Worktree | Size | Branch / HEAD | State | Contents |
|----------|------|---------------|-------|----------|
| `agent-a277adbd641268e49` | 862M | `worktree-agent-a277adbd641268e49` @ `3c7b6a179` | **locked (frozen 2026-07-13)** | 3 uncommitted files: an **early draft** of the Observatory class-switcher + admin class-editor |
| `agent-a60c3889d57be2c15` | 862M | `worktree-agent-a60c3889d57be2c15` @ `3c7b6a179` | **locked** (harness lock) | clean, no uncommitted changes |
| `agent-a2694f45` | 12K | — (not a registered worktree) | **frozen (`.FROZEN` marker, 2026-07-14)** | empty nested `.claude/worktrees/` skeleton only (0 files) |
| `agent-a9c3f40c` | 12K | — (not a registered worktree) | **frozen (`.FROZEN` marker, 2026-07-14)** | empty nested `.claude/worktrees/` skeleton only (0 files) |

### The two empty shells — freeze adapted (2026-07-14)
`agent-a2694f45` and `agent-a9c3f40c` are **not registered git worktrees** and hold **zero files**, so the
standard three steps map differently:
- **Lock** → `git worktree lock` can't apply (git doesn't know them as worktrees). A `.FROZEN` marker file
  in each dir is the freeze signal instead — a readable "do not reuse, do not delete" stop sign.
- **Archive** → nothing unique to preserve (0 files); the never-destroy rule has nothing at stake. Recorded
  here rather than copying an empty skeleton.
- **Inventory** → this table + the marker files.

Still **never deleted / never pruned**, consistent with the freeze standard.

## The `a277adbd` draft — verified, superseded, DO NOT merge
The 3 uncommitted files (`_app/components/ObservatoryConsent.js`, `_app/houses/observatory/index.html`,
`_app/admin/observatory.html`, 257 insertions) are **legit real work** — a coherent participant
class-switcher (`showChangeClass`) + admin class editor + an XSS-escaping hardening.

**But it already shipped to master** as commit `18a90f60e feat(observatory): participant class
switcher + admin class editor`, and master evolved it further (consent v2, "I decline" option, PI
grandfathering). Master is ahead on every file (master has 50 / 43 / 1492 more lines respectively).
The only draft-unique lines are *older* versions of code master already replaced (old
`FORM_VERSION = 'cerbi-v1-2026-06-21'`, pre-decline consent text). Nothing to salvage.

**Never merge `worktree-agent-a277adbd641268e49` into master** — it would regress the shipped
Observatory consent work (v2 → v1, drop the decline option).

## Archive (the visual / safety net)
`_archive/worktrees-2026-07-13/` (top-level, gitignored, outside `_app/`):
- `agent-a277adbd641268e49/uncommitted.patch` — the exact 3-file diff (verified: applies cleanly)
- `agent-a277adbd641268e49/uncommitted-files/...` — verbatim copies (verified byte-identical, sha256)
- `*/MANIFEST.txt`, `README.md`, `git-worktree-list.txt`

## To reverse (if ever needed)
- Inspect the draft: read the archive, or `git -C .claude/worktrees/agent-a277adbd641268e49 diff`.
- Unfreeze a worktree: `git worktree unlock <path>` (only if you deliberately intend to reuse it).
- The frozen worktrees cost ~1.7 GB disk; revisit only if space is tight.
