// Browser stage of the office test: take the credentials the launch just issued, log in to
// Horizon and open an instance console -- all from the office network, tailscale offline.
const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const h = JSON.parse(fs.readFileSync('/tmp/office_e2e.json', 'utf8'));
  // Mint the gate cookie through the REAL endpoint and capture Set-Cookie.
  const r = await fetch('https://sandbox.hexworth.tech/api/sandbox/console-session', {
    method: 'POST', headers: { Authorization: `Bearer ${h.idToken}`, 'Content-Type': 'application/json' }, body: '{}' });
  const sc = r.headers.get('set-cookie') || '';
  const ck = (sc.match(/hexworth_console=([^;]+)/) || [])[1];
  console.log('  console cookie from the real endpoint:', ck ? 'issued' : 'MISSING');
  if (!ck) return;

  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1400, height: 900 });
  await p.setCookie({ name: 'hexworth_console', value: ck, domain: 'sandbox.hexworth.tech', path: '/', secure: true });
  const B = 'https://sandbox.hexworth.tech/dashboard';
  await p.goto(B + '/auth/login/', { waitUntil: 'domcontentloaded' });
  await p.type('#id_username', h.user);
  await p.type('#id_password', h.pw);
  await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(()=>{}), p.click('button[type=submit], input[type=submit]')]);
  console.log('  Horizon login ->', p.url().includes('/project') ? 'LOGGED IN' : 'FAILED: ' + p.url().slice(0,60));

  await p.goto(B + '/project/instances/', { waitUntil: 'domcontentloaded' });
  const id = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a')].map(x=>x.getAttribute('href')||'').find(hh=>/\/project\/instances\/[0-9a-f-]{36}\//.test(hh));
    return a ? a.match(/([0-9a-f-]{36})/)[1] : null;
  });
  if (!id) { console.log('  no instance in this slot to open a console on (slot is empty)'); await b.close(); return; }
  let ws = null, closed = false;
  const cdp = await p.target().createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.webSocketHandshakeResponseReceived', (e) => { ws = e.response.status; });
  cdp.on('Network.webSocketClosed', () => { closed = true; });
  await p.goto(`${B}/project/instances/${id}/?tab=instance_details__console`, { waitUntil: 'domcontentloaded' });
  await new Promise(x=>setTimeout(x, 9000));
  console.log('  console websocket:', ws, '| closed early:', closed);
  console.log('  VERDICT:', (ws === 101 && !closed) ? 'CONSOLE WORKS FROM THE OFFICE' : 'console did not connect');
  await p.screenshot({ path: '_office_console_proof.png' });
  await b.close();
})();
