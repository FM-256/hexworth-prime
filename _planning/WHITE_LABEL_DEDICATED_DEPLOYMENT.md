# White Label Dedicated Deployment — Enterprise Tier

## Status: SCOPED

---

## The Problem with the Current Approach

The current white label system (WL-1 through WL-7) is a **CSS overlay** on Hexworth Prime:
- Same codebase, same Firebase Hosting, same URL space
- TenantShell injects a branded header bar
- TenantRouter intercepts navigation to prevent leaks
- Service Worker injects scripts at the network layer
- AccessGuard bypasses gates for tenant users

This works, but it's fundamentally a wrapper. The underlying Hexworth Prime platform is always there — the sorting quiz, the houses, the Dark Arts gates, the full dashboard. We've built 3 layers of defense (SW + Router + Shell) to keep tenant users from seeing it. Every new page, every new feature, every new link is a potential leak.

**The CSS overlay approach is the right answer for team/academy tiers.** It's cheap to operate, instant to deploy, and shares infrastructure.

**For enterprise customers, we need something different.**

---

## The Dedicated Deployment Model

Each enterprise tenant gets their own **build** — a stripped-down version of Hexworth Prime containing ONLY their licensed content. There is no Hexworth Prime dashboard to leak into because it doesn't exist in the build.

