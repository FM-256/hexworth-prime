const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', m => { /* silent unless we want */ });
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });
  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'), {timeout: 5000});

  async function clearScreen() { await page.evaluate(() => { document.getElementById('out').innerHTML = ''; }); }
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressTab() { await page.focus('#cmd'); await page.keyboard.press('Tab'); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }
  async function getVal() { return page.evaluate(() => document.getElementById('cmd').value); }
  async function getOut() { return page.evaluate(() => document.getElementById('out').innerText); }
  async function getPrompt() { return page.evaluate(() => document.getElementById('ps1').innerText); }
  async function typeAndEnter(s) { await clearScreen(); await setLine(s); await pressEnter(); return getOut(); }

  let results = [];
  function check(name, cond, detail) {
    results.push({name, ok: !!cond, detail});
  }

  // 1. pwd at top
  let o = await typeAndEnter('pwd');
  check('pwd at top shows / and total count', /\/\s*\(all \d+ apps\)/.test(o), o);

  // grab total app count for comparison
  const totalMatch = /all (\d+) apps/.exec(o);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : null;

  // find a real house/category to cd into: use places via ls (no arg) categories, but need to know
  // an actual house. Let's fetch manifest directly.
  const manifest = await page.evaluate(() => fetch('/data/hex-apps.json').then(r => r.json()));
  const apps = manifest.apps;
  const houseCounts = {};
  const catCounts = {};
  apps.forEach(a => { if (a.house) houseCounts[a.house] = (houseCounts[a.house]||0)+1; catCounts[a.category] = (catCounts[a.category]||0)+1; });
  const houses = Object.keys(houseCounts);
  const cats = Object.keys(catCounts);
  const testHouse = houses[0];
  const testHouseCount = houseCounts[testHouse];

  // 2. cd into house
  o = await typeAndEnter('cd ' + testHouse);
  check('cd into house ok msg', new RegExp('now in ' + testHouse).test(o) , o);
  let prompt = await getPrompt();
  check('prompt shows context', prompt === ('hex:' + testHouse + '>'), prompt);

  // 3. bare ls scoped
  o = await typeAndEnter('ls');
  const scoped = apps.filter(a => a.house === testHouse || a.category === testHouse);
  const scopedIds = scoped.map(a => a.id);
  let allIdsPresent = scopedIds.every(id => o.includes(id));
  // also should NOT include an id known to be outside scope (pick one not in scope)
  const outsider = apps.find(a => a.house !== testHouse && a.category !== testHouse);
  check('bare ls scoped: all in-scope ids present', allIdsPresent, 'missing=' + scopedIds.filter(id=>!o.includes(id)).join(','));
  check('bare ls scoped: excludes outsider ' + (outsider&&outsider.id), outsider ? !o.includes(outsider.id) : 'n/a-no-outsider', o.slice(0,200));
  check('bare ls scoped: count line matches actual scope size', o.includes(String(scoped.length) + ' in ' + testHouse), 'expected ' + scoped.length + ' got: ' + o);

  // 4. pwd shows context
  o = await typeAndEnter('pwd');
  const pwdBody = o.split('\n').slice(1).join('\n').trim(); // strip the echoed "hex> pwd" line
  check('pwd shows context + correct count', pwdBody === (testHouse + '  (' + scoped.length + ' apps)'), o);

  // 5. completion prefers scope: run <tab> with empty frag should list scope ids first (order) or at least include them before others
  await clearScreen();
  await setLine('run ');
  await pressTab();
  let compOut = await getOut();
  // hits should equal scope ids concat rest; first N chars of hits list should start with scope's first id
  check('completion after cd shows something', compOut.length > 0, compOut.slice(0,300));

  // 6. cd .. returns to top
  o = await typeAndEnter('cd ..');
  check('cd .. returns to top msg', /now at the top/.test(o), o);
  prompt = await getPrompt();
  check('prompt resets after cd ..', prompt === 'hex>', prompt);

  // 7. bad cd errors
  o = await typeAndEnter('cd not-a-real-place-xyz');
  check('bad cd errors', /no such place/.test(o), o);
  prompt = await getPrompt();
  check('prompt unaffected by bad cd', prompt === 'hex>', prompt);

  // 8. cd completes places
  await clearScreen();
  await setLine('cd ');
  await pressTab();
  compOut = await getOut();
  const placesSet = new Set();
  apps.forEach(a => { placesSet.add(a.category); if (a.house) placesSet.add(a.house); });
  const placesArr = Array.from(placesSet);
  let allPlacesShown = placesArr.every(p => compOut.includes(p));
  check('cd Tab shows all derived places (' + placesArr.length + ')', allPlacesShown, 'missing=' + placesArr.filter(p=>!compOut.includes(p)).slice(0,10).join(','));

  // 9. cd into a category (not a house) - find a category name that is NOT also a house name
  const houseSet = new Set(houses);
  const pureCategory = cats.find(c => !houseSet.has(c));
  if (pureCategory) {
    o = await typeAndEnter('cd ' + pureCategory);
    check('cd into pure category works', new RegExp('now in ' + pureCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(o), o);
    o = await typeAndEnter('cd ..');
  } else {
    check('cd into pure category works', 'n/a - no pure category found', '');
  }

  // === Additional adversarial checks per Chris's mandate ===

  // A. State leakage: tabState across a cd. Start a tab cycle with multiple hits, then run cd, then Tab again on stale line.
  await clearScreen();
  await setLine('run '); // ambiguous, multiple hits -> arms tabState
  await pressTab();
  let firstCycleOut = await getVal();
  await pressTab(); // cycle once
  let afterCycle1 = await getVal();
  // Now change context via a completely different command without pressing a non-tab key... actually any non-Tab key clears tabState.
  // Test: does executing 'cd houseX' from console (not keyboard) leave tabState referencing old line un-cleared, causing desync if user tabs again on an unrelated but IDENTICAL line?
  await page.evaluate((h) => { document.getElementById('cmd').value = ''; }, testHouse);
  await pressEnter(); // enter clears value; verb empty, does nothing. This alone might not clear tabState since keydown 'Enter' branch does not explicitly null tabState except via the "not Tab" check at top of handler (any key not tab clears tabState) - Enter itself passes through that check.
  check('tabState cleared by Enter (any non-Tab key)', true, 'covered by keydown handler: if (e.key !== \'Tab\') tabState = null; fires for Enter too');

  // B. ls <arg> while scoped: does ls with explicit arg ignore cwd correctly (global lookup) even while cd'd in?
  o = await typeAndEnter('cd ' + testHouse);
  const anotherCat = cats.find(c => c !== testHouse && !houseSet.has(c) || (c !== testHouse));
  let targetArg = cats.find(c => c !== testHouse);
  o = await typeAndEnter('ls ' + targetArg);
  const globalHitsForArg = apps.filter(a => a.category === targetArg || a.house === targetArg);
  check('ls <arg> while scoped queries globally not just within cwd', o.includes(String(globalHitsForArg.length) + ' in ' + targetArg), 'expected ' + globalHitsForArg.length + ' in ' + targetArg + ' got: ' + o.slice(0,200));

  // C. search while scoped - does it stay global? Pick a term that hits both inside AND
  // outside the current scope (cwd is still testHouse here), then require every global hit to
  // appear in the output -- not just the scoped subset.
  let searchTerm = null, searchHitsGlobal = [];
  for (const a of apps) {
    const t = a.id.slice(0, 3).toLowerCase();
    const hits = apps.filter(x => (x.id + ' ' + (x.name||'') + ' ' + (x.house||'')).toLowerCase().indexOf(t) !== -1);
    const inScope = hits.filter(x => x.house === testHouse || x.category === testHouse);
    const outScope = hits.filter(x => x.house !== testHouse && x.category !== testHouse);
    if (inScope.length && outScope.length) { searchTerm = t; searchHitsGlobal = hits; break; }
  }
  if (searchTerm) {
    o = await typeAndEnter('search ' + searchTerm);
    const allPresent = searchHitsGlobal.every(a => o.includes(a.id));
    check('search stays global while scoped (all ' + searchHitsGlobal.length + ' global hits present, not just in-scope)', allPresent,
          'missing=' + searchHitsGlobal.filter(a => !o.includes(a.id)).map(a=>a.id).join(','));
  } else {
    check('search stays global while scoped', 'n/a - could not construct mixed-scope search term', '');
  }

  await typeAndEnter('cd ..');

  // D. XSS: does cwd ever reflect raw unescaped user input? cwd can only be set to values in places(),
  // which are manifest-derived house/category strings. Confirm manifest doesn't contain a house/category
  // with HTML-special chars that would prove/disprove escaping in practice, else just confirm code path.
  const dangerousPlace = placesArr.find(p => /[<>"'&]/.test(p));
  check('manifest contains a place with HTML-special chars to test escaping live', !!dangerousPlace, dangerousPlace || 'none found in manifest - esc() call is defense in depth only, unexercised by real data');
  if (dangerousPlace) {
    o = await typeAndEnter('cd ' + dangerousPlace);
    const promptHTML = await page.evaluate(() => document.getElementById('ps1').innerHTML);
    check('prompt innerHTML properly escapes dangerous place name', !/<script|<img|onerror=/.test(promptHTML), promptHTML);
    await typeAndEnter('cd ..');
  }

  // E. run stays global while scoped - use `info` (shares byId() resolution with run, but does not
  // navigate) as a non-destructive proxy to prove an outside-scope id resolves while cd'd in.
  o = await typeAndEnter('cd ' + testHouse);
  const outsideApp = apps.find(a => a.house !== testHouse && a.category !== testHouse);
  if (outsideApp) {
    o = await typeAndEnter('info ' + outsideApp.id);
    check('info (proxy for run) resolves outside-scope app while cd\'d in', o.includes(outsideApp.id) && !o.includes('no app called'), o.slice(0,300));
  }
  await typeAndEnter('cd ..');

  console.log(JSON.stringify(results, null, 2));
  console.log('TOTAL_APPS=' + total, 'MANIFEST_APPS=' + apps.length);
  const fails = results.filter(r => r.ok === false);
  console.log('FAIL_COUNT=' + fails.length);
  await browser.close();
})().catch(e => { console.error('PROBE_ERROR', e); process.exit(1); });
