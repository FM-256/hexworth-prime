#!/usr/bin/env node
/**
 * flag-slot-fill-latency.probe.js
 *
 * @catalog what   Plays one dispatch scenario twice and measures WHEN the token slot fills,
 *                 capturing the page console, so a cold Cloud Function start can be told
 *                 apart from a delivery that actually resolved null.
 * @catalog run    node _tools/hexos/flag-slot-fill-latency.probe.js [--base URL] [--idx N]
 * @catalog status PROBE
 *
 * WHY IT EXISTS.
 * os003-completability reported `a real token is RENDERED  got: null` for scenario 1 on
 * hexworth.com 2026-09-17 while scenarios 2-5 passed. Production logs for deliverFlag show
 * that call WAS served with auth VALID, behind a ~2.2s container cold start
 * (21:03:26 "Starting new instance" -> 21:03:29 request verified). The suite reads the slot
 * after a FIXED sleep(1600), so the two candidate explanations were indistinguishable from
 * its output:
 *
 *   (a) the promise resolved LATE with a real token  -> the box is fine, the test sampled early
 *   (b) the promise resolved NULL                    -> os003 writes "Token: N/A" and it STICKS,
 *                                                       because requestFlagText never retries
 *                                                       (BoxEngine.js:1487 and :1502 both
 *                                                       return null with no retry)
 *
 * (a) and (b) look identical at t=1600ms and mean opposite things, so this measures instead of
 * arguing: it polls the slot to 30s, prints the fill time, and prints any [ARENA] console
 * warning — 'Cannot deliver flag' names the auth branch, 'Flag delivery failed' names the
 * callable branch, and SILENCE with a filled slot means neither fired.
 *
 * PASS 1 may pay the cold start. PASS 2 runs immediately after against the now-warm instance.
 * Two passes, because one observation cannot separate "slow once" from "slow always".
 */
