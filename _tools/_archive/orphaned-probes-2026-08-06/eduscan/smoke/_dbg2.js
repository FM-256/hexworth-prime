// TEMP debug: why do options not render after the after-load stub install?
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8979;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); });
});
srv.listen(PORT, async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('framenavigated', f => console.log('NAV:', f.url()));
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    window.__calls = []; window.__signedIn = true;
    window.FirebaseAuth = {
      waitForAuth: () => Promise.resolve(window.__signedIn ? { uid: 'u' } : null),
      isSignedIn: () => window.__signedIn,
      callFunction: (n, p) => { window.__calls.push({ n, p }); return Promise.resolve({ data: { results: { 0: { correct: true, correctAnswer: 1, explanation: 'x'.repeat(30) } }, percentage: 100 } }); },
    };
    window.ModuleProgress = { completeQuiz: () => {} };
  });
  console.log('stub installed. FirebaseAuth.isSignedIn ->', await page.evaluate(() => FirebaseAuth.isSignedIn()));
  const r = await page.evaluate(async () => { try { await startQuiz(); return 'ok'; } catch (e) { return 'THREW: ' + e.message; } });
  console.log('startQuiz(signedIn=true) ->', r);
  await new Promise(r => setTimeout(r, 400));
  console.log(await page.evaluate(() => ({
    quizDisp: document.getElementById('quizScreen').style.display,
    startDisp: document.getElementById('startScreen').style.display,
    notice: document.getElementById('signInNotice').style.display,
    optCount: document.querySelectorAll('.option').length,
    wrapHTML: (document.getElementById('optionsWrap').innerHTML || '').slice(0, 120),
    qtext: document.getElementById('questionText').textContent.slice(0, 50),
    graderNull: typeof grader,
  })));
  await b.close(); srv.close();
});
