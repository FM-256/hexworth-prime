const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('firebase')) req.abort();
    else req.continue();
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  await page.setViewport({width:1366,height:768});
  await page.goto(fileUrl, {waitUntil:'networkidle0', timeout:15000});
  const info = await page.evaluate(() => {
    const wrapper = document.querySelector('.sandbox-launcher');
    const iframeWrap = wrapper.querySelector('.sandbox-launcher__iframe-wrap');
    const openBtn = wrapper.querySelector('.sandbox-launcher__btn--open');
    const launchBtn = wrapper.querySelector('.sandbox-launcher__btn--launch');
    launchBtn.style.display = 'none';
    openBtn.style.display = '';
    iframeWrap.style.display = '';
    wrapper.classList.add('is-embedded');
    const cs = getComputedStyle(iframeWrap);
    const rect = iframeWrap.getBoundingClientRect();
    // list all matching CSS rules for height on this element
    const sheets = Array.from(document.styleSheets);
    let matches = [];
    for (const sheet of sheets) {
      let rules;
      try { rules = sheet.cssRules; } catch(e) { continue; }
      for (const rule of rules || []) {
        if (rule.selectorText && iframeWrap.matches(rule.selectorText) && /height/.test(rule.style.cssText)) {
          matches.push({selector: rule.selectorText, cssText: rule.style.cssText, href: sheet.href||'inline'});
        }
      }
    }
    return { computedHeight: cs.height, rectHeight: rect.height, matches, dockRectHeight: document.querySelector('.term-dock').getBoundingClientRect().height };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
