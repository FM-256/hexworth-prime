# White Label Build Log

## Status: Phase 0 Complete — Foundation Live

---

## What's Built

### WL-1: Tenant Config Schema + Admin CLI + API (COMPLETE)

**Firestore Schema:** `tenants/{tenantId}`
- Branding: logo, colors, name, tagline, custom CSS, terminology overrides
- Licensing: tier (analyst/team/academy/enterprise), content access lists, seat limits, expiration
- Domain: subdomain or custom CNAME
- Auth: firebase, SAML, OIDC
- Admin UIDs, status, timestamps

**Admin CLI:** `functions/tenant-admin.js`
```bash
# Create a tenant
node tenant-admin.js create --slug university-x --name "University X Cyber Range" --tier academy

# Update branding
node tenant-admin.js update --slug university-x --primary-color "#dc2626" --logo "https://..."

# Set content access
node tenant-admin.js set-content --slug university-x --series a,b,c --houses shield,eye

# Add an instructor as admin
node tenant-admin.js add-admin --slug university-x --uid firebase-uid-here

# List all tenants
node tenant-admin.js list

# Show tenant details
node tenant-admin.js show --slug university-x

# Deactivate
node tenant-admin.js deactivate --slug university-x
```

**API Endpoint:** `getTenantConfig`
- URL: `https://us-central1-hexworth-prime.cloudfunctions.net/getTenantConfig?slug={tenantSlug}`
- Method: GET (public, no auth required — loader page needs this pre-authentication)
- Returns: tenant branding, licensing tier, content access, auth config
- Caches for 5 minutes (branding doesn't change often)
- Strips internal fields (maxSeats, expiresAt, SAML/OIDC configs) from public response

**API Endpoint:** `getTenantCatalog`
- Type: Firebase callable (requires auth)
- Input: `{ tenantId: "slug" }`
- Returns: licensed content access list and feature flags
- Checks license expiration and tenant status

**Firestore Security Rules:**
- `tenants/{tenantId}` — public read (loader page), admin SDK write only
- `tenants/{tenantId}/classes/{classId}` — tenant admin create/update/delete, authenticated read
- `tenants/{tenantId}/classes/{classId}/assignments/{assignmentId}` — tenant admin write
- `tenants/{tenantId}/classes/{classId}/progress/{studentUid}` — student writes own, admin reads all

**Demo Tenant Created:**
```
Slug:     hexworth-academy
Name:     Hexworth Academy
Tier:     academy
Seats:    200
Expires:  2027-03-20
URL:      hexworth-academy.hexworth.app
Colors:   Primary #06b6d4 (cyan), Secondary #8b5cf6 (purple)
Content:  All (empty lists = unrestricted access)
```

---

### WL-2: Branded Loader Page (COMPLETE)

**File:** `_app/tenant/index.html`

**How It Works:**
1. Student opens URL: `/tenant/index.html?slug=hexworth-academy`
2. Loading spinner appears: "Loading hexworth-academy..."
3. Fetches tenant config from `getTenantConfig` API
4. Applies CSS custom properties from tenant branding
5. Sets logo, platform name, tagline
6. Renders the SOC dashboard with licensed features
7. Loading screen fades out, dashboard appears

**URL Patterns Supported:**
```
/tenant/index.html?slug=hexworth-academy     # Query param
/t/hexworth-academy/                          # Path-based (future)
hexworth-academy.hexworth.app/                # Subdomain (future, WL-8)
cyberrange.university.edu/                    # Custom domain (future, WL-9)
```

**Dashboard Layout:**
- **Header Bar** — tenant logo + name + accent gradient underline + user info
- **Welcome Section** — "Welcome, Analyst" + tagline
- **Stats Row** — Active Missions, Flags Captured, Score, Analyst Rank
- **Mission Queue** — assigned work styled as security alerts (empty state if no assignments)
- **Quick Access Grid** — cards for licensed features:
  - Training Range (always)
  - VS Mode (if vsMode feature enabled)
  - Wireshark Hub (if wiresharkHub enabled)
  - Forensics Hub (if forensicsHub enabled)
  - Bug Hunting Dojo (if bugHunting enabled)
  - All Courses (always)
- **Shift Status Bar** — "On Duty" indicator, session timer, tenant name

**Error Handling:**
- No slug provided → "No tenant specified" error message
- Tenant not found → "Tenant not found (HTTP 404)" error
- Tenant inactive → "This training environment is currently inactive"
- Network failure → "Connection failed" with error detail

**Branding Application:**
```
CSS Variable          Mapped From
--brand-primary       branding.primaryColor
--brand-secondary     branding.secondaryColor
--brand-bg            branding.backgroundColor
--brand-header        branding.headerColor
--brand-font          branding.fontFamily
```
Plus: custom CSS injection, logo display, platform name in title/header.

---

### WL-3: Content Access Filter (COMPLETE)

**File:** `_app/components/TenantFilter.js`

**Public API:**
```javascript
// Check if content is allowed for this tenant
TenantFilter.isAllowed('a1-ancient-ledger', 'box')    // → true/false
TenantFilter.isAllowed('shield', 'house')              // → true/false
TenantFilter.isAllowed('wireshark', 'hub')             // → true/false
TenantFilter.isAllowed('vsMode', 'feature')            // → true/false

// Batch filter arrays
TenantFilter.filterBoxes(BOXES)                        // → filtered array
TenantFilter.filterHouses(houseList)                   // → filtered array
TenantFilter.filterHubs(hubList)                       // → filtered array

// Feature checks
TenantFilter.hasFeature('vsMode')                      // → true/false
TenantFilter.hasFeature('chatbots')                    // → true/false

// Tenant info
TenantFilter.isActive()                                // → boolean
TenantFilter.getName()                                 // → "Hexworth Academy" or "Hexworth Prime"
TenantFilter.getBranding()                             // → branding object or null
TenantFilter.getTenant()                               // → full tenant config or null

// Apply branding to current page
TenantFilter.applyBranding()                           // → no-op if no tenant
```

**How Content Filtering Works:**
```
Content Type    Filter Logic
─────────────   ────────────────────────────────────────
box             Extract series letter (a1 → 'a'), check against series[]
house           Check house ID against houses[]
hub             Check hub ID against hubs[]
feature         Check feature flag in features{}
```

Empty arrays = unrestricted (all content allowed). This means a new tenant with no content restrictions gets everything — restrictions are opt-in.

**Integration Points (where TenantFilter needs to be wired in):**
- `_app/arena/index.html` — filter BOXES array in `renderBoxes()`
- `_app/dashboard.html` — filter house cards and hub cards
- `_app/games.html` — filter game listings
- House index pages — show/hide based on tenant access
- Hub landing pages — show/hide based on tenant access

**No Breaking Changes:**
- When no tenant is in sessionStorage (direct Hexworth Prime users), ALL functions return true / pass-through
- The filter is purely additive — it never blocks direct users
- Existing pages work unchanged until TenantFilter is explicitly integrated

---

## What's NOT Built Yet

### WL-4: SOC Dashboard — Student View (NEXT)
The current dashboard shows stats and quick access cards but needs:
- Real mission queue pulling from `tenants/{id}/classes/{id}/assignments/`
- Progress tracking connected to existing Hexworth progress system
- Active cases showing in-progress CTF boxes and labs

### WL-5: Assignment API
Cloud Functions for CRUD on assignments. Instructor creates "missions" that appear in the student's queue.

### WL-6: Grade Export
CSV export mapping student progress to cert objectives. LMS-compatible format.

### WL-7: Demo Tenant with Sample Data (COMPLETE)

**Seed Script:** `functions/seed-demo-tenant.js`
**Reference Doc:** `_planning/WL7_DEMO_TENANT.md`

Pre-populates the hexworth-academy demo tenant with:
- 1 sample class (CYB-301 Fall 2026, Dr. Martinez)
- 8 assignments spanning box/quiz/module/lab/presentation types (775 total points)
- 5 sample students (NOVA, CIPHER, GHOST, SPARK, ECHO) with varied progress
- Tenant config updated with all features enabled + demoClassId reference

Idempotent — uses set() with explicit doc IDs. Re-run before demos for fresh due dates.

```bash
cd functions
GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js
```

### WL-8: Subdomain Routing
`*.hexworth.app` wildcard DNS + Firebase Hosting rewrite.

### WL-9: Custom Domain Support
Customer CNAME + auto-SSL provisioning.

### WL-10: Canvas LTI 1.3
Deep link assignments, grade passback.

### WL-11: SSO Bridge
SAML/OIDC → Firebase Auth mapping.

### WL-12: Pitch Deck + One-Pager
Sales materials for university outreach.

---

## How to Test

### Test the Branded Dashboard
1. Open: `https://hexworth-prime.web.app/tenant/index.html?slug=hexworth-academy`
2. Should see: loading spinner → branded SOC dashboard with "Hexworth Academy" branding
3. Quick access cards should show based on licensed features

### Test the API
```bash
# Get tenant config
curl "https://us-central1-hexworth-prime.cloudfunctions.net/getTenantConfig?slug=hexworth-academy"

# Non-existent tenant
curl "https://us-central1-hexworth-prime.cloudfunctions.net/getTenantConfig?slug=does-not-exist"
# Returns: {"error":"Tenant not found"}
```

### Create a New Tenant
```bash
cd functions
GOOGLE_CLOUD_PROJECT=hexworth-prime node tenant-admin.js create \
    --slug test-university \
    --name "Test University Cyber Lab" \
    --tier team \
    --primary-color "#dc2626"

# Then test: /tenant/index.html?slug=test-university
```

### Change Branding
```bash
GOOGLE_CLOUD_PROJECT=hexworth-prime node tenant-admin.js update \
    --slug hexworth-academy \
    --primary-color "#dc2626" \
    --tagline "Defend the Digital Frontier"

# Reload the dashboard — colors and tagline should change
```

### Restrict Content
```bash
GOOGLE_CLOUD_PROJECT=hexworth-prime node tenant-admin.js set-content \
    --slug hexworth-academy \
    --series a,b \
    --houses shield,web,eye

# Dashboard quick access should still show all (content filter not yet integrated into individual pages)
```

---

## Architecture Decisions

### Why CSS Variables (Not Separate Stylesheets)?
One stylesheet, infinite skins. CSS custom properties cascade — set them on `:root` and everything downstream inherits. No build step, no per-tenant CSS files to maintain. A single `style.setProperty()` call rebrands the entire page.

### Why sessionStorage (Not localStorage)?
Tenant context should not persist across tabs. If a student opens Hexworth Prime directly in a new tab, they should see the main platform — not the tenant-branded version. sessionStorage is tab-scoped, which is the correct behavior.

### Why Public Read on Tenant Config?
The branded loader page needs the config BEFORE the user signs in (to show the right logo, colors, and sign-in options). Making it auth-gated would create a chicken-and-egg problem. The public config is filtered to exclude sensitive fields (SAML configs, seat limits, expiration dates).

### Why Not a Separate App Per Tenant?
Maintenance burden. One codebase = one deploy = one CDN. Content updates, bug fixes, and feature additions automatically reach all tenants. The branding is a CSS overlay, not a fork.

---

*Created: 2026-03-20*
*Last Updated: 2026-03-20*
*Phase 0: COMPLETE (WL-1, WL-2, WL-3)*
*Next: Phase 1 (WL-4, WL-5, WL-6, WL-7)*
