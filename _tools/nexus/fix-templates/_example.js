'use strict';
// Example fix template — demonstrates the contract.
// NOT REGISTERED. Used as a reference for new templates.
// See CONTRACT.md.

module.exports = {
    ruleCode: 'EXAMPLE-000',
    description: 'Example template — does nothing. Reference implementation only.',
    touchesExtensions: [],

    /**
     * dryRun: report what apply() would do for this item, without doing it.
     */
    dryRun: async function (item) {
        return {
            feasible: false,
            summary: `(example) would consider item ${item.id} but is not a real fixer`,
            plannedActions: [],
            risks: ['this is the reference example; no actual fix logic exists'],
            blockers: ['template not registered; calling apply() would throw'],
        };
    },

    /**
     * apply: refuse to run.
     */
    apply: async function (item) {
        throw new Error('[_example.js] apply() called on the reference example template — wire a real template instead');
    },
};
