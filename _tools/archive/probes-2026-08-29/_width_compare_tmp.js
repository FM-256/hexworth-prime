// Does the fix actually change anything at COMMON screen widths, or only on very wide monitors?
// old rule: .wrap max-width 1600px, and the .cols grid only existed at >=1500px
// new rule: .wrap max-width min(96vw, 2100px)
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  console.log('  width | NEW wrap/card (live) | OLD wrap/card (computed) | change');
  for (const w of [1280, 1366, 1440, 1536, 1600, 1728, 1920, 2560]) {
    await p.setViewport({ width: w, height: 900 });
    await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'domcontentloaded' });
    await new Promise(x=>setTimeout(x,300));
    const m = await p.evaluate(() => ({
      wrap: Math.round(document.querySelector('.wrap').getBoundingClientRect().width),
      card: Math.round(document.querySelector('.card').getBoundingClientRect().width),
    }));
    const avail = w - 40;                       // body padding 20 each side
    const oldWrap = Math.min(1600, avail);
    const oldCard = w >= 1500 ? oldWrap - 382 : oldWrap;   // phantom column only existed >=1500
    const d = m.card - oldCard;
    console.log(`  ${String(w).padEnd(5)} | ${String(m.wrap).padStart(4)}/${String(m.card).padStart(4)}          | ${String(oldWrap).padStart(4)}/${String(oldCard).padStart(4)}              | card ${d>0?'+':''}${d}px`);
  }
  await b.close();
})();
