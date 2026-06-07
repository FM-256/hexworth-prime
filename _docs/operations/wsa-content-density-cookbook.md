# WSA Content-Density Cookbook

**Audience:** anyone (human or agent) working WSA cat-contract overflow findings on `cloud-presentation.module.html` files.
**Status:** stable — calibrated across m01, m02, m03, m04. Apply to m05–m19 as-is.

## TLDR

Nine fix patterns that bring WSA `cloud-presentation.module.html` files to HEUR-039 = 0 and OVERFLOW-001b residuals all ≤ ~85px (boundary-tolerable per the loop's step 5). Refined across m01, m02, m03, m04 — all four are now full cats.

The scan-fix loop itself lives in `_docs/operations/scan-fix-verify-loop.md`. This doc is the specific recipes for **step 3 (Design fix per rule)** when the artifact is a WSA presentation module.

## Scope

| Item | Value |
|---|---|
| Files | `_app/houses/cloud/modules/wsa/*/cloud-presentation.module.html` |
| Rules | HEUR-039 (`_tools/eduscan/validators/syntax/heuristics.js:4500`) + OVERFLOW-001b (`_tools/eduscan/validators/functional/slide-overflow-b.js`) |
| Viewport | 1280×720 (per `[[reference_design_choices_log]]`) |
| HEUR-039 target | 0 findings |
| OVERFLOW-001b target | All residuals ≤ ~85px; see [Per-module baseline](#per-module-baseline) |

HEUR-039 fires when `.slide-text` stripped char count exceeds 600. OVERFLOW-001b fires at runtime when `.slide-content` scrollHeight exceeds clientHeight by more than 2px. Both rules scope exclusively to WSA cloud-presentation.module.html — the file name pattern and path pattern are enforced in the rule implementations.

## The 9 patterns

Walk this list **in order** on each overflowing slide. Patterns higher in the list yield more px per edit and require less editorial judgment. Patterns 6–9 require judgment; apply them only after 1–5 are exhausted on the slide.

| # | Pattern | Detection signature | Action | Why it's safe | Typical savings | Modules where seen |
|---|---|---|---|---|---|---|
| 1 | **Drop "Expected output" code-blocks** | `<div class="code-block">` whose first `<span class="comment">` begins with `# Expected output:` or `# Output:` | Delete the entire code-block div | The right-panel SVG already shows this output; the text-side block is redundant | 80–120px | m02, m03, m04 |
| 2 | **Drop "Quick term" / glossary highlight-boxes** | `<div class="highlight-box" style="margin-top: 6px;">` whose `<strong>` child contains `Quick term` or `Quick terms` | Delete the entire highlight-box div | Definitions belong inlined into the primary box; the secondary box is supplemental | 60–90px | m01 slides 2–3 |
| 3 | **Drop auxiliary "Reading the output" paragraphs** | `<p style="font-size: 0.85rem; color: var(--text-secondary)">` with `<strong>` text like `Reading the output`, `What the new cmdlets do`, `The cryptic X params` | Delete the paragraph | These are parameter explainers; merge key terms into the primary intro if needed | 30–60px | m01, m02 |
| 4 | **Drop inline ASCII diagram-boxes** | `<div class="diagram-box">` containing box-drawing characters (┌ ─ │ └) inside `.slide-text` | Delete the entire diagram-box div | Diagram is a structural duplicate of the right-panel SVG | 100–160px | m03 slide 9, m04 slide 2 (two drops) |
| 5 | **Consolidate adjacent code-blocks** | Two or more `<div class="code-block">` siblings showing sequential cmdlets of the same workflow (e.g., `Start-VM` / `Stop-VM` / `Stop-VM -Force`) | Merge into one block with line-break separation | One cmdlet workflow = one code-block; sequence separation via blank lines is readable | 40–60px per merge | m04 slide 9 (5 blocks → 2) |
| 6 | **Collapse 2-col compare → inline strong-prose paragraph** | `.two-columns` with short bullet lists (2–3 bullets each side) on a compare-pair concept | Replace with one paragraph using `<strong>` for the labels; drop the column chrome and h3/h4 headers | The content is present; only the chrome is removed | 80–120px | m02 slide 3, m04 slide 6 |
| 7 | **Collapse 3-column tables → 2 columns** | `<table class="comparison-table">` with 3 `<th>` columns where one column contains only short labels | Fold the short-label column into the row labels | Column reduction with same data = same semantics | 30–50px per row | m02 slides 3, 12 |
| 8 | **Reorder warning-box / takeaway-box to top** | A `<div class="warning-box">` or `<div class="insight-box">` sitting below bullet lists, clipped at the slide bottom | Move the box above the bullet list | The box is the takeaway; bullets are reference. If anything clips, clip the reference. Zero content change. | 0px (same overflow, better student experience) | m03 slide 2 |
| 9 | **Tighten bullet lists (last-trim resort)** | A list of 5+ `<li>` items where one is the lowest-value entry, or a bullet whose text wraps to a second line | Drop the lowest-value bullet OR compress bullet text to fit one wrapped line | Use only after 1–8 have cleared; apply the minimum cut | 30–60px per bullet | Universal |

**Why:** Pattern 1 alone clears the majority of m03/m04 findings because the "cmdlet + Expected output code-block + SVG panel" structure is the WSA author template for all cmdlet slides. Patterns 6–9 handle edge cases.

## Loop integration

These patterns slot into `_docs/operations/scan-fix-verify-loop.md` as the step 3 recipes for WSA presentations.

```
[1] Scan (HEUR-039 + OVERFLOW-001b)
[2] Verify the flag (read the slide — confirm density is real)
[3] Walk patterns 1–9 in order, applying any whose detection signature matches
[4] Rescan (re-run HEUR-039 + OVERFLOW-001b)
[5] QC at 1280×720 — confirm no student-visible clip AND content preserved
```

After patterns 1–9, residual OVERFLOW-001b findings ≤ ~85px are the SCAN-defect class (see `[[reference_validator_scan_defects_2026_06_07]]`). The loop terminates at step 5 on "no student-visible content loss" — not on "0px overflow."

**Nancy gate:** Nancy validates a fix shape once per new shape, not per slide instance. Slide 1 trim (section-removal) → Nancy, then apply mechanically to all matching slides. Slide split at a real topic boundary → Nancy before the split. Same shape repeating across 15 slides → no re-Nancy. See `_docs/operations/scan-fix-verify-loop.md` — Lesson 1.

## Per-module baseline

Calibration data from the four completed cats. Use these numbers as reference when diagnosing regressions or sizing work on m05–m19.

| Module | HEUR-039 before | HEUR-039 after | OVERFLOW before (count / max px) | OVERFLOW after (count / max px) |
|---|---|---|---|---|
| m01-fundamentals | 10 (645–968c) | 0 | 5 / 53px | 0 |
| m02-active-directory | 11 (634–894c) | 0 | 5 / 39px | 1 / 34px |
| m03-storage | 10 (604–813c) | 0 | 15 / 402px | 4 / 84px |
| m04-hyperv | 5 (621–727c) | 0 | 8 / 458px | 4 / 46px |

The char-range column (e.g., "645–968c") reflects the before-fix range across all overflowing slides. Budget = 600c per HEUR-039.

## Anti-patterns to refuse

Per `_docs/operations/scan-fix-verify-loop.md` anti-patterns, plus WSA-specific additions:

| Anti-pattern | Why it fails |
|---|---|
| **Visual scaling** (font-size shrink, `transform:scale`) | Operator standing rule: no bandaids. Scaling does not satisfy HEUR-039 (char-based); it breaks cat-contract visual consistency. | 
| **Splitting a slide that is one concept** | Split when a real topic boundary exists (e.g., "Disk Types + Partition Styles" = two separable topics). Do not split a single-concept slide that has too much detail — trim instead. Splitting one concept into two slides fragments the pedagogical arc. |
| **Chasing 0px overflow** | OVERFLOW-001b fires on sub-perceptual border/padding shaves that students never see as clipped content. Per `[[reference_validator_scan_defects_2026_06_07]]` defect #2, the `>2px` threshold is too tight for cat-contract chrome. Step 5 (QC) is the authoritative judge, not step 4 (rescan). |
| **Bulk-planning before verifying** | The dominant shape (pattern 1) is not universal. False positives and edge-case slides exist. Walk one finding through the full loop before planning the rest of the module. Per `_docs/operations/scan-fix-verify-loop.md` anti-patterns. |

## Future work

| Item | Status | Notes |
|---|---|---|
| Auto-heal script for patterns 1–5 | Not started — operator-flagged as next-stage | Patterns 1–5 are structurally detectable in static HTML; a script applying them mechanically would clear the majority of m05–m19 findings without per-slide editorial review. Patterns 6–9 require judgment — stay manual. |
| HEUR-039 shape-aware budget refinement | Deferred — post-WSA-surgery data needed | Per `[[reference_validator_scan_defects_2026_06_07]]` defect #1: list/box content has ~1.5–2× vertical density per char vs paragraph content. Rule needs content-shape coefficients. Natural loop: after m05–m19 complete, residual data will size the threshold confidently. |
| OVERFLOW-001b tiered severity | Deferred | Per `[[reference_validator_scan_defects_2026_06_07]]` defect #2: `>2px` threshold over-fires on cat-contract chrome. Recommendation: tiered severity (high >60px, medium 5–60px, low ≤5px) per `[[feedback_severity_demotion_pattern]]`. |

## Related

- `_docs/operations/scan-fix-verify-loop.md` — parent loop; this cookbook extends step 3 for WSA presentations
- `_tools/eduscan/validators/syntax/heuristics.js:4500` — HEUR-039 implementation + threshold derivation comments
- `_tools/eduscan/validators/functional/slide-overflow-b.js` — OVERFLOW-001b implementation
- `[[feedback_wsa_overflow_pattern]]` — m03 surgery origin memo; dominant "drop expected-output block" shape
- `[[reference_validator_scan_defects_2026_06_07]]` — HEUR-039 + OVERFLOW-001b defect data; grounds the ≤85px loop-termination rule
- `[[feedback_scan_fix_verify_loop]]` — parent loop feedback origin
- `[[reference_slide_design_pattern]]` — one topic per slide; governs when split is correct vs trim

---

*Last Updated: 2026-06-07 · v1.0.0*
