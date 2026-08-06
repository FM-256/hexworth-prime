const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.setViewport({width: 390, height: 1400});
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/full-390.png', fullPage: true});

  // zoom into card 0 (table) and card 2 (examples) bounding boxes
  const cards = await page.$$('section.card');
  const box0 = await cards[0].boundingBox();
  const box2 = await cards[2].boundingBox();
  console.log('card0 box', box0);
  console.log('card2 box', box2);

  await cards[0].screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/card0-390.png'});
  await cards[2].screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/card2-390.png'});

  // Also check which specific element inside card0/card2 is the overflow culprit
  const culprit = await page.evaluate(() => {
    function findOverflowChild(container) {
      const results = [];
      const all = container.querySelectorAll('*');
      const cRect = container.getBoundingClientRect();
      all.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > cRect.right + 1 || r.left < cRect.left - 1) {
          results.push({tag: el.tagName, cls: el.className, left: r.left, right: r.right, containerLeft: cRect.left, containerRight: cRect.right, text: el.textContent.slice(0,60)});
        }
      });
      return results;
    }
    const cards = document.querySelectorAll('section.card');
    return {
      card0: findOverflowChild(cards[0]),
      card2: findOverflowChild(cards[2])
    };
  });
  console.log(JSON.stringify(culprit, null, 2));

  await browser.close();
})();
