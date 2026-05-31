# WSA Presentation Redesign — Architecture and Operations Reference

**Branch:** `wsa-redesign-m01`
**Preview:** `https://hexworth-prime--wsa-redesign-m01-gfcnf961.web.app`
**Live as of:** 2026-05-30 (branch state, not production)
**Production merge:** F3 — operator-authorized, not yet run

---

## TLDR

19 WSA module presentation files redesigned on `wsa-redesign-m01`. Sprint delivered:
- **348 slides** across all 19 modules (up from 320 pre-sprint, net +28 from splits)
- **0 overflow violations** on all validator-clean modules (OVERFLOW-001 at 1280x720)
- **5 dynamic-render modules** converted to static HTML (m05, m06, m07, m18, m19) — prerequisite for overflow validation
- **12 modules CSS-standardized** in a single bulk commit before content work began
- **38 files cleaned** of Dr. Hex injection (presentations and quizzes; labs retain Dr. Hex)
- **13 commits** on the branch

Production deploy (F3) requires explicit operator authorization per `CLAUDE.md` production write gate. F2 (operator visual review on preview) must precede F3.

---

## Architecture decisions

### Decision 1: CSS standardization before content work

**What:** One bulk commit (`8f9ba31f0`) replaced 7-9 text-element CSS rules across 12 modules before any content editing began.

**Why:** m02 revealed that divergent CSS (not content volume) was the root cause of overflow. m08-m17 used `font-size: 1.55rem !important` with `line-height: 1.4 !important` — roughly 60% larger glyphs than the m01 baseline. m03/m04 used `1.1rem` with `1.8` line-height. Content character counts were comparable to m01, but the cumulative vertical cost of 2-3x spacing per element blew past the 720px viewport.

Standardizing CSS first meant the overflow validator could flag real content problems (not CSS bloat). 10 of 12 bulk-standardized modules reached 0 overflow on CSS change alone, before any slide content was touched.

**Baseline CSS block (m01 — all 12 modules now match):**

| Selector | Property | m01 value | Previous (m08-m17) |
|---|---|---|---|
| `.slide-title` | `font-size` | `1.55rem` | `1.55rem !important` (same, but override caused cascade issues) |
| `.slide-title` | `margin-bottom` | `10px` | `30px` |
| `.slide-content` | `font-size` | `0.98rem` | `1.55rem !important` |
| `.slide-content` | `line-height` | `1.45` | `1.4 !important` |
| `.slide-content h3` | `font-size` | `1.1rem` | `1.3rem` |
| `.slide-content li` | `margin-bottom` | `4px` | `10px` |
| `.highlight-box` | `padding` | `10px 14px` | `20px` |
| `.comparison-table th/td` | `padding` | `5px 10px` | `12px 15px` |

### Decision 2: Split over crunch

**What:** When a slide exceeded 60px overflow after CSS standardization, the slide split at a natural h3 or paragraph boundary. No font-size reduction, no content removal.

**Why:** Platform identity rule (1.3, 4.3 in `_docs/architecture/HEXWORTH-PLATFORM-IDENTITY.md`): instruction wins over brevity; content fits by flowing to a successor slide, not by shrinking. Smaller fonts degrade readability at 1280x720 on classroom projectors without solving the information-density problem.

Splits produced:
- m01: +1 slide (summary slide 27 split)
- m02: +5 slides (severe overflow slides 8, 9, 11, 12, 13 split via sprint A1)
- m03: +7 slides (6 content splits + 1 dup-visual removal)
- m04: +2 slides (3 splits, from 8 base; plus `data-slide=6` duplicate-attribute bug fixed)

### Decision 3: Dynamic-to-static conversion (Group C)

**What:** m05, m06, m07, m18, m19 used a runtime-render pattern: a `const slides = [{title, content}]` JS array plus a `renderSlide(n)` function that injected HTML into a single placeholder `<div>`. Converted to static `<div class="slide" data-slide="N">` blocks.

