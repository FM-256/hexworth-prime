const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Seed localStorage as a SORTED visitor before navigation (house set)
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'cortex');
  });

  const filePath = 'file://' + path.resolve('_app/dashboard.html');
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 20000 }).catch(e => console.log('nav warn:', e.message));

  await new Promise(r => setTimeout(r, 1500));

  const result = await page.evaluate(() => {
    const callout = document.querySelector('.hexos-callout');
    const hbLink = Array.from(document.querySelectorAll('.hb-link')).find(a => a.textContent.includes('Hex OS'));
    const getStyle = (el) => el ? window.getComputedStyle(el) : null;
    const cs = getStyle(callout);
    return {
      calloutExists: !!callout,
      calloutVisible: callout ? (cs.display !== 'none' && cs.visibility !== 'hidden') : false,
      calloutDisplay: cs ? cs.display : null,
      calloutHref: callout ? callout.getAttribute('href') : null,
      calloutHasIdAttr: callout ? callout.hasAttribute('id') : null,
      hbLinkExists: !!hbLink,
      hbLinkHref: hbLink ? hbLink.getAttribute('href') : null,
      adminGroupDisplay: (() => { const ag = document.getElementById('adminMenuGroup'); return ag ? window.getComputedStyle(ag).display : 'NOT FOUND'; })(),
      bodyHTML_hasSortingRedirectMarker: document.readyState,
      currentURL: location.href,
    };
  });
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
