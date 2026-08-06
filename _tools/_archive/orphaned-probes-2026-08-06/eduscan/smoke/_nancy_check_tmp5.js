const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/cloud-master', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  // first tab should land on the "Hexworth Prime" back link (topbar), before reaching .item
  await page.keyboard.press('Tab');
  const cs = await page.evaluate(() => {
    const a = document.activeElement;
    const s = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return { outline: s.outline, bg: s.backgroundColor, tag: a.tagName, cls: a.className, txt: a.textContent, rect:r };
  });
  console.log('first focusable (topbar, no clip-path):', JSON.stringify(cs));
  await page.screenshot({ path: '/home/eq/ai-content/hexworth-prime/_tools/eduscan/smoke/_focus_topbar.png', clip:{x:0,y:0,width:400,height:80} });
  await browser.close();
})();
