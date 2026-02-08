# Hexworth Prime - Course Design Principles

**Created:** February 5, 2026
**Source:** Real student feedback from Linux course delivery
**Status:** Active — applies to all new Hexworth content
**Referenced by:** `PRODUCT_DIRECTION.md`, `SPRINT_BACKLOG.md` (L-Series)
**Template:** `SYLLABUS_TEMPLATE.md` — fill-in-the-blank syllabus for any course using this framework

---

## Core Philosophy

> The course is NOT structurally broken. It's strong.
> What exists is: **high rigor + low scaffolding** — which is fixable
> and honestly the best problem to have. Much easier than "students bored."
> We're tuning, not rebuilding.

---

## Teaching Environment: Bootcamp-Paced Academia

Hexworth is not designed for traditional 15-week semesters.
It's designed for **accelerated, compressed delivery** — which changes everything about instructional design.

### The Reality

| Factor | What It Means |
|--------|--------------|
| 1 course = 4 weeks | No slow ramp, no "we'll cover it later" |
| 10-30 students per section | Large enough to have silent strugglers |
| Multiple cohorts | Rolling monthly starts |
| Adult learners | Many working students, varying schedules |
| Mixed preparedness | Wide skill gaps in every section |
| Same content load | Full rigor, compressed timeline |

### What We're Optimizing For

| NOT This | THIS |
|----------|------|
| Slow theory absorption | Rapid skill acquisition |
| Classical lecture models | Operational competence |
| Academic knowledge retention | Workforce readiness |

This is closer to **military training, cert bootcamps, trade schools, and applied tech institutes** than classical university lecture models.

### The Constraints

| Category | Reality |
|----------|---------|
| **No time for:** | Extra lectures, more theory, slower pacing, 2-week foundations, extended remediation |
| **Risks:** | Cognitive overload, early confidence loss, falling behind quickly, no recovery time |
| **Requirements:** | Fast wins, visible progress, tight structure, guided autonomy |

### The Key Insight

> The lab-first, mission-based approach is already the correct pedagogy for this format.
> The only thing missing is **micro-scaffolding**, not structural overhaul.
> You don't redesign the course. You **tighten the on-ramp**.

What students feel isn't "bad design" — it's "compressed time pressure," which is unavoidable in 4-week blocks. The job becomes: **reduce friction, not difficulty**.

---

## The Crawl-Walk-Run Framework

Every Hexworth learning unit follows a three-phase scaffolding model.
This replaces the old pattern of `lecture -> mission` with a progressive ramp.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   CRAWL           WALK              RUN                 │
│   ─────           ────              ───                 │
│   Guided          Semi-Guided       Independent         │
│   Examples        Practice          Mission             │
│   Reference       Warmups           Challenge           │
│   "Watch me"      "Try with help"   "Do it yourself"    │
│                                                         │
│   ◄──── confidence builds ────►                         │
│   ◄──── hints decrease ────────►                        │
│   ◄──── complexity increases ──►                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Phase 1: CRAWL (Foundation)

**Goal:** Build tool familiarity and mental models before any mission.

| Element | What It Is | Example |
|---------|-----------|---------|
| Quick Reference | 1-page cheat sheet for the topic | Linux command ref (nav, files, search, permissions, flags) |
| Concept Visuals | Diagrams that build mental models | Directory tree, permission matrix, process lifecycle |
| "Why This Matters" | One-liner connecting task to real world | "In production, you'd use this to find which service is leaking memory" |
| Worked Examples | Instructor shows solution step-by-step | "Here's how I'd find a suspicious log entry using grep" |

**Student experience:** "I understand what the tools are and why they exist."

### Phase 2: WALK (Guided Practice)

**Goal:** Build command confidence through low-stakes repetition.

| Element | What It Is | Example |
|---------|-----------|---------|
| Command Warmups | 5-10 min micro-drills | Find this file. Grep this log. Change these permissions. |
| Mission Prep Labs | Guided mini-version of upcoming mission skills | Before log analysis mission: practice grep, cut, less on sample logs |
| Hint System | Progressive hints (Hint 1 → Hint 2 → Solution) | Keeps struggle productive, not frustrating |
| Checkpoints | Save states within multi-step tasks | Can recover from mistakes without full restart |

