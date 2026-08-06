const puppeteer = require('puppeteer');
const BASE = 'http://localhost:8917';

(async () => {
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
  const page = await browser.newPage();
  const errs = [];
  page.on('console', msg => { if (msg.type()==='error') errs.push(msg.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.setViewport({width:1440, height:900});
  await page.goto(`${BASE}/houses/dark-arts/quizzes/dark-arts-feh-02.quiz.html`, {waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,1000));

  const before = await page.evaluate(() => ({
    progressText: document.querySelector('.quiz-progress-text')?.textContent,
    questionText: document.querySelector('.question-text')?.textContent.slice(0,80),
    answeredCount: document.querySelector('.quiz-score-preview')?.textContent.trim()
  }));

  await page.click('.quiz-option[data-index="0"]');
  await new Promise(r=>setTimeout(r,600));

  const after = await page.evaluate(() => ({
    progressText: document.querySelector('.quiz-progress-text')?.textContent,
    questionText: document.querySelector('.question-text')?.textContent.slice(0,80),
    answeredCount: document.querySelector('.quiz-score-preview')?.textContent.trim()
  }));

  console.log(JSON.stringify({before, after, consoleErrors: errs}, null, 2));
  await browser.close();
})();
