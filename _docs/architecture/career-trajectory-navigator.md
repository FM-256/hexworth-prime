# Sextant — Career Trajectory Navigator

> The sensor + navigation layer for the Career OS. A consented, longitudinal record of
> where each learner is, how fast they are moving, and which heading they are on — surfaced
> as a personal guide for the student, a research substrate for the institution, and an
> advisory routing layer.

**Status:** Stage 1 COMPLETE + LIVE 2026-07-21 — backend (3 fns, Nancy x3 + Chris) AND the student self-view page `/career/trajectory.html` (Chris PASS: 5 states, canvas drawn, 0 overflow, privacy holds) + a "Your Trajectory" card on the Career Launchpad. First snapshot: 32 consented, 31 points, PII-free. NOW: Stage 2 cohort reader (admin, aggregate, k-anon) — requires classId returned to Plane B under k-anon suppression.
**North star:** This completes the [Career OS mission](../../CLAUDE.md) — it is the GPS the OS was missing, not a new product.

---

## DECISIONS (resolved 2026-07-21)

1. **Name → Sextant.** The instrument for fixing position + setting a heading by the stars.
2. **Advisor stance → descriptive.** "Here is what similar learners did," not "you should turn left." Matches Lodestar's *measure, don't refit* (LODE-5). Prescriptive is not on the roadmap unless explicitly reopened.
3. **Student self-view → historical (snapshot-fed).** Shares the Stage 1 pipeline everything else needs (not a separate live "where I stand now" widget).
4. **Build → green-lit end-to-end.** Proceed through the stages with the standard QC gates (Nancy before edits, Chris before any deploy); each production deploy still honors the master + explicit-auth write gate.

---

## The frame

The Career OS already has an engine (Lodestar), a cockpit (Launchpad, `_app/career/`), and evidence
(badges / Observatory). What it lacks is *position telemetry*: a truthful, over-time record of each
learner's location and motion through the curriculum. This layer supplies it and turns it into
navigation.

The GPS decomposition, and where each piece comes from:

| Question | Quantity | Source |
|----------|----------|--------|
| Where am I? | Position vector in skill/curriculum space | ContentCatalog (4,282 modules) + per-user activity |
| How fast? | Velocity (progress / week) | Snapshot deltas |
| What heading? | Direction of recent motion (trending domains) | Snapshot deltas |
| Destination? | Target role / cert | Lodestar True North |
| How far left / ETA? | (distance to destination) ÷ velocity | Position + destination + velocity |
| Route guidance | Deviation from paths that reached the same destination | Tokenized cohort archive |

---

## Data model — two planes

Privacy is solved by *construction*, not by a policy bolted on afterward.

### Plane A — Self trajectory (identified, in the user profile)
- The learner's own trajectory over time, persisted into their profile.
- Identified because it is *their* data and they view *themselves*. No tokenization needed for self-view.
- Consent-gated: only consented learners get their trajectory persisted and get the self-guide + advisor.
- Powers "where am I, my heading, my pace, my ETA" — the personal guide / true north view.

### Plane B — Cohort archive (tokenized, research + advisory reference)
- Immutable, dated snapshots of the four Observatory collections, tokenized on the way in.
- Token = `HMAC(pepper, uid)`. Stable across terms/classes (same learner → same token), which is what
  enables cross-class trajectory tracking.
- **The pepper is a crown-jewel secret**: lives in server-side secret storage (Secret Manager / KMS),
  **never** ships to the client. Tokenizing happens at snapshot time (server), so the reader is born
  clean and never holds PII.
- No mapping table and no admin bulk-reversal are needed:
  - Student self-view is *forward* computation, scoped to self: an authenticated learner's server-side
    request resolves `HMAC(pepper, theirUid)` and returns only their own row. A learner can never compute
    another learner's token.
  - The institution never needs to unmask. If a future "reach a struggling student" need arises, revisit
    then; do not build reversal speculatively.
- **k-anonymity suppression**: never render a cohort/segment below a floor (proposed k = 5), because a
  3-person curve re-identifies by elimination regardless of tokenization.

Note on why "just discard the salt" does not apply here: stable cross-term tokens require reusing the
same pepper every snapshot, so the pepper must be *retained*. Combined with holding the uid list, that
means the pepper-holder inherently *could* reverse by recomputation — which is exactly why the pepper is
treated as a top secret and the design deliberately avoids ever needing to.

---

