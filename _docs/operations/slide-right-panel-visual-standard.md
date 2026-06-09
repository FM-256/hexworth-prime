# Slide Right-Panel Visual Standard

**Status:** AUTHORITATIVE — defines the default visual register for slide right panels across WSA, ALA, PIS, and Ethics decks
**Created:** 2026-06-09
**Trigger:** Operator correction after 85-SVG fan-out shipped (2026-06-08, commits `53dd531c4`..`be6b11bdf`) and the visual style was wrong shape — boxes-with-text instead of illustrated infographics.

---

## TLDR

**Default:** rich illustrated educational infographic, animated, exported as **GIF**, embedded as `<img>` in the right panel of a 2-column slide.

**NOT:** LLM-authored SVG diagrams of rectangles with text labels.

---

## Reference style

Study these examples in `~/hexworth-shared/images/format & content comparison/` before authoring any new slide visual:

| File | Style |
|---|---|
| `siem.gif` | Animated educational infographic — isometric servers, animated data-flow lines from sources → aggregation → alerts, numbered 1-8 narrative |
| `reverse shell.jpg` | Character illustration (hooded hacker), real props (brick firewall, monitor), colored speech bubbles, numbered 1-5 attack-flow narrative |
| `datacenter-networking.jpg` | Layered infographic — illustrated racks/switches/satellites/lightning, colored flow arrows, numbered 1-5 layers, real iconography |
| `iam-roadmap.jpg` | Multi-panel learning roadmap — illustrated icons per topic, numbered 1-8 paths, color-coded tiers, branded |
| `ai-systems.gif` | Tiered category infographic with logos for real products, animated reveals by category, branded |
| `routing protocols.jpg` | OSPF/BGP comparison — illustrated areas + autonomous systems with character-style hosts/routers, colored zones |
| `AI-agent-stack.jpg` | Layered tech-stack infographic with real product logos, colored tiers |
| `llm.png` | Static infographic — icon-rich layout, multi-panel |
| `facts sheet.jpg` | Information-dense educator infographic |

All of these are content from social-media educator brands (Dan Nanni, Cyber Edition, SecureNext.ai, etc.) generated with a pipeline of:

1. **AI image generation** (Midjourney / FLUX / Recraft) for the static illustrated infographic
2. **Animation overlay** (After Effects / Bodymovin / motion paths) for the data-flow lines + numbered reveals
3. **Export as GIF** for embedding

We replicate this pipeline via **fal.ai** (`FAL_KEY` in env).

---

## What works for which use case

| Slide topic shape | Recommended visual |
|---|---|
| Architecture overview ("How DNS works", "How NAT works", "PKI Trust Chain", "AD Replication topology") | Illustrated animated GIF with numbered data-flow narrative |
| Tool demo (Server Manager, IIS Manager, gpresult output) | Animated screencap / recorded GUI walkthrough as MP4 or animated WebP |
| Inventory / catalog (worksheet, lab preview, "common ports table") | Static illustrated infographic with iconography |
| Structural reference (RFC byte layout, packet header field annotations, regex anatomy) | Hand-authored SVG with `<tspan>` annotations — this IS appropriate as SVG |
| Module-map navigation (the 9-stop journey SVG in slide 1) | LLM-authored SVG IS appropriate — structural, not topical |

**LLM-authored box-and-text SVG is appropriate ONLY for the structural reference and module-map cases.** Everything else defaults to illustrated infographic.

---

## Tooling — fal.ai

`FAL_KEY` is already set in environment. The relevant models:

### Static illustrated infographics

| Model | Endpoint | Cost (approx) | Notes |
|---|---|---|---|
| FLUX 1.1 Pro | `fal-ai/flux-pro/v1.1` | ~$0.05 | High quality, photorealistic-leaning |
| FLUX 1.1 Pro Ultra | `fal-ai/flux-pro/v1.1-ultra` | ~$0.10 | Higher resolution, more detailed |
| Recraft V3 | `fal-ai/recraft-v3` | ~$0.04-0.10 | Best for designed infographics with text + icons |
| Imagen 3 | `fal-ai/imagen3` | ~$0.04 | Strong on text rendering |

### Animated content

| Model | Endpoint | Cost (approx) | Output |
|---|---|---|---|
| Veo3 | `fal-ai/veo3` (image-to-video) | ~$1.50-2.00 per 6s clip | Highest quality, photorealistic motion |
| Kling 1.6 Pro | `fal-ai/kling-video/v1.6/pro` | ~$0.50-1.00 per 5s clip | Good motion, faster than Veo3 |
| Pika 2.2 | `fal-ai/pika/v2.2` | ~$0.20-0.40 per 5s clip | Faster + cheaper, lower quality |

### Pipeline

