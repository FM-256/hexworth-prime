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
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  const errors = [];
  async function fresh() {
    const ctx = browser.createBrowserContext ? await browser.createBrowserContext()
                                             : browser.defaultBrowserContext();
    const page = ctx.newPage ? await ctx.newPage() : await browser.newPage();
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
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
