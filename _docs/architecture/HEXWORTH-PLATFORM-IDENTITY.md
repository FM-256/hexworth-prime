# Hexworth Platform Identity

**Status:** AUTHORITATIVE — supersedes any course-specific design doc on conflicting points.
**Origin:** Synthesized from operator decisions across 2026-04 → 2026-05-30, anchored by the 2026-05-30 WSA redesign session where the principles were articulated explicitly.
**Audience:** Anyone (operator, primary, agents, future contributors) authoring or reviewing Hexworth course content.

## Purpose

This document defines Hexworth's identity as a teaching platform. It is not a WSA doc. WSA was the first course where these principles got articulated explicitly, but they apply to every course we build — current (WSA, PIS, Eth-IT, ALA, COP1034C, CIS2253, etc.) and future.

When designing or reviewing course content, refer here for: what kind of platform Hexworth is, how it teaches, what voice it speaks in, how it organizes knowledge, and what makes it Hexworth and not Pluralsight / Microsoft Learn / Educative / generic LMS.

When this document and a course-specific design doc conflict, this document wins. Course-specific docs may EXTEND with course-specific applications, but they cannot contradict the platform identity.

---

## Part 1 — Ethos (what kind of platform Hexworth is)

### 1.1 Completeness over brevity

Every course teaches what it claims to teach. If a checklist says 7 items, the course teaches all 7. If a topic has unfilled angles that matter, the course fills them. The opposite is the textbook failure mode: padding ideas with filler to look thorough, or truncating ideas to keep slide-count low. We reject both.

The test:
- *"Does this artifact finish the thought it started?"* → if no, it's incomplete (bad — extend it or add a successor)
- *"Does this artifact say more than the thought requires?"* → if yes, it's padded (bad — tighten)

Memory: `feedback_complete_thoughts_no_fluff.md`

### 1.2 Approachable, not friendly

We respect the student as someone becoming a professional. We do not condescend with academic distance. We also do not buddy-talk with casual chattiness. The distinction matters:

| Approachable (Hexworth does this) | Friendly (Hexworth doesn't) |
|---|---|
| "Once you've got the IP set, the next thing is DNS." | "Cool, now let's tackle DNS together!" |
| "This trips up a lot of people — let's slow down." | "Don't worry if this is confusing — you got this!" |
| Tutorial. Mentor. Knowledgeable peer. | Buddy. Pal. Cheerleader. |

Memory: `reference_wsa_voice_register.md` (WSA articulation; principle is platform-wide)

### 1.3 Instruction primary, reference secondary

Course content is primarily INSTRUCTION — it teaches forward, building competence progressively. Reference quality (scannability, lookup-friendliness) is a benefit when the artifact IS scannable, but when reference quality and instruction quality conflict, instruction wins. We are not building a reference manual.

### 1.4 Decks stand alone

Presentation decks are complete on their own. They are not pair-and-rely with labs. Labs reinforce. Decks are the source of truth for what the course teaches; labs are where students practice it. This means decks carry the full content the course claims to deliver — not the lecture-half of a lecture+lab pair.

### 1.5 Break down concepts at introduction

If a slide / lab / artifact introduces a concept, the breakdown of that concept MUST be present at first appearance. "Introduce a concept" includes commands, parameters with non-obvious names, acronyms, technical terms, tools, protocols, and abstractions.

The bad failure mode: showing the END STATE without explaining the HOW. Example: a slide that shows `New-NetIPAddress -PrefixLength 24` graphically without telling the student what `-PrefixLength 24` means.

What "broken down" means: enough explanation to remove the mystery at this slide's spiral depth (see Part 2.4). Not a textbook deep-dive. Just enough.

Where the breakdown lives: right-page visual (labeled diagram with plain-English explanations), inline annotation in the code block, a key-terms callout, or a successor slide if the next slide is dedicated to it. NOT a hover tooltip, NOT a footnote, NOT "covered later" without "later" being the very next slide.

Memory: `feedback_break_down_concepts_on_introduction.md`

### 1.6 Quality over speed (existing platform rule)

From `CLAUDE.md` — non-negotiable. This platform serves real students. Every broken page, every untested function, every rushed deployment is a failure that impacts real people. Verified before shipped; precise over fast.

Memory: existing — `precision over speed` operating principle.

### 1.7 The four-feeling outcome — every module ends with all four

When a student finishes a module, they should carry FOUR feelings forward simultaneously — not one dominant, not a pick-one. The combination IS the becoming-a-professional posture:

| Feeling | What it means | Design implication |
|---|---|---|
| **Empowered** | "I have agency. I can DO this." | Action-oriented closings ("you can now ___"). Demonstrate the student's capability. No passive framing. |
| **Confident** | "I've got this. I know what I know." | Positive reinforcement at module ends. "Key takeaway" boxes name what the student now understands. No language that plants doubt ("if you're confused..."). |
| **Equipped** | "I have tools. I know what's in my toolkit." | The Skills Toolkit metaphor is VISIBLE in the course UX. Each module adds tools to a visible inventory the student can see grow. |
| **Curious** | "I want more. What's next?" | Module summaries preview the next module. Plant intrigue. Show how the next module deepens or extends. |

Pairwise:
- **Empowered + Confident** = "I can do this AND I know I can"
- **Equipped + Curious** = "I have tools AND I want more"

The four together = a student becoming a professional, not a student passing a test.

This shapes the **module summary slide pattern** specifically. Every module's final slide hits all four:
1. **What you can now do** (empowered)
2. **What you can claim to know** (confident)
3. **What's in your toolkit** (equipped)
4. **What the next module deepens / explores** (curious)

It also shapes the **module intro slide** pattern. The "What You'll Learn" left page also previews the four feelings — by the end of this module you'll be able to ___, confident in ___, with these new tools, ready to explore ___ next.

It also implies (and answers) the visible-vs-implicit Skills Toolkit question: the toolkit IS visible. The "equipped" feeling depends on the student SEEING what they've accumulated; an invisible toolkit doesn't deliver the feeling.

Memory: `reference_wsa_four_feeling_outcome.md` (forthcoming as part of this principle)

---

## Part 2 — Pedagogy (how Hexworth teaches)

### 2.1 Courses anchor to syllabi

Every Hexworth course is anchored to a formal syllabus — typically a Keiser University Master Syllabus. The syllabus is the **minimum coverage bar**. Authoring a course from a title alone is forbidden.

For each course:
- Identify the catalog code (e.g., CTS1328C for WSA, CIS2350C for PIS).
- Find the Keiser MS at `~/hexworth-shared/Raw sources/Faculty docs/` (75+ syllabi catalogued).
- Read it. Map module content to syllabus outcomes.
- Detect coverage gaps and over-coverage (drift).

Memory: `feedback_courses_anchor_to_syllabus.md`, `reference_keiser_syllabi_catalog.md`

### 2.2 Anchor governs, overlay extends

Keiser MS is the anchor. Industry credentials (Microsoft AZ series, CompTIA, LPIC, etc.) are **expansion overlays** that extend hubs and courses with cert-prep tracks and specialization. Overlays never override the anchor — they layer on top, in clearly-marked expansion modules.

Order of authority: Keiser MS > expansion overlay > author preference.

### 2.3 Lego course structure

Each module is a self-contained Lego block when paired with its labs + quiz. The course is a kit; modules click together to build a competence outcome. First few modules are foundation blocks (more grounding, no assumed prereqs); later modules layer onto foundations.

Each module:
- Stands alone when combined with its labs+quiz (no cross-deck "as we saw in m07..." references)
- Identifies its Lego role: foundation / specialization / integration / capstone
- Ends with explicit "you can now ___" outcomes that name the skills added

Memory: `reference_wsa_lego_structure.md` (WSA articulation; principle is platform-wide)

### 2.4 Spiral curriculum — progressive depth

Concepts get introduced at gist-level on first appearance. Subsequent module slots deepen the same concept. We do NOT dump everything about a topic on its first mention. A topic's full depth is the FULL SPIRAL ACROSS MODULES, not any single module.

Example: WSA touches DNS at gist in m01 (initial config — just point the resolver at a DNS server). m08 takes the DNS spiral turn (recursive resolution, zones, records). m15 might spiral DNS again in AD-sites context.

Each module's "completeness" measures against ITS spiral turn, not against the topic's full conceptual universe.

Memory: `reference_wsa_spiral_curriculum.md` (WSA articulation; principle is platform-wide)

### 2.5 Coverage is syllabus-driven, not audience-persona-driven

We don't design slides around hypothetical audience personas. We design from the syllabus outcomes outward, fanning out per topic based on what the systems being taught require to function. The audience emerges from the syllabus.

---

## Part 3 — Voice & tone

### 3.1 Centrist register

Voice never swings extreme. Not dictionary-dry / academic / encyclopedia-prose (too cold). Not chatty / casual / joke-laden / friend-talking-to-friend (too informal). We hold the center.

### 3.2 Per-slide-shape register

Within the centrist hold, register adjusts to the slide's role:

**INTRO register** — for WHAT / WHERE / WHEN / WHO / reference slides:
- Instructional but readable
- Technical-not-bland; not dictionary-dry
- Direct sentences, active voice, factual with rhythm
- Concrete examples over abstract definitions

**BREAKDOWN register** — for HOW / WHY / SUMMARY slides + labs:
- Warm-mentor / tutor mode
- Anticipates confusion, addresses before it lands
- Builds student confidence
- Bonds the student to the platform (Hexworth as a teaching environment that pulls students forward)

Job of the breakdown voice: confidence-building + platform-bonding. This is a brand-relationship voice, not neutral instruction.

### 3.3 Voice rules (apply to both registers)

- No emoji in body text (webp icons only; existing platform rule)
- No em-dashes (existing operator preference)
- No first-person plural framing as default ("we'll explore..." → use "you'll set..." or imperative)
- No exclamation points in technical content (except as syntax)
- No filler phrases ("as we mentioned earlier", "it is important to note", "in this section we'll cover", "let's dive in")
- No fake casual ("Sweet!" / "Awesome!" / "Cool!")
- No fabricated lived-experience first-person ("I remember when learning...")

Memory: `reference_wsa_voice_register.md` (WSA articulation; principle is platform-wide)

---

## Part 4 — Slide / content pattern

### 4.1 Open-book layout

Every slide is two pages:
- **Left page** = text content (the words)
- **Right page** = visual that illustrates the text (image / animation / SVG / diagram)

The two pages tell the same story in different modalities. The visual is not decoration; it carries the same content in visual form.

### 4.2 5W1H monomial coverage rule

Topics decompose into monomials — atomic angles of explanation: **WHO / WHAT / WHERE / WHEN / WHY / HOW**.

Rule: do not crunch multiple monomials into one slide. Each monomial that the topic genuinely requires gets its own slide. The model is a **coverage rule**, not a **slide-count formula** — different topics need different monomial subsets, not every topic spans all six.

Slide count per topic emerges from the topic's actual coverage requirement at its spiral turn, not from a template.

Memory: `feedback_monomial_is_coverage_rule.md`

### 4.3 Content-fit rule — no crunch

If content does not fit at a readable font size within the slide frame, it flows to a successor slide (not a smaller font, not tighter spacing). Successor slides carry the same monomial label with a sub-index (e.g., `HOW (1/2)`, `HOW (2/2)`).

### 4.4 Visual aesthetic — siem.gif lineage (when motion serves)

Animated visuals follow this style language:
- Dark background with a subtle grid texture
- Labeled real components (never abstract dots/lines)
- Per-step color palette for sequential animations (blue / cyan / purple / orange / green for steps 1-5)
- Numbered step badges pulsing in sequence
- "Packets" / flow tokens gliding along arrow paths during their step's window
- Subtle node-glow on active elements
- Terminal answer pill landing the takeaway
- 6-10 second cycle loops

Reference: `siem.gif` at `~/hexworth-shared/images/format & content comparison/siem.gif`
Canonical implementation: `_docs/architecture/wsa-redesign/samples/dns-HOW.sample.html`

### 4.5 Format selection for right-page visuals

| Story shape | Format | Why |
|---|---|---|
| Labeled flow / topology / process | **Animated SVG (default)** | Vector, editable, ~5-10KB, matches siem aesthetic, Karl-readable text |
| Static comparison / roadmap | **Static SVG or PNG** | No motion needed; vector still wins |
| Character / illustration warmth (module intros) | **Lottie** | Polish ceiling; ~5% of slides max |
| Screen recording of UI (PowerShell session, GUI clicks) | **MP4 or animated GIF** | Real software capture; where applicable |

### 4.6 Reference-style slides use the open-book pattern too

Slides that present catalog content (operator tables, menu references, command reference cards) are still INSTRUCTION at the module's spiral turn — left page = brief framing ("here are the X you'll reach for most"), right page = visualized table/grid with the most-used items highlighted. They are not standalone catalog cards detached from instructional voice.

Memory: `reference_wsa_slide_pattern.md` (WSA articulation; principles 4.1-4.6 are platform-wide)

---

## Part 5 — Process & governance

### 5.1 Per-module redesign cadence

Serial m01 → m02 → ... with operator review between modules. Foundation modules first; validate the pattern works at foundation depth; then specialize. Parallel batch fan-out would mean discovering pattern-failures in many places at once.

### 5.2 Reviewer roles

| Reviewer | Role | When |
|---|---|---|
| Karl | Citation auditor + structural QC on solutions docs | Before content with citations or evidence-bearing artifacts ships |
| Nancy / adversarial-reviewer | Devil's advocate on any code/design change | Before any non-trivial edit |
| Bridget | Three-way sync auditor (HTML ↔ Firestore ↔ Confluence) for quizzes | Before quiz HTML/keys commits |
| Wes | Technical writer for ops runbooks, architecture docs, READMEs | When a feature ship needs documentation |

Per-course redesign reviews happen at module boundaries.

### 5.3 Don't authorize beyond what was authorized

Authorization scope is literal. "Do X as a sample" means do X, show, stop. Do not fan out. Do not commit. Do not proceed beyond what was asked.

Memory: existing — `feedback_authorization_scope_is_literal.md`, `feedback_stay_on_the_asked_task.md`

### 5.4 We do not destroy

Files, scripts, branches, content — never delete as cleanup. Diagnostic scripts stay. Reproducible utility outweighs tidiness. When state has been polluted, archive then restore — do not `git checkout --` to discard.

Memory: existing — `feedback_we_do_not_destroy.md`

### 5.5 100% sure before changing

Never commit/deploy/edit without rendering or running the affected artifact. "Structural argument" + "static metrics look right" are NOT 100%.

Memory: existing — `feedback_100_percent_sure.md`

---

## Part 6 — Identity summary

If forced to describe Hexworth in one paragraph:

> Hexworth is a syllabus-anchored teaching platform that builds career-track competence through Lego-block courses with spiral curricula. Decks stand alone as complete instruction, paired with labs and quizzes that reinforce. Voice is centrist and approachable but not friendly — instructional in intros, warm-mentor in breakdowns. Slides are open-book diptychs: left page words, right page visual. The visual aesthetic is labeled real-component topologies with sequential step animation (the siem.gif lineage), built in animated SVG. Quality over speed; completeness over brevity; instruction over reference when they conflict. The platform respects the student as a professional in training, never condescending and never buddy-talking.

That's Hexworth.

---

## How to use this document

**When designing a new course:** Read this end-to-end. Apply Parts 1-5 to course planning. The syllabus anchor is the FIRST decision; everything else follows.

**When redesigning an existing course:** Same — read this end-to-end. Compare current state against each part. Document drift. Plan correction.

**When authoring a single slide or artifact:** Apply Part 4 (slide pattern) + Part 3 (voice) at minimum. Reference Parts 1-2 for the broader frame.

**When reviewing content:** Use this as the rubric. Does it honor the ethos? Match the voice? Follow the slide pattern? Sit correctly in the Lego/spiral structure?

**When the principles need updating:** Operator decision required. This doc is the platform identity, not a working draft. Updates go in via a clearly-noted version + date.

---

## Where each principle's detail lives

| Part | Detail in |
|---|---|
| 1.1 Completeness | `feedback_complete_thoughts_no_fluff.md` (memory) |
| 1.2 Approachable not friendly | `reference_wsa_voice_register.md` (memory) |
| 1.3 Instruction primary | this doc (origin) |
| 1.4 Decks stand alone | this doc (origin) + WSA workspace README |
| 1.5 Quality over speed | existing platform rule (CLAUDE.md) |
| 2.1 Syllabus anchor | `feedback_courses_anchor_to_syllabus.md` (memory) |
| 2.1+ Syllabi catalog | `reference_keiser_syllabi_catalog.md` (memory) |
| 2.2 Anchor governs | `feedback_courses_anchor_to_syllabus.md` |
| 2.3 Lego structure | `reference_wsa_lego_structure.md` (memory; principle is platform) |
| 2.4 Spiral curriculum | `reference_wsa_spiral_curriculum.md` (memory; principle is platform) |
| 2.5 Syllabus-driven coverage | embedded in 2.1 + spiral memory |
| 3.x Voice & tone | `reference_wsa_voice_register.md` (memory; principle is platform) |
| 4.x Slide pattern | `reference_wsa_slide_pattern.md` (memory; principles are platform) |
| 4.x Monomial model | `feedback_monomial_is_coverage_rule.md` (memory) + `_docs/architecture/wsa-redesign/MONOMIAL-MODEL.md` (workspace doc) |
| 4.4 siem.gif aesthetic | reference image at `~/hexworth-shared/images/format & content comparison/siem.gif`; canonical sample at `_docs/architecture/wsa-redesign/samples/dns-HOW.sample.html` |
| 5.x Process | various existing CLAUDE.md rules + linked feedback memories |

Note on memory-file naming: several memory files use the `wsa-` prefix because they were articulated during the WSA redesign session (2026-05-30). The principles themselves are platform-wide; the WSA-prefixed files are the articulation source. Future course-specific applications can be authored alongside without re-articulating the principles.

---

## Decision log

| Date | Decision | Made by |
|---|---|---|
| 2026-05-30 | Document created; consolidates session insights into platform identity | operator + primary |
| 2026-05-30 | All future Hexworth courses anchor to a Keiser MS syllabus; AZ-series + other industry credentials are expansion overlays | operator |
| 2026-05-30 | Open-book + monomial + siem-style aesthetic + centrist voice + Lego structure + spiral curriculum are platform-wide patterns (not WSA-specific) | operator |
| 2026-05-30 | Instruction wins over reference when they conflict | operator + spiral implication |
| 2026-05-30 | Decks stand alone as complete instruction (not pair-and-rely with labs) | operator |