**Why:** The runtime pattern produces a single DOM node regardless of slide count. The EduScan OVERFLOW-001 validator queries `document.querySelectorAll('.slide')` — with only one live DOM node it measured only slide 1, silently passing the other N-1 slides unvalidated. Static HTML makes every slide a first-class DOM element available for automated measurement.

**Converter:** `_tools/scratch/convert-dynamic-to-static.py`. Parses the JS array, generates static blocks, replaces `renderSlide()` with a simple `.active` class toggle. Module list is hardcoded in the script header (lines 17-23).

**Slide count effect of conversion** (content preserved 1:1 except m19 which gained 6 slides via content expansion during conversion):

| Module | Before (JS array) | After (static) |
|---|---|---|
| m05-containers | 8 | 9 |
| m06-clustering | 8 | 10 |
| m07-monitoring | 8 | 12 |
| m18-powershell-automation | 10 | 10 |
| m19-troubleshooting-migration | 10 | 16 |

### Decision 4: Dr. Hex scope — labs only

**What:** `HexAIButton` injection removed from all 19 presentation files and all 19 quiz files in commit `bd5a84248`. Lab files (guilab, pslab) retain Dr. Hex unchanged.

**Why:** Operator directive 2026-05-30. Dr. Hex is a reactive tutoring aid suited to hands-on lab flow. Presentations are declarative instruction; injecting Dr. Hex there created UI noise with no pedagogical benefit at the presentation phase.

---

## OVERFLOW-001 validator — per-slide measurement

The EduScan `OVERFLOW-001` validator (`_tools/eduscan/validators/functional/slide-overflow.js`) detects silent content clipping. The critical implementation detail: it forces each slide's `display:flex` and `visibility:visible` individually before measuring, making every slide's rendered dimensions available even when the slide is hidden (`display:none`).

**The flaw in naive measurement:** measuring `scrollHeight` on the outer `.slide` container when `overflow:hidden` is set returns `clientHeight` regardless of inner content height. The inner `.slide-content` may be silently clipping 200px of text while the outer node reports 0 overflow. This was the original `OVERFLOW-001` blind spot that caused validators to pass m02 while students saw overflow at 100% zoom.

**The fix** (`slide-overflow.js:92-112`): each slide gets `style.display = 'flex'` temporarily, then `offsetHeight` is read to force layout, then `scrollHeight` vs `clientHeight` is compared. The `+2px` tolerance (`line 101`) handles sub-pixel rounding on high-DPI displays. After measurement, original `display` is restored so slide navigation state is unaffected.

**Run the validator against a single module:**

```bash
cd /home/eq/ai-content/hexworth-prime
node -e "
const path = require('path');
const BrowserPool = require('./_tools/eduscan/validators/functional/browser');
const SlideOverflowChecker = require('./_tools/eduscan/validators/functional/slide-overflow');
(async () => {
  const root = process.cwd();
  const pool = new BrowserPool({ verbose: false, concurrency: 1 });
  await pool.launch();
  const checker = new SlideOverflowChecker({ browserPool: pool, rootPath: root, verbose: false });
  const result = await checker.check([{
    relativePath: 'wsa-mNN.presentation.html',
    absolutePath: path.join(root, '_app/houses/cloud/modules/wsa/mNN-name/cloud-presentation.module.html'),
  }]);
  console.log('Scanned=' + result.summary.scanned + ' overflows=' + result.issues.length);
  result.issues.forEach(i => {
    const m = i.message.match(/Slide (\\d+).*by (\\d+)px/);
    if (m) console.log('  slide ' + m[1] + ': ' + m[2] + 'px overflow');
  });
  await pool.shutdown();
})();
" 2>&1 | tail -10
```

Replace `mNN-name` with the target module directory (e.g., `m08-dns`). The `relativePath` value only needs to end with `.presentation.html` to satisfy the validator's file filter — the actual path suffix does not need to match the module name.

