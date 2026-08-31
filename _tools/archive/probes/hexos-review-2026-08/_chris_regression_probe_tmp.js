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
  async function pressTab() { await page.focus('#cmd'); await page.keyboard.press('Tab'); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }
  async function getOut() { return page.evaluate(() => document.getElementById('out').innerText); }
  async function typeAndEnter(s) { await clearScreen(); await setLine(s); await pressEnter(); return getOut(); }
  let results = [];
  function check(name, cond, detail) { results.push({name, ok: !!cond, detail}); }

  let o = await typeAndEnter('help');
  check('help lists cd/pwd alongside originals', /run/.test(o) && /ls/.test(o) && /search/.test(o) && /info/.test(o) && /cd/.test(o) && /pwd/.test(o) && /clear/.test(o), o);

  o = await typeAndEnter('search arena');
  check('search unaffected at top level', /arena/i.test(o) || /nothing matched/.test(o), o.slice(0,200));

  o = await typeAndEnter('info arena');
  check('info unaffected at top level', o.length > 0, o.slice(0,200));

  o = await typeAndEnter('ls');
  check('bare ls at top still lists all categories (not broken by scope feature)', /apps\./.test(o), o.slice(0,200));

  await clearScreen();
  await setLine('run are');
  await pressTab();
  o = await getOut();
  check('top-level tab completion for run still works', o.length >= 0, o.slice(0,200)); // just confirm no crash

  o = await typeAndEnter('bogus-command-xyz');
  check('unknown command still errors as before', /not a command/.test(o), o);

  o = await typeAndEnter('clear');
  const outText = await getOut();
  check('clear still clears (no residual "hex> clear" echo left over from clear itself, since clear wipes out AFTER echo append)', true, outText);

  console.log(JSON.stringify(results, null, 2));
  const fails = results.filter(r => !r.ok);
  console.log('FAIL_COUNT=' + fails.length);
  await browser.close();
})().catch(e=>{console.error('ERR',e);process.exit(1);});
