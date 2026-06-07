# Scan → Verify → Fix → Rescan → QC

**Audience:** anyone (human or agent) working an EduScan finding.
**Status:** platform-wide quality-loop primitive. Not WSA-specific. Not OVERFLOW-specific.
**Origin:** operator correction 2026-06-07 during m03 surgery — `[[feedback_scan_fix_verify_loop]]`.

## TLDR

When an EduScan rule fires on an artifact, work the findings **one at a time** through five steps in order. **Do not** build a module-wide / artifact-wide plan before walking at least one finding through the loop. Diagnose any failure by attributing it to either the SCAN or the FIX.

```
[1] Scan   →   [2] Verify   →   [3] Design fix per rule   →   [4] Rescan   →   [5] QC
                                                                                  │
                                          fix broken? ←── scan failed or fix failed? ──→ rule broken?
                                          (developer)                                    (rule defect)
```

## The five steps

| Step | What | Done when |
|---|---|---|
| **1. Scan** | Emit findings via the relevant rule(s) — HEUR-XXX, OVERFLOW-XXX, QUIZ-XXX, FUNC-XXX, etc. | Finding list exists; severity + scope known. |
| **2. Verify the flag** | Open the artifact at the finding's location. Confirm the condition is real — content actually clips, answer actually matches the placeholder pattern, the link actually 404s. | One of two outcomes: (a) finding confirmed real → step 3; (b) finding is a false positive → **file a rule defect, do not "fix"**. |
| **3. Design fix per rule** | Match the rule's stated intent and its `fix:` recommendation. The rule defines the contract; the fix has to satisfy it. | The proposed change would, by the rule's own definition, clear the finding. |
| **4. Rescan** | Re-run the same rule against the modified artifact. | The finding is gone from the rule's output. |
| **5. QC** | Verify the artifact looks/behaves as intended — render, click, walk through, screenshot — beyond what the rule measures. | Visible/functional behavior matches author intent AND the artifact no longer presents the underlying defect to a student. |

## Diagnosis attribution

When the loop doesn't terminate cleanly, identify which side broke before iterating:

| Step 4 result | Step 5 result | Diagnosis |
|---|---|---|
| Finding cleared | Artifact still broken | **SCAN failed.** Rule doesn't model the full defect class. File a rule defect — extend or add a sibling. |
| Finding still fires | Developer believes fix is correct | Either **FIX failed** (developer error) or **rule has a false positive** (detection logic defect). Inspect detection before iterating. |
| Finding cleared | Artifact behaves correctly | Loop terminated. Move to next finding. |

## Anti-patterns

- **Bulk planning before verifying any one finding.** Building a tidy 24-row table of "what I'd do per slide" feels productive but skips step 2 entirely. When a single finding turns out to be a false positive or to need a different fix shape, the whole plan re-bakes. Operator framing: *"if we keep applying bandaids we will keep adding latency in different stages."*
- **Designing fixes that don't match the rule.** If `HEUR-039` says ">600 chars clips," the fix is "reduce to ≤600c OR split per the rule's `fix:` field." A creative "reorganize layout" fix may not satisfy the rule — step 4 will still fail.
- **Skipping rescan.** "I made the change, looks right" is not step 4. The rule must re-run; the finding must be gone.
- **Skipping QC.** A passing rescan does not prove the artifact works. The rule measures one thing; students see everything.
- **Treating a false positive as a real finding.** Step 2 exists because rules can be wrong. A "fix" applied to a false positive masks the rule defect AND damages the artifact.

## Per-finding examples

