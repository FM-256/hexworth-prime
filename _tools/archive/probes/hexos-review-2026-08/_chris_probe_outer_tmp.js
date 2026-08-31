const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  for (const w of [400,700,1280]){
    const page = await browser.newPage();
    await page.setViewport({width: w, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil:'domcontentloaded'});
    const info = await page.evaluate(()=>({outerWidth: window.outerWidth, innerWidth: window.innerWidth, dpr: window.devicePixelRatio}));
    console.log(w, JSON.stringify(info));
    await page.close();
  }
  await browser.close();
})();
