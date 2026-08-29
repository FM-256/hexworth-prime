// The STUDENT path: log in to Horizon, open the instance console tab, and see whether the
// embedded console actually connects. Testing the direct noVNC URL proved the plumbing; this
// proves the journey a student actually takes.
const puppeteer = require('puppeteer');
(async () => {
  const [pw, ck] = [process.argv[2], process.argv[3]];
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1400, height: 900 });
  await p.setCookie({ name: 'hexworth_console', value: ck, domain: 'sandbox.hexworth.tech', path: '/', secure: true });
  const B = 'https://sandbox.hexworth.tech/dashboard';
  await p.goto(B + '/auth/login/', { waitUntil: 'domcontentloaded' });
  await p.type('#id_username', 'student-09');
  await p.type('#id_password', pw);
  await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(()=>{}), p.click('button[type=submit], input[type=submit]')]);
  console.log('  after login, url:', p.url().replace(/token=[0-9a-f-]+/,'token=<redacted>').slice(0, 70));
  await p.goto(B + '/project/instances/', { waitUntil: 'domcontentloaded' });
  const id = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a')].map(x=>x.getAttribute('href')||'').find(h=>/\/project\/instances\/[0-9a-f-]{36}\//.test(h));
    return a ? a.match(/([0-9a-f-]{36})/)[1] : null;
  });
  if (!id) { console.log('  no instance link found'); await b.close(); return; }
  let wsStatus = null, wsClosed = false;
  const cdp = await p.target().createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.webSocketHandshakeResponseReceived', (e) => { wsStatus = e.response.status; });
  cdp.on('Network.webSocketClosed', () => { wsClosed = true; });
  await p.goto(`${B}/project/instances/${id}/?tab=instance_details__console`, { waitUntil: 'domcontentloaded' });
  await new Promise(x=>setTimeout(x, 10000));
  const info = await p.evaluate(() => {
    const f = document.querySelector('iframe[src*="vnc"], iframe#console_embed, iframe');
    return { iframeSrc: f ? f.getAttribute('src') : null };
  });
  console.log('  iframe src:', (info.iframeSrc||'none').replace(/token%3D[0-9a-f-]+/,'token%3D<redacted>').replace(/token=[0-9a-f-]+/,'token=<redacted>').slice(0,95));
  console.log('  websocket handshake:', wsStatus, '| closed early:', wsClosed);
  console.log('  VERDICT:', (wsStatus === 101 && !wsClosed) ? 'HORIZON CONSOLE TAB WORKS' : 'still not connecting');
  await p.screenshot({ path: '_hz_console_proof.png' });
  await b.close();
})();
