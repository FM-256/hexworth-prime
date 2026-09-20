# Tournament flag secrets: the defect, the fix, and the migration runbook

**TLDR.** Every tournament challenge document published its `flagSalt` and `flagHash` to
anyone on the internet, and all five live flags were recovered from them. The crypto now lives
in an admin-only collection and `ctfSubmitFlag` refuses to grade a challenge whose secret is
missing rather than mis-grading it. A second, independent route (`deliverFlag` handing the same
plaintext to any anonymous account) is closed server-side in the same change.

**Status: PARTLY DEPLOYED, TABLED as a QC/QA item.** Rules, indexes and hosting are live.
The functions deploy and the data migration are NOT done, and BUG-269 is therefore NOT closed:
the five challenge documents still carry their public crypto right now. The remaining steps need
one admin-console click that no script may substitute for. See "Where this is parked".

Related: BUG-269, BUG-270, BUG-271 in `BUG_TRACKER.md` · taskboard 400, 401, 402, 403, 404, 405 ·
sprints TOURN-06, TOURN-07 · commits `0fed716c3`, `72737e2d6`.

---

## 1. What was wrong

| | |
|---|---|
| **Measured** | 2026-09-17, unauthenticated Firestore REST GET of `tournaments/{id}/challenges` |
| **Result** | 5 challenge documents across both live tournaments, every one exposing `flagSalt` AND `flagHash` alongside title, description, points, hints, boxId, visible |
| **Why** | `firestore.rules` grants `allow read: if true` on the challenges subcollection so the lobby preview and the podium work pre-auth. Rules hide a DOCUMENT, never a FIELD, so a secret stored as a field on that document is published, not protected. |
| **Hash** | single-round `sha256(flagSalt + ':' + flag)`, no HMAC, no server secret. `FLAG_SECRET` exists but serves gate proofs, not these. |
| **Proven** | Mallory recovered ALL 5 live flags by hashing a handful of known candidates from `functions/box_flags.json` against the published salts. The documents carry a `boxId` and the tournament flags ARE the box flag values, so this was candidate verification, not a keyspace search. |

The platform's own documentation claimed the opposite: `TOURNAMENT_SYSTEM.md` said "No hashes
are ever sent to the client. This prevents team members from extracting flags from network
traffic or source code." The hash was not sent. It was published, which needs no app
interaction and no account at all.

**TOURN-03 had already written this exact reasoning down** for the join code in August, one
collection over, and it was never carried across to these two fields.

### The second route, which no amount of flag entropy closes

`deliverFlag` returns a box's flag text to any caller with `request.auth`, and anonymous
sign-in satisfies that, unless `flag_registry/{boxId}.deliveryDisabled` is set. The admin
console's own "Import from Boxes" workflow copies a box's registry flag into a challenge and
never sets that field. So the console's first-class path for staffing a tournament from existing
arena content produced, by default, challenges whose answers were available on request. Proven
in the emulator with a freshly created anonymous account, confirmed by an independent read of
`users/{uid}/flag_deliveries`.

This is why "just author stronger flags" was not the answer: a perfect CSPRNG token would be
handed out just as readily.

---

## 2. The decision

Four-way vote convened 2026-09-17 on operator instruction. **Option A, 4-0** (Nancy, Mallory,
Chris, primary): move the crypto out of client reach.

Rejected: requiring auth on the whole challenges collection (sacrifices the deliberately public
pre-auth podium to protect two fields), and guaranteeing high-entropy flags while deferring the
storage move.

The entropy-only option was a real position and it died on evidence, not argument:

1. All five live flags were recovered.
2. TOURN-07's own stated safety bar ("a random 128-bit flag in the same field is safe") is unmet
   by every live flag. Two are two-word and three-word dictionary phrases. The other three copy
   their leetspeak prefix verbatim from the public `boxId` and their role suffix from the public
   title, leaving 8 hex characters, 32 bits, unknown.
3. TOURN-07's prescribed remedy was never shipped. `console.html` still ships
   `HEX{view_source_is_your_friend}` as its example flag.
4. The `deliverFlag` route bypasses the hash entirely.

**A correction is on record:** this was filed as a fresh CRITICAL when TOURN-07 had recorded the
exposure and a measured crack on 2026-08-29, at MEDIUM, with the opposite remedy. The search
that missed it covered `_docs`, memory, Confluence and the shared folder, but read the TOURN
board through a CLI that truncates titles and hides notes. Read `sprints.json` notes directly.

---

## 3. What the fix is

