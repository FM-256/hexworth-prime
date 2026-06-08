# HubRegistry Design Proposal

**Status:** HubRegistry.js v1 exists with 19 entries (17 original + WSA + ALA added 2026-06-08). Schema is Nancy v1-reviewed (no `dashboardHref`, no `status` field — adapter functions handle routing per-consumer; YAGNI dropped `status` until beta/deprecated semantics defined). Script-tag injection into 13 consumer pages NOT YET DONE (deferred). CSP at `firebase.json` line 66 includes `script-src 'self'` so same-origin loading IS permitted — Nancy v1 concern 1 resolved. Consumer-refactor (Phase 2-3) deferred to future sprint.
**Sprint:** Task #97 follow-up to Task #96 (tenant hub eligibility)
**Created:** 2026-05-09

## The problem this solves

Adding a tenant-assignable course today requires editing **14 hardcoded locations**:

1. `_app/admin/console.html` — `courseItems` array (tenant content picker)
2. `_app/admin/console.html` — `classFormCourse` `<select>` (class creation dropdown)
3. `_app/lobby.html` — `COURSE_MAP` (master)
4. `_app/tenant/dashboard-academy.html` — `COURSE_MAP`
5. `_app/tenant/dashboard-clean-ops.html` — `COURSE_MAP`
6. `_app/tenant/dashboard-tactical-hud.html` — `COURSE_MAP`
7. `_app/tenant/dashboard-minimalist.html` — `COURSE_MAP`
8. `_app/tenant/dashboard-nightshift.html` — `COURSE_MAP`
9. `_app/tenant/dashboard-campus.html` — `COURSE_MAP`
10. `_app/tenant/dashboard-command-center.html` — `COURSE_MAP`
11. `_app/tenant/dashboard-federal.html` — `COURSE_MAP`
12. `_app/tenant/dashboard-enterprise.html` — `COURSE_MAP` + `NAV_COURSE_MAP`
13. `_app/tenant/index.html` — `COURSE_MAP`

Each location holds a slightly different shape (`{name,desc,icon,href}` vs `{title,desc,icon,href}` vs `{name,sub,icon,href}` vs `{label,icon,href}`). Adding a course is mechanical but error-prone — Tasks #96 + #98 surfaced 5 prior courses (`security-plus`, `isc2-cc`, `server-plus`, `aplus-core1/2`) that had been added to picker but missed in 10+ COURSE_MAPs, silently dropping cards on tenant dashboards.

The platform has 43 hub directories total. Operator's stated goal: all hubs should eventually be selectable. At 14 edits per hub, that's 14 × (43 − 17) = 364 hand-edits to close the gap. Untenable.

## Proposed solution: single source of truth registry

Create `_app/components/HubRegistry.js` with one entry per hub, then refactor each consumer to read from the registry instead of holding its own hardcoded copy.

### Registry shape

```js
const HUBS = [
    {
        id: 'network-plus',
        category: 'course',                    // 'course' | 'platform-hub' | 'tool'
        catalogCode: 'N10-009',                // optional: official exam/course code
        label: 'CompTIA Network+',
        sublabel: 'N10-009',                   // descriptor / catalog code, used as desc/sub
        icon: '/assets/images/icons/icon-globe.webp',
        hubHref: '/houses/web/network-plus/index.html',  // canonical hub URL
        dashboardHref: '/lobby.html',          // where dashboard cards link to (route through lobby)
        tenantAssignable: true,
        status: 'live',                        // 'live' | 'beta' | 'deprecated' | 'internal'
        sortOrder: 10                          // explicit sort within category
    },
    // ... 16 existing entries here ...
    {
        id: 'ethics-it',
        category: 'course',
        catalogCode: 'CIS4253',
        label: 'Ethics in IT',
        sublabel: 'CIS4253',
        icon: '/assets/images/icons/icon-scales.webp',
        hubHref: '/houses/divergent/ethics-it/index.html',
        dashboardHref: '/lobby.html',
        tenantAssignable: true,
        status: 'live',
        sortOrder: 130
    },
    // ... future: 23 more entries to close the all-hubs goal ...
];

const HubRegistry = {
    all: () => HUBS,
    byId: (id) => HUBS.find(h => h.id === id),
    assignable: () => HUBS.filter(h => h.tenantAssignable && h.status !== 'deprecated' && h.status !== 'internal'),
    courses: () => HUBS.filter(h => h.category === 'course' && h.tenantAssignable),
    platformHubs: () => HUBS.filter(h => h.category === 'platform-hub' && h.tenantAssignable),
    sorted: (filterFn) => HUBS.filter(filterFn || (() => true)).sort((a,b) => (a.sortOrder||999) - (b.sortOrder||999))
};

window.HubRegistry = HubRegistry;
```

