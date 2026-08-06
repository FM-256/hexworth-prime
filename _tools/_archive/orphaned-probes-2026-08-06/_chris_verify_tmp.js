const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8917';
const widths = [320, 390, 768, 1440, 1920, 2560, 3440];

const targets = [
  {
    name: 'FILE1 dark-osint-recon-lab.applet.html',
    url: `${BASE}/houses/dark-arts/games/dark-osint-recon-lab.applet.html`,
    mainSel: 'main'
  },
  {
    name: 'FILE2 dark-arts-feh-02.lab.html',
    url: `${BASE}/houses/dark-arts/labs/dark-arts-feh-02.lab.html`,
    mainSel: '.ex.active, .ex'
  },
  {
    name: 'FILE3 dark-arts-feh-02.quiz.html',
    url: `${BASE}/houses/dark-arts/quizzes/dark-arts-feh-02.quiz.html`,
    mainSel: '#quiz-container, .quiz-engine'
  }
];

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const results = {};

  for (const t of targets) {
    results[t.name] = { widths: {}, consoleErrors: [], overflow: {} };
    for (const w of widths) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('syncClassProgress') && !text.includes('401')) {
            consoleErrors.push(text);
          }
        }
      });
      page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + err.message));

      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('hexworth_house', 'dark-arts');
        localStorage.setItem('hexworth_tourist_active', 'true');
      });

      await page.setViewport({width: w, height: 900});
      try {
        await page.goto(t.url, {waitUntil: 'networkidle2', timeout: 30000});
      } catch (e) {
        results[t.name].widths[w] = { error: e.message };
        await page.close();
        continue;
      }
      await new Promise(r => setTimeout(r, 800));

      const data = await page.evaluate((sel) => {
        const docWidth = document.documentElement.scrollWidth;
        const viewportWidth = window.innerWidth;
        const overflowAmount = docWidth - viewportWidth;
        let mainWidth = null, mainSelUsed = null;
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const style = getComputedStyle(el);
          if (style.display !== 'none' && el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            mainWidth = Math.round(rect.width);
            mainSelUsed = el.className || el.tagName;
            break;
          }
        }
        // check any element wider than viewport
        let worstOverflowEl = null, worstOverflowAmt = 0;
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > viewportWidth + 1) {
            const amt = r.right - viewportWidth;
            if (amt > worstOverflowAmt) {
              worstOverflowAmt = amt;
              worstOverflowEl = (el.id ? '#'+el.id : '') + (el.className && typeof el.className === 'string' ? '.'+el.className.split(' ').join('.') : '') + ' <' + el.tagName + '>';
            }
          }
        });
        return { docWidth, viewportWidth, overflowAmount, mainWidth, mainSelUsed, worstOverflowEl, worstOverflowAmt: Math.round(worstOverflowAmt) };
      }, t.mainSel);

      results[t.name].widths[w] = data;
      if (consoleErrors.length) {
        results[t.name].consoleErrors.push({ width: w, errors: consoleErrors });
      }
      await page.close();
    }
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
