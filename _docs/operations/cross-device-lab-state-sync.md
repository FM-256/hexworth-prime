# Cross-Device Full Lab-State Sync

*Live as of 2026-07-06 · HEAD `cfe36bb5e`*

## TLDR

Simulated multi-stage labs (WSA gauntlets, capstones) build an environment across stages — OUs, DNS
zones, servers — that lived only in one browser's `localStorage`. The platform's bulk cross-device
sync silently drops that environment because it exceeds a 10KB per-value cap, so a student who
switches devices mid-lab sees earlier stages marked complete over a freshly-reset, empty box. Later
stages that depend on earlier artifacts (e.g. a stage-3 OU) become undoable.

`LabStateSync.js` fixes this by carrying each lab's full state as its own Firestore document,
independent of the capped bulk-sync path. It is **shipped and verified on one lab** — the WSA
Advanced Gauntlet — as a proof. The mechanism (`StateFederation.js` wiring) is live platform-wide
for all 5 labs that use `StateFederation`, but only the Advanced Gauntlet has the boot-gate +
reconcile + no-persist pattern that makes the fix safe end-to-end. The other 4 labs still resume the
old way (flags travel, environment does not) until they get the same page-level wiring — see
Backlog.

Verification to date is a 12/12 pure-Node two-device simulation (mock Firestore, mock
localStorage). A real-browser two-device test has not been run — documented gap, not assumed clean.

## Problem

Students do long, escalating simulated Windows-Server/AD labs on one computer, sign in on a second
device to continue, and find earlier stages still marked "complete" but the environment they built
(OUs, DNS zones, servers) gone. Same-device resume works; only cross-device resume breaks.

## Root Cause

