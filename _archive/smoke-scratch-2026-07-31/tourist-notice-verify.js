// NANCY CRITERION (c): pixel-measure the ACTUAL element, not the CSS, on a real quiz as a tourist.
// Three questions, each answerable only by driving it:
//   1. does the banner stay IN VIEW after scrolling to the bottom (the 144px bug)?
//   2. does a blocked completion change it to the transactional message?
//   3. does an ambient AchievementManager.unlock leave it ALONE (Nancy's reject criterion (a))?
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const Q = 'http://127.0.0.1:8901/houses/web/intro-networks/quizzes/fl-w3-config.quiz.html';
(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(() => {
    try { localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('hexworth_tourist_active', 'true'); } catch (e) {}
  });
  await p.goto(Q, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1400));

  const pos = s => p.evaluate(() => {
    const e = document.getElementById('tourist-overlay-banner');
    if (!e) return { present: false };
    const r = e.getBoundingClientRect();
    return { present: true, top: Math.round(r.top),
             inView: r.bottom > 0 && r.top < window.innerHeight,
             sticky: getComputedStyle(e).position,
             text: (e.querySelector('.tourist-overlay__text') || {}).textContent.trim().slice(0, 70),
             blocked: e.classList.contains('tourist-overlay--blocked') };
  });

  console.log('  1. BEFORE scroll: ' + JSON.stringify(await pos()));
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise(r => setTimeout(r, 350));
  const scrolled = await pos();
  console.log('  2. AT PAGE BOTTOM (was top:-144 inView:false before this fix):');
  console.log('     ' + JSON.stringify(scrolled));

  // The ambient case FIRST -- if it dirtied the banner we would wrongly credit the next step.
  await p.evaluate(() => { try { if (window.AchievementManager) AchievementManager.unlock('night_owl'); } catch (e) {} });
  await new Promise(r => setTimeout(r, 200));
  const afterAmbient = await pos();
  console.log('  3. after an AMBIENT AchievementManager.unlock (must be UNCHANGED):');
  console.log('     blocked=' + afterAmbient.blocked + '  text="' + afterAmbient.text + '"');

  await p.evaluate(() => { try { ModuleProgress.completeQuiz('web', 'probe-quiz', 87, { silent: true, returnToDashboard: false }); } catch (e) {} });
  await new Promise(r => setTimeout(r, 250));
  const afterBlock = await pos();
  console.log('  4. after a BLOCKED completeQuiz (must become transactional):');
  console.log('     ' + JSON.stringify(afterBlock));

  await b.close();
  const pass = scrolled.inView && scrolled.sticky === 'sticky'
    && afterAmbient.blocked === false && afterBlock.blocked === true
    && /Score not saved/.test(afterBlock.text);
  console.log('\n  ' + (pass ? 'PASS -- pinned in view, silent on ambient, transactional on a real completion'
                             : 'FAIL -- see above'));
  process.exitCode = pass ? 0 : 1;
})();
