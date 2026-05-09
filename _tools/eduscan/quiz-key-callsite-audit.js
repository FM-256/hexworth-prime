#!/usr/bin/env node
/**
 * EduScan — Quiz-Key Callsite Audit (XREF-002)
 *
 * Detects orphan entries in functions/quiz_keys.json — quiz IDs that no
 * HTML file under _app/ references. These are usually post-deprecation
 * phantom keys: a quiz was removed from a course (e.g., commit ec3056f0
 * stripped per-chapter quizzes from eth-01..eth-15) but its quiz_keys
 * registration was never cleaned up, leaving unreachable Firestore
 * documents and a static registry entry that pollutes drift audits.
 *
 * Real-world example (2026-05-08, tick 26): Sub-class 2 of placeholder-
 * drift-audit.js flagged 13 eth-NN-quiz IDs as FIRESTORE-NEWER drift.
 * Adversarial review caught that all 15 eth-01..eth-15-quiz IDs have
 * zero HTML callsites — they are orphans. A naive "reverse-seed"
 * remediation would have laundered phantom data into the static
 * registry. This validator catches the pattern automatically.
 *
 * Issue codes:
 *  - XREF-002: quiz_keys.json entry has zero HTML callsites in _app/
 *
 * Scope:
 *  - INPUT:   functions/quiz_keys.json (all keys)
 *  - SCANNED: _app/**\/*.html only (HTML scope verified — no gradeQuiz
 *             call sites exist outside _app/ at the time of writing)
 *  - SKIPPED: _app/**\/*.js (no bulk-ID registry exists in JS;
 *             scanning JS would risk false-live readings from any
 *             future config file)
 *  - SKIPPED: functions/ (those scripts are maintenance tooling,
 *             not student-facing grading flow)
 *
 * Read-only. No edits. No Firestore. No production write. No master gate.
 *
 * Usage:
 *   node _tools/eduscan/quiz-key-callsite-audit.js
 *
 * Output:
 *   _tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json — per-orphan findings
 *   stdout — summary + alphabetical orphan list
 *
 * Exit codes:
 *   0 always. This is a report generator, not a deploy gate. Severity
 *   medium per finding; let Nexus gate config decide whether to block.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const KEYS_FILE = path.join(ROOT, 'functions/quiz_keys.json');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'QUIZ_KEY_CALLSITE_AUDIT.json');

// Self-validation: these 15 IDs are the confirmed orphan set from tick 26
// (commit ec3056f0 removed embedded chapter quizzes from eth-01..eth-15
// without cleaning up quiz_keys.json + Firestore). If the tool reports
// fewer than these, the regex is broken or scope is wrong.
const KNOWN_ORPHANS = [
    'eth-01-quiz', 'eth-02-quiz', 'eth-03-quiz', 'eth-04-quiz', 'eth-05-quiz',
    'eth-06-quiz', 'eth-07-quiz', 'eth-08-quiz', 'eth-09-quiz', 'eth-10-quiz',
    'eth-11-quiz', 'eth-12-quiz', 'eth-13-quiz', 'eth-14-quiz', 'eth-15-quiz',
];

// Pin escape mechanism — Nancy review concern #1. Quiz IDs today contain
// only [a-zA-Z0-9-], but pinning the escape spec defends against future IDs
// that introduce regex meta chars.
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function listHtmlFiles(dir) {
    const out = [];
    const stack = [dir];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try {
            entries = fs.readdirSync(d, { withFileTypes: true });
        } catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            const full = path.join(d, e.name);
            if (e.isDirectory()) { stack.push(full); }
            else if (e.isFile() && e.name.endsWith('.html')) { out.push(full); }
        }
    }
    return out;
}

function main() {
    const startMs = Date.now();

    // --- Load quiz_keys.json ---
    let keys;
    try {
        keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    } catch (e) {
        console.error('FATAL: cannot read ' + KEYS_FILE + ': ' + e.message);
        process.exit(99);
    }
    const ids = Object.keys(keys);
    if (ids.length === 0) {
        console.error('FATAL: quiz_keys.json contains zero IDs — refusing to proceed.');
        process.exit(99);
    }

    // --- Build single-pass alternation regex ---
    // The bidirectional negative lookarounds are LOAD-BEARING for prefix-
    // collision safety. quiz_keys today contains 11 prefix collisions
    // (e.g., aplus-core2 vs aplus-core2-applet). \b alone is insufficient
    // because hyphens are \W and \b fires at hyphen boundaries; without
    // the lookaheads, "aplus-core2" would match inside "aplus-core2-applet"
    // and over-count. DO NOT remove the lookarounds — they are not vestigial.
    const escaped = ids.map(escapeRegex);
    const pattern = new RegExp(
        '(?<![a-zA-Z0-9_-])(' + escaped.join('|') + ')(?![a-zA-Z0-9_-])',
        'g'
    );

    // --- Scan _app/ HTML ---
    const counts = Object.create(null);
    for (const id of ids) counts[id] = 0;

    const htmlFiles = listHtmlFiles(APP_DIR);
    let bytesScanned = 0;
    for (const file of htmlFiles) {
        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch (e) { continue; }
        bytesScanned += content.length;
        for (const m of content.matchAll(pattern)) {
            counts[m[1]]++;
        }
    }

    // --- Classify ---
    const orphans = ids.filter(id => counts[id] === 0).sort();
    const findings = orphans.map(id => ({
        code: 'XREF-002',
        severity: 'medium',
        category: 'xref',
        quizId: id,
        file: 'functions/quiz_keys.json',
        message: `Orphan quiz_keys entry: '${id}' has 0 HTML callsites in _app/ — likely post-deprecation phantom (or never-built quiz)`,
        fix: `Investigate: was the quiz removed/never-built? If yes, schedule deletion (Firestore doc + static entry) under Nancy + operator review. If no, locate missing HTML grading callsite.`,
    }));

    // --- Self-validation gate (Nancy concern #2: per-ID, not count) ---
    // KNOWN_ORPHANS must each appear in the result. Failure here means the
    // regex/scope is broken; do not write a corrupt report.
    const missingFromOrphans = KNOWN_ORPHANS.filter(id => !orphans.includes(id));
    if (missingFromOrphans.length > 0) {
        console.error('SELF-VALIDATION FAILURE: known orphans missing from result:');
        for (const id of missingFromOrphans) {
            console.error('  ' + id + ' counted ' + counts[id] + ' times (expected 0)');
        }
        console.error('Refusing to write report. Investigate scope/regex.');
        process.exit(2);
    }

    // --- Output ---
    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'quiz-key-callsite-audit',
        validatorCode: 'XREF-002',
        scope: { input: 'functions/quiz_keys.json', scanned: '_app/**/*.html' },
        totals: {
            totalKeys: ids.length,
            orphanCount: orphans.length,
            liveCount: ids.length - orphans.length,
            htmlFilesScanned: htmlFiles.length,
            bytesScanned,
            durationMs: Date.now() - startMs,
        },
        knownOrphansVerified: KNOWN_ORPHANS.every(id => orphans.includes(id)),
        orphanIds: orphans,
        findings,
    };

    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    // --- Stdout summary ---
    console.log('quiz-key-callsite-audit (XREF-002)');
    console.log('===================================');
    console.log('  Total quiz_keys entries:   ' + ids.length);
    console.log('  HTML files scanned:        ' + htmlFiles.length);
    console.log('  ORPHAN (0 callsites):      ' + orphans.length);
    console.log('  Live (>=1 callsite):       ' + (ids.length - orphans.length));
    console.log('  Self-validation:           ' + (report.knownOrphansVerified ? 'PASS' : 'FAIL'));
    console.log('  Duration:                  ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                    ' + path.relative(ROOT, OUT_FILE));
    if (orphans.length > 0) {
        console.log('---');
        console.log('Orphan IDs (alphabetical):');
        for (const id of orphans) console.log('  ' + id);
    }
}

main();
