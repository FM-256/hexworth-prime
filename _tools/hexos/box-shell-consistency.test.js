#!/usr/bin/env node
/**
 * box-shell-consistency.test.js
 *
 * @catalog what   Drives every dispatch box's terminal in a REAL browser and proves the
 *                 shell tells the truth: every directory `dir` advertises can be entered by
 *                 `cd`, `cd` to a missing path answers in Windows wording rather than bash,
 *                 and `cls` does not print "command not found" after clearing the screen.
 * @catalog run    node _tools/hexos/box-shell-consistency.test.js [--port 5599] [--box <name>]
 * @catalog status TOOL
 *
 * WHY IT EXISTS. box-contract-lint.js proves these properties STATICALLY, from the config.
 * That is fast enough to gate every deploy, but it is a claim about source, not about what a
 * student experiences. The whole reason this defect class reached a student is that no gate
 * ever ran a box; and when I first "verified" the NT1 fix I did it by calling the handlers
 * with a MOCK terminal, which proved the handler logic and nothing about dispatch. This runs
 * the actual page, through the actual Terminal.js dispatcher.
 *
 * SAFE AGAINST PRODUCTION BY CONSTRUCTION. It only reads terminal output — it never signs
 * in, never submits a flag and never calls a callable. It also refuses any non-local base,
 * because "read-only against production" is a claim I have been wrong about before.
 *
 * Serve first:  cd _app && python3 -m http.server 5599 --bind 127.0.0.1
 */
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const PORT = arg('--port', '5599');
const ONLY = arg('--box', null);
const BASE = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0, skip = 0;
const skipped = [];
/** Record one assertion; failures print the observed value so the line says why. */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + label); }
    else { fail++; console.log('    FAIL ' + label + (detail ? '\n           ' + String(detail).replace(/\s+/g, ' ').slice(0, 180) : '')); }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Dispatch boxes that define a `dir` command — the ones this contract applies to. */
function boxes() {
    const dir = path.join(ROOT, '_app/dispatch/boxes');
    return fs.readdirSync(dir).filter(name => {
        const cfg = path.join(dir, name, 'config.js');
        if (!fs.existsSync(cfg)) return false;
        const src = fs.readFileSync(cfg, 'utf8');
        return /\n\s*(?:dir|_dirHome):\s*function/.test(src);
    }).filter(n => !ONLY || n === ONLY);
}

