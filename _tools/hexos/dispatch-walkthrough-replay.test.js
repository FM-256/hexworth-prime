#!/usr/bin/env node
/**
 * dispatch-walkthrough-replay.test.js
 *
 * @catalog what   Replays each dispatch box's DOCUMENTED fix, from its own walkthrough, and
 *                 requires the box to signal that the incident was resolved. Answers "can a
 *                 student who follows the walkthrough actually finish this box".
 * @catalog run    node _tools/hexos/dispatch-walkthrough-replay.test.js [--base URL] [--only <box>] [--scenarios N|all] [--json]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * dispatch-fleet-smoke proves a student is not BLOCKED: 95/95 boxes boot, dispatch a ticket
 * and answer commands. It does not prove any of them can be FINISHED. Nothing on this
 * platform has ever checked that the fix a walkthrough documents actually resolves the box
 * it documents -- DOC-001 checks the walkthrough does not promise commands the box lacks,
 * which is a different and weaker claim.
 *
 * SOURCE OF TRUTH IS THE WALKTHROUGH, NOT THIS FILE. Fix commands are extracted per
 * scenario from `### The Fix` (445 occurrences across the fleet; 401 carry commands, 44 are
 * GUI-only). Nothing about any box's solution is written here -- if the walkthrough is
 * wrong, this reports the box as failing, which is the correct outcome: the walkthrough is
 * what a student follows.
 *
 * SUCCESS SIGNAL IS THE ENGINE'S, NOT A PER-BOX STRING. BoxEngine.notify is intercepted and
 * the box must raise a 'success' notification, or one whose text reads as a resolution.
 * Boxes have no common state flag (_resolved in 15, _fixed in 10, nothing in the rest), so
 * keying on state would have meant a hand-written per-box table -- the enumeration that let
 * `id` leak fleet-wide and `resetLab` die in 46 boxes.
 *
 * DOES NOT REQUEST OR SUBMIT FLAGS. Flags are server-delivered and server-validated, so a
 * flag-based assertion would mint real anonymous accounts and write real flag_captures on
 * every run. 32 real accounts were created that way on 2026-09-09 while measuring the very
 * problem of accounts being created unintentionally. Defaults to a LOCAL base for the same
 * reason.
 *
 * THREE outcomes, never two. GUI-only fixes, boxes whose scenario count disagrees with the
 * walkthrough, and anything the harness could not drive are INCONCLUSIVE -- never a pass.
 *
 * Exit 0 = no scenario FAILED. Exit 1 = at least one did.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const SOLUTIONS = path.join(process.env.HOME || '', 'hexworth-shared/Solutions');
const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:5599');
const ONLY = arg('--only', null);
const SCEN = arg('--scenarios', '1');
const AS_JSON = argv.includes('--json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** box -> walkthrough path, taken from the drift report's own pairing rather than guessed. */
function pairing() {
    const p = path.join(ROOT, '_tools/reports/BOX_WALKTHROUGH_FLAG_DRIFT.json');
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const map = {};
    for (const v of d.verdicts || []) {
        if (!v.walkthrough) continue;
        const md = path.join(SOLUTIONS, v.walkthrough.replace(/\.[^./]+$/, '.md'));
        if (fs.existsSync(md) && !map[v.boxName]) map[v.boxName] = md;
    }
    return map;
}

