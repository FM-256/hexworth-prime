# The Rig -- consolidated sandbox hub (design, pre-build)

**Status:** DESIGN APPROVED -- Nancy PROCEED 2026-07-29 (after a PAUSE that caught the cell-sigma
exam-exposure risk and the false 'platform'-house premise; both corrected below). Awaiting
Frank's four rulings, then build under Nancy's conditions: browsable filter + cell-sigma
exclusion ship in the SAME commit as the projection (never raw-export-first); verification plan
runs before any deploy ask; house value must be one of the 13 (observatory or script, Frank's
pick); tenantAssignable:false lands now and flips only when ruling 3's numbers actually land.

**Nancy's two build-time record notes (execution details, not design flaws):**
1. The `browsable` flag must become AUDIT-CHECKABLE, not just a build-step promise: a
   hub-registry-audit (or EduScan) rule FAILS any `LAB_INFO` entry shipped with no explicit
   `browsable` key, so future entries cannot silently default through `undefined` falsiness.
   Until that rule exists, an unflagged new sandbox simply not appearing is DESIGNED fail-closed
   behavior, not a bug -- recorded here so it is not filed as one later.
2. OpenStack Stage 2 must land `openstack-cli` as `browsable: true` DELIBERATELY -- confirm at
   build time, so the "Rig inherits it automatically" proof-of-value takes the intended visible
   path, not the fail-closed invisible one.
**Named by Frank 2026-07-29** ("i like The Rig"). Prior discussion: sandbox area conversation of
2026-07-29, following OpenStack Stage 1 completion and the Stage 2 approval.

## Problem

The platform runs nine sandbox environments (`SandboxLauncher.js` `LAB_INFO`, :27-37: four DevOps
tiers, Arctic Terminal, PostgreSQL, Cell-Sigma, Linux Mastery Workbench, Linux Practice Sandbox)
plus the Arctic district world, the Observatory consent-gated showcase, and the arena boxes.
**None of it is browsable.** A student discovers a sandbox only by entering the course that embeds
its launcher. Cloud house has zero real-engine labs today; OpenStack Stage 2 adds a tenth
environment and would inherit the same invisibility.

## Ruling already made (Frank, 2026-07-29)

- **Consolidate the DIRECTORY, not the launchers.** The Rig is the front door: one page that
  lists and launches every sandbox. Launchers stay embedded in their courses untouched -- moving
  them would break in-context flows (Observatory tutorial, Linux Mastery labs).
- **No second hand-written list.** The Rig renders as a **projection from the launcher registry**
  (`LAB_INFO`), the same anti-drift doctrine as the house-shelf projections. A new sandbox = one
  `LAB_INFO` entry; The Rig picks it up with zero page edits. Hand-curated duplicates are the
  FEH disease and are prohibited here.
- **Name: The Rig.** Durable id `the-rig`.

## Shape

