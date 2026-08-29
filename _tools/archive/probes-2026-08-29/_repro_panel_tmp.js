// Reproduce the student's actual experience: signed in, on the live page, click Launch Sandbox,
// and watch whether the Horizon panel appears under it. Stop guessing from code.
const puppeteer = require('puppeteer');
const API_KEY='AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
(async () => {
  const email='cinder-adv-qc@hexworth-smoke.local', password='QcCiA9x';
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { method:'POST', headers:{'Content-Type':'application/json', Referer:'https://hexworth-prime.web.app/'},
      body: JSON.stringify({ email, password, returnSecureToken:true }) });
  const u = await r.json();
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width:1920, height:1080 });
  const msgs=[], fails=[];
  p.on('console', m => msgs.push(m.text().slice(0,110)));
  p.on('pageerror', e => fails.push('PAGEERROR '+e.message.slice(0,110)));
  p.on('requestfailed', q => { if (/sandbox|console-session/.test(q.url())) fails.push('REQFAIL '+q.url().slice(0,80)+' '+(q.failure()||{}).errorText); });
  p.on('response', async q => { if (/console-session|\/launch/.test(q.url())) msgs.push(`NET ${q.status()} ${q.url().split('/api/sandbox')[1]}`); });
  // seed auth the way FirebaseAuth persists it, before any page script runs
  await p.evaluateOnNewDocument((usr) => {
    localStorage.setItem('hexworth_firebase_user', JSON.stringify(usr));
    localStorage.setItem('hexworth_is_admin','false');
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  }, { uid:u.localId, email:u.email, idToken:u.idToken, refreshToken:u.refreshToken, displayName:'QC' });
  await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html?cb='+Date.now(), { waitUntil:'domcontentloaded' });
  await new Promise(x=>setTimeout(x,2500));
  const btn = await p.evaluate(() => {
    const el = [...document.querySelectorAll('button,a')].find(e => /launch sandbox/i.test(e.textContent));
    if (el) { el.click(); return el.textContent.trim(); }
    return null;
  });
  console.log('  Launch control found:', btn || 'NO — could not find Launch Sandbox');
  await new Promise(x=>setTimeout(x,15000));
  const st = await p.evaluate(() => {
    const panel = document.querySelector('.sandbox-console-panel');
    return { panelExists: !!panel,
             panelText: panel ? panel.innerText.replace(/\s+/g,' ').slice(0,150) : null,
             hasHorizonLink: panel ? !!panel.querySelector('a[href*="dashboard"]') : false };
  });
  console.log('  Horizon panel present:', st.panelExists);
  console.log('  Horizon LINK present :', st.hasHorizonLink);
  if (st.panelText) console.log('  panel text:', st.panelText);
  console.log('  network:', msgs.filter(m=>m.startsWith('NET')).join(' | ') || 'none');
  const diag = await p.evaluate(() => ({
    signedIn: (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn && FirebaseAuth.isSignedIn()),
    launcherHTML: (document.querySelector('[id$="launcher"]')||{}).innerText || '(no launcher)',
    bodyStart: document.body.innerText.replace(/\s+/g,' ').slice(0,140),
  }));
  console.log('  FirebaseAuth.isSignedIn():', diag.signedIn);
  console.log('  launcher shows:', JSON.stringify(diag.launcherHTML.replace(/\s+/g,' ').slice(0,120)));
  console.log('  page starts:', JSON.stringify(diag.bodyStart));
  if (fails.length) console.log('  failures:', fails.slice(0,3).join(' | '));
  await p.screenshot({ path:'_panel_repro.png' });
  await b.close();
})();
