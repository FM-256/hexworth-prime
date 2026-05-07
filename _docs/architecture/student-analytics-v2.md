# Student Analytics v2 — Event Log Platform

| | |
|---|---|
| **Status** | Draft (Nancy round 1 incorporated; needs round 2 on draft) |
| **Owner** | Frank Mora (PI) |
| **Effective** | 2026-05-07 |
| **Version** | 0.1 |
| **Replaces** | Single-doc per-student progress aggregation (`tenants/{t}/classes/{c}/progress/{uid}`) |

---

## 1 — Goals & Non-Goals

### Goals
- Capture **all 19 dimensions** of educational analytics signal as raw events, future-proofed for analyses we cannot yet anticipate.
- Maintain **real-time UI** affordances (live dashboards, AI-mediated intervention, instant alerts) via Firestore triggers and listeners.
- Preserve **research authority** under the v2 consent form's pseudonymized, decoupled-UID, behavioral-pattern-discovery scope.
- Support the **AI Ghost** (separate RFC) as a downstream consumer of the event log without coupling its architecture to ours.
- Allow **legacy classes to coast** — additive schema, no backfill, version-stamped writes.

### Non-Goals
- Real-time SQL analytics across the raw event stream (deferred — would justify the streaming pipeline only at 50× current scale).
- Anonymization in the strict legal sense (we are pseudonymized; consent v2 makes this honest).
- Backfilling pre-cutover classes into v2 schema.
- Designing the AI Ghost itself (separate RFC, this doc is its prerequisite).
- Replacing existing aggregate fields on `progress/{uid}` until projection-doc parity is verified.

---

## 2 — Privacy Posture (Foundational)

This section is load-bearing. Every architectural decision below is constrained by it.

### 2.1 — Authority basis

**Hexworth Prime operates as a consent-based research platform**, not a FERPA-bound institutional records system. The basis for collection and processing is the signed **Research Participation Consent Form v2.0** (effective 2026-05-07), which authorizes:

- Collection of *interaction data* (clicks, navigation, session timing, content engagement, help-seeking, error patterns)
- Collection of *performance data* (quiz attempts, lab completions, time on task, attempt counts)
- Collection of *behavioral signals* (focus patterns, response timing, paste/clipboard events, integrity-related interactions during assessments)
- AI-mediated research instrument interactions ("Hexworth Ghost")
- Use for academic research, publications, CERBI framework development, AI intervention research, platform improvement, and pedagogical analytics
- Data retention up to **24 months** post-study close

**The decoupled UID model** — Hexworth account UIDs are platform-generated, NOT institutional student IDs. Event data is not linked to institutional records.

**Pseudonymized, not anonymized.** Behavioral fingerprints could in principle re-identify a participant; no attempt to do so will be made. The architecture acknowledges this honestly.

### 2.2 — Per-tenant consent model

Future tenants (other institutions, corporate trainers, workshop providers) require separate consent flows. Architecture treats consent as a **per-tenant configurable artifact**:

```
tenants/{t}/consent/active        # current consent version + scope
tenants/{t}/consent/v1, v2, v3…   # historical versions
```

Phase 1 hardcodes the current research consent for the existing tenant. Multi-tenant consent infrastructure is Phase 2+.

### 2.3 — Out-of-scope until consent is updated

Two of the 19 dimensions require **separate explicit opt-in** per consent v2:

- **Dimension 16 — Demographic** (race/ethnicity, disability status, primary language)
- **Dimension 17 — Career/outcome** (cert exam results, job placement, role changes ≤24mo post-completion)

These dimensions are **not** captured in Phase 1. Their event-type schemas are defined (so the event log can accommodate them later) but **no write path is wired** until a participant opts in via the platform.

### 2.4 — Disclosure UI

Dimension 7 (academic integrity events: paste, devtools, focus-blur during assessments) is enumerated in consent v2 but warrants in-app reinforcement. A **one-time disclosure modal** at first login surfaces:

