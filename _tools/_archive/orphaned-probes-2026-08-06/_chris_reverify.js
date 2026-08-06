const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('FluxCapacitor.js')) return req.respond({status: 200, contentType: 'application/javascript', body: '// blocked for headless QC clarity only'});
    req.continue();
  });

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + err.message));
  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('syncClassProgress')) {
      consoleErrors.push('HTTP ' + resp.status() + ' ' + resp.url());
    }
  });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });

  const widths = [1440, 1280, 900, 768, 414, 390, 360, 320];
  const results = {};

  for (const w of widths) {
    await page.setViewport({width: w, height: 900});
    await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0', timeout: 30000});
    await new Promise(r => setTimeout(r, 250));

    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const card = document.querySelectorAll('section.card')[0];
      const table = card.querySelector('table');
      const cRect = card.getBoundingClientRect();
      const tRect = table.getBoundingClientRect();
      const cs = getComputedStyle(card);
      const tableCs = getComputedStyle(table);
      const cardPaddingBoxRight = cRect.right - parseFloat(cs.paddingRight);
      // check every pre for internal overflow too
      const pres = Array.from(document.querySelectorAll('pre'));
      const preOverflow = pres.map(p => p.scrollWidth > p.clientWidth + 1);
      const anyPreOverflow = preOverflow.some(Boolean);
      // check all cards for boundary bleed, not just card0
      const cards = Array.from(document.querySelectorAll('section.card'));
      const cardBleeds = cards.map(c => {
        const r = c.getBoundingClientRect();
        const s = getComputedStyle(c);
        const pbRight = r.right - parseFloat(s.paddingRight);
        // find max right edge of any descendant
        let maxRight = 0;
        c.querySelectorAll('*').forEach(el => {
          const er = el.getBoundingClientRect();
          if (er.width > 0) maxRight = Math.max(maxRight, er.right);
        });
        return { cardBorderRight: r.right, cardPaddingBoxRight: pbRight, maxDescendantRight: maxRight, bleedPastBorder: maxRight - r.right, bleedPastPaddingBox: maxRight - pbRight };
      });
      return {
        docScrollWidth: de.scrollWidth,
        docClientWidth: de.clientWidth,
        docOverflow: de.scrollWidth - de.clientWidth,
        tableLayout: tableCs.tableLayout,
        cardBorderRight: cRect.right,
        cardPaddingBoxRight,
        tableRight: tRect.right,
        tableBleedPastCard: tRect.right - cardPaddingBoxRight,
        anyPreOverflow,
        cardBleeds,
        trCount: document.querySelectorAll('table tbody tr').length,
        liCount: document.querySelectorAll('.examples ol li').length,
      };
    });
    results[w] = m;
  }

  // desktop column proportion check (auto vs equal) at 1440
  await page.setViewport({width: 1440, height: 900});
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 250));
  const colWidths1440 = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('table thead th'));
    return ths.map(th => th.getBoundingClientRect().width);
  });

  // content wrap check: confirm long query text fully present (no truncation) at 320
  await page.setViewport({width: 320, height: 1600});
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 250));
  const contentCheck320 = await page.evaluate(() => {
    const pres = Array.from(document.querySelectorAll('pre'));
    const texts = pres.map(p => p.textContent.trim());
    const tds = Array.from(document.querySelectorAll('table td code'));
    const tdTexts = tds.map(t => t.textContent.trim());
    return { preCount: pres.length, texts, tdTexts };
  });

  console.log('=== PER-WIDTH RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('=== 1440 DESKTOP COLUMN WIDTHS (should be non-equal/proportional, auto layout) ===');
  console.log(JSON.stringify(colWidths1440));
  console.log('=== 320px CONTENT CHECK ===');
  console.log(JSON.stringify(contentCheck320, null, 2));
  console.log('=== CONSOLE/NETWORK ERRORS (all widths combined) ===');
  console.log(JSON.stringify(consoleErrors, null, 2));

  await browser.close();
})();