'use strict';
const puppeteer = require('puppeteer');
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'https://hexworth.com');
const IDX = parseInt(arg('--idx', '0'), 10);
const SUITE_SEQ = process.argv.includes('--suite-seq');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function playOnce(browser, label) {
    const ctx = await browser.createBrowserContext();
    const p = await ctx.newPage();
    const arena = [];
    p.on('console', m => { const t = m.text(); if (/\[ARENA\]/.test(t)) arena.push(m.type() + ': ' + t.slice(0, 160)); });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    p.on('dialog', async d => { try { await d.dismiss(); } catch (e) {} });

    await p.goto(`${BASE}/dispatch/boxes/os003-app-crash/`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1000);
    await p.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).find(e => /start|begin|launch|enter/i.test(e.textContent)); if (x) x.click(); });
    for (let i = 0; i < 30; i++) { if (await p.evaluate(() => !!(typeof BoxEngine !== 'undefined' && BoxEngine.state && BoxEngine.state.booted))) break; await sleep(500); }
    await p.keyboard.press('Shift'); await sleep(350);   // trusted event arms the engagement gate
    await p.evaluate(() => { const bt = [...document.querySelectorAll('#survey-overlay button')].find(x => /skip/i.test(x.textContent)); if (bt) bt.click(); });
    await sleep(500);
    await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'ticket'); BoxEngine._launchApp(t); });
    await p.waitForSelector('[data-idx]', { timeout: 9000 });
    await p.evaluate(i => document.querySelectorAll('[data-idx]')[i].click(), IDX);
    await sleep(900);
    await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'hw_panel'); BoxEngine._launchApp(t); });
    await sleep(700);

    const engaged = await p.evaluate(() => !!BoxEngine._userEngaged);
    const signedIn = await p.evaluate(() => (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn) ? !!FirebaseAuth.isSignedIn() : 'n/a');

    // Click Apply Fix and start the clock on the same tick.
    const t0 = Date.now();
    const clicked = await p.evaluate(() => { const f = document.querySelector('.os3-panel-fix'); if (!f) return false; f.click(); return true; });

    /* --suite-seq replays what os003-completability does BETWEEN the fix click and the read:
     * it relaunches the terminal to re-check the DLL. That matters because the suite's token
     * assertion greps document.body.innerText, which EXCLUDES text that is not rendered — so
     * a panel hidden behind the terminal window would hide a token that is present in the DOM. */
    if (SUITE_SEQ) {
        await sleep(900);
        await p.evaluate(() => { const t = BoxEngine.config.desktop.icons.find(i => i.app === 'terminal'); BoxEngine._launchApp(t); });
        await sleep(800);
        await p.evaluate(async () => { const t = ArenaTerminal._instances[ArenaTerminal._instances.length - 1]; await t._execute('dir C:\\Windows\\System32\\vcruntime140.dll'); });
    }

    let filledAt = null, sawLoading = false, sawNA = false, slot = null, tok = null, tokText = null;
    for (let i = 0; i < 60 && filledAt === null; i++) {          // poll to 30s
        await sleep(500);
        slot = await p.evaluate(() => { const el = document.querySelector('.os3-flag-slot'); return el ? el.textContent.trim() : null; });
        if (slot && /loading/i.test(slot)) sawLoading = true;
        if (slot && /N\/A/i.test(slot)) { sawNA = true; filledAt = Date.now() - t0; }
        tok = await p.evaluate(() => { const m = document.body.innerText.match(/flag\{[^}]{3,60}\}/i); return m ? m[0] : null; });
        tokText = await p.evaluate(() => { const m = document.body.textContent.match(/flag\{[^}]{3,60}\}/i); return m ? m[0] : null; });
        if (tok || tokText) filledAt = Date.now() - t0;
    }

    console.log(`\n── ${label} (scenario idx ${IDX}) ──`);
    console.log(`  engaged=${engaged}  signedIn=${signedIn}  applyFixClicked=${clicked}`);
    console.log(`  saw "loading..." : ${sawLoading}`);
    console.log(`  slot final       : ${slot}`);
    console.log(`  token (innerText): ${tok || 'NONE'}   <- what the suite asserts on`);
    console.log(`  token (textContent): ${tokText || 'NONE'} <- present in the DOM at all?`);
    console.log(`  wrote N/A        : ${sawNA}`);
    console.log(`  fill latency     : ${filledAt === null ? 'NEVER within 30s' : filledAt + 'ms'}`);
    console.log(`  would the suite's sleep(1600) have seen it? ${filledAt !== null && filledAt <= 1600 ? 'YES' : 'NO'}`);
    console.log(`  [ARENA] console  : ${arena.length ? arena.join(' | ') : '(silent — neither null branch warned)'}`);
    if (errs.length) console.log(`  page errors      : ${errs.join(' | ')}`);

    await ctx.close();
    return { filledAt, sawNA, tok, arena };
}

(async () => {
    console.log(`flag-slot-fill-latency  base=${BASE}  suiteSeq=${SUITE_SEQ}`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const a = await playOnce(browser, 'PASS 1 (may be cold)');
    const b = await playOnce(browser, 'PASS 2 (instance now warm)');
    await browser.close();

    console.log('\n── VERDICT ──');
    if (a.sawNA || b.sawNA) {
        console.log('  N/A WAS WRITTEN — a delivery resolved null. This is student-facing: os003');
        console.log('  config.js:1033 writes it and nothing re-renders, so it sticks. Task 398 is real.');
    } else if (a.tok && b.tok) {
        console.log('  BOTH passes delivered a real token; no N/A was ever written.');
        console.log(`  Latency: pass1 ${a.filledAt}ms, pass2 ${b.filledAt}ms.`);
        console.log('  If pass1 > 1600 and pass2 <= 1600, the suite\'s fixed sleep is the defect,');
        console.log('  not the box — the student sees "loading..." and then the token.');
    } else {
        console.log('  A pass never filled the slot within 30s and never wrote N/A — neither');
        console.log('  explanation holds; read the [ARENA] console lines above before concluding.');
    }
    process.exit(0);
})();
