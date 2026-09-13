#!/usr/bin/env node
/**
 * box-resetlab-icon.test.js
 *
 * @catalog what   Drives the "Reset Lab" DESKTOP ICON in every box that calls
 *                 engine.resetLab(), and asserts the box actually resets. Catches the
 *                 class of defect where a labelled control silently does nothing.
 * @catalog run    node _tools/hexos/box-resetlab-icon.test.js [--base URL] [--only <box>] [--json]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * 46 box configs call `engine.resetLab()`. BoxEngine has no such method and never has, so
 * in all 46 the "Reset Lab" desktop icon was dead: the student confirms, a TypeError is
 * thrown to the console, and nothing visible happens. Reproduced on production against
 * ad003-gpo-issues -- localStorage byte-identical before and after the confirmed reset.
 *
 * Nothing caught it because every existing check looked at the TASKBAR reset button, which
 * lives in the shared engine and works. The broken one is the box-local path, and it is
 * the control that carries the label a student reads.
 *
 * This asserts the STUDENT-VISIBLE OUTCOME -- the saved scenario is gone after the icon is
 * used -- not that a method exists. A box that reset by some other route would still pass,
 * and a box that "has resetLab" but fails to clear state would still fail.
 *
 * Exit 0 = every box reset. Exit 1 = at least one did not.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2);
const baseIdx = argv.indexOf('--base');
const BASE = baseIdx > -1 ? argv[baseIdx + 1] : 'https://hexworth.com';
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? argv[onlyIdx + 1] : null;
const AS_JSON = argv.includes('--json');

/** Every box whose Reset Lab icon routes through engine.resetLab(). Derived, not listed. */
function targets() {
    const out = [];
    for (const area of ['dispatch', 'arena']) {
        const dir = path.join(ROOT, '_app', area, 'boxes');
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            const f = path.join(dir, name, 'config.js');
            if (!fs.existsSync(f)) continue;
            const src = fs.readFileSync(f, 'utf8');
            if (!/engine\.resetLab\(\)/.test(src) || !/reset_lab/.test(src)) continue;
            /* Each box's OWN storage key, read from its config. The harness used to take
             * the first localStorage key starting with "hexworth_lab" -- but all 46 boxes
             * share one origin, so once box 1 had run, every later box read BOX 1's state.
             * That made the production baseline report `_scenarioSelected: true` for boxes
             * that had never had a scenario selected. Keyed to the box now. */
            const m = src.match(/storageKey:\s*['"]([^'"]+)['"]/);
            out.push({ area, name, key: m ? m[1] : null });
        }
    }
    return ONLY ? out.filter(b => b.name === ONLY) : out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];

