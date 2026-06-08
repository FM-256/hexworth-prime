# ALA Weekly Lecture Companion — Pattern Brief

**Course:** CTS4321C — Advanced Linux Administration (ALA, `_app/houses/matrix/adv-linux/`)
**Drafted:** 2026-06-07
**Status:** Brief — for marathon execution

---

## The frame

The companion is **the instructor's presentation deck**. The professor (Frank) walks the class through the week's topics live — clicking through slides, narrating, demonstrating. The deck is shaped for *live presentation*, not for student self-study.

**This means:**
- **One idea per slide.** Each slide carries enough text to anchor what's on screen, not enough to read in place of listening.
- **Visual balance.** Text + images + animations / SVGs. A slide that's a wall of bullets fails the format — the audience reads instead of listening. A slide that's pure image with no text fails too — students lose the anchor.
- **Pacing for spoken delivery.** Topic transitions are explicit. Examples are illustrated, not buried in prose.
- **Instructor voice.** Practitioner. Confident. Real-world Linux ops. Not textbook-formal.

**Topic angle: how we USE Linux** (Frank's framing, 2026-06-07). The week's tools/topics are presented through the lens of practical use — not theory, not history, not academic abstraction. Examples are operational. Commands shown are commands a student would actually run.

**Length target:** ~20-30 slides per week (sized for a typical class-period delivery — calibrate per week's topic density).

**Voice register reference:** match PIS w1 lecture (operational practitioner, security analyst tone). NOT the Eth lecture register (reflective / philosophical).

---

## What good looks like per slide

A typical body slide should have:
- **slide-meta** label (Slide N of M, optional topic tag)
- **slide-title** — the punchy one-line concept (with `<span class="accent">` highlight)
- **slide-subtitle** — one sentence framing what this slide IS, not what's on it
- **Body** — visual + text balance. Examples that work:
  - A diagram (SVG) showing how a tool works + 2-3 short captions
  - A code-block showing the exact command + a 1-line annotation per line
  - A two-column "before vs after" or "wrong vs right" with brief text on each side
  - An animated SVG illustrating the flow (e.g., a packet traversing a network stack)

A typical body slide should NOT be:
- 6+ bullets of text with no visual
- A code-block longer than 8 lines with no commentary
- Pure decoration with no anchor concept

---

## Per-week scope

| Week | Week title | Topic decks (week's tools to cover) |
|------|-----------|-------------------------------------|
| W1 | Grid Connection: CLI Operations + Networking | CLI Operations · systemd · Network Config · Network Diag |
| W2 | Perimeter Defense: Hardening + Package Management | Firewalls · Authentication · Antivirus · Packages |
| W3 | Sector Authority: DNS + Automation | DNS Fundamentals · BIND Deployment · Bash Scripting · Automation |
| W4 | Integrity Verification: Filesystem + Performance | File Integrity · Log Management · Performance |

**Scope:** W1, W2, W3, W4. **W0 (Refresher) is out of scope** unless operator says otherwise post-W1 review.

---

## Deck structural shape (~20-30 slides)

Suggested shape, adjusted per week. Marathon executor must justify deviations.

1. **Title** (1 slide) — week title, course code, week number meta
2. **Week opener** (1 slide) — "what we're covering today" with the 4 topic threads laid out visually (could be a simple 4-quadrant diagram)
3. **Topic 1 block** (~5-7 slides):
   - Topic concept slide (what is X, why we care)
   - 2-3 use-of-X slides — actual commands, real syntax, real output
   - One "this is how it goes wrong" slide (or one practical example slide)
4. **Topic 2 block** (~5-7 slides) — same shape
5. **Topic 3 block** (~5-7 slides) — same shape
6. **Topic 4 block** (~3-5 slides) — same shape (often shorter; less depth needed if it's a tool rather than a concept domain)
7. **Synthesis slide** (1 slide) — how the week's topics connect; one visual showing the 4 threads weaving together for one realistic Linux admin scenario
8. **What's next** (1 slide) — pointer to next week's theme

---

## Visual element guidance

Match the existing matrix-theme palette (green-on-dark-green, like the ALA hub):
- Primary accent: `#00ff41` (matrix green)
- Secondary: `#10b981` (emerald)
- Background gradients consistent with deck CSS already in templates
- Animations: subtle. Examples — fade-in on slide enter, dashed-line packet animations for network slides, blinking cursor on terminal slides. NOT: aggressive bouncing, distracting motion behind text.

**SVG vs raster:** prefer SVG. They scale, animate inline, and version-control well. Raster images only when essential (e.g., a screenshot of a real GUI).

**Animation policy:** every animation must serve the explanation. If a slide's animation could be removed without losing meaning, it's decoration — drop it.

---

## File pattern

- **File path:** `_app/houses/matrix/adv-linux/presentations/ala-w<N>-lecture.presentation.html`
- **Reference templates:**
  - `_app/houses/shield/infosec/presentations/pis-w1-lecture.presentation.html` — closest voice match
  - `_app/houses/divergent/ethics-it/presentations/eth-w3-lecture.presentation.html` — visual richness reference
- **Standard structure:**
  - `<section class="slide active" id="slide-1">` (title)
  - `<section class="slide" id="slide-N">` (body)
  - Each slide: `slide-meta` → `slide-title` (with `<span class="accent">`) → `slide-subtitle` → content

---

## Hub wiring (per week)

After the deck file exists, add it to the week card in `_app/houses/matrix/adv-linux/index.html`:

```html
<!-- Lecture Companion (after the Assessment subsection) -->
<div class="subsection">
    <div class="subsection-label label-presentation">Lecture Companion</div>
    <div class="content-grid">
        <a href="presentations/ala-w<N>-lecture.presentation.html"
           class="content-card" data-module="ala-w<N>-lecture">
            <!-- card body matching existing cards in this week -->
        </a>
    </div>
</div>
```

Also add `'ala-w<N>-lecture'` to the per-week module-id array near the bottom of `index.html`.

**Placement:** AFTER the Assessment (quiz) subsection. The companion is the literal last item of each week.

---

## Validation gates (per deck)

1. HTTP 200 from local server
2. No console errors on slide nav
3. Each slide renders within 1280×720 (no overflow)
4. Hub card click navigates to the deck
5. Every cited command/tool actually works as the slide shows (factual accuracy — Karl review on any cited CVE, manual-page reference, or version-specific claim)
6. Visual-balance check: no slide is pure text-wall or pure decoration (manual inspection during render-verify)

---

## Sourcing

- **Syllabus:** `~/hexworth-shared/Raw sources/Faculty docs/CTS4321C MS Advanced Linux Administration.docx` — read end-to-end before W1 draft for objectives per week
- **W1 content already on disk:** read all 4 W1 presentation files + lab pages + quiz to ground the content in what the students already saw
- **Operational realism reference:** SRE practice, Linux admin field guides; cite when used

---

## Marathon workflow per week

1. Read week's syllabus objectives
2. Read all the week's existing topic decks + lab descriptions + quiz topics
3. Outline the deck — 20-30 slide structure following the shape above
4. Author the deck with visual balance per slide (text + image/SVG/animation)
5. Render-verify in browser
6. Consult Nancy on the draft (voice, visual balance, factual accuracy)
7. Wire into hub
8. Commit per week
9. **W1: stop for operator review** before fanning out to W2-W4

---

*Marathon executor: this is Frank's presentation deck. Keep the instructor voice. Keep visual balance per slide. The deck must be presentable live, not just readable.*
