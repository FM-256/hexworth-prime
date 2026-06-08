# Dr. Hex phase_scaffolds — wiring runbook

> Last updated 2026-06-08 · End-to-end live at commits `863b55e61` (hosting) + `201fede46` (orchestrator v0.6.7).

This runbook is for adding **phase-aware hint scaffolds** to a new lab. The mechanism is already wired end-to-end for `pis-final-patient-zero`; this is the recipe for fanning the pattern out to other labs.

## What phase_scaffolds do

When a student opens Dr. Hex inside a lab AND escalates to help level 3+ AND the lab allows L3+ help AND the lab has a `phase_scaffolds` block matching the student's current phase, the orchestrator injects a **STUDENT CONTEXT** line into the system prompt naming the phase + a Level-3 hint. The hint is scaffolding (method/strategy) — never the answer. The LLM still composes the response in persona voice and passes constitutional gates (voice_linter, forbidden_disclosures).

Without phase_scaffolds, Dr. Hex still works — just less specifically. The scaffold is grounding, not gating.

## The 3 surfaces you need to touch

### Surface 1 — Skill map YAML (per-lab)

Path: `_app/lab-skill-maps/<lab-id>.yaml`

Add a `phase_scaffolds:` block at the bottom, with one entry per phase_id your lab emits. Phase IDs match `^phase_[0-9]{1,3}$`.

```yaml
phase_scaffolds:
  phase_1:
    name: <short label, e.g. "Inbox Triage">
    hint: |
      <L3 scaffold text — method/strategy/lens, NEVER the answer.
       Two paragraphs max. The orchestrator quotes this verbatim into
       the system prompt as a STUDENT CONTEXT bullet.>
  phase_2:
    name: ...
    hint: |
      ...
```

**Authoring rules (Nancy-tested):**
- Don't pre-state outcomes ("3 users appear, 1 user remains" → spoon-feeding the answer)
- Don't enumerate signal names that match the SIEM/tool row labels verbatim ("look for foreign IP with no HR ticket" = checklist-match L4)
- Don't give the decision rule ("Patient Zero is the unexplained one" → answer)
- DO frame the conceptual pivot ("not all logs prove the same thing")
- DO name misdirection traps ("a clicked link doesn't mean executed payload")
- DO end on a question the student must answer ("Whose activity has an explanation that holds up?")
- Reference: phase_5 of `pis-final-patient-zero.yaml` went through 5 Nancy iterations to land on a clean L3.

### Surface 2 — Lab config.js (per-lab)

Path: `_app/houses/<house>/.../labs/<lab-id>/config.js`

Install `window.__hexAiPhase` as a **configurable getter** that derives the phase from your lab's progress state. Put it at the bottom of the file, after the existing `PISFinalConfig.resetState()` (or equivalent boot call).

```js
// Dr. Hex phase_scaffolds telemetry — see _docs/operations/dr-hex-phase-scaffolds-wiring-runbook.md
(function () {
    if (typeof window === 'undefined' || typeof <YourConfig> === 'undefined') return;
    if (Object.getOwnPropertyDescriptor(window, '__hexAiPhase') &&
        Object.getOwnPropertyDescriptor(window, '__hexAiPhase').get) {
        return; // idempotent — already installed
    }
    Object.defineProperty(window, '__hexAiPhase', {
        configurable: true,
        get: function () {
            try {
                if (typeof BoxEngine === 'undefined' || !BoxEngine.state) return null;
                // Derive phase from engine.state.flagsFound OR your own counter.
                // Example: phase = lowest incomplete flag in 1..N range.
                const found = BoxEngine.state.flagsFound || [];
                const N = 7; // total phases in your lab
                for (let n = 1; n <= N; n++) {
                    if (!found.includes('flag' + n)) return 'phase_' + n;
                }
                return 'phase_' + N; // all flags captured — sticky on final phase
            } catch (e) {
                return null; // chat panel skips phase field on null
            }
        }
    });
})();
```

**WARNING**: do NOT use plain assignment (`window.__hexAiPhase = 'phase_3'`). Once a getter-only descriptor is installed, plain assignment silently no-ops in sloppy mode (or throws in strict). The contract HexAIChatPanel teaches is the getter pattern — see `_app/_lib/HexAIChatPanel.js` line ~568.

### Surface 3 — Deploy

```bash
# Hosting (the lab config.js)
./deploy.sh   # canonical, runs Nexus + smoke gates + post-verify

# Orchestrator (the YAML — orchestrator reads from /opt/hexclass/lab-skill-maps/)
scp _app/lab-skill-maps/<lab-id>.yaml hexclass:/opt/hexclass/lab-skill-maps/
ssh hexclass 'systemctl --user restart hex-orchestrator.service'
curl -s https://hex-ai.hexworth.tech/health | python3 -m json.tool   # verify
```

