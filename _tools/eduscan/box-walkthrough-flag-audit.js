#!/usr/bin/env node
/**
 * EduScan — Box Walkthrough Flag Audit (BOX-002b)
 *
 * For each BoxEngine box that HAS a walkthrough (per BOX-002a), verify the
 * walkthrough documents flag values aligned with the box's scenarios.
 *
 * Why this rule matters:
 *   On 2026-05-22 the operator surfaced that 90 Dispatch boxes had walkthroughs
 *   that documented scenarios but no FLAG{} values. Students could read the
 *   walkthrough and learn the fix but had no canonical flag to submit and no
 *   source of truth to seed flag_registry from. BOX-002a catches missing
 *   walkthroughs entirely; BOX-002b catches walkthroughs that exist but are
 *   incomplete.
 *
 * Issue codes:
 *   BOX-002b-NO-FLAG-VALUES        Walkthrough has zero FLAG{} or flag{} matches
 *                                  but the box's config declares scenarios that
 *                                  need values.
 *   BOX-002b-FLAG-COUNT-MISMATCH   Walkthrough flag count differs from the number
 *                                  of scenarios in config. May indicate drift.
 *                                  Severity: medium (warning, not blocking).
 *
 * Detection logic per box:
 *   1. From BOX-002a's report: skip boxes that are missing-walkthrough or
 *      id-extract-failed (those are caught by BOX-002a).
 *   2. Resolve walkthrough .md path (if walkthrough is .docx, try .md sibling).
 *   3. Count FLAG{}/flag{} pattern matches in walkthrough body.
 *   4. Extract expected scenarioIds from config:
 *      - requestFlagText('id') calls (server-delivered subtype)
 *      - _scenarios array id fields (templated-dispatch subtype)
 *      - or just count config.flags[] entries (static subtype like user/root)
 *   5. Compare: zero flags in walkthrough but multiple expected scenarios -> CRITICAL.
 *      Mismatch count when both > 0 -> MEDIUM.
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-walkthrough-flag-audit.js [--report-only]
 *
 * Output:
 *   _tools/reports/BOX_WALKTHROUGH_FLAG_AUDIT.json
 *   stdout summary
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const WALKTHROUGH_REPORT = path.join(REPORTS_DIR, 'BOX_WALKTHROUGH_AUDIT.json');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_WALKTHROUGH_FLAG_AUDIT.json');

const SOLUTIONS_DIR = process.env.HEXWORTH_SOLUTIONS_DIR
    || path.join(os.homedir(), 'hexworth-shared', 'Solutions');

const REPORT_ONLY = process.argv.includes('--report-only');

// Match any `<prefix>{<body>}` flag pattern. Original only matched
// FLAG{} / flag{} but dispatch boxes use the box's own prefix
// (e.g., vpn001{ike_mismatch_...}, sec005{phish_...}, PISF{flag1}).
// Prefix = alphabetic/digit/underscore (starts with letter); body =
// alphanumeric + _ - : . (colon supports PIS-FINAL-style
// COBALT_STRIKE:CVE-2022-30190 payloads, dot for hostnames).
const FLAG_RE = /\b[a-zA-Z][a-zA-Z0-9_]*\{[a-zA-Z0-9_\-:.]+\}/g;
const REQUEST_FLAG_RE = /requestFlagText\(\s*['"]([^'"]+)['"]\s*\)/g;
const SCENARIO_ID_IN_BLOCK_RE = /id\s*:\s*['"]([a-z][a-z0-9_]*)['"]/g;
const FLAGS_ARRAY_RE = /^\s{4}flags\s*:\s*\[(.*?)^\s{4}\]/ms;
const FLAG_ID_RE = /id\s*:\s*['"]([a-zA-Z0-9_]+)['"]/g;

// Self-validation expectations (post-marathon state 2026-05-22).
// PIS-FINAL excluded — uses non-FLAG{} format (Message-ID, SHA256 hash, composite tokens)
// which this rule does not pattern-match. PIS-FINAL is a unique case; future rule layer
// could add format-flexible detection for it.
const SELF_VALIDATION = {
    'pis-m2-vault-breach':      { minExpectedFlagsInWalkthrough: 4 },  // FLAG{pis-m2-...}
    'nt003-slow-connection':    { minExpectedFlagsInWalkthrough: 5 }   // 5 scenarios just seeded via Class C marathon
};

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function countFlagsInWalkthrough(wtRelative) {
    if (!wtRelative) return { count: 0, file: null, reason: 'no walkthrough path' };
    let p = path.join(SOLUTIONS_DIR, wtRelative);
    if (!fs.existsSync(p)) return { count: 0, file: null, reason: 'walkthrough file not found' };

    // If .docx/.pdf, try .md sibling
    if (!/\.(md|txt)$/i.test(p)) {
        const mdSibling = p.replace(/\.[^./]+$/, '.md');
        if (fs.existsSync(mdSibling)) {
            p = mdSibling;
        } else {
            return { count: 0, file: p, reason: 'non-md walkthrough, no .md sibling' };
        }
    }

    try {
        const content = fs.readFileSync(p, 'utf8');
        const matches = content.match(FLAG_RE) || [];
        // Augment: PIS-FINAL-style walkthroughs use arbitrary flat strings
        // (e.g., `e.morales`, `COBALT_STRIKE:CVE-2022-30190`) which don't
        // fit any `prefix{body}` pattern. They live in a markdown table with
        // a "Flag value" column. Detect that table shape and count rows.
        const tableRows = countFlagValueTableRows(content);
        const totalCount = Math.max(matches.length, tableRows);
        return {
            count: totalCount,
            file: p,
            uniqueCount: new Set(matches).size || tableRows,
            patternMatchCount: matches.length,
            tableRowCount: tableRows
        };
    } catch (e) {
        return { count: 0, file: p, reason: 'read error: ' + e.message };
    }
}

// Detect a markdown table with a "Flag value" column header and count
// its non-empty data rows. Used for walkthroughs whose flags are flat
// strings (PIS-FINAL style: message-ids, hostnames, codewords).
function countFlagValueTableRows(content) {
    const lines = content.split('\n');
    let inFlagTable = false;
    let flagColIdx = -1;
    let rows = 0;
    for (const line of lines) {
        if (!line.trim().startsWith('|')) {
            if (inFlagTable && line.trim() === '') { /* blank row tolerable */ continue; }
            if (inFlagTable) inFlagTable = false;
            continue;
        }
        const cells = line.split('|').map(c => c.trim());
        if (!inFlagTable) {
            // Look for a header row with a "Flag value" / "Flag Value" cell
            const headerIdx = cells.findIndex(c => /^flag\s+value$/i.test(c));
            if (headerIdx !== -1) {
                inFlagTable = true;
                flagColIdx = headerIdx;
            }
            continue;
        }
        // Skip the separator row (---|---|---)
        if (cells.every(c => /^[-:]*$/.test(c))) continue;
        // Data row — has a non-empty cell at flagColIdx
        if (flagColIdx < cells.length && cells[flagColIdx] && cells[flagColIdx] !== '—') {
            rows++;
        }
    }
    return rows;
}

