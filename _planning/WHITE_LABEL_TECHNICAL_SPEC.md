# Hexworth Prime — White Label Technical Specification

## Architecture: One Codebase, Infinite Skins

The white label system is NOT a separate application per customer. It is a branding layer on top of the existing Hexworth Prime platform. One codebase, one Firebase deployment, one CDN. Each customer gets a tenant configuration that controls what they see and how it looks.

```
Student Browser
      |
      v
Branded Loader Page (tenant-specific URL)
      |
      v
GET /api/v1/tenant/config → { logo, colors, name, content, features }
      |
      v
Inject CSS variables + render SOC dashboard shell
      |
      v
All content served from same Firebase Hosting CDN
(filtered by tenant's licensed content list)
```

---

## 1. Tenant Configuration

### Firestore Schema: `tenants/{tenantId}`

```javascript
{
  // Identity
  tenantId: "university-x",
  name: "University X Cyber Range",
  slug: "university-x",                    // URL segment

  // Branding
  branding: {
    logo: "https://storage.googleapis.com/.../university-x-logo.webp",
    favicon: "https://storage.googleapis.com/.../university-x-favicon.ico",
    primaryColor: "#1e40af",               // Main accent
    secondaryColor: "#3b82f6",             // Secondary accent
    backgroundColor: "#0a0a0f",            // Dashboard background
    headerColor: "#0d1117",                // Header bar
    fontFamily: "Inter, system-ui",        // Optional override
    customCSS: "",                          // Optional raw CSS injection
    platformName: "University X Cyber Range",
    tagline: "Train Like You Fight",
    terminology: {                          // Optional word overrides
      "house": "department",               // e.g., "House of the Shield" → "Department of the Shield"
      "arena": "training range",
      "student": "analyst",
      "instructor": "lead"
    }
  },

  // Access Control
  licensing: {
    tier: "academy",                        // analyst | team | academy | enterprise
    contentAccess: {
      series: ["a", "b", "c"],             // Which CTF series (empty = all)
      houses: ["shield", "eye", "web"],    // Which houses (empty = all)
      hubs: ["wireshark", "forensics"],    // Which hubs (empty = all)
      features: {
        vsMode: true,                       // VS competitive matches
        chatbots: false,                    // AI chatbots per house
        bugHunting: true,                   // Dojo + Challenge of Month
        codeRunner: true                    // WASM sandboxes
      }
    },
    maxSeats: 200,                          // Enrollment limit
    expiresAt: "2027-01-15T00:00:00Z"      // License expiration
  },

  // Domain
  domain: {
    type: "subdomain",                      // "subdomain" | "custom"
    subdomain: "university-x",             // → university-x.hexworth.app
    customDomain: null,                     // → cyberrange.universityX.edu (if custom)
    sslCert: null                           // Auto-provisioned for custom domains
  },

  // Auth
  auth: {
    method: "firebase",                     // "firebase" | "saml" | "oidc"
    allowAnonymous: false,                  // Require sign-in
    allowGoogleSSO: true,                   // Google sign-in button
    samlConfig: null,                       // SAML IdP metadata (enterprise)
    oidcConfig: null                        // OIDC discovery URL (enterprise)
  },

  // Admin
  adminUids: ["uid-of-instructor-1"],      // Firebase UIDs with admin access
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
  status: "active"                          // active | suspended | trial
}
```

---

## 2. Branded Loader Page

### URL Routing

```
hexworth.app/t/{tenantSlug}/              → Branded dashboard
hexworth.app/t/{tenantSlug}/arena/        → Filtered CTF arena
hexworth.app/t/{tenantSlug}/houses/...    → House content (filtered)
university-x.hexworth.app/               → Subdomain redirect → /t/university-x/

Custom domain (CNAME):
cyberrange.universityX.edu/              → Reverse proxy → /t/university-x/
```

### Loader Logic (`_app/tenant/index.html`)

