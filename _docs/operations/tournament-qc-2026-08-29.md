# Tournament System — full QC, benchmark and security audit

**2026-08-29.** Measured against production (throwaway benchmark tournaments, since removed) and
the deployed Cloud Functions. Security audit by Mallory against the emulator. Everything below
is a number that was taken, not an estimate — where something was not measured, it says so.

---

## TLDR — the three things that matter

1. **The tournament holds 24 people, not 128.** The team roster is a hardcoded list of six and
   there is no way to add a seventh. `maxTeams` is configurable up to 200 in the admin console
   and is **dead config** — nothing reads it when creating teams.
2. **The join code gates nothing.** Any signed-in user — including an anonymous one — can join
   any tournament they can list, and the whole `tournaments` collection is world-readable
   pre-auth. The code exists only as a salt ingredient.
3. **Correctness is genuinely solid.** Under concurrent load at 1000 teams, scores reconciled
   exactly against the submission log: zero mismatches, zero double-credits. The integrity work
   in this system is real and it holds.

---

## Capacity — the honest ceiling

| | Configured | Actually enforced |
|---|---|---|
| Teams | `maxTeams` 2–200 (default 32) | **6, hardcoded** |
| Team size | `maxTeamSize` 1–10 (default 4) | 10 max, enforced |
| **Total players** | *implies 128–2000* | **24 default · 60 absolute** |

Teams come from a fixed literal at `_app/admin/console.html:11118` — Red Cell, Blue Shield,
Green Ops, Gold Strike, Purple Haze, Cyan Storm. The only write to the `teams` subcollection in
the entire admin console is inside that loop; there is no add-team UI and no Cloud Function for
it. `maxTeamSize` **is** enforced, in `ctfJoinTeam` under a roster-lock transaction — measured:
4 users joined, the 5th was refused.

**The display makes this worse.** `console.html:11040` renders `teamCount + '/' + maxTeams`, so
an admin who set 32 sees **"6/32"** — a number that reads as headroom and is unreachable.

> **Decide before the next event:** 24 players is a small class. Raising it means either
> generating teams from `maxTeams` at creation, or adding a create-team path. Until then, treat
> 6 × `maxTeamSize` as the hard cap and set `maxTeamSize` deliberately.

---

## Performance — where it slows down, and why

Measured end to end against the **deployed** functions, 30 real identities firing simultaneously.

| Teams in tournament | `ctfJoinTeam` p50 | `ctfSubmitFlag` p50 | Correctness |
|---|---|---|---|
| 32 | 1.45 s | 2.33 s | clean |
| 250 | 3.07 s | 2.96 s | clean |
| 1000 | 8.79 s | 6.50 s | clean |

**One cause.** Both functions load the *entire* teams collection on every call to work out who
the caller is — `ctfSubmitFlag` at `functions/index.js:6959`, `ctfJoinTeam` at `:7238`. The scan
alone costs 69 ms at 10 teams and 276 ms at 1000, and the rest compounds from there.

At the real ceiling of 6 teams this is invisible. **It never becomes a problem at the size this
system can actually run** — which is worth stating plainly rather than filing as a performance
bug: fix the capacity ceiling first and this becomes relevant, not before.

**Nothing crashed.** No error at any scale tested. The failure mode is latency, not collapse.

- Challenges scale fine: 200 written in 843 ms, board-style read of all 200 in 163 ms.
- Podium query at 1000 teams: 295 ms.
- The composite index the rate-limit query needs (`teamId`+`challengeId`+`timestamp desc`)
  **exists** in `firestore.indexes.json` — its absence would have made every submission throw.

**One scaling defect that is real today:** `tournament-podium.html:353` subscribes to
`orderBy('score','desc')` with **no `.limit()`**, live. Every score change re-sends every team
to every viewer. Harmless at 6 teams, quadratic-feeling at any real size.

---

## Scoring — one live misconfiguration

**Found on the live "Special Event" tournament:** `scoringModel: 'dynamic'` with **no
`dynamicConfig` field**. The decay branch is guarded by
`if (tournament.scoringModel === 'dynamic' && tournament.dynamicConfig)`
(`functions/index.js:7097`), so it never fires. The tournament is configured for dynamic scoring
and will award flat static points forever, silently — the board still shows points, they simply
never decay. Nobody would notice from the UI.

**Everything else reconciled.** Recomputing every team's score from its accepted submissions and
comparing to the stored value across both live tournaments: **no drift.** The denormalised
counters — `teamCount`, `totalSolves`, `totalSubmissions`, and per-challenge `solveCount` — all
agree with the collections they summarise.

