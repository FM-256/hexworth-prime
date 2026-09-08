// Visual-checkpoint harness for the unified Trophy Cabinet. Boots the REAL badge
// systems in a headless browser (AchievementManager + AchievementSystem →
// AchievementRegistry, plus the shared ObservatoryBadges), seeds a realistic mix
// of earned/locked/secret/platinum state through the systems' OWN unlock APIs (so
// the right stores are written, not a faked model), then mounts TrophyCabinet and
// screenshots it at desktop + mobile. Proves BOTH the look AND that render() works
// against production data shapes — not a mock. Screenshots land in _tools/ (repo
// path) so Nancy/Chris/operator can open them (lesson from #77: visual QC needs a
// render, and the artifact must be where reviewers look).
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const APP = path.resolve(__dirname, '../_app');
const OUT = __dirname;   // save screenshots to _tools/ (default, findable)

// Read a component file's source so we can inject it as inline <script> text.
function src(rel) { return fs.readFileSync(path.join(APP, rel), 'utf8'); }

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    const css = fs.readFileSync(path.resolve(APP, 'css/trophy-cabinet.css'), 'utf8');
    // The harness page is served at a real https origin (below) so localStorage is
    // available — an about:blank/setContent page has an opaque origin and blocks it.
    const PAGE_URL = 'https://hexworth.com/__trophy-cabinet-harness';
    // Order matters: Manager + System define, Registry merges, ObservatoryBadges +
    // TrophyCabinet read. ContentCatalog is intentionally absent (Registry skips
    // auto-gen gracefully) — the ~350 hand-authored defs are plenty for the look.
    const scripts = ['components/AchievementManager.js', 'components/AchievementSystem.js',
        'components/AchievementRegistry.js', 'components/ObservatoryBadges.js', 'components/TrophyCabinet.js'];

    const html = '<!doctype html><html><head><meta charset="utf-8"><style>' +
        'body{margin:0;background:#0a0e1f;padding:28px}' + css + '</style></head>' +
        '<body><div id="root"></div>' +
        scripts.map(s => '<script>\n' + src(s) + '\n</script>').join('\n') +
        '</body></html>';

    // Interception serves three things: the harness page at PAGE_URL (giving a real
    // origin so localStorage works), real badge art from disk, and nothing else (no
    // network). A missing art file falls through to 404, exercising render()'s fallback.
    await page.setRequestInterception(true);
    page.on('request', req => {
        const u = req.url();
        if (u === PAGE_URL) { req.respond({ contentType: 'text/html', body: html }); return; }
        const m = u.match(/\/assets\/images\/badges\/(.+\.webp)$/);
        if (m) {
            const f = path.join(APP, 'assets/images/badges', m[1]);
            if (fs.existsSync(f)) { req.respond({ contentType: 'image/webp', body: fs.readFileSync(f) }); return; }
            req.respond({ status: 404, body: '' }); return;   // exercises the fallback path
        }
        req.respond({ body: '' });   // block everything else
    });

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    // Seed a realistic earned state through the REAL APIs, then mount.
    const summary = await page.evaluate(() => {
        var defs = AchievementRegistry.getAllDefinitions();
        // Group core defs by category to find a small set we can fully earn → Platinum.
        var byCat = {};
        defs.forEach(function (d) { (byCat[d.category] = byCat[d.category] || []).push(d); });
        var smallCat = null, smallN = 1e9;
        Object.keys(byCat).forEach(function (c) {
            var nonSecret = byCat[c].filter(function (d) { return !d.secret; });
            if (nonSecret.length >= 2 && nonSecret.length < smallN) { smallN = nonSecret.length; smallCat = c; }
        });

        var earnedCore = 0, earnedSecret = 0;
        defs.forEach(function (d, i) {
            var take = false;
            if (d.category === smallCat && !d.secret) take = true;          // fully earn one set → Platinum
            else if (!d.secret && i % 3 === 0) take = true;                  // ~a third of the rest, varied tiers
            else if (d.secret && earnedSecret < 1) { take = true; earnedSecret++; }  // one revealed secret
            if (take) { AchievementRegistry.unlock(d.id); earnedCore++; }
        });

        /* Always earn the tournament participation badge (taskboard 364), regardless of what the
           varied-seed loop above happened to pick. This is the badge the ctfJoinTeam Cloud Function
           awards automatically on join, and a quality gate blocked 364 specifically because its
           visibility was traced statically but never RENDERED. Seeding it here via the same real
           unlock API means the screenshots prove the tile actually paints, with its real art, in
           the real cabinet, rather than proving the registry merely contains a definition. */
        try { AchievementRegistry.unlock('tournament_competitor'); } catch (e) {}

        // Legacy sandbox badges live in AchievementSystem — earn 3 of 5 via its API.
        var legacy = ObservatoryBadges.DEFS.filter(function (d) { return d.legacy; });
        legacy.slice(0, 3).forEach(function (d) { try { AchievementSystem.unlock(d.id); } catch (e) {} });

        // Native obs_* badges → the durable progress doc. Earn ~half, skip pending.
        var obsEarned = {};
        ObservatoryBadges.DEFS.filter(function (d) { return !d.legacy && !d.pending; })
            .forEach(function (d, i) { if (i % 2 === 0) obsEarned[d.id] = { earnedAt: 1 }; });
        // v:1-shaped doc — matches what the observatory page's writeProgress()
        // actually persists. ObservatoryBadges.readProgress() enforces the v:1 schema
        // guard (single normalizer, Chris QC 2026-07-11), so an un-versioned seed
        // would read as fresh and drop these badges — as real production docs always
        // carry v:1, the seed must too.
        localStorage.setItem(ObservatoryBadges.PROG_LS, JSON.stringify({
            v: 1, updatedAt: 1, tutorial: { step: 0, done: false }, missions: {}, obsBadges: obsEarned }));

        var model = TrophyCabinet.mount(document.getElementById('root'));
        return {
            smallCat: smallCat,
            earnedCore: earnedCore,
            level: model.profile.level,
            totals: model.profile.totalEarned + '/' + model.profile.totalBadges,
            pct: model.profile.pctComplete,
            tiers: model.profile.tierCounts,
            sets: model.sets.map(function (s) { return s.id + ' ' + s.earned + '/' + s.total + (s.platinum ? ' PLAT' : ''); })
        };
    });

    // Seeding via the real unlock() APIs makes the legacy AchievementSystem fire its
    // own celebration toast/panel onto <body>. Those are NOT cabinet elements — strip
    // anything appended outside #root so the checkpoint shows only the cabinet.
    await page.evaluate(() => {
        Array.prototype.slice.call(document.body.children).forEach(function (el) {
            if (el.id !== 'root' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') el.remove();
        });
    });

    /* TOURNAMENT BADGE CHECKPOINT (taskboard 364). Asserts the participation badge the
       ctfJoinTeam Cloud Function awards actually PAINTS: a tile exists, its art resolves (a 404'd
       image reports naturalWidth 0, which is how the generic-fallback failure would look), and its
       name and description render. A quality gate blocked 364 because visibility was traced through
       the registry statically but never rendered, and 27 core ids in this cabinet genuinely do fall
       back to a placeholder, so "a definition exists" is not evidence the tile is right. */
    /* Expand the tile's own set first. The cabinet ships sets COLLAPSED except the flagship one,
       so a tile inside a collapsed set contributes no innerText and a viewport-relative clip lands
       somewhere else entirely. The first version of this check screenshotted the page header by
       accident and reported name/description as missing, which was the harness measuring the wrong
       thing rather than a defect in the badge. */
    const tourn = await page.evaluate(() => {
        const img = Array.prototype.slice.call(document.querySelectorAll('img'))
            .filter(function (i) { return /tournament_competitor/.test(i.getAttribute('src') || ''); })[0];
        if (!img) return { found: false };
        const details = img.closest('details');
        if (details) details.open = true;                       // expand the collapsible set
        const tile = img.closest('.tc-badge, .tc-tile, li, article') || img.parentElement;
        img.scrollIntoView({ block: 'center' });
        const txt = (tile && tile.innerText) || '';
        return {
            found: true,
            src: img.getAttribute('src'),
            naturalWidth: img.naturalWidth,
            name: /Competitor/.test(txt),
            desc: /Join a Hexworth CTF tournament/.test(txt),
            tileText: txt.replace(/\s+/g, ' ').trim().slice(0, 90),
        };
    });
    await new Promise(r => setTimeout(r, 250));
    console.log('\n  tournament badge (364):');
    console.log('    tile present      ' + (tourn.found ? 'YES' : 'NO  <-- not rendered'));
    console.log('    art src           ' + tourn.src);
    console.log('    art loaded        ' + (tourn.naturalWidth > 0
        ? 'YES (' + tourn.naturalWidth + 'px, real art not the fallback)' : 'NO  <-- 404, showing fallback'));
    console.log('    name rendered     ' + (tourn.name ? 'YES' : 'NO'));
    console.log('    description       ' + (tourn.desc ? 'YES' : 'NO'));
    console.log('    tile text         ' + (tourn.tileText || '(none)'));
    /* NO CLOSE-UP SCREENSHOT, and the omission is deliberate rather than lazy.
       Three attempts all photographed the PAGE HEADER instead of the tile. The causes compounded:
       the badge sits inside a collapsed <details> far down a long page, `scrollIntoView` does not
       move a collapsed element, and Puppeteer's `clip` is DOCUMENT-relative while
       getBoundingClientRect is VIEWPORT-relative. Shipping an artefact labelled "close-up of the
       badge" that is really a picture of something else is worse than shipping none: a reviewer
       would glance at it and conclude the tile was verified.
       The evidence is therefore the DOM assertions printed above, which cannot photograph the wrong
       thing: the tile exists, its art resolves at 512px (a 404'd fallback reports naturalWidth 0),
       and the tile's own text reads "Competitor / BRONZE / 25 pts". The full-page
       trophy-cabinet-desktop.png written below contains the tile in context. */

    // Give the art a moment to paint, then shoot desktop + mobile.
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT, 'trophy-cabinet-desktop.png'), fullPage: true });
    // Clipped top region at 2x — the banner + flagship Sandbox set at readable detail.
    await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(OUT, 'trophy-cabinet-top.png'), clip: { x: 0, y: 0, width: 1280, height: 1180 } });

    await page.setViewport({ width: 390, height: 850, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(OUT, 'trophy-cabinet-mobile.png'), fullPage: true });

    // Prove the interactions FUNCTION (not just render): a collapsed set expands on
    // header click, and a summary chip expands + reveals its target. Done after the
    // screenshots so it doesn't disturb the default-state shots.
    const interact = await page.evaluate(() => {
        function bodyShown(sec) { return sec && getComputedStyle(sec.querySelector('.tc-set__body')).display !== 'none'; }
        var special = document.getElementById('tc-set-special');
        var beforeClick = bodyShown(special);                 // collapsed by default → false
        special.querySelector('.tc-set__head').click();
        var afterClick = bodyShown(special);                  // → true
        // Re-collapse, then drive it open via its summary chip instead.
        special.querySelector('.tc-set__head').click();
        var chip = document.querySelector('.tc-chip[data-target="tc-set-special"]');
        if (chip) chip.click();
        var afterChip = bodyShown(special);                   // → true
        return { beforeClick: beforeClick, afterClick: afterClick, afterChip: afterChip };
    });
    const interactPass = interact.beforeClick === false && interact.afterClick === true && interact.afterChip === true;

    await browser.close();

    console.log('\n  Trophy Cabinet render — real systems, seeded state\n');
    console.log('  interactions: header-toggle ' + (interact.beforeClick === false && interact.afterClick === true ? 'ok' : 'BAD') +
        ', chip-jump ' + (interact.afterChip === true ? 'ok' : 'BAD') + '  [' + (interactPass ? 'PASS' : 'FAIL') + ']');
    console.log('  platinum set: ' + summary.smallCat + '   core earned: ' + summary.earnedCore);
    console.log('  profile: level ' + summary.level + ', ' + summary.totals + ' (' + summary.pct + '%)  tiers ' + JSON.stringify(summary.tiers));
    console.log('  sets: ' + summary.sets.join('  |  '));
    console.log('\n  shots: _tools/trophy-cabinet-desktop.png  ·  _tools/trophy-cabinet-mobile.png');
    if (errors.length) { console.log('\n  PAGE ERRORS:'); errors.slice(0, 12).forEach(e => console.log('    ' + e.slice(0, 160))); }
    else console.log('\n  no page errors');
    console.log('');
})();
