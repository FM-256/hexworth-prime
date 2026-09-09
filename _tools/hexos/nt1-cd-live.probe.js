#!/usr/bin/env node
/**
 * nt1-cd-live.probe.js
 *
 * @catalog what   Drives the REAL NT1 page in Chromium -- double-clicks the Command Prompt
 *                 desktop icon, types into the actual Terminal.js input, and reads what the
 *                 terminal renders. Answers "does `cd Documents` work for a student", which
 *                 is a different question from "does the handler return the right value".
 * @catalog run    node _tools/hexos/nt1-cd-live.probe.js [--local] [--copy dispatch|arena]
 * @catalog status PROBE
 *
 * WHY. The unit harness (nt1-filesystem-commands.test.js) calls the command handlers with a
 * MOCK term object. That proves the handler logic and proves nothing about dispatch: whether
 * Terminal.js routes `cd` to the box override at all, whether the deployed config is the one
 * being served, or whether a cached bundle is in play. The operator reported `cd` still failing
 * after the unit harness was green, which is exactly the gap a mock cannot see.
 *
 * Defaults to PRODUCTION because that is what a student loads.
 */
'use strict';

const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const LOCAL = argv.includes('--local');
const copyIdx = argv.indexOf('--copy');
const COPY = copyIdx > -1 ? argv[copyIdx + 1] : 'dispatch';
const BASE = LOCAL ? 'http://127.0.0.1:5599' : 'https://hexworth.com';
const URL = `${BASE}/${COPY}/boxes/nt1-network-troubleshoot/`;

/** Record one assertion; prints why it failed, not merely that it did. */
let pass = 0, fail = 0;
const chk = (label, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + label); }
    else { fail++; console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); }
};

(async () => {
    console.log('=== NT1 live cd probe ===');
    console.log('url:', URL, '\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message)));

    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Is the served config the fixed one? Ask the page, not the repo.
    const served = await page.evaluate(() => ({
        hasTree: typeof NT1Config !== 'undefined' && !!NT1Config._fileTree,
        hasCd: typeof NT1Config !== 'undefined' && typeof (NT1Config.commands || {}).cd === 'function',
        hasCanon: typeof NT1Config !== 'undefined' && typeof NT1Config._canonDir === 'function'
    }));
    chk('served config.js carries _fileTree', served.hasTree, 'the page is running an OLD config -- cache or wrong copy');
    chk('served config.js defines commands.cd', served.hasCd);
    chk('served config.js defines _canonDir (the case fix)', served.hasCanon);

    // The briefing screen sits in front of the desktop; start the box.
    await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')]
            .find(b => /start|begin|launch|enter/i.test(b.textContent));
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Double-click the Command Prompt icon exactly as a student would.
    const opened = await page.evaluate(() => {
        const icons = [...document.querySelectorAll('.desktop-icon')];
        const cmd = icons.find(i => /command/i.test(i.textContent));
        if (!cmd) return { ok: false, icons: icons.map(i => i.textContent.trim()) };
        cmd.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        return { ok: true };
    });
    chk('Command Prompt icon opens', opened.ok, 'icons present: ' + JSON.stringify(opened.icons));
    await new Promise(r => setTimeout(r, 1500));

    const hasInput = await page.$('input[aria-label="Terminal command input"]');
    chk('terminal input is present', !!hasInput);

    /**
     * Run a command through the REAL Terminal.js dispatcher and return what it rendered.
     *
     * Deliberately calls _execute() rather than typing into the input. The input is
     * offsetParent === null under headless Chromium, so page.type() silently enters
     * NOTHING and every assertion downstream reads an empty terminal -- a probe that
     * measures nothing while looking like a result. _execute() is the same entry point
     * the Enter keyhandler calls (Terminal.js:98-105), so command routing, the box-vs-
     * builtin precedence and output rendering are all still under test; only the
     * keystroke plumbing is bypassed.
     */
    async function run(cmdText) {
        return page.evaluate(async (c) => {
            const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
            const before = t.outputEl.innerText.length;
            await t._execute(c);
            return t.outputEl.innerText.slice(before);
        }, cmdText);
    }

    if (hasInput) {
        const afterDir = await run('dir');
        chk('`dir` lists Documents', /Documents/.test(afterDir), afterDir.slice(-300));

        const afterCd = await run('cd Documents');
        chk('`cd Documents` does NOT print a bash error',
            !/No such file or directory/.test(afterCd),
            afterCd.slice(-300));
        chk('`cd Documents` does NOT print the Windows not-found error',
            !/cannot find the path specified/.test(afterCd),
            afterCd.slice(-300));

        const prompt = await page.evaluate(() => {
            const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1];
            return t.cwd;
        });
        chk('cwd moved into Documents', /Documents$/.test(prompt), 'terminal cwd reads: ' + JSON.stringify(prompt));

        const afterType = await run('type network-baseline.txt');
        chk('`type network-baseline.txt` reveals the gateway', /192\.168\.1\.1/.test(afterType),
            afterType.slice(-300));

        const afterLower = await run('cd ..');
        const afterLower2 = await run('cd documents');
        chk('`cd documents` (lowercase) works', !/cannot find the path specified/.test(afterLower2),
            afterLower2.slice(-300));
    }

    chk('no uncaught page errors', errors.length === 0, errors.join(' | '));

    await browser.close();
    console.log('\n' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('PROBE FAILED: ' + e.message); process.exit(1); });
