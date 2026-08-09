# Tenant White-Label Access: Model, Outage, and Licence Gate

*Live as of: 2026-08-04*

## TLDR

A tenant is white-label access — a branded wrapper over Hexworth, not a separate product with
its own content. Ending the wrapper (branding, bar, pill) and ending a student's Hexworth
access are two unrelated actions with two unrelated triggers. A same-day production outage
happened because a prior change collapsed them into one. That is now fixed and covered by a
real-endpoint test suite that queries production instead of a mock. On top of the fix, an
opt-in licence gate shipped: a tenant can no longer be set up to teach a course it has not
licensed. It is enforcing on one tenant (`faculty-testing-primus`) as of this writing; the
other five are untouched.

State right now, read from production via `_tools/tenant/licence-preflight.js` at time of
writing:

| Tenant | Status | Licence enforcement | Notes |
|---|---|---|---|
| `faculty-testing-primus` | active | **ON** | 2 classes, both licensed. Enabled 2026-08-04. |
| `test-x` | active | off | Dr. Wallace. 1 archived class (`NET TEST`, network-plus) teaches an unlicensed course — informational only, enrolment already closed. |
| `dr-norfleet` | suspended | off | 1 class |
| `infosecethics-may-2026` | suspended | off | 2 classes |
| `python-april-2026` | suspended | off | 2 classes |
| `summer-2026` | suspended | off | 3 classes |

`suspended` is a normal operator-facing lifecycle state for five of six live tenants. It is
**not** a revocation. Treating it as one is exactly what caused the outage below.

---

## Part 1 — The architectural model

A tenant is **white-label access**: a branded wrapper over Hexworth, functioning as a
controlled-access layer. It is not a separate content pool. Operator, verbatim, on the
incident that forced this to be written down: *"the tennants work as api's for controlled
access... what you did is kill access to hexworth, instead of killing the tennant. 2 unrelated
actions."*

Those two actions must never be collapsed into one code path:

| Action | What ends | What survives | Trigger | Implementation |
|---|---|---|---|---|
| End the **wrapper** | Bar, pill, branding, link overrides | The tenant blob in `sessionStorage`/`localStorage`; the student's Hexworth access | `getTenantConfig` returns `status !== 'active'` | `stripTenantChrome()` — `_app/components/TenantShell.js:95` |
| End **access** | Everything the wrapper ends, plus the tenant blob itself, which also drops the AccessGuard bypass | Nothing tenant-related | `getTenantConfig` returns 404 (tenant genuinely gone), the blob fails to parse or names no tenant, or the student manually dismisses the pill | `purgeTenantAndStrip()` — `_app/components/TenantShell.js:135` |

Why the blob is dangerous to delete: `_app/components/AccessGuard.js:725-782` re-reads
`hexworth_tenant` from storage on **every** `require()` call and, if it parses to a real slug,
waives the sorting quiz and Dark Arts gates that white-label students never take — because
those are Hexworth student-progression mechanics with no equivalent in the white-label
experience. `require()` gates content platform-wide. Delete the blob and a white-label student
loses that waiver on the very next gated page, with no quiz passed and no gate cleared to fall
back on. That is a platform-wide access loss triggered by what was meant to be a branding
change.

A related, verified lifecycle detail worth keeping in mind: soft-deleting a tenant
(`adminDeleteTenant`, `functions/index.js:4843`) only sets `status: 'deleted'` on a Firestore
document that still exists. `getTenantConfig` (`functions/index.js:3673`) does `doc.exists`
before anything else, so a soft-deleted tenant still returns 200 with `status: 'deleted'` —
which strips the wrapper, not the access. Only `adminPurgeDeletedTenants`
(`functions/index.js:4863`, hard delete) makes the document stop existing, which is what turns
the next `getTenantConfig` call into a 404 and triggers `purgeTenantAndStrip()`. Deactivating a
tenant in the admin console does not, by itself, revoke a student's content access — hard
purge does.

One more asymmetry that belongs in this model: `enrollInClass` (`functions/index.js:5548-5555`)
independently refuses new enrolments once `tenantDoc.data().status !== 'active'`. So a
suspended tenant cannot onboard new students even though its existing students keep browsing
under their (unbranded) Hexworth credentials. Suspension closes the front door; it does not
evict anyone already inside.

