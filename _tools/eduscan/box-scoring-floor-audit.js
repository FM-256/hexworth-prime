#!/usr/bin/env node
/**
 * EduScan — Box Scoring-Floor Audit (BOX-005)
 *
 * For every BoxEngine-driven box, verify that the config's `scoring`
 * block declares a `minScore` field set to a non-negative value (≥ 0).
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 1 (2026-05-21) BLOCK finding:
 *
 *     "Worst-case path math:
 *       Base: 1500, Max scored: 750 (Eclipse cap)
 *       7 hints × 150 = -1,050
 *       14 wrong-flag submissions × 40 = -560
 *       Final: 750 - 1050 - 560 = -860
 *
 *      The walkthrough doesn't state whether the minimum score is 0 or
 *      negative. A slow-but-correct student who uses hints and makes
 *      wrong attempts could finish with a negative score for the exam."
 *
 *   The fix was to add `scoring.minScore: 0` and document the floor
 *   in the metadata table + Section 12 worst-case math.
 *
 *   This rule prevents that defect from recurring on any future BoxEngine
 *   box. Without an explicit floor, the engine has no defined behavior
 *   for negative scores — display layer might show "-860" to a student
 *   who completed the lab, or score may be clamped silently and the
 *   student is confused about why penalties don't add up to the displayed
 *   score.
 *
 * Issue codes:
 *   BOX-005-MISSING-MINSCORE       Config has a scoring block but no
 *                                  minScore field. Severity: MEDIUM
 *                                  (operator-set; defaults to engine's
 *                                  fallback behavior, which is unspecified).
 *   BOX-005-NEGATIVE-MINSCORE      minScore is set but negative. Severity:
 *                                  HIGH (explicit declaration that score
 *                                  may go negative — likely an error).
 *   BOX-005-NO-SCORING-BLOCK       Config has no scoring block at all.
 *                                  Severity: HIGH (engine cannot compute
 *                                  scores).
 *
 * Detection logic per box:
 *   1. Find the BoxEngine config (any directory with index.html invoking
 *      BoxEngine.init AND a sibling config.js).
 *   2. Locate `scoring:` block via balanced brace counting.
 *   3. Inside the block, look for `minScore:` field.
 *   4. Parse value: positive int / zero / negative int / non-numeric.
 *   5. Emit finding per the matrix above.
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-scoring-floor-audit.js [--report-only]
 *
 * Output:
 *   _tools/reports/BOX_SCORING_FLOOR_AUDIT.json
 *   stdout summary
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_SCORING_FLOOR_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Self-validation: both PIS-FINAL and PIS-M2 should PASS after the 2026-05-22
// systemic backfill that added minScore: 0 to all 255 boxes that lacked it.
// Initial state had PIS-M2 missing minScore; post-backfill it has minScore: 0.
const SELF_VALIDATION = {
    'pis-final-patient-zero':   { expectedCode: null, reason: 'set in Nancy round 1 fix; PASS' },
    'pis-m2-vault-breach':      { expectedCode: null, reason: 'backfilled 2026-05-22; PASS' }
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
        const fileNames = entries.filter(e => e.isFile()).map(e => e.name);
        if (fileNames.includes('index.html') && fileNames.includes('config.js')) {
            const indexFile = path.join(d, 'index.html');
            try {
                const idx = fs.readFileSync(indexFile, 'utf8');
                if (/BoxEngine\.init/.test(idx)) {
                    out.push({
                        dir: d,
                        relDir: path.relative(ROOT, d) + path.sep,
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
 * Extract the contents of `scoring:` block from config content.
 * Uses brace counting to handle nested braces. Returns the inner text
 * (between the opening { and matching }), or null if not found.
 */
function extractScoringBlock(content) {
    const m = content.match(/scoring\s*:\s*\{/);
    if (!m) return null;
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < content.length && depth > 0) {
        const c = content[i];
        if (c === '{') depth++;
        else if (c === '}') depth--;
        i++;
    }
    return depth === 0 ? content.substring(start, i - 1) : null;
}

/**
 * Parse minScore value from a scoring block.
 * Returns:
 *   { found: true, value: <number> } if present and numeric
 *   { found: true, value: null, raw: <string> } if present but non-numeric
 *   { found: false } if not present
 */