### Consumer refactor pattern

**Picker (`console.html` `courseItems`):**

```js
// BEFORE: 12-entry hand-maintained array
const courseItems = [
    { value: 'network-plus', label: 'CompTIA Network+ N10-009' },
    // ... 11 more ...
];

// AFTER: derived from registry
const courseItems = HubRegistry.courses().map(h => ({
    value: h.id,
    label: h.catalogCode ? `${h.label} (${h.catalogCode})` : h.label
}));
```

**Dashboard COURSE_MAP variants (12 instances):** each uses a slightly different field shape (`{name,desc,icon,href}` vs `{title,desc,...}`). Two options:

- **Option α — adapter functions per shape:**
  ```js
  function asNameDescShape(h) { return { name: h.label, desc: h.sublabel, icon: h.icon, href: h.dashboardHref }; }
  function asTitleDescShape(h) { return { title: h.label, desc: h.sublabel, icon: h.icon, href: h.dashboardHref }; }
  // ... 5 shape variants ...
  ```
  Each dashboard imports the right adapter:
  ```js
  var COURSE_MAP = {};
  HubRegistry.courses().forEach(h => COURSE_MAP[h.id] = asNameDescShape(h));
  ```
- **Option β — normalize all 5 shapes to one:** breaking change, requires editing the JS that reads from each map. Higher refactor risk.

Recommend **Option α** — adapters are 5 small functions, dashboards continue using their existing shape, no read-side changes needed.

**`<select>` dropdowns:** simple — iterate registry, generate `<option>` elements at runtime instead of hardcoded HTML. One small DOM-build function in console.html.

## Migration path (phased, low-risk)

**Phase 1 — Registry only (no consumer changes):**
- Ship `HubRegistry.js` with all 17 current entries.
- Add to `<script>` tag in console.html, lobby.html, all tenant dashboards.
- Verify it loads without errors. No behavior change.
- Rollback safety: just delete the script tag if anything breaks.

**Phase 2 — Refactor picker (one consumer):**
- Console picker reads from registry.
- Verify visually that all 17 entries appear correctly in the picker.
- Smoke-test the form-save handler still writes correct values to Firestore.
- Rollback: revert the one Edit.

**Phase 3 — Refactor dashboards (one variant at a time):**
- Start with `dashboard-academy.html` (lowest-risk variant — simple `{name,desc}` shape).
- Verify on a preview channel. Operator visual check.
- Then minimalist, nightshift, campus, federal (same shape).
- Then clean-ops, tactical-hud, tenant/index (`{title,desc}` shape).
- Then command-center (`{title,sub}`).
- Then enterprise COURSE_MAP + NAV_COURSE_MAP (`{name,sub}` + `{label}`).
- Then lobby.

**Phase 4 — Add the 23 remaining hubs:**
- Now adding a hub is 1 entry in HubRegistry. UI updates automatically.

## Tradeoffs (pro/con)

