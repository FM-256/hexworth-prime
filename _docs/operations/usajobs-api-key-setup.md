# USAJobs API Key Setup

**Status:** Operator action item — required to enable the federal jobs + internships source in the LIVE-2 `fetchOpportunities` Cloud Function
**Created:** 2026-06-03 (Nancy LIVE-6 round 1 follow-up)

## Why this exists

The launchpad live feed pulls federal cyber jobs and Pathways internships from USAJobs. USAJobs requires every API request to include both `User-Agent` (the registered contact email) and `Authorization-Key` (a per-account API key). Without the key, every request returns HTTP 401.

The `fetchOpportunities` CF is built to degrade gracefully: if the `USAJOBS_API_KEY` Firebase secret is not set, the USAJobs source is skipped silently each run, and the feed populates from Hacker News + We Work Remotely only. Adding the key wakes up the federal source.

## Pre-deploy step (CRITICAL — Nancy LIVE-6 round 2 finding)

The `fetchOpportunities` Cloud Function binds `USAJOBS_API_KEY` via `secrets: [USAJOBS_API_KEY]` in its schedule config. Firebase CLI verifies bound secrets exist at deploy time. **If the secret has never been created in Google Secret Manager, the first `firebase deploy --only functions` for fetchOpportunities will fail.**

Resolution: create the secret BEFORE the first deploy, even if you don't have a real API key yet. Use a placeholder value:

```bash
cd /home/eq/ai-content/hexworth-prime
echo -n "PLACEHOLDER_REPLACE_WITH_REAL_KEY_AFTER_REGISTRATION" | firebase functions:secrets:set USAJOBS_API_KEY --data-file=-
```

With the placeholder set, the deploy succeeds. The CF runs and sees a non-empty (but invalid) key, so USAJobs requests get 401, the adapter logs a warning, and the source is effectively skipped per the graceful-degrade pattern. HN + WWR populate the feed normally.

Once you have a real key from steps 1-5 below, run the same command with the real value, then `firebase deploy --only functions:fetchOpportunities` to redeploy with the new value bound.

## One-time registration (operator action)

1. Visit https://developer.usajobs.gov/
2. Click "Get API Key"
3. Register with: `frank@hexworth.com` (the contact email already documented in `_app/faq.html:618`)
4. They'll email a confirmation; click through
5. Log into the developer portal; copy the API key from the dashboard

## Set the Firebase secret (replace placeholder with real key)

Once you have the key string, replace the placeholder in Secret Manager:

```bash
cd /home/eq/ai-content/hexworth-prime
firebase functions:secrets:set USAJOBS_API_KEY
# Paste the key when prompted, press Enter
```

This stores the secret in Google Secret Manager (encrypted at rest, accessible only to functions that bind it). The CF source already binds it via `secrets: [USAJOBS_API_KEY]` in the schedule config.

## Trigger the next CF run

After setting the secret, redeploy functions to pick it up:

```bash
firebase deploy --only functions:fetchOpportunities
```

Then manually trigger the CF for an immediate test (instead of waiting up to 4h for the next cron):

```bash
# From Firebase Console: Functions → fetchOpportunities → Test the function
# Or via gcloud:
gcloud scheduler jobs run firebase-schedule-fetchOpportunities --location=us-central1
```

## Verify

After the trigger run, check Cloud Logging for the fetchOpportunities function:

```
[usajobs] (no longer "skipping source")
[fetchOpportunities] usajobs=N hn=M wwr=K upserts=...
```

Where `N` should be > 0 if the API key is valid. If N=0 but no errors, the query keywords may not match current postings; that's a content issue, not a key issue.

You can also verify directly:

```bash
curl -i -H "User-Agent: frank@hexworth.com" -H "Authorization-Key: YOUR_KEY" \
  "https://data.usajobs.gov/api/search?Keyword=cybersecurity&ResultsPerPage=1"
```

A 200 with JSON body means the key works. A 401 means the key is invalid.

## Rotation / revocation

USAJobs keys do not expire by default. If you suspect compromise:

1. Log into developer.usajobs.gov
2. Regenerate the key
3. Re-run `firebase functions:secrets:set USAJOBS_API_KEY`
4. Redeploy functions

The old key invalidates immediately on regeneration.

## Related

- `functions/fetchOpportunities.js` lines 33-40, 154-162, 169-176, 405-412 — secret binding + use
- `_docs/operations/featured-picks-rotation-runbook.md` — adjacent operations doc
- Nancy LIVE-6 round 1 review identified the missing key as the second blocker
- CLAUDE.md "Search Before Asking" rule — verified contact email via `_app/faq.html:618`