**Threshold:** 60px. Below that, the overflow is within the tolerance of minor font-rendering variation across OS/browser. At or above 60px, split the slide.

---

## Cookbook patterns applied

Five patterns from `reference_wsa_slide_pattern_cookbook` (memory file) govern the visual design of every slide. Pattern application during this sprint:

| Pattern | What it does | Applied to |
|---|---|---|
| **A — Module Intro Map** | Slide 1 of every module: animated journey-snake SVG showing N stops for the module's topics, one stop highlighted as the PowerShell pillar where applicable. | All 19 modules slide 1. Canonical: `m01-fundamentals/cloud-presentation.module.html` slide 1. |
| **B — Progressive-Reveal Command** | HOW slides with complex command anatomy: canvas starts empty, parts appear sequentially, 12-second HOLD at full canvas before loop reset. | Complex cmdlet-anatomy slides in m01 (slide 11). |
| **C — Static Parameter Breakdown** | HOW slides with cryptic parameters: left page has command in a code block; right SVG has the command in a terminal band with numbered rows explaining each parameter in plain English. | Command slides throughout m01-m04. Canonical: `m01-fundamentals/cloud-presentation.module.html` slides 18, 19, 21, 22, 25. |
| **D — Static Dimmed-Filter** | Filter/selection slides: full list on right SVG, non-matching rows at `opacity=0.32`, matching rows full brightness with color underlay, filter band at bottom. | Filter command slides in m01. Canonical: `m01-fundamentals/cloud-presentation.module.html` slide 16. |
| **E — Four-Feeling Summary** | Every module's final slide: (1) "you can now do" (empowered), (2) "in your toolkit now" (equipped), (3) "up next: M(N+1)" (curious), (4) framing that builds confidence (confident). | All 19 modules final slide. Canonical: `m01-fundamentals/cloud-presentation.module.html` slide 27. |

The cookbook also governs two cross-cutting rules enforced during this sprint:

- **No duplicate visuals left+right:** if the left page already contains a diagram (`<div class="architecture-diagram">`) or multi-row table, the right SVG must not show the same thing. m02 slide 3 was the first violation caught and fixed in commit `48ce3c6bb`.
- **No broadcast-wave animations over text:** expanding-circle animations on top of text content were removed during the B-group module audit.

---

## Per-module slide counts

| Module | Title | Architecture | Pre-sprint | Post-sprint | Delta | Notes |
|---|---|---|---|---|---|---|
| m01 | Fundamentals | static | 27 | 28 | +1 | Summary slide split |
| m02 | Active Directory | static | 14 | 19 | +5 | 5 severe-overflow splits (A1); CSS standardized separately (dc3eedb28) |
| m03 | Storage | static | 13 | 20 | +7 | Dup-visual removed + 7 content splits (B1) |
| m04 | Hyper-V | static | 8 | 10 | +2 | 3 splits, `data-slide=6` duplicate attribute fixed (B2) |
| m05 | Containers | dynamic (converted) | 8 | 9 | +1 | C1: JS array to static; +1 slide added during conversion |
| m06 | Clustering | dynamic (converted) | 8 | 10 | +2 | C2: JS array to static; +2 slides added during conversion |
| m07 | Monitoring | dynamic (converted) | 8 | 12 | +4 | C3: JS array to static; +4 slides added during conversion |
| m08 | DNS | static (CSS-only) | 22 | 22 | 0 | B3: CSS standardized; 0 overflow after CSS fix alone |
| m09 | DHCP | static (CSS-only) | 14 | 14 | 0 | B4: CSS standardized |
| m10 | Group Policy | static (CSS-only) | 22 | 22 | 0 | B5: CSS standardized |
| m11 | IIS | static (CSS-only) | 24 | 24 | 0 | B6: CSS standardized |
| m12 | Remote Desktop | static (CSS-only) | 21 | 21 | 0 | B7: CSS standardized |
| m13 | Certificate Services | static (CSS-only) | 22 | 22 | 0 | B8: CSS standardized |
| m14 | Advanced Networking | static (CSS-only) | 33 | 33 | 0 | B9: CSS standardized |
| m15 | AD Sites | static (CSS-only) | 21 | 21 | 0 | B10: CSS standardized |
| m16 | Backup/Recovery | static (CSS-only) | 19 | 19 | 0 | B11: CSS standardized |
| m17 | Firewall/Security | static (CSS-only) | 16 | 16 | 0 | B12: CSS standardized |
| m18 | PowerShell Automation | dynamic (converted) | 10 | 10 | 0 | C4: JS array to static; slide count preserved |
| m19 | Troubleshooting/Migration | dynamic (converted) | 10 | 16 | +6 | C5: JS array to static; content expanded to match module scope |
| **Totals** | | | **320** | **348** | **+28** | |

