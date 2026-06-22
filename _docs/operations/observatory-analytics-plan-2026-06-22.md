# Hexworth Observatory — Analytics Plan (2026-06-22)

## TLDR
Make the Observatory reliably capture **who joined, which class, and what they did** — surfaced as per-student / per-class heatmaps in the admin console. Today it captures **nothing in production** because (a) the pipeline is keyed on a Firebase `uid` and anonymous joiners produce none, and (b) the Firestore rules that permit the writes are committed on the branch but **not deployed**. The plan closes both gaps, hardens event capture, then builds the dashboard.

Branch: `observatory-house` (preview-only). Nothing here touches production until the explicit go-live step.

---

## Verified current state (the "why nothing is captured")

| Fact | Evidence |
|---|---|
| Consent save is a no-op without a uid → only a per-browser localStorage mirror | `ObservatoryConsent.js:105-115` — `saveConsent()` guards Firestore write with `if (conn && uid)`; anonymous falls to `localStorage['observatory_consent_preview']` |
| `ensureConsent` lets anonymous users through | `ObservatoryConsent.js:275-280` — proceeds with `uid` = `null` |
| Tracker emits nothing without a uid | `ObservatoryTracker.js:58-59` — `emit()` returns early on `!_ctx.uid` |
| Rules exist only on branch, not deployed | `firestore.rules:100,108,116` — `observatory_consent` / `observatory_classes` / `observatory_activity`; default-deny in prod until `firebase deploy --only firestore:rules` from master |
| `course_click` races navigation | `ObservatoryTracker.js:88-95` — client `addDoc` fired in a capture-phase click handler while the page is unloading |

**Conclusion:** analytics require two preconditions the tracker can't fix on its own — a stable identity per joiner, and deployed rules.

---

## Requirements

- **R1 — Identity:** every joiner has a stable Firebase `uid` (no anonymous tracking).
- **R2 — Authorization:** Firestore rules deployed so writes land server-side, not localStorage.
- **R3 — Roster:** a clean who-enrolled-in-which-class list, separate from the raw event stream.
- **R4 — Reliable capture:** entry and dwell survive page unload; clicks don't silently drop.
- **R5 — Surfacing:** admin console shows roster, per-student activity, and heatmaps; exportable.
- **R6 — Ethics:** tracking runs ONLY post-consent (already enforced via `ensureConsent → onGranted`); collection matches the consent form's Data Usage section.

---

## Decision (position taken — for Nancy to challenge)

**The Observatory is sign-in-gated. Consent is the join event; there is no anonymous/tracked path.**

Rationale:
1. A research consent record is only IRB/audit-meaningful tied to an identity — an anonymous "I agree" is worthless evidence.
2. Per-student heatmaps *require* a stable uid to group by person and class.
3. Tourists casually browsing shouldn't pollute the research dataset.

Tourists may still see the **dashboard card + marketing description** (display-only, untracked); *entering* the house requires sign-in → consent.

Alternative considered & rejected: let tourists preview the house shell untracked. Adds a dual code path (tracked vs untracked render) for little value and risks half-instrumented sessions.

---

## Plan

### Phase A — Identity gate (client)
- `ensureConsent(onGranted)`: if `getUid()` is null, route to sign-in / create-account (existing `ArenaFirebase` / auth flow) and resume the gate after auth, **before** showing the consent form.
- Remove the `uid || 'preview'` anonymous persistence path for *joining*; keep localStorage only as an offline mirror for an already-authenticated user (resilience, not a substitute store).
- Net effect: `onGranted()` only ever fires for a signed-in, consented user → tracker always has a uid.

### Phase B — Data model
- `observatory_consent/{uid}` — consent record (built). Source of truth for "did they agree, which form version."
- `observatory_enrollment/{uid}` — **new** roster doc: `{ uid, classId, className, displayName, email, enrolledAt, formVersion }`. One per student; cheap to list per class for the dashboard. (Decision point: separate doc vs. enrich the consent doc — leaning separate so the roster query never reads consent prose.)
- `observatory_activity/{eventId}` — event stream (built): `house_enter`, `course_click`, `house_dwell`, each `{ uid, classId, type, path, at, clientTs, ...payload }`.
- `observatory_classes/{classId}` — admin-editable class list (built; `DEFAULT_CLASSES` fallback).

