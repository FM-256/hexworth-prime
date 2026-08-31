#!/usr/bin/env node
// Probe: does the watchdog-release-then-retry path let an ORPHANED restart chain complete its
// own destroy+launch AFTER the student has moved on to a second restart attempt, producing a
// duplicate/ghost session the second attempt's own error message denies exists?
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer');
const APP = path.resolve('/home/eq/ai-content/hexworth-prime/_app'), PORT = 9099;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS' };

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});

srv.listen(PORT, '127.0.0.1', async () => {
    let live = [{ sessionId: 'sess-abc', labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 12, url: 'https://x/s/sess-abc/' }];
    let launchCount = 0;
    const destroyLog = [], launchLog = [];
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    await pg.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg.setRequestInterception(true);
    pg.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms, st) => setTimeout(() => r.respond({ status: st || 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live }, 60);
            const d = u.match(/\/destroy\/([^/?]+)/);
            if (d) {
                const id = d[1];
                if (!live.some(x => x.sessionId === id)) { destroyLog.push('404:' + id); return J({ error: 'Session not found' }, 100, 404); }
                live = live.filter(x => x.sessionId !== id);
                destroyLog.push('ok:' + id);
                return J({ status: 'destroyed' }, 5000, 200);
            }
            if (/\/launch/.test(u)) {
                launchCount++;
                const id = 'sess-new-' + launchCount;
                live.push({ sessionId: id, labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                launchLog.push(id);
                return J({ sessionId: id, url: 'https://x/' }, 200);
            }
            return J({}, 60);
        }
        r.continue();
    });
    // patch J to actually run the mutation callback (the above J helper ignores extra arg; redo properly)
    await pg.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type = async (cmd) => { await pg.click('#cmd'); await pg.type('#cmd', cmd); await pg.keyboard.press('Enter'); };
    const text = () => pg.evaluate(() => document.getElementById('out').innerText);
    const clearOut = () => pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });

    console.log('t=0 restart arctic (gen1) -- destroy will take 5000ms');
    await type('restart arctic');
    await new Promise(r => setTimeout(r, 1300));
    console.log('t=1300 after watchdog (1000ms) fires:', JSON.stringify((await text()).slice(-200)));
    await clearOut();
    console.log('t=1300 ps:');
    await type('ps');
    await new Promise(r => setTimeout(r, 400));
    console.log(await text());
    await clearOut();
    console.log('t=1700 restart arctic again (gen2)');
    await type('restart arctic');
    await new Promise(r => setTimeout(r, 5500));
    console.log('t=~7200 gen2 result:', await text());
    await clearOut();
    console.log('t=7200 ps (final):');
    await type('ps');
    await new Promise(r => setTimeout(r, 400));
    console.log(await text());
    console.log('\ndestroyLog', destroyLog);
    console.log('launchLog', launchLog, 'launchCount', launchCount);
    console.log('live sessions at end:', JSON.stringify(live));
    await b.close(); srv.close();
});
