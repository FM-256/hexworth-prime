# Site Notice Banner

**TLDR:** Admin console > Operations > **Site notice** shows a bar across the top of the site, for planned maintenance or a known problem. Changes reach visitors within 5 minutes. It is not shown on quiz or exam pages, so never schedule maintenance during an exam.

## What it is

| Part | Where |
|---|---|
| The banner | `_app/components/SiteNotice.js` |
| Loaded by | `_app/components/AccessGuard.js` and `_app/components/FirebaseAuth.js` (Site Notice Auto-Loader blocks, one copy per page) |
| Its data | Firestore `site_notice/current`: `active`, `level` (`info` or `warning`), `message` (up to 280 characters), `endsAt` (ms epoch or null), `updatedAt` (ms epoch, the version) |
| Who can change it | Admins only (`firestore.rules`, `match /site_notice/{noticeId}`); anyone can read `current`, nothing else |
| Admin control | `_app/admin/console.html`, Operations panel, "Site notice" card |
| Tests | `node _tools/site-notice/site-notice.test.js` (real Chrome, Firestore mocked) and `_tools/rules-test/site-notice-rules.test.js` (emulator) |

## Using it

1. Admin console > **Operations** > **Site notice**.
2. Type the message. White-label tenant students see it too, so write "the platform", not "Hexworth".
3. Pick **Info (blue)** or **Warning (yellow)**. Optionally set **Clears itself at** (your local time).
4. **Show notice**. **Turn off** removes it.

Each visitor can dismiss it. Editing the message shows it to them again.

## What it does not do

- **It cannot reach someone whose network blocks the site.** If the page does not load, neither does the banner. On 2026-11-12, bc1's network reset TLS for `hexworth.com` while `hexworth-prime.web.app` (same server) worked: name-based filtering. Students on such a network need the `hexworth-prime.web.app` address or an allow-list request to their IT.
- **It is not shown on server-graded quiz and exam pages** (622 pages on 2026-11-12, the test recounts: any page whose inline scripts call `gradeQuiz`, the MD-100 or Network+ final functions, or `gradeExam`, or that loads a script that does, such as `QuizEngine.js`. The Python for IT hub loads `PFIProjectGrader.js`, so it is excluded too). Content pushed down mid-question could move a Submit button under a student's cursor. Students sitting an exam get no warning, so do not run maintenance during one.
- **It is not on every page.** On 2026-11-12, 4,695 of 5,385 pages loaded AccessGuard or FirebaseAuth. Most of the rest are embedded sections and missions. It never shows inside an iframe.
- **Moving top bars is best-effort.** The banner sits in normal flow at the top and scrolls away, so it never covers a sticky header (26 of 64 sampled pages have one). A full-width bar pinned at the very top with `position: absolute` or `fixed` (the landing page nav) is moved down by the banner's height, and back on dismiss. A bar a page adds later, or a script that rewrites its `top`, is not handled. Only a handful of real pages were checked by hand.

## Cost and failure behaviour

- One Firestore read per browser per 5 minutes (cached in `localStorage`); a missing document is cached too.
- Any failure (offline, blocked, bad data, a 403 before the rules deploy) shows no banner and never throws into the page. A failed read is not cached, so during an incident each page view retries once, with a 4-second timeout and no other effect.
- The read is public by design; abuse costs one read per request.

## Deploying it (order matters)

1. `_tools/eduscan/smoke/deploy.sh --only firestore:rules`. Until this is live, every read is a 403 and the banner stays off.
2. From the console, save a notice with **Turn off** (writes `active: false`). Then check the live read:
   `curl -s 'https://firestore.googleapis.com/v1/projects/hexworth-prime/databases/(default)/documents/site_notice/current?key=<web API key>'` must return 200 with `integerValue` fields (strings; the banner converts them).
3. `./deploy.sh` (hosting).
4. Turn a short test notice on, load a page, confirm the bar, turn it off.

## The runtime monitor change (same work)

The Cloud Run job `runtime-monitor` (`_tools/runtime-monitor/run.js`) checks hexworth.com every 15 minutes from Google's network. From 2026-10-13 to 11-12, **83 of its 93 failed runs were its own Chrome failing to start**, not the site. Since this change:

- Chrome start is retried up to 3 times at 40 s each (`LAUNCH_TIMEOUT_MS`, `LAUNCH_ATTEMPTS`), with `--disable-dev-shm-usage`. Budget: the job's task timeout is 300 s; 5 targets x 27 s worst case = 135 s, plus 120 s of launches, leaves about 45 s. A task Cloud Run kills writes nothing at all, which is worse than a failed run.
- When no page was checked, the alert says **"MONITOR could not run, the site was NOT checked (...)"** instead of "down:" with an empty list. The report and the Pulse history entry carry `launchAttempts` and `monitorError`.
- A monitor failure still counts as a failed run and can still page (an unmonitored site should alert); read the alert text to tell the two apart.
- Tests: `NODE_PATH=$PWD/node_modules node _tools/runtime-monitor/launch.test.js`. Deploy: `_tools/runtime-monitor/DEPLOY.md` (update the job by image digest, not `:latest`).
