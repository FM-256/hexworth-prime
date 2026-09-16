#!/usr/bin/env node
/**
 * os002-completability.test.js
 *
 * @catalog what   Plays every os002 scenario the way a student does — opens the ticket,
 *                 picks the scenario, types the documented commands OR clicks the panel,
 *                 then asserts a real flag token is RENDERED on screen. Closes the gap
 *                 task 390 names for this box: walkthrough-verbatim drives the terminal
 *                 only, so it can never see a GUI completion or a token in a panel.
 * @catalog run    node _tools/hexos/os002-completability.test.js [--base URL]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * Measured on production 2026-09-16, BEFORE the rebuild: 28 walkthrough commands typed
 * verbatim, 28 failed, and opening Services then the Update Panel left the panel's content
 * length at 0 — the Apply Fix button, the only completion path the box had, was not in it.
 * Neither fact was visible to any existing harness. This one asserts the thing a student
 * actually needs: that each scenario ENDS with a token they can submit.
 *
 * A token is only accepted if it matches the flag shape AND is not the string "null" or
 * "N/A" — a delivery failure renders as text and would otherwise read as success.
 */
'use strict';
const puppeteer = require('puppeteer');
const bi = process.argv.indexOf('--base');
const BASE = bi > -1 ? process.argv[bi + 1] : 'http://127.0.0.1:5599';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Each scenario's route, in the order the box documents it. `cmds` is the terminal path;
 * `panel` means the fix is a GUI action the lab image performs for you (WinRE recovery,
 * Device Manager driver rollback) and the box says so in its ticket and hint3. */
const PLAN = [
    { idx: 0, id: 'update_stuck', cmds: ['net stop wuauserv', 'net stop bits', 'del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*', 'net start wuauserv', 'net start bits'] },
    { idx: 1, id: 'rollback_fail', panel: true },
    { idx: 2, id: 'driver_update_broke', panel: true },
    { idx: 3, id: 'reboot_loop', cmds: ['wmic qfe list brief', 'dism /online /cleanup-image /startcomponentcleanup', 'wusa /uninstall /kb:5031354'] },
    { idx: 4, id: 'no_space_update', cmds: ['wmic logicaldisk get size,freespace,caption', 'del /q /s C:\\Windows\\Temp\\*', 'rd /s /q C:\\Windows.old'] }
];

let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log(`    ok   ${n}`); } else { fail++; console.log(`    FAIL ${n}${d ? '  ' + d : ''}`); } };

