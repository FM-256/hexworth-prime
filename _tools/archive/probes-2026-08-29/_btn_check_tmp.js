const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  for (const [w, h] of [[999,800],[900,800],[430,900]]) {
    await p.setViewport({ width: w, height: h });
    await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 300));
    const m = await p.evaluate(() => {
      const d = document.querySelector('.term-dock');
      const wrap = d && d.querySelector('.sandbox-launcher__iframe-wrap');
      return { pos: getComputedStyle(d).position,
               wrapH: wrap ? Math.round(wrap.getBoundingClientRect().height) : null,
               h2: d.querySelector('h2') ? getComputedStyle(d.querySelector('h2')).display : 'none' };
    });
    console.log(`  ${String(w).padEnd(4)}x${h}: position=${m.pos.padEnd(7)} terminal=${m.wrapH}px h2=${m.h2}  ${m.pos === 'static' ? '(static below 1000px, as intended)' : ''}`);
  }
  await b.close();
})();
