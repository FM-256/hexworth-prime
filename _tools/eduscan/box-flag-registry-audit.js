#!/usr/bin/env node
/**
 * EduScan — Box Flag Registry Audit (BOX-001)
 *
 * Detects BoxEngine-driven labs/boxes that use the submit-validate flag
 * pattern but are missing their seed entry in functions/box_flags.json.
 *
 * BoxEngine has TWO flag patterns:
 *
 *   1. AUTO-AWARD — terminal commands call engine.awardFlag('flagN')
 *      directly when the student completes required actions. The flag
 *      value in config.flags[] is metadata only; students never type it.
 *      NO server-side seed required. Used by PIS-M2 and most PIS labs.
 *
 *   2. SUBMIT-VALIDATE — student types the flag value into the Submit
 *      Flag modal; BoxEngine.submitFlag calls the validateFlag Cloud
 *      Function, which looks up the value in Firestore flag_registry/
 *      {boxId}. The Firestore doc is seeded from functions/box_flags.json
 *      via the seed-box-flags.js script. WITHOUT the seed, every flag
 *      submission returns "Box not found in flag registry" for any
 *      authenticated student. Used by CTF Arena (A/B/C series) and
 *      lab-style submit-only scenarios like pis-final-patient-zero.
 *
 * Failure mode this rule prevents: a submit-validate box ships to
 * production without its seed entry. Students see "wrong flag" on every
 * correct submission. Lab is unplayable. This is exactly the gap that
 * was discovered in pis-final-patient-zero on 2026-05-21 during the
 * "is the lab fully built?" review — flagging the operator-side gap
 * after the fact instead of catching it pre-deploy.
 *
 * Issue codes:
 *   BOX-001  Submit-validate box missing from box_flags.json (CRITICAL)
 *
 * Detection logic:
 *   For each directory under _app/ that contains an index.html invoking
 *   BoxEngine.init AND a sibling config.js:
 *     1. Read config.js.
 *     2. Extract registryId (or storageKey/id fallback).
 *     3. Pattern detection:
 *        - contains "engine.awardFlag(" anywhere  -> AUTO-AWARD (skip)
 *        - else                                    -> SUBMIT-VALIDATE
 *     4. For SUBMIT-VALIDATE: check if registryId is a key in
 *        functions/box_flags.json. If not, emit BOX-001 finding.
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-flag-registry-audit.js
 *
 * Output:
 *   _tools/reports/BOX_FLAG_REGISTRY_AUDIT.json — per-box verdicts
 *   stdout — summary + CRITICAL finding list
 *
 * Exit codes:
 *   0 if no CRITICAL findings (or if --report-only flag)
 *   1 if any CRITICAL findings (default — usable as a deploy gate)
 *   2 if self-validation fails (regex/scope broken — refuse to publish)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const BOX_FLAGS_FILE = path.join(ROOT, 'functions/box_flags.json');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_FLAG_REGISTRY_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Self-validation expectations — the 4 known test cases from the BOX-001
// design spec. If the validator produces unexpected verdicts on these,
// the logic is wrong and the report MUST NOT be trusted.
//
// pis-final-patient-zero: known to lack a box_flags.json seed (the bug
//   that prompted this rule's existence). MUST be flagged CRITICAL.
// pis-m2-vault-breach: uses engine.awardFlag() in command handlers.
//   MUST be classified AUTO-AWARD (skipped from CRITICAL check).
// a1-ancient-ledger: CTF Arena box, present in box_flags.json. MUST PASS.
// a14-ghost-machine: CTF Arena box, present in box_flags.json. MUST PASS.
const SELF_VALIDATION = {
    // pis-final-patient-zero seeded 2026-05-22 marathon — was the trigger bug for this validator,
    // now in the registry. Test case updated to reflect new known-good state.
    'pis-final-patient-zero':  { expectedClass: 'submit-validate-seeded',        expectedSeverity: null },
    'pis-m2-vault-breach':     { expectedClass: 'auto-award',                    expectedSeverity: null },
    'a1-ancient-ledger':       { expectedClass: 'submit-validate-seeded',        expectedSeverity: null },
    'a14-ghost-machine':       { expectedClass: 'submit-validate-seeded',        expectedSeverity: null }
};

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Walk _app/ to find all box config directories.
 * Returns an array of { dir, indexFile, configFile, boxName }.
 */
