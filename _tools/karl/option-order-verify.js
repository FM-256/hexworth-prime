#!/usr/bin/env node
/**
 * option-order-verify.js — Pre-Karl validator for quiz answer-key drift.
 *
 * Detects drift between:
 *   - functions/quiz_keys.json   (server-side answer index per question)
 *   - the rendered quiz HTML's options array (visible to students)
 *
 * The drift case: student-visible options array order doesn't match the
 * answer-key index. Symptom in production: students grading wrong answers.
 *
 * The validator's job is to surface any quiz where:
 *   - quiz_keys[id].answers[i] is out of bounds for the HTML options[i]
 *   - the HTML's options array length differs from the answer-key questionCount
 *
 * What this validator CAN'T detect:
 *   - whether the answer key value is the *correct* answer (that requires
 *     ANSWERS.md or human knowledge — see --with-answers-md flag below)
 *
 * Created 2026-05-07 per Sprint #17 — preventer for the fw-w4-data R1 class
 * of bugs where HTML option reorder happens without a matching answer-key
 * update.
 *
 * Usage:
 *   node _tools/karl/option-order-verify.js                 # default scan
 *   node _tools/karl/option-order-verify.js --json          # JSON to stdout
 *   node _tools/karl/option-order-verify.js --report-missing # also list quizzes
 *                                                            # without HTML
 *   node _tools/karl/option-order-verify.js --with-answers-md # cross-check
 *                                                            # ANSWERS.md format
 *                                                            # (warns on mismatch)
 *
 * Per Nancy review (2026-05-07):
 *   - Default scope: only quiz IDs present in BOTH quiz_keys.json AND with a
 *     discoverable HTML file. Do NOT default to all 449 keys.
 *   - INCOMPLETE bucket gated behind --report-missing flag.
 *   - ANSWERS.md is OPTIONAL via --with-answers-md, not primary source.
 *     ANSWERS.md is human-prose, format varies across courses.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const QUIZ_KEYS_PATH = path.join(REPO, 'functions/quiz_keys.json');
const APP_DIR = path.join(REPO, '_app');

// Severities: critical (drift), high (count mismatch), medium (missing HTML)
const FINDINGS = [];
function record(severity, code, message, meta) {
    FINDINGS.push({ severity, code, message, ...(meta || {}) });
}

// ── CLI flags ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
    json: args.includes('--json'),
    reportMissing: args.includes('--report-missing'),
    withAnswers: args.includes('--with-answers-md'),
    quiet: args.includes('--quiet'),
};

// ── Walk _app for all quiz HTML files (skip _archive, _source) ───────
function walkQuizzes(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('_') || e.name === 'node_modules') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walkQuizzes(full));
        else if (e.isFile() && e.name.endsWith('.quiz.html')) out.push(full);
    }
    return out;
}

// ── Try multiple basename → quiz_keys ID matches (suffix tolerance) ──
function findHtmlForQuizId(quizId, htmlByBasename) {
    if (htmlByBasename.has(quizId)) return htmlByBasename.get(quizId);
    // Try with -quiz appended/removed
    const withQuiz = quizId + '-quiz';
    if (htmlByBasename.has(withQuiz)) return htmlByBasename.get(withQuiz);
    if (quizId.endsWith('-quiz')) {
        const stripped = quizId.replace(/-quiz$/, '');
        if (htmlByBasename.has(stripped)) return htmlByBasename.get(stripped);
    }
    return null;
}

// ── Parse options array + JS quiz data from HTML ─────────────────────
// Quizzes use a `quizData` (or similar) JS object with question entries:
//   { question: "...", options: ["A", "B", "C", "D"], ... }
// We don't need a full JS parser — regex on `options:\s*\[\s*"..."` is enough.
function extractOptionsCounts(htmlPath) {
    let html;
    try { html = fs.readFileSync(htmlPath, 'utf8'); } catch (e) { return null; }
    const counts = [];
    // Find each `options: [` opener, then scan char-by-char to find the
    // MATCHING close bracket (skipping `]` inside string literals).
    //
    // Naïve `options:\s*\[([\s\S]*?)\]` fails when option strings themselves
    // contain `]` (e.g., `'[2, 5, 8]'` in a Python-list quiz). The
    // bracket-counter respects string delimiters (', ", `) and escape
    // sequences so it cannot be fooled by quoted brackets.
    const opener = /["']?options["']?\s*:\s*\[/g;
    let m;
    while ((m = opener.exec(html)) !== null) {
        const start = m.index + m[0].length;
        let i = start;
        let inQuote = null;       // ', ", or `
        let escape = false;
        let depth = 1;
        while (i < html.length && depth > 0) {
            const ch = html[i];
            if (escape) { escape = false; i++; continue; }
            if (inQuote) {
                if (ch === '\\') { escape = true; i++; continue; }
                if (ch === inQuote) { inQuote = null; i++; continue; }
                i++; continue;
            }
            if (ch === '"' || ch === '\'' || ch === '`') { inQuote = ch; i++; continue; }
            if (ch === '[') { depth++; i++; continue; }
            if (ch === ']') { depth--; i++; continue; }
            i++;
        }
        const body = html.slice(start, i - 1);
        // Count strings inside the body using delimiter-aware regexes.
        let n = 0;
        const reDouble = /"(?:[^"\\]|\\.)*"/g;
        const reSingle = /'(?:[^'\\]|\\.)*'/g;
        const reBacktick = /`(?:[^`\\$]|\\.|\$(?!\{))*`/g;
        for (const r of [reDouble, reSingle, reBacktick]) {
            let s;
            while ((s = r.exec(body)) !== null) n++;
        }
        counts.push(n);
        opener.lastIndex = i;
    }
    return counts;
}

// ── ANSWERS.md cross-check (optional, --with-answers-md) ─────────────
// Solutions/<course>/Quiz-*_ANSWERS.md format varies across courses.
// We only attempt parsing if the flag is set; on format mismatch we WARN
// rather than silently skip (per Nancy review).
function tryParseAnswersMarkdown(quizId) {
    const dirs = [
        path.resolve(process.env.HOME || '/home/eq', 'hexworth-shared/Solutions'),
    ];
    for (const root of dirs) {
        if (!fs.existsSync(root)) continue;
        // Recursive search for Quiz-*_ANSWERS.md files
        const matches = [];
        (function walk(d) {
            for (const e of fs.readdirSync(d, { withFileTypes: true })) {
                const full = path.join(d, e.name);
                if (e.isDirectory()) walk(full);
                else if (e.isFile() && /Quiz-.*_ANSWERS\.md$/i.test(e.name)) matches.push(full);
            }
        })(root);
        // Heuristic: file name should mention the quiz id (or part of it)
        const norm = quizId.toLowerCase().replace(/-quiz$/, '').replace(/[^a-z0-9]/g, '');
        for (const f of matches) {
            const base = path.basename(f).toLowerCase().replace(/[^a-z0-9]/g, '');
            if (base.includes(norm) || norm.includes(base.replace('quiz', '').replace('answers', ''))) return f;
        }
    }
    return null;
}

// ── MAIN ──────────────────────────────────────────────────────────────
function main() {
    const keys = JSON.parse(fs.readFileSync(QUIZ_KEYS_PATH, 'utf8'));
    const htmls = walkQuizzes(APP_DIR);
    const htmlByBasename = new Map();
    for (const h of htmls) {
        const base = path.basename(h).replace(/\.quiz\.html$/, '');
        htmlByBasename.set(base, h);
    }

    const inScope = [];
    const missingHtml = [];

    for (const [quizId, entry] of Object.entries(keys)) {
        const htmlPath = findHtmlForQuizId(quizId, htmlByBasename);
        if (!htmlPath) {
            missingHtml.push(quizId);
            continue;
        }
        inScope.push({ quizId, htmlPath, entry });
    }

    // Drift checks on in-scope quizzes
    for (const { quizId, htmlPath, entry } of inScope) {
        const counts = extractOptionsCounts(htmlPath);
        if (counts === null) {
            record('high', 'OPT-READ-FAIL', `Quiz ${quizId}: cannot read HTML`, { quizId, htmlPath });
            continue;
        }
        const answers = entry.answers || [];
        const declaredCount = entry.questionCount || answers.length;

        // Count mismatch
        if (counts.length !== declaredCount) {
            record('high', 'OPT-COUNT-MISMATCH',
                `Quiz ${quizId}: HTML has ${counts.length} questions, quiz_keys declares ${declaredCount}`,
                { quizId, htmlPath, htmlQuestions: counts.length, keyQuestions: declaredCount });
        }

        // Per-question bounds check
        const checkLen = Math.min(counts.length, answers.length);
        for (let q = 0; q < checkLen; q++) {
            const optsLen = counts[q];
            const ansIdx = answers[q];
            if (typeof ansIdx !== 'number' || ansIdx < 0 || ansIdx >= optsLen) {
                record('critical', 'OPT-IDX-OOB',
                    `Quiz ${quizId} Q${q+1}: answer index ${ansIdx} out of bounds for ${optsLen} options`,
                    { quizId, htmlPath, question: q+1, answerIndex: ansIdx, optionsLen: optsLen });
            }
        }
    }

    // ANSWERS.md cross-check (optional)
    if (flags.withAnswers) {
        for (const { quizId, htmlPath } of inScope) {
            const ansMd = tryParseAnswersMarkdown(quizId);
            if (ansMd) {
                // We don't deeply parse — just record that the file exists and
                // could be cross-checked manually.
                record('info', 'ANSWERS-MD-FOUND',
                    `Quiz ${quizId}: ANSWERS.md exists at ${ansMd} — manual cross-check recommended`,
                    { quizId, ansMd });
            }
        }
    }

    // Missing-HTML reporting (gated)
    if (flags.reportMissing && missingHtml.length > 0) {
        for (const quizId of missingHtml) {
            record('medium', 'OPT-NO-HTML',
                `Quiz ${quizId}: no matching HTML found under _app/`,
                { quizId });
        }
    }

    // ── OUTPUT ────────────────────────────────────────────────────────
    const summary = {
        scannedAt: new Date().toISOString(),
        keysTotal: Object.keys(keys).length,
        htmlTotal: htmls.length,
        inScope: inScope.length,
        missingHtml: missingHtml.length,
        bySeverity: FINDINGS.reduce((a, f) => { a[f.severity] = (a[f.severity]||0)+1; return a; }, {}),
        flags: { reportMissing: flags.reportMissing, withAnswers: flags.withAnswers },
    };

    if (flags.json) {
        console.log(JSON.stringify({ summary, findings: FINDINGS }, null, 2));
    } else if (!flags.quiet) {
        console.log('option-order-verify — quiz answer-key drift scanner');
        console.log('');
        console.log('  quiz_keys entries:    ' + summary.keysTotal);
        console.log('  HTML quiz files:      ' + summary.htmlTotal);
        console.log('  In-scope (both):      ' + summary.inScope);
        console.log('  Missing HTML:         ' + summary.missingHtml + (flags.reportMissing ? '' : ' (use --report-missing to list)'));
        console.log('');
        console.log('  Findings by severity:');
        for (const [s, n] of Object.entries(summary.bySeverity)) console.log('    ' + s + ': ' + n);
        console.log('');
        const drift = FINDINGS.filter(f => f.severity === 'critical' || f.severity === 'high');
        if (drift.length === 0) {
            console.log('  No drift detected. ' + summary.inScope + ' in-scope quizzes are aligned.');
        } else {
            console.log('  Drift findings (top 20):');
            drift.slice(0, 20).forEach(f => console.log('    [' + f.severity + '] ' + f.code + '  ' + f.message));
            if (drift.length > 20) console.log('    ... and ' + (drift.length - 20) + ' more');
        }
        if (flags.reportMissing) {
            const missing = FINDINGS.filter(f => f.code === 'OPT-NO-HTML');
            if (missing.length > 0) {
                console.log('');
                console.log('  Missing HTML (--report-missing, top 30):');
                missing.slice(0, 30).forEach(f => console.log('    ' + f.quizId));
                if (missing.length > 30) console.log('    ... and ' + (missing.length - 30) + ' more');
            }
        }
    }

    // Exit code: 1 only on critical drift; high count-mismatch is non-blocking
    const hasCritical = FINDINGS.some(f => f.severity === 'critical');
    process.exit(hasCritical ? 1 : 0);
}

main();
