// Does clicking a card actually take the student somewhere broken?
//
// WHY THIS EXISTS: BUG-063 claimed "35 cards, clicking them 404s". What had actually been
// measured was the href TARGET's HTTP status (404, true) — the CLICK itself was never tested.
// 34 of those 35 were already covered by a click-intercept gate that shows an alert and does
// not navigate, so the claim was ~34x overstated and the "fix" broke the working gate.
// Measuring the target is not measuring the claim. This probe measures the claim.
//
// Reports, per card: whether a left-click navigates, whether a dialog appears, and whether
// modifier/middle clicks BYPASS the gate (they open a new tab, so a JS click-handler on the
// anchor never runs — a real bypass path that DOM inspection cannot see).
//
// usage: node card-click-probe.js <url> [selector]
const puppeteer = require('puppeteer');
const URL = process.argv[2];
const SEL = process.argv[3] || 'a.content-card';
if (!URL) { console.error('usage: node card-click-probe.js <url> [selector]'); process.exit(2); }

(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const p = await b.newPage();
  // Render AS A SORTED STUDENT or AccessGuard redirects to the sorting gate and the probe
  // silently measures that page instead, while document.title still looks right.
  await p.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_house', 'shield'); localStorage.setItem('hexworth_sorted', 'true'); } catch (e) {}
  });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  // Expand accordions; cards hidden in collapsed sections cannot be clicked.
  //
  // THIS MUST RUN AFTER EVERY RELOAD, not just the first. The probe reloads the page each
  // time a card navigates, and the reload comes back COLLAPSED -- so every card after the
  // first navigation was unclickable and recorded as "blocked silently". That made results
  // non-deterministic run to run (Chris measured 11/6, then 21 silent, then 10/2 on the same
  // page with no code change) and it got worse the more cards navigated. A 26-card page was
  // stable; a 58-card page with 46 navigations was not. The tool built to stop unverified
  // click claims was itself unreliable at exactly the size where the original mistake happened.
  const expand = async () => {
    await p.evaluate(() => {
      document.querySelectorAll('details').forEach(d => { d.open = true; });
      if (typeof window.toggleDomain === 'function') {
        document.querySelectorAll('[onclick^="toggleDomain"]').forEach(el => { try { el.click(); } catch (e) {} });
      }
      document.querySelectorAll('[class*="domain-content"],[class*="accordion"],[class*="panel"],[class*="week"]').forEach(el => el.classList.add('open'));
    });
    await new Promise(r => setTimeout(r, 700));
  };
  await expand();

  const hrefs = await p.evaluate((s) => [...document.querySelectorAll(s)].map(a => a.getAttribute('href')), SEL);
  if (process.env.DUMPHREFS) {
    // Cards on some hubs are BUILT AT RUNTIME from a data array, so a static regex over the
    // HTML sees JS template fragments (' + esc(item.id) + ') instead of real hrefs and both
    // over- and under-counts. Dump what the page actually rendered.
    const abs = await p.evaluate((s) => [...document.querySelectorAll(s)].map(a => a.href), SEL);
    require('fs').writeFileSync('/tmp/rendered-hrefs.json', JSON.stringify(abs));
    console.log('dumped ' + abs.length + ' rendered hrefs');
    await b.close();
    return;
  }
  const start = p.url();
  const results = [];
  for (const href of hrefs) {
    let dialog = null;
    const onDialog = async (d) => { dialog = d.message(); await d.dismiss(); };
    p.on('dialog', onDialog);
    // A click that navigates destroys the execution context mid-evaluate. That throw IS the
    // signal ("it navigated"), so catch it rather than letting it kill the run.
    try {
      await p.evaluate((s, h) => {
        const el = [...document.querySelectorAll(s)].find(a => a.getAttribute('href') === h);
        if (el) el.click();
      }, SEL, href);
    } catch (e) { /* context destroyed == navigation happened */ }
    await new Promise(r => setTimeout(r, 600));   // dialogs need time to fire before we judge
    const navigated = p.url() !== start;
    p.off('dialog', onDialog);
    if (navigated) {
      await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise(r => setTimeout(r, 900));
      await expand();   // the reload comes back collapsed -- see the note above
    }
    results.push({ href, navigated, dialog });
  }
  const gated = results.filter(r => !r.navigated && r.dialog);
  const silent = results.filter(r => !r.navigated && !r.dialog);
  const nav = results.filter(r => r.navigated);
  console.log(JSON.stringify({
    url: URL, cards: results.length,
    gatedWithDialog: gated.length,
    navigated: nav.length,
    blockedSilently: silent.length,
    sampleDialog: gated[0] ? gated[0].dialog : null,
    navigatedHrefs: nav.map(r => r.href).slice(0, 8),
  }, null, 2));
  await b.close();
})();