> "Hexworth captures your interaction data to support research and improve training. Behavioral signals during graded activities (paste events, browser focus, etc.) are monitored for academic integrity research. See the full data policy."

Persisted as `progress/{uid}.disclosureAcknowledgedAt`. Modal does not block participation.

---

## 3 — The 19 Dimensions × Consent Coverage Matrix

| # | Dimension | Phase | Consent v2 covers? | Notes |
|---|---|---|---|---|
| 1 | Engagement / sessions | 1 | ✅ Full | Heartbeats, session boundaries |
| 2 | Per-item granularity | 1 | ✅ Full | Item start/end, attempts, time |
| 3 | Item analysis (response detail) | 3 | ✅ Full | Per-question response, distractor picks |
| 4 | Concept mastery (objective tagging) | 4 | ✅ Full (capture-only early) | Authoring lift — surfacing deferred |
| 5 | Cohort / comparative | 5 | ✅ Full | Aggregates over per-student events |
| 6 | Early-warning / at-risk | 5 | ✅ Full | Computed from events |
| 7 | Academic integrity | 6 | ✅ With disclosure UI | Paste, devtools, focus-blur |
| 8 | Device / environment context | 1 | ✅ Full | Carried on every event |
| 9 | Help-seeking | 1 | ✅ Full | Hints, docs, search, chatbot |
| 10 | Content interaction depth | 1 | ✅ Full | Scroll, video, code-runner |
| 11 | Path / navigation | 2 | ✅ Full | Page-view sequence, skip, backtrack |
| 12 | Pre/post + retention testing | 7 | ✅ Full | Authoring lift — surfacing deferred |
| 13 | Affective / self-report | 8 | ✅ Full | Surveys with care |
| 14 | Content efficacy | 3 | ✅ Full | Per-content rollups |
| 15 | Teaching effectiveness | 5 | ✅ Full | Per-instructor cohort views |
| 16 | Demographic | — | ⚠️ Opt-in required | Out-of-scope Phase 1; consent box must be checked |
| 17 | Career / outcome | — | ⚠️ Opt-in required | Out-of-scope Phase 1; consent box must be checked |
| 18 | Quiz micro-signals | 3 | ✅ Full | Answer change, time-per-question |
| 19 | Lab micro-signals | 3 | ✅ Full | Commands, errors, hints, solution views |

**Summary:** 17 dimensions in scope under consent v2. 2 dimensions (16, 17) gated on participant opt-in via the consent v2 checkboxes.

---

## 4 — Architecture (Nancy-revised, 2026-05-07)

### 4.1 — Why this shape

The first sketch proposed BigQuery streaming inserts via Pub/Sub. Adversarial review (Nancy) flagged this as **over-engineered for current scale (200–2,000 students)** and identified the simpler shape below. Tradeoffs documented in §13.

### 4.2 — Storage layout

**Event log (source of truth)** — Firestore subcollections, partitioned per student per class:

```
tenants/{tenantId}/classes/{classId}/progress/{uid}
  ├── (summary doc — keeps v1 fields for legacy reads, adds schemaVersion: 2)
  ├── events/{eventId}
  │     ├── eventId, ts (server), uid, tenantId, classId, sessionId
  │     ├── type: <event-type-name>
  │     ├── payload: <type-specific, validated against schema registry>
  │     └── context: { device, browser, network, viewport, appVersion }
  ├── sessions/{sessionId}        (server-issued session token records)
  ├── itemState/{itemId}          (cached per-item projection — see §5)
  ├── quizAttempts/{quizId}/{n}   (full quiz attempt history + responses)
  ├── integrityEvents/{eId}       (high-sensitivity events; opt-in disclosure ack required)
  └── mastery/{objectiveId}       (concept mastery rollup — Phase 4)

tenants/{tenantId}/classes/{classId}/aggregates/
  ├── classStats                  (cohort distributions, computed nightly)
  ├── itemAnalytics/{itemId}      (per-content efficacy, computed nightly)
  ├── quizAnalytics/{quizId}      (item analysis: pCorrect, discrimination, distractors)
  └── atRisk                      (computed flags, refreshed every N minutes)

tenants/{tenantId}/consent/
  ├── active                      (pointer to current consent version)
  └── v1, v2, …                   (historical scope definitions)
```

