# Hexworth Prime - Product Direction & Strategy

**Created:** February 5, 2026
**Status:** Active
**Context:** Strategic analysis following instructor dashboard + cohort system implementation

---

## The Pivot Point

With the addition of the **Handler (Instructor) Dashboard** and **Class Cohort System**, Hexworth Prime crossed a critical threshold:

| Before | After |
|--------|-------|
| Learning tool | Institutional product |
| Individual users | Classroom-ready platform |
| Hobby project pricing | Enterprise licensing territory |
| Local repo / zip file | SaaS at hexworth-prime.web.app |
| "Cool but support risk" | "Same as MindTap — just a URL" |

This is the difference between selling to individuals ($10-20/user/month) and selling to institutions ($15k-60k/year).

### The SaaS Realization (February 2026)

Because Hexworth Prime runs entirely in-browser at a hosted URL with Firebase backend, it is now **true SaaS delivery**. This is what universities actually buy.

**Two pitches, one product:**

| Pitch A (old mindset) | Pitch B (current reality) |
|----------------------|--------------------------|
| "Here's a repo, you install it, configure Firebase, maintain it" | "Students just go to a URL and log in" |
| Admin: risk, support burden, who owns this? | Admin: no infrastructure, no tech support, same as MindTap |

**Product maturity: Stage 4 — Pilot-Ready SaaS.** One pilot contract away from revenue.

---

## Strategic Positioning

### One-Sentence Pitch
> "Hexworth is a classroom-ready cybersecurity lab platform with instructor oversight."

### What Institutions Actually Ask
When schools evaluate software, the questions are:

- Can I manage 30 students?
- Can instructors see progress?
- Can I grade?
- Can I create groups?
- Can I export reports?
- Can IT control accounts?

**Current answer coverage:**

| Question | Status |
|----------|--------|
| Manage students (cohorts up to 50) | **Built** (HD-1 + HD-2) |
| Instructor progress visibility | **Built** (HD-3 — progress bars, detail modal, Avg Completion) |
| Grade / assess | **Built** (HD-3 + HD-5 — quiz scores tracked, grades CSV export) |
| Create groups (HEX-XXXX codes) | **Built** (HD-1) |
| Export reports (CSV/PDF) | **Built** (HD-5 — 4 CSV exports + print-friendly class report) |
| IT account control | Future (Firebase Auth covers basics) |

### Competitive Landscape

Hexworth now occupies LMS territory alongside:

| Platform | What They Sell |
|----------|---------------|
| Canvas | Management (not content) |
| Blackboard | Management (not content) |
| Moodle | Management (open source) |
| Hack The Box Academy | Cybersecurity labs + team licenses |
| TryHackMe | Cybersecurity labs + classroom seats |

**Hexworth differentiators:**
- Gamified house system (engagement)
- Interactive simulated environments (not just quizzes)
- Digital Life ecosystem (signature feature)
- Open-world lab design (exploration-driven learning)
- Dark Arts CTF gate system (security training)
- No infrastructure needed (Firebase hosted, code-based join)

---

## Business Model

### Cohort-Based Pricing (Recommended)

**Cap: 50 students per cohort** — covers 95% of real classrooms.

| Tier | Price | Includes |
|------|-------|----------|
| Single Cohort | ~$3,000/semester | 1 class, up to 50 students, full content |
| Department | ~$15,000-30,000/year | 5+ cohorts, priority support |
| Campus | ~$30,000-60,000/year | Unlimited cohorts, custom branding potential |
| Multi-Campus | ~$100,000+/year | Enterprise agreement, dedicated support |

**Why per-cohort beats per-user:**
- Schools don't negotiate cohort pricing the way they negotiate per-seat
- $3k fits within textbook/lab budgets and departmental petty cash
- Easier purchase approval (no per-student justification needed)

**Why SaaS pricing is now realistic:**
- Browser-based delivery = no IT involvement = no support burden
- Firebase hosting = Google infrastructure = instant credibility
- Admins are comfortable paying SaaS vendors, not GitHub projects
- Comparable products (TestOut, CyberRange) charge $50-200/seat/year

### Target Buyers

| Segment | Why They Buy |
|---------|-------------|
| Community colleges | Affordable cybersecurity lab platform |
| 4-year universities | Supplements existing coursework |
| Training centers | Ready-made curriculum |
| Bootcamps | Structured learning paths |
| Government training programs | Cybersecurity workforce development |