## Privacy / crypto specifics
- Construction: `HMAC-SHA256(key = pepper, message = uid)` (not `SHA256(uid + salt)`).
- The shared-for-everyone secret is a **pepper**, not a per-record salt (a per-record salt would require
  storing each salt = a mapping table again).
- Rotating the pepper re-tokenizes the whole archive (breaks token stability), so pick it once.
- Consent is enforced at the pipe: non-consented learners are neither snapshotted into Plane B nor given
  Plane A persistence.

---

## The hard part: the map (Stage 3)

Route guidance ("left at APIs, u-turn at networking, if you reach algorithms you went too far") only has
meaning if there is a **skill-adjacency graph** with direction and distance. Today there is a *flat*
catalog of 4,282 modules, not a road network. Building that graph — nodes (skills/domains/modules),
directed edges (prerequisite / leads-to), and a distance metric toward a destination — is a first-class
piece of work, not a byproduct of the pipeline. Everything else is telemetry over this graph.

ETA honesty follows from the same gap: "how long do I have left" is truthful against a countable set
(modules remaining on a chosen cert track) and hand-wavy against a fuzzy career goal. Earliest version
anchors ETA to a concrete track and keeps career-heading as *directional advice*, not a false-precision
countdown.

---

## Staged roadmap (each stage stands alone and feeds the next)

1. **Snapshot pipeline + student self-view.** Server-side scheduled snapshots (cadence + guaranteed
   end-of-term freeze) → durable store, tokenized for Plane B, self-trajectory into Plane A profile.
   Ships the *missing Observatory student viewer* immediately and starts accruing perishable history.
2. **Cohort archive + comparison reader.** The "Archive" — grid + class/term/year filters + the
   stock-market-style overlay (cohort vs itself over terms, cohort vs cohort). Tokenized, aggregate,
   k-anon suppressed. Graph-style selector is v2 polish; start with one well-chosen metric + one chart.
3. **Skill-adjacency map.** The road network (see above).
4. **Advisor.** Position (Plane A) joined against known-good routes (Plane B) over the map (Stage 3).
   Descriptive first; prescriptive only if the operator crosses that line.

### DESIGN D (operator ruling 2026-07-21): derive the self-view, persist only Plane B
The self-view is DERIVED LIVE from the learner's own `observatory_activity` (retained forever,
timestamped, keyed by uid) — no new identified store. This makes it "the learner's own data
shown back to them" (like the dashboard), so it needs NO new consent and works for every
learner. The only new persisted store is Plane B (tokenized cohort), which stays research-
consent-gated. This dissolved the consent-scope question rather than answering it. Fallback if
activity is ever pruned for cost: revisit a persisted, separately-opted-in self-view (option C).
Rejected: ungated persisted self-view for all (profiles decliners, largest footprint) and
research-gating a self-facing feature (consent-basis mismatch).

### Stage 1 as built (`functions/sextant.js` + `getMyTrajectory`, gated on deploy) — post-Nancy, design D
- **Self-view (`getMyTrajectory` callable):** derives the signed-in learner's week-by-week
  trajectory LIVE from their own `observatory_activity` (read scoped to `request.auth.uid` via
  admin SDK; activity stays admin-only at the rules layer). No persisted identified store, no new
  consent gate. `deriveTrajectory` buckets events by ISO week → per-week + cumulative position.
