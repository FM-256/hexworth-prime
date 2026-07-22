# arm-sql grading-honesty — WIP status & handoff (2026-07-22)

**TL;DR.** The BUG-008 grading-honesty sweep reached the code-house **arm-sql** modules and uncovered
that the shared `SQLEngine.js` and the arm-sql content are **systemically broken** — far beyond a
grading gate. The honesty-gate mechanism and the engine bug fixes are **sound and verified**, but the
worked-example **canned outputs are fabricated in 11 of 12 boxes**, which is a content-authoring
rebuild. The work is **preserved on branch `armsql-honesty-wip` (commit `a6c03695e`)** and is **NOT
deployed**. `master` is clean and functional (arm-sql live state unchanged).

## What is where

| | State |
|---|---|
| **master** | Functional / deployed. arm-**bash** honesty gate is LIVE (BUG-008 arm-bash phase, `8a505c12a`). arm-sql is at its original live state (unchanged by this WIP). |
| **branch `armsql-honesty-wip`** (`a6c03695e`) | All arm-sql WIP: `SQLEngine.js` engine fixes + seed, `arm-sql-01..09` honesty gate + content fixes, and the 3 audit harnesses. **Do not merge/deploy as-is.** |
| Harnesses (gitignored `_tools/`) | `armsql-honesty-test.js` (gate: instructed queries complete, no-op DML + malformed GRANT blocked — 18 cases PASS), `armsql-runnable-audit.js` (runs every worked-example, error check), `armsql-output-audit.js` (compares each canned output vs the real engine result). Committed on the branch; restore to a working tree with `git checkout armsql-honesty-wip -- _tools/armsql-*.js`. |

## What is SOUND on the branch (real bugs fixed, Nancy-confirmed mechanism)

Engine (`SQLEngine.js`) — all genuine, platform-wide-beneficial fixes:
1. `_parseValueList` mis-parsed quoted INSERT values (`'a','b',1` → 5 values) → **every quoted-string
   INSERT failed** with a false "Column count mismatch". Also fixed trailing-comma + SQL `''` escapes.
2. 0-row `UPDATE`/`DELETE` rendered unconditional success → a no-op earned task credit. Now render an
   error so the honesty gate blocks it.
3. `GRANT`/`REVOKE` were absent from `SQL_LEAD_WORDS` and had no handler → never reached the engine.
   Added handlers (well-formed = simulated success, malformed = error).
4. `MIN`/`MAX` were numeric-only → returned `0` for TEXT columns (so `MIN(timestamp)`, a core lesson,
   was broken). Now compare lexicographically for text (ISO timestamps sort chronologically).
5. Seed: added a `network_logs` table + a `users.password_hash` column (+ `SCHEMA_SQL`), which the
   traffic-analysis / data-exfil / SQLi-UNION lessons reference but were never seeded.

Modules `01..09`: honesty gate on `#f87171` (SQLEngine's error color), plus content fixes
(07 `active`→`is_active` + real usernames + `'FAILED'`→`'failed'`; 09 UNION `id`/`password`→
`user_id`/`password_hash`). Module `10` is intentionally **not** included (needs the content rebuild).

## The BLOCKER — why it is held

`armsql-output-audit.js` proved that **11 of 12 runnable worked-example boxes print FABRICATED canned
outputs**: they show an imaginary, larger dataset (`2026-03-15` dates, `COUNT(*) = 847`, `142` failed
logins, invented IP tallies) while the real seed is 12 `login_logs` rows dated `2024-09`. A student who
clicks **Run** on almost any worked example gets the real result, contradicting the printed one. This
is pre-existing content, not introduced by this sweep — and it is a bigger problem than the grading
gap (students see fake results).

Fixing it is a **content-authoring rebuild**: choose a coherent seed size/scenario, author correct
worked-example outputs against it, fix the fabricated schema-reference boxes, and align the
`192.168.1.99` / attacker narrative that is threaded through arm-sql-02/03/05/06/10. Only then should
the (already-built) honesty gate + engine fixes ship.

## Recommended next steps (operator decision)

- **A (recommended): scope arm-sql as a dedicated content-rebuild project.** Rebuild the worked
  examples against a coherent seed, then merge the branch's gate + engine fixes.
- **B: salvage the engine bug fixes now.** The `_parseValueList` INSERT bug is a genuine live defect
  affecting any lab that does a quoted-string INSERT; it (and the MIN/MAX-on-text and 0-row-DML fixes)
  could be cherry-picked from the branch into a small `SQLEngine.js`-only commit, independent of the
  content rebuild. Requires its own Nancy/Chris pass since it changes shared-engine behavior.

## Related

- BUG-008 in `_docs/operations/BUG_TRACKER.md` (arm-bash phase = deployed; arm-sql phase = this doc).
- arm-bash pinned modules (04/05/06/10 language constructs) still await the C1/C2 engine-vs-rewrite
  decision — separate from arm-sql.
