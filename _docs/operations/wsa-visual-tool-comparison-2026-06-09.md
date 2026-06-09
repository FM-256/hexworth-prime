# WSA Visual Tool Comparison — Study Findings 2026-06-09

**Type:** Investigative analysis (not prescriptive — the prescriptive standard lives in `slide-right-panel-visual-standard.md`)
**Branch:** `m12-proof-rds-arch`
**Comparison page:** `_app/houses/cloud/modules/wsa/_compare/index.html`
**Source files:** `_planning/wsa-visuals/comparison/{slide}/*` (force-added under gitignored `_planning/`)
**Trigger:** Operator request after the 321-image fal.ai flyer failure — "compare to see what can be used for what and what it requires work."

---

## Question being answered

For a given WSA slide visual, which authoring tool produces correct labeled output at acceptable cost — and where does each tool fail?

## Methodology

Five m12 slides chosen to cover five distinct output shapes:

| ID | Title | Shape | Tests |
|---|---|---|---|
| s02 | RDS Architecture | Multi-tier architecture diagram | Labeled boxes per role, port-labeled arrows, numbered step badges, alternate paths |
| s04 | Deployment Types | Side-by-side comparison | Two-column compare layout, bullet items per panel |
| s08 | RD Gateway | Short flow with port labels | Port accuracy (443 / 3389), TLS-tunnel concept, CAP/RAP callouts |
| s18 | RDS Session Management | State machine + actions | 4 named states + transitions, separate action row |
| s21 | Lab Preview | Concept poster (illustrated) | Pure illustration — where image-gen should win |

For each slide, an artifact was produced by each applicable tool:

| # | Tool | Type | Cost / artifact | Time / artifact |
|---|---|---|---|---|
| 01 | Graphviz `dot` v2.43 | Diagram-as-code, hierarchical layout | $0 | ~1 s render + ~3 min spec |
| 02 | D2 v0.7.1 | Diagram-as-code, ELK layout | $0 | ~1 s render + ~3 min spec |
| 03 | Mermaid v11.15 | Diagram-as-code, dagre layout | $0 | ~2 s render + ~3 min spec |
| 04 | fal.ai Recraft V3 `digital_illustration` | Generative image gen | ~$0.04 | ~20 s API |
| 05 | fal.ai Recraft V3 `vector_illustration/infographical` | Generative image gen | ~$0.04 | ~20 s API |

Tools 04 = the recipe that shipped to production 2026-06-09 (the "advertising flyer" failure).
Tools 01 / 02 / 03 = candidate replacements for architecture-shaped slides.
Tool 05 = best-effort image-gen with the dedicated infographic style + a per-slide rich prompt (not the module-wide context that 04 used).

All renders use Inter font where the tool supports it, dark navy `#0c1a2e` background, 1280×720 target aspect.

---

## Findings per slide

### s02 — RDS Architecture

| Tool | Labels accurate? | Layout sensible? | Visual register | Pass |
|---|---|---|---|---|
| Graphviz | ✓ All 7 role labels + 8 edge labels render correctly | ✓ TB hierarchy, 16:9 fit | Plain, dense — looks like a textbook diagram | ✓ |
| D2 | ✓ All labels correct | ⚠ ELK chose tall vertical; 2 edge labels collided ("dispatch session" / "dispatch VM" overlapped on one edge) | Modern, rounded cards, prettier than Graphviz | ✓ (with layout tuning) |
| Mermaid | ✓ All labels correct | ✓ Tight TB layout, pill-chip edge labels | Cleanest of the three — modern dark theme + chip labels | ✓ |
| fal.ai OLD | ✗ "(CL)" instead of "(CAL)", "Virt Host VDIper V", port "35" "49" instead of "3389" "443" | ✗ Decorative isometric scene, no clear flow direction | Wrong: advertising flyer / poster | ✗ |
| fal.ai NEW | ✗ "OVER HTPS" (typo), "02" (random number), "RDSN" instead of "RDSH", "Dispatch Session Cal query" mashed into one box | ✗ Hub-and-spoke instead of flow; missing RD Web Access, VDI, License Server | Wrong: comic-book sketch, not infographic | ✗ |

