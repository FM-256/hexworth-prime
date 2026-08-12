#!/usr/bin/env node
/*
 * @catalog what    Walks EVERY OpenStack chapter the way a student does (hub -> part -> finish ->
 * @catalog what    Back) and asserts each card marks complete only when all of ITS parts are done.
 * @catalog run     node _tools/qa/openstack-hub-completion-test.js  [BASE=https://hexworth.com]
 * @catalog status  GATE
 *
 * WHY. Operator report: "chapter one is not marking complete when users complete all parts."
 * Nothing was wrong with the parts. Every presentation, lab and quiz records exactly the key the
 * hub reads. The hub called updateProgress() once at parse time and listened for nothing, so
 * pressing Back restored it from the bfcache WITHOUT re-running scripts and it kept showing the
 * progress it computed BEFORE the student did the work. Fixed with pageshow + visibilitychange.
 *
 * ⚠ THIS TEST NAVIGATES. An earlier probe of mine mutated localStorage in place on an already
 * open page and "reproduced" a stale hub, which is a scenario no student is in: it fires no
 * pageshow and no visibilitychange, so it proves nothing and would fail even on correct code.
 * The bug only appears across a real navigation, so this only uses real ones: page.click() on the
 * hub's own links and page.goBack() for the Back button.
 *
 * ⚠ IT READS THE CHAPTERS OFF THE HUB, it does not carry a table of them. The parts of a chapter
 * are whichever part links that card renders, and the quiz key is read out of the quiz page at
 * runtime. A hardcoded table would keep passing after the hub changed underneath it, which is the
 * failure mode this whole investigation was about. Chapter 4 has no lab, and nothing here needs
 * telling that: it simply has no lab link.
 *
 * ⚠ THE QUIZZES CANNOT BE PLAYED HEADLESS. They are server-graded (gradeQuiz) and refuse an
 * unauthenticated caller before question 1, by design. So this does what a passing run does:
 * writes `<STORE_KEY>_score`, with STORE_KEY read from the page.
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
const NAV = { waitUntil: 'domcontentloaded', timeout: 60000 };
const settle = ms => new Promise(r => setTimeout(r, ms));

/* Retry a FRESH DOCUMENT FETCH only, and say so out loud when it happens.
   Against production this box intermittently stalls on the document request itself, before any
   page code runs (BUG-102: measured at ~2s normally, and the request still in flight at timeout
   is the HTML document). A 12-navigation journey then almost never finishes. Retrying is
   legitimate for a network stall and dishonest for a broken page, so every retry is logged: if
   these lines start appearing on every run, the page is the problem, not the network.
   ⚠ goBack IS DELIBERATELY NOT RETRIED. The whole point of this test is that Back restores from
   the bfcache without re-running scripts. Retrying it with a goto would turn it into a fresh
   load, which passes for the wrong reason and would not have caught the original bug. */
async function withRetry(label, fn, tries = 3) {
    let last;
    for (let i = 1; i <= tries; i++) {
        try { return await fn(); }
        catch (e) {
            last = e;
            if (!/timeout/i.test(e.message) || i === tries) throw e;
            console.log(`  (retry ${i}/${tries - 1}: ${label} stalled on document fetch)`);
            await settle(1500);
        }
    }
    throw last;
}

