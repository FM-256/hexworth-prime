# Hexworth Prime - Ideas Backlog

**Purpose:** Capture ideas during brainstorming sessions for future implementation
**Status:** Active collection - ideas noted here, not yet prioritized

---

## House Identity & Theming

**Date Added:** December 19, 2025

Each house needs more personality and identity beyond just colors/icons.

| House | Theme Concept | Aesthetic | Tagline |
|-------|---------------|-----------|---------|
| **Shield** | Medieval Knight | Castle walls, armor, coat of arms | "Defend the realm" |
| **Web** | Navigator/Sailor | Maritime, ropes as cables, port metaphors | "Chart the network seas" |
| **Cloud** | Sky Kingdom | Floating castles, weather, celestial | "Architect of the heavens" |
| **Forge** | Blacksmith/Dwarven | Anvil, hammer, molten circuits | "Craft the foundation" |
| **Script** | Arcane Wizard | Scrolls, spellbooks, incantations | "Cast your automation" |
| **Code** | Architect/Alchemist | Blueprints, scaffolding, transmutation | "Build from nothing" |
| **Key** | Vault Keeper/Sphinx | Locks, riddles, hidden chambers | "Guard the secrets" |
| **Eye** | Oracle/Watchtower | Crystal balls, sentinels, scrying | "See all, miss nothing" |
| **Dark Arts** | Already themed | Forbidden vault, shadowy | "Knowledge has a price" |

**Implementation Areas:**
- Landing page aesthetics (themed backgrounds, borders)
- Mascot characters for each house
- UI elements (house-specific buttons, cards)
- Welcome messages ("Welcome, Defender" vs "Welcome, Navigator")
- Achievement badges with house themes
- Lore/backstory for each house

---

## Digital Life - Constellation Evolution

**Date Added:** December 19, 2025

Constellations should be able to merge/evolve into larger cosmic structures that become background elements.

### Evolution Path
```
Individual Fireflies
        ↓
   Constellations (5+ fireflies align)
        ↓
    Nebulas (3+ constellations merge)
        ↓
    Galaxies (nebula matures over time)
        ↓
   Background Essence (permanent visual mark)
```

### Mechanics
| Stage | Trigger | Visual | Persistence |
|-------|---------|--------|-------------|
| Constellation | 5+ fireflies align | Connected stars with lines | Temporary (breaks when fireflies leave) |
| Nebula | 3+ constellations in proximity | Colorful gas cloud formation | Session-based |
| Galaxy | Nebula exists for X time with energy | Spiral or elliptical galaxy form | Semi-permanent (localStorage) |
| Background | Galaxy "sets" into background | Faint ambient cosmic glow | Persists across visits |

### Thematic Connections
- House-colored formations (Shield = red nebulas, Web = blue, etc.)
- Legacy feeling - "Your learning left a mark on this world"
- Ambient progression - Fresh visitors see sparse stars, veterans see rich cosmic backdrops
- Ties into achievements - "Galaxy Architect" achievement

### Technical Considerations
- Store galaxy positions in localStorage
- Render as CSS background layers (performance)
- Cap maximum galaxies to prevent visual clutter
- Galaxies could slowly fade over weeks (entropy)

---

## Migration Gaps (Noted)

**Date Added:** December 19, 2025

During migration audit, discovered content not yet ported:

### CMMC Modules (17 items) - Shield House
- cmmc_access_control, cmmc_audit_accountability, cmmc_awareness_training
- cmmc_config_management, cmmc_cui, cmmc_framework, cmmc_identification_auth
- cmmc_incident_response, cmmc_maintenance, cmmc_media_protection
- cmmc_personnel_security, cmmc_physical_protection, cmmc_quiz
- cmmc_risk_assessment, cmmc_security_assessment, cmmc_system_comm_protection
- cmmc_system_info_integrity

### Other Missing Applets (~18 items)
- blockchain, career_exploration, cookie_caper, cyber_hat_match
- cyber_scramble, ethical_hacking_case, factor_prime, google_hacking
- heartbleed, meltdown_spectre, os_command_injection, osint_challenge
- stuxnet, whats_my_crime, hacker_hangman