```javascript
// 1. Extract tenant slug from URL
const slug = window.location.pathname.split('/')[2] ||
             window.location.hostname.split('.')[0];

// 2. Fetch tenant config
const config = await fetch(`/api/v1/tenant/${slug}/config`).then(r => r.json());

// 3. Apply branding
document.documentElement.style.setProperty('--brand-primary', config.branding.primaryColor);
document.documentElement.style.setProperty('--brand-secondary', config.branding.secondaryColor);
document.documentElement.style.setProperty('--brand-bg', config.branding.backgroundColor);
document.getElementById('brand-logo').src = config.branding.logo;
document.title = config.branding.platformName;

// 4. Store tenant context for all subsequent pages
sessionStorage.setItem('hexworth_tenant', JSON.stringify(config));

// 5. Render the SOC dashboard
renderDashboard(config);
```

---

## 3. SOC Dashboard Shell

### Student View — "Analyst Workstation"

The dashboard is designed to feel like a SOC analyst's workstation, not a learning management system.

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]  University X Cyber Range          [User] [Logout]  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  INCOMING    │  │  ACTIVE     │  │  ANALYST    │        │
│  │  ALERTS (3)  │  │  CASES (2)  │  │  RANK: SGT  │        │
│  │  ● HIGH: 1   │  │  Box A3     │  │  Score: 2450│        │
│  │  ● MED: 2    │  │  Lab: Wire  │  │  Flags: 14  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MISSION QUEUE                                 [All] │  │
│  │──────────────────────────────────────────────────────│  │
│  │  ● HIGH  SQL Injection Lab          Due: Mar 25     │  │
│  │  ● MED   Wireshark TCP Analysis     Due: Mar 28     │  │
│  │  ● LOW   Security+ Ch3 Review       Due: Apr 1      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  INTEL BRIEFING                           [View All] │  │
│  │──────────────────────────────────────────────────────│  │
│  │  📋 Network Security Fundamentals                    │  │
│  │  📋 NIST Incident Response Framework                 │  │
│  │  📋 Kill Chain & Diamond Model                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TRAINING RANGE                                      │  │
│  │  [122 Boxes] [VS Mode] [Bug Hunting] [Wireshark]     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│─────────────────────────────────────────────────────────────│
│  SHIFT STATUS: On Duty    SESSION: 47 min    ALERTS: 3     │
└─────────────────────────────────────────────────────────────┘
```

### Instructor View — "Command Center"

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]  University X Cyber Range    [Command Center Mode]  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  CLASS: CYB-301 Fall 2026           ENROLLED: 32/40        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MISSION CONTROL                                     │  │
│  │  [+ New Assignment]  [Import Syllabus]  [Export]     │  │
│  │──────────────────────────────────────────────────────│  │
│  │  Mission          Due      Completion   Avg Score    │  │
│  │  SQL Injection    Mar 25   78%          82/100       │  │
│  │  Wireshark TCP    Mar 28   45%          --           │  │
│  │  VS Match #3      Mar 22   100%         Red: 450     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ANALYST PERFORMANCE                                 │  │
│  │  [At Risk: 4]  [Top Performers: 8]  [Inactive: 2]   │  │
│  │──────────────────────────────────────────────────────│  │
│  │  Rank  Analyst         Completion  Score  Trend      │  │
│  │  1     Chen, Sarah     94%         3200   ↑          │  │
│  │  2     Park, Kevin     89%         2950   ↑          │  │
│  │  ...                                                 │  │
│  │  31    Walsh, J.       23%         450    ↓ AT RISK  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LAUNCH       │  │ GRADE        │  │ CERT         │     │
│  │ VS SESSION   │  │ EXPORT       │  │ ALIGNMENT    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API Endpoints

### Cloud Functions (`functions/api/`)

All endpoints are Firebase Cloud Functions behind Firebase Auth.

```
/api/v1/

  ── Tenant Management (admin only) ──────────────────────
  POST   /tenant/create              Create new tenant
  GET    /tenant/{slug}/config       Get tenant branding + config
  PUT    /tenant/{slug}/config       Update tenant config
  DELETE /tenant/{slug}              Deactivate tenant

  ── Content Catalog (filtered by tenant) ────────────────
  GET    /catalog                    Licensed content for this tenant
  GET    /catalog/series/{id}        CTF series details
  GET    /catalog/houses/{id}        House content listing
  GET    /catalog/hubs/{id}          Hub content listing

  ── Assignment Management ───────────────────────────────
  POST   /assignments                Create assignment (instructor)
  GET    /assignments                List assignments for class
  PUT    /assignments/{id}           Update assignment
  DELETE /assignments/{id}           Delete assignment
  GET    /assignments/{id}/progress  Student progress on assignment

  ── Progress & Grades ───────────────────────────────────
  GET    /progress/{studentUid}      Individual student progress
  GET    /progress/class/{classId}   All students in a class
  GET    /grades/export              CSV/JSON grade export
  GET    /grades/cert-alignment      Map progress to cert objectives

  ── VS Mode Sessions ───────────────────────────────────
  POST   /vs/create                  Create VS room
  GET    /vs/{roomCode}/status       Room status + players
  POST   /vs/{roomCode}/join         Join a room

  ── Analytics ───────────────────────────────────────────
  GET    /analytics/engagement       Login frequency, session duration
  GET    /analytics/completion       Module/box completion rates
  GET    /analytics/at-risk          Students below threshold
  GET    /analytics/trends           Weekly/monthly trend data

  ── Webhooks (outbound to customer) ─────────────────────
  POST   (customer URL)              Student completed assignment
  POST   (customer URL)              Flag captured
  POST   (customer URL)              VS match completed
  POST   (customer URL)              Student at-risk alert
