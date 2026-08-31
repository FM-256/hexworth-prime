const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  // unsorted visitor
  const page = await browser.newPage();
  await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
  await new Promise(r=>setTimeout(r,800));
  const info = await page.evaluate(() => {
    const callout = document.getElementById('hexosCallout');
    const menuLink = Array.from(document.querySelectorAll('#navMenu a, nav a')).find(a => a.textContent.includes('Hex OS'));
    return {
      finalUrl: location.href,
      calloutDisplay: callout ? getComputedStyle(callout).display : 'NOT FOUND',
      menuLinkExists: !!menuLink,
      menuLinkHref: menuLink ? menuLink.getAttribute('href') : null,
      menuLinkVisible: menuLink ? (getComputedStyle(menuLink).display !== 'none') : null,
    };
  });
  console.log('UNSORTED VISITOR ON DASHBOARD:', JSON.stringify(info, null, 2));
  await browser.close();
})();
