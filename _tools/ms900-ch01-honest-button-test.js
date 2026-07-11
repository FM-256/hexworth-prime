// Honesty test for ms900-ch01-cloud-m365.lab.html (task #72 Family B).
// Boots the REAL portal-sim lab and verifies: T10 nav-only replaced by a Home dashboard
// checkpoint, T7 weak search tightened to narrow-to-subset, T8 tightened to the Unlicensed
// filter specifically, and T9 no longer completes T2 as a side effect. Oracle = window.completed.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/cloud/ms-900/labs/ms900-ch01-cloud-m365.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms900-ch01-test';

// Open a fresh copy of the lab (localStorage cleared before load so scenarios don't bleed).
async function fresh(browser, fn) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; }
        req.abort();
    });
    await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#task1');
    const out = await fn(page);
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch|AccessGuard is not defined/i.test(e));
    await page.close();
    return { out, realErrors };
}

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const results = {};
    let allErrors = [];

    // ---- HAPPY PATH: complete all 10 honestly via the real DOM triggers ----
    const happy = await fresh(browser, async (page) => page.evaluate(() => {
        function click(sel) { var el = document.querySelector(sel); if (el) el.click(); }
        function clickOpt(cardId, label) {
            var btns = document.querySelectorAll('#' + cardId + ' .cp-opt');
            for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === label) { btns[i].click(); return true; } }
            return false;
        }
        click('[onclick="markDone(1)"]');            // T1 Add User
        click('[onclick="markDone(2)"]');            // T2 View a service
        click('[onclick="markDone(3)"]');            // T3 Review License Details
        click('.msg-card');                          // T4 read a Message Center message
        click('[onclick="markDone(5)"]');            // T5 New Group
        var t = document.getElementById('secDefaultsToggle'); t.checked = !t.checked; t.dispatchEvent(new Event('change', { bubbles: true })); // T6 toggle Security Defaults
        filterUsers('maria');                        // T7 search narrows to one user
        filterLicenseStatus('unlicensed');           // T8 Unlicensed filter
        click('[onclick="viewHealthIncident()"]');   // T9 View Incident on Teams
        clickOpt('cp10', '231');                     // T10 Home dashboard checkpoint
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = [1,2,3,4,5,6,7,8,9,10].every(n => happy.out[n] === true);

    // ---- NAV-ONLY no longer completes T10 ----
    const nav = await fresh(browser, async (page) => page.evaluate(() => {
        showPanel('users'); showPanel('home');
        return !!window.completed[10];
    }));
    allErrors = allErrors.concat(nav.realErrors);
    results.navDoesNotComplete = nav.out === false;

    // ---- WRONG checkpoint answer: no completion, no elimination ----
    const wrong = await fresh(browser, async (page) => page.evaluate(() => {
        var btns = document.querySelectorAll('#cp10 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === '247') { btns[i].click(); break; } } // Active Users, not Licenses Assigned
        var anyDisabled = false; btns.forEach(function (b) { if (b.disabled) anyDisabled = true; });
        return { t10: !!window.completed[10], anyDisabled: anyDisabled };
    }));
    allErrors = allErrors.concat(wrong.realErrors);
    results.wrongDoesNotComplete = wrong.out.t10 === false;
    results.wrongNoElimination = wrong.out.anyDisabled === false;

    // ---- T7 search: empty / gibberish / match-all do NOT complete; narrowing DOES ----
    const t7 = await fresh(browser, async (page) => page.evaluate(() => {
        filterUsers(''); var e = !!window.completed[7];
        filterUsers('zzzznope'); var g = !!window.completed[7];   // matches nothing
        filterUsers('contoso'); var a = !!window.completed[7];    // @contoso.com in every row
        filterUsers('maria'); var n = !!window.completed[7];      // narrows to one
        return { e: e, g: g, a: a, n: n };
    }));
    allErrors = allErrors.concat(t7.realErrors);
    results.t7EmptyBlocked = t7.out.e === false;
    results.t7GibberishBlocked = t7.out.g === false;
    results.t7MatchAllBlocked = t7.out.a === false;
    results.t7NarrowCompletes = t7.out.n === true;

    // ---- T8 filter: only the Unlicensed filter completes it, not Licensed/Blocked ----
    const t8 = await fresh(browser, async (page) => page.evaluate(() => {
        filterLicenseStatus('licensed'); var l = !!window.completed[8];
        filterLicenseStatus('blocked'); var b = !!window.completed[8];
        filterLicenseStatus('unlicensed'); var u = !!window.completed[8];
        return { l: l, b: b, u: u };
    }));
    allErrors = allErrors.concat(t8.realErrors);
    results.t8OtherFiltersBlocked = t8.out.l === false && t8.out.b === false;
    results.t8UnlicensedCompletes = t8.out.u === true;

    // ---- T9 no longer completes T2 as a side effect (decoupled) ----
    const t9 = await fresh(browser, async (page) => page.evaluate(() => {
        viewHealthIncident();
        return { t2: !!window.completed[2], t9: !!window.completed[9] };
    }));
    allErrors = allErrors.concat(t9.realErrors);
    results.t9DoesNotCompleteT2 = t9.out.t2 === false && t9.out.t9 === true;

    // ---- RESUME PATH: a pre-completed T10 restores as answered (exercises restoreCheckpoints) ----
    const rp = await browser.newPage();
    await rp.setRequestInterception(true);
    rp.on('request', req => { if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; } req.abort(); });
    // Seed a prior completion into this origin's localStorage BEFORE the lab's init() runs.
    await rp.evaluateOnNewDocument((key) => { try { localStorage.setItem(key, JSON.stringify({ '10': true })); } catch (e) {} }, 'ms900_ch01_m365_progress');
    await rp.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await rp.waitForSelector('#cp10');
    const resume = await rp.evaluate(() => {
        var btns = document.querySelectorAll('#cp10 .cp-opt');
        var allDisabled = true, correctHighlighted = false;
        btns.forEach(function (b) { if (!b.disabled) allDisabled = false; if (b.textContent.trim() === '231' && b.classList.contains('cp-correct')) correctHighlighted = true; });
        var res = document.querySelector('#cp10 .cp-result');
        return { t10: !!window.completed[10], allDisabled: allDisabled, correctHighlighted: correctHighlighted, resultText: res ? res.textContent : '' };
    });
    await rp.close();
    results.resumeRestoresAnswered = resume.t10 === true && resume.allDisabled && resume.correctHighlighted && /Completed/.test(resume.resultText);

    // ---- Answer key NOT in markup ----
    results.noAnswerInMarkup = /answerCheckpoint\([0-9]+,\s*this\s*,\s*(true|false)\)/i.test(HTML) === false
        && /answerCheckpoint\([0-9]+,\s*this\)/.test(HTML);

    await browser.close();
    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ms900-ch01 honest-button test (task #72 Family B)\n');
    console.log('  happy path completes all 10        : ' + results.happyAll10 + '   (no false rejection / no stuck task)');
    console.log('  navigation no longer completes T10 : ' + results.navDoesNotComplete);
    console.log('  wrong answer does not complete     : ' + results.wrongDoesNotComplete);
    console.log('  wrong answer does NOT eliminate    : ' + results.wrongNoElimination);
    console.log('  T7 empty/gibberish/match-all block : ' + (results.t7EmptyBlocked && results.t7GibberishBlocked && results.t7MatchAllBlocked));
    console.log('  T7 narrowing DOES complete         : ' + results.t7NarrowCompletes);
    console.log('  T8 Licensed/Blocked do NOT complete: ' + results.t8OtherFiltersBlocked);
    console.log('  T8 Unlicensed DOES complete        : ' + results.t8UnlicensedCompletes);
    console.log('  T9 no longer completes T2          : ' + results.t9DoesNotCompleteT2);
    console.log('  resume path restores answered state: ' + results.resumeRestoresAnswered + '   (restoreCheckpoints)');
    console.log('  no answer key in markup            : ' + results.noAnswerInMarkup);
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