| Piece | Design |
|---|---|
| Registry entry | `HubRegistry.js`: id `the-rig`, category `platform-hub`, label "The Rig", sublabel "Sandbox Bay -- every live practice environment", hubHref `/rig/`, sortOrder TBD alongside other platform hubs, **`tenantAssignable: false` at launch** -- The Rig is a platform utility, not assignable course content, and the graded-vs-free-play capacity numbers (ruling 3) are unresolved; letting instructors funnel whole classes at the bc1 pool before those numbers exist would be capacity malpractice. Flipping to `true` later is a one-field change once ruling 3 lands |
| Page | `_app/rig/index.html`, `AccessGuard.require('sorted')` (same gate as every other platform hub -- the exam-exposure risk is solved by the browsable filter below, not by a stricter page gate), house-neutral styling, cover cartridge art `the-rig.webp` (fal, deploy gate 2.5 parity) |
| Shelf 1: Live Sandboxes | Rendered from `LAB_INFO` at runtime through a **`browsable` opt-in filter**: `SandboxLauncher.js` exports a read-only accessor that returns ONLY entries flagged `browsable: true`. **FAIL-CLOSED by design** -- an entry someone forgets to flag simply does not appear (a visible, benign miss), whereas a fail-open default would advertise course-internal environments by accident (a harmful one). **`cell-sigma` is the named first exclusion**: it is the CTS4321C practical FINAL EXAM container, whose exam scaffolding (stage panels, flag capture, grading) lives in `ala-final.html`, not the launcher -- a bare Rig launch card would hand any sorted student an ungraded shell into final-exam infrastructure and burn one of their 2 container slots. The flag lives ON the single source of truth, so this is a per-entry attribute, not a second hand-curated list. During build, every current entry gets a deliberate per-entry browsable ruling (the DevOps tiers/db-sql/linux-sandbox/arctic look like legitimate free-play; nothing is flagged by default). Each card = name, tier icon, launch via the existing `SandboxLauncher.launch(labId)` path -- no new launch plumbing |
| Shelf 2: Arena (pending ruling 1) | Labeled "Arena Boxes -- graded challenges", LINKS to the arena; the arena engine is not embedded |
| Capacity strip | Static honest limits, LIVE-VERIFIED against the running bc1 lab-manager container env 2026-07-29 (Chris caught the earlier "~30" as a stale-memory digit; actual `MAX_TOTAL_CONTAINERS=40`, `MAX_CONTAINERS_PER_USER=2`, `MAX_LIFETIME_MINUTES=120`): 2 containers/student, 120 min lifetime, 40 concurrent platform-wide, graded work has priority. Live-availability display deferred (lab-manager API exposes no public count today; do not fake one) |
| Catalog + Explore All | CORRECTED BY MEASUREMENT (build-time): "follows automatically" was WRONG for catalog. `catalog.html:121` filters `tenantAssignable !== false` -- the field does double duty as instructor-assignability AND public-catalog visibility. Under Frank's confirmed `tenantAssignable: false`, The Rig is **absent from /catalog.html by existing semantics** until the capacity ruling flips the field (or a separate catalog-visibility field is ruled into existence -- Frank's call, not taken unilaterally). Reachability today: Observatory Courses shelf (verified, position after Projects Hub) + direct /rig/. Explore All's hub shelf is the curated `EXPLORE_HUBS` id list (HouseRenderer.js -- count verified 9 at build time; Chris caught the earlier "8" as an unmeasured digit); `the-rig` is not in it (future curation decision -- adding it is a one-id append). Catalog dynamic-hub gap (#243) unrelated: the-rig is STATIC |

## Explicit non-goals

- Not moving or rewriting any existing launcher embed.
- Not embedding the arena engine or Arctic world; they are linked, not hosted.
- Not the OpenStack lab build itself -- that is OpenStack Stage 2 (approved, runs parallel);
  when Stage 2 adds `openstack-cli` to `LAB_INFO`, The Rig inherits it automatically -- that
  inheritance is the design's proof of value.
- No new Firestore reads. The Rig is fully static + LAB_INFO; nothing dynamic on page load.

## Open rulings for Frank (recommendations attached)

1. **Arena boxes in or out?** Rec: IN, as the clearly-labeled second shelf linking out.
2. **Which of the 13 real houses is The Rig's home?** CORRECTION (Nancy, design review): an
   earlier draft proposed a `house: 'platform'` pseudo-value on the theory that the houseless-hub
   fork was still open. That premise was FALSE when checked -- all 13 existing `platform-hub`
   entries already carry one of the 13 real houses (even the explicitly cross-house `projects`
   hub adopted `observatory`), and the audit gate's comment states Frank's rule outright: "a hub
   cannot enter the registry without a home." No backfill is needed and the whitelist is not to
   be widened. Rec: **`house: 'observatory'`**, on the `projects` precedent (the settled home for
   cross-house destinations) plus the strongest content affinity -- Observatory already hosts the
   platform's only sandbox showcase (the Linux Practice Sandbox panel). Alternative if Frank
   prefers a skills-house identity: `script`. Either way, one of the 13, gate untouched.
3. **Capacity contention numbers.** The open graded-vs-free-play contention item (bc1 pool)
   predates this; a front door funnels more launches at the same pool. Rec: settle explicit
   numbers (reserved graded slots vs free-play ceiling) as part of this build, not after.

## Verification plan (before any deploy ask)

Render harness on the real page: every **`browsable: true`** id appears exactly once AND every
excluded id appears ZERO times -- `cell-sigma` asserted absent by name, plus a fail-closed probe
(add a temporary unflagged fixture entry, assert it does NOT render, remove it). Launch
click-through on one tier reaches the existing SandboxLauncher modal; registry parity + cover
gates pass; EduScan clean; per-page uniqueness in Explore All/catalog (no double-listing of
the-rig). Live verify post-deploy incl. one real container launch and teardown.
