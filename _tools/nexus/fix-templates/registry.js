'use strict';
// Fix-template registry. Slice 3e of the self-healing pipeline.
//
// Maps EduScan rule codes to fix template + validator modules.
// EMPTY by design — adding an entry is the explicit operator decision
// to enable autonomous fixing for that rule code (Nancy promotion rule).
//
// To add a template:
//   1. Implement fix-templates/{rule-code}.js (CONTRACT.md interface)
//   2. Implement fix-templates/{rule-code}.validator.js
//   3. Run `node nexus.js autofix-dryrun {rule-code}` and review output
//   4. Add the entry below
//   5. Add {rule-code} to AUTO_FIX_ELIGIBLE_RULES in publish.js
//
// See fix-templates/CONTRACT.md for the full operator workflow.

const TEMPLATES = {
    // 'CAT-002': {
    //     template: require('./CAT-002'),
    //     validator: require('./CAT-002.validator'),
    // },
    // 'MISSING-ICON': {
    //     template: require('./MISSING-ICON'),
    //     validator: require('./MISSING-ICON.validator'),
    // },
};

function getTemplate(ruleCode) {
    const entry = TEMPLATES[ruleCode];
    return entry ? entry.template : null;
}

function getValidator(ruleCode) {
    const entry = TEMPLATES[ruleCode];
    return entry ? entry.validator : null;
}

function listRegisteredRules() {
    return Object.keys(TEMPLATES);
}

module.exports = { getTemplate, getValidator, listRegisteredRules, TEMPLATES };
