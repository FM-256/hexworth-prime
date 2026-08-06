const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const consoleAll = [];
  page.on('console', msg => {
    consoleAll.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('syncClassProgress') || text.includes('401')) return;
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'dark-arts');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });

  await page.goto('http://localhost:8931/houses/dark-arts/quizzes/dark-arts-ceh-01.quiz.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Install spies/stubs in-page BEFORE we submit the final question.
  const spySetup = await page.evaluate(() => {
    const out = {};
    // Spy on ModuleProgress.completeQuiz
    if (typeof ModuleProgress !== 'undefined') {
      window.__completeQuizCalls = [];
      const orig = ModuleProgress.completeQuiz;
      ModuleProgress.completeQuiz = function(...args) {
        window.__completeQuizCalls.push(args);
        // Do NOT call real implementation (would attempt Firestore writes) — spy only.
        return { xpEarned: 0 };
      };
      out.moduleProgressSpied = true;
      window.__completeModuleCalls = [];
      if (typeof ProgressManager !== 'undefined') {
        const origCM = ProgressManager.completeModule;
        ProgressManager.completeModule = function(...args) {
          window.__completeModuleCalls.push(args);
          return { xpEarned: 999 };
        };
        out.progressManagerSpied = true;
      } else {
        out.progressManagerSpied = false;
      }
    } else {
      out.moduleProgressSpied = false;
    }

    // Stub the server grading call so we don't depend on live Cloud Functions / auth.
    out.firebaseAuthExists = typeof FirebaseAuth !== 'undefined';
    if (typeof FirebaseAuth !== 'undefined') {
      FirebaseAuth.callFunction = async (name, data) => {
        window.__gradeQuizCalledWith = { name, data };
        // Build a plausible serverResult: mark all answered as correct, matching count.
        const total = (data && data.answers) ? Object.keys(data.answers).length : 15;
        const results = [];
        for (let i = 0; i < total; i++) results.push({ correct: true });
        return {
          data: {
            score: total,
            total: total,
            percentage: 100,
            passed: true,
            results
          }
        };
      };
      out.callFunctionStubbed = true;
    }
    return out;
  });

  // Answer all 15 questions (auto-advances after each click since showFeedback is forced off)
  for (let i = 0; i < 15; i++) {
    await page.waitForSelector('.quiz-option', { timeout: 5000 });
    await page.click('.quiz-option');
    await new Promise(r => setTimeout(r, 200));
  }

  // Wait for results screen (submitting -> results)
  await new Promise(r => setTimeout(r, 2000));

  const finalState = await page.evaluate(() => {
    const container = document.getElementById('quiz-container');
    const html = container ? container.innerHTML : '';
    return {
      html: html.slice(0, 2000),
      completeQuizCalls: window.__completeQuizCalls || null,
      completeModuleCalls: window.__completeModuleCalls || null,
      gradeQuizCalledWith: window.__gradeQuizCalledWith || null,
      hasErrorText: html.includes('Grading Error') || html.includes('An error occurred'),
      hasResultsClass: !!container.querySelector('.quiz-results, [class*=result]')
    };
  });

  await browser.close();

  console.log(JSON.stringify({
    spySetup,
    pageErrors,
    consoleErrors,
    finalState
  }, null, 2));
})();
