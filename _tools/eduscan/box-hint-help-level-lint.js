#!/usr/bin/env node
/**
 * EduScan — Box Hint Help-Level Honesty Lint (BOX-010)
 *
 * Compares the declared Help Level (1-5) of each hint against measured
 * specificity of the hint text. Flags hints where the measured tier is
 * meaningfully higher than the declared tier (the "answer-leak at
 * discount price" defect).
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 2 (2026-05-21) MEDIUM finding:
 *
 *     "Two hints are miscategorized in ways that will punish students
 *      unfairly given the 2x [Eclipse] penalty.
 *
 *      Hint 2 (Phase 2) labeled L2 'directional': says 'The attachment
 *      in Phase 1's real phishing email is the payload. Hash it with
 *      `sha256sum`, then submit the hash to the Hash Analyzer in your
 *      browser. The analyzer returns BOTH the malware family AND the
 *      CVE — your Flag 2 combines them.' This is not L2 directional.
 *      It is L3 tactical or L4 near-solution — names the exact tool
 *      (sha256sum), exact browser surface (Hash Analyzer), states that
 *      flag combines both returned values."
 *
 *   At Eclipse-tier 2x hint penalty, a student paying L2-disclosed
 *   prices for L4-tier disclosure is being misled.
 *
 * Detection heuristic (measured tier):
 *   Each hint text gets a specificity score from signals:
 *     +1 per backticked code/command (`sha256sum`, `openssl`)
 *     +1 per imperative verb (Run, Type, Submit, Enter, Use, Check...)
 *     +1 per specific UI/tool name (Title-Cased multi-word phrases)
 *     +2 per exact-syntax command (with flags/args)
 *     -1 if hint text length < 100 chars (conceptual signal)
 *     +1 per 150 chars (length scales with specificity)
 *
 *   Map measured score to Help Level:
 *     ≤ 1   → L1 (conceptual)
 *     2-3   → L2 (directional)
 *     4-6   → L3 (tactical)
 *     ≥ 7   → L4 (near-solution)
 *
 *   Finding: declared < measured by ≥ 2 tiers.
 *
 * Issue codes:
 *   BOX-010-HINT-UNDER-DISCLOSED   Declared Help Level is materially
 *                                  lower than measured specificity.
 *                                  Severity: MEDIUM.
 *   BOX-010-NO-HELP-LEVEL          Hints have no helpLevel field
 *                                  declared. Rule N/A — informational.
 *                                  Severity: LOW.
 *
 * Read-only. No edits. Heuristic — review each finding manually.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_HINT_HELP_LEVEL_LINT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const IMPERATIVE_VERBS = [
    'run', 'type', 'submit', 'enter', 'use', 'check', 'open', 'click',
    'select', 'paste', 'copy', 'navigate', 'fetch', 'query', 'inspect',
    'apply', 'install', 'configure', 'restart', 'enable', 'disable'
];

const SELF_VALIDATION = {
    // PIS-FINAL hints were corrected in Nancy round 2: 2/3/5 relabeled to L3/L4/L4.
    // Self-validation: PIS-FINAL should now have NO under-disclosed findings.
    'pis-final-patient-zero': { expectFindings: false, reason: 'Nancy round 2 relabel fix' }
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
                        configFile: path.join(d, 'config.js')
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

/**
 * Extract hint entries from a config. Looks for hints array with
 * { id, text, [helpLevel], cost, penalty } per hint object.
 * Returns array of { id, text, helpLevel | null }.
 */
