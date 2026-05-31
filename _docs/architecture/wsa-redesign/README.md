# WSA Redesign Workspace

**Platform identity:** ⭐ All design decisions in this workspace flow from `_docs/architecture/HEXWORTH-PLATFORM-IDENTITY.md`. That doc is authoritative. WSA is the FIRST APPLICATION of the platform identity — not the source of one-off rules. Read it before any per-module work.

**Scope:** Windows Server Administration course (`_app/houses/cloud/modules/wsa/`) — presentation/slide decks only.
**Syllabus anchor (primary):** **CTS1328C** — *Managing and Maintaining Server Operating Systems* (Keiser University Master Syllabus). Located at `~/hexworth-shared/Raw sources/Faculty docs/CTS1328C MS Managing and Maintaining Server Operating Systems.docx` (also in `OneDrive_3_4-14-2026/`). All redesign decisions reference this syllabus as the minimum coverage bar.

**Expansion overlay (secondary):** Microsoft **AZ-series** certifications (AZ-800 Administering Windows Server Hybrid Core Infrastructure + AZ-801 Configuring Windows Server Hybrid Advanced Services) can be used to **expand** the WSA hub and course beyond the CTS1328C floor — for example, hybrid Azure integration topics, advanced-services content, certification-prep tracks. The AZ series does NOT replace CTS1328C as the anchor; it layers on top. Order of authority: **CTS1328C governs the core course; AZ-800/801 informs expansion modules + cert-prep tracks within the WSA hub.**
**Started:** 2026-05-30
**Status:** Pattern locked, fan-out pending operator approval.

## What this folder is

The design home for the WSA presentation deck redesign. Holds:

- The slide-design contract (the monomial model)
- Canonical visual samples
- The fan-out plan
- Cross-references to validators and supporting docs

This folder does NOT hold the deployed slides — those live under `_app/houses/cloud/modules/wsa/m**/`. Edits to deployed slides happen as a separate composition pass after the patterns and samples here are locked.

## What this folder is NOT for

- Lab redesign (out of scope per operator 2026-05-30)
- Quiz redesign (out of scope)
- Hub / module structure changes (out of scope)
- Eliminating or shortening curriculum content (forbidden — operator mandate)

## Course structure — the Lego build model

**Operator's framing (2026-05-30):**

> Each M (Module) is its own section, it stands on its own as a learning experience when combined with all the elements of the M (presentations / labs / quiz). However, it is a fraction of the the course as a whole. Think of the course as a Lego build kit, where each Module (M) represents a block, therefore, the first few modules (M) represent the foundation, and each Module (M) represents a different block that help add skills and knowledge with the end goal of training the user on all the skills needed to become a decently functional jr. Windows Server engineer.

What this means in practice:

| Principle | Consequence for the redesign |
|---|---|
| Each module stands alone when paired with its labs + quiz | Deck content for a module does not require knowledge from other modules' decks. No "as we saw in m07..." cross-references that assume the student watched another deck. |
| First few modules are foundation blocks | m01-m02 (roughly) carry the WEIGHT — more grounding, less assumption of prior knowledge, higher slide count justified by their structural role. |
| Each module adds a distinct block of skills | Every module ends with explicit "you can now ___" outcomes. Module summary slides reframe from recap to skill-additions to the student's toolkit. |
| Modules click together into a complete kit | Skill progression across modules is a real thing the redesign tracks — module N's HOW slides assume foundation laid in earlier modules without re-teaching it. |
| End-state audience: decently functional jr. Windows Server engineer | Concrete target for what "complete" means. Not senior, not zero-IT, not certification-only. A junior operator who can DO the common tasks. |

The redesign respects this — each per-module plan starts by identifying WHERE in the Lego build the module sits (foundation block / specialization block / integration block / capstone block) and shapes the redesign decisions to that role.

## Course-wide design principles (lock these before fan-out planning per module)