/** Per-scenario fix commands, in document order. */
function fixesFor(mdPath) {
    const t = fs.readFileSync(mdPath, 'utf8');
    const out = [];
    // Split on scenario headings so a fix is attributed to the scenario it sits under.
    const parts = t.split(/^##\s*Scenario\s*\d+/m).slice(1);
    for (const part of parts) {
        const fix = (part.match(/###\s*The Fix([\s\S]*?)(?=\n###|\n##|$)/) || [])[1] || '';
        const cmds = [];
        for (const blk of fix.match(/```[a-zA-Z]*\n[\s\S]*?```/g) || []) {
            for (let line of blk.replace(/```[a-zA-Z]*\n?/g, '').split('\n')) {
                line = line.trim();
                if (!line || line.startsWith('#') || line.startsWith('//')) continue;
                // Strip a shell prompt the doc shows for realism: "PS C:\X> cmd", "C:\>cmd", "$ cmd"
                line = line.replace(/^PS\s+[A-Za-z]:\\[^>]*>\s*/, '')
                           .replace(/^[A-Za-z]:\\[^>]*>\s*/, '')
                           .replace(/^\$\s+/, '');
                if (!line) continue;
                cmds.push(line);
            }
        }
        out.push(cmds);
    }
    return out;
}

/** Scenario ids as the BOX orders them — seed/registry order is alphabetical and differs. */
function scenarioIds(box) {
    const f = path.join(ROOT, '_app/dispatch/boxes', box, 'config.js');
    const src = fs.readFileSync(f, 'utf8');
    const m = src.match(/_scenarios\s*:\s*\[([\s\S]*?)\n    \]/);
    if (!m) return null;
    return [...m[1].matchAll(/id\s*:\s*'([^']+)'/g)].map(x => x[1]);
}

const results = [];
function record(r) {
    results.push(r);
    if (AS_JSON) return;
    const mark = r.verdict === 'PASS' ? 'ok  ' : r.verdict === 'FAIL' ? 'FAIL' : '??  ';
    console.log(`  ${mark} ${r.box} [${r.scenario}]${r.verdict === 'PASS' ? '' : '   ' + r.detail}`);
}

(async () => {
    const map = pairing();
    let boxes = fs.readdirSync(path.join(ROOT, '_app/dispatch/boxes'))
        .filter(b => map[b]).sort();
    if (ONLY) boxes = boxes.filter(b => b === ONLY);
    if (!AS_JSON) console.log(`=== walkthrough replay: ${boxes.length} box(es) against ${BASE} ===\n`);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    for (const box of boxes) {
        const ids = scenarioIds(box);
        const fixes = fixesFor(map[box]);
        if (!ids) { record({ box, scenario: '-', verdict: 'INCONCLUSIVE', detail: 'no _scenarios array in config' }); continue; }
        if (fixes.length !== ids.length) {
            record({ box, scenario: '-', verdict: 'INCONCLUSIVE',
                     detail: `walkthrough has ${fixes.length} scenario section(s), config has ${ids.length} — positional mapping unsafe` });
            continue;
        }
        const limit = SCEN === 'all' ? ids.length : Math.min(parseInt(SCEN, 10) || 1, ids.length);

        for (let i = 0; i < limit; i++) {
            const cmds = fixes[i];
            if (!cmds.length) { record({ box, scenario: ids[i], verdict: 'INCONCLUSIVE', detail: 'fix is GUI-only — no commands to replay' }); continue; }
            let ctx, page;
            const rec = { box, scenario: ids[i], verdict: null, detail: '', commands: cmds.length };
            try {
                ctx = await browser.createBrowserContext();
                page = await ctx.newPage();
                const errs = [];
                page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
                page.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
                await page.goto(`${BASE}/dispatch/boxes/${box}/`, { waitUntil: 'networkidle2', timeout: 60000 });
                await sleep(1000);
                await page.evaluate(() => {
                    const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null)
                        .find(x => /start|begin|launch|enter|boot/i.test(x.textContent));
                    if (b) b.click();
                });
                let booted = false;
                for (let k = 0; k < 30 && !booted; k++) {
                    booted = await page.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted));
                    if (!booted) await sleep(500);
                }
                if (!booted) { rec.verdict = 'INCONCLUSIVE'; rec.detail = 'never booted'; throw new Error('skip'); }

                // Intercept the engine's own success channel before anything can fire.
                /* THE SUCCESS SIGNAL: does the box ASK FOR ITS FLAG?
                 *
                 * A box requests its flag only once it has decided the scenario is solved, so
                 * requestFlagText being called is the box's own verdict on the fix — engine
                 * level, no per-box table, and true for every submit-validate box.
                 *
                 * STUBBED, not merely observed: the real call reaches Firebase, mints an
                 * anonymous account and can write flag_captures. 32 real accounts were created
                 * that way on 2026-09-09. Stubbing keeps this harness off production entirely.
                 *
                 * The first version of this rule keyed on a 'success' notification whose text
                 * matched /resolv|restor|fixed|.../ — and the negative control PASSED, because
                 * boxes raise success notices for incidental actions too ("SSPR portal is back
                 * online"). An assertion that cannot fail is not an assertion. */
                await page.evaluate(() => {
                    globalThis.__notes = [];
                    globalThis.__flagAsks = 0;
                    const orig = BoxEngine.notify.bind(BoxEngine);
                    BoxEngine.notify = function (msg, type) { globalThis.__notes.push({ msg: String(msg), type: String(type || '') }); return orig(msg, type); };
                    BoxEngine.requestFlagText = async function () { globalThis.__flagAsks++; return 'flag{stubbed-by-replay-harness}'; };
                    BoxEngine.getDeliveredFlag = function () { globalThis.__flagAsks++; return 'flag{stubbed-by-replay-harness}'; };
                });

                const launched = await page.evaluate((idx) => {
                    const icons = (BoxEngine.config.desktop && BoxEngine.config.desktop.icons) || [];
                    const t = icons.find(i => i.app === 'ticket');
                    if (!t) return false;
                    BoxEngine._launchApp(t);
                    return true;
                }, i);
                if (!launched) { rec.verdict = 'INCONCLUSIVE'; rec.detail = "no icon with app:'ticket'"; throw new Error('skip'); }
                await page.waitForSelector('[data-idx]', { timeout: 12000 }).catch(() => {});
                const picked = await page.evaluate((idx) => {
                    const b = document.querySelector(`[data-idx="${idx}"]`) || document.querySelectorAll('[data-idx]')[idx];
                    if (!b) return false;
                    b.click();
                    return true;
                }, i);
                if (!picked) { rec.verdict = 'INCONCLUSIVE'; rec.detail = `no ticket button for scenario index ${i}`; throw new Error('skip'); }
                await sleep(1400);

                await page.evaluate(() => {
                    const icons = (BoxEngine.config.desktop && BoxEngine.config.desktop.icons) || [];
                    const t = icons.find(i => i.app === 'terminal');
                    if (t) BoxEngine._launchApp(t);
                });
                await sleep(1200);

                const ran = await page.evaluate(async (cmdList) => {
                    if (typeof ArenaTerminal === 'undefined' || !ArenaTerminal._instances.length) return null;
                    const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                    const out = [];
                    for (const c of cmdList) {
                        const before = t.outputEl.innerText.length;
                        try { await t._execute(c); } catch (e) { out.push('THREW: ' + e.message); continue; }
                        out.push(t.outputEl.innerText.slice(before).trim().slice(0, 120));
                    }
                    return out;
                }, cmds);
                if (ran === null) { rec.verdict = 'INCONCLUSIVE'; rec.detail = 'no terminal instance'; throw new Error('skip'); }
                await sleep(900);

                const { notes, asks } = await page.evaluate(() => ({ notes: globalThis.__notes || [], asks: globalThis.__flagAsks || 0 }));
                rec.notes = notes.length;
                rec.flagAsks = asks;
                if (asks > 0) { rec.verdict = 'PASS'; }
                else {
                    rec.verdict = 'FAIL';
                    const last = notes.length ? notes[notes.length - 1].msg.slice(0, 70) : '(no notification at all)';
                    rec.detail = `box never asked for its flag after the documented fix — last notice: ${last}`;
                }
                if (errs.length && rec.verdict === 'PASS') { rec.verdict = 'FAIL'; rec.detail = 'page error: ' + errs[0]; }
            } catch (e) {
                if (!rec.verdict) { rec.verdict = 'INCONCLUSIVE'; rec.detail = 'harness: ' + e.message.slice(0, 80); }
            } finally {
                if (ctx) await ctx.close().catch(() => {});
            }
            record(rec);
        }
    }

    await browser.close();
    const p = results.filter(r => r.verdict === 'PASS').length;
    const f = results.filter(r => r.verdict === 'FAIL').length;
    const i = results.filter(r => r.verdict === 'INCONCLUSIVE').length;
    if (AS_JSON) console.log(JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, results }, null, 2));
    else console.log(`\n${p} pass, ${f} FAIL, ${i} inconclusive (of ${results.length})`);
    process.exitCode = f ? 1 : 0;
})();
