#!/usr/bin/env node
/**
 * EduScan — Box storageKey Presence & Uniqueness (BOX-042)
 *
 * Detects boxes that either (a) lack a `storageKey` field entirely, or
 * (b) share a storageKey with another box. Both cases corrupt student
 * progress data.
 *
 * Why this rule matters:
 *   BoxEngine persists per-student lab state to localStorage under the
 *   key declared by `config.storageKey`. Two boxes sharing one
 *   storageKey will cross-pollute their state — a student playing the
 *   second box overwrites their progress on the first, and vice versa.
 *   A box missing `storageKey` falls back to the engine default
 *   (`hexworth_arena_state`), which then collides with EVERY other
 *   default-fallback box on the platform.
 *
 *   storageKey collisions are silent. Students see "weird state" on
 *   their second visit to a lab and lose trust in the platform; they
 *   don't know to report it as a bug.
 *
 * Detection:
 *   For each BoxEngine-init config.js:
 *     1. Extract `storageKey: '<value>'` via regex.
 *     2. If absent → MISSING finding (HIGH).
 *     3. Build a map storageKey → [boxDirname, ...].
 *     4. Any key with >1 boxes → COLLISION finding (CRITICAL).
 *
 * Issue codes:
 *   BOX-042-MISSING     config.js has no `storageKey` field. Engine
 *                       falls back to the platform default. Progress
 *                       collides with every other default-fallback box.
 *                       Severity: HIGH.
 *   BOX-042-COLLISION   Two or more boxes declare the same storageKey.
 *                       Progress data cross-pollutes. Severity:
 *                       CRITICAL.
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — storageKey 'hexworth_lab_pis_final',
 *                              MUST be present and unique.
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_STORAGE_KEY_UNIQUENESS.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const STORAGE_KEY_RE = /storageKey\s*:\s*['"]([^'"]+)['"]/;

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectKey: 'hexworth_lab_pis_final', expectUnique: true }
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

    // Pass 1: collect declared storageKeys (keyed by relDir to handle
    // dirname collisions across arena/ vs dispatch/ duplicates).
    const keyToBoxes = new Map();
    const records = [];
    for (const box of boxes) {
        let cfg;
        try { cfg = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            records.push({ dirname: box.dirname, relDir: box.relDir, key: null, unreadable: true });
            continue;
        }
        const m = cfg.match(STORAGE_KEY_RE);
        const key = m ? m[1] : null;
        records.push({ dirname: box.dirname, relDir: box.relDir, key });
        if (key) {
            if (!keyToBoxes.has(key)) keyToBoxes.set(key, []);
            keyToBoxes.get(key).push(box.relDir);
        }
    }

    // Pass 2: classify per record
    const verdicts = [];
    for (const r of records) {
        if (r.unreadable) {
            verdicts.push({ dirname: r.dirname, class: 'unreadable', severity: 'medium' });
            continue;
        }
        if (r.key == null) {
            verdicts.push({
                dirname: r.dirname,
                relDir: r.relDir,
                class: 'missing',
                severity: 'high',
                code: 'BOX-042-MISSING',
                message: 'config.js has no `storageKey` field. Engine falls back to the platform default, which collides with every other default-fallback box.',
                fix: `Add storageKey: 'hexworth_lab_<short-id>' to the config.`
            });
            continue;
        }
        const sharing = keyToBoxes.get(r.key);
        if (sharing.length > 1) {
            verdicts.push({
                dirname: r.dirname,
                relDir: r.relDir,
                class: 'collision',
                severity: 'critical',
                code: 'BOX-042-COLLISION',
                key: r.key,
                sharedWith: sharing.filter(rd => rd !== r.relDir),
                message: `storageKey '${r.key}' is shared with ${sharing.length - 1} other box(es). Student progress cross-pollutes.`,
                fix: `Rename to a unique value like 'hexworth_lab_${r.dirname.replace(/-/g, '_')}'.`
            });
        } else {
            verdicts.push({ dirname: r.dirname, class: 'unique', key: r.key, severity: null });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered' }); continue; }
        if (exp.expectKey && v.key !== exp.expectKey) {
            selfFailures.push({ box: dn, expected: 'key='+exp.expectKey, got: v.key });
        }
        if (exp.expectUnique && v.class !== 'unique') {
            selfFailures.push({ box: dn, expected: 'unique', got: v.class, detail: v });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const collisions = verdicts.filter(v => v.class === 'collision');
    const missing = verdicts.filter(v => v.class === 'missing');
    const unique = verdicts.filter(v => v.class === 'unique');

    // Group collisions into clusters for report clarity
    const clusters = [];
    for (const [k, boxList] of keyToBoxes.entries()) {
        if (boxList.length > 1) clusters.push({ key: k, boxes: boxList });
    }

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-storage-key-uniqueness',
        validatorCode: 'BOX-042',
        scope: { input: '_app/**/config.js — storageKey field' },
        totals: {
            boxesScanned: boxes.length,
            unique: unique.length,
            collisions: collisions.length,
            collisionClusters: clusters.length,
            missing: missing.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        clusters,
        findings: [...collisions, ...missing],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-storage-key-uniqueness (BOX-042)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Unique:                  ' + unique.length);
    console.log('  Collision (CRITICAL):    ' + collisions.length + ' boxes across ' + clusters.length + ' clusters');
    console.log('  Missing (HIGH):          ' + missing.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (clusters.length > 0) {
        console.log('---');
        console.log('CRITICAL: storageKey collision clusters:');
        clusters.slice(0, 15).forEach(c => {
            console.log('  key="' + c.key + '" shared by: ' + c.boxes.join(', '));
        });
        if (clusters.length > 15) console.log('  ... and ' + (clusters.length - 15) + ' more clusters');
    }
    if (missing.length > 0) {
        console.log('---');
        console.log('HIGH: missing storageKey (' + missing.length + '):');
        missing.slice(0, 15).forEach(v => console.log('  ' + v.dirname));
        if (missing.length > 15) console.log('  ... and ' + (missing.length - 15) + ' more');
    }

    if (REPORT_ONLY || (collisions.length === 0 && missing.length === 0)) process.exit(0);
    process.exit(1);
}

main();