### Missing Visualizers (5 items) - Web House
- acl-visualizer.html
- qos-visualizer.html
- security-visualizer.html
- browser-security-hardening.html
- home-network-security.html

**Decision Pending:** Complete migration vs. prioritize new features

---

## Module Ideas

### Content Obfuscation & Encoding Lab (Key House / Shield House Crossover)

**Date Added:** December 19, 2025
**Priority:** High - Ties directly into platform security feature

**Context:** Hexworth Prime uses client-side content obfuscation (AES encryption + Base64 encoding) to protect educational content from direct file access. This is a perfect teaching opportunity.

**Module Concept:** "Breaking the Vault" - Reverse Engineering Encoded Content

| Component | Description |
|-----------|-------------|
| **Presentation** | How content encoding works: Base64, AES, key derivation |
| **Applet** | Interactive encoder/decoder tool - students encode their own messages |
| **Lab Exercise 1** | Decode a Base64 message (easy) |
| **Lab Exercise 2** | Identify encryption algorithm from ciphertext patterns |
| **Lab Exercise 3** | Brute-force a weak key (educational Caesar cipher) |
| **Lab Exercise 4** | Analyze obfuscated JavaScript to find the decoder logic |
| **Challenge** | "Break Hexworth's content protection" - optional advanced CTF |

**Learning Objectives:**
- Understand encoding vs encryption (Base64 is NOT encryption!)
- Recognize common encryption patterns
- Practice reverse engineering obfuscated code
- Understand why client-side protection has limits
- Learn about key derivation and secure storage

**House Placement:**
- **Key House** (primary) - Encryption focus
- **Shield House** (crossover) - Security analysis angle
- **Dark Arts** (advanced) - The actual "break the protection" challenge

**Real-World Connection:** This is exactly what pentesters do when analyzing client-side apps!

---

## Divergent Digital Life - Factionless Ecosystem

**Date Added:** December 19, 2025
**Priority:** Medium-High - Completes the Divergent experience
**Status:** Needs Discussion

**Context:** Divergent/Factionless users have a unique glitch aesthetic (magenta/cyan, RGB separation, scanlines). The Digital Life ecosystem should reflect this.

### Current State
- House users get house-colored fireflies (Shield = red, Web = blue, etc.)
- Divergent users currently fall back to default or random colors
- No unique behaviors that match the "glitch" theme

### Ideas to Discuss

| Concept | Description | Complexity |
|---------|-------------|------------|
| **Glitch Fireflies** | Fireflies flicker between colors, have RGB "trails" that separate | Medium |
| **Multi-Color Swarms** | Each firefly is a different house color - representing access to all | Low |
| **Corruption Effect** | Occasional "static burst" across the ecosystem - visual disruption | Medium |
| **Unstable Fireflies** | Fireflies that randomly split into 2-3 copies then merge back | High |
| **Color Bleeding** | Fireflies leave trails that slowly shift through the spectrum | Medium |
| **Glitch Portals** | Random "tears" in space that teleport fireflies | High |
| **Chaos Attractor** | Divergent presence causes nearby fireflies to act erratically | Medium |

### Potential Mechanics
- **Inheritance Uncertainty**: Genetics system could produce "uncertain" offspring with random traits
- **Faction Hopping**: Fireflies occasionally "switch allegiance" (change color)
- **System Errors**: Random visual glitches (screen tear, color inversion flash)
- **The Anomaly**: Special rare entity only Divergents can spawn

### Audio Considerations
- Distorted/glitchy ambient sounds
- Occasional "static" audio bursts
- Pitch-shifted versions of normal sounds

### Questions to Resolve
1. Should glitch effects be subtle or prominent?
2. Does the chaos affect OTHER users' Digital Life when a Divergent is present (multiplayer implications)?
3. Should there be Divergent-exclusive entities/events?
4. How do we balance "cool chaos" with "annoying distraction"?

---

## Title & Progression System (GOT Titles)

