#!/usr/bin/env node
// Chris probe: does stop()'s SUCCESS narration make a false claim about a box a LATER,
// legitimate chain has since relaunched? Mirrors the harness structure in
// _tools/hexos/hex-shell-process.test.js (same mock shape, same auth stub).
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer');
const APP = path.resolve('/home/eq/ai-content/hexworth-prime/_app'), PORT = 9099;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*',
               'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS' };

function fixture() {
    return [ { sessionId: 'sess-abc', labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 12, url: 'https://x/s/sess-abc/' } ];
}

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});

srv.listen(PORT, '127.0.0.1', async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    let live = fixture();
    const launches = [];
    await pg.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg.setRequestInterception(true);
    pg.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms) => setTimeout(() => r.respond({ status: 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live }, 50);
            const d = u.match(/\/destroy\/([^/?]+)/);
            // Server processes the DELETE immediately (removes from live); only the RESPONSE
            // is slow. This mirrors the existing suite's own fixtures (pg2/pg3 comments say the
            // same thing about real lab-manager behavior).
            if (d) { live = live.filter(x => x.sessionId !== d[1]); return J({ status: 'destroyed' }, 5000); }
            if (/\/launch/.test(u)) {
                const id = 'sess-relaunch-' + (launches.length + 1);
                launches.push(id);
                live.push({ sessionId: id, labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                return J({ sessionId: id, url: 'https://x/' }, 50);
            }
            return J({}, 50);
        }
        r.continue();
    });
    await pg.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type = async (cmd) => { await pg.click('#cmd'); await pg.type('#cmd', cmd); await pg.keyboard.press('Enter'); };
    const out = () => pg.evaluate(() => document.getElementById('out').innerText);

    // gen1: stop arctic. destroy() removes it server-side immediately, but the RESPONSE
    // takes 5000ms. Watchdog (1000ms) frees the lock while gen1's destroy is still pending.
    await type('stop arctic');
    await new Promise(r => setTimeout(r, 1400));
    console.log('--- after watchdog fires ---');
    console.log(await out());

    await pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    // gen2: restart arctic. list() no longer shows it (gen1's destroy already landed
    // server-side), so this takes the "was not running, launching fresh" branch: a
    // legitimate, brand-new session for arctic.
    await type('restart arctic');
    await new Promise(r => setTimeout(r, 800));
    console.log('--- after gen2 restart (legit new session) ---');
    console.log(await out());
    console.log('live sessions for arctic now:', JSON.stringify(live.filter(x => x.labId === 'arctic')));

    // Now wait for gen1's ORIGINAL stop's destroy() response to finally land at t=5000
    // from its own start. It started at t=0; we are currently at ~1400+800=2200ms; wait
    // the remainder.
    await pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await new Promise(r => setTimeout(r, 3200));
    console.log('--- after gen1 stop\'s stale destroy() finally resolves ---');
    console.log(await out());
    console.log('ACTUAL live sessions for arctic:', JSON.stringify(live.filter(x => x.labId === 'arctic')));

    await b.close(); srv.close();
});
