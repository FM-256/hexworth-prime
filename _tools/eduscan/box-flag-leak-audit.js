#!/usr/bin/env node
/**
 * EduScan — Box Flag Literal Client-Side Leak Audit (BOX-011)
 *
 * Detects boxes where the answer-flag VALUE appears as a literal string
 * in the client-shipped `config.js`. A student opens DevTools → Sources
 * → reads the literal → submits it → wins without solving.
 *
 * Three flag-award mechanisms exist on the platform:
 *
 *   1. Auto-award      — `engine.awardFlag(flagId)`. Engine validates
 *                         state transition server-side. Flag value lives
 *                         only in Firestore. NO leak by design.
 *
 *   2. Server-delivered — `engine.requestFlagText(flagId)`. CF returns
 *                         the value at runtime, cached in delivered-flags
 *                         map. Flag value lives only in Firestore.
 *                         NO leak by design.
 *
 *   3. Config-embedded  — Terminal output string contains the literal
 *                         flag value (e.g. `Connection accepted. Flag:
 *                         BOXID{abc}`). Used by 30+ dispatch boxes in
 *                         the existing fleet. Acknowledged design
 *                         compromise — student can view-source the
 *                         answer.
 *
 * This rule surfaces the literal-presence FACT without judging the
 * mechanism. Operator decides whether each finding is acceptable per
 * the box's design.
 *
 * Severity classification of findings:
 *
 *   HIGH   — Flag value matches a formal CTF flag pattern
 *            (`^[a-z]+\{[A-Za-z0-9_]+\}$`). These are pure secrets;
 *            they have no narrative role and should not appear in
 *            client code. A leak here is a programmer mistake, not a
 *            design choice.
 *
 *   INFO   — Flag value is an arbitrary string (message-id, hostname,
 *            username, codeword, hash, ...). Narrative/discovery boxes
 *            embed these intentionally as evidence the student must
 *            find by investigating. Operator review still recommended
 *            — even narrative boxes can over-expose by including the
 *            literal in a comment or unused fixture.
 *
 * Issue codes:
 *   BOX-011-FLAG-LEAK-CTF   Formal CTF-pattern flag literal found in
 *                           config.js. Severity: HIGH.
 *   BOX-011-FLAG-LEAK-NARRATIVE
 *                           Non-CTF-pattern flag literal found in
 *                           config.js. Severity: INFO.
 *
 * Self-validation cases:
 *   - a1-ancient-ledger      — CTF flags, MUST NOT appear in config.js
 *                              (server-delivered). expectHighFindings: 0
 *   - pis-final-patient-zero — Narrative flags ARE expected to appear
 *                              (evidence in SIEM/email/scan output).
 *                              expectInfoFindings: > 0
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const BOX_FLAGS_PATH = path.join(ROOT, 'functions/box_flags.json');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_FLAG_LEAK_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Formal CTF flag pattern: lowercase prefix, brace, alphanumeric+underscore body, close brace.
// Examples: flag{abc123}, FLAG{r00t_xpl0it}, BOXID{wlan_compromise}
const CTF_FLAG_PATTERN = /^[A-Za-z][A-Za-z0-9_]*\{[A-Za-z0-9_\-]+\}$/;

const SELF_VALIDATION = {
    'a1-ancient-ledger': { expectHighFindings: 0, reason: 'CTF flags, server-delivered, no leak expected' },
    'pis-final-patient-zero': { minInfoFindings: 1, reason: 'narrative box — evidence flags appear in fixture data' }
};

function loadBoxFlags() {
    if (!fs.existsSync(BOX_FLAGS_PATH)) {
        console.error('FATAL: ' + BOX_FLAGS_PATH + ' missing.');
        process.exit(99);
    }
    return JSON.parse(fs.readFileSync(BOX_FLAGS_PATH, 'utf8'));
}

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
    const allFlags = loadBoxFlags();
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        // Box must have a flag_registry entry; otherwise nothing to leak
        const entry = allFlags[box.dirname];
        if (!entry || !entry.flags) {
            verdicts.push({ dirname: box.dirname, class: 'no-registry-entry', severity: null });
            continue;
        }
        let cfg;
        try { cfg = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ dirname: box.dirname, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const leaks = [];
        for (const [flagId, flagVal] of Object.entries(entry.flags)) {
            if (typeof flagVal !== 'string' || flagVal.length === 0) continue;
            // Skip extremely short values to avoid substring collisions
            if (flagVal.length < 4) continue;
            const idx = cfg.indexOf(flagVal);
            if (idx >= 0) {
                const isCtf = CTF_FLAG_PATTERN.test(flagVal);
                leaks.push({
                    flagId,
                    flagValue: flagVal,
                    offsetInConfig: idx,
                    severity: isCtf ? 'high' : 'info',
                    code: isCtf ? 'BOX-011-FLAG-LEAK-CTF' : 'BOX-011-FLAG-LEAK-NARRATIVE',
                    ctfPattern: isCtf
                });
            }
        }
        if (leaks.length === 0) {
            verdicts.push({ dirname: box.dirname, class: 'clean', severity: null });
        } else {
            const hasHigh = leaks.some(l => l.severity === 'high');
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: hasHigh ? 'ctf-leak' : 'narrative-leak',
                severity: hasHigh ? 'high' : 'info',
                leakCount: leaks.length,
                ctfLeakCount: leaks.filter(l => l.severity === 'high').length,
                infoLeakCount: leaks.filter(l => l.severity === 'info').length,
                leaks
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
        const ctf = v.ctfLeakCount || 0;
        const info = v.infoLeakCount || 0;
        if (typeof exp.expectHighFindings === 'number' && ctf !== exp.expectHighFindings) {
            selfFailures.push({ box: dn, expected: 'CTF leaks='+exp.expectHighFindings, got: ctf, note: exp.reason });
        }
        if (typeof exp.minInfoFindings === 'number' && info < exp.minInfoFindings) {
            selfFailures.push({ box: dn, expected: 'INFO leaks≥'+exp.minInfoFindings, got: info, note: exp.reason });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const ctfLeaks = verdicts.filter(v => v.class === 'ctf-leak');
    const narrativeLeaks = verdicts.filter(v => v.class === 'narrative-leak');
    const clean = verdicts.filter(v => v.class === 'clean');
    const noRegistry = verdicts.filter(v => v.class === 'no-registry-entry');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-flag-leak-audit',
        validatorCode: 'BOX-011',
        scope: { input: '_app/**/config.js cross-referenced with functions/box_flags.json' },
        totals: {
            boxesScanned: boxes.length,
            clean: clean.length,
            ctfLeaks: ctfLeaks.length,
            narrativeLeaks: narrativeLeaks.length,
            noRegistryEntry: noRegistry.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: [...ctfLeaks, ...narrativeLeaks],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-flag-leak-audit (BOX-011)');
    console.log('========================================');
    console.log('  Boxes scanned:                  ' + boxes.length);
    console.log('  Clean (no literal in config.js):' + clean.length);
    console.log('  CTF-pattern LEAKS (HIGH):       ' + ctfLeaks.length);
    console.log('  Narrative LEAKS (INFO):         ' + narrativeLeaks.length);
    console.log('  No registry entry (N/A):        ' + noRegistry.length);
    console.log('  Self-validation:                PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                       ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                         ' + path.relative(ROOT, OUT_FILE));

    if (ctfLeaks.length > 0) {
        console.log('---');
        console.log('HIGH: CTF-flag leaks (' + ctfLeaks.length + ' boxes):');
        ctfLeaks.slice(0, 15).forEach(v => {
            console.log('  ' + v.dirname + ' [' + v.ctfLeakCount + ' CTF leak(s)]');
        });
        if (ctfLeaks.length > 15) console.log('  ... and ' + (ctfLeaks.length - 15) + ' more');
    }
    if (narrativeLeaks.length > 0) {
        console.log('---');
        console.log('INFO: narrative leaks (' + narrativeLeaks.length + ' boxes — review per box design):');
        narrativeLeaks.slice(0, 10).forEach(v => {
            console.log('  ' + v.dirname + ' [' + v.infoLeakCount + ' narrative leak(s)]');
        });
        if (narrativeLeaks.length > 10) console.log('  ... and ' + (narrativeLeaks.length - 10) + ' more');
    }

    if (REPORT_ONLY || ctfLeaks.length === 0) process.exit(0);
    process.exit(1);
}

main();