**Date Added:** December 24, 2025
**Status:** Full design document created
**See:** `TITLE_PROGRESSION_SYSTEM.md`

Multi-layered title system:
1. **Identity Layer:** House/Operator/Factionless (fixed on selection)
2. **Skill Levels:** 5 tiers per skill (Initiate → Archon for magic, Recruit → Architect for hacker)
3. **GOT Title:** Cumulative title that grows with each maxed skill

**Key Features:**
- Themed tier names (Hexworth magical vs Hacker tech vs Dark Arts edgy)
- Cross-house learning paths (API Mastery spans Web → Script → Code → Tools)
- Lock/unlock progression (Part 2 unlocks after Part 1)
- Special achievement titles ("The Flawless", "Walker of All Paths")
- Full title display: "Alice, House of the Key, Crypto Archon, API Architect, The Flawless"

**First Implementation:** API Mastery Learning Path (5 parts across houses)

---

## Career Cards - House-Specific Career Exploration Tool

**Date Added:** December 26, 2025
**Priority:** High - Core educational value, applies to ALL houses
**Status:** Placeholder exists in Shield House (marked "coming soon")

### Context

Tech is a vast world with subcultures and sub-fields - the same reason Hexworth has a house/faction separation. Each house has its own personality, style, and career fields. Career Cards will be a **universal feature present in every house** but with **house-specific content**.

### Vision

An interactive career exploration tool available from the get-go in every house's fundamentals category. Each house gets its own distinct Career Card because each field is different.

### Core Features

| Feature | Description |
|---------|-------------|
| **Career Profiles** | Detailed breakdowns of careers in the house's field |
| **Day in the Life** | What does a typical day look like for a [role]? |
| **Preparation Path** | Required education, skills, and prerequisites |
| **Certifications** | Industry certs relevant to the career (with links to official sites) |
| **Progression Charts** | Visual career ladders showing advancement paths |
| **Salary Ranges** | Realistic compensation data by experience level |
| **Job Resources** | Links to job boards, company reviews, salary databases |

### Career Progression Example (Web House / Networking)

```
Entry Level              Mid-Level                Senior Level              Executive
─────────────────────────────────────────────────────────────────────────────────────
Jr. Network Admin    →   Network Admin        →   Sr. Network Admin
                              ↓
                         Jr. Network Engineer →   Network Engineer      →   Sr. Network Engineer
                                                       ↓
                                                  Network Architect     →   Principal Architect
                                                       ↓
                                                  Cloud Network Eng.    →   Director of Infrastructure
```

### House-Specific Career Examples

| House | Example Careers |
|-------|-----------------|
| **Shield** | Security Analyst, Penetration Tester, SOC Analyst, CISO, Compliance Officer, Threat Hunter |
| **Web** | Network Admin, Network Engineer, Network Architect, Wireless Engineer, VoIP Engineer |
| **Cloud** | Cloud Engineer, DevOps Engineer, SRE, Cloud Architect, Platform Engineer |
| **Forge** | Help Desk, Desktop Support, Sysadmin, IT Manager, CTO |
| **Script** | Automation Engineer, Python Developer, PowerShell Admin, Integration Specialist |
| **Code** | Software Developer, Full-Stack Engineer, Mobile Developer, Solutions Architect |
| **Key** | Cryptographer, Security Engineer, IAM Specialist, PKI Administrator |
| **Eye** | SOC Analyst, SIEM Engineer, Threat Intelligence Analyst, Digital Forensics |

### Design Principles

1. **Consistency:** Same location in every house (fundamentals category)
2. **Distinctiveness:** Each house's card has unique styling matching house theme
3. **Real Data:** Actual salary ranges, real job board links, real cert requirements
4. **Interactive:** Clickable progression paths, expandable role details
5. **Up-to-Date:** Links to current resources (Indeed, Glassdoor, LinkedIn, official cert sites)

### Technical Implementation

- **Component:** Reusable `CareerCard.js` component
- **Data:** House-specific JSON files (`shield-careers.json`, `web-careers.json`, etc.)
- **Styling:** House-themed CSS with shared base styles
- **Location:** `_app/components/CareerCard.js` + `_app/houses/[house]/data/careers.json`