**Storage.** `tournaments/{tid}/flagSecrets/{challengeId}`, one document per challenge,
`allow read, write: if isAdmin()`. One document per challenge rather than a map on a single
document, for two reasons: a future bug reopening read access leaks one challenge instead of the
whole tournament, and a partial migration is detectable by a count against `challenges` instead
of a key diff inside a map.

**Reader.** `ctfSubmitFlag` reads it with the admin SDK, which bypasses rules.

**There is no fallback, in either direction.** A challenge with no stored secret is REFUSED with
`failed-precondition`. This matters more than it looks: comparing a submission against an absent
hash never throws. It marks a CORRECT flag wrong, and because an incorrect submission records
`submittedFlag`, it then writes that correct flag into `submissions`, which any signed-in account
can read. The refusal is also a STANDING invariant rather than a migration-time check, because
the admin console has no version check (BUG/taskboard 404) so a stale tab can create old-shaped
challenges indefinitely and no deploy ordering prevents it.

**`deliverFlag`** refuses any `boxId` that is a challenge of a tournament at or past `lobby`.
Draft tournaments still disclose, because authoring is not competing. This needs a
COLLECTION_GROUP index on `challenges.boxId`, expressed as a `fieldOverrides` entry, because
Firestore's automatic single-field indexes are COLLECTION-scoped. The guard falls back to a
per-tournament scan if that index is missing, so the rule holds regardless. That is a fallback in
query MECHANISM, never in security POSTURE.

**Creation dual-writes both shapes** from ONE salt and ONE hash computation. Two independent
computations could produce internally valid but divergent copies with no error at all, surfacing
only when a student's correct flag is rejected mid-event. The duplicate fields are marked in the
source for removal at hosting deploy B.

---

## 4. The migration, and why it is two phases

The functions deploy that reads the new location lands AFTER hosting. That ordering forces the
split:

**COPY** writes `flagSecrets` for every existing challenge and leaves the public fields exactly
as they are. It is additive, so the currently deployed reader keeps working and a straggler
instance of it cannot fail. Safe to run at any time, and idempotent.

**PURGE** removes the public copies, and only after the new reader is live. Per challenge, in
ONE transaction: verify the secret exists, or recreate it from the public fields first, and only
then delete them. It refuses outright when there is no secret and no source, leaving the document
untouched rather than destroying the only copy of a secret. The raw flag is never stored in
Firestore, so that loss would be unrecoverable.

Both phases scan the WHOLE tournaments collection, drafts and abandoned orphans included.
Rehearsal is by ORDERING (one tournament first, verify, then the rest), not by scope, because
the documents most likely to be wrong are the ones nobody remembered.

**PURGE reports backfills as a set disjoint from clean successes** and declares the run not
clean while any exist. A self-heal firing at all is evidence that something upstream wrote an
old-shaped challenge after COPY; folding it into a success count throws that signal away.

---

## 5. Runbook, with the rollback for each step

Run in this order. Steps 3 and 7 are admin-console clicks and cannot be scripted: a direct
`firebase-admin` write against production is what the write gate exists to prevent.

| # | Step | Command / action | State after | Rollback |
|---|---|---|---|---|
| 1 | Indexes + rules **DONE 2026-09-19** | `_tools/eduscan/smoke/deploy.sh --only firestore:indexes,firestore:rules` | `flagSecrets` admin-only; group index live. Released, and verified by 4 unauthenticated routes returning 403 with a 200 positive control | Redeploy from the previous commit. Purely additive, so there is nothing to undo. |
| 2 | Hosting A **DONE** | `./deploy.sh` | console dual-writes; migration UI present | `firebase hosting:rollback`, or redeploy the prior commit |
| 3 | **COPY** **DONE 2026-09-19** | admin console, Manage panel, `Copy: ALL tournaments` | Operator clicked it; reported "copied: 5". Secrets exist, public fields still present | None needed. Additive and idempotent. |
| 4 | Verify COPY **DONE** | unauthenticated REST read + admin count against `challenges` | 0 missing, 5/5 faithful, 4 routes 403 + 200 control (2026-09-19) | Read-only; nothing to undo. |
| 5 | Functions **DONE 2026-09-19** | `_tools/eduscan/smoke/deploy.sh --only functions` | Released: `ctfGetBoxCredential` created, `deliverFlag` and `ctfSubmitFlag` updated. All three now answer 401 where `ctfGetBoxCredential` was 404, which is how we know they are live | Redeploy functions from the prior commit. The public fields are still present at this point, which is exactly why PURGE comes later. |
| 6 | Retest **PARTIAL** | see section 6 | Emulator and rules evidence complete; **production end-to-end grading still NOT observed** because a real capture fires the Discord webhook and is operator-gated. Special Event had 0 submissions at deploy time | |
| 7 | Hosting B **PENDING** | remove the two dual-write lines, then `./deploy.sh` | challenge docs stop gaining crypto | `firebase hosting:rollback` |
| 8 | **PURGE** **PENDING, and now UNBLOCKED** | admin console, `Purge: ALL tournaments` | public crypto gone. The new reader is live, which was the precondition. Until this runs, all 5 challenges still publish `flagHash`+`flagSalt` (BUG-269) | The secrets remain in `flagSecrets`; a rollback of the reader would need the fields restored from there, which the backfill logic can do in reverse. Do not run PURGE until step 6 is green. |

