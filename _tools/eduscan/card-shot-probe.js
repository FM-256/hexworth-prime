// Screenshot + geometry probe for a single card class on a rendered page.
//
// Exists because the overlap-probe's raw count is not conclusive on dense card-grid hubs:
// isc2-cc scores 1937 "overlaps" in PRODUCTION, unmodified, because the metric counts nested
// bounding-box intersections and a card legitimately contains an icon, a badge and text. A
// change that adds one span per card moves that number by ~200 and tells you nothing about
// whether the page actually looks right. So: look at it, and measure the specific element.
//
// usage: node card-shot-probe.js <url> <out.png> [selector]
const puppeteer = require('puppeteer');
const URL = process.argv[2], OUT = process.argv[3];
const SEL = process.argv[4] || '.content-card--soon';
if (!URL || !OUT) { console.error('usage: node card-shot-probe.js <url> <out.png> [selector]'); process.exit(2); }
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1400, height: 1000 });
  // Render AS A SORTED STUDENT. Without this, AccessGuard.require('sorted') redirects to
  // components/tourist-visa-prompt.html and the probe silently measures the SORTING GATE
  // instead of the page -- while document.title can still read like the real one. This bit
  // the overlap-probe earlier and it bit this probe too; the technique belongs in both.
  await p.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('hexworth_house', 'shield');
      localStorage.setItem('hexworth_sorted', 'true');
    } catch (e) {}
  });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  // EXPAND collapsed sections first. These hubs put module cards inside accordions, so a
  // screenshot taken without expanding shows closed rows and proves nothing about the cards
  // -- the collapsed-accordion trap. Click every plausible toggle, then scroll to the target.
  await p.evaluate(() => {
    document.querySelectorAll('details').forEach(d => { d.open = true; });
    // Prefer the page's OWN toggle when it exposes one (isc2-cc uses toggleDomain(id),
    // which flips an 'open' class). Blind clicking on class-name guesses did not work and
    // produced a screenshot identical to the collapsed state -- which reads as a pass.
    if (typeof window.toggleDomain === 'function') {
      document.querySelectorAll('[onclick^="toggleDomain"]').forEach(el => { try { el.click(); } catch (e) {} });
    }
    document.querySelectorAll('[class*="domain-content"],[class*="accordion"],[class*="panel"]').forEach(el => el.classList.add('open'));
  });
  await new Promise(r => setTimeout(r, 900));
  await p.evaluate((s) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center' }); }, SEL);
  await new Promise(r => setTimeout(r, 600));
  await p.screenshot({ path: OUT });
  const info = await p.evaluate((s) => {
    const all = [...document.querySelectorAll(s)];
    const e = all[0];
    if (!e) return { found: false, count: 0 };
    const r = e.getBoundingClientRect();
    const badge = e.querySelector('.card-soon-badge');
    const br = badge ? badge.getBoundingClientRect() : null;
    // A sibling live card, for a like-for-like size comparison: an unreleased card that
    // renders a different SIZE would reflow the grid, which is the real risk here.
    const live = [...document.querySelectorAll('.content-card')].find(x => !x.classList.contains('content-card--soon'));
    const lr = live ? live.getBoundingClientRect() : null;
    return {
      found: true, count: all.length, tag: e.tagName, hasHref: e.hasAttribute('href'),
      pointerEvents: getComputedStyle(e).pointerEvents,
      card: { w: Math.round(r.width), h: Math.round(r.height) },
      liveCard: lr ? { w: Math.round(lr.width), h: Math.round(lr.height) } : null,
      badgeInsideCard: br ? (br.left >= r.left - 1 && br.right <= r.right + 1 && br.top >= r.top - 1 && br.bottom <= r.bottom + 1) : null,
    };
  }, SEL);
  // When nothing matched, say WHY: a redirect or a replaced body looks identical to a
  // missing selector unless you check. AccessGuard can navigate away while the <title>
  // still reads like the original page.
  if (!info.found) {
    const diag = await p.evaluate(() => ({
      url: location.href,
      title: document.title,
      bodyChars: document.body ? document.body.innerHTML.length : 0,
      anyCard: document.querySelectorAll('[class*="card"]').length,
      firstText: document.body ? document.body.innerText.slice(0, 160).replace(/\s+/g, ' ') : ''
    }));
    console.log('DIAG ' + JSON.stringify(diag, null, 2));
  }
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})();