function extractScenariosBlock(content) {
    const m = content.match(/_scenarios\s*:\s*\[/);
    if (!m) return null;
    let start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < content.length && depth > 0) {
        const c = content[i];
        if (c === '[') depth++;
        else if (c === ']') depth--;
        i++;
    }
    return depth === 0 ? content.substring(start, i - 1) : null;
}

function expectedFlagCount(configPath) {
    if (!fs.existsSync(configPath)) return { count: 0, source: 'no config' };
    let content;
    try { content = fs.readFileSync(configPath, 'utf8'); }
    catch (e) { return { count: 0, source: 'read error' }; }

    // 1. requestFlagText('id') count
    const reqFlags = new Set();
    let m;
    const reqRe = new RegExp(REQUEST_FLAG_RE.source, 'g');
    while ((m = reqRe.exec(content)) !== null) reqFlags.add(m[1]);
    if (reqFlags.size > 0) return { count: reqFlags.size, source: 'requestFlagText' };

    // 2. _scenarios block scenarioIds
    const block = extractScenariosBlock(content);
    if (block) {
        const scnIds = new Set();
        const re = new RegExp(SCENARIO_ID_IN_BLOCK_RE.source, 'g');
        while ((m = re.exec(block)) !== null) scnIds.add(m[1]);
        if (scnIds.size > 0) return { count: scnIds.size, source: '_scenarios array' };
    }

    // 3. flags: [] top-level count
    const fm = content.match(FLAGS_ARRAY_RE);
    if (fm) {
        const flagBlock = fm[1];
        const flagIds = new Set();
        const re = new RegExp(FLAG_ID_RE.source, 'g');
        while ((m = re.exec(flagBlock)) !== null) flagIds.add(m[1]);
        if (flagIds.size > 0) return { count: flagIds.size, source: 'flags array' };
    }

    return { count: 0, source: 'no flag declarations found' };
}

