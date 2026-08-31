#!/usr/bin/env node
/**
 * hex-shell-process.test.js
 *
 * @catalog what    Drives ps/stop/restart in a headless browser against the REAL _app/hex/index.html
 * @catalog what    and the REAL lab-manager response shape. Catches wiring and destructive-ordering bugs.
 * @catalog run     node _tools/hexos/hex-shell-process.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS, AND WHY IT LOADS THE ACTUAL PAGE
 * ------------------------------------------------
 * The first version of ps/stop/restart shipped a passing 11/11 suite and was DEAD IN PRODUCTION.
 * Two independent failures stacked:
 *
 *   1. The page never loaded SandboxLauncher.js. The edit that was supposed to add the tag anchored
 *      to a <script> line that exists in the module template and not in the shell, and .replace()
 *      silently no-opped. Every one of ps/stop/restart answered "the session manager is not
 *      available on this page" for every student, unconditionally.
 *   2. The suite could not see that, because it assigned window.SandboxLauncher itself. Stubbing the
 *      global made the single most basic wiring fact, whether the object is present at all,
 *      unfalsifiable.
 *
 * So the first assertion here is `typeof window.SandboxLauncher === 'object'` on the unmodified
 * served page, and nothing in this file ever assigns that global. Only the NETWORK is mocked.
 *
 * The mock's shape is copied from the lab-manager source, not guessed:
 *   /home/eq1/hexworth-sandbox/lab-manager/server.js:1475 (GET /api/sandbox/list)
 *     -> { sandboxes: [ { sessionId, labId, lab, status:'running'|'stopped', ageMinutes, url } ] }
 * An earlier revision triangulated `r.sessions || r.data || r`. All three guesses were wrong,
 * since the key is `sandboxes`, and the test that "proved" them green used a mock the author invented,
 * so it could not have failed. Lab ids below are real ids from SandboxLauncher's LAB_INFO for the
 * same reason: a fixture that invents its inputs only ever tests itself.
 *
 * AUTH IS ENFORCED BY THIS HARNESS, DELIBERATELY. The mock rejects any request without a real
 * `Authorization: Bearer` header, exactly as lab-manager does (verifyAuth, lab-manager-server.js:793
 * where DEV_MODE is false in production, so the X-Dev-Uid fallback is unreachable there). And the
 * FirebaseAuth stub is delivered by INTERCEPTING ITS SCRIPT REQUEST, not by assigning
 * window.FirebaseAuth. That distinction is the whole point: if the page ever stops loading
 * FirebaseAuth.js, the request never fires, the stub never lands, getIdToken() returns null,
 * apiCall() sends X-Dev-Uid, and this suite goes red. Assigning the global instead would recreate
 * the precise blind spot that let ps/stop/restart ship dead: a mock cannot fail the thing it is
 * not checking. hex/index.html was the only one of 38 SandboxLauncher pages missing that tag.
 *
 * NOT COVERED BY THIS SUITE, stated plainly rather than left to be discovered: the 90s watchdog
 * that releases the in-flight lock when a request never settles. fetch() in SandboxLauncher.apiCall
 * has no timeout, so a stalled connection would otherwise hold the lock for the life of the tab.
 * The mock always answers, and a 90s test would dominate the run, so the watchdog is verified by
 * reading the code only. Treat it as unverified behaviour if you change it.
 *
 * The `server-only-lab` case is a regression guard for a genuinely destructive ordering bug: restart
 * destroyed the box and THEN discovered it could not relaunch it, because the server may know a lab
 * this client's LAB_INFO does not. "Your box is gone and I cannot make another" is the one outcome a
 * student running restart on a frozen lab must never get.
 */
const http = require('http'), fs = require('fs'), path = require('path');
let puppeteer; try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; cannot verify the real page. Refusing to fake a pass.');
    process.exit(2);
}
const APP = path.resolve(__dirname, '../../_app'), PORT = 9087;
const API_LATENCY_MS = 250;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*',
               'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS' };

