const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });
  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'));
  async function clearScreen() { await page.evaluate(() => { document.getElementById('out').innerHTML = ''; }); }
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }
  async function getOut() { return page.evaluate(() => document.getElementById('out').innerText); }
  async function getPrompt() { return page.evaluate(() => document.getElementById('ps1').innerText); }
  async function typeAndEnter(s) { await clearScreen(); await setLine(s); await pressEnter(); return getOut(); }

  await typeAndEnter('cd course');
  let p1 = await getPrompt();
  let o = await typeAndEnter('cd');
  let p2 = await getPrompt();
  console.log('prompt while scoped:', p1);
  console.log('bare cd output:', JSON.stringify(o));
  console.log('prompt after bare cd:', p2);
  await browser.close();
  process.exit((p1 === 'hex:course>' && p2 === 'hex>') ? 0 : 1);
})().catch(e=>{console.error(e);process.exit(2);});
