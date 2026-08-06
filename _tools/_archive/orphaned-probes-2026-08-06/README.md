# Orphaned one-shot probes — archived 2026-08-06

**Nothing here was deleted.** These 82 scripts were moved out of the live `_tools/` tree so
they stop being mistaken for working tooling. Every file is byte-identical to the original
(verified with `cmp` before the original was removed, and again after). To restore one,
copy it back to `_tools/<same relative path>`.

## Why these

Selected from `_tools/CATALOG.md` by two conditions together:

- **ORPHAN** — no file anywhere in the repo names them: not `deploy.sh`, not
  `post-verify.sh`, not `package.json`, not another script, not even a markdown doc.
- **leading underscore** — the local convention for a one-shot debugging probe.

Neither alone was treated as sufficient.

## What was DELIBERATELY EXCLUDED, and why it matters

The catalog offered 103. **21 were excluded**: everything under `_tools/sandbox-missions/`
(20 × `_envcheck.sh`, plus `_test-checks.sh` and `_test-solution.sh` in `cat-lost-notes`).

They look orphaned to the catalog and are not. They source `/opt/mission/env.<mission>` and
run **on the sandbox boxes**, so their caller lives on another machine where a repo-wide
reference scan is structurally blind. Archiving them could have broken the Linux sandbox
missions.

**This is a known limit of the ORPHAN column: it proves nothing in this repo calls a script.
It cannot prove nothing anywhere calls it.** Read a script before archiving it. A leading
underscore is a naming convention, not evidence that a script is dead.

Other candidates were checked for the same class of signal — remote execution, cron,
systemd, container exec — and none of the archived 82 carried one.
