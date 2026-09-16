#!/usr/bin/env node
/**
 * unknown-command-dialect.test.js
 *
 * @catalog what   Types a command NO box implements into EVERY box that declares a
 *                 promptStyle, and asserts the engine answers in that box's own dialect.
 *                 Covers the one thing box-shell-consistency does not: the unknown-command
 *                 path, and cisco boxes at all.
 * @catalog run    node _tools/hexos/unknown-command-dialect.test.js [--base URL] [--limit N]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * Terminal.js._unknownCommandText is shared by every box on the platform. When it was
 * changed from bash's `<cmd>: command not found` to a promptStyle-aware message, the only
 * fleet-wide evidence offered was box-shell-consistency's 171/0 being unchanged — but that
 * gate's dialect assertion is `cls does not print "command not found"`, it runs only
 * `if (isWin)`, and it never types an unknown command at all. Nancy's words: 171/0 unchanged
 * "is consistent with nothing broke but is not proof of it for the actual thing that
 * changed." She was right, so this measures the actual thing that changed.
 *
 * A box with no reachable terminal is reported NOSIGNAL, never as a pass — an absent
 * measurement is not a clean one.
 */
'use strict';
const fs = require('fs'), path = require('path'), puppeteer = require('puppeteer');
const argv = process.argv.slice(2);
const bi = argv.indexOf('--base');
const BASE = bi > -1 ? argv[bi + 1] : 'http://127.0.0.1:5599';
const li = argv.indexOf('--limit');
const LIMIT = li > -1 ? parseInt(argv[li + 1], 10) : 0;
const ROOT = path.resolve(__dirname, '../..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const NONSENSE = 'zqxwvu';

/* What each dialect must say. Derived from Terminal.js so this cannot drift from the engine
 * it is testing: if someone edits the strings, this reads the new ones. */
/* --engine lets the EXPECTATIONS come from a different Terminal.js than the one the browser
 * is loading. Without it the probe reads its answer key from the very file under test, so it
 * cannot be used as its own negative control: revert the engine and the key reverts with it.
 * Pin the key to the new engine, serve the old one, and the probe must go red — which is the
 * only way to know it would catch a regression. */
const ei = argv.indexOf('--engine');
const ENGINE = ei > -1 ? path.resolve(argv[ei + 1]) : path.join(ROOT, '_app/arena/engine/Terminal.js');

function expectations() {
    const src = fs.readFileSync(ENGINE, 'utf8');
    const m = src.match(/_unknownCommandText\(cmd\)\s*\{[\s\S]*?\n {4}\}/);
    if (!m) throw new Error('CANARY: _unknownCommandText not found in Terminal.js — this test cannot judge anything');
    const body = m[0];
    const grab = (style) => {
        const re = new RegExp("case '" + style + "':\\s*\\n\\s*return ([`'])([\\s\\S]*?)\\1", 'm');
        const g = body.match(re);
        return g ? g[2] : null;
    };
    const out = { windows: grab('windows'), powershell: grab('powershell'), cisco: grab('cisco') };
    for (const k of Object.keys(out)) {
        if (!out[k]) throw new Error(`CANARY: no ${k} branch found in _unknownCommandText`);
        // Turn the template into a plain probe string for the nonsense command.
        out[k] = out[k].replace(/\$\{cmd\}/g, NONSENSE).replace(/\\n/g, '\n');
    }
    out.linux = `${NONSENSE}: command not found`;
    return out;
}

function boxes() {
    const dir = path.join(ROOT, '_app/dispatch/boxes');
    const out = [];
    for (const name of fs.readdirSync(dir).sort()) {
        const f = path.join(dir, name, 'config.js');
        if (!fs.existsSync(f)) continue;
        const src = fs.readFileSync(f, 'utf8');
        const m = src.match(/promptStyle\s*:\s*['"]([a-z]+)['"]/i);
        if (!m) continue;
        out.push({ name, style: m[1].toLowerCase() });
    }
    return LIMIT ? out.slice(0, LIMIT) : out;
}

(async () => {
    const EXPECT = expectations();
    console.log('=== unknown-command dialect ===');
    console.log(`probe: "${NONSENSE}"  base: ${BASE}\n`);
    const list = boxes();
    const byStyle = {};
    list.forEach(b => { byStyle[b.style] = (byStyle[b.style] || 0) + 1; });
    console.log(`${list.length} box(es) declare a promptStyle: ${JSON.stringify(byStyle)}\n`);

    let pass = 0, fail = 0, nosignal = 0;
    const failures = [], blind = [];
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const box of list) {
        const ctx = await b.createBrowserContext();
        const p = await ctx.newPage();
        p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });
        let got = null;
        try {
            await p.goto(`${BASE}/dispatch/boxes/${box.name}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await sleep(900);
            await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
            for (let i = 0; i < 24; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(400); }
            await p.keyboard.press('Shift'); await sleep(250);
            await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
            await sleep(350);
            await p.evaluate(() => { const t = (BoxEngine.config.desktop.icons || []).find(i => i.app === 'terminal'); if (t) BoxEngine._launchApp(t); });
            await sleep(900);
            got = await p.evaluate(async cmd => {
                if (typeof ArenaTerminal === 'undefined' || !ArenaTerminal._instances || !ArenaTerminal._instances.length) return null;
                const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
                const n = t.outputEl.innerText.length;
                await t._execute(cmd);
                return t.outputEl.innerText.slice(n);
            }, NONSENSE);
        } catch (e) { got = null; }
        await ctx.close();

        if (got === null) {
            nosignal++; blind.push(box.name);
            console.log(`    NOSIGNAL ${box.name} [${box.style}] — no reachable terminal, NOT judged`);
            continue;
        }
        const want = EXPECT[box.style] || EXPECT.linux;
        const first = want.split('\n')[0].trim();
        if (got.includes(first)) { pass++; }
        else {
            fail++; failures.push({ box: box.name, style: box.style, got: got.replace(/\s+/g, ' ').trim().slice(0, 150) });
            console.log(`    FAIL ${box.name} [${box.style}]\n         want: ${first}\n         got : ${got.replace(/\s+/g, ' ').trim().slice(0, 150)}`);
        }
    }
    await b.close();
    console.log(`\n${pass} answered in their own dialect, ${fail} did not, ${nosignal} unjudged (no terminal)`);
    if (blind.length) console.log(`unjudged: ${blind.join(', ')}`);
    process.exitCode = fail ? 1 : 0;
})();
