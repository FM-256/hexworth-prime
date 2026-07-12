// Functional test for the LinuxTerminal `mv` glob-source fix (marathon backlog 2026-07-12):
// `mv *.log dir/` previously moved NOTHING — _mv resolved the glob as a literal path, failed the
// existence check, and short-circuited to `cannot stat '*.log'`. This harness boots the REAL engine
// in a headless browser, drives it through the public execute() API using the engine's OWN file
// creation, and uses getFs() as the oracle. It FAILS against the pre-fix _mv (glob move = no-op).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const SRC = fs.readFileSync(path.resolve(__dirname, '../_app/components/LinuxTerminal.js'), 'utf8');
const PAGE_URL = 'https://hexworth.com/__lt-mv-glob-test';
const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<div id="terminal"></div><script>\n' + SRC + '\n</script></body></html>';

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
        const out = {};
        const T = (typeof LinuxTerminal !== 'undefined') ? LinuxTerminal : null;
        out.hasEngine = !!(T && typeof T.execute === 'function' && typeof T.getFs === 'function');
        if (!out.hasEngine) return out;

        T.init('MV-TEST', '#terminal', { suppressUnknown: true });
        const cwd = T.getCwd();
        const term = document.getElementById('terminal');
        function html() { return term.innerHTML; }
        function keys() { return Object.keys(T.getFs()); }
        function fsHas(re) { return keys().some(k => re.test(k)); }
        function childrenOf(dirName) {                         // children array of a dir under cwd
            const node = T.getFs()[cwd === '/' ? '/' + dirName : cwd + '/' + dirName];
            return (node && node.children) || [];
        }
        function cannotStatCount() { return (html().match(/cannot stat/g) || []).length; }

        // --- Case A (regression): a LITERAL single move still works and removes the original ---
        T.execute('echo hi > a.txt');
        T.execute('mv a.txt b.txt');
        out.literalMovedToDest = fsHas(/\/b\.txt$/);
        out.literalRemovedSource = !fsHas(/\/a\.txt$/);

        // --- Case B (the fix): `mv *.log dir/` MOVES the .log files INTO dir AND removes them from
        // the source; a non-.log sibling stays put; a suffix-matching hidden file is not moved. ---
        T.execute('echo 1 > one.log');
        T.execute('echo 2 > two.log');
        T.execute('echo keep > notes.txt');                   // non-.log sibling: must NOT move
        T.execute('echo s > .secret.log');                    // hidden, matches *.log by suffix: must NOT move
        T.execute('mkdir logs');
        const csB = cannotStatCount();
        T.execute('mv *.log logs/');
        out.globNoSpuriousError = cannotStatCount() === csB;   // no false cannot-stat on a real glob
        const inLogs = childrenOf('logs');
        out.globMovedIntoDir = inLogs.indexOf('one.log') !== -1 && inLogs.indexOf('two.log') !== -1;
        out.globRemovedFromSource = !(
            keys().some(k => k === (cwd + '/one.log')) || keys().some(k => k === (cwd + '/two.log'))
        );                                                     // originals no longer at the cwd top level (fs keys)
        // The source dir's OWN children[] array must also be cleaned, not just the fs key — else a
        // stale name would ghost-list under `ls` while the file is gone from getFs(). (Nancy gap.)
        const cwdChildren = (T.getFs()[cwd] && T.getFs()[cwd].children) || [];
        out.globSourceChildrenClean = cwdChildren.indexOf('one.log') === -1 && cwdChildren.indexOf('two.log') === -1;
        out.globLeftNonMatch = fsHas(/\/notes\.txt$/);         // notes.txt still exists (not moved)
        out.globLeftHidden = inLogs.indexOf('.secret.log') === -1; // dotfile not swept in

        // --- Case C (honesty): a MISSING glob/source errors and moves nothing ---
        const csC = cannotStatCount();
        T.execute('mkdir dst');
        T.execute('mv missing.log dst/');
        out.missingErrors = cannotStatCount() === csC + 1 && html().indexOf('lt-error') !== -1;
        out.missingDestEmpty = childrenOf('dst').length === 0;

        return out;
    });

    await browser.close();
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = res.hasEngine
        && res.literalMovedToDest && res.literalRemovedSource
        && res.globNoSpuriousError && res.globMovedIntoDir && res.globRemovedFromSource
        && res.globSourceChildrenClean && res.globLeftNonMatch && res.globLeftHidden
        && res.missingErrors && res.missingDestEmpty
        && realErrors.length === 0;

    console.log('\n  LinuxTerminal mv glob-source test (backlog 2026-07-12)\n');
    console.log('  engine loaded                      : ' + res.hasEngine);
    console.log('  literal mv -> dest created          : ' + res.literalMovedToDest);
    console.log('  literal mv -> source removed        : ' + res.literalRemovedSource);
    console.log('  mv *.log dir/ -> no spurious error  : ' + res.globNoSpuriousError);
    console.log('  mv *.log dir/ -> .log files MOVED in: ' + res.globMovedIntoDir + '  (the fix)');
    console.log('  mv *.log dir/ -> sources removed    : ' + res.globRemovedFromSource);
    console.log('  mv *.log dir/ -> source children[] clean: ' + res.globSourceChildrenClean);
    console.log('  mv *.log dir/ -> non-.log stays     : ' + res.globLeftNonMatch);
    console.log('  mv *.log dir/ -> hidden NOT moved   : ' + res.globLeftHidden);
    console.log('  missing source -> lt-error          : ' + res.missingErrors);
    console.log('  missing source -> dest empty        : ' + res.missingDestEmpty);
    if (realErrors.length) { console.log('\n  PAGE ERRORS:'); realErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
