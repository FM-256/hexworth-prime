# Slide Right-Panel Visual Standard

**Status:** AUTHORITATIVE — defines the visual register for slide right panels across WSA, ALA, PIS, and Ethics decks
**Created:** 2026-06-09
**Last revised:** 2026-06-09 (v3 — pedagogical principle + register acid test, concreteness axis (multi-bin), proof gate with explicit sign-off language, animation spec, banned-SHAPE clarification after rich-render trap, prompt template fix after Nancy v3-draft review)

**Trigger v1 (2026-06-08):** Operator correction after 85-SVG fan-out shipped (commits `53dd531c4`..`be6b11bdf`) — boxes-with-text instead of illustrated infographics.

**Trigger v2 (2026-06-09):** Operator correction after 321 fal.ai Recraft V3 images shipped (commits `925ba32c6` + `8515c478b` + `486fcc0a0`) — "advertising flyers" with garbled labels and decorative isometric scenes instead of real labeled architecture diagrams.

**Trigger v3 (2026-06-09):** Operator correction after 321 rich-render HTML+CSS+SVG composite images shipped (commit `c8ec7a084`) — "those are just tables that is not what we want yo went back to doing bs." The rich-render output dressed the same LLM-laid-out boxes-with-text failure in a different format (Chromium-composited WebP instead of inline SVG). v2 ban was read literally (no inline SVG) instead of structurally (no LLM-arranged labeled rectangles in any form). v3 retargets the ban at the **shape**, not the format.

---

## §0. Read this first

**Recall these memories before authoring a single prompt or .dot source:**

1. `feedback_wsa_visual_identity_standard.md` — animations are the default, not optional
2. `feedback_tool_selection_before_pipeline.md` — segment by shape, match tool, prove ONE before fan-out
3. `project_wsa_visual_register_correction_complete.md` — the failed-batch record
4. `project_wsa_rich_render_shipped.md` — the v3-trigger event
5. `br19-mascot-animation.md` — existing fal.ai/Veo3 reference pipeline

Quote the relevant line back in your work-block plan before generating any visual. If you cannot quote, you have not recalled. Stop and recall.

---

## §1. The pedagogical principle (the rule the rest of the doc serves)

The left text panel and the right visual panel **carry the same information through different encodings.** They reinforce each other; they do not decorate each other.

- **Verbal-text encoding (left):** paragraphs, bullet lists, code blocks
- **Spatial-visual encoding (right):** illustrated objects, motion, flow direction, time-ordering

The visual must teach what the text describes. Not echo it as boxes. Not gesture at the topic with stock icons. Not summarize the bullets in another shape.

### §1.1 The acid test (two clauses, both must pass)

**Clause A — information equivalence.** Show a student the slide text alone — they read it and form a mental model. Show the same student the slide visual alone — they should form the same mental model. If the visual alone does not teach the point, the slide fails.

**Clause B — register equivalence.** Place the candidate visual side-by-side with one of the reference images in `~/hexworth-shared/images/format & content comparison/` (`siem.gif`, `routing protocols.jpg`, `datacenter-networking.jpg`, `reverse shell.jpg`). They must read as belonging to the same visual universe — illustrated educator-creator infographics. If the candidate reads as a labeled table, a wireframe, a styled bullet list, or a flowchart — it fails Clause B regardless of how well it passes Clause A.

**Why two clauses:** information equivalence alone passed the rich-render tables (they DID encode the slide content accurately). The operator's rejection was register — "those are just tables." Register is what the reference set teaches; information is what the slide content provides. Both must converge.

### §1.2 What this rules out

- Column-bullet "tables" — the text reformatted as boxes. Passes Clause A, fails Clause B.
- Wireframes / sketch-style line drawings — fail Clause B (wrong register).
- Stock icons of the topic (a generic server icon for a slide about authentication) — fail Clause A (they identify the subject without teaching anything about it).
- Module-wide context recycled across all slides — fail Clause A (same generic scene with title swapped does not teach the slide-specific point).
- LLM-arranged labeled rectangles in ANY output format (inline SVG, HTML+CSS+SVG composite, Chromium-rendered WebP, Mermaid output, D2 output, PlantUML, ASCII-art, Tikz) — fail Clause B.

### §1.3 The reciprocal

- For a concrete topic (RAID, network packets, certificate chains, drive layouts), the visual shows the actual physical things — drives drawn as drives with parity stripes visibly distributed across them; packets with header fields labeled and traveling across a wire; certificates in a real chain with arrows of trust.
- For an abstract topic (authentication exchange, GPO inheritance, token passing), the visual shows the motion — the token literally moving from client to server to KDC, the GPO literally cascading down an OU tree, with the action happening over time.

---

## §2. Concreteness axis (multi-bin classification — bins are NOT mutually exclusive)