function extractHints(content) {
    // Find top-level hints: [ ... ]
    const m = content.match(/^\s+hints\s*:\s*\[/m);
    if (!m) return null;
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < content.length && depth > 0) {
        const c = content[i];
        if (c === '[') depth++;
        else if (c === ']') depth--;
        i++;
    }
    if (depth !== 0) return null;
    const block = content.substring(start, i - 1);

    // Parse each hint object — match `{ ... }` at top level
    const hints = [];
    let h = 0;
    while (h < block.length) {
        if (block[h] === '{') {
            // Walk braces
            let d2 = 1;
            const objStart = h + 1;
            let j = objStart;
            while (j < block.length && d2 > 0) {
                if (block[j] === '{') d2++;
                else if (block[j] === '}') d2--;
                j++;
            }
            const objText = block.substring(objStart, j - 1);
            // Extract fields
            const idMatch = objText.match(/id\s*:\s*['"]([^'"]+)['"]/);
            // text may use single, double, or backticks; capture content
            const textMatch = objText.match(/text\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/);
            const hlMatch = objText.match(/helpLevel\s*:\s*(\d+)/);
            // Also accept "(L<digit>" anywhere in object metadata
            const labelHlMatch = objText.match(/['"]L(\d+)\b/);
            const text = textMatch ? (textMatch[1] || textMatch[2] || textMatch[3] || '') : null;
            const helpLevel = hlMatch ? parseInt(hlMatch[1], 10)
                            : labelHlMatch ? parseInt(labelHlMatch[1], 10)
                            : null;
            if (idMatch && text) {
                hints.push({
                    id: idMatch[1],
                    text,
                    helpLevel
                });
            }
            h = j;
        } else {
            h++;
        }
    }
    return hints;
}

function measureSpecificity(hintText) {
    let score = 0;
    const text = hintText || '';
    // Backticked code/commands
    const backticks = (text.match(/`[^`]+`/g) || []).length;
    score += backticks;
    // Exact-syntax (command followed by flag, e.g., `sha256sum -c`)
    const exactSyntax = (text.match(/`\w+\s+[-]\w+|`\w+\s+[<-]/g) || []).length;
    score += exactSyntax * 2;
    // Imperative verbs at sentence starts (rough proxy)
    const lc = text.toLowerCase();
    let imperatives = 0;
    for (const v of IMPERATIVE_VERBS) {
        const re = new RegExp(`(^|\\.\\s+|;\\s+|—\\s*)${v}\\b`, 'g');
        imperatives += (lc.match(re) || []).length;
    }
    score += imperatives;
    // Title-cased multi-word phrases (UI/tool names)
    const titleCased = (text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+/g) || []).length;
    score += Math.min(titleCased, 3);
    // Length adjustment
    if (text.length < 100) score -= 1;
    score += Math.floor(text.length / 150);
    return Math.max(0, score);
}

function scoreToLevel(score) {
    if (score <= 1) return 1;
    if (score <= 3) return 2;
    if (score <= 6) return 3;
    return 4;
}

function main() {
    const startMs = Date.now();
    const boxes = findBoxConfigs(APP_DIR);

    const verdicts = [];
    for (const box of boxes) {
        let content;
        try { content = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ boxName: box.boxName, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const hints = extractHints(content);
        if (!hints || hints.length === 0) {
            verdicts.push({ boxName: box.boxName, class: 'no-hints', severity: null });
            continue;
        }
        // Only audit if at least one hint has helpLevel declared
        const declaredCount = hints.filter(h => h.helpLevel !== null).length;
        if (declaredCount === 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'no-help-level',
                severity: 'low',
                code: 'BOX-010-NO-HELP-LEVEL',
                hintCount: hints.length,
                message: 'Hints have no helpLevel field declared. Rule N/A — Help Level disclosure honesty cannot be audited.'
            });
            continue;
        }

        const underDisclosed = [];
        for (const h of hints) {
            if (h.helpLevel === null) continue;
            const score = measureSpecificity(h.text);
            const measured = scoreToLevel(score);
            if (measured - h.helpLevel >= 2) {
                underDisclosed.push({
                    id: h.id,
                    declared: h.helpLevel,
                    measured,
                    score,
                    textPreview: h.text.slice(0, 120) + (h.text.length > 120 ? '...' : '')
                });
            }
        }

        if (underDisclosed.length === 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'hints-honest',
                severity: null,
                hintCount: hints.length,
                declaredCount
            });
        } else {
            verdicts.push({
                boxName: box.boxName,
                class: 'hint-under-disclosed',
                severity: 'medium',
                code: 'BOX-010-HINT-UNDER-DISCLOSED',
                hintCount: hints.length,
                underDisclosed,
                message: `${underDisclosed.length} hint(s) declared at lower Help Level than their content specificity suggests. Students may be paying L<X> prices for L<X+2> answer-leak.`
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
        const hasFindings = v.class === 'hint-under-disclosed';
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

    const underDisc = verdicts.filter(v => v.class === 'hint-under-disclosed');
    const noHelpLevel = verdicts.filter(v => v.class === 'no-help-level');
    const honest = verdicts.filter(v => v.class === 'hints-honest');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-hint-help-level-lint',
        validatorCode: 'BOX-010',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            honest: honest.length,
            underDisclosed: underDisc.length,
            noHelpLevel: noHelpLevel.length,
            noHints: verdicts.filter(v => v.class === 'no-hints').length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: underDisc,
        infos: noHelpLevel,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-hint-help-level-lint (BOX-010)');
    console.log('====================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Hints honest:            ' + honest.length);
    console.log('  Under-disclosed (MEDIUM):' + underDisc.length);
    console.log('  No helpLevel (LOW):      ' + noHelpLevel.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (underDisc.length > 0) {
        console.log('---');
        console.log('UNDER-DISCLOSED (' + underDisc.length + ' boxes):');
        underDisc.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ':');
            v.underDisclosed.slice(0, 2).forEach(h => {
                console.log(`    ${h.id} declared L${h.declared} but measured L${h.measured} (score=${h.score})`);
            });
        });
    }

    if (REPORT_ONLY || underDisc.length === 0) process.exit(0);
    process.exit(1);
}

main();
