#!/usr/bin/env node
/**
 * @catalog what    BUG-247: measures whether FirebaseAuth/FirestoreManager really are absent where
 * @catalog what    the tenant pill renders. window.X vs typeof X, the lexical-const trap.
 * @catalog run     NODE_PATH=$(pwd)/node_modules node _tools/hexos/_archive/probe-pill-authpath-2026-09-02.js
 * @catalog status  PROBE
 *
 * LIMITATION, do not over-read: it blocks off-origin requests, so the `firebase` column is a
 * harness artifact and says nothing about the CDN-served SDK. The FirebaseAuth columns are real.
 */
/* Does TenantShell.js:411-413's claim hold?
 *   "Verified in a browser: on a content page `firebase`, `FirebaseAuth` and `FirestoreManager`
 *    are all undefined, so there is no authenticated call path where this pill renders."
 *
 * Both FirebaseAuth and FirestoreManager are declared `const X = (function(){...})()` at top level.
 * A top-level const is a LEXICAL binding, not a window property, so `window.X` reads undefined
 * while `typeof X` resolves. Which surface the original check used decides whether the claim is
 * true or an artifact of the documented trap. Measure both, from a script tag on the real page --
 * the same context TenantShell.js runs in.
 *
 * Read-only: serves _app over http, evaluates, writes nothing. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
let puppeteer; try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer missing; refusing to guess.'); process.exit(2);
}
const APP = path.resolve('/home/eq/ai-content/hexworth-prime/_app'), PORT = 9311;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css' };

const PAGES = [
    '/hex/index.html',
    '/houses/ai/ai-900/index.html',
    '/houses/cloud/clf-c02/index.html',
    '/houses/shield/isc2-cc/index.html',
];

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});
srv.on('error', e => { console.error('bind failed:', e.code); process.exit(1); });

srv.listen(PORT, '127.0.0.1', async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    console.log('  page                               win.FA    typeof FA typeof FSM typeof fb  requested  landed-on');
    for (const u of PAGES) {
        const pg = await b.newPage();
        await pg.setRequestInterception(true);
        // Block only off-origin so nothing reaches production. AccessGuard would redirect an
        // unauthenticated browser away, so neutralise just its require(), nothing else.
        const seen = { auth: false };
        pg.on('request', r => {
            const url = r.url();
            // Neutralise ONLY AccessGuard.require(), which otherwise redirects an unauthenticated
            // headless browser off the page -- the first run measured the LOGIN page and reported
            // every global undefined, which is true there and says nothing about a content page.
            if (/AccessGuard\.js$/.test(url)) {
                return r.respond({ status: 200, contentType: 'text/javascript',
                    body: 'window.AccessGuard={require:function(){},redirect:function(){}};' });
            }
            if (/components\/FirebaseAuth\.js$/.test(url)) seen.auth = true;
            if (!url.startsWith(`http://127.0.0.1:${PORT}`)) return r.abort();
            r.continue();
        });
        try {
            await pg.goto(`http://127.0.0.1:${PORT}${u}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (e) { console.log(`  ${u.padEnd(38)} LOAD FAILED ${e.message.slice(0,40)}`); await pg.close(); continue; }
        await new Promise(r => setTimeout(r, 900));
        const res = await pg.evaluate(() => ({
            win:  typeof window.FirebaseAuth,
            lex:  (function(){ try { return typeof FirebaseAuth; } catch(e){ return 'throw'; } })(),
            fsm:  (function(){ try { return typeof FirestoreManager; } catch(e){ return 'throw'; } })(),
            fb:   (function(){ try { return typeof firebase; } catch(e){ return 'throw'; } })(),
            href: location.pathname,
            // Does an AUTHENTICATED call path actually exist? FirestoreManager being absent only
            // rules out a direct Firestore read. A token getter is enough to invoke a Cloud
            // Function, which is the other way to answer class-ended / student-removed.
            api: (function(){ try {
                if (typeof FirebaseAuth === 'undefined') return 'n/a';
                return Object.keys(FirebaseAuth).filter(function(k){
                    return /token|user|signed|auth/i.test(k); }).join(',') || '(none matching)';
            } catch(e){ return 'throw'; } })(),
        }));
        res.reqAuth = seen.auth;
        console.log(`  ${u.padEnd(34)} ${String(res.win).padEnd(9)} ${String(res.lex).padEnd(9)} ${String(res.fsm).padEnd(9)} ${String(res.fb).padEnd(9)} req=${res.reqAuth}  landed=${res.href}\n      FirebaseAuth surface: ${res.api}`);
        await pg.close();
    }
    await b.close(); srv.close();
});