```
┌─────────────────────────────────────────────────────────┐
│                  BUILD PIPELINE                          │
│                                                         │
│  Tenant Config (Firestore)                              │
│       ↓                                                 │
│  build-tenant.sh --slug university-x                    │
│       ↓                                                 │
│  ┌──────────────────────────────────────────┐           │
│  │  1. Read tenant config                   │           │
│  │  2. Copy licensed content only           │           │
│  │  3. Inject branding into every page      │           │
│  │  4. Generate tenant-specific dashboard   │           │
│  │  5. Bundle tenant-specific components    │           │
│  │  6. Remove all Hexworth Prime branding   │           │
│  │  7. Package as deployable artifact       │           │
│  └──────────────┬───────────────────────────┘           │
│                 ↓                                        │
│  ┌──────────────────────────────────────────┐           │
│  │  OUTPUT OPTIONS:                         │           │
│  │                                          │           │
│  │  A. Firebase Hosting (multi-site)        │           │
│  │     → university-x.hexworth.app          │           │
│  │                                          │           │
│  │  B. Docker image                         │           │
│  │     → docker pull hexworth/university-x  │           │
│  │     → runs on their infrastructure       │           │
│  │                                          │           │
│  │  C. PXE boot image                       │           │
│  │     → network boots lab machines         │           │
│  │     → nginx + content pre-installed      │           │
│  │                                          │           │
│  │  D. Static tarball                       │           │
│  │     → ship to customer, they host it     │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## What the Build Script Does

### Input
- Tenant slug (reads config from Firestore)
- Output format (firebase / docker / pxe / tarball)

### Step 1: Read Tenant Config
```bash
node build-tenant.js --slug university-x --output docker
```
Fetches from Firestore:
- Licensed content (series, houses, hubs, features)
- Branding (colors, logo, name, tagline, dashboard variant)
- Auth config (firebase, SAML, OIDC)

### Step 2: Copy Licensed Content Only
Based on `contentAccess.series`, `contentAccess.houses`, `contentAccess.hubs`, and `contentAccess.features`:

```
IF series includes 'a' → copy arena/boxes/a1-* through a20-*
IF houses includes 'shield' → copy houses/shield/
IF hubs includes 'wireshark' → copy wireshark/
IF features.vsMode → copy arena/boxes/pr7-red-vs-blue/
IF features.forensicsHub → copy forensics/
```

Everything else is excluded. No sorting quiz, no house selection, no Dark Arts gates (unless licensed).

### Step 3: Inject Branding
For every HTML file in the build:
- Replace "Hexworth Prime" with tenant's `platformName`
- Replace favicon with tenant's favicon
- Inject CSS custom properties from tenant branding
- Replace dashboard links with tenant-specific dashboard
- Set page titles to include tenant name

### Step 4: Generate Dashboard
Based on `branding.dashboardVariant`:
- Copy the selected dashboard variant as `index.html`
- Pre-configure with tenant branding (no API call needed — branding is baked in)
- Remove the tenant config fetch — everything is static

### Step 5: Bundle Components
Include only the components needed for the licensed content:
- Always: FirebaseAuth, ModuleProgress, AchievementManager, FluxCapacitor
- If arena: BoxEngine, CoOpSync, CoOpLobby
- If forensics: ForensicsEngine, ForensicsData
- If wireshark: WiresharkEngine, WiresharkData
- If VS mode: VsBridge, BlueTeam

Exclude: TenantShell, TenantRouter, TenantFilter, AccessGuard gate checks, Tourist Visa — none of these are needed because there's nothing to protect against.

### Step 6: Remove Hexworth Branding
- Remove all "Hexworth Prime" text references
- Remove the Hexworth logo
- Remove "Exit to Hexworth" buttons
- Remove the FluxCapacitor house navigation (unless multiple houses licensed)
- Remove sorting quiz entirely

### Step 7: Package

**Firebase Hosting:**
```bash
firebase hosting:sites:create university-x
firebase target:apply hosting university-x university-x
firebase deploy --only hosting:university-x
# → Live at university-x.hexworth.app
```

**Docker:**
```dockerfile
FROM nginx:alpine
COPY build/university-x/ /usr/share/nginx/html/
EXPOSE 80
```
```bash
docker build -t hexworth/university-x .
docker push hexworth/university-x
```

**PXE:**
```bash
# Copy build to neon-server PXE directory
scp -r build/university-x/ neon:/mnt/storage/pxe/http/images/university-x/
# Add to boot menu
```

**Tarball:**
```bash
tar -czf university-x-v1.0.tar.gz build/university-x/
# Ship to customer
```

---

## What the Tenant Gets

### Their Dashboard (the only entry point)
- Their logo, their colors, their name
- Only cards for licensed content
- Mission queue from their assignments
- Stats from their students' progress
- No trace of Hexworth Prime

### Their Content (nothing else exists)
- Only the houses/hubs/features they licensed
- View Source shows their brand
- No leaked paths to other content
- Back buttons go to their dashboard (hardcoded, not intercepted)

### Their Auth
- Firebase Auth configured for their domain
- Optional: SAML/OIDC SSO
- Their admin UIDs for the instructor panel

---

## Comparison: CSS Overlay vs Dedicated Build

| Aspect | CSS Overlay (Current) | Dedicated Build |
|--------|----------------------|-----------------|
| Deployment time | Instant | 5-10 minutes |
| Infrastructure | Shared Firebase Hosting | Per-tenant (Firebase multi-site, Docker, or self-hosted) |
| Content isolation | Runtime filtering | Build-time exclusion |
| Branding depth | CSS variables + header bar | Every page, every title, every favicon |
| Leak risk | Mitigated (3-layer defense) | Zero (nothing to leak to) |
| View Source | Shows "Hexworth Prime" in some places | Shows only tenant brand |
| Update propagation | Instant (same codebase) | Requires rebuild + redeploy |
| Cost to operate | Near zero | Per-tenant hosting/compute |
| Best for | Team / Academy tiers | Enterprise tier |
| Price point | $500-2K/year | $5K-25K/year |

---

## Implementation Plan

### Phase 1: Build Script (2-3 days)
- `build-tenant.js` — reads config, copies content, injects branding
- Content mapping from license config to file paths
- Branding injection (find-and-replace + CSS injection)
- Output as static directory

### Phase 2: Firebase Multi-Site (1 day)
- Automate `firebase hosting:sites:create`
- Deploy per-tenant with `firebase deploy --only hosting:tenant-name`
- Subdomain routing via Firebase Hosting

### Phase 3: Docker Packaging (1 day)
- Dockerfile template (nginx + static content)
- Build + push script
- Docker Compose for self-hosted deployments

### Phase 4: PXE Integration (1 day)
- Build script outputs to neon-server PXE directory
- Auto-generate boot menu entry
- Autoinstall preseed includes Docker + tenant container

### Phase 5: Update Pipeline (2 days)
- Webhook or cron that detects content updates
- Rebuilds affected tenant packages
- Auto-deploys to Firebase Hosting
- Notifies customers of updates

---

## Sprint Items

- WL-13: Build script — content copying + branding injection
- WL-14: Firebase multi-site deployment automation
- WL-15: Docker packaging pipeline
- WL-16: PXE integration for dedicated builds
- WL-17: Update pipeline (rebuild on content change)
- WL-18: Enterprise onboarding runbook

---

## Revenue Model

| Tier | Delivery | Price Range | What They Get |
|------|----------|-------------|---------------|
| Analyst | CSS overlay | $50/month | Single user, branded dashboard |
| Team | CSS overlay | $200/month | 25 seats, assignment API |
| Academy | CSS overlay | $500/month | 200 seats, full content, instructor panel |
| Enterprise | Dedicated build | $2K+/month | Own deployment, custom content, SLA, PXE kit |

The enterprise tier is where the PXE server becomes a differentiator:
"We ship you a pre-configured server. Your lab machines network-boot our platform. Zero IT involvement."

---

## White Label Product Tiers (Complete Picture)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ANALYST        TEAM          ACADEMY       ENTERPRISE  │
│  ────────       ────────      ────────      ────────    │
│  1 seat         25 seats      200 seats     Unlimited   │
│  CSS overlay    CSS overlay   CSS overlay   Own build   │
│  Dashboard      Dashboard     Dashboard     Custom      │
│  Arena only     + Hubs        Full content  Full + PXE  │
│  No instructor  No instructor Instructor    + SLA       │
│                               panel         + SSO       │
│                                             + Server    │
│                                                         │
│  $50/mo         $200/mo       $500/mo       $2K+/mo    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

*Scoped: 2026-03-22*
*Depends on: WL-1 through WL-7 (complete), PXE server (built)*
*Next: Build script prototype (WL-13)*
