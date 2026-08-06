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

  // Record player.y before pressing ArrowUp
  const before = await page.evaluate(() => ({y: player.y, onGround: player.onGround, aimDir: {...player.aimDir}, vy: player.vy}));
  console.log('Before ArrowUp:', JSON.stringify(before));

  // Hold ArrowUp for a while (real key input), check across frames that onGround stays true & no upward y movement (jump)
  await page.keyboard.down('ArrowUp');
  let samples = [];
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 40));
    const s = await page.evaluate(() => ({y: player.y, onGround: player.onGround, aimDirY: player.aimDir.y, vy: player.vy, keysUp: keys.up, keysJump: keys.jump}));
    samples.push(s);
  }
  await page.keyboard.up('ArrowUp');
  console.log('Samples while holding ArrowUp:', JSON.stringify(samples));

  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/3_aimup.png'});

  // Now test X actually jumps
  const beforeJump = await page.evaluate(() => ({y: player.y, onGround: player.onGround, vy: player.vy}));
  await page.keyboard.down('KeyX');
  await new Promise(r => setTimeout(r, 40));
  const duringJump = await page.evaluate(() => ({y: player.y, onGround: player.onGround, vy: player.vy}));
  await page.keyboard.up('KeyX');
  console.log('Before X:', JSON.stringify(beforeJump), 'During/after X:', JSON.stringify(duringJump));

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));
  await browser.close();
})();
