# SYM-1 — Branch Archival (Non-Destructive)

> Per the "we do not destroy" rule, branches are NEVER deleted as cleanup.
> When work is complete and a branch should leave the active `git branch` list,
> ARCHIVE it into a `refs/archive/*` namespace instead. The ref survives, the
> commit graph stays intact, the branch just stops appearing in routine views.

## Why archive instead of delete

- **Reversible.** Re-creating a branch from an archived ref is `git branch <name> refs/archive/<name>`. Re-creating from a deleted branch requires reflog spelunking or a force-push from a stale clone — not always available.
- **Audit trail.** Every commit in the archived branch's history remains discoverable via `git log refs/archive/*`. Deletion makes commits unreachable; they only survive if reachable from another ref before garbage collection.
- **Cost is zero.** A ref is a 40-byte file. The commits it points to are shared with master/origin via packfile dedup. Archiving 100 branches costs effectively nothing.
- **Aligns with the platform's history.** Hexworth Prime's incident response (incident-response-playbook.md §3a) relies on branch refs as rollback anchors. Deleting a branch removes that rollback path even if the tag still exists.

## Branches in scope (post-fusion, 2026-05-04)

```
master                                 → ACTIVE; do not touch
Stragglers                             → archive candidate (work landed via fusion at 10fb08a6)
feat/stragglers-content                → archive candidate (scratch branch from revert-the-revert)
fix/dashboard-divergent-card-onclick   → archive candidate (Phase 1 BF-1, content shipped)
pre-restructure-backup-branch          → KEEP — labeled "backup", retain at minimum 90 days
```

## Procedure

### Local archive (the safe operation)

For each branch to archive:

```bash
# 1. Confirm the branch is fully merged or otherwise represented in master.
git log --oneline master | grep <expected-commit>

# 2. Move the ref into the archive namespace.
#    refs/archive/<original-name>-YYYY-MM-DD captures the date for chronology.
git update-ref refs/archive/Stragglers-pre-fusion-2026-05-04 refs/heads/Stragglers

# 3. Remove the local branch ref ONLY (the commits stay reachable via refs/archive/*).
#    This is NOT destructive — the SHA still exists, just under a different ref.
git update-ref -d refs/heads/Stragglers
```

After all three commands, `git branch` no longer shows `Stragglers`, but `git log refs/archive/Stragglers-pre-fusion-2026-05-04` shows the full history. Re-create with `git branch Stragglers refs/archive/Stragglers-pre-fusion-2026-05-04` if needed.

### Remote-aware archive

If the branch exists on origin AND is intended to be archived there too:

```bash
# Push the archive ref to origin (creates origin/refs/archive/...)
git push origin refs/archive/Stragglers-pre-fusion-2026-05-04:refs/archive/Stragglers-pre-fusion-2026-05-04

# CONFIRM the archive ref is now on origin before touching origin's branch
git ls-remote origin 'refs/archive/*' | grep Stragglers

# Update origin's branch to point at the archive ref's commit (preserving the SHA reference)
# WAIT — the user must explicitly authorize touching origin/<branch>. This step is NEVER autonomous.
```

**Origin branch removal is forbidden without explicit per-branch user authorization.** The local archive procedure above is safe; the remote step is a separate decision.

## Discoverability

After archiving:

```bash
# List all archived branches
git for-each-ref refs/archive/ --format='%(refname:short) %(objectname:short) %(authordate:short)'

# Inspect history of an archived branch
git log refs/archive/Stragglers-pre-fusion-2026-05-04

# Re-activate (restore as a working branch)
git branch Stragglers refs/archive/Stragglers-pre-fusion-2026-05-04
```

## Decision points for user

1. **Approve the three local archive operations** for `Stragglers`, `feat/stragglers-content`, `fix/dashboard-divergent-card-onclick`?
2. **Push archive refs to origin** as well, so other clones see the archive? (Default: yes — symmetry between local and origin views.)
3. **Origin branch handling** — leave `origin/Stragglers` etc. alone (recommended for now), or also archive on origin? Origin removal is a separate explicit authorization.
4. **`pre-restructure-backup-branch`** — confirm it stays as-is until 90-day retention window passes.

## What this proposal does NOT do

- Does not delete any branch on origin.
- Does not delete any local branch ref via `git branch -D`.
- Does not run `git gc --prune` or any garbage collection.
- Does not modify the rollback tag `pre-fusion-2026-05-04` (a separate, explicit anchor).

When approved, the operation is three pairs of `git update-ref` commands per branch — atomic, reversible, auditable.