If you also changed the orchestrator code (`main.py` / `skill_map_loader.py`):

```bash
scp _tools/hexclass/orchestrator/{main.py,skill_map_loader.py,pyproject.toml} hexclass:/opt/hexclass/orchestrator/
# Bump VERSION in main.py + pyproject.toml first so health endpoint reflects the deploy
ssh hexclass 'systemctl --user restart hex-orchestrator.service'
```

## Verification harness

Use `/tmp/verify-phase-injection-v3.py` (saved during 2026-06-08 PIS deploy). The script directly invokes `compose_system_prompt` with controlled inputs and asserts 5 gates:

1. L3 + phase_N → injects the matching hint
2. L2 + phase_N → does NOT inject (help-level gate)
3. L3 + phase_id=None → does NOT inject (telemetry gate)
4. L3 + phase_3 → injects phase_3 hint specifically
5. L3 + phase_3 → does NOT inject phase_5 hint (cross-contamination check)

Run on hexclass:

```bash
ssh hexclass 'cd /opt/hexclass/orchestrator && .venv/bin/python /tmp/verify-phase-injection-v3.py'
```

The script needs `from personas import PERSONAS` to get a real persona dict with a `voice` key — `FakeCtx` objects fail on `persona['voice']` lookup.

## Backend gating logic (read-only reference)

`main.compose_system_prompt(persona, help_level_suffix, context, skill_map, current_help_level)` injects a phase hint if ALL are true:

```python
phase_id_valid = (
    skill_map is not None
    and skill_map.phase_scaffolds  # non-empty
    and context.get("phase_id")
    and current_help_level >= 3
    and 3 in skill_map.allowed_help_levels  # lab permits L3+
    and context["phase_id"] in skill_map.phase_scaffolds
)
```

`ChatRequest.phase_id` is `Optional[str]` with pattern `^phase_[0-9]{1,3}$` and `max_length=32`. Bad phase IDs return 422; missing phase IDs are valid (just no injection).

## Frontend gating logic (read-only reference)

`HexAIChatPanel.js` reads `window.__hexAiPhase` on every chat send:

```js
const rawPhase = typeof window.__hexAiPhase === 'string' ? window.__hexAiPhase.trim() : '';
const phaseId = /^phase_[0-9]{1,3}$/.test(rawPhase) ? rawPhase : null;
```

If anything is wrong (not a string, doesn't match pattern, getter throws and returns null), `phase_id` becomes null and the backend gates out the injection. **Silent degradation is intentional** — phase telemetry is bonus, not load-bearing.

## Karl + Nancy gate

If any phase scaffold is at the L3/L4 boundary (collapses candidate sets, gives the decision rule, enumerates signals that match tool row labels verbatim), **run Nancy on the scaffold text BEFORE deploying the YAML**. Karl is the citation auditor and is not the right reviewer for teaching scaffolds (no citations). Nancy reviews method-vs-answer distinction.

Reference: `pis-final-patient-zero.yaml` phase_5 needed 5 Nancy iterations (agent IDs `a30985653c329761e`, `a7b2bdbad8cecc616`, `a201606be8e360fd3`, `ac3962a748565de57`, `a69220591ec6ea8ff`) to land at clean L3. The pattern is: write hint → dispatch Nancy → apply edits → dispatch again until APPROVE.

## Anti-patterns (don't do these)

| Anti-pattern | Why it breaks |
|---|---|
| `window.__hexAiPhase = 'phase_3'` plain assignment | Silently no-ops if a getter is already installed |
| Imperative updates on every awardFlag() | More code paths, more bugs; the getter derives fresh anyway |
| Hardcoded phase counter advanced in flag handlers | Race conditions with co-op state sync; just derive from `flagsFound` |
| Naming specific anomaly signals verbatim in the hint | Reduces L3 scaffold to L4 checklist-match |
| Pre-stating filter outputs ("3 users → 1 user") | Collapses the candidate pool before the student touches the tool |
| Ending the hint with the decision rule | "Patient Zero is the X one" = answer; ask the question instead |

## Related docs

- `_docs/operations/dr-hex-constitution.md` — help-level taxonomy (L0 / L1 / L2 / L3 / L4 / L5)
- `_docs/operations/dr-hex-lab-skill-map.md` — broader skill-map architecture
- `_docs/operations/hex-ai-deploy-runbook.md` — original Dr. Hex deploy chain
- `_docs/operations/dr-hex-voice-guide.md` — how the LLM should sound when receiving these scaffolds
