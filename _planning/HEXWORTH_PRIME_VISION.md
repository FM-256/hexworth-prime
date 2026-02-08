# Hexworth Prime - Project Vision

**Created:** December 16, 2025
**Status:** Stage 4 — Pilot-Ready SaaS
**Origin:** Evolution from Hexworth Academy (network-essentials)

---

## Executive Summary

Hexworth Prime is a browser-based IT & cybersecurity lab platform delivered as SaaS at `hexworth-prime.web.app`. Zero installs, zero IT involvement, zero infrastructure — students visit a URL and log in.

What began as a local teaching tool has crossed the threshold into institutional software: class management, progress tracking, grade exports, and print-friendly reports — all running on Firebase with Google Auth. The platform competes with Cengage MindTap and TestOut in delivery model, but at a fraction of the cost with deeper gamification and interactive lab content.

**Maturity:** Pilot-ready. Can immediately run real classes, charge licenses, and scale to other campuses without rewriting anything.

---

## Project Goals

1. ~~**Absorb Academy Content**~~ - Complete (378+ modules, 9 houses migrated)
2. ~~**Modular Architecture**~~ - Complete (component-based IIFE pattern, Firebase backend)
3. ~~**Digital Life Ecosystem**~~ - Complete (8-phase expansion, full life cycle)
4. ~~**Full App Capabilities**~~ - Complete (Firebase Auth, Firestore, handler dashboard HD-1 thru HD-5)
5. ~~**The Dark Arts**~~ - Complete (Five Gates CTF)
6. **Operational Professionalism** - NEW: Trust page, privacy statement, instructor quickstart, product one-pager
7. **Pilot & Revenue** - NEW: Run first paid pilot, collect proof, begin institutional sales

---

## Strategic Decisions

| Question | Decision | Date |
|----------|----------|------|
| Digital Life location | Fresh build in Prime | Dec 16, 2025 |
| Academy relationship | Prime absorbs Academy with cleanup | Dec 16, 2025 |
| Tech stack | Decide after architecture planning | Dec 16, 2025 |
| Planning documentation | Yes - this document | Dec 16, 2025 |

---

## Migration Strategy

### From Academy to Prime

1. **Content Audit** - Inventory all Academy content worth migrating
2. **Cleanup Pass** - Identify redundant, outdated, or low-quality content
3. **Architecture First** - Establish Prime structure before migration
4. **Incremental Migration** - Move content house-by-house
5. **Enhancement** - Improve content during migration (not just copy)

### Academy Status During Transition

- **Bug fixes:** Yes - continue addressing issues
- **New modules:** No - frozen until Prime ready
- **Digital Life:** Prototype in Academy allowed for testing, but primary development in Prime

---

## Architecture Considerations

### Current Academy Problems

| Issue | Impact |
|-------|--------|
| Monolithic index.html (~10,000+ lines) | Hard to maintain, messy diffs |
| Inline CSS/JS | No separation of concerns |
| No user accounts | Can't track progress |
| No backend | Limited interactivity |
| All content loaded at once | Performance impact |

### Prime Architecture Options

#### Option A: Enhanced Static (Modular)
```
Prime/
├── index.html              (shell + router)
├── css/
│   ├── core.css
│   ├── houses.css
│   └── digital-life.css
├── js/
│   ├── app.js
│   ├── digital-life.js
│   └── houses/
├── houses/
│   ├── web/
│   ├── shield/
│   ├── dark-arts/
│   └── ...
└── shared/
    └── components/
```
**Pros:** Simple, no build step, offline-capable
**Cons:** Limited interactivity, no user accounts

#### Option B: Frontend Framework (React/Vue/Svelte)
```
Prime/
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   └── services/
├── public/
└── package.json
```
**Pros:** Component reuse, state management, modern DX
**Cons:** Build step required, harder for students to learn from

#### Option C: Full Stack
```
Prime/
├── frontend/           (React/Vue/Svelte)
├── backend/            (Node/Python/Go)
├── database/           (Postgres/MongoDB)
└── docker-compose.yml
```
**Pros:** Full app capabilities, user accounts, analytics
**Cons:** Complex deployment, infrastructure costs

#### Option D: Hybrid (Static + API)
```
Prime/
├── app/                (Enhanced static or light framework)
└── api/                (Serverless functions for user data)
```
**Pros:** Best of both worlds, progressive enhancement
**Cons:** Some complexity