```

---

## 5. Content Access Filter

### How Filtering Works

Every content-serving page checks the tenant context:

```javascript
// Loaded from sessionStorage (set by loader page)
const tenant = JSON.parse(sessionStorage.getItem('hexworth_tenant'));

// Filter function used by arena, houses, hubs
function isContentAllowed(contentId, contentType) {
    if (!tenant) return true; // No tenant = Hexworth Prime direct (all access)

    const access = tenant.licensing.contentAccess;

    // Check series access for CTF boxes
    if (contentType === 'box') {
        const series = contentId.charAt(0); // a1 → 'a', c15 → 'c'
        if (access.series.length > 0 && !access.series.includes(series)) {
            return false;
        }
    }

    // Check house access
    if (contentType === 'house') {
        if (access.houses.length > 0 && !access.houses.includes(contentId)) {
            return false;
        }
    }

    // Check hub access
    if (contentType === 'hub') {
        if (access.hubs.length > 0 && !access.hubs.includes(contentId)) {
            return false;
        }
    }

    return true;
}
```

### Where Filters Are Applied

1. **Arena index** — `renderBoxes()` filters the BOXES array
2. **Dashboard** — house cards and hub cards filtered
3. **Content catalog** — API returns only licensed items
4. **Games arcade** — filtered by series/house
5. **Search** — results filtered by tenant access

---

## 6. Grade Export

### CSV Format (LMS-Compatible)

```csv
Student ID,Last Name,First Name,Email,Assignment,Type,Score,Max Score,Completion,Date Completed,Cert Objective
STU001,Chen,Sarah,s.chen@univ.edu,A1-Ancient-Ledger,CTF Box,85,100,Complete,2026-03-15,SY0-701 1.3
STU001,Chen,Sarah,s.chen@univ.edu,Wireshark TCP,Lab,90,100,Complete,2026-03-18,CS0-003 4.1
STU002,Park,Kevin,k.park@univ.edu,A1-Ancient-Ledger,CTF Box,72,100,Complete,2026-03-16,SY0-701 1.3
STU002,Park,Kevin,k.park@univ.edu,Wireshark TCP,Lab,,100,Incomplete,,CS0-003 4.1
```

### LTI Integration (Phase 2)

Canvas LTI 1.3 deep linking:
- Instructor clicks "Add External Tool" in Canvas
- Selects Hexworth content from the catalog
- Student clicks the link → launches in branded tenant context
- Grade passback via LTI AGS (Assignment and Grade Services)

---

## 7. Build Phases

### Phase 0: Foundation (Week 1-2)

| Task | What | Effort |
|------|------|--------|
| Tenant schema | Firestore document structure | 1 day |
| Tenant loader page | `_app/tenant/index.html` + CSS variable injection | 2 days |
| Content filter | `isContentAllowed()` integrated into arena, dashboard | 2 days |
| Demo tenant | "Hexworth Academy" demo with sample branding | 1 day |
| Admin CLI | `node tenant-admin.js create/update/list` | 1 day |

**Deliverable:** A working branded instance that looks different from Hexworth Prime.

### Phase 1: Instructor Tools (Week 3-4)

| Task | What | Effort |
|------|------|--------|
| Assignment API | CRUD endpoints for assignments | 3 days |
| SOC dashboard shell | Student view with mission queue, active cases | 3 days |
| Grade export | CSV export from progress data | 2 days |
| Cert alignment report | Map student progress to exam objectives | 2 days |

**Deliverable:** Instructor can create classes, assign content, export grades.

### Phase 2: Polish & Integration (Week 5-6)

| Task | What | Effort |
|------|------|--------|
| Subdomain routing | `*.hexworth.app` wildcard + tenant lookup | 2 days |
| Custom domain | CNAME support with auto-SSL | 3 days |
| LTI integration | Canvas LTI 1.3 provider | 5 days |
| SSO bridge | SAML/OIDC → Firebase Auth | 3 days |

**Deliverable:** Production-ready white label with LMS integration.

### Phase 3: Scale (Week 7+)

| Task | What | Effort |
|------|------|--------|
| Multi-tenant analytics | Cross-tenant admin dashboard | 1 week |
| Webhook system | Outbound event notifications | 3 days |
| Billing integration | Stripe subscription management | 1 week |
| Tenant self-service | Customer admin portal | 1 week |

---

## 8. Data Isolation

### Firestore Structure Per Tenant

```
tenants/{tenantId}/
  ├── config (branding, licensing, auth)
  ├── classes/{classId}/
  │   ├── roster
  │   ├── assignments/{assignmentId}
  │   └── progress/{studentUid}
  └── analytics/
      ├── engagement
      ├── completion
      └── trends

