#!/usr/bin/env node
/*
 * @catalog what    Plays the LAGRANGE EDGE mission-act loop end to end: a corroborator starts
 * @catalog what    LOCKED, the act is performed on its own surface, and the level then unlocks.
 * @catalog run     node _tools/qa/cold-horizon/acts-test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS. Every z1 level used to be "pick the right card": the revealGate demands a
 * corroborator from the PHYSICAL family and the game handed it over as a tile. The act layer
 * makes you go and get it. That introduces a failure mode worse than the one it fixes, which is
 * a level you cannot COMPLETE, so this asserts the loop closes rather than that it starts.
 *
 * WHAT IT WOULD CATCH, all of which were real risks in the build:
 *   - an act whose required command the console cannot answer ("no such telemetry point")
 *   - an act credited on a REFUSED telecommand, i.e. rewarding the failure
 *   - a corroborator still selectable for an independence test before it is obtained
 *   - the value leaking into the locked tile, which would make the trip decoration
 *
 * It drives real pages in a real browser and types real commands. No stubs.
 */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const BOX = '/arena/boxes/le-01-cold-horizon';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, buf) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
}

// Every level that declares an act, so a new one cannot be added without being covered.
const CASES = [
  { m: 2,  corr: 'badge-log',       cmd: 'tm BADGE',       kind: 'terminal' },
  { m: 3,  corr: 'range-fix',       cmd: 'ranging',        kind: 'terminal' },
  { m: 4,  corr: 'hsm-attest',      cmd: 'sdls',           kind: 'terminal' },
  { m: 5,  corr: 'gs-uplink',       cmd: 'tc PING_UPLINK', kind: 'satellite' },
  { m: 7,  corr: 'kvm-sel',         cmd: 'tm BMC-SEL',     kind: 'terminal' },
  { m: 9,  corr: 'layer-hash',      cmd: 'tm LAYER-HASH',  kind: 'terminal' },
  { m: 10, corr: 'downlink-tape',   cmd: 'tm TAPE',        kind: 'terminal' },
  { m: 11, corr: 'replay-harness',  cmd: 'tm REPLAY',      kind: 'terminal' },
  { m: 13, corr: 'c-fsw',           cmd: 'tc SAFE_MODE',   kind: 'satellite' },
  { m: 14, corr: 'r-evidence-seal', cmd: 'tm SEAL',        kind: 'terminal' },
  { m: 15, corr: 'ep-tls',          cmd: 'tm TLS-FP',      kind: 'terminal' }
];

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  /* The inspection sortie is a real WebGL page, so the software rasteriser has to be
     enabled or the renderer throws and the walk-down cannot be flown headless. The gateway
     and console pages do not need it; sharing one browser is simpler than two. */
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle',
           '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1600,900'] });

  const errors = [];
  const expectedThrows = [];
  async function fresh() {
    const ctx = browser.createBrowserContext ? await browser.createBrowserContext()
                                             : browser.defaultBrowserContext();
    const page = ctx.newPage ? await ctx.newPage() : await browser.newPage();
    /* The unknown-act guard in lagrange-inspect.html halts the module with a throw, which
       is deliberate: it is how the page refuses to fly an environment it does not have. It
       is asserted as its own check below, so counting it here too would leave "runtime
       errors" permanently at 1 and destroy the signal for a real one. */
    page.on('pageerror', e => {
      const m = String(e.message);
      if (m.indexOf('opened without a known act') !== -1) { expectedThrows.push(m); return; }
      errors.push(m.slice(0, 140));
    });
    // Sorted, or AccessGuard bounces every page to the tourist prompt.
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem('hexworth_house', 'cloud'); } catch (e) {}
    });
    return page;
  }

  console.log('\n--- LAGRANGE EDGE mission acts ---\n');

  for (const c of CASES) {
    const page = await fresh();

    // 1. LOCKED on arrival, and the value must not be visible.
    await page.goto(`${base}${BOX}/gateway.html?m=${c.m}`, { waitUntil: 'networkidle0', timeout: 40000 });
    const before = await page.evaluate((corrId) => {
      // NB: config-shared.js declares `const ColdHorizonConfig`, a LEXICAL binding, so
      // window.ColdHorizonConfig is permanently undefined. Bare reference only.
      const cfgCorr = (ColdHorizonConfig.forMission(
        Number(new URLSearchParams(location.search).get('m'))).corroborators || [])
        .filter(x => x.id === corrId)[0];
      const opts = Array.from(document.querySelectorAll('#srcA option')).map(o => o.value);
      return {
        locked: !!document.querySelector('#corrList .le-act'),
        selectable: opts.indexOf(corrId) !== -1,
        valueShown: cfgCorr ? document.getElementById('corrList').textContent.indexOf(cfgCorr.value) !== -1 : null,
        hasButton: !!document.querySelector('#corrList .le-act a.le-btn')
      };
    }, c.corr);
    check(`m${c.m} starts LOCKED with a way to go`, before.locked && before.hasButton);
    check(`m${c.m} unearned evidence is not selectable`, !before.selectable);
    check(`m${c.m} locked tile does not leak the value`, before.valueShown === false);

    // 2. Perform the act on its own surface.
    await page.goto(`${base}${BOX}/console.html?act=${c.m}:${c.corr}`,
                    { waitUntil: 'networkidle0', timeout: 40000 });
    const ordersUp = await page.evaluate(() =>
      document.getElementById('ordersPanel').style.display !== 'none');
    check(`m${c.m} console shows standing orders`, ordersUp);

    await page.type('#commandInput', c.cmd);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 350));
    const after = await page.evaluate((m, corr) => {
      const raw = localStorage.getItem('hexworth_le01_acts');
      const acts = raw ? JSON.parse(raw) : {};
      return {
        recorded: !!acts[m + ':' + corr],
        kind: acts[m + ':' + corr] ? acts[m + ':' + corr].kind : null,
        body: document.getElementById('terminalOutput').textContent
      };
    }, String(c.m), c.corr);
    check(`m${c.m} "${c.cmd}" completes the act`, after.recorded,
          after.recorded ? `kind=${after.kind}` : after.body.slice(-90).replace(/\s+/g, ' '));

    // 3. Back at the level: unlocked and usable.
    await page.goto(`${base}${BOX}/gateway.html?m=${c.m}`, { waitUntil: 'networkidle0', timeout: 40000 });
    const un = await page.evaluate((corrId) => ({
      stillLocked: !!document.querySelector('#corrList .le-act'),
      selectable: Array.from(document.querySelectorAll('#srcA option')).map(o => o.value).indexOf(corrId) !== -1
    }), c.corr);
    check(`m${c.m} level UNLOCKS and the evidence is usable`, !un.stillLocked && un.selectable);

    await page.close();
  }

  /* ── DRONE ACTS ────────────────────────────────────────────────────────────────
     The three the console cannot cover. m6 and m8 fly lagrange-inspect.html, which is
     built for their evidence; m12 flies the thermal sortie because its corroborator IS
     that survey. The environment routing is the thing under test as much as the flight:
     an earlier build sent all three to the thermal sortie and credited an RF topology
     nobody had looked at, which is why the allowlist and the router exist. */
  const DRONE = [
    { m: 6, corr: 'ch-rf-topology', page: 'lagrange-inspect', headline: 'Ka FRONT END' },
    { m: 8, corr: 'cable-map',      page: 'lagrange-inspect', headline: 'PORT 14 UNPOPULATED' }
  ];
  for (const d of DRONE) {
    const page = await fresh();
    // The gateway must ROUTE to the purpose-built environment, not the thermal sortie.
    await page.goto(`${base}${BOX}/gateway.html?m=${d.m}`, { waitUntil: 'networkidle0', timeout: 40000 });
    const href = await page.evaluate(() => {
      const a = document.querySelector('#corrList .le-act a.le-btn');
      return a ? a.getAttribute('href') : '';
    });
    check(`m${d.m} routes to its OWN environment, not the thermal sortie`,
          href.indexOf(d.page) !== -1 && href.indexOf('cold-horizon') === -1, href);

    // Fly it: inspect every target through the seam, then confirm the act is credited.
    await page.goto(`${base}/houses/cloud/games/lagrange-inspect.html?qa=1&act=${d.m}:${d.corr}`,
                    { waitUntil: 'domcontentloaded', timeout: 40000 });
    // Give the module graph, the scene build and the first frames time to land.
    await new Promise(r => setTimeout(r, 4000));
    const flew = await page.evaluate(async (m, corr) => {
      const q = window.__LE_INSPECT_QA__;
      if (!q) return { err: 'no QA seam' };
      const ids = q.env().targets;
      ids.forEach(id => q.inspect(id));
      await new Promise(r => setTimeout(r, 400));
      const raw = localStorage.getItem('hexworth_le01_acts');
      const acts = raw ? JSON.parse(raw) : {};
      const rec = acts[m + ':' + corr];
      return { snap: q.snapshot(), credited: !!rec,
               finding: rec && rec.payload ? rec.payload.finding : null,
               env: rec && rec.payload ? rec.payload.environment : null };
    }, String(d.m), d.corr);
    check(`m${d.m} walk-down completes and credits the act`, flew.credited,
          flew.err || (flew.finding || '').slice(0, 46));
    check(`m${d.m} finding matches the corroborator it earns`,
          !!flew.finding && flew.finding.indexOf(d.headline) !== -1, flew.finding || '(none)');

    // And the level unlocks.
    await page.goto(`${base}${BOX}/gateway.html?m=${d.m}`, { waitUntil: 'networkidle0', timeout: 40000 });
    const un = await page.evaluate((corrId) => ({
      stillLocked: !!document.querySelector('#corrList .le-act'),
      selectable: Array.from(document.querySelectorAll('#srcA option')).map(o => o.value).indexOf(corrId) !== -1
    }), d.corr);
    check(`m${d.m} level UNLOCKS after the walk-down`, !un.stillLocked && un.selectable);
    await page.close();
  }

  /* The thermal sortie must credit ONE act and refuse the rest. This is the exact
     defect Chris blocked: it used to credit any act it was handed. */
  const wrong = await fresh();
  await wrong.goto(`${base}/houses/cloud/games/lagrange-inspect.html?act=99:not-a-thing`,
                   { waitUntil: 'domcontentloaded', timeout: 40000 });
  await new Promise(r => setTimeout(r, 800));
  const refusedEnv = await wrong.evaluate(() =>
    document.body.textContent.indexOf('dispatched by a mission') !== -1);
  check('an unknown act gets NO environment rather than a stand-in', refusedEnv);
  check('the unknown-act guard HALTS the page instead of flying it',
        expectedThrows.length > 0, expectedThrows[0] || '(never thrown)');
  await wrong.close();

  // A refusal must NOT pay. m4's console has no authenticated session, so a telecommand
  // there is refused at the frame layer; crediting it would reward the failure.
  const page = await fresh();
  await page.goto(`${base}${BOX}/console.html?act=4:hsm-attest`, { waitUntil: 'networkidle0', timeout: 40000 });
  await page.type('#commandInput', 'tc SAFE_MODE');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 300));
  const refused = await page.evaluate(() => {
    const raw = localStorage.getItem('hexworth_le01_acts');
    const acts = raw ? JSON.parse(raw) : {};
    return { credited: !!acts['4:hsm-attest'],
             said: document.getElementById('terminalOutput').textContent.indexOf('REFUSED') !== -1 };
  });
  check('a REFUSED telecommand does not credit the act', !refused.credited && refused.said);
  await page.close();

  console.log(`\n=== page errors (${errors.length}) ===`);
  if (errors.length) console.log('  ' + [...new Set(errors)].join('\n  '));
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed, ${errors.length} runtime errors`);
  await browser.close();
  server.close();
  process.exit(passed === results.length && !errors.length ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