### Decision: TBD
*Will decide after Sprint 0 architecture exploration*

---

## Content Inventory (From Academy)

### Houses to Migrate

| House | Content | Priority | Notes |
|-------|---------|----------|-------|
| House of the Web | 14+ presentations, 6+ visualizers | High | Core networking content |
| House of the Shield | Security presentations | High | Ties into Dark Arts |
| House of the Cloud | 25 AWS applets, presentations | High | Complete coverage |
| House of the Forge | Hardware content | Medium | |
| House of the Script | Software/coding content | Medium | |
| House of the Code | DevOps/programming | Medium | |
| House of the Key | Cryptography | Medium | |
| House of the Eye | Monitoring/SIEM | Medium | |
| **The Dark Arts** | Malware analysis (new) | High | Unique differentiator |

### Tools to Migrate

- OSPF Visualizer
- STP Visualizer
- IPv6 Visualizer
- EtherChannel Visualizer
- VLAN Visualizer
- Subnetting Visualizer
- ACL Visualizer
- FHRP Visualizer
- QoS Visualizer
- Wireless Architecture Visualizer
- Automation Visualizer
- OSI Deep Dive Visualizer
- Cloud Architecture Designer
- AWS Service Explorer
- 25 Cloud Applets
- Subnet Calculator
- Packet Tracer Lite

---

## The Dark Arts Integration

Already planned in: `network-essentials/_dev/dark-arts-planning/PROJECT_VISION.md`

### Assets Available
- The-MALWARE-Repo (269 files, 15 categories)
- slowloris (Python DoS tool)
- wasec (Web Application Security demos)

### Five Gates CTF
Access control system teaching:
1. Source inspection (hex encoding)
2. CSS analysis (hidden text)
3. Steganography (image data)
4. Audio forensics (DTMF)
5. Intelligence synthesis

---

## Digital Life Ecosystem

*The signature magical element of Hexworth Prime*

### Current Implementation (Academy v7.16.0)
- 20 binary fireflies (1s and 0s)
- Organic floating movement
- Shooting stars with binary trails
- Scatter effect on star passage
- Mouse avoidance
- House color adaptation

### Evolution Roadmap

#### Phase 1: Life Cycle
- Birth (spawn as dim "0")
- Growth (brighten, potentially flip to "1")
- Death (burst into particles)
- Rebirth (respawn elsewhere)

#### Phase 2: Collision Behavior
- 1 + 1 = 0 (overflow)
- 0 + 0 = 1 (quantum flip)
- 1 + 0 = brief merge, split
- Generation tracking (older = brighter/larger)

#### Phase 3: Ecosystem Dynamics
- Predator/Prey (1s hunt 0s)
- Energy decay (need to "feed")
- Mitosis (splitting)
- Attraction/repulsion rules

#### Phase 4: Advanced Behaviors
- Constellation formation (emergent patterns)
- Shooting star seeds (stars spawn new fireflies)
- House personality (Shield = aggressive, Web = clustering)
- Binary arithmetic display on collision

### Future Ideas Backlog
- Spell particles (`{ }`, `< >`, `( )` as runes)
- Binary constellations (form network patterns)
- Data streams (soft Matrix effect)
- Circuit pulse (living technology veins)
- Packet bubbles (floating data spheres)

---

## Sprint Framework

### Sprint Definitions for Prime

- **Sprint Duration:** Flexible (1-3 sessions based on complexity)
- **Sprint Goal:** Deliver working increment
- **Definition of Done:** Feature complete, tested, documented

### Sprint Categories

| Category | Focus |
|----------|-------|
| **Architecture Sprints (A-)** | Structure, tech stack, setup |
| **Digital Life Sprints (DL-)** | Firefly ecosystem evolution |
| **Migration Sprints (M-)** | Moving Academy content |
| **Feature Sprints (F-)** | New Prime-specific features |
| **Dark Arts Sprints (DA-)** | Security training content |

---

## Initial Sprint Backlog

### Sprint A-0: Architecture Discovery
- Research tech stack options
- Prototype each architecture approach
- Make architecture decision
- Document rationale

### Sprint A-1: Project Scaffold
- Set up chosen architecture
- Establish file structure
- Configure build tools (if needed)
- Create base components

### Sprint DL-1: Digital Life Foundation
- Port firefly system to Prime
- Implement life cycle (birth/growth/death)
- Add collision detection
- Implement basic collision behavior