### Phase C — Reliable capture
- `house_enter`: keep client `addDoc` (page is alive → reliable).
- `course_click` + `house_dwell`: these fire at/near unload, where async `addDoc` is unreliable.
  - **Step 1 (ship first):** make `course_click` reliable without new infra — intercept the click, fire the write, then navigate on settle (short timeout fallback). Keep `house_dwell` best-effort via `pagehide`/`visibilitychange`.
  - **Step 2 (only if loss is measurable):** add a small HTTP Cloud Function `logObservatoryEvent` and switch click + dwell to `navigator.sendBeacon` → CF → `observatory_activity`. `sendBeacon` is purpose-built for unload-time sends. Deferred to avoid overbuilding before we see real loss rates.

### Phase D — Deploy (GO-LIVE gate)
- From **master only**: `firebase deploy --only firestore:rules` (R2).
- Merge `observatory-house` → master (confirmed zero file overlap), Chris gate, `./deploy.sh` for hosting.
- Verify in production with a real account: enter → consent persists to `observatory_consent/{uid}` + roster doc written → events land in `observatory_activity`.

### Phase E — Admin dashboard (P3)
- Roster (all + per class), per-student activity timeline, heatmaps (day×hour engagement, course-card popularity, dwell distribution), CSV/JSON export.
- Lives in the admin console; reads `observatory_enrollment` × `observatory_activity`, gated by `isAdmin()`.

---

## Risks / open questions
- **Auth friction at the gate** — requiring sign-in before consent may lower entry; acceptable for a research cohort, but confirm the sign-in flow is smooth (existing accounts vs. create-account).
- **Roster doc vs. consent doc** — separate (leaning) vs. enrich existing. Minor; affects dashboard read cost.
- **Dwell reliability** — accept best-effort first, or build the CF beacon up front? Position: ship best-effort, measure, add CF only if lossy.
- **PII in roster** — storing `email`/`displayName`: confirm it's within the consent form's Data Usage scope and admin-read-only by rule.

## Done when
A signed-in student joins a class → roster + consent persist server-side → their activity streams into `observatory_activity` → the admin dashboard shows that student under their class with a populated heatmap, in production.

---

## Implementation status (2026-06-22)

**ALL FIVE must-fixes built** on branch `observatory-house` (not deployed — go-live still gated). Nancy-reviewed (plan), Chris-passed (each implementation chunk). Operator/IRB decision 2026-06-22: **require real sign-in** (the strict path) across the board.

- **#1 require real sign-in** — `ensureConsent()` gates on `isRealSignedIn()` (rejects ArenaFirebase's anonymous auto-user) and shows an in-place Google sign-in overlay (`FirebaseAuth.signInWithGoogle`) before the consent form. Awaits `isReady()` (no slow-auth race); no bypass/loop. Commit `dab5ac525`.

- **#4 re-consent** — `ObservatoryConsent.ensureConsent()` honors a record only if `existing.formVersion === FORM_VERSION`; bumps re-prompt.
- **#2 roster** — `saveConsent()` writes `observatory_consent` + `observatory_enrollment` in one **atomic `writeBatch`** (no half-write); `displayName`/`email` from auth (null for anonymous). New `observatory_enrollment/{uid}` rules stanza.
- **#3 classId** — `ObservatoryTracker.buildContext()` reads classId from Firestore (enrollment→consent), localStorage fallback only.
- **#5 beacon + #6 integrity** — all activity events route through new CF `logObservatoryEvent` (onRequest/CORS) via `navigator.sendBeacon`; CF verifies the ID token (uid server-derived), derives classId server-side, whitelists fields, clamps dwell seconds. `observatory_activity` rule is now `create/update/delete: if false` (CF-only writes) — closes the spoof/stuffing gap.
- **Key discovery:** `ArenaFirebase` auto-signs-in every visitor anonymously, so tracking works with a per-browser pseudonymous uid today; #1 is therefore a policy choice (accept anonymous vs. require real account), not a correctness bug.

**Remaining before go-live:**
1. ~~Withdrawal / data-deletion mechanism~~ **DONE (2026-06-22, commit `97bfa7c23`)** — CF `withdrawFromObservatory` (verifies caller owns uid; deletes consent + enrollment + all activity in batches; writes a minimal uid+timestamp tombstone in `observatory_withdrawals` for audit, no PII). Student-facing `ObservatoryConsent.showWithdraw()` confirm dialog (linked from the house) → CF → `ObservatoryTracker.abort()` (kills late beacons) → clears local mirror → redirects. Chris-passed.
2. **Deploy** functions (`logObservatoryEvent`, `withdrawFromObservatory`) + firestore rules from **master**, then merge the house to production.
3. ~~P3 admin dashboard~~ **DONE (2026-06-22, commit `1b89dbbed`)** — `_app/admin/observatory.html` (admin-gated, linked from the admin console): summary cards, sortable roster (events + last-seen joined from activity), weekday×hour engagement heatmap, course-click popularity, dwell/visit summary, per-class breakdown, class filter, roster + events CSV export. Activity read capped at 5000 newest-first with disclosure. Chris-passed.

