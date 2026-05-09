# Cyberops Applets — Section/Div Tag Fix Proposal (2026-05-09)

**Source finding:** `_docs/operations/html-div-mismatch-finding-2026-05-09.md` (6 cyberops applets, +4 close-delta each)
**Status:** Diagnosis complete; mechanical fix recipe ready for operator visual verification before apply
**Risk:** Per CLAUDE.md "One extra `</div>` broke the entire admin console" — div-balance changes get visual review

## Root cause

All 6 broken applets in `_app/houses/eye/applets/cyberops/` share an identical authoring bug:

- **4 `<section class="co-tab-content">` opens** (one per tab section)
- **0 `</section>` closes**
- **4 extra `</div>` closes** at section boundaries

The author wrote `</div>` instead of `</section>` at each tab boundary. The browser auto-closes the unclosed `<section>` elements at end-of-body, so layout currently *appears* correct, but each orphan `</div>` is closing a grandparent container prematurely. Whether that visibly affects rendering depends on which CSS rules target which container.

Healthy applets in the same directory (37 files) use a different template that doesn't use `<section>` at all — only `<div class="co-card">`. The 6 broken files come from a separate template variant.

## Per-file orphan-close map

Stack-based parser identified exactly 4 orphan `</div>` lines per file:

| File | Orphan `</div>` lines |
|---|---|
| `eye-5-tuple-approach.applet.html` | L198, L255, L273, L284 |
| `eye-attack-surface.applet.html` | L215, L300, L316, L322 |
| `eye-data-loss-traffic.applet.html` | L147, L205, L221, L227 |
| `eye-data-types-output.applet.html` | L145, L242, L258, L264 |
| `eye-data-visibility.applet.html` | L208, L316, L352, L363 |
| `eye-detection-methods.applet.html` | L225, L287, L303, L309 |

## Proposed mechanical fix

For each line in the table above: change the `</div>` token to `</section>`.

This:
- Adds 4 `</section>` closes (matching the 4 `<section>` opens) — sections become balanced
- Removes 4 orphan `</div>` closes — divs become balanced
- Net change: 0 div delta, +4 section delta = both balanced
- No content semantics change; only the closing-tag identifier

## Verification methodology after apply

1. Re-run the stack parser on each of the 6 files; confirm 0 orphan closes and 0 unclosed opens.
2. Visual smoke: open each applet in browser; confirm tab navigation still works (the `co-tab-content` class is targeted by JS at lines like 293-297 of each file — `document.querySelectorAll('.co-tab-content')`).
3. EduScan smoke gate (`_tools/eduscan/smoke/run.js`) — these applets are NOT currently smoke-target hubs, but a follow-up could include them.

## Why I did NOT apply this fix autonomously

The CLAUDE.md "Precision Over Speed" rule and the html-div-mismatch finding doc both call out that div-tag changes need visual verification before deploy. The fix is mechanically certain (stack-parser-confirmed 24/24 orphans), but a class of pages I cannot screenshot is exactly the case where over-confidence has previously broken production.

**Nancy follow-up review (2026-05-09 evening tick):** flagged a DOM-extent concern that warrants attention. Currently:
- `<section id="techniques">` opens at L51 and never closes before `<section id="indicators">` opens at L102.
- HTML5 parsing rules: a new `<section>` does NOT auto-close a prior open `<section>`; they nest.
- Therefore the current DOM has section 1 containing sections 2/3/4 (nested chain), not 4 sibling sections.
- The proposed fix (replace orphan `</div>` with `</section>`) would close section 2 at L147, section 3 at L205, section 4 at L221, and section 1 at L227. That makes sections 2/3/4 **direct children of section 1**, not siblings.

**Visual impact:** likely zero — Hexworth CSS is class-based (`.co-tab-content`), and `document.querySelectorAll('.co-tab-content')` returns the same 4 elements in either tree shape. But CSS using `:scope`, `.section1 > .child`, or `[id="indicators"] *` selectors would differ. None observed in current codebase but operator should spot-check.

**Operator action:** verify ONE applet visually pre-fix; apply the change; verify visually post-fix. The dark-arts presentation fix (commit `0a862c8d`, evening tick) was a similar pattern that shipped successfully, so this fix is likely also safe — but the section-nesting DOM shape change means it deserves a screenshot before applying to all 6.

## Proposed validator forward-prevention

The investigation produced a working stack-based div parser:

```js
const divPattern = /<(\/?)div\b[^>]*>/gi;
let m;
const stack = [];
const orphanCloses = [];
while ((m = divPattern.exec(content)) !== null) {
  const isClose = m[1] === "/";
  const lineNo = content.slice(0, m.index).split("\n").length;
  if (isClose) {
    if (stack.length === 0) orphanCloses.push({line: lineNo});
    else stack.pop();
  } else {
    stack.push({line: lineNo, tag: m[0]});
  }
}
```

This could promote to an EduScan HTML-DOM-001 validator (or be added to the existing structure validator). Catches div-balance bugs at commit time vs. whole-platform scan. Out of scope for this tick — separate Nancy review needed.

## Out of scope for this fix

- The remaining 21 files in the html-div-mismatch finding (single-file deltas, not the shared-template pattern)
- Worst-case unclosed cases (`dark-arts-feh-10.presentation.html` -12, etc.) — those are separate investigations
- Validator promotion to EduScan — separate ticket

## Architecture refs

- Source detection: `_docs/operations/html-div-mismatch-finding-2026-05-09.md`
- Stack parser run: this artifact
- CLAUDE.md "Precision Over Speed" rule (HTML nesting verification)
