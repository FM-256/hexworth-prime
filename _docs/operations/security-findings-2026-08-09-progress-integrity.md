# Progress-integrity findings, 2026-08-09

**Status: DOCUMENTED, NOT FIXED. Operator deferred the Cloud Function work to 2026-08-10.**

Found by Mallory during an exploit-driven audit of `le-01-cold-horizon` and its 3D sortie.
Two of the three findings are **platform-wide** and have nothing to do with that box; it was
just the thing being audited when they surfaced.

Everything below was **proven against a local Firebase emulator** (`demo-hexworth-test`) or a
local static server. Nothing was run against production Firestore or deployed functions.

Taskboard: **#304** (syncProgress), **#305** (client-callable globals), **#306** (revealGate).

---

## TLDR for tomorrow

| # | Finding | Scope | Severity |
|---|---|---|---|
| 304 | `syncProgress` unions client-supplied achievement ids into Firestore with no catalog check | platform | HIGH |
| 305 | `AchievementManager` / `GameTracker` are console-callable globals with no server validation | platform | HIGH |
| 306 | `revealGate` is declared a server-side guarantee and is enforced nowhere | one box | HIGH (integrity, not disclosure) |

304 and 305 compose: 305 forges the record locally, 304 makes it permanent and cloud-backed.

**No cross-user escalation in any of them.** A student can inflate their own account. Nobody
can reach another user's data, and no flag value is disclosed.

---

## 304 — `syncProgress` trusts the achievements array verbatim

`functions/index.js:1049`. `syncProgress` unions `localData.achievements` into
`users/{uid}.achievements` with only a `typeof === 'string'` check and a 1000-item cap
(`sanitizeStringArray`). There is no membership check against any achievement catalog.

`deriveXP` (`functions/index.js:981`) then scans that merged array for strings matching
`/^(gate_\d+|dark_arts_gate\d+)$/` and adds **500 XP per match**, without checking that the
corresponding `users/{uid}/gates/gateN` document — the record the real Cloud Function writes —
exists at all.

**Reproduction (emulator).**

```
syncProgress({ achievements: ['game_coldhorizon', 'gate_99', 'totally_made_up_id_xyz'], ... })
  -> { success: true, xp: 500, level: 3 }
```

Admin SDK read of `users/{uid}` confirmed on a second channel:

```
achievements: [ 'game_coldhorizon', 'gate_99', 'totally_made_up_id_xyz' ]
xp: 500   level: 3
```

`totally_made_up_id_xyz` matches no achievement definition anywhere in the codebase and was
persisted exactly like a legitimate one. `gate_99` inflated real, permanent XP with no gate
completion ever recorded.

### The part that matters most

`firestore.rules:73-84` permits `xp`, `level` and `achievements` as client-updatable fields,
and states the reason in a comment:

> syncProgress CF derives them server-side — client values are ignored during sync.

**That assumption is false for the achievements array.** It is true for XP, which is
re-derived. The array *contents* are trusted verbatim on union. A security rule is documenting
a guarantee the function does not provide, which is worse than an undocumented gap because it
tells the next reader not to look.

### Fix direction (do not implement without deciding)

1. Validate every incoming achievement id against the definitions catalog; drop unknown ids
   rather than storing them.
2. Derive gate XP from the `gates` subcollection, not from strings in a client-supplied array.
3. Correct the `firestore.rules` comment either way, so it stops asserting something untrue.

Note the interaction with **BUG-073 / taskboard #261**: 127 `unlock()` calls name achievement
ids that do not exist against 116 defined. A catalog check would reject those too, so the
catalog needs reconciling *before* or *with* the validation, not after.

---

## 305 — the graded surfaces are reachable without the game

Proven with Puppeteer against unmodified `cloud-cold-horizon.html`, served locally, with
AccessGuard satisfied the normal way.

**What held.** `typeof decide` is `'undefined'` at global scope. The sortie's graded decision
lives inside `<script type="module">` and genuinely cannot be console-called, and
`openDecision` only fires once every node is scanned. That defence works.

**What went around it.** You do not need `decide()`:

```js
AchievementManager.unlock('game_coldhorizon')
GameTracker.record('cold-horizon', { result:'success', score:300, timeElapsed:1 })
```

Both are classic-script globals, reachable by bare identifier from devtools even though
`window.X` is undefined — the same lexical-binding shape already documented on this platform.
Result: the achievement unlocked, two meta-achievements chained ("Podium Finish", "Record
Setter"), a fabricated rank-1 record with `bestTime: 1s` and no scan, flight or decision, and
**+1000 XP** written to `localStorage.hexworth_progress` via `GameTracker._awardHighScoreXP`.
Confirmed on a second channel by reading localStorage back.

`_app/components/AchievementManager.js:1195` — `unlock` is purely localStorage.
`_app/components/GameTracker.js:120-132, 267+` — `record` / `_awardHighScoreXP`.

This affects **every game on the platform**. On its own it is a local artifact; with #304 it
becomes durable.

---

## 306 — `revealGate` claims a control that does not exist

`_app/arena/boxes/le-01-cold-horizon/config-shared.js:273-276` states:

> The reveal gate. Checked SERVER-SIDE against captured evidence, never against a client
> progress object — presence-only checks are the shape of the `hexworth_tenant` bug.
> Scope criterion E1.

Every mission declares one. `grep -rln "revealGate|necessaries|corroboratorsRequired"` across
`functions/` and `_app/` returns **only that config file**. Nothing reads it, server or client.

`LagrangeEngine.submitFlag` checks only `boxId` and the submitted string against
`flag_registry`. Neither `telemetry.html` nor `gateway.html` disables Submit pending any
trust-ledger state — the button is live from page load and only toggles `disabled` during an
in-flight request.

**Proven:** a player can type a flag and click Transmit with zero independence-test clicks and
zero corroboration, on the first frame.

No flag value is disclosed, so this is an integrity gap rather than a leak. But anyone holding
a flag value from any out-of-band source gets full credit, including the phase output and the
achievement, without touching the mechanic the box exists to teach.

**Decision needed:** implement server-side gate evaluation once, so missions 5-15 inherit it,
or delete the `revealGate` field so the config stops claiming a control it does not have.
Deleting is honest. Implementing is what criterion E1 promised.

---

## What was checked and found sound

Recorded so tomorrow's work does not re-audit it.

- **`gradable` is soft at the client and safe by construction.** The engine never reads it; a
  console user can flip it. It does not matter, because the only thing preventing premature
  credit is the *absence of registry values server-side*. Verified fail-closed three ways
  against the emulator: no `flagId` returns `{correct:false}`; an explicit forged
  `flagId` throws `not-found`, which `submitFlag`'s own catch converts before the page sees
  it; a box with no registry doc behaves the same.
- **QA seams resist DNS aliasing.** `127.0.0.1.nip.io` does not match the literal host list.
  The one quirk — `''` matching `file://` — is closed as of 2026-08-09; it yielded no credit
  anyway, since a `file://` origin is opaque and carries no auth session.
- **No flag prefetch.** This box loads `LagrangeEngine.js` and never `BoxEngine.js`, so the
  231-box `_initWithMode` prefetch defect does not apply.

## Not swept

`ctfSubmitFlag` (tournament path) and team/leaderboard scoring were not exercised.
`submitGameScore`'s server-side rate and duration checks were read but not driven end to end.
#304 was not reproduced against production, by design. `fabric.html` / `orbital.html` do not
exist yet.
