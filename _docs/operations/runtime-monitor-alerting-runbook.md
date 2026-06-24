# Runtime Monitor, Site-Health Panel & Alerting — Runbook

*Last updated: 2026-06-24*

## TLDR

A Cloud Run job (`runtime-monitor`) hits five live hexworth.com pages from Google's
network every 15 minutes, measures status + latency, and publishes the result to
**Firestore** and **Cloud Logging**. The Pulse admin dashboard reads Firestore in real
time and shows a **"Site Health — Live Uptime"** panel (up/down per page, latency, history,
alert banners). The monitor also evaluates **alert thresholds** and a **Google Cloud
Monitoring policy** emails the operator on sustained outages. End-to-end:

```
runtime-monitor (Cloud Run, every 15 min)
   ├─ Cloud Logging  (raw JSON, all-day availability record)
   ├─ Firestore  _quality_reports/runtime_latest (+ runtime_history)
   │     └─ Pulse "Site Health" panel  (/pulse.html, real-time onSnapshot)
   └─ exit code / job metric
         └─ GCP alerting policy → email channel → operator inbox  (sustained failures)
```

## Why it exists

Surfaced after the 2026-06-23 incident: real users had degraded access for hours and the
only signal was buried in Cloud Logging. This system makes availability + latency visible
in-app (Pulse) and pushes email when it is genuinely broken — without false-alarming on the
transient blips every deploy causes.

## Components

| Component | Identifier | Notes |
|-----------|-----------|-------|
| Cloud Run job | `runtime-monitor` (us-central1) | 1 vCPU, 1Gi, 300s timeout, one-shot |
| Container image | `gcr.io/hexworth-prime/runtime-monitor` | Pin by **digest** on deploy (see Gotchas) |
| Scheduler | `runtime-monitor-15min` | cron `*/15 * * * *` America/New_York |
| Source | `_tools/runtime-monitor/run.js` (+ `Dockerfile`, `package.json`) | tracked via `git add -f` (under gitignored `_tools/`) |
| Firestore — latest | `_quality_reports/runtime_latest` | overwritten each run; full report + alert fields |
| Firestore — history | `_quality_reports/runtime_history` | rolling array, last ~48 runs (≈12h) |
| Pulse panel | `_app/pulse.html` → "Site Health — Live Uptime" | admin-gated; `onSnapshot`, real-time |
| Email channel | `projects/hexworth-prime/notificationChannels/4299692991827864061` | → f.mora80@gmail.com |
| Alerting policy | `projects/hexworth-prime/alertPolicies/9716215672966082096` | "sustained failures", ≥2 failed runs / 45 min |

Reads are gated by the existing `firestore.rules` rule `match /_quality_reports/{reportId} {
allow read: if isAdmin(); }`. The monitor writes via the Cloud Run service account
(`11726236962-compute@developer.gserviceaccount.com`, granted `roles/datastore.user`), which
bypasses client write rules — so no rules change was needed.

## Monitored targets

Defined in the `TARGETS` array in `_tools/runtime-monitor/run.js`:

1. `/index.html` (Landing)
2. `/sorting.html`
3. `/dashboard.html` (seeds `hexworth_house: 'web'` in localStorage)
4. `/houses/web/index.html`
5. `/houses/cloud/modules/wsa/index.html` (WSA Hub)

Add/remove by editing `TARGETS`, then rebuild + redeploy (see below).

## Alert thresholds

Evaluated in `run.js` each run; results written to `runtime_latest` as `alertLevel`
(`none`/`warning`/`critical`), `alerts[]`, `consecutiveFailures`, and `thresholds`.

| Condition | Severity |
|-----------|----------|
| A target fails (non-2xx / nav error), single run | **WARNING** |
| `ALERT_CONSEC_CRIT` (default **2**) consecutive failed runs | **CRITICAL** |
| Target up but `navMs` ≥ `ALERT_LAT_WARN_MS` (default **15000**) | WARNING |
| Target up but `navMs` ≥ `ALERT_LAT_CRIT_MS` (default **25000**) | CRITICAL |
| No Firestore report for > 20 min (computed on the Pulse side) | CRITICAL (STALE) |

