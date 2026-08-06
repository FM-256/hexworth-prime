const puppeteer = require('puppeteer');
const URL = 'http://localhost:8934/houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting-scenarios.lab.html';
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'forge');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => openScenario('slow-network'));
  await page.evaluate(() => beginTroubleshooting('slow-network'));
  const step0 = await page.evaluate(() => document.querySelector('#stepContent_slow-network .situation-text').textContent);
  console.log('STEP0:', step0.includes('pins 4, 5, 7, and 8') || step0.includes('wire pairs') ? 'HAS FAULT TEXT (unexpected on step0)' : 'no fault text (expected, step0 is diagnosis)');
  await page.evaluate(() => handleChoice('slow-network', 0, 1));
  await page.click('#nextBtn_slow-network_0');
  const step1 = await page.evaluate(() => document.querySelector('#stepContent_slow-network .situation-text').textContent);
  console.log('STEP1 HAS FAULT TEXT:', step1.includes('pins 4, 5, 7, and 8'));
  console.log('STEP1 TEXT:', step1.slice(0,400));
  await page.evaluate(() => handleChoice('slow-network', 1, 1));
  await page.click('#nextBtn_slow-network_1');
  const outcome = await page.evaluate(() => document.querySelector('#outcomeArea_slow-network').textContent);
  console.log('OUTCOME HAS "crushed under a furniture leg":', outcome.includes('crushed under a furniture leg'));
  await browser.close();
})();
