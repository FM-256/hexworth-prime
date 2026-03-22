# White Label: TenantRouter Encapsulation Architecture

**Feature:** WL-4
**Version:** 6.0.0 IRON CURTAIN
**Date:** 2026-03-21

---

## Problem: 7 Escape Routes

Before TenantRouter, a white-label tenant user could leak back into the
Hexworth Prime experience through any of these navigation paths:

1. **AccessGuard redirect** -- unauthorized/sorting/dashboard redirects
2. **ModuleProgress navigateToDashboard()** -- "Return to Dashboard" after module completion
3. **FluxCapacitor navigateTo()** -- house navigation "Return to Dashboard" button
4. **TenantShell HTML anchors** -- `<a href="../../dashboard.html">` hardcoded in content pages
5. **Browser back button** -- after entering from tenant hub
6. **Direct URL entry** -- typing `/dashboard.html` in the address bar
7. **Sorting.html / unauthorized.html** -- pages that only exist in the Hexworth Prime flow

Each of these was a separate fix waiting to diverge. Hardcoding the tenant
hub URL in 7 places meant 7 places to break.

---

## Solution: TenantRouter as Single Source of Truth

`TenantRouter.js` is a lightweight IIFE that reads tenant context from
`sessionStorage('hexworth_tenant')` once and exposes a single API:

```js
// Instead of hardcoding:
window.location.href = '/dashboard.html';

// Use:
window.location.href = TenantRouter.getUrl('dashboard');
```

If no tenant context exists, `TenantRouter.getUrl()` returns the normal
Hexworth Prime URL. Complete no-op for direct users.

All 7 escape routes now go through TenantRouter. One function, one source
of truth, one place to fix if the hub URL format ever changes.

---

## Architecture

```
                    +-----------------------+
                    |   TenantRouter.js     |
                    |  (source of truth)    |
                    +----------+------------+
                               |
              +----------------+----------------+
              |                |                |
     +--------v----+  +-------v------+  +------v-------+
     |AccessGuard  |  |ModProgress   |  |FluxCapacitor |
     | redirect()  |  | navigate()   |  | navigateTo() |
     +-------------+  +--------------+  +--------------+
              |                |                |
              +----------------+----------------+
                               |
                    +----------v----------+
                    |  TenantShell.js     |
                    |  (link override     |
                    |   safety net)       |
                    +---------------------+
```

**TenantRouter.js** -- Reads `sessionStorage('hexworth_tenant')`, determines
the hub URL (including dashboard variant), exposes `getUrl()`, `getHubUrl()`,
`goToHub()`, `isActive()`, `getSlug()`, `getName()`.

**AccessGuard.js** -- `redirect()` checks `TenantRouter.isActive()` before
building the redirect URL. Tenant users never see sorting.html or
unauthorized.html.

**ModuleProgress.js** -- `navigateToDashboard()` checks `TenantRouter.isActive()`
before calculating the relative dashboard path.

**FluxCapacitor.js** -- `navigateTo()` intercepts `dashboard.html` navigation
and routes through TenantRouter when active.

**TenantShell.js** -- Safety net. Runs `overrideLinks()` on DOMContentLoaded
(and via MutationObserver) to rewrite any `<a href>` tags that point to
dashboard.html, sorting.html, unauthorized.html, or `/`. Also monkey-patches
`ModuleProgress._goToDashboard` as a legacy fallback.

---

## Dashboard Variant Routing

The tenant dashboard lives at `/tenant/index.html`. This file acts as a
**router**, not just a dashboard:

1. User hits `/tenant/index.html?slug=acme-corp`
2. index.html fetches tenant config from the `getTenantConfig` Cloud Function
3. Stores config in `sessionStorage('hexworth_tenant')`
4. Checks `config.branding.dashboardVariant`
5. If a variant is set (e.g., `command-center`), redirects to the variant file:
   `/tenant/dashboard-command-center.html?slug=acme-corp`
6. If no variant, renders the default SOC dashboard inline

The variant files read tenant context from sessionStorage (already set by
index.html), so they never make a second API call.

**Variant file mapping** (mirrored in TenantRouter.js):

| Variant Key      | File                              |
|------------------|-----------------------------------|
| `command-center` | `dashboard-command-center.html`   |
| `clean-ops`      | `dashboard-clean-ops.html`        |
| `tactical-hud`   | `dashboard-tactical-hud.html`     |
| `enterprise`     | `dashboard-enterprise.html`       |
| *(none)*         | `index.html` (default SOC)        |

