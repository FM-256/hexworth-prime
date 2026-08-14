#!/usr/bin/env node
/*
 * @catalog what    Generates a quiz solutions doc DERIVED from the live HTML + Firestore key.
 * @catalog run     node _tools/confluence/generate-quiz-solution.js <quizId> [--out FILE]
 * @catalog status  TOOL
 *
 * WHY (BUG-110). Four live server-graded OpenStack quizzes have NO solution page — 435 children
 * under the Quiz Solutions Manual and zero OpenStack, while every other Cloud-house course has
 * one. That means no instructor-facing artifact states the correct answers and no Karl-audited
 * citation trail exists for a course a class is currently sitting.
 *
 * ⚠ IT GENERATES RATHER THAN TRANSCRIBES, AND THAT IS THE POINT. A hand-typed answer key would be
 * a FOURTH enumeration of the same facts (HTML options, Firestore answers, Confluence prose) with
 * nothing deriving it from the others — exactly the family that produced BUG-107 (hub says 12,
 * path said 7), BUG-109 (5 courses omit their quizzes) and the ws-pa-01/ws-07 id split in
 * BUG-099. Deriving it means the doc cannot drift from what actually grades the student.
 *
 * ⚠ IT READS THE QUESTIONS AS A VALUE, NOT BY PARSING THE PAGE. It loads the quiz in a browser
 * and reads the page's own `questions` array. Regexing HTML for question text is the mistake that
 * cost five review rounds in BUG-107; the browser has already parsed the document, so let it.
 *
 * READ-ONLY. It fetches `quiz_keys/{quizId}` and writes a local markdown file. It never writes to
 * Firestore, never touches Confluence, and never modifies the quiz. Publishing is a separate,
 * deliberate step: _tools/confluence/publish-solution.py.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
// firebase-admin lives in functions/node_modules, not at the repo root. Resolve it explicitly
// so this runs from anywhere rather than only from inside functions/.
const admin = require(require('path').join(__dirname, '../../functions/node_modules/firebase-admin'));

const ROOT = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };

const args = process.argv.slice(2);
const quizId = args.find(a => !a.startsWith('--'));
const outIdx = args.indexOf('--out');
if (outIdx !== -1 && !args[outIdx + 1]) {
    console.error('ERROR: --out given with no path.');
    process.exit(2);
}
if (!quizId) {
    console.error('usage: node generate-quiz-solution.js <quizId> [--out FILE]');
    process.exit(2);
}

// The quiz page for a given grading id. NOTE the id trap recorded in BUG-099/the SITREP: the
// GRADING id is `cloud-` prefixed and the PROGRESS module id is not. This tool takes the grading
// id, because that is what keys Firestore.
function pageFor(id) {
    return `/houses/cloud/openstack/quizzes/${id}.quiz.html`;
}

(async () => {
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
        if (p.endsWith('/')) p += 'index.html';
        fs.readFile(path.join(ROOT, p), (e, b) => {
            if (e) { r.writeHead(404); return r.end('404'); }
            r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
            r.end(b);
        });
    });
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const port = srv.address().port;

    // ---- source 1: the page's own questions, read as a VALUE -------------------------------
    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    // The quiz pages are AccessGuard-gated; without a sorted student the document never parses.
    await page.evaluateOnNewDocument(() => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (e) {}
    });
    await page.goto(`http://127.0.0.1:${port}${pageFor(quizId)}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const html = await page.evaluate(() => {
        if (typeof questions === 'undefined') return null;
        return {
            questions: questions.map(q => ({ q: q.q, opts: q.opts })),
            quizId: (typeof QUIZ_ID !== 'undefined') ? QUIZ_ID : null
        };
    });
    await browser.close(); srv.close();

    if (!html) { console.error(`ERROR: could not read questions from ${pageFor(quizId)}`); process.exit(1); }
    if (html.quizId && html.quizId !== quizId) {
        // Refuse rather than generate a doc that names one quiz and describes another.
        console.error(`ERROR: page QUIZ_ID is "${html.quizId}" but "${quizId}" was requested.`);
        process.exit(1);
    }

    // ---- source 2: the live grading key -----------------------------------------------------
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const snap = await admin.firestore().doc(`quiz_keys/${quizId}`).get();
    if (!snap.exists) { console.error(`ERROR: quiz_keys/${quizId} does not exist`); process.exit(1); }
    const key = snap.data();

    // Refuse a malformed key rather than emitting "undefined%" or throwing mid-render.
    if (!Array.isArray(key.answers) || typeof key.passingScore !== 'number') {
        console.error(`ERROR: quiz_keys/${quizId} is malformed ` +
                      `(answers=${typeof key.answers}, passingScore=${typeof key.passingScore}).`);
        process.exit(1);
    }
    if (key.answers.length !== html.questions.length) {
        console.error(`ERROR: ${key.answers.length} answers vs ${html.questions.length} questions. ` +
                      `Refusing to generate a doc from two sources that disagree.`);
        process.exit(1);
    }

    // ---- render -----------------------------------------------------------------------------
    const today = new Date().toISOString().slice(0, 10);
    const L = [];
    L.push(`# ${quizId} — Quiz Solutions`, '');
    L.push('**Course:** Cloud Master (OpenStack)');
    L.push('**House:** Cloud');
    L.push(`**Quiz ID (Firestore):** \`${quizId}\``);
    L.push(`**Questions:** ${html.questions.length}`);
    L.push(`**Pass Threshold:** ${key.passingScore}%`);
    L.push(`**Last Updated:** ${today}`);
    L.push('**Status:** GENERATED — do not hand-edit. Answers come from the live Firestore key; ' +
           'question text and options are read from the quiz page at runtime. Regenerate with ' +
           `\`node _tools/confluence/generate-quiz-solution.js ${quizId}\`.`);
    L.push('', '---', '');
    L.push('## How to read this document', '');
    L.push('Each question shows the text and every option **as they appear in the page**, indexed ' +
           'from 0, with the correct option taken from the Firestore key that actually grades the ' +
           'student. Options are listed in authored order; **the quiz shuffles them per student at ' +
           'runtime**, so "option B" is meaningless to a learner and this document must never be ' +
           'handed out as letters.');
    L.push('');
    L.push('⚠ **This document is DERIVED, never transcribed.** A hand-typed key would be a fourth ' +
           'copy of the same facts with nothing keeping it in step — the failure family behind ' +
           'BUG-107, BUG-109 and BUG-099. If it disagrees with the quiz, regenerate it; do not ' +
           'edit it.');
    L.push('');
    L.push(`Key array: \`[${key.answers.join(', ')}]\``);
    L.push('', '---', '');

    html.questions.forEach((q, i) => {
        const ans = key.answers[i];
        L.push('━'.repeat(50));
        L.push(`QUESTION ${i + 1} of ${html.questions.length}`);
        L.push(`Quiz ID: ${quizId} | Key index: ${ans}`);
        L.push('━'.repeat(50), '');
        L.push('**QUESTION:**', q.q, '');
        L.push('**OPTIONS:**');
        q.opts.forEach((o, j) => L.push(`${j}. ${o}${j === ans ? '   ← **CORRECT**' : ''}`));
        L.push('');
        L.push(`**CORRECT ANSWER:** index ${ans} — ${q.opts[ans]}`);
        L.push('');
        const why = (key.explanations && key.explanations[i]) || '';
        L.push('**RATIONALE:**');
        L.push(why ? why : '_No explanation stored in the Firestore key for this question. ' +
                            'Add one there so it reaches students AND this document._');
        L.push('');
    });

    const out = outIdx !== -1 ? args[outIdx + 1]
        : path.resolve(process.env.HOME, 'hexworth-shared/Solutions/CloudMaster',
                       `${quizId}-SOLUTIONS.md`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, L.join('\n') + '\n');
    console.log(`wrote ${out}`);
    console.log(`  ${html.questions.length} questions, key [${key.answers.join(', ')}], ` +
                `${(key.explanations || []).filter(Boolean).length} explanations carried through`);
    process.exit(0);
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
