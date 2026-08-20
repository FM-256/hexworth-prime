# Tournament visual QC + shareable recap — build spec

**Status: SPECIFIED, NOT BUILT.** Feasibility proven 2026-08-20; the blocker is identified and
has a known fix. Written as a build sheet so a fresh session can execute it without re-deriving
any of this.

**The idea (operator, 2026-08-20):** drive the tournament as a real user, capture every screen,
and turn the podium into a shareable recap — something that exists *after* the event, not just
during it.

## What is already proven

**Headless capture works.** bc1 runs `ghcr.io/puppeteer/puppeteer:latest` (the same image the lab
smoke gate uses, 10/10 green). A 1600×900 @2x capture of a live hexworth.com page produced a
336KB PNG on the first working run.

```
docker run --rm --network host \
  -v /tmp/shot.js:/home/pptruser/shot.js:ro -v /tmp/out:/tmp/out \
  ghcr.io/puppeteer/puppeteer:latest node shot.js
```

Two gotchas already paid for:
- `/tmp/out` must be `chmod 777` — the image runs as `pptruser`, not root, and the failure surfaces
  as an unhelpful Node stack rather than a permission message.
- Run capture on **bc1, not the deploy host**. Headless Chrome under WSL2 stalls on ~50% of runs;
  bc1 was 4/4 clean. This is why the lab smoke moved there (`smoke-lab-content-leaks-remote.sh`).

## THE BLOCKER: the arena pages are AccessGuard-gated

The proof capture of `/arena/spectator.html` returned **HTTP 200 with title
"Hexworth Prime - Welcome, Explorer"** — `AccessGuard` bounced the unauthenticated browser to the
welcome page. The screenshot is real, it is just of the wrong screen.

Note this is NOT a Firestore rules problem: `firestore.rules:1013` grants `allow read: if true` on
tournaments precisely so podium/lobby work pre-auth. The gate is the client-side `AccessGuard`
script on the page.

**A capture harness therefore needs an authenticated browser session.** Options, best first:

1. **Inject a Firebase ID token into `localStorage` before navigation** (`page.evaluateOnNewDocument`)
   using a token minted for a throwaway account. Matches how the app authenticates; no code change.
   Getting the token needs a service account with `signBlob` — the local ADC is user credentials
   and CANNOT mint one (this already blocked `verify-deliverflag-guard.js`). Resolve that first.
2. **Run the harness against a preview channel with a dev-mode build**, if `AccessGuard` honours a
   bypass there. Check before relying on it.
3. **Capture only genuinely public surfaces** and accept partial coverage. Weakest — the Panopticon
   is the whole point and it is behind the guard.

## Build sheet

**1. Seed a disposable demo tournament.** `tournaments/demo-recap-*` with 4-6 teams, 8-10
challenges across categories, and a realistic solve timeline (first bloods, a late surge, one team
that stalls). Must be deleted afterwards and the deletion verified — Mallory's audit is the
precedent for both the naming convention and the cleanup discipline.
⚠ Set `visible: true` explicitly on demo challenges: since 2026-08-20 `ctfSubmitFlag` refuses
hidden ones, so a seeded demo with the field missing-or-false will not score.

**2. Capture harness** (`_tools/qa/tournament-capture.js`), on bc1, authenticated per above.
Screens worth having: arena index, tournament-lobby (pre-join and joined), tournament-board
(challenges, a solved one, the scoreboard), **spectator.html = the Panopticon**, broadcast.html,
tournament-podium.html. Capture at 1600×900 @2x, plus a 390×844 mobile pass — the board and podium
are the two most likely to break on a phone and nobody has looked.

**3. Video.** Puppeteer has no native recorder. Two workable routes:
   - `page.screencast()` (Chrome DevTools protocol) → frames → `ffmpeg` in a container on bc1.
   - Simpler and probably better for a recap: capture a **frame per solve event** from the seeded
     timeline and stitch at 2-4 fps. A podium that assembles itself reads better than a screen
     recording of someone scrolling.

**4. The recap artifact — the actual deliverable.** A self-contained HTML page: final podium,
first bloods, the solve timeline as a chart, hardest/easiest challenge by solve count, and a
per-team summary. Publish via the Artifact tool so it gets a private URL the operator can choose
to share. This is the piece with a real audience, so it earns proper design effort.

## Do not skip

- The recap must be built from **real tournament data**, not hardcoded. A recap that cannot
  regenerate itself after the actual event is a mockup, not a tool.
- Nothing in the recap may expose a flag value, a `flagHash`, or an unrevealed challenge.
- Do not point the harness at a **real** tournament while it is running.

## Related
- `_tools/smoke-lab-content-leaks-remote.sh` — why capture runs on bc1
- `functions/verify-qual-box.js` — cleanup-and-verify discipline for disposable state
- `_app/arena/{index,tournament-lobby,tournament-board,tournament-podium,broadcast,spectator}.html`
