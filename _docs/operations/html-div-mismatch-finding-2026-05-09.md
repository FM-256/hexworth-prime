# HTML Div Tag Mismatch Finding — 27 files (2026-05-09)

> **RESOLVED 2026-07-22.** A fresh `<div>`-balance scan of all 5,181 `_app` HTML files, run through the real EduScan HTML validator (`_tools/eduscan/validators/syntax/html.js`, which strips scripts/styles/comments/template-literals), shows **0 real HTML-011/012 findings remaining**. The last real ones were 6 eye/cyberops applets whose 4 tab panels opened `<section class="co-tab-content">` but closed `</div>` — fixed by converting the opens to `<div>` (commit `9a7b989f8`, deployed). The only raw-count imbalances still present (`admin/audit-tool.html`, `forge-ram-install.lab.html`, `script-regex-runner.html`, `lobby.html`, `forge-tim-application.lab.html`) are JS-template/string artifacts — validator-CLEAN, not real bugs. This finding is closed; the historical detail below is retained for reference.


**Detection method:** Marathon tick 75. Node scan walks `_app/**/*.html` (5,025 files), strips `<!-- -->` comments + `<script>` + `<style>` blocks, counts `<div>` opens vs `</div>` closes. Files with imbalance flagged.

**Important caveat:** Regex-based HTML mismatch detection is APPROXIMATE. AST-level parsing would be authoritative. Some findings may be scan artifacts (template literals containing div text in JS, edge-case patterns). Operator should visually verify each file before applying fixes.

## High-confidence finds (verified via whole-file count including scripts)

### 4 files with +4 close-delta (4 EXTRA `</div>` each) — shared template bug pattern

All in `_app/houses/eye/applets/cyberops/`:
- `eye-5-tuple-approach.applet.html` (58 opens / 62 closes, whole-file 72/76)
- `eye-attack-surface.applet.html` (55/59)
- `eye-data-loss-traffic.applet.html` (37/41)
- `eye-data-types-output.applet.html` (45/49)
- `eye-data-visibility.applet.html` (40/44)
- `eye-detection-methods.applet.html` (37/41)

**Inference:** Same +4 across 6 files = identical template-derived authoring bug. Likely all built from same source template that had 4 extra `</div>` at template generation. Would render with parent-container premature-close.

**Risk profile:** 4 extra `</div>` close grandparent containers prematurely. Browser-tolerant rendering may recover via DOM fixup, but layout could be wrong. Per CLAUDE.md feedback "Precision Over Speed": "One extra `</div>` broke the entire admin console."

**Operator action:** Visual-verify one of the 6 files. If layout is broken, find pattern of extra `</div>`s (likely 4 consecutive at end-of-content) and remove. Apply fix to other 5.

### Worst-case unclosed: dark-arts presentations

- `dark-arts-feh-10.presentation.html` — delta -12 (12 unclosed divs)
- `dark-arts-feh-09.presentation.html` — delta -9
- `projects/cloud-s3-static-site.html` — delta -8
- `projects/darkarts-kali-setup.html` — delta -8

**Risk profile:** Unclosed divs cascade to subsequent content being nested inside the unclosed parent. Often visible as content "trapped" inside earlier sections.

**Caveat:** These are presentation-style files with many slide divs. Possible the scan missed pattern variants (`<div ... />` self-closing tolerated by browsers but rare in HTML). Manual inspection required.

## Detection script (reproducible)

```js
const fs = require("fs"), path = require("path");
const APP_DIR = "_app";
function listHtml(dir) { /* ... walk filtering _archive/_source/.bak ... */ }
for (const f of listHtml(APP_DIR)) {
  const content = fs.readFileSync(f, "utf8");
  const opens = (content.match(/<div\b/g) || []).length;
  const closes = (content.match(/<\/div>/g) || []).length;
  if (opens !== closes) console.log(`delta=${closes-opens} ${f}`);
}
```

Whole-file count avoids the strip-script ambiguity.

## EduScan validator gap

Existing EduScan validators cover SEM-001/002/003 (heading hierarchy + h1 count) but NOT div-tag balance. A future HTML-DOM-001 validator (or similar) could catch these at commit-time using a proper HTML parser (parse5 / cheerio).

Tracked but not built — same diminishing-returns pattern as other forward-prevention candidates this session.

## Cumulative session findings cross-reference

- 17 commits delivered to master (real fixes + docs)
- 9 documented operator pending tasks (#82-#91)
- 2 memory entries (placeholder detector blind spot, static-analysis bug-hunt patterns)
- 9 false-positive corrections (all from `aplus-core1-chNN` regex pattern, ticks 68-69, 74)
- This audit: 27 div-mismatch candidates documented

All findings collected in audit docs at `~/hexworth-shared/Solutions/_audit/`.
