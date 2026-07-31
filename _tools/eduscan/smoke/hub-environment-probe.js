// Verifies the Cloud Master hub environment pilot, and — more importantly — that it does NOT
// leak onto the other Firestore hubs this same file renders.
//
// The scoping assertion is the load-bearing one. _app/houses/hub/index.html is the shared
// renderer for EVERY Firestore hub, so a restyle that is not gated re-skins all of them. A probe
// that only checks "does Cloud Master look good" would pass while the rest of the platform
// silently changed.
//
// usage: BASE=https://... node _tools/eduscan/smoke/hub-environment-probe.js
const puppeteer = require('puppeteer');

const BASE = process.env.BASE || 'http://localhost:8993';
const PILOT = 'cloud-master';
const CONTROLS = ['openstack', 'aws-ccp'];   // sibling Firestore hubs that must stay untouched

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

async function inspect(page, id) {
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.goto(`${BASE}/houses/hub/${id}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await new Promise((r) => setTimeout(r, 3500));   // Firestore fetch + render
  return page.evaluate(() => {
    const item = document.querySelector('.item');
    const spine = item ? getComputedStyle(item, '::before') : null;
    return {
      envOn: document.body.classList.contains('env-on'),
      layers: document.querySelectorAll('.env-layer').length,
      veil: !!document.querySelector('.env-veil'),
      envAriaHidden: (document.querySelector('.env') || {}).getAttribute
        ? document.querySelector('.env').getAttribute('aria-hidden') : null,
      items: document.querySelectorAll('.item').length,
      kids: document.querySelectorAll('.kid-card').length,
      spineWidth: spine ? spine.width : null,
      itemBg: item ? getComputedStyle(item).backgroundImage.slice(0, 30) : null,
      title: document.title,
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    console.log(`\n=== PILOT: ${PILOT} ===`);
    let p = await browser.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    const r = await inspect(p, PILOT);
    check('hub rendered content (not the not-found state)', r.items > 0 || r.kids > 0,
      `items=${r.items} kids=${r.kids}`);
    check('environment mounted (body.env-on)', r.envOn === true);
    check('three depth layers present', r.layers === 3, `got ${r.layers}`);
    check('legibility veil present', r.veil === true);
    check('environment is decorative, not announced', r.envAriaHidden === 'true', String(r.envAriaHidden));
    check('items carry the cartridge spine', r.spineWidth === '5px', String(r.spineWidth));
    check('items use the cartridge gradient, not the flat panel', /gradient/.test(r.itemBg || ''), r.itemBg);
    check('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
    await p.close();

    // ── The scoping assertion ──
    for (const id of CONTROLS) {
      console.log(`\n=== CONTROL (must be UNCHANGED): ${id} ===`);
      const cp = await browser.newPage();
      const c = await inspect(cp, id);
      check(`${id}: environment NOT mounted`, c.envOn === false, `env-on=${c.envOn}`);
      check(`${id}: no depth layers`, c.layers === 0, `got ${c.layers}`);
      check(`${id}: items keep the flat panel (no cartridge spine)`,
        c.spineWidth !== '5px', `spine=${c.spineWidth}`);
      await cp.close();
    }
  } finally { await browser.close().catch(() => {}); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
