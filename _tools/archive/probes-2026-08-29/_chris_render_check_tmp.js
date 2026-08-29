const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Abort AccessGuard.js and other auth-blocking requests
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('AccessGuard.js') || url.includes('FirebaseAuth.js') || url.includes('ModuleProgress.js') || url.includes('SandboxLauncher.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: '/* stubbed */' });
    } else {
      req.continue();
    }
  });

  const widths = [1920, 2560, 1366];
  for (const w of widths) {
    await page.setViewport({ width: w, height: 1080 });
    await page.goto('http://localhost:8791/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'networkidle0' });

    const metrics = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const viewportWidth = window.innerWidth;
      const hasHScroll = docWidth > viewportWidth;
      const wrap = document.querySelector('.wrap');
      const wrapRect = wrap.getBoundingClientRect();
      const cards = [...document.querySelectorAll('.card')].map(c => c.getBoundingClientRect().width);
      const brief = document.querySelector('.brief').getBoundingClientRect();
      const modeNote = document.querySelector('.mode-note').getBoundingClientRect();
      const briefP = document.querySelector('.brief > p');
      const modeNoteP = document.querySelector('.mode-note > p');
      const briefPWidth = briefP ? briefP.getBoundingClientRect().width : null;
      const modeNotePWidth = modeNoteP ? modeNoteP.getBoundingClientRect().width : null;
      const cols = document.querySelector('.cols');
      const colsDisplay = getComputedStyle(cols).display;
      const colsGTC = getComputedStyle(cols).gridTemplateColumns;
      const header = document.querySelector('.header');
      const headerRect = header.getBoundingClientRect();
      // check any element extends beyond viewport
      const allEls = [...document.querySelectorAll('body *')];
      let maxRight = 0, offenders = [];
      for (const el of allEls) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > maxRight) maxRight = r.right;
        if (r.right > viewportWidth + 1) offenders.push({tag: el.tagName, cls: el.className, right: r.right});
      }
      return { docWidth, viewportWidth, hasHScroll, wrapWidth: wrapRect.width, cardWidths: [...new Set(cards.map(c=>Math.round(c)))], briefWidth: brief.width, modeNoteWidth: modeNote.width, briefPWidth, modeNotePWidth, colsDisplay, colsGTC, headerRight: headerRect.right, maxRight, offendersCount: offenders.length, offendersSample: offenders.slice(0,5) };
    });
    console.log(`\n=== width ${w} ===`);
    console.log(JSON.stringify(metrics, null, 2));

    await page.screenshot({ path: `/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/render_${w}.png`, fullPage: false });
    await page.screenshot({ path: `/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/render_${w}_full.png`, fullPage: true });
  }

  await browser.close();
})();
