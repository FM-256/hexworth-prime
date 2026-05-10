# CTF Lab Config Misaccess Bug — Discovery + Remediation Plan (2026-05-09)

**Severity:** Catastrophic. Every CTF lab in the PIS and ALA courses (24 labs total) has command-handler code that reads from the wrong object, causing every command to silently throw and produce no output. Students cannot complete any flag.

**Status:** Discovered 2026-05-09 by user reproduction (`intake` command in pis-l01 returned nothing). Browser-confirmed via Puppeteer state probe. Plan: build static validator → run audit → mechanical fix sweep → re-validate to zero → ship.

## The bug

Every PIS and ALA lab `config.js` defines internal state at the top level of the config object:

```js
const PISL01Config = {
    title: 'Specimen Classification',
    ...
    _classifications: { 'SPX-001': null, ... },     // ← top-level state field
    _answers: { 'SPX-001': 'rat', ... },
    _validTypes: ['virus', 'worm', ...],
    _flag1Awarded: false,

    commands: {
        intake: function(args, term, engine) {
            const c = engine._classifications;       // ← BUG: reads from engine, not engine.config
            const fmt = (id) => {
                const status = c[id] ? `[CLASSIFIED: ${c[id].toUpperCase()}]` : '[UNCLASSIFIED]';
                                  // ← throws TypeError because c is undefined
                ...
```

**BoxEngine never copies config keys onto the engine instance.** `_app/arena/engine/BoxEngine.js:23` does `this.config = config` and stops there. The state lives at `engine.config._classifications`, not at `engine._classifications`.

**Browser confirmation** (Puppeteer state probe on pis-l01):
- `engine._classifications` → `undefined`
- `engine.config._classifications` → `{SPX-001: null, SPX-002: null, ...}` ✓ populated correctly

When a student types `intake`, the command handler dereferences `c[id]` where `c` is undefined → throws → Terminal swallows the throw → student sees nothing. Same failure mode in `examine`, `classify`, `report`, and every other command across all 24 labs.

The flag-award checks inside `classify` (`if (engine._classifications['SPX-001'] && ...)`) also throw, so even if a student bypassed the read-only commands, they could never unlock a flag.

## Scope

| Course | Path | Labs | `engine._X` references |
|---|---|---|---|
| PIS — Principles of Information Security | `_app/houses/shield/infosec/labs/` | 12 | 378 (raw grep, may include some duplicates) |
| ALA — Advanced Linux Administration | `_app/houses/matrix/adv-linux/labs/` | 12 | (count pending validator run) |
| Other houses | n/a | 0 | 0 — no other house uses this BoxEngine pattern |

**Zero labs** in the entire codebase use the correct `engine.config._X` pattern. The bug was baked in from the day these labs were authored — they were never end-to-end tested against the BoxEngine command-dispatch contract.

## Why existing QC missed it

QC-46 (Ethics in IT QC) and QC-47 (PIS QC) verified:
- ✓ Lab page loads
- ✓ Briefing renders
- ✓ Quiz keys seeded in Firestore
- ✓ HUB-001 catalog routing

**None of those exercise the actual command surface.** The smoke gate at `_tools/eduscan/smoke/run.js` checks page-render + selector-count, not interactive command execution. Static EduScan validators (HEUR-*, NAME-*, SEM-*, etc.) are pattern-based and cannot trace `engine._X` semantics without a notion of which `_X` keys are config-level vs engine-level.

## Plan

### Phase 1 — Static validator: `HEUR-CTF-CFG-MISACCESS`

Implement as a `validateCTFConfigMisaccess()` method on the existing `HeuristicsValidator` class at `_tools/eduscan/validators/syntax/heuristics.js`. Called from `_tools/eduscan/validators/syntax/index.js` alongside `validateRendererLinks()` (matches established pattern; no new file/registration churn).

**Algorithm:**

1. **Build the BoxEngine instance-field allowlist dynamically.** At validator startup, read `_app/arena/engine/BoxEngine.js` and capture every `this\._([a-zA-Z][\w]*)\s*=` assignment. That set is the legitimate runtime-engine fields (`_coOpMode`, `_vsMode`, `_devToolsOpen`, `_flagHashes`, etc.). Lab code reading `engine._coOpMode` is correct; lab code reading `engine._classifications` is the bug. Dynamic — when BoxEngine grows a new instance field, the validator self-updates with no maintenance.

