# Hexworth Runtime Monitor — Cloud Run Deploy

> Status: container assets ready, deploy commands documented, **NOT YET RUN**.
> When you decide on cadence + alert sink, run the commands in §3.

## What this deploys

A Cloud Run job that runs `_tools/runtime-monitor/run.js` on a schedule:
- Hits 5 critical hexworth.com URLs from real Puppeteer headless
- Outputs structured JSON to Cloud Logging
- Exits 0 = all healthy, 1 = at least one target failed

No long-running service — single-shot job, billed per execution.

## Pending decisions before running deploy

Three things to confirm before you execute the commands below:

### 1. Cadence (Cloud Scheduler trigger)
**Recommended:** every 15 min during 8 AM–10 PM ET, every 60 min off-hours and weekends. Cron representations:
- Business hours: `*/15 8-22 * * 1-5` (cron in `America/New_York`)
- Off-hours weekdays: `0 0,1,2,3,4,5,6,7,23 * * 1-5`
- Weekends: `0 * * * 0,6`

Or simplest: every 15 min always (`*/15 * * * *`) — slightly more cost, no time-zone math.

### 2. Alert sink
For the MVP: results go to Cloud Logging only. To wire alerts:
- **Pulse dashboard:** add a Firestore-write step in `run.js` (writes to `_quality_reports/runtime/latest`). Then Pulse reads it.
- **Email/push on failure:** Cloud Logging → Log-based metric → Cloud Monitoring alert → Notification channel. ~30 min of setup.

Defer both to a later step. Cloud Logging captures the raw JSON immediately and you can inspect via `gcloud logging read`.

### 3. Authorization
Per CLAUDE.md Rule #10, GCP resource creation needs explicit per-operation authorization. Each gcloud command below is a separate authorization moment.

## Cost estimate
- Cloud Run: ~$0.024/vCPU-hour + $0.0025/GiB-hour. Single 30-second run with 1 vCPU + 1GB RAM ≈ $0.0001 per run.
- Cloud Build: free tier covers 120 build-minutes/day; one-time builds well within free tier.
- Cloud Scheduler: $0.10/job/month — flat.
- Container Registry: ~$0.026/GB-month for storage. Image ~400MB ≈ $0.01/month.

**Total ongoing:** ~$5-15/month at 15-min cadence (depends on per-run wall-clock).

## Deploy commands (documented but NOT run)

### 0. Verify environment
```bash
gcloud config get-value project   # should print: hexworth-prime
gcloud config get-value account   # should print: f.mora80@gmail.com
gcloud services list --enabled | grep -E "(run|cloudbuild|cloudscheduler|containerregistry)"
```

### 1. Enable required APIs (one-time)
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com cloudscheduler.googleapis.com containerregistry.googleapis.com
```

### 2. Build + push container to GCR
```bash
cd _tools/runtime-monitor
gcloud builds submit --tag gcr.io/hexworth-prime/runtime-monitor:latest .
```

### 3. Create the Cloud Run job
```bash
gcloud run jobs create runtime-monitor \
  --image gcr.io/hexworth-prime/runtime-monitor:latest \
  --region us-central1 \
  --task-timeout 300 \
  --memory 1Gi \
  --cpu 1 \
  --max-retries 1 \
  --set-env-vars "TARGET_BASE=https://hexworth.com,NAV_TIMEOUT_MS=25000"
```

To update later (after a code change + `gcloud builds submit ...` to push a new image):
```bash
gcloud run jobs update runtime-monitor --image gcr.io/hexworth-prime/runtime-monitor:latest --region us-central1
```

### 4. Test the job once before scheduling
```bash
gcloud run jobs execute runtime-monitor --region us-central1 --wait
# Then read the output:
gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' --limit 5 --format=json
```

### 5. Wire Cloud Scheduler trigger
**Simple option (every 15 min, always):**
```bash
gcloud scheduler jobs create http runtime-monitor-15min \
  --location us-central1 \
  --schedule="*/15 * * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/hexworth-prime/jobs/runtime-monitor:run" \
  --http-method=POST \
  --oauth-service-account-email="$(gcloud projects describe hexworth-prime --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
```

**Business-hours-aware option (more setup):** create two scheduler jobs with the cron specs in §1.

### 6. Verify scheduling
```bash
gcloud scheduler jobs list --location us-central1
gcloud scheduler jobs run runtime-monitor-15min --location us-central1   # one-off trigger to test
```

## Rollback / cleanup commands

If you want to disable or remove the monitor:
```bash
# Pause the schedule (no resource cost, easy to re-enable)
gcloud scheduler jobs pause runtime-monitor-15min --location us-central1

# Or delete entirely
gcloud scheduler jobs delete runtime-monitor-15min --location us-central1
gcloud run jobs delete runtime-monitor --region us-central1
gcloud container images delete gcr.io/hexworth-prime/runtime-monitor:latest --force-delete-tags
```

## How to add Firestore writes later (for Pulse integration)

When ready to wire results into Pulse:

1. Add `firebase-admin` to `package.json` dependencies
2. In `run.js`, after building the `report` object, write to Firestore:
   ```js
   const admin = require('firebase-admin');
   admin.initializeApp();  // uses default service account in Cloud Run
   await admin.firestore()
       .collection('_quality_reports').doc('runtime').collection('history')
       .add(report);
   await admin.firestore()
       .collection('_quality_reports').doc('runtime').collection('latest').doc('latest')
       .set(report);
   ```
3. Grant the Cloud Run service account Firestore write permission:
   ```bash
   gcloud projects add-iam-policy-binding hexworth-prime \
     --member="serviceAccount:$(gcloud projects describe hexworth-prime --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```
4. Update `firestore.rules` to allow the runtime monitor to write `_quality_reports/runtime/*`
5. Pulse already reads `_quality_reports/*` — no UI change needed; it'll pick up the runtime status automatically.