Recommended for WSA slides:
1. Generate static infographic with **Recraft V3** (best for designed text+icon layouts) or **FLUX 1.1 Pro Ultra** (more photorealistic). Prompt for the reference style explicitly.
2. (Optional) Animate via **Kling 1.6 Pro** or **Veo3** with image-to-video using the static as input
3. Convert MP4 → GIF via `ffmpeg -i input.mp4 -vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif`

Cost per slide: ~$0.10 (static only) to ~$2.00 (animated). Budget for 21 stub slides: ~$3-50 depending on path.

### Prompt template

For an animated infographic-style slide visual, prompt structure:

```
Educational infographic illustration in the style of Dan Nanni / Cyber Edition cybersecurity educators on social media. Topic: [X]. Show [main components] as illustrated isometric icons with colored data-flow arrows between them. Numbered steps 1, 2, 3, 4 labeling the flow. [Specific elements: e.g., "show a brick-pattern firewall between client and server", "use a hooded hacker silhouette for the attacker"]. Dark background, vibrant accent colors (red for threats, green for legitimate, blue for data). Bold title bar at top. Clean educational style, not photorealistic. 1280x720 aspect ratio.
```

Iterate prompts. Some topics need 2-3 attempts to hit the right composition.

---

## Asset location + embedding

Store generated GIFs at:

```
_app/assets/images/wsa-visuals/{module}/{slide-id}.gif
```

Examples:
- `_app/assets/images/wsa-visuals/m14-advanced-networking/nat.gif`
- `_app/assets/images/wsa-visuals/m17-firewall-security/firewall-rule-types.gif`

In the slide HTML, embed in the right panel:

```html
<div class="slide-visual">
    <img src="/assets/images/wsa-visuals/m14-advanced-networking/nat.gif"
         alt="How NAT translates internal to external addresses"
         style="width:100%; height:auto; max-height:100%; object-fit:contain;">
</div>
```

The `slide-visual` container in the deck CSS already fills the right column of the 2-column grid.

---

## What NOT to do

❌ Author LLM-generated SVG with rectangles and text labels for topical illustration
❌ Make checklist-shape "table" SVGs and call them visuals
❌ Pretend a single 1-rect + 2-text "stub" placeholder is a visual
❌ QC by counting `slide-visual` div presence (the audit metric I used 2026-06-08 missed all the stubs)
❌ Default to "drop has-visual class so layout collapses" — that ditches the visual entirely

✓ DO author illustrated animated GIFs as the default
✓ DO QC by character density + render-look on a sample slide per module
✓ DO use SVG only where SVG is structurally the right format (packet headers, RFC byte layouts, navigation maps)
✓ DO study the reference set before generating

---

## Known limitations of LLM SVG authoring

The fan-out on 2026-06-08 (85 SVGs across m10-m17, agents `a4890f22cd8443a3e` + 7 follow-ups) produced 85 information-dense but visually flat diagrams. LLM models (incl. Claude, GPT-4o, Sonnet) reach for templated SVG patterns because that maps cleanly to authoring SVG via stringified code. They do not reach for illustrative composition, depth, iconography, or real character art.

Lottie animations (from lottiefiles.com) are a middle ground but rarely match the exact topic narrative. Use for generic motion (loading, connecting, syncing) — not for technical content.

Pre-recorded GUI screencaps are appropriate for tool-heavy slides where the actual UI conveys the lesson better than abstract illustration.

---

## How to apply this standard to existing decks

Inventory of WSA slides where the current visual is box-and-text SVG and should eventually be replaced with illustrated GIF:

- **Out-of-scope-tonight (acceptable as-is):** the 6 originally-good slides in m10 (slide 2 GPO Architecture etc.), and the m18/m19 modules. These were either pre-authored richly or are structural-reference slides.
- **Refresh candidates (LLM SVGs shipped 2026-06-08):** all 85 SVGs in m10 (13 slides) + m11-m17 (78 slides). These work as structural placeholders but should be progressively replaced.
- **Immediate priority:** the 21 stub slides (m12: 3, m13: 2, m14: 10, m15: 2, m16: 1, m17: 3) — the LLM SVG fan-out missed these, AND they should be illustrated GIFs not SVG.

See the audit at `_docs/operations/slide-visual-density-audit-2026-06-09.md` (write this when you do the next audit run).

---

## Related docs

- `_docs/operations/wsa-content-density-cookbook.md` — slide-level density (HEUR-039 + OVERFLOW-001b) — supplements this visual-format doc
- `_docs/operations/wsa-slide-1-functional-summary-pattern.md` — slide-1-specific pattern. Element 4 (module-map SVG) is an EXCEPTION to this standard — it's structural navigation, not topical illustration
- `_docs/operations/wsa-presentation-redesign-2026-05-30.md` — sprint context
- `_docs/architecture/wsa-redesign/redesign-plan-m01.md` — origin of the monomial pattern
- Memory: `[[feedback_wsa_visual_identity_standard]]` (the originating feedback) · `[[project_br19_mascot_animation]]` (existing fal.ai/Veo3 reference work)