2. **For every file matching `_app/houses/*/labs/*/config.js`:**
   - **Strip `//` comments** per line so banner comments don't leak into pattern matching.
   - **Brace-depth line scanner** finds top-level state fields. Track `{` / `}` depth starting from the first `{` after the `const FooConfig =` assignment. At depth 1 (direct children), every key matching `^_[a-zA-Z]` is collected as a "lab state field." For pis-l01, these are `_classifications`, `_answers`, `_validTypes`, `_flag1Awarded`, `_flag2Awarded`, `_flag3Awarded`.
   - **Within the `commands: {` block,** find every `engine\._([a-zA-Z][\w]*)` reference. For each match:
     - If the captured name is in the lab's state-field set AND not in the BoxEngine allowlist → **fire HIGH severity**.

3. **Emit (per match):**
   - code: `HEUR-CTF-CFG-MISACCESS`
   - severity: `high`
   - file + line of the misaccess
   - message: `Reference engine.{key} should be engine.config.{key} — config-level state lives at engine.config, not on the engine instance. {key} is defined at top-level of this config (line N).`
   - fix: `engine.{key}` → `engine.config.{key}`

**Why brace-depth, not AST:** AST (acorn / @babel/parser) would be cleaner, but adding a new npm dependency to the eduscan toolchain just for this validator is operational overhead. The codebase already uses brace-depth/line-walker patterns (see `validateRendererLinks`). Pure Node, no dependency.

**Why dynamic allowlist:** Hardcoding `['coOpMode', 'vsMode', ...]` rots when BoxEngine grows a new field. Reading BoxEngine.js once at startup is ~5 lines and self-maintaining.

### Phase 2 — Audit run

Run `nexus full` (or invoke the validator standalone) → capture all `HEUR-CTF-CFG-MISACCESS` findings → produce per-lab finding artifact at `_docs/operations/ctf-config-misaccess-findings-2026-05-09.md`. Each entry: file, line, current text, proposed fix.

### Phase 3 — Mechanical fix sweep

For every finding produced by Phase 2:
- Mechanical search/replace `engine.{key}` → `engine.config.{key}` per matched key per file.
- Use a Node script (same pattern as briefing-icon rollout `24ae99d0`) for deterministic application.
- `node --check` every modified file post-sweep.
- Re-run validator → expect zero findings.

### Phase 4 — Runtime smoke companion (recommended, not blocking)

Add `FUNC-CTF-COMMAND-SMOKE` to `_tools/eduscan/smoke/run.js`: for each lab in the registry, Puppeteer boots through to the desktop terminal, types the lab's first command, and asserts non-empty output + no `TypeError`/`ReferenceError` in console. Belt-and-suspenders runtime gate that catches future bugs the static rule can't see (e.g., command handlers that throw for reasons other than misaccess).

### Phase 5 — Sample functional verification

Before declaring victory: pick 3 representative labs (e.g., pis-l01 small, pis-l07 medium, pis-l12 capstone) and walk a Puppeteer session through the actual lab solutions (from `~/hexworth-shared/Solutions/Principles of Iformation Security/`) to confirm flags actually unlock. The validator + smoke proves no command throws; only end-to-end flag-unlock proves the lab is playable.

## Sequencing constraint

The validator and the fix sweep **ship in the same session**. Otherwise `nexus full` fires ~261+ HIGH findings, floods the triage queue, and suppresses operator attention to other findings. Phases 1 → 2 → 3 are atomic; Phase 4 + 5 follow.

## Deliverables

- `_tools/eduscan/validators/syntax/heuristics.js` — new `validateCTFConfigMisaccess()` method
- `_tools/eduscan/validators/syntax/index.js` — call site
- `_docs/operations/ctf-config-misaccess-findings-2026-05-09.md` — per-lab finding spreadsheet (Phase 2 output)
- `_app/houses/shield/infosec/labs/pis-l*/config.js` × 12 — fix-swept (Phase 3)
- `_app/houses/matrix/adv-linux/labs/ala-l*/config.js` × 12 — fix-swept (Phase 3)
- (Phase 4) `_tools/eduscan/smoke/run.js` — `FUNC-CTF-COMMAND-SMOKE` extension
- This doc — frozen as the historical record once Phases 1-3 land

## Architecture refs

- BoxEngine config storage: `_app/arena/engine/BoxEngine.js:23` — `this.config = config`
- BoxEngine instance-field allowlist source: `_app/arena/engine/BoxEngine.js:24-94` — `this._coOpMode`, `this._vsMode`, `this._devToolsOpen`, etc.
- Terminal command dispatch: `_app/arena/engine/Terminal.js:224` — `customCommands[cmd](args, this, this.engine)`
- Validator pattern reference: `_tools/eduscan/validators/syntax/heuristics.js` — `validateRendererLinks` (the global-scan method shape to mirror)
- Lab config example (12 misaccesses): `_app/houses/shield/infosec/labs/pis-l01-specimen-classification/config.js:254`
