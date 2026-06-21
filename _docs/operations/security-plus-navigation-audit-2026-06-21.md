# Security+ Navigation & Hub Audit — Shield House (2026-06-21)

## TLDR

The Shield house surfaces **four different pages that all say "Security+,"** plus a separate full course branded as Security+, reached through **inconsistent, duplicated navigation**. There is no rogue/forgotten hub — there is a branding-and-information-architecture collision. This document is the shared current-state reference before two decisions: (1) how many Security+ hubs we keep and what each holds, and (2) a new standardized org structure for course hubs.

Screenshot of record: `~/hexworth-shared/images/dashboard SS/Sec plus/security plus hub.png` (Shield house, "House Content" tab active, captured 2026-06-21).

---

## 1. What the screenshot shows (Shield house dashboard anatomy)

Top-to-bottom, as rendered by `_app/components/HouseRenderer.js` driven by `_app/houses/shield/index.html`:

| Region | Source | Content in screenshot |
|---|---|---|
| Featured course card (always visible, above tabs) | `config.afterStatsHTML` → `HouseRenderer.js:1206-1209`; markup in `shield/index.html:222-234` | **CIS2350C — Principles of Information Security** ("BSL-1…BSL-4… 12 CTF labs, 33 flags… Maps to CompTIA Security+ SY0-701"). Links to `infosec/index.html`. |
| Search bar | HouseRenderer | "Search security modules…" |
| Tab bar | `HouseRenderer.js:1231-1233` | Learning Paths · **House Content** (active) · Explore All · Profile · Instructor |
| "COURSE HUBS" section (under House Content) | `renderContentPanel()` → `HouseRenderer.js:1549-1553` | 3 cards: **Security Fundamentals** (CompTIA Security+), **Security Analysis** (CySA+), **Security Architecture** (CASP+) |

Key render facts:
- The 3 "COURSE HUBS" cards come from `config.paths` (`shield/index.html:135-139`).
- **The same `config.paths` array also renders under the "Learning Paths" tab** as "Certification Paths" cards (`HouseRenderer.js:1467-1495`). So the three cert cards appear **twice**, once per tab, under two different section names ("Course Hubs" vs "Certification Paths").
- The CIS2350C card is **not** part of `config.paths`; it is hand-authored HTML in `afterStatsHTML`, giving a course a completely different visual treatment and location than the cert hubs.

---

## 2. Every "Security+" page that exists (inventory)

| # | URL | Title / what it is | Size | Inbound links |
|---|---|---|---|---|
| 1 | `/houses/shield/security-plus/` | **Security+ Cert Prep Center — SY0-701** (the canonical hub we built; 145 manifest items incl. the 9 arena boxes) | 49 KB | `lobby.html`; Shield `config.paths` (both tabs) |
| 2 | `/houses/security-plus/` | Redirect stub → `meta refresh` + `location.replace('/houses/shield/security-plus/')` (forwards to #1) | 1 KB | `tenant/dashboard-enterprise.html` |
| 3 | `/houses/shield/infosec/` | **CIS2350C — Principles of Information Security** (a separate 5-week / 26-module / 12-lab / 33-flag course, branded "Maps to Security+ SY0-701") | 115 KB | Shield featured card (`afterStatsHTML`) |
| 4 | `/houses/security-plus-crypto/` | **Security+ Cryptography Domain** (single-domain cert-path page via `CertPathRenderer.init('security-plus-crypto')`) | <1 KB | `houses/key/index.html`; `dashboard.html` |

Related but distinct (not Security+): `/houses/shield/security-101/` = "Security 101 — Microsoft Security Foundations."

---

## 3. The inconsistencies (why it feels like a mess)

1. **Same cards, two locations, two names.** The 3 cert cards (`config.paths`) render as "Certification Paths" (Learning Paths tab) **and** "Course Hubs" (House Content tab). Duplicated surface, divergent labels.
2. **Courses vs hubs get different treatment.** CIS2350C (a course) is a large featured card above the tabs; the cert hubs are small cards inside a tab. No single rule for where a "course hub" lives.
3. **Label ≠ destination.** The card labeled "Security Fundamentals / CompTIA Security+" actually points to the **SY0-701 Cert Prep Center**. "Security Fundamentals" undersells and misnames it. (Staged fix renames it "Security+ Cert Prep Center" — see §5.)
4. **The most prominent "Security+" element isn't the hub.** The big featured card screams "Security+ SY0-701 / 33 Flags" but routes to CIS2350C (infosec), not the Cert Prep Center — so the obvious click lands on a different product.
5. **Four physical pages, one real destination.** #2 redirects to #1 (good), but #3 and #4 are independent pages also wearing Security+ branding, reached from unrelated places (Key house, dashboards, enterprise tenant).
6. **Broken link until staged fix.** The `security-plus` path card had no `href`, so it fell back to a generic `path-view.html?path=security-plus` instead of opening hub #1 (`HouseRenderer.js:1500-1505` / `1540`).

---

## 4. Inbound link map (who points where)

- `/houses/shield/security-plus/` (#1): `lobby.html`, `shield/index.html` (paths, both tabs)
- `/houses/security-plus/` (#2, redirect→#1): `tenant/dashboard-enterprise.html`
- `/houses/shield/infosec/` (#3): `shield/index.html` featured card
- `/houses/security-plus-crypto/` (#4): `houses/key/index.html`, `dashboard.html`

---

## 5. Staged (not yet deployed) change

In `shield/index.html:136`, the `security-plus` path entry was given `href: '/houses/shield/security-plus/'` and relabeled `name: 'Security+ Cert Prep Center'`, `cert: 'CompTIA Security+ SY0-701'`. This makes both the "Certification Paths" and "Course Hubs" cards route correctly to hub #1 and read as the cert-prep hub. Committed locally on `master`, **held from deploy** pending the org-structure decision below (so we ship one coherent change, not a patch we then re-do).

---

## 6. Open items for discussion (decide before any restructure)

These are the operator's two stated agenda items; captured here, **not decided**:

1. **Security+ hub amount & content** — How many Security+ destinations should exist, and what does each hold? Candidates to resolve: keep #1 as the single hub; fold #4 (crypto domain) into #1 or redirect it like #2; decide whether #3 (CIS2350C) is a *course* that belongs alongside but distinct from the *cert-prep hub*, or under it.
2. **New org-structure idea** — A standardized, consistent placement for course hubs vs courses vs cert paths across houses (eliminating the duplicate "Certification Paths"/"Course Hubs" rendering and the special-case featured card), per the operator's idea to be discussed next.

---

*Current as of 2026-06-21. Related: `_docs/operations/security-plus-arena-boxes.md` (the 9 arena boxes inside hub #1); `project_security_plus_hub_merge` memory (the earlier two-hub consolidation).*