(async () => {
    /* BASE=https://hexworth.com runs the SAME journey against production. "The file shipped" is
       not the same claim as "the journey works there". */
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

    const hubState = idx => page.evaluate(i => {
        const card = document.querySelectorAll('.module-card')[i];
        const txt = (document.getElementById('progressText') || {}).textContent || '';
        const m = txt.match(/(\d+)\s*\/\s*(\d+)/);
        return { count: m ? Number(m[1]) : -1, text: txt,
                 complete: !!(card && card.classList.contains('completed')) };
    }, idx);

    await withRetry('hub load', () => page.goto(HUB, NAV));
    await settle(800);

    /* Ask the HUB what its chapters are and which parts each one has. */
    const chapters = await page.evaluate(() =>
        [...document.querySelectorAll('.module-card')].map((c, i) => ({
            idx: i,
            name: c.dataset.module || ('card' + i),
            title: (c.querySelector('h3') || {}).textContent || '',
            parts: ['presentation', 'lab', 'quiz'].filter(k => !!c.querySelector('a.link-' + k))
        })));
    console.log(`\n--- ${chapters.length} chapters found on the hub ---`);
    chapters.forEach(c => console.log(`  ${c.name}: ${c.parts.join(', ')}`));

    /* Complete whichever kind of part we just navigated to. Each returns true if it recorded. */
    async function finishPresentation() {
        await page.evaluate(() => {
            if (typeof showSlide === 'function' && typeof TOTAL_SLIDES !== 'undefined') showSlide(TOTAL_SLIDES);
            const b = document.querySelector('.complete-btn');
            if (b) b.click();
        });
        await settle(800);
        return true;
    }
    async function finishLab() {
        /* Prove the gate REFUSES before satisfying it. Without this the test would pass just as
           happily against a lab that hands out credit for nothing, which is a defect this repo
           has actually shipped before (the unconditional completeModule, fixed 2026-08-03). */
        const refusedAtPartial = await page.evaluate(() => {
            if (typeof markTaskComplete !== 'function' || typeof completeModule !== 'function') return null;
            markTaskComplete(1);
            const before = JSON.stringify(localStorage.getItem('hexworth_progress'));
            completeModule();
            return before === JSON.stringify(localStorage.getItem('hexworth_progress'));
        });
        check('    the lab refuses credit at 1 of its tasks', refusedAtPartial === true,
              refusedAtPartial === null ? 'lab does not use the markTaskComplete/completeModule shape' : 'credit granted early');
        await page.evaluate(() => {
            for (let i = 1; i <= 12; i++) { try { markTaskComplete(i); } catch (e) {} }
            completeModule();
        });
        await settle(700);
        return true;
    }
    async function finishQuiz() {
        const key = await page.evaluate(() => (typeof STORE_KEY !== 'undefined') ? STORE_KEY : null);
        check('    the quiz exposes the STORE_KEY the hub reads', !!key, String(key));
        if (!key) return false;
        await page.evaluate(k => {
            localStorage.setItem(k + '_score', '100');
            localStorage.setItem(k + '_passed', '1');
        }, key);
        return true;
    }
    const finisher = { presentation: finishPresentation, lab: finishLab, quiz: finishQuiz };

    let expected = 0;   // parts completed so far, which is what the hub's counter should read
    for (const ch of chapters) {
        console.log(`\n--- ${ch.name}: ${ch.title.trim()} (${ch.parts.length} parts) ---`);
        let s = await hubState(ch.idx);
        check(`  ${ch.name} starts incomplete`, s.complete === false, s.text);

        for (let n = 0; n < ch.parts.length; n++) {
            const part = ch.parts[n];
            await withRetry(`${ch.name} ${part} link`, async () => {
                await Promise.all([
                    page.waitForNavigation(NAV),
                    page.evaluate((i, k) => document.querySelectorAll('.module-card')[i]
                        .querySelector('a.link-' + k).click(), ch.idx, part)
                ]);
            });
            await settle(800);
            await finisher[part]();

            await page.goBack(NAV);
            await settle(900);
            expected++;
            s = await hubState(ch.idx);
            check(`  Back from the ${part} repaints the hub (${expected})`, s.count === expected,
                  `${s.text} expected ${expected}`);
            const isLast = (n === ch.parts.length - 1);
            check(`  ${ch.name} ${isLast ? 'IS complete after its last part' : 'is NOT complete yet'}`,
                  s.complete === isLast, s.text);
        }
    }

    /* Chapters already finished must stay finished as later ones are completed. */
    const finalStates = await page.evaluate(() =>
        [...document.querySelectorAll('.module-card')].map(c => c.classList.contains('completed')));
    check('every chapter remains complete at the end', finalStates.every(v => v === true),
          JSON.stringify(finalStates));

    /* ── CROSS-DEVICE, every chapter (BUG-101) ────────────────────────────────────────────
       The student finished on their laptop; this is the phone. localStorage is empty, the hub
       renders zeros, and the cloud data arrives AFTER that render via
       FirestoreManager.syncBidirectional, which deep-merges and then dispatches
       hexworth:cloudSyncComplete.

       The payload is not hand-written: it is the exact localStorage a real completed student
       has, captured from the journey above. A hand-written blob could agree with the hub while
       disagreeing with what the parts actually record, which is the whole class of bug this
       file exists for.

       The middle assertion is the control. Writing the merged data WITHOUT the event must NOT
       repaint; otherwise a pass here would prove nothing about the listener. */
    const cloudBlob = await page.evaluate(() => {
        const out = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k === 'hexworth_progress' || /^hexworth_openstack_.*_quiz_(score|passed)$/.test(k)) {
                out[k] = localStorage.getItem(k);
            }
        }
        return out;
    });
    check('captured a real completed student from the journey',
          Object.keys(cloudBlob).length >= chapters.length, `${Object.keys(cloudBlob).length} keys`);

    console.log('\n--- cross-device: the same student on a second device ---');
    const phone = await browser.newPage();
    const phoneErrors = [];
    phone.on('pageerror', e => phoneErrors.push(String(e.message).slice(0, 110)));
    await phone.evaluateOnNewDocument(() => {
        try {
            localStorage.clear();
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (e) {}
    });
    await withRetry('hub load (second device)', () => phone.goto(HUB, NAV));
    await settle(900);
    const cards = () => phone.evaluate(() =>
        [...document.querySelectorAll('.module-card')].map(c => c.classList.contains('completed')));

    let st = await cards();
    check('  a second device starts with every chapter incomplete', st.every(v => v === false), JSON.stringify(st));

    await phone.evaluate(blob => { Object.keys(blob).forEach(k => localStorage.setItem(k, blob[k])); }, cloudBlob);
    st = await cards();
    check('  merged data ALONE does not repaint (control)', st.every(v => v === false), JSON.stringify(st));

    await phone.evaluate(() => window.dispatchEvent(new CustomEvent('hexworth:cloudSyncComplete',
        { detail: { addedToLocal: 11, addedToCloud: 0, totalModules: 11 } })));
    await settle(500);
    st = await cards();
    check('  the sync event repaints EVERY chapter, with no reload', st.every(v => v === true), JSON.stringify(st));
    check('  no page errors on the second device', phoneErrors.length === 0, phoneErrors[0]);
    await phone.close();

    check('no page errors anywhere in the journey', errors.length === 0, errors[0]);

    console.log(`\n  ${pass}/${pass + fail} checks passed\n`);
    await browser.close();
    if (!BASE) server.close();
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
