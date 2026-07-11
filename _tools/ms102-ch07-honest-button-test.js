// Honesty test for ms102-ch07-teams.lab.html (task #72 Family B).
// Boots the REAL portal-sim lab and verifies the dishonest completions are replaced:
//   - T6/T9/T10 nav-only -> inline checkpoints reading the live panel DOM
//   - T1/T2/T3/T4 hollow Save/Create -> gated on the student actually engaging a control
//   - T8 weak search gate -> narrow-to-subset
// Oracle = window.completed (the lab's own global progress object).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve(__dirname, '../_app/houses/cloud/ms-102/labs/ms102-ch07-teams.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms102-ch07-test';

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
        // Click the option button with the given label inside a checkpoint card.
        function clickOpt(cardId, label) {
            var btns = document.querySelectorAll('#' + cardId + ' .cp-opt');
            for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === label) { btns[i].click(); return true; } }
            return false;
        }
        // Dispatch a change event that bubbles (so form/panel delegated listeners fire).
        function change(el) { el.dispatchEvent(new Event('change', { bubbles: true })); }
        // T1 create a messaging policy WITH a toggle actually configured
        document.getElementById('newMsgPolicyForm').style.display = 'block';
        document.getElementById('msgPolicyName').value = 'Restricted Users Policy';
        var dm = document.getElementById('deleteMsgToggle'); dm.checked = true; change(dm);
        createMsgPolicy();
        // T2 change a meeting toggle then save; T7 the same toggle IS the Cloud Recording task
        var rec = document.getElementById('recordingToggle'); rec.checked = true; change(rec);
        saveMeetingPolicy();
        // T3 toggle guest access then save
        var ga = document.getElementById('guestAccessToggle'); ga.checked = true; change(ga);
        saveGuestAccess();
        // T4 change the Microsoft apps permission level then save
        var ap = document.getElementById('msAppsPermission'); ap.value = 'block'; change(ap);
        saveAppPermissions();
        // T5 create an auto attendant (name + greeting)
        document.getElementById('autoAttendantForm').style.display = 'block';
        document.getElementById('aaNameInput').value = 'Main Line';
        var g = document.getElementById('aaGreeting'); g.value = 'text';
        createAutoAttendant();
        // T8 use the search to narrow to a specific team
        filterTeams('finance');
        // T6 / T9 / T10 checkpoints (correct answers read from the panels)
        clickOpt('cp6', '2');
        clickOpt('cp9', 'Student Policy');
        clickOpt('cp10', 'itsupport@contoso.onmicrosoft.com');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(happy.realErrors);
    results.happyAll10 = [1,2,3,4,5,6,7,8,9,10].every(n => happy.out[n] === true);

    // ---- NAV-ONLY no longer completes T6/T9/T10 ----
    const nav = await fresh(browser, async (page) => page.evaluate(() => {
        showPanel('teams'); showPanel('messaging'); showPanel('voice');
        return Object.assign({}, window.completed);
    }));
    allErrors = allErrors.concat(nav.realErrors);
    results.navDoesNotComplete = !nav.out[6] && !nav.out[9] && !nav.out[10];

    // ---- WRONG checkpoint answer: no completion, no elimination ----
    const wrong = await fresh(browser, async (page) => page.evaluate(() => {
        var btns = document.querySelectorAll('#cp6 .cp-opt');
        for (var i = 0; i < btns.length; i++) { if (btns[i].textContent.trim() === '0') { btns[i].click(); break; } }
        var anyDisabled = false; btns.forEach(function (b) { if (b.disabled) anyDisabled = true; });
        return { t6: !!window.completed[6], anyDisabled: anyDisabled };
    }));
    allErrors = allErrors.concat(wrong.realErrors);
    results.wrongDoesNotComplete = wrong.out.t6 === false;
    results.wrongNoElimination = wrong.out.anyDisabled === false;

    // ---- HOLLOW Save/Create: no engagement -> T1/T2/T3/T4 do NOT complete ----
    const hollow = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('msgPolicyName').value = 'Some Name'; // name but no toggle touched
        createMsgPolicy();
        saveMeetingPolicy();     // no meeting toggle changed
        saveGuestAccess();       // guest toggle not touched
        saveAppPermissions();    // apps level not changed
        return { t1: !!window.completed[1], t2: !!window.completed[2], t3: !!window.completed[3], t4: !!window.completed[4] };
    }));
    allErrors = allErrors.concat(hollow.realErrors);
    results.hollowBlocked = !hollow.out.t1 && !hollow.out.t2 && !hollow.out.t3 && !hollow.out.t4;

    // ---- REVERT-TO-DEFAULT: toggle then untoggle leaves the default -> must NOT complete (Nancy #1) ----
    const revert = await fresh(browser, async (page) => page.evaluate(() => {
        function change(el) { el.dispatchEvent(new Event('change', { bubbles: true })); }
        // T1: check deleteMsgToggle then uncheck it (net = default), enter a name, Create
        document.getElementById('newMsgPolicyForm').style.display = 'block';
        document.getElementById('msgPolicyName').value = 'Reverted Policy';
        var dm = document.getElementById('deleteMsgToggle'); dm.checked = true; change(dm); dm.checked = false; change(dm);
        createMsgPolicy();
        // T4: change apps level to block then back to allow (net = default), Save
        var ap = document.getElementById('msAppsPermission'); ap.value = 'block'; change(ap); ap.value = 'allow'; change(ap);
        saveAppPermissions();
        // T2: toggle recording on then off (net = default), Save meeting policy
        var rec = document.getElementById('recordingToggle'); rec.checked = true; change(rec); rec.checked = false; change(rec);
        saveMeetingPolicy();
        // T3: toggle guest access on then off (net = default), Save guest settings
        var ga = document.getElementById('guestAccessToggle'); ga.checked = true; change(ga); ga.checked = false; change(ga);
        saveGuestAccess();
        return { t1: !!window.completed[1], t2: !!window.completed[2], t3: !!window.completed[3], t4: !!window.completed[4] };
    }));
    allErrors = allErrors.concat(revert.realErrors);
    results.revertBlocked = !revert.out.t1 && !revert.out.t2 && !revert.out.t3 && !revert.out.t4;

    // ---- cp9 stays "Student Policy" after a student appends a Delete-Off policy (Nancy #2) ----
    const cp9 = await fresh(browser, async (page) => page.evaluate(() => {
        function change(el) { el.dispatchEvent(new Event('change', { bubbles: true })); }
        // Create a NEW policy whose Delete Messages is OFF, but satisfy T1 via a different toggle (Read receipts).
        document.getElementById('newMsgPolicyForm').style.display = 'block';
        document.getElementById('msgPolicyName').value = 'Zeta Policy';
        var checks = document.querySelectorAll('#newMsgPolicyForm input[type="checkbox"]');
        // deleteMsgToggle stays OFF; flip a non-delete toggle so the net-change gate passes
        var dm = document.getElementById('deleteMsgToggle');
        for (var i = 0; i < checks.length; i++) { if (checks[i] !== dm && !checks[i].checked) { checks[i].checked = true; change(checks[i]); break; } }
        createMsgPolicy();
        // The seeded "Student Policy" is still the FIRST Delete-Off row, so it remains the correct answer.
        var btns = document.querySelectorAll('#cp9 .cp-opt');
        for (var j = 0; j < btns.length; j++) { if (btns[j].textContent.trim() === 'Student Policy') { btns[j].click(); break; } }
        var rows = document.querySelectorAll('#msgPoliciesBody tr').length;
        return { t9: !!window.completed[9], rows: rows };
    }));
    allErrors = allErrors.concat(cp9.realErrors);
    results.cp9StableAfterAppend = cp9.out.t9 === true && cp9.out.rows === 3;

    // ---- T8 search: empty/gibberish/match-all do NOT complete; narrowing DOES ----
    const t8 = await fresh(browser, async (page) => page.evaluate(() => {
        filterTeams(''); var afterEmpty = !!window.completed[8];
        filterTeams('zzzznope'); var afterGibberish = !!window.completed[8]; // matches nothing
        filterTeams('manage'); var afterAll = !!window.completed[8];         // "Manage" button in every row
        filterTeams('phoenix'); var afterNarrow = !!window.completed[8];      // narrows to Project Phoenix
        return { afterEmpty: afterEmpty, afterGibberish: afterGibberish, afterAll: afterAll, afterNarrow: afterNarrow };
    }));
    allErrors = allErrors.concat(t8.realErrors);
    results.t8EmptyBlocked = t8.out.afterEmpty === false;
    results.t8GibberishBlocked = t8.out.afterGibberish === false;
    results.t8MatchAllBlocked = t8.out.afterAll === false;
    results.t8NarrowCompletes = t8.out.afterNarrow === true;

    // ---- Answer key NOT in markup ----
    results.noAnswerInMarkup = /answerCheckpoint\([0-9]+,\s*this\s*,\s*(true|false)\)/i.test(HTML) === false
        && /answerCheckpoint\([0-9]+,\s*this\)/.test(HTML);

    await browser.close();
    const pass = Object.keys(results).every(k => results[k] === true) && allErrors.length === 0;

    console.log('\n  ms102-ch07 honest-button test (task #72 Family B)\n');
    console.log('  happy path completes all 10        : ' + results.happyAll10 + '   (no false rejection / no stuck task)');
    console.log('  navigation no longer completes 6/9/10: ' + results.navDoesNotComplete);
    console.log('  wrong answer does not complete     : ' + results.wrongDoesNotComplete);
    console.log('  wrong answer does NOT eliminate    : ' + results.wrongNoElimination);
    console.log('  hollow Save/Create does NOT complete: ' + results.hollowBlocked + '   (T1/T2/T3/T4)');
    console.log('  revert-to-default does NOT complete: ' + results.revertBlocked + '   (Nancy #1, T1/T4)');
    console.log('  cp9 stable after Delete-Off append : ' + results.cp9StableAfterAppend + '   (Nancy #2)');
    console.log('  T8 empty does NOT complete         : ' + results.t8EmptyBlocked);
    console.log('  T8 gibberish does NOT complete     : ' + results.t8GibberishBlocked);
    console.log('  T8 match-all does NOT complete     : ' + results.t8MatchAllBlocked);
    console.log('  T8 narrowing DOES complete         : ' + results.t8NarrowCompletes);
    console.log('  no answer key in markup            : ' + results.noAnswerInMarkup);
    if (allErrors.length) { console.log('\n  PAGE ERRORS:'); allErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
