#!/usr/bin/env node
/**
 * flag-refusal-message.render.test.js
 *
 * @catalog what   Proves a DELIBERATE server refusal of deliverFlag shows the student the
 *                 server's own reason instead of "reload the page to retry", that a TRANSIENT
 *                 failure still shows the retry wording, and that requestFlagText's
 *                 never-reject contract is unchanged.
 * @catalog run    NODE_PATH=$(pwd)/functions/node_modules node _tools/hexos/flag-refusal-message.render.test.js
 * @catalog status TOOL
 *
 * WHY IT EXISTS. The deliverFlag tournament guard (functions/index.js ~774) refuses boxes that
 * back a live tournament challenge, with a student-facing message ending "Submit the flag you
 * worked out instead." Both callers swallowed every error identically, so that message reached
 * nobody and resolveFlagTokens rendered "[flag unavailable — reload the page to retry]" — which
 * for a deliberate refusal is a LIE: the reload refuses identically, forever. Two live
 * tournaments staff themselves from PUBLIC arena boxes (forensics-05-email,
 * c1-data-nexus-breach), so ordinary students meet this path.
 *
 * THE TRAP THIS SUITE IS BUILT AROUND. Asserting only "the retry wording is gone" passes for any
 * wrong message, including an empty string — a negative assertion matching the wrong wrong-answer.
 * So every case here asserts the EXACT expected text, and case 2 is a positive control proving
 * the retry wording SURVIVES for transient failures rather than being replaced unconditionally.
 * Case 1 additionally proves the state written in the catch is actually READ by the renderer;
 * Chris has blocked this codebase before for a guard that was set and never read.
 *
 * Each case gets a FRESH PAGE. Resetting fields between cases on one page is how a harness
 * carries state and reports a pass it did not earn.
 */
'use strict';
const path = require('path');
const puppeteer = require('puppeteer');

/* ENGINE_PATH exists so this suite can be pointed at the PRE-FIX engine to prove it is
 * sensitive to the change. A suite that has never been shown to fail is not evidence. */
const ENGINE = process.env.ENGINE_PATH || path.join(__dirname, '..', '..', '_app', 'arena', 'engine', 'BoxEngine.js');
const REFUSAL = 'This box is in use as a tournament challenge and does not disclose flag values. Submit the flag you worked out instead.';
const RETRY = 'flag unavailable — reload the page to retry';

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

/* One case = one page. `stub` decides how the callable behaves. */
async function runCase(browser, stub) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    await page.setContent('<div class="terminal-output">placeholder</div>');
    await page.addScriptTag({ path: ENGINE });
    const result = await page.evaluate(async (stubSrc) => {
        /* eslint-disable no-undef */
        window.FirebaseAuth = { isSignedIn: () => true, callFunction: eval(stubSrc) };
        BoxEngine.config = { registryId: 'test-box', flags: [] };
        BoxEngine.state = {};
        BoxEngine._deliveredFlags = {};
        BoxEngine.save = () => {};
        BoxEngine._userEngaged = true;

        const el = document.querySelector('.terminal-output');
        el.innerHTML = BoxEngine.resolveFlagTokens('Your flag: {{FLAG:user}}');

        let threw = null, resolved = 'NOT_CALLED';
        try { resolved = await BoxEngine.requestFlagText('user'); }
        catch (e) { threw = String(e && e.message); }

        await new Promise(r => setTimeout(r, 250));
        return {
            html: el.innerHTML,
            text: el.textContent,
            threw,
            resolvedIsNull: resolved === null,
            refusalRecorded: !!(BoxEngine._flagRefusals && BoxEngine._flagRefusals.user),
            liveImgCount: el.querySelectorAll('img').length,
        };
    }, stub);
    await page.close();
    return { ...result, pageErrors: errs };
}

const denyStub = msg => `(async () => { const e = new Error(${JSON.stringify(msg)}); e.code = 'functions/permission-denied'; throw e; })`;
const transientStub = `(async () => { const e = new Error('internal'); e.code = 'functions/unavailable'; throw e; })`;
const okStub = `(async () => ({ data: { flagText: 'flag{render_ok}' } }))`;

(async () => {
    console.log('\n== flag refusal message (render) ==');
    console.log('  self-contained: real BoxEngine.js, stubbed callable, no emulator, no project');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    // ── Case 1: deliberate refusal ────────────────────────────────────────────
    const deny = await runCase(browser, denyStub(REFUSAL));
    chk('refusal: the server reason is shown to the student', deny.text.includes('Submit the flag you worked out instead'), deny.text.slice(0, 120));
    chk('refusal: the retry LIE is gone', !deny.text.includes(RETRY));
    chk('refusal: the catch recorded a reason (state is written)', deny.refusalRecorded);
    chk('refusal: the renderer READ that state (not set-and-never-read)', deny.text.includes('Submit the flag you worked out instead') && deny.refusalRecorded);
    chk('refusal: contract intact — resolved null, did not throw', deny.resolvedIsNull && deny.threw === null, `threw=${deny.threw} null=${deny.resolvedIsNull}`);
    chk('refusal: no page errors', deny.pageErrors.length === 0, deny.pageErrors.join(' | '));

    // ── Case 2: POSITIVE CONTROL — transient failure keeps the retry wording ──
    const tr = await runCase(browser, transientStub);
    chk('transient: retry wording SURVIVES (not replaced unconditionally)', tr.text.includes(RETRY), tr.text.slice(0, 120));
    chk('transient: no refusal reason recorded', !tr.refusalRecorded);
    chk('transient: contract intact — resolved null, did not throw', tr.resolvedIsNull && tr.threw === null);

    // ── Case 3: happy path still works ───────────────────────────────────────
    const ok = await runCase(browser, okStub);
    chk('success: the flag still renders', ok.text.includes('flag{render_ok}'), ok.text.slice(0, 120));
    chk('success: neither failure message appears', !ok.text.includes(RETRY) && !ok.text.includes('Submit the flag'));

    // ── Case 4: the message is escaped, not injected ─────────────────────────
    const xss = await runCase(browser, denyStub('Refused <img src=x onerror="window.__pwned=1"> done'));
    chk('escaping: no live element created from the message', xss.liveImgCount === 0, `img count=${xss.liveImgCount}`);
    chk('escaping: the markup is shown as text', xss.text.includes('<img'), xss.text.slice(0, 120));

    await browser.close();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})();
