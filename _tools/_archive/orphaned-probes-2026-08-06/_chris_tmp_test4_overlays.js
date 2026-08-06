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

  // Trigger game over (state-forced reach is acceptable per instructions, but verify overlay RENDERS pixel-wise)
  await page.evaluate(() => { if (typeof triggerGameOver === 'function') triggerGameOver(); });
  await new Promise(r => setTimeout(r, 200));
  const goState = await page.evaluate(() => {
    const el = document.getElementById('gameOverScreen');
    const cs = window.getComputedStyle(el);
    return {hidden: el.classList.contains('hidden'), display: cs.display};
  });
  console.log('GameOver overlay state:', JSON.stringify(goState));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/5_gameover.png'});
  const efpGO = await page.evaluate(() => {
    const el = document.getElementById('gameOverScreen');
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const hit = document.elementFromPoint(cx, cy);
    return {hitId: hit.id, hitCls: hit.className};
  });
  console.log('elementFromPoint over gameOverScreen center:', JSON.stringify(efpGO));

  // reload fresh for victory test
  await page.goto('http://localhost:8934/houses/shield/games/shield-contra.applet.html', {waitUntil: 'networkidle0'});
  await page.evaluate(() => { if (typeof startGame === 'function') startGame(); });
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.down('Space');
  await new Promise(r => setTimeout(r, 50));
  await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => { if (typeof triggerVictory === 'function') triggerVictory(); });
  await new Promise(r => setTimeout(r, 200));
  const vState = await page.evaluate(() => {
    const el = document.getElementById('victoryScreen');
    const cs = window.getComputedStyle(el);
    return {hidden: el.classList.contains('hidden'), display: cs.display};
  });
  console.log('Victory overlay state:', JSON.stringify(vState));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/6_victory.png'});

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));
  await browser.close();
})();
