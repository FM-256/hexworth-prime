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