### s04 — Deployment Types (Session-Based vs VDI)

| Tool | Labels accurate? | Layout sensible? | Visual register | Pass |
|---|---|---|---|---|
| Graphviz | ✓ All 6 panel-item labels accurate | ✓ Two side-by-side clusters | Dense, functional | ✓ |
| D2 | ✓ All labels accurate | ✓ Two side-by-side containers with internal stacking | Modern, polished | ✓ |
| Mermaid | ✓ All labels accurate | ✓ flowchart-LR with two subgraphs | Clean | ✓ |
| fal.ai OLD | ✗ Same shipped-flyer issue | ✗ Module-wide bullet list poster | Wrong | ✗ |
| fal.ai NEW | ✗ "Session-based sharedos" (should be "shared OS"), "VD1" (should be "VDI"), "dedicateDVM" garbled | ⚠ Some structure but text broken | Comic-book sketch | ✗ |

### s08 — RD Gateway

| Tool | Labels accurate? | Layout sensible? | Visual register | Pass |
|---|---|---|---|---|
| Graphviz | ✓ Ports 443 / 3389 accurate, CAP / RAP notes accurate | ✓ Left-to-right flow with side notes | Dense, functional | ✓ |
| D2 | ✓ Same | ✓ Callout shapes for CAP / RAP | Modern | ✓ |
| Mermaid | ✓ Same | ✓ Heavy arrows distinguish protocol flow | Clean | ✓ |
| fal.ai OLD | ✗ Shipped flyer | ✗ Same | Wrong | ✗ |
| fal.ai NEW | ✗ "RDF-over-https" (P→F), "OND OPEN" (random), "cap whoc anconnect, RP whatthey canreach" (mangled) | ✗ No clear gateway/firewall distinction | Comic-book | ✗ |

### s18 — RDS Session Management

| Tool | Labels accurate? | Layout sensible? | Visual register | Pass |
|---|---|---|---|---|
| Graphviz | ✓ 4 state circles + 7 transitions + 4 action boxes, all labeled correctly | ✓ States in one row, actions in another | Functional | ✓ |
| D2 | ✓ Same | ⚠ Some containers overflow; layout takes vertical space | Modern | ✓ |
| Mermaid | ✓ Same (after switching from `stateDiagram-v2` to `flowchart` w/ subgraphs — stateDiagram was too rigid for the action row) | ✓ Cleanest of three | Polished | ✓ |
| fal.ai OLD | ✗ Shipped flyer | ✗ Same | Wrong | ✗ |
| fal.ai NEW | ⚠ State labels render (ACTIVE / DISCONNECTED / IDLE / LISTEN) but SHADOW (action) was placed inside the state grid, mixing states and actions. No transition arrows. | ⚠ States okay, semantics wrong | Comic-book | ✗ |

### s21 — Lab Preview (illustration, no architecture)

| Tool | Outcome |
|---|---|
| Graphviz / D2 / Mermaid | N/A — diagram tools don't draw illustrated scenes |
| fal.ai OLD | Decorative scene, generic isometric office, recycled module-context list as poster on wall. Wrong style register but the right tool type |
| fal.ai NEW | Sketch with garbled labels ("GUI LAb", "Fremoteapp", "Monitor . Sssions"). The `vector_illustration/infographical` style drifted to vintage comic-book aesthetic — wrong register for this deck |

Even on the slide where image-gen SHOULD win (pure illustration, no labels-as-architecture), the result still has garbled labels because the slide content needs text like "Session Collection + RemoteApp" and "Deploy roles + manage collections" to communicate. **Pure illustration with NO required text is the only case where image-gen has no accuracy ceiling — and that's a narrow set of slides** (mascot art, decorative cover slides, scene-setting only).

---

## Findings per tool

### Graphviz `dot`

