# SYM-3 — Tiered Alerts Design Proposal

> **Status: design only. No code written. Awaiting user review per CLAUDE.md rule 9.**
> Closes the safety-net loop: runtime monitor failures currently sit in Cloud Logging until someone looks. This design routes them to humans by severity.

## The gap

Today, `_tools/runtime-monitor/run.js` runs on Cloud Run every 15 min, probes 5 hexworth.com URLs, and writes structured JSON to Cloud Logging. If `allPassed=false`, **nothing happens.** The signal is captured but no human is notified.

## Goals

1. Failures reach a human within ~16 min of first occurrence (one runtime monitor cycle + alert latency).
2. Different severities use different channels — a single transient failure shouldn't ring the phone, but a sustained outage must.
3. No alert storms — repeated failures of the same target consolidate into one notification.
4. Costs stay near current Cloud Run spend (~$5-15/month). Email + push cost <$5/month even at high volume.

## Severity definitions

| Severity | Trigger | Channel | Rationale |
|---|---|---|---|
| **PULSE** | Any failure (single cycle, 1+ targets) | Pulse dashboard tile (passive) | Always visible; no interruption |
| **WARN** | 2 consecutive cycles fail OR 2+ targets fail in one cycle | Pulse + push notification | Likely real, not transient |
| **PAGE** | 4+ consecutive cycles fail OR 4+ targets fail in one cycle OR `runError` set (cloud Run job died) | Pulse + push + email | Sustained or wide-scope outage |
| **RECOVER** | 1 successful cycle following any prior failure | Pulse update + push (no email) | Confirm restoration without alarm |

The thresholds are tuned for the 15-min cycle: WARN at 30 min of failure, PAGE at 60 min. A single CDN blip (one cycle, one target) stays at PULSE — visible but silent.

---

## Architecture options

Three candidate routing mechanisms. Each has different tradeoffs in latency, cost, and complexity.

### Option 1 — Cloud Function triggered by Cloud Logging sink

```
runtime-monitor (Cloud Run) → Cloud Logging → Log sink → Pub/Sub topic → Cloud Function → channels
```

The Cloud Function is the brain: reads the latest log entry, queries Firestore for prior state (consecutive failure count), decides severity, writes Pulse state, sends push/email.

**Pros:**
- Single function, single language (Node.js — same as runtime monitor)
- Full control over severity logic, rate limiting, payload formatting
- Can update Pulse state in same function call as alerting
- Pub/Sub built-in retry on Cloud Function failure
- Logs of alerting decisions are themselves searchable in Cloud Logging

**Cons:**
- More moving parts (sink + topic + function vs. just an alert policy)
- Cold-start latency on the function (~1-3 sec — negligible vs. 15-min cycle)
- Two GCP services to authorize and bill (Pub/Sub + Functions, both mostly free at our scale)

**Cost:** Pub/Sub ~$0/month at <10k messages. Cloud Functions free tier covers 2M invocations/month. Realistically: $0-1/month added.

### Option 2 — Cloud Monitoring log-based metric + alert policy

```
runtime-monitor (Cloud Run) → Cloud Logging → log-based metric (allPassed=false) → Monitoring alert policy → Notification channels (Email, Pub/Sub, Webhook)
```

Cloud Monitoring's built-in alert policy fires on metric threshold; notification channels include email natively, push via webhook to a custom service.

**Pros:**
- All managed by GCP — no custom code for the basic email path
- Alert policies have built-in suppression / aggregation knobs
- Visualization for free (Monitoring dashboards)

**Cons:**
- Severity tiering logic harder to express in alert policy thresholds (you can do "fire if N occurrences in M minutes" but not "WARN at 2 cycles, PAGE at 4 cycles" cleanly)
- Pulse integration still requires a separate Cloud Function (or modify runtime monitor to write Firestore directly — SYM-4)
- Push notifications still require a custom delivery path
- Less flexible payload formatting (Monitoring email templates are limited)

