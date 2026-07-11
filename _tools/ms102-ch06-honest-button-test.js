// Honesty test for ms102-ch06-sharepoint.lab.html (task #72 Family B).
// Boots the REAL portal-sim lab, verifies checkpoints replaced the dishonest
// completions (T5/T6 nav-only, T9 hollow side-effect of T1), and that the honest
// happy path still completes all 10. Oracle = window.completed.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/cloud/ms-102/labs/ms102-ch06-sharepoint.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms102-ch06-test';

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

    // ---- HAPPY PATH: complete all 10 honestly ----
    const happy = await fresh(browser, async (page) => page.evaluate(() => {
        // Find the option button with the given label inside a checkpoint card and click it.
        function clickOpt(cardId, label) {
            var btns = document.querySelectorAll('#' + cardId + ' .cp-opt');
            for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === label) { btns[i].click(); return true; } }
            return false;
        }
        // T1 create the team site
        document.getElementById('siteNameInput').value = 'Marketing Hub';
        var a = document.getElementById('siteAddressInput'); if (a) a.value = 'marketinghub';
        var o = document.getElementById('siteOwnerInput'); if (o) o.value = 'owner@contoso.com';
        createSite();
        // T9 read the live updated Total Sites count and confirm it
        document.getElementById('cp9input').value = document.getElementById('totalSites').textContent.trim();
        verifyCheckpointInput(9, 'cp9input', 1);
        // T2 / T3 sharing — must actually change the level, then save (hollow Save no longer counts)
        var sl = document.getElementById('sharingLevel'); sl.value = 'existing-only'; sl.dispatchEvent(new Event('change', { bubbles: true }));
        saveSharingSettings();
        var od = document.getElementById('oneDriveSharingLevel'); od.value = 'existing-only'; od.dispatchEvent(new Event('change', { bubbles: true }));
        saveOneDriveSharing();
        // T4 quota — must enter a value different from the current quota (256 -> 512)
        openQuota('Contoso Intranet', 256);
        document.getElementById('quotaValueInput').value = 512; saveQuota();
        // T8 versioning toggle
        var v = document.getElementById('versioningToggle'); v.checked = true; v.dispatchEvent(new Event('change', { bubbles: true }));
        // T7 / T10 use the search fields (honest "use search" tasks)
        filterSites('hub');
        var us = document.querySelector('#panel-migration .table-search');
        if (us) { us.value = 'maria'; us.dispatchEvent(new Event('input', { bubbles: true })); }
        // T5 / T6 checkpoints (correct answers read from the panels)
        clickOpt('cp5', 'Maria Garcia');
        clickOpt('cp6', '2');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = [1,2,3,4,5,6,7,8,9,10].every(n => happy.out[n] === true);

    // ---- NAV-ONLY no longer completes T5/T6 ----
    const nav = await fresh(browser, async (page) => page.evaluate(() => {
        showPanel('deleted'); showPanel('migration');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(nav.realErrors);
    results.navDoesNotComplete = !nav.out[5] && !nav.out[6];

    // ---- WRONG answer: no completion, no elimination ----
    const wrong = await fresh(browser, async (page) => page.evaluate(() => {
        var btns = document.querySelectorAll('#cp5 .cp-opt');
        // "Alex Johnson" is 89.8% — near quota but NOT the closest (Maria 98.6%)
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === 'Alex Johnson') { btns[i].click(); break; } }
        var anyDisabled = false; btns.forEach(function (b) { if (b.disabled) anyDisabled = true; });
        return { t5: !!window.completed[5], anyDisabled: anyDisabled };
    }));
    allErrors = allErrors.concat(wrong.realErrors);
    results.wrongDoesNotComplete = wrong.out.t5 === false;
    results.wrongNoElimination = wrong.out.anyDisabled === false;

    // ---- HOLLOW SAVE: unchanged sharing/quota does NOT complete T2/T3/T4 (Chris block) ----
    const hollow = await fresh(browser, async (page) => page.evaluate(() => {
        saveSharingSettings();                 // Save with sharing level untouched
        saveOneDriveSharing();                 // Save with OneDrive level untouched
        openQuota('Legal', 256); saveQuota();  // Save quota left at its current value (256)
        return { t2: !!window.completed[2], t3: !!window.completed[3], t4: !!window.completed[4] };
    }));
    allErrors = allErrors.concat(hollow.realErrors);
    results.hollowSaveBlocked = !hollow.out.t2 && !hollow.out.t3 && !hollow.out.t4;

    // ---- T7: dropdown does NOT complete; match-all does NOT; narrowing search DOES ----
    const t7 = await fresh(browser, async (page) => page.evaluate(() => {
        filterSiteType('team'); var afterDropdown = !!window.completed[7];
        filterSites('sites'); var afterMatchAll = !!window.completed[7]; // '/sites/' is in every row
        filterSites('finance'); var afterNarrow = !!window.completed[7];  // narrows to Finance Team
        return { afterDropdown: afterDropdown, afterMatchAll: afterMatchAll, afterNarrow: afterNarrow };
    }));
    allErrors = allErrors.concat(t7.realErrors);
    results.t7DropdownBlocked = t7.out.afterDropdown === false;
    results.t7MatchAllBlocked = t7.out.afterMatchAll === false;
    results.t7NarrowCompletes = t7.out.afterNarrow === true;

    // ---- T10: broad match-all does NOT complete; empty does NOT; narrowing DOES ----
    const t10 = await fresh(browser, async (page) => page.evaluate(() => {
        function typeUser(v) {
            var el = document.querySelector('input[oninput="filterUsers(this.value)"]');
            el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        typeUser('2026'); var afterAll = !!window.completed[10];   // every user row has a 2026 date
        typeUser(''); var afterEmpty = !!window.completed[10];
        typeUser('maria'); var afterNarrow = !!window.completed[10];
        return { afterAll: afterAll, afterEmpty: afterEmpty, afterNarrow: afterNarrow };
    }));
    allErrors = allErrors.concat(t10.realErrors);
    results.t10MatchAllBlocked = t10.out.afterAll === false;
    results.t10EmptyBlocked = t10.out.afterEmpty === false;
    results.t10NarrowCompletes = t10.out.afterNarrow === true;

    // ---- T9 before T1: cannot complete ----
    const t9 = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('cp9input').value = '47';
        verifyCheckpointInput(9, 'cp9input', 1);
        return !!window.completed[9];
    }));
    allErrors = allErrors.concat(t9.realErrors);
    results.t9RequiresCreate = t9.out === false;

    // ---- Answer key NOT in markup ----
    results.noAnswerInMarkup = /answerCheckpoint\([0-9]+,\s*this\s*,\s*(true|false)\)/i.test(HTML) === false
        && /answerCheckpoint\([0-9]+,\s*this\)/.test(HTML);

    await browser.close();
    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ms102-ch06 honest-button test (task #72 Family B)\n');
    console.log('  happy path completes all 10        : ' + results.happyAll10 + '   (no false rejection / no stuck task)');
    console.log('  navigation no longer completes T5/6: ' + results.navDoesNotComplete);
    console.log('  wrong answer does not complete     : ' + results.wrongDoesNotComplete);
    console.log('  wrong answer does NOT eliminate    : ' + results.wrongNoElimination);
    console.log('  hollow Save/quota does NOT complete: ' + results.hollowSaveBlocked + '   (Chris T2/T3/T4)');
    console.log('  T7 dropdown does NOT complete      : ' + results.t7DropdownBlocked + '   (Nancy #2)');
    console.log('  T7 match-all search does NOT       : ' + results.t7MatchAllBlocked);
    console.log('  T7 narrowing search DOES complete  : ' + results.t7NarrowCompletes);
    console.log('  T10 match-all keystroke does NOT   : ' + results.t10MatchAllBlocked + '   (Nancy #1)');
    console.log('  T10 empty/backspace does NOT       : ' + results.t10EmptyBlocked);
    console.log('  T10 narrowing search DOES complete : ' + results.t10NarrowCompletes);
    console.log('  T9 requires the create (not before): ' + results.t9RequiresCreate);
    console.log('  no answer key in markup            : ' + results.noAnswerInMarkup);
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