**Student experience:** "I've practiced the mechanics. I feel ready for the real thing."

### Phase 3: RUN (Independent Mission)

**Goal:** Apply skills to realistic, multi-step challenges with minimal guidance.

| Element | What It Is | Example |
|---------|-----------|---------|
| Full Missions | Multi-step independent challenges | Analyze compromised server logs, identify the attack vector |
| Real-World Scenarios | Context-rich problems | "Your SOC detected unusual traffic at 3am..." |
| Productive Struggle | Hard but fair — no dead ends | Always a path forward, even if not obvious |
| Recovery Options | Reset points if truly stuck | Quick reset to last checkpoint, not full restart |

**Student experience:** "That was hard, but I learned more than any lecture."

---

## 4-Week Accelerated Course Model

Crawl-Walk-Run mapped to a compressed 4-week delivery cycle.
Each week has a clear goal and shifts the scaffolding ratio progressively.

```
WEEK 1          WEEK 2          WEEK 3          WEEK 4
Foundations     Controlled      Realism +       Capstone +
+ Confidence    Challenge       Complexity      Mastery

20% concept     guided →        mostly          minimal
80% tiny labs   semi-guided →   missions        guidance
                mission

CRAWL ████████  WALK ████████   RUN █████████   RUN █████████
WALK  ██        CRAWL ██        WALK ██         (ownership)
```

### Week 1: Foundations + Confidence

**Goal:** Remove command fear. Confidence early = persistence later.

| Day | Focus |
|-----|-------|
| Day 1-2 | Guided drills (CRAWL + WALK) |
| Day 3 | Small challenges (WALK) |
| Day 4 | Mini mission (WALK → RUN transition) |
| Day 5 | First real mission (RUN) |

**Structure:** 20% concept / 80% tiny labs

**Must include:**
- Command cheat sheet (distributed Day 1)
- Walkthrough examples (instructor shows, then students repeat)
- Zero-stakes repetitions (mistakes cost nothing)

**Rationale:** Students who build confidence in Week 1 persist through Weeks 3-4.

### Week 2: Controlled Challenge

**Goal:** Build independence safely. Students stretch without drowning.

| Element | Progression |
|---------|-------------|
| Start | Warmup lab (WALK) |
| Middle | Guided example → Practice (WALK) |
| End | Full mission (RUN) |

**Structure:** Guided → Semi-guided → Mission

**Must include:**
- Progressive hints (Hint 1 / Hint 2)
- Recovery steps (checkpoint saves)
- Prep labs before each mission

**Rationale:** This is where the WALK → RUN handoff happens. Get this right and Week 3 flows.

### Week 3: Realism + Complexity

**Goal:** Think like an analyst. Transfer skills to real-world scenarios.

| Element | Focus |
|---------|-------|
| Start | Short prep lab (WALK) |
| Middle | Big scenario mission (RUN) |
| End | Debrief / reflection |

**Structure:** Mostly missions with real-world framing

