# Archived Hex OS probes

Indexed by the QUESTION each one answered, so the next person searches for the question rather
than rebuilding the probe.

| Question it answered | File | Status |
|---|---|---|
| Does the PWA manifest parse in a real browser, and do its icons/shortcuts resolve? | `pwa-browser-verify-2026-08-31.js` | SUPERSEDED by `_tools/hexos/pwa.test.js` |
| Does the service worker actually register, and does it claim only `/hex/`? | `pwa-sw-registration-verify-2026-08-31.js` | SUPERSEDED by `_tools/hexos/pwa.test.js` |

Both are kept because they record HOW the question was first answered. Neither should be run as
a gate, and the reason is instructive: the first one served from `127.0.0.1`, which the page's
registration guard does not treat as a secure origin, so it passed 11/11 without a service
worker ever starting. It was verifying that the guard had SKIPPED registration while reporting
as though it had verified the worker.

That false-green is why `pwa.test.js` serves over `localhost`, and why it asserts on the
registration the PAGE performs instead of one the harness performs for itself. The second probe
here has the same defect in weaker form: it calls `register()` itself, so its scope assertions
describe the harness's registration and stay green even when the shipped page is mutated to ask
for a root scope.
