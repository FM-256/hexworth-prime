# White Label Build Log

## Status: Phase 1 Complete — Product Ready for Demo

---

## What's Built

### WL-1: Tenant Config Schema + Admin CLI + API (COMPLETE)

**Firestore Schema:** `tenants/{tenantId}`
- Branding: logo, colors, name, tagline, custom CSS, terminology overrides, dashboardVariant
- Licensing: tier (analyst/team/academy/enterprise), content access lists, seat limits, expiration
- Domain: subdomain or custom CNAME
- Auth: firebase, SAML, OIDC
- Admin UIDs, status, timestamps

**Admin CLI:** `functions/tenant-admin.js`
```bash
node tenant-admin.js create --slug university-x --name "University X Cyber Range" --tier academy
node tenant-admin.js update --slug university-x --primary-color "#dc2626" --dashboard-variant tactical-hud
node tenant-admin.js set-content --slug university-x --series a,b,c --houses shield,eye
node tenant-admin.js add-admin --slug university-x --uid firebase-uid-here
node tenant-admin.js list
node tenant-admin.js show --slug university-x
node tenant-admin.js deactivate --slug university-x
```

**API Endpoints:**
- `getTenantConfig` — HTTP GET, public, returns branding + licensing (5-min cache)
- `getTenantCatalog` — Firebase callable, requires auth, returns content access

---

### WL-2: Branded Loader Page (COMPLETE)

**File:** `_app/tenant/index.html`

Acts as both a router and default dashboard:
1. Fetches tenant config from API
2. Stores in sessionStorage
3. Registers Service Worker for encapsulation
4. If `dashboardVariant` is set, redirects to the variant file
5. Otherwise renders the default SOC dashboard

---

### WL-3: Content Access Filter (COMPLETE)

**File:** `_app/components/TenantFilter.js`

```javascript
TenantFilter.isAllowed('a1-ancient-ledger', 'box')    // true/false
TenantFilter.filterBoxes(BOXES)                        // filtered array
TenantFilter.hasFeature('vsMode')                      // true/false
```

---

### WL-4: SOC Dashboard — 4 Variant Skins (COMPLETE)

Four distinct, fully functional dashboard designs:

| Variant | File | Style |
|---------|------|-------|
| **Command Center** | `dashboard-command-center.html` | Bloomberg terminal, dense data, ticker, monospace |
| **Clean Ops** | `dashboard-clean-ops.html` | Minimal, card-based, breathing room, Notion/Linear |
| **Tactical HUD** | `dashboard-tactical-hud.html` | Scanlines, clip-paths, neon glow, Destiny/Warframe |
| **Enterprise Console** | `dashboard-enterprise.html` | 3-column, left nav, KPIs, Splunk/ServiceNow |

All variants:
- Fetch real tenant config from API
- Apply CSS custom property branding
- Show real student data via `tenant-data.js` (Firebase Auth + Firestore)
- Render real assignment queue from Assignment API
- Register Service Worker for encapsulation
- Load TenantRouter + TenantShell

**Set variant:** `node tenant-admin.js update --slug X --dashboard-variant tactical-hud`
**Comparison view:** `/tenant/dashboard-variants.html`

---

### WL-5: Assignment API (COMPLETE)

Six Cloud Functions in `functions/index.js`:

| Function | Auth | Purpose |
|----------|------|---------|
| `createAssignment` | Admin | Create assignment in class |
| `updateAssignment` | Admin | Update assignment fields |
| `deleteAssignment` | Admin | Delete assignment |
| `getAssignments` | Auth | List assignments (admin: all, student: active + progress) |
| `submitAssignmentProgress` | Auth | Student submits completion/score |
| `getStudentProgress` | Auth | Admin: all students, Student: own progress |

**Assignment Schema:**
```javascript
{
  title: "Complete Phantom Shell CTF",
  contentType: "box",        // box, module, quiz, lab, presentation
  contentId: "a3-phantom-shell",
  dueDate: Timestamp,
  points: 100,
  status: "active",          // active, draft, archived
  order: 1,
  createdAt: Timestamp,
  createdBy: uid
}
```

---

### WL-6: Grade Export (COMPLETE — via Instructor Panel)

CSV export built into the instructor panel. Generates downloadable CSV with student names, assignment scores, completion status, and timestamps.

---

### WL-7: Demo Tenant with Sample Data (COMPLETE)

**Seed Script:** `functions/seed-demo-tenant.js`
**Reference Doc:** `_planning/WL7_DEMO_TENANT.md`

```bash
GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js
```

Pre-populates hexworth-academy with:
- CYB-301 Fall 2026 (Dr. Martinez)
- 8 assignments (775 total points)
- 5 students: NOVA (6/8), CIPHER (4/8), GHOST (2/8), SPARK (1/8), ECHO (0/8)

---

### Tenant Data Layer (COMPLETE)

**File:** `_app/tenant/tenant-data.js` (535 lines)

