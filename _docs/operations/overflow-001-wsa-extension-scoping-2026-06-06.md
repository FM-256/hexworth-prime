# OVERFLOW-001 → WSA labs/quizzes extension — scoping notes

**Branch:** `marathon`
**Status:** SCOPING (no code change) — awaiting operator input on no-scroll intent + container targets
**Reason for parking:** the extension target is course-specific (WSA uses custom containers, not `.slide`); detection scope can't be derived from codebase alone

---

## Current OVERFLOW-001 (presentations only)

`_tools/eduscan/validators/functional/slide-overflow.js`:
- Scope: `*.presentation.html`
- Viewport: 1280×720
- Detection: per `.slide` element, force `display:flex`, compare `scrollHeight > clientHeight + 2px`
- Severity: MEDIUM

Skipped: presentation files without `.slide` (article-style — naturally scrollable).

## WSA module file layout (per scoping grep 2026-06-06)

Each WSA module folder (`_app/houses/cloud/modules/wsa/m??-???/`) contains:

| File | Top-level containers | "No-scroll" candidate? |
|---|---|---|
| `cloud-presentation.module.html` | (animation classes; `.slide` likely present — not verified yet) | Yes — already covered by OVERFLOW-001 IF `.slide` is used |
| `cloud-pslab.module.html` (PowerShell labs) | `.container`, `.lab-tabs`, `.lab-tab` (multiple per file) | Maybe — tab-based; each tab might be measured |
| `cloud-guilab.module.html` (GUI labs) | `.gui-container.gui-theme-hexworth`, `.instructions-sidebar` | Probably yes — split-pane should fit |
| `cloud-quizquiz.module.html` (Quizzes) | `.wq-container`, `.wq-footer` | Likely yes — quiz should fit |

Verified: NONE of `.pslab`, `.guilab`, `.quizquiz` use the `.slide` class. So OVERFLOW-001 currently skips them entirely (because of the `if (!slides.length) return null` guard at L90 of slide-overflow.js).

## Open questions for operator (before extension can be scoped)

1. **What is the "no-scroll" intent per file type?** Does the operator want:
   - (a) The full page to fit within 1280×720 (zero scrollbar at any tab/state)?
   - (b) Each tab/panel to fit when active?
   - (c) The text/content area only (allowing scroll on a fixed-size lab terminal panel)?

2. **Which container is the canonical measurement target per file type?**
   - pslab: `.lab-tab` (per-tab fit) OR `.container` (page-level)?
   - guilab: `.gui-container` (full lab) OR `.instructions-sidebar` (instructions only)?
   - quizquiz: `.wq-container` (full quiz) OR a per-question element (which one)?

3. **Viewport assumption:** keep the established 1280×720 (per `reference_design_choices_log.md`) for these file types too, or different?

4. **Severity:** match OVERFLOW-001 (MEDIUM)? Or HIGH for WSA since the no-scroll intent is documented (task #13)?

5. **Pattern reuse vs new rule code:** options
   - (a) Extend slide-overflow.js to accept multiple selectors per file extension, drive via a mapping table
   - (b) Add three sibling checker modules (lab-overflow, quiz-overflow, gui-overflow)
   - (c) Single new "container-overflow" module that handles the multi-target case

## Recommendation when operator returns

Walk one WSA module file together at the 1280×720 preview. Identify exactly which containers must fit and which can scroll. Codify those decisions into a per-file-extension mapping; then implement (a) above — extend slide-overflow.js to take a selector list per extension.

## Pattern A reference — what's already correct

The presentation case is the proof-of-concept: `.slide` is the per-screen container, the page itself is `position: relative` and locked at viewport size via CSS, and OVERFLOW-001 measures each slide independently. WSA labs/quizzes need the same property: a per-screen container that should fit, with the page wrapper locked to viewport.

If WSA labs/quizzes today use `overflow: scroll` or `min-height: 100vh` patterns without a hard viewport lock, that's the actual root cause and task #13 ("WSA labs + quizzes no-scroll structural fix") is about adding the viewport lock to the page wrapper. OVERFLOW-001 extension would then catch regressions where new content exceeds the locked container.

## Implementation blocked on operator input

This document captures scoping; no code change made. When operator answers the open questions, the validator extension can be implemented per their decisions.

---

## Addendum (cron heartbeat 2026-06-06) — also blocks the simpler file-filter extension

A separate, narrower extension was attempted during the cron heartbeat: extend OVERFLOW-001's file filter to include `*-presentation.module.html` (19 WSA cloud-presentation files using the same `.slide` container, 142 instances per m01 sample). The proposal was: one-line filter extension, zero detection-logic change.

**Nancy PAUSE on this narrower extension** — real layout-model divergence:

- **`.presentation.html` files:** `.slide` has explicit `min-height: 78vh / max-height: 84vh`. `clientHeight` is self-contained and reliable when validator forces `display:flex`.
- **WSA `cloud-presentation.module.html` files:** `.slide` has NO explicit height. Height comes from flex chain `body(100vh, flex)` → `.slide-container(flex:1)` → `.slide(flex:1)`. At page load, all slides are `display:none` (no `.active`). When validator forces `display:flex` on one slide without adding `.active`, the parent `.slide-container` has resolved height of 0 (no flex children visible until then) — so `clientHeight` of the slide may resolve to 0 or arbitrary value, producing false-positive overflow findings on every slide.

**Possible fix paths** (need empirical verification before implementation):
1. Have the validator add `.active` class along with `display:flex` during measurement. Models student-visible state more accurately. Risks affecting existing `.presentation.html` measurements if their CSS treats `.active` specially.
2. Pre-measure `.slide-container` clientHeight at page load and skip the file if it resolves to 0 (the height-from-flex case the existing logic doesn't model).
3. Force a `.slide.active` class onto exactly one slide before any other measurement, then iterate normally.

**Verification needed:** instrument a single WSA cloud-presentation.module.html through `_checkOne` with `console.log` of `.slide-container.clientHeight` and `.slide.clientHeight` at multiple points to confirm the layout-model behavior. Until verified, the simpler filter-only extension is unsafe — it would produce false positives.

This addendum updates the scoping doc with a finer-grained option (file-filter extension only) that turned out to have the same underlying layout-assumption problem the broader task #12 work needs to resolve.
