#!/usr/bin/env node
/**
 * EduScan — Box Asset Existence Audit (BOX-035)
 *
 * Detects boxes whose config.js references asset paths that do not
 * exist on disk. A box that points its icon, image, or download link
 * at a stale path produces a visible broken-image icon for every
 * student who opens the lab.
 *
 * Why this rule matters:
 *   Asset paths in config.js are easy to break silently:
 *     - Asset got renamed/moved but config wasn't updated.
 *     - Typo on a copy-paste from another box's config.
 *     - The asset author saved a `.png` but the box references `.webp`.
 *   No static analysis catches this today. Students see a broken icon
 *   and lose trust in the lab.
 *
 * Detection:
 *   For each BoxEngine config.js:
 *     1. Find all string literals matching either:
 *          a. Absolute paths starting with `/assets/`
 *          b. Any string ending in a known asset extension
 *             (.webp .png .jpg .jpeg .svg .gif .ico .pdf .docx .xlsx
 *              .zip .mp3 .mp4 .json when in /assets/)
 *     2. Skip external URLs (http://, https://, data:, mailto:).
 *     3. Skip template-literal placeholders (`${...}`).
 *     4. Skip the box's own config-internal references that are not
 *        meant to be live files (e.g., regex sources).
 *     5. Resolve each path:
 *        - Absolute (`/x/y`) → resolves to `_app/x/y`
 *        - Relative (`x/y`) → resolves to `<config-dir>/x/y`
 *     6. If file does not exist → finding (HIGH).
 *
 * Issue code:
 *   BOX-035-ASSET-MISSING  config.js references a path that does
 *                          not resolve to an existing file.
 *                          Severity: HIGH.
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — MUST have 0 missing assets
 *   - a1-ancient-ledger      — MUST have 0 missing assets
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_ASSET_EXISTENCE.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const ASSET_EXT = '(?:webp|png|jpe?g|svg|gif|ico|mp[34]|wav|ogg|woff2?|ttf|otf)';
// Real platform asset references are scoped to /assets/. Other absolute paths
// (e.g., /downloads/foo.docx) are commonly virtual filesystem keys inside the
// lab simulation, not literal files. Restricting to /assets/ keeps false-
// positive rate near zero while still catching the broken-icon defect class.
const ASSET_PATTERNS = [
    // /assets/... — absolute platform asset path
    new RegExp("['\"]([/]assets/[^'\"`${}\\s]+)['\"]", 'g'),
    // Box-local relative asset paths (must end in known visual/media extension
    // and contain no leading slash — these resolve to the box's own dir).
    new RegExp("['\"](?![/])([\\w./-]+\\.(" + ASSET_EXT + "))['\"]", 'gi')
];

const EXTERNAL_PROTOS = /^(?:https?:|data:|mailto:|tel:|blob:|ws:|wss:|chrome-extension:)/i;
const TEMPLATE_PLACEHOLDER = /\$\{/;

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectMissingCount: 0 },
    'a1-ancient-ledger':      { expectMissingCount: 0 }
};

function extractAssetRefs(content) {
    const refs = new Set();
    for (const re of ASSET_PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
            const value = m[1];
            if (!value) continue;
            if (EXTERNAL_PROTOS.test(value)) continue;
            if (TEMPLATE_PLACEHOLDER.test(value)) continue;
            // Skip pure regex-source strings — heuristic: contains \. or \w etc.
            if (/\\[.dswDSW]/.test(value)) continue;
            refs.add(value);
        }
    }
    return [...refs];
}

function resolveAssetPath(ref, configDir) {
    if (ref.startsWith('/')) {
        // Absolute platform path — resolves under _app/
        return path.join(APP_DIR, ref.replace(/^\//, ''));
    }
    // Relative — resolves relative to the config's directory
    return path.resolve(configDir, ref);
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
                        configDir: d,
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
        let cfg;
        try { cfg = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ dirname: box.dirname, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const refs = extractAssetRefs(cfg);
        const missing = [];
        for (const ref of refs) {
            const abs = resolveAssetPath(ref, box.configDir);
            if (!fs.existsSync(abs)) {
                missing.push({ ref, resolvedTo: path.relative(ROOT, abs) });
            }
        }
        if (refs.length === 0) {
            verdicts.push({ dirname: box.dirname, class: 'no-assets', severity: null });
        } else if (missing.length === 0) {
            verdicts.push({ dirname: box.dirname, class: 'all-exist', refCount: refs.length, severity: null });
        } else {
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: 'missing',
                severity: 'high',
                code: 'BOX-035-ASSET-MISSING',
                refCount: refs.length,
                missingCount: missing.length,
                missing: missing.slice(0, 50),
                message: missing.length + ' asset reference(s) do not resolve to existing files. Students will see broken icons/images.',
                fix: 'Either restore the missing files at the expected path or update the config references.'
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered' }); continue; }
        const got = v.missingCount || 0;
        if (got !== exp.expectMissingCount) {
            selfFailures.push({ box: dn, expected: 'missing='+exp.expectMissingCount, got, sample: (v.missing||[]).slice(0,3) });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const missing = verdicts.filter(v => v.class === 'missing');
    const allExist = verdicts.filter(v => v.class === 'all-exist');
    const noAssets = verdicts.filter(v => v.class === 'no-assets');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-asset-existence-audit',
        validatorCode: 'BOX-035',
        scope: { input: '_app/**/config.js — asset paths matching /assets/ or known extensions' },
        totals: {
            boxesScanned: boxes.length,
            allExist: allExist.length,
            missing: missing.length,
            noAssets: noAssets.length,
            totalRefs: verdicts.reduce((a, v) => a + (v.refCount || 0), 0),
            totalMissing: missing.reduce((a, v) => a + (v.missingCount || 0), 0),
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: missing,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-asset-existence-audit (BOX-035)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  All-exist:               ' + allExist.length);
    console.log('  Missing (HIGH):          ' + missing.length);
    console.log('  No assets referenced:    ' + noAssets.length);
    console.log('  Total refs:              ' + verdicts.reduce((a, v) => a + (v.refCount || 0), 0));
    console.log('  Total missing:           ' + missing.reduce((a, v) => a + (v.missingCount || 0), 0));
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (missing.length > 0) {
        console.log('---');
        console.log('HIGH: missing asset refs (' + missing.length + ' boxes):');
        missing.slice(0, 15).forEach(v => {
            console.log('  ' + v.dirname + ' [' + v.missingCount + '/' + v.refCount + ' missing]');
            v.missing.slice(0, 2).forEach(m => console.log('    → ' + m.ref));
        });
        if (missing.length > 15) console.log('  ... and ' + (missing.length - 15) + ' more');
    }

    if (REPORT_ONLY || missing.length === 0) process.exit(0);
    process.exit(1);
}

main();
