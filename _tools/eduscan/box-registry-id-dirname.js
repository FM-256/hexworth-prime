#!/usr/bin/env node
/**
 * EduScan — Box registryId Matches Directory Name (BOX-013)
 *
 * Detects configs where `config.registryId` does NOT equal the parent
 * directory's basename. When mismatched, the Firestore flag_registry
 * lookup silently fails — student submits the correct flag, the bridge
 * looks up the wrong key, validateFlag returns "incorrect," and the
 * student gets zero credit on every submission with no visible cause.
 *
 * Why this rule matters:
 *   This is the typo class. A developer copy-pastes a registryId from
 *   another box, forgets to update one character, ships, and the lab
 *   silently breaks for every student who tries to submit a flag. The
 *   functional smoke catches it only if the box has been wired into the
 *   smoke gate. A cheap static check covers every box for free.
 *
 *   Convention: every BoxEngine-driven box lives in a directory whose
 *   basename equals its registryId. The flag_registry/{registryId}
 *   Firestore document is keyed on this value.
 *
 * Detection:
 *   For each directory containing both index.html and config.js where
 *   the HTML invokes BoxEngine.init:
 *     1. Extract `registryId: '<value>'` from config.js via regex
 *     2. Compare to path.basename(directory)
 *     3. Mismatch → finding (CRITICAL — silent break)
 *     4. Missing registryId field entirely → separate finding (HIGH)
 *
 * Issue codes:
 *   BOX-013-MISMATCH    registryId does not equal directory basename.
 *                       Severity: CRITICAL.
 *   BOX-013-MISSING     Config has no registryId field. Severity: HIGH
 *                       (flag bridge cannot be wired without it).
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — registryId matches dirname, MUST pass
 *   - a1-ancient-ledger      — registryId matches dirname, MUST pass
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_REGISTRY_ID_DIRNAME.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const REGISTRY_ID_RE = /registryId\s*:\s*['"]([^'"]+)['"]/;

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectMatch: true },
    'a1-ancient-ledger':      { expectMatch: true }
};

function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) stack.push(path.join(d, e.name));
        }
        const files = entries.filter(e => e.isFile()).map(e => e.name);
        if (files.includes('index.html') && files.includes('config.js')) {
            try {
                const idx = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
                if (/BoxEngine\.init/.test(idx)) {
                    out.push({
                        dirname: path.basename(d),
                        configFile: path.join(d, 'config.js'),
                        relDir: path.relative(ROOT, d) + path.sep
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

function main() {
    const startMs = Date.now();
    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        let content;
        try { content = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ dirname: box.dirname, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const m = content.match(REGISTRY_ID_RE);
        if (!m) {
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: 'missing-registry-id',
                severity: 'high',
                code: 'BOX-013-MISSING',
                message: 'Config has no `registryId` field. Flag bridge cannot bind a Firestore key.',
                fix: `Add registryId: '${box.dirname}' near the top of the config object.`
            });
            continue;
        }
        const declared = m[1];
        if (declared === box.dirname) {
            verdicts.push({ dirname: box.dirname, declared, class: 'match', severity: null });
        } else {
            verdicts.push({
                dirname: box.dirname,
                declared,
                relDir: box.relDir,
                class: 'mismatch',
                severity: 'critical',
                code: 'BOX-013-MISMATCH',
                message: `registryId '${declared}' does not equal directory basename '${box.dirname}'. Flag bridge will look up the wrong Firestore key.`,
                fix: `Change registryId to '${box.dirname}' OR rename the directory to '${declared}'. Whichever matches the existing flag_registry entry should win.`
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) {
            selfFailures.push({ box: dn, reason: 'not discovered' });
            continue;
        }
        const isMatch = v.class === 'match';
        if (isMatch !== exp.expectMatch) {
            selfFailures.push({ box: dn, expected: exp.expectMatch ? 'match' : 'mismatch', got: v.class });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const mismatches = verdicts.filter(v => v.class === 'mismatch');
    const missing = verdicts.filter(v => v.class === 'missing-registry-id');
    const matches = verdicts.filter(v => v.class === 'match');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-registry-id-dirname',
        validatorCode: 'BOX-013',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            matches: matches.length,
            mismatches: mismatches.length,
            missing: missing.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: [...mismatches, ...missing],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-registry-id-dirname (BOX-013)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Matches:                 ' + matches.length);
    console.log('  Mismatches (CRITICAL):   ' + mismatches.length);
    console.log('  Missing registryId:      ' + missing.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (mismatches.length > 0) {
        console.log('---');
        console.log('CRITICAL mismatches:');
        mismatches.slice(0, 15).forEach(v => {
            console.log('  ' + v.dirname + ' declares registryId=' + v.declared);
        });
        if (mismatches.length > 15) console.log('  ... and ' + (mismatches.length - 15) + ' more');
    }
    if (missing.length > 0) {
        console.log('---');
        console.log('Missing registryId:');
        missing.slice(0, 10).forEach(v => console.log('  ' + v.dirname));
        if (missing.length > 10) console.log('  ... and ' + (missing.length - 10) + ' more');
    }

    if (REPORT_ONLY || (mismatches.length === 0 && missing.length === 0)) process.exit(0);
    process.exit(1);
}

main();
