const puppeteer = require('puppeteer');
(async () => {
  const [tok, ck] = [process.argv[2], process.argv[3]];
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 800 });
  await p.setCookie({ name: 'hexworth_console', value: ck, domain: 'sandbox.hexworth.tech', path: '/', secure: true });
  let wsClosed = false, wsStatus = null;
  const cdp = await p.target().createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.webSocketHandshakeResponseReceived', (e) => { wsStatus = e.response.status; });
  cdp.on('Network.webSocketClosed', () => { wsClosed = true; });
  await p.goto(`https://sandbox.hexworth.tech/novnc/vnc_lite.html?path=%3Ftoken%3D${tok}`, { waitUntil: 'domcontentloaded' });
  await new Promise((x) => setTimeout(x, 9000));
  const st = await p.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return { hasCanvas: false };
    let distinct = new Set();
    try {
      const d = c.getContext('2d').getImageData(0, 0, Math.min(c.width,120), Math.min(c.height,120)).data;
      for (let i = 0; i < d.length; i += 4) distinct.add(`${d[i]},${d[i+1]},${d[i+2]}`);
    } catch (e) { return { hasCanvas: true, err: String(e).slice(0,60) }; }
    return { hasCanvas: true, size: c.width + 'x' + c.height, colours: distinct.size };
  });
  console.log('  websocket handshake:', wsStatus, '| closed early:', wsClosed);
  console.log('  canvas:', st.hasCanvas ? `${st.size}, distinct colours in sample: ${st.colours}` : 'ABSENT');
  console.log('  VERDICT:', (st.hasCanvas && !wsClosed && st.colours > 1) ? 'CONSOLE IS LIVE AND PAINTING' : 'NOT WORKING');
  await p.screenshot({ path: '_vnc_console_proof.png' });
  await b.close();
})();