---

## Limits — probed against production, not read off the config

| Control | Result |
|---|---|
| `maxTeamSize` cap | **enforced** — 4 joined, 5th refused |
| One team per user | **enforced** |
| Replay of a solved flag | **enforced** — `ALREADY_EXISTS` |
| Rate limit, same team + challenge | **enforced** — `RESOURCE_EXHAUSTED` |
| Unknown `challengeId` | **enforced** — `NOT_FOUND` |
| **Per-user global rate limit** | **NOT ENFORCED — 12 guesses in 922 ms** |

The 10-second limit is scoped to *team + challenge*. Rotate the challenge and it does not apply:
one user pushed **12 guesses across 12 challenges in under a second**, roughly 13/s, unbounded.

Mallory found a *second, independent* bypass of the same control — see Finding 3 below. Together
they mean the anti-guessing throttle is decorative.

> **A note on how this was found.** The first version of the limits probe reported
> *"6 enforced, 0 not enforced"* while testing nothing at all: it hardcoded a team id that did
> not exist in the target tournament, so every probe failed `NOT_FOUND` and the harness read
> that as the limit holding. A limit test that cannot reach the limit is the most dangerous kind
> of green. Ids are now discovered from the tournament.

---

## Security — Mallory's findings

Reproduced against the emulator; nothing was run against production.

**1 · HIGH — the join code enforces nothing.** `ctfJoinTeam` never reads a `joinCode`; the
parameter does not exist. `tournament-lobby.html` has no code prompt. The only use of `joinCode`
anywhere is as a salt ingredient (`console.html:11108`). Meanwhile `firestore.rules:1225` is
`allow read: if true`, so an **unauthenticated** client can list every tournament and read the
plaintext code out of the document. Proven: an "invite only" tournament was discovered with no
prior link and its code read with zero auth. The only real control on participation is
`request.auth != null` — which anonymous sign-in satisfies. Roster slots could be filled by
disposable accounts before a class arrives (reasoned from the proven bypass, not load-tested).

**2 · MEDIUM — offline flag cracking is practical for the flag format the console recommends.**
`flagHash` *and* `flagSalt` are both on a world-readable doc, so the salt was never secret; only
the flag's entropy matters. Mallory recovered a two-word flag in **171,806 attempts / 125 ms**,
and measured 1.52 M hashes/sec on one core — a full two-word dictionary space in ~1 hour on CPU,
~1 second on a consumer GPU. The admin console's own examples (`HEX{view_source_is_your_friend}`)
are exactly that shape. **A random 128-bit flag in the same field is safe** — this is a flag
authoring problem, not a broken scheme.

**3 · MEDIUM — the rate limit is a check-then-act race.** Five teammates submitting the same
challenge simultaneously: **all five accepted**. The limit held for zero of five.

**4 · LOW — unbounded display name reaches the public team doc.** A 50,000-character
`displayName` was pushed verbatim into `memberNames[]` on a world-readable document. Rendering is
safely escaped so this is not XSS — the impact is layout disruption and a narrow route toward
Firestore's 1 MiB document cap, which would lock further joiners out of that one team.

**5 · LOW — the podium freeze is cosmetic.** Already disclosed in the feature doc, but Mallory
found the fix already exists: `broadcast.html:307-321` implements a real hard freeze that
snapshots standings; `tournament-podium.html` never got it. The projector page is the one that
leaks the surprise.

---

## Strengths — proven, not assumed

- **Score integrity under race.** Two teammates submitting the same correct flag at the same
  instant: exactly one credit, score incremented once, `solves` correct. The historical
  double-credit bug (a team scoring 1500 for two 1000-point challenges) is genuinely fixed, not
  merely commented as fixed.
- **Correct under load at every scale tested** — 1000 teams, concurrent submissions, zero score
  mismatches and zero double-credits.
- **No cross-tournament leakage.** A flag from tournament A cannot score in B, blocked by both
  membership and hash. Structurally guaranteed: the challenge ref is always derived from the
  caller's own tournament.
- **The client cannot choose which team gets credited** — there is no `teamId` parameter to
  attack; the team is derived server-side.
- **XSS stayed closed** across all four public renderers, including `team.color` whitelisting.
- **Roster locks hold** — 10/10 on the existing concurrency test; a uid racing five joins lands
  on exactly one team.
- **Rules-layer team lockdown holds** — 14/14; students cannot create or tamper with teams,
  scores, or names.
- **Hidden-challenge scoring is enforced server-side** (`index.js:7018`) — a previously proven
  exploit that stayed fixed.

---

## Boxes — can we add all the ones we want?

