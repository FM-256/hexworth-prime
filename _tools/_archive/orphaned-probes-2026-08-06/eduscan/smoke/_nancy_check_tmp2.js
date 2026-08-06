const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.setViewport({ width: 360, height: 1200 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/cloud-master', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  const n = await page.evaluate(() => document.querySelectorAll('.item').length);
  console.log('item count', n);
  if (n > 0) {
    await page.evaluate(() => document.querySelector('.item').scrollIntoView({block:'start'}));
    await new Promise(r=>setTimeout(r,300));
    await page.screenshot({ path: '/home/eq/ai-content/hexworth-prime/_tools/eduscan/smoke/_narrow_item.png' });
  }
  // also check longest title text among items
  const titles = await page.evaluate(() => Array.from(document.querySelectorAll('.item .t')).map(e=>e.textContent));
  console.log(JSON.stringify(titles));
  await browser.close();
})();
