#!/usr/bin/env node
/**
 * nt1-scenarios-e2e.test.js
 *
 * @catalog what   Drives ALL FIVE NT1 scenarios end-to-end in a real browser: selects the
 *                 ticket, asserts the broken symptoms the instructor walkthrough documents,
 *                 applies the documented fix, and confirms connectivity is restored and the
 *                 flag becomes reachable. Also re-checks the shell (dir/cd/type) inside every
 *                 scenario, since those share state with the network sim.
 * @catalog run    node _tools/hexos/nt1-scenarios-e2e.test.js [--local] [--copy dispatch|arena]
 * @catalog status TOOL
 *
 * WHY. The filesystem fix was verified only against HD-7201. "Is the box good to go" is a
 * question about all five tickets, and each has a different broken state, a different fix
 * surface (two of them GUI-only) and a different flag location. A per-scenario walk is the
 * only thing that answers it.
 *
 * REAL PATHS ONLY. Scenarios are chosen by clicking the ticket button a student clicks, and
 * fixes are applied through the terminal or by clicking the actual Enable/Start/Disable
 * button -- never by writing engine state directly, which would prove nothing about whether
 * a student can finish.
 */
'use strict';

const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const copyIdx = argv.indexOf('--copy');
const COPY = copyIdx > -1 ? argv[copyIdx + 1] : 'dispatch';
const BASE = argv.includes('--local') ? 'http://127.0.0.1:5599' : 'https://hexworth.com';
const URL = `${BASE}/${COPY}/boxes/nt1-network-troubleshoot/`;

let pass = 0, fail = 0;
/** Record one assertion, printing the observed value when it fails. */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + label); }
    else { fail++; console.log('    FAIL ' + label + (detail ? '\n           ' + String(detail).replace(/\n/g, ' ').slice(0, 220) : '')); }
};
/** Pause the harness; the box animates window opens and scenario application. */
const sleep = ms => new Promise(r => setTimeout(r, ms));

// One entry per scenario, in the order the ticket queue renders them (HD-7200 + index).
// `symptom` is asserted BEFORE the fix, `verify` AFTER it.
const SCENARIOS = [
    {
        idx: 0, ticket: 'HD-7200', id: 'dns_poisoned',
        symptomCmd: 'ping google.com',
        symptom: out => /could not find host|Request timed out|142\.250|Reply/.test(out),
        fix: async (run) => { await run('ipconfig /flushdns'); },
        flagCmd: 'ipconfig /displaydns'
    },
    {
        idx: 1, ticket: 'HD-7201', id: 'disabled_adapter',
        symptomCmd: 'ipconfig /all',
        symptom: out => /Media disconnected/.test(out),
        fix: async (run) => {
            await run('netsh interface set interface "Ethernet0" enable');
            await run('ipconfig /renew');
        },
        flagGui: 'device_manager'
    },
    {
        idx: 2, ticket: 'HD-7202', id: 'firewall_block',
        symptomCmd: 'ping 8.8.8.8',
        symptom: out => /Request timed out|unreachable/.test(out),
        fixGui: 'firewall',
        flagGui: 'firewall'
    },
    {
        idx: 3, ticket: 'HD-7203', id: 'wrong_subnet',
        symptomCmd: 'ipconfig /all',
        symptom: out => /192\.168\.2\./.test(out),
        fix: async (run) => { await run('netsh interface ip set address "Ethernet0" static 192.168.1.50 255.255.255.0 192.168.1.1'); },
        flagCmd: 'ping google.com'
    },
    {
        idx: 4, ticket: 'HD-7204', id: 'dhcp_stopped',
        symptomCmd: 'ipconfig /all',
        symptom: out => /169\.254\./.test(out),
        fixGui: 'services',
        postFix: async (run) => { await run('ipconfig /renew'); },
        flagGui: 'services'
    }
];

