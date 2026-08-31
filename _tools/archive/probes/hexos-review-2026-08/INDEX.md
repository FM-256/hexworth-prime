# Hex OS process-commands review probes — archived 2026-08-31

Indexed by **the question each one answered**, because an archive filed by filename is a
graveyard. Fourteen review rounds on `ps` / `stop` / `restart` in `_app/hex/index.html`
produced these; every one existed to settle a question that had been argued from code
structure instead of measured.

Originals remain at repo root. Nothing here was destroyed; these are copies.

## The questions, and where the answer landed

| Probe | Question it answered | Answer |
|---|---|---|
| `_chris_check_sl_present*.js` | Is `window.SandboxLauncher` actually defined on the shell page? | **No.** The script tag was never added; an edit had anchored to a line that does not exist in that file. |
| `_chris_cross_nav*.js` | Does `_activeSessions` survive navigation? | No. It is closure state; `run` navigates away, so the shell's copy is always empty. |
| `_chris_hexos_launch_tmp.js`, `_chris_hexos_test_tmp.js` | Do the process commands run at all for a student? | No. Every one answered "session manager is not available". |
| `_chris_probe_orphan_relaunch_tmp.js` | Can a watchdog timeout plus a sanctioned retry produce two boxes? | **Yes.** Destroy landed server-side, `ps` showed the lab gone, the retry relaunched, then the orphaned chain launched again. |
| `_chris_probe_slowlaunch_tmp.js` | Same, but with a slow LAUNCH instead of a slow destroy? | **Yes**, through the mirror leg. Led to `launchPending`. |
| `_chris_probe_stop_supersede_tmp.js` | Does a superseded `stop` narrate a box it no longer owns? | **Yes.** "stopped arctic, its slot is back in the pool" printed while arctic ran on a fresh session. |
| `_chris_probe_tripwire*.js` | Does the `holdProc` call-site tripwire actually fire? | Yes, exit 1 on a forged third call site. |
| `_chris_probe_unsorted_tmp.js` | Does an unsorted visitor reach the dashboard header? | Yes, and the final URL is `sorting.html`. That answered the wrong question: it says nothing about whether the pill painted first. |
| `_chris_cd_xss_*.js`, `_chris_bare_cd_probe_tmp.js` | Does `cd` escape user input, and does a bare app name dispatch safely? | Yes to both. |
| `_chris_verify_redirect*.js` | Is the unsorted redirect synchronous? | **No.** It runs on `DOMContentLoaded` and defers navigation 400ms, so the exposure is seconds, not instant. |
| `_chris_probe_outer_tmp.js` | Is the narrow-viewport failure real? | No. A puppeteer-only `outerWidth - innerWidth` artefact tripping `TripWire.js`. |
| `check_repro*.js`, `test_repro*.html`, `repro*.png` | Older, unrelated to this review; kept together rather than sorted apart. | n/a |

## Why this set exists at all

Every defect in this review chain came from a claim that was reasoned rather than measured:
tests that stubbed the object under test, a mock whose response contract was invented, a
zero-latency mock that could not express concurrency, an assertion reading a variable that was
never in scope, a deploy gate that read `tail`'s exit status, and three successive wrong claims
about paint timing. The probes are what actually settled each one.

If a future question resembles a row above, read that probe before writing a new one.
