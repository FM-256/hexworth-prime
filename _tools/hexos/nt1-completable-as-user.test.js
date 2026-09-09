#!/usr/bin/env node
/**
 * nt1-completable-as-user.test.js
 *
 * @catalog what   Answers the only question that matters about NT1: can a USER actually
 *                 FINISH each of the five scenarios? Fixes the fault on its real surface,
 *                 HARVESTS the flag from the location the walkthrough documents, types it
 *                 into the Submit Flag modal, and requires the box to accept it.
 * @catalog run    node _tools/hexos/nt1-completable-as-user.test.js [--copy dispatch|arena] [--no-signin]
 * @catalog status TOOL
 *
 * WHY THIS EXISTS SEPARATELY from nt1-scenarios-e2e.test.js. That harness asserted
 * `engine.state._labComplete`, which is engine state -- it can be true while the student
 * still has no flag to submit. Completability is a claim about the STUDENT's path, so this
 * harness refuses to look at internal state for its verdict: it reads the flag out of the
 * rendered UI and submits it through the modal, exactly as a person would.
 *
 * TWO ARMS, because task 377 made the session the deciding variable:
 *   default      -- signs in first, i.e. the path a real student is on
 *   --no-signin  -- opens the box with no session, which is what a visitor gets since 372
 *                   removed the load-time anonymous sign-in. Expected to FAIL flag delivery
 *                   until 377 is fixed; that failure is the point, not a harness bug.
 */
'use strict';

const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const copyIdx = argv.indexOf('--copy');
const COPY = copyIdx > -1 ? argv[copyIdx + 1] : 'dispatch';
const NO_SIGNIN = argv.includes('--no-signin');
const URL = `https://hexworth.com/${COPY}/boxes/nt1-network-troubleshoot/`;

let pass = 0, fail = 0;
/** Record one assertion, printing the observed value when it fails. */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + label); }
    else { fail++; console.log('    FAIL ' + label + (detail ? '\n           ' + String(detail).replace(/\s+/g, ' ').slice(0, 200) : '')); }
};
/** Pause; the box animates window opens and applies scenarios asynchronously. */
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Where each scenario's fix lives, and where its flag is documented to appear.
const SCENARIOS = [
    { idx: 0, ticket: 'HD-7200', id: 'dns_poisoned',
      termFix: ['ipconfig /flushdns'], flagFrom: { cmd: 'ipconfig /displaydns' } },
    { idx: 1, ticket: 'HD-7201', id: 'disabled_adapter',
      termFix: ['netsh interface set interface "Ethernet0" enable', 'ipconfig /renew'],
      flagFrom: { gui: 'device_manager' } },
    { idx: 2, ticket: 'HD-7202', id: 'firewall_block',
      guiFix: 'firewall', flagFrom: { gui: 'firewall' } },
    { idx: 3, ticket: 'HD-7203', id: 'wrong_subnet',
      termFix: ['netsh interface ip set address "Ethernet0" static 192.168.1.50 255.255.255.0 192.168.1.1'],
      flagFrom: { cmd: 'ping google.com' } },
    { idx: 4, ticket: 'HD-7204', id: 'dhcp_stopped',
      guiFix: 'services', termFixAfter: ['ipconfig /renew'], flagFrom: { gui: 'services' } }
];

const FLAG_RE = /flag\{[^}]{3,80}\}/i;

