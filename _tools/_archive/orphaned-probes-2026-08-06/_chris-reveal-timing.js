const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://hexworth.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  const samples = [];
  for (let t = 0; t <= 3000; t += 300) {
    const info = await page.evaluate(() => {
      const card = document.querySelector('.cta-card');
      const sub = document.querySelector('.hero-subtitle, .hero p, header p, h1 + p, .subhead');
      if (!card) return { cardFound: false };
      const cs = getComputedStyle(card);
      return {
        cardFound: true,
        opacity: cs.opacity,
        transform: cs.transform,
        visibility: cs.visibility,
      };
    });
    samples.push({ t, info });
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(JSON.stringify(samples, null, 2));
  await browser.close();
})();
