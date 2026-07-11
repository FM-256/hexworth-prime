// Functional test for the LinuxTerminal `cp` honesty fix (marathon backlog 2026-07-08):
// a `cp` whose source does NOT exist must emit an `lt-error` (like `mv` and real cp),
// NOT silently no-op — otherwise a completion guard of the form
// `!output.includes('lt-error')` marks the task complete when nothing was copied.
// Boots the REAL LinuxTerminal.js in a headless browser, drives it through its public
// execute() API using the engine's OWN file creation (no hand-built fs nodes), and uses
// getFs()/getCwd() as deterministic oracles. This test FAILS against the old
// silent-`continue` behavior (missing-source cp produced no error).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const SRC = fs.readFileSync(path.resolve(__dirname, '../_app/components/LinuxTerminal.js'), 'utf8');
const PAGE_URL = 'https://hexworth.com/__lt-cp-honesty-test';
const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<div id="terminal"></div>' +
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
        var out = {};
        // LinuxTerminal is a top-level `const` (not attached to window), so reference the
        // bare global-lexical binding, not window.LinuxTerminal.
        var T = (typeof LinuxTerminal !== 'undefined') ? LinuxTerminal : null;
        out.hasEngine = !!(T && typeof T.execute === 'function' && typeof T.getFs === 'function');
        if (!out.hasEngine) return out;

        T.init('CP-TEST', '#terminal', { suppressUnknown: true });
        var cwd = T.getCwd();
        var term = document.getElementById('terminal');

        function html() { return term.innerHTML; }            // raw rendered terminal HTML
        function keys() { return Object.keys(T.getFs()); }     // all filesystem path keys
        function fsHas(re) { return keys().some(function (k) { return re.test(k); }); }  // any fs path matches re?
        // Count 'cannot stat' occurrences in the whole terminal — unique to a cp/mv
        // missing-source error, so a rise attributes cleanly to the command we just ran
        // (more robust than slicing innerHTML, which re-renders rather than pure-appends).
        function cannotStatCount() { return (html().match(/cannot stat/g) || []).length; }

        // Create a real source file through the engine itself (correct node shape).
        T.execute('echo hi > real.txt');

        // --- Case B: PRESENT source copies, no error, dest exists ---
        var csB = cannotStatCount();
        T.execute('cp real.txt real_copy.txt');
        out.presentNoError = cannotStatCount() === csB;
        out.presentDestExists = fsHas(/\/real_copy\.txt$/);

        // --- Case A: MISSING source errors, dest NOT created (THE FIX) ---
        var csA = cannotStatCount();
        T.execute('cp missing.txt copy.txt');
        out.missingErrors = cannotStatCount() === csA + 1 && html().indexOf('lt-error') !== -1;
        out.missingDestAbsent = !fsHas(/\/copy\.txt$/);

        // --- Case C (regression): a glob over REAL (present) files must NOT trip the new
        // missing-source error branch — i.e. my change doesn't spuriously error on globs.
        // (Note: the actual glob-into-dir COPY is a separate pre-existing no-op, logged to
        // the marathon backlog — out of scope for this missing-source honesty fix, and
        // proven pre-existing by stashing this change. The success COPY path is already
        // covered by Case B's file-to-file copy above.)
        T.execute('echo a > a.txt');
        T.execute('mkdir d');
        var csC = cannotStatCount();
        T.execute('cp *.txt d/');
        out.globNoSpuriousError = cannotStatCount() === csC;

        return out;
    });

    await browser.close();

    // Aborted-favicon noise is expected (interceptor); filter like the sibling harnesses.
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = res.hasEngine && res.presentNoError && res.presentDestExists
        && res.missingErrors && res.missingDestAbsent
        && res.globNoSpuriousError && realErrors.length === 0;

    console.log('\n  LinuxTerminal cp honesty test (backlog 2026-07-08)\n');
    console.log('  engine loaded                    : ' + res.hasEngine);
    console.log('  PRESENT src -> no error           : ' + res.presentNoError);
    console.log('  PRESENT src -> dest created       : ' + res.presentDestExists);
    console.log('  MISSING src -> lt-error+cannot stat: ' + res.missingErrors + '   (the fix)');
    console.log('  MISSING src -> dest NOT created   : ' + res.missingDestAbsent);
    console.log('  glob over real files -> no spurious error: ' + res.globNoSpuriousError + '  (regression)');
    if (realErrors.length) { console.log('\n  PAGE ERRORS:'); realErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