**If PURGE reports a non-zero backfill count**, stop and find out what wrote an old-shaped
challenge after COPY before calling the migration closed. The data is safe; the signal is not
nothing.

---

## 5b. A sibling migration exists for the join code

The same defect class, the same two-phase shape, a different field. `tournaments/{id}` is
also `allow read: if true`, and the join code sat on it in plain text for both live
tournaments, so an anonymous account could read it and join an ACTIVE event. That migration
(taskboard 411) shipped 2026-09-19 as the **Join Code Migration** card and a **Rotate Code**
button, and is documented in `_docs/operations/running-a-tournament.md`. It is independent of
this one: run either first. Both are unrun operator clicks as of 2026-09-20.

The lesson worth carrying: rules hide a DOCUMENT, never a FIELD. Two separate secrets were
left on the same world-readable document by two separate changes, and each was found only
when somebody measured production instead of reading the code.

---

## 6. Test surface

| What | Where | Status |
|---|---|---|
| Client cannot read `flagSecrets`, authenticated non-admin AND unauthenticated | `_tools/rules-test/ctf-flag-secrets.test.js` | 13/13 green |
| Public challenge doc carries neither field | same | green |
| Correct flag credited from the new location, verified by a second-channel score read | same | green |
| Missing secret REFUSED, no submission recorded | same | green |
| `deliverFlag` refuses a live-tournament box, leaks nothing, still serves a draft-only box | same | green |
| Migration transaction safety, including refusal cases | Chris extracted the verbatim `migrateFlagSecrets` body and ran it against a real Firestore emulator with rules enforced | 13/13 green |
| No regression across the tournament suite | 11 pre-existing suites | green, assertion tallies identical to the pre-change baseline |
| Production end-to-end grading | needs a real capture, which fires the Discord webhook | NOT DONE, operator-gated |
| Migration button wiring in a browser | operator clicked `Copy: ALL tournaments` 2026-09-19, reported "copied: 5" | **DONE** |
| COPY verified against production, not against the button's own message | `inspect-tournaments.js` (read-only): **0** challenges lack a valid `flagSecrets` entry, where valid requires BOTH fields non-empty | **DONE** |
| Copied secrets are faithful, so the reader swap cannot change a verdict | fidelity probe: **5/5 byte-identical** to source, `mismatch=0`. Chris went further — `git log -p -S "challenge.flagSalt"` shows migration commit `0fed716c3` changed ONLY a variable name, the hash formula untouched character for character, so the verdict is identical for EVERY possible submitted flag, not just the 5 known-correct ones | **DONE** |
| New location denied to a stranger on every client-reachable route | unauthenticated production REST: doc GET 403, listDocuments 403, scoped `:runQuery` 403, collectionGroup `:runQuery` 403, positive control (public challenge doc) 200 so the denials discriminate | **DONE** |

The distinction that remains honest is the LAST row only. The transaction logic is proven
against real Firestore semantics AND the COPY button has now been clicked in production and its
result verified independently of its own success message — "copied: 5" was checked against the
data, not believed. What is still unproven is **production end-to-end grading**: no flag has been
submitted to the new reader in production, because a real capture fires the Discord webhook and is
operator-gated. Special Event had 0 submissions at the time of the functions deploy, so nothing has
been graded under either reader.

---

## 7. Where this is parked, and what is still exposed

**Tabled as a QC/QA item at step 3.** Rules, indexes and hosting A are live. Functions are not
deployed, the data has not moved, and therefore:

- **BUG-269 is open.** All five challenge documents still publish `flagSalt` and `flagHash`.
- **BUG-271 is open.** The deployed `deliverFlag` is still the old revision, so an anonymous
  account can still request those flags in plaintext.
- **The five recovered flags and `Special Event`'s join code are compromised regardless of any
  deploy.** This change stops the next set leaking. It cannot un-leak these. Rotation is an
  operator action, and because the flags are box values, rotating them implicates those boxes.
- **BUG-270 is untouched by design.** The permanently published join code has a different
  consumer, a different target and a different verification query, and bundling it was blocked
  in review.

Resuming costs one click plus one functions deploy.
