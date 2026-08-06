const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8927/houses/dark-arts/games/dark-osint-recon-lab.applet.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  // unlock ch1 for test purposes and click its tab
  const result = await page.evaluate(() => {
    STATE.unlocked[1] = true;
    document.querySelectorAll('.ch-tab')[1].click();
    const panels = document.querySelectorAll('.challenge-panel');
    const tabs = document.querySelectorAll('.ch-tab');
    return {
      panel1Active: panels[1].classList.contains('active'),
      panel0Active: panels[0].classList.contains('active'),
      tab1Active: tabs[1].classList.contains('active'),
    };
  });
  console.log(JSON.stringify(result, null, 2));
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
