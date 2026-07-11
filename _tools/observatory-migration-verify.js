// Render-verify for the ObservatoryBadges migration (task #96): boots the REAL
// houses/observatory/index.html in a headless browser against a local static
// server (so ../../components/* relative paths resolve exactly as in production),
// blocks external network (firebase/googleapis/lab-manager) so it can't hang, and
// proves the migration works: ObservatoryBadges loaded, the retired locals now
// alias the shared module, and the profile-tab grid actually paints 25 tiles from
// the shared DEFS with the correct earned count. Static analysis (Nancy) already
// ruled out hoisting/load-order; this is the runtime browser pass.
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8099';
const URL = BASE + '/houses/observatory/index.html';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    // Block anything not on the local server (firebase, googleapis, gstatic, the
    // lab-manager) so the page can't hang on network. Those failures are expected
    // and unrelated to the migration; we filter them out of the error report below.
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url().startsWith(BASE)) req.continue();
        else req.abort();
    });

    // Seed durable progress (earn ~half the native obs badges) on the page origin
    // BEFORE loading the app, so the grid has a real earned count to render.
    await page.goto(BASE + '/favicon.ico', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.evaluate(() => {
        localStorage.setItem('hexworth_house', 'forge');   // pass any house gate
        // v:1-shaped doc — matches what the page's writeProgress() actually persists
        // in production (Chris QC: an un-versioned seed is reset by the schema guard).
        localStorage.setItem('hexworth_obs_sandbox_progress', JSON.stringify({
            v: 1, updatedAt: 1, tutorial: { step: 0, done: false }, missions: {},
            obsBadges: { obs_first_mission: { earnedAt: 1 }, obs_first_task: { earnedAt: 1 }, obs_manual_scholar: { earnedAt: 1 } }
        }));
    });

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));   // let the inline script + deps settle

    // Directly exercise the migrated code path: assert the aliases resolve to the
    // shared module, then inject the profile-grid container and call the page's own
    // renderObsBadgeGrid() to prove it paints from ObservatoryBadges.DEFS.
    const res = await page.evaluate(() => {
        var out = {};
        out.hasModule = typeof window.ObservatoryBadges !== 'undefined';
        out.defsLen = window.OBS_BADGE_DEFS && window.OBS_BADGE_DEFS.length;
        out.defsSharedRef = out.hasModule && window.OBS_BADGE_DEFS === window.ObservatoryBadges.DEFS;
        out.rarityIsFn = typeof window.obsRarity === 'function';
        out.earnedIsFn = typeof window.obsBadgeEarned === 'function';
        out.rarityWorks = out.rarityIsFn && window.obsRarity({ pts: 500, style: 'legendary' }) === 'legendary'
            && window.obsRarity({ pts: 10 }) === 'common';
        // Inject the profile-tab grid container + count span and paint it.
        var host = document.createElement('div');
        host.innerHTML = '<span id="obs-pbadges-count"></span><div id="obs-pbadges-grid"></div>';
        document.body.appendChild(host);
        var painted = null, count = null;
        try {
            if (typeof window.renderObsBadgeGrid === 'function') {
                window.renderObsBadgeGrid();
                painted = document.querySelectorAll('#obs-pbadges-grid .obs-pbadge').length;
                count = (document.getElementById('obs-pbadges-count') || {}).textContent;
            }
        } catch (e) { out.renderError = String(e); }
        out.gridTiles = painted;
        out.countText = count;
        // Parse the observatory profile grid's earned number ("3 of 25 earned").
        out.gridEarned = count ? parseInt(String(count).match(/^(\d+)/)[1], 10) : null;
        // The Trophy Cabinet's read path for the SAME doc: it reads earned state via
        // ObservatoryBadges.earned(def, ObservatoryBadges.readProgress()). Compute it
        // here and assert it equals the observatory grid's count — the actual
        // single-source proof (Chris QC): both consumers agree on the same doc.
        // Guarded on hasModule so a load failure returns diagnostics, not a crash.
        if (out.hasModule) {
            out.cabinetEarned = window.ObservatoryBadges.DEFS
                .filter(function (d) { return window.ObservatoryBadges.earned(d, window.ObservatoryBadges.readProgress()); }).length;
            // Also prove the page's readProgress now delegates to the shared
            // normalizer: it must return the seeded obsBadges (not a reset fresh doc).
            out.pageReadHasBadges = !!(typeof window.readProgress === 'function'
                && window.readProgress().obsBadges && window.readProgress().obsBadges.obs_first_mission);

            // MALFORMED-DOC PARITY — the exact case Chris blocked on. Write a doc with
            // obsBadges but NO v:1. Before the fix the page reset it to fresh (0 earned)
            // while the cabinet's un-guarded read returned the badge as earned — a
            // divergence. Post-fix BOTH must apply the v:1 guard and read 0. This is
            // the actual single-source proof on the path the bug lived on.
            // Guard window.readProgress (a page function, separate from the module) —
            // if the page inline script failed to load, report a diagnostic, not a crash.
            if (typeof window.readProgress === 'function') {
                localStorage.setItem('hexworth_obs_sandbox_progress',
                    JSON.stringify({ obsBadges: { obs_first_mission: { earnedAt: 1 } } }));   // deliberately no v:1
                var pageDoc = window.readProgress();
                out.malformedPageEarned = (pageDoc && pageDoc.obsBadges) ? Object.keys(pageDoc.obsBadges).length : 0;
                out.malformedCabinetEarned = window.ObservatoryBadges.DEFS
                    .filter(function (d) { return window.ObservatoryBadges.earned(d, window.ObservatoryBadges.readProgress()); }).length;
            }
        }
        // Confirm the new Trophy Cabinet link exists in the profileExtraHTML config.
        out.cabinetLinkInConfig = document.documentElement.innerHTML.indexOf('/trophies.html') !== -1;
        return out;
    });

    await browser.close();

    // Filter expected external-network failures — they are not migration errors.
    const migrationErrors = errors.filter(e =>
        !/firebase|googleapis|gstatic|net::ERR|Failed to fetch|lab-manager|ERR_FAILED|Load failed|firestore/i.test(e));

    // 3 = the number of obsBadges seeded into localStorage above (obs_first_mission,
    // obs_first_task, obs_manual_scholar). BOTH the observatory grid and the cabinet
    // read-path must independently report exactly those 3 as earned, and agree.
    const SEEDED_EARNED = 3;
    const pass = res.hasModule && res.defsLen === 25 && res.defsSharedRef && res.rarityWorks
        && res.earnedIsFn && res.gridTiles === 25 && !res.renderError && migrationErrors.length === 0
        && res.gridEarned === SEEDED_EARNED && res.cabinetEarned === SEEDED_EARNED
        && res.gridEarned === res.cabinetEarned
        && res.pageReadHasBadges === true && res.cabinetLinkInConfig === true
        // Malformed-doc parity: a non-v:1 doc must read as 0 earned for BOTH consumers
        // (the divergence Chris blocked on). Both apply the v:1 guard now → both 0.
        && res.malformedPageEarned === 0 && res.malformedCabinetEarned === 0;

    console.log('\n  Observatory migration render-verify\n');
    console.log('  ObservatoryBadges loaded : ' + res.hasModule);
    console.log('  OBS_BADGE_DEFS length    : ' + res.defsLen + ' (expect 25)');
    console.log('  defs === shared DEFS ref : ' + res.defsSharedRef);
    console.log('  obsRarity alias works    : ' + res.rarityWorks);
    console.log('  obsBadgeEarned is fn     : ' + res.earnedIsFn);
    console.log('  profile grid tiles       : ' + res.gridTiles + ' (expect 25)');
    console.log('  count text               : ' + JSON.stringify(res.countText));
    console.log('  SINGLE-SOURCE PROOF      : observatory grid earned=' + res.gridEarned +
        '  cabinet read-path earned=' + res.cabinetEarned + '  (expect both 3, equal)');
    console.log('  page readProgress delegates (has seeded badges): ' + res.pageReadHasBadges);
    console.log('  MALFORMED-DOC PARITY     : page earned=' + res.malformedPageEarned +
        '  cabinet earned=' + res.malformedCabinetEarned + '  (non-v:1 doc → expect both 0)');
    console.log('  cabinet link in page     : ' + res.cabinetLinkInConfig);
    if (res.renderError) console.log('  RENDER ERROR             : ' + res.renderError);
    if (migrationErrors.length) { console.log('\n  MIGRATION-RELEVANT ERRORS:'); migrationErrors.slice(0, 8).forEach(e => console.log('    ' + e.slice(0, 160))); }
    else console.log('\n  no migration-relevant page errors (external network blocked/filtered)');
    console.log('\n  RESULT: ' + (pass ? 'PASS' : 'FAIL') + '\n');
    process.exit(pass ? 0 : 1);
})();
