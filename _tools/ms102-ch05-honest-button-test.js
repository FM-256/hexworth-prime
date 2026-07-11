// Honesty test for ms102-ch05-exchange.lab.html (task #72 Family B, pattern-setting lab).
// Boots the REAL portal-sim lab and verifies the checkpoint mechanism: nav no longer
// auto-completes tasks, checkpoints require reading the live panel, wrong answers don't
// eliminate, answers aren't in the markup, and the honest happy path still completes all 10.
// Oracle = window.completed (the lab's own global progress object).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/cloud/ms-102/labs/ms102-ch05-exchange.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms102-ch05-test';

// Open a fresh copy of the lab (fresh localStorage/state per page) and hand it to fn(page).
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
    // localStorage is per-origin — clear it before the lab's init() runs so each scenario
    // starts fresh and one scenario's saved progress can't leak into the next.
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
        // T1 create the shared mailbox
        document.getElementById('mbDisplayName').value = 'IT Support Team';
        document.getElementById('mbEmail').value = 'itsupport';
        createSharedMailbox();
        // T6 read the live updated count and confirm it
        document.getElementById('cp6input').value = document.getElementById('sharedCount').textContent.trim();
        verifyCheckpointInput(6, 'cp6input', 1);
        // T2 permissions
        document.getElementById('toggleSendAs').checked = true;
        savePermissions();
        // T3 mail flow rule
        document.getElementById('ruleNameInput').value = 'Block Big Attachments';
        document.getElementById('ruleCondition').value = 'attachment';
        var ra = document.getElementById('ruleAction'); ra.value = ra.querySelector('option:not([value=""])') ? ra.querySelector('option:not([value=""])').value : ra.options[1].value;
        createMailFlowRule();
        // T4 quarantine
        markQuarantineReviewed();
        // T5 anti-spam
        document.getElementById('hcSpamToggle').checked = true;
        saveAntiSpam();
        // T7 filter by Shared
        filterType('shared');
        // T8/T9/T10 checkpoints (correct answers, read from the panels)
        clickOpt('cp8', 'Block Macro Attachments');
        clickOpt('cp9', '312');
        clickOpt('cp10', 'Indefinite');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = [1,2,3,4,5,6,7,8,9,10].every(n => happy.out[n] === true);

    // ---- NAV-ONLY no longer auto-completes ----
    const nav = await fresh(browser, async (page) => page.evaluate(() => {
        showPanel('mailflow'); showPanel('protection'); showPanel('compliance'); showPanel('recipients');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(nav.realErrors);
    results.navDoesNotComplete = !nav.out[8] && !nav.out[9] && !nav.out[10];

    // ---- WRONG answer: no completion, and NO elimination (all options stay enabled) ----
    const wrong = await fresh(browser, async (page) => page.evaluate(() => {
        var btns = document.querySelectorAll('#cp8 .cp-opt');
        btns[0].click(); // "Encrypt External Finance Mail" — wrong
        var anyDisabled = false; btns.forEach(function (b) { if (b.disabled) anyDisabled = true; });
        return { t8: !!(window.completed[8]), anyDisabled: anyDisabled };
    }));
    allErrors = allErrors.concat(wrong.realErrors);
    results.wrongDoesNotComplete = wrong.out.t8 === false;
    results.wrongNoElimination = wrong.out.anyDisabled === false;

    // ---- T7 wrong value (User) does not complete; then Shared does ----
    const t7 = await fresh(browser, async (page) => page.evaluate(() => {
        filterType('user'); var afterUser = !!window.completed[7];
        filterType('shared'); var afterShared = !!window.completed[7];
        return { afterUser: afterUser, afterShared: afterShared };
    }));
    allErrors = allErrors.concat(t7.realErrors);
    results.t7WrongBlocked = t7.out.afterUser === false;
    results.t7SharedCompletes = t7.out.afterShared === true;

    // ---- T6 before T1: cannot complete (requires the create) ----
    const t6 = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('cp6input').value = '12';
        verifyCheckpointInput(6, 'cp6input', 1);
        return !!window.completed[6];
    }));
    allErrors = allErrors.concat(t6.realErrors);
    results.t6RequiresCreate = t6.out === false;

    // ---- Answer key is NOT in the markup (no boolean flags in checkpoint onclicks) ----
    const markupClean = /answerCheckpoint\([0-9]+,\s*this\s*,\s*(true|false)\)/i.test(HTML) === false
        && /answerCheckpoint\([0-9]+,\s*this\)/.test(HTML);
    results.noAnswerInMarkup = markupClean;

    await browser.close();
    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ms102-ch05 honest-button test (task #72 Family B)\n');
    console.log('  happy path completes all 10        : ' + results.happyAll10 + '   (no false rejection / no stuck task)');
    console.log('  navigation no longer auto-completes: ' + results.navDoesNotComplete);
    console.log('  wrong answer does not complete     : ' + results.wrongDoesNotComplete);
    console.log('  wrong answer does NOT eliminate    : ' + results.wrongNoElimination + '   (Nancy #2)');
    console.log('  T7 wrong value (User) blocked      : ' + results.t7WrongBlocked);
    console.log('  T7 Shared completes                : ' + results.t7SharedCompletes);
    console.log('  T6 requires the create (not before): ' + results.t6RequiresCreate);
    console.log('  no answer key in markup            : ' + results.noAnswerInMarkup + '   (Nancy #1)');
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