Shared module loaded by all dashboard variants:
- Firebase Auth (Google sign-in, anonymous fallback)
- Real Firestore profile data (XP, level, flags, modules)
- Assignment API integration (getAssignments, getStudentProgress)
- Cross-variant DOM updates (stats, missions, leaderboard, XP bars)
- Rank calculation from XP tiers (Recruit through Director)

---

### Instructor Panel (COMPLETE)

**File:** `_app/tenant/instructor.html`

Full instructor dashboard:
- Class management (create, select, view)
- Assignment CRUD via Cloud Functions
- Student progress dashboard with completion bars
- CSV grade export
- Quick actions (create mission, class report, export, refresh)
- Firebase Auth with adminUids verification
- Tenant branding applied

---

### Tenant Encapsulation (COMPLETE)

**Architecture doc:** `_planning/WHITE_LABEL_TENANT_ROUTER.md`

Three-layer defense sealing tenant users inside the branded experience:

1. **Service Worker** (`tenant-sw.js`) — intercepts all HTML page fetches, injects TenantRouter + TenantShell into `<head>` at the network layer
2. **TenantRouter.js** — single source of truth for navigation. AccessGuard, ModuleProgress, FluxCapacitor, and content engines all call TenantRouter instead of hardcoding paths
3. **TenantShell.js** — MutationObserver rewrites `<a>` tags pointing to dashboard/sorting/unauthorized. Safety net for HTML links

AccessGuard bypasses all gates (sorting, house, dark-arts) for tenant users.

---

## What's NOT Built Yet

### WL-8: Subdomain Routing
`*.hexworth.app` wildcard DNS + Firebase Hosting rewrite.

### WL-9: Custom Domain Support
Customer CNAME + auto-SSL provisioning.

### WL-10: Canvas LTI 1.3
Deep link assignments, grade passback.

### WL-11: SSO Bridge
SAML/OIDC to Firebase Auth mapping.

### WL-12: Pitch Deck + One-Pager
Sales materials for university outreach.

---

## How to Test

### Full Demo Flow
```bash
# 1. Seed demo data (run before each demo for fresh dates)
cd functions
GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js

# 2. Set dashboard variant
GOOGLE_CLOUD_PROJECT=hexworth-prime node tenant-admin.js update \
    --slug hexworth-academy --dashboard-variant tactical-hud

# 3. Open student dashboard
# https://hexworth-prime.web.app/tenant/index.html?slug=hexworth-academy

# 4. Sign in → see real data, missions, stats

# 5. Open instructor panel
# https://hexworth-prime.web.app/tenant/instructor.html

# 6. Navigate content → tenant shell persists, no leaks
```

### Create a New Tenant
```bash
GOOGLE_CLOUD_PROJECT=hexworth-prime node tenant-admin.js create \
    --slug university-x \
    --name "University X Cyber Lab" \
    --tier academy \
    --primary-color "#dc2626" \
    --dashboard-variant enterprise
```

### Switch Dashboard Skins
```bash
# Try each variant:
node tenant-admin.js update --slug hexworth-academy --dashboard-variant command-center
node tenant-admin.js update --slug hexworth-academy --dashboard-variant clean-ops
node tenant-admin.js update --slug hexworth-academy --dashboard-variant tactical-hud
node tenant-admin.js update --slug hexworth-academy --dashboard-variant enterprise
# Or remove variant for default dashboard:
# Set dashboardVariant to null in Firestore console
```

---

## Architecture Decisions

### Why CSS Variables (Not Separate Stylesheets)?
One stylesheet, infinite skins. CSS custom properties cascade — set them on `:root` and everything downstream inherits. No build step, no per-tenant CSS files to maintain.

### Why sessionStorage (Not localStorage)?
Tenant context should not persist across tabs. If a student opens Hexworth Prime directly in a new tab, they should see the main platform — not the tenant-branded version. sessionStorage is tab-scoped, which is the correct behavior.

### Why Service Worker for Encapsulation?
Patching individual files was whack-a-mole — 5,000+ HTML files, 7 component escape routes. The SW operates at the network layer, injecting scripts into every page response before the browser parses it. Zero file modifications needed, guaranteed coverage.

### Why 4 Dashboard Variants?
Different customers want different aesthetics. A university CS department wants Enterprise Console. A competitive gaming academy wants Tactical HUD. A coding bootcamp wants Clean Ops. A SOC training center wants Command Center. One codebase, four skins, selectable per tenant.

### Why Not a Separate App Per Tenant?
Maintenance burden. One codebase = one deploy = one CDN. Content updates, bug fixes, and feature additions automatically reach all tenants. The branding is a CSS overlay, not a fork.

---

*Created: 2026-03-20*
*Last Updated: 2026-03-21*
*Phase 0: COMPLETE (WL-1, WL-2, WL-3)*
*Phase 1: COMPLETE (WL-4, WL-5, WL-6, WL-7, Encapsulation, Data Layer, Instructor Panel)*
*Next: Phase 2 (WL-8, WL-9, WL-10, WL-11, WL-12)*
