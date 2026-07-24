# Armory honest-completion checkpoint — LOCKED TEMPLATE SPEC (BUG-021)

Reference implementation: `_app/houses/code/armory/javascript/arm-js-*.module.html`
(commit 7056fcc98, Nancy PROCEED + Chris lock). Every fan-out family copies this
exact harness + rules. Pattern origin: `feedback_honest_ui_lab_checkpoint_pattern`
(CSE labs 07/08).

## The defect being fixed
Each module credits `ModuleProgress.complete('code', '<id>')` with ZERO demonstrated
work — fired on page LOAD (js), on click-through CHIPS (c), or on SCROLL-to-bottom
(the 12 scroll families + python-graphics). Replace with earned completion.

## Per-module changes
1. REMOVE the ungated completion trigger (the load-fire `<script>ModuleProgress.complete(...)`,
   the scroll `checkScroll()`→`saveProgress()`→complete, or the chip-completion flow).
   Keep CodeRunner.js, the hex-ai-button block, and all teaching content.
2. ADD a `<section class="checkpoint-section">` before the nav footer: 4 free-text
   checkpoints, styled with the module's OWN CSS vars (reuse its card/section classes;
   green accent for pass).
3. Each checkpoint: prompt (a `.cp-text` span referencing a specific module section),
   a `.cp-input`, a Check button `onclick="checkCheckpoint('cpN')"`, a `.cp-feedback` span.
4. Config: `var CHECKPOINTS = [{ id:'cp1', prompt:"…", answer:'…', normalize:'numeric'|'text' }, …]`.
5. GATE: a `<button id="completeModuleBtn" disabled …>` that enables only when all pass;
   `completeModule()` INDEPENDENTLY re-checks `CHECKPOINTS.every(passed)` and no-ops with
   an alert if unmet, then fires `ModuleProgress.complete('code', '<exact-module-id>')`.
6. State: `localStorage['armory-<lang>-<NN>-checkpoints']`; restore on load, re-mark passed rows.
7. "N / M checkpoints" progress indicator.

## Harness (copy verbatim from the JS reference; only CHECKPOINTS + storage key + id differ)
`normalizeNumeric` (strip `$ % ,` + whitespace), `normalizeText` (trim, lowercase,
collapse whitespace), `isMatch` (empty candidate/expected → FALSE before any compare;
array-of-acceptable-answers supported), `checkCheckpoint(id)`, `savePassed`/`loadPassed`,
`restoreCheckpointUI`, `updateProgress`, `updateCompleteButtonState`, `completeModule`.
Wrong answer: generic "Not quite — re-read the <section> and try again", NO reveal, NO
lockout, unlimited retries.

## THE ANTI-LEAK RULE (Nancy round-1 BLOCK — non-negotiable, this is where families fail)
A checkpoint answer MUST NOT be transcribable from an adjacent teaching comment / output
span. A student must TRACE or APPLY logic, not copy a printed result. In priority order:
1. **Apply-to-new-inputs (best):** ask the concept for DIFFERENT operands than the module
   prints. Module shows `factorial(5) // 120`? Ask `factorial(6)` → 720. Module shows
   `[1,2,3,4,5].reduce(+) // 15`? Ask the same reducer on `[2,4,6]` → 12. Module prints a
   spread result one way? Ask the REVERSED order (answer not printed).
2. **Reuse the module's own UNANSWERED practice exercises** (prompts listed, answers never
   printed) — structurally nothing to leak.
3. **Behavioral / keyword-identification** questions with no printable output (which method
   stops bubbling? what does fetch() do on a 500? what flag does the compiler use?) — the
   answer word necessarily appears in shown code, and that's FINE (different from an
   output-comment transcribe).
NEVER: quote a `console.log(x) // <result>` line and ask for `<result>`; ask for a value
printed in a `class="output">` span; ask for the value stated in a merge-result comment.

## QC before returning (builder runs; coordinator re-runs)
- Recompute EVERY answer independently (Node) — a wrong answer makes the module uncompletable.
- Run the gameability scan: `node _tools/marathon/upload/armory-checkpoints/gameability-scan.js <family-dir>` —
  every POSSIBLE LEAK gets a HUMAN read; only the accepted shapes may remain (a common-token
  false positive, or a value visible in an INPUT literal the student must operate on, never an
  output-comment transcribe).
- Per file: `new Function()` syntax on inline scripts; exactly one `completeModule` def + one
  `ModuleProgress.complete('code', '<correct-id>')`; ungated trigger REMOVED; button starts
  disabled; balanced nesting; no emoji.
- DOM-shim (or equivalent) test one module end-to-end: empty input never passes, wrong answer
  no-lock/no-reveal, completeModule blocked pre-completion, unlocks only at all-pass.

## Family file lists (10 each; bash/ + sql/ already honest — DO NOT touch)
c, cpp, csharp, go, java, lua-perl-r, php, powershell, python, ruby, rust, swift-kotlin:
  `_app/houses/code/armory/<lang>/*.module.html`
python-graphics: `_app/houses/code/armory/python-graphics/pg-*.html`
c is the OTHER indefensible family (click-chip completion) — do it first with JS.

## Gates: builder → coordinator re-verify (gameability scan + recompute sample) → Nancy per family → final Chris (whole campaign) → ./deploy.sh (needs fresh operator deploy auth).
