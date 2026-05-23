#!/usr/bin/env node
/**
 * EduScan — Box localStorage Flag-Bypass Detection (BOX-037)
 *
 * Detects boxes whose config.js writes flag-capture state directly to
 * localStorage, bypassing the server-side validateFlag bridge. This is
 * a security regression — any student with DevTools can write the same
 * keys to mark themselves as having captured all flags without
 * actually solving anything.
 *
 * Why this rule matters:
 *   The platform's flag-bridge invariant is: a student can only get
 *   flag-capture credit by submitting a value that the server
 *   (validateFlag CF) confirms matches the registry. Anything else is
 *   a bypass — the student bypasses the server, marks themselves
 *   captured client-side, and inherits the points, achievements, and
 *   completion state.
 *
 *   BoxEngine itself uses localStorage to PERSIST state — that's fine,
 *   because the state was earned through the server. The defect class
 *   is configs that SHORT-CIRCUIT the bridge by writing capture flags
 *   to localStorage outside the engine's own award path.
 *
 * Detection:
 *   For each BoxEngine config.js, look for `localStorage.setItem(...)`
 *   calls whose ARGUMENTS contain suspicious flag-related vocabulary:
 *       captured, flagsFound, completed, win, victory, solved,
 *       flag_*, *_flag, ctf_*
 *   AND are not the engine's well-known persistence calls
 *   (engine.save/load handles its own state object).
 *
 *   Detection is heuristic — false positives possible. Classified as
 *   informational on the deploy gate; operator confirms per finding.
 *
 * Issue code:
 *   BOX-037-LOCALSTORAGE-FLAG-BYPASS
 *       config.js contains localStorage.setItem with arguments that
 *       suggest direct flag-capture state mutation outside the
 *       engine's normal award path. Severity: HIGH (security regression
 *       if confirmed; informational on gate for operator triage).
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — MUST have 0 findings (no localStorage
 *                              flag-bypass writes; engine handles state).
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_LOCALSTORAGE_FLAG_BYPASS.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Match localStorage.setItem(...,...). We capture the full call arguments
// (between the parens) for vocabulary inspection.
const SETITEM_RE = /localStorage\s*\.\s*setItem\s*\(([^)]{0,500})\)/g;

// Suspicious vocabulary inside the setItem args
const FLAG_VOCAB_RE = /\b(captured|flagsFound|completed|victory|won|win|solved|claimed)\b|flag_|_flag|\bctf_/i;

// Whitelist patterns — the engine's own state persistence uses
// storageKey-based writes that are legitimate. Patterns whose value is
// purely a JSON.stringify of the engine state object are benign.
const ENGINE_STATE_WHITELIST_RE = /JSON\s*\.\s*stringify\s*\(\s*(?:this\.)?state\b/;

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectFindings: 0 }
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

function lineNumberAt(content, idx) {
    return (content.slice(0, idx).match(/\n/g) || []).length + 1;
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
        const hits = [];
        SETITEM_RE.lastIndex = 0;
        let m;
        while ((m = SETITEM_RE.exec(cfg)) !== null) {
            const callArgs = m[1];
            if (!FLAG_VOCAB_RE.test(callArgs)) continue;
            if (ENGINE_STATE_WHITELIST_RE.test(callArgs)) continue;
            hits.push({
                line: lineNumberAt(cfg, m.index),
                snippet: callArgs.trim().slice(0, 150).replace(/\s+/g, ' ')
            });
        }
        if (hits.length === 0) {
            verdicts.push({ dirname: box.dirname, class: 'clean', severity: null });
        } else {
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: 'suspicious',
                severity: 'high',
                code: 'BOX-037-LOCALSTORAGE-FLAG-BYPASS',
                hitCount: hits.length,
                hits: hits.slice(0, 10),
                message: 'config.js writes flag-capture-shaped state to localStorage outside the engine award path. Bypasses the server-side validateFlag bridge.',
                fix: 'Replace direct localStorage writes with engine.awardFlag(flagId) or remove if defensive client-side persistence was intended (then use a non-flag key name).'
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered' }); continue; }
        const got = v.hitCount || 0;
        if (got !== exp.expectFindings) {
            selfFailures.push({ box: dn, expected: 'findings='+exp.expectFindings, got, sample: (v.hits||[]).slice(0, 2) });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const suspicious = verdicts.filter(v => v.class === 'suspicious');
    const clean = verdicts.filter(v => v.class === 'clean');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-localstorage-flag-bypass',
        validatorCode: 'BOX-037',
        scope: { input: '_app/**/config.js — localStorage.setItem with flag-shaped arguments' },
        totals: {
            boxesScanned: boxes.length,
            clean: clean.length,
            suspicious: suspicious.length,
            totalHits: suspicious.reduce((a, v) => a + v.hitCount, 0),
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: suspicious,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-localstorage-flag-bypass (BOX-037)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Clean:                   ' + clean.length);
    console.log('  Suspicious (HIGH):       ' + suspicious.length);
    console.log('  Total hits:              ' + suspicious.reduce((a, v) => a + v.hitCount, 0));
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (suspicious.length > 0) {
        console.log('---');
        console.log('Suspicious localStorage flag writes (' + suspicious.length + ' boxes — operator review):');
        suspicious.slice(0, 15).forEach(v => {
            console.log('  ' + v.dirname + ' [' + v.hitCount + ' hits]');
            v.hits.slice(0, 1).forEach(h => console.log('    L' + h.line + ': setItem(' + h.snippet + ')'));
        });
        if (suspicious.length > 15) console.log('  ... and ' + (suspicious.length - 15) + ' more');
    }

    if (REPORT_ONLY || suspicious.length === 0) process.exit(0);
    process.exit(1);
}

main();