---

## What's Built (Handler Dashboard)

### Validated Strengths (Product Feedback)

| Element | Assessment |
|---------|-----------|
| Dark theme / clean layout | Looks institutional, not "student project" |
| Top metrics (Enrolled, Completion, Labs, Time) | Correct KPIs — exactly what instructors care about |
| HEX-XXXX class codes | Frictionless onboarding (no IT setup, no SSO) |
| Curriculum assignment cards | Shows structured content, not just "features" |
| Student roster panel | "Money panel" — buyers check if they can see students |
| Content browser with tabs | Courses + individual items + full house paths |

### Current Feature Inventory

| Feature | Version | Status |
|---------|---------|--------|
| Class CRUD (create/edit/delete) | v3.9.0 | Complete |
| HEX-XXXX code generation | v3.9.0 | Complete |
| 3-column gold-themed layout | v3.9.0 | Complete |
| Class code copy-to-clipboard | v3.9.0 | Complete |
| Content assignments (paths, courses, items) | v3.10.0 | Complete |
| Content browser (filter by house/type/difficulty/search) | v3.10.0 | Complete |
| Due dates on assignments | v3.10.0 | Complete |
| Assignment notes | v3.10.0 | Complete |
| Firestore security rules | v3.10.0 | Complete |

---

## Enterprise-Ready Feature Gap

~~Three features that close the gap between "good dashboard" and "enterprise-ready platform":~~

**Status Update (Feb 5, 2026):** 2 of 3 original gaps are now closed. Activity Log remains.

### 1. Export / CSV / Reports — COMPLETE (HD-5)
- ~~Export student grades as CSV~~ **Done** — per-student per-assignment rows
- ~~Export progress reports~~ **Done** — per-student completion summary CSV
- ~~Downloadable class summary PDF~~ **Done** — print-friendly class report with at-risk alerts
- ~~If this works with existing LMS gradebooks = instant purchase decision~~ **Done** — Blackboard/Canvas compatible

### 2. Activity Log (Live Feed) — REMAINING
**Priority:** High
**Why:** Gives visibility and proves platform is "alive"
- Recent activity feed: "John completed Lab 3", "Maria started Module 2", "Alex failed Quiz 1"
- Shows the dashboard has real-time value
- Admins and department chairs love logs

### 3. Progress Bars in Roster — COMPLETE (HD-3)
- ~~Each student shows completion percentage: "John — 72%", "Maria — 40%"~~ **Done**
- ~~Visual progress bars next to names~~ **Done** — thin color-coded bars
- ~~Color coding (red/yellow/green) for at-risk identification~~ **Done** — green >70%, yellow 40-70%, red <40%

---

## Implementation Sprint Plan

### Sprint Sequence (HD-Series Continuation)

```
HD-1:   Class CRUD                    [COMPLETE - v3.9.0]
HD-1.5: Content Assignments           [COMPLETE - v3.10.0]
HD-2:   Student Join Flow             [COMPLETE - v3.10.3]
HD-3:   Progress Tracking + Roster    [COMPLETE - v3.10.3]
HD-5:   Export / Reports              [COMPLETE - v3.10.4]
HD-4:   Activity Log                  [NEXT]
HD-6:   Analytics Dashboard           [Depends on HD-4]
```

### Sprint HD-2: Student Join Flow
**Priority:** BLOCKING — nothing else works without students in classes

| Task | Description |
|------|-------------|
| "Join Class" UI on student dashboard | Input field for HEX-XXXX code |
| ClassManager.joinClass(code) method | Lookup code, add student UID to memberUids |
| Enforce 50-student cap | Reject joins at capacity |
| Student class view | Show assigned content for their classes |
| Handler roster shows real names | Pull display names from Firebase Auth |
| Member count auto-updates | Real-time count in handler dashboard |

### Sprint HD-3: Progress Tracking + Roster Bars
**Priority:** High — this is what makes the dashboard valuable

| Task | Description |
|------|-------------|
| Per-student progress tracking | Record module/lab/quiz completions |
| Completion % per student | Calculate from assigned vs completed content |
| Progress bars in roster | Visual bars next to each student name |
| Color-coded status | Green (>70%), Yellow (40-70%), Red (<40%) |
| Stats grid shows real data | Aggregate class-wide metrics from actual progress |
| Student detail view | Click student name to see full breakdown |