function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try {
            entries = fs.readdirSync(d, { withFileTypes: true });
        } catch (e) { continue; }

        // Skip hidden + archive + source dirs
        const dirNames = new Set();
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) {
                dirNames.add(e.name);
                stack.push(path.join(d, e.name));
            }
        }

        // Check this dir for an index.html + config.js pair
        const fileNames = entries.filter(e => e.isFile()).map(e => e.name);
        if (fileNames.includes('index.html') && fileNames.includes('config.js')) {
            const indexFile = path.join(d, 'index.html');
            try {
                const idxContent = fs.readFileSync(indexFile, 'utf8');
                if (/BoxEngine\.init/.test(idxContent)) {
                    out.push({
                        dir: d,
                        indexFile,
                        configFile: path.join(d, 'config.js'),
                        boxName: path.basename(d)
                    });
                }
            } catch (e) { /* skip unreadable files */ }
        }
    }
    return out;
}

/**
 * Extract the registryId from a config.js source.
 * Looks for: registryId: '<value>' or registryId: "<value>"
 * Returns the string or null if not found.
 */
function extractRegistryId(configContent) {
    const m = configContent.match(/registryId\s*:\s*['"]([^'"]+)['"]/);
    return m ? m[1] : null;
}

/**
 * Detect whether a config uses the auto-award pattern.
 * AUTO-AWARD: any occurrence of `engine.awardFlag(` (with the open paren
 * required so we don't false-match references in comments to the bare word).
 * Returns true if auto-award, false if submit-validate.
 */
