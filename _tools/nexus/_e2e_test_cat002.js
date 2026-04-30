#!/usr/bin/env node
// End-to-end test for CAT-002 template + validator.
// Picks one real CAT-002 finding, runs apply→validate, then rolls back
// via .bak so the catalog is unchanged after the test.
//
// Self-contained — does not touch Firestore. Tests the template logic
// in isolation. Run from _tools/nexus/.

'use strict';
const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../_app/components/ContentCatalog.js');
const TREASURE_MAP = path.resolve(__dirname, '../reports/TREASURE_MAP.json');

function log(label, msg) {
    console.log(`[${label}] ${msg}`);
}

(async () => {
    // 1. Snapshot catalog
    log('SETUP', 'snapshotting ContentCatalog.js');
    const original = fs.readFileSync(CATALOG_PATH, 'utf8');
    const snapshotPath = CATALOG_PATH + '.e2etest-snapshot';
    fs.writeFileSync(snapshotPath, original, 'utf8');

    let exitCode = 0;
    let cleanedUp = false;
    function cleanup(reason) {
        if (cleanedUp) return;
        cleanedUp = true;
        log('CLEANUP', reason || 'restoring ContentCatalog.js from snapshot');
        fs.writeFileSync(CATALOG_PATH, original, 'utf8');
        try { fs.unlinkSync(snapshotPath); } catch (e) {}
        try { fs.unlinkSync(CATALOG_PATH + '.bak'); } catch (e) {}
    }
    process.on('SIGINT', () => { cleanup('SIGINT'); process.exit(130); });
    process.on('uncaughtException', (e) => { cleanup('uncaughtException'); console.error(e); process.exit(1); });

    try {
        // 2. Pick one real CAT-002 finding
        log('SETUP', 'reading TREASURE_MAP.json');
        const report = JSON.parse(fs.readFileSync(TREASURE_MAP, 'utf8'));
        const cat002 = (report.issues || []).filter(i => i.code === 'CAT-002');
        if (cat002.length === 0) {
            log('SKIP', 'no CAT-002 findings in current scan — nothing to test');
            cleanup();
            process.exit(0);
        }
        log('SETUP', `${cat002.length} CAT-002 findings available`);

        // Synthesize an item using the first finding
        const target = cat002[0];
        const synthItem = {
            id: 'e2e-test-' + Date.now(),
            rule: 'CAT-002',
            childPaths: [target.file],
            title: 'E2E test item',
        };
        log('SETUP', `target file: ${target.file}`);

        // 3. Load template + validator
        const tmpl = require('./fix-templates/CAT-002');
        const validator = require('./fix-templates/CAT-002.validator');

        // 4. Run dryRun first (sanity)
        log('STEP 1', 'dryRun');
        const dryResult = await tmpl.dryRun(synthItem);
        log('STEP 1', `feasible=${dryResult.feasible} summary="${dryResult.summary}"`);
        if (!dryResult.feasible) {
            log('FAIL', 'dryRun says not feasible — cannot proceed');
            log('FAIL', JSON.stringify(dryResult.blockers, null, 2));
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        log('STEP 1', `planned: ${dryResult.plannedActions[0].detail}`);

        // 5. Run apply
        log('STEP 2', 'apply');
        const applyResult = await tmpl.apply(synthItem);
        log('STEP 2', `success=${applyResult.success} summary="${applyResult.summary}"`);
        if (!applyResult.success) {
            log('FAIL', `apply rejected: ${applyResult.error || applyResult.summary}`);
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        log('STEP 2', `filesChanged: ${JSON.stringify(applyResult.filesChanged)}`);
        log('STEP 2', `module added: ${applyResult.module && applyResult.module.id}`);

        // 6. Verify catalog actually changed
        log('STEP 3', 'verify catalog mutation');
        const newCatalog = fs.readFileSync(CATALOG_PATH, 'utf8');
        if (newCatalog === original) {
            log('FAIL', 'catalog appears UNCHANGED after apply()');
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        if (!newCatalog.includes(applyResult.module.id)) {
            log('FAIL', `module id ${applyResult.module.id} not in modified catalog`);
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        log('STEP 3', `catalog grew by ${newCatalog.length - original.length} bytes; module id present`);

        // 7. Verify .bak was written and matches original
        log('STEP 4', 'verify .bak file');
        const bakPath = CATALOG_PATH + '.bak';
        if (!fs.existsSync(bakPath)) {
            log('FAIL', '.bak file not created by apply()');
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        const bakContent = fs.readFileSync(bakPath, 'utf8');
        if (bakContent !== original) {
            log('FAIL', '.bak content does not match original catalog');
            exitCode = 1;
            cleanup();
            process.exit(exitCode);
        }
        log('STEP 4', '.bak matches original — rollback path will work');

        // 8. Run validator
        log('STEP 5', 'validate');
        const validateResult = await validator.validate(synthItem, applyResult);
        log('STEP 5', `validated=${validateResult.validated} evidence="${validateResult.evidence}"`);
        if (validateResult.secondaryIssues && validateResult.secondaryIssues.length) {
            log('STEP 5', `secondaryIssues: ${JSON.stringify(validateResult.secondaryIssues)}`);
        }
        if (!validateResult.validated) {
            log('FAIL', 'validator says not validated');
            exitCode = 1;
        }

        // 9. Test rollback
        log('STEP 6', 'rollback');
        const rollResult = await tmpl.rollback(applyResult);
        log('STEP 6', `restored=${rollResult.restored} summary="${rollResult.summary}"`);
        if (!rollResult.restored) {
            log('FAIL', 'rollback did not restore');
            exitCode = 1;
        }
        const afterRollback = fs.readFileSync(CATALOG_PATH, 'utf8');
        if (afterRollback !== original) {
            log('FAIL', 'rollback did NOT restore the catalog to original state');
            exitCode = 1;
        } else {
            log('STEP 6', 'rollback verified — catalog matches original');
        }

        if (exitCode === 0) {
            log('PASS', 'all 6 steps passed: dryRun → apply → catalog-mutated → .bak-written → validated → rollback-restored');
        }
    } finally {
        cleanup();
    }

    process.exit(exitCode);
})();
