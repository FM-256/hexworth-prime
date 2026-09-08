# updateStreak — the DEPLOYED copy, archived 2026-09-08 before deletion

This directory exists so that removing the orphaned `updateStreak` Cloud Function from production is
recoverable and explicable later. **Nothing here was destroyed; this is the copy taken first.**

## What is here

| File | What it is |
|---|---|
| `deployed-source.zip` | The ACTUAL artifact that was running in production, pulled from the Cloud Functions API via `generateDownloadUrl`. Verified to contain `exports.updateStreak` in its `index.js`. **`.env` was STRIPPED before committing** (see below). |
| `function-config.json` | The full deployed configuration: runtime `nodejs22`, entry point `updateStreak`, 256Mi, region `us-central1`, service account, build config, state `ACTIVE`, `updateTime 2026-08-20T06:12:23Z`. **Secret VALUES redacted; key names kept as provenance.** |

## SECRETS WERE STRIPPED FROM THIS ARCHIVE, and the near-miss is worth recording

A deployed Cloud Function artifact carries its runtime secrets, and I archived it without checking.
Two separate leaks were in the first version of this directory:

1. `function-config.json` embedded live values for `DISCORD_WEBHOOK_URL`, `DISCORD_BOT_TOKEN`,
   `DISCORD_PUBLIC_KEY`, `DISCORD_APP_ID`, `DISCORD_CLIENT_SECRET` and `HED_EXPORT_KEY` under
   `serviceConfig.environmentVariables`. **GitHub push protection blocked the push** on the bot
   token. It never reached the remote.
2. `deployed-source.zip` contained a bundled **`.env`**. That is the more dangerous of the two,
   because secret scanning does not reliably read inside a zip: the JSON token is what got caught,
   and the `.env` might not have been.

Both are removed. The lesson for anyone archiving a deployed artifact in future: **the bundle and
the config are secret-bearing by default.** Scan before committing, not after a push is rejected.

The **source** was already archived separately at
`functions/_archive/updateStreak-orphaned-2026-08-31.js` when it was removed from `functions/index.js`.
That file is the readable handler plus its removal rationale. What it did NOT capture is the deployed
artifact and its configuration, which is the half you would actually need to reconstruct what was
running. That gap is why this directory exists.

## Why the function was deleted

Removed from source on **2026-08-31 under BUG-237**: it had no caller, and it computed a streak from
`users/{uid}.lastLoginDate` while the client computes a different one from `hexworth_last_study`. Two
definitions of one fact, the dead one waiting to be wired up wrong. The source removal shipped; the
**deployed copy was never deleted**, leaving a zombie: live in Firebase, absent from the repo.

Evidence gathered before deleting (2026-09-08):

- **No caller anywhere.** Swept the whole tree, not just `_app`: `_tools/`, `functions/`,
  `firebase.json`, `deploy.sh`, the smoke deploy wrapper, all in-repo YAML. Every same-named hit is
  an unrelated LOCAL function in a game page or the client-side `ModuleProgress.updateStreak`.
- **It never wrote anything.** Read-only production aggregation: **0 of 4017 users** carry
  `lastLoginDate`, the only field this function sets. Nothing to strand.
- **It was reachable and did run.** Cloud Monitoring recorded **2 executions on 2026-09-07
  02:46–02:49 UTC**, HTTP 200, `auth: VALID`. Cloud Run logs show User-Agent **`node`** — a script,
  not a browser. Almost certainly an audit probe from an earlier session. No student traffic.
  Recorded because a grep of the source claimed "zero callers" and the invocation data disagreed:
  grep proves nothing calls it IN OUR SOURCE, not that nothing calls it at all.
- **Operational cost.** Its presence ABORTED `firebase deploy --only functions` (exists in
  production, absent from source), forcing targeted per-function deploys. That is a safety issue in
  itself: targeted deploys are how an unrelated committed change silently goes unshipped.

## What deleting it did NOT fix, and do not assume otherwise

The function could, in principle, manufacture a streak worth up to 9,125 XP (`deriveXP` pays 25/day
capped at 365) by being called once a day for a year. Deleting it buys **housekeeping and deploy
safety, not security**, because a faster path to the identical ceiling remains open and untouched:
`syncProgress` accepts a client-supplied `streak` with only a clamp
(`functions/index.js:1721`) and no legitimacy check, while `modulesCompleted`/`labsCompleted` two
lines above get full registry validation. One call reaches the cap instantly. Tracked as **taskboard
367**. Do not read this deletion as having closed the streak-forgery exposure.

## Rollback

Restore `functions/_archive/updateStreak-orphaned-2026-08-31.js` into `functions/index.js` and
redeploy that one function. The handler is self-contained and references only `onCall`, `cfOptions`,
`HttpsError`, `db` and `FieldValue`, all of which still exist identically today (verified). If a
byte-exact restoration of what was running is ever needed instead, use `deployed-source.zip` here.
