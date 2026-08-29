// Measure the dock in the state a STUDENT is in: terminal OPEN. The previous version measured
// the page with the iframe still display:none, got a flat 221px at every viewport height, and
// reported it as fixed. A height that does not vary with vh cannot be obeying a vh clamp --
// that was the tell, in my own output, and I did not read it.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  for (const [w, h] of [[1366,768],[1440,900],[1920,1080]]) {
    await p.setViewport({ width: w, height: h });
    await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html',
                 { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 350));
    const m = await p.evaluate(() => {
      // Replicate the real launch path: reveal the iframe wrap and mark it embedded.
      const dock = document.querySelector('.term-dock');
      const wrap = dock && dock.querySelector('.sandbox-launcher__iframe-wrap');
      const wrapper = dock && dock.querySelector('.sandbox-launcher, [class*="launcher"]');
      if (!wrap) return { none: true };
      wrap.style.display = '';
      if (wrapper) wrapper.classList.add('is-embedded');
      const para = [...document.querySelectorAll('p')].find((n) => /Record the attachment/.test(n.textContent));
      if (para) para.scrollIntoView({ block: 'center' });
      const d = dock.getBoundingClientRect();
      const pr = para ? para.getBoundingClientRect() : null;
      // What is actually painted where the instruction is?
      let covering = null;
      if (pr) {
        const el = document.elementFromPoint(Math.max(4, pr.left + 20), Math.max(4, pr.top + 8));
        covering = el ? (el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')) : null;
      }
      return { dockH: Math.round(d.height), dockBottom: Math.round(d.bottom),
               share: Math.round(d.height / window.innerHeight * 100),
               wrapH: Math.round(wrap.getBoundingClientRect().height),
               paraTop: pr ? Math.round(pr.top) : null, covering };
    });
    if (m.none) { console.log(`  ${w}x${h}: no wrap`); continue; }
    const overlap = m.paraTop !== null && m.paraTop < m.dockBottom;
    console.log(`  ${w}x${h}  dock=${m.dockH}px (${m.share}% of vh)  wrap=${m.wrapH}  dockBottom=${m.dockBottom}  paraTop=${m.paraTop}  covering=${m.covering}  ${overlap ? 'OVERLAP' : 'clear'}`);
  }
  await b.close();
})();
