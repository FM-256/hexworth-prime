const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'domcontentloaded'}).catch(()=>{});
  await page.evaluate(() => { localStorage.setItem('hexworth_house', 'shield'); });
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForSelector('#cmd', {timeout: 5000});
  await new Promise(r => setTimeout(r, 500));

  async function clearOut() { await page.evaluate(() => { document.getElementById('out').innerHTML=''; }); }
  async function outText() { return page.evaluate(() => document.getElementById('out').innerText); }

  // Tab with empty fragment after "man "
  await page.focus('#cmd');
  await page.type('#cmd', 'man ');
  await clearOut();
  await page.keyboard.press('Tab');
  await new Promise(r => setTimeout(r, 100));
  const out1 = await outText();
  const val1 = await page.evaluate(() => document.getElementById('cmd').value);

  console.log(JSON.stringify({ tab_after_man_space_output: out1, cmdValueAfterTab: val1 }, null, 2));

  await browser.close();
})();
