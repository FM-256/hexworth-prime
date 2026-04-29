'use strict';
// CAT-002 validator — confirm a CAT-002 fix actually registered the file.
//
// Two positive assertions (Nancy: not just "rule no longer fires"):
//   1. The new module ID is present in ContentCatalog.MODULES
//   2. The module's href resolves to the expected disk file
// Plus a regression check:
//   3. Re-running the EduScan ContentCatalog validator does NOT produce
//      a CAT-001 or CAT-003 finding for the new module
//
// Contract: see _tools/nexus/fix-templates/CONTRACT.md

const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT_APP = path.resolve(__dirname, '../../../_app');
const CATALOG_PATH = path.resolve(ROOT_APP, 'components/ContentCatalog.js');

function loadCatalog() {
    const code = fs.readFileSync(CATALOG_PATH, 'utf8');
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(code, ctx);
    return ctx.window.ContentCatalog;
}

module.exports = {
    ruleCode: 'CAT-002',

    /**
     * @param {Object} item - the triage item
     * @param {Object} applyResult - return value from CAT-002.js apply()
     */
    async validate(item, applyResult) {
        if (!applyResult || !applyResult.success) {
            return { validated: false, evidence: 'apply did not succeed', secondaryIssues: [] };
        }
        if (applyResult.idempotent) {
            return { validated: true, evidence: 'no-op (already registered)', secondaryIssues: [] };
        }

        const expectedId = applyResult.module && applyResult.module.id;
        const expectedHref = applyResult.module && applyResult.module.href;
        const houseId = applyResult.module && applyResult.module.house;
        if (!expectedId || !expectedHref || !houseId) {
            return { validated: false, evidence: 'apply result missing module fields', secondaryIssues: [] };
        }

        // Assertion 1: module is in the catalog
        let catalog;
        try {
            catalog = loadCatalog();
        } catch (e) {
            return { validated: false, evidence: 'catalog failed to load: ' + e.message, secondaryIssues: ['CAT-001'] };
        }
        if (!catalog || !Array.isArray(catalog.MODULES)) {
            return { validated: false, evidence: 'catalog has no MODULES array', secondaryIssues: ['CAT-001'] };
        }
        const found = catalog.MODULES.find(m => m.id === expectedId);
        if (!found) {
            return { validated: false, evidence: `module ${expectedId} not present in catalog after apply`, secondaryIssues: [] };
        }

        // Assertion 2: href resolves to disk
        const house = catalog.HOUSES && catalog.HOUSES[houseId];
        if (!house) {
            return { validated: false, evidence: `house ${houseId} not in HOUSES map`, secondaryIssues: [] };
        }
        const fullPath = path.resolve(ROOT_APP, house.basePath, expectedHref);
        if (!fs.existsSync(fullPath)) {
            return {
                validated: false,
                evidence: `href ${expectedHref} does not resolve to disk (${fullPath})`,
                secondaryIssues: ['CAT-001'],
            };
        }

        // Regression check: run the EduScan validator on the catalog,
        // confirm no CAT-001/CAT-003 for the new module
        let secondaryIssues = [];
        try {
            const ContentCatalogValidator = require('../../eduscan/validators/syntax/content-catalog');
            const v = new ContentCatalogValidator({ rootPath: ROOT_APP });
            const result = v.validate();
            secondaryIssues = result.issues
                .filter(i => i.moduleId === expectedId && (i.code === 'CAT-001' || i.code === 'CAT-003'))
                .map(i => `${i.code}: ${i.message}`);
        } catch (e) {
            // If the validator is unavailable, soft-pass with note
            secondaryIssues = [`validator unavailable: ${e.message}`];
        }

        if (secondaryIssues.length > 0) {
            return {
                validated: false,
                evidence: `module registered but introduced new issues`,
                secondaryIssues: secondaryIssues,
            };
        }

        return {
            validated: true,
            evidence: `module ${expectedId} present, href resolves to ${fullPath}, no new CAT-001/003 introduced`,
            secondaryIssues: [],
        };
    },
};
