#!/usr/bin/env node
/**
 * EduScan — Box HTML Bootstrap Script Audit (BOX-016)
 *
 * Detects index.html files that invoke `BoxEngine.init` (and therefore
 * declare themselves a Box) but are missing one or more of the script
 * imports the engine REQUIRES to function. A box missing these scripts
 * either throws on boot (ReferenceError on the engine global) or
 * silently degrades flag validation to client-only checks (security
 * regression — the validateFlag CF cannot be called without FirebaseAuth).
 *
 * Why this rule matters:
 *   A box that loads `BoxEngine.js` but forgets `config.js` produces
 *   "<BoxConfigVar> is not defined" on boot. A box that forgets
 *   `FirebaseAuth.js` silently falls back to client-side validation —
 *   the engine code path in BoxEngine.js explicitly guards
 *   `typeof FirebaseAuth !== 'undefined'` and degrades to local
 *   comparison when the global is absent. That degradation is invisible
 *   to the operator but breaks the server-side flag bridge (and the
 *   leak-resistance guarantee that flag values live only in Firestore).
 *
 * Detection:
 *   For each BoxEngine-init box, read index.html and verify it contains
 *   script tags whose src attribute references (path-agnostically):
 *     - config.js                  (the box's own config)
 *     - BoxEngine.js               (the engine itself)
 *     - FirebaseAuth.js            (auth + CF callable bridge)
 *
 *   The check is filename-based (matches the END of the src), so
 *   relative paths like `config.js`, `../../engine/BoxEngine.js`, and
 *   `/components/FirebaseAuth.js` all match correctly.
 *
 * Issue codes:
 *   BOX-016-MISSING-CONFIG-JS    No `<script src="...config.js">`.
 *                                Engine will throw `<Config> is not
 *                                defined` on init. Severity: CRITICAL.
 *   BOX-016-MISSING-ENGINE       No `<script src="...BoxEngine.js">`.
 *                                BoxEngine.init throws ReferenceError.
 *                                Severity: CRITICAL.
 *   BOX-016-MISSING-FIREBASE-AUTH
 *                                No `<script src="...FirebaseAuth.js">`.
 *                                Flag validation degrades to client-side
 *                                only — server bridge unusable.
 *                                Severity: HIGH (silent security
 *                                regression).
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — all three present (arena pattern)
 *   - vpn001-tunnel-down     — all three present (dispatch pattern)
 *   - a1-ancient-ledger      — all three present (arena pattern)
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_HTML_BOOTSTRAP.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Required script imports. Each entry is a filename suffix matched
// case-insensitively at the end of a src attribute.
const REQUIRED_SCRIPTS = [
    {
        suffix: 'config.js',
        code: 'BOX-016-MISSING-CONFIG-JS',
        severity: 'critical',
        message: 'index.html does not include a <script src="...config.js"> tag. Engine init will throw `<Config> is not defined`.'
    },
    {
        suffix: 'BoxEngine.js',
        code: 'BOX-016-MISSING-ENGINE',
        severity: 'critical',
        message: 'index.html does not include a <script src="...BoxEngine.js"> tag. BoxEngine.init call will throw ReferenceError.'
    },
    {
        suffix: 'FirebaseAuth.js',
        code: 'BOX-016-MISSING-FIREBASE-AUTH',
        severity: 'high',
        message: 'index.html does not include <script src="...FirebaseAuth.js">. Flag validation silently falls back to client-side comparison — server bridge unusable, flag leak resistance compromised.'
    }
];

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectMissing: [] },
    'vpn001-tunnel-down':     { expectMissing: [] },
    'a1-ancient-ledger':      { expectMissing: [] }
};

function srcAttrMatches(html, suffix) {
    // Match <script ... src="...filename"> or src='...filename'.
    // The suffix must come at the end of the src value (before quote).
    const re = new RegExp(
        '<script[^>]*\\bsrc\\s*=\\s*["\\\']' +     // opening + src=
        '[^"\\\']*' +                                // path prefix
        suffix.replace(/[.]/g, '\\.') +              // literal filename
        '["\\\']',                                   // closing quote
        'i'
    );
    return re.test(html);
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
                const htmlPath = path.join(d, 'index.html');
                const html = fs.readFileSync(htmlPath, 'utf8');
                if (/BoxEngine\.init/.test(html)) {
                    out.push({
                        dirname: path.basename(d),
                        htmlFile: htmlPath,
                        html,
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
        const missing = [];
        for (const req of REQUIRED_SCRIPTS) {
            if (!srcAttrMatches(box.html, req.suffix)) {
                missing.push({
                    code: req.code,
                    severity: req.severity,
                    requiredSuffix: req.suffix,
                    message: req.message
                });
            }
        }
        if (missing.length === 0) {
            verdicts.push({ dirname: box.dirname, class: 'complete', severity: null });
        } else {
            const sev = missing.some(m => m.severity === 'critical') ? 'critical' :
                        missing.some(m => m.severity === 'high')     ? 'high'     : 'medium';
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: 'incomplete',
                severity: sev,
                missingCount: missing.length,
                missing
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered' }); continue; }
        const missingCodes = (v.missing || []).map(m => m.code);
        const expectedMissing = exp.expectMissing || [];
        const unexpected = missingCodes.filter(c => !expectedMissing.includes(c));
        const expectedAbsent = expectedMissing.filter(c => !missingCodes.includes(c));
        if (unexpected.length > 0 || expectedAbsent.length > 0) {
            selfFailures.push({
                box: dn,
                expected: expectedMissing,
                got: missingCodes,
                unexpectedMissing: unexpected,
                expectedButPresent: expectedAbsent
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const incomplete = verdicts.filter(v => v.class === 'incomplete');
    const complete = verdicts.filter(v => v.class === 'complete');
    const critical = incomplete.filter(v => v.severity === 'critical');
    const high = incomplete.filter(v => v.severity === 'high');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-html-bootstrap-audit',
        validatorCode: 'BOX-016',
        scope: { input: '_app/**/index.html (boxes that invoke BoxEngine.init)' },
        totals: {
            boxesScanned: boxes.length,
            complete: complete.length,
            incompleteCritical: critical.length,
            incompleteHigh: high.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: incomplete,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-html-bootstrap-audit (BOX-016)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Complete:                ' + complete.length);
    console.log('  Incomplete CRITICAL:     ' + critical.length);
    console.log('  Incomplete HIGH:         ' + high.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (critical.length > 0) {
        console.log('---');
        console.log('CRITICAL: missing engine/config (' + critical.length + '):');
        critical.slice(0, 15).forEach(v => {
            console.log('  ' + v.dirname + ' missing: ' + v.missing.map(m => m.requiredSuffix).join(', '));
        });
        if (critical.length > 15) console.log('  ... and ' + (critical.length - 15) + ' more');
    }
    if (high.length > 0) {
        console.log('---');
        console.log('HIGH: missing FirebaseAuth (' + high.length + ' — server flag bridge unusable):');
        high.slice(0, 15).forEach(v => console.log('  ' + v.dirname));
        if (high.length > 15) console.log('  ... and ' + (high.length - 15) + ' more');
    }

    if (REPORT_ONLY || (critical.length === 0 && high.length === 0)) process.exit(0);
    process.exit(1);
}

main();
