// Real student flow: sign in on the login page FIRST (AccessGuard blanks the lab page for
// anonymous visitors, which is why the launcher was absent), then navigate to the lab.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const net = [], errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 110)));
  p.on('response', r => { if (/\/api\/sandbox\//.test(r.url())) net.push(`${r.status()} ${r.url().split('/api/sandbox')[1].split('?')[0]}`); });

  await p.goto('https://hexworth.com/login.html', { waitUntil: 'networkidle2' });
  await p.waitForFunction(() => window.firebaseAuth && typeof window.firebaseAuth.getAuth === 'function', { timeout: 40000 }).catch(()=>{});
  const signed = await p.evaluate(async () => {
    try {
      const { getAuth, signInWithEmailAndPassword } = window.firebaseAuth;
      const c = await signInWithEmailAndPassword(getAuth(), 'cinder-adv-qc@hexworth-smoke.local', 'QcCiA9x');
      return 'signed in: ' + c.user.email;
    } catch (e) { return 'FAILED: ' + String(e).slice(0,110); }
  });
  console.log('  auth:', signed);
  if (signed.startsWith('FAILED')) { await b.close(); return; }
  await new Promise(x => setTimeout(x, 2500));

  await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'networkidle2' });
  await new Promise(x => setTimeout(x, 3000));
  const pre = await p.evaluate(() => {
    const l = document.querySelector('[id$="launcher"]');
    return l ? l.innerText.replace(/\s+/g,' ').slice(0,120) : '(launcher missing)';
  });
  console.log('  launcher before click:', JSON.stringify(pre));
  const clicked = await p.evaluate(() => {
    const el = [...document.querySelectorAll('button,a')].find(e => /launch sandbox/i.test(e.textContent));
    if (!el) return 'no Launch control'; el.click(); return 'clicked';
  });
  console.log('  ', clicked);
  await new Promise(x => setTimeout(x, 25000));
  const st = await p.evaluate(() => {
    const panel = document.querySelector('.sandbox-console-panel');
    const l = document.querySelector('[id$="launcher"]');
    return { panel: !!panel,
             panelText: panel ? panel.innerText.replace(/\s+/g,' ').slice(0,180) : null,
             launcher: l ? l.innerText.replace(/\s+/g,' ').slice(0,220) : '(none)' };
  });
  console.log('  HORIZON PANEL PRESENT:', st.panel);
  if (st.panelText) console.log('  panel:', st.panelText);
  console.log('  launcher after:', JSON.stringify(st.launcher));
  console.log('  api calls:', net.join(' | ') || 'none');
  if (errs.length) console.log('  errors:', errs.slice(0,2).join(' | '));
  await p.screenshot({ path: '_real_launch.png' });
  await b.close();
})();