**Analytics archive (BigQuery)** — populated nightly from Firestore via the **native Firestore→BigQuery extension**:

```
hexworth-prime.analytics.events                  (raw event stream, partitioned by date)
hexworth-prime.analytics.itemState               (current item state per student)
hexworth-prime.analytics.aggregates_class_stats  (rolled aggregates)
```

The BigQuery extension is free at this scale, well-documented, zero-ops. Re-tunable later if streaming is ever justified.

### 4.3 — Write path

```
Client
  └─► AnalyticsEvents.js
        ├── Buffers events in memory (5-min flush window OR on page unload)
        ├── Holds a server-issued session token (refreshed on token expiry)
        └── On flush: POST /api/events/ingest (batched)
              └─► Cloud Function: ingestEvents
                    ├── Verifies session token signature + expiry
                    ├── Extracts uid from session token (NOT from client claim)
                    ├── For each event:
                    │     ├── Validates payload against schema registry
                    │     ├── Stamps eventId (idempotent on client UUID)
                    │     ├── Stamps server timestamp
                    │     └── Writes to events/{eventId}
                    └── Returns { accepted, rejected, errors }
                          ↓
                    Firestore onCreate(events/{eventId})
                          └─► Cloud Function: projectEvent
                                ├── Updates summary doc fields (denormalized for fast reads)
                                ├── Updates itemState/{itemId} (per-item cache)
                                ├── Updates per-class aggregate counters
                                ├── Touches projector heartbeat doc
                                └── For integrity events: writes integrityEvents/{eId}
```

**Server-issued session tokens** — short-lived (15-min) signed JWT. Issued by `getSessionToken` CF on page load, refreshed on expiry, embedded in every ingestion request. Carries `uid`, `tenantId`, `classId`, `sessionId` (server-generated). Defends against client-side event omission attacks during integrity scenarios.

### 4.4 — Read path

| Consumer | Path |
|---|---|
| Instructor live dashboard | Firestore listener on `aggregates/classStats` + `aggregates/atRisk` |
| Instructor per-student drill-down | Firestore reads on `progress/{uid}` summary + `itemState/*` + `quizAttempts/*` |
| Student self-view | Firestore reads on own `progress/{uid}` (security rules) |
| AI Ghost (future RFC) | Firestore listener on `events/*` + reads on `progress/{uid}` for context |
| CSV export | Cloud Function reads Firestore; for >10K rows, falls back to BigQuery query |
| Research / analytics queries | BigQuery via signed query CF (admin-only); no direct console access |

---

## 5 — Schema Registry

### 5.1 — Why typed event schemas

Without per-event-type validation, payload fields drift. `quiz.answer_change` gets `questionId` in v1, `question_id` in v2, `qid` in v3. BigQuery's nested-JSON schema evolution is forgiving — which makes drift silent. The fix is a typed registry.

### 5.2 — Layout

