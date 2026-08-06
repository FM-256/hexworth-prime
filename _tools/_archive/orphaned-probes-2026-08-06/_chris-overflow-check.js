const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,2000));
  const offenders = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const all = document.querySelectorAll('*');
    const out = [];
    all.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > docWidth + 1 || r.left < -1) {
        out.push({
          tag: el.tagName, cls: el.className && el.className.toString ? el.className.toString().slice(0,80) : '',
          right: Math.round(r.right), left: Math.round(r.left), width: Math.round(r.width), top: Math.round(r.top)
        });
      }
    });
    return out.slice(0, 30);
  });
  console.log(JSON.stringify(offenders, null, 2));
  await browser.close();
})();
