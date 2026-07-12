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

        // --- Case C (regression): a glob over REAL (present) files must NOT trip the
        // missing-source error branch — i.e. the fix doesn't spuriously error on globs.
        T.execute('echo a > a.txt');
        T.execute('mkdir d');
        var csC = cannotStatCount();
        T.execute('cp *.txt d/');
        out.globNoSpuriousError = cannotStatCount() === csC;

        // --- Case D (the glob-into-dir COPY fix, marathon backlog 2026-07-11): `cp *.txt dir/`
        // must actually PLACE the matching files INTO the directory — previously _expandGlob
        // ignored the pattern and returned every child, so cp aborted on the first sibling dir
        // and copied nothing. Assert both the positive copy AND that the glob is now selective:
        // .txt files land, a non-.txt sibling (readme.md) and a sibling directory do NOT.
        function childrenOf(dirName) {                        // the children array of a dir under cwd
            var node = T.getFs()[cwd === '/' ? '/' + dirName : cwd + '/' + dirName];
            return (node && node.children) || [];
        }
        T.execute('echo r > readme.md');                     // a non-.txt sibling that must NOT be copied
        T.execute('echo s > .secret.txt');                   // a HIDDEN file that DOES match *.txt by suffix —
                                                             // only the dotfile rule (not the suffix) can exclude it,
                                                             // so this assertion actually exercises the dot filter
        T.execute('mkdir sub');                              // a sibling directory that must NOT be copied
        T.execute('mkdir dst');
        T.execute('cp *.txt dst/');
        var dst = childrenOf('dst');
        out.globCopiedTxtFiles = dst.indexOf('a.txt') !== -1;   // a real .txt file actually landed
        out.globExcludedNonTxt = dst.indexOf('readme.md') === -1; // pattern is selective, not "all children"
        out.globExcludedSiblingDir = dst.indexOf('sub') === -1;   // no dir copied without -r
        out.globExcludedDotfiles = dst.indexOf('.secret.txt') === -1; // bash: * skips hidden files even when they match the suffix

        return out;
    });

    await browser.close();

    // Aborted-favicon noise is expected (interceptor); filter like the sibling harnesses.
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = res.hasEngine && res.presentNoError && res.presentDestExists
        && res.missingErrors && res.missingDestAbsent
        && res.globNoSpuriousError
        && res.globCopiedTxtFiles && res.globExcludedNonTxt
        && res.globExcludedSiblingDir && res.globExcludedDotfiles
        && realErrors.length === 0;

    console.log('\n  LinuxTerminal cp honesty test (backlog 2026-07-08 + glob-copy 2026-07-11)\n');
    console.log('  engine loaded                    : ' + res.hasEngine);
    console.log('  PRESENT src -> no error           : ' + res.presentNoError);
    console.log('  PRESENT src -> dest created       : ' + res.presentDestExists);
    console.log('  MISSING src -> lt-error+cannot stat: ' + res.missingErrors + '   (the fix)');
    console.log('  MISSING src -> dest NOT created   : ' + res.missingDestAbsent);
    console.log('  glob over real files -> no spurious error: ' + res.globNoSpuriousError + '  (regression)');
    console.log('  cp *.txt dir/ -> .txt files LAND in dir : ' + res.globCopiedTxtFiles + '  (the glob-copy fix)');
    console.log('  cp *.txt dir/ -> non-.txt NOT copied    : ' + res.globExcludedNonTxt);
    console.log('  cp *.txt dir/ -> sibling dir NOT copied : ' + res.globExcludedSiblingDir);
    console.log('  cp *.txt dir/ -> dotfiles NOT copied    : ' + res.globExcludedDotfiles);
    if (realErrors.length) { console.log('\n  PAGE ERRORS:'); realErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