```
functions/schemas/events/
  index.js                         (registry — name → schema)
  validator.js                     (payload validator — validates + returns normalized form)
  types/
    nav.session_start.json
    nav.session_end.json
    nav.heartbeat.json
    nav.page_view.json
    item.start.json
    item.complete.json
    item.attempt.json
    quiz.attempt_start.json
    quiz.question_view.json
    quiz.answer_select.json
    quiz.answer_change.json
    quiz.attempt_submit.json
    lab.command.json
    lab.error.json
    lab.hint_request.json
    lab.solution_view.json
    lab.reset.json
    content.scroll.json
    content.video_play.json
    content.video_pause.json
    content.video_seek.json
    content.coderunner_run.json
    help.docs_view.json
    help.search_query.json
    help.bot_interaction.json
    help.forum_post.json
    integrity.tab_blur.json
    integrity.tab_focus.json
    integrity.paste_event.json
    integrity.devtools_open.json
    integrity.copy_event.json
    assessment.pre_test.json
    assessment.post_test.json
    assessment.retention_test.json
    survey.confidence_rating.json
    survey.difficulty_rating.json
    survey.feedback.json
    objective.tagged.json          (content-side, not student-side; for Phase 4)
    demographic.captured.json      (Phase deferred — schema present, write blocked)
    career.outcome.json            (Phase deferred — schema present, write blocked)
```

Each schema is a JSON Schema document with:
- `$id` — event type name
- `required` — required payload fields
- `properties` — typed field definitions
- `additionalProperties: false` — strict
- Custom field `governance.status` — `capture-only | internal | instructor-facing | student-facing` (see §6)
- Custom field `governance.consentScope` — which v2 consent clause authorizes this event

### 5.3 — Phase 1 minimum schema set

Eight event types ship in Phase 1 (covering dimensions 1, 2, 9, 10):
- `nav.session_start`, `nav.session_end`, `nav.heartbeat`
- `item.start`, `item.complete`
- `content.scroll`, `content.video_play`, `content.video_pause`
- `help.docs_view`

Other types ship per-phase per the rollout in §10.

---

## 6 — Governance: Capture vs. Surface

Capturing 19 dimensions of raw signal means anyone with access could query anything. Without explicit governance, "capture but don't surface" collapses on its own. The fix is a per-event-type **status field**:

| `governance.status` | Captured? | Queryable in BigQuery? | Read by Firestore listeners? | Surfaced in instructor UI? | Surfaced to student? |
|---|---|---|---|---|---|
| `capture-only` | yes | research-PI only | no | no | no |
| `internal` | yes | yes | platform CFs only | no | no |
| `instructor-facing` | yes | yes | yes | yes | no |
| `student-facing` | yes | yes | yes | yes | yes |

The instructor UI render layer enforces the gate by checking `governance.status` on every aggregate it reads. New event types default to `capture-only` until explicitly promoted.

---

## 7 — Operational Concerns

### 7.1 — Projector lag detection

Cloud Function projector writes a heartbeat to `aggregates/projectorHeartbeat` every minute. Instructor UI reads it; if `now - lastBeat > 5 min`, displays a banner: *"Analytics may be stale — last updated 12 minutes ago."* Prevents silently-stale dashboards.

### 7.2 — Cost estimate (per term, current scale)

| Item | Volume | Cost basis | Estimate |
|---|---|---|---|
| Firestore writes (events) | ~100K events/student × 200 students = 20M | $0.18 / 100K writes | ~$36 |
| Firestore writes (projector triggers) | 20M (1:1 with events, batched per item to ~5M effective) | $0.18 / 100K writes | ~$9 |
| Firestore reads (UI) | ~200K reads/term | $0.06 / 100K reads | ~$0.12 |
| Firestore storage | ~6GB/term | $0.18/GB/month × 12 months | ~$13 |
| BigQuery export (Firestore extension) | nightly | included free tier | ~$0 |
| BigQuery storage | ~6GB | $0.02/GB/month | ~$1.50 |
| BigQuery queries (research) | low volume, cached | $5/TB | ~$5 |
| **Total / term** | | | **~$65** |

Compares to streaming pipeline estimate of ~$300–500/term for projector ops alone.

### 7.3 — Failure modes

