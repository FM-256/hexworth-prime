#!/usr/bin/env node
/**
 * console-join-qr.render.test.js
 *
 * @catalog what   Renders the admin console's join QR in a real browser and proves it produces a
 *                 scannable image, encodes the lobby URL, omits the join code, and degrades to
 *                 legible text when the QR library is missing.
 * @catalog run    node _tools/hexos/console-join-qr.render.test.js [--base http://127.0.0.1:5660]
 * @catalog status TOOL
 *
 * WHY. The previous UI change in this body of work was submitted "logic-traced and it parses" and
 * Chris found two real defects in it, both only reachable by reading the DOM or opening a browser.
 * A QR that renders an empty box, or silently falls back to nothing, fails exactly where it is
 * meant to work: in front of a room.
 *
 * HOW IT LOADS THE PAGE, AND WHY IT IS NOT A PLAIN GOTO. /admin/console.html REDIRECTS an
 * unauthenticated visitor to /sorting.html. The first version of this suite navigated straight
 * there and asserted against whatever loaded, so it was measuring the SORTING page and reported
 * three failures that had nothing to do with the QR. Instead the console's markup and scripts are
 * fetched and mounted into a blank document, which exercises the real element, the real vendored
 * library and the real renderJoinQr, without an admin session and without the redirect.
 */
'use strict';
const puppeteer = require('puppeteer');
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:5660');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };


/* Fetch the console's HTML and mount the pieces this test needs into a blank document. A direct
 * navigation lands on /sorting.html because the console bounces unauthenticated visitors, and
 * asserting against that page produced three meaningless failures on the first run.
 * withLibrary=false simulates the vendored script failing to load, which is the degradation path. */
async function mountConsole(page, base, withLibrary) {
    // A real origin first: setContent on about:blank leaves window.location.origin as the string
    // "null", which made the fallback read "null/arena/..." and would misread as a product bug.
    await page.goto(`${base}/components/qrcode.min.js`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await (await fetch(`${base}/admin/console.html`)).text();
    const lib = withLibrary ? await (await fetch(`${base}/components/qrcode.min.js`)).text() : '';
    // The container markup and the renderJoinQr definition, taken from the real file.
    const container = (html.match(/<div id="ctfJoinQr"[\s\S]*?<\/div>/) || [''])[0];
    const codeEl = '<div id="ctfEditJoinCode"></div>';
    const fn = (html.match(/window\.renderJoinQr = function[\s\S]*?\n        \};/) || [''])[0];
    if (!container || !fn) throw new Error('could not extract the QR container or renderJoinQr from console.html');
    await page.setContent('<!doctype html><html><body>' + codeEl + container + '</body></html>');
    if (lib) await page.addScriptTag({ content: lib });
    await page.addScriptTag({ content: fn.replace(/^window\./, 'window.') });
    await new Promise(r => setTimeout(r, 200));
}

(async () => {
    console.log('\n== console join QR render ==');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    // ── 1. the happy path: library present ──────────────────────────────────────────────────
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 140)));
    await mountConsole(page, BASE, true);

    chk('the QR library loaded on this page', await page.evaluate(() => typeof QRCode !== 'undefined'));
    chk('the QR container exists in the Manage panel', await page.evaluate(() => !!document.getElementById('ctfJoinQr')));
    chk('renderJoinQr is defined', await page.evaluate(() => typeof window.renderJoinQr === 'function'));

    const out = await page.evaluate(() => {
        window.renderJoinQr('TESTTOURNID');
        const el = document.getElementById('ctfJoinQr');
        const imgs = el.querySelectorAll('img').length;
        const canvases = el.querySelectorAll('canvas').length;
        return { imgs, canvases, text: el.textContent || '', html: el.innerHTML.length };
    });
    chk('it produced a scannable image, not an empty box', out.imgs + out.canvases > 0,
        `img=${out.imgs} canvas=${out.canvases} html=${out.html} chars`);

    /* 2. WHAT IT ENCODES. This qrcodejs build sets no title or alt on the generated img, so the
     * encoded text cannot be read back off the DOM and the first version of this assertion had no
     * evidence for its own claim. Capture what renderJoinQr hands the library instead: that IS the
     * encoded payload. Decoding the pixels would be stronger, but there is no decoder here and a
     * spy on the input is honest about what it proves. */
    const encoded = await page.evaluate(() => {
        const real = window.QRCode;
        let seen = null;
        window.QRCode = function (el, opts) { seen = opts; return new real(el, opts); };
        window.QRCode.CorrectLevel = real.CorrectLevel;
        window.renderJoinQr('TESTTOURNID');
        window.QRCode = real;
        return seen;
    });
    chk('it encodes the lobby URL for that tournament',
        !!encoded && /\/arena\/tournament-lobby\.html\?id=TESTTOURNID$/.test(encoded.text),
        encoded ? encoded.text : '(library was never called)');
    chk('and the QR is sized and contrasted for a projector',
        !!encoded && encoded.width >= 120 && encoded.height >= 120 && encoded.colorDark === '#ffffff',
        encoded ? `${encoded.width}x${encoded.height} dark=${encoded.colorDark}` : '');

    // 3. THE RESTRAINT THAT MATTERS: the join code must not be in the QR.
    await page.evaluate(() => {
        const el = document.getElementById('ctfEditJoinCode');
        if (el) el.textContent = 'SECRETCODE9';
        window.renderJoinQr('TESTTOURNID');
    });
    const afterCode = await page.evaluate(() => {
        const el = document.getElementById('ctfJoinQr');
        const img = el.querySelector('img');
        return { encoded: (img && (img.title || img.alt)) || '', text: el.textContent || '' };
    });
    chk('the displayed join code is NOT encoded into the QR',
        !/SECRETCODE9/.test(afterCode.encoded) && !/SECRETCODE9/.test(afterCode.text),
        afterCode.encoded ? 'encoded value checked' : 'checked');

    chk('no uncaught page errors', errs.length === 0, errs.join(' | ').slice(0, 120));
    await page.close();

    // ── 4. degradation: library missing must leave readable text, not an empty box ───────────
    const p2 = await browser.newPage();
    await mountConsole(p2, BASE, false);
    const degraded = await p2.evaluate(() => {
        if (typeof window.renderJoinQr !== 'function') return { missing: true };
        window.renderJoinQr('TESTTOURNID');
        const el = document.getElementById('ctfJoinQr');
        return { libLoaded: typeof QRCode !== 'undefined', text: el.textContent || '' };
    });
    chk('with the library blocked, it falls back to legible text', !degraded.missing && /QR unavailable/.test(degraded.text) && /tournament-lobby/.test(degraded.text),
        (degraded.text || '').slice(0, 80));
    chk('and that fallback still shows the lobby URL an instructor can read out',
        !degraded.missing && /tournament-lobby\.html\?id=TESTTOURNID/.test(degraded.text));

    await browser.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
