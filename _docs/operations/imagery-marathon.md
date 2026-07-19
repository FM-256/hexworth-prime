# Imagery Upgrade Marathon

**Goal:** Replace the platform's "silly PNGs" (generic tiny icons, garbled-text AI badges, the DDOS orb) with premium, consistent, fal.ai-generated art — matching the quality bar set by the arcade cartridges and the landing-page cartridge cards.

**Started:** 2026-07-19 · **Operator:** Frank · **Status:** ACTIVE

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

### Track A — per page (by visibility)
- [x] **Landing (`index.html`)** — cartridge CTA cards + feature badges + hero. SHIPPED (`6ede67f90`).
- [x] **M1 — About (`about.html`)** — 7 section markers (incl. 3 emoji-entity violations) → matched neon-emblem set. SHIPPED. Chris PASS.
- [~] **M2 — Sorting (`sorting.html`)** — DEFERRED. No page-specific silly PNGs: visuals are the 12 shared `${house.emblem}` crests (decent) + 1 nav icon. House-emblem refresh is a Track-B shared-library item (see below), not a per-page mission.

### Track B (queued) — 12 house emblems refresh (shared: sorting + house hubs + flux panel). Decide keep-vs-upgrade.
- [ ] **M3 — FAQ (`faq.html`)**
- [ ] **M4 — Product-info (`product-info.html`)** — feature badges done; sweep remaining icons.
- [ ] **M5 — Press (`press.html`)**
- [ ] **M6 — Vision (`vision.html`)**
- [ ] **M7 — Products (`products.html`)**
- [ ] **M8 — Research (`research.html`)**
- [ ] **M9 — Partners (`partners.html`)**
- [ ] **M10 — Dashboard (`dashboard.html`)**
- [ ] **M11-M22 — 12 house hubs** (`houses/*/index.html`)
- [ ] **M23+ — deeper pages** (TBD, expand as we go)

---

## How to resume (after any context reset)
Read this file. Find the first unchecked mission. Run the per-mission loop for that ONE mission. Do not batch. Update this file when it ships.
