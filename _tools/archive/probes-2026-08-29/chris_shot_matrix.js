const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 900 });
  const filePath = 'file://' + require('path').resolve('_app/career/career-paths.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  // find matrix card
  const cardHandle = await page.evaluateHandle(() => {
    const cards = Array.from(document.querySelectorAll('.house-card, [data-house], .card'));
    return cards.find(c => c.textContent.includes('Matrix')) || null;
  });
  if (cardHandle && cardHandle.asElement()) {
    await cardHandle.asElement().screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/matrix-card.png' });
    console.log('SAVED CARD SHOT');
  } else {
    console.log('CARD NOT FOUND, full page shot instead');
    await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/full-page.png', fullPage: true });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('horizontal overflow:', overflow);
  await browser.close();
})();
