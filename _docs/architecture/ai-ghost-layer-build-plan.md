# AI Ghost Layer — Build Plan

> Gap #4 from the AI module readiness pass: "AI Ghost Layer designed
> but not built. Big future work." This document is the concrete build
> plan, not the design (the design lives in operator's earlier thread
> 2026-05-01 → 05-12).

## What the Ghost Layer is

A **proactive** observation + intervention layer on top of Dr. Hex.
Current architecture is purely reactive — Dr. Hex responds when a
student asks. The Ghost Layer watches student telemetry passively
and reaches out when patterns suggest the student is stuck or about
to give up.

Compared to the current system:

| Aspect | Current Dr. Hex | Ghost Layer adds |
|---|---|---|
| Trigger | Student initiates | Telemetry pattern triggers |
| Latency | On-demand, 30-60s response | Pre-computed nudges, near-instant delivery |
| Modality | Conversational | Short proactive nudges + escalations to chat |
| Surface | `/chat` endpoint | Banner / sidebar / push notification |
| Cost | Per-student per-question | Continuous low-cost rule eval + occasional LLM nudge |

## What this document IS NOT

This is the **build plan**, not the design. It assumes the design
(observation taxonomy, nudge categories, intervention thresholds) is
established. If those are still in flux, return to the design thread
first — building on unclear design produces churn.

## Component breakdown

The Ghost Layer is 6 components:

### 1. Telemetry pipeline (foundation)

**What it does:** captures student behaviour signals into a queryable
stream.

**Signals to capture (minimum viable):**
- `flag_attempts` writes (already in Firestore — just need read access)
- `flag_captures` (already)
- Lab page-views with timestamps (NEW — need client-side beacon)
- Time-on-page per lab (NEW)
- Help-level escalations triggered server-side (already in
  `dr_hex_security_events` indirectly via behavioral score)
- Dr. Hex chat invocations (already in `tool_invocations` audit)

