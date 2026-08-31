const puppeteer = require('puppeteer');

async function freshPage(browser) {
  const page = await browser.newPage();
  page.on('dialog', d => d.dismiss());
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'domcontentloaded'}).catch(()=>{});
  await page.evaluate(() => { localStorage.setItem('hexworth_house', 'shield'); });
  await page.goto('http://localhost:8934/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForSelector('#cmd', {timeout: 5000});
  await new Promise(r => setTimeout(r, 500));
  return page;
}

async function type(page, cmdline) {
  await page.focus('#cmd');
  await page.evaluate(() => { document.getElementById('cmd').value = ''; });
  await page.type('#cmd', cmdline);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 150));
}
async function outText(page) { return page.evaluate(() => document.getElementById('out') ? document.getElementById('out').innerText : '(NO #out - navigated away)'); }
async function clearOut(page) { await page.evaluate(() => { if(document.getElementById('out')) document.getElementById('out').innerHTML=''; }); }

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const results = {};

  const appsData = await (await fetch('http://localhost:8934/data/hex-apps.json')).json().then(j=>j.apps).catch(()=>null);

  // ================= Session 1: everything except run-navigation =================
  const page = await freshPage(browser);

  await clearOut(page);
  await type(page, 'cd cert-prep');
  results.cd_cert_prep = await outText(page);

  const inScopeIds = appsData.filter(a => a.category === 'cert-prep' || a.house === 'cert-prep').map(a => a.id);
  const outOfScope = appsData.find(a => !inScopeIds.includes(a.id));
  results.outOfScopeAppTried = outOfScope.id;

  await clearOut(page);
  await type(page, 'ls');
  results.ls_bare_in_cert_prep = await outText(page);

  const otherCat = appsData.find(a => a.category !== 'cert-prep').category;
  await clearOut(page);
  await type(page, 'ls ' + otherCat);
  results.ls_arg_other_category = (await outText(page)).slice(0, 500);
  results.otherCatChosen = otherCat;

  const otherCatApp = appsData.find(a => a.category === otherCat);
  await clearOut(page);
  await type(page, 'search ' + otherCatApp.id.split('-')[0]);
  results.search_while_in_cert_prep = (await outText(page)).slice(0, 500);
  results.searchTermUsed = otherCatApp.id.split('-')[0];

  for (const c of ['cd ..', 'cd cert-prep', 'cd /', 'cd cert-prep', 'cd ~', 'cd cert-prep', 'cd']) {
    await clearOut(page);
    await type(page, c);
    results['cd_variant__' + c + '_run' + Math.random().toString(36).slice(2,5)] = await outText(page);
  }

  for (const p of ['run','ls','search','cd','info','man']) {
    await clearOut(page);
    await type(page, 'man ' + p);
    results['man_' + p] = await outText(page);
  }

  await clearOut(page);
  await type(page, 'man ' + appsData[0].id);
  results.man_app_fallthrough = (await outText(page)).slice(0, 800);
  results.man_app_id_used = appsData[0].id;
  await clearOut(page);
  await type(page, 'info ' + appsData[0].id);
  results.info_direct_compare = (await outText(page)).slice(0, 800);

  await clearOut(page);
  await type(page, 'man');
  results.man_bare_list = await outText(page);
  await clearOut(page);
  await type(page, 'help');
  results.help_output = await outText(page);

  await page.close();

  // ================= Session 2: run's global reach, capture pre-navigation output =================
  const page2 = await freshPage(browser);
  await type(page2, 'cd cert-prep');
  await clearOut(page2);
  page2.once('framenavigated', () => {});
  // type command but poll output text every 10ms up to 300ms, stop as soon as we see something or nav happens
  await page2.focus('#cmd');
  await page2.type('#cmd', 'run ' + outOfScope.id);
  await page2.keyboard.press('Enter');
  let captured = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 15));
    try {
      captured = await page2.evaluate(() => document.getElementById('out') ? document.getElementById('out').innerText : null);
    } catch(e) { captured = '(context destroyed - navigation in progress: ' + e.message + ')'; break; }
    if (captured) break;
  }
  results.run_outOfScope_capturedOutput = captured;
  results.run_outOfScope_finalURL = page2.url();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
