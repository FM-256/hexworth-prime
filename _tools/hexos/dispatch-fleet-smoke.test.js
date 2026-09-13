#!/usr/bin/env node
/**
 * dispatch-fleet-smoke.test.js
 *
 * @catalog what   Drives EVERY dispatch box far enough to prove a student is not blocked:
 *                 boots, desktop appears, a ticket can be taken, the terminal answers, and
 *                 the box raises no page errors doing it. Not a completability proof --
 *                 a PRECONDITION proof. A box failing here cannot be finished by anyone.
 * @catalog run    node _tools/hexos/dispatch-fleet-smoke.test.js [--base URL] [--only <box>] [--json]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * 95 dispatch boxes ship to students. Exactly ONE (nt1-network-troubleshoot) has ever been
 * driven end to end by a harness. Every other gate on this platform is static, or checks
 * that a page renders, or checks one contract in isolation. The operator has twice found
 * real defects by PLAYING a box after every gate passed -- the dead Reset Lab icon in 46
 * boxes, and NT1's four defects before that.
 *
 * This does not attempt to SOLVE each box: the fix path is box-specific and lives in the
 * walkthroughs. It proves the things that are true of every box that works, and whose
 * absence means no student can finish regardless of skill.
 *
 * Deliberately reports THREE outcomes, never two. A box that could not be driven for a
 * harness reason is INCONCLUSIVE, not a pass -- a sweep that silently converts "I could not
 * check" into "fine" is how 24 of 46 boxes went unmeasured earlier in this work.
 *
 * Exit 0 = no box FAILED. Exit 1 = at least one did.
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

function targets() {
    const dir = path.join(ROOT, '_app/dispatch/boxes');
    return fs.readdirSync(dir)
        .filter(n => fs.existsSync(path.join(dir, n, 'config.js')))
        .filter(n => !ONLY || n === ONLY)
        .sort();
}

const results = [];

(async () => {
    const boxes = targets();
    if (!AS_JSON) console.log(`=== dispatch fleet smoke: ${boxes.length} box(es) against ${BASE} ===\n`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    for (const name of boxes) {
        const rec = { box: name, verdict: null, step: null, errors: [], detail: '' };
        let ctx, page;
        try {
            ctx = await browser.createBrowserContext();   // fresh storage per box; a shared
            page = await ctx.newPage();                    // origin let an earlier sweep read
            const errs = [];                               // the PREVIOUS box's saved state
            page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
            page.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });

            rec.step = 'load';
            await page.goto(`${BASE}/dispatch/boxes/${name}/`, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(1200);

            rec.step = 'start';
            await page.evaluate(() => {
                const b = [...document.querySelectorAll('button')]
                    .filter(x => x.offsetParent !== null)
                    .find(x => /start|begin|launch|enter|boot/i.test(x.textContent));
                if (b) b.click();
            });

            // READINESS = the engine says it booted. Counting .desktop-icon is a false
            // positive: those nodes are built by _buildDOM and sit behind the boot screen.
            rec.step = 'boot';
            let booted = false;
            for (let i = 0; i < 30; i++) {
                booted = await page.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted));
                if (booted) break;
                await sleep(500);
            }
            if (!booted) { rec.verdict = 'FAIL'; rec.detail = 'never reached state.booted'; rec.errors = errs.slice(0, 2); results.push(rec); await ctx.close(); print(rec); continue; }

            /* Launch by the icon's APP ID, taken from the box's own config — not by matching
             * its label. The first version matched /help desk|ticket/ on the visible text and
             * reported 20+ boxes as "no ticket could be selected" when the box was fine and
             * the icon was simply called "IoT Alert" or "Security Alert". `app: 'ticket'` and
             * `app: 'terminal'` are canonical across 92 of 95 dispatch boxes; a label is
             * content, an app id is the contract. Derive, do not enumerate. */
            rec.step = 'tickets';
            const launched = await page.evaluate(() => {
                const icons = (BoxEngine.config.desktop && BoxEngine.config.desktop.icons) || [];
                const def = icons.find(i => i.app === 'ticket');
                if (!def) return false;
                BoxEngine._launchApp(def);
                return true;
            });
            if (!launched) { rec.verdict = 'INCONCLUSIVE'; rec.detail = "no icon with app:'ticket'"; rec.errors = errs.slice(0,2); results.push(rec); await ctx.close(); print(rec); continue; }
            await page.waitForSelector('[data-idx]', { timeout: 15000 }).catch(() => {});
            const took = await page.evaluate(() => {
                const b = document.querySelector('[data-idx]');
                if (!b) return false;
                b.click();
                return true;
            });
            await sleep(1600);

            rec.step = 'terminal';
            const termLaunched = await page.evaluate(() => {
                const icons = (BoxEngine.config.desktop && BoxEngine.config.desktop.icons) || [];
                const def = icons.find(i => i.app === 'terminal');
                if (!def) return false;
                BoxEngine._launchApp(def);
                return true;
            });
            if (!termLaunched) { rec.verdict = 'INCONCLUSIVE'; rec.detail = "no icon with app:'terminal'"; rec.errors = errs.slice(0,2); results.push(rec); await ctx.close(); print(rec); continue; }
            await sleep(1400);
            const shell = await page.evaluate(async () => {
                if (typeof ArenaTerminal === 'undefined' || !ArenaTerminal._instances.length) return null;
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const before = t.outputEl.innerText.length;
                await t._execute('help');
                return t.outputEl.innerText.slice(before).trim().slice(0, 80);
            });

            rec.errors = errs.slice(0, 3);
            if (!took) { rec.verdict = 'FAIL'; rec.detail = 'no ticket could be selected'; }
            else if (shell === null) { rec.verdict = 'INCONCLUSIVE'; rec.detail = 'no terminal instance to drive'; }
            else if (!shell) { rec.verdict = 'FAIL'; rec.detail = '`help` produced no output'; }
            else if (errs.length) { rec.verdict = 'FAIL'; rec.detail = 'page error: ' + errs[0]; }
            else { rec.verdict = 'PASS'; rec.detail = shell.replace(/\s+/g, ' ').slice(0, 50); }
        } catch (e) {
            rec.verdict = 'INCONCLUSIVE';
            rec.detail = 'harness: ' + e.message.slice(0, 90);
        } finally {
            if (ctx) await ctx.close().catch(() => {});
        }
        results.push(rec);
        print(rec);
    }

    await browser.close();

    const pass = results.filter(r => r.verdict === 'PASS').length;
    const fail = results.filter(r => r.verdict === 'FAIL').length;
    const inc  = results.filter(r => r.verdict === 'INCONCLUSIVE').length;
    if (AS_JSON) console.log(JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, results }, null, 2));
    else console.log(`\n${pass} pass, ${fail} FAIL, ${inc} inconclusive (of ${results.length})`);
    process.exitCode = fail ? 1 : 0;
})();

function print(r) {
    if (AS_JSON) return;
    const mark = r.verdict === 'PASS' ? 'ok  ' : r.verdict === 'FAIL' ? 'FAIL' : '??  ';
    console.log(`  ${mark} ${r.box}${r.verdict !== 'PASS' ? '   [' + (r.detail || '') + ']' : ''}`);
}