function isAutoAward(configContent) {
    return /engine\.awardFlag\s*\(/.test(configContent);
}

// ─── Main ──────────────────────────────────────────────────────────────

function main() {
    const startMs = Date.now();

    // Load box_flags.json
    let boxFlags;
    try {
        boxFlags = JSON.parse(fs.readFileSync(BOX_FLAGS_FILE, 'utf8'));
    } catch (e) {
        console.error('FATAL: cannot read ' + BOX_FLAGS_FILE + ': ' + e.message);
        process.exit(99);
    }
    const seededIds = new Set(Object.keys(boxFlags));

    // Find all box configs
    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found under _app/ — refusing to proceed.');
        process.exit(99);
    }

    // Classify each box
    const verdicts = [];
    for (const box of boxes) {
        let content;
        try {
            content = fs.readFileSync(box.configFile, 'utf8');
        } catch (e) {
            verdicts.push({
                boxName: box.boxName,
                configFile: path.relative(ROOT, box.configFile),
                class: 'unreadable',
                registryId: null,
                severity: 'medium',
                error: e.message
            });
            continue;
        }

        const registryId = extractRegistryId(content);
        const autoAward = isAutoAward(content);

        if (autoAward) {
            verdicts.push({
                boxName: box.boxName,
                configFile: path.relative(ROOT, box.configFile),
                class: 'auto-award',
                registryId,
                severity: null,
                note: 'Auto-award pattern: engine.awardFlag() called directly from config code. No flag_registry seed required.'
            });
            continue;
        }

        // Submit-validate pattern: must have a registryId AND must be seeded
        if (!registryId) {
            verdicts.push({
                boxName: box.boxName,
                configFile: path.relative(ROOT, box.configFile),
                class: 'submit-validate-no-registry-id',
                registryId: null,
                severity: 'high',
                code: 'BOX-001-A',
                message: 'Submit-validate box has no registryId field. Submit Flag modal cannot route to validateFlag CF.',
                fix: 'Add `registryId: \'<box-id>\'` to the config. The ID must match the directory name and the box_flags.json key.'
            });
            continue;
        }

        if (!seededIds.has(registryId)) {
            verdicts.push({
                boxName: box.boxName,
                configFile: path.relative(ROOT, box.configFile),
                class: 'submit-validate-missing-seed',
                registryId,
                severity: 'critical',
                code: 'BOX-001',
                message: `Submit-validate box '${registryId}' is missing from functions/box_flags.json. Authenticated students get 'Box not found in flag registry' on every flag submission — lab is unplayable.`,
                fix: `Add an entry to functions/box_flags.json for '${registryId}' with the 7 (or N) flag values from config.flags[]. Then run \`node functions/seed-box-flags.js\` to seed Firestore flag_registry/${registryId} (production write — requires master branch + operator authorization).`
            });
            continue;
        }

        verdicts.push({
            boxName: box.boxName,
            configFile: path.relative(ROOT, box.configFile),
            class: 'submit-validate-seeded',
            registryId,
            severity: null
        });
    }

    // ─── Self-validation gate ─────────────────────────────────────────
    // Compare actual verdicts against expectations for the 4 known test
    // cases. If any mismatch, refuse to publish the report — the validator
    // logic is wrong and downstream consumers must not trust it.
    const selfValidationFailures = [];
    for (const [expectedBox, expected] of Object.entries(SELF_VALIDATION)) {
        const found = verdicts.find(v => v.boxName === expectedBox || v.registryId === expectedBox);
        if (!found) {
            selfValidationFailures.push({
                box: expectedBox,
                reason: 'box not discovered by walker',
                expected: expected.expectedClass,
                actual: 'not-found'
            });
            continue;
        }
        if (found.class !== expected.expectedClass) {
            selfValidationFailures.push({
                box: expectedBox,
                reason: 'class mismatch',
                expected: expected.expectedClass,
                actual: found.class
            });
        }
        if (found.severity !== expected.expectedSeverity) {
            selfValidationFailures.push({
                box: expectedBox,
                reason: 'severity mismatch',
                expected: expected.expectedSeverity,
                actual: found.severity
            });
        }
    }

    if (selfValidationFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE: validator logic mismatch on known test cases.');
        for (const f of selfValidationFailures) {
            console.error(`  ${f.box}: ${f.reason} — expected ${f.expected}, got ${f.actual}`);
        }
        console.error('Refusing to write report. Investigate detection logic.');
        process.exit(2);
    }

    // ─── Build report ────────────────────────────────────────────────
    const critical = verdicts.filter(v => v.severity === 'critical');
    const high = verdicts.filter(v => v.severity === 'high');
    const autoAward = verdicts.filter(v => v.class === 'auto-award');
    const seeded = verdicts.filter(v => v.class === 'submit-validate-seeded');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-flag-registry-audit',
        validatorCode: 'BOX-001',
        scope: {
            input: 'functions/box_flags.json + _app/**/{index.html,config.js} (BoxEngine.init detected)',
            patterns: ['auto-award (engine.awardFlag)', 'submit-validate (Submit Flag modal -> validateFlag CF)']
        },
        totals: {
            boxesScanned: boxes.length,
            seededInRegistry: seededIds.size,
            autoAward: autoAward.length,
            submitValidateSeeded: seeded.length,
            findingsCritical: critical.length,
            findingsHigh: high.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: {
            cases: Object.keys(SELF_VALIDATION).length,
            failures: selfValidationFailures.length,
            verdict: 'PASS'
        },
        findings: verdicts.filter(v => v.severity !== null),
        verdicts: verdicts
    };

    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    // ─── Stdout summary ──────────────────────────────────────────────
    console.log('box-flag-registry-audit (BOX-001)');
    console.log('==================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  In box_flags.json:       ' + seededIds.size);
    console.log('  Auto-award (skipped):    ' + autoAward.length);
    console.log('  Submit-validate seeded:  ' + seeded.length);
    console.log('  CRITICAL findings:       ' + critical.length);
    console.log('  HIGH findings:           ' + high.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (critical.length > 0) {
        console.log('---');
        console.log('CRITICAL — Submit-validate boxes missing flag_registry seed:');
        for (const f of critical) {
            console.log('  ' + (f.registryId || f.boxName));
            console.log('    File:    ' + f.configFile);
            console.log('    Message: ' + f.message);
        }
    }

    if (high.length > 0) {
        console.log('---');
        console.log('HIGH — Submit-validate boxes with no registryId:');
        for (const f of high) {
            console.log('  ' + f.boxName + ' (' + f.configFile + ')');
        }
    }

    if (REPORT_ONLY || critical.length === 0) {
        process.exit(0);
    }
    process.exit(1);
}

main();