The platform's bulk `localStorage` cross-device sync in `_app/components/FirestoreManager.js`
(function `_collectSyncableState`) drops any single `localStorage` value over
`SYNC_MAX_VALUE_SIZE = 10000` (`_app/components/FirestoreManager.js:98`). A lab's full environment
serializes to roughly 12-24KB (measured: 12.3KB post-init baseline, 23.6KB fully completed — about
2.3% of Firestore's ~1MB document limit), so it never travels through the bulk path. Only the
lightweight completion-flags key (`StateFederation`'s `extract()` output, deliberately kept under
10KB) makes the trip.

On device 2, `StateFederation.load()` (`_app/components/StateFederation.js:106-148`) runs its
4-tier cascade: Tier 1 (full local state) is absent, so it falls to Tier 2, `fromSync()`
(`_app/components/StateFederation.js:124-132`), which reconstructs a state object from the
completion flags alone. The lab then renders a *fresh, broken* environment stamped with "done"
flags — later stages that need earlier artifacts have nothing to act on.

## Solution

Three files changed, all frontend, hosting-only deploy. **No `firestore.rules` change, no Cloud
Function change** — the rule that grants this write already exists (see Why below).

| File | Role |
|---|---|
| `_app/components/LabStateSync.js` (new) | Carries each registered full-state key as its own Firestore doc; owns pull/push/version logic |
| `_app/components/StateFederation.js` | Wires `register()`/`save()`/`reset()`/`clearFull()` to call into `LabStateSync`, guarded by presence check |
| `_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html` | Loads `LabStateSync.js`, adds the boot-gate, the honesty-reconcile guard, and the no-persist-on-unrestored rule |

### Why no `firestore.rules` change

`LabStateSync` writes to `users/{uid}/sync/{docId}` — the same subcollection the bulk sync blob
already uses. The existing rule at `firestore.rules:74-75` grants the owner read/write on the whole
`sync/{docId}` wildcard:

```
match /sync/{docId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

`LabStateSync` just picks a different, per-key `docId` (`labstate_<sanitized-key>`,
`_app/components/LabStateSync.js:50`) inside that same wildcard match. No new match block, no new
deploy surface.

### `LabStateSync.js` — component design

| Function | Signature | What it does | File:line |
|---|---|---|---|
| `register(key)` | `(key) => void` | Adds key to the tracked set, kicks an immediate pull | `_app/components/LabStateSync.js:137` |
| `queuePush(key)` | `(key) => void` | Bumps the local version counter synchronously, debounces the actual cloud write 3.5s | `_app/components/LabStateSync.js:145` |
| `pull()` | `() => Promise<number>` | Pulls every registered key; returns count restored | `_app/components/LabStateSync.js:129` |
| `ready(key, timeoutMs)` | `(key, ms?) => Promise<'pulled'\|'nodoc'\|'timeout'>` | Resolves once the initial cross-device pull for a key has settled (or 4.5s default timeout). The lab's boot gate awaits this before deciding what to resume. | `_app/components/LabStateSync.js:157` |
| `clearVersion(key)` | `(key) => void` | Removes the `<key>__lsv` counter — called alongside clearing the state value so version and content stay coupled | `_app/components/LabStateSync.js:196` |

Each registered key is stored as its own document at `users/{uid}/sync/labstate_{sanitizedKey}`
(`_app/components/LabStateSync.js:50`), with a `MAX_VALUE_SIZE` ceiling of 700000 bytes
(`_app/components/LabStateSync.js:34`) — well under Firestore's ~1MB document limit, and far above
the ~24KB a gauntlet actually needs. It never touches `FirestoreManager`'s core sync path.

**Why:** the core bulk-sync path (`FirestoreManager`) has caused prior "lost progress" incidents
(see `[[reference_firestore_sync_migration_pingpong]]`). Building an entirely separate, additive doc
per lab-state key means a bug in `LabStateSync` cannot regress the bulk-sync path that every other
feature on the platform depends on, and vice versa.

**Ordering is clock-free, not timestamp-based.** Each key has a monotonic version counter stored in
`localStorage` as `<key>__lsv`, not a wall-clock timestamp. A device adopts the cloud counter on
pull (`_app/components/LabStateSync.js:86`) and bumps its own counter synchronously on every save
(`_app/components/LabStateSync.js:148`), before the debounced write even fires.

**Why:** a wall-clock timestamp is vulnerable to device clock skew — a device with a clock set
forward could "win" a merge with stale content. A monotonic counter that only ever increases,
seeded from whatever the cloud reports on pull, cannot be gamed by clock drift.

**Push safety (`_pushKey`, `_app/components/LabStateSync.js:102-126`):**

- Refuses to push when the local counter is `<=` the cloud counter — instead it *adopts* the cloud
  copy (`_app/components/LabStateSync.js:116-121`). A device that hasn't incorporated the cloud's
  newer state can never clobber it.
- Refuses to push unparseable JSON (`_app/components/LabStateSync.js:108`) — corrupt local state is
  never promoted to the canonical cloud copy.
- Pull is TOCTOU-safe: `_attemptPull` re-reads the local counter *after* the `await getDoc()`
  resolves and compares again before writing (`_app/components/LabStateSync.js:81-88`), so a save
  that lands in the gap between the read and the write cannot be silently overwritten.

**Merge policy:** last-write-wins by monotonic counter. This is a single-student-multiple-devices
model, not concurrent collaborative editing — there is no operational-transform or CRDT merge of
divergent environments. That is a deliberate scope limit for the initial cut, not an oversight.

**Dependencies are presence-guarded.** `LabStateSync` reads `FirestoreManager.getDb()`,
`FirebaseAuth.getUser()`, and `window.firebaseFirestore`; absence of any of them is a no-op, not an
error. This is why loading `LabStateSync.js` on a page that hasn't finished initializing Firebase
never throws.

### `StateFederation.js` — wiring

`StateFederation` (used by every `StateFederation`-based lab) now calls into `LabStateSync` at three
points, all guarded by `window.LabStateSync` presence so labs that have not loaded `LabStateSync.js`
are completely unaffected:

| Call site | Trigger | File:line |
|---|---|---|
| `register(config)` | Module registration | `LabStateSync.register(config.storageKey)` at `_app/components/StateFederation.js:228-230` |
| `FederatedHandle.prototype.save` | Every `fed.save(fullState)` | `LabStateSync.queuePush(this._storageKey)` at `_app/components/StateFederation.js:89-91` |
| `FederatedHandle.prototype.reset` | `fed.reset()` | `LabStateSync.clearVersion(this._storageKey)` at `_app/components/StateFederation.js:171-173` |
| `FederatedHandle.prototype.clearFull` | `fed.clearFull()` | `LabStateSync.clearVersion(this._storageKey)` at `_app/components/StateFederation.js:182-184` |

**Why couple `clearVersion` to `reset`/`clearFull`:** the version counter and the state it counts
must never diverge. If a device cleared its state but kept a high counter, it would look
"caught up" on the next push comparison while holding no content — the invariant the whole scheme
depends on. This coupling was added as a direct follow-up (commit `cfe36bb5e`) to close a
non-blocking gap flagged during adversarial review.

`StateFederation` is used by exactly 5 labs today:

| Lab | File |
|---|---|
| WSA Gauntlet (base) | `_app/houses/cloud/modules/wsa/gauntlet/cloud-gauntlet.module.html` |
| WSA Advanced Gauntlet | `_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html` |
| M20 Failsafe Capstone | `_app/houses/cloud/modules/wsa/m20-failsafe-capstone/cloud-simulation.module.html` |
| Midterm Outpost | `_app/houses/cloud/modules/wsa/midterm-outpost/cloud-simulation.module.html` |
| Forge MD-100 Midterm Sim | `_app/houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html` |

Only the Advanced Gauntlet currently loads `LabStateSync.js`. The other four call
`StateFederation.register`/`save`/`reset` normally, but since `window.LabStateSync` is undefined on
those pages, every guarded call is a no-op — they behave exactly as before this change.

### Gauntlet page wiring (the pattern to replicate)

`_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html` adds three
things beyond loading the script:

**1. Script order** — `LabStateSync.js` loads before `StateFederation.js`
(`_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html:504`).

**2. Boot gate.** `DOMContentLoaded` awaits `LabStateSync.ready(STORAGE_KEY, 4500)` before calling
`checkResume()`, showing a "Checking for your saved environment…" banner in the meantime
(`_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html:4297-4304`).

**Why:** without this gate, a student who clicks Resume fast (before the async pull lands) triggers
the exact race described below. `ready()` never rejects — it resolves `'pulled'`, `'nodoc'`, or
`'timeout'` (4.5s default), so the page always proceeds, just not before the pull has had a chance.

**3. Honesty-reconcile guard.** `reconcileObjectives()`
(`_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html:1754-1756`)
derives each objective's completion from the live environment (`objective.check()`), never from a
stored flag. A synced "done" flag can never display as complete over an artifact that is not
actually present.

**4. No-persist-on-unrestored.** `resumeAttempt()`
(`_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html:1758-1773`)
checks whether the full environment (`STORAGE_KEY`) is actually present locally
(`_resumedFull`). If it is, it re-derives and persists normally. If it is **not**, it reconciles for
display only and explicitly skips `saveState()` — persisting a reconcile against an empty box would
stamp a newer version counter and overwrite the good cloud copy.

## Why the Safety Mechanisms Exist

This is load-bearing history — do not simplify these away without re-reading this section.

Adversarial review (Nancy) found a **critical data-loss race** in the first cut (commit
`6885b1212`): a fast Resume click on device 2, before the async pull landed, ran
`reconcileObjectives()` against the still-empty box (wiping completion flags to `false`), then
`saveState()` persisted that wipe with a fresh version stamp — which then overwrote the *good* cloud
copy. What had been "missing on device 2" became "gone everywhere."

The fix (commit `df0bc7111`) is four mechanisms that only work together:

| Mechanism | Closes |
|---|---|
| Boot gate (`LabStateSync.ready()` before `checkResume()`) | Stops a fast click from acting on a pre-pull, empty box at all |
| No-persist-on-unrestored (`resumeAttempt` skips `saveState()` when `!_resumedFull`) | Even if reconcile runs against an empty box, the wipe is never written anywhere |
| Clock-free monotonic counter (replaces wall-clock `lastSaved`) | A skewed device clock can no longer out-rank a genuinely newer cloud save |
| Push refusal + adopt (`_pushKey` refuses when `localLsv <= cloudLsv`) | An unrestored device's own push attempt is rejected and it adopts the cloud copy instead of clobbering it |

Together these make the original race impossible: even in the worst case (fast click, race,
attempted push), the push is refused because the unrestored device's counter cannot exceed the
cloud's. A follow-up commit (`cfe36bb5e`) closed a smaller gap in the same invariant — coupling
`clearVersion` to `reset()`/`clearFull()` so a cleared device can never look "caught up" while
holding no content.

Do not remove the boot gate, the no-persist branch, or the counter comparison as a "simplification."
Each one closes a specific step of a data-loss chain that was demonstrated, not hypothetical.

## What This Does NOT Do

- Does not touch `FirestoreManager`'s bulk sync path, `SYNC_MAX_VALUE_SIZE`, or `firestore.rules`.
- Does not merge divergent environments from two devices used concurrently — this is
  single-student-multiple-devices, last-write-wins by counter, not collaborative editing.
- Does not cover any lab beyond the Advanced Gauntlet with the full safety pattern (boot gate +
  reconcile + no-persist). The other 4 `StateFederation` labs get the wiring for free but not the
  page-level pattern — see Backlog.
- Does not have a real-browser two-device verification pass — see Verification.

## Verification

A pure-Node two-device simulation (mock Firestore, mock `localStorage`) covers 12/12 cases:
full environment travels device 1 to device 2 including the stage-3 OU; `load()` returns source
`'local'` (not `'sync'`) on the receiving device; wipe protection holds (an unrestored device cannot
push over the cloud copy); corrupt JSON is never pushed; counter ordering wins over a deliberately
skewed wall clock; `ready()` restores correctly on a fresh device.

**Gap:** a real-browser two-device test (two actual browser sessions against a live or emulator
Firestore project) has not been run. The Node simulation validates the ordering/safety logic; it does
not validate real Firebase SDK behavior, real network timing against the 3.5s debounce / 4.5s
timeout, or real auth-state-change sequencing.

## How to Add a New Lab to Cross-Device State Sync

1. Load `LabStateSync.js` **after** `StateFederation.js` is loaded but **before** the module's own
   inline script runs its `StateFederation.register(...)` call. (The Advanced Gauntlet loads it
   right after `StateFederation.js`, `_app/houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html:504`.)
2. No other wiring is required for `register`/`queuePush`/`clearVersion` — those calls are already
   inside `StateFederation.js` behind `window.LabStateSync` presence guards. A lab that already uses
   `StateFederation.register()` / `fed.save()` / `fed.reset()` gets cross-device full-state sync
   automatically once step 1 is done.
3. Add the boot-gate pattern to the module's own init code:
   - On `DOMContentLoaded`, call `LabStateSync.ready(STORAGE_KEY, 4500)` and only call the module's
     existing resume-check function inside the `.then()`.
   - Show a brief "checking for saved environment" indicator while it awaits (optional but
     recommended — it explains the pause to the student).
4. Add (or verify) a reconcile function that derives completion from live environment state, never
   from a stored flag alone, so a synced flag cannot display "done" over a missing artifact.
5. In the resume/restore handler, gate persistence: only call the module's save function if the full
   environment (the lab's `STORAGE_KEY`) is actually present locally after the resume decision. If
   it is not, reconcile for display only and skip the save — do not let a display-only reconcile
   become a written state.

## Backlog

| Item | Notes |
|---|---|
| Rollout to the other 4 `StateFederation` labs | WSA Gauntlet (base), M20 Failsafe Capstone, Midterm Outpost, Forge MD-100 Midterm Sim — apply the "How to Add a New Lab" steps above to each |
| Real-browser two-device verification | Node simulation is green; no run against real Firebase SDK / real network timing yet |
| `_docId` collision guard | `_docId(key)` sanitizes but does not check for collisions across distinct keys that sanitize to the same string. Fine for the current key set (one key per lab today) — needs a guard before the key namespace grows |
| `getDoc` -> `setDoc` is check-then-write, not a transaction | Acceptable under the single-user last-write-wins model; would need `runTransaction` if this ever supports true concurrent multi-device writes |
| Timeout-then-immediate-work edge | If `ready()` times out (4.5s, slow network) and the student begins working immediately, a slightly-stale cloud state could still land moments later via the late-arriving `hexworth:progressRestored` listener. Rare in practice; not yet reproduced or specifically tested |

## What NOT to Change

`FirestoreManager.js`'s `SYNC_MAX_VALUE_SIZE = 10000` (`_app/components/FirestoreManager.js:98`) is
not the bug to fix by raising the cap. That constant protects the bulk sync blob's aggregate size
against Firestore's ~1MB document limit across potentially hundreds of unrelated `localStorage`
keys (`SYNC_MAX_KEYS = 300`, `_app/components/FirestoreManager.js:99`). Raising it to accommodate one
lab's ~24KB state would let every other synced key grow unchecked against the same shared document
budget. `LabStateSync` exists specifically so lab state does not need to fit inside that shared
budget — it gets its own document instead.

## Related

- `[[reference_progress_sync_architecture]]`
- `[[reference_firestore_sync_migration_pingpong]]`
- `_app/components/FirestoreManager.js` — bulk sync path (untouched by this change)
- `_app/components/StateFederation.js` — federated state service consumed by 5 labs
- `firestore.rules:74-75` — the existing rule this feature reuses

*Last Updated: 2026-07-06 · v1.0.0*