### Sprint HD-4: Activity Log
**Priority:** High — proves the platform is alive

| Task | Description |
|------|-------------|
| Activity event collection | Log: module started, lab completed, quiz passed/failed |
| Firestore activity subcollection | `classes/{id}/activity/{eventId}` |
| Live feed in dashboard | Scrollable activity log with timestamps |
| Filter by student | Click student name to see their activity only |
| Activity indicators | Badges showing recent activity in roster |

### Sprint HD-5: Export / Reports
**Priority:** Critical for institutional sales

| Task | Description |
|------|-------------|
| CSV export (grades) | Student name, assignment, score, completion date |
| CSV export (progress) | Student name, module, completion %, time spent |
| Class summary report | Overall stats, completion rates, at-risk students |
| LMS-compatible format | Match Canvas/Blackboard gradebook CSV format |
| Print-friendly view | Clean layout for printing class reports |

### Sprint HD-6: Analytics Dashboard
**Priority:** Medium — polish for sales demos

| Task | Description |
|------|-------------|
| Completion trend chart | Line graph showing class progress over time |
| Module difficulty heatmap | Which modules students struggle with |
| Time-on-task analysis | Average time per module/lab |
| Gamified leaderboard | Per-class student rankings (opt-in) |
| Comparative analytics | Compare cohort performance across semesters |

---

## Go-To-Market Strategy

### Phase 0: Operational Professionalism (IMMEDIATE)
Before any external pitch, present like a SaaS vendor:
1. **Product One-Pager** — what it is, features, cost comparison, pilot offer (PDF/web)
2. **Trust / About Page** — hosted on Firebase, browser-based, secure auth, data exportable
3. **Privacy Statement** — where data lives (Google Cloud), FERPA considerations, no third-party sharing
4. **Uptime Statement** — "Hosted on Google Firebase infrastructure" = instant credibility
5. **Instructor Quickstart** — "Create class → share code → done" (remove perceived complexity)

### Phase 1: Proof (Current Priority)
1. Run one real class on Hexworth
2. Use: cohorts, instructor desktop, labs
3. Collect: student feedback, instructor workflow notes, screenshots, metrics
4. Result: **proof** — proof sells faster than code

### Phase 2: Pilot Program
1. Identify 3-5 local colleges/training centers
2. Offer free pilot semester (1 cohort each)
3. Collect testimonials and usage data
4. Document deployment process
5. **NEW:** Offer trials — SaaS delivery makes this trivial (just a URL)

### Phase 3: Campus License Sales
1. Package: "Campus License" with cohort-based pricing
2. Sales materials: product one-pager, demo dashboard, sample reports, testimonials
3. Target: department chairs, IT directors, training program leads
4. Price: start at $3k/cohort, $15-30k/department, $30-60k/campus
5. **NEW:** Position as SaaS vendor, not GitHub project — admins pay vendors

---

## Design Principles for Institutional Features

1. **Looks institutional** — dark theme, clean cards, metrics-first layout
2. **Frictionless onboarding** — class codes, no IT setup, no SSO required
3. **Instructor-first KPIs** — show what teachers actually need (enrolled, completion, labs, time)
4. **Curriculum over features** — sell structured learning paths, not tool capabilities
5. **Export everything** — if data can't leave the platform into a gradebook, it blocks sales
6. **50-student sweet spot** — aligns with 95% of real classrooms, enables cohort pricing

## Pedagogical Framework: Crawl-Walk-Run

All Hexworth content follows a three-phase scaffolding model based on real student feedback.
**Full details:** `COURSE_DESIGN_PRINCIPLES.md`

| Phase | Role | Student Experience |
|-------|------|--------------------|
| **CRAWL** | Reference sheets, concept visuals, "why this matters" | "I understand the tools and why they exist" |
| **WALK** | Warmup drills, prep labs, guided practice, hints | "I've practiced the mechanics, I feel ready" |
| **RUN** | Full missions, multi-step challenges, independence | "That was hard, but I learned more than any lecture" |

### 4-Week Accelerated Delivery Model

Hexworth is designed for **bootcamp-paced academia** — 4-week compressed courses,
not traditional 15-week semesters. This changes everything about instructional design.

