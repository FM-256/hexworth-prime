# Shallow course-tree regeneration — 2026-08-14 — ARCHIVED, NOT COMMITTED

`node _tools/eduscan/cli.js --tree --all` was re-run to refresh the hub trees. The result is
STRICTLY LESS INFORMATIVE than the committed trees (generated 2026-07-27), so it was archived
here and the committed data restored rather than overwritten.

For `houses/forge/intro-computers/index.html`:

| | committed 2026-07-27 | regenerated 2026-08-14 |
|---|---|---|
| nodes | 600 | 31 |
| max depth reached | 5 | 2 |
| ok | 234 | 5 |
| link types followed | href, prev, course-home, returnUrl, next | href only |

Platform-wide the headline dropped from 109 broken to 44 — that is the crawl SEEING LESS, not
links being fixed. Reproduced on a single hub (`--tree <path>`), so it is not a `--all` artifact.

The extraction code for prev/course-home/returnUrl/next still exists (tree-mapper.js:325-345).
Suspect `4f378156a eduscan: decouple app-root assets from the scan root` (2026-08-04), which the
constructor comment says added and then removed an appRoot field, warning: "If --tree ever needs
to run scoped, migrate all 18 relative-path sites together."

Kept because a degraded measurement is still evidence of the regression. Do not restore these
over _app/data/course-trees until the mapper is fixed and produces trees at least as deep.
