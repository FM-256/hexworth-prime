// Self-verify harness for ObservatoryTelemetry.js (Batch 1 completion capture).
// Proves: (a) a signed-in user's completionStamp:marked fires exactly one
// content_complete beacon with the correct CF-contract body; (b) score passes
// through for a quiz and is null for a module; (c) with NO signed-in user the
// lib is a silent no-op (no beacon); (d) window.ObservatoryTelemetry is exposed.
const fs = require('fs');
const path = require('path');
const http = require('http');
const pup = require('puppeteer');
const LIB = fs.readFileSync(path.resolve('_app/components/ObservatoryTelemetry.js'), 'utf8');
const ENDPOINT = 'https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';

// A real http origin so localStorage is available to the page.
const srv = http.createServer((q, s) => {
    s.writeHead(200, { 'Content-Type': 'text/html' });
    s.end('<!doctype html><html><head></head><body>harness</body></html>');
});

// Run the lib in a page where FirebaseAuth is stubbed to a given user, capturing
// every sendBeacon call. Then dispatch the completion events and return captures.
async function run(browser, port, user, events) {
    const pg = await browser.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e.message)));
    await pg.goto('http://localhost:' + port + '/', { waitUntil: 'domcontentloaded' });
    await pg.evaluate((u) => {
        window.__beacons = [];
        navigator.sendBeacon = function (url, blob) { window.__beacons.push({ url: url, _blob: blob }); return true; };
        window.FirebaseAuth = {
            waitForAuth: async function () { return u; },
            refreshToken: async function () { return u ? 'stub-id-token' : null; }
        };
        window.localStorage.setItem('observatory_consent_' + (u ? u.uid : 'x'), JSON.stringify({ classId: 'summer-2026-aplus' }));
    }, user);
    await pg.addScriptTag({ content: LIB });
    await new Promise(r => setTimeout(r, 300));
    const exposed = await pg.evaluate(() => typeof window.ObservatoryTelemetry === 'object' && typeof window.ObservatoryTelemetry.init === 'function');
    await pg.evaluate((evs) => { evs.forEach(d => window.dispatchEvent(new CustomEvent('completionStamp:marked', { detail: d }))); }, events);
    await new Promise(r => setTimeout(r, 200));
    const beacons = await pg.evaluate(async () => {
        const out = [];
        for (const b of window.__beacons) {
            let body = null;
            try { body = JSON.parse(await b._blob.text()); } catch (e) { body = { _parseError: true }; }
            out.push({ url: b.url, body: body });
        }
        return out;
    });
    await pg.close();
    return { beacons, exposed, errs };
}

(async () => {
    await new Promise(r => srv.listen(0, r));
    const port = srv.address().port;
    const browser = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    let pass = true;
    const check = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) pass = false; };

    const A = await run(browser, port, { uid: 'stu-123' }, [
        { moduleId: 'forge-ch01-motherboards', score: null },
        { moduleId: 'forge-aplus-core1-prep-r1', score: 88 }
    ]);
    console.log('Scenario A (signed-in, 2 completions):');
    check(A.exposed, 'window.ObservatoryTelemetry exposed');
    check(A.errs.length === 0, 'no page errors (' + (A.errs[0] || 'none') + ')');
    check(A.beacons.length === 2, 'exactly 2 beacons fired (got ' + A.beacons.length + ')');
    check(A.beacons.every(b => b.url === ENDPOINT), 'all beacons hit logObservatoryEvent');
    check(A.beacons.every(b => b.body && b.body.type === 'content_complete'), 'type === content_complete');
    check(A.beacons.every(b => b.body && b.body.idToken === 'stub-id-token'), 'idToken carried');
    const mod = A.beacons.find(b => b.body.payload && b.body.payload.moduleId === 'forge-ch01-motherboards');
    const quiz = A.beacons.find(b => b.body.payload && b.body.payload.moduleId === 'forge-aplus-core1-prep-r1');
    check(mod && mod.body.payload.score === null, 'module completion carries score null');
    check(quiz && quiz.body.payload.score === 88, 'quiz completion carries score 88');
    check(A.beacons.every(b => b.body.classId === 'summer-2026-aplus'), 'local classId hint carried');

    const B = await run(browser, port, null, [{ moduleId: 'forge-ch02-expansion-storage', score: null }]);
    console.log('Scenario B (no signed-in user):');
    check(B.exposed, 'window.ObservatoryTelemetry still exposed');
    check(B.beacons.length === 0, 'NO beacon fired without a signed-in user (got ' + B.beacons.length + ')');
    check(B.errs.length === 0, 'no page errors');

    const C = await run(browser, port, { uid: 'stu-9' }, [{ score: 50 }, { moduleId: '', score: 10 }]);
    console.log('Scenario C (malformed completion events):');
    check(C.beacons.length === 0, 'events without a moduleId are ignored (got ' + C.beacons.length + ')');

    await browser.close();
    await new Promise(r => srv.close(r));
    console.log(pass ? '\n*** OBSERVATORY TELEMETRY CHECK OK ***' : '\n*** CHECK FAILED ***');
    process.exit(pass ? 0 : 1);
})();
