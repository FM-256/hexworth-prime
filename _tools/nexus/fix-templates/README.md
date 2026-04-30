# Self-Healing Fix Templates

Each module here implements a mechanical fix for one EduScan rule code.
Marathon agents (or operators via `nexus autofix-apply`) dispatch to the
template matching the queue item's `rule` field, then run the validator
to confirm the fix worked end-to-end.

## Read this first

**[CONTRACT.md](CONTRACT.md)** — full template + validator interface,
promotion rule, operator workflow, safety boundaries.

## Files

| File | Purpose |
|------|---------|
| `CONTRACT.md` | Template + validator interface (READ FIRST) |
| `registry.js` | Maps rule codes to template + validator modules |
| `_example.js` + `_example.validator.js` | Reference implementation (refuses to apply) |
| `CAT-002.js` + `CAT-002.validator.js` | First real template — registers undeclared content files in ContentCatalog |

## Adding a new template

1. Read `CONTRACT.md` — both interface AND the safety boundaries section
2. Implement `{rule-code}.js` (template) and `{rule-code}.validator.js` (validator)
3. Add the entry to `registry.js`
4. Run `node _tools/nexus/nexus.js autofix-dryrun {rule-code}` against current findings (read-only, safe)
5. Run the e2e test pattern from `_e2e_test_cat002.js` adapted for your rule
6. Update `window.__SELF_HEALING_TEMPLATES__` in `_app/pulse.html` (drift risk — there's no auto-mirror)
7. Operator decision: add `{rule-code}` to `AUTO_FIX_ELIGIBLE_RULES` in `_tools/nexus/publish.js`
8. Re-run `nexus full --publish` so items route to `_auto_fix_queue`
9. In Pulse, enable master toggle + enable the rule in the per-template list

The promotion rule (Nancy review): a rule code only enters `AUTO_FIX_ELIGIBLE_RULES`
**after** the template + validator exist AND the operator has reviewed dryrun output
for at least 5 sample items.
