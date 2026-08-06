const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/cloud-master', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));

  const info = await page.evaluate(() => {
    const env = document.querySelector('.env');
    const kids = env ? Array.from(env.children).map(c => c.className) : [];
    const birds = document.querySelectorAll('.bird').length;
    // elementFromPoint test at a point inside the label plate but over the .d text
    const item = document.querySelector('.item');
    if (item) item.scrollIntoView({block:'center'});
    const d = item ? item.querySelector('.d') : null;
    let hitTest = null;
    if (d) {
      const r = d.getBoundingClientRect();
      const x = r.left + 5, y = r.top + r.height/2;
      const el = document.elementFromPoint(x, y);
      hitTest = { x, y, rect: {left:r.left, top:r.top, w:r.width, h:r.height}, tag: el ? el.tagName : null, cls: el ? el.className : null, matchesD: el === d };
    }
    return { envChildren: kids, birdCount: birds, hitTest };
  });
  console.log(JSON.stringify(info, null, 2));

  // long title / narrow width check
  await page.setViewport({ width: 380, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/77980b61-f845-464e-b03e-89593a796ebd/scratchpad/narrow.png' });

  // focus outline check
  await page.setViewport({ width: 1400, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => {
    const item = document.querySelector('a.item');
    if (item) item.focus();
  });
  await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/77980b61-f845-464e-b03e-89593a796ebd/scratchpad/focus.png' });

  await browser.close();
})();
