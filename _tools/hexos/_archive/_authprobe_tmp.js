const puppeteer = require('puppeteer');
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST;
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  for (const intercept of [false, true]) {
    const p = await b.newPage();
    if (intercept) {
      await p.setRequestInterception(true);
      p.on('request', r => r.continue());
    }
    await p.goto('http://127.0.0.1:5000/arena/tournament-board.html?id=x', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(()=>{});
    const r = await p.evaluate(async (auth) => {
      try {
        const res = await fetch(`http://${auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({returnSecureToken:true})
        });
        const j = await res.json();
        return 'status ' + res.status + ' idToken:' + (!!j.idToken);
      } catch (e) { return 'THREW: ' + e.message; }
    }, AUTH);
    console.log(`  interception=${intercept}: ${r}`);
    await p.close();
  }
  await b.close();
})();
