#!/usr/bin/env node
/**
 * @catalog what    BUG-253: proves the operator->matrix progress migration moves, never loses, XP-neutral
 * @catalog run     node _tools/operator/operator-house-migration.test.js
 * @catalog status  GATE
 *
 * This migration rewrites REAL STUDENT PROGRESS in localStorage. The bar is not "it ran" but
 * "nothing a student earned is lost, nothing is double-counted, and running it twice is a no-op".
 *
 * Decided 4-0 (Nancy, Mallory, Chris, primary) 2026-09-03 that `matrix` is the correct house:
 * ContentCatalog files all 24 op-* missions there, every comparable sub-hub attributes to its
 * parent house, and adding a 12th house would have moved the maxXP denominator for every student.
 *
 * Each case sets up a localStorage fixture, runs the real ProgressManager in a real browser, and
 * asserts on the resulting store. Cases 4-7 exist because a migration that only handles the happy
 * path is how student history gets quietly deleted.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..', '..');
const APP = path.join(ROOT, '_app');
const PORT = 9467;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };

let pass = 0, fail = 0;
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + label); }
    else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '\n         ' + JSON.stringify(detail) : '')); }
};

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p === '/') { r.writeHead(200, { 'Content-Type': 'text/html' }); return r.end('<!doctype html><title>t</title>'); }
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});

// Run one fixture: seed localStorage, load ProgressManager, call the migration, read the store back.
async function runCase(pg, seed, { twice = false } = {}) {
    await pg.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
    /* ProgressManager AUTO-RUNS this migration at load time, and addScriptTag happens after
       readyState is 'complete', so the else-branch fires it the instant the script lands. A first
       version of this harness therefore measured the SECOND run in every case: the explicit call
       returned already_migrated, and cases 2 and 7 would have stayed green with the flag logic
       completely broken. Pre-setting the flag makes the auto-run a no-op; clearing it immediately
       after means the evaluate() below is genuinely the first run. */
    await pg.evaluate((s) => {
        localStorage.clear();
        localStorage.setItem('hexworth_operator_house_migrated', 'HARNESS-SUPPRESS-AUTORUN');
        if (s !== null) localStorage.setItem('hexworth_progress', s);
    }, seed);
    await pg.addScriptTag({ url: `http://127.0.0.1:${PORT}/components/ProgressManager.js` });
    await pg.evaluate(() => localStorage.removeItem('hexworth_operator_house_migrated'));
    return pg.evaluate((runTwice) => {
        const first = ProgressManager.migrateOperatorHouseToMatrix();
        const second = runTwice ? ProgressManager.migrateOperatorHouseToMatrix() : null;
        let store = null;
        try { store = JSON.parse(localStorage.getItem('hexworth_progress') || '{}'); } catch (e) { store = 'UNPARSEABLE'; }
        // Ask a bare object whether it inherited anything, which is the only question that
        // actually detects prototype pollution. Reading a key off the store that no code path
        // ever writes is always undefined and tests nothing.
        const protoClean = ({}).completed === undefined && ({}).modulesCompleted === undefined;
        return { first, second, store, protoClean, flag: localStorage.getItem('hexworth_operator_house_migrated') };
    }, twice);
}

