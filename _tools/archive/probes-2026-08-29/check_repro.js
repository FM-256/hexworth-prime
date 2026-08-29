const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 400});
  await page.goto('file:///home/eq/ai-content/hexworth-prime/test_repro.html');
  const info = await page.evaluate(() => {
    const grid = document.querySelector('.content-grid');
    const card = document.querySelector('.content-card');
    const gr = grid.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    return {gridWidth: gr.width, cardWidth: cr.width, cols: getComputedStyle(grid).gridTemplateColumns};
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({path: '/home/eq/ai-content/hexworth-prime/repro.png'});
  await browser.close();
})();
