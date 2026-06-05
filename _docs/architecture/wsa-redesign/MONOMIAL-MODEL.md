# The Monomial Slide Model

**Author:** Operator (framework), Primary (transcription)
**Date:** 2026-05-30
**Status:** Adopted as the WSA redesign contract; candidate for platform-wide adoption.

## TLDR

The monomial model is a **coverage rule, not a slide-count formula**. The principle: when presenting any topic, do not leave the audience with too many open questions across the canonical 5W1H angles (who / what / where / when / why / how). Each angle present in your topic is a monomial. Each monomial that is present gets adequate room on its own slide — it is not crunched together with other monomials on a shared slide. Different topics need different monomial subsets; the model does not require every topic to span all six.

The slide pattern that delivers the coverage: open-book (left text, right animated visual). The content-fit rule: if a slide's monomial content exceeds readable density, it flows to a successor slide, not a smaller font.

## The six monomials (5W1H)

| Monomial | Question it answers | Typical content |
|---|---|---|
| **WHO** | Who is involved? Who runs / maintains it? | Role-owners, standards bodies, operators, actors in the process |
| **WHAT** | What is this thing? | Definition, terminology, identifying characteristics |
| **WHERE** | Where does it live or operate? | Deployment context, infrastructure location, topology, network position |
| **WHEN** | When does it run or apply? | Triggers, lifecycle, frequency, timing conditions |
| **WHY** | Why does it exist? Why does it matter? | Motivation, problem solved, business / operational driver, consequence of absence |
| **HOW** | How does it work? | Mechanism, step-by-step operation, the process |

### The relevance test

For each topic, ask: which of the six does the topic genuinely require to be complete? Answer honestly. Do not pad with monomials that aren't actually relevant — that produces filler slides which dilute the strong slides.

- A mechanism-focused sub-topic (e.g., "DNS resolution flow") may need only HOW (with terminology assumed from a prior WHAT slide).
- A governance sub-topic (e.g., "Group Policy precedence order") needs WHEN heavily (when each tier applies) and HOW (the resolution algorithm). WHY also matters (why the order is what it is).
- A definition sub-topic (e.g., "What is a DNS zone?") may be a single WHAT slide; HOW and WHEN belong to neighboring sub-topics.
- A historical sub-topic (e.g., "Why was Server Core introduced?") leans on WHO and WHY; HOW and WHEN might be just one short line each.

The slide count per topic emerges from the topic's actual coverage requirement, not from a template. A topic might be one slide, three slides, or seven slides. What matters is that each slide that exists addresses one monomial clearly and at readable density.

## Why this works pedagogically

1. **Mirrors how students naturally form questions.** When learning something new, the brain wants WHAT first, then WHERE/WHEN to anchor the thing in context, then HOW to operate it. Building slides on this grain matches the question sequence a confused student is already running internally.
2. **Forces atomic clarity.** A slide that crunches WHAT + WHERE + HOW into one frame buries the answer to any one question. Splitting them means each question has a clear home.
3. **Gives natural slide boundaries.** Authors get stuck deciding "should this be one slide or two?" The monomial model answers: count the distinct monomials the content addresses; that's the slide count.
4. **Makes review systematic.** Reviewer (Karl, Nancy, instructor) can ask: "is each monomial present and correct?" rather than the open-ended "is this slide good?"

## How this combines with the open-book pattern

Each monomial slide is structured as:

```
┌────────────────────────────────────┐
│  WSA Module N · Topic Name         │  <- header
├──────────────────┬─────────────────┤
│                  │                 │
│  LEFT PAGE       │  RIGHT PAGE     │
│  ────────        │  ──────────     │
│  Slide title     │  Animated SVG   │
│  (the monomial)  │  illustrating   │
│                  │  this monomial  │
│  Numbered steps  │                 │
│  OR concept list │  ~480px wide    │
│  OR explanation  │  vector-crisp   │
│                  │                 │
│  Key takeaway    │                 │
│                  │                 │
├──────────────────┴─────────────────┤
│  ← Prev    ● ● ● ● ●    Next →    │  <- nav
└────────────────────────────────────┘
```

The left page tells the WHAT/WHERE/WHEN/HOW in words. The right page shows the same content as a labeled visual with motion where motion adds meaning.

## The visual aesthetic — siem.gif lineage