function main() {
    const startMs = Date.now();

    if (!fs.existsSync(WALKTHROUGH_REPORT)) {
        console.error('FATAL: BOX-002a report not found. Run box-walkthrough-audit.js first.');
        process.exit(99);
    }

    const wtReport = readJSON(WALKTHROUGH_REPORT);
    const candidates = wtReport.verdicts.filter(v => v.class === 'has-walkthrough');
    if (candidates.length === 0) {
        console.error('FATAL: no boxes with walkthroughs found. Run BOX-002a first.');
        process.exit(99);
    }

    const verdicts = [];
    for (const v of candidates) {
        const wtInfo = countFlagsInWalkthrough(v.walkthrough);
        const configPath = path.join(ROOT, v.relDir.replace(/\/?$/, '/'), 'config.js');
        const expected = expectedFlagCount(configPath);

        let cls, severity, code, message;
        if (wtInfo.reason === 'non-md walkthrough, no .md sibling') {
            cls = 'docx-only-cant-audit';
            severity = 'low';
            code = 'BOX-002b-DOCX-ONLY';
            message = `Walkthrough is .docx with no .md sibling — content cannot be auto-audited. Manual review only.`;
        } else if (wtInfo.count === 0 && expected.count > 0) {
            cls = 'no-flag-values';
            severity = 'critical';
            code = 'BOX-002b-NO-FLAG-VALUES';
            message = `Walkthrough has zero FLAG{}/flag{} matches but config declares ${expected.count} scenarios (source: ${expected.source}). Box-flag value design step incomplete.`;
        } else if (wtInfo.count > 0 && expected.count > 0 && wtInfo.uniqueCount < expected.count) {
            cls = 'flag-count-mismatch';
            severity = 'medium';
            code = 'BOX-002b-FLAG-COUNT-MISMATCH';
            message = `Walkthrough has ${wtInfo.uniqueCount} unique flag values but config declares ${expected.count} scenarios (source: ${expected.source}). Possible drift between walkthrough and config.`;
        } else {
            cls = 'has-flag-values';
            severity = null;
        }

        verdicts.push({
            boxName: v.boxName,
            relDir: v.relDir,
            walkthrough: v.walkthrough,
            walkthroughFlagCount: wtInfo.count,
            walkthroughUniqueFlagCount: wtInfo.uniqueCount,
            expectedScenarioCount: expected.count,
            expectedSource: expected.source,
            class: cls,
            severity,
            code,
            message
        });
    }

    // Self-validation
    const failures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) { failures.push({ box, reason: 'not found in BOX-002a report' }); continue; }
        if (v.walkthroughFlagCount < exp.minExpectedFlagsInWalkthrough) {
            failures.push({
                box, reason: `walkthrough flag count too low`,
                expected: '>=' + exp.minExpectedFlagsInWalkthrough,
                got: v.walkthroughFlagCount
            });
        }
    }
    if (failures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of failures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const critical = verdicts.filter(v => v.severity === 'critical');
    const medium = verdicts.filter(v => v.severity === 'medium');
    const docxOnly = verdicts.filter(v => v.class === 'docx-only-cant-audit');
    const ok = verdicts.filter(v => v.class === 'has-flag-values');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-walkthrough-flag-audit',
        validatorCode: 'BOX-002b',
        scope: { input: 'BOX-002a report has-walkthrough verdicts' },
        totals: {
            boxesAudited: candidates.length,
            hasFlagValues: ok.length,
            noFlagValues: critical.length,
            flagCountMismatch: medium.length,
            docxOnly: docxOnly.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: failures.length, verdict: 'PASS' },
        findings: verdicts.filter(v => v.severity !== null && v.severity !== 'low'),
        docxOnly: docxOnly.map(v => v.boxName),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-walkthrough-flag-audit (BOX-002b)');
    console.log('=======================================');
    console.log('  Boxes audited:           ' + candidates.length);
    console.log('  Has flag values:         ' + ok.length);
    console.log('  CRITICAL (no values):    ' + critical.length);
    console.log('  MEDIUM (count mismatch): ' + medium.length);
    console.log('  Low (docx-only):         ' + docxOnly.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (critical.length > 0) {
        console.log('---');
        console.log('CRITICAL — Walkthroughs with no flag values:');
        critical.slice(0, 15).forEach(v => {
            console.log('  ' + v.boxName + ' (expected ' + v.expectedScenarioCount + ' from ' + v.expectedSource + ')');
        });
        if (critical.length > 15) console.log('  ... and ' + (critical.length - 15) + ' more');
    }
    if (medium.length > 0) {
        console.log('---');
        console.log('MEDIUM — Walkthrough/config count drift:');
        medium.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ': wt=' + v.walkthroughUniqueFlagCount + ' / config=' + v.expectedScenarioCount);
        });
        if (medium.length > 10) console.log('  ... and ' + (medium.length - 10) + ' more');
    }

    if (REPORT_ONLY || critical.length === 0) process.exit(0);
    process.exit(1);
}

main();
