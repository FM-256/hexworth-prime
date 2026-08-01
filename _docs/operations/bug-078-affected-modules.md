# BUG-078 — modules whose completions may be unearned (instructor reference)

**TLDR.** Between an unknown start date and 2026-08-01, eight Armory modules could be completed by
typing a single line that did no work. Those completions were written to the instructor-visible
class-progress record. The defect is now fixed. **Completions on the modules below, recorded on or
before 2026-08-01, cannot be distinguished from genuine ones and should not be treated as evidence
of competence.** Completions recorded after the fix are sound.

## The eight modules

| module | what one line did |
|---|---|
| `arm-bash-05-loops` | `echo` containing the loop keywords completed 4/4 |
| `arm-bash-06-functions` | `echo` containing `() {`, `$1`, `return`, `local` completed 4/4 |
| `arm-bash-10-advanced` | `echo` containing the array/trap/getopts tokens completed 5/5 |
| `arm-sql-03-filtering` | `echo` containing the filter keywords completed 5/5 |
| `arm-sql-05-aggregation` | `echo` containing the aggregate keywords completed 5/5 |
| `arm-sql-07-crud` | `echo` containing `insert into … rollback` completed 5/5 |
| `arm-sql-08-schema` | `echo` containing the DDL keywords completed 4/4 |
| `arm-sql-09-security` | **a `#` comment**, which executes nothing, completed 5/5 |

`arm-bash-04-conditionals` reached 3 of 4 the same way. It is fixed alongside the others but never
produced a full false completion, so it is not on the list above.

## Why this list is safe to act on and a record query is not needed

The eight ids are known from the defect itself. Identifying *which students* triggered it would need
a production Firestore query, which is gated — and it would not change what an instructor does with
the information, because a false completion is byte-identical to a real one in the record. There is
no marker to filter on. That is the whole problem, and it is why the module list is the actionable
artefact rather than a student list.

## What was fixed, 2026-08-01

- **arm-bash 04/05/06/10** — no longer write to the class-progress record at all. The terminal
  cannot execute loops, functions or arrays, so these tasks are unverifiable; the pages now say so
  and are marked practice. Commit `a37e1003f`.
- **all 10 arm-sql modules** — a real honesty gate: credit requires the command to have been
  dispatched as SQL **and** to have run without an engine error. An `echo` is neither. Commit
  `2c59d10ef`.

## What is deliberately NOT done

No existing record was altered or deleted. Nancy's review considered clearing them and it stays
open pending operator authorisation and a scoped production query — under the standing rule that
nothing is destroyed without archiving first and explicit sign-off. Flagging costs nothing and
forecloses nothing.

Related: `BUG_TRACKER.md` BUG-078 · `_docs/operations/armsql-honesty-wip-status.md`
