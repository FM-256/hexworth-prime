# announceAchievement + announceMilestone: deployed config, archived before deletion

Captured 2026-09-08 immediately before both were deleted from production. **Nothing was destroyed;
this is the copy taken first.** The handler SOURCE is archived separately at
`functions/_archive/discord-announce-callables-retired-2026-09-08.js`, with the full reasoning.

## Secrets were stripped, and that is not optional

Each deployed config embedded **six live secret values** under
`serviceConfig.environmentVariables` (`DISCORD_WEBHOOK_URL`, `DISCORD_BOT_TOKEN`,
`DISCORD_PUBLIC_KEY`, `DISCORD_APP_ID`, `DISCORD_CLIENT_SECRET`, `HED_EXPORT_KEY`). All twelve were
redacted **before** these files went near git, and the result was scanned for token-shaped strings.

Earlier the same day, the `updateStreak` archive was committed without that step and GitHub push
protection rejected the push on a live bot token; a bundled `.env` inside the artifact zip was also
present and would very likely NOT have been caught, since scanning does not reliably read inside an
archive. **A deployed Cloud Function artifact and its config are secret-bearing by default. Source
archives are not.** Scan before committing, not after a push is rejected.

## Why they were deleted

Both posted client-supplied free text to the public Discord announcements channel with no
verification the thing announced had ever been earned. Evidence gathered before acting:

- **0 invocations in 30 days**, both functions (Cloud Monitoring).
- **0 callers** anywhere in the repo.
- **0 Firestore writes** in either handler: read-only plus a Discord POST, so no state to strand.
- **0 linked Discord accounts** and **0 users opted in** to `milestoneAnnouncements`, the flag both
  are gated on. Deleting them could have silently killed a feature people had opted into. Nobody had.
- No scheduler, bot command, or config referenced either.

Retired rather than hardened, matching the `updateStreak` precedent (BUG-237b) for the identical
shape. `announceMilestone` cannot be proof-gated even in principle: it is built around quiz and
course CLAIMS, not badge PROOF.

## Rollback

Restore the handlers from the source archive into `functions/index.js` and redeploy. Both reference
only `onCall`, `cfOptions`, `HttpsError`, `db`, `fetch`, `DISCORD_BOT_TOKEN` and
`ANNOUNCEMENTS_CHANNEL`, all of which still exist. Restoring re-opens the hole above; harden first.

Taskboard 369 and 371.