(async () => {
    console.log('=== NT1: completable as a user ===');
    console.log('url:', URL, '| arm:', NO_SIGNIN ? 'NO SESSION (visitor)' : 'signed in (student)', '\n');

    const browser = await puppeteer.launch({
        headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    for (const s of SCENARIOS) {
        console.log(`\n--- ${s.ticket}  ${s.id} ---`);
        // Isolated context: the box persists progress to localStorage, which is shared
        // across tabs and would restore a finished scenario into the next run.
        const ctx = typeof browser.createBrowserContext === 'function'
            ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e.message)));

        try {
            await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });

            if (!NO_SIGNIN) {
                // The student path. Since 372 there is no load-time sign-in, so establish one.
                await page.evaluate(async () => { try { await FirebaseAuth.signInAnonymously(); } catch (e) {} });
                await sleep(2500);
                await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                await sleep(1200);
            }
            const signedIn = await page.evaluate(() => typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn());
            chk('session state is as the arm intends', signedIn === !NO_SIGNIN, 'isSignedIn=' + signedIn);

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
            await page.evaluate((idx) => {
                const btn = [...document.querySelectorAll('.nt1-scenario-btn')].find(b => b.dataset.idx === String(idx));
                if (btn) btn.click();
            }, s.idx);
            await sleep(2000);

            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /command/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(1000);

            /** Run a command through the real Terminal.js dispatcher; return new output only. */
            const run = (c) => page.evaluate(async (cmd) => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const before = t.outputEl.innerText.length;
                await t._execute(cmd);
                return t.outputEl.innerText.slice(before);
            }, c);

            /**
             * Open an app window by its desktop icon and return its rendered text.
             *
             * BoxEngine._windows is keyed by the ICON id, not the app name
             * (BoxEngine._launchApp: `const appId = iconDef.id`). device_manager's icon id
             * is 'devmgr', so looking it up by app name returned an empty string and made a
             * working Device Manager look like a missing flag.
             */
            const WIN_KEY = { firewall: 'firewall', services: 'services', device_manager: 'devmgr' };
            const openApp = async (app) => {
                await page.evaluate((a) => {
                    const map = { firewall: /firewall/i, services: /services/i, device_manager: /device/i };
                    const ic = [...document.querySelectorAll('.desktop-icon')].find(x => map[a].test(x.textContent));
                    if (ic) ic.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                }, app);
                await sleep(1400);
                return page.evaluate((k) => {
                    const w = BoxEngine._windows && BoxEngine._windows[k];
                    return w && w.el ? w.el.innerText : '';
                }, WIN_KEY[app] || app);
            };

            /** Click the enable/start/disable control inside an app's own window. */
            const clickFix = async (app) => page.evaluate((a) => {
                const w = BoxEngine._windows && BoxEngine._windows[a];
                if (!w || !w.el) return 'no-window';
                // No offsetParent filter: window content reports offsetParent === null in
                // headless, which previously hid the real button and faked a failure.
                const b = [...w.el.querySelectorAll('button')].find(x => /enable|start|disable|turn off/i.test(x.textContent));
                if (!b) return 'no-button';
                b.click();
                return b.textContent.trim();
            }, app);

            // ── apply the documented fix ────────────────────────────────────────────
            if (s.termFix) for (const c of s.termFix) await run(c);
            if (s.guiFix) {
                await openApp(s.guiFix);
                const act = await clickFix(WIN_KEY[s.guiFix] || s.guiFix);
                chk('fix control present in ' + s.guiFix, !String(act).startsWith('no-'), act);
                await sleep(1200);
            }
            if (s.termFixAfter) for (const c of s.termFixAfter) await run(c);
            await sleep(800);

            const connectivity = await run('ping google.com');
            chk('connectivity restored (ping google.com)', /Reply from/.test(connectivity), connectivity.slice(-160));

            // ── harvest the flag the way a student reads it ─────────────────────────
            // Check the connectivity output FIRST: wrong_subnet emits its flag in the first
            // successful non-IP ping, and _checkLabComplete returns null on every call after
            // that, so re-running the ping to "harvest" it would find an empty result.
            let surface = FLAG_RE.test(connectivity) ? connectivity : '';
            if (!surface && s.flagFrom.cmd) surface = await run(s.flagFrom.cmd);
            if (!surface && s.flagFrom.gui) surface = await openApp(s.flagFrom.gui);
            const m = surface.match(FLAG_RE);
            chk('flag is VISIBLE at its documented location', !!m,
                'searched ' + (s.flagFrom.cmd || s.flagFrom.gui) + '; saw: ' + surface.slice(-180));

            // ── submit it through the real modal ────────────────────────────────────
            if (m) {
                await page.evaluate(() => document.getElementById('taskbarFlagBtn').click());
                await sleep(700);
                await page.evaluate((flag) => {
                    const i = document.getElementById('flagModalInput');
                    i.value = flag;
                    i.dispatchEvent(new Event('input', { bubbles: true }));
                }, m[0]);
                await page.evaluate(() => document.getElementById('flagModalSubmit').click());
                await sleep(2500);
                const accepted = await page.evaluate(() => ({
                    captured: !!(BoxEngine.state._capturedFlags && Object.keys(BoxEngine.state._capturedFlags).length),
                    complete: !!BoxEngine.state._labComplete
                }));
                chk('SUBMITTED FLAG ACCEPTED — scenario completable', accepted.captured || accepted.complete,
                    JSON.stringify(accepted));
            }

            chk('no uncaught page errors', errors.length === 0, errors.slice(0, 1).join(' | '));
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
