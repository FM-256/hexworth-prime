const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1000, height: 800});
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'shield');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });

  await page.goto('http://localhost:8934/houses/shield/games/shield-contra.applet.html', {waitUntil: 'networkidle0'});

  // Try to find and click a start button, or call startGame directly if exposed
  await page.evaluate(() => {
    if (typeof startGame === 'function') startGame();
  });
  await new Promise(r => setTimeout(r, 200));

  const stateAfterStart = await page.evaluate(() => ({
    stageState: typeof stageState !== 'undefined' ? stageState : 'undefined',
    announceHidden: document.getElementById('stageAnnounce') ? document.getElementById('stageAnnounce').classList.contains('hidden') : 'no-el',
    announceReady: typeof announceReady !== 'undefined' ? announceReady : 'undefined',
  }));
  console.log('After startGame:', JSON.stringify(stateAfterStart));

  // Screenshot the announce screen (should be visible)
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/1_announce.png'});

  // Check elementFromPoint at canvas center BEFORE dismissing (should be the announce overlay/desc, since briefing SHOULD show)
  const beforeDismiss = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const el = document.elementFromPoint(cx, cy);
    return {tag: el.tagName, id: el.id, cls: el.className, stageState};
  });
  console.log('Before dismiss, elementFromPoint at canvas center:', JSON.stringify(beforeDismiss));

  // Wait for announceReady gate (~400ms) then press Space to dismiss
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.down('Space');
  await new Promise(r => setTimeout(r, 50));
  await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 300));

  const afterDismiss = await page.evaluate(() => {
    const el = document.getElementById('stageAnnounce');
    const cs = window.getComputedStyle(el);
    return {
      classListHidden: el.classList.contains('hidden'),
      computedDisplay: cs.display,
      stageState,
    };
  });
  console.log('After dismiss classList/computed:', JSON.stringify(afterDismiss));

  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/2_after_dismiss.png'});

  // elementFromPoint at canvas center AFTER dismiss - should be canvas
  const afterDismissEFP = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const el = document.elementFromPoint(cx, cy);
    return {tag: el.tagName, id: el.id, cls: el.className};
  });
  console.log('After dismiss, elementFromPoint at canvas center:', JSON.stringify(afterDismissEFP));

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));

  await browser.close();
})();
