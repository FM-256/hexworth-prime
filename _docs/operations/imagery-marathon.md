# Imagery Upgrade Marathon

**Goal:** Replace the platform's "silly PNGs" (generic tiny icons, garbled-text AI badges, the DDOS orb) with premium, consistent, fal.ai-generated art — matching the quality bar set by the arcade cartridges and the landing-page cartridge cards.

**Started:** 2026-07-19 · **Operator:** Frank · **Status:** LEG 1 COMPLETE (front-of-house + brand) · QC in progress

> **This is a multi-leg upgrade.** Leg 1 = the prominent-imagery layer every visitor/prospect/student-landing surface sees (front-of-house pages + the shared brand mark + shared flux button). Leg 1 is shipped; the QC log below is its verification. Further legs (shared functional-glyph library, deep content pages) are a categorically different, higher-risk effort — see "Legs of the complete upgrade" and the operator decision at the bottom. Do NOT treat the remaining legs as more one-page missions; they need their own scoped project.

---

## Legs of the complete upgrade

- **Leg 1 — Front-of-house + brand (DONE, this leg):** Landing, About, FAQ, Product-info, Press, Vision, Products, Research, Partners + the shared brand favicon/logo + the shared Flux Capacitor button. Every page a visitor or prospect first lands on, plus the sitewide brand mark. All bespoke per-page art. SHIPPED + QC'd (see QC log).
- **Leg 2 — Shared functional-glyph library (PARKED, operator decision 2026-07-19):** The ~157 small `icon-*.webp` glyphs used 2,600+ times platform-wide (dashboard, 12 house hubs, deep content). Every remaining "icon-heavy" page draws from this one shared set; there are NO more per-page bespoke targets. Upgrading it = a shared-library refresh: high leverage but platform-wide breakage risk (one changed aspect/padding on e.g. `icon-target` touches 411 pages — the "shared swap broke the admin console" failure class). Payoff is a cleaner/consistent glyph set, NOT cinematic badges (cinematic art doesn't belong at 16px). **Operator drew the line at Leg 1.** If pursued later, run it as its own risk-managed project WITH a visual-regression harness — not as marathon page-missions.
- **Leg 3+ — deeper content pages (future):** Presentations, labs, reviews. Also shared-library-dependent; folds into the Leg 2 decision.

---

## QC log

### Leg 1 verification — 2026-07-19
**Mechanical audit (deterministic, complete):**
- All 20 Leg-1 assets serve LIVE 200 (2 icons `flux-capacitor.webp` + `hexworth-mark.webp`; 3 `hero/hero-*.webp`; 7 `sections/about-*.webp`; 8 `sections/faq-*.webp`).
- 0 broken image refs on touched pages (index, about, faq, product-info, FluxCapacitor.js).
- Flux button: 0 leftover green literals (`rgba(57,255,20`/`39ff14`), 0 orb refs, uses `flux-capacitor.webp`.
- About + FAQ: `.section-icon img` sizing rule present; all 15 emblems wired (7 + 8).
- Product-info: 9 achievement-badge feature images present.
- index.html: 3 hero images + CTA art wired; no orb.
- About: 0 leftover emoji entities (the 3 swapped ones gone).
- **Platform-wide: 0 non-archive pages use the DDOS orb (`icon-explosion.webp`) as favicon or nav-brand logo.** The ~196 SEMANTIC "explosion" content-icon uses are intentionally retained.
- No em-dash/emoji violations INTRODUCED by imagery commits (pre-existing `&#10003;` checkmarks + copy em-dashes on faq/index/product-info are out of imagery scope; flagged for a separate copy pass if desired).

**Per-mission Chris passes (at each deploy):** M0 flux (0/266 green frames), Landing (cartridge/hero/z-index fixes), M1 About, M3 FAQ, product-info badges, MB1 brand mark (byte-exact diff, 200/webp, 28px legible, 196 semantic uses intact).

**Consolidated live render sweep (desktop + mobile) — Chris PASS (2026-07-19):** All 6 shipped checkpoints render correctly on live `hexworth.com` at 1440x900 + 390x844 (fresh Puppeteer renders/screenshots/DOM, not assumed):
- Brand mark: `.nav-brand img` 128px→28x28, favicon same file, clean single hexagon at 4x zoom, nav intact both viewports.
- Landing: 3 hero images `complete:true` 768px; CTA cards `opacity:1` at every 300ms sample 0-3000ms (stuck-invisible bug does NOT reproduce); mobile subhead not occluded (`elementFromPoint` returns the `<p>`, not the bg div); real mobile horizontal overflow = 0 (the 414-vs-390 `documentElement.scrollWidth` is decorative full-bleed under `body{overflow-x:hidden}`, `body.scrollWidth===390`, forced scroll gives `scrollX===0`).
- About: 7 emblems, FAQ: 8 emblems — all `complete:true` 96px→30px in purple chips, `overflowPx:0` both viewports.
- Product-info: 9 badges load 512px→78x78, semantically matched, `overflowPx:0`.
- Flux button: verified on `houses/shield/index.html` (NOT about/faq — those legitimately don't load `FluxCapacitor.js`; it was scoped out of content pages in QC-39 `f0f1a4828`/`a8712a434`/`c504a9682`). boxShadow sampled 8x across a full pulse = `rgba(180-198, 92-100, 255)` throughout, **0 green frames**, border `rgb(198,92,255)`, icon `flux-capacitor.webp` 128px.

**Leg 1 QC verdict: PASS. No open issues on the completed work.**

### Discoveries + spot fixes
- **`houses/shield/index.html` — 11 live 404s → FIXED 2026-07-19** (commit `f08a1c760`, live-verified 11/11 serve 200). `/assets/images/categories/{infosec,risk,ms-security,shield,sc-900,sc-200,network,governance,cse,pis,career}.webp`. Root cause: `HouseRenderer.js:1618` builds category tiles at runtime from `ContentCatalog.getHouseModules('shield')` IDs; 11 IDs had no tile file (an `onerror` fallback masked the 404s in the UI). Fix: generated 11 neon-cyberpunk category emblems (256x256, matching the `categories/*.webp` family), purely additive — no code or existing asset touched. Chris PASS: runtime IDs match filenames exactly, 0 category 404s (was 11), 0 regression on the 10 working tiles. Flagged by Chris during the Leg 1 live sweep, fixed on operator request.
- **House-hub category 404 sweep — DONE 2026-07-19** (10 elemental hubs: ai, cloud, code, dark-arts, divergent, eye, forge, matrix, script, web). Live render audit found ~61 missing category tiles. Fixed in two parts:
  1. **Root-cause code fix** (commit `13dfba8c2`, deployed + live): `ContentDiscovery.js` filter buttons rebuilt tile paths from `cat.id`, ignoring the author-set `cat.icon`. Now uses `cat.icon`'s src (keeps 18px styling + folder fallback). Killed the filter-button 404 class permanently, all houses (e.g. `aws-services`, `forensics-basics`, `bios-boot`, `tutorials`). Nancy-recommended; Chris before/after PASS.
  2. **Tile backfill** (57 residual module-tile 404s): 33 unique new neon emblems + 15 aliases-of-existing tiles (python-\*→python, adv-linux→linux-admin, ala→linux-administration, ccna→networking, etc.) + 2 new consolidation pairs (digital-forensics==forensics, eth==ethics-it) = **52 additive tiles**. Purely additive; no code/existing-asset changed. **5 generic IDs intentionally skipped** (building, exams, foundations, missions, safety) — left on fallback icon. Chris PASS: all 52 serve 200, all 10 hubs' 404s reduced to only those 5 generics, tiles legible.
  - Nancy corrections applied: `armory`→bespoke code-arsenal tile (NOT offensive-tools; it's 160 Code programming modules), `ccna`→networking (matches existing `PATH_CATEGORY_MAP`), `comptia-aplus`→its own A+ tile (not collapsed to Core 1).

### Follow-ups (logged, not done)
- **DATA BUG — `netplus` (92) vs `network-plus` (37) → FIXED 2026-07-19.** Same CompTIA Network+ (N10-009) content in the `web` house authored under two `category` spellings. Normalized all 92 `category: 'netplus'` → `category: 'network-plus'` in `ContentCatalog.js` (canonical per `HubRegistry.js:95` `id: 'network-plus'` + the `network-plus/` hub dir). Category field ONLY — module IDs (`web-ne-01`, `web-netplus-final-practice`), hrefs, localStorage progress keys, and Firestore quiz-key IDs left untouched (load-bearing, independent of display category). Now one category group of 129. `netplus.webp` tile is now an orphaned alias (harmless, kept per never-destroy). Chris PASS.
- **Forensics + Signal house gaps → FIXED 2026-07-19.** `forensics` house (hub `houses/eye/forensics/index.html`, 65 modules — uses ForensicsData.js, not the catalog) + `signal` house (`signal/index.html`, 23 modules, Hardware Projects). Their category tiles 404 not on the hub pages but via the GLOBAL cross-house discovery (`ContentDiscovery.js:419` `getAllModules()`, interaction-gated on search/filter). 9 additive tiles: 4 generated forensic subtypes (disk-forensics, memory-forensics, network-forensics, log-timeline) + 5 aliases (forensics-hub/evidence-foundations/advanced-forensics→forensics, cert-hub→certifications, toolkit→tools). Deterministic check: forensics + signal now 0 missing. **Platform-wide, the ONLY remaining category-tile gaps are the 5 intentionally-skipped generics** (building, foundations, safety, missions, exams). Additive only; Chris PASS.

---

## Operating contract (LOCKED)

1. **One page = one mission = one commit = one deploy.** Never batch pages. Fully finish + deploy a mission before starting the next. Each page is an atomic, resumable checkpoint.
2. **Non-stop mode.** After a page deploys, auto-advance to the next mission. No stopping for per-page go-ahead.
3. **Pre-approved image selection.** Generate, pick the best against the art direction, ship. Operator reviews via the gallery + live site and flags redos after.
4. **Update the gallery every batch.** Every new image generation → add to the gallery file and redeploy it to the SAME artifact URL. The gallery is the running visual record.
5. **Local commits only** on `master` (no push). Explicit `git add` of only the mission's files (page HTML + its page-scoped assets). Never `git add .` (protects #136 do-not-commit files + keeps _tools churn out). No AI attribution.
6. **QC gate:** Chris render-verify before each deploy (images load, no layout break, honest, JS on/off). Then `record-chris-pass` → `./deploy.sh` → verify live.

## Gallery
Running visual record (redeploy same URL on every new batch):
https://claude.ai/code/artifact/20707334-9d82-426f-b744-52039b15f99e

## Art direction (LOCKED)
- **Look:** cinematic neon-cyberpunk digital painting; dramatic volumetric neon lighting; atmospheric depth; premium, not flat.
- **Palette:** dark navy ground, house-purple `#9f7aea` + `#7c3aed`, cyan `#4d8bf0`; magenta accents ok.
- **Rules:** NO garbled text / letters / numbers in art. One art family across all pages. Prominent slots (heroes, feature cards, section art) → FLUX cinematic art. Tiny *functional* inline icons (a lock inside a sentence) → stay clean/minimal, do NOT turn into busy scenes.
- **Model:** `fal-ai/flux/dev` via `https://fal.run` (key: `~/.bashrc` FAL_KEY, parse — never source). square_hd, 30-32 steps, guidance 3.5.

## Per-mission loop
1. Inventory the page's images (`<img src>` + CSS `url()`), classify (cinematic slot vs functional icon).
2. Art-direct each cinematic slot; fal-generate.
3. Process (crop/resize/webp), save to page-scoped path (`_app/assets/images/<area>/`).
4. Update the gallery (redeploy same URL).
5. Wire into the page HTML.
6. Chris QC render.
7. `git add <scoped paths>` → commit → `record-chris-pass` → `./deploy.sh` → verify live.
8. Check the box below. Auto-advance to next mission.

---

## Missions

### Track B — shared assets (one file updates many pages)
- [x] **M0 — Flux Capacitor button** → plasma-C (hexagon-framed) into `components/FluxCapacitor.js` (131 pages) + full green→purple retint. SHIPPED. Chris PASS (0/266 green frames).
- [x] **MB1 — Brand logo + favicon** → new `assets/images/icons/hexworth-mark.webp` (clean neon hexagon-in-hexagon, purple+cyan, reads at 16px). Re-pointed ONLY the favicon `<link rel="icon">` + header `nav-brand` logo on 22 non-archive pages, off the garbled `icon-explosion.webp` DDOS orb. LEFT the ~196 semantic `icon-explosion` "explosion" content icons untouched (labs/dashboard/presentations). SHIPPED.

### Track A — per page (by visibility)
- [x] **Landing (`index.html`)** — cartridge CTA cards + feature badges + hero. SHIPPED (`6ede67f90`).
- [x] **M1 — About (`about.html`)** — 7 section markers (incl. 3 emoji-entity violations) → matched neon-emblem set. SHIPPED. Chris PASS.
- [~] **M2 — Sorting (`sorting.html`)** — DEFERRED. No page-specific silly PNGs: visuals are the 12 shared `${house.emblem}` crests (decent) + 1 nav icon. House-emblem refresh is a Track-B shared-library item (see below), not a per-page mission.

### Track B (queued) — 12 house emblems refresh (shared: sorting + house hubs + flux panel). Decide keep-vs-upgrade.
- [x] **M3 — FAQ (`faq.html`)** — 8 section markers → matched neon-emblem set (same family as About). SHIPPED. Chris PASS.
- [~] **M4 — Product-info** — already clean: prominent art (feature badges) done in prior work; remainder is functional `&#10003;` checkmarks + meta/favicon (not silly PNGs). No mission needed.
- [ ] **M4 — Product-info (`product-info.html`)** — feature badges done; sweep remaining icons.
- [x] **M5-M9 — Press / Vision / Products / Research / Partners** — VERIFIED CLEAN (0 silly `icon-*.webp` refs each; already on the new design system with premium art). No mission needed. Confirmed 2026-07-19 via icon-density scan.
- [ ] **M10 — Dashboard (`dashboard.html`)** — NEXT. Icon-dense (61 distinct `icon-*.webp`, 177 refs) — the biggest remaining silly-PNG surface. Requires scoping (cinematic slots vs functional UI vs shared-asset breakage risk) before generating; do NOT blanket-swap all 61.
- [ ] **M11-M22 — 12 house hubs** (`houses/*/index.html`) — icon density: observatory 18, ai 11, eye 5, script 4, dark-arts 3, code 3, web 2, forge 2, cloud 2, shield 1.
- [ ] **M23+ — deeper pages** (TBD, expand as we go)

---

## How to resume (after any context reset)
Read this file. Find the first unchecked mission. Run the per-mission loop for that ONE mission. Do not batch. Update this file when it ships.
