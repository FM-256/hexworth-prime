# Security+ Hub Overhaul — Marathon Definition (created 2026-06-27)

**Sprint:** `MARA-SECPLUS-HUB`. **Status:** defined, NOT started. **Trigger:** operator review —
"the Security+ hub is severely lacking even the content... where are the practice exams? PBQs? labs?
it is way disorganized — I was expecting a hub organized like A+ or WSA." Operator instruction:
"organize it and fix it."

> DO NOT start executing this until the operator says go. This doc DEFINES the work; it is not a
> license to begin. (See [[feedback_follow_instructions_not_commentary]].)

## DIAGNOSIS — what's wrong now (from the 2026-06-27 inventory)
The hub at `_app/houses/shield/security-plus/index.html` is manifest-driven from
`_app/data/security-plus-manifest.json` (149 items). Problems:

1. **Organized by TYPE within DOMAIN, content LAST.** Each of the 5 SY0-701 domain cards dumps items
   grouped by type via `TYPE_ORDER = ['lab','applet','presentation','quiz','tool','other']` — so a
   domain leads with Hands-On Labs, then Interactive Tools, and **Presentations (the actual content)
   is THIRD.** Operator rule: **content first, always.** This is backwards.
2. **PBQs are buried and split.** The 4 PBQs are typed `lab` in the manifest, so they render inside
   each domain's "Hands-On Labs" subsection (no "PBQ" section), scattered across Domain 1 (×2),
   Domain 2 (×1), Domain 4 (×1). Effectively invisible as PBQs.
3. **NO SY0-701 practice exams.** There is no full-length / domain-weighted SY0-701 practice test. The
   "exams" that show are PIS (Principles of Information Security) finals/midterms.
4. **53 of 149 items are PIS — a DIFFERENT course** (Patient Zero, Outbreak, Vault Breach, Jeopardy,
   Kahoot, Wheel, Infosec midterm/final, week quizzes). They pad the count and masquerade as SY0-701.
5. **Genuine SY0-701 content is thin:** ~96 real items, but assessment/practice is only 5 short topic
   quizzes + 4 PBQs + 9 arena boxes. Several domains are sparse.
6. **Not built like A+/WSA.** A+ Core 2 = a card per CHAPTER (ch13–24); WSA = a card per MODULE
   (m01–m19); each unit-card bundles that unit's content + lab + quiz together, content-first,
   sequential. Security+ is the type-grouped domain dump described above.

## TARGET — organize like A+ / WSA
**STRUCTURE (operator-decided 2026-06-27): two levels — DOMAIN → MODULES.** Top level = the 5 SY0-701
domains. Within each domain, a set of **modules** (sub-topic units, like A+ chapters / WSA modules).
Each MODULE is the bundled unit: **content-first** — Learn (content/presentation) → Practice (PBQs,
labs) → Assess (quiz). Mirrors how A+ groups chapters and WSA groups modules, nested under the domain.
- **Surface PBQs** as their own clearly-labeled section/type within a module — not buried under "Labs".
- **SY0-701 only** — genuine cert content; PIS does not pad the hub.
- Match the A+ Core 2 / WSA visual + interaction pattern (`.chapter-card` / module-card).

## SCOPE / PHASES (define; execute later, operator-gated)
- **P0 — De-pad PIS.** Remove (or clearly separate) the 53 PIS items from the Security+ manifest so the
  hub shows only SY0-701. PIS keeps its own hub. (we-do-not-destroy: re-point/separate, don't delete.)
- **P1 — Reorganize structure.** Adopt the A+/WSA unit-card pattern; fix item order to content-first
  (`TYPE_ORDER` → presentation/applet first, then PBQ, lab, quiz); add a distinct PBQ section/type and
  re-type the 4 PBQs; ensure every item is searchable (ties to [[MARA-SEARCH-1]]).
- **P2 — Build missing content.** SY0-701 practice exam(s) (full-length + per-domain); more PBQs across
  ALL 5 domains; fill sparse domains with the right Learn/Practice/Assess items. Legit engines, not
  quiz-shaped ([[feedback_labs_must_be_legit_engines]]); score-gated; SY0-701-accurate.
- **P3 — QC + ship.** Render-QC, drive each new lab/PBQ/exam, Nancy + Chris gates, deploy per gates.

## DECISIONS
1. **Structure — DECIDED 2026-06-27:** Domain → Modules (two levels). Domains at top; modules within
   each domain; each module bundles content-first (Learn → Practice → Assess). [resolved]
2. **PIS items — OPEN:** remove from the Security+ hub entirely, or keep in a clearly-labeled "Related"
   section? (53 items; PIS keeps its own hub regardless.)
3. **Sequencing — OPEN:** reorganize structure first then build content, build content first, or one
   combined phased plan?
4. **Module list per domain — TBD at kickoff:** define the modules for each of the 5 domains (the
   SY0-701 objective groups), then map existing items into them and identify gaps to build.

## METHOD / REFERENCES
- Model hubs: `_app/houses/forge/applets/comptia-aplus/core-2/index.html` (chapter-cards),
  `_app/houses/cloud/modules/wsa/index.html` (module-cards).
- Hub is manifest-driven: structure changes live in `index.html` (TYPE_ORDER, card rendering) +
  `security-plus-manifest.json` (items, domains, types). Searchability via `ContentCatalog`.
- Inventory script used for the diagnosis: counts/splits in this doc are reproducible read-only.
