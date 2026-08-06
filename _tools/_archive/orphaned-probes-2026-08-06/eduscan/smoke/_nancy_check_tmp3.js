const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/cloud-master', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  const item = await page.$('a.item');
  await item.scrollIntoView();
  await new Promise(r=>setTimeout(r,300));
  // real keyboard tabbing to trigger :focus-visible
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
    return { outline: s.outline, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow, tag: a.tagName, cls: a.className };
  });
  console.log(JSON.stringify(cs, null, 2));
  await page.screenshot({ path: '/home/eq/ai-content/hexworth-prime/_tools/eduscan/smoke/_focus_tab.png' });
  await browser.close();
})();
