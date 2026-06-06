# Lobby Phase C — scoping (NOT shipped this marathon)

**Status:** Nancy PAUSE on initial design — substantive concerns require redesign before implementation.

**Branch:** `marathon` — this is documentation only, no code change.

---

## What Phase C was supposed to do

Close the cross-tenant branding-loss gap that Phase A's preserve-when-matching pattern only partially covers. 100% of production tenants use `branding.dashboardVariant` (per Firestore audit memory `reference_dashboardvariant_100pct_production`); when a student transitions across tenants, Phase A's minimal `{slug}` JSON write drops the variant and lands them on the platform default dashboard.

Phase A's `_enterEnrolledState` comment explicitly documents this as a future enhancement:

> Future enhancement: store `tenantConfig` in the array at enrollment time (schema migration).

## Initial Phase C design

- Store `tenantConfig` (with branding) in each `hexworth_enrollments` array entry
- Add a level-1 resolution tier to `_enterEnrolledState` and the card-click handler: prefer `e.tenantConfig` over preserve-when-matching
- Keep Phase A as level-2 fallback

## Why Nancy paused

### Real concern 1 — re-enrollment regression

`_saveEnrollment` at L714 only pushes a new array entry when the classId doesn't already exist. If a student leaves a class, then later re-enrolls (same classId, potentially updated tenant config — e.g., admin changed `dashboardVariant`), the stale config is retained. Pre-Phase C, the fallback was preserve-when-matching against live storage which at least could update. Post-Phase C, the array's stale `tenantConfig` becomes level-1 priority and wins. **New regression path.**

**Fix needed:** detect slug-mismatch on re-enrollment and OVERWRITE the existing entry, not skip.

### Real concern 2 — code duplication not eliminated

The card-click handler already duplicates `_enterEnrolledState`'s 7-key storage writes verbatim. Phase C as designed extends BOTH with three-tier logic — adding maintenance debt instead of eliminating it. The cleaner refactor is:

1. Factor out the storage-writes block from `_enterEnrolledState` into a helper (`_writeActiveClassStorage(e)`)
2. Card-click handler calls the helper, then navigates (instead of calling full `_enterEnrolledState` which would `showState('state-enrolled')` first)

This eliminates duplication AND simplifies Phase C — only one place needs the three-tier resolution.

### Real concern 3 — Firestore restore students get zero benefit

Firestore docs at the lobby's restore path don't carry `tenantConfig`. Firestore restore students arrive at the lobby precisely because their localStorage is empty. With:
- `e.tenantConfig` undefined (Firestore doc shape)
- Storage empty (the restore precondition)
- Level-1 fallthrough → level-2 fallthrough → level-3 minimal `{slug}`

Phase C as proposed delivers ZERO improvement for the Firestore-restore path. This is the common case for any student who clears browser data and signs back in.

**Fix needed:** Phase D migration. Firestore enrollment docs need a `tenantConfig` field. Lobby's Firestore restore code at the restore-from-doc block populates it from a `getTenantConfig` CF or similar. Out of scope for Phase C — but Phase C's value is dramatically reduced without it.

### Real concern 4 — JSON-blob `_escAttr` round-trip not verified at browser level

Phase A R6 verified `_escAttr` + `dataset` round-trip via jsdom on scalar strings (slug, className). Phase C would put a JSON-encoded blob through the same path. JSON blobs have:
- Nested `"` characters at every property boundary
- Possible unicode escapes `\u00XX`
- `null` literal handling

jsdom's HTML entity handling has known divergences from Chrome/Firefox on edge cases. Phase A's verification doesn't cover the JSON case.

**Fix needed:** browser-level verification with realistic branding payloads from production tenants before any commit. Test in actual Chrome/Firefox (puppeteer harness), not jsdom.

## Recommended Phase C v2 design

Before any code lands:

1. **Refactor first (Phase B.5):** factor out the storage-writes block from `_enterEnrolledState` into a helper `_writeActiveClassStorage(e)`. Card-click handler calls the helper directly. This is a pure refactor, no behavior change, eliminates the duplication.

2. **Phase C proper:** add `tenantConfig` to array entries via `_saveEnrollment` + update the helper to use three-tier resolution. Only one place to maintain.

3. **Phase C re-enrollment fix:** `_saveEnrollment` updates the existing entry when slugs differ, not just append-on-missing.

4. **Phase C browser verification:** puppeteer harness running each production tenant's branding payload through `_escAttr` → innerHTML → `dataset.tenantConfig` → JSON.parse round-trip. Must pass on Chrome AND Firefox before commit.

5. **Phase D:** Firestore restore path. Out of scope for Phase C. Tracked as separate sprint item — students on Firestore-only restore continue to use Phase A fallback until then.

## What ships in this marathon

**Nothing.** Phase C is paused. The marathon branch retains Phase A preserve-when-matching as the live behavior. That covers the same-tenant restore case (the most common) correctly. Cross-tenant transitions continue to use minimal `{slug}` — same as today, no regression.

Operator can prioritize Phase C work in a future authorized session. The scoping above provides the design backbone.

## Linked

- Phase A storage-contract refactor (shipped on marathon): commit `3beea3d03`
- Phase B × button (shipped on marathon): commit `600390d1b`
- `reference_dashboardvariant_100pct_production` memory entry — production audit evidence
- Nancy R1 review captured in marathon commit history
