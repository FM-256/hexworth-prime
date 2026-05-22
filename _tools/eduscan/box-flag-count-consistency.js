#!/usr/bin/env node
/**
 * EduScan — Box Flag Count Consistency (BOX-020)
 *
 * Cross-checks the flag IDs declared in `config.flags[]` against the
 * flag IDs registered in `functions/box_flags.json`. A mismatch means
 * the lab can SHOW the student earning a flag in the UI but the bridge
 * cannot validate the submission (or vice versa: registry has phantom
 * flags the lab cannot deliver).
 *
 * Why this rule matters:
 *   BOX-001 catches missing-entry-entirely (no flag_registry doc at all
 *   for a boxId). BOX-002c catches walkthrough ↔ registry drift. Neither
 *   catches the case where a dev adds a new `{ id: 'flag8', ... }` to
 *   config.flags but forgets to re-seed box_flags.json with the value.
 *   The student earns flag8 in the UI; the bridge says "unknown flag";
 *   the lab fails silently for everyone.
 *
 * Detection:
 *   1. Parse config.flags[] — a top-level JS array of `{ id: '...' }`
 *      objects in config.js. Extracted by locating the `flags:` key,
 *      walking matched `[]` brackets, then regexing `id: 'value'`
 *      out of the captured region.
 *   2. Read box_flags.json[registryId].flags keys.
 *   3. Classify flag mechanism per box:
 *        - "request"          : config.js calls engine.requestFlagText(...).
 *                               Registry REQUIRED — CF returns the value.
 *        - "auto-only"        : config.js calls engine.awardFlag(...) and
 *                               does NOT call requestFlagText. Registry
 *                               NOT required — engine validates via
 *                               validateAction (state-proof CF), not
 *                               validateFlag (value-comparison CF).
 *        - "config-embedded"  : neither — flag literal appears in terminal
 *                               output, student types/pastes, validateFlag
 *                               CF compares to box_flags.json. Registry
 *                               REQUIRED.
 *   4. Compare config.flags vs registry KEYS only for mechanisms that
 *      require a registry. auto-only boxes get a passing verdict with
 *      class "auto-award-only" (registry not required).
 *
 * Issue codes:
 *   BOX-020-MISSING-IN-REGISTRY  config.flags declares flag X, mechanism
 *                                needs a registry entry, but
 *                                box_flags.json[box].flags has no key X.
 *                                Bridge cannot validate submissions.
 *                                Severity: HIGH.
 *   BOX-020-ORPHAN-IN-REGISTRY   box_flags.json[box].flags has key X
 *                                but config.flags does not declare it.
 *                                Phantom flag — student can never earn.
 *                                Severity: MEDIUM (stale registry).
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — declares 7 flags, registry has 7 keys,
 *                              MUST agree exactly.
 *   - a1-ancient-ledger      — declares 2 flags (user/root),
 *                              registry has 2 keys, MUST agree exactly.
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
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_FLAG_COUNT_CONSISTENCY.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const REGISTRY_ID_RE = /registryId\s*:\s*['"]([^'"]+)['"]/;
const REQUEST_TEXT_RE = /engine\.requestFlagText\s*\(/;
const AWARD_FLAG_RE   = /engine\.awardFlag\s*\(/;
const SCENARIOS_RE    = /_scenarios\s*:\s*\[/;

function classifyMechanism(cfg) {
    const hasScenarios = SCENARIOS_RE.test(cfg);
    const usesRequest  = REQUEST_TEXT_RE.test(cfg);
    const usesAward    = AWARD_FLAG_RE.test(cfg);
    // Dispatch boxes (_scenarios) use Mode-2 validateFlag — CF scans the
    // registry value-side, returns the matched scenario key. Config.flags
    // declares workflow steps (investigate/diagnose/remediate/verify) that
    // are orthogonal to registry keys (scenario IDs). Registry is required
    // for value-comparison but ID alignment is NOT required.
    if (hasScenarios) return 'dispatch';
    if (usesRequest)  return 'request';                  // server-delivered, ID-aligned
    if (usesAward)    return 'auto-only';                // state-proof, no registry needed
    return 'config-embedded';                            // literal flag, ID-aligned
}

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectAgreement: true, expectFlagCount: 7, expectMechanism: 'config-embedded' },
    'a1-ancient-ledger':      { expectAgreement: true, expectFlagCount: 2 },
    'pis-l01-specimen-classification': { expectAutoOnly: true, reason: 'awardFlag-only — registry not required' }
};

// Walk balanced [] starting at idx (which points at the opening '[').
// Returns the index AFTER the matching closing ']', or -1 if unbalanced.
function findMatchingBracket(src, openIdx) {
    let depth = 0;
    let inStr = null;     // ' " or ` if inside a string
    let escape = false;
    for (let i = openIdx; i < src.length; i++) {
        const c = src[i];
        if (escape) { escape = false; continue; }
        if (c === '\\') { escape = true; continue; }
        if (inStr) {
            if (c === inStr) inStr = null;
            continue;
        }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
        if (c === '[') depth++;
        else if (c === ']') { depth--; if (depth === 0) return i + 1; }
    }
    return -1;
}

function extractFlagIds(configContent) {
    // Look for top-level "flags: [" — accept whitespace/comments before bracket
    const startRe = /flags\s*:\s*\[/g;
    const ids = [];
    let m;
    while ((m = startRe.exec(configContent)) !== null) {
        const openIdx = m.index + m[0].length - 1;     // index of '['
        const closeIdx = findMatchingBracket(configContent, openIdx);
        if (closeIdx < 0) continue;
        const region = configContent.slice(openIdx + 1, closeIdx - 1);
        const idRe = /id\s*:\s*['"]([^'"]+)['"]/g;
        let im;
        while ((im = idRe.exec(region)) !== null) {
            ids.push(im[1]);
        }
        // Stop at first top-level `flags:` match — additional matches are
        // typically nested (e.g., a `flags: [` inside a state object). The
        // first occurrence in a config is the canonical one.
        break;
    }
    return ids;
}

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
        let cfg;
        try { cfg = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ dirname: box.dirname, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const ridM = cfg.match(REGISTRY_ID_RE);
        if (!ridM) {
            verdicts.push({ dirname: box.dirname, class: 'no-registry-id', severity: 'medium' });
            continue;
        }
        const registryId = ridM[1];
        const mechanism = classifyMechanism(cfg);
        const declaredIds = extractFlagIds(cfg);
        const entry = allFlags[registryId];
        const registryIds = (entry && entry.flags) ? Object.keys(entry.flags) : [];

        const declaredSet = new Set(declaredIds);
        const registrySet = new Set(registryIds);

        const missingInRegistry = declaredIds.filter(id => !registrySet.has(id));
        const orphanInRegistry = registryIds.filter(id => !declaredSet.has(id));

        if (declaredIds.length === 0 && registryIds.length === 0) {
            verdicts.push({ dirname: box.dirname, registryId, mechanism, class: 'flagless', severity: null });
            continue;
        }

        // Dispatch boxes use Mode-2 validateFlag — registry keys are scenario
        // IDs, config.flags IDs are workflow steps. They are intentionally
        // orthogonal. Verify the registry has entries (>0 scenarios) but
        // do NOT compare ID sets.
        if (mechanism === 'dispatch') {
            const passing = registryIds.length > 0;
            verdicts.push({
                dirname: box.dirname,
                registryId,
                mechanism,
                relDir: box.relDir,
                class: passing ? 'dispatch-ok' : 'dispatch-empty',
                severity: passing ? null : 'high',
                declaredCount: declaredIds.length,
                registryCount: registryIds.length,
                findings: passing ? [] : [{
                    code: 'BOX-020-DISPATCH-EMPTY',
                    severity: 'high',
                    message: 'Dispatch box has no scenarios registered in box_flags.json. Student cannot earn any flag.'
                }]
            });
            continue;
        }

        // auto-only mechanism: validateAction CF handles awards via state proof.
        // Registry is not required and missingInRegistry is NOT a finding.
        // Orphan-in-registry IS still surfaced (stale data).
        if (mechanism === 'auto-only') {
            const orphanFindings = [];
            if (orphanInRegistry.length > 0) {
                orphanFindings.push({
                    code: 'BOX-020-ORPHAN-IN-REGISTRY',
                    severity: 'medium',
                    flagIds: orphanInRegistry,
                    message: 'Present in box_flags.json but not declared in config.flags. Auto-only box — registry entry is stale.'
                });
            }
            verdicts.push({
                dirname: box.dirname,
                registryId,
                mechanism,
                relDir: box.relDir,
                class: orphanFindings.length > 0 ? 'orphan' : 'auto-award-only',
                severity: orphanFindings.length > 0 ? 'medium' : null,
                declaredCount: declaredIds.length,
                registryCount: registryIds.length,
                declared: declaredIds,
                inRegistry: registryIds,
                findings: orphanFindings
            });
            continue;
        }

        if (missingInRegistry.length === 0 && orphanInRegistry.length === 0) {
            verdicts.push({
                dirname: box.dirname,
                registryId,
                mechanism,
                class: 'agreement',
                flagCount: declaredIds.length,
                severity: null
            });
            continue;
        }

        const findings = [];
        if (missingInRegistry.length > 0) {
            findings.push({
                code: 'BOX-020-MISSING-IN-REGISTRY',
                severity: 'high',
                flagIds: missingInRegistry,
                message: 'Declared in config.flags but absent from box_flags.json. Bridge cannot validate.'
            });
        }
        if (orphanInRegistry.length > 0) {
            findings.push({
                code: 'BOX-020-ORPHAN-IN-REGISTRY',
                severity: 'medium',
                flagIds: orphanInRegistry,
                message: 'Present in box_flags.json but not declared in config.flags. Phantom flag.'
            });
        }
        verdicts.push({
            dirname: box.dirname,
            registryId,
            mechanism,
            relDir: box.relDir,
            class: 'mismatch',
            severity: missingInRegistry.length > 0 ? 'high' : 'medium',
            declaredCount: declaredIds.length,
            registryCount: registryIds.length,
            declared: declaredIds,
            inRegistry: registryIds,
            findings
        });
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered' }); continue; }
        const agrees = v.class === 'agreement';
        if (exp.expectAgreement && !agrees) {
            selfFailures.push({ box: dn, expected: 'agreement', got: v.class, detail: v });
        }
        if (exp.expectFlagCount != null && v.flagCount !== exp.expectFlagCount && agrees) {
            selfFailures.push({ box: dn, expected: 'flagCount='+exp.expectFlagCount, got: v.flagCount });
        }
        if (exp.expectMechanism && v.mechanism !== exp.expectMechanism) {
            selfFailures.push({ box: dn, expected: 'mechanism='+exp.expectMechanism, got: v.mechanism });
        }
        if (exp.expectAutoOnly && v.class !== 'auto-award-only') {
            selfFailures.push({ box: dn, expected: 'auto-award-only', got: v.class, note: exp.reason });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const mismatches = verdicts.filter(v => v.class === 'mismatch');
    const agreements = verdicts.filter(v => v.class === 'agreement');
    const autoOnly = verdicts.filter(v => v.class === 'auto-award-only');
    const orphan = verdicts.filter(v => v.class === 'orphan');
    const dispatchOk = verdicts.filter(v => v.class === 'dispatch-ok');
    const dispatchEmpty = verdicts.filter(v => v.class === 'dispatch-empty');
    const flagless = verdicts.filter(v => v.class === 'flagless');
    const noRid = verdicts.filter(v => v.class === 'no-registry-id');

    const highMismatches = [...mismatches.filter(v => v.severity === 'high'), ...dispatchEmpty];
    const medMismatches = [...mismatches.filter(v => v.severity === 'medium'), ...orphan];

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-flag-count-consistency',
        validatorCode: 'BOX-020',
        scope: { input: '_app/**/config.js cross-referenced with functions/box_flags.json' },
        totals: {
            boxesScanned: boxes.length,
            agreement: agreements.length,
            autoAwardOnly: autoOnly.length,
            dispatchOk: dispatchOk.length,
            dispatchEmpty: dispatchEmpty.length,
            mismatchHigh: highMismatches.length,
            mismatchMedium: medMismatches.length,
            flagless: flagless.length,
            noRegistryId: noRid.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: [...mismatches, ...orphan, ...dispatchEmpty],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-flag-count-consistency (BOX-020)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Agreement:               ' + agreements.length);
    console.log('  Auto-award only:         ' + autoOnly.length + ' (registry not required)');
    console.log('  Dispatch (scenarios) ok: ' + dispatchOk.length);
    console.log('  Dispatch EMPTY:          ' + dispatchEmpty.length);
    console.log('  Mismatch HIGH:           ' + highMismatches.length);
    console.log('  Mismatch MEDIUM (orphan):' + medMismatches.length);
    console.log('  Flagless (skipped):      ' + flagless.length);
    console.log('  No registryId:           ' + noRid.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (highMismatches.length > 0) {
        console.log('---');
        console.log('HIGH: declared-but-unregistered (' + highMismatches.length + '):');
        highMismatches.slice(0, 15).forEach(v => {
            const missing = v.findings.find(f => f.code === 'BOX-020-MISSING-IN-REGISTRY');
            console.log('  ' + v.dirname + ' missing in registry: [' + (missing?.flagIds || []).join(', ') + ']');
        });
        if (highMismatches.length > 15) console.log('  ... and ' + (highMismatches.length - 15) + ' more');
    }
    if (medMismatches.length > 0) {
        console.log('---');
        console.log('MEDIUM: orphan-in-registry (' + medMismatches.length + '):');
        medMismatches.slice(0, 10).forEach(v => {
            const orphan = v.findings.find(f => f.code === 'BOX-020-ORPHAN-IN-REGISTRY');
            console.log('  ' + v.dirname + ' orphan keys: [' + (orphan?.flagIds || []).join(', ') + ']');
        });
        if (medMismatches.length > 10) console.log('  ... and ' + (medMismatches.length - 10) + ' more');
    }

    if (REPORT_ONLY || highMismatches.length === 0) process.exit(0);
    process.exit(1);
}

main();
