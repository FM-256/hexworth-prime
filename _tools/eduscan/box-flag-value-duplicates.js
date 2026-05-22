#!/usr/bin/env node
/**
 * EduScan — Box Flag Value Duplicates (BOX-024)
 *
 * Detects boxes whose `box_flags.json` entry contains two or more
 * flags with the same value (after trim + lowercase normalization).
 *
 * Why this rule matters:
 *   The validateFlag Cloud Function operates in Mode-2 (no flagId
 *   passed): it iterates over all flag values in the registry and
 *   returns the FIRST matching key. If two flags share the same
 *   normalized value, the CF awards credit for whichever key comes
 *   first in Object.entries ordering — which is effectively arbitrary.
 *   The student submits a flag for scenario X and the CF marks
 *   scenario Y as captured. Functional drift, silent.
 *
 *   Within a single box this is almost always a copy-paste bug: a
 *   developer authored 5 scenarios and accidentally reused the same
 *   flag value for two of them. Cross-box duplicates are NOT in
 *   scope of this rule (the CF scopes its lookup by boxId).
 *
 * Detection:
 *   For each entry in box_flags.json:
 *     1. Build a map: normalizedValue → [flagId1, flagId2, ...]
 *     2. Any key with >1 entries → duplicate cluster.
 *     3. Severity: HIGH per cluster (functional Mode-2 ambiguity).
 *
 * Issue code:
 *   BOX-024-DUPLICATE-VALUE  Two or more flags in the same box share
 *                            the same normalized value. validateFlag
 *                            Mode-2 will award credit ambiguously.
 *                            Severity: HIGH.
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — 7 unique values, expect 0 clusters
 *   - vpn005-always-on-bypass — 5 unique values, expect 0 clusters
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const BOX_FLAGS_PATH = path.join(ROOT, 'functions/box_flags.json');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_FLAG_VALUE_DUPLICATES.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const SELF_VALIDATION = {
    'pis-final-patient-zero':  { expectClusters: 0 },
    'vpn005-always-on-bypass': { expectClusters: 0 }
};

function normalize(s) {
    if (typeof s !== 'string') return null;
    return s.trim().toLowerCase();
}

function main() {
    const startMs = Date.now();
    if (!fs.existsSync(BOX_FLAGS_PATH)) {
        console.error('FATAL: ' + BOX_FLAGS_PATH + ' missing.');
        process.exit(99);
    }
    const allFlags = JSON.parse(fs.readFileSync(BOX_FLAGS_PATH, 'utf8'));
    const boxIds = Object.keys(allFlags);

    const verdicts = [];
    for (const boxId of boxIds) {
        const entry = allFlags[boxId];
        if (!entry || !entry.flags) {
            verdicts.push({ boxId, class: 'no-flags', severity: null });
            continue;
        }
        const byValue = new Map();
        for (const [flagId, flagValue] of Object.entries(entry.flags)) {
            const norm = normalize(flagValue);
            if (norm == null || norm === '') continue;
            if (!byValue.has(norm)) byValue.set(norm, []);
            byValue.get(norm).push({ flagId, originalValue: flagValue });
        }
        const clusters = [];
        for (const [norm, members] of byValue.entries()) {
            if (members.length > 1) {
                clusters.push({
                    normalizedValue: norm,
                    flagCount: members.length,
                    flagIds: members.map(m => m.flagId)
                });
            }
        }
        if (clusters.length === 0) {
            verdicts.push({ boxId, class: 'unique', flagCount: Object.keys(entry.flags).length, severity: null });
        } else {
            verdicts.push({
                boxId,
                class: 'duplicate',
                severity: 'high',
                code: 'BOX-024-DUPLICATE-VALUE',
                flagCount: Object.keys(entry.flags).length,
                clusterCount: clusters.length,
                clusters,
                message: 'Two or more flags share the same normalized value within this box. Mode-2 validateFlag will award the first-iteration key, not the intended one.',
                fix: 'Make each flag value unique. If two scenarios truly produce the same answer, merge them or give one a discriminating suffix.'
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [bid, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxId === bid);
        if (!v) { selfFailures.push({ box: bid, reason: 'not in box_flags.json' }); continue; }
        const got = v.clusterCount || 0;
        if (got !== exp.expectClusters) {
            selfFailures.push({ box: bid, expected: 'clusters='+exp.expectClusters, got });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const dups = verdicts.filter(v => v.class === 'duplicate');
    const unique = verdicts.filter(v => v.class === 'unique');
    const noFlags = verdicts.filter(v => v.class === 'no-flags');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-flag-value-duplicates',
        validatorCode: 'BOX-024',
        scope: { input: 'functions/box_flags.json' },
        totals: {
            boxesScanned: boxIds.length,
            unique: unique.length,
            duplicate: dups.length,
            noFlags: noFlags.length,
            totalClusters: dups.reduce((a, v) => a + v.clusterCount, 0),
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: dups,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-flag-value-duplicates (BOX-024)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxIds.length);
    console.log('  All unique:              ' + unique.length);
    console.log('  Duplicate (HIGH):        ' + dups.length);
    console.log('  No flags (skipped):      ' + noFlags.length);
    console.log('  Total clusters:          ' + dups.reduce((a, v) => a + v.clusterCount, 0));
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (dups.length > 0) {
        console.log('---');
        console.log('HIGH: boxes with duplicate flag values (' + dups.length + '):');
        dups.slice(0, 15).forEach(v => {
            console.log('  ' + v.boxId + ' [' + v.clusterCount + ' cluster(s)]');
            v.clusters.slice(0, 2).forEach(c => {
                console.log('    cluster: [' + c.flagIds.join(', ') + '] all share value');
            });
        });
        if (dups.length > 15) console.log('  ... and ' + (dups.length - 15) + ' more');
    }

    if (REPORT_ONLY || dups.length === 0) process.exit(0);
    process.exit(1);
}

main();