**Yes, with one caveat.** 136 boxes in the catalogue, 150 box directories on disk. Both boxes
referenced by live tournaments resolve. 200 challenges written and read back with no degradation,
and challenges map many-to-one onto boxes (User/Root/Intermediate flags from one box), so the
practical challenge count is comfortably above the box count.

**The caveat:** `visible` is enforced for *scoring* in the Cloud Function but appears **nowhere in
`firestore.rules`**, and challenges are `allow read: if true`. A challenge you have not revealed
is still fully readable — title, description, hints, `flagHash`, `flagSalt` — by anyone,
unauthenticated. Phased reveal is cosmetic; the scoring half is protected, the content half is not.

---

## Findings at a glance

| # | Sev | Area | Finding | Proven where | Task |
|---|---|---|---|---|---|
| 1 | **HIGH** | Access | Join code enforces nothing; anyone incl. anonymous can join any tournament | emulator | #316 |
| 2 | **HIGH** | Capacity | Only 6 teams exist (hardcoded); `maxTeams` is dead config — real cap 24 users | production | #315 |
| 3 | MED | Integrity | Rate limit has two independent bypasses (rotate challenge · race teammates) | production + emulator | #317 |
| 4 | MED | Scoring | "Special Event" set to `dynamic` with no `dynamicConfig` — decay never fires | production | #318 |
| 5 | MED | Secrecy | Offline flag cracking practical for the console's own example flag format | emulator | — |
| 6 | MED | Secrecy | Hidden challenges fully readable pre-auth; phased reveal is cosmetic | source | #319 |
| 7 | LOW | Display | Podium streams all teams unlimited, and its freeze is cosmetic | source | #320 |
| 8 | LOW | Display | Unbounded display name (50,000 chars) reaches the public team doc | emulator | — |

Findings 5 and 8 have no task: 5 is an authoring-practice change rather than a code defect, and
8 is bounded to layout disruption on one team. Raise them if either becomes load-bearing.

## Recommendations

Ordered by what unblocks the most. **Capacity first** — it is the only finding that limits what
an event can be, and it makes the latency curve moot until it moves.

| # | Do this | Where | Effort | Why it ranks here |
|---|---|---|---|---|
| 1 | Generate teams from `maxTeams` at creation, **or** stop rendering an unreachable ceiling | `console.html:11118`, `:11040` | S–M | 24 players caps every real event. The one-line display fix removes the misleading "6/32" immediately, even before the real fix |
| 2 | Require and verify `joinCode` in `ctfJoinTeam`; stop storing it in a world-readable doc | `index.js:7217`, `rules:1225` | M | Participation is currently ungated for anyone who can list the collection — including anonymous sessions |
| 3 | Make the rate limit **per-user** and serialize it in a transaction | `index.js:6979-6995` | M | Two proven bypasses; this is also what makes weak flags online-guessable |
| 4 | Write `dynamicConfig` at creation, or refuse to save `dynamic` without it | `console.html:11084`, `index.js:7097` | S | A live tournament is silently mis-scoring right now |
| 5 | Replace the console's example flags with high-entropy tokens | `console.html:3931`, `:4006` | S | Turns finding 5 from practical to infeasible without touching the hashing scheme |
| 6 | Gate challenge reads on `visible`, or document reveal as presentation-only | `firestore.rules` challenges block | S–M | Decide which it is; today the code implies one thing and the rules do another |
| 7 | Port the working freeze from `broadcast.html:307-321`; add `.limit()` to the podium query | `tournament-podium.html:353` | S | The fix already exists in this codebase and was never applied to the projector page |
| 8 | *Later:* index team membership instead of scanning all teams per call | `index.js:6959`, `:7238` | M–L | Only matters once capacity moves past ~100 teams. Do not do this first |

**Nothing here requires a rewrite.** Seven of eight are contained changes, and item 7's fix is
already written elsewhere in the repo.

## Tools, so this is repeatable

```
node _tools/tournament/inspect-tournaments.js                     # read-only live audit
node _tools/tournament/benchmark-tournament.js --teams N          # ramp (production, QCBENCH-*)
node _tools/tournament/load-tournament.js --tournament <id>       # deployed functions under load
node _tools/tournament/limits-tournament.js --tournament <id>     # is a limit real?
node _tools/tournament/benchmark-tournament.js --cleanup <id>     # remove benchmark data
```

Benchmark data created for this audit was removed: **1,759 documents** across three QCBENCH
tournaments, manifests retained under `_tools/tournament/bench-manifests/`, and the two real
tournaments verified untouched afterwards.
