#!/usr/bin/env node
/**
 * EduScan — Box Multi-Action Gate Exclusivity Lint (BOX-004)
 *
 * Detects gate-completion conditions in box configs that use `.includes()`
 * to check for the presence of a correct value WITHOUT also verifying
 * that wrong/decoy values are NOT present. This is the exact bug class
 * Nancy round 3 caught in PIS-FINAL Phase 6.
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 3 (2026-05-21) BLOCK finding:
 *
 *     "Phase 6 composite gate is exploitable: wrong-CVE + correct-CVE
 *      simultaneously applied unlocks the flag. The `phaseComplete`
 *      check only requires `applied.includes('CVE-2022-30190')`. It
 *      does NOT require that CVE-2022-30190 be the ONLY applied patch.
 *      Student can apply CVE-2024-21412 (decoy, costs -40), then
 *      CVE-2022-30190, run the scan (passes because correct CVE is
 *      among applied), add mail filter, and get the composite flag —
 *      all without Undoing the wrong patch. The -40 penalty lands but
 *      the educational message about identifying the right CVE before
 *      patching is bypassed."
 *
 *   The fix added `const wrongPatchesStillApplied = applied.some(cve
 *   => cve !== 'CVE-2022-30190')` and incorporated `!wrongPatchesStillApplied`
 *   into the gate.
 *
 *   This rule prevents that class of bug on future multi-action gates.
 *
 * Detection heuristic:
 *   1. Find variable declarations or assignments to identifiers that
 *      look like completion gates: `phaseComplete`, `labComplete`,
 *      `isComplete`, `gateComplete`, `flagComplete`, etc.
 *   2. Check the RHS expression of the assignment for `.includes(X)`
 *      patterns where X is a string literal (a specific correct value).
 *   3. If the expression has `.includes(X)` but NO accompanying
 *      `.some(...!== X)` or `.length === 1` or similar exclusivity
 *      check on the same array, emit a finding.
 *
 *   This is a HEURISTIC — operator should review each finding. The rule
 *   surfaces the pattern for manual confirmation; it can't perfectly
 *   classify when exclusivity is required vs not.
 *
 * Issue codes:
 *   BOX-004-GATE-NO-EXCLUSIVITY    Completion gate uses .includes() but
 *                                  no exclusivity check on the same array.
 *                                  May allow gate bypass when student
 *                                  has both correct + wrong values.
 *                                  Severity: HIGH.
 *
 * Read-only. No edits.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_GATE_EXCLUSIVITY_LINT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Gate variable name patterns (lower-cased substrings).
// If a variable name contains any of these tokens, treat its RHS as a gate.
const GATE_TOKENS = [
    'phasecomplete', 'labcomplete', 'iscomplete', 'gatecomplete',
    'flagcomplete', 'phasecompleted', 'isfixed', 'isresolved',
    'compositeready', 'allactions', 'allcomplete'
];

const SELF_VALIDATION = {
    // PIS-FINAL now has the exclusivity check (Nancy round 3 fix). Should be clean.
    'pis-final-patient-zero': { expectFindings: false, reason: 'wrongPatchesStillApplied added' }
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
                        boxName: path.basename(d),
                        configFile: path.join(d, 'config.js'),
                        relDir: path.relative(ROOT, d) + path.sep
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

/**
 * Find gate-style assignments in config: `const <gateVarName> = <expr>;`
 * or `var <name> = <expr>;` or `let <name> = <expr>;` where the variable
 * name matches one of GATE_TOKENS.
 *
 * For multi-line expressions, captures from the assignment opener to the
 * next semicolon at the same depth.
 */
function findGateAssignments(content) {
    const out = [];
    // Match keyword + identifier + = then capture forward to ;
    const declRe = /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_$]*)\s*=\s*/g;
    let m;
    while ((m = declRe.exec(content)) !== null) {
        const varName = m[1];
        const lower = varName.toLowerCase();
        if (!GATE_TOKENS.some(tok => lower.includes(tok))) continue;
        // Capture expression up to next ; at depth 0 from the equals sign
        let i = m.index + m[0].length;
        let depth = 0;
        const start = i;
        while (i < content.length) {
            const c = content[i];
            if (c === '{' || c === '(' || c === '[') depth++;
            else if (c === '}' || c === ')' || c === ']') depth--;
            else if (c === ';' && depth === 0) break;
            i++;
        }
        const expr = content.substring(start, i).trim();
        out.push({ varName, expr, lineHint: content.substring(0, m.index).split('\n').length });
    }
    return out;
}

