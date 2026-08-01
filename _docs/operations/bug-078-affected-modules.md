# BUG-078 — modules whose completions may be unearned (instructor reference)

**TLDR.** Between an unknown start date and 2026-08-01, eight Armory modules could be completed by
typing a single line that did no work. Those completions were written to the instructor-visible
class-progress record. **Completions on the modules below, recorded on or before 2026-08-01, cannot
be distinguished from genuine ones and should not be treated as evidence of competence.**

**One of the two defects is fixed; the other is still live. Read the next section before you rely on
any arm-sql completion, including a recent one.**

> An earlier version of this document said "the defect is now fixed" and "completions recorded after
> the fix are sound." Both statements were wrong for the arm-sql modules and are corrected below. A
> document written to calibrate instructor trust that overstates a fix is worse than no document, so
> the error is left visible rather than quietly overwritten.

## Status by defect class, measured 2026-08-01

| class | what it is | status |
|---|---|---|
| **A — the command never ran** | `echo`, or a `#` comment, containing the graded keywords | **CLOSED.** Credit now requires the input to have been dispatched as SQL *and* to have returned without an engine error. An `echo` is neither. |
| **B — the command ran but meant nothing** | real SQL whose `WHERE`/`HAVING` predicate is unparseable garbage | **OPEN.** The statement genuinely runs and genuinely does not error, so the class-A gate cannot see it. |

Class B exists because `SQLEngine._evalSingleCondition` fails *open*: a condition it cannot parse is
treated as true, so the query returns every row and reports success. The task graders match on SQL
keywords alone, so preserving the keyword and corrupting only the operands passes.

**Modules where class B yields a full completion and a class-progress write** — measured against two
independent adversaries:

| module | full completion on meaningless input | record written |
|---|---|---|
| `arm-sql-02-select` | yes | yes |
| `arm-sql-03-filtering` | yes | yes |
| `arm-sql-04-joins` | yes — **from a single line** | yes |
| `arm-sql-05-aggregation` | yes | yes |
| `arm-sql-06-subqueries` | yes | yes |
| `arm-sql-09-security` | yes | yes |
| `arm-sql-10-practical` | yes | yes |

`arm-sql-04` is the sharpest: one line that asserts nothing completes the whole module and writes
the record.

```sql
SELECT * FROM users u INNER JOIN login_logs l ON u.zz1 = l.zz2 LEFT JOIN permissions p ON u.zz3 = p.zz4;
```

`arm-sql-07-crud` and `arm-sql-08-schema` resisted **both** adversaries, and for a real reason: they
are DDL/DML, where a bad identifier is a genuine engine error, so the class-A gate does catch them.
`arm-sql-01-intro` reaches full completion on free-form input but is not counted — its tasks *are*
the commands, so there is no predicate to corrupt and a student who runs them has done the task.

> **This table replaces an earlier one naming only four modules, which affirmatively cleared
> `arm-sql-04`, `-06` and `-10`.** That was a measurement artifact, not a finding. My harness
> corrupted every identifier except keywords and table names — including single-letter table
> aliases. `arm-sql-04`'s grader requires an alias (`/from\s+\w+\s+[a-z]\s/`), so corrupting `users
> u` to `users zz1` broke the *grader* and the module scored 0 and read as clean. The harness was
> measuring itself. Caught by Nancy on review, using a free-form adversary instead of corrupted
> versions of the modules' own commands.

**What this means for an instructor.** For the seven modules above, a completion is not by itself
evidence of competence, whatever its date. Class A is closed and the bash modules are separately
verified as writing no record at all — but do not read that as a clearance for arm-sql.

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
  `2c59d10ef`. **This closes class A only.** It cannot close class B, because a garbage predicate
  satisfies both of its conditions.

## What is still outstanding

The real fix is engine work, not gate work: teach `_evalSingleCondition` the predicate forms it
cannot currently parse, **then** make the remainder error instead of passing through. The order
matters. Making the fallback error *first* was measured and rejected — `BETWEEN x AND y` is one of
the forms it cannot parse, and it is a construct `arm-sql-03` explicitly teaches and grades, so
erroring first would block students doing the assigned work. That is the same inversion that broke
the bash gate, caught here before shipping instead of after.

## What is deliberately NOT done

No existing record was altered or deleted. Nancy's review considered clearing them and it stays
open pending operator authorisation and a scoped production query — under the standing rule that
nothing is destroyed without archiving first and explicit sign-off. Flagging costs nothing and
forecloses nothing.

Related: `BUG_TRACKER.md` BUG-078 · `_docs/operations/armsql-honesty-wip-status.md`
