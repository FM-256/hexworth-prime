const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,1500));
  const text = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*')).filter(e => e.children.length===0 && /DECODE|DISCOVER|DEFEND/i.test(e.textContent));
    return els.map(e => ({ tag: e.tagName, cls: e.className, text: e.textContent, html: e.innerHTML }));
  });
  console.log(JSON.stringify(text, null, 2));
  await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots/tagline-zoom.png', clip: { x:0, y:80, width:390, height:40 } });
  await browser.close();
})();