1. **PowerShell is one of WSA's main pillars.** Coverage deepens progressively across all 19 modules over the 4-week course. Each module layers its module-specific PowerShell skills on top of m01's foundations (AD cmdlets in m02, DNS cmdlets in m08, clustering cmdlets in m06, etc.). When evaluating any module's PowerShell content for redesign, the question is "does this layer add value on top of prior modules' coverage" — not "is this redundant with what we already taught."
2. **Slide pattern: open-book layout** (left text · right animated visual). Locked 2026-05-30.
3. **Monomial coverage rule (5W1H), not a slide-count template.** Apply per sub-topic; topics need different monomial subsets. See `MONOMIAL-MODEL.md`.
4. **Visual aesthetic: siem.gif lineage** (labeled topology + sequential step animation with per-step color palette). See `samples/dns-HOW.sample.html` for the canonical reference.
5. **Animated SVG as the right-page default format**; Lottie reserved for ~5% of slides (module-intro hero moments).
6. **No content elimination.** Content overflowing readable density flows to a successor slide, not a smaller font.
7. **Complete thoughts, not padded prose.** Completeness wins over brevity. If a checklist says 7 items, the deck teaches all 7. If a topic has unfilled monomials that matter, the deck fills them. Not the same as padding — every sentence still earns its place. Anti-textbook-fluff.
8. **Decks stand alone as complete references** (for their slot in the spiral). WSA presentation decks are not pair-and-rely with labs. Labs reinforce; decks are complete on their own. ⚠ Completeness here is scoped to the SPIRAL TURN (principle 10), not to the full conceptual depth of any topic.
9. **Syllabus-driven coverage.** The syllabus is the minimum bar. Audience persona is NOT the driver. Fan-out per topic is based on what the systems being learned require to function, not on what a hypothetical persona "should know."
10. **Spiral curriculum.** Topics introduced at gist-level on first appearance. Subsequent module slots deepen the same concepts. Never dump everything about a topic on its first mention. A topic's full depth is the FULL SPIRAL ACROSS MODULES, not any single module. PowerShell spirals through ALL 19 modules as the pillar; other topics spiral through fewer slots. Each module's "completeness" measures against ITS SPIRAL TURN, not against the topic's full conceptual universe.
11. **Voice register: centrist, per-slide-shape.** Never extreme. WHAT/WHERE/WHEN/WHO/reference slides = INTRO register (instructional, readable, technical-not-bland, not dictionary-dry). HOW/WHY/SUMMARY slides = BREAKDOWN register (warm-mentor, builds confidence, bonds the student to the platform). Critical distinction: **approachable ≠ friendly**. Never chatty/casual; always accessible/welcoming. See `reference_wsa_voice_register.md` for the full register guide.
12. **Instruction primary, reference secondary.** When the deck has to choose between teaching forward and serving as scannable reference, teaching wins. The spiral demands progressive competence-building.
13. **Reference-style slides use the open-book pattern** — framed as instruction at the module's spiral turn (not as standalone catalog cards). Left page = "here are the X you'll reach for most"; right page = visualized table/grid with the most-used items highlighted.

## Operator mandate (verbatim, 2026-05-30)

> Scope: WSA course only. Hands off labs, quizzes, hub structure, overall architecture.
> What we touch: presentation/slide deck structure, architecture, and content.
> What's allowed: organize, adjust, split, reflow.
> What's forbidden: eliminating concepts or topics. Quality of content never sacrificed.
> Mandate: stay informational and educational.
> Slide pattern: every slide = two pages. Left: words. Right: image / animation / SVG that breaks down or showcases the topic on the left.
> Content-fit rule: NO crunching. If content doesn't fit at a readable font size, it flows to the next slide. Readability and breathing room win over slide count.
> No deletion, only flow.

## Files in this workspace

| File | Purpose | Status |
|---|---|---|
| `README.md` | This overview | current |
| `MONOMIAL-MODEL.md` | The slide-design framework (WHO / WHAT / WHERE / WHEN / HOW) | current |
| `samples/dns-HOW.sample.html` | Canonical visual sample — one HOW slide demonstrating the siem.gif aesthetic + open-book pattern. NOT a "DNS coverage plan" — just the slide pattern reference. | approved 2026-05-30 |
| `redesign-plan-m01.md` | m01 fundamentals: 27 slides → projected 33; 3 content splits + 3 gap-fills recommended; 5 operator decisions pending | drafted 2026-05-30 |
| `redesign-plan-m02.md` through `redesign-plan-m19.md` | Per-module plans (same structure as m01) | pending |
| `style-guide.md` | Color palette, animation timing, icon library, typography rules for right-page visuals | pending |