(async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const sc of PLAN) {
        console.log(`\n--- ${sc.id} (${sc.panel ? 'panel route' : 'terminal route'})`);
        const ctx = await b.createBrowserContext();
        const p = await ctx.newPage();
        const errs = [];
        p.on('pageerror', e => errs.push(e.message));
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        await p.goto(`${BASE}/dispatch/boxes/os002-update-nightmare/`, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(1000);
        await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
        for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
        await p.keyboard.press('Shift'); await sleep(350);
        await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
        await sleep(500);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
        await p.waitForSelector('[data-idx]', { timeout: 9000 });
        await p.evaluate(i => document.querySelectorAll('[data-idx]')[i].click(), sc.idx);
        await sleep(900);

        // Services and the Update Panel open TOGETHER — this is the exact order that used
        // to leave the panel blank.
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'services'); BoxEngine._launchApp(t); });
        await sleep(500);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'hw_panel'); BoxEngine._launchApp(t); });
        await sleep(700);
        const panelLen = await p.evaluate(() => [...document.querySelectorAll('[data-os2-panel]')].map(n => n.innerText.trim().length));
        ok('Update Panel renders with Services already open', panelLen.length > 0 && panelLen.every(l => l > 50), JSON.stringify(panelLen));
        const svcLen = await p.evaluate(() => [...document.querySelectorAll('[data-os2-services]')].map(n => n.innerText.trim().length));
        ok('Services window lists services', svcLen.length > 0 && svcLen.every(l => l > 50), JSON.stringify(svcLen));
        ok('Services window actually names wuauserv', await p.evaluate(() => [...document.querySelectorAll('[data-os2-services]')].some(n => /wuauserv/.test(n.innerText))));

        if (sc.panel) {
            const clicked = await p.evaluate(() => { const f = document.querySelector('.os2-panel-fix'); if (!f) return false; f.click(); return true; });
            ok('Apply Fix button present and clicked', clicked);
        } else {
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
            await sleep(800);
            for (const c of sc.cmds) {
                await p.evaluate(async cmd => {
                    const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                    await t._execute(cmd);
                }, c);
                await sleep(200);
            }
            ok('terminal sequence marked the scenario complete', await p.evaluate(() => !!BoxEngine.state._flagRevealed));
        }
        await sleep(1400);

        /* THE TOKEN SLOT AND THE TOKEN VALUE ARE TWO DIFFERENT CLAIMS.
         * Firebase Auth is domain-scoped, so deliverFlag resolves to null on any origin
         * that is not hexworth.com — localhost and preview channels included
         * (memory: reference_preview_channel_auth_blocks_flags). A run against a local
         * server can therefore prove the completion UI appeared, but CANNOT prove the value
         * is right; asserting the value here would report a false failure on a correct box,
         * and passing a null through would report a false success. So the value assertion
         * is only made where it can actually be made. */
        const slot = await p.evaluate(() => {
            const el = document.querySelector('.os2-flag-slot');
            return el ? el.textContent.trim() : null;
        });
        ok('completion UI shows a token slot', !!slot && /^Token:/.test(slot), `got: ${slot}`);
        const tok = await p.evaluate(() => {
            const m = document.body.innerText.match(/flag\{[^}]{3,60}\}/i);
            return m ? m[0] : null;
        });
        if (/hexworth\.com/.test(BASE)) {
            ok('a real token is RENDERED on screen', !!tok && !/null|N\/A/i.test(tok), `got: ${tok}`);
            ok(`token is this scenario's own value`, !!tok && tok.toLowerCase().includes(sc.id), `got: ${tok}`);
        } else {
            console.log(`    SKIP token value — ${BASE} is not hexworth.com, Auth is domain-scoped so delivery returns null by design (slot said: ${slot})`);
        }
        ok('no uncaught page errors', errs.length === 0, errs.join(' | '));
        await ctx.close();
    }
    /* A WALKTHROUGH PROVES COMPLETABLE, NOT UNBEATABLE — CHEATS MUST FAIL.
     * Everything above is the happy path. Nancy reviewed these three cheat routes by hand
     * and found no live exploit, but that reasoning lived in a review, not in anything
     * re-runnable, so the next edit to this box had nothing checking it. Now it does. */
    console.log('\n--- cheat resistance');
    {
        const open = async (p, idx) => {
            await p.goto(`${BASE}/dispatch/boxes/os002-update-nightmare/`, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(1000);
            await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
            for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
            await p.keyboard.press('Shift'); await sleep(350);
            await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
            await sleep(500);
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
            await p.waitForSelector('[data-idx]', { timeout: 9000 });
            await p.evaluate(i => document.querySelectorAll('[data-idx]')[i].click(), idx);
            await sleep(900);
        };

        // 1. NEGATIVE CONTROL. Open every window, touch nothing. If a token appears here,
        //    every pass above is worthless — opening windows would BE the solution.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 0);
            await p.evaluate(async () => {
                for (const ic of BoxEngine.config.desktop.icons) {
                    if (ic.app === 'reset_lab') continue;
                    try { BoxEngine._launchApp(ic); } catch (e) {}
                    await new Promise(r => setTimeout(r, 200));
                }
            });
            await sleep(1500);
            const leaked = await p.evaluate(() => /flag\{/i.test(document.body.innerText) || !!BoxEngine.state._flagRevealed);
            ok('negative control: opening every window reveals nothing', !leaked);
            await ctx.close();
        }

        // 2. Service buttons cannot start an already-running service, and toggling services
        //    alone must not complete update_stuck — the cache still has to be cleared.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 0);
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'services'); BoxEngine._launchApp(t); });
            await sleep(700);
            const labels = await p.evaluate(() => [...document.querySelectorAll('.os2-svc-btn')].map(b => ({ svc: b.getAttribute('data-svc'), act: b.getAttribute('data-act'), status: b.closest('div').innerText })));
            const wrong = labels.filter(l => (l.act === 'start' && /Running/.test(l.status)) || (l.act === 'stop' && /Stopped/.test(l.status)));
            ok('no button offers Start on a running service (or Stop on a stopped one)', wrong.length === 0, JSON.stringify(wrong));
            // Mash every service button twice — stop, start, stop, start.
            for (let round = 0; round < 4; round++) {
                await p.evaluate(() => { [...document.querySelectorAll('.os2-svc-btn')].forEach(b => b.click()); });
                await sleep(300);
            }
            const gamed = await p.evaluate(() => !!BoxEngine.state._flagRevealed);
            ok('toggling services alone does not complete update_stuck', !gamed);
            await ctx.close();
        }

        // 3. reboot_loop's cache-clear route must not fire in a scenario that is not
        //    reboot_loop. Run the identical command sequence against update_stuck and
        //    confirm it completes for the RIGHT reason, and against no_space_update where
        //    clearing the cache alone is not enough to reach 20 GB.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4); // no_space_update
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
            await sleep(700);
            await p.evaluate(async () => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                for (const c of ['net stop wuauserv', 'net stop bits', 'rd /s /q C:\\Windows\\SoftwareDistribution', 'net start wuauserv', 'net start bits']) await t._execute(c);
            });
            await sleep(600);
            const s = await p.evaluate(() => ({ flag: !!BoxEngine.state._flagRevealed, free: BoxEngine.state._freeGb }));
            ok("reboot_loop's cache-clear route does not complete no_space_update", !s.flag, JSON.stringify(s));
            await ctx.close();
        }

        // 4. The SoftwareDistribution delete must refuse until BOTH holders are stopped —
        //    the ticket and hint3 both say wuauserv AND bits.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 0);
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
            await sleep(700);
            const out = await p.evaluate(async () => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                await t._execute('net stop wuauserv');
                const n = t.outputEl.innerText.length;
                await t._execute('del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*');
                return { text: t.outputEl.innerText.slice(n), cleared: !!BoxEngine.state._sdCleared };
            });
            ok('delete is refused while BITS still holds the folder', /Access is denied/.test(out.text) && !out.cleared, JSON.stringify(out).slice(0, 200));
            await ctx.close();
        }

        // 5. BYTE ACCOUNTING MUST NOT DEPEND ON ORDER.
        //    Chris found `rd ...\Download` then `rd ...\SoftwareDistribution` crediting the
        //    same 3.2 GB twice (2.1 -> 5.3 -> 8.5). No combination of del / rd / cleanmgr may
        //    pay for the same files more than once, in the box whose ticket is about counting
        //    gigabytes. Every sequence below touches ONLY the SoftwareDistribution cache, so
        //    every one of them must land on exactly 2.1 + 3.2 = 5.3 GB free.
        {
            const SEQS = [
                ['rd /s /q C:\\Windows\\SoftwareDistribution\\Download', 'rd /s /q C:\\Windows\\SoftwareDistribution'],
                ['del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*', 'rd /s /q C:\\Windows\\SoftwareDistribution'],
                ['del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*', 'rd /s /q C:\\Windows\\SoftwareDistribution\\Download', 'rd /s /q C:\\Windows\\SoftwareDistribution'],
                ['rd /s /q C:\\Windows\\SoftwareDistribution', 'del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*'],
                ['del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*', 'del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*']
            ];
            for (const seq of SEQS) {
                const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
                p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
                await open(p, 4); // no_space_update, starts at 2.1 GB
                await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
                await sleep(700);
                const free = await p.evaluate(async cmds => {
                    const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                    await t._execute('net stop wuauserv');
                    await t._execute('net stop bits');
                    for (const c of cmds) await t._execute(c);
                    return BoxEngine.state._freeGb;
                }, seq);
                ok(`free space is 5.3 GB after: ${seq.map(c => c.split(' ').pop().replace('C:\\Windows\\', '')).join(' then ')}`,
                    Math.abs(free - 5.3) < 0.05, `got ${free} GB`);
                await ctx.close();
            }
        }

        // 6. reboot_loop must accept EITHER cache-discard spelling. Chris found it credited
        //    only `rd ...\SoftwareDistribution`; a student using `del ...\Download\*` — the
        //    command that solves update_stuck — fixed the machine and got nothing.
        {
            for (const [label, cmd] of [['rd parent', 'rd /s /q C:\\Windows\\SoftwareDistribution'],
                                        ['del Download\\*', 'del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*']]) {
                const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
                p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
                await open(p, 3); // reboot_loop
                await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
                await sleep(700);
                const done = await p.evaluate(async c => {
                    const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                    for (const x of ['net stop wuauserv', 'net stop bits', c, 'net start wuauserv', 'net start bits']) await t._execute(x);
                    return !!BoxEngine.state._flagRevealed;
                }, cmd);
                ok(`reboot_loop completes via ${label}`, done);
                await ctx.close();
            }
        }

        // 7. cleanmgr after a manual delete must not re-pay for what was already reclaimed.
        {
            const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
            p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
            await open(p, 4);
            await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
            await sleep(700);
            const free = await p.evaluate(async () => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                for (const c of ['net stop wuauserv', 'net stop bits', 'del /q /s C:\\Windows\\Temp\\*',
                                 'del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*',
                                 'rd /s /q C:\\Windows.old', 'cleanmgr /sagerun:1']) await t._execute(c);
                return BoxEngine.state._freeGb;
            });
            // 2.1 + 1.8 temp + 3.2 cache + 18.4 Windows.old = 25.5, and cleanmgr adds nothing.
            ok('cleanmgr after manual deletes totals 25.5 GB, not more', Math.abs(free - 25.5) < 0.05, `got ${free} GB`);
            await ctx.close();
        }
    }

    /* RESET IS HOW THE OPERATOR SWITCHES SCENARIOS — it is not a nice-to-have.
     * This box now carries simulated machine state (services, free space, cleared caches)
     * that did not exist before, so reset has more to undo than it used to. If any of it
     * survived, the next scenario would open half-solved. */
    console.log('\n--- reset returns the box to the scenario picker with clean state');
    {
        const ctx = await b.createBrowserContext();
        const p = await ctx.newPage();
        p.on('dialog', async d => { try { await d.accept(); } catch (e) {} });
        await p.goto(`${BASE}/dispatch/boxes/os002-update-nightmare/`, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(1000);
        await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
        for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
        await p.keyboard.press('Shift'); await sleep(350);
        await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
        await sleep(500);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
        await p.waitForSelector('[data-idx]', { timeout: 9000 });
        await p.evaluate(() => document.querySelectorAll('[data-idx]')[4].click());   // no_space_update
        await sleep(800);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
        await sleep(700);
        await p.evaluate(async () => {
            const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
            await t._execute('net stop wuauserv');
            await t._execute('rd /s /q C:\\Windows.old');
        });
        await sleep(400);
        const dirty = await p.evaluate(() => ({ svc: BoxEngine.state._svc && BoxEngine.state._svc.wuauserv, free: BoxEngine.state._freeGb, old: BoxEngine.state._windowsOldRemoved }));
        ok('state is dirty before reset', dirty.svc === 'Stopped' && dirty.old === true, JSON.stringify(dirty));

        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'reset_lab'); BoxEngine._launchApp(t); });
        await sleep(700);
        const confirmed = await p.evaluate(() => {
            const btns = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /^reset$/i.test(b.textContent.trim()));
            if (!btns.length) return false;
            btns[0].click(); return true;
        });
        ok('reset confirmation dialog appears and is confirmable', confirmed);
        await sleep(2600);
        for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
        await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
        await sleep(1200);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
        await sleep(900);
        const back = await p.evaluate(() => document.querySelectorAll('[data-idx]').length);
        ok('scenario picker is offered again after reset', back === 5, `found ${back} tickets`);
        const clean = await p.evaluate(() => ({ sel: BoxEngine.state._scenarioSelected, old: BoxEngine.state._windowsOldRemoved, flag: BoxEngine.state._flagRevealed }));
        ok('simulated machine state did not survive reset', !clean.sel && !clean.old && !clean.flag, JSON.stringify(clean));
        await ctx.close();
    }

    await b.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
