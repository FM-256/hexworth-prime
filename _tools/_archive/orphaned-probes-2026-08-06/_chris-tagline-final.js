const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,4000));
  const words = await page.evaluate(() => Array.from(document.querySelectorAll('.tagline-word .tagline-chars')).map(e=>e.textContent));
  console.log('final tagline words:', JSON.stringify(words));
  await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots/tagline-final.png', clip: { x:0, y:80, width:390, height:40 } });
  await browser.close();
})();
