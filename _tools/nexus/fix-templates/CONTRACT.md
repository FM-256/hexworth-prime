# Fix-Template Contract

Slice 3e of the self-healing pipeline. See `_docs/features/SELF_HEALING_PIPELINE.md`.

A **fix template** is a Node module that knows how to mechanically resolve one
class of EduScan finding (e.g., `CAT-002`, `MISSING-ICON`). Marathon agents
in Slice 3f read items from `_auto_fix_queue`, dispatch to the template
matching the item's `rule` field, and write the resolution back to the queue.

## Strict promotion rule (Nancy review, 2026-04-29)

A rule code only enters `AUTO_FIX_ELIGIBLE_RULES` (in `_tools/nexus/publish.js`)
**after** both of the following exist:

1. A fix template at `fix-templates/{rule-code}.js`
2. A FUNC validator that confirms the fix worked end-to-end (not just that a
   string changed) — usually a Node module at `fix-templates/{rule-code}.validator.js`

This rule exists because HEUR-008 looked mechanical until Nancy round 1 caught
that the CSS-only swap is a regression: it needs a companion scroll-offset JS.
A textual fix that passes EduScan but breaks the page is worse than no fix at all.

## Template module interface

Each `fix-templates/{rule-code}.js` exports:

```js
module.exports = {
    // Required: the EduScan rule code this template handles
    ruleCode: 'CAT-002',

    // Required: short human-readable description
    description: 'Register undeclared content file in ContentCatalog',

    // Required: array of file extensions this template touches
    // Used for change-tracking and rollback scoping
    touchesExtensions: ['.js'],

    /**
     * Required: dry-run analysis for one queue item.
     * Returns what the template WOULD do if --apply were set.
     * Must be safe to call repeatedly — no writes, no side effects.
     *
     * @param {Object} item - triage queue item with childPaths[]
     * @returns {Promise<{
     *   feasible: boolean,
     *   summary: string,
     *   plannedActions: Array<{action: string, file: string, detail: string}>,
     *   risks: Array<string>,
     *   blockers: Array<string>
     * }>}
     */
    dryRun: async function (item) { ... },

    /**
     * Required: apply the fix. Only called by marathon agent in Slice 3f
     * after the rule is in AUTO_FIX_ELIGIBLE_RULES AND the operator has
     * reviewed dryRun output.
     *
     * Must be idempotent — re-running on already-fixed state is a no-op.
     * Must NOT call git commit; the caller does that with the agent's
     * identity attribution.
     *
     * @param {Object} item - triage queue item
     * @returns {Promise<{
     *   success: boolean,
     *   filesChanged: string[],
     *   summary: string,
     *   error?: string
     * }>}
     */
    apply: async function (item) { ... },
};
```

## Validator module interface

Each `fix-templates/{rule-code}.validator.js` exports:

```js
module.exports = {
    ruleCode: 'CAT-002',

    /**
     * Required: confirm the fix actually resolved the defect.
     * Called after `apply()` returns success. Must NOT just check that
     * the rule no longer fires (necessary but not sufficient — the fix
     * could have introduced a different defect). Should make a positive
     * assertion of the desired end-state.
     *
     * @param {Object} item - triage queue item
     * @param {Object} applyResult - from template.apply()
     * @returns {Promise<{
     *   validated: boolean,
     *   evidence: string,
     *   secondaryIssues: Array<string>  // new defects introduced, if any
     * }>}
     */
    validate: async function (item, applyResult) { ... },
};
```

## Operator workflow (manual until Slice 3f)

1. Implement `fix-templates/{rule-code}.js` and `.validator.js`
2. Run `node nexus.js autofix-dryrun {rule-code}` against current findings
3. Review `plannedActions` and `risks` for ALL items the template would touch
4. Spot-check at least 5 items by hand — does the fix make sense for each?
5. Add `{rule-code}` to `AUTO_FIX_ELIGIBLE_RULES` in `publish.js`
6. Re-run `nexus full --publish` — items now route to `_auto_fix_queue`
7. Slice 3f marathon agent picks them up, applies, validates, writes resolution

Until Slice 3f exists, step 7 is manual: `node nexus.js autofix-apply {rule-code} --confirm` runs the templates against queued items.

## Safety boundaries (DO NOT cross)

- Templates may NOT call `git commit`, `git push`, or any deploy command
- Templates may NOT write to Firestore (the queue manages its own state)
- Templates may NOT execute arbitrary user-supplied strings as code
- Templates may NOT touch files matching `.gitignore` patterns
- Templates may NOT fetch from external URLs without a hardcoded allowlist
- Templates SHOULD prefer rejecting an item (returning `feasible: false`)
  over making an uncertain edit
- Templates MUST be reviewable diffs, not 200-line scripts
- Each template touches ONE rule code; do not combine

## Registry (currently empty)

`fix-templates/registry.js` maps rule codes to template files.
Slice 3e ships with the registry empty — adding an entry is the explicit
operator decision to enable autonomous fixing for that rule code.