| Week | Goal | Scaffolding Ratio |
|------|------|-------------------|
| **Week 1** | Foundations + Confidence | 20% concept / 80% tiny labs (CRAWL heavy) |
| **Week 2** | Controlled Challenge | Guided → Semi-guided → Mission (WALK → RUN) |
| **Week 3** | Realism + Complexity | Mostly missions with real-world framing (RUN) |
| **Week 4** | Capstone + Mastery | Minimal guidance, prove competence (RUN) |

**Key insight:** The lab-first, mission-based approach is already the correct pedagogy for accelerated formats. The only thing missing is micro-scaffolding, not structural overhaul. We reduce friction, not difficulty.

### 6 Highest-ROI Actions (No Curriculum Rewrite)

1. Command cheat sheet per topic (distributed Day 1)
2. Warmup drills every class (5-10 min micro-labs)
3. Prep lab before each mission (guided mini-version)
4. Visual diagrams for abstract concepts (permissions, processes, trees)
5. Progressive hint system + checkpoint saves
6. End-of-week debrief (reflection + common mistakes recap)

---

## Key Metrics to Track

### Platform Health
- Number of active classes
- Number of enrolled students
- Average completion rate per class
- Most/least used content modules

### Sales Readiness
- [x] Student join flow working (HD-2)
- [x] Progress tracking functional (HD-3)
- [x] Export to CSV working (HD-5 — roster, assignments, grades, progress)
- [x] Print-friendly class report with at-risk alerts (HD-5)
- [ ] Activity log showing real events (HD-4)
- [ ] One real class completed successfully
- [ ] Student feedback collected
- [ ] Instructor workflow documented
- [ ] Screenshots / walkthrough GIF in README (external audit)
- [ ] Offline vs Online mode explanation (external audit)
- [ ] Privacy / data handling statement (external audit)

---

*"Adding instructor desktop + cohorts moved you from 'interesting project' to 'sellable institutional software.' Browser-based SaaS delivery moved you from 'sellable' to 'pilot-ready.' You're not years away from revenue — you're months away."*

### The Mindset Shift

Stop thinking: "This is my teaching tool."
Start thinking: "This is a web application that happens to be used in my class."

Tools stay local. Web apps scale.

---

## External Audit Findings (February 5, 2026)

**Context:** Cold review of GitHub repo + live site by an outside party with zero context.

### Verdict
> "This is not a toy. The scope reads like a real LMS-adjacent platform with strong gamification and a unique theme layer. The main gap is not vision — it's onboarding clarity + proof."

### What Works
- Vision and scope are ambitious but clear
- Instructor toolset reads as real classroom operations
- Firebase architecture is visible and sensible
- README covers features in detail

### Critical Gaps Identified

**Priority order for "take academia by storm":**

| Gap | Impact | Sprint |
|-----|--------|--------|
| **Offline vs Online explanation** | Confusing — README says "no internet required" but Google sign-in is core | README update |
| **Screenshots in README** | No visual proof of instructor dashboard, reports, exports | Asset creation |
| **Architecture diagram** | No visual showing Browser → Firebase Auth → Firestore + localStorage | README or docs |
| **30-day class template** | Turns platform from "cool tool" to "plug-and-play delivery system" | Content sprint |
| **Privacy / data handling statement** | Education buyers will ask about FERPA, data residency, security | Policy doc |
| **Walkthrough GIF/video** | 60-second flow: sign in → sort → assign → complete → handler sees progress | Asset creation |

### Recommended New Sprint: OB-1 (Onboarding & Trust)

A documentation/assets sprint — no code, just presentation:

| Task | Deliverable |
|------|-------------|
| Clarify offline vs online modes | README section or landing page callout |
| Capture 5 key screenshots | Landing, sorting, student dashboard, handler dashboard, class report |
| Create architecture diagram | Simple box diagram for README |
| Write privacy/data statement | Where data lives, how it's secured, FERPA considerations |
| Build 30-day syllabus template | Downloadable PDF or in-app template |
| Record walkthrough GIF | 60-second full-flow demo |

**Why this matters:** The code is there. The features are built. But a cold visitor can't tell that in 30 seconds. This sprint closes the gap between "what we built" and "what people can see we built."

---

*Last Updated: February 5, 2026*
