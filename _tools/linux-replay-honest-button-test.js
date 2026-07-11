// Functional test for the LinuxReplay honest-button fix (task #71): the wrapped
// ModuleProgress.complete must reveal the "Try this level again" button ONLY when the
// underlying completion actually persisted. TouristVisa wraps ModuleProgress.complete
// and returns false when the visa blocks the save; revealing the replay button (which
// tells the student "your completion is kept") for a completion that never saved is the
// same dishonest-button bug as the ch01 case. Boots the REAL LinuxReplay.js in a
// headless browser against a real origin (so localStorage/sessionStorage work) and
// drives the wrapper directly. This test FAILS against the old unconditional reveal().
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const SRC = fs.readFileSync(path.resolve(__dirname, '../_app/components/LinuxReplay.js'), 'utf8');
const PAGE_URL = 'https://hexworth.com/__linux-replay-honest-test';

// The page defines a controllable ModuleProgress.complete BEFORE LinuxReplay.js loads,
// so LinuxReplay wraps it. window.__mpReturn drives the inner return value (false =
// blocked/tourist, true = persisted). A hidden #replayBtn + .panel-tasks are present so
// reveal() has its target. We do NOT call setup() — this isolates the complete-wrapper.
const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<div class="panel-tasks"><button id="replayBtn" style="display:none"></button></div>' +
    '<script>window.__mpReturn = undefined;' +
    'window.ModuleProgress = { complete: function () { return window.__mpReturn; } };</script>' +
    '<script>\n' + SRC + '\n</script>' +
    '</body></html>';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; }
        req.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    const res = await page.evaluate(() => {
        function btnHidden() { return document.getElementById('replayBtn').style.display === 'none'; }
        var out = {};
        out.wrapped = !!(window.ModuleProgress.complete && window.ModuleProgress.complete.__linuxReplayWrapped);

        // Case A — completion BLOCKED (visa returned false): button must stay hidden.
        window.__mpReturn = false;
        document.getElementById('replayBtn').style.display = 'none';
        var rA = window.ModuleProgress.complete();
        out.blockedReturn = rA;
        out.hiddenWhenBlocked = btnHidden();   // expect TRUE (honest: no reveal)

        // Case B — completion PERSISTED (returned true): button must reveal.
        window.__mpReturn = true;
        document.getElementById('replayBtn').style.display = 'none';
        window.ModuleProgress.complete();
        out.shownWhenPersisted = !btnHidden();  // expect TRUE (revealed)

        // Case C — robustness: a non-false/absent return still reveals. The real
        // ModuleProgress.complete always returns true (ModuleProgress.js:647), so this
        // guards the predicate against any future/other return shape — only an explicit
        // false means blocked, everything else (undefined included) counts as persisted.
        window.__mpReturn = undefined;
        document.getElementById('replayBtn').style.display = 'none';
        window.ModuleProgress.complete();
        out.shownWhenUndefined = !btnHidden();  // expect TRUE
        return out;
    });

    await browser.close();

    // The interceptor aborts every non-PAGE_URL request (favicon etc.), which the page
    // intermittently logs as `net::ERR_FAILED`. That is expected harness noise, unrelated
    // to the wrapper logic — filter it out, same as the sibling render harnesses do.
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = res.wrapped && res.blockedReturn === false && res.hiddenWhenBlocked === true
        && res.shownWhenPersisted === true && res.shownWhenUndefined === true && realErrors.length === 0;

    console.log('\n  LinuxReplay honest-button test (task #71)\n');
    console.log('  complete() wrapped by LinuxReplay : ' + res.wrapped);
    console.log('  BLOCKED (returns false) -> hidden : ' + res.hiddenWhenBlocked + '  (honest: no reveal)');
    console.log('  PERSISTED (returns true) -> shown : ' + res.shownWhenPersisted);
    console.log('  SUCCESS (returns undefined)->shown: ' + res.shownWhenUndefined + '  (only explicit false blocks)');
    if (errors.length) { console.log('\n  PAGE ERRORS:'); errors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
