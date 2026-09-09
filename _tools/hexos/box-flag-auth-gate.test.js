#!/usr/bin/env node
/**
 * box-flag-auth-gate.test.js
 *
 * @catalog what   Proves the task-377 flag fix cannot recreate the task-372 defect: loading a
 *                 box page must attempt ZERO anonymous sign-ins, while a page a human has
 *                 actually interacted with may attempt exactly ONE, however many flags ask at
 *                 once. Runs over the UNGATED dispatch boxes, which are the exposed surface.
 * @catalog run    node _tools/hexos/box-flag-auth-gate.test.js [--all] [--port 5599]
 * @catalog status TOOL
 *
 * WHY IT EXISTS. The first version of the 377 fix called ArenaFirebase.ensureAuth()
 * unconditionally inside requestFlagText, on the argument that asking for a flag is a
 * deliberate student act. Nancy proved that false: all 95 dispatch box pages call
 * BoxEngine.init() with nothing gating it, and _initWithMode() prefetches EVERY flag on
 * script execution -- so the sign-in would have fired on page load across 95 pages and
 * reopened exactly what 372 closed. NT1, the box the fix was measured on, sits behind a
 * briefing screen and could not reveal it. One box is not a sample.
 *
 * HOW THE MEASUREMENT IS MADE HONEST. Every request to identitytoolkit.googleapis.com is
 * ABORTED at the network layer, so the browser is physically unable to create an account;
 * the ATTEMPT is still counted, and that count is the measurement. This also makes the
 * result independent of the API-key referrer restriction that blocks 127.0.0.1 and preview
 * channels -- we are counting intent, not outcome.
 *
 * NEGATIVE CONTROL IS BUILT IN. Case 3 forces _userEngaged = true before any flag request
 * and REQUIRES an attempt to appear. If that case does not go red the counter is blind and
 * cases 1 and 2 mean nothing, so the harness exits non-zero on its own failure.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
let puppeteer;
try { puppeteer = require(path.join(ROOT, 'node_modules/puppeteer')); }
catch (e) { puppeteer = require(path.join(ROOT, 'functions/node_modules/puppeteer')); }

const argv = process.argv.slice(2);
const portIdx = argv.indexOf('--port');
const PORT = portIdx > -1 ? argv[portIdx + 1] : '5599';
const ALL = argv.includes('--all');

let pass = 0, fail = 0;
/** Record one assertion; on failure print the observed value so the line says why. */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + label); }
    else { fail++; console.log('  FAIL ' + label + (detail ? '\n         ' + String(detail).slice(0, 200) : '')); }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Every dispatch box whose page calls BoxEngine.init() with no CoOpLobby/BriefingPage gate. */
function ungatedBoxes() {
    const dir = path.join(ROOT, '_app/dispatch/boxes');
    return fs.readdirSync(dir).filter(name => {
        const idx = path.join(dir, name, 'index.html');
        if (!fs.existsSync(idx)) return false;
        const html = fs.readFileSync(idx, 'utf8');
        return /BoxEngine\.init\(/.test(html) && !/CoOpLobby|BriefingPage/.test(html);
    });
}

(async () => {
    const boxes = ungatedBoxes();
    const sample = ALL ? boxes : boxes.slice(0, 10).concat(['nt1-network-troubleshoot']);
    console.log('=== box flag-auth gate ===');
    console.log(`ungated dispatch boxes: ${boxes.length}; testing ${sample.length}\n`);

    const browser = await puppeteer.launch({
        headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    for (const box of sample) {
        const ctx = typeof browser.createBrowserContext === 'function'
            ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
        const page = await ctx.newPage();

        // Count sign-up intent, and make it impossible to succeed.
        let attempts = 0;
        await page.setRequestInterception(true);
        page.on('request', req => {
            let host = '';
            try { host = new URL(req.url()).host; } catch (e) { host = ''; }
            // Match on HOST. A substring match on the full URL would also catch an emulator
            // proxying the real hostname inside its own local path -- the exact false
            // positive that manufactured a blocker during task 372.
            if (host === 'identitytoolkit.googleapis.com') { attempts++; return req.abort(); }
            return req.continue();
        });

        const url = `http://127.0.0.1:${PORT}/dispatch/boxes/${box}/`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(2500);

        // ── 1. LOAD ALONE MUST MINT NOTHING (this is task 372's guarantee) ────────────
        const atLoad = attempts;
        chk(`${box}: 0 sign-in attempts on load`, atLoad === 0, 'attempts=' + atLoad);

        // ── 2. THE GATE IS CLOSED UNTIL A HUMAN ACTS ──────────────────────────────────
        const engagedBefore = await page.evaluate(() => !!BoxEngine._userEngaged);
        chk(`${box}: _userEngaged is false before interaction`, engagedBefore === false,
            'engaged=' + engagedBefore);

        // A flag request WITHOUT engagement must not reach for a session.
        await page.evaluate(async () => {
            const f = (BoxEngine.config.flags || [])[0];
            if (f) { try { await BoxEngine.requestFlagText(f.id); } catch (e) {} }
        });
        await sleep(1200);
        chk(`${box}: unattended flag request still mints nothing`, attempts === 0,
            'attempts=' + attempts);

        // ── 3. NEGATIVE CONTROL + SERIALIZATION ───────────────────────────────────────
        // A real interaction opens the gate. Then fire EVERY flag at once, the way
        // _initWithMode's forEach does, and require exactly ONE sign-in attempt: the
        // in-flight promise in ArenaFirebase.ensureAuth must collapse the stampede.
        await page.evaluate(() => {
            document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });
        const engagedAfter = await page.evaluate(() => !!BoxEngine._userEngaged);
        chk(`${box}: a real pointerdown opens the gate`, engagedAfter === true);

        const before = attempts;
        await page.evaluate(async () => {
            const flags = BoxEngine.config.flags || [];
            await Promise.all(flags.map(f => BoxEngine.requestFlagText(f.id).catch(() => {})));
        });
        await sleep(2000);
        const delta = attempts - before;
        chk(`${box}: engaged flag request DOES attempt sign-in (counter is not blind)`, delta >= 1,
            'delta=' + delta + ' -- if 0, cases 1-2 prove nothing');
        chk(`${box}: concurrent flag requests collapse to ONE sign-in`, delta <= 1,
            'delta=' + delta + ' -- stampede: ensureAuth is not serializing');

        await page.close();
        await ctx.close();
    }

    await browser.close();
    console.log('\n' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILED: ' + e.message); process.exit(1); });
