const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,2000));
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = h1 ? h1.parentElement.querySelector('p') : null;
    if (!p) return { found: false };
    const r = p.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const topEl = document.elementFromPoint(cx, cy);
    return {
      found: true,
      text: p.textContent.trim(),
      rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
      zIndex: getComputedStyle(p).zIndex,
      elementFromPointIsP: topEl === p || p.contains(topEl) || (topEl && topEl.contains(p)),
      elementFromPointTag: topEl ? (topEl.tagName + '.' + topEl.className) : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  const shotPath = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots/home-mobile-top.png';
  await page.screenshot({ path: shotPath, clip: { x:0, y:0, width:390, height:400 } });
  await browser.close();
})();
