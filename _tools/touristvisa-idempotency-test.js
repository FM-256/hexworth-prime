// Functional test for the TouristVisa per-method idempotency guard (marathon backlog 2026-07-11):
// installBlockers() schedules tryInstall() up to 3x per page (immediate + DOMContentLoaded +
// setTimeout), and wrapIfExists had no guard — so a method already defined at first pass was wrapped
// multiple times (layered duplicate blockers). The fix adds a __touristWrapped flag (mirroring
// LinuxReplay's __linuxReplayWrapped) so TouristVisa adds at most one layer across a contiguous run
// of its own passes. (An external wrapper landing BETWEEN passes can still add a second, harmless
// layer — the interleave case below asserts that stays CORRECT, not that depth is 1.)
//
// Oracle for "wrapped once": on the pass-through path (NOT tourist), every wrapper layer calls
// isActive(), which reads localStorage.getItem('hexworth_tourist_active'). So the number of reads of
// that key during ONE ModuleProgress.complete() call equals the wrap depth. Boots the REAL component
// in a headless browser. This FAILS against the pre-fix wrapIfExists (depth 2 from immediate +
// setTimeout).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const SRC = fs.readFileSync(path.resolve(__dirname, '../_app/components/TouristVisa.js'), 'utf8');
const PAGE_URL = 'https://hexworth.com/__tv-idempotency-test';
const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    // Define the blocked globals BEFORE TouristVisa loads, so the immediate tryInstall wraps them.
    '<script>window.ModuleProgress = { complete: function(){ return "real-complete"; },' +
    '  completeQuiz: function(){ return "real-quiz"; } };' +
    'window.AchievementManager = { unlock: function(){ return "real-unlock"; },' +
    '  check: function(){ return "real-check"; } };</script>' +
    '<script>\n' + SRC + '\n</script></body></html>';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; }
        req.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    // Kick off installBlockers with the globals present, then wait for the setTimeout(…,1000) retry
    // to fire (the second wrap opportunity the old code would take).
    const out = await page.evaluate(async () => {
        const res = {};
        // TouristVisa is a top-level `const` (not attached to window), so use the bare lexical binding.
        const TV = (typeof TouristVisa !== 'undefined') ? TouristVisa : null;
        res.hasComponent = !!(TV && typeof TV.installBlockers === 'function');
        if (!res.hasComponent) return res;
        // Not a tourist at load (active key unset) so the auto-install on load did NOT fire and
        // _interceptsInstalled is still false — our call is the single, controlled install.
        localStorage.removeItem('hexworth_tourist_active');
        localStorage.removeItem('hexworth_house');

        // Simulate the documented race (Nancy): a LinuxReplay-style external wrapper lands on
        // ModuleProgress.complete BETWEEN TouristVisa's immediate pass (t=0) and setTimeout pass
        // (t=1000). It marks itself (__linuxReplayWrapped), NOT __touristWrapped, and does not read
        // the active key — so it hides TouristVisa's flag from the later pass.
        setTimeout(function () {
            const inner = window.ModuleProgress.complete;
            const lr = function () { return inner.apply(window.ModuleProgress, arguments); };
            lr.__linuxReplayWrapped = true;
            window.ModuleProgress.complete = lr;
        }, 400);

        TV.installBlockers();
        await new Promise(r => setTimeout(r, 1300));   // external wrap at 400, setTimeout retry at 1000

        // CLEAN case (no external wrapper): unlock/completeQuiz/check are wrapped exactly once and
        // carry the flag on the current method object.
        res.cleanFlagged = !!(window.ModuleProgress.completeQuiz.__touristWrapped &&
                              window.AchievementManager.unlock.__touristWrapped &&
                              window.AchievementManager.check.__touristWrapped);

        // Depth oracle on a CLEAN method (AchievementManager.unlock has no other wrapper anywhere):
        // active-key reads during one pass-through call == TouristVisa wrap depth. Must be 1.
        const realGet = localStorage.getItem.bind(localStorage);
        let cleanReads = 0;
        localStorage.getItem = function (k) { if (k === 'hexworth_tourist_active') cleanReads++; return realGet(k); };
        window.AchievementManager.unlock();
        localStorage.getItem = realGet;
        res.cleanDepth = cleanReads;                          // expect 1 (was 2 pre-fix)

        // INTERLEAVE case (ModuleProgress.complete, LinuxReplay sandwiched): the fix can't reduce
        // this to one TouristVisa layer, but CORRECTNESS must hold — pass-through reaches the real fn
        // through both layers, and a tourist is still blocked.
        res.interleavePassThrough = window.ModuleProgress.complete() === 'real-complete';
        localStorage.setItem('hexworth_tourist_active', 'true');
        res.interleaveBlockedWhenTourist = window.ModuleProgress.complete() === false;
        localStorage.removeItem('hexworth_tourist_active');

        // And the clean method still blocks a tourist.
        localStorage.setItem('hexworth_tourist_active', 'true');
        res.cleanBlockedWhenTourist = window.AchievementManager.unlock() === false;
        localStorage.removeItem('hexworth_tourist_active');
        return res;
    });

    await browser.close();
    const realErrors = errors.filter(e => !/net::ERR|ERR_FAILED|Failed to load resource|Failed to fetch/i.test(e));

    const pass = out.hasComponent && out.cleanFlagged && out.cleanDepth === 1
        && out.cleanBlockedWhenTourist
        && out.interleavePassThrough && out.interleaveBlockedWhenTourist
        && realErrors.length === 0;

    console.log('\n  TouristVisa idempotency test (backlog 2026-07-11)\n');
    console.log('  component loaded                      : ' + out.hasComponent);
    console.log('  clean methods carry wrap flag         : ' + out.cleanFlagged);
    console.log('  CLEAN wrap depth (isActive reads) == 1: ' + (out.cleanDepth === 1) + '   (was 2 pre-fix; got ' + out.cleanDepth + ')');
    console.log('  clean method blocks a tourist         : ' + out.cleanBlockedWhenTourist);
    console.log('  INTERLEAVE (LinuxReplay sandwiched):');
    console.log('    pass-through reaches real fn        : ' + out.interleavePassThrough);
    console.log('    still blocks a tourist              : ' + out.interleaveBlockedWhenTourist);
    if (realErrors.length) { console.log('\n  PAGE ERRORS:'); realErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