### External Resources to Link

| Resource Type | Examples |
|---------------|----------|
| Job Boards | Indeed, LinkedIn Jobs, Dice, CyberSecJobs |
| Salary Data | Glassdoor, PayScale, Levels.fyi, Blind |
| Cert Info | CompTIA, ISC2, EC-Council, AWS, Microsoft, Google |
| Reviews | Glassdoor, Blind, TeamBlind |
| Learning | Coursera, edX, Udemy, official vendor training |

### Placeholder Status

- **Shield House:** `career_exploration/index.html` exists but is a VR shell (NSF Grant legacy)
- **Other Houses:** Need to add placeholder entries
- **All Houses:** Mark as "coming soon" until full implementation

---

## Dark Arts Five Gates - Hardening (Remove Handholding)

**Date Added:** February 3, 2026
**Priority:** High - Makes the CTF a real challenge
**Status:** DONE (February 6, 2026)

### Current Problem

The Five Gates CTF has too many hints that spoonfeed the answers. A CTF should challenge users to THINK and DISCOVER, not follow a breadcrumb trail.

### Hints to Remove/Reduce

| Gate | Current Hint | Problem | Action |
|------|--------------|---------|--------|
| **Gate 1** | "🐇 NEED GUIDANCE?" trail guide with house links | Tells them exactly where to look | **REMOVE** - or make it unlock only after X failed attempts |
| **Gate 1** | House hints like "Binary, packets, protocols" | Too specific | **REMOVE** |
| **Gate 1** | Console logs: "answer lies elsewhere... in the source" | Gives away the technique | **REMOVE** |
| **Gate 1** | "The rabbit burrows beneath what you see" quote | Borderline acceptable metaphor | **KEEP** (cryptic enough) |
| **Gate 2** | Terminal block: "Color is merely a mask... Select carefully" | Directly tells the technique | **REMOVE** or make cryptic |
| **Gate 2** | Owl hint | Acceptable metaphor | **KEEP** |
| **Gate 3** | Terminal showing `file shadow.svg` output | Too helpful | **REMOVE** |
| **Gate 3** | Chameleon hint | Acceptable metaphor | **KEEP** |
| **Gate 4** | TBD - need to review | | |
| **Gate 5** | TBD - need to review | | |

### Design Philosophy

1. **Cryptic metaphors = OK** - "The owl finds prey hidden in darkness" doesn't tell you HOW
2. **Direct techniques = NOT OK** - "Select carefully" tells them to highlight text
3. **Patronus/Trail Guide = Emergency only** - Should unlock after 10+ failed attempts, not immediately
4. **Console hints = Remove entirely** - Devtools users shouldn't get freebies

### Difficulty Tiers (Future Enhancement)

Consider implementing difficulty selection:

| Tier | Description |
|------|-------------|
| **Recruit** | Current hints (easy mode for beginners) |
| **Operator** | Cryptic hints only (default) |
| **Ghost** | No hints at all (true CTF) |

Store selection in localStorage, show different hint levels based on tier.

### Implementation Steps

1. [x] Audit all 5 gates for hint inventory
2. [x] Remove Trail Guide button (or make it timer-locked)
3. [x] Remove console.log hints
4. [x] Remove terminal block technique reveals
5. [x] Keep only cryptic metaphorical hints
6. [x] Test with fresh eyes to ensure solvable without hints
7. [ ] (Optional) Add difficulty tier selector

---

## Future Ideas (Unsorted)

*Add new ideas below as they come up*

