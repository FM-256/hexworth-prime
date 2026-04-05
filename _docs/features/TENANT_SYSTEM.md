# Tenant System (White Label)

**Status:** SHIPPED
**Components:** `TenantRouter.js`, `TenantShell.js`, `TenantFilter.js`, `tenant-sw.js`, `tenant-data.js`
**Location:** `_app/tenant/` (dashboards + instructor), `_app/components/Tenant*.js` (runtime), `_app/tenant-sw.js` (Service Worker), `_app/lobby.html` (join page)
**Feature codes:** WL-2 (Shell), WL-3 (Filter), WL-4 (Router + SW)
**Added:** v5.0.0, major expansion in v6.0.0 "IRON CURTAIN"
**Last reviewed:** 2026-04-05

## Purpose

The tenant system turns Hexworth Prime into a white-label platform. An institution
(college, training center, SOC team) gets a branded experience — their own dashboard,
logo, colors, course catalog, and instructor panel — without a separate deployment.
Students in a tenant context never see "Hexworth Prime" branding or the general
platform dashboard. They exist inside a sealed shell.

The design goal is **complete encapsulation**: a tenant user should be unable to
accidentally navigate into the general Hexworth Prime experience. Every link, every
"back" button, every "Dashboard" reference routes to the tenant hub.

## Architecture — Four Layers of Encapsulation

The tenant system uses four independent layers to ensure isolation. Each layer works
on its own; together they create defense-in-depth:

```
Layer 1: Service Worker (tenant-sw.js)
   Intercepts ALL HTML page fetches at the network level.
   Injects TenantRouter.js + TenantShell.js into <head>
   before the browser parses the page. Covers pages that
   don't explicitly load tenant components.

Layer 2: Shell Injector (TenantShell.js)
   Runs on page load. Injects a sticky header bar with
   tenant branding + "Return to Hub" link. Overrides
   CSS variables for brand colors. Updates page title.
   Duplicate injection prevented by __tenantShellExecuted flag.

Layer 3: Navigation Router (TenantRouter.js)
   Replaces all hardcoded navigation (dashboard, sorting,
   unauthorized, home) with tenant hub URLs. Every
   window.location.href = '/dashboard.html' becomes
   TenantRouter.getUrl('dashboard') → '/tenant/{variant}.html?slug=xxx'

Layer 4: Content Filter (TenantFilter.js)
   Controls what content is visible: which houses, hubs,
   CTF box series, and features appear. Licensing-based.
   Direct Hexworth Prime users bypass all filters (no-op).
```

**Key principle:** When no tenant context exists in sessionStorage, all four layers are
complete no-ops. Zero DOM changes, zero behavioral changes, zero visual impact for
direct Hexworth Prime users.

## Tenant Lifecycle

### 1. Tenant Creation (Admin)

Tenants are created via Cloud Functions called from the admin console:

- `adminCreateTenant` — creates `tenants/{slug}` in Firestore
- `adminUpdateTenant` — updates branding, licensing, courses
- `adminDeleteTenant` — soft-delete (sets `status: 'deleted'`)
- `adminPurgeDeletedTenants` — permanent removal of soft-deleted tenants
- `adminListTenants` / `adminGetTenant` — read operations

### 2. Student Entry (Lobby)

Students join via `/lobby.html` — a unified entry point for both courses and tournaments:

1. Student navigates to `lobby.html`
2. Signs in with Google (Firebase Auth)
3. Enters a **join code** (6-character, uppercase)
4. Backend resolves the code to a tenant slug + class
5. `sessionStorage.hexworth_tenant` is set with the full tenant config
6. Redirects to `/tenant/index.html?slug={slug}`

### 3. Tenant Loader (`/tenant/index.html`)

The loader page is a router, not a dashboard:

1. Reads `?slug=` from URL
2. Calls `getTenantConfig` Cloud Function (HTTP GET)
3. Verifies `status === 'active'`
4. Stores config in `sessionStorage.hexworth_tenant`
5. **Registers the Service Worker** (`tenant-sw.js` with scope `/`)
6. Sends `TENANT_ACTIVATE` message to SW
7. Checks `branding.dashboardVariant` — if set, redirects to the variant file
8. If no variant, renders the default dashboard inline

### 4. Dashboard Variants

9 branded dashboard experiences, each a standalone HTML file:

| Variant | File | Lines | Vibe |
|---------|------|-------|------|
| command-center | `dashboard-command-center.html` | 1,287 | SOC operations center |
| tactical-hud | `dashboard-tactical-hud.html` | 1,333 | Military heads-up display |
| enterprise | `dashboard-enterprise.html` | 1,417 | Corporate training portal |
| clean-ops | `dashboard-clean-ops.html` | 1,100 | Minimal ops dashboard |
| nightshift | `dashboard-nightshift.html` | 525 | Dark theme SOC shift |
| campus | `dashboard-campus.html` | 525 | College campus aesthetic |
| academy | `dashboard-academy.html` | 494 | Training academy |
| federal | `dashboard-federal.html` | 471 | Government/federal branding |
| minimalist | `dashboard-minimalist.html` | 439 | Stripped-down, clean UI |

All variants load `tenant-data.js` which handles Firebase Auth, student profile
fetching, assignment display, and leaderboard data. DOM updates use graceful ID
lookups — if an element doesn't exist in a particular variant, the update is silently
skipped.

### 5. Instructor Dashboard (`/tenant/instructor.html`)

A viewport-locked cockpit layout (3,947 lines) with 5 tabs:

- **Assignments** — create, edit, delete assignments per class
- **Course Progress** — per-chapter completion using course maps (`network-plus-map.js`, `python-hub-map.js`, `python-for-it-map.js`)
- **Student Progress** — individual student detail with chapter health donut
- **Roster** — class enrollment management
- **Analytics** — Chart.js dashboards (status donut, chapter progress, quiz distribution)

Pop-out overlays: Class Report, Student Detail, and Course Progress all open as
full-screen frosted-glass overlays.

## Service Worker Injection (`tenant-sw.js`)

The most architecturally interesting piece. The SW intercepts at the **network layer**:

```
Page request arrives (navigate mode)
  |
  |-- Is tenantActive? (set by TENANT_ACTIVATE message)
  |     NO → pass through unmodified
  |
  |-- Is the URL /tenant/* or /admin/*?
  |     YES → pass through (already has tenant scripts)
  |
  |-- Fetch the original page from server
  |-- Read response as text
  |-- Find <meta charset="UTF-8"> (or <head>)
  |-- Inject <script src="/components/TenantRouter.js">
  |-- Inject <script src="/components/TenantShell.js">
  |-- Return modified response to browser
```

**Why a Service Worker?** Without it, every HTML file in the platform (3,884 files)
would need manual `<script>` tags for TenantRouter and TenantShell. The SW achieves
100% coverage with zero file modifications. When the tenant session ends, the SW
unregisters itself.

**Non-HTML requests** (JS, CSS, images, API calls) pass through untouched.

## Firestore Data Model

```
tenants/{slug}
  |-- name: string
  |-- status: 'active' | 'deleted'
  |-- branding: {
  |     platformName, logo, tagline,
  |     primaryColor, secondaryColor, backgroundColor,
  |     headerColor, fontFamily, customCSS,
  |     dashboardVariant: 'command-center' | 'tactical-hud' | ...
  |   }
  |-- licensing: {
  |     contentAccess: {
  |       houses: ['eye', 'shield', ...],
  |       hubs: ['forensics', 'wireshark', ...],
  |       series: ['a', 'b'],  // CTF box series
  |       features: { trainingRange, vsMode, wiresharkHub, forensicsHub, bugHunting, allCourses, ... },
  |       courses: ['network-plus', 'cyberops', 'python-for-it', ...]
  |     }
  |   }
  |-- adminUids: [string]
  |-- classes/{classId}
  |     |-- name, joinCode, courseId, status
  |     |-- assignments/{assignmentId}
  |     |     |-- title, dueDate, type, status
  |     |-- progress/{uid}
  |           |-- completedModules, quizScores, lastActivity
  |
enrollments/{uid}
  |-- classes: [{ tenantSlug, classId, joinedAt }]  // multi-enrollment array
```

## Content Licensing

`TenantFilter.js` controls visibility based on `licensing.contentAccess`:

- **Houses** — which house index pages are accessible (empty array = all)
- **Hubs** — which standalone hubs are visible (forensics, wireshark, etc.)
- **Series** — which CTF box series appear in the arena (a, b, c, etc.)
- **Features** — boolean flags for specific capabilities (vsMode, chatbots, codeRunner)
- **Courses** — which licensed courses appear in the quick-access dashboard

The filter is **purely additive** — direct Hexworth Prime users always see everything.
`TenantFilter.isAllowed()` returns `true` when no tenant context exists.

## Storage

| Key | Storage | Purpose |
|-----|---------|---------|
| `hexworth_tenant` | sessionStorage (primary) + localStorage (fallback) | Full tenant config JSON |
| `tenant-active` | Service Worker internal state | SW injection flag |
| `__tenantShellExecuted` | window global | Prevents duplicate shell injection |

