// Reads the RENDERED progress counters on a hub and reports whether the denominator is
// achievable — i.e. whether it counts modules the student cannot open.
//
// WHY: isc2-cc showed "0 / 17" for Domain 1 while 5 of those 17 were gated as coming-soon,
// so the best a student could ever reach was 12/17. A counter that cannot reach its own
// total is a promise the page cannot keep, and no layout or link check detects it.
//
// usage: node progress-denominator-probe.js <url>
const puppeteer = require('puppeteer');
const URL = process.argv[2];
if (!URL) { console.error('usage: node progress-denominator-probe.js <url>'); process.exit(2); }
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const p = await b.newPage();
  await p.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_house', 'shield'); localStorage.setItem('hexworth_sorted', 'true'); } catch (e) {}
  });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  const out = await p.evaluate(() => {
    const texts = {};
    document.querySelectorAll('[id$="-progress-text"]').forEach(el => { texts[el.id] = el.textContent.trim(); });
    const overall = document.getElementById('progressText');
    const gated = window.HEX_COMING_SOON_IDS || null;
    // A gated id still present in the DOM is fine (the card should still be visible);
    // what matters is whether it is inside a progress DENOMINATOR.
    return { perDomain: texts, overall: overall ? overall.textContent.trim() : null, gatedIds: gated };
  });
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