**Cost:** Free for this volume.

### Option 3 — Cloud Function only, polling Cloud Logging on a schedule

```
Cloud Scheduler (every 5 min) → Cloud Function → reads recent Cloud Logging entries → decides → channels
```

No Pub/Sub, no log sink. The function self-drives.

**Pros:**
- Simplest to reason about (one function, one schedule)
- Easy to test locally (just call the function)

**Cons:**
- Polls instead of reacting — adds up to 5 min latency
- Re-reads same log entries until they age out — must dedupe via Firestore "last seen timestamp" state
- More function invocations (288/day vs. ~5/day in Option 1)

**Cost:** Still under free tier but burns more invocations.

---

## Recommendation: Option 1 with phased build

Build in three phases, each shippable independently:

### Phase A — Pulse-only (no human alerts yet)

1. Modify `_tools/runtime-monitor/run.js` to ALSO write its result to Firestore `_quality_reports/runtime/latest` and append to `_quality_reports/runtime/history` (with TTL on history).
2. Add Pulse dashboard tile that reads the Firestore doc and renders status.

Result: passive visibility. Failures are visible on the dashboard if you happen to be looking.

**This is SYM-4.** It's a prerequisite for any active alerting; building it standalone first means Pulse works before SYM-3 ships.

### Phase B — Cloud Function watcher + push notifications