**sessionStorage as primary** means tenant context dies when the tab closes. This is
intentional — closing the browser fully exits the tenant experience. localStorage is
checked as a fallback for cross-tab resilience (e.g., opening a link in a new tab).

## Cloud Functions

| Function | Type | Purpose |
|----------|------|---------|
| `getTenantConfig` | HTTP GET | Public endpoint — loader page fetches tenant config by slug |
| `getTenantCatalog` | Callable | Returns available content catalog for a tenant |
| `createAssignment` | Callable | Instructor creates assignment in class |
| `updateAssignment` | Callable | Instructor modifies assignment |
| `deleteAssignment` | Callable | Instructor removes assignment |
| `getAssignments` | Callable | Fetch all assignments for a class |
| `submitAssignmentProgress` | Callable | Student submits progress for assignment |
| `getStudentProgress` | Callable | Instructor views per-student or per-class progress |
| `adminListTenants` | Callable | Admin lists all tenants |
| `adminGetTenant` | Callable | Admin reads single tenant |
| `adminCreateTenant` | Callable | Admin creates new tenant |
| `adminUpdateTenant` | Callable | Admin modifies tenant config |
| `adminDeleteTenant` | Callable | Soft-delete (sets status: 'deleted') |
| `adminPurgeDeletedTenants` | Callable | Permanent removal of soft-deleted tenants |

## Key Decisions

- **Service Worker for injection** — Achieves 100% page coverage without modifying
  3,884 HTML files. The alternative was adding `<script>` tags to every page, which
  would be a maintenance nightmare and create thousands of git changes.

- **sessionStorage over localStorage** — Tenant context is session-scoped. Closing
  the browser exits the tenant. This prevents a student from accidentally staying in
  a tenant context across unrelated browsing sessions. localStorage is only a fallback
  for new-tab scenarios.

- **9 standalone dashboard files** — Each variant is a complete HTML page, not a
  template. This is intentional: variants have fundamentally different layouts
  (cockpit vs minimal vs enterprise grid), not just color swaps. A single template
  with conditionals would be more complex than 9 focused files.

- **Variant redirect in loader** — `index.html` acts as a router that fetches config
  and redirects to the correct variant file. Students always enter through `index.html`
  but immediately land on their tenant's chosen dashboard. The redirect uses
  `window.location.replace()` so back-button goes to lobby, not loader.

- **Soft-delete for tenants** — `adminDeleteTenant` sets `status: 'deleted'` rather
  than removing the document. `adminPurgeDeletedTenants` permanently removes them.
  This two-phase approach prevents accidental data loss (type-to-confirm UI in admin
  console for delete, separate purge action).

- **Multi-enrollment** — Students can be in multiple classes simultaneously via the
  `enrollments/{uid}` array. The lobby shows a class picker when multiple enrollments
  exist. This supports students taking courses at multiple institutions.

- **Course maps as separate JS files** — `network-plus-map.js`, `python-hub-map.js`,
  `python-for-it-map.js` define chapter/item structures for the Course Progress tab.
  They're loaded by the instructor dashboard, not bundled into `tenant-data.js`,
  because each course has a different structure and new courses can be added without
  touching the data layer.

## Known Limitations

- **Service Worker caching** — The SW does not cache tenant scripts. If the CDN or
  Firebase Hosting is slow, there can be a brief flash of unbranded content before
  injection completes. The `__tenantShellExecuted` guard prevents double-injection
  but doesn't eliminate the timing window.

- **SW registration requires HTTPS** — Service Workers don't work on `file://` or
  plain HTTP (except localhost). Tenants on local dev servers without HTTPS fall back
  to component auto-loaders only (Layer 2-4), losing Layer 1 coverage.

- **9 dashboard variants = 9 files to maintain** — Each variant is independently
  maintained. A shared change (e.g., new stat card) must be applied to all 9 files.
  `dashboard-variants.html` (3,764 lines) serves as the variant picker/preview but
  is not a template engine.

- **No tenant-scoped Firestore security rules** — Tenant data isolation is enforced
  by Cloud Functions (which check `adminUids` and enrollment), not by Firestore
  security rules. A compromised client token with direct Firestore access could
  theoretically read other tenants' data. Server-side validation is the trust boundary.

- **sessionStorage scope** — `sessionStorage` is per-tab in most browsers. Opening
  a link in a new tab may lose tenant context unless localStorage fallback kicks in.
  The SW helps bridge this gap but only if already registered.

- **No offline tenant support** — `getTenantConfig` is an HTTP call. If the student's
  connection drops before the loader completes, they see a "Connection failed" error.
  No cached tenant config is served offline.