Right-page visuals follow this style language (anchored on operator's `siem.gif` reference image):

- **Dark background** with strategic per-step color highlights (blue/cyan/purple/orange/green palette).
- **Labeled real components** — never abstract dots/lines. If the topic is DNS, the visual labels say "Recursive Resolver", "Root", "TLD", "Authoritative", not "Node A/B/C/D."
- **Numbered step badges** that pulse in sequence (siem.gif technique).
- **Packets / flow tokens** that glide along arrow paths during their step's window (the "data flow" feel).
- **Subtle grid background** for technical-diagram texture.
- **Terminal answer pill** appearing at the end of the loop to land the takeaway.
- **Loop length: 6-10 seconds** per cycle. Long enough to read each step, short enough to repeat without irritation.

Reference implementation: `_docs/architecture/wsa-redesign/samples/dns-HOW.sample.html` (canonical sample, approved 2026-05-30).

## Content-fit rule (operator's mandate)

> We will not force crunch content so it overflows; if it does not fit in an easily readable font format size then it flows to the next slide.

Operational consequence:

- Pick a target readable font size for body text (≥0.95rem at 1280×720 viewport).
- If left-page content exceeds the available height at that font size, the content splits across successor slides.
- Successor slides carry the same monomial label with a sub-index: `HOW (1/2)`, `HOW (2/2)`.
- The right-page visual either continues evolving across the successor slides (storyboard style — recommended for sequential flows) or each successor gets its own visual aspect of the same topic.

## What this does NOT change

- The course architecture (module count, lab structure, hub layout) is not touched.
- The CSS frame structure (`html, body { height: 100vh; overflow: hidden; }` + the slide-container/slide cascade) stays — the OVERFLOW-001 silent-clip issue is fixed by splitting content, not by lifting the frame.
- Existing labs, quizzes, hub pages are out of scope.

## How this applies to m08 (DNS) as a whole

m08 already spans 22 slides covering many DNS sub-topics: DNS fundamentals, hierarchy, zone types, record types, resolution flow, forwarders, stub vs caching vs authoritative servers, DNSSEC, troubleshooting tools, etc. Each of those is a topic in its own right; each gets its own monomial-coverage evaluation.

A correct application of the model does NOT mean "DNS gets four slides" — it means each sub-topic inside m08 is examined:

| m08 sub-topic | Likely monomials it needs | Approximate slide count |
|---|---|---|
| What is DNS | WHAT (+ a touch of WHY) | 1 |
| DNS hierarchy | WHAT, WHERE | 1-2 |
| DNS zone types (primary / secondary / stub / forwarder) | WHAT, HOW (split if needed) | 2-3 |
| DNS record types (A / AAAA / CNAME / MX / SRV / etc.) | WHAT, WHEN-to-use-each | 2-3 |
| **DNS resolution flow (recursive walk)** | **HOW** | **1 — the canonical sample** |
| Forwarders (conditional, forward-only servers) | WHAT, HOW, WHEN | 2-3 |
| DNSSEC | WHAT, WHY, HOW (the signing/validation chain) | 3-4 |
| Troubleshooting tools (`Resolve-DnsName`, `nslookup`, `dig`) | HOW (per tool) | 2-3 |

The HOW monomial canonical sample at `samples/dns-HOW.sample.html` is one slide inside this much larger module — it is not the entire DNS coverage. It demonstrates the slide PATTERN, not a topic plan.

## What the framework does and does NOT prescribe

| Prescribes | Does NOT prescribe |
|---|---|
| Each slide addresses one monomial (or one chunk of a monomial if split) | A fixed slide-count per topic |
| Content does not get crunched across monomials | A fixed monomial subset per topic |
| Readable density wins over slide-count economy | That every topic must span all six monomials |
| The open-book visual layout for delivering the monomial | The order monomials appear (author's judgment, story-driven) |
| The siem.gif aesthetic for the right-page when motion serves the content | That every slide needs motion (WHAT slides may be static) |

## Failure modes to avoid

1. **Padding a monomial.** If WHO doesn't matter for this topic, don't invent it. Skip the slide.
2. **Splitting WHAT into separate "definition" + "purpose" + "terms" slides.** WHAT can hold all three if they fit readably; if not, then split (and you'll know because the slide will overflow).
3. **Burying HOW inside WHAT.** Resist the urge to demo the mechanism on the WHAT slide. Save it for HOW. WHAT is for "this thing exists and serves this purpose," not "here's how it operates."
4. **Right-page visual that doesn't match the monomial.** A HOW visual is sequential and animated. A WHERE visual is a map or topology. A WHEN visual is a timeline or trigger map. Don't put a HOW animation on a WHAT slide just because animation is impressive — it's the wrong shape for the question.

## Validation hooks

Once the WSA redesign rolls out using this model, OVERFLOW-001 (the existing 1280×720 slide-clip detector) will pass cleanly because each slide is right-sized. Additional validators that COULD be added later:

- **Monomial coverage** — for each topic block (identified by a topic ID metadata), assert that the expected monomials are present.
- **Aesthetic consistency** — each slide's right-page SVG should use the per-step color palette and the open-book grid layout class.

These are nice-to-haves, not v1 prerequisites. The model holds without automated enforcement.

## Adoption scope

- **WSA (Cloud house · Windows Server Administration)**: primary adoption target. 19 modules, ~200+ topic blocks.
- **Other courses**: candidate for fan-out if WSA pilot succeeds. The model is course-agnostic; it's a slide-design pattern, not a Windows-specific thing.

## Related artifacts

- `samples/dns-HOW.sample.html` — canonical sample, the HOW slide for DNS
- `README.md` — workspace overview
- `siem.gif` (operator's reference, at `~/hexworth-shared/images/format & content comparison/siem.gif`) — the source of the right-page aesthetic
- `_tools/eduscan/validators/functional/slide-overflow.js` — the silent-clip detector that this model resolves at source
- Memory: `reference_wsa_slide_pattern.md`
