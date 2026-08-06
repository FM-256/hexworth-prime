const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.setViewport({ width: 1600, height: 900 });
  await page.goto('https://hexworth-prime--cm-sky-v7-g80qauy4.web.app/houses/hub/cloud-master', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  const info = await page.evaluate(() => {
    const mid = document.querySelector('.env-mid');
    const s = getComputedStyle(mid);
    const r = mid.getBoundingClientRect();
    return { bgImage: s.backgroundImage, bgPos: s.backgroundPosition, bgSize: s.backgroundSize, rect: r };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: '/home/eq/ai-content/hexworth-prime/_tools/eduscan/smoke/_top_region_t0.png', clip: {x:0,y:0,width:1600,height:400} });
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: '/home/eq/ai-content/hexworth-prime/_tools/eduscan/smoke/_top_region_t8.png', clip: {x:0,y:0,width:1600,height:400} });
  await browser.close();
})();