// Student progress is ALWAYS scoped to tenant
// A student at University X cannot see University Y's data
// Cross-tenant queries are blocked at the security rules level
```

### Security Rules

```javascript
match /tenants/{tenantId}/{document=**} {
    // Only users belonging to this tenant can read
    allow read: if request.auth != null &&
                   request.auth.token.tenantId == tenantId;

    // Only tenant admins can write
    allow write: if request.auth != null &&
                    request.auth.token.tenantId == tenantId &&
                    request.auth.token.tenantAdmin == true;
}
```

---

## 9. Pricing Model Implementation

### Seat Tracking

```javascript
// On student enrollment
async function enrollStudent(tenantId, studentUid) {
    const tenant = await getTenant(tenantId);
    const currentSeats = await countActiveStudents(tenantId);

    if (currentSeats >= tenant.licensing.maxSeats) {
        throw new Error('Seat limit reached. Upgrade your plan.');
    }

    // Enroll
    await addStudentToTenant(tenantId, studentUid);
}
```

### License Enforcement

```javascript
// On content access
async function checkLicense(tenantId, contentId, contentType) {
    const tenant = await getTenant(tenantId);

    // Check expiration
    if (new Date(tenant.licensing.expiresAt) < new Date()) {
        throw new Error('License expired. Contact your administrator.');
    }

    // Check content access
    if (!isContentAllowed(contentId, contentType, tenant)) {
        throw new Error('This content is not included in your plan.');
    }

    return true;
}
```

---

## 10. Migration Path

### Existing Hexworth Prime Users

The existing platform continues to work unchanged. Direct users at `hexworth-prime.web.app` are NOT tenants — they're the "free tier" / direct users. The tenant system is additive.

```
hexworth-prime.web.app           → Existing platform (unchanged)
hexworth-prime.web.app/t/{slug}  → Branded tenant instances (new)
{slug}.hexworth.app              → Subdomain tenants (new)
{custom.domain.edu}              → Custom domain tenants (new)
```

### No Breaking Changes

- All existing URLs continue to work
- All existing user data is preserved
- All existing Firestore documents are untouched
- The tenant system creates new collections alongside existing ones
- Feature flags control which pages show tenant UI

---

*Created: 2026-03-20*
*Status: Technical specification — ready for build*
*Depends on: WHITE_LABEL_STRATEGY.md (business strategy)*