## Project state

### Patterns locked
- Open-book layout (left text · right animated visual)
- Monomial model — **5W1H coverage rule** (who / what / where / when / why / how). Each slide addresses one monomial. Topics select the monomial subset they actually need; no padding. Slide count per topic emerges from the topic's coverage requirement, not a template.
- Visual aesthetic (siem.gif lineage: labeled topology + sequential step animation, per-step color palette)
- Animated SVG as the right-page default format (inline, vector-crisp, editable, ~5-10KB per visual)
- Lottie reserved for module-intro hero slides (5% of slides max)

### Patterns pending
- Lab content / hands-on screen recordings: format TBD (likely MP4 or animated GIF, only where applicable)
- Comparison-table slides: still need a layout template separate from the open-book pattern (e.g., the routing-protocols.jpg reference style)
- Module-intro slides: format TBD (Lottie or animated SVG with hero-illustration treatment)

### Next concrete artifacts to produce
1. **(Optional) one or two more sample slides** demonstrating non-HOW monomial layouts (e.g., a WHAT-style slide with a static-hierarchy visual, a WHEN-style slide with a timeline visual). Would prove the open-book pattern handles non-flow content. Skip-able if the redesign plan reveals no novel layout concerns.
2. `redesign-plan.md` — module-by-module inventory: existing sub-topics, current monomial coverage, monomial gaps, estimated slide-count delta. This is the decision artifact before fan-out commits.
3. `style-guide.md` — design tokens (colors, timings, typography, icon library) extracted from the canonical sample into a reusable spec.

### Then the fan-out
Per-module, work through each existing slide:
- Identify the sub-topic it addresses.
- Identify which monomial(s) it currently tries to cover.
- Decide if it crunches multiple monomials (split needed), under-serves the topic (new slides needed), or is fine as-is (revise visually but no content split).
- Compose into the open-book layout with right-page animated SVG matched to the monomial type.
- Apply to all 19 modules.

The expected outcome is NOT "every topic gets four slides." Some topics stay at one. Some grow to three. Some shrink because the current deck repeats itself across slides.

## Cross-references

| What | Where |
|---|---|
| The 19 WSA modules | `_app/houses/cloud/modules/wsa/m01-fundamentals/` through `m19-troubleshooting-migration/` |
| Existing presentation files | `cloud-presentation.module.html` in each module |
| Slide-overflow validator (1280×720 detector) | `_tools/eduscan/validators/functional/slide-overflow.js` |
| Pre-existing scan inventory | `_tools/reports/WSA_RECURSIVE_QC_OVERFLOW.json` (2026-05-29, partial coverage at 1864×1060) |
| Original exploratory analysis | (this conversation, 2026-05-30) |
| Reference image — visual style | `~/hexworth-shared/images/format & content comparison/siem.gif` |
| Reference images — other styles surveyed | `~/hexworth-shared/images/format & content comparison/` (AI-agent-stack, iam-roadmap, llm, reverse-shell, routing-protocols, facts-sheet) |

## Decision log

