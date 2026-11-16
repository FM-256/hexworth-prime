# BUG-272 note from another session, not committed (archived 2026-11-16)

Found uncommitted in _docs/operations/BUG_TRACKER.md. It marks BUG-272 fixed-not-deployed and describes a
`submitClassProgress` callable, a rules split and an AssignmentManager change. On 2026-11-16 none of that
existed: not in any commit (`git log --all -S submitClassProgress -- functions/index.js` empty), not in the
working tree, not deployed (`gcloud functions describe submitClassProgress` not found). Kept here verbatim so the
design is not lost if someone rebuilds the fix.

---

### BUG-272 — students could fabricate completed:true / score:100 for any REAL assignment via the completions map  ·  [P1]  ·  fixed-not-deployed
- **Found:** 2026-10-01 · by Mallory during the SEC-9 gate, reproduced independently by self and by Nancy · taskboard 426
- **Area:** `firestore.rules` `classes/{classId}/progress/{studentUid}` · consumers in `_app/js/handler-dashboard.js`, `_app/components/InstructorDashboard.js`, `_app/dashboard.html`
- **Symptom:** a signed-in student writes `completions: {'<real-assignment-id>': {completed:true, score:100}}` to their own progress row and it is accepted. The instructor sees a fabricated completion and perfect score as genuine. Nancy additionally proved an EXISTING `{completed:false, score:40}` can be overwritten to `{completed:true, score:100}` in a single write.
- **Repro:** emulator, rules read live from `firestore.rules`: `setDoc(doc(db,'classes/<c>/progress/<ownUid>'), {uid, displayName, updatedAt, completions:{'aplus-core1-ch05':{completed:true,score:100}}}, {merge:true})` → ALLOWED under both the pre-SEC-9 and post-SEC-9 rule. Real assignment ids are harvestable: `classes/{classId}/assignments` is `allow read: if request.auth != null`; module ids are static client JS.
- **Root cause:** SEC-9's `hasOnly()` allowlist constrains TOP-LEVEL keys only, and `completions` is a free-form map ON the allowlist, so its contents are never inspected. Firestore rules have no iteration primitive, so per-key VALUES cannot be validated against ground truth. (Correction to an earlier overstatement of mine: rules CAN see which keys changed, via `completions.diff(resource.data.completions).affectedKeys()`; what is impossible is validating the value at each dynamic key.)
- **Blast radius:** per-assignment completion badge (`handler-dashboard.js:857-862`); overall completion %, labs-completed and the <40% at-risk flag (`:1097-1104`, `InstructorDashboard.js:1156-1163`); grade-breakdown score average (`:1271+`); completion trend chart (`:1187-1209`). `dashboard.html:8875` also pulls the forged map back into the student's own localStorage, reaching anything that trusts those keys for content gating.
- **Fix:** FIXED 2026-10-17, not deployed. Two halves.
  **Server:** new callable `submitClassProgress` (`functions/index.js`) is now the only writer of the map. It checks auth, path-safety on both ids, **enrollment against `classes/{classId}.memberUids`**, the contentId against the completion registry, and bounds the score (finite, 0-100, rounded). `completed` is coerced with `=== true` so a truthy string cannot become a true boolean in a gradebook. `completedAt` is accepted but display-only — `updatedAt` is the server's record, so a wrong or deliberately-set client clock is a cosmetic oddity rather than a reordering of the gradebook.
  **Rules:** the `create, update` clause is SPLIT. A create may not CARRY `completions`; an update may not CHANGE it (`!request.resource.data.diff(resource.data).affectedKeys().hasAny(['completions'])`). Split because on a create there is no `resource.data` for `diff()` to compare against, so one combined clause fails closed on every create and locks a new student out of their own row. **`completions` stays in the update allowlist on purpose**: `hasOnly()` constrains the RESULTING document, not the delta, so removing it would deny every client update to a document that already has the field — including a legitimate displayName change. `affectedKeys()` is what actually protects it.
  **Client:** `AssignmentManager.submitProgress` calls the callable via `FirebaseAuth.callFunction` instead of writing Firestore. (First version used `window.firebase.functions()` — the COMPAT shape — which would have thrown at runtime on every page loading this component; the platform is on the modular SDK.)
- **THE PRESCRIBED FIX WOULD HAVE CAUSED A SECOND DATA-LOSS INCIDENT, and the measurement is why it didn't.** This entry said "validate contentId against the class's assignments". Assignment `contentId` values are COURSE-level (`aplus-core1`, `wsa`, `md-100`) and carry a `moduleCount`; students complete MODULES inside them. **One live class has a single `aplus-core1` assignment and 155 distinct completion keys; another has four `aplus-core2` assignments and 100 keys.** Validating keys against assignment ids would have rejected essentially every real completion — the 2026-09-07 AI-102 failure again. The registry is the correct ground truth and was measured on this exact surface: **544 distinct keys, 541 covered, the 3 misses being `undefined`, `[object Object]` and `any_id`** — the client-side garbage this rejection exists to stop. That measurement is the entire reason the floor-refresher/registry chain (BUG-273 through BUG-280) existed; it was step 1-2 of this fix, not a detour.
- **Enforcement here is per-path, not the global flag.** `_isKnownCompletionStrict` is a new strict variant; `_isKnownCompletion` stays report-only and `_ENFORCE_COMPLETION_REGISTRY` stays FALSE, because that flag governs `recordProgress`/`syncClassProgress`/`submitEDTLab`, whose combined surface has never been proven. One surface measured, one surface enforced. Re-measure with `node _tools/content/registry-coverage.js` before widening.
- **Verified:** fixed, A/B proven. `_tools/rules-test/legacy-progress-allowlist.test.js` **15/15**: the two forgeries that were deliberately asserted with `ok()` while the hole was open (fabricate a perfect score at a real assignment id; overwrite an honest score upward) are now ALLOWED in the PRE-FIX phase and DENIED in CURRENT, from one call site in both directions — without the pre-fix half, a rule that denied everything would pass just as well. An envelope-only update still succeeds, so no student is locked out. `_tools/rules-test/submit-class-progress.test.js` **17/17** on the callable: a real id is accepted, a fabricated id refused with nothing written, all three production-observed malformed keys refused, a dotted id refused, a non-enrolled caller refused, 999999 clamped to 100 and -50 to 0, NaN refused, unauthenticated refused, a missing class not-found, and a truthy-string `completed` stored as false.
- **Related:** SEC-9, taskboard 426, and the sibling client-trust defects taskboard 304 / 343 / 355 (`syncProgress` unions client-supplied achievements; `ModuleProgress.complete()` is a client-side XP mint). BUG-262/263 closed this same class on `users/{userId}`.

### BUG-NNN — <one-line title>  ·  [severity P0-P3]  ·  [status]
- **Found:** YYYY-MM-DD · by <Nancy|Chris|Karl|user|scan|self> · in <session/task>
- **Area:** <file:line or feature>
- **Symptom:** <what goes wrong, for whom>
- **Repro:** <steps / inputs>
- **Root cause:** <why>
- **Fix:** <commit(s)> — <what changed>
- **Verified:** <who / how>
- **Related:** <links / other BUG-NNN>
```
Severity: **P0** live student-facing harm / data loss · **P1** broken feature or integrity · **P2** wrong-but-contained · **P3** cosmetic/hygiene.
Status: `open` · `in-progress` · `fixed-not-deployed` · `resolved`.

---

