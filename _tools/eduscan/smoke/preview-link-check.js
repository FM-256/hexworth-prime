#!/usr/bin/env node
'use strict';
// COLD-OPEN CHECK: does this link actually work for the person I am about to send it to?
//
// Run this before pasting ANY preview URL to the operator.
//
// WHY IT EXISTS. Firebase preview channels are a DIFFERENT ORIGIN from hexworth.com, so a
// visitor's localStorage -- including `hexworth_house` -- does not travel with them.
// `AccessGuard.require('sorted')` bounces a cold visitor to the sorting prompt, which offers
// exactly one way out: the sorting quiz. The link is unusable.
//
// I sent preview links all session and every one of them may have done this. The reason I never
// noticed is the uncomfortable part: EVERY probe I wrote begins with
//     await page.evaluateOnNewDocument(() => localStorage.setItem('hexworth_house', 'cloud'));
// so every probe verified the page with a browser that had already been handed the key. The
// operator's browser had not. "It works for me" was true and useless.
//
// This opens the URL with NO storage, NO cookies, NO referrer -- the way a pasted link is
// actually opened -- and reports where a first-time visitor lands.
//
// usage: node _tools/eduscan/smoke/preview-link-check.js <url> [<url> ...]
const puppeteer = require('puppeteer');

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error('usage: node _tools/eduscan/smoke/preview-link-check.js <url> [<url> ...]');
  process.exit(2);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let bad = 0;
  try {
    for (const url of urls) {
      // A brand-new context per URL: no shared storage between runs either.
      const ctx = browser.createBrowserContext
        ? await browser.createBrowserContext()
        : browser.defaultBrowserContext();
      const page = ctx.newPage ? await ctx.newPage() : await browser.newPage();
      await page.setCacheEnabled(false);
      await page.setViewport({ width: 1440, height: 900 });

      let landed = '(navigation failed)', title = '', gate = false, visible = '';

      /* LANDING ON THE RIGHT PATH IS NOT THE SAME AS THE PAGE WORKING. This box shipped a
         terminal that returned HTTP 200 with a banner and a blinking cursor while the class
         behind it was dead in TDZ, and it shipped an arena that served 200 with every one of
         its 149 boxes empty because one apostrophe was unescaped. Both would have passed the
         landing check above. An uncaught error or a 404 on a module the page imports is the
         cheapest available signal that the page is broken, so collect both. */
      const pageErrors = [], deadReqs = [];
      page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 160)));
      page.on('requestfailed', (r) => deadReqs.push(`${r.url().slice(-60)} (${r.failure() && r.failure().errorText})`));
      page.on('response', (r) => { if (r.status() >= 400) deadReqs.push(`${r.url().slice(-60)} (HTTP ${r.status()})`); });

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
        await new Promise((r) => setTimeout(r, 3500));   // let any client-side redirect fire
        const st = await page.evaluate(() => ({
          href: location.href,
          title: document.title,
          text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 90),
        }));
        landed = st.href; title = st.title; visible = st.text;
        gate = /tourist-visa-prompt|sorting\.html|login\.html/.test(st.href);
      } catch (e) { visible = e.message; }

      const target = new URL(url).pathname;
      const actual = landed.startsWith('http') ? new URL(landed).pathname : landed;
      // A page that throws on load is not usable, however correct its URL.
      const ok = actual === target && pageErrors.length === 0;

      console.log(`\n  ${url}`);
      console.log(`    lands on : ${actual}`);
      console.log(`    title    : ${title}`);
      console.log(`    errors   : ${pageErrors.length ? pageErrors.join(' | ') : 'none'}`);
      if (deadReqs.length) console.log(`    dead reqs: ${[...new Set(deadReqs)].join(' | ')}`);
      if (actual === target && pageErrors.length) {
        console.log('    FAIL  the page LOADS and then THROWS. Correct URL, broken page.');
        bad++;
      } else if (!ok) {
        console.log(`    visible  : ${visible}`);
        console.log(gate
          ? '    FAIL  a cold visitor is GATED here -- this link does not work for anyone but me.'
          : '    FAIL  a cold visitor does not reach the intended page.');
        bad++;
      } else {
        console.log('    PASS  a cold visitor reaches the intended page.');
      }
      await page.close();
    }
  } finally { await browser.close().catch(() => {}); }

  if (bad) {
    console.log(`\n  ${bad} of ${urls.length} link(s) UNUSABLE cold.`);
    console.log('  On a preview channel, send the operator the sorting page FIRST (one-time per');
    console.log('  origin), or deploy to production where their house is already set.');
  } else {
    console.log(`\n  all ${urls.length} link(s) usable cold.`);
  }
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('CHECK ERROR: ' + e.message); process.exit(1); });