- **Best at:** dense functional diagrams, multi-tier hierarchies, structured layouts where you accept the default look
- **Worst at:** modern aesthetic (boxes look 1990s by default)
- **Cost:** $0 / instant
- **Auth time:** ~3 min spec for a complex slide
- **Reproducibility:** perfect — same `.dot` always produces same output
- **Where it fails:** title-as-graph-label is fiddly; subtitle styling requires HTML-like labels; ELK-style layouts are not native (dot is hierarchical-only); LR layouts at slide-panel aspect ratios often need `ratio=fill` to look right
- **Best use case:** architecture, flow, hierarchy, state machine, side-by-side comparison — all WSA technical slides

### D2

- **Best at:** modern aesthetic, rounded cards, clean container nesting, polished result
- **Worst at:** unpredictable layout when ELK auto-routes — labels sometimes collide; tall layouts on landscape canvases
- **Cost:** $0 / instant
- **Auth time:** ~3 min spec (similar to dot)
- **Reproducibility:** perfect
- **Where it fails:** reserved words bite (`shadow` as a node name → must be `shadow.style` per D2 grammar); rendering requires headless Chromium (or D2's playwright extras) since SVG uses web fonts
- **Best use case:** same as Graphviz, when modern aesthetic matters more than density

### Mermaid

- **Best at:** clean modern output, pill-chip edge labels, GitHub-native rendering (any future reader can edit `.mmd` and see it in GitHub markdown)
- **Worst at:** rigid schemas — `stateDiagram-v2` is too constrained for "states + actions"; had to fall back to `flowchart` w/ subgraphs
- **Cost:** $0 / instant (with mermaid-cli; ships its own Chromium via puppeteer)
- **Auth time:** ~3 min spec
- **Reproducibility:** perfect
- **Where it fails:** less expressive than dot/D2 — fewer shape types, fewer style controls; large diagrams paginate / scale poorly
- **Best use case:** small-to-medium diagrams, when the spec file's portability matters

### fal.ai Recraft V3 `digital_illustration` (the OLD recipe — currently in production)

- **Best at:** stylized atmospheric scenes
- **Worst at:** anything with required text labels — text is generated as pixel art, never reliable
- **Cost:** ~$0.04 / call + ~20 sec latency
- **Auth time:** ~30 sec prompt (in the OLD recipe, prompts were templated per-module — so essentially $0 marginal authoring time after the template existed)
- **Reproducibility:** none — same prompt produces different output each call
- **Where it fails:** text labels, structural layout, port numbers, technical accuracy — all fail
- **Verdict:** WRONG TOOL for technical slides; ACCEPTABLE for cover scenes / mascot art only

### fal.ai Recraft V3 `vector_illustration/infographical` (the NEW recipe — best image-gen attempt)

- **Best at:** stylized infographic aesthetic when accuracy doesn't matter (vintage-poster register)
- **Worst at:** the SAME text-accuracy ceiling as the digital_illustration style — switching the named style does not fix it
- **Cost:** ~$0.04 / call + ~20 sec
- **Auth time:** ~5 min per-slide rich prompt (longer than OLD, because the prompt has to describe the specific diagram)
- **Reproducibility:** none
- **Verdict:** Slightly better aesthetic than OLD but the FUNDAMENTAL accuracy ceiling is unchanged. Still wrong for technical slides.

---

## Cost analysis — total m12 (20 non-slide-1 slides) end-to-end

| Path | Tool mix | Auth hours | API spend | Total time |
|---|---|---|---|---|
| What shipped to production (REJECTED) | fal.ai OLD only | ~0.5 hr (templated prompts) | $0.84 | ~7 min batch |
| Hypothetical "fal.ai NEW everywhere" | fal.ai NEW only | ~2 hr (per-slide rich prompts) | $0.84 | ~7 min batch — but still rejected on accuracy |
| **Recommended hybrid** | Graphviz/D2/Mermaid for ~14 technical slides + fal.ai NEW for ~6 illustration slides | ~3 hr (3 min × 14 dot specs + 5 min × 6 fal prompts) | ~$0.25 | ~3 hr + ~5 min batch |
| Hand-Illustrator everything (gold standard, off-table for marathon) | Illustrator + clipart library | ~20+ hr | $0 | ~20+ hr |

The hybrid path is ~6× the labor of "fal.ai everywhere" but produces accurate teaching artifacts. The marginal cost is the per-slide diagram spec time, paid once. Source files live in `_planning/wsa-visuals/{module}/` and re-render in ~1 sec when slide content changes.

---

## Tool tradeoffs (mature take)

**For architecture / flow / state / hierarchy / comparison slides:** any of Graphviz, D2, or Mermaid works. Pick by aesthetic preference. My ranking after this study:

1. **Mermaid** — cleanest modern output, dark theme works without tuning, GitHub-native source, pill-chip labels read well at slide scale.
2. **Graphviz** — most expressive (every layout knob you could want), but default aesthetic is dated; needs explicit styling to look modern.
3. **D2** — prettiest cards out of the box, but ELK layout decisions are sometimes wrong for slide-panel aspect ratios; reserved-word footguns; requires Chromium for PNG export.

**For pure-illustration slides (mascot art, scene-setting):** fal.ai with per-slide rich prompts is the right tool. But the deck's style register must be matched explicitly in the prompt — `vector_illustration/infographical` drifts to vintage poster, which is wrong here.

**Hand-authored SVG with `<tspan>` annotations:** reserved for structural references where pixel-precise positioning matters (packet header byte layouts, RFC field annotations, the slide-1 functional-summary navigation maps).

---

## What this study does not tell us

- **Animated content.** All renders here are static. The reference set the operator pointed at (siem.gif, ai-systems.gif) is animated. Animation pipeline (fal.ai Veo3/Kling for motion overlay on static infographics) is unchanged from the existing `slide-right-panel-visual-standard.md` doc.
- **What students respond to.** The artifacts compared here are author-time judgments — what's accurate, what's readable. Whether students learn better from a Mermaid diagram vs a Dan-Nanni-style illustrated infographic is an empirical question this study does not answer.
- **Other diagram-as-code tools** — PlantUML, Excalidraw-CLI, Structurizr, Diagrams.net (drawio CLI). PlantUML produces uglier output by default; Excalidraw has a hand-drawn aesthetic that could be interesting; both are out of scope for this study.
- **Other image-gen models** — Ideogram v2 is known for text accuracy; Imagen 3 ditto. Neither was tested here. The text-rendering ceiling is the dominant constraint regardless of model.

---

## Recommendation

For m12 fan-out and going forward:

1. **Technical slides (architecture / flow / state / hierarchy / comparison)** → Mermaid as default, Graphviz when Mermaid's expressivity isn't enough, D2 when modern card aesthetic matters more than ELK's quirks. ALL THREE produce accurate labeled output; this is an aesthetic choice, not a correctness choice.
2. **Illustration slides (lab preview, module summary, mascot scenes)** → fal.ai with per-slide rich prompt, style explicitly anchored to the deck's register (Dan-Nanni / Cyber-Edition educator infographic — NOT vintage poster, NOT comic book).
3. **Structural references (packet byte layouts, navigation maps)** → hand-authored SVG with `<tspan>` annotations.
4. **Production deploy gate:** dispatch Nancy on the tool-choice for any new visual pipeline before fan-out. Skipped Nancy review was a contributing failure in the 2026-06-09 flyer batch.

---

## Related

- `_docs/operations/slide-right-panel-visual-standard.md` — the prescriptive standard (v2 updated 2026-06-09 to fold in this study's findings)
- `_planning/wsa-visuals/comparison/` — all 23 source files + renders
- `_app/houses/cloud/modules/wsa/_compare/index.html` — browsable side-by-side comparison
- `_planning/wsa-visuals/m12-remote-desktop/s02-rds-architecture.dot` — canonical Graphviz example, currently embedded in production on the proof branch
- Memory: `[[feedback_tool_selection_before_pipeline]]`, `[[project_wsa_visual_register_correction_complete]]`
