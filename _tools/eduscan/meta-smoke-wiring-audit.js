#!/usr/bin/env node
/**
 * EduScan — Meta Smoke-Gate Wiring Audit (META-003)
 *
 * Detects BOX-* / META-* validator files that exist on disk AND are
 * documented in the safety-net architecture but are NOT wired into the
 * pre-deploy smoke gate (`_tools/eduscan/smoke/run.js` BOX_VALIDATORS
 * array). A validator that exists + is documented but never runs is
 * dead code from the safety-net's perspective.
 *
 * Why this rule matters:
 *   META-001 closes the file → doc gap. META-002 closes the doc → file
 *   gap. But a validator can pass BOTH and STILL not actually run if
 *   the smoke gate's BOX_VALIDATORS array doesn't include it. The
 *   operator believes the rule is active because the file is present
 *   and registered, but in reality the gate never invokes it.
 *
 *   This rule closes the third leg: file ↔ doc ↔ smoke-gate triangle
 *   integrity.
 *
 * Scope:
 *   Only BOX-* and META-* codes — these are the Stage 3 pre-deploy
 *   gate family per safety-net-architecture.md. Other code families
 *   (HEUR, CAT, XREF, PROG, QUIZ, FUNC, etc.) run at different stages
 *   (pre-commit, pre-merge, full EduScan) and are NOT expected to be
 *   in the smoke gate's BOX_VALIDATORS list. Including them would
 *   produce noisy false positives.
 *
 * Detection:
 *   1. Walk _tools/eduscan/{box,meta}-*.js
 *   2. For each, extract its primary code (validatorCode field OR
 *      JSDoc title parenthetical)
 *   3. Parse _tools/eduscan/smoke/run.js for the BOX_VALIDATORS
 *      array; extract every `code: 'X'` entry
 *   4. Validator code not in smoke array → finding (HIGH)
 *
 * Issue code:
 *   META-003-NOT-WIRED  Validator exists + documented but not in the
 *                       smoke gate's BOX_VALIDATORS array. Severity: HIGH.
 *
 * Read-only.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const EDUSCAN_DIR = path.join(ROOT, '_tools/eduscan');
const SMOKE_RUN = path.join(ROOT, '_tools/eduscan/smoke/run.js');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'META_SMOKE_WIRING_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Stage 3 code families that MUST be in smoke gate.
// Other families run at earlier stages (HEUR=pre-commit, CAT=pre-merge, etc.)
const STAGE_3_PREFIXES = ['BOX', 'META'];

// Files in _tools/eduscan/ that ship Stage-3 codes but are intentionally NOT
// in the smoke gate (helpers, one-shot remediations).
const OPT_OUT_FILES = {
    'box-state-reset-backfill.js': 'One-shot remediation script for BOX-006, not a recurring validator'
};

function findStage3ValidatorFiles() {
    const entries = fs.readdirSync(EDUSCAN_DIR, { withFileTypes: true });
    const out = [];
    for (const e of entries) {
        if (!e.isFile() || !e.name.endsWith('.js')) continue;
        if (OPT_OUT_FILES[e.name]) continue;
        if (!/^(box|meta)-/.test(e.name)) continue;
        out.push(path.join(EDUSCAN_DIR, e.name));
    }
    return out;
}

function extractPrimaryCode(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const vcMatch = src.match(/validatorCode\s*:\s*['"]([A-Z]+-\d+[a-zA-Z]?)['"]/);
    if (vcMatch) return vcMatch[1];
    const titleMatch = src.match(/^\s*\*[^\n]*\(([A-Z]+-\d+[a-zA-Z]?)\)/m);
    if (titleMatch) return titleMatch[1];
    return null;
}

function loadSmokeWiredCodes() {
    if (!fs.existsSync(SMOKE_RUN)) {
        console.error('FATAL: smoke gate runner missing at ' + SMOKE_RUN);
        process.exit(99);
    }
    const src = fs.readFileSync(SMOKE_RUN, 'utf8');
    // Extract BOX_VALIDATORS array contents — every `code: 'XXX'` entry
    const m = src.match(/BOX_VALIDATORS\s*=\s*\[([\s\S]*?)\];/);
    if (!m) {
        console.error('FATAL: could not locate BOX_VALIDATORS array in smoke/run.js');
        process.exit(99);
    }
    const block = m[1];
    const re = /code\s*:\s*['"]([A-Z]+-\d+[a-zA-Z]?)['"]/g;
    const codes = new Set();
    let cm;
    while ((cm = re.exec(block)) !== null) codes.add(cm[1]);
    return codes;
}

function main() {
    const startMs = Date.now();
    const files = findStage3ValidatorFiles();
    const wired = loadSmokeWiredCodes();

    const verdicts = [];
    for (const f of files) {
        const code = extractPrimaryCode(f);
        if (!code) {
            verdicts.push({
                file: path.relative(ROOT, f),
                class: 'no-code',
                severity: 'medium',
                issueCode: 'META-003-NO-CODE-DECLARED',
                message: 'Stage-3 candidate file declares no rule code; cannot verify wiring.'
            });
            continue;
        }
        const prefix = code.split('-')[0];
        if (!STAGE_3_PREFIXES.includes(prefix)) {
            verdicts.push({ file: path.relative(ROOT, f), code, class: 'not-stage-3', severity: null });
            continue;
        }
        if (wired.has(code)) {
            verdicts.push({ file: path.relative(ROOT, f), code, class: 'wired', severity: null });
        } else {
            verdicts.push({
                file: path.relative(ROOT, f),
                code,
                class: 'not-wired',
                severity: 'high',
                issueCode: 'META-003-NOT-WIRED',
                message: `Validator ${code} exists at ${path.basename(f)} but is not in the smoke gate's BOX_VALIDATORS array. The validator will never run on deploy.`,
                fix: `Add an entry to BOX_VALIDATORS in _tools/eduscan/smoke/run.js: { code: '${code}', script: '${path.basename(f)}', blocking: true|false, desc: '...' }`
            });
        }
    }

    const notWired = verdicts.filter(v => v.class === 'not-wired');
    const noCode   = verdicts.filter(v => v.class === 'no-code');
    const wired_   = verdicts.filter(v => v.class === 'wired');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'meta-smoke-wiring-audit',
        validatorCode: 'META-003',
        scope: {
            stage3Prefixes: STAGE_3_PREFIXES,
            optOutFiles: Object.keys(OPT_OUT_FILES),
            smokeWiredCount: wired.size
        },
        totals: {
            scanned: files.length,
            wired: wired_.length,
            notWired: notWired.length,
            noCodeDeclared: noCode.length,
            durationMs: Date.now() - startMs
        },
        findings: [...notWired, ...noCode],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('meta-smoke-wiring-audit (META-003)');
    console.log('========================================');
    console.log('  Stage-3 files scanned:    ' + files.length);
    console.log('  Smoke gate has:           ' + wired.size + ' BOX_VALIDATORS entries');
    console.log('  Wired:                    ' + wired_.length);
    console.log('  NOT WIRED (HIGH):         ' + notWired.length);
    console.log('  No code declared:         ' + noCode.length);
    console.log('  Duration:                 ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                   ' + path.relative(ROOT, OUT_FILE));

    if (notWired.length > 0) {
        console.log('---');
        console.log('HIGH: validator exists but not in smoke gate:');
        notWired.forEach(v => console.log('  ' + v.code + '  (' + path.basename(v.file) + ')'));
    }

    if (REPORT_ONLY || notWired.length === 0) process.exit(0);
    process.exit(1);
}

main();