(async () => {
    const list = boxes();
    console.log('=== box shell consistency ===');
    console.log(`${list.length} dispatch boxes with a dir command\n`);

    const browser = await puppeteer.launch({
        headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    for (const box of list) {
        const ctx = typeof browser.createBrowserContext === 'function'
            ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e.message)));

        try {
            await page.goto(`${BASE}/dispatch/boxes/${box}/`, { waitUntil: 'networkidle2', timeout: 45000 });
            await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
            await page.reload({ waitUntil: 'networkidle2', timeout: 45000 });
            await sleep(1500);

            // Start the box, pick a ticket if this box gates on one, open the prompt.
            await page.evaluate(() => {
                const b = [...document.querySelectorAll('button')].find(x => /start|begin|launch|enter/i.test(x.textContent));
                if (b) b.click();
            });
            await sleep(1600);
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /help desk|ticket/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(900);
            await page.evaluate(() => {
                const b = document.querySelector('[class*="scenario-btn"]');
                if (b) b.click();
            });
            await sleep(1200);
            /* Find the terminal icon from the CONFIG, not by guessing at its label. Boxes
             * name it "Command Prompt", "PowerShell", "Terminal" and others — an earlier
             * word-matching selector missed ad001-lockout-storm's "PowerShell" entirely and
             * the box was silently skipped. The icon whose `app` is 'terminal' is the one
             * BoxEngine will route to ArenaTerminal, whatever it is called on screen. */
            await page.evaluate(() => {
                var cfg = (typeof BoxEngine !== 'undefined' && BoxEngine.config) || {};
                var icons = (cfg.desktop && cfg.desktop.icons) || [];
                var termIcon = icons.find(function (i) { return i.app === 'terminal'; });
                var els = [...document.querySelectorAll('.desktop-icon')];
                var el = null;
                if (termIcon && termIcon.label) {
                    var want = termIcon.label.replace(/\s+/g, ' ').trim().toLowerCase();
                    el = els.find(function (x) {
                        return x.textContent.replace(/\s+/g, ' ').trim().toLowerCase().indexOf(want) === 0;
                    });
                }
                if (!el) el = els.find(function (x) { return /command|terminal|prompt|powershell|shell|cmd/i.test(x.textContent); });
                if (el) el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(900);

            const ready = await page.evaluate(() =>
                typeof ArenaTerminal !== 'undefined' && ArenaTerminal._instances.length > 0);
            if (!ready) {
                /* NOT benign. A skipped box is an unverified box, and a sweep that skips
                 * quietly reports coverage it does not have. Named, counted, and it fails
                 * the run so the number cannot be mistaken for a clean result. */
                skip++; skipped.push(box);
                console.log(`\n--- ${box}\n    SKIP no terminal opened — box NOT verified`);
                try { await page.close(); } catch (e) {}
                try { await ctx.close(); } catch (e) {}
                continue;
            }

            /** Run one command through the real dispatcher; return only the new output. */
            const run = (c) => page.evaluate(async (cmd) => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const before = t.outputEl.innerText.length;
                await t._execute(cmd);
                return t.outputEl.innerText.slice(before);
            }, c);

            console.log(`\n--- ${box}`);

            const listing = await run('dir');
            const advertised = listing.split('\n')
                .filter(l => l.includes('<DIR>'))
                .map(l => l.split('<DIR>')[1].trim())
                .filter(d => d && d !== '.' && d !== '..');

            // 1. `cls` must not print a bash error after clearing.
            const clsOut = await run('cls');
            chk('cls does not print "command not found"', !/command not found/i.test(clsOut), clsOut.slice(0, 100));

            // 2. Every directory `dir` advertises must be enterable.
            const stuck = [];
            for (const d of advertised) {
                const out = await run('cd ' + d);
                const cwd = await page.evaluate(() => ArenaTerminal._instances[ArenaTerminal._instances.length - 1].cwd);
                if (/No such file or directory/i.test(out)) stuck.push(d + ' (bash error)');
                else if (/cannot find the path/i.test(out)) stuck.push(d + ' (refused)');
                else if (!new RegExp(d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i').test(cwd)) stuck.push(d + ' (cwd did not move: ' + cwd + ')');
                await run('cd ..');
            }
            chk(`every directory dir advertises is enterable (${advertised.length} listed)`,
                stuck.length === 0, stuck.join('; '));

            // 2b. Anything the box's own _fileTree declares must be reachable by ABSOLUTE
            // path too. Without this, a box like os001-boot-failure passes trivially: its
            // bare `dir` at X:\Sources advertises nothing, so the loop above has nothing to
            // check, while the whole point of that box is reaching C:\Windows. A test that
            // can only see what a default listing shows will bless a broken deep path.
            const treeKeys = await page.evaluate(() => {
                var cfg = (typeof BoxEngine !== 'undefined' && BoxEngine.config) || null;
                return (cfg && cfg._fileTree) ? Object.keys(cfg._fileTree) : [];
            });
            if (treeKeys.length) {
                const unreachable = [];
                for (const k of treeKeys) {
                    const out = await run('cd "' + k + '"');
                    const cwd = await page.evaluate(() => ArenaTerminal._instances[ArenaTerminal._instances.length - 1].cwd);
                    if (/No such file or directory/i.test(out)) unreachable.push(k + ' (bash error)');
                    else if (cwd.toLowerCase() !== k.toLowerCase()) unreachable.push(k + ' (cwd=' + cwd + ')');
                }
                chk(`every path in _fileTree is reachable absolutely (${treeKeys.length})`,
                    unreachable.length === 0, unreachable.join('; '));
            }

            // 3. A missing path answers in Windows wording, not bash.
            const missing = await run('cd ZzNoSuchDir');
            chk('missing path gives the Windows error, not bash',
                !/No such file or directory/i.test(missing), missing.slice(0, 110));

            chk('no uncaught page errors', errors.length === 0, errors.slice(0, 1).join(' | '));
        } catch (e) {
            fail++;
            console.log(`\n--- ${box}\n    FAIL threw: ${e.message.slice(0, 110)}`);
        } finally {
            /* Closing must never abort the sweep. A ctx.close() on an already-gone target
             * throws "Protocol error (Target.closeTarget)", and because that happens in
             * `finally` it propagated out of the loop and killed the entire run — after ONE
             * box. The run still printed a summary and, piped to tail, still exited 0. A
             * harness that dies on box 1 and reports success is worse than no harness. */
            try { await page.close(); } catch (e) { /* already gone */ }
            try { await ctx.close(); } catch (e) { /* already gone */ }
        }
    }

    await browser.close();
    console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
    if (skipped.length) {
        console.log('\nNOT VERIFIED (no terminal opened) — these are unverified, not passing:');
        skipped.forEach(function (b) { console.log('  - ' + b); });
    }
    // Skips count against the run: coverage claimed must be coverage achieved.
    process.exitCode = (fail > 0 || skip > 0) ? 1 : 0;
})().catch(e => { console.error('HARNESS FAILED: ' + e.message); process.exitCode = 1; });
