// Boot test for the REAL /trophies.html page. Serves the page + all its component
// scripts + css + art from disk at an https origin, seeds a sorted session so
// AccessGuard.require('sorted') passes, and verifies:
//   1. the page boots without a FATAL (cabinet-blocking) error,
//   2. TrophyCabinet mounts (loading state clears → .tc + sets render),
//   3. the event-driven re-paint works (dispatch hexworth:achievementUnlocked after
//      seeding earned state via the real APIs → banner updates).
// The sync stack (FirebaseAuth/FirestoreManager/LabStateSync) is expected to no-op
// here (no Firebase) — those errors are reported separately, not treated as fatal,
// because the page is designed to render the local-state view regardless.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const APP = path.resolve(__dirname, '../_app');
const PAGE_URL = 'https://hexworth.com/trophies.html';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    // Seed a sorted session BEFORE any page script runs (AccessGuard reads this in <head>).
    await page.evaluateOnNewDocument(() => {
        localStorage.setItem('hexworth_house', 'forge');   // isSorted() === true → no redirect
    });

    // Serve the page, its components, css, and badge/icon art from disk. Everything
    // else (Firebase SDK, gstatic, config) → empty, so the sync stack fails fast and
    // the page falls back to the local view (never hangs on network).
    await page.setRequestInterception(true);
    page.on('request', req => {
        const u = req.url();
        if (u === PAGE_URL) { req.respond({ contentType: 'text/html', body: fs.readFileSync(path.join(APP, 'trophies.html'), 'utf8') }); return; }
        const m = u.match(/https:\/\/hexworth\.com\/(components\/.+\.js|css\/.+\.css|assets\/images\/(?:badges|icons)\/.+\.webp)$/);
        if (m) {
            const f = path.join(APP, m[1]);
            if (fs.existsSync(f)) {
                const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.css') ? 'text/css' : 'image/webp';
                req.respond({ contentType: ct, body: fs.readFileSync(f) }); return;
            }
            req.respond({ status: 404, body: '' }); return;
        }
        req.respond({ body: '' });   // block Firebase/CDN/etc.
    });

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));   // let paint() + any sync attempts settle

    // State after initial (local-state) paint.
    const initial = await page.evaluate(() => {
        var root = document.getElementById('trophy-root');
        return {
            loadingCleared: root && root.className.indexOf('tcpage-loading') === -1,
            hasCabinet: !!document.querySelector('.tc'),
            sets: document.querySelectorAll('.tc-set').length,
            badges: document.querySelectorAll('.tc-badge').length,
            redirected: location.href
        };
    });

    // Seed earned state via the real APIs, then fire the live-unlock event and confirm
    // the page re-paints (event wiring works). Mirrors the render harness seeding.
    const repaint = await page.evaluate(() => {
        var defs = AchievementRegistry.getAllDefinitions();
        var earned = 0;
        defs.forEach(function (d, i) { if (!d.secret && i % 3 === 0) { AchievementRegistry.unlock(d.id); earned++; } });
        var obs = {};
        ObservatoryBadges.DEFS.filter(function (d) { return !d.legacy && !d.pending; })
            .forEach(function (d, i) { if (i % 2 === 0) obs[d.id] = { earnedAt: 1 }; });
        localStorage.setItem(ObservatoryBadges.PROG_LS, JSON.stringify({ obsBadges: obs }));
        window.dispatchEvent(new CustomEvent('hexworth:achievementUnlocked', { detail: { id: 'test' } }));
        return { seededCore: earned };
    });
    await new Promise(r => setTimeout(r, 200));

    const after = await page.evaluate(() => {
        var sub = document.querySelector('.tc-profile__sub');
        var lvl = document.querySelector('.tc-level__num');
        return { sub: sub ? sub.textContent.trim() : '(none)', level: lvl ? lvl.textContent.trim() : '?' };
    });

    // Strip any stray unlock toast fired by the seeding, then screenshot.
    await page.evaluate(() => {
        Array.prototype.slice.call(document.body.children).forEach(function (el) {
            if (el.tagName !== 'HEADER' && el.tagName !== 'MAIN' && el.tagName !== 'SCRIPT') el.remove();
        });
    });
    await new Promise(r => setTimeout(r, 250));
    await page.screenshot({ path: path.join(__dirname, 'trophies-page-boot.png'), fullPage: true });
    await browser.close();

    // A fatal error is one that mentions our page code (TrophyCabinet / trophies).
    const fatal = errors.filter(e => /TrophyCabinet|trophies|tc-|mount/.test(e));
    const syncNoise = errors.filter(e => !/TrophyCabinet|trophies|tc-|mount/.test(e));
    const pass = initial.loadingCleared && initial.hasCabinet && initial.sets >= 5 && fatal.length === 0 &&
        initial.redirected === PAGE_URL && after.sub.indexOf('earned') !== -1;

    console.log('\n  /trophies.html boot test\n');
    console.log('  no redirect: ' + (initial.redirected === PAGE_URL ? 'ok' : 'REDIRECTED → ' + initial.redirected));
    console.log('  loading cleared: ' + initial.loadingCleared + '   cabinet mounted: ' + initial.hasCabinet);
    console.log('  sets: ' + initial.sets + '   badges: ' + initial.badges);
    console.log('  event re-paint → banner: level ' + after.level + ', "' + after.sub + '"  (seeded ' + repaint.seededCore + ' core)');
    console.log('  fatal errors: ' + fatal.length + (fatal.length ? '\n    ' + fatal.slice(0, 6).join('\n    ') : ''));
    console.log('  sync-stack noise (expected, no Firebase): ' + syncNoise.length);
    console.log('\n  ' + (pass ? 'PASS — page boots + mounts + re-paints' : 'FAIL — see above') + '\n');
    console.log('  shot: _tools/trophies-page-boot.png\n');
    process.exit(pass ? 0 : 1);
})();
