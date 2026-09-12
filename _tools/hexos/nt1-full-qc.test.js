#!/usr/bin/env node
/**
 * nt1-full-qc.test.js
 *
 * @catalog what   Full QC sweep of the NT1 box in a real browser: every command the
 *                 instructor walkthrough advertises actually works, every scenario's
 *                 documented diagnostic produces the documented result, hint labels are
 *                 numeric, flags are unique per scenario, reset works, and the page throws
 *                 nothing. Runs against BOTH copies.
 * @catalog run    node _tools/hexos/nt1-full-qc.test.js [--copy dispatch|arena] [--base URL]
 * @catalog status TOOL
 *
 * WHY. The scenario harnesses prove a student can FINISH. QC is a wider question: does the
 * box tell the truth everywhere a student might look. A command the walkthrough lists but
 * the sim rejects, a hint priced "true pts", or two scenarios sharing a flag are all
 * defects a completability test walks straight past.
 *
 * Defaults to production, because that is what students load.
 */
'use strict';

const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const COPY = arg('--copy', 'dispatch');
const BASE = arg('--base', 'https://hexworth.com');
const URL = `${BASE}/${COPY}/boxes/nt1-network-troubleshoot/`;

let pass = 0, fail = 0, warn = 0;
/** Record a hard assertion. Failures print the observed value so the line says why. */
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + label); }
    else { fail++; console.log('    FAIL ' + label + (detail ? '\n           ' + String(detail).replace(/\s+/g, ' ').slice(0, 190) : '')); }
};
/** Record a non-blocking observation worth a human's eye. */
const note = (label, detail) => { warn++; console.log('    warn ' + label + (detail ? ' — ' + String(detail).replace(/\s+/g, ' ').slice(0, 150) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Every command the walkthrough's "Additional Commands Available" table promises, plus the
// shell commands. A listed command that answers "not recognized" is a documentation lie.
const ADVERTISED = [
    'ipconfig /all', 'ping 127.0.0.1', 'tracert 8.8.8.8', 'nslookup google.com',
    'netstat -a', 'arp -a', 'route print', 'systeminfo', 'getmac', 'hostname',
    'netsh interface ip show config', 'dir', 'cd Documents', 'type network-baseline.txt',
    'find "gateway" network-baseline.txt', 'cls'
];

// Linux commands the box deliberately refuses; each must say so in Windows wording.
const REFUSED = ['ls', 'cat', 'pwd', 'grep', 'sudo', 'rm', 'ifconfig', 'uname', 'man'];

const SCENARIOS = [
    { idx: 0, ticket: 'HD-7200', id: 'dns_poisoned',     broken: { cmd: 'ipconfig /all', want: /8\.8\.8\.8/ } },
    { idx: 1, ticket: 'HD-7201', id: 'disabled_adapter', broken: { cmd: 'ipconfig /all', want: /Media disconnected/ } },
    { idx: 2, ticket: 'HD-7202', id: 'firewall_block',   broken: { cmd: 'ping 8.8.8.8', want: /timed out|unreachable/ } },
    { idx: 3, ticket: 'HD-7203', id: 'wrong_subnet',     broken: { cmd: 'ipconfig /all', want: /192\.168\.2\./ } },
    { idx: 4, ticket: 'HD-7204', id: 'dhcp_stopped',     broken: { cmd: 'ipconfig /all', want: /169\.254\./ } }
];

(async () => {
    console.log('=== NT1 FULL QC ===');
    console.log('url:', URL, '\n');

    const browser = await puppeteer.launch({
        headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const flagsSeen = {};

    for (const s of SCENARIOS) {
        console.log(`\n--- ${s.ticket}  ${s.id} ---`);
        const ctx = typeof browser.createBrowserContext === 'function'
            ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e.message)));

        try {
            await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
            // A student is signed in; flag delivery requires it (see task 377).
            await page.evaluate(async () => { try { await FirebaseAuth.signInAnonymously(); } catch (e) {} });
            await sleep(2500);
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(1200);

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
                const b = [...document.querySelectorAll('.nt1-scenario-btn')].find(x => x.dataset.idx === String(idx));
                if (b) b.click();
            }, s.idx);
            await sleep(2000);
            await page.evaluate(() => {
                const i = [...document.querySelectorAll('.desktop-icon')].find(x => /command/i.test(x.textContent));
                if (i) i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            });
            await sleep(1000);

            /** Run through the real Terminal.js dispatcher; return only the new output. */
            const run = (c) => page.evaluate(async (cmd) => {
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const before = t.outputEl.innerText.length;
                await t._execute(cmd);
                return t.outputEl.innerText.slice(before);
            }, c);

            // 1. The documented broken symptom is really present.
            const sym = await run(s.broken.cmd);
            chk(`broken symptom present (${s.broken.cmd})`, s.broken.want.test(sym), sym.slice(-150));

            // 2. Every advertised command answers. A "not recognized" here is a doc lie.
            const broken = [];
            for (const c of ADVERTISED) {
                const out = await run(c);
                if (/is not recognized as an internal/.test(out)) broken.push(c);
                if (/command not found/.test(out)) broken.push(c + ' (bash error!)');
            }
            chk(`all ${ADVERTISED.length} advertised commands answer`, broken.length === 0,
                'rejected: ' + broken.join(', '));

            // 3. Linux commands are refused in WINDOWS wording, not bash wording.
            const wrongWord = [];
            for (const c of REFUSED) {
                const out = await run(c);
                if (/command not found/.test(out)) wrongWord.push(c);
                else if (!/is not recognized as an internal/.test(out)) wrongWord.push(c + ' (not refused)');
            }
            chk(`all ${REFUSED.length} Linux commands refused in Windows wording`, wrongWord.length === 0,
                wrongWord.join(', '));

            // 4. Hint labels must be numeric. "true pts" is the hintPenalty:true defect.
            const hints = await page.evaluate(() => {
                const btn = document.getElementById('taskbarHintBtn')
                    || [...document.querySelectorAll('button')].find(b => /hint/i.test(b.textContent));
                if (btn) btn.click();
                return [...document.querySelectorAll('button')]
                    .map(b => b.textContent.trim()).filter(t => /Reveal Hint/i.test(t));
            });
            const badLabel = hints.filter(h => !/\(-?\d+ pts\)/.test(h));
            chk(`hint labels are all numeric (${hints.length} hints)`,
                hints.length > 0 && badLabel.length === 0, 'bad: ' + badLabel.join(', '));

            // 5. Nothing may throw.
            chk('no uncaught page errors', errors.length === 0, errors.slice(0, 1).join(' | '));

            // 6. Record the flag so cross-scenario uniqueness can be checked at the end.
            // ACTIVELY request it. Reading getDeliveredFlag alone returns null until
            // something triggers delivery, so the first version of this check collected
            // nothing and then "passed" uniqueness over an empty set — a vacuous green.
            // Request by SCENARIO id, not config.flags[0].id. NT1 declares a single flag
            // entry ({ id: 'fixed', value: null }) as a placeholder, but delivery is keyed
            // per scenario — the box itself calls requestFlagText(scenario.id). Asking for
            // 'fixed' returns null for every scenario, which is what made this collect
            // nothing while looking like a delivery failure in the box.
            const fv = await page.evaluate(async (sid) => {
                try { return await BoxEngine.requestFlagText(sid); } catch (e) { return null; }
            }, s.id);
            if (fv) flagsSeen[s.id] = fv;
            else note('flag not delivered for ' + s.id, 'uniqueness cannot be checked for this scenario');

        } catch (e) {
            fail++;
            console.log('    FAIL scenario threw: ' + e.message);
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    // 7. Two scenarios sharing a flag would let one answer complete another ticket.
    console.log('\n--- cross-scenario ---');
    const vals = Object.values(flagsSeen);
    // Require a full set FIRST. An empty or partial set makes the uniqueness test vacuous:
    // 0 values are trivially "all unique", which is a green that means nothing.
    chk(`a flag was collected for every scenario (${vals.length}/${SCENARIOS.length})`,
        vals.length === SCENARIOS.length,
        'missing: ' + SCENARIOS.map(s => s.id).filter(id => !flagsSeen[id]).join(', '));
    chk(`flags are unique across scenarios (${vals.length} collected)`,
        vals.length > 0 && vals.length === new Set(vals).size,
        JSON.stringify(Object.keys(flagsSeen)));

    await browser.close();
    console.log(`\n${pass} passed, ${fail} failed, ${warn} warnings`);
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('QC HARNESS FAILED: ' + e.message); process.exit(1); });
