// Renders a dynamic (Firestore) hub page and reports its typed sections and their item counts.
//
// Exists to verify a Firestore sections write actually SURFACES, rather than trusting that the
// document changed. A hub's typed sections come from two places — a projection off
// ContentCatalog, and admin-curated Firestore `sections` merged additively on top — so a write
// landing in the document is not proof a student sees anything.
//
// usage: node hub-section-probe.js <hub-url> [match-text]
const puppeteer = require('puppeteer');
const URL = process.argv[2];
const MATCH = process.argv[3] || null;
if (!URL) { console.error('usage: node hub-section-probe.js <hub-url> [match-text]'); process.exit(2); }
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const p = await b.newPage();
  // AccessGuard.require('sorted') redirects an unsorted visitor to the sorting gate, where the
  // hub does not exist — the probe would then measure that page while the title still looks right.
  await p.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_house', 'cloud'); localStorage.setItem('hexworth_sorted', 'true'); } catch (e) {}
  });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // The hub fetches Firestore, so poll rather than fixed-sleep: a slow round trip must not read
  // as "no sections".
  for (let i = 0; i < 14; i++) {
    const n = await p.evaluate(() => document.querySelectorAll('.section').length);
    if (n) break;
    await new Promise(r => setTimeout(r, 1500));
  }
  const out = await p.evaluate((match) => {
    const sections = [...document.querySelectorAll('.section')].map(s => ({
      heading: ((s.querySelector('h2') || {}).textContent || '').trim(),
      items: s.querySelectorAll('.item').length,
    }));
    let matched = null;
    if (match) {
      const re = new RegExp(match, 'i');
      matched = [...document.querySelectorAll('.section')].flatMap(s =>
        [...s.querySelectorAll('.item')]
          .filter(it => re.test(it.textContent || ''))
          .map(it => ({
            section: ((s.querySelector('h2') || {}).textContent || '').trim().replace(/\s+/g, ' '),
            clickable: it.tagName === 'A',
            href: it.getAttribute('href') || null,
          })));
    }
    return { url: location.href, title: document.title, sections, matched };
  }, MATCH);
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