- **Snapshot pipeline (`sextantSnapshot`, Plane B only):**
  - **Reads** `observatory_enrollment` + `observatory_consent` (the consent gate) and
    `observatory_activity` (the position). `observatory_classes` is not read (classId denormalized
    on enrollment); `observatory_withdrawals` handled by purge.
  - **Consent gate (Nancy #2):** excluded iff `participates === false` on EITHER enrollment OR
    consent doc (absent/true = consented). Mirrors the telemetry CF exactly.
  - **Recency gate (Nancy #4):** only learners active within `ACTIVE_WINDOW_DAYS` (90) get a point.
  - **Plane B** `/sextant_cohort_points/{snapshotId__token}` — `token = HMAC(SEXTANT_PEPPER, uid)`,
    NO uid/name/email. As of Stage 2 it CARRIES `classId` (the cohort key — see Stage 2 below).
    Deterministic id → idempotent.

### Stage 2 as built (cohort reader) — 2026-07-21
- **Plane B now carries `classId`** (`loadConsentedLearners` returns uid→classId; runSnapshot writes it).
  Reverses the Stage-1 Nancy-#5 deferral, now that k-anon suppression ships. classId is admin-read-only
  and never leaves the server un-aggregated.
- **`aggregateCohorts(points, k=5)`** groups by class+week, averages metrics, and SUPPRESSES any
  (cohort, week) cell with fewer than k=5 DISTINCT learners (counted by distinct token). `suppressed`
  returns only `{classId, snapshotId, n}` counts — no per-learner data.
- **`getCohortComparison`** (callable, ADMIN-gated: custom claim OR ADMIN_EMAILS) enforces k-anon
  SERVER-SIDE — the client only ever receives aggregated, suppressed series, never raw tokenized rows.
- **Reader** `_app/admin/sextant-cohorts.html` — overlay of one line per cohort. classId is rendered via
  DOM `createTextNode`/`dataset` (never `innerHTML`) because classId is user-writable (learners set their
  own `observatory_enrollment.classId` with no server validation) — Nancy Stage-2 #1 XSS fix.

### Stage 2 RESIDUAL RISK (operator, written acceptance) — Nancy Stage-2 #4/#5
The k-anon suppression on the cohort reader is **future-proofing, not a live control today**: the same
admins who can call `getCohortComparison` already have raw, identified, per-learner access to
`observatory_enrollment` + `observatory_activity` via `_app/admin/observatory.html`. So k-anon protects a
*future* broader/external "research substrate" audience, not the current 2-admin audience. Also, averaging
at exactly k=5 is **differencing-attackable** by someone who already knows 4 of 5 members (which the
current admin audience does). ACCEPTED for Stage 2 because the reader adds NO new exposure beyond what
admins already see raw; the k-anon control becomes load-bearing only if `sextant_cohort_points` is ever
exposed beyond the admin allowlist (at which point: differential privacy / larger k / cell-count noise).
- **Withdrawal purge (Nancy #1, BLOCKING — fixed):** `withdrawFromObservatory` calls
  `sextant.purgeLearner` to delete the learner's Plane B points (by recomputed token). The self-view
  needs no separate purge — withdrawal already deletes the `observatory_activity` it derives from.
- **Pepper:** fails loud if `SEXTANT_PEPPER` is missing/short. Provisioned in Secret Manager (32 random bytes).

### Pre-deploy checklist (Nancy's non-blocking + process items)
- [x] `SEXTANT_PEPPER` provisioned in Secret Manager (v1 ENABLED, 2026-07-21).
- [x] Rules/behaviour verified at the code layer by Nancy (3 passes, PROCEED) + Chris (PASS, 39/39
      invariant assertions re-run): getMyTrajectory uid-pinned + unspoofable, cohort_points/activity
      admin-only, deny-by-default. LIVE rules-emulator assertion optional post-deploy nicety.
- [x] Composite index deployed + functions live (sextantSnapshot, getMyTrajectory, withdrawFromObservatory).
- [x] One-time audit of `observatory_enrollment` (Nancy #10): 34 records, 2 declined, 0 suspicious (2026-07-21).
- [x] Consent-scope question RESOLVED via design D (self-view derived, not a research use).

### Consent-scope question (Nancy — operator's call, not a code sign-off)
The IRB consent text describes **research** use (publications, frameworks like CERBI). Plane B
(tokenized cohort research set) clearly sits under that. Plane A is a learner viewing **their own
data** — arguably not "research on a subject" at all, the same category as the existing dashboard.
Open decision: does Plane A need its own disclosure/opt-in, or is showing a learner their own
trajectory outside the research-consent gate (so every learner gets a self-view, only consented
learners feed Plane B)? Resolve before scheduling the job.

---

## Ties to existing systems
- **Lodestar** (Career Engine): supplies the destination (True North) and the descriptive/revealed-preference
  precedent (LODE-7) and the *measure-don't-refit* tension (LODE-5) the advisor inherits.
- **Launchpad** (`_app/career/`): the cockpit this feeds.
- **Observatory** (`_app/admin/observatory.html`, `ObservatoryTracker/Telemetry/Consent`): source of the
  four collections + the consent architecture. Today its only reader is admin CSV export; this adds the
  student viewer + cohort reader it lacks. Fits the pinned Observatory IA redesign (kill one-long-scroll).
- **ContentCatalog** (4,282 modules): the node set the skill map is built over.

---

*Design captured 2026-07-21 from an operator design conversation. Build gated on operator green-light for
Stage 1 and rulings on the two OPEN DECISIONS above.*