(async () => {
    await new Promise((res) => srv.listen(PORT, '127.0.0.1', res));
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();

    // ── 1. the ordinary case: both storage shapes populated ──
    let r = await runCase(pg, JSON.stringify({
        xp: 1500, completedModules: ['op-js-01', 'op-js-02'],
        operator: { 'op-js-01': { completed: true, date: '2026-08-01' }, 'op-js-02': { completed: true, date: '2026-08-02' } },
        houses: { operator: { unlocked: true, modulesCompleted: ['op-js-01', 'op-js-02'], quizzesPassed: [], labsCompleted: [], lastAccessed: '2026-08-02' } }
    }));
    chk('1. reports migrated with a count', r.first.migrated === true && r.first.moved === 4, r.first);
    chk('1. structured completions landed in matrix',
        (r.store.houses.matrix.modulesCompleted || []).sort().join() === 'op-js-01,op-js-02', r.store.houses.matrix);
    chk('1. flat completions landed in matrix',
        !!(r.store.matrix && r.store.matrix['op-js-01'] && r.store.matrix['op-js-02']), r.store.matrix);
    chk('1. the operator bucket no longer renders as a house',
        !r.store.houses.operator && !r.store.operator, Object.keys(r.store.houses));
    chk('1. NOTHING WAS DESTROYED - both shapes archived',
        !!r.store._archived_operator_house && !!r.store._archived_operator_flat, Object.keys(r.store));
    chk('1. XP untouched by the migration', r.store.xp === 1500, r.store.xp);
    chk('1. lastAccessed carried over', r.store.houses.matrix.lastAccessed === '2026-08-02', r.store.houses.matrix.lastAccessed);

    // ── 2. idempotent: running twice must not duplicate ──
    r = await runCase(pg, JSON.stringify({
        completedModules: ['op-js-01'],
        operator: { 'op-js-01': { completed: true } },
        houses: { operator: { modulesCompleted: ['op-js-01'], quizzesPassed: [], labsCompleted: [] } }
    }), { twice: true });
    chk('2. second run is a no-op', r.second && r.second.migrated === false && r.second.reason === 'already_migrated', r.second);
    chk('2. no duplicated entries', r.store.houses.matrix.modulesCompleted.length === 1, r.store.houses.matrix.modulesCompleted);

    // ── 3. a student who never touched Operator ──
    r = await runCase(pg, JSON.stringify({ xp: 200, houses: { web: { modulesCompleted: ['a'] } } }));
    chk('3. no operator data is still a clean success', r.first.migrated === true && r.first.moved === 0, r.first);
    chk('3. an unrelated house is untouched',
        r.store.houses.web.modulesCompleted.join() === 'a' && !r.store.houses.matrix, r.store.houses);

    // ── 4. MERGE, not replace: matrix already has its own history ──
    r = await runCase(pg, JSON.stringify({
        matrix: { 'ala-01': { completed: true, date: 'KEEP-ME' } },
        operator: { 'op-js-01': { completed: true } },
        houses: {
            matrix: { modulesCompleted: ['ala-01'], quizzesPassed: [], labsCompleted: [] },
            operator: { modulesCompleted: ['op-js-01'], quizzesPassed: [], labsCompleted: [] }
        }
    }));
    chk('4. existing matrix history SURVIVES the merge',
        r.store.houses.matrix.modulesCompleted.sort().join() === 'ala-01,op-js-01'
        && r.store.matrix['ala-01'].date === 'KEEP-ME', r.store.houses.matrix);

    // ── 5. collision: the same id in both buckets must not overwrite matrix's record ──
    r = await runCase(pg, JSON.stringify({
        matrix: { 'op-js-01': { completed: true, date: 'MATRIX-ORIGINAL' } },
        operator: { 'op-js-01': { completed: true, date: 'OPERATOR-COPY' } },
        houses: { matrix: { modulesCompleted: ['op-js-01'] }, operator: { modulesCompleted: ['op-js-01'] } }
    }));
    chk('5. matrix record wins a collision, and no duplicate id',
        r.store.matrix['op-js-01'].date === 'MATRIX-ORIGINAL'
        && r.store.houses.matrix.modulesCompleted.filter(x => x === 'op-js-01').length === 1, r.store.matrix);

    // ── 6. hostile localStorage: student-controlled input ──
    r = await runCase(pg, JSON.stringify({
        operator: { '__proto__': { completed: true }, 'op-ok': { completed: true } },
        houses: { operator: { modulesCompleted: ['__proto__', 'constructor', 'op-ok'] } }
    }));
    chk('6. prototype-ish keys are skipped, real ones still migrate',
        r.store.houses.matrix.modulesCompleted.join() === 'op-ok'
        && !!r.store.matrix['op-ok'], r.store.houses.matrix.modulesCompleted);
    chk('6. Object.prototype was not polluted', r.protoClean === true, r.protoClean);

    // ── 7. corrupt store: must refuse, not throw, and must NOT set the flag ──
    r = await runCase(pg, '{not valid json');
    chk('7. unreadable progress refuses cleanly', r.first.migrated === false && r.first.reason === 'progress_unreadable', r.first);
    chk('7. and does NOT set the flag, so a repaired store still migrates later', r.flag === null, r.flag);

    // ── 8. COLD START: a student who has never had the progress key at all ──
    // runCase supported seed===null from the start and no case ever used it, so "likely harmless,
    // unverified" was sitting in a suite whose whole point is not accepting that.
    r = await runCase(pg, null);
    chk('8. a store that does not exist yet migrates cleanly',
        r.first.migrated === true && r.first.moved === 0, r.first);

    /* ── 9. THE BLOCKER: progressPercent must never exceed its own denominator. ──
       modulesCompleted holds everything completed under a house; LearningPaths' path list is a
       smaller population. Dividing one by the other let merged op-* ids push the STORED
       progressPercent past 100, which fires HouseProgressPanel's "House Mastery Complete!" banner
       for a student who has not finished the curriculum, and never self-corrects. Real path ids
       are read from LearningPaths in-page rather than hardcoded, so this cannot rot when the
       matrix path changes. */
    await pg.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
    await pg.evaluate(() => { localStorage.clear(); localStorage.setItem('hexworth_operator_house_migrated', 'SUPPRESS'); });
    // completeModule() reaches checkSkillUnlocks -> getSkillTree -> SkillTreeData.getDefaultTree(),
    // so the skill tree has to be on the page or the call throws before we can read the result.
    await pg.addScriptTag({ url: `http://127.0.0.1:${PORT}/components/LearningPaths.js` });
    await pg.addScriptTag({ url: `http://127.0.0.1:${PORT}/components/SkillTreeData.js` });
    await pg.addScriptTag({ url: `http://127.0.0.1:${PORT}/components/AchievementSystem.js` });
    await pg.addScriptTag({ url: `http://127.0.0.1:${PORT}/components/ProgressManager.js` });
    const pct = await pg.evaluate(() => {
        /* Driven against a house that HAS a learning path. `matrix` has NO entry in
           LearningPaths.PATHS at all (only web, shield, forge, script, cloud, code, key and eye
           do), so completeModule's `pathModules.length > 0` guard means matrix's progressPercent
           is never recomputed and the inflation cannot be reproduced there. The DEFECT is real for
           every house that does have a path, so the regression guard belongs on one of those. */
        const HOUSE = 'web';
        const path = LearningPaths.getHouseModules(HOUSE) || [];
        if (path.length < 2) return { skipped: true, pathLen: path.length };
        // One real path module done, plus a pile of operator missions that are NOT in the path.
        /* Enough non-path ids that the UN-intersected count would exceed the denominator. With
           only a handful, a long path keeps the raw percentage under 100 and the "cannot exceed
           100" assertion passes even against the broken calculation -- which is a negative
           assertion matching the wrong wrong-answer. Sized off the real path length so it stays
           meaningful if that path grows. */
        const ops = Array.from({ length: path.length + 5 }, (_, i) => 'op-js-' + i);
        localStorage.setItem('hexworth_progress', JSON.stringify({
            completedModules: [path[0].id].concat(ops),
            houses: { [HOUSE]: { modulesCompleted: [path[0].id].concat(ops), quizzesPassed: [], labsCompleted: [], progressPercent: 0 } }
        }));
        localStorage.removeItem('hexworth_operator_house_migrated');
        ProgressManager.migrateOperatorHouseToMatrix();
        // Now the student finishes one more REAL matrix module, which is what recomputes the field.
        // NOTE THE ARGUMENT ORDER. ProgressManager.completeModule is (moduleId, houseId) while
        // ModuleProgress.complete is (houseId, moduleId) -- the two are OPPOSITE, and getting it
        // backwards here silently invents a house named after the module, leaves houses.matrix
        // untouched, and makes this whole case pass for the wrong reason.
        ProgressManager.completeModule(path[1].id, HOUSE);
        const st = JSON.parse(localStorage.getItem('hexworth_progress'));
        return {
            skipped: false,
            pathLen: path.length,
            stored: st.houses[HOUSE].progressPercent,
            expected: Math.round((2 / path.length) * 100),   // exactly 2 real path modules done
            merged: st.houses[HOUSE].modulesCompleted.length,  // includes every non-path id
            // What the BROKEN calculation would have produced, so the guard below is provably
            // capable of failing rather than merely observed to pass.
            brokenWouldBe: Math.round((st.houses[HOUSE].modulesCompleted.length / path.length) * 100)
        };
    });
    if (pct.skipped) {
        chk('9. SKIPPED - chosen house has fewer than 2 path modules', false, pct);
    } else {
        chk('9. progressPercent counts ONLY path modules, not non-path ids',
            pct.stored === pct.expected, pct);
        chk('9. and the broken calc WOULD have exceeded 100, so this guard can fail',
            pct.brokenWouldBe > 100, pct);
        chk('9. no false "House Mastery Complete!" banner (stored stays under 100)',
            pct.stored < 100, pct);
    }

    await b.close();
    srv.close();
    console.log(`\n  ${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})();
