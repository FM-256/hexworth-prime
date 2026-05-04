# SYM-6 — Smoke Gate Target Expansion Proposal

> Companion to `safety-net-architecture.md` Stage 3.
> Current targets: 6. Proposes expansion candidates with rationale + latency cost.
> User picks which to land — each target adds time to every deploy.

## Current 6 targets

```
1. /index.html                                    Landing
2. /sorting.html                                  Sorting (divergent vs. housed)
3. /dashboard.html                                Dashboard (housed user)
4. /houses/web/index.html                         House of Web
5. /houses/forge/index.html                       House of Forge
6. /houses/cloud/modules/wsa/index.html           WSA Hub (last-incident blast zone)
```

Average per-target time: ~4-6 seconds (navigation + settle + assertions). Current total: ~30 seconds.

## Why expand

Two reasons to add a target:
- **Coverage gap** — a critical user flow not exercised by any current target
- **Regression prevention** — a regression slipped past the current 6 (none yet, but Phase 3 fusion adds new content surface)

Two reasons NOT to add a target:
- **Coverage redundancy** — the new target tests the same code paths as an existing one
- **Latency cost** — every deploy gets slower; smoke gate is in the critical deploy path

## Phase 3 fusion added new surface

The Stragglers fusion landed:
- 8 incubator hubs (one per house)
- 3 new curriculum hubs (databases, bash, cmmc)
- Forensics relocation (`/houses/eye/forensics/`)
- Multiple new applets and labs

None of these are smoke-tested. A render-killing bug in any of them would slip to production.

## Proposed additions

Ranked by leverage (broken target = highest student impact). Pick a subset.

### Tier 1 — high leverage (recommend all)

These cover entire houses or product surfaces with one target each. A failure at any one of them affects an entire student journey.

| # | Target | Rationale | Cost |
|---|---|---|---|
| 7 | `/houses/eye/index.html` | House index — only the cloud/web/forge houses are smoked. Eye/dark-arts/script have NO coverage. | +5s |
| 8 | `/houses/script/index.html` | Same as above; script house has high content density. | +5s |
| 9 | `/houses/dark-arts/index.html` | Same; dark-arts has unique mascot + theming code that broke on v7.1.0 ZION. | +5s |
| 10 | `/houses/eye/forensics/index.html` | Forensics relocation landed in fusion. Verifies new path works + `/forensics/` redirect chain isn't broken. | +5s |
| 11 | `/operator/index.html` | Operator dashboard (admin tool). A render bug here means the operator can't use the platform. | +5s |
| 12 | `/handler-dashboard.html` | Instructor dashboard — same logic, instructor surface. Different code path than student dashboard. | +5s |

**Tier 1 cost:** +30s deploy time; +6 targets to maintain.

### Tier 2 — medium leverage (pick 1-2)

| # | Target | Rationale | Cost |
|---|---|---|---|
| 13 | `/houses/web/incubator/index.html` | Incubator hubs are new (Phase 3). One per house — pick one as canary. | +5s |
| 14 | `/houses/script/modules/databases/index.html` | New curriculum hub, fresh content surface. | +5s |
| 15 | `/arena/index.html` | CTF arena landing — distinct from house/dashboard code paths. | +5s |
| 16 | `/hive/index.html` | Hive (community surface) — separate code. | +5s |

### Tier 3 — sample-content checks (pick 0-1)

These check sample-instance render rather than infrastructure. Lower leverage but catches content-template regressions.

| # | Target | Rationale | Cost |
|---|---|---|---|
| 17 | One sample CTF box (`/arena/boxes/<box>/index.html`) | Detect BoxEngine rendering regressions | +5s |
| 18 | One sample applet (e.g. `/houses/forge/applets/...`) | Detect applet-shell regressions | +5s |
| 19 | One sample lab (e.g. `/houses/key/labs/key-aes.lab.html`) | Detect lab-template regressions | +5s |
| 20 | One sample quiz (e.g. `/houses/web/quizzes/...`) | Detect quiz-engine regressions | +5s |

**Risk of Tier 3:** picking a specific box/applet/lab as canary means a content-only edit to THAT file could break the gate even though no infrastructure changed. Mitigate by picking a stable file (rare edits) and asserting only on shell elements (not content).

## Decision matrix

| Recommendation | Add | Total deploy delta | Rationale |
|---|---|---|---|
| **Minimal** | Tier 1 #7, #8, #9 (3 missing house indices) | +15s | Closes biggest coverage gap (3 houses with zero smoke) |
| **Recommended** | All Tier 1 (6 targets) | +30s | Closes house-index gap + adds operator/handler + verifies fusion artifact |
| **Maximal** | Tier 1 + Tier 2 (10 targets) | +50s | Adds incubator/databases/arena coverage; meaningful but each marginal |
| **All-in** | Tier 1 + Tier 2 + Tier 3 (14 targets) | +70s | Total smoke gate time grows from ~30s to ~100s; high coverage but slower |

## Implementation contract

For each added target, add one entry to `TARGETS` array in `_tools/eduscan/smoke/run.js`:

```js
{
    name: 'House of Eye',
    url: '/houses/eye/index.html',
    seedLocalStorage: { hexworth_house: 'eye' },
    assertions: [
        { type: 'selector-count', selector: '.module-card', min: 1,
          note: 'House page should render at least one module card' }
    ]
}
```

Each addition:
1. Pick the URL
2. Decide what assertion proves render success (selector-count is currently the only type)
3. Decide localStorage seeding (most need `hexworth_house: <house>` for proper render)
4. Test once locally with `node _tools/eduscan/smoke/run.js`
5. Verify pass on next deploy

## Decision points for user

1. **Pick a tier** — Minimal, Recommended, Maximal, or All-in.
2. **Tier 3 — yes/no?** Sample content as smoke target is double-edged.
3. **Selector-count assertions** sufficient, or should we add new assertion types (e.g., `wait-for-text`, `no-broken-images`)?

Once you pick a tier, I add the targets in one commit and re-run the smoke gate to verify all pass before any deploy.