**Resolved by the 2026-06-22 "strict for all four" decision:** identity = real sign-in (built); re-consent = re-prompt on version bump (built, #4); roster PII (email/displayName) = stored admin-only in `observatory_enrollment` (built) — worth a final explicit IRB confirmation that this is within the consent's Data Usage scope.

---

## Nancy review (2026-06-22) — verdict BLOCK, must-fixes folded in

Adversarial review found the plan's intent sound (the sign-in-gate decision was NOT rejected) but the implementation gaps real. Verified against the code; the following are now **hard requirements**, not options:

**Must-fix before Phase D (deploy):**
1. **Sequencing — Phase A before Phase D, no exceptions.** Today `ensureConsent()` (`ObservatoryConsent.js:278-279`) fires `onGranted()` even when `uid` is null — `saveConsent()` silently falls to localStorage and the house opens anyway. If rules deploy *before* the sign-in gate is coded, anonymous users see the house and leave zero server-side trace → dashboard shows zero students → looks broken though rules are correct. Phase A must be coded + verified first. Also guard the slow-auth case: `getUid()`'s `await ArenaFirebase.isReady()` can return null on timeout — a slow auth load must NOT surface the form to an unauthenticated user (block/spinner until auth resolves).
2. **`observatory_enrollment` must exist before it's queried.** It is invented by this plan — zero references in repo, no rules stanza. Collapse the roster write **into `saveConsent()`** (one atomic block, no new function), populating `displayName` + `email` from `ArenaFirebase.auth.currentUser` (the consent form only captures typed `name` + `classId`). Add the `match /observatory_enrollment/{uid}` rules stanza in the same change. If the roster write fails, the house must still open (analytics never blocks the student).
3. **Tracker `classId` must come from Firestore, not localStorage.** `ObservatoryTracker.js:49-52` reads `classId` from the localStorage mirror — a student on a second device (no mirror) emits `classId: null` for every event, poisoning per-class heatmaps. `buildContext()` reads the Firestore consent/enrollment doc as authoritative, localStorage only as fallback.
4. **`FORM_VERSION` re-consent is documented but not enforced.** `ensureConsent()` only checks `if (existing)` — it never compares `existing.formVersion` to current. Bumping the version does nothing; previously-consented students never re-consent. For IRB this is mandatory: compare versions, re-prompt on mismatch.
5. **`course_click` (+ `house_dwell`) ship with the CF beacon in v1, not deferred.** Unload-time `addDoc` drops at a rate you cannot measure from the missing data itself; for the *first* research cohort that's unrecoverable systematic missingness. Switch click/dwell to `navigator.sendBeacon` → small HTTP CF `logObservatoryEvent` → `observatory_activity`. (`house_enter` stays a client write — page is alive.)

**Should-fix before go-live:**
6. **`observatory_activity` rule hardening.** `firestore.rules:117` checks `uid == auth.uid` but lets a student write any `classId` (pollute another class's heatmap) and any fields. Add a field whitelist and validate `classId` against the enrolled value (e.g. require it match the caller's enrollment doc). NOTE: true rate-limiting is NOT expressible in Firestore rules — abuse/volume control needs **App Check** (or the CF path validating per-uid volume), not a rule. Don't promise what rules can't do.
7. **Withdrawal + data-deletion path (IRB).** The consent form promises "withdraw at any time"; there is currently no mechanism. Needs a student-facing withdraw action + an admin delete path for consent/enrollment/activity. Operator/IRB defines the procedure.
8. **Admin credential hygiene.** `isAdmin()` (`firestore.rules:12-14`) hardcodes a personal Gmail with read access to participant PII. For research-data access, evaluate institutional-email gating. (Platform-wide, not Observatory-specific — operator call.)

**Open decisions requiring operator / IRB input (cannot be defaulted):**
- Re-consent procedure when the form version changes — what does the IRB require?
- Withdrawal mechanism — what should a student do to withdraw, and what data gets deleted vs. retained?
- Confirm `email` + `displayName` in the roster is within the consent form's Data Usage scope.
- Admin PII-access credential (personal vs. institutional).

**Revised "simplest path"** (Nancy-endorsed, all in files already being touched + one CF):
saveConsent() does consent + enrollment in one block (reads auth displayName/email) → add `observatory_enrollment` rules stanza → `buildContext()` prefers Firestore for classId → `ensureConsent()` adds the formVersion check + auth gate → ship `logObservatoryEvent` CF with sendBeacon for click/dwell → harden the activity rule.
