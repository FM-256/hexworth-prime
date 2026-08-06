const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/openstack', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  for (let i=0;i<40;i++){
    await page.keyboard.press('Tab');
    const active = await page.evaluate(()=> {
      const a = document.activeElement;
      return a ? {tag:a.tagName, cls:a.className} : null;
    });
    if (active && active.cls && active.cls.includes('item')) { console.log('landed on item after', i, 'tabs'); break; }
  }
  const cs = await page.evaluate(() => {
    const a = document.activeElement;
    const s = getComputedStyle(a);
    return { outline: s.outline, bg: s.backgroundColor, tag: a.tagName, cls: a.className };
  });
  console.log('openstack (env-off, old .item style):', JSON.stringify(cs));
  await browser.close();
})();