function fixture() {
    return [
        { sessionId: 'sess-abc', labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 12, url: 'https://x/s/sess-abc/' },
        { sessionId: 'sess-frz', labId: 'db-sql', lab: 'SQL',    status: 'stopped', ageMinutes: 47, url: null },
        { sessionId: 'sess-unk', labId: 'server-only-lab', lab: 'Newer', status: 'running', ageMinutes: 3, url: 'https://x/' },
    ];
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
    let live = fixture();
    let sawFirebaseAuth = false;
    const unauth = [];
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage(), calls = [];
    await pg.setRequestInterception(true);
    pg.on('request', r => {
        const u = r.url(), m = r.method();
        // AccessGuard only: it redirects an unauthenticated headless browser away from the page.
        // SandboxLauncher is deliberately NOT stubbed. Proving it loads is the point.
        if (/AccessGuard\.js$/.test(u)) {
            return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        }
        // Stubbed via the REQUEST, so the tag's absence is detectable. See the header note.
        if (/FirebaseAuth\.js$/.test(u)) {
            sawFirebaseAuth = true;
            return r.respond({ status: 200, contentType: 'text/javascript', body:
                'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},' +
                'isSignedIn:function(){return true;},' +
                'refreshToken:function(){return Promise.resolve("test-id-token");}};' });
        }
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            // LATENCY IS LOAD-BEARING. With instant responses a "double fire" is really two
            // sequential runs, and the concurrency bug this suite exists to catch cannot occur.
            // 250ms is a plausible round trip and opens the same window a student's second Enter
            // press lands in.
            const J = (o, st) => setTimeout(() => r.respond({ status: st || 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), API_LATENCY_MS);
            // Mirror verifyAuth: production has DEV_MODE false, so no Bearer means 401.
            const auth = r.headers()['authorization'] || '';
            if (!auth.startsWith('Bearer ')) {
                unauth.push(m + ' ' + u.replace(/.*\/api\/sandbox/, '').split('?')[0]);
                return J({ error: 'Missing or invalid Authorization header' }, 401);
            }
            calls.push(m + ' ' + u.replace(/.*\/api\/sandbox/, '').split('?')[0]);
            if (/\/list/.test(u)) return J({ sandboxes: live });
            const d = u.match(/\/destroy\/([^/?]+)/);
            if (d) {
                if (!live.some(x => x.sessionId === d[1])) return J({ error: 'Session not found' }, 404);
                live = live.filter(x => x.sessionId !== d[1]);
                return J({ status: 'destroyed' });
            }
            if (/\/launch/.test(u)) {
                live.push({ sessionId: 'sess-new', labId: 'db-sql', lab: 'SQL', status: 'running', ageMinutes: 0, url: 'https://x/' });
                return J({ sessionId: 'sess-new', url: 'https://x/' });
            }
            return J({});
        }
        r.continue();
    });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    let pass = 0, fail = 0;
    const chk = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 110)}`); };
    async function run(s) {
        await pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });
        await pg.click('#cmd'); await pg.type('#cmd', s); await pg.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 1200));
        return pg.evaluate(() => document.getElementById('out').innerText.trim());
    }

    chk('SandboxLauncher is present on the REAL page', await pg.evaluate(() => typeof window.SandboxLauncher) === 'object');
    chk('the page REQUESTED FirebaseAuth.js', sawFirebaseAuth,
        'without it every apiCall sends X-Dev-Uid and production 401s');
    let o = await run('ps');
    chk('ps parses the real `sandboxes` key', /arctic/.test(o) && /sess-abc/.test(o), o);
    chk('ps surfaces a STOPPED session and explains it', /db-sql/.test(o) && /stopped/.test(o) && /holds its slot/i.test(o), o);
    chk('ps reports age from ageMinutes', /12m/.test(o) && /47m/.test(o), o);
    o = await run('stop arena');    chk('a PAGE is not a process', /not a running process/i.test(o), o);
    o = await run('stop bogus-x');  chk('unknown name is named and escaped', /bogus-x/.test(o) && !/<script/.test(o), o);
    o = await run('stop sess-abc'); chk('stop accepts a SESSION id', /stopping|stopped/i.test(o), o);
    chk('  -> issued DELETE /destroy/sess-abc', calls.includes('DELETE /destroy/sess-abc'), calls.join('|'));
    o = await run('ps');            chk('ps reflects server state after stop', !/sess-abc/.test(o), o);

    const before = calls.length;
    o = await run('restart server-only-lab');
    chk('restart REFUSES a lab it cannot relaunch', /would destroy|does not know how to launch/i.test(o), o);
    chk('  -> and destroyed nothing', !calls.slice(before).some(c => /DELETE/.test(c)), calls.slice(before).join('|'));
    chk('  -> and says nothing was changed', /nothing was changed/i.test(o), o);

    o = await run('restart db-sql'); await new Promise(r => setTimeout(r, 1400));
    chk('restart a stopped lab: destroy THEN launch',
        calls.includes('DELETE /destroy/sess-frz') && calls.some(c => /POST \/launch/.test(c)), calls.join('|'));
    chk('  -> reports clean state', /restarted|clean state/i.test(o), o);
    o = await run('ps');            chk('ps shows the fresh box', /sess-new/.test(o), o);
    // TOCTOU: two Enter presses inside one round-trip made restart destroy once and launch TWICE,
    // orphaning a second capacity-consuming session reachable only by an id the student never saw.
    live = fixture();
    const b4 = calls.length;
    await pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await pg.click('#cmd'); await pg.type('#cmd', 'restart db-sql'); await pg.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 120));   // first chain still in flight (250ms/hop)
    await pg.type('#cmd', 'restart db-sql'); await pg.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    const win = calls.slice(b4);
    chk('double-fire restart launches exactly ONCE', win.filter(c => /POST \/launch/.test(c)).length === 1, win.join('|'));
    chk('  -> and destroys exactly once', win.filter(c => /DELETE/.test(c)).length === 1, win.join('|'));
    chk('  -> second press is refused, not queued',
        /already running/i.test(await pg.evaluate(() => document.getElementById('out').innerText)), '');
    o = await run('ps');
    chk('  -> no orphaned duplicate session', (o.match(/db-sql/g) || []).length === 1, o);

    // Lock release is checked by OUTCOME, because the harness cannot see the variable. procBusy is
    // declared inside the page's IIFE and never attached to window, so an earlier version of this
    // check, `typeof procBusy === 'undefined' ? 'n/a' : procBusy) !== 'restart'`, read undefined in
    // every case and evaluated true whether the lock was held or not. It was written specifically to
    // answer "is the lock released?" and could not have failed. A later command being ACCEPTED is an
    // observable consequence of release, and it does fail if the lock wedges.
    o = await run('stop db-sql');
    chk('lock RELEASED: a later command is accepted, not refused',
        !/already running/i.test(o) && /stopping|stopped|nothing|no lab/i.test(o), o);

    chk('every request carried a Bearer token', unauth.length === 0, unauth.join('|'));
    const html = await pg.evaluate(() => document.getElementById('out').innerHTML);
    chk('no injection in rendered output', !/<script|onerror=/i.test(html));
    chk('no uncaught page errors', errs.length === 0, errs[0]);

    console.log(`\n  ${pass}/${pass + fail} passed`);
    await b.close(); srv.close();
    process.exitCode = fail ? 1 : 0;
});
