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
  await page.keyboard.down('Space'); await new Promise(r=>setTimeout(r,50)); await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 200));

  // Fast-forward to boss then kill it (state-forcing to REACH late content is allowed)
  await page.evaluate(() => { worldX = 2699; });
  await new Promise(r => setTimeout(r, 300)); // update() loop should spawnBoss
  await page.evaluate(() => { if (boss) { boss.hp = 0; } });
  await new Promise(r => setTimeout(r, 500)); // boss.dead check + advanceStage happens in update loop on hit-detect; may need to nudge

  let s = await page.evaluate(() => ({stageState, hasBoss: !!boss, bossDead: boss ? boss.dead : null, currentStage}));
  console.log('after boss hp=0:', JSON.stringify(s));

  // If boss.dead isn't auto-triggering advanceStage (it's set within a bullet-hit check), directly call advanceStage/loadStage per allowed state-forcing to reach content
  if (s.stageState !== 'cleared' && s.currentStage === 0) {
    await page.evaluate(() => { if (typeof advanceStage === 'function') advanceStage(); });
  }
  await new Promise(r => setTimeout(r, 2500)); // advanceStage has 2200ms timeout to loadStage(next)

  s = await page.evaluate(() => ({stageState, currentStage, announceHidden: document.getElementById('stageAnnounce').classList.contains('hidden')}));
  console.log('after advanceStage + wait:', JSON.stringify(s));

  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/8_stage2_announce.png'});

  const efpBefore = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left+rect.width/2, rect.top+rect.height/2);
    return {id: el.id, cls: el.className};
  });
  console.log('Stage2 announce - elementFromPoint at canvas center (should be briefing, not canvas):', JSON.stringify(efpBefore));

  // dismiss again
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.down('Space'); await new Promise(r=>setTimeout(r,50)); await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 300));

  const efpAfter = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left+rect.width/2, rect.top+rect.height/2);
    return {id: el.id, cls: el.className, stageState};
  });
  console.log('Stage2 after 2nd dismiss - elementFromPoint at canvas center (should be canvas):', JSON.stringify(efpAfter));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/9_stage2_dismissed.png'});

  console.log('CONSOLE ERRORS SO FAR:', JSON.stringify(errors));
  await browser.close();
})();
