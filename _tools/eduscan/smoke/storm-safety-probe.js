#!/usr/bin/env node
'use strict';
// PHOTOSENSITIVITY SAFETY CHECK for the hub lightning, against WCAG 2.3.1.
//
// It replaces _storm-check.js, which Nancy showed could not do this job:
//   * it counted a flash as opacity crossing 0.02, while the double-flicker dipped only to
//     0.04/0.05. It was evaluating `0.05 > 0.02` -- always true -- so it could ONLY ever report
//     one onset per strike, by construction. It was not measuring the thing.
//   * WCAG counts a flash as a PAIR OF OPPOSING luminance changes (rise then fall), not an
//     excursion from black. A double-flicker is therefore TWO flashes.
//   * it sampled opacity. Opacity is not luminance, and the old design used
//     mix-blend-mode:screen which brightens multiplicatively, so a .34-alpha bloom over bright
//     cloud reached far higher composited luminance than the opacity implied.
//
// HONEST SPLIT OF WHAT IS MEASURED HOW -- because conflating these is what went wrong before:
//   MAGNITUDE  measured on RENDERED PIXELS. Screenshots of the bloom core at rest and at peak,
//              converted to WCAG relative luminance. This decides whether the transition is a
//              "flash" under 2.3.1 at all, and it is a hard pass/fail.
//   TIMING     measured from the animation driver (opacity over time), because capturing real
//              frames at 16ms is not possible via screenshot. This is legitimate for COUNTING
//              transitions -- it says WHEN they happen, not how bright they are -- and the peak
//              is READ FROM THE PAGE rather than hardcoded, so it cannot drift from the CSS.
//
// usage: BASE=https://... node _tools/eduscan/smoke/storm-safety-probe.js
const puppeteer = require('puppeteer');

const BASE = process.env.BASE;
const SECONDS = Number(process.env.SECONDS || 120);
const LIMIT = 3;   // WCAG 2.3.1: max flashes in any 1-second window

let fail = 0;
function check(l, ok, d) {
  if (ok) { console.log(`  PASS  ${l}`); }
  else { fail++; console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); }
}

// WCAG relative luminance of the bloom-core region, from a real screenshot.
async function coreLuma(page, pinAlpha) {
  await page.evaluate((v) => {
    const b = document.querySelector('.bolt');
    if (b) { b.style.animation = 'none'; b.style.opacity = String(v); }
  }, pinAlpha);
  await new Promise((r) => setTimeout(r, 250));
  const vp = page.viewport();
  const shot = await page.screenshot({ encoding: 'base64', clip: {
    x: Math.round(vp.width * 0.22) - 20, y: Math.round(vp.height * 0.24) - 20, width: 40, height: 40 } });
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const f = [d[i], d[i + 1], d[i + 2]].map((v) => {
        v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      sum += 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; n++;
    }
    return sum / n;
  }, shot);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
    await page.goto(`${BASE}/houses/hub/cloud-master`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 3000));

    // ── Structural properties that make stacking impossible ──
    const cells = await page.evaluate(() => document.querySelectorAll('.bolt').length);
    check('exactly one storm cell (independent cells drift into phase and stack)', cells === 1, String(cells));

    const blend = await page.evaluate(() => {
      const b = document.querySelector('.bolt');
      return b ? getComputedStyle(b).mixBlendMode : 'none';
    });
    check('no screen blend (it makes composited luminance unpredictable from opacity)',
      blend === 'normal' || blend === 'none', blend);

    // ── TIMING: read the real peak from the page, then count opposing pairs ──
    const peakAlpha = await page.evaluate((secs) => new Promise((resolve) => {
      const b = document.querySelector('.bolt');
      let peak = 0; const t0 = performance.now();
      (function tick() {
        const a = b ? parseFloat(getComputedStyle(b).opacity) : 0;
        if (a > peak) { peak = a; }
        if (performance.now() - t0 < secs * 1000) { requestAnimationFrame(tick); }
        else { resolve(peak); }
      })();
    }), Math.min(30, SECONDS));
    console.log(`  peak alpha observed on the page: ${peakAlpha.toFixed(3)}`);
    check('a strike actually fires (peak alpha > 0)', peakAlpha > 0.01, String(peakAlpha));

    const series = await page.evaluate((secs, hi) => new Promise((resolve) => {
      const b = document.querySelector('.bolt');
      const pairs = []; let rising = false; const t0 = performance.now();
      (function tick() {
        const a = b ? parseFloat(getComputedStyle(b).opacity) : 0;
        if (!rising && a > hi) { rising = true; }
        else if (rising && a <= hi) { rising = false; pairs.push(performance.now() - t0); }
        if (performance.now() - t0 < secs * 1000) { requestAnimationFrame(tick); }
        else { resolve(pairs); }
      })();
    }), SECONDS, peakAlpha * 0.5);

    let worst = 0;
    series.forEach((t) => {
      const n = series.filter((x) => x >= t && x < t + 1000).length;
      if (n > worst) { worst = n; }
    });
    console.log(`  opposing luminance pairs in ${SECONDS}s: ${series.length}`);
    check(`no more than ${LIMIT} flashes in any 1s window`, worst <= LIMIT,
      `worst window had ${worst}`);

    // ── MAGNITUDE: rendered pixels, hard pass/fail ──
    const restL = await coreLuma(page, 0);
    const peakL = await coreLuma(page, peakAlpha);
    const delta = peakL - restL;
    console.log(`  bloom core RENDERED luminance: rest ${restL.toFixed(4)} -> peak ${peakL.toFixed(4)} (delta ${delta.toFixed(4)})`);
    // WCAG general flash: opposing changes >= 0.10 relative luminance AND darker state < 0.80.
    // Staying UNDER that threshold means 2.3.1 does not classify this as a flash at all, which
    // is a stronger result than merely counting few flashes.
    const isFlash = delta >= 0.10 && restL < 0.80;
    check('luminance change stays below the WCAG general-flash threshold', !isFlash,
      `delta ${delta.toFixed(4)} (threshold 0.10), darker state ${restL.toFixed(4)}`);
    await page.close();

    // ── Reduced motion must disable it outright ──
    const p2 = await browser.newPage();
    await p2.setCacheEnabled(false);
    await p2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p2.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
    await p2.goto(`${BASE}/houses/hub/cloud-master`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 3000));
    const rm = await p2.evaluate(() => {
      const b = document.querySelector('.bolt');
      if (!b) { return { name: 'none', op: 0 }; }
      const cs = getComputedStyle(b);
      return { name: cs.animationName, op: parseFloat(cs.opacity) };
    });
    check('reduced-motion disables the flash entirely',
      (rm.name === 'none' || rm.name === '') && rm.op === 0,
      `animation=${rm.name} opacity=${rm.op}`);
    await p2.close();
  } finally { await browser.close().catch(() => {}); }

  console.log(fail ? '\n  STORM SAFETY FAILED' : '\n  STORM SAFETY PASSED');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
