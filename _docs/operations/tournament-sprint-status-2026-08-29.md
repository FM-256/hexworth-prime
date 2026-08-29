# TOURN sprint — status

**2026-08-29.** Six of nine shipped, deployed and verified live. Companion to
`tournament-qc-2026-08-29.md` (the audit that produced the sprint). Board:
`node _tools/sprint-master/sprint.js list --series TOURN --all` — 11 items including
three follow-ups raised during review.

---

## ⚠ Two items only the operator can close

1. **Stray Discord messages.** The tournament test suites posted real "FLAG CAPTURED" messages
   to the live webhook channel — fake teams `T0`/`T1`, challenges `c60`/`cz`/`c500`. The cause is
   fixed (`sendWireNotification` now guards on `FUNCTIONS_EMULATOR`; one run suppresses nine),
   but the messages already sent need deleting by hand.
2. **"Special Event" now enforces its join code.** It is `active` and joinable. The code is in the
   admin console Manage panel. A student who errors on Join has a stale page cached: refresh.

---

## Shipped

| | What was actually wrong | Verified live |
|---|---|---|
| ✅ **TOURN-01** | Teams were a hardcoded six. Real cap was **24 players**, not the 128 the console implied. `maxTeams` was read by nothing. | `buildTeamRoster` present |
| ✅ **TOURN-02** | The console rendered `teamCount/maxTeams`, advertising an unreachable "6/32". | old render absent |
| ✅ **TOURN-03** | **HIGH.** The join code gated *nothing* — `ctfJoinTeam` never read it, and `flagSalt` was `joinCode + '-' + chId` on a world-readable doc, so every challenge published the code. | private-config write present |
| ✅ **TOURN-04** | The rate limit had **two** proven bypasses: rotate the challenge (12 guesses/922ms against production), and race teammates (5/5 landed). | `ctfSubmitFlag` deployed |
| ✅ **TOURN-05** | Dynamic scoring silently scored **flat static** — the branch required a `dynamicConfig` nothing wrote. | `dynamicConfig` written |
| ✅ **TOURN-08** | The freeze was a banner over a live listener, and the podium subscribed to every team unbounded. | snapshot read by podium **and** broadcast |

Also removed: `freezeMinutes`, collected on the form and read by nothing — confirmed absent from
the live page.

## Remaining

| | Severity | Why it is still open |
|---|---|---|
| **TOURN-06** | med | `visible` is enforced for *scoring* in `ctfSubmitFlag` but appears nowhere in `firestore.rules`, and challenges are `allow read: if true`. Hidden challenge content — title, description, hints, flag material — is readable pre-auth. Phased reveal is presentation-only. |
| **TOURN-07** | med | The console's own example flags are the crackable shape. Mallory recovered a two-word flag in 125ms; a random 128-bit flag in the same field is safe. This is a flag-authoring change, not a scheme change. |
| **TOURN-09** | low | Index team membership instead of scanning all teams per call. **Blocked on TOURN-01 and explicitly not first** — an 8.79s join p50 at 1000 teams looks like the headline and is invisible at six. |
| **TOURN-10** | med | `deleteTournament` orphans subcollections. TOURN-01 raised the ceiling from 6 stranded team docs to 200. |
| **TOURN-11** | low | The rate limit spends budget *before* the challenge-exists check, so a stale `challengeId` burns a slot. Also: no admin reset path for `rateLimits/*`. |

---

## Testing

Nine suites built for this sprint, all runnable and catalogued. Every one was checked for
**non-vacuity** — it must fail against the pre-fix code, or it proves nothing. A tenth,
`ctf-join-concurrency.test.js`, predates this work (BUG-024/026) and still passes 10/10.

| Suite | Result | Discriminates because |
|---|---|---|
| `ctf-joincode-gate.test.js` | 9/9 | 3/9 against the pre-fix function |
| `ctf-ratelimit.test.js` | 4/4 | pre-fix: 12/12 accepted, 5/5 raced through |
| `ctf-dynamic-scoring.test.js` | 11/11 | 4/8 pre-fix; recomputes the old formula in-file |
| `podium-freeze.test.js` | 16/16 | asserts the old render-live behaviour fails |
| `broadcast-freeze.test.js` | 22/22 | count-shaped and `lastSolveTime`-less snapshots both fail |
| `tournament-joincode.test.js` | 11/11 | reproduces a legacy tournament leaking its plaintext code |
| `freeplay-classification.test.js` | exit 0 | exits 1 against the pre-fix ruleset |
| `writebatch-runtime-proof.js` | 7/7 | real browser, real SDK, 450 teams committed and read back |
| `roster-browser-check.js` | 2/2 | asserts the console parses and the admin gate fires |

Functions suites need `NODE_PATH=$(pwd)/functions/node_modules`, **not** the repo root:

```
firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth \
  "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-<name>.test.js"
```

`broadcast-freeze.test.js` carries a **drift guard**: it copies logic out of the page and asserts
the copies still match, reporting `PAGE CHANGED: re-copy this logic into the test`. Proven by
perturbing one character in the page.

## Ops tools

```
node _tools/tournament/inspect-tournaments.js                  # read-only live audit
node _tools/tournament/benchmark-tournament.js --teams N       # production ramp, QCBENCH-* only
node _tools/tournament/load-tournament.js --tournament <id>    # deployed functions under load
node _tools/tournament/limits-tournament.js --tournament <id>  # is a limit real?
node _tools/tournament/benchmark-tournament.js --cleanup <id>  # remove benchmark data
```

Benchmark data created during the audit was removed: **1,759 documents** across three QCBENCH
tournaments, manifests retained under `_tools/tournament/bench-manifests/` (three files, now
tracked), both real tournaments verified untouched.

---

## Facts a cold reader will otherwise re-derive painfully

- **The freeze is display-only by design.** The button says Freeze *Scoreboard*; play continues.
  That is the CTF convention and the server is correct. This was mis-diagnosed once as a bug —
  do not "fix" it.
- The frozen board is **one authoritative array**, `tournament.frozenStandings`, captured by
  `ctfTransition` at freeze time and read by the podium *and* `broadcast.html` (the designated
  Big Screen). Deleted on unfreeze or end.
- **A snapshot must carry every field its consumers render.** Trimming `solves` to a count and
  omitting `lastSolveTime` each silently blanked a panel.
- `maxTeams` and `freezeMinutes` were **both dead config** — collected, stored, read by nothing.
  When a form field exists, check that something reads it.
- The dash gate flags **all five** dash forms including ` -- `. Do not swap one for another.

## How the work was gated

Every item went Nancy → Chris → deploy. Both gates blocked repeatedly and every block was a real
defect:

- An unclamped field that would have locked out an entire class (`0 >= -5` makes every team full).
- A security fix whose security decision **had never executed** — 11 assertions proved the
  plumbing, none called the gate.
- A claim that "every page renders that one array" made without checking `broadcast.html`.
- A "sliding window" comment describing a fixed window, proven by a boundary burst.
- Tests posting to a live Discord channel.

The QC hook additionally caught two shape mismatches and a `require()` pointing at a directory
that does not exist.
