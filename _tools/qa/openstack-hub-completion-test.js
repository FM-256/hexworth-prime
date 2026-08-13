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
        /* ⚠ SEAM, AND WHY IT IS HERE. This used to call markTaskComplete(1..12) and completeModule(),
           which worked only because lab credit could be forged. BUG-104 closed that: markTaskComplete
           now re-derives each task against the page, so a harness that fills in nothing is correctly
           refused, and this test went 51/51 -> 34/51 the moment the hole shut. The fix breaking the
           test is the fix working.
           Filling in five correct answers for three labs of different shapes belongs in the LAB
           tests, not here: this file is about whether the HUB repaints and counts. So it records the
           module exactly as the lab does on success, and the lab's own gate, including the refusal
           above, is covered by _tools/qa/openstack-lab-credit-test.js (12/12 across all three labs). */
        const labId = await page.evaluate(() => {
            const m = document.documentElement.innerHTML.match(/ModuleProgress\.complete\('cloud',\s*'([^']+)'/);
            return m ? m[1] : null;
        });
        check('    the lab names the module id it records', !!labId, String(labId));
        await page.evaluate(id => {
            if (id) ModuleProgress.complete('cloud', id, { type: 'lab' });
        }, labId);
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
                /* ⚠ A STALLED NAVIGATION LEAVES US SOMEWHERE ELSE. The first version of this
                   retry just clicked again, but after a stall the document is no longer the hub,
                   so `.module-card[i]` is undefined and the retry died with
                   "Cannot read properties of undefined (reading 'querySelector')" instead of
                   retrying anything. Only production ever stalled, so only production found it.
                   Get back to the hub first, then click. */
                const onHub = await page.evaluate(() => !!document.querySelector('.module-card'));
                if (!onHub) {
                    await page.goto(HUB, NAV);
                    await settle(700);
                }
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

    /* ── THE COURSE MUST BE FINISHABLE (BUG-103) ──────────────────────────────────────────
       Chapters going green is not the same claim as the course reaching 100%. Before this fix
       the comprehensive review recorded nothing (its onComplete was an empty function) and the
       denominator counted that one review twice, so a student who did everything read 11/13 and
       85% on a page telling them to complete all 13 activities.

       So: play the review the way a student reaches it, from the hub's own link, then come back
       and assert the counter reads N/N. The denominator is read off the page rather than
       hardcoded here, because a test that asserts "12" would go green again the moment someone
       edits the total to match a new miscount. */
    console.log('\n--- the comprehensive review, and finishing the course ---');
    await withRetry('review link', async () => {
        await Promise.all([
            page.waitForNavigation(NAV),
            page.evaluate(() => document.querySelector('a.link-review').click())
        ]);
    });
    await settle(900);

    /* PLAY THE REVIEW FOR REAL. An earlier version of this check recorded the completion by
       hand from the review page's context and asserted the source contained the call. Both
       passed while the engine's onComplete had never once fired in a browser, which is the same
       "structure is not behaviour" mistake that started this whole investigation. So it plays:
       every clue, Final Jeopardy, and then the "See Final Results" button, because it is
       render() from THAT last click which reaches showResults() and fires config.onComplete.
       Missing that one click is what made my first playthrough report a false failure. */
    const closeModal = async () => {
        for (let t = 0; t < 20; t++) {
            const gone = await page.evaluate(() => {
                const c = document.querySelector('.review-continue-btn');
                if (c) { c.click(); return false; }
                return !document.getElementById('reviewModal');
            });
            if (gone) return true;
            await settle(120);
        }
        return false;
    };
    let clues = 0;
    for (let i = 0; i < 40; i++) {
        if (!await page.evaluate(() => !!document.querySelector('.review-cell-active'))) break;
        await page.evaluate(() => document.querySelector('.review-cell-active').click());
        await settle(150);
        if (await page.evaluate(() => { const o = document.querySelector('.review-modal-options .review-option-btn'); if (!o) return false; o.click(); return true; })) clues++;
        await settle(200);
        await closeModal();
        await settle(120);
    }
    const board = await page.evaluate(() => (typeof ReviewEngine !== 'undefined' && ReviewEngine.getProgress) ? ReviewEngine.getProgress() : null);
    check('  every clue on the board was answered', !!board && board.answered === board.total,
          board ? `${board.answered}/${board.total}` : 'ReviewEngine.getProgress unavailable');
    await settle(400);
    await page.evaluate(() => { const o = document.querySelector('.review-modal-options .review-option-btn'); if (o) o.click(); });
    await settle(500);
    await page.evaluate(() => { const c = document.querySelector('.review-continue-btn'); if (c) c.click(); });
    await settle(900);
    const played = await page.evaluate(() =>
        !!((JSON.parse(localStorage.getItem('hexworth_progress') || '{}').cloud || {})['cloud-openstack-review'] || {}).completed);
    check('  PLAYING the review to the end records it (onComplete actually fires)', played === true);

    await page.goBack(NAV);
    await settle(900);
    const beforeReview = { count: -1, text: 'played the review' };
    await settle(300);
    const done = await page.evaluate(() => {
        const txt = (document.getElementById('progressText') || {}).textContent || '';
        const m = txt.match(/(\d+)\s*\/\s*(\d+)/);
        return { text: txt, done: m ? Number(m[1]) : -1, total: m ? Number(m[2]) : -1 };
    });
    check('  the review counts toward the total', done.done > beforeReview.count - 1 && done.done === done.total,
          `${beforeReview.text} -> ${done.text}`);
    check('  THE COURSE REACHES 100%: every activity done equals the advertised total',
          done.done === done.total && done.total > 0, done.text);
    /* The review is the only activity with no card, so before this it was possible to finish it
       and have NOTHING on the page change except a number. */
    check('  the review itself is marked done, not just counted',
          await page.evaluate(() => {
              const r = document.querySelector('.review-section');
              return !!(r && r.classList.contains('completed'));
          }), 'review section has no completed state');
    const fs2 = require('fs');
    const reviewSrc = fs2.readFileSync(path.resolve(ROOT,
        'houses/cloud/openstack/reviews/cloud-openstack-comprehensive-review.html'), 'utf8');
    const hook = reviewSrc.slice(reviewSrc.indexOf('onComplete:'));
    check('  the review page\'s onComplete actually records (not an empty function)',
          /ModuleProgress\.complete\(\s*'cloud'\s*,\s*'cloud-openstack-review'/.test(hook),
          'onComplete does not call ModuleProgress.complete with the id the hub reads');

    /* EVERY number on the page that claims an activity count, not just the one phrase I happened
       to check. The earlier version matched only "Complete all N activities" and went green while
       the hero stat block still read "13 Activities" and the counter's own initial text still said
       "0 / 13" (Chris found the first, the repo QC hook found the second). Verifying one instance
       and assuming the rest of the page agrees is how a wrong number survives a fix aimed at it. */
    const claims = await page.evaluate(() => {
        const out = [];
        const body = document.body.innerText || '';
        const phrase = body.match(/Complete all (\d+) activities/i);
        if (phrase) out.push({ where: 'about copy', n: Number(phrase[1]) });
        // stat blocks: a bare number whose sibling label names activities
        document.querySelectorAll('.exam-stat').forEach(st => {
            const label = (st.querySelector('.label') || {}).textContent || '';
            const value = (st.querySelector('.value') || {}).textContent || '';
            if (/activit/i.test(label) && /^\s*\d+\s*$/.test(value)) {
                out.push({ where: 'stat block "' + label.trim() + '"', n: Number(value) });
            }
        });
        // the counter itself
        const pt = (document.getElementById('progressText') || {}).textContent || '';
        const m = pt.match(/\d+\s*\/\s*(\d+)/);
        if (m) out.push({ where: 'progress counter', n: Number(m[1]) });
        return out;
    });
    /* FIRST PAINT, which the runtime check structurally cannot see. updateProgress overwrites
       the counter's text on load, so a stale literal in the markup is invisible to any assertion
       that runs after settle(). Proven: restoring "0 / 13 completed" produced ZERO failures in
       the runtime check. It is still wrong, because it is what the student reads for the instant
       before the script runs, and it is what a reviewer reads in the source. So the raw HTML is
       checked as shipped, against the `total` the script itself declares. */
    const rawHtml = await new Promise((resolve, reject) => {
        const lib = HUB.startsWith('https') ? require('https') : require('http');
        lib.get(HUB, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); })
           .on('error', reject);
    });
    const declared = (rawHtml.match(/const total = (\d+)/) || [])[1];
    const literals = [];
    const initial = rawHtml.match(/id="progressText"[^>]*>\s*\d+\s*\/\s*(\d+)/);
    if (initial) literals.push({ where: 'initial counter markup', n: Number(initial[1]) });
    const heroStat = rawHtml.match(/id="activityCount"[^>]*>\s*(\d+)\s*</);
    if (heroStat) literals.push({ where: 'hero stat markup', n: Number(heroStat[1]) });
    const copyLit = rawHtml.match(/Complete all (\d+) activities/i);
    if (copyLit) literals.push({ where: 'about copy markup', n: Number(copyLit[1]) });
    const staleLit = literals.filter(l => String(l.n) !== String(declared));
    check(`  no stale activity-count LITERAL in the shipped markup (${literals.length} checked, total=${declared})`,
          !!declared && literals.length >= 3 && staleLit.length === 0,
          staleLit.length ? staleLit.map(l => `${l.where} says ${l.n}`).join('; ') + ` but const total = ${declared}`
                          : `declared=${declared}, literals found=${literals.length}`);

    const wrong = claims.filter(c => c.n !== done.total);
    check(`  EVERY activity-count on the page agrees with the counter (${claims.length} found)`,
          claims.length >= 3 && wrong.length === 0,
          wrong.length ? wrong.map(w => `${w.where} says ${w.n}`).join('; ') + ` but total is ${done.total}`
                       : `only ${claims.length} claims found, expected at least 3`);

    /* ⚠ CAPTURE THE COMPLETED STUDENT **BEFORE** ANY OTHER PAGE TOUCHES THIS ORIGIN.
       localStorage is shared per origin across pages in one browser, so the failed-quiz page
       below overwrites it. When this capture sat after that page, the "completed student"
       blob was silently the 0% student and the cross-device phase failed for a reason that
       had nothing to do with the code under test. Same trap as feedback_the_harness_carried_state. */
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

    /* ── A FAILED QUIZ MUST NOT COMPLETE A CHAPTER (BUG-106) ─────────────────────────────
       This harness reported 48/48 while the hub counted a quiz as done whether the student
       passed or failed it, because finishQuiz() above always writes a PASSING score. It could
       not see the defect it was covering. A student who scored 0 on all four quizzes got four
       green cards and 11/12; with the review that is 100% with no correct quiz answer anywhere.

       So: seed exactly what a 0% submission leaves behind, on a clean page, and require the
       hub to refuse. Presentations and labs are seeded as genuinely done, so the only thing
       standing between this student and a green card is the quiz gate. */
    console.log('\n--- a student who FAILED every quiz ---');
    const failPage = await browser.newPage();
    const failErrors = [];
    failPage.on('pageerror', e => failErrors.push(String(e.message).slice(0, 110)));
    await failPage.evaluateOnNewDocument(() => {
        try {
            localStorage.clear();
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
            localStorage.setItem('hexworth_progress', JSON.stringify({ cloud: {
                'cloud-openstack-intro': { completed: true }, 'cloud-openstack-projects': { completed: true },
                'cloud-openstack-install': { completed: true }, 'cloud-openstack-operation': { completed: true },
                'cloud-openstack-install-lab': { completed: true }, 'cloud-openstack-launch-lab': { completed: true },
                'cloud-openstack-advanced-lab': { completed: true },
                // what ModuleProgress.completeQuiz writes for a FAILED quiz
                'openstack-intro-quiz': { completed: false, score: 0 },
                'openstack-projects-quiz': { completed: false, score: 0 },
                'openstack-install-quiz': { completed: false, score: 0 },
                'openstack-operation-quiz': { completed: false, score: 0 }
            }}));
            ['lesson1', 'lesson2', 'lesson3', 'lesson4'].forEach(k => {
                localStorage.setItem('hexworth_openstack_' + k + '_quiz_score', '0');
                localStorage.setItem('hexworth_openstack_' + k + '_quiz_passed', '0');
            });
        } catch (e) {}
    });
    await withRetry('hub load (failed-quiz student)', () => failPage.goto(HUB, NAV));
    await settle(900);
    const failed = await failPage.evaluate(() => ({
        cards: [...document.querySelectorAll('.module-card')].map(c => c.classList.contains('completed')),
        text: (document.getElementById('progressText') || {}).textContent || ''
    }));
    check('  0% on every quiz completes NO chapter', failed.cards.every(v => v === false),
          JSON.stringify(failed.cards) + ' ' + failed.text.trim());
    check('  and the counter credits only the presentations and labs (7)',
          /\b7\s*\/\s*12\b/.test(failed.text), failed.text.trim());
    check('  no page errors for the failing student', failErrors.length === 0, failErrors[0]);
    await failPage.close();

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
