const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8927/houses/dark-arts';
const widths = [320, 390, 768, 1440, 1920, 2560, 3440];

async function setupBypass(page) {
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
}

async function checkOverflowAndFill(page, url, containerSelector) {
  const results = [];
  for (const w of widths) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));
    const data = await page.evaluate((sel) => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      let contW = null;
      if (sel) {
        const el = document.querySelector(sel);
        if (el) contW = el.getBoundingClientRect().width;
      }
      return { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, overflow, contW };
    }, containerSelector);
    results.push({ w, ...data });
  }
  return results;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const consoleErrors = { f1: [], f2: [], f3: [] };

  // ===== FILE 1: dark-osint-recon-lab.applet.html =====
  {
    const page = await browser.newPage();
    await setupBypass(page);
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.f1.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.f1.push(String(err)));
    const url = `${BASE}/games/dark-osint-recon-lab.applet.html`;
    const results = await checkOverflowAndFill(page, url, 'main');
    console.log('FILE1 (recon-lab) overflow/fill results:');
    console.log(JSON.stringify(results, null, 2));

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    const tabsInfo = await page.evaluate(() => document.querySelectorAll('.ch-tab').length);
    let tabSwitchOK = false;
    if (tabsInfo > 1) {
      await page.evaluate(() => { document.querySelectorAll('.ch-tab')[1].click(); });
      await new Promise(r => setTimeout(r, 200));
      tabSwitchOK = await page.evaluate(() => {
        const panels = document.querySelectorAll('.challenge-panel');
        return panels[1] && panels[1].classList.contains('active');
      });
    }

    let answerOK = false;
    const radioCount = await page.evaluate(() => document.querySelectorAll('.radio-opt input, .check-opt input').length);
    if (radioCount > 0) {
      await page.evaluate(() => { document.querySelector('.radio-opt input, .check-opt input').click(); });
      await new Promise(r => setTimeout(r, 100));
      answerOK = await page.evaluate(() => document.querySelector('.radio-opt input, .check-opt input').checked);
    }

    let toggleOK = null;
    const toggleBtnExists = await page.evaluate(() => !!document.querySelector('.toggle-btn'));
    if (toggleBtnExists) {
      await page.evaluate(() => document.querySelector('.toggle-btn').click());
      await new Promise(r => setTimeout(r, 200));
      toggleOK = true;
    }

    console.log('FILE1 interactivity:', JSON.stringify({ tabCount: tabsInfo, tabSwitchOK, radioCount, answerOK, toggleBtnExists, toggleOK }, null, 2));
    console.log('FILE1 console errors:', JSON.stringify(consoleErrors.f1));
    await page.close();
  }

  // ===== FILE 2: dark-arts-feh-02.lab.html =====
  {
    const page = await browser.newPage();
    await setupBypass(page);
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.f2.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.f2.push(String(err)));
    const url = `${BASE}/labs/dark-arts-feh-02.lab.html`;
    const results = await checkOverflowAndFill(page, url, '.ex.active');
    console.log('FILE2 (feh-02 lab) overflow/fill results:');
    console.log(JSON.stringify(results, null, 2));

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    let tabSwitchOK = false;
    await page.evaluate(() => { document.querySelectorAll('.tab')[1].click(); });
    await new Promise(r => setTimeout(r, 200));
    tabSwitchOK = await page.evaluate(() => document.getElementById('ex1').classList.contains('active'));

    await page.evaluate(() => { document.querySelectorAll('.tab')[0].click(); });
    await new Promise(r => setTimeout(r, 200));

    let terminalOK = false;
    await page.evaluate(() => {
      const input = document.getElementById('dork-in');
      input.value = 'site:meridiantech.com filetype:pdf';
      input.focus();
    });
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 300));
    terminalOK = await page.evaluate(() => document.getElementById('search-out').children.length > 1);

    let checkAnswersOK = false;
    await page.evaluate(() => {
      document.getElementById('q1a').value = 'xls';
      document.getElementById('q1b').value = '/admin/login.php';
    });
    await page.evaluate(() => { document.querySelector('#ex0 .btn').click(); });
    await new Promise(r => setTimeout(r, 200));
    checkAnswersOK = await page.evaluate(() => {
      const r = document.getElementById('r1');
      return r.classList.contains('show') || r.style.display === 'block' || r.textContent.trim().length > 0;
    });

    console.log('FILE2 interactivity:', JSON.stringify({ tabSwitchOK, terminalOK, checkAnswersOK }, null, 2));
    console.log('FILE2 console errors:', JSON.stringify(consoleErrors.f2));
    await page.close();
  }

  // ===== FILE 3: dark-arts-feh-02.quiz.html =====
  {
    const page = await browser.newPage();
    await setupBypass(page);
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.f3.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.f3.push(String(err)));
    const url = `${BASE}/quizzes/dark-arts-feh-02.quiz.html`;
    const results = [];
    for (const w of widths) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1500));
      const data = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const qc = document.getElementById('quiz-container');
        const qe = qc ? qc.querySelector('.quiz-engine') : null;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow,
          quizContainerWidth: qc ? qc.getBoundingClientRect().width : null,
          quizEngineWidth: qe ? qe.getBoundingClientRect().width : null,
        };
      });
      results.push({ w, ...data });
    }
    console.log('FILE3 (quiz) overflow/fill results:');
    console.log(JSON.stringify(results, null, 2));

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const hasContainerAndClass = await page.evaluate(() => {
      const qc = document.getElementById('quiz-container');
      return { hasId: !!qc, hasEngineClass: qc ? !!qc.querySelector('.quiz-engine') : false };
    });

    let clicked = false;
    const optionSelectorCandidates = ['.quiz-option', '.option', '.answer-option', 'button.option', '[data-option]'];
    for (const sel of optionSelectorCandidates) {
      const exists = await page.evaluate((s) => !!document.querySelector(s), sel);
      if (exists) {
        await page.evaluate((s) => document.querySelector(s).click(), sel);
        clicked = true;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    const questionProgress = await page.evaluate(() => {
      const el = document.querySelector('[class*="progress"], [class*="question-count"]');
      return el ? el.textContent.trim() : null;
    });

    console.log('FILE3 interactivity:', JSON.stringify({ hasContainerAndClass, clicked, questionProgress }, null, 2));
    console.log('FILE3 console errors:', JSON.stringify(consoleErrors.f3));
    await page.close();
  }

  await browser.close();
})();
