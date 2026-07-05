# Observatory Activity Dataset Codebook

The research dataset for the Hexworth Observatory consented cohort. This is the data
dictionary for anyone querying `observatory_activity` directly (Firestore console,
export to a stats package, or a new analysis script). Read the **session_end** entry
before computing any time-on-page or session-count metric.

Study: *Gamification in Cybersecurity Training and CERBI Score Analysis* (PI Frank Mora,
National University). Collection is consent-gated; see "Consent gating" below.

## Coverage (which pages emit telemetry)

As of 2026-07-05, `ObservatoryTelemetry.js` is on **all 1042 content pages** across the 16
Observatory course roots (up from A+ Core 1's original 62). Scope decision by the PI: track
everything, including course-root and category/domain **hub/landing `index.html` pages** (they
emit only `page_view`/`device`, never `content_complete`) as an intentional superset to
guarantee no real content is missed. A+ Core 1's tracked set therefore expanded 62 -> 67 (its
5 hub pages). Excluded, by design: meta-refresh redirect stubs (navigation, not content),
`instructor/` materials, underscore/dev dirs (`_source`/`_archive`/`_backup`/`_compare`),
and `.bak` copies. The single tag self-loads its auth dependency, and a cost gate keeps
non-signed-in visitors from loading anything. Injector + reconcile tool:
`_tools/observatory/inject-telemetry.js` (idempotent: a page carries the tag iff it is
content and not a redirect stub).

## Collection: `observatory_activity`

Append-only. Clients cannot write it directly (`firestore.rules`: `create/update/delete:
if false`); the only writer is the `logObservatoryEvent` Cloud Function
(`functions/index.js`), which verifies the caller's Firebase ID token, derives the `uid`
server-side, and validates the `classId` against the enrollment/consent record. No client
can spoof another `uid` or an unenrolled `classId`.

### Fields on every document
| Field | Type | Notes |
|---|---|---|
| `uid` | string | Firebase user id (the research identifier). Join to `observatory_enrollment/{uid}` for display name / class. |
| `classId` | string \| null | Server-authoritative (enrollment doc wins, then consent, then client hint). |
| `type` | string | Event type (see below). |
| `path` | string | Page path, sliced to 300 chars. |
| `clientTs` | string | Client ISO timestamp (advisory). |
| `at` | server timestamp | Authoritative event time. Prefer this over `clientTs`. |

### Event types and their extra fields
| `type` | Extra fields | Fires when |
|---|---|---|
| `house_enter` | (none) | Arrival in the Observatory house index. |
| `course_click` | `target`, `name` | A course card is clicked in the Observatory. |
| `house_dwell` | `seconds` (0..86400) | Time in the Observatory house, on leave. |
| `content_complete` | `moduleId`, `score` (0..100 \| null) | A chapter/lab/quiz/game finished. `score` is a number only for a passed quiz; `null` for a module/lab/game. Quiz completions are recorded **on pass only**, so a student with no `content_complete` may have attempted without finishing. |
| `page_view` | `course` | Arrival on a course page. `course` is a coarse slug (e.g. `comptia-aplus/core-1`) or null. |
| `session_end` | `sessionId`, `durationSec`, `activeSec`, `maxScrollPct` | See the invariant below. |
| `client_error` | `message`, `source` | A JS error the student hit (doubles as live QA). Capped at 5 per page load. |
| `device` | `viewport`, `platform`, `connection`, `reducedMotion` | Once per browser session. |

## CRITICAL: `session_end` is a snapshot stream, not one row per session

`session_end` is emitted on **every** `visibilitychange:hidden` (a tab-switch, minimize,
or app-switch) AND on the real `pagehide`, because `visibilitychange:hidden` is the only
reliable "last chance to send" on mobile. To avoid ending a session prematurely on a mere
tab-switch, each emission is a **monotonic snapshot**: it carries a `sessionId` (one per
page load) and is only sent when `durationSec` has grown since the last snapshot.

Consequence for analysis:
- **One page load produces one OR MORE `session_end` rows**, all sharing the same
  `sessionId`, with increasing `durationSec`. Only the row with the **maximum
  `durationSec` per `sessionId`** is the final, correct value for that page visit.
- **To count sessions:** count DISTINCT `sessionId`, not raw rows.
- **To sum or average time-on-page:** first collapse to one row per `sessionId` (keep the
  max `durationSec`), then aggregate. Summing raw `durationSec` across all rows
  double-counts.
- `activeSec` is time the page was visible AND the student interacted within a 30s idle
  window (`activeSec <= durationSec`). `maxScrollPct` is the furthest scroll reached.

The admin dashboard (`_app/admin/observatory.html`, `renderEngagement`) already collapses
by `sessionId`. Any new consumer of the raw collection must do the same.

## Consent gating

- Every document requires the `uid` to have a server-side `observatory_enrollment` or
  `observatory_consent` record (fail-closed: no record, no data).
- The **behavioral** event types (`page_view`, `session_end`, `client_error`, `device`)
  additionally require the participant's `observatory_consent` record to be on the current
  form version (`OBSERVATORY_FORM_VERSION` in `functions/index.js`, kept in lockstep with
  `ObservatoryConsent.FORM_VERSION`). A participant who only ever signed an older form
  version is NOT behaviorally tracked; their `content_complete` and `house_*` events are
  still recorded (those are within the original form's scope). When new behavioral fields
  are added, the form version is bumped and participants re-consent before the new capture
  begins.

## Withdrawal

`withdrawFromObservatory` (Cloud Function) deletes a participant's consent, enrollment, and
ALL of their `observatory_activity` rows. Any offline export must honor a later withdrawal.

Related: `_docs/operations/observatory-analytics-plan-2026-06-22.md`,
`_app/components/ObservatoryTelemetry.js`, `_app/components/ObservatoryConsent.js`.
