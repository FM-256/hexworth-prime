#!/usr/bin/env node
/*
 * @catalog what    Walks OpenStack chapter 1 the way a student does (hub -> part -> finish -> Back)
 * @catalog what    and asserts the hub marks the chapter complete only when all three parts are done.
 * @catalog run     node _tools/qa/openstack-ch1-completion-test.js
 * @catalog status  GATE
 *
 * WHY. Operator report: "chapter one is not marking complete when users complete all parts."
 * Nothing was wrong with the parts. The presentation, lab and quiz each recorded exactly the key
 * the hub reads, and the quiz key bridge verified 15/15. The hub called updateProgress() once at
 * parse time and listened for nothing, so pressing Back restored it from the bfcache WITHOUT
 * re-running scripts and it kept showing the progress it computed BEFORE the student did the work.
 *
 * ⚠ THIS TEST NAVIGATES. An earlier probe of mine mutated localStorage in place on an already
 * open page and "reproduced" a stale hub, which is a scenario no student is in: it fires no
 * pageshow and no visibilitychange, so it proves nothing about the fix and would fail even on
 * correct code. The bug only appears across a real navigation, so the test only uses real ones:
 * page.click() on the hub's own links, and page.goBack() for the Back button.
 *
 * ⚠ THE QUIZ CANNOT BE PLAYED HEADLESS. It is server-graded (gradeQuiz) and refuses an
 * unauthenticated caller before question 1, by design. So this test does what the quiz does on a
 * passing run: writes `<STORE_KEY>_score`. It READS STORE_KEY out of the quiz page at runtime
 * rather than hardcoding it, so if the quiz ever renames its key this test follows the quiz
 * instead of quietly testing a key nobody writes any more.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, buf) => {
        if (e) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
    });
});

let pass = 0, fail = 0;
function check(name, cond, detail) {
    if (cond) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; console.log(`  FAIL  ${name}${detail ? '  -> ' + detail : ''}`); }
}

(async () => {
    /* BASE=https://hexworth.com runs the SAME journey against production. The local server is
       what the working tree serves; production is what students actually get, and "the file
       shipped" is not the same claim as "the journey works there". */
    const BASE = process.env.BASE || null;
    let base;
    if (BASE) { base = BASE.replace(/\/$/, ''); }
    else {
        await new Promise(r => server.listen(0, '127.0.0.1', r));
        base = `http://127.0.0.1:${server.address().port}`;
    }
    const HUB = `${base}/houses/cloud/openstack/index.html`;
    console.log(`  base: ${base}`);

    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 110)));
    page.on('dialog', async d => { await d.dismiss(); });
    await page.evaluateOnNewDocument(() => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (e) {}
    });

    /* Chapter 1 as the hub itself defines it: card index 0. Read the state the STUDENT sees. */
    const hubState = () => page.evaluate(() => {
        const card = document.querySelectorAll('.module-card')[0];
        return {
            text: (document.getElementById('progressText') || {}).textContent || '',
            complete: !!(card && card.classList.contains('completed'))
        };
    });

    console.log('\n--- OpenStack chapter 1, walked as a student ---\n');

    await page.goto(HUB, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 700));
    let s = await hubState();
    check('a fresh student sees chapter 1 incomplete', s.complete === false, s.text);

    /* ── PART 1: the presentation, via the hub's own link and the real button ── */
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
        page.evaluate(() => document.querySelectorAll('.module-card')[0]
            .querySelector('a.link-presentation').click())
    ]);
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
        if (typeof showSlide === 'function' && typeof TOTAL_SLIDES !== 'undefined') showSlide(TOTAL_SLIDES);
        document.querySelector('.complete-btn').click();
    });
    await new Promise(r => setTimeout(r, 800));
    check('the presentation records its module', await page.evaluate(() =>
        !!((JSON.parse(localStorage.getItem('hexworth_progress') || '{}').cloud || {})['cloud-openstack-intro'])));

    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 900));
    s = await hubState();
    /* THE ORIGINAL BUG. Before the fix this read "1 / 13" only after a manual reload, and Back
       showed the pre-work value. The count moving is what proves the hub re-rendered. */
    check('Back from the presentation repaints the hub', /1 \/ 13/.test(s.text), s.text);
    check('one part done does NOT mark the chapter complete', s.complete === false);

    /* ── PART 2: the lab, driven through its own gate ── */
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
        page.evaluate(() => document.querySelectorAll('.module-card')[0]
            .querySelector('a.link-lab').click())
    ]);
    await new Promise(r => setTimeout(r, 800));
    /* The lab refuses credit below 5 of 5. Prove the refusal still holds before satisfying it,
       otherwise this test would pass just as happily against a lab that gives credit away. */
    const refused = await page.evaluate(() => {
        markTaskComplete(1); markTaskComplete(2);
        completeModule();
        return !((JSON.parse(localStorage.getItem('hexworth_progress') || '{}').cloud || {})['cloud-openstack-install-lab']);
    });
    check('the lab refuses credit at 2 of 5 tasks', refused);
    await page.evaluate(() => { for (let i = 1; i <= 5; i++) markTaskComplete(i); completeModule(); });
    await new Promise(r => setTimeout(r, 700));
    check('the lab records once all 5 tasks are done', await page.evaluate(() =>
        !!((JSON.parse(localStorage.getItem('hexworth_progress') || '{}').cloud || {})['cloud-openstack-install-lab'])));

    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 900));
    s = await hubState();
    check('Back from the lab repaints the hub', /2 \/ 13/.test(s.text), s.text);
    check('two parts done still does NOT mark the chapter complete', s.complete === false);

    /* ── PART 3: the quiz. Server-graded, so take its key from the page and write what a
       passing run writes. Hardcoding the key here would let the quiz drift away silently. ── */
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
        page.evaluate(() => document.querySelectorAll('.module-card')[0]
            .querySelector('a.link-quiz').click())
    ]);
    await new Promise(r => setTimeout(r, 800));
    const storeKey = await page.evaluate(() => (typeof STORE_KEY !== 'undefined') ? STORE_KEY : null);
    check('the quiz exposes the STORE_KEY this test depends on', !!storeKey, String(storeKey));
    await page.evaluate(k => {
        localStorage.setItem(k + '_score', '100');
        localStorage.setItem(k + '_passed', '1');
    }, storeKey);

    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 900));
    s = await hubState();
    check('ALL THREE PARTS DONE: Back marks chapter 1 complete', s.complete === true, s.text);
    check('and the count agrees with the card', /3 \/ 13/.test(s.text), s.text);

    /* ── The other three chapters must be untouched by any of this. ── */
    const others = await page.evaluate(() =>
        [...document.querySelectorAll('.module-card')].slice(1).map(c => c.classList.contains('completed')));
    check('chapters 2, 3 and 4 remain unmarked', others.every(v => v === false), JSON.stringify(others));

    check('no page errors anywhere in the journey', errors.length === 0, errors[0]);

    console.log(`\n  ${pass}/${pass + fail} checks passed\n`);
    await browser.close();
    if (!BASE) server.close();
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