function parseMinScore(scoringBlock) {
    const m = scoringBlock.match(/minScore\s*:\s*([^,\n}]+)/);
    if (!m) return { found: false };
    const raw = m[1].trim();
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return { found: true, value: null, raw };
    return { found: true, value: num };
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
            verdicts.push({
                boxName: box.boxName,
                configFile: path.relative(ROOT, box.configFile),
                class: 'unreadable',
                severity: 'medium',
                error: e.message
            });
            continue;
        }

        const scoringBlock = extractScoringBlock(content);
        if (scoringBlock === null) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'no-scoring-block',
                severity: 'high',
                code: 'BOX-005-NO-SCORING-BLOCK',
                message: `Config has no scoring: {} block. Engine cannot compute scores for this box.`,
                fix: `Add a scoring block with base, maxScore, hintPenalty, wrongFlagPenalty, and minScore.`
            });
            continue;
        }

        const minScore = parseMinScore(scoringBlock);
        if (!minScore.found) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'missing-minscore',
                severity: 'medium',
                code: 'BOX-005-MISSING-MINSCORE',
                message: `Config has scoring block but no minScore field. Worst-case scoring path could go negative; behavior unspecified.`,
                fix: `Add 'minScore: 0' to the scoring block (or non-zero floor if scenario allows negative scores).`
            });
            continue;
        }
        if (minScore.value === null) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'non-numeric-minscore',
                severity: 'medium',
                code: 'BOX-005-NON-NUMERIC-MINSCORE',
                message: `minScore field is present but non-numeric: '${minScore.raw}'. Expected an integer.`,
                fix: `Set minScore to an integer (typically 0).`
            });
            continue;
        }
        if (minScore.value < 0) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'negative-minscore',
                severity: 'high',
                code: 'BOX-005-NEGATIVE-MINSCORE',
                message: `minScore is explicitly negative (${minScore.value}). Likely an error unless the box intentionally allows negative scores.`,
                fix: `Set minScore to 0 unless negative scoring is required.`,
                value: minScore.value
            });
            continue;
        }

        verdicts.push({
            boxName: box.boxName,
            relDir: box.relDir,
            class: 'ok',
            severity: null,
            value: minScore.value
        });
    }

    // Self-validation gate
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not discovered' });
            continue;
        }
        const actualCode = v.code || null;
        if (actualCode !== exp.expectedCode) {
            selfFailures.push({
                box,
                reason: `expected ${exp.expectedCode || 'OK'}, got ${actualCode || 'OK'}`,
                expected: exp.expectedCode,
                got: actualCode,
                note: exp.reason
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const ok = verdicts.filter(v => v.class === 'ok');
    const missing = verdicts.filter(v => v.class === 'missing-minscore');
    const negative = verdicts.filter(v => v.class === 'negative-minscore');
    const noScoring = verdicts.filter(v => v.class === 'no-scoring-block');
    const nonNumeric = verdicts.filter(v => v.class === 'non-numeric-minscore');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-scoring-floor-audit',
        validatorCode: 'BOX-005',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            ok: ok.length,
            missingMinScore: missing.length,
            negativeMinScore: negative.length,
            noScoringBlock: noScoring.length,
            nonNumericMinScore: nonNumeric.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: verdicts.filter(v => v.severity !== null),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-scoring-floor-audit (BOX-005)');
    console.log('==================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  OK (minScore set, ≥0):   ' + ok.length);
    console.log('  MISSING minScore:        ' + missing.length);
    console.log('  Negative minScore:       ' + negative.length);
    console.log('  Non-numeric minScore:    ' + nonNumeric.length);
    console.log('  No scoring block:        ' + noScoring.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (missing.length > 0) {
        console.log('---');
        console.log('MISSING minScore (' + missing.length + ' boxes — preview):');
        missing.slice(0, 10).forEach(v => console.log('  ' + v.boxName));
        if (missing.length > 10) console.log('  ... and ' + (missing.length - 10) + ' more (see JSON report)');
    }
    if (negative.length > 0) {
        console.log('---');
        console.log('NEGATIVE minScore (' + negative.length + ' boxes):');
        negative.forEach(v => console.log('  ' + v.boxName + ' = ' + v.value));
    }

    if (REPORT_ONLY || (missing.length === 0 && negative.length === 0 && noScoring.length === 0)) process.exit(0);
    process.exit(1);
}

main();
