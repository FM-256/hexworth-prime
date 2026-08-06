const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('syncClassProgress') || text.includes('401')) return; // ignore per instructions
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });

  // Stub ModuleProgress.completeQuiz to spy on invocation, and stub fetch for grading CF
  let completeQuizCalled = null;
  await page.exposeFunction('__reportCompleteQuiz', (args) => {
    completeQuizCalled = args;
  });

  await page.goto('http://localhost:8931/houses/dark-arts/quizzes/dark-arts-ceh-01.quiz.html', { waitUntil: 'networkidle2', timeout: 30000 });

  await new Promise(r => setTimeout(r, 1500));

  const step1 = {
    pageErrors: pageErrors.slice(),
    consoleErrors: consoleErrors.slice(),
  };

  // Confirm QuizEngine initialized and first question rendered
  const initState = await page.evaluate(() => {
    const container = document.getElementById('quiz-container');
    const html = container ? container.innerHTML : null;
    return {
      hasContainer: !!container,
      containerNonEmpty: !!(html && html.trim().length > 0),
      hasQuestionText: !!document.querySelector('.question-text, .quiz-question, [class*=question]'),
      quizGlobalExists: typeof window.quiz !== 'undefined',
      quizConfigTrackProgress: window.quiz ? window.quiz.config.trackProgress : null,
      onCompleteIsFunction: window.quiz ? typeof window.quiz.config.onComplete === 'function' : null,
      snippet: html ? html.slice(0, 500) : null
    };
  });

  await browser.close();
  console.log(JSON.stringify({ step1, initState }, null, 2));
})();