1. Create Pub/Sub topic `runtime-monitor-events`.
2. Create Cloud Logging sink: filter `resource.labels.job_name="runtime-monitor"`, route to topic.
3. Cloud Function `runtime-alert-watcher` triggered by topic:
   - Parses log entry.
   - Reads Firestore `_quality_reports/runtime/state` for prior consecutive-failure count.
   - Updates state, decides severity per the table above.
   - Writes severity decision to Firestore (Pulse picks it up on next refresh).
   - For WARN severity: sends FCM push to registered devices (start with operator's phone).

Result: failures wake the operator's phone within ~17 min of first occurrence.

### Phase C — Email channel for PAGE severity

1. Choose provider: SendGrid (free tier 100/day), Mailgun (5,000/month free for 3 months), or Cloud SMTP (no SLA, free).
2. Add email send to the Cloud Function's PAGE branch.
3. Templated email: subject = `[HEXWORTH PAGE] X targets failing for Y minutes`, body = JSON summary + dashboard link.

Result: sustained outages get an email even if push isn't seen.

---

## Push notification mechanism

For Phase B, the push channel needs a delivery path. Options:

- **Firebase Cloud Messaging (FCM)** — already integrated with the platform; can deliver to a registered browser or mobile device. Operator subscribes to a `runtime-alerts` topic. Free.
- **Pushover / ntfy.sh** — third-party push services. ~$5 one-time (Pushover) or free (ntfy.sh self-hosted). Simpler than FCM for a single recipient.
- **Slack / Discord webhook** — if the operator already lives in one of these.
- **iOS/Android Critical Alerts** — bypass Do Not Disturb (PAGE-level only). Requires native app build.

**Recommendation:** start with FCM via a small static web page subscribed to the topic. Operator opens the page once, grants notification permission, leaves the tab pinned. Free, no third-party. Upgrade to Pushover or native app if FCM proves unreliable.

---

## Rate limiting

Pulse is updated every cycle (no rate limit needed — passive).
Push/email rate limits live in the Cloud Function:

```
PUSH:  one notification per (target, severity-class) per 60 min.
       Recovery push always sends.
EMAIL: one email per incident_id per 6 hr.
       incident_id is generated on first PAGE event, cleared on RECOVER.
       Subject prefix [REMINDER] on subsequent emails for the same incident.
```

State for rate limiting lives in Firestore `_quality_reports/runtime/alert_state`.

---

## On-call rotation

Currently solo operator. Design ships with a single recipient.

When a team forms, add `_quality_reports/runtime/oncall_schedule` Firestore doc:
```
{
  "schedule": [
    { "from": "2026-05-04T00:00Z", "to": "2026-05-11T00:00Z", "recipient": "<operator>@..." },
    ...
  ]
}
```
Function reads this on each alert decision; falls back to a default recipient if no match.

---

## Failure modes of the alerting system itself

| Failure | Detection | Mitigation |
|---|---|---|
| Cloud Function errors | Cloud Logging (function's own logs) | Pub/Sub retry; Monitoring alert on function-error rate |
| FCM push delivery fails | Firestore write succeeds but no notification arrives | Phase C email is the backup channel |
| Email provider down | Send returns error | Function logs error, retries on next event; operator may notice from Pulse |
| Cloud Run runtime monitor itself stops running | NO log entries arrive at all → NO alerts fire | Cloud Monitoring "absence of data" alert — fires if no log entries in 30 min |

The "absence of data" alert is critical. It catches the case where the monitor itself is broken (Cloud Run job failed to start, scheduler paused, image deploy broke). Without it, silence looks like health.

---

## Cost summary

| Component | Monthly cost | Notes |
|---|---|---|
| Cloud Run (existing) | $5-15 | Per existing DEPLOY.md estimate |
| Pub/Sub | <$0.10 | At ~5k messages/month, well under free tier |
| Cloud Function | <$0.10 | At ~5k invocations/month, under free tier |
| Cloud Monitoring | $0 | Built into GCP |
| FCM | $0 | Free for this scale |
| Email (SendGrid free / Mailgun) | $0 | Stay under free tier |
| **Total added by SYM-3** | **<$1** | |

---

## What this design does NOT do

- **No paging service integration** (PagerDuty, OpsGenie). Could be added in Phase D if team grows.
- **No anomaly detection / smart suppression**. Threshold-based only. ML-based alert noise reduction is a future step.
- **No trend dashboards beyond Pulse**. Cloud Monitoring dashboards are available but not configured by this design.
- **No IVR / SMS** for absolute-emergency channel. Could route via SendGrid SMS or Twilio if needed.

---

## Decision points for the user

Before I write any code, I need direction on:

1. **Approve Option 1** (Cloud Function watcher) vs. one of the alternatives?
2. **Phase A first** (just Pulse, no human alerts) — agree, or build A+B together?
3. **Push channel**: FCM web page (free, simple), Pushover ($5 one-time), Slack/Discord webhook, or wait until SYM-3 Phase B and decide then?
4. **Email channel**: SendGrid, Mailgun, or skip Phase C entirely (push-only)?
5. **Severity thresholds**: The 1/2/4-cycle ladder is a starting guess. Adjust before code, or ship and tune from first incident?

---

## Implementation sequence (if approved)

```
SYM-4 (Phase A — Pulse integration)
  ├─ Modify runtime-monitor/run.js → write Firestore on each run
  ├─ Add firestore.rules entry for _quality_reports/runtime/*
  ├─ Grant Cloud Run service account roles/datastore.user
  ├─ Build Pulse tile that reads _quality_reports/runtime/latest
  └─ Verify after one cycle

SYM-3 Phase B (push)
  ├─ Create Pub/Sub topic + Cloud Logging sink
  ├─ Write runtime-alert-watcher Cloud Function (severity logic + state)
  ├─ Set up FCM web subscriber page
  └─ Trigger test failure, verify push lands

SYM-3 Phase C (email)
  ├─ Configure email provider
  ├─ Add PAGE-tier branch to Cloud Function
  └─ Force a 4-cycle failure to test end-to-end
```

Each phase is a separate sprint item, each gates on the previous. None ship without the user explicitly authorizing the deploy per CLAUDE.md Rule #10.

---

## Reference

- `_tools/runtime-monitor/run.js` — current monitor (Cloud Logging only)
- `_tools/runtime-monitor/DEPLOY.md` — deploy runbook
- `_docs/operations/safety-net-architecture.md` — Stage 4 description
- `_docs/operations/incident-response-playbook.md` — what humans do when alerts fire
