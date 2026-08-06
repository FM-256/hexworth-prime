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
  await page.evaluate(() => { if (typeof startGame === 'function') startGame(); });
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.down('Space');
  await new Promise(r => setTimeout(r, 50));
  await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 200));
  // remove invincibility grace quickly by waiting, then just walk right into enemies without shooting, real key input
  await page.keyboard.down('ArrowRight');

  let overlayShown = false;
  let frames = 0;
  const maxMs = 25000;
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise(r => setTimeout(r, 150));
    frames++;
    const s = await page.evaluate(() => ({lives, stageState, dead: player.dead, goHidden: document.getElementById('gameOverScreen').classList.contains('hidden')}));
    if (!s.goHidden) { overlayShown = true; console.log('Game over triggered naturally at frame', frames, JSON.stringify(s)); break; }
    if (frames % 10 === 0) console.log('tick', frames, JSON.stringify(s));
  }
  await page.keyboard.up('ArrowRight');

  if (overlayShown) {
    await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/7_natural_gameover.png'});
    const efp = await page.evaluate(() => {
      const el = document.getElementById('gameOverScreen');
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
      const hit = document.elementFromPoint(cx, cy);
      return {hitId: hit.id};
    });
    console.log('Natural gameover elementFromPoint:', JSON.stringify(efp));
  } else {
    console.log('Did not naturally lose within time budget (player may be too good at surviving via collision non-lethal contact) - not necessarily a bug.');
  }

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));
  await browser.close();
})();