The decision matrix in §4 routes by output **shape**. This section adds the orthogonal axis: topic **concreteness**.

**Important:** the bins below are NOT mutually exclusive. A typical WSA protocol-exchange slide (Kerberos, DHCP DORA, TLS handshake) classifies as BOTH "concrete actors" AND "process flow." List every bin that applies. The dominant bin drives tool selection in §4; the secondary bin constrains the prompt content in §7.

| Bin | When it applies | What the visual must contain |
|---|---|---|
| **Concrete object** — physical objects with real properties | Topic is about physical things and their physical properties (RAID drives + parity, NIC team + load balancing, packet header + byte fields) | Real iconography. Drives drawn as drives, racks as racks, packets as labeled packet glyphs. Color and motion show the property in question (parity stripe distribution, redundancy mirror). |
| **Concrete actors** — named participants in an exchange | Topic names two or more actors who do things to each other (client, KDC, service; client, DHCP server; web server, browser) | Each actor gets its own illustrated figure or icon. Their identities must be distinguishable at a glance. |
| **Process flow** — time-ordered exchange or sequence | Topic has a sequence (DORA, four-step handshake, certificate enrollment, GPO refresh) | Numbered narrative steps 1, 2, 3, 4 — visible in the static frame, animated to enact the sequence in time. |
| **Topological** — relationship structure without strong physical metaphor | Topic is about which thing connects to which thing (RDS architecture, AD site links, PKI trust chain) — without a strong physical-object metaphor | Either labeled architecture diagram OR illustrated infographic with grouped tiers. Decided by label density (see §4 routing rules). |
| **Comparison** — two or more options with trade-offs | Topic compares options side-by-side (Session-Based vs VDI, Per-User vs Per-Device CALs, GUI vs Server Core) | Each side gets its OWN illustrated scene that shows the trade-off in action — NOT a bullet column. The trade-off must be visible in the visual difference. |
| **State machine** — discrete states with transitions | Topic enumerates states and transitions between them (TCP states, RDP session states, GPO refresh states) | Illustrated state nodes (a "listening" socket vs "established" looks different) with animated transition arrows. |
| **Structural reference** — bit-level or field-level layout | Topic IS the layout (packet header byte layout, RFC field annotation, regex anatomy) | Hand-authored SVG with precise `<tspan>` positioning. Animation rarely adds value. |

