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

  // Real play: move right and shoot repeatedly for several seconds, sample score
  await page.keyboard.down('ArrowRight');
  let scoreSamples = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.down('KeyZ');
    await new Promise(r => setTimeout(r, 30));
    await page.keyboard.up('KeyZ');
    await new Promise(r => setTimeout(r, 80));
    const s = await page.evaluate(() => ({score, worldX: Math.round(worldX), lives, stageState, enemyCount: enemies.filter(e=>!e.dead).length}));
    scoreSamples.push(s);
  }
  await page.keyboard.up('ArrowRight');
  console.log('Play samples (every ~5):', JSON.stringify(scoreSamples.filter((_,i)=>i%5===0)));
  console.log('Final sample:', JSON.stringify(scoreSamples[scoreSamples.length-1]));

  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/4_midplay.png'});

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));
  await browser.close();
})();