- [ ] House rivalries/alliances (affects Digital Life behavior?)
- [ ] Seasonal events (cosmic events tied to real-world calendar?)
- [x] Cross-house content for multi-cert paths → See TITLE_PROGRESSION_SYSTEM.md
- [ ] Student portfolios showing house progression
- [ ] Divergent-exclusive achievements ("Chaos Agent", "System Anomaly", etc.)
- [ ] Postman tool training integration (API Mastery Part 5)
- [ ] Real public API integrations for learning (OpenWeatherMap, JSONPlaceholder, NASA API)
- [ ] **ADR Module (House of Code)** - Architecture Decision Records as DevOps practice: what they are, why they matter, how to write them, templates. Could include lab where students write ADRs for sample projects.
- [ ] **Cross-House Content Access** - Houses currently lock users to their house's content only. Need a way for users to access ALL content regardless of house assignment. Options: (1) "Visit Other Houses" navigation, (2) Universal content browser, (3) House-hopping permission system. Note: Factionless already have this by design - need to extend to regular house members. Critical for cross-house learning paths like API Mastery.
- [x] **Classroom & Instructor Dashboards** - Full LMS capabilities for classroom deployment. See `CLASSROOM_DASHBOARD_PLAN.md` for complete spec. Includes: instructor dashboard (progress tracking, assignments, analytics, exports), student classroom view (gamified leaderboard, personal progress, House Wars), dual storage (Firebase + offline export).
- [ ] **Career Cards (All Houses)** - Interactive career exploration tool for each house. Includes career profiles, day-in-the-life, progression charts, salary ranges, certifications, and job resources. See full spec above. Shield House placeholder exists.
- [ ] **Rainbow Table Attack Lab (Shield/Key House)** - Password security lab demonstrating why strong hashing + salting matters. Concepts: rainbow tables, hash lookups, pre-computed attacks, salting, bcrypt/scrypt/argon2. Students could: (1) look up weak password hashes in a simulated rainbow table, (2) see how salting defeats pre-computed attacks, (3) compare hash algorithm speeds/security tradeoffs. Ties into security fundamentals - "this is why we enforce password policies."
- [ ] **Student Dashboard (All Users)** - Give every user their own personal dashboard, not just handlers. Features to explore: (1) Personal progress overview across all houses/content, (2) Achievement showcase/trophy case, (3) Learning streak/activity calendar, (4) Recommended next content based on progress, (5) Personal stats (time spent, modules completed, quiz scores), (6) House standing/rank, (7) Goals/targets they can set for themselves. Currently only handlers have dashboards — students just see the main dashboard. This would be a dedicated "My Progress" or "My Journey" view.
- [x] **Quiz ModuleId Audit** *(Done: Feb 6, 2026)* - Fixed 12 legacy quizzes with duplicate house prefix in quizId. Changed `completeQuiz('house', 'house-xxx')` to `completeQuiz('house', 'xxx')` so checkLocalCompletion() can match contentId to localStorage format. Houses fixed: Key (4), Eye (5), Code (3).

---

## External Audit Feedback (February 5, 2026)

**Source:** Cold review of GitHub repo + live site by external party with zero prior context.

### Key Finding: Onboarding Clarity Gap

The biggest gap identified is **not vision or features** — it's **onboarding clarity and proof**. The platform's scope reads as serious institutional software, but a first-time visitor can't quickly understand what mode they're in or see evidence of the instructor toolset.

### Actionable Items from Audit

