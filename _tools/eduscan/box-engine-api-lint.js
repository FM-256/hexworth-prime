#!/usr/bin/env node
/**
 * EduScan — Box Engine API Correctness Lint (BOX-003)
 *
 * Static lint for box configs that call BoxEngine API methods or access
 * BoxEngine state properties that do NOT exist on the engine.
 *
 * Why this rule matters:
 *   During PIS-FINAL build (2026-05-22), the interactive-code-architect
 *   subagent self-caught two bugs during post-write review:
 *
 *     "Line 1501: engine.subtractPoints(40) — method does not exist on
 *      BoxEngine. Replaced with engine.addScore(-40, 'Wrong patch action')."
 *     "Line 2020: engine.submittedFlags || {} — BoxEngine tracks flag
 *      state as engine.state.flagsFound (array), not a keyed object."
 *
 *   Both were silent failures — the calls would have thrown TypeError at
 *   runtime ("engine.subtractPoints is not a function") visible only in
 *   the browser console while students experienced unexplained behavior.
 *
 *   This rule prevents that class of bug for future boxes. It uses
 *   pattern-matching against:
 *     1. A KNOWN_INVALID list — specific names that are NOT valid API
 *        but are easy mistakes (typo-prone, similar to real methods).
 *     2. A SUSPICIOUS list — uncommon names that warrant manual review.
 *
 * Issue codes:
 *   BOX-003-NONEXISTENT-API     Config calls engine.<name> where <name>
 *                               is in the known-invalid list. Severity: HIGH.
 *   BOX-003-SUSPICIOUS-API      Config calls engine.<name> where <name>
 *                               is uncommon — possible typo. Severity: MEDIUM.
 *
 * Read-only. No edits.
 *
 * Usage:
 *   node _tools/eduscan/box-engine-api-lint.js [--report-only]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_ENGINE_API_LINT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Known-invalid: names that look like API calls but aren't, with a
// specific real-method suggestion. Updates as new mistakes are discovered.
const KNOWN_INVALID = {
    'subtractPoints':    { suggest: 'addScore(<negative>)', reason: 'method does not exist; use addScore(-N, reason)' },
    'submittedFlags':    { suggest: 'state.flagsFound',     reason: 'flag-capture state is engine.state.flagsFound (array), not engine.submittedFlags' },
    'addPoints':         { suggest: 'addScore(<positive>)', reason: 'method does not exist; use addScore(+N, reason)' },
    'awardPoints':       { suggest: 'addScore(<positive>)', reason: 'method does not exist; use addScore(N, reason)' },
    'incrementScore':    { suggest: 'addScore(<delta>)',    reason: 'method does not exist; use addScore(delta, reason)' },
    'penalize':          { suggest: 'addScore(<negative>)', reason: 'method does not exist; use addScore(-N, reason)' },
    'completeFlag':      { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'captureFlag':       { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'grantFlag':         { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'completionLogs':    { suggest: '_logEvent("complete", ...)', reason: 'no such property; use engine._logEvent for event log' },
    'getScore':          { suggest: 'state.score',          reason: 'access engine.state.score directly' },
    'setScore':          { suggest: 'addScore(<delta>)',    reason: 'use relative addScore; absolute setter is not exposed' }
};

// Suspicious list: emptied after initial run revealed the entries below were
// all false positives:
//   - engine.reset: valid BoxEngine method (line 481 of BoxEngine.js)
//   - engine.log: filename in simulated filesystem (e.g., F1 box has
//     /var/log/veritas/engine.log entry), not an engine method call
//   - engine.py: filename in simulated filesystem (Python file refs),
//     not an engine method call
// Keep SUSPICIOUS empty until a real recurring false-negative pattern emerges.
const SUSPICIOUS = {};

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
                        relDir: path.relative(ROOT, d) + path.sep,
                        configFile: path.join(d, 'config.js')
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

function lintConfig(content) {
    const findings = [];
    // Match engine.<name>( or engine.<name> when accessed as property
    // The negative lookbehind (?<![_$\w]) prevents matching things like
    // myEngine.X — only "engine.X" exactly.
    const re = /(?<![_$\w])engine\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let m;
    const counts = {};
    while ((m = re.exec(content)) !== null) {
        const name = m[1];
        counts[name] = (counts[name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(counts)) {
        if (KNOWN_INVALID[name]) {
            findings.push({
                type: 'invalid',
                code: 'BOX-003-NONEXISTENT-API',
                severity: 'high',
                accessName: name,
                count,
                suggest: KNOWN_INVALID[name].suggest,
                reason: KNOWN_INVALID[name].reason
            });
        } else if (SUSPICIOUS[name]) {
            findings.push({
                type: 'suspicious',
                code: 'BOX-003-SUSPICIOUS-API',
                severity: 'medium',
                accessName: name,
                count,
                reason: SUSPICIOUS[name].reason
            });
        }
    }
    return findings;
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
        const findings = lintConfig(content);
        if (findings.length === 0) {
            verdicts.push({ boxName: box.boxName, relDir: box.relDir, class: 'clean', severity: null });
        } else {
            const hasHigh = findings.some(f => f.severity === 'high');
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'has-findings',
                severity: hasHigh ? 'high' : 'medium',
                findings
            });
        }
    }

    const high = verdicts.filter(v => v.severity === 'high');
    const medium = verdicts.filter(v => v.severity === 'medium' && v.class !== 'unreadable');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-engine-api-lint',
        validatorCode: 'BOX-003',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        knownInvalidList: Object.keys(KNOWN_INVALID),
        suspiciousList: Object.keys(SUSPICIOUS),
        totals: {
            boxesScanned: boxes.length,
            clean: verdicts.filter(v => v.class === 'clean').length,
            high: high.length,
            medium: medium.length,
            durationMs: Date.now() - startMs
        },
        findings: verdicts.filter(v => v.severity !== null && v.class !== 'unreadable'),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-engine-api-lint (BOX-003)');
    console.log('==============================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Clean:                   ' + (boxes.length - high.length - medium.length));
    console.log('  HIGH (invalid API):      ' + high.length);
    console.log('  MEDIUM (suspicious):     ' + medium.length);
    console.log('  Known-invalid list size: ' + Object.keys(KNOWN_INVALID).length);
    console.log('  Suspicious list size:    ' + Object.keys(SUSPICIOUS).length);
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (high.length > 0) {
        console.log('---');
        console.log('HIGH — nonexistent API calls:');
        high.forEach(v => {
            v.findings.filter(f => f.severity === 'high').forEach(f => {
                console.log('  ' + v.boxName + ' uses engine.' + f.accessName + ' (' + f.count + 'x) — ' + f.reason);
                console.log('    suggest: engine.' + f.suggest);
            });
        });
    }
    if (medium.length > 0) {
        console.log('---');
        console.log('MEDIUM — suspicious API calls:');
        medium.forEach(v => {
            v.findings.filter(f => f.severity === 'medium').forEach(f => {
                console.log('  ' + v.boxName + ' uses engine.' + f.accessName + ' (' + f.count + 'x) — ' + f.reason);
            });
        });
    }

    if (REPORT_ONLY || high.length === 0) process.exit(0);
    process.exit(1);
}

main();
