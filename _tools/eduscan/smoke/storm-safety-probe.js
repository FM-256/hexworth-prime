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

// WCAG relative luminance across the WHOLE viewport, from a real screenshot.
//
// It scans every block rather than sampling the CSS gradient's declared centre. Chris caught the
// earlier version doing exactly that: it sampled a fixed 40x40 window at 22%/24% -- where the
// gradient's ALPHA peaks -- and reported delta 0.0199. A full-viewport scan finds the true worst
// case is ~0.076 at x=13%, nearly 4x higher and in a different place.
//
// The reason the two do not coincide is worth stating, because it is the whole trap:
//     delta(x,y) = alpha(x,y) x (flash_colour - background(x,y))
// The backdrop is a PHOTOGRAPH with spatial luminance variation, so the point of maximum visible
// contrast is where alpha is still high AND the underlying cloud is dark -- not where alpha
// peaks. Assuming those are the same point is a spatial version of the same
// measure-a-proxy-instead-of-the-claim error that produced the wrong flash count.
//
// Block-averaged 10x10 so a single noisy pixel or PNG encoding artefact cannot set the headline.
async function worstLumaDelta(page, peakAlpha) {
  async function frame(alpha) {
    await page.evaluate((v) => {
      // Freeze everything else so the ONLY variable between the two frames is the bolt.
      document.querySelectorAll('.env-plane').forEach((e) => { e.style.animationPlayState = 'paused'; });
      const b = document.querySelector('.bolt');
      if (b) { b.style.animation = 'none'; b.style.opacity = String(v); }
    }, alpha);
    await new Promise((r) => setTimeout(r, 300));
    return page.screenshot({ encoding: 'base64' });
  }
  const restShot = await frame(0);
  const peakShot = await frame(peakAlpha);
  return page.evaluate(async (a, b) => {
    async function lumaGrid(b64) {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const BS = 10, cols = Math.floor(c.width / BS), rows = Math.floor(c.height / BS);
      const grid = [];
      for (let by = 0; by < rows; by++) {
        for (let bx = 0; bx < cols; bx++) {
          let sum = 0, n = 0;
          for (let y = by * BS; y < (by + 1) * BS; y++) {
            for (let x = bx * BS; x < (bx + 1) * BS; x++) {
              const i = (y * c.width + x) * 4;
              const f = [d[i], d[i + 1], d[i + 2]].map((v) => {
                v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
              });
              sum += 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; n++;
            }
          }
          grid.push({ x: bx * BS, y: by * BS, l: sum / n });
        }
      }
      return { grid, w: c.width, h: c.height };
    }
    const R = await lumaGrid(a), P = await lumaGrid(b);
    let worst = { delta: -1 };
    for (let i = 0; i < R.grid.length; i++) {
      const delta = P.grid[i].l - R.grid[i].l;
      if (delta > worst.delta) {
        worst = { delta, rest: R.grid[i].l, peak: P.grid[i].l,
                  xPct: +(100 * R.grid[i].x / R.w).toFixed(1), yPct: +(100 * R.grid[i].y / R.h).toFixed(1) };
      }
    }
    return worst;
  }, restShot, peakShot);
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
    const w = await worstLumaDelta(page, peakAlpha);
    const restL = w.rest, delta = w.delta;
    console.log(`  WORST-CASE rendered luminance across the whole viewport:`);
    console.log(`    at ${w.xPct}% / ${w.yPct}%:  rest ${w.rest.toFixed(4)} -> peak ${w.peak.toFixed(4)}  (delta ${delta.toFixed(4)})`);
    console.log(`    margin to the WCAG 0.10 general-flash threshold: ${(100 * (0.10 - delta) / 0.10).toFixed(0)}%`);
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