**Why not just add a `revoked` status and check for it?** Because "which statuses ought to
revoke access" is an operator decision that has not been made, and `d67b5a6fe` deliberately
declined to encode one under outage pressure rather than guess. See Part 2.

---

## Part 2 — The outage

**Root commit:** `4655affae` — *"tenant: an inactive tenant now leaves no trace on the
student."* Written in response to a real bug report (a deactivated tenant's pill kept
rendering from a stale `localStorage` snapshot that nothing server-side could reach). The fix
treated any `getTenantConfig` status other than `'active'` as a revocation: purge the blob,
`hideContent()`, `redirect('dashboard')`.

**What actually happened:** all six live tenants carry status `suspended`. `suspended` is an
operator-facing lifecycle state, not a revocation. The fix fired for every white-label student
on every page load — blob purged, content hidden, redirected to the dashboard, pinned there
because the same check fired again on arrival.

**Why it first looked like an Observatory problem, not a tenant problem:** `725e4c9c6`, dispatched
just before, had already fixed a related but separate defect — the tenant bypass sits *above*
the admin/god-mode/master-key bypasses in `AccessGuard.js`'s `require()` (`AccessGuard.js:774`),
so once that branch could revoke, an administrator carrying a stale blob for a tenant they had
themselves deactivated was bounced off every gated page, including `/houses/observatory/`. That
fix exempted staff. It shipped first, so when the underlying status-revocation bug hit, admins
were unaffected and only students were pinned — which read as "students can't navigate," not
"the tenant model is broken."

**Why no test caught it:** every test written for `4655affae` mocked `getTenantConfig` and
asserted against the mock's own shape. Not one called the real endpoint with a real tenant
slug. The suite therefore confirmed the shape the author assumed production had, not the shape
production actually had. It passed clean. One unmocked call against any of the six live slugs
would have returned `"status":"suspended"` immediately. A second, independent gap: the tests
asserted "wrapper is removed" but never asserted "access is preserved" — the half that was
never checked is the half that broke. `_tools/qa/tenant-real-endpoint.test.js` exists
specifically to close both gaps: it seeds real production slugs, calls the real endpoint, and
asserts both halves in the same run.

**Fix sequence, same day:**

| Commit | Time (ET) | What it did |
|---|---|---|
| `4655affae` | 11:25 | Introduced the regression (status-based purge + redirect) |
| `f9244a161` | 11:48 | Separately fixed a dead `TenantRouter.refresh()` guard — see below |
| `725e4c9c6` | 12:44 | Tenant branch in `require()` gained `!isFirebaseAdmin() && !hasGodMode() && !hasMasterKey()` guards so it declines to fire for staff, who fall through to their own (unmoved) bypasses below it |
| `d67b5a6fe` | 12:58 | Emergency stop: status no longer triggers `purgeTenantAndStrip()` at all (the check became a no-op, `void cfg;`); only a 404 still strips. This restored access immediately but reopened the original stale-pill complaint as a known, accepted regression pending an operator decision on which statuses should revoke. |
| `f072c3043` | 13:03 | Added the real-endpoint QA suite (no mocks) |
| `c0e09ebcc` | 13:14 | Proper fix: split `stripTenantChrome()` / `purgeTenantAndStrip()` per Part 1. Restores "suspended tenant shows no pill" without deleting the blob. |

`d67b5a6fe` and `c0e09ebcc` are both real commits from the same incident; treat `d67b5a6fe` as
the bleeding-stopped state and `c0e09ebcc` as the correct architecture. Do not build on
`d67b5a6fe`'s intermediate shape.