**Anti-blip design (important):** both the in-app CRITICAL and the GCP email policy require
*sustained* failure (≥2). This is deliberate — every `firebase deploy` briefly disrupts
serving and produces a single failed run (e.g. the 2026-06-23 15:02 blip). One failed run is
WARNING (visible on Pulse) but does not page; a real outage (2+ runs / 45 min) does.

Tune without a code change — set env vars on the job:
```bash
gcloud run jobs update runtime-monitor --region us-central1 \
  --update-env-vars ALERT_CONSEC_CRIT=3,ALERT_LAT_WARN_MS=12000
```

## How to operate

**See current status:** open `/pulse.html` signed in as an admin → "Site Health — Live
Uptime" panel (overall UP/DEGRADED/DOWN/STALE badge, per-target rows with HTTP status +
latency bars, alert banners, recent-runs history strip). Updates in real time.

**Authoritative all-day record (Cloud Logging):**
```bash
# recent runs
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' \
  --project hexworth-prime --limit 3 --format="value(jsonPayload)"
# failed runs per day (compare counts to spot anomalies)
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor" AND severity>=WARNING AND timestamp>="2026-06-23T00:00:00Z" AND timestamp<="2026-06-23T23:59:59Z"' \
  --project hexworth-prime --format="value(timestamp)" | wc -l
```

**Manage alerting (GCP `beta`/`alpha` components are NOT installed → use the REST API):**
```bash
TOKEN=$(gcloud auth print-access-token)
# list policies
curl -s "https://monitoring.googleapis.com/v3/projects/hexworth-prime/alertPolicies" \
  -H "Authorization: Bearer $TOKEN" -H "X-Goog-User-Project: hexworth-prime"
# create channel / policy: POST to .../notificationChannels and .../alertPolicies
# (see git history of this runbook's build for the exact JSON bodies)
```

**Manual trigger / pause:**
```bash
gcloud run jobs execute runtime-monitor --region us-central1 --wait      # run now
gcloud scheduler jobs pause  runtime-monitor-15min --location us-central1 # stop (zero cost)
gcloud scheduler jobs resume runtime-monitor-15min --location us-central1
```

## Rebuild after a `run.js` / Dockerfile change

```bash
cd _tools/runtime-monitor
gcloud builds submit --tag gcr.io/hexworth-prime/runtime-monitor:latest .   # note the printed digest
gcloud run jobs update runtime-monitor \
  --image gcr.io/hexworth-prime/runtime-monitor@sha256:<DIGEST> \
  --region us-central1                                                       # pin by DIGEST
gcloud run jobs execute runtime-monitor --region us-central1 --wait          # verify
```

## Gotchas (both cost time on 2026-06-24)

1. **`firebase-admin` optional dependency.** firebase-admin keeps its Firestore support in the
   optional dependency `@google-cloud/firestore`. Installing with `--omit=optional` drops it →
   runtime error `Cannot find module '@google-cloud/firestore'`, swallowed by the best-effort
   try/catch, so the Firestore write silently no-ops. The Dockerfile installs **puppeteer**
   with `--omit=optional` but **firebase-admin without it**. The error lands in `jsonPayload`,
   not `textPayload` — query `--format="value(jsonPayload)"` to see it.
2. **`:latest` tag caching.** `gcloud run jobs update --image ...:latest` frequently no-ops
   because the tag string is unchanged, so the OLD image keeps running. **Always deploy by
   digest** (`@sha256:...`), printed by `gcloud builds submit`.

## Cost

~$5–15/month: Cloud Run execution time at 15-min cadence + Cloud Scheduler ($0.10/job/month) +
GCR storage (~$0.01/month) + negligible Firestore writes (2 docs/run) + Cloud Monitoring
(free tier covers this volume).

## Related

- Source + deploy assets: `_tools/runtime-monitor/` (`run.js`, `Dockerfile`, `DEPLOY.md`)
- Pulse dashboard: `_app/pulse.html`
- Off-Hosting video migration (same week): `_docs/research/video-asset-hosting-scope-2026-06-16.md`
- GCP cost monitoring: `_docs/operations/sym-13-gcp-cost-monitoring.md`