| Failure | Impact | Mitigation |
|---|---|---|
| Ingestion CF down | Events queue in client buffer (5-min capacity), then drop on overflow | Client retries with exponential backoff; stale buffers persisted to localStorage |
| Projector CF down | Aggregates stale; raw events still arrive | Heartbeat detects; UI banner alerts; auto-recovers when CF returns |
| Schema validation fail | Event rejected, error returned to client | Logged with reason; client may retry with corrected payload |
| Session token expired | Ingestion rejects | Client auto-refreshes via `getSessionToken` CF and replays buffer |
| Firestore→BQ export delayed | Research queries run on stale data | Acceptable; research is batch-paced |

### 7.4 — UI staleness affordance

Every instructor dashboard panel that reads v2 aggregates renders a small *"Analytics available from {classCutoffDate}"* footer. Classes started pre-cutover render with the v1 dashboard (no v2 panels). No silent partial data.

---

## 8 — Migration Model

**Additive, versioned, no backfill.**

- New writes stamp `progress.schemaVersion: 2`
- Old code keeps reading old fields
- Cutover criteria: a class is *"v2-eligible"* when started after the schema-version-stamp deploy date AND tenant has consent v2 active
- v1 classes continue using v1 dashboards forever (or until manually migrated by future opt-in)
- No automated backfill — historical classes retain their analysis surface

---

## 9 — AI Ghost Dependency Note

The AI Ghost ("Hexworth Ghost") is **out of scope for this doc**. It is a downstream consumer of the event log + per-student aggregates.

This doc commits to:
- **Read path latency:** Firestore listener notifications fire within 1–2s of event write, so the Ghost can react in near-real-time without streaming analytics.
- **Per-student context:** the summary doc + item state cache provide the Ghost's read surface.
- **Cross-class signal:** if the Ghost ever needs platform-wide patterns, BigQuery (next-morning freshness) supports it.

The Ghost's RFC will define: trigger taxonomy, action authority, cost model, memory model, hallucination guards, evaluation framework. Not designed here.

---

## 10 — Phased Rollout

| Phase | Scope | Dimensions | Prerequisites |
|---|---|---|---|
| **0** | Schema registry foundation, server-issued session tokens, ingestion CF skeleton, security rules update, disclosure modal | — | Test bed (`feature-test-bed` task), consent v2 effective |
| **1** | Event log infra LIVE; emit + ingest dimensions 1, 2, 9, 10 | 1, 2, 9, 10 | Phase 0 |
| **2** | Per-item dashboard (instructor drill-down: time-on-item, attempt history, response detail); add dimension 11 events | 11 | Phase 1 |
| **3** | Item analysis pipeline (nightly aggregator); per-content efficacy view; add quiz/lab micro-signal events | 3, 14, 18, 19 | Phase 2 |
| **4** | Concept tagging — authoring schema + capture-only events; surfacing deferred to dedicated content sprint | 4 (capture-only) | Phase 1 |
| **5** | Engagement deep dive + at-risk computer + cohort/comparative views + teaching effectiveness | 5, 6, 15 | Phase 1, 2 |
| **6** | Academic integrity event capture (with disclosure modal already shipped in Phase 0); review surface for flagged events | 7 | Phase 0 (disclosure), Phase 1 (events) |
| **7** | Pre/post + retention testing instruments — capture-only initially, surfacing in dedicated sprint | 12 (capture-only) | Phase 1, content authoring |
| **8** | Affective surveys (confidence ratings, difficulty ratings, NPS) — surveys + capture | 13 | Phase 1, content authoring |
| **9** | Demographic — gated on consent-v2 opt-in flow (UI to capture opt-in checkbox state) | 16 | Consent v2 opt-in UI (separate work) |
| **10** | Career / outcome — gated on consent-v2 opt-in + ongoing-research re-consent | 17 | Phase 9, separate re-consent flow |

Phases 1, 2, 3, 5 deliver the bulk of analytical value. Phases 4, 7, 8 are infrastructure + content-authoring pairs. Phases 6, 9, 10 are sensitive and slow-tracked.

---