**Also fixed same day, related but independent: `f9244a161`.** `TenantRouter.js:27` declares
`const TenantRouter = (function() {...})();` at the top level of a classic (non-module)
script. Top-level `const`/`let` bindings live in the global *declarative* record, not on
`window` — so `window.TenantRouter` is permanently `undefined` regardless of load order. Two
call sites (`TenantShell.js` and `AccessGuard.js`'s async tenant verifier) guarded the call to
`TenantRouter.refresh()` on `window.TenantRouter`, making the refresh dead code in every timing
scenario. Consequence: `TenantRouter._active` was cached `true` at script load and never
corrected after a revocation, so `AccessGuard.redirect()` sent a just-revoked student into
`TenantRouter.getUrl('dashboard')` — the very tenant hub just declared inactive, which throws
"Tenant not found" (`_app/tenant/index.html:418`). A dead-end error screen on any
`require()`-gated page, which is worse than the lingering pill the original work set out to
fix. Fix: `typeof TenantRouter !== 'undefined'`, the correct pattern for a top-level
classic-script binding, applied at both call sites (`TenantShell.js:110`,
`AccessGuard.js:280`). The equivalent check already existed correctly elsewhere in the same
file, at `AccessGuard.js:692` and `AccessGuard.js:1213`.

*Note on citation drift:* in-code comments in `TenantShell.js` and commit messages cite the
tenant bypass block in `AccessGuard.js` as lines 699-736 and the working `typeof TenantRouter`
reference pattern as line 658. Reading the file directly as of this doc's live-as-of date, the
tenant bypass block in `require()` runs `AccessGuard.js:725-782`, and the nearest correct
`typeof TenantRouter` reference is `AccessGuard.js:692` (inside `redirect()`). The logic those
comments describe is accurate; the line numbers have drifted from subsequent edits. Use the
numbers in this doc, not the in-code comments, if the two disagree — and re-verify both before
citing them again, since drift is ongoing.

**Post-fix verification.** `_tools/deploy/chris-skip-audit.log` records three same-day
emergency-deploy skips of the Chris QC gate for this incident (`725e4c9c6`, `d67b5a6fe`,
`c0e09ebcc`), each dispatching Chris to review post-hoc rather than blocking on him. The one
Chris pass on file that day (`_tools/deploy/.chris-pass`, recorded 15:54:27Z) covers an earlier,
narrower scope — `4655affae`, `16cd5dd6a`, and `f9244a161` — and predates all three outage-fix
commits above. As of this writing, none of `725e4c9c6`, `d67b5a6fe`, or `c0e09ebcc` has a
recorded Chris pass; "verdict to be applied post-hoc" has not yet been applied. The audit log
also gives a concrete blast-radius figure for the admin-lockout half of the incident: *"locked
admins out of all 81 gated pages."*

---

## Part 3 — The licence gate

**Commits:** `9b020cf66` (gate), `3428e0203` (merge), `0c652670b` (preflight refinement).
Cloud Functions deployed 2026-08-04, approximately 19:08 UTC.

**What it is.** `functions/licensing.js` exports one function, `isCourseLicensed(tenantData,
courseId)`, extracted from `functions/index.js` specifically so it is unit-testable without
booting the full Cloud Functions bundle.

| Property | Behavior |
|---|---|
| Opt-in | Returns `allowed:true` unless `tenantData.licensing.enforce === true` (strict, so a hand-edited `"true"` string does not enable it — covered by `functions/test-licensing.js`). Deploying the code changes nothing for a tenant that has not opted in. |
| Empty course list | Fails **open** (`allowed:true`) even with `enforce:true`, deliberately — an opted-in tenant with a blank `contentAccess.courses` would otherwise deny everything over a misconfiguration. |
| Rollback | Remove one field (`licensing.enforce`) from one tenant document. No redeploy. |

**Gate points** (`functions/index.js`):

| Call site | Line | Role |
|---|---|---|
| `adminCreateClass` | `functions/index.js:5212` | Primary gate. Refuses class creation with a `failed-precondition` naming the licensed set, so the failure lands on the admin at the moment of the mistake. |
| `enrollInClass` | `functions/index.js:5575` | Defence in depth, for classes created before a tenant opted in. Message is deliberately generic ("not available under your organization's current licence") — a student cannot fix a licence and should not see its internals. |

Neither call site is on a student's runtime path once a class exists and is licensed.

**Why not gate `syncClassProgress` (the original design):** review killed it for two reasons.
First, the failure would land mid-lesson, silently, on the student — the same shape as the
outage in Part 2. Second, it would have enforced nothing anyone would notice: the student still
enrols, still sees content, is still graded, and their personal record still writes via
`ModuleProgress` *before* class sync is ever called. Only the instructor's gradebook row for
that student would silently vanish. Gating class creation also closes the
`submitAssignmentProgress` bypass for free, since an unlicensed class is never created for
anything to write to.

**What this is not — state this plainly, it matters commercially.** This is not content
protection. Courses are static HTML served by Firebase Hosting with no server in the request
path, so a direct URL still resolves and `gradeQuiz` still grades regardless of licensing. The
only honest claim: a tenant cannot be *set up* to teach a course it has not licensed. Actual
content gating would require signed URLs, a Cloud Functions proxy in front of hosting, or
moving licensed content out of static Hosting entirely.

**A sharp edge in the surrounding config, not fixed by this work:**
`_app/components/TenantFilter.js:63-96` reads `tenant.licensing.contentAccess` client-side to
filter series, houses, hubs, and features for display. Two of its four cases use opposite
defaults in the same object:

- `series` / `houses` / `hubs` are allow-lists: an **empty** list means allow everything; a
  **non-empty** list means only what's listed. Restriction is opt-in by populating the list.
- `features` is a deny-map: a feature is allowed unless its key is explicitly `false`
  (`features[contentId] !== false`). There is no way to make this default-deny by leaving it
  empty — you must enumerate every feature you want denied.
- There is **no `'course'` case at all** in `isAllowed()`'s switch — `default: return true`. The
  courses list is not enforced by this file. It is read for display only, currently by nine
  tenant dashboard variants (`dashboard-academy.html`, `dashboard-campus.html`,
  `dashboard-nightshift.html`, `dashboard-clean-ops.html`, `dashboard-minimalist.html`,
  `dashboard-enterprise.html`, `dashboard-command-center.html`, `dashboard-federal.html`,
  `dashboard-tactical-hud.html`) plus `_app/tenant/index.html` and `_app/admin/console.html`.

This is a real, currently-live example of the contradiction: `faculty-testing-primus`'s
licence lists `hubs: ["wireshark"]` (allow-listed in) while its `features.wiresharkHub` is
explicitly `false` (denied) in the same document
(`functions/_backups/faculty-testing-primus-licensing-pre-enforce-2026-08-04T19-16-40Z.json`).
Which one wins depends on which code path reads it — `TenantFilter.js` never resolves the
conflict, it just answers `isAllowed('wireshark', 'hub')` and `isAllowed('wiresharkHub',
'feature')` differently for the same capability.

---

## Part 4 — Tooling

| Tool | Path | What it does |
|---|---|---|
| Licence preflight | `_tools/tenant/licence-preflight.js` | Read-only. Answers "is it safe to enable enforcement on this tenant." Cross-references each tenant's licensed course list against its actual classes. `BLOCKED` = a live (`status:'active'`) class teaches an unlicensed course — enabling enforcement would refuse its enrolments. `MISCONFIG` = `enforce:true` with an empty course list (fails open silently). Retired classes teaching an unlicensed course are reported but do not block, because `enrollInClass` already refuses non-`'active'` classes independent of licensing (`0c652670b`). Exits 1 on any `BLOCKED`/`MISCONFIG`, 0 otherwise. |
| Licensing unit tests | `functions/test-licensing.js` | 20 assertions against `isCourseLicensed()` directly, no Cloud Functions bundle required. Deliberately asserts both directions: a non-opted-in tenant is unaffected even when its course list would otherwise deny, and an opted-in tenant genuinely denies an unlicensed course. Run: `node functions/test-licensing.js`. |
| White-label separation QA | `_tools/qa/tenant-white-label-separation.test.js` | Asserts the wrapper-vs-access split holds for a suspended tenant. |
| Real-endpoint QA | `_tools/qa/tenant-real-endpoint.test.js` | Mocks nothing by design — seeds real production tenant slugs into a Puppeteer context and calls the real `getTenantConfig`. This is the test that would have caught the outage; keep it pointed at real slugs, not mocks, if a tenant is renamed. |
| Revocation-redirect QA | `_tools/qa/tenant-revocation-redirect.test.js` | Confirms a revoked (404/forged) tenant never routes into its own dead hub — the `f9244a161` regression. |
| Pill-dismiss QA | `_tools/qa/tenant-pill-dismiss.test.js` | Confirms manual dismiss goes through `purgeTenantAndStrip()`, not `stripTenantChrome()`. |
| Baseline snapshot | `_tools/qa/tenant-licensing-baseline.json` | Byte-diff baseline for proving tenant isolation before/after a production config change. |

**Operations commands:**

```
node _tools/tenant/licence-preflight.js                        # every tenant
node _tools/tenant/licence-preflight.js faculty-testing-primus  # one tenant
node functions/test-licensing.js
```

---

## Part 5 — What was done to production today

- Set `licensing.enforce: true` on `faculty-testing-primus` only. Verified by byte-diff against
  the baseline that the other five tenants are unchanged and that only that one field changed
  on Primus. Prior licence archived to
  `functions/_backups/faculty-testing-primus-licensing-pre-enforce-2026-08-04T19-16-40Z.json`
  (confirms the field was absent beforehand — enforcement was genuinely off, not previously set
  and forgotten).
- End-to-end tested against production, not against a mock: the enforced tenant refused an
  unlicensed course (`network-plus`, HTTP 400 via `failed-precondition`, message names the
  licensed set); a non-enforced tenant allowed the identical call (HTTP 200). That allowed call
  created a real probe class
  (`functions/_backups/qc-probe-classes-2026-08-04T20-03-35Z.json`, "QC GATE PROBE -
  non-enforced tenant") which was archived and then removed — confirmed absent from current
  preflight output.
- Minting the admin token for that end-to-end test required a temporary
  `roles/iam.serviceAccountTokenCreator` grant, since revoked. This is a GCP IAM action outside
  the repo; it is recorded here for the audit trail and could not be independently re-verified
  from source control.
- Retired the first class ever retired on the platform: `tenants/test-x/classes/tUuwNuV9TK0GzLAt68tz`
  ("NET TEST"), `status: active -> archived`, plus `retiredAt`/`retiredNote` fields. Nothing
  deleted — 18 progress documents confirmed still present after the write. Pre-retire state
  archived to `functions/_backups/net-test-class-pre-retire-2026-08-04T20-19-17Z.json`. Because
  this is the first retirement, `archived` is now the de facto convention for this field
  (previous state platform-wide: 14 classes `active`, 7 with the field unset).
- `test-x` remains **not enforcing**, by operator decision: the gate's value compounds
  preventively over months of steady-state operation, while its risk concentrates in a new
  tenant's first days — and Dr. Wallace starts on `test-x` today.

---

## Part 6 — Open items

| Item | State |
|---|---|
| Enable enforcement on `test-x` | One field (`licensing.enforce: true`). Preflight is clean for `test-x` as of this writing (the retired `NET TEST` class is informational-only, not blocking). No other action needed. |
| Phase 2 — gate `gradeQuiz` on course entitlement | Blocked on a server-side `quizId -> courseId` map that does not exist. `gradeQuiz` (`functions/index.js:1680-1693`) receives only `{ quizId, answers }` — no course context to check against a licence. |
| `contentAccess` permissive-by-default vs `features` deny-by-exception | Unresolved design inconsistency in `TenantFilter.js` (Part 3). No `'course'` case exists in `isAllowed()` at all. |
| `faculty-testing-primus`: `hubs: ["wireshark"]` vs `features.wiresharkHub: false` | Live contradictory config on the one tenant currently enforcing licensing. Confirmed present in the pre-enforce backup; not caused by today's work, not fixed by it either. |
| Chris QC gate review | No record at all in `_tools/deploy/chris-skip-audit.log` or `.chris-pass` for the licence gate commits (`9b020cf66`/`3428e0203`/`0c652670b`) — neither a skip entry nor a pass, as of this writing. The three outage-fix commits (`725e4c9c6`/`d67b5a6fe`/`c0e09ebcc`) at least have skip entries with "verdict to be applied post-hoc," which has not yet happened either. Licence gate shipped on explicit operator instruction under urgency conditions with no audit trail entry of any kind. |
| Post-deploy verification | The standard post-deploy EduScan drift check did not run on three emergency deploys today, per the same skip-audit trail. |

---

## Related

- [[project_tenant_white_label_model]]
- [[feedback_never_mock_the_thing_under_test]]
- [[project_tenant_sw_encapsulation]]
- [[project_course_hub_isolation]]
- `_docs/operations/tenant-hub-eligibility-2026-05-09.md`
- `_docs/operations/tenant-leak-and-eduscan-exemption-findings.md`
- `_docs/operations/chris-qc-gate.md`

*Last Updated: 2026-08-04 · v7.1.0*
