// In-situ smoke for the telemetry injection: loads REAL injected Observatory pages in a
// headless browser with the real ObservatoryTelemetry.js AND real ModuleProgress.js
// coexisting, and verifies the injection did not break the page or cause the two-loader
// FirebaseAuth collision. AccessGuard is stubbed to a no-op (so gated pages render); the
// Firebase SDK is not needed. FirebaseAuth.js is served as a `const`-based stub (matching the
// real file's top-level const), so ANY duplicate <script> tag would throw a redeclaration
// SyntaxError - exactly the failure the guards prevent.
const fs = require('fs'), path = require('path'), http = require('http'), pup = require('puppeteer');
const ROOT = path.resolve('_app');
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

// const-based FirebaseAuth stub: same top-level-const shape as the real file, so a second
// tag for it throws "Identifier 'FirebaseAuth' has already been declared".
const FA_STUB = "const FirebaseAuth=(function(){return {waitForAuth:async function(){return {uid:'smoke-stu',isAnonymous:false};},refreshToken:async function(){return 'smoke-token';},callFunction:async function(){return {};},getUser:function(){return {uid:'smoke-stu'};},isSignedIn:function(){return true;},init:async function(){return true;}};})();";
const AG_STUB = "window.AccessGuard={require:function(){},isAdmin:function(){return Promise.resolve(false);}};";

const srv = http.createServer((q, s) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { s.writeHead(403); s.end(); return; }
    fs.readFile(file, (err, buf) => {
        if (err) {
            if (/\.(webp|png|svg|jpg|jpeg|gif|ico)$/i.test(p)) { s.writeHead(200, { 'Content-Type': 'image/png' }); s.end(PIXEL); return; }
            s.writeHead(404); s.end(); return;
        }
        s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        s.end(buf);
    });
});

const PAGES = [
    'houses/web/network-plus/presentations/ipsec-gre.presentation.html',
    'projects/shield-ids-ml.html',
    'houses/script/modules/linux-mastery/script-lm-24-chown.module.html',
    'houses/code/python-for-it/builtins-reference.html',
    'houses/cloud/modules/wsa/m04-hyperv/cloud-presentation.module.html',
    'houses/shield/infosec/labs/pis-l01-specimen-classification/index.html',
    'houses/forge/applets/comptia-aplus/core-2/chapters/ch13-windows-editions/index.html',
    'houses/matrix/adv-linux/labs/ala-l01-dead-cell-recovery/index.html'
];

(async () => {
    await new Promise(r => srv.listen(0, r));
    const port = srv.address().port;
    const browser = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    let pass = true;
    // Pass/fail accumulator: log each assertion and flip `pass` false on any failure.
    const check = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) pass = false; };

    // Open one injected page in a fresh tab, stub AccessGuard + FirebaseAuth via request
    // interception, optionally seed the signed-in localStorage hint (setHint) before any page
    // script runs, navigate, settle, and return the observed DOM state + collected page errors.
    // rel = page path under _app; setHint = whether to simulate a signed-in student.
    async function loadPage(rel, setHint) {
        const pg = await browser.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push(String(e.message)));
        await pg.setRequestInterception(true);
        pg.on('request', req => {
            const u = req.url();
            if (/AccessGuard\.js/.test(u)) return req.respond({ status: 200, contentType: 'text/javascript', body: AG_STUB });
            if (/FirebaseAuth\.js/.test(u)) return req.respond({ status: 200, contentType: 'text/javascript', body: FA_STUB });
            if (/^https?:\/\/(www\.gstatic\.com|apis\.google\.com|firestore|identitytoolkit|securetoken)/.test(u)) return req.abort();
            if (u.startsWith('http://localhost:' + port)) return req.continue();
            return req.abort();   // any other third-party
        });
        // Seed or clear the signed-in hint before any page script runs. Clearing is required
        // for the no-hint case because localStorage persists across pages in one browser
        // context (an earlier with-hint page would otherwise leave the key set).
        if (setHint) {
            await pg.evaluateOnNewDocument(() => {
                try { localStorage.setItem('hexworth_firebase_user', JSON.stringify({ uid: 'smoke-stu', isAnonymous: false })); } catch (e) {}
            });
        } else {
            await pg.evaluateOnNewDocument(() => {
                try { localStorage.removeItem('hexworth_firebase_user'); } catch (e) {}
            });
        }
        await pg.goto('http://localhost:' + port + '/' + rel, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 700));
        const state = await pg.evaluate(() => ({
            bodyKids: document.body ? document.body.children.length : 0,
            tele: document.querySelectorAll('script[src*="ObservatoryTelemetry.js"]').length,
            faTags: document.querySelectorAll('script[src*="FirebaseAuth.js"]').length,
            faDefined: typeof FirebaseAuth !== 'undefined'
        }));
        await pg.close();
        return { state, errs };
    }

    for (const rel of PAGES) {
        console.log('\n--- ' + rel);
        const { state, errs } = await loadPage(rel, true);
        const collision = errs.filter(e => /already been declared|ObservatoryTelemetry|is not defined.*Firebase/i.test(e));
        console.log('    bodyKids=' + state.bodyKids + ' teleTags=' + state.tele + ' faTags=' + state.faTags + ' faDefined=' + state.faDefined + ' pageerrors=' + errs.length);
        check(state.bodyKids > 0, 'page rendered (body has content) - injection did not break HTML');
        check(state.tele === 1, 'exactly one ObservatoryTelemetry.js tag');
        check(state.faTags <= 1, 'no duplicate FirebaseAuth.js tag (<=1) - no two-loader collision');
        check(collision.length === 0, 'no FirebaseAuth-redeclaration / telemetry error (' + (collision[0] || 'none') + ')');
    }

    // Cost gate in situ: a bare (faStatic=0) page with NO signed-in hint must load NO FirebaseAuth.
    console.log('\n--- cost gate (no hint): projects/shield-ids-ml.html');
    const cg = await loadPage('projects/shield-ids-ml.html', false);
    console.log('    faTags=' + cg.state.faTags + ' teleTags=' + cg.state.tele);
    check(cg.state.tele === 1, 'telemetry tag present but inert');
    check(cg.state.faTags === 0, 'NO FirebaseAuth.js loaded without a signed-in hint (zero cost in situ)');

    await browser.close();
    await new Promise(r => srv.close(r));
    console.log(pass ? '\n*** INJECT SMOKE OK ***' : '\n*** INJECT SMOKE FAILED ***');
    process.exit(pass ? 0 : 1);
})();