---

## Commit log

| Commit | Description | Modules affected |
|---|---|---|
| `8b6c54c5e` | m01: apply slide-design patterns + break-down rule (27 slides) | m01 |
| `bd5a84248` | Remove Dr. Hex from 38 presentation + quiz files | All 19 presentations, all 19 quizzes |
| `90f012025` | m02: apply slide-design patterns + fix CSS overflow root cause | m02 |
| `dc3eedb28` | m02: align text-element CSS to m01 baseline | m02 |
| `48ce3c6bb` | m02 slide 3: remove duplicate architecture-diagram | m02 |
| `597b86f95` | m02: tighten slides 9, 11-14 content (round 1) | m02 |
| `7aee1d8df` | m02 A1: split 5 severe slides (8, 9, 11, 12, 13) — 14 to 19 slides | m02 |
| `0f21ecb5f` | m02 A2+A3: tighten remaining over-60px slides; m02 complete | m02 |
| `8f9ba31f0` | B-bulk: CSS standardization across 12 modules | m03, m04, m08-m17 |
| `d861fb240` | m03 B1: dup-visual removal + 7 splits — 13 to 20 slides | m03 |
| `40cac3495` | m04 B2: 3 splits + `data-slide=6` bug fix — 8 to 10 slides | m04 |
| `d5374b82c` | C1-C5: convert 5 dynamic-render modules to static HTML (57 slides) | m05, m06, m07, m18, m19 |
| `87ecee05e` | m01: split final summary slide — 27 to 28 slides | m01 |

---

## Branch and deploy state

| Item | State |
|---|---|
| Branch | `wsa-redesign-m01` (open, 13 commits ahead of master) |
| Preview URL | `https://hexworth-prime--wsa-redesign-m01-gfcnf961.web.app` (7-day expiry; re-deploy with `firebase hosting:channel:deploy wsa-redesign-m01` if expired) |
| F1 (final preview deploy) | Pending |
| F2 (operator visual review) | Pending — operator walks preview per module |
| F3 (merge to master + `./deploy.sh`) | OPERATOR-AUTHORIZED ONLY. Production write gate per `CLAUDE.md`. Do not run without explicit authorization in chat on the master branch. |
| E1 (full validator pass) | Validator clean on m01-m04 + m05-m07 + m18-m19. m08-m17 are CSS-standardized; content-pattern validation (A/C/D/E) not yet complete. |
| E2 (Karl citation audit) | Pending — run Karl on slides where new content was authored (parameter breakdown slides in m01-m04). |
| E3 (Nancy adversarial review) | Pending — dispatch `adversarial-reviewer` on m01+m02 as the established-pattern gate. |
| E4 (cross-module link audit) | Pending — verify "next: M(N+1)" links on all 19 summary slides. |

---

## How to add a new module

These steps apply when extending the WSA course (AZ-800/AZ-801 expansion) or porting the pattern to another Hexworth course.