### Sprint DL-2: Ecosystem Dynamics
- Predator/prey behavior
- Energy/decay system
- Generation tracking
- Visual indicators (size/brightness by age)

### Sprint M-1: House of the Web Migration
- Migrate core networking presentations
- Clean up and enhance during migration
- Establish content component pattern

### Sprint DA-1: Dark Arts Gate 1
- Build Gate 1 with hex encoding puzzle
- Dark minimal aesthetic
- Entry point to Dark Arts house

---

## Success Metrics

### Technical
- [ ] Modular architecture (no file > 500 lines)
- [ ] Sub-2-second initial load time
- [ ] Offline capability preserved
- [ ] Mobile responsive

### Content
- [ ] All Academy content migrated and improved
- [ ] Dark Arts Five Gates complete
- [ ] 3+ malware family case studies

### Digital Life
- [ ] Full life cycle implemented
- [ ] Emergent behaviors visible
- [ ] Performance maintained (60fps)

### User Experience
- [ ] Progress tracking functional
- [ ] Quiz/assessment system working
- [ ] Certification path clear

---

## Open Questions

1. ~~Hosting strategy for full app?~~ → **Firebase Hosting** (decided)
2. ~~User account system?~~ → **Firebase Auth** (implemented)
3. ~~Database needs?~~ → **Firestore** (implemented for classes, assignments, users, progress)
4. ~~Monetization model?~~ → **Cohort-based institutional licensing** (see `PRODUCT_DIRECTION.md`)
5. Mobile app? (PWA sufficient? Native needed?)
6. **NEW:** Offline vs Online mode clarity — README needs to explain what works without Firebase vs what requires it (see external audit in `IDEAS_BACKLOG.md`)
7. **NEW:** Privacy / FERPA compliance statement — needed for institutional sales (see `PRODUCT_DIRECTION.md`)

---

## Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 0** | Architecture planning | Complete |
| **Phase 1** | Foundation + Digital Life | Complete (8-phase ecosystem) |
| **Phase 2** | Content migration | Complete (378+ modules, 9 houses) |
| **Phase 3** | Dark Arts | Complete (Five Gates CTF) |
| **Phase 4** | Full app features | In Progress (HD-1 thru HD-5 complete, HD-4/HD-6 remaining) |
| **Phase 4.5** | Operational Professionalism | Planned — trust page, privacy statement, quickstart, product one-pager, screenshots, architecture diagram, 30-day template |
| **Phase 5** | Pilot & Revenue | Planned — first paid pilot, testimonials, campus license sales |

---

## Product Maturity Assessment (February 2026)

| Stage | Description | Status |
|-------|-------------|--------|
| Stage 1 | Idea / prototype | Complete |
| Stage 2 | Working local tool | Complete |
| Stage 3 | Working product with real users | Complete |
| **Stage 4** | **Pilot-ready SaaS** | **Current** |
| Stage 5 | Revenue-generating product | Next — one pilot contract away |

### The SaaS Shift

The move from local tool to `hexworth-prime.web.app` changed everything:

| Before (Local Tool) | Now (Browser-Based SaaS) |
|---------------------|--------------------------|
| Instructor utility | Institutional product |
| Manual installs / zip files | Zero installs — just a URL |
| DIY setup, IT involvement | No infrastructure, no tech support |
| Hard to sell institutionally | Behaves like MindTap / TestOut |
| Admins think "support risk" | Admins think "normal SaaS vendor" |
| Caps at hobby / internal use | Scales to multi-campus licensing |

### What This Enables

- Sell licenses to other campuses and schools
- Offer trials and freemium tiers
- Track usage across institutions
- Deploy features instantly (Firebase hosting)
- Support remote students and online-only cohorts
- Run summer bootcamps with zero setup
- Update all users simultaneously

### Critical Operational Gap

Moving from local tool to SaaS creates new expectations. Admins will ask:

- Who hosts it? Who maintains it?
- What about data? FERPA?
- Uptime? Support? Backups?

These are not technical problems — they are **operational presentation** problems. The infrastructure (Firebase/Google Cloud) already answers them. The gap is making those answers visible.

---

## Notes

- Academy is in maintenance mode — Prime has absorbed all content
- Digital Life is the signature differentiator
- Stop thinking "my teaching tool" — start thinking "web application that happens to be used in my class"
- Tools stay local. Web apps scale.

---

*"From Academy to Prime — from local tool to pilot-ready SaaS."*