- [x] **Offline vs Online Mode Explanation** *(Done: about.html Data Handling section)* - README and/or landing page should clearly explain what works offline (solo learning, quizzes, Digital Life) vs what requires Firebase (classes, roster sync, progress reporting). Current README says "no internet required after download" but Google sign-in is a core entry point. Confusing for first-time visitors.
- [ ] **Screenshots in README** - Minimum set: (1) Landing page ("Choose Your Reality"), (2) House sorting result, (3) Student dashboard with progress, (4) Handler dashboard roster + assignments, (5) CSV export / class report. These are "trust signals" — proof the features exist. Critical for GitHub visitors deciding whether to take the platform seriously.
- [x] **Architecture Diagram** *(Done: README.md Technical Information section)* - Simple visual: `Browser UI → (optional) Firebase Auth → Firestore (classes/progress) + localStorage (offline progress)`. Formalizes what's already explained in prose. Could go in README or a separate ARCHITECTURE.md.
- [ ] **"Start Here" One-Pager for Outsiders** - 3 bullets: what it is, who it's for, what modes exist. Currently the README dives into features without framing the product first. Could be a reorganized README intro or a separate GETTING_STARTED.md.
- [ ] **30-Day Class Template** - "Keiser-ready" accelerated course template: Week 1 onboarding + baseline, Week 2 labs + check-in, Week 3 assessment + remediation, Week 4 capstone + export grades. Turns Hexworth from "cool platform" into "plug-and-play course delivery tool." Note: PRODUCT_DIRECTION.md already has the 4-week scaffolding model — this would be a concrete, downloadable syllabus template handlers can use immediately.
- [x] **License / Privacy / Data Handling Statement** *(Done: about.html Privacy + FERPA sections)* - Missing standard trust signals for an education product. Where is data stored? How is it secured? Can institutions self-host? Student IDs, names, and progress are being handled — education buyers will ask about FERPA compliance, data residency, and security posture.
- [ ] **60-Second Walkthrough GIF or Video** - For the GitHub landing page or live site. Shows the full flow: sign in → sort → dashboard → assign → complete → handler sees progress. More convincing than any amount of text.

---

## SaaS Maturity Audit (February 5, 2026)

**Source:** Strategic analysis of hosted deployment at hexworth-prime.web.app

### Key Finding: Stage 4 — Pilot-Ready SaaS

The move from local tool to browser-based hosted delivery fundamentally changed what Hexworth Prime is. It now has true SaaS delivery: zero installs, zero IT involvement, no lab machines, no images/VMs — just a URL. This is what universities actually buy.

### Immediate High-ROI Items (Operational, Not Technical)

- [x] **Product One-Pager (PDF)** *(Done: product-info.html with print styles)* — Single page: what it is, key features, cost comparison vs TestOut/MindTap, pilot offer. This is what gets emailed to department chairs. Format: `Hexworth Prime | Browser-Based IT & Cybersecurity Lab Platform | [URL] | Features | Cost | Pilot Offer`
- [x] **Trust / About Page** *(Done: about.html)* — In-app or landing page explaining: hosted on Firebase (Google Cloud infrastructure), browser-based, no installs, secure Google Auth, data stored per class, fully exportable. Not a legal document — a confidence builder.
- [x] **Uptime Statement** *(Done: about.html + product-info.html stats bar)* — Simple line: "Hosted on Google Firebase infrastructure with 99.95% SLA." Instant credibility because Google backs it.
- [x] **Instructor Quickstart (In-App or PDF)** *(Done: Instructor tab welcome panel)* — 3 steps: "Create class → share code → done." Remove perceived complexity. Could be a panel in the handler dashboard or a downloadable one-pager.
- [ ] **Freemium / Trial Model** — SaaS delivery makes trials trivial. Consider: free tier (1 class, 10 students) vs paid tiers. Lowers barrier to entry for evaluation.
- [ ] **Usage Analytics** — Track: active classes, enrolled students, completion rates, most/least used content. Needed for pilot reports and institutional sales conversations.

### Pricing Reframe (SaaS Changes Everything)

Previous ceiling: maybe sell locally for a few thousand.
New realistic pricing with SaaS delivery:

| Model | Range |
|-------|-------|
| Department license | $15k-30k/year |
| Campus license | $30k-60k/year |
| Multi-campus | $100k+ |

Admins are comfortable paying SaaS vendors. They are not comfortable paying GitHub projects.

### Positive Signals Noted

| Observation | Quote |
|-------------|-------|
| Not a toy | "The scope reads like a real LMS-adjacent platform with strong gamification and a unique theme layer." |
| Instructor toolset is real | "For Instructors / For Students portions read like you're aiming for real classroom operations, not just a novelty UI." |
| Vision is clear | "Ambitious and clear about the vision — houses, gamification, Digital Life described in enough detail to repeat the product back." |
| Firebase architecture visible | "Clearly tied to Firebase hosting — repo contains .firebaserc, firebase.json, Firestore rules." |

---

*This document captures ideas during brainstorming. Move to sprint backlog when ready to implement.*
