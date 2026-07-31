// MEASURES WCAG AA contrast for text sitting over the hub environment, and proves the local
// scrim actually paints.
//
// Why this exists rather than another screenshot: Nancy found that the reading-column scrim was
// composited UNDERNEATH the environment and never painted at all. An ordinary screenshot could
// not see it, because the source art happens to be dark at the top -- the page "looked fine"
// while the mechanism providing that legibility did not exist. She caught it by forcing the
// scrim red. Both checks live here now so the failure cannot return silently.
//
// usage: BASE=https://... node _tools/eduscan/smoke/hub-env-contrast-probe.js
const puppeteer = require('puppeteer');

const BASE = process.env.BASE;
const URL = BASE + '/houses/hub/cloud-master';

// Elements that sit directly on .wrap with no card behind them -- the ones the scrim protects.
// .sub and the topbar link measured 3.76:1 and 3.99:1 before this fix; both failed AA.
const TARGETS = [
  ['.sub', 'hub subtitle'],
  ['.topbar a:last-child', 'topbar house link'],
  ['.section h2', 'section heading'],
  ['.item .d', 'item description (inside card)'],
  ['.kid-sub', 'child cartridge sublabel'],
];

function lum(c) {
  const a = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function ratio(fg, bg) {
  const L1 = lum(fg), L2 = lum(bg);
  return ((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05));
}

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await new Promise((r) => setTimeout(r, 4000));

    // ── 1. Does the scrim actually paint? Force it red and look for red pixels in the header. ──
    // Same diagnostic Nancy used. If the scrim composites under .env, nothing turns red.
    await page.addStyleTag({ content: 'body.env-on .wrap::before{ background:#ff0000 !important; }' });
    await new Promise((r) => setTimeout(r, 600));
    const shot = await page.screenshot({ encoding: 'base64', clip: { x: 300, y: 120, width: 500, height: 120 } });
    const buf = Buffer.from(shot, 'base64');
    // Cheap PNG red-dominance test: decode via the page instead of a PNG lib.
    const redSeen = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let red = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 120 && d[i] > d[i + 1] * 2 && d[i] > d[i + 2] * 2) red++;
      }
      return red / (d.length / 4);
    }, shot);
    check('local scrim ACTUALLY PAINTS (forced-red diagnostic)', redSeen > 0.5,
      `${(redSeen * 100).toFixed(1)}% red pixels — under 50% means it is composited beneath .env`);

    // Remove the diagnostic before measuring real contrast.
    await page.evaluate(() => {
      const tags = [...document.querySelectorAll('style')];
      const t = tags[tags.length - 1];
      if (t && t.textContent.indexOf('#ff0000') !== -1) { t.remove(); }
    });
    await new Promise((r) => setTimeout(r, 500));

    // ── 2. Measure contrast against RENDERED pixels, patch-averaged (not one sample). ──
    for (const [sel, label] of TARGETS) {
      const res = await page.evaluate(async (sel) => {
        const el = document.querySelector(sel);
        if (!el) { return null; }
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) { return null; }
        const cs = getComputedStyle(el);
        const m = cs.color.match(/\d+/g).slice(0, 3).map(Number);
        return { fg: m, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      }, sel);
      if (!res) { check(`${label} present`, false, 'element not found'); continue; }

      const clip = { x: Math.max(0, res.x), y: Math.max(0, res.y), width: Math.max(8, Math.min(res.w, 400)), height: Math.max(8, Math.min(res.h, 40)) };
      const b64 = await page.screenshot({ encoding: 'base64', clip });
      const bg = await page.evaluate(async (s) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + s; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        // Take the DARKEST decile as the background estimate: text pixels are lighter here, so
        // averaging everything would flatter the result by mixing glyph colour into the bed.
        const lums = [];
        for (let i = 0; i < d.length; i += 4) { lums.push([0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2], d[i], d[i + 1], d[i + 2]]); }
        lums.sort((a, b) => a[0] - b[0]);
        const take = Math.max(1, Math.floor(lums.length * 0.10));
        let r = 0, g2 = 0, b = 0;
        for (let i = 0; i < take; i++) { r += lums[i][1]; g2 += lums[i][2]; b += lums[i][3]; }
        return [Math.round(r / take), Math.round(g2 / take), Math.round(b / take)];
      }, b64);

      const cr = ratio(res.fg, bg);
      check(`${label} meets WCAG AA (4.5:1)`, cr >= 4.5,
        `${cr.toFixed(2)}:1  fg=rgb(${res.fg}) bg=rgb(${bg})`);
    }
    await page.close();
  } finally { await browser.close().catch(() => {}); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