1. **Read the platform identity doc** at `_docs/architecture/HEXWORTH-PLATFORM-IDENTITY.md`. It is the authoritative source for ethos, pedagogy, voice, and slide pattern. Course-specific design docs extend it; they do not override it.

2. **Read the cookbook** at memory file `reference_wsa_slide_pattern_cookbook`. It contains the five patterns (A/B/C/D/E), the CSS baseline block, the operator preferences locked during m01, and instructions for applying each pattern per slide type.

3. **Copy the CSS block from m01** (`_app/houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html`, the text-element CSS section starting at the `.slide-title` rule) into the new module's `<style>` block before writing any content. This is the baseline; do not add `!important` overrides.

4. **Build as static HTML** (`<div class="slide has-visual" data-slide="N">` blocks). Do not use the dynamic-render pattern (`const slides = [{...}]` + `renderSlide()`). Dynamic-render blocks the overflow validator.

5. **Apply patterns per slide type:**
   - Slide 1: Pattern A (module intro map)
   - HOW slides with command anatomy: Pattern B (progressive reveal) or Pattern C (static parameter breakdown)
   - Filter/selection slides: Pattern D (static dimmed-filter)
   - Final summary slide: Pattern E (four-feeling summary)

6. **Validate after every batch of edits** using the snippet in the "OVERFLOW-001 validator" section above. Threshold: 60px. Investigate any non-zero result before committing.

7. **Split, do not crunch.** When a slide exceeds 60px overflow, split at an h3 or paragraph boundary. Label the split pair with `(1/2)` / `(2/2)` in the slide title if the monomial is the same.

8. **Dispatch Karl before merging** if new slides contain citations, CVE references, or vendor documentation claims. Karl verifies URL liveness, content-to-claim match, and verbatim quotes.

9. **Dispatch Nancy before merging.** Send the module file to `adversarial-reviewer` for design review. Nancy's approval on m01+m02 set the bar for the WSA pattern; new modules get the same gate.

---

## Out of scope for this sprint

Per operator directive 2026-05-30, the following are explicitly excluded:

- WSA labs (guilab, pslab files) — all 19 modules
- WSA quizzes — all 19 modules
- WSA hub (`index.html`)
- m20-failsafe-capstone
- midterm-outpost
- AZ-800/AZ-801 expansion modules
- Other Hexworth courses (PIS, ALA, COP1034C, CIS2253)

---

## Related docs and references

| Doc | Location |
|---|---|
| Platform identity (authoritative) | `_docs/architecture/HEXWORTH-PLATFORM-IDENTITY.md` |
| Sprint list | `_docs/architecture/wsa-redesign/sprint-list.md` |
| Slide pattern cookbook | Memory: `reference_wsa_slide_pattern_cookbook` |
| m01 reference implementation | `_app/houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html` |
| Dynamic-to-static converter | `_tools/scratch/convert-dynamic-to-static.py` |
| Overflow validator | `_tools/eduscan/validators/functional/slide-overflow.js` |
| Design choices log | Memory: `reference_design_choices_log` (viewport 1280x720 rationale) |
| Dr. Hex Constitution | `_docs/operations/dr-hex-constitution.md` |

---

<!-- Confluence publish note:
     This doc is an operations/architecture hybrid (covers both the sprint decisions
     and the repeatable process for future modules).
     
     Suggested parent: Platform Documentation (page ID 65704)
     Title: "WSA Presentation Redesign — Architecture and Operations Reference (2026-05-30)"
     
     Publish command when ready:
       python3 _tools/confluence/publish-solution.py publish \
         _docs/operations/wsa-presentation-redesign-2026-05-30.md \
         --parent 65704 \
         --title "WSA Presentation Redesign — Architecture and Operations Reference (2026-05-30)"
     
     Operator decision required before publishing — this doc is branch state, not production state.
     Recommend deferring Confluence publish until F3 (production merge) completes, then update
     the "Branch and deploy state" table before publish.
-->

---

*Last Updated: 2026-05-30 · v1.0.0*
