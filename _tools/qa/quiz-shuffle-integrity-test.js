#!/usr/bin/env node
/*
 * @catalog what    Proves option shuffling is live on the OpenStack quizzes and cannot silently regress.
 * @catalog run     node _tools/qa/quiz-shuffle-integrity-test.js
 * @catalog status  GATE
 *
 * WHY (BUG-111). Bridget's three-way audit found the stored answer indices are badly skewed in
 * AUTHORED order: cloud-openstack-install-quiz is 80% index-1 (12 of 15) and
 * cloud-openstack-operation-quiz is 80% index-1 with ZERO index-3. That is the
 * "click B every time" shape BUG-067 was filed for.
 *
 * ⚠ IT IS HARMLESS ONLY BECAUSE THE SHUFFLE STANDS IN FRONT OF IT. InstantQuizGrader applies a
 * per-question Fisher-Yates permutation before render, so the student never sees authored order.
 * THAT MAKES THE SHUFFLE LOAD-BEARING FOR ASSESSMENT INTEGRITY, not an anti-cheat nicety: revert
 * these quizzes to static rendering and two of the four become trivially passable without
 * knowledge. Nothing asserted that before this file existed.
 *
 * ⚠ IT DOES NOT RE-TEST THE PERMUTATION MATH. _tools/instant-quiz-grader-test.js already proves
 * display<->original cannot desync, with an ablation. This asserts the different thing that was
 * unguarded: that these four PAGES actually route through it, on their own question data.
 *
 * ⚠ THE QUIZZES ARE SERVER-GRADED AND REFUSE AN UNAUTHENTICATED CALLER BEFORE QUESTION 1, so the
 * full student journey cannot run headless. This drives the grader with each page's OWN
 * `questions` array, which is the data the shuffle actually has to protect.
 */
'use strict';
const puppeteer = require('puppeteer'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, b) => {
        if (e) { r.writeHead(404); return r.end('404'); }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        r.end(b);
    });
});
let pass = 0, fail = 0;
const ck = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  -> ' + d}`); };

const QUIZZES = ['intro', 'projects', 'install', 'operation'].map(n =>
    ({ name: n, url: `/houses/cloud/openstack/quizzes/cloud-openstack-${n}-quiz.quiz.html` }));

(async () => {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const port = srv.address().port;
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    for (const quiz of QUIZZES) {
        const p = await b.newPage();
        /* ⚠ SEED A SORTED STUDENT FIRST. These pages are AccessGuard-gated, and the guard now runs
           in <head> (Mallory finding 2). Without this the document never parses past the guard --
           my first run reported "InstantQuizGrader undefined" on all four quizzes and the only
           script in the DOM was TouristVisa.js. That is the gate working, not the quiz failing. */
        await p.evaluateOnNewDocument(() => {
            try {
                localStorage.setItem('hexworth_house', 'cloud');
                localStorage.setItem('hexworth_sorted', 'true');
            } catch (e) {}
        });
        const missing = [];
        p.on('requestfailed', r => missing.push(r.url()));
        p.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
        await p.goto(`http://127.0.0.1:${port}${quiz.url}`, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 500));

        console.log(`\n--- ${quiz.name} ---`);
        ck(`  InstantQuizGrader.js loads (no 404)`,
           !missing.some(u => /InstantQuizGrader/.test(u)), missing.filter(u => /Instant/.test(u))[0]);

        const res = await p.evaluate(() => {
            if (typeof InstantQuizGrader === 'undefined') return { err: 'InstantQuizGrader undefined' };
            if (typeof questions === 'undefined') return { err: 'questions undefined' };
            const g = InstantQuizGrader.create({ quizId: 'shuffle-probe', questions: questions });
            let moved = 0, sameLength = 0, roundTrips = 0;
            for (let i = 0; i < questions.length; i++) {
                const authored = questions[i].opts;
                const shown = g.displayOptions(i);
                if (shown.length === authored.length) sameLength++;
                if (shown.some((o, d) => o !== authored[d])) moved++;
                // every displayed slot must map back to the original that produced it
                if (shown.every((o, d) => authored[g.toOriginal(i, d)] === o)) roundTrips++;
            }
            return { n: questions.length, moved, sameLength, roundTrips };
        });

        if (res.err) { ck(`  grader is usable on this page`, false, res.err); await p.close(); continue; }
        ck(`  ${res.n} questions, no options lost or duplicated in the display order`,
           res.sameLength === res.n, `${res.sameLength}/${res.n}`);
        ck(`  every displayed option maps back to the original that produced it`,
           res.roundTrips === res.n, `${res.roundTrips}/${res.n} round-trip`);
        /* THE INTEGRITY ASSERTION. With 4 options a correct shuffle leaves a question in authored
           order 1 time in 24, so across 15 questions a live shuffle moves nearly all of them.
           Requiring "most" rather than "all" keeps this from flaking on a legitimate identity
           permutation; requiring a MAJORITY still fails instantly if the shuffle is removed,
           because then NOTHING moves. */
        ck(`  options are genuinely reordered for the student (shuffle is LIVE)`,
           res.moved > res.n / 2, `only ${res.moved}/${res.n} questions reordered`);
        await p.close();
    }

    /* ABLATION: neuter the shuffle and require the assertion above to fail. A gate nobody has
       watched fail is decoration, and this one guards a property that is invisible in normal use. */
    console.log('\n--- ABLATION: identity permutation (the regression BUG-111 warns about) ---');
    const p2 = await b.newPage();
    await p2.evaluateOnNewDocument(() => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (e) {}
    });
    await p2.goto(`http://127.0.0.1:${port}${QUIZZES[0].url}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 500));
    const ablated = await p2.evaluate(() => {
        const g = InstantQuizGrader.create({ quizId: 'ablation', questions: questions });
        g.displayOptions = i => questions[i].opts;      // static rendering, the regression
        let moved = 0;
        for (let i = 0; i < questions.length; i++) {
            if (g.displayOptions(i).some((o, d) => o !== questions[i].opts[d])) moved++;
        }
        return { moved, n: questions.length };
    });
    ck('  with the shuffle removed, the "reordered" assertion FAILS as designed',
       !(ablated.moved > ablated.n / 2), `still reported ${ablated.moved}/${ablated.n} moved`);
    await p2.close();

    await b.close(); srv.close();
    console.log(`\n  ${pass}/${pass + fail} checks passed`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