**Storage:** Firestore collection `student_telemetry` (NEW),
TTL'd at 90 days. Schema: `{uid, event_type, mission_id, value,
ts}`. Index on `(uid, ts DESC)`.

**Implementation cost:** ~2 days. Client-side beacon JS + new
Firestore collection + security rule + index.

### 2. Detector — cheap rule engine

**What it does:** runs simple boolean rules against per-student
telemetry every N minutes. Outputs detector hits.

**Initial detector set (5):**
- `stuck_on_lab` — 3+ flag_attempts on same mission_id in 30 min, no
  captures
- `abandoned_lab` — flag_attempts but no activity in 4+ hours
- `repeated_failures` — 5+ attempts across multiple flags in same mission
- `help_level_ceiling_hit` — student at L4 (highest auto-escalation)
  for 10+ minutes
- `cross_session_struggle` — same student, same mission, 2+ sessions
  without progress over 7 days

**Where it runs:** Cloud Function scheduled (`onSchedule('every 5 minutes')`).
Reads `student_telemetry` for the last 30 min, evaluates rules,
writes hits to `ghost_detector_hits` collection.

**Implementation cost:** ~1 week. 5 rules + scheduling + tests.
The rules themselves are cheap; the schema + indexing is the work.

### 3. Intervention generator — LLM nudge writer

**What it does:** for each unresolved detector hit, generate ONE
short proactive nudge. Throttled per-student.

**Throttle:** max 1 nudge per student per 4 hours.

**LLM call:** uses the same `qwen2.5:7b` via the orchestrator's
`/chat` endpoint with a special `is_ghost_nudge=true` flag in the
request body — the orchestrator routes to a different persona
("the helpful nudge" persona) + system prompt that asks for one short
sentence + an optional "want to chat?" CTA.

**Output:** writes to `ghost_nudges` collection (queued for delivery).

**Implementation cost:** ~3-4 days. Persona definition + system prompt +
throttle logic + new orchestrator route + tests.

### 4. Delivery surface — where the nudge appears

**Options (operator decision):**
- **Banner on the lab page** — visible immediately, doesn't interrupt
- **Sidebar notification badge** — clickable to expand
- **Push notification** — requires service worker; high friction

**Recommendation:** banner on the lab page, polled every 60s from
the client via a new endpoint `GET /api/ghost/pending-nudges`.

**Client-side:** ~150 lines of JS to render the banner, dismiss it,
or click to escalate to full chat.

**Implementation cost:** ~2 days for the banner + polling endpoint.

### 5. Feedback loop — dismissal/escalation events

**What it does:** captures whether the nudge worked.

- Student dismissed → log "ineffective"
- Student clicked "chat about this" → log "escalated"
- Student captured the flag within 10 min of nudge → log "effective"

These outcomes feed back into the rule engine to mute over-firing
patterns and surface effective ones.

**Implementation cost:** ~2 days. New event_type for the existing
telemetry collection + dashboard.

### 6. Operator dashboard — observe + tune

**What it does:** operator sees which detectors fire, how often,
effectiveness rates. Tune thresholds or mute detectors.

**Implementation cost:** ~3 days. New admin page extending the
existing dashboard pattern.

## Total cost estimate

| Component | Effort |
|---|---|
| Telemetry pipeline | ~2 days |
| Detector engine | ~1 week (5 rules) |
| Intervention generator | ~3-4 days |
| Delivery surface | ~2 days |
| Feedback loop | ~2 days |
| Operator dashboard | ~3 days |
| **Total** | **~3-4 weeks focused work** |

## Sequencing recommendation

Do not build all 6 at once. The right order:

1. **Telemetry pipeline first** (week 1) — generates the data the rest
   needs. Validate with read queries before adding consumers.
2. **One detector + dashboard** (week 2) — pick `stuck_on_lab`,
   build it, build the operator dashboard, verify alerts fire correctly.
3. **Intervention generator** (week 3) — start with operator-only
   delivery (nudge appears in operator dashboard, not yet to student),
   verify quality.
4. **Delivery surface to students** (week 4) — opt-in alpha cohort
   first, expand based on feedback loop data.

## Prerequisites this depends on

- [x] AI orchestrator working end-to-end
- [x] Quality observation pipeline (so ghost-nudge failures get logged)
- [x] Security event log (so ghost-nudge-induced attacks get logged)
- [ ] Student telemetry capture (NEW work — see Component 1)
- [ ] Operator decision on delivery surface (banner vs sidebar vs push)
- [ ] Operator decision on detector thresholds (defaults vs class-specific)

## Risks worth flagging now

1. **Nudge fatigue** — students get tired of proactive AI interruptions.
   Throttling helps but isn't sufficient. Need feedback loop early.
2. **Detector false positives** — "stuck" looks like "thinking carefully."
   The 30-min window is a guess; needs tuning against real data.
3. **Privacy concerns** — passive observation of student behaviour is
   different from on-demand chat. Need explicit consent + opt-out path.
4. **LLM cost** — 5 detectors × 1000 students × 1 nudge per 4 hours =
   ~30,000 LLM calls/day. Local hexclass GPU can handle this but
   needs verification under load.
5. **Ghost reaches LLM via orchestrator** — same defense layers apply
   to ghost nudges as student requests. Honeypots / output scrubbing
   still active. This is the right posture but the ghost can't bypass
   the constitution to e.g. spoiler-warn about flag patterns.

## When to start

NOT NOW. Today (2026-05-25) the reactive chat system is fresh in
production-grade state. Ghost Layer should wait until:

1. The reactive system has 30+ days of real-student usage data
2. The telemetry needed for Ghost detectors is being captured anyway
   (the `student_telemetry` collection can be built incrementally
   before Ghost is built — start now, harvest data, build Ghost when
   ready)
3. Operator has bandwidth for a 3-4 week focused project

## Related

- Original design thread (operator notes 2026-05-01 → 05-12) — not
  in repo; lives in operator's notes
- `_docs/architecture/dr-hex-orchestrator.md` — the reactive layer
- Memory: `project_ai_ghost_layer.md`