### Pro
- 14 places → 1 place for adding new hubs
- Same data shape across consumers eliminates picker/dashboard drift bugs (the bug Task #96 surfaced for security-plus/isc2-cc/server-plus)
- Registry is a natural place for tenant-config introspection (e.g., admin tools listing all assignable courses, audits checking tenant.licensing.contentAccess.courses against registry)
- `tenantAssignable` flag explicit — makes the assignment-eligibility decision a first-class concept
- `status` flag enables "beta" course rollouts (visible only to certain tenants), "deprecated" hiding (without breaking existing tenants)
- Sets up future "course catalog" admin UI to manage all this without code edits

### Con
- Initial refactor is non-trivial — 14 places to migrate, 5 shape adapters to write
- Adds a new component dependency every dashboard must load (small — registry would be ~3KB minified)
- Bug in the registry impacts ALL consumers simultaneously (vs current bugs being per-file). Mitigation: comprehensive integration test for each consumer post-refactor
- Hub `status: 'beta'` introduces tenant-scoped visibility logic — operator must define how beta visibility resolves per tenant (out of scope for Phase 1, but the field exists for future)

## Open design questions for Nancy

1. **Sort order:** explicit `sortOrder` integer (proposed) vs alphabetical-by-label vs grouped-by-category? Existing 12 entries have no implicit order — the fact that `python-hub` is between `feh` and `python-for-it` rather than alphabetical suggests an implicit "added in this order" convention. Explicit `sortOrder` lets operator control this without reordering the array.
2. **`status` flag semantics:** does `'beta'` mean "visible to picker but with badge" or "hidden unless tenant has beta-access flag"? Phase 1 ships only `'live'` — defer beta semantics until phase 4.
3. **Where does the registry live?** Proposed: `_app/components/HubRegistry.js`. Alternative: extend `_app/components/ContentCatalog.js` (which has per-MODULE metadata). Tradeoff: reusing ContentCatalog couples hub-level and module-level concerns; separate file keeps responsibilities clean.
4. **TenantFilter.js course case:** Nancy's prior concern (#96 review) — `TenantFilter.filter()` has no `'course'` case. The HubRegistry refactor is a natural moment to add it: `filter` receives `{type: 'course', id: 'ethics-it'}` → check `tenant.licensing.contentAccess.courses.includes(id)`. This closes the access-control gap. But it's a behavior change — students with direct URLs to currently-accessible course content would start being blocked. Nancy decides scope: ship now (consistent with rest of TenantFilter) vs defer to a separate access-control sprint.

## Files to create / modify (Phase 1)

- **NEW:** `_app/components/HubRegistry.js` — registry definition + accessor methods
- **MODIFY:** `_app/admin/console.html` — `<script src="/components/HubRegistry.js">` tag (no behavior change in this phase)
- **MODIFY:** all 12 dashboard variants — `<script src="/components/HubRegistry.js">` tag (no behavior change)
- **MODIFY:** `_app/lobby.html` — `<script src="/components/HubRegistry.js">` tag (no behavior change)

That's the entire Phase 1 changeset. Phase 2-4 follow incrementally with operator visual approval at each phase.

## Risk assessment

- **Phase 1 risk:** Near zero. Registry is loaded but unused.
- **Phase 2 risk:** Low. Picker changes are admin-only — students don't see them. Operator can preview-channel test.
- **Phase 3 risk:** Medium per dashboard. Each variant has different reading code; the adapter pattern keeps changes localized but requires per-variant verification.
- **Phase 4 risk:** Low. Adding 23 entries is mechanical data work. Ship in batches of 5-10 with tenant-visual checks.

## Recommendation

Proceed with **Phase 1 only** as the next sprint. Establishes the registry foundation, lets operator verify it loads cleanly across all 13 consumer pages, and unblocks Phase 2-4 without any user-facing behavior change. Phase 1 is ~1 file create + 13 script-tag additions.

After Phase 1 is shipped + verified, schedule Phase 2 (picker refactor) as the next discrete sprint.