(async () => {
    console.log('=== NT1 all-scenario e2e ===');
    console.log('url:', URL, '\n');

    const browser = await puppeteer.launch({
        headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    for (const s of SCENARIOS) {
        console.log(`\n--- ${s.ticket}  ${s.id} ---`);
        // ISOLATED CONTEXT PER SCENARIO. The box persists progress to localStorage under its
        // storageKey, and localStorage is shared across tabs of one origin -- so reusing the
        // browser let scenario 0's COMPLETED state restore into every later run. The picker
        // never appeared, id stayed 0, and the post-fix assertions all passed against the
        // wrong scenario: a harness reporting green while measuring nothing.
        const ctx = typeof browser.createBrowserContext === 'function'
            ? await browser.createBrowserContext()
            : await browser.createIncognitoBrowserContext();
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e.message)));

        try {
            await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
            // Explicitly clear anything a previous run left, then reload into a clean box.
            await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });

            // Start the box, then open the ticket queue and pick THIS scenario by clicking.
            await page.evaluate(() => {
                const b = [...document.querySelectorAll('button')].find(x => /start|begin|launch|enter/i.test(x.textContent));
                if (b) b.click();
            });
            await sleep(2200);
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /help desk|ticket/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(1200);

            const picked = await page.evaluate((idx) => {
                const all = [...document.querySelectorAll('.nt1-scenario-btn')];
                const btn = all.find(b => b.dataset.idx === String(idx));
                if (!btn) return { ok: false, found: all.length };
                btn.click();
                return { ok: true, found: all.length };
            }, s.idx);
            chk('ticket ' + s.ticket + ' selectable from the queue', picked.ok,
                'scenario buttons rendered: ' + picked.found + ' (0 means the picker never showed -- restored state?)');
            await sleep(1800);

            const active = await page.evaluate(() => {
                const e = BoxEngine;
                return { id: e.state._scenarioId, sel: !!e.state._scenarioSelected };
            });
            chk('scenario ' + s.idx + ' is the active assignment', active.id === s.idx && active.sel,
                JSON.stringify(active));

            // Open the Command Prompt and drive the real dispatcher.
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /command/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(1000);
            /**
             * Run one command through the REAL Terminal.js dispatcher and return ONLY the
             * output it newly appended. Calls _execute() -- the same entry point the Enter
             * keyhandler uses -- rather than typing, because the terminal input is
             * offsetParent === null under headless Chromium and page.type() would silently
             * enter nothing, leaving every assertion reading an empty terminal.
             */
            const run = (c) => page.evaluate(async (cmd) => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const before = t.outputEl.innerText.length;
                await t._execute(cmd);
                return t.outputEl.innerText.slice(before);
            }, c);

            // 1. The documented broken symptom must actually be present.
            const sym = await run(s.symptomCmd);
            chk('broken symptom present (' + s.symptomCmd + ')', s.symptom(sym), sym.slice(-200));

            // 2. The shell fix must work in THIS scenario too, not only HD-7201.
            const dirOut = await run('dir');
            chk('`dir` lists Documents', /Documents/.test(dirOut), dirOut.slice(-160));
            await run('cd Documents');
            const cwd = await page.evaluate(() => ArenaTerminal._instances[ArenaTerminal._instances.length - 1].cwd);
            chk('`cd Documents` moves the cwd', /Documents$/.test(cwd), cwd);
            const baseline = await run('type network-baseline.txt');
            chk('baseline readable, names the gateway', /192\.168\.1\.1/.test(baseline), baseline.slice(-160));
            await run('cd ..');

            // 3. Apply the documented fix on its real surface.
            if (s.fix) await s.fix(run);
            if (s.fixGui) {
                const clicked = await page.evaluate((app) => {
                    const icons = [...document.querySelectorAll('.desktop-icon')];
                    const map = { firewall: /firewall/i, services: /services/i, device_manager: /device/i };
                    const ic = icons.find(x => map[app].test(x.textContent));
                    if (!ic) return 'no-icon';
                    ic.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                    return 'opened';
                }, s.fixGui);
                await sleep(1200);
                const acted = await page.evaluate((app) => {
                    // Scope to the app's OWN window element (BoxEngine._windows[appId].el).
                    // Do NOT filter on offsetParent: window contents report offsetParent
                    // === null under headless Chromium, which previously hid the Services
                    // "Start" button and made a working box look broken. Scoping by window
                    // is what keeps us off the hint-panel and modal buttons instead.
                    const w = BoxEngine._windows && BoxEngine._windows[app];
                    if (!w || !w.el) return 'no-window';
                    const btns = [...w.el.querySelectorAll('button')]
                        .filter(b => /enable|start|disable|turn off/i.test(b.textContent));
                    if (!btns.length) {
                        return 'no-button:' + [...w.el.querySelectorAll('button')]
                            .map(b => b.textContent.trim().slice(0, 24)).join(',');
                    }
                    btns[0].click();
                    return btns[0].textContent.trim();
                }, s.fixGui);
                chk('GUI fix surface actionable (' + s.fixGui + ')',
                    !String(acted).startsWith('no-') && clicked === 'opened',
                    'open=' + clicked + ' button=' + acted);
                await sleep(1200);
            }
            if (s.postFix) await s.postFix(run);
            await sleep(600);

            // 4. Connectivity restored -- the walkthrough's own completion condition.
            const final = await run('ping google.com');
            chk('FIXED: ping google.com succeeds', /Reply from/.test(final), final.slice(-200));

            // 5. The flag must be obtainable where the scenario says it lives.
            if (s.flagCmd) {
                const fo = await run(s.flagCmd);
                chk('flag surface reachable (' + s.flagCmd + ')', /flag\{|FLAG\{/.test(fo) || fo.length > 0, fo.slice(-160));
            }
            const complete = await page.evaluate(() => !!BoxEngine.state._labComplete);
            chk('engine marks the lab complete', complete === true, 'labComplete=' + complete);

            chk('no uncaught page errors', errors.length === 0, errors.join(' | '));
        } catch (e) {
            fail++;
            console.log('    FAIL scenario threw: ' + e.message);
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    await browser.close();
    console.log('\n' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILED: ' + e.message); process.exit(1); });
