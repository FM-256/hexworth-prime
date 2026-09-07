# Critical Guards Registry

Guards whose removal costs students. Each entry names the code, and — the point of the whole
document — **what happened when it wasn't there**.

`_tools/eduscan/guard-registry-audit.js` (GUARD-001) checks that every guard below still exists in
the code and still carries a rationale. If you delete one, the gate fails and you have to say why.

---

## Why this registry exists, and not a linter

On 2026-09-07 I removed a real guard from `functions/index.js` and deployed it.

`_isValidModuleId` rejected doubled prefixes (`forge-forge-...`). It fired on
`forge-forge-core2-virtualization-lab`, which I took for a legitimate completion being wrongly
discarded, so I deleted the clause to "save" it. It was not legitimate: `forge-core2-ch13`..`ch20`
are the real namespace, exactly ONE account holds the doubled form, and no content file defines it.
It was the exact garbage the guard existed to catch.

The identical rule lived in `_app/components/XPCalculator.js` with a different comment:

> *Early Firestore sync bugs allowed garbage entries into completedModules arrays (e.g. flat-format
> reconstruction created "forge-forge-..." double-prefixed IDs). Without this filter, 942+ garbage
> entries inflated XP by 10-30K per user.*

That comment stopped me. The server's comment — `// Validate module IDs: must be {knownHouse}-{key}
format` — did not, because it described WHAT the code did, which I could already read.

**A guard comment that restates the code is not documentation. It has to carry the incident.**

A blanket linter was measured first and rejected: requiring a rationale on every guard-shaped
function flags **156 of 170** in `functions/` and `_app/components/`, most of them `init`, `load`,
`joinClass` — ordinary functions with two `throw`s. A gate that fires 156 times is a gate everyone
learns to ignore, which is worse than no gate. This registry is small on purpose.

---

## Registered guards

### GUARD-01 — doubled-prefix rejection (server)
- **Where:** `functions/index.js`, `_isValidModuleId`, the `key.startsWith(house + '-')` clause
- **Incident:** flat-format reconstruction produced `forge-forge-*` ids; 942+ garbage entries
  inflated XP by 10-30K per user. Removed in error 2026-09-07 (`74cab4494`) and restored the same
  night once the XPCalculator comment was found.
- **Do not remove because it rejects something a student holds.** A student holding an id is not
  evidence they earned it — that is the premise of the whole BUG-264 forgery investigation.

### GUARD-02 — doubled-prefix rejection (client, XP)
- **Where:** `_app/components/XPCalculator.js`, `_isValidId`
- **Incident:** as GUARD-01. This is the copy whose comment prevented a worse outcome.
- **Note:** feeds `_checkIntegrity`, which sets `hexworth_integrity: 'violated'` past five
  mismatches, which `IntegrityLockscreen.js` uses to lock a student out. A wrong list here does not
  merely miscount — it removes a student's access. See taskboard 358.

### GUARD-03 — doubled-prefix rejection (client, sync)
- **Where:** `_app/components/FirestoreManager.js`, `_isValidId`
- **Incident:** as GUARD-01. Third copy of one rule; all three had already drifted apart by
  2026-09-07 (11, 13 and 15 houses respectively). The drift is the defect.

### GUARD-04 — cloud side of the progress merge is never shape-filtered
- **Where:** `functions/index.js`, `syncProgress`, `mergedModules` / `mergedLabs`
- **Incident:** BUG-266. The shape check was applied to the CLOUD side, so a completion whose id
  the rule did not recognise was STRIPPED FROM THE STUDENT'S STORED RECORD on an ordinary sync.
  It survived only because `recordProgress` had no validation and wrote it back — the two
  callables fought over the same fields on every page load.
- **The rule:** a validator may refuse to ACCEPT something. It must not DELETE something already
  earned. Widening the house list is not a substitute: `lab_ala_l02` and `lab_ala_l03` are real and
  match no `{house}-{key}` shape at all.

### GUARD-05 — gate achievements refused by the progress callables
- **Where:** `functions/index.js`, `recordProgress` (throws) and `syncProgress` (filters)
- **Incident:** BUG-264. `deriveXP` grants 500 XP per `gate_N`/`dark_arts_gateN` string. An account
  with an EMPTY gates ledger sent eight and was granted xp=4000, level=9, in production.
- **Both must stay.** Patching one is pointless: the other accepts the identical payload. That was
  proven — the first proposed fix covered only `syncProgress` and was bypassed via `recordProgress`.

### GUARD-06 — xp, level and their inputs are not client-writable
- **Where:** `firestore.rules`, the `users/{userId}` `allow update` allowlist
- **Incident:** BUG-262 and BUG-263, both reproduced against production. A raw REST PATCH with the
  student's own idToken set `{xp: 999999999, level: 500}` and returned HTTP 200. Removing those two
  was not enough: the INPUTS `deriveXP` consumes (`achievements`, `modulesCompleted`,
  `labsCompleted`, `quizzes`, `streak`) were writable the same way and laundered back through
  `syncProgress` as legitimate server-derived values.
- **`hasOnly()` evaluates the WHOLE write.** Any client writer of a removed field has its entire
  patch rejected, so the client writers must go in the SAME change.

### GUARD-07 — the house list agrees across all three copies
- **Where:** `functions/index.js` (`_KNOWN_HOUSES`), `_app/components/XPCalculator.js`
  (`_KNOWN_HOUSES`), `_app/components/FirestoreManager.js` (`_validHouses`)
- **Incident:** BUG-267. On 2026-09-07 the three copies held **15, 11 and 13** houses. Each was
  individually present and commented; all three disagreed; nothing noticed. A per-file check would
  have passed all three, which is why this one compares them to each other.
- **What the drift costs:** XPCalculator's copy feeds `_checkIntegrity`, which counts an
  unrecognised id as "garbage" and past **five** writes `hexworth_integrity: 'violated'`, which
  `IntegrityLockscreen.js` uses to lock the student out. A house missing from one copy removes a
  real student's access for completing real coursework — it is not a miscount.
- **Err permissive.** A missing house costs a student XP and possibly their account; an extra one
  only lets a rare garbage prefix through, and the shape rules still reject the real garbage shapes
  (`module_XXXXXX` has no dash).
- **Derived, not guessed:** the union of `ContentCatalog.HOUSES` and every house prefix present in
  all 7,528 real completion ids across 3,874 production users. If you add a house, add it in **all
  three** and re-verify against `_tools/progress-snapshot/snapshots/`.

---

## Adding a guard

Register it when its removal would cost a student progress, access, or an honest grade. Include the
incident: what broke, how it was found, and a number if there is one. If you cannot name what went
wrong without it, it probably belongs in a code comment rather than here.