/**
 * Determine whether a gate expression is at risk.
 * Risk:
 *   - Contains `.includes(<string literal>)` referring to a correct value
 *   - Does NOT contain accompanying exclusivity check on the same identifier:
 *     * `.some(<var> => <var> !== <something>)`
 *     * `.length === 1` or `.length === N`
 *     * `!.includes(<other_string>)` for known wrong values
 *     * `!wrongXXX` variables (e.g., wrongPatchesStillApplied) — heuristic by name
 */
function isAtRisk(expr) {
    // Must contain .includes() call with string literal
    const includesMatches = [...expr.matchAll(/(\w+)\.includes\s*\(\s*['"]([^'"]+)['"]/g)];
    if (includesMatches.length === 0) return { atRisk: false };

    // For each .includes(X) check the same identifier for exclusivity
    const risks = [];
    for (const inc of includesMatches) {
        const ident = inc[1];
        const value = inc[2];
        const lowerExpr = expr.toLowerCase();

        // Acceptable exclusivity patterns
        const hasSomeCheck = new RegExp(`${ident}\\.some\\s*\\(`).test(expr);
        const hasLengthCheck = new RegExp(`${ident}\\.length\\s*===?\\s*\\d`).test(expr);
        const hasNegatedIncludes = new RegExp(`!\\s*${ident}\\.includes`).test(expr);
        // Heuristic: presence of a "wrong*" or "extra*" or "stale*" exclusivity variable
        const hasExclusivityFlag = /!(?:wrong|extra|stale|other|stray)\w*/i.test(expr);

        if (!(hasSomeCheck || hasLengthCheck || hasNegatedIncludes || hasExclusivityFlag)) {
            risks.push({ identifier: ident, expectedValue: value });
        }
    }
    return {
        atRisk: risks.length > 0,
        risks
    };
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
            verdicts.push({ boxName: box.boxName, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const gates = findGateAssignments(content);
        if (gates.length === 0) {
            verdicts.push({ boxName: box.boxName, class: 'no-gates', severity: null });
            continue;
        }

        const atRiskGates = [];
        for (const gate of gates) {
            const r = isAtRisk(gate.expr);
            if (r.atRisk) {
                atRiskGates.push({
                    varName: gate.varName,
                    lineHint: gate.lineHint,
                    risks: r.risks,
                    exprSnippet: gate.expr.length > 200 ? gate.expr.slice(0, 197) + '...' : gate.expr
                });
            }
        }

        if (atRiskGates.length === 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'gates-safe',
                severity: null,
                gateCount: gates.length
            });
        } else {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'gate-no-exclusivity',
                severity: 'high',
                code: 'BOX-004-GATE-NO-EXCLUSIVITY',
                message: `${atRiskGates.length} gate condition(s) use .includes() without exclusivity check on the same array. Potential bypass when student has correct value AND wrong values both present.`,
                atRiskGates
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not discovered' });
            continue;
        }
        const hasFindings = v.class === 'gate-no-exclusivity';
        if (hasFindings !== exp.expectFindings) {
            selfFailures.push({
                box,
                reason: 'mismatch',
                expectFindings: exp.expectFindings,
                got: v.class,
                note: exp.reason,
                detail: v
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const atRisk = verdicts.filter(v => v.class === 'gate-no-exclusivity');
    const safe = verdicts.filter(v => v.class === 'gates-safe');
    const noGates = verdicts.filter(v => v.class === 'no-gates');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-gate-exclusivity-lint',
        validatorCode: 'BOX-004',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            noGates: noGates.length,
            gatesSafe: safe.length,
            atRisk: atRisk.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: atRisk,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-gate-exclusivity-lint (BOX-004)');
    console.log('====================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  No gate variables:       ' + noGates.length);
    console.log('  Gates safe (exclusive):  ' + safe.length);
    console.log('  AT-RISK (no exclusivity):' + atRisk.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (atRisk.length > 0) {
        console.log('---');
        console.log('AT-RISK gates (' + atRisk.length + ' boxes — sample):');
        atRisk.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ' (' + v.atRiskGates.length + ' gates)');
            v.atRiskGates.slice(0, 2).forEach(g => {
                console.log(`    ${g.varName} (line ~${g.lineHint}): ${g.exprSnippet.slice(0, 100)}...`);
            });
        });
        if (atRisk.length > 10) console.log('  ... and ' + (atRisk.length - 10) + ' more');
    }

    if (REPORT_ONLY || atRisk.length === 0) process.exit(0);
    process.exit(1);
}

main();