TenantRouter builds the hub URL using the same variant map, so all
"Return to Dashboard" navigation lands on the correct variant.

---

## Auto-Loader Chain

Not every content page explicitly loads TenantRouter.js or TenantShell.js.
Instead, the three most common component scripts each contain an identical
auto-loader block at the bottom:

```
AccessGuard.js   --> auto-loads TenantRouter.js + TenantShell.js
ModuleProgress.js --> auto-loads TenantRouter.js + TenantShell.js
FirebaseAuth.js  --> auto-loads TenantRouter.js + TenantShell.js
```

**How it works:**

1. On script load, check `sessionStorage.getItem('hexworth_tenant')`
2. If tenant context exists and `TenantRouter` is undefined, inject a
   `<script src="/components/TenantRouter.js">` into `<head>`
3. Same for TenantShell.js
4. Guard flags (`window.__tenantRouterRequested`, `window.__tenantShellRequested`)
   prevent duplicate injections when multiple loaders run on the same page

This means any page that loads AccessGuard, ModuleProgress, OR FirebaseAuth
automatically gets tenant routing and branding -- no manual `<script>` tags
needed in content HTML files.

---

## Setting a Dashboard Variant

Use `tenant-admin.js` CLI (Cloud Function):

```bash
# From Firebase Functions shell or direct API call:
node tenant-admin.js set-variant acme-corp command-center
```

This updates `tenants/{slug}/branding.dashboardVariant` in Firestore.
Next time a user loads the tenant URL, they get the new variant.

Available variants: `command-center`, `clean-ops`, `tactical-hud`, `enterprise`

To reset to the default SOC dashboard, remove the variant:

```bash
node tenant-admin.js set-variant acme-corp ""
```

---

## Testing the Encapsulation

**Manual test -- verify no escape routes:**

1. Open browser, navigate to `/tenant/index.html?slug=test-tenant`
2. Open a content page (any house module, arena box, etc.)
3. Check the following all route back to the tenant hub:
   - [ ] AccessGuard unauthorized redirect
   - [ ] Module completion "Return to Dashboard" button
   - [ ] FluxCapacitor "Return to Dashboard" button
   - [ ] Any `<a href="../../dashboard.html">` links in the page
   - [ ] ModuleProgress overlay "Dashboard" link
4. Verify no page shows the Hexworth Prime dashboard, sorting quiz,
   or unauthorized page

**Console verification:**

```js
// Should return true when inside a tenant session
TenantRouter.isActive()

// Should return the tenant hub URL (with variant if configured)
TenantRouter.getUrl('dashboard')

// Should return the tenant name
TenantRouter.getName()
```

**sessionStorage check:**

```js
// View raw tenant context
JSON.parse(sessionStorage.getItem('hexworth_tenant'))
```

---

## Safety Net Pattern: TenantShell Link Override

TenantRouter handles programmatic navigation (JS redirects, `window.location`
assignments). But content HTML files contain hardcoded `<a>` tags like:

```html
<a href="../../dashboard.html">Back to Dashboard</a>
```

TenantRouter cannot intercept these -- they are plain HTML links. That is
what TenantShell's `overrideLinks()` function handles:

1. On DOMContentLoaded, scans all `<a href>` elements
2. Rewrites any that match dashboard.html, sorting.html, unauthorized.html, `/`
3. Sets `data-tenant-override="true"` to avoid double-processing
4. MutationObserver catches dynamically added links (e.g., from JS rendering)
5. Delayed re-runs at 1s and 3s catch late-loading content

This is the **safety net** layer. The primary defense is TenantRouter in the
JS navigation code. TenantShell catches anything that slips through as
raw HTML anchors.

---

## File Reference

| File | Role |
|------|------|
| `_app/components/TenantRouter.js` | Navigation source of truth |
| `_app/components/TenantShell.js` | Header bar + link override safety net |
| `_app/components/AccessGuard.js` | Tenant bypass in `require()`, TenantRouter in `redirect()` |
| `_app/components/ModuleProgress.js` | TenantRouter in `navigateToDashboard()` |
| `_app/components/FluxCapacitor.js` | TenantRouter in `navigateTo()` |
| `_app/components/FirebaseAuth.js` | Auto-loader only (no navigation logic) |
| `_app/tenant/index.html` | Dashboard router (variant redirect) |
| `_app/tenant/tenant-admin.js` | CLI for tenant configuration |