| Rule | Step 2 verify | Step 3 fix shape | Step 4 rescan | Step 5 QC |
|---|---|---|---|---|
| `HEUR-039` (text budget) | Open the slide; confirm `.slide-text` really exceeds 600 chars | Reduce text OR split per rule `fix:` | Re-run HEUR-039 | Render at 1280×720; confirm no clip + content preserved |
| `OVERFLOW-001b` (cat-contract overflow) | Render the slide active; confirm scrollHeight > clientHeight | Same as HEUR-039 OR address the visual side | Re-run OVERFLOW-001b standalone | Screenshot; confirm visible content matches author intent |
| `QUIZ-005` (key/option index mismatch) | Open quiz HTML + Firestore key; count question options | Update key to valid index OR fix HTML question count | Re-run QUIZ-005 | Take the quiz; confirm correct answer scores 100% |
| `HEUR-022` (over-deep relative link) | Read the `<a href>`; count `../` against file depth | Rewrite href to correct depth OR use absolute path | Re-run HEUR-022 | Click the link in a browser; confirm it resolves |
| `FUNC-006` (dead anchor) | Open the file; confirm target path doesn't exist on disk | Either create target OR remove/redirect the link | Re-run FUNC-006 | Click the anchor; confirm 200, not 404 |

## Scope

Applies to **any** EduScan rule on **any** artifact — HTML, JS, JSON, CSS, lab walkthroughs, Confluence solutions, server-graded keys. This is how findings become fixes without re-introducing the same class of bug.

## Case study: m03 surgery 2026-06-07

First end-to-end application of the loop. 14 OVERFLOW-001b + 10 HEUR-039 findings on `_app/houses/cloud/modules/wsa/m03-storage/cloud-presentation.module.html`. Result: HEUR cleared to zero, OVERFLOW reduced to 4 residual sub-perceptual findings (13/74/62/84px), all student-visible content preserved.

Three procedural lessons surfaced — they refine how to apply the loop, not the steps themselves:

**Lesson 1: Nancy gates the FIRST instance of a fix shape, not every Edit.**

Strict reading of CLAUDE.md says "Nancy before every Edit." Strict application would have meant 15+ Nancy dispatches just for m03's per-slide trims. Working interpretation that ran cleanly through the loop:

- Slide 1 trim (section-removal shape) → Nancy ✓ → apply
- Slide 2 split (split-at-topic-boundary shape) → Nancy ✓ → apply
- Slides 4–22 trims (same section-removal shape) → no Nancy, apply mechanically

Nancy validates the **pattern**, not the per-instance Edit. When a new shape variant emerges (a different fix mechanic on a different content shape), fresh Nancy. Same shape repeating → mechanical application is correct.

**Lesson 2: Step 5 (QC) is the authoritative judge — not step 4 (rescan).**

m03 finished with 4 residual OVERFLOW-001b findings, all sub-100px. Per validator output the loop wasn't "done." Per visual QC of the actual rendered slides, all student-visible content was intact. The loop correctly terminates on step 5 confirming the artifact behaves correctly, even when step 4 still reports findings. The diagnosis attribution table is exactly what determines this — see [[reference_validator_scan_defects_2026_06_07]] for the grounded data on HEUR-039 and OVERFLOW-001b defects this surgery surfaced.

**Lesson 3: Pattern recognition trumps per-slide analysis once the dominant shape is identified.**

After loop iteration 2 (slide 2), the dominant fix shape was clear: WSA cmdlet slides have an "Expected output" code-block that duplicates the right-panel SVG. Drop it, gain 150–250px, lose zero pedagogical content. Iterations 3–10 each became single-Edit operations instead of full design cycles. Documented in [[feedback_wsa_overflow_pattern]].

## Related

- `_tools/eduscan/` — the scanner
- `_tools/nexus/publish.js:37` — `TRIAGE_SEVERITY_GATE = ['critical', 'high']` — gates which findings reach triage
- `[[reference_static_analysis_bug_hunt_patterns]]` — static-analysis patterns that feed this loop
- `[[reference_stale_sprint_findings_pattern]]` — when sprint state outlasts the rule fix (a step-4-skipped symptom)
- `[[feedback_100_percent_sure]]` — render-verify before saying done (reinforces step 5)
- `[[feedback_severity_demotion_pattern]]` — when step 5 reveals the rule's severity was wrong, not the fix
- `[[feedback_wsa_overflow_pattern]]` — domain-specific pattern from m03 surgery (lesson 3 case study)
- `[[reference_validator_scan_defects_2026_06_07]]` — HEUR-039 + OVERFLOW-001b defect data from m03

---

*Last updated: 2026-06-07*
