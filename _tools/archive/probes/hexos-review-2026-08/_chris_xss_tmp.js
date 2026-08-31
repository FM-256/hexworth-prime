const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  let alertFired = false;
  page.on('dialog', async d => { alertFired = true; await d.dismiss(); });
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'domcontentloaded'}).catch(()=>{});
  await page.evaluate(() => { localStorage.setItem('hexworth_house', 'shield'); });
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForSelector('#cmd', {timeout: 5000});
  await new Promise(r => setTimeout(r, 500));

  async function type(cmdline) {
    await page.focus('#cmd');
    await page.type('#cmd', cmdline);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 150));
  }
  async function outHTML() { return page.evaluate(() => document.getElementById('out').innerHTML); }

  await type('man <img src=x onerror=alert(1)>');
  const html1 = await outHTML();

  await page.evaluate(() => { document.getElementById('out').innerHTML=''; });
  await type('man foo"><img src=x onerror=alert(2)>');
  const html2 = await outHTML();

  console.log(JSON.stringify({ alertFired, html1: html1.slice(-600), html2: html2.slice(-600) }, null, 2));
  await browser.close();
})();
