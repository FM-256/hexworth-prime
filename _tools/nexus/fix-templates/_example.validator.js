'use strict';
// Example validator — demonstrates the contract. NOT REGISTERED.
// See CONTRACT.md.

module.exports = {
    ruleCode: 'EXAMPLE-000',

    /**
     * validate: confirm the fix actually achieved the desired end state.
     * Must do a positive assertion, not just absence-of-rule-firing.
     */
    validate: async function (item, applyResult) {
        return {
            validated: false,
            evidence: '(example) no real validation performed',
            secondaryIssues: [],
        };
    },
};