| Date | Decision | Made by |
|---|---|---|
| 2026-05-30 | Scope locked: presentations only, no labs/quizzes/hubs | operator |
| 2026-05-30 | Open-book layout (left text / right visual) is the WSA slide pattern | operator |
| 2026-05-30 | Content overflow → split slides, not shrink font | operator |
| 2026-05-30 | Monomial model (WHO/WHAT/WHERE/WHEN/HOW) is the slide-decomposition contract | operator |
| 2026-05-30 | Animated SVG is the right-page default (not Lottie/GIF) | operator (validated `dns-HOW.sample.html`) |
| 2026-05-30 | Visual aesthetic anchors on `siem.gif` reference | operator |
| 2026-05-30 | 5 dynamic-render decks (m05/m06/m07/m18/m19) to convert to static HTML as part of the redesign | pending operator confirmation |
| 2026-05-30 | **PowerShell is one of WSA's main pillars** — 40% weight in m01 is intentional; PowerShell coverage deepens progressively across all 19 modules over the 4-week course; the "WHAT IS PowerShell" foundational slide is added to m01 | operator |
| 2026-05-30 | **Completeness > slide-count.** Decks must teach what they claim to teach. m01's initial-config checklist has 7 items → all 7 get HOW slides (currently 3 do; +4 to be added). Anti-fluff principle: complete thoughts, not padding. | operator |
| 2026-05-30 | **WSA decks are standalone references.** Not pair-and-rely with labs. Labs reinforce; decks are complete on their own. | operator (implicit via Q2 answer) |
| 2026-05-30 | **Module-intro slide pattern:** every module's slide 1 = open-book layout, left page = "What You'll Learn", right page = labeled module-map visual (journey-snake with ~8-12 stops, animated traveling indicator). Reusable template across all 19 modules. | operator |
| 2026-05-30 | **No per-week module separation.** 19 modules (m01-m19) consumed as continuous sequence within the catalog's 4-week course window. Students pace themselves. Syllabus's week-CO mapping is informational, not a Hexworth scheduling constraint. No per-week boundary markers in the deck. | operator |
| 2026-05-30 | **Four-feeling student outcome (per module):** every module ends with EMPOWERED + CONFIDENT + EQUIPPED + CURIOUS — all four, not pick-one. Module summary + intro slides hit all four. | operator |
| 2026-05-30 | **Skills Toolkit is visible** in the WSA hub UX (location TBD, sketch in progress). Grows module-by-module. Makes the spiral visible to the student. Answers two foundational questions in one (visible-vs-implicit spiral + the equipped-feeling-needs-to-be-seen requirement). | operator |
| 2026-05-30 | **Pedagogical model locked: SPIRAL CURRICULUM.** Concepts introduced at gist on first appearance, deepened across module slots. Don't crunch full depth into first mention. | operator |
| 2026-05-30 | **Coverage scope is SYLLABUS-DRIVEN**, not audience-persona-driven. Audience emerges from syllabus. | operator |
| 2026-05-30 | **Syllabus anchor (primary): CTS1328C** (Keiser MS "Managing and Maintaining Server Operating Systems"). All WSA redesign decisions reference this syllabus as the minimum coverage bar. Course-level + per-module plans cite it. | operator |
| 2026-05-30 | **Expansion overlay: Microsoft AZ-800 / AZ-801** can extend the WSA hub/course beyond CTS1328C floor (hybrid Azure, advanced-services, cert-prep tracks). AZ series does NOT replace the anchor — it layers on top. CTS1328C governs core; AZ-800/801 informs expansion. | operator |
| 2026-05-30 | **Platform-wide principle: every course (and every redesign) anchors to a syllabus.** Hexworth has 75+ Keiser MS syllabi on disk. See [[reference_keiser_syllabi_catalog]]. Authoring a course without a syllabus anchor is forbidden. | operator |
| 2026-05-30 | **Voice register: CENTRIST per slide-shape.** Intros (WHAT/WHERE/WHEN/WHO/reference) = instructional readable. Breakdowns (HOW/WHY/SUMMARY) = warm-mentor approachable. Never chatty/friendly. Never dictionary-dry. Approachable ≠ friendly. | operator |
| 2026-05-30 | **Instruction primary, reference secondary.** When pull apart, instruction wins. Reference-style slides framed as instruction at the module's spiral turn. Fan-out cadence: serial m01→m02→... with operator review between modules. | operator + spiral implication |

## How to extend this workspace

When adding a new sample or plan doc:

1. Save it under the appropriate sub-folder (`samples/` for slides, top-level for planning docs).
2. Add a row in this README's "Files in this workspace" table.
3. Update the decision log if your work makes a new architectural decision.
4. Update the `MONOMIAL-MODEL.md` only if the framework itself evolves — do not pollute it with per-module specifics.

When applying the patterns to a module:

1. Read `MONOMIAL-MODEL.md`.
2. View `samples/dns-HOW.sample.html` rendered (open in browser) to anchor on the visual aesthetic.
3. Inventory the module's current slides.
4. For each topic crunched across one slide, list which monomials it touches.
5. Produce one slide per monomial following the open-book pattern.
6. Reuse the per-step color palette and animation patterns from the canonical sample.
7. Compose into the module's `cloud-presentation.module.html` as a separate commit.
