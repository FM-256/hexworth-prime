# Hexworth Observatory — Build State / Handoff (2026-06-21)

## TLDR
New consent-gated house, **Hexworth Observatory**, built through **P1 + mascot + courses + picker wiring** on branch **`observatory-house`**. Everything is on a **preview channel only — nothing in production**. Paused mid-build for a side pivot. This doc is the cold-resume reference.

**Preview:** `https://hexworth-prime--observatory-house-wj8241zc.web.app/houses/observatory/` (expires 2026-06-28; redeploy with `firebase hosting:channel:deploy observatory-house`)
**Branch:** `observatory-house` (off `master` @ `b082444a8`)

## Concept (locked decisions)
A house for **courses taught on a repeated schedule**, gated by a **research-consent form** so everyone inside is a consented cohort (enables clean tracking/heatmaps).
- **Pointer model:** courses physically stay in their topic houses; the Observatory holds **redirect cards** to them. Nothing moves, nothing duplicated.
- **Name/slug:** Hexworth Observatory / `observatory`. **Mascot:** **Polaris**, an armored polar bear (north-star theme). **Theme:** celestial indigo (#818cf8) + cyan.
- **Tracking:** self-built (data in Firestore, surfaced in our own admin console — chosen over Clarity/PostHog because the admin dashboard must live in-console and the research/IRB data should stay in-house).
- **Consent text:** the real, approved form (see below). **Classes:** admin-editable Firestore collection (fallback list for now).

## What's built (commits on `observatory-house`)
| Commit | What |
|---|---|
| `03c76f4e9` | P1 scaffold — house shell + consent gate |
| `ded602a91` | wired the real consent form text |
| `3cc95622d` | Polaris mascot (art + lore + wiring) |
| `b1476c44e` | track the hero mp4 |
| `2e22eb83c` | 9 scheduled-course cards |
| `5a0dd6b3f` | picker wiring (dashboard) |

### Files
NEW:
- `_app/houses/observatory/index.html` — the house (HouseRenderer, Polaris theme, boot gated via `ObservatoryConsent.ensureConsent(() => HouseRenderer.init(cfg))`).
- `_app/components/ObservatoryConsent.js` — consent gate + form + enrollment + download + persistence.
- `_app/assets/images/mascots/observatory-hero.webp` (poster = still v3), `observatory-hero-animated.mp4` (fal kling-v1.6 image-to-video, 960×960 5s idle loop), `observatory-icon.webp` (v2).
- `_app/assets/images/emblems/observatory.webp` (emblem = still v2).

MODIFIED:
- `_app/config/mascot-lore.js` — Polaris entry (species: Armored Polar Bear).
- `_app/components/ContentCatalog.js` — registered `observatory` in the `HOUSES` registry.
- `_app/dashboard.html` — `observatory-destination` card in the "Browse All Houses" grid (both normal + divergent render paths; navigate to `houses/observatory/`).

STAGING (not committed): `/tmp/polaris-mascot/v1..v4.webp` — the 4 mascot still options (v3 hero, v2 emblem chosen).

## Architecture / data model
- **Consent gate:** `ObservatoryConsent.ensureConsent(onGranted)` — checks for an existing consent record; if present calls `onGranted()`, else shows the full-screen form and calls `onGranted()` after a valid submit.
- **Consent record** → Firestore `observatory_consent/{uid}` (operator's copy) + localStorage mirror `observatory_consent_<uid|preview>`. Shape: `{uid, name, classId, className, formVersion, studyTitle, agreements:{understoodAndAgree:true}, signature, consentedAt, serverConsentedAt}`. `FORM_VERSION = 'cerbi-v1-2026-06-21'`.
- **Classes:** Firestore `observatory_classes` collection (`{label}` per doc), with `DEFAULT_CLASSES` fallback (`cis2350c`, `cop1034c`, `other`).
- **Download:** participant gets a self-contained HTML copy of the full form (study header + researcher signature "Frank Mora" + their name/class/signature/date).
- **Firebase:** uses `ArenaFirebase` (`/arena/firebase-init.js`) for `db`/`auth`; degrades to localStorage if unavailable (preview).
- **Mascot wiring:** `mascotVideo` set in the house config; `emblem` (observatory.webp) and `mascot` poster (observatory-hero.webp) auto-resolve from `houseId`; lore via `MascotLore.get('observatory')`.

### The consent form (source of truth)
From `~/hexworth-shared/Raw sources/PHD/research_consent_form.pdf`. Study: **"Gamification in Cybersecurity Training and CERBI Score Analysis"**, PI **Frank Mora, MCSIA**, National University, frank.mora@keiseruniversity.edu, 904-616-8333. 8 sections verbatim (Purpose, Procedures, Voluntary Participation, Risks, Benefits, Confidentiality, Data Usage, Consent).

### The 9 scheduled-course cards (all verified HTTP 200)
A+ Core 1 → `/houses/aplus-core1/` · A+ Core 2 → `/houses/aplus-core2/` · MD-100 → `/houses/forge/md-100/` · MD-101 → `/houses/forge/md-101/` · Network+ → `/houses/web/network-plus/` · WSA (CTS1328C) → `/houses/cloud/modules/wsa/` · Python for IT (COP1034C) → `/houses/code/python-for-it/` · Ethics in IT (CIS4253) → `/houses/divergent/ethics-it/` · Principles of Information Security (CIS2350C) → `/houses/shield/infosec/`.

## Verified
- Consent gate: shows → validates → submits → stores → re-entry skips (unit + live preview).
- House renders with Polaris animated hero; 9 cards render with correct hrefs (both tabs).
- Picker: `observatory-destination` card appears in dashboard "Browse All Houses" and navigates to the house.
- Full live path on preview: dashboard → Explore All → OBSERVATORY → consent → house.

## DONE since initial handoff
- **Polish:** hero now reads "Hexworth Observatory" (`customTitle` override); dropped the empty HouseProgressPanel ("Progress data unavailable" gone). The `appendChild` console error was god-mode-only (test artifact) — not student-facing; AccessGuard untouched.
- **More cards:** roster now 16 (added Projects Hub, Foundations of Ethical Hacking, CLH, Linux Mastery, Linux Administration `/houses/script/linux/`, Bug Hunting, Advanced Linux Administration).
- **P2 code (committed, branch):** `firestore.rules` has scoped `observatory_consent`/`observatory_classes`/`observatory_activity` rules (additive). `ObservatoryTracker.js` (consent-gated activity events → `observatory_activity`) built + wired into the house boot. Preview-verified: tracker + consent gate load and work.

## NOT done / remaining (resume here)
1. **Deploy the Firestore rules (GO-LIVE gate).** Blocked on the feature branch by Rule #10 — `firebase deploy --only firestore:rules` only runs from master. Until deployed, the live consent write is denied and falls back to localStorage (preview demo works; real Firestore persistence + tracking activate once rules deploy). This deploys at go-live alongside shipping the house to production from master.
3. **P3 — admin dashboard:** roster, per-class grouping, per-student activity, heatmaps, exports (in the admin console).
4. **Marketing "12 Houses" grid** (`_app/index.html`, display-only) — optional 12→13 branding call.
5. **GO-LIVE GATE:** do NOT collect real student consent until P2 rules are deployed and the house is on production. Preview is ephemeral and ruleless — review only.

## How to resume
`git checkout observatory-house` → redeploy preview if expired → continue at "remaining". Key files: the house (`_app/houses/observatory/index.html`), the gate (`_app/components/ObservatoryConsent.js`). Related: `project_security_plus_hub_merge` and the Security+ nav audit (`_docs/operations/security-plus-navigation-audit-2026-06-21.md`) — the navigation work that led here.