## 11 — Test Environment Dependency

Phase 1 cannot be safely tested against production tenants. The `feature-test-bed` work flagged for 2026-05-07 is a **hard prerequisite**:

- Synthetic test-fixture tenant with seeded students/classes/progress
- Bypass-friendly auth on preview channels (`?testbed=1` flag with server-side preview-channel check)
- Cleanup script for post-session teardown

Phase 1 implementation work proceeds against the testbed exclusively. Production rollout follows verification.

---

## 12 — Adversarial Review Trail

| Round | Reviewer | Status | Notes |
|---|---|---|---|
| 1 | Nancy (sketch) | ✅ Incorporated | 8 critiques addressed: schema registry, governance status, projector heartbeat, simpler architecture (Firestore + nightly BQ), staleness banner, server-issued sessionId, authoring discipline, "available from" UI label |
| 2 | Nancy (this doc) | 🔲 Pending | Round 2 runs against this drafted doc before any Phase 0 code |
| 3 | Karl (citation audit) | n/a | No external citations in this doc beyond consent form |
| 4 | Bridget (sync audit) | n/a until Phase 1 ships |  |

---

## 13 — Tradeoffs Acknowledged

1. **Authoring lift compounding.** Dimensions 4, 12, 13 are infrastructure-only in Phases 4/7/8 — surfacing deferred to content sprints. Without a content commitment, those dashboards remain empty.
2. **Pseudonymization is not anonymization.** Behavior fingerprints can re-identify; consent v2 is honest about this.
3. **No streaming analytics.** Real-time SQL across the event stream is unavailable; all real-time UI works via Firestore triggers. If a use case ever forces streaming, migration path exists (add a Firestore→BQ streaming sink alongside the nightly export).
4. **Multi-tenant consent.** Future tenants need their own consent flow; per-tenant consent infrastructure is Phase 2+.
5. **Long-tail data quality.** Pre-cutover classes will not have v2 analytics. The "available from {date}" UI labels make this explicit, but instructors with mixed-cutover classes will see partial data.
6. **Cost ceiling.** Architecture is sized for low thousands of students. At ~10× scale (~20K students), heartbeat-driven Firestore writes need rate limiting or a streaming sink.

---

## 14 — Open Questions

1. **IRB protocol number** — pending submission/approval. Architecture references it in consent v2 but does not block on it.
2. **Disclosure modal exact copy** — subject to legal review if Hexworth scales to additional institutions.
3. **Multi-tenant cutover semantics** — when a tenant's consent transitions from v1 to v2, are existing students re-consented, or grandfathered? (Recommendation: re-consent on next login, with v1 data archived.)
4. **Event retention vs. archive** — at 24-month boundary, are events purged or moved to cold-storage with reduced query availability? (Recommendation: cold archive for research reproducibility; raw access deauthorized after consent expires.)

---

## 15 — Cross-References

- **Consent form v2:** `/home/eq/hexworth-shared/KBA/research_consent_form_v2.md`, Confluence page 10092545
- **Test environment task:** `memory/project_proper_test_environment.md`
- **Decision protocol used:** `memory/feedback_decision_protocol_with_nancy.md`
- **Existing progress doc shape:** `tenants/{t}/classes/{c}/progress/{uid}` — see `functions/index.js:3619` `getStudentProgress`
- **AI Ghost (future RFC):** path TBD when separate work block kicks off

---

## 16 — Sign-off

This document represents the **directional commitment** for student analytics on Hexworth Prime through 2027. Any architectural change to the event log shape, storage choice, or privacy posture requires updating this doc + Nancy adversarial review.

| Action | Status |
|---|---|
| Doc drafted | ✅ 2026-05-07 |
| Nancy round 2 (on doc) | 🔲 Pending |
| Phase 0 implementation start | 🔲 Pending Nancy round 2 + test bed availability |
| Memory entry | 🔲 Pending |

---

*End of document.*
