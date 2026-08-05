# Cold Horizon QA harnesses

Real-browser tests for `_app/houses/cloud/games/cloud-cold-horizon.html`.
All of them drive the SHIPPING code through the `?qa=1` seam (localhost only).
Nothing is mocked: a mocked API turns a suite into a restatement of my own
assumption.

| script | proves |
|---|---|
| `playthrough.js`   | full mission: approach, IR toggle, real `[F]` hold timer, all four panels, decision modal, both endings |
| `tracker-test.js`  | a win records `wins:1/losses:0` and unlocks the achievement; a wrong call records a loss and does not |
| `strand-test.js`   | NO-BRICK: stranded at zero propellant, auto-recall returns and re-services the vehicle |
| `seam-host-test.js`| QA seam is absent on a non-local hostname even with `?qa=1`, and present on loopback (control) |
| `gl-check.js`      | page renders: WebGL2 context, body visible, no page errors, non-black framebuffer |

Run any of them with `node _tools/qa/cold-horizon/<script>.js`. Exit code 0 on pass.

## Why these exist

Two defects got through checks that looked adequate:

1. The first draft carried `GameTracker`/`AchievementManager` calls but never
   loaded the scripts. A 12/12 functional playthrough passed anyway, because it
   asserted the code path was REACHED and never that the globals existed.
2. Adding the script tags was still not enough. Those components declare
   `const X = (function(){...})()` at the top level of a classic script, which
   binds in the global LEXICAL environment and NOT on `window` — so a
   `window.GameTracker` guard stays false forever with the script loaded.

`tracker-test.js` asserts the resulting COUNTERS rather than the call, which is
the only formulation that catches either bug.