**Must include:**
- "Why this matters" context before every scenario
- Multi-step challenges that mirror actual job tasks
- Debrief discussions (what worked, what didn't)

**Rationale:** Students stop following steps and start thinking. This is where competence lives.

### Week 4: Capstone + Mastery

**Goal:** Prove competence. Students own their knowledge.

| Element | Focus |
|---------|-------|
| Start | Final prep (minimal) |
| Middle | Full capstone mission |
| End | Reflection + skills checklist |

**Structure:** Minimal guidance — this is assessment

**Must include:**
- Capstone that integrates multiple weeks' skills
- Self-assessment checklist (what can I now do?)
- No hand-holding — hints available but minimal

**Rationale:** Ownership + demonstrated competence. Students leave knowing what they can do.

### Friction-to-Fix Mapping (By Week)

| Student Friction | Which Week Fixes It | How |
|-----------------|--------------------|----|
| Syntax errors | Week 1 | Guided drills, cheat sheet, zero-stakes reps |
| Command confusion | Week 1 | Quick reference, warmup micro-labs |
| Overwhelm | Week 1-2 | Progressive ramp, not all-at-once |
| Logs hard to interpret | Week 2-3 | Visual diagrams + prep labs before log missions |
| Missing steps / got lost | Week 2-3 | Hints, checkpoints, recovery paths |
| Wanted more time | Week 1-2 | Prep labs compress learning, not calendar |

> Nothing requires adding weeks. Only redistributing support.

---

## Classroom Management (10-30 Students)

Large sections amplify specific problems: quiet students falling behind, syntax frustration compounding silently, shame in asking questions. These low-cost instructor moves address that.

### Per-Class Practices

| Practice | When | Cost | Impact |
|----------|------|------|--------|
| 5-min "Common Mistakes" recap | Start of each class | Trivial | Normalizes errors, prevents repeat mistakes |
| Anonymous "stuck" poll | Mid-lab | Low | Surfaces silent strugglers without shame |
| Post-lab debrief | End of each lab session | Low | Collective sense-making, shared learning |
| Shared error wall ("Today's Top 3 Mistakes") | End of class | Trivial | Makes mistakes visible + educational |
| Quick command demo before lab | Before each mission | Low | Reduces syntax friction by 50%+ |

### Why These Matter

- In 10+ student sections, **quiet students fall behind invisibly**
- Syntax frustration is **contagious** — one stuck student affects neighbors
- Anonymous polls **remove shame** from asking for help
- Error walls **normalize mistakes** — "everyone hit this, here's why"
- These dramatically reduce **silent struggle** with near-zero instructor effort

---

## Friction Analysis (From Real Student Feedback)

### What Students Said vs What It Actually Means

Each friction category maps to a specific fix, not a redesign.

---

### Friction 1: Syntax & Command Mechanics

**Symptoms:**
- Small syntax errors stopped progress
- Wrong file paths
- Didn't know which flags to use
- Didn't realize `cat` would solve it faster
- "Too much just type this"
- Spent time guessing commands
- Needed quick reference

**Diagnosis:** Tool friction, NOT cognitive difficulty.
Students understand concepts but the terminal blocks them.
"I know what to do, but I can't get the command right."

**Root Cause:** Missing command familiarity, flags awareness, common patterns, Linux "muscle memory."

**Fix — CRAWL Phase:**

| Action | Priority | Effort |
|--------|----------|--------|
| 1-page Linux Quick Reference (nav, viewing, search, permissions, common flags) | High | Low |
| Command warmup micro-drills before each mission (5-10 min) | High | Medium |
| Flag reference tooltips in lab terminals | Medium | Medium |

**Hexworth Implementation:**
- Quick Reference = static reference page per house/course
- Warmups = new "Prep Lab" applet type (short, low-stakes, timed optional)
- Flag tooltips = PSTerminal.js enhancement (hover/help integration)

---

### Friction 2: Scaffolding & On-Ramp

**Symptoms:**
- Wished for more time
- Needed clearer hints
- Needed examples first
- Steps skipped, got lost
- Hard to recover if missed a prompt
- More guided practice requested

**Diagnosis:** Mission difficulty hits too quickly.
Not that the mission is bad — the ramp is steep.
Students jump from `lecture -> mission` instead of `example -> guided -> semi-guided -> mission`.

**Root Cause:** Classic scaffolding gap. Missing the WALK phase entirely.

**Fix — WALK Phase:**

| Action | Priority | Effort |
|--------|----------|--------|
| Mission Prep Labs (guided mini-version of same skills) | Critical | Medium |
| Progressive hint system (Hint 1 → Hint 2 → Full Solution) | High | Medium |
| Checkpoint saves within multi-step tasks | Medium | High |
| "Getting Started" section at top of each mission | High | Low |

**Hexworth Implementation:**
- Prep Labs = dedicated HTML per mission, uses same terminal/GUI components
- Hint system = collapsible hint panels (already prototyped in WSA labs)
- Checkpoints = localStorage state saves at key steps
- Getting Started = first task card always shows orientation/context

---

### Friction 3: Concept Visualization

**Symptoms:**
- Logs hard to interpret
- Services/processes feel abstract
- Permissions confusing
- Ownership tricky
- "Hard to visualize"
- System processes unclear

**Diagnosis:** Mental models are missing.
Students memorize commands without seeing how systems connect.
Linux especially needs: directory mental map, permission logic, process lifecycle.

**Root Cause:** Text-only instruction for inherently visual systems.

**Fix — CRAWL Phase (Visuals):**

| Action | Priority | Effort |
|--------|----------|--------|
| Directory tree diagrams (interactive) | High | Medium |
| Permission matrix visualization | High | Medium |
| Process boot flow diagram | Medium | Medium |
| Service dependency diagrams | Medium | Medium |

**Hexworth Implementation:**
- These are the EXACT type of thing Hexworth excels at (interactive visualizers)
- Existing infrastructure: visualizer components from Web house (OSPF, STP, ACL, etc.)
- Reuse the same interactive diagram pattern for Linux concepts
- Even 3-4 simple graphics would drastically reduce confusion

---

### Friction 4: Purpose Gap ("Why?")

**Symptoms:**
- Commands felt mechanical sometimes
- Wanted explanations of why steps matter
- Wanted real-world connection earlier

**Diagnosis:** Students are motivated by purpose.
When purpose is clear, effort increases. Some steps feel procedural instead of meaningful.

**Root Cause:** Missing the "so what" connector between command and consequence.

**Fix — Every Phase:**

| Action | Priority | Effort |
|--------|----------|--------|
| Add "In the real world..." one-liner before tasks | Critical | Trivial |
| Scenario framing at mission start | High | Low |
| Career connection callouts | Medium | Low |

**Hexworth Implementation:**
- Instruction panels already exist in all labs
- Add a `.context-callout` styled block before task instructions
- Template: "In production, you would use this to [real consequence]"
- Tiny change. Big engagement boost.

---

### Friction 5: Recovery & Dead Ends

**Symptoms:**
- If missed a step, hard to recover
- Felt stuck
- Second-guessing
- Restarting entire labs

**Diagnosis:** Environment punishes mistakes too hard.
We want productive struggle, NOT dead ends.

**Root Cause:** Labs lack hint paths, reset points, and checkpoints.

**Fix — WALK + RUN Phases:**

| Action | Priority | Effort |
|--------|----------|--------|
| Progressive hint buttons (Hint 1 / Hint 2) | High | Medium |
| Quick reset to last checkpoint | High | High |
| "Are you stuck?" prompt after X seconds idle | Medium | Medium |
| Error recovery guidance (common mistakes → fixes) | Medium | Low |

**Hexworth Implementation:**
- Hint system = collapsible panels in instruction area (like Core 2 labs)
- Checkpoints = localStorage snapshots of lab state at key milestones
- Idle detection = simple timer, shows encouragement + first hint
- Error recovery = FAQ-style expandable section per common mistake

---

## What Is NOT a Problem (Preserve These)

Students reported frustration, mistakes, difficulty, and repeated attempts.

But they ALSO said: learned more, confidence increased, felt real, helped most, practical.

**That is healthy difficulty. Do NOT remove:**

| Keep | Why |
|------|-----|
| Challenge | Builds real competence |
| Multi-step tasks | Mirrors real work |
| Independent thinking | Develops problem-solving |
| Full missions | The signature Hexworth experience |
| Productive struggle | Where actual learning happens |

**The line:**
- Smooth friction (command syntax, missing scaffolding, dead ends)
- Preserve difficulty (multi-step missions, independent problem-solving, real scenarios)

---

## Implementation Priority (6 Actions, No Curriculum Rewrite)

These 6 changes reduce frustration ~40-50%, increase completion speed,
boost confidence, and keep rigor intact. No extra weeks needed.

| # | Action | Phase | Week | Effort | Impact |
|---|--------|-------|------|--------|--------|
| 1 | Command cheat sheet (per topic, distributed Day 1) | CRAWL | 1 | Low | High |
| 2 | Warmup drills every class (5-10 min micro-labs) | WALK | 1-2 | Medium | High |
| 3 | Prep lab before each mission (guided mini-version) | WALK | 2-3 | Medium | Very High |
| 4 | Visual diagrams (permissions, processes, directory trees) | CRAWL | 1-3 | Medium | Very High |
| 5 | Hint/recovery buttons (progressive hints + checkpoints) | WALK/RUN | 2-4 | Medium | High |
| 6 | End-of-week debrief (reflection + common mistakes recap) | ALL | 1-4 | Trivial | High |

---

## Mapping to L-Series Linux Sprints

The L-Series sprints in `SPRINT_BACKLOG.md` should integrate Crawl-Walk-Run:

### Per-Sprint Deliverables (New Standard)

Every L-Series sprint should produce:

| Deliverable | Phase | Description |
|-------------|-------|-------------|
| Quick Reference Page | CRAWL | 1-page cheat sheet for sprint topic |
| Concept Visualizer(s) | CRAWL | Interactive diagrams for abstract concepts |
| Warmup Micro-Labs | WALK | 3-5 short drills per mission (5-10 min each) |
| Mission Prep Labs | WALK | Guided mini-version of mission skills |
| Full Missions | RUN | Multi-step independent challenges |
| Hint System | WALK/RUN | Progressive hints per mission |
| Context Callouts | ALL | "Why this matters" one-liners |

### Example: L-1 (Linux Fundamentals) with Crawl-Walk-Run

```
CRAWL:
  - Quick Reference: file operations, permissions, search commands
  - Visualizer: directory tree explorer (interactive)
  - Visualizer: permission matrix (rwx visual calculator)
  - Context: "In production, wrong permissions = data breach"

WALK:
  - Warmup: navigate to 5 different directories (timed)
  - Warmup: find 3 files using different methods (find, locate, which)
  - Warmup: set correct permissions on 4 files
  - Prep Lab: guided log file analysis (grep + permissions combined)

RUN:
  - Mission: "A user reports they can't access shared files.
    Investigate permissions, fix ownership, verify access.
    Document what you changed and why."
  - Hints available (3 levels)
  - Checkpoint after each major step
```

---

## Platform-Wide Design Standards

These principles apply to ALL Hexworth content, not just Linux:

### 1. Every Lab Gets an Instruction Panel
Already built in Core 2 labs. Now collapsible. Standard going forward.

### 2. Every Mission Gets a Prep Lab
Small guided version of the same skills. 5-10 minutes. Low stakes.

### 3. Every Abstract Concept Gets a Visual
If students say "hard to visualize" — build a visualizer.
Hexworth's visualizer infrastructure is a competitive advantage. Use it.

### 4. Every Task Gets a "Why"
One line. Before the task. Real-world connection.
"In the real world, you would use this to..."

### 5. Every Multi-Step Lab Gets Hints + Checkpoints
Progressive hints (not answers). Checkpoint saves.
Productive struggle, never dead ends.

### 6. Every Topic Gets a Quick Reference
One page. Printable. Commands, flags, patterns.
Students WILL reference this during and after the course.

---

## Metrics to Track (Per Course/Module)

| Metric | What It Tells Us | Target |
|--------|-----------------|--------|
| Completion rate | Is the ramp right? | >80% |
| Time to first hint | Is scaffolding working? | >5 min before first hint |
| Hint usage rate | Are warmups effective? | <30% need Hint 2+ |
| Restart rate | Are checkpoints preventing dead ends? | <10% full restarts |
| Mission pass rate | Is the mission fair? | >70% first attempt |
| Student confidence (survey) | Is Crawl-Walk building confidence? | >4/5 average |

---

*"We only smooth friction. We preserve difficulty. That's the line."*

---

*Last Updated: February 5, 2026*