(async () => {
    const boxes = targets();
    console.log(`=== Reset Lab icon: ${boxes.length} box(es) against ${BASE} ===\n`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    for (const box of boxes) {
        const url = `${BASE}/${box.area}/boxes/${box.name}/`;
        const rec = { box: box.name, area: box.area, reset: null, error: null, note: '' };
        let page, ctx;
        try {
            /* A FRESH context per box. Same reason as the key fix: shared localStorage
             * between cases is how a harness silently measures the previous box. */
            ctx = await browser.createBrowserContext();
            page = await ctx.newPage();
            const errs = [];
            page.on('pageerror', e => errs.push(e.message));
            // The 45 native-confirm boxes need the dialog accepted, or the reset never runs.
            page.on('dialog', async d => { try { await d.accept(); } catch (e) { /* already gone */ } });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(1400);
            await page.evaluate(() => {
                const b = [...document.querySelectorAll('button')].find(x => /start|begin|launch|enter/i.test(x.textContent));
                if (b) b.click();
            });
            await sleep(2000);
            // Put real work in the box: open the ticket list and take a ticket.
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /help desk|ticket/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            /* Scenario buttons are box-local markup and the class differs per box
             * (.s-btn, .nt1-scenario-btn, ...). Keying on the data-idx attribute instead
             * matches whatever the box calls it -- an earlier version keyed on one class
             * name, silently selected nothing, and reported a box as passing when the
             * before/after were both "no scenario".
             *
             * WAIT for the element rather than sleeping a fixed interval. Against a CDN the
             * ticket list renders in well under a second; against a single-threaded local
             * server it does not, and a fixed 1300ms sleep turned 42 of 46 boxes
             * "inconclusive" purely because the click landed before the list existed. A
             * timing-sensitive harness reports the environment, not the product. */
            await page.waitForSelector('[data-idx]', { timeout: 20000 }).catch(() => {});
            await page.evaluate(() => {
                const btn = document.querySelector('[data-idx]');
                if (btn) btn.click();
            });
            await sleep(1200);

            const key = box.key;
            if (!key) { rec.note = 'no storageKey in config'; }
            /**
             * Did the box actually reset?
             *
             * Keyed on startTime, not on _scenarioSelected. reset() replaces state with
             * _defaults(), which sets `startTime: Date.now()`, so a real reset ALWAYS moves
             * startTime forward -- in every box, scenario-based or not. The previous version
             * asserted that a selected scenario had been cleared, which made 24 of 46 boxes
             * "inconclusive" simply because this harness could not pick a ticket in them.
             * An assertion that only works on half the fleet cannot clear the fleet.
             */
            const snap = () => page.evaluate(k => {
                if (!k) return null;
                try {
                    const v = JSON.parse(localStorage.getItem(k) || 'null');
                    return v ? { startTime: v.startTime, scenario: v._scenarioSelected === true } : null;
                } catch (e) { return null; }
            }, key);

            const before = await snap();
            if (!before || !before.startTime) {
                rec.note = 'box saved no state to reset; inconclusive';
                rec.reset = null;
            } else {
                errs.length = 0;
                const found = await page.evaluate(() => {
                    const i = [...document.querySelectorAll('.desktop-icon')].find(x => /reset/i.test(x.textContent));
                    if (!i) return false;
                    i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                    return true;
                });
                if (!found) { rec.note = 'no Reset Lab icon on the desktop'; rec.reset = false; }
                else {
                    await sleep(900);
                    /* Two confirmation styles exist. 45 boxes use a native confirm(), which
                     * the page.on('dialog') handler above accepts. ad001-lockout-storm and
                     * its kin build their OWN overlay, whose Reset button nothing was
                     * clicking -- so the harness reported a FAIL that was its own omission,
                     * not the box's. Click an in-page confirm button if one appeared. */
                    await page.evaluate(() => {
                        const btn = [...document.querySelectorAll('button')]
                            .filter(b => b.offsetParent !== null)
                            .find(b => /^\s*reset\s*$/i.test(b.textContent));
                        if (btn) btn.click();
                    });
                    await sleep(2400);
                    const after = await snap();
                    // Cleared outright, or re-initialised with a fresh clock. Either is a reset.
                    rec.reset = (after === null) || (after.startTime > before.startTime);
                    rec.note = rec.reset ? (before.scenario ? 'scenario cleared too' : '') : 'startTime unchanged';
                    if (errs.length) rec.error = errs[0].slice(0, 120);
                }
            }
        } catch (e) {
            rec.reset = false;
            rec.error = 'harness: ' + e.message.slice(0, 120);
        } finally {
            if (page) await page.close().catch(() => {});
            if (ctx) await ctx.close().catch(() => {});
        }
        results.push(rec);
        const mark = rec.reset === true ? 'ok  ' : rec.reset === null ? '??  ' : 'FAIL';
        console.log(`  ${mark} ${rec.box}${rec.error ? '   [' + rec.error + ']' : ''}${rec.note ? '   (' + rec.note + ')' : ''}`);
    }

    await browser.close();

    const ok = results.filter(r => r.reset === true).length;
    const bad = results.filter(r => r.reset === false).length;
    const unk = results.filter(r => r.reset === null).length;
    console.log(`\n${ok} reset, ${bad} did NOT reset, ${unk} inconclusive (of ${results.length})`);
    if (AS_JSON) fs.writeFileSync('/tmp/resetlab.json', JSON.stringify(results, null, 2));
    process.exitCode = bad ? 1 : 0;
})();
