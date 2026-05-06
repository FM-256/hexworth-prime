# PROG-003 Stale-Progress Regression Note

**Date:** 2026-05-04 (Stragglers merge, master `10fb08a6`)
**Sprint:** STR-31
**Decision:** Acceptance — option-a (accept the regression, document and re-credit affected students who report)

---

## What changed

The PROG-003 rename pass (Symbiosis sprint, 76 file edits documented at `_docs/operations/prog003-rename-plan-2026-05-04.md`) renamed `ModuleProgress.complete()` keys for 76 platform files to make each file's progress entry unique. Before the rename, multiple files shared the same progress key (e.g., five files all wrote to `cloud-guilab`); after, each file has its own (`cloud-wsa-m01-guilab`, `cloud-wsa-m02-guilab`, etc.).

## What happens to existing student progress

For 1-to-1 renames (most cases), the migration shim at `ModuleProgress.migrateLegacyKey` reads the old key from a student's localStorage on first load after the rename and copies it to the new key. Idempotent — runs once per legacy key. Memory entry: `reference_module_progress_migrate_legacy_key.md`.

For 1-to-N renames (Section A of the plan: where one shared key was used by multiple distinct files), the shim cannot determine which of the N files the student actually completed. The migration would either (a) credit none, (b) credit all (false claim), or (c) dual-write to all-and-old (delays the problem indefinitely). Per Nancy's review, option (b) is a falsehood, option (c) just defers, so the accepted approach is **option (a) — credit none, treat as if the student had not completed any of the N files**.

## Student-facing impact

Affected students (those who completed at least one file in a 1-to-N rename group and had progress stored under the old shared key) will see their completion count decrease for the affected modules after the merge. Specifically:

- They may see "0/N WSA modules complete" even if they had recently completed one or more.
- The original completion records are NOT lost — they still exist in localStorage under the old key — but they no longer count toward the new per-file progress entries.
- Re-completing the file will restore credit to the new key. The student does not need to redo the underlying lab/quiz; just visit the file again and let `ModuleProgress.complete()` fire.

## Affected groups (1-to-N cases)

Per the rename plan Section A, the 1-to-N affected groups are:

- `forge-admin-tools` (3 files)
- `cloud-guilab` (5 files: WSA modules + 1 canonical)
- Others as enumerated in `_docs/operations/prog003-rename-plan-2026-05-04.md` Section A.

Total students potentially affected: any who completed at least one file in these groups before 2026-05-04.

## Operator action when a student reports

1. Confirm the file in question is in a 1-to-N rename group (cross-reference plan doc).
2. If yes, confirm via instructor portal that the student should have credit for that file.
3. Use the admin console's "Force Complete" mechanism (or the equivalent direct localStorage manipulation) to set the new per-file key.
4. Document the manual credit in the audit log.

## Why this was accepted

The platform has no way to know, after the merge, which of the N files a student actually completed. Re-crediting all N would inflate completion stats falsely. Re-crediting none preserves stat truthfulness at the cost of student inconvenience. Re-completion is low-cost (the actual lab content is the same — just visit again to fire `complete()`). Manual operator intervention is available for students who report.

## Related

- Sprint: STR-31 (now closed)
- Plan doc: `_docs/operations/prog003-rename-plan-2026-05-04.md`
- Migration shim memory: `reference_module_progress_migrate_legacy_key.md`
- Stragglers merge: master `10fb08a6` (2026-05-04)
