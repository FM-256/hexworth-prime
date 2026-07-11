// Honesty test for ms102-ch08-security-compliance.lab.html (task #72 Family B).
// Boots the REAL portal-sim lab and verifies the five nav-only completions (T6-T10) are
// replaced by inline checkpoints reading the live panel DOM, while the honest happy path
// still completes all 10. Also proves the cp8 (built-in-scoped) and cp9 (DOM-order) resolvers
// stay correct after a student appends rows to those tables. Oracle = window.completed.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/cloud/ms-102/labs/ms102-ch08-security-compliance.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms102-ch08-test';

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
        function clickOpt(cardId, label) {
            var btns = document.querySelectorAll('#' + cardId + ' .cp-opt');
            for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === label) { btns[i].click(); return true; } }
            return false;
        }
        function setSel(id, val) { document.getElementById(id).value = val; }
        // T1 click View Improvement Actions
        viewImprovements();
        // T2 create a DLP policy (name + template + action all required)
        setSel('dlpPolicyName', 'Protect PII'); setSel('dlpTemplate', 'pii'); setSel('dlpAction', 'block');
        createDlpPolicy();
        // T3 create a sensitivity label (name + protection) — appended row has NO data-seed
        setSel('labelName', 'Restricted'); setSel('labelProtection', 'both');
        createSensitivityLabel();
        // T4 create a retention policy (name + period)
        setSel('retentionName', 'Legal Hold 10yr'); setSel('retentionPeriod', '10');
        createRetentionPolicy();
        // T5 run an eDiscovery search (case + keywords)
        setSel('eDiscoveryCase', 'HR Case'); setSel('eDiscoveryKeywords', 'salary');
        runEDiscoverySearch();
        // T6-T10 checkpoints (correct answers read from the panels)
        clickOpt('cp6', '82/100');
        clickOpt('cp7', 'GDPR Personal Data');
        clickOpt('cp8', 'Highly Confidential');
        clickOpt('cp9', 'Finance Litigation Hold');
        clickOpt('cp10', '4,218');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = [1,2,3,4,5,6,7,8,9,10].every(n => happy.out[n] === true);

    // ---- NAV-ONLY no longer completes T6-T10 ----
    const nav = await fresh(browser, async (page) => page.evaluate(() => {
        showPanel('compliance'); showPanel('dlp'); showPanel('labels'); showPanel('retention'); showPanel('ediscovery');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(nav.realErrors);
    results.navDoesNotComplete = !nav.out[6] && !nav.out[7] && !nav.out[8] && !nav.out[9] && !nav.out[10];

    // ---- WRONG checkpoint answer: no completion, no elimination ----
    const wrong = await fresh(browser, async (page) => page.evaluate(() => {
        var btns = document.querySelectorAll('#cp6 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === '70/100') { btns[i].click(); break; } } // overall score, not GDPR
        var anyDisabled = false; btns.forEach(function (b) { if (b.disabled) anyDisabled = true; });
        return { t6: !!window.completed[6], anyDisabled: anyDisabled };
    }));
    allErrors = allErrors.concat(wrong.realErrors);
    results.wrongDoesNotComplete = wrong.out.t6 === false;
    results.wrongNoElimination = wrong.out.anyDisabled === false;

    // ---- cp8 stays "Highly Confidential" after a student appends a higher-priority-number label ----
    const cp8 = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('labelName').value = 'Zeta Label';
        document.getElementById('labelProtection').value = 'encrypt';
        createSensitivityLabel(); // appended row gets priority 4 (> seeded max 3) but has no data-seed
        var btns = document.querySelectorAll('#cp8 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === 'Highly Confidential') { btns[i].click(); break; } }
        return { t8: !!window.completed[8], rows: document.querySelectorAll('#labelsBody tr').length };
    }));
    allErrors = allErrors.concat(cp8.realErrors);
    results.cp8StableAfterAppend = cp8.out.t8 === true && cp8.out.rows === 5;

    // ---- cp9 stays "Finance Litigation Hold" after a student appends another indefinite policy ----
    const cp9 = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('retentionName').value = 'Zeta Indefinite Hold';
        document.getElementById('retentionPeriod').value = 'indefinite';
        createRetentionPolicy(); // appended indefinite row comes AFTER the seeded one in DOM order
        var btns = document.querySelectorAll('#cp9 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === 'Finance Litigation Hold') { btns[i].click(); break; } }
        return { t9: !!window.completed[9], rows: document.querySelectorAll('#retentionBody tr').length };
    }));
    allErrors = allErrors.concat(cp9.realErrors);
    results.cp9StableAfterAppend = cp9.out.t9 === true && cp9.out.rows === 4;

    // ---- cp10 stays "4,218" even when a student PREPENDS a case named "Compliance Audit ..." (Nancy #1) ----
    const cp10 = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('eDiscoveryCase').value = 'Compliance Audit Follow-up'; // collides with seeded name, prepends
        document.getElementById('eDiscoveryKeywords').value = 'fraud';
        runEDiscoverySearch();
        var btns = document.querySelectorAll('#cp10 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === '4,218') { btns[i].click(); break; } }
        return { t10: !!window.completed[10], firstRow: document.querySelector('#eDiscoveryBody tr td').textContent };
    }));
    allErrors = allErrors.concat(cp10.realErrors);
    // The student row is first in DOM (prepended), proving the resolver must scope to seeded rows, not first-match.
    results.cp10StableAfterPrepend = cp10.out.t10 === true && /Follow-up/.test(cp10.out.firstRow);

    // ---- NEGATIVE PATH: create with a required field blank does NOT complete T2-T5 (Nancy #2) ----
    const neg = await fresh(browser, async (page) => page.evaluate(() => {
        // T2: name + template but NO action
        document.getElementById('dlpPolicyName').value = 'X'; document.getElementById('dlpTemplate').value = 'pii'; document.getElementById('dlpAction').value = '';
        createDlpPolicy();
        // T3: name but NO protection
        document.getElementById('labelName').value = 'X'; document.getElementById('labelProtection').value = '';
        createSensitivityLabel();
        // T4: name but NO period
        document.getElementById('retentionName').value = 'X'; document.getElementById('retentionPeriod').value = '';
        createRetentionPolicy();
        // T5: case but NO keywords
        document.getElementById('eDiscoveryCase').value = 'X'; document.getElementById('eDiscoveryKeywords').value = '';
        runEDiscoverySearch();
        return { t2: !!window.completed[2], t3: !!window.completed[3], t4: !!window.completed[4], t5: !!window.completed[5] };
    }));
    allErrors = allErrors.concat(neg.realErrors);
    results.createGatesBlockBlank = !neg.out.t2 && !neg.out.t3 && !neg.out.t4 && !neg.out.t5;

    // ---- Answer key NOT in markup ----
    results.noAnswerInMarkup = /answerCheckpoint\([0-9]+,\s*this\s*,\s*(true|false)\)/i.test(HTML) === false
        && /answerCheckpoint\([0-9]+,\s*this\)/.test(HTML);

    await browser.close();
    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ms102-ch08 honest-button test (task #72 Family B)\n');
    console.log('  happy path completes all 10        : ' + results.happyAll10 + '   (no false rejection / no stuck task)');
    console.log('  navigation no longer completes 6-10: ' + results.navDoesNotComplete);
    console.log('  wrong answer does not complete     : ' + results.wrongDoesNotComplete);
    console.log('  wrong answer does NOT eliminate    : ' + results.wrongNoElimination);
    console.log('  cp8 stable after label append      : ' + results.cp8StableAfterAppend + '   (built-in-scoped resolver)');
    console.log('  cp9 stable after indefinite append : ' + results.cp9StableAfterAppend + '   (DOM-order resolver)');
    console.log('  cp10 stable after colliding prepend: ' + results.cp10StableAfterPrepend + '   (Nancy #1, seeded-scoped)');
    console.log('  create gates block blank fields    : ' + results.createGatesBlockBlank + '   (Nancy #2, T2-T5)');
    console.log('  no answer key in markup            : ' + results.noAnswerInMarkup);
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