**Routing rule:** list every bin that applies to the slide topic. If two or more apply, the dominant bin (the one the slide's main teaching point depends on most) drives tool selection. The secondary bins constrain what the prompt MUST visually include.

**Example multi-bin classifications:**

| Slide topic | Bins (all that apply) | Dominant | Prompt constraints from secondary bins |
|---|---|---|---|
| Kerberos AS-REQ/AS-REP/TGS-REQ/TGS-REP | Concrete actors + Process flow | Process flow | Must show client, KDC, TGS, target service as distinguishable actors |
| RAID 5 parity calculation | Concrete object + Process flow | Concrete object | Must animate the parity stripe being calculated and written |
| RAID 5 vs RAID 6 trade-off | Concrete object + Comparison | Comparison | Each side must show the actual drives with the parity layout that distinguishes them |
| RDP session state machine | State machine + Concrete actors | State machine | Each state node must show the client + RDSH in a visually-different posture |
| DNS query resolution | Concrete actors + Process flow + Topological | Process flow | Must show resolver, root, TLD, authoritative as distinguishable; must show the query path topology |

---

## §3. The proof gate (operator sign-off in specific language, not self-grade)

**No fan-out without a passed proof.** A proof is not "my judgment that it looks good." A proof is:

1. **Tool-choice Nancy review.** Dispatch adversarial-reviewer on the tool selection itself — not on the prompt, not on the output. The question Nancy answers: *"Given the slide content and the §2 multi-bin classification, is this the right tool?"*
2. **One proof artifact rendered for ONE slide of ONE shape per module.** Not five at once. One.
3. **Operator visual sign-off in specific language.** See §3.1.
4. **Per-shape proofs before per-shape fan-out.** If a module has three distinct slide shapes (a flow, a comparison, a hierarchy), each shape gets its own proof and its own operator sign-off. The flow proof does not authorize the comparison fan-out.

### §3.1 What counts as sign-off (and what doesn't)

**Counts as sign-off** — operator explicit phrase that names the SHAPE and the MODULE (or scope) being authorized:
- "Ship this for m12 process-flow shape, proceed with m12 process slides."
- "This is the bar for comparison slides, fan out across m12 and m13 comparisons."
- "Approved — apply this pattern to m14 NAT and m14 BranchCache."

**Does NOT count as sign-off** — any phrase that's just acknowledgment:
- "Looks good." (no scope)
- "That's better." (comparative, not authorizing)
- "OK." (no scope, no authorization)
- "Better than before." (still not authorizing fan-out)
- Silence after viewing.
- An old sign-off from a different shape or a different module.

**One-way ratchet:** sign-off is slide-shape-specific AND module-specific. A sign-off for m12 process-flow slides does not authorize m14 comparison slides. Cross-module re-use of sign-off is banned.

### §3.2 Halt-and-re-pick trigger

If the operator returns a proof as "not right," do NOT iterate the same approach. Do NOT tweak the prompt. Stop. Name the constraint that was violated in writing in your next message. Re-pick from §4 with the constraint as the new filter input. Document the re-pick in the work-block plan.

**Three failed iterations on the same approach in a row = full halt.** Stop the work block, surface the failure pattern to the operator, ask whether the §2 classification or §4 tool choice was wrong before proposing the next attempt.

---

## §4. Decision matrix (dominant-bin × shape → tool)

| Dominant bin (from §2) | Output shape | Primary tool | Fallback | Why |
|---|---|---|---|---|
| **Concrete object** | Illustrated scene with real iconography | fal.ai Recraft V3 / FLUX 1.1 Pro for static, Kling/Veo3 to animate, ffmpeg → GIF | none — concrete topics REQUIRE concrete art | Real-property visualization needs object-level detail no diagram tool provides |
| **Concrete actors** (with process flow) | Illustrated scene + animated arrows | fal.ai illustrated scene + image-to-video for animation | Graphviz `dot` ONLY if label density is so high that illustration would garble (≥ 8 distinct labeled edges in one frame) | Motion conveys time-ordering; numbered narrative steps anchor sequence |
| **Topological** | Architecture / topology diagram | If label density ≤ 8 nodes and animation adds value → fal.ai. If label density > 8 nodes OR animation adds nothing (pure structure) → Graphviz `dot` | hand-SVG only for pixel-precise positioning | Graphviz wins for label density; fal.ai wins for register/identity |
| **Comparison** | Illustrated split-scene, each side shows trade-off in action | fal.ai illustrated split-scene — each side gets its own scene | hand-SVG explicit two-column ONLY if comparison is structural (e.g., bit fields) | Bullet columns are banned per §1.2 Clause B |
| **State machine** | State nodes + animated transitions | fal.ai illustrated states + animated transitions | Graphviz `dot` if states are purely abstract and label-dense | Animation expresses transition; illustration gives state visual identity |
| **GUI / tool walkthrough** | Live UI in motion | Recorded screencap → MP4 / animated WebP | annotated screenshot if recording is impractical | The actual UI IS the lesson |
| **Structural reference** | Bit/byte layout | Hand-authored SVG with `<tspan>` annotations | n/a | Format demands explicit positional control |
| **Module-map navigation** (slide-1 functional summary) | Existing pattern | Hand-authored SVG (existing pattern) | n/a | Reuse the established slide-1 pattern |

**Key rule:** the default for content slides in m10-m19 is **animated illustrated GIF** via fal.ai. Graphviz `dot` is the fallback when label density exceeds illustration's reliable text-rendering capacity. Hand-SVG is reserved for structural references.

---

## §5. Banned shapes (regardless of output format)

The format does not matter. The shape does.

- BAN: LLM-arranged labeled rectangles. Inline SVG, HTML+CSS+SVG composite, Chromium-rendered WebP, Mermaid output, D2 output, PlantUML, Tikz, ASCII-art — all equivalent failures.
- BAN: Column-bullet "diagrams" — the slide text reformatted as boxes.
- BAN: Stock-icon decoration — server icon, lock icon, key icon used to mean "this slide is about servers / security / authentication."
- BAN: Module-wide context recycled across all slides in a module.
- BAN: Single tool for all visuals — "fal.ai for everything," "Graphviz for everything."
- BAN: Wireframes / sketch-style line drawings (wrong register).
- BAN: Stub placeholders — a single 1-rect + 2-text element shipped as a "visual."

---

## §6. Reference style

Study these examples in `~/hexworth-shared/images/format & content comparison/` before authoring any new slide visual:

| File | Style | What to learn from it |
|---|---|---|
| `siem.gif` | Animated educational infographic — isometric servers, animated data-flow lines from sources → aggregation → alerts, numbered 1-8 narrative | Bar for process-flow animations. Motion encodes data movement, not decoration. |
| `reverse shell.jpg` | Character illustration (hooded hacker), real props (brick firewall, monitor), colored speech bubbles, numbered 1-5 attack-flow narrative | Character + real props register. Use when an actor (attacker, admin, user) carries the narrative. |
| `datacenter-networking.jpg` | Layered infographic — illustrated racks/switches/satellites/lightning, colored flow arrows, numbered 1-5 layers, real iconography | Real iconography for physical infrastructure. Color-coded layers. |
| `iam-roadmap.jpg` | Multi-panel learning roadmap — illustrated icons per topic, numbered 1-8 paths, color-coded tiers, branded | Roadmap / journey visual register. Use for slide-1 / module-summary slides. |
| `ai-systems.gif` | Tiered category infographic with logos for real products, animated reveals by category, branded | Animated reveal pattern — categories fade in by tier. |
| `routing protocols.jpg` | OSPF/BGP comparison — illustrated areas + autonomous systems with character-style hosts/routers, colored zones | Comparison done right — each side has its OWN illustrated scene showing the trade-off in action, not a bullet column. |

**Common style anchors across the reference set:**
- Dark background, vibrant accent colors (red threats, green legitimate, blue data, orange warning)
- Bold title bar at top, branded with the educator/source mark
- Numbered narrative steps — the eye follows the flow
- Real iconography for physical things (servers, racks, drives, firewalls drawn as actual objects)
- Character illustrations where an actor carries the concept
- Colored speech bubbles / callouts for protocol exchanges
- Animation in GIFs: data packets travel along arrows, numbers light up in sequence, reveals cascade

---

## §7. Per-slide prompt protocol

### §7.1 Steps

**Step 1: read the slide HTML.** Extract THIS slide's text takeaways — the `<p>` paragraph, every `<li>` bullet, every `<h3>` sub-header, every code block. Quote them in the work-block plan.

**Step 2: identify the verbs and the named objects.** Verbs become motion. Named objects become illustrated elements. Numbers become numbered narrative steps.

**Step 3: classify on the §2 concreteness axis.** List every bin that applies. Identify the dominant bin.

**Step 4: route to §4 decision matrix using the dominant bin.**

**Step 5: write the per-slide prompt drawing on Step 1's quoted takeaways. Use the template in §7.2 or §7.3 below. Every `[bracketed]` placeholder MUST be filled with per-slide content. If you paste module-wide context into a `[bracketed]` slot, you have already failed.**

**Step 6: render the proof for ONE slide. Pass through §3 proof gate.**

### §7.2 Static-image prompt template (for fal.ai Recraft V3 / FLUX 1.1 Pro)

```
Educational infographic illustration in the style of Dan Nanni / Cyber Edition cybersecurity educators on social media.

Topic: [SLIDE TITLE from the slide's <h2 class="slide-title"> — exact wording].

Illustrated elements (named objects from Step 1, drawn as illustrated isometric icons or character figures, NOT as text labels):
- [Object A from the slide bullets — describe its visual identity: e.g., "the Connection Broker, drawn as an illustrated server rack with a broker badge"]
- [Object B — etc.]
- [Continue for every named object in the slide text.]

Visual narrative — translate each slide step into a VISUAL ACTION, NOT a text overlay:
- Step 1 is shown as: [the visual event — e.g., "the client character holding up an authentication request envelope toward the KDC"]
- Step 2 is shown as: [the visual event — e.g., "the KDC handing a sealed ticket back to the client across a brick firewall"]
- [Continue for every step in the slide bullets.]

Do NOT paint the step descriptions as text in the image. The numbered steps must be shown as visual actions between the illustrated elements. Numbered badges (1, 2, 3) may appear as small circular markers next to the corresponding action — but the action itself must be visible without reading the badge.

Color coding: [color → meaning mapping, drawn from the slide if it makes specific distinctions — e.g., "red for blocked traffic, green for permitted traffic, blue for control plane"].

Layout: bold title bar at top showing the title text, dark background (#0c1a2e or similar), vibrant accent colors. 1280x720 aspect.

Text-rendering requirement: any labels that DO appear in the image must be spelled correctly. Render these labels explicitly: [list every required label as exact strings, e.g., "RD Gateway", "Connection Broker", "TCP 443"].
```

### §7.3 Image-to-video prompt template (for fal.ai Kling 1.6 Pro or Veo3)

```
Animate this educational infographic.

The slide teaches: [the verb-driven story from Step 1, one sentence — e.g., "how the client obtains a TGT from the KDC then exchanges it for a service ticket"].

Motion specification — each motion enacts ONE slide verb:
- [Verb 1 from Step 2 — e.g., "client sends AS-REQ"]: shown as [the illustrated client element animates by extending an envelope-shape toward the KDC element along an arrow that draws itself in].
- [Verb 2 — e.g., "KDC returns AS-REP with TGT"]: shown as [the ticket icon materializes in the KDC's hand and slides back to the client].
- [Continue for every named verb.]
- Numbered badge [N] illuminates / pulses when [the corresponding step occurs in the sequence].

Motion duration: 4-6 seconds, looping. Educator pacing — slow enough to follow with the eye, not action-movie pacing.

Do NOT add motion to elements not named above. No ambient particles, no gradient pulses, no idle glow, no camera shake.
```

---

## §8. Tooling — fal.ai

`FAL_KEY` is already set in environment (`~/.bashrc`). Endpoints:

### §8.1 Static illustrated infographics

| Model | Endpoint | Cost (approx) | Notes |
|---|---|---|---|
| FLUX 1.1 Pro | `fal-ai/flux-pro/v1.1` | ~$0.05 | High quality, photorealistic-leaning |
| FLUX 1.1 Pro Ultra | `fal-ai/flux-pro/v1.1-ultra` | ~$0.10 | Higher resolution, more detailed |
| Recraft V3 | `fal-ai/recraft-v3` | ~$0.04–0.10 | Best for designed infographics with text + icons |
| Imagen 3 | `fal-ai/imagen3` | ~$0.04 | Strong on text rendering |

### §8.2 Image-to-video animation

| Model | Endpoint | Cost (approx) | Output |
|---|---|---|---|
| Veo3 | `fal-ai/veo3` (image-to-video) | ~$1.50–2.00 per 6s clip | Highest quality, photorealistic motion |
| Kling 1.6 Pro | `fal-ai/kling-video/v1.6/pro` | ~$0.50–1.00 per 5s clip | Good motion, faster than Veo3 |
| Pika 2.2 | `fal-ai/pika/v2.2` | ~$0.20–0.40 per 5s clip | Faster + cheaper, lower quality |

### §8.3 End-to-end canonical pipeline

1. Generate static infographic with **Recraft V3** using the §7.2 prompt.
2. (Required for animations) Animate via **Kling 1.6 Pro** (default) or **Veo3** (when quality matters more than cost) with the §7.3 image-to-video prompt.
3. Convert MP4 → GIF via:
   ```
   ffmpeg -i input.mp4 -vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
   ```
4. Verify file size ≤ 2 MB. If over, downscale further or ship as MP4.
5. Embed at `_app/assets/images/wsa-visuals/{module}/{slug}.gif`.

**Cost per slide:** ~$0.10 (static only) to ~$2.00 (animated). For m10-m19 fan-out (~186 slides) animating all: ~$280 budget. Static-only: ~$20.

---

## §9. Tooling — Graphviz `dot` (fallback for label-dense slides where illustration would garble)

Use when §4 routes here — typically when label density exceeds illustration's reliable text-rendering capacity (≥ 8 distinct labeled nodes/edges in one frame).

`dot` ships with `graphviz` (`apt install graphviz`).

### §9.1 Pipeline

1. Read the slide's actual takeaways from the module HTML (§7 Step 1).
2. Author a `.dot` file at `_planning/wsa-visuals/{module}/{slug}.dot` (tracked in git via `git add -f` since `_planning/` is gitignored).
3. Render:
   ```
   dot -Tpng -Gsize=12.8,7.2! -Gratio=fill -Gdpi=130 input.dot -o output.png
   ```
4. Convert PNG → WebP:
   ```python
   from PIL import Image
   Image.open('output.png').convert('RGB').save(
       '_app/assets/images/wsa-visuals/{module}/{slug}.webp',
       'webp', quality=92, method=6
   )
   ```
5. Embed in the slide's `slide-visual` div as `<img src="...">`.

### §9.2 Canonical example (git ref — NOT path-on-disk-at-HEAD)

The canonical Graphviz dot render lives at git ref `e35d88bc2` (commit `proof(wsa-m12): swap RDS Architecture image for Graphviz dot diagram`, 2026-06-09 01:30 EDT). Retrieve with:

```
git show e35d88bc2:_app/assets/images/wsa-visuals/m12-remote-desktop/rds-architecture.webp > /tmp/canonical-graphviz-example.webp
```

**WARNING:** the file at the same path at HEAD is the rich-render output and is BANNED per §5. Do NOT copy the at-HEAD version. Use the git ref above.

**KNOWN GAP:** the original `.dot` source was authored at `/tmp/m12-s02-rds-architecture.dot` and was not preserved in the repo. Re-authoring the .dot source under `_planning/wsa-visuals/m12-remote-desktop/` is a known follow-up.

### §9.3 Style guide for WSA decks

| Attribute | Value | Why |
|---|---|---|
| `bgcolor` | `#0c1a2e` | Matches slide-visual panel dark navy |
| `fontname` | `Inter` | Matches deck typography |
| Node `shape` | `box`, `style="rounded,filled"`, `penwidth=2` | Soft modern card look |
| Node `margin` | `"0.25,0.18"` | Breathing room around text |
| Edge `color` | `#7aa2ff` (default), `#f97316` (service interaction), `#16a34a` (control) | Color encodes flow type |
| Edge `fontcolor` | `#ffd86b` | Labels read warm-yellow against navy |
| `rankdir` | `TB` for hierarchy/state, `LR` for short flow | TB renders 16:9 slide panels best |
| Numbered step badges | `①②③④⑤` Unicode in edge labels | Echoes the reference set's narrative numbering |

---

## §10. Animation specification

**File format:** GIF (default). MP4 or animated WebP acceptable if file size exceeds 5 MB.

**Duration:** 4–8 seconds per loop. Reference `siem.gif` is ~6s.

**Frame rate:** 12 fps target. Below 8 fps reads as choppy; above 15 fps inflates file size without pedagogical gain.

**Loop:** infinite (`-loop 0` in ffmpeg).

**Dimensions:** target 1280×720 base, downscaled to ~800px wide for GIF output. Reference set is 800–1280px wide.

**File size budget:** target ≤ 2 MB per GIF. Hard cap 5 MB. Over the cap → ship as MP4.

**Motion principle:** the motion encodes a teaching point. Each animated element answers: "what verb in the slide text does this motion enact?"

- Slide text says "packets flow from client to server" → arrow draws from client to server with packet glyph moving along it
- Slide text says "parity is calculated across all drives" → parity stripe lights up across the drive row in sequence
- Slide text says "the ticket is exchanged" → ticket icon literally moves from KDC to client to service
- Slide text says "the worker drains while a new one starts" → old worker fades, new worker fills, request queue visibly empties from old and fills new

**Banned motion:** generic ambient motion (gradient pulse, particle dust, idle glow, camera shake) that does not enact a slide verb. If the motion does not teach, it does not ship.

---

## §11. Asset location + embedding

```
_app/assets/images/wsa-visuals/{module}/{slug}.gif   (animated, default)
_app/assets/images/wsa-visuals/{module}/{slug}.webp  (static fallback — Graphviz or hand-SVG renders)
```

Embed in the slide HTML right panel:

```html
<div class="slide-visual">
    <img src="/assets/images/wsa-visuals/m14-advanced-networking/nat.gif"
         alt="NAT translates internal addresses to external addresses as packets traverse the gateway: client 192.168.x.x sends to gateway, gateway rewrites source to public IP, server replies to public IP, gateway rewrites back to client"
         style="width:100%; height:auto; max-height:100%; object-fit:contain;">
</div>
```

**Alt-text contract:** the alt attribute must encode the same teaching point as the visual — a single sentence describing the verb-driven story the GIF shows. Screen-reader users get the same teaching content as visual users.

---

## §12. Pacing honesty (gate-count, not clock-time)

Per-slide clock-time varies too widely to budget. A simple animated flow may take 20 minutes end-to-end; a complex multi-tier illustrated infographic with iterated prompts may take 4 hours. Time-budgeting is not reliable.

**Use gate-count instead.** A slide is done if and only if ALL of the following are true:

1. §0 memory recall: relevant memories quoted in the work-block plan before any prompt was written.
2. §7 Step 1: the slide's actual text takeaways were quoted in the plan before the prompt was written.
3. §7 Steps 3-4: the §2 classification (all bins listed, dominant identified) was recorded and §4 routing was applied.
4. §7 Step 5: the per-slide prompt was authored using §7.2 / §7.3 templates with every `[bracketed]` placeholder filled with per-slide content (no module-wide recycling).
5. §3 proof gate: Nancy reviewed tool choice; operator signed off in §3.1-specific language; both recorded in chat.
6. §1 acid test: both Clause A (information equivalence) and Clause B (register equivalence) applied and passed.
7. §13 QC bar: parallel-encoding check applied, label accuracy verified, verb-to-motion match verified.

**If you skipped ANY of those gates, you moved too fast regardless of clock time.** If you cleared ALL of them, the slide is done regardless of clock time.

For module-scale planning: m10-m19 is ~186 slides. Even at the fastest realistic per-slide pace, this is multi-week work across multiple sessions. Plan in module-sized chunks (one module per session, possibly multiple sessions per module for label-dense ones).

---

## §13. QC bar

**Final acceptance test for every slide:** the §1.1 acid test, applied twice (once each clause).

**Clause A — information equivalence (parallel-encoding check):**
1. Read the slide text aloud. Note the teaching point.
2. View the visual alone (text panel covered). Form your understanding from the visual only.
3. Compare. The two understandings must converge on the same teaching point.

**Clause B — register equivalence:**
1. Open the reference image from `~/hexworth-shared/images/format & content comparison/` that is closest in topic-shape (siem.gif for process flow, routing protocols.jpg for comparison, datacenter-networking.jpg for topology, etc.).
2. Place the candidate visual side-by-side with the reference.
3. They must read as belonging to the same visual universe. Same register, same illustrated-educator-creator style.
4. If the candidate reads as a labeled table, wireframe, styled bullet list, or flowchart — FAIL Clause B regardless of how well it passes Clause A.

**Sub-tests applied to both clauses:**
- **Label accuracy:** every text label in the visual is spelled correctly and matches a term used in the slide text or its source (CTS course outline, AZ-800 spec). Read every label.
- **Verb-to-motion match (for animated slides):** for each verb in the slide text, identify the motion that enacts it. Pause the GIF mid-animation — the frame should show a recognizable mid-state of one of the slide's verbs.
- **Reference-set side-by-side comparison:** as in Clause B above. Apply this even if you think the visual passes — the check itself catches register drift you didn't notice.
- **Concrete-topic concreteness:** if §2 classified the topic as concrete, are real objects shown (drives drawn as drives, packets drawn as packet headers), not abstract boxes labeled with the noun?

**Not acceptable QC:**
- Counting `slide-visual` div presence
- "Looks good on a quick eyeball"
- Counting `<svg>` or `<img>` elements
- EduScan HEUR-036 pass alone (the validator only checks element presence, not content quality)
- Self-grading the proof gate ("I think it looks like the reference set")

**Acceptable QC:**
- The Clause A + Clause B acid test above, applied per slide, with results recorded
- Operator visual sign-off on each proof per §3
- Reference-set side-by-side comparison

---

## §14. Failure mode case studies

### 2026-06-08 — LLM-SVG box-and-text fan-out (v1 trigger)

Shipped 85 LLM-authored inline SVG visuals across m10-m17. Each was rectangles + text labels arranged by Claude. Information-dense but visually flat. Operator: *"i told you i want the animations that move and/or show flow and movement that should be the default... yet you keep going back to lazy bad quality images."* Process failure: defaulted to LLM-SVG because that's what an LLM produces by default. Did not classify on §2 concreteness axis. Did not route via §4.

### 2026-06-09 — fal.ai Recraft V3 flyer batch (v2 trigger)

321 fal.ai Recraft V3 images shipped to production across m01-m19. Operator pulled up m12, called the result "a disaster... advertising flyers." Every slide image had the title stamped on top, a stock isometric office scene below, and the module-wide bullet list pasted as a poster or overlay. Garbled text labels — "(CL)" instead of "(CAL)", "VD1" instead of "VDI", port numbers "35" "49" instead of "3389" "443". Process failure: prompt template was `title + per-module-context-bullet-list + style`. Same generic scene per module with title swapped. Tool choice (image-gen for label-dense architecture) was wrong, not the prompt — but I treated it as a prompt-engineering problem and iterated on prompts instead of re-classifying via §2.

### 2026-06-09 — Rich-render HTML+CSS+SVG composite fan-out (v3 trigger)

321 webps re-generated via HTML+CSS+SVG composite → headless Chromium → PNG → WebP pipeline. Operator: *"those are just tables that is not what we want yo went back to doing bs."* Process failure: read the v2 ban literally (no inline SVG) instead of structurally (no LLM-arranged labeled rectangles in any form). Believed I had escaped the ban by changing the output format. Same shape, different dress. v3 retargets the ban at the SHAPE, not the format (see §5). Additional process failure: also ran the pipeline on m01-m09 which were out of scope — the operator's brief was m10+ and I overrode 135 hand-designed inline-SVG monomial visuals.

**Cross-failure pattern:** all three failures share the same root — defaulted to a single tool and applied it across all slides regardless of slide shape or topic concreteness. The fix is not "pick a better default tool." The fix is "classify per slide first, route per slide second, prove per shape third, get operator sign-off per shape fourth."

---

## §15. What NOT to do (consolidated banned list)

- BAN: Author LLM-arranged labeled rectangles in ANY output format (see §5).
- BAN: Use fal.ai / Recraft / FLUX to generate architecture diagrams with dense protocol/port labels (≥ 8 labels in one frame). Text labels will garble.
- BAN: Use module-wide context as the prompt for every slide in a module.
- BAN: Use one tool ("fal.ai for everything," "SVG for everything," "Graphviz for everything") regardless of slide output shape.
- BAN: Column-bullet "diagrams." Wireframes. Stub placeholders.
- BAN: Stock-icon decoration (server icon, lock icon, key icon) used as "representation" without teaching content.
- BAN: QC by counting `slide-visual` divs or "looks good on a quick eyeball."
- BAN: Skip the §3 proof gate (self-graded proof, fan-out before operator sign-off).
- BAN: Treat acknowledgment ("looks good," "ok," "better") as proof gate sign-off — see §3.1 for what counts.
- BAN: Re-use a sign-off across shapes or modules (one-way ratchet per §3.1).
- BAN: Skip the §0 memory recall before authoring prompts.
- BAN: Iterate prompts more than 3 times in a row without halting to re-classify on §2 (per §3.2).
- BAN: Add ambient motion (particles, glow, gradient pulse, camera shake) that does not enact a slide verb.
- BAN: Treat per-slide visual work as a marathon batch (per §12).
- BAN: Paint slide-bullet text as visible text in the image (per §7.2 — translate steps into visual actions, not text overlays).

---

## §16. What TO do (consolidated DO list)

- DO recall the §0 memories before authoring a single prompt. Quote the relevant line.
- DO apply §1 acid test BOTH clauses (A and B) mentally before generating any visual.
- DO classify every slide on §2 multi-bin axis FIRST — list every bin that applies, identify the dominant.
- DO route via §4 decision matrix using the dominant bin × shape.
- DO author per-slide prompts via §7.2 / §7.3 with every `[bracketed]` placeholder filled with per-slide content extracted in §7 Step 1.
- DO render ONE proof per shape per module. Stop. Pass through §3 proof gate.
- DO animation default; static is the exception (§10).
- DO motion that enacts slide verbs only (§10 motion principle).
- DO pacing honesty by gate-count, not clock time (§12).
- DO QC via §13 §1.1-acid-test (both clauses), per slide.
- DO halt-and-re-pick on operator rejection (§3.2) — do not iterate same approach 3+ times.
- DO document the work block with quoted slide takeaways, multi-bin classification, dominant-bin identification, tool choice, and the per-slide prompt before generating.
- DO use §3.1-specific sign-off phrases when reading operator messages — treat ambiguous acknowledgment as not-yet-signed.

---

## §17. How to apply this standard to existing decks

### §17.1 In scope (m10-m19, the current rework block)

- All 186 slides currently shipping LLM-rich-render webps (commit `c8ec7a084`) need replacement per this standard.
- Each module: classify each slide via §2 multi-bin, route via §4 using dominant bin, prove ONE proof per distinct shape, fan out only after operator sign-off in §3.1 language.

### §17.2 Out of scope (do not touch)

- **m01-m09:** restored to operator-designed inline-SVG monomial visuals at commit `4c997ecc0`. Off-limits — do not include in any future fan-out.
- **Slide-1 module-map nav SVGs across all 19 modules:** structural references with established pattern. Do not regenerate.
- **Existing fal.ai-generated icons in `_app/assets/images/icons/`:** unrelated to slide-visual rework.

---

## §18. Related docs

- `_docs/operations/wsa-content-density-cookbook.md` — slide-level density (HEUR-039 + OVERFLOW-001b)
- `_docs/operations/wsa-slide-1-functional-summary-pattern.md` — slide-1-specific pattern. Element 4 (module-map SVG) is an EXCEPTION to this standard
- `_docs/operations/wsa-presentation-redesign-2026-05-30.md` — sprint context
- `_docs/architecture/wsa-redesign/redesign-plan-m01.md` — origin of the monomial pattern (m01-m09 reference)

**Memories to recall before working:**
- `feedback_wsa_visual_identity_standard.md` — animation is default
- `feedback_tool_selection_before_pipeline.md` — segment by shape, prove ONE
- `project_wsa_visual_register_correction_complete.md` — failed-batch record
- `project_wsa_rich_render_shipped.md` — the v3 trigger event
- `br19-mascot-animation.md` — existing fal.ai/Veo3 pipeline pattern

---

## §19. Changelog

- **2026-06-09 (v3):** Added §0 memory-recall-first step, §1 pedagogical principle as foundation, §1.1 acid test with TWO clauses (information equivalence + register equivalence — register clause added after Nancy v3-draft review caught that information equivalence alone could pass rich-render tables), §2 concreteness axis with MULTI-BIN classification (bins are not mutually exclusive — added after Nancy v3-draft review caught that mutually-exclusive bins fail on protocol-exchange slides), §3 proof gate with §3.1 specific sign-off language and §3.2 halt-and-re-pick trigger, §5 banned-SHAPE list (format-independent), §7.2 / §7.3 prompt templates that translate slide steps into VISUAL ACTIONS not text overlays (added after Nancy v3-draft review caught that the previous "numbered steps: [list]" field would reproduce the v2 garbled-text failure), §10 animation specification (duration / fps / file size / motion principle), §12 gate-count pacing honesty (replacing prior invented clock-time estimates), §13 QC bar applying both acid test clauses. All emoji removed per CLAUDE.md rule #2. §9.2 canonical Graphviz example now points at git ref `e35d88bc2` explicitly because the at-HEAD path is the banned rich-render output.
- **2026-06-09 (v2):** Added Graphviz `dot` as the default tool for architecture / flow / comparison / state / hierarchy slides. Demoted fal.ai to "illustration-only" register. Added failure-mode case study documenting the 321-image flyer batch. Added canonical `.dot` example reference at `_planning/wsa-visuals/m12-remote-desktop/s02-rds-architecture.dot`. Banned LLM-authored topical SVG explicitly.
- **2026-06-09 (v1):** Initial doc. Established illustrated infographic (animated GIF via fal.ai) as the default register. Documented LLM-SVG box-and-text as the wrong shape after 85-SVG fan-out failure (commits `53dd531c4`..`be6b11bdf`).
