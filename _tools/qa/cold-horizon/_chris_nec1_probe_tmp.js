'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve('/home/eq/ai-content/hexworth-prime/_app');
const SPEC = JSON.parse(fs.readFileSync('/home/eq/ai-content/hexworth-prime/functions/mission-gates.generated.json','utf8')).gates;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, buf) => {
        if (e) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
    });
});
(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });

    // Mission 2: seed badge-log (earned physical corroborator), then compare
    // badge-log against sess-token (a platform source). Per config-shared.js
    // axes, these two share NOTHING, so independenceOf should return ok=true.
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        localStorage.setItem('hexworth_house', 'cloud');
        localStorage.setItem('hexworth_le01_acts', JSON.stringify({
            '2:badge-log': { kind: 'terminal', at: new Date().toISOString() }
        }));
    });
    await page.goto(`${base}/arena/boxes/le-01-cold-horizon/gateway.html?m=2`, { waitUntil: 'networkidle0', timeout: 40000 });
    await page.evaluate(() => {
        window.__CLAIMS = [];
        FirebaseAuth.isSignedIn = () => true;
        FirebaseAuth.callFunction = (name, payload) => { window.__CLAIMS.push({ name, payload }); return Promise.resolve({ data: { recorded: true } }); };
    });
    const opts = await page.evaluate(() => Array.from(document.querySelectorAll('#srcA option')).map(o => o.value));
    console.log('available sources for m2:', opts);
    if (opts.indexOf('badge-log') === -1) { console.log('badge-log NOT SELECTABLE, aborting'); await browser.close(); server.close(); return; }

    // Click Test on badge-log vs sess-token THREE times in a row to see if it dedups.
    for (let i = 0; i < 3; i++) {
        await page.select('#srcA', 'badge-log');
        await page.select('#srcB', 'sess-token');
        await page.click('#testBtn');
        await new Promise(r => setTimeout(r, 3300));
    }
    const claims = await page.evaluate(() => window.__CLAIMS.filter(x => x.name === 'recordMissionFinding'));
    console.log('total recordMissionFinding claims after 3 identical independent-pair clicks:', claims.length);
    console.log(JSON.stringify(claims, null, 2));
    await browser.close(); server.close();
})();
