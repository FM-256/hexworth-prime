const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('AccessGuard.js') || req.url().includes('FirebaseAuth.js') || req.url().includes('firebase')) {
      req.abort();
    } else { req.continue(); }
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  for (const vp of [{width:1366,height:768},{width:1440,height:900},{width:1536,height:864},{width:1920,height:1080}]) {
    await page.setViewport(vp);
    await page.goto(fileUrl, {waitUntil:'networkidle0', timeout:15000}).catch(e=>{});
    const pos = await page.evaluate(() => getComputedStyle(document.querySelector('.term-dock')).position);
    // Now scroll to where step2 paragraph is, and see if term-dock (button) is within viewport
    const info = await page.evaluate(() => {
      const paras = Array.from(document.querySelectorAll('p'));
      const stepPara = paras.find(p => p.textContent.includes('Record the attachment') && p.textContent.includes('Now press'));
      stepPara.scrollIntoView({block:'center'});
      const btn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Record the attachment');
      const br = btn.getBoundingClientRect();
      const vh = window.innerHeight;
      return { btnTop: br.top, btnBottom: br.bottom, viewportHeight: vh, visibleInViewport: br.bottom > 0 && br.top < vh };
    });
    console.log(vp, 'term-dock position:', pos, JSON.stringify(info));
  }
  await browser.close();
})();
