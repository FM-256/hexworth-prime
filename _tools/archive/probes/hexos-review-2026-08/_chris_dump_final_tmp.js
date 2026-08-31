const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
  await new Promise(r=>setTimeout(r, 1000));
  const html = await page.content();
  require('fs').writeFileSync('/home/eq/ai-content/hexworth-prime/_chris_final_dom.html', html);
  console.log('URL:', page.url());
  console.log('title:', await page.title());
  const bodyStart = await page.evaluate(() => document.body.innerHTML.slice(0, 500));
  console.log('BODY START:', bodyStart);
  await browser.close();
})();
