# SYM-13 — GCP Cost Monitoring Runbook

> Cloud Billing alert configuration for runtime-monitor + related GCP resources.
> Per CLAUDE.md Rule #10, gcloud commands that mutate state are NEVER executed
> autonomously. This runbook documents what to run; user executes after review.

## Why this exists

Runtime monitor (Cloud Run job, every 15 min) is estimated at **$5-15/month**:
- Cloud Run job execution: ~$0.0001/run × 96 runs/day × 30 days ≈ $0.30/month
- Cloud Build (image rebuild on every code change): mostly free tier
- Container Registry storage: ~$0.01/month
- Cloud Logging ingestion: free tier covers our volume
- Cloud Scheduler: $0.10/job/month

A surprise spike could come from:
- Per-run wall-clock creep (slow probe pulling more vCPU-seconds)
- Extra Cloud Build invocations from frequent image rebuilds
- Logging volume creep (verbose mode left on by accident)
- Other GCP services we add later attaching to the same project

**Goal:** alert if monthly spend on the `hexworth-prime` GCP project exceeds **$30** (2× the upper estimate). Catches cost regressions early without paging on every $5 fluctuation.

## Pre-flight verification

Before any gcloud command, confirm environment:

```bash
gcloud config get-value project   # MUST print: hexworth-prime
gcloud config get-value account   # MUST print: f.mora80@gmail.com
gcloud auth list                  # confirm active credential is correct
```

If `project` shows anything other than `hexworth-prime`, STOP. Cost alerts on the wrong project are silent — they'd watch a different account.

## Identify the billing account ID

Cloud Billing alerts attach to a billing account, not a project directly. The `hexworth-prime` project has a single linked billing account:

```bash
gcloud billing accounts list
# Note the ACCOUNT_ID column for the account named matching this project's billing setup
```

Example output (your ACCOUNT_ID will differ):
```
ACCOUNT_ID            NAME                          OPEN
0X0X0X-XXXXXX-XXXXXX  My Billing Account            True
```

Set as a shell variable for subsequent commands:
```bash
BILLING_ACCT="0X0X0X-XXXXXX-XXXXXX"   # replace with actual
```

## Create the budget + alert

A budget with thresholds is the standard pattern. Two thresholds:
- 50% of $30 ($15) → INFO email (validates the alert pipeline works without paging)
- 100% of $30 ($30) → WARNING email (the actual page)
- 110% of $30 ($33) → CRITICAL email (cost has overshot the budget)

```bash
# Single command creates the budget with all three thresholds.
gcloud billing budgets create \
  --billing-account="$BILLING_ACCT" \
  --display-name="hexworth-prime monthly spend" \
  --budget-amount=30USD \
  --threshold-rule=percent=0.5,basis=current-spend \
  --threshold-rule=percent=1.0,basis=current-spend \
  --threshold-rule=percent=1.1,basis=current-spend \
  --filter-projects=projects/hexworth-prime
```

Cloud Billing emails go to the billing account's notification email (typically the project owner — verify in Cloud Console → Billing → Manage notifications).

## Per-service breakdown alert (optional, for diagnosing spikes)

Budget alerts above are PROJECT-WIDE. To know WHICH service spiked when an alert fires, also enable per-service cost reporting:

```bash
# Enable BigQuery export of detailed billing data (optional but recommended)
# This unlocks Cloud Console → Billing → Cost Reports with service-level breakdowns
gcloud services enable bigquerydatatransfer.googleapis.com

# Then in Cloud Console:
# Billing → Billing export → Daily cost detail → Edit settings
# Pick a BigQuery dataset (or create new), enable export
```

This is documentation-only; the BigQuery setup involves UI clicks that don't fit a runbook well. Skip if cost diagnosis is acceptable via Cloud Console reports.

## Verify the alert pipeline works

Two ways:

### 1. Force a small test charge (passive)

Don't do this — it requires actually spending money and waiting for the budget to recompute. Skip.

### 2. Inspect the alert config (recommended)

```bash
gcloud billing budgets list --billing-account="$BILLING_ACCT" \
  --format="table(displayName,amount.specifiedAmount.units,thresholdRules)"
```

Expected: one row showing "hexworth-prime monthly spend", amount 30, and three threshold rules.

Then in Cloud Console → Billing → Budgets & alerts → click the budget — confirms email recipient.

## Alert response procedure

When a budget alert fires:

1. **Open Cloud Console → Billing → Cost reports**, filter by the alert's project (hexworth-prime), group by service.
2. **Identify the spiking service** — runtime monitor (Cloud Run), Cloud Build, Logging, or something new we added.
3. **Spot-check the runtime monitor cadence**:
   ```bash
   gcloud scheduler jobs describe runtime-monitor-15min --location us-central1 --format="value(schedule)"
   # Expected: */15 * * * *
   ```
   If schedule was changed (e.g., to */1 * * * * by mistake), revert.
4. **Spot-check Cloud Run job execution time**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="runtime-monitor"' \
     --limit 10 --format="value(timestamp,jsonPayload.targetsChecked)"
   ```
   If wall-clock per execution has grown significantly, investigate the runtime monitor probes (network delays, page-load slowdowns).
5. **If spike is from new services**, document and decide whether to retain or roll back.

Add this section to `_docs/operations/incident-response-playbook.md` Appendix A as a cross-link.

## Decision points for user

1. **Approve creating the $30 budget?** Or pick a different threshold ($20, $50)?
2. **Email recipient** — confirm the billing account's notification email is current and monitored.
3. **Per-service breakdown via BigQuery export** — yes (cost ~$0.02/GB stored, negligible) or skip?
4. **Alert response runbook integration** — add this doc's "Alert response procedure" section to incident-response-playbook.md as a cross-link, or keep standalone?

## Authorization checklist

Before executing any gcloud command above, the user must explicitly approve EACH of:

- [ ] `gcloud billing accounts list` — read-only, safe
- [ ] `gcloud billing budgets create ...` — creates a budget, no spend impact
- [ ] `gcloud services enable bigquerydatatransfer.googleapis.com` — enables an API (no spend until used)
- [ ] BigQuery export setup (UI) — separate authorization

Per CLAUDE.md Rule #10, "any direct firebase-admin SDK script targeting the hexworth-prime project" requires explicit per-operation auth. The same posture applies to GCP-wide commands: each is a separate auth moment.

## What this runbook does NOT do

- Does not autonomously execute any gcloud command.
- Does not configure spend caps (HARD limits that pause services). Budgets are alert-only; they don't stop spending.
- Does not configure per-service caps (Cloud Run quota limits exist but are separate from billing).
- Does not address spend anomaly detection (Cloud Billing has automatic anomaly alerts; enable separately if desired).

## Reference

- `_tools/runtime-monitor/DEPLOY.md` — original cost estimate
- `_docs/operations/incident-response-playbook.md` — what humans do when alerts fire
- `_docs/operations/sym-3-tiered-alerts-design.md` — runtime-monitor → human alert pipeline (separate from this billing alert)
- GCP docs: https://cloud.google.com/billing/docs/how-to/budgets
