// The adjacent case. One clean pass is not evidence -- a SORTED student must be untouched by all of
// this: no banner, no notice, and completeQuiz must still actually save.
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const Q = 'http://127.0.0.1:8901/houses/web/intro-networks/quizzes/fl-w3-config.quiz.html';
(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(() => {
    try { localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('hexworth_house', 'web'); } catch (e) {}
  });
  await p.goto(Q, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1400));
  const r = await p.evaluate(() => {
    const banner = document.getElementById('tourist-overlay-banner');
    let ret = null;
    try { ret = ModuleProgress.completeQuiz('web', 'probe-quiz', 87, { silent: true, returnToDashboard: false }); } catch (e) { ret = 'threw: ' + e.message; }
    const stored = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
    return { bannerPresent: !!banner, completeQuizReturn: ret,
             actuallySaved: !!(stored.web && stored.web['probe-quiz']),
             score: stored.web && stored.web['probe-quiz'] ? stored.web['probe-quiz'].score : null };
  });
  await b.close();
  console.log('  SORTED student on the same quiz page:');
  console.log('     tourist banner present : ' + r.bannerPresent + '   (must be false)');
  console.log('     completeQuiz returned  : ' + r.completeQuizReturn + '   (must NOT be false)');
  console.log('     progress actually saved: ' + r.actuallySaved + '   score=' + r.score);
  const pass = r.bannerPresent === false && r.completeQuizReturn !== false && r.actuallySaved === true;
  console.log('\n  ' + (pass ? 'PASS -- sorted students are untouched; saving still works'
                             : 'FAIL -- regression for sorted students'));
  process.exitCode = pass ? 0 : 1;
})();
