# Critical Guards Registry

Guards whose removal costs students. Each entry names the code, and — the point of the whole
document — **what happened when it wasn't there**.

`_tools/eduscan/guard-registry-audit.js` (GUARD-001) checks that every guard below still exists in
the code and still carries a rationale. If you delete one, the gate fails and you have to say why.

---

## Why this registry exists, and not a linter

On 2026-09-07 I removed a guard from `functions/index.js` and deployed it, was told it was real,
restored it, wrote a confident incident narrative into three files — **and the restoration was the
error.**

`_isValidModuleId` rejected doubled prefixes (`forge-forge-...`). It fired on
`forge-forge-core2-virtualization-lab`, and I wrote that no content file defined it and it was the
exact garbage the guard existed to catch. **That was false.** `ContentCatalog.js:524` declares
`forge-core2-virtualization-lab`; `forge-virtualization.lab.html:1421` completes it; and
`ModuleProgress.complete` builds `${houseId}-${moduleId}`, so the doubled form is what the platform
legitimately produces. **2,248 of 3,342 catalogue entries already carry their house prefix.** A
student earned that lab, and the clause was counting it toward a lockout.

Two lessons came out of it, and the second is the harder one.

**A guard comment must carry its incident.** The copy of this rule in
`_app/components/XPCalculator.js` recorded one — *"flat-format reconstruction created
'forge-forge-...' double-prefixed IDs. Without this filter, 942+ garbage entries inflated XP by
10-30K per user."* — and that is what made me stop and look. The server's comment said
`// Validate module IDs: must be {knownHouse}-{key} format`, which described what the code did and
so did not argue back. That historical incident was real. The clause was simply never what caught
it.

**A comment carrying a FALSE incident is worse than a thin one.** I wrote "no content file defines
it" into three files without opening the catalogue, and that fiction was load-bearing for hours —
it survived a review, a deploy, and my own retelling. This registry's gate can verify a rationale
EXISTS. It cannot verify one is TRUE. Only reading the source of the claim does that, and I did not
until a reviewer forced the question.

A blanket linter was measured first and rejected: requiring a rationale on every guard-shaped
function flags **156 of 170** in `functions/` and `_app/components/`, most of them `init`, `load`,
`joinClass` — ordinary functions with two `throw`s. A gate that fires 156 times is a gate everyone
learns to ignore, which is worse than no gate. This registry is small on purpose.

---

## Registered guards

### GUARD-01 — completion ids are validated by DECLARATION (`_isKnownCompletion`)
- **Where:** `functions/index.js` — `recordProgress`, `syncProgress`, `submitEDTLab`,
  `syncClassProgress`. All four live writers of `modulesCompleted`/`labsCompleted`.
- **Incident:** BUG-264. Both callables accepted ANY string as a completion and `deriveXP` paid XP
  for it — proven live in production. The fix was blocked for a long time because there was
  nothing to validate against: ids are data-driven, and scraping call sites yields 0.7% coverage.
- **Sweep every writer, not the one you found.** The first fix covered `recordProgress` and
  `syncProgress` and left `submitEDTLab` writing the identical field unvalidated — the exploit
  stayed fully live through it. A reviewer found that, in the same commit whose message reasoned
  about checking sibling call sites for a different field.

### GUARD-02 — `functions/completion-registry.json` exists and is generated
- **Where:** `functions/completion-registry.json`, from `_tools/content/gen-completion-registry.js`
- **Incident:** the registry IS the validation. Hand-editing or losing it disables the check
  (validation fails open by design — see below). `--check` is wired into deploy.sh gate 3.8, so
  shipping content without regenerating fails the build. Without that gate, tomorrow's new module
  is rejected for every student who completes it: the same data loss in a new coat.

### GUARD-03 — the legacy floor, and it is not optional
- **Where:** `_tools/content/legacy-completion-ids.json`
- **Incident:** declared content sources cover only ~55% of ids students actually hold. Enforcing
  without this floor would have REJECTED 3,383 real completions on `users/{uid}` and 1,080 more on
  class rosters — `cloud-openstack-neutron` (32 students), `eth-l01` (32), `ala-final-practical`
  (20). Both numbers were measured against production BEFORE enforcement was switched on.
- **Nothing is excluded from this floor.** One id was excluded as "garbage" on 2026-09-07 and that
  was WRONG — `forge-forge-core2-virtualization-lab` is declared at `ContentCatalog.js:524` and
  completed by a real page. A student earned it.

### REMOVED — the doubled-prefix rejection (was GUARD-01..03)
Three copies of `if (key.startsWith(house + '-')) return false;` were registered here as critical.
**They were removed 2026-09-07 with evidence, and the removal is the lesson.**
`ModuleProgress.complete` builds `${houseId}-${moduleId}`, and **2,248 of 3,342 ContentCatalog
entries already carry their house prefix** — so the doubled form is what the platform legitimately
produces, not corruption. The clause rejected real completions and counted them toward a lockout.
The historical sync-bug incident it cited was real; that clause was simply never what caught it.
**A shape rule can misjudge real content. A declaration cannot.** That is why validation moved to
the registry.

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
