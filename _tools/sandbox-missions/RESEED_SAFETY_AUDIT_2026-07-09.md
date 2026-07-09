# Mission Seed Reseed-Safety Audit — 2026-07-09

**Question:** if a mission's `seed.sh` runs AGAIN mid-mission (relaunch/reconnect with the
mission selected — lab-manager reruns the seed on every `/launch` with a `mission` param),
does it destroy or revert any state a task check inspects or a student created?

**Scope:** the 10 of 18 missions WITHOUT an "already seeded, skip" guard:
cat-lost-notes, cd-breadcrumbs, grep-investigation, headtail-logwatch, ip-linecheck,
less-readingroom, ls-first-inventory, sortuniq-ledger, tar-timecapsule, wc-census.
(The other 8 — chown-handover, chmod-lockdown, cpmv-relocation, find-sweep,
mkdir-groundbreaking, ps-runaway, rm-decommission, systemctl-servicedesk — are guarded
because their tasks mutate seeded state in place.)

**Method:** dedicated read-only agent audit; all 20 files read (10 seed.sh + 10
mission.json); per-mission comparison of every path the seed writes vs every path task
checks inspect and every artifact students create/modify.

## Verdict: 10/10 SAFE for mid-mission reseed

Grounds (cross-cutting):
1. All randomization is `hostname | cksum`-derived — same container, same hostname,
   identical DEPT/PROJ/CODEWORD and recomputed SHAs on every reseed. No `$RANDOM`,
   `date`, or `/dev/urandom` anywhere. Env regeneration orphans nothing.
2. All loop-built files use `: > file` truncate-before-append (no double-append);
   all heredoc files are `cat >` full overwrites with byte-identical content.
3. All 10 are "read seed-owned sources, write separate answer artifacts" missions —
   no task asks the student to modify/move/delete a seed-owned path, and no seed
   writes a filename any task expects the student to create.

## Known fragilities (accepted, documented)

- **tar-timecapsule:** `mystery_2021.tgz` is byte-UNSTABLE across reseeds (gzip MTIME
  header + fresh member mtimes). Currently harmless: checks hash the `tar -tzf` name
  listing and extracted member content, never archive bytes. DO NOT add a check that
  sha256s a seeded archive byte-for-byte.
- **ls-first-inventory:** seed does `rm -rf $DEPT/archive` + rebuild — vaporizes any
  ungraded student scratch left inside `archive/` (no task stores anything there).
- **Integrity-check side effect:** reseed silently REPAIRS student-tampered evidence
  files (grep t09, headtail t08, sortuniq t08, less t07, wc t07, ip t07) — those hidden
  source-intact checks are unenforceable across a relaunch.
- **Transient:** a grade landing mid-reseed could momentarily fail a source-intact sha
  (`: >` + append loops are briefly partial). Not reachable from the UI: `/launch`
  responds only after the seed completes, and UI grading requires the session id from
  that response.

**Hostname dependency (platform-level):** this safety property depends on the container
(hostname) surviving the relaunch. If lab-manager ever recreates containers while
restoring student home dirs, every hostname-derived mission world would orphan ALL
prior work. Revisit this audit if that architecture changes.
