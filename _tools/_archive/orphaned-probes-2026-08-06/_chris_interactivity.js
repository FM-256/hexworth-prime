const puppeteer = require('puppeteer');
const BASE = 'http://localhost:8917';

async function newPage(browser) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', msg => { if (msg.type()==='error') errs.push(msg.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.setViewport({width:1440, height:900});
  return {page, errs};
}

(async () => {
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
  const out = {};

  // FILE1
  {
    const {page, errs} = await newPage(browser);
    await page.goto(`${BASE}/houses/dark-arts/games/dark-osint-recon-lab.applet.html`, {waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,500));
    const before = await page.evaluate(() => document.querySelector('.challenge-panel.active')?.id || null);
    // click view-source toggle
    const toggleExists = await page.evaluate(() => !!document.querySelector('.toggle-btn'));
    let sourceToggled = null;
    if (toggleExists) {
      const beforeHTML = await page.evaluate(() => document.querySelector('.toggle-btn').closest('div, section')?.innerHTML.length || 0);
      await page.click('.toggle-btn');
      await new Promise(r=>setTimeout(r,300));
      const afterState = await page.evaluate(() => {
        const btn = document.querySelector('.toggle-btn');
        return btn ? btn.textContent.trim() : null;
      });
      sourceToggled = afterState;
    }
    // click a radio
    const radioSel = 'input[name="q1"][value="c"]';
    const radioExists = await page.evaluate((sel) => !!document.querySelector(sel), radioSel);
    let radioChecked = false;
    if (radioExists) {
      await page.click(radioSel);
      radioChecked = await page.evaluate((sel) => document.querySelector(sel).checked, radioSel);
    }
    // challenge tab CH1 already active; try clicking CH1 tab (should stay/no error); locked ones should not switch
    await page.click('.ch-tab[data-ch="0"]');
    await new Promise(r=>setTimeout(r,300));
    const activeAfterClick0 = await page.evaluate(() => document.querySelector('.ch-tab.active')?.dataset.ch);
    await page.click('.ch-tab[data-ch="1"]'); // locked, should not activate
    await new Promise(r=>setTimeout(r,300));
    const activeAfterClickLocked = await page.evaluate(() => document.querySelector('.ch-tab.active')?.dataset.ch);

    out['FILE1'] = { toggleExists, sourceToggled, radioExists, radioChecked, activeAfterClick0, activeAfterClickLocked, consoleErrors: errs };
    await page.close();
  }

  // FILE2
  {
    const {page, errs} = await newPage(browser);
    await page.goto(`${BASE}/houses/dark-arts/labs/dark-arts-feh-02.lab.html`, {waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,500));
    const tabResults = [];
    for (let i=0;i<4;i++){
      await page.evaluate((n) => showEx(n), i);
      await new Promise(r=>setTimeout(r,200));
      const activeTabText = await page.evaluate(() => document.querySelector('.tab.active')?.textContent.trim());
      const exVisible = await page.evaluate((n) => {
        const exs = document.querySelectorAll('.ex');
        return Array.from(exs).map(e => ({display: getComputedStyle(e).display, hasActive: e.classList.contains('active')}));
      }, i);
      tabResults.push({i, activeTabText, exVisible});
    }
    // back to ex1
    await page.evaluate(() => showEx(0));
    await new Promise(r=>setTimeout(r,200));
    // terminal input + enter
    const termBefore = await page.evaluate(() => document.querySelector('#dork-in') ? true : false);
    let termOutputChanged = null;
    if (termBefore) {
      const outSelector = '#dork-in';
      // find output area near it - search for common output container ids
      await page.click('#dork-in');
      await page.type('#dork-in', 'site:meridiantech.com filetype:pdf');
      await page.keyboard.press('Enter');
      await new Promise(r=>setTimeout(r,500));
      termOutputChanged = await page.evaluate(() => {
        // look for a results/output element near dork-in
        const candidates = document.querySelectorAll('[id*="dork"], [id*="output"], [id*="result"], .term-output, .terminal-output');
        return Array.from(candidates).map(c => ({id: c.id, cls: c.className, text: c.textContent.slice(0,120)}));
      });
    }
    // check answers ex1
    const checkBefore = await page.evaluate(() => document.body.innerHTML.length);
    await page.evaluate(() => checkEx1());
    await new Promise(r=>setTimeout(r,400));
    const checkAfter = await page.evaluate(() => {
      const feedback = document.querySelectorAll('.feedback, .result, [class*="correct"], [class*="incorrect"], [class*="wrong"]');
      return Array.from(feedback).slice(0,10).map(f => ({cls: f.className, text: f.textContent.slice(0,80), display: getComputedStyle(f).display}));
    });

    out['FILE2'] = { tabResults, termBefore, termOutputChanged, checkAfter, consoleErrors: errs };
    await page.close();
  }

  // FILE3
  {
    const {page, errs} = await newPage(browser);
    await page.goto(`${BASE}/houses/dark-arts/quizzes/dark-arts-feh-02.quiz.html`, {waitUntil:'networkidle2'});
    await new Promise(r=>setTimeout(r,1000));
    const optExists = await page.evaluate(() => !!document.querySelector('.quiz-option'));
    let clicked = false, questionChanged = null;
    if (optExists) {
      const beforeQ = await page.evaluate(() => document.querySelector('.quiz-question, .question-text, h2, h3')?.textContent.trim().slice(0,80));
      await page.click('.quiz-option');
      clicked = true;
      await new Promise(r=>setTimeout(r,1200));
      const afterQ = await page.evaluate(() => document.querySelector('.quiz-question, .question-text, h2, h3')?.textContent.trim().slice(0,80));
      const selectedState = await page.evaluate(() => {
        const opt = document.querySelector('.quiz-option.selected, .quiz-option.chosen, .quiz-option[aria-checked="true"]');
        return opt ? opt.textContent.slice(0,60) : 'no .selected/.chosen found';
      });
      questionChanged = { beforeQ, afterQ, selectedState };
    }
    out['FILE3'] = { optExists, clicked, questionChanged, consoleErrors: errs };
    await page.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
