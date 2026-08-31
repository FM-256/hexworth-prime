const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('hexworth_sorted', 'true');
      localStorage.setItem('sorted', 'true');
    } catch(e){}
  });
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  console.log('final URL:', page.url());
  const hasCmd = await page.evaluate(() => !!document.getElementById('cmd'));
  console.log('has #cmd:', hasCmd);
  const hasSL = await page.evaluate(() => typeof window.SandboxLauncher);
  console.log('typeof SandboxLauncher:', hasSL);
  await browser.close();
})();
