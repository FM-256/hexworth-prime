# functions/ one-shot probes, archived 2026-08-11

Eighteen untracked scripts that lived in `functions/` and answered one question each, from work
that is now closed: the CLH dual-tree key comparison, the CSE final-key seed, an Observatory
class read/seed pair, and a validateFlag simulation for ceh-01.

**Archived, not deleted.** Every file here was copied and checksum-verified byte-identical
before being removed from the live tree. Nothing was destroyed and nothing is lost; the only
change is that `functions/` no longer carries them.

## Why they were moved
`functions/` is a deploy surface. A one-shot probe sitting in it is indistinguishable at a
glance from a Cloud Function source file, and the repo already carries the cost of that
confusion elsewhere: 534 scripts under `_tools/` are not in git and 727 are referenced by
nothing. Probes rot in place unless they are moved out.

## What was checked before moving
Each file was tested for inbound references across `.sh`, `.json`, `.md` and `.js`. All eighteen
had zero real callers — the handful that appeared to be referenced were citing their own
filename inside themselves.

## What was deliberately LEFT in functions/
- `_count_consent_versions.js` and `_count_observatory_volume.js` — cited by
  `_docs/operations/observatory-phase2-consent-v2-restore.md`, so they are part of a documented
  restore procedure rather than debris.
- `mission-gates.disarmed-backup.json` — the rollback artifact written by
  `seed-mission-gates.js --disarm` when it archives the live gate document before deleting it.
- `_backups/` — already an archive directory; moving an archive into an archive helps nobody.

To restore any of these, copy it back. They are ordinary files.
