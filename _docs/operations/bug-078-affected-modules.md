# BUG-078 — modules whose completions may be unearned (instructor reference)

**TLDR.** Between an unknown start date and 2026-08-01, eight Armory modules could be completed by
typing a single line that did no work. Those completions were written to the instructor-visible
class-progress record. **Completions on the modules below, recorded on or before 2026-08-01, cannot
be distinguished from genuine ones and should not be treated as evidence of competence.**

**Class A is closed. Class B is NOT closed.** An earlier version of this file said all seven modules
were fixed. That was wrong, and it is the second time this document has overstated safety. Treat any
arm-sql completion, of any date, as not by itself evidence of competence.

> An earlier version of this document said "the defect is now fixed" and "completions recorded after
> the fix are sound." Both statements were wrong for the arm-sql modules and are corrected below. A
> document written to calibrate instructor trust that overstates a fix is worse than no document, so
> the error is left visible rather than quietly overwritten.

## Status by defect class, measured 2026-08-01

| class | what it is | status |
|---|---|---|
| **A — the command never ran** | `echo`, or a `#` comment, containing the graded keywords | **CLOSED.** Credit now requires the input to have been dispatched as SQL *and* to have returned without an engine error. An `echo` is neither. |
| **B — the command ran but meant nothing** | real SQL whose `WHERE`/`HAVING` predicate is garbage | **CLOSED — all 7 modules.** The statement genuinely runs and genuinely does not error, so the class-A gate could not see it; these modules now grade what the statement produced or named. Per-module status and commits below. |

Class B exists because `SQLEngine._evalSingleCondition` fails *open*: a condition it cannot parse is
treated as true, so the query returns every row and reports success. The task graders match on SQL
keywords alone, so preserving the keyword and corrupting only the operands passes.

**Modules where class B yields a full completion and a class-progress write** — measured against two
independent adversaries:

| module | status |
|---|---|
| `arm-sql-02-select` | **still completable on garbage** |
| `arm-sql-03-filtering` | **still completable on garbage** |
| `arm-sql-04-joins` | **still completable on garbage, from a single line** |
| `arm-sql-05-aggregation` | partially hardened; 3 of 5 chips still award on garbage |
| `arm-sql-06-subqueries` | **still completable on garbage** |
| `arm-sql-09-security` | **still completable on garbage** |
| `arm-sql-10-practical` | partially hardened; 4 of 5 chips still award on garbage |

> **RETRACTION, 2026-08-01.** I marked all seven FIXED after two independent harnesses each returned
> zero. Chris wrote a third adversary and broke six of them, each with a gradebook write. Both of my
> harnesses were structurally unable to find these: the corruption harness only mutates the modules'
> own commands while preserving keywords, table names and aliases, and the free-form harness had **no
> entries at all for `03`, `05` or `09`** — three of the seven modules it was cited as clearing. Two
> zeros that could not have been anything else.

Three root causes, none of them the residual I had disclosed:

1. **A statement-level signal carries per-task chips.** Each grader computes ONE boolean for the
   whole command. In `arm-sql-03`, `user_id < 3` narrows the statement, and that single real
   predicate authorises `IS NULL`, `LIKE`, `IN` and `BETWEEN` clauses naming columns that do not
   exist. My measurement was taken one command per task; the code never enforces per-operator
   effect.
2. **An alias whitelists the identifier it aliases.** `namesRealColumns` registers `AS <name>` into
   the known set *before* validating identifiers, so `zz1 AS zz1` self-authorises. That rule is the
   sole semantic gate on `06`, `09` and `10`, and the doc called it "the one thing the cheat cannot
   fake."
3. **`arm-sql-04` only requires rows > 0.** `ON u.user_id = u.user_id` returns 12 rows and still
   completes the module in one line. I had disclosed that shape as "weaker" without measuring that
   it still produces the exact harm this document says is gone.

Permanent regression fixtures for all of the above are committed at
`_tools/eduscan/armsql-negative-fixtures.js`, so this is re-runnable rather than re-asserted.

`arm-sql-04` is the sharpest — one line that asserts nothing completes the whole module and writes
the record. Still true.

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

**What this means for an instructor.** For every arm-sql module in the table above, a completion is
not by itself evidence of competence, whatever its date. Class A is closed and the bash modules are
separately verified as writing no record at all — do not read either as a clearance for arm-sql.

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

`UNION` returns 0 rows regardless of its operands, so `arm-sql-09`'s union-injection task still
cannot demonstrate its point even though it can no longer be faked. That is a separate engine gap,
logged rather than half-fixed.

An engine-level fix (teach `_evalSingleCondition` the forms it cannot parse, **then** error on the
remainder) would close the class everywhere at once, and remains worth doing as ordinary
correctness work. It is no longer a prerequisite for honesty. Making the fallback error *without*
teaching it first was measured and rejected: it drops honest completion from 8/10 to 2/10, because
the JOIN-alias, subquery and CTE paths depend on the pass-through — the same inversion that broke
the bash gate, caught before shipping instead of after.

## What is deliberately NOT done

No existing record was altered or deleted. Nancy's review considered clearing them and it stays
open pending operator authorisation and a scoped production query — under the standing rule that
nothing is destroyed without archiving first and explicit sign-off. Flagging costs nothing and
forecloses nothing.

Related: `BUG_TRACKER.md` BUG-078 · `_docs/operations/armsql-honesty-wip-status.md`
