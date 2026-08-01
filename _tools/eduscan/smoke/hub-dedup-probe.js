#!/usr/bin/env node
'use strict';
// ONE HREF, ONE CARD. No file may render twice on a hub page.
//
// WHY THIS EXISTS. The Cloud Master hub was measured rendering the OpenStack capstone TWICE --
// once under "Labs" from the ContentCatalog projection (its entry carries components:['lab']),
// once under "Projects" from an admin-curated Firestore item -- with different authored copy.
// merged() in _app/houses/hub/index.html de-duplicated within a single section only, so neither
// call could see the other.
//
// Nancy's objection, which produced this file: the fix was defended with hub-environment-probe.js
// (18/18) and storm-safety-probe.js (PASSED). Both are real regression checks, but they cover the
// ambient lightning feature and touch neither merged() nor section membership. Citing them as
// evidence FOR the dedup was measuring the wrong instrument -- the exact failure the platform's
// own rules warn about. The only actual evidence was a manual anchor count run once by hand.
// This makes that check durable, and it is the regression net named in the renderer's comment.
//
// It matters because dedup is exact string equality on href with no normalization: a trailing
// slash, a case change, or a relative-vs-absolute spelling from some future second writer into
// sections.* would silently stop matching and the duplicate would come back with no error, no
// log, and nothing else asserting otherwise.
//
// usage:  BASE=https://hexworth.com node _tools/eduscan/smoke/hub-dedup-probe.js [hubId ...]
// default hub set is every hub this probe knows about; pass ids to narrow it.
const puppeteer = require('puppeteer');

const BASE = process.env.BASE;
const HUBS = process.argv.slice(2).length ? process.argv.slice(2) : ['cloud-master'];

if (!BASE) {
  console.error('usage: BASE=https://... node _tools/eduscan/smoke/hub-dedup-probe.js [hubId ...]');
  process.exit(2);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let fail = 0;
  try {
    for (const hub of HUBS) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
      await page.goto(`${BASE}/houses/hub/${hub}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 4500));   // Firestore fetch + render

      const r = await page.evaluate(() => {
        // Section membership, so a duplicate report names WHERE each copy rendered -- the
        // useful half of the finding, since the two copies carry different authored copy.
        function sectionOf(el) {
          let n = el;
          while (n && n !== document.body) {
            const h = n.querySelector && n.querySelector('h2');
            if (h) { return h.textContent.trim(); }
            n = n.parentElement;
          }
          return '(no section)';
        }
        const byHref = {};
        [...document.querySelectorAll('a[href]')].forEach((a) => {
          const h = a.getAttribute('href');
          // Only content links: in-page anchors and the topbar are not shelf cards.
          if (!h || h.charAt(0) === '#' || !/\/houses\//.test(h)) { return; }
          if (!byHref[h]) { byHref[h] = []; }
          byHref[h].push(sectionOf(a));
        });
        const dupes = Object.keys(byHref)
          .filter((h) => byHref[h].length > 1)
          .map((h) => ({ href: h, count: byHref[h].length, sections: byHref[h] }));
        return {
          contentLinks: Object.keys(byHref).length,
          sections: [...document.querySelectorAll('h2')].map((h) => h.textContent.trim()),
          dupes,
        };
      });
      await page.close();

      console.log(`\n  ${hub}`);
      console.log(`    sections: ${r.sections.join('  ')}`);
      console.log(`    distinct content links: ${r.contentLinks}`);

      // A hub that rendered nothing would otherwise "pass" while asserting nothing at all.
      if (!r.contentLinks) {
        console.log('    FAIL  no content links rendered -- the probe asserted NOTHING here.');
        fail++;
        continue;
      }
      if (r.dupes.length) {
        fail++;
        console.log(`    FAIL  ${r.dupes.length} href(s) render more than once:`);
        r.dupes.forEach((d) => console.log(`            ${d.count}x  ${d.href}\n              in: ${d.sections.join(' , ')}`));
      } else {
        console.log('    PASS  every content href renders exactly once');
      }
    }
  } finally { await browser.close().catch(() => {}); }

  console.log(fail ? '\n  HUB DEDUP FAILED' : '\n  HUB DEDUP PASSED');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
