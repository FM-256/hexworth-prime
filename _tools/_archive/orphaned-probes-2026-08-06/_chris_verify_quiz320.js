const puppeteer = require('puppeteer');
const BASE = 'http://localhost:8917';

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type()==='error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: '+err.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.setViewport({width:320, height:900});
  await page.goto(`${BASE}/houses/dark-arts/quizzes/dark-arts-feh-02.quiz.html`, {waitUntil:'networkidle2', timeout:30000});

  for (const delay of [200, 1000, 2000, 4000, 6000]) {
    await new Promise(r=>setTimeout(r, delay===200?200: delay-  (delay===200?0: [200,1000,2000,4000,6000][[200,1000,2000,4000,6000].indexOf(delay)-1]||0)));
  }
  await new Promise(r=>setTimeout(r,5000));

  const data = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const docWidth = document.documentElement.scrollWidth;
    let offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > viewportWidth + 1) {
        offenders.push({
          tag: el.tagName,
          id: el.id,
          cls: (typeof el.className==='string'? el.className : ''),
          right: Math.round(r.right),
          width: Math.round(r.width),
          overflowAmt: Math.round(r.right - viewportWidth)
        });
      }
    });
    const qc = document.getElementById('quiz-container');
    const qcRect = qc ? qc.getBoundingClientRect() : null;
    return { viewportWidth, docWidth, offenders: offenders.slice(0,20), qcWidth: qcRect? Math.round(qcRect.width): null };
  });
  console.log(JSON.stringify(data, null, 2));
  console.log("CONSOLE ERRORS:", JSON.stringify(consoleErrors));
  await browser.close();
})();
