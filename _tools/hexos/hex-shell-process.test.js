#!/usr/bin/env node
/**
 * hex-shell-process.test.js
 *
 * @catalog what    Drives ps/stop/restart in a headless browser against the REAL _app/hex/index.html
 * @catalog what    and the REAL lab-manager response shape. Catches wiring and destructive-ordering bugs.
 * @catalog run     node _tools/hexos/hex-shell-process.test.js
 * @catalog note    Wired into post-verify check 4f. THREE concurrency bugs have shipped from
 * @catalog note    this lock across five review rounds; a suite only a human remembers to run
 * @catalog note    is not coverage that survives the next edit.
 * @catalog status  GATE
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
 * THE WATCHDOG AND ITS STALE-SETTLE RACE ARE COVERED, via window.HEX_PROC_TIMEOUT_MS. An earlier
 * revision shipped the watchdog with no test and a header note calling it "verified by reading the
 * code only". Both reviewers then found, independently, that the watchdog's own recovery path
 * reopened the double-mutation race it was built beside: a request that outlived its watchdog still
 * settles later, and the unguarded release nulled a LATER command's lock and cancelled that
 * command's watchdog. One reviewer reproduced two mutating commands running concurrently from a
 * merely slow response. A disclosure is honest only when the risk is unknown; that risk was
 * present and reproducible, so the caveat was wrong and the code needed a test, not a note.
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

// A stale process holding this port otherwise crashes the harness with an uncaught exception,
// so the failure a tired operator sees at 2am is a raw stack trace rather than a clean verdict.
srv.on('error', (e) => {
    console.error(`  harness could not start on port ${PORT}: ${e.code || e.message}`);
    console.error('  a previous run may still be holding it. This is a harness fault, not a');
    console.error('  regression in the shell, but it is still a failure: nothing was verified.');
    process.exit(1);
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

    // ── Watchdog + stale-settle race, on its own page with a short timeout ──────────────
    // Reproduces the sequence both reviewers found: a slow (not hung) request trips the
    // watchdog, a later command takes the lock, and the FIRST request's late settlement must
    // NOT release the later command's lock. Fails against an unguarded clearProc.
    const pg2 = await b.newPage();
    const slow = { 'sess-abc': 4000, 'sess-frz': 12000 };
    let live2 = fixture();
    await pg2.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 3000; });
    await pg2.setRequestInterception(true);
    pg2.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms) => setTimeout(() => r.respond({ status: 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live2 }, 60);
            const d = u.match(/\/destroy\/([^/?]+)/);
            if (d) { live2 = live2.filter(x => x.sessionId !== d[1]); return J({ status: 'destroyed' }, slow[d[1]] || 60); }
            return J({}, 60);
        }
        r.continue();
    });
    await pg2.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type2 = async (cmd) => { await pg2.click('#cmd'); await pg2.type('#cmd', cmd); await pg2.keyboard.press('Enter'); };
    const text2 = () => pg2.evaluate(() => document.getElementById('out').innerText);

    // Timing is load-bearing and each number is chosen, not guessed:
    //   t=0     stop arctic   -> gen1. Its destroy answers at 4000ms.
    //   t=3000  gen1 watchdog fires and releases the lock (correct behaviour).
    //   t=3300  stop db-sql   -> gen2 takes the lock. Its destroy answers at 12000ms, so
    //                            gen2's own watchdog would not fire until t=6300.
    //   t=4000  gen1's ORPHANED request settles. Its release must no-op.
    //   t=4500  restart arctic MUST be refused, because gen2 still holds the lock.
    // Margins are deliberately wide, not merely passing: the assertion at t=4500 sits 1800ms
    // clear of gen2's watchdog at t=6300, and the stale settle at t=4000 sits 700ms clear of
    // gen2 taking the lock. A reviewer measured the previous version at ~300ms of slack and
    // called it tuned-to-this-machine, which was fair.
    // A first attempt used an 800ms timeout, and gen2's own watchdog fired before the
    // assertion, so the test failed for a legitimate release rather than the stale one.
    await type2('stop arctic');
    await new Promise(r => setTimeout(r, 3300));
    chk('watchdog fires on a stalled request', /no longer waiting/i.test(await text2()), (await text2()).slice(-90));
    await pg2.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type2('stop db-sql');                       // gen2 takes the lock, in flight until 12000ms
    await new Promise(r => setTimeout(r, 1200));      // past 4000ms: gen1's orphan settles
    await pg2.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type2('restart arctic');                    // must be REFUSED: db-sql is still in flight
    await new Promise(r => setTimeout(r, 400));
    const after = await text2();
    chk('a stale settle does NOT free a later command\'s lock', /already running/i.test(after), after.slice(0, 110));
    await pg2.close();

    // ── Orphaned restart must not relaunch after a sanctioned retry ────────────────────
    // The watchdog does NOT cancel the in-flight request, and `restart` is TWO mutations.
    // So: slow destroy trips the watchdog, the student follows the shell's own advice and
    // retries, the retry legitimately relaunches, and then the ORIGINAL chain's destroy lands
    // and would launch a second time. Two live sessions for one lab from one intent, with
    // every individual message truthful. Found by a reviewer's probe, not by reading.
    const pg3 = await b.newPage();
    let live3 = fixture();
    const launchLog = [];
    await pg3.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg3.setRequestInterception(true);
    pg3.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms) => setTimeout(() => r.respond({ status: 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live3 }, 60);
            const d = u.match(/\/destroy\/([^/?]+)/);
            // Takes effect server-side IMMEDIATELY; only the RESPONSE is slow. That is what
            // makes the student's `ps` show the lab already gone, which is what invites the retry.
            if (d) { live3 = live3.filter(x => x.sessionId !== d[1]); return J({ status: 'destroyed' }, 3000); }
            if (/\/launch/.test(u)) {
                const id = 'sess-relaunch-' + (launchLog.length + 1);
                launchLog.push(id);
                live3.push({ sessionId: id, labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                return J({ sessionId: id, url: 'https://x/' }, 60);
            }
            return J({}, 60);
        }
        r.continue();
    });
    await pg3.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type3 = async (cmd) => { await pg3.click('#cmd'); await pg3.type('#cmd', cmd); await pg3.keyboard.press('Enter'); };

    await type3('restart arctic');                    // gen1; destroy responds at ~3000ms
    await new Promise(r => setTimeout(r, 1400));      // watchdog fired at 1000ms
    chk('watchdog releases a slow restart', /no longer waiting/i.test(await pg3.evaluate(() => document.getElementById('out').innerText)), '');
    await type3('restart arctic');                    // gen2: the sanctioned retry
    await new Promise(r => setTimeout(r, 2600));      // gen1's destroy now lands
    chk('an orphaned restart does NOT relaunch a second time', launchLog.length === 1, 'launches=' + JSON.stringify(launchLog));
    const ps3 = await (async () => { await pg3.evaluate(() => { document.getElementById('out').innerHTML = ''; });
        await type3('ps'); await new Promise(r => setTimeout(r, 900));
        return pg3.evaluate(() => document.getElementById('out').innerText); })();
    chk('  -> exactly one arctic session survives', (ps3.match(/arctic/g) || []).length === 1, ps3.slice(0, 120));
    await pg3.close();

    // ── The MIRROR leg: a slow LAUNCH, not a slow destroy ──────────────────────────────
    // The slow-destroy fixture above passes even with the launch leg unguarded, so it could not
    // have caught this. Here destroy is fast and launch is the slow leg, and a session becomes
    // listable only once provisioned (ack time == visibility time, the realistic model; the
    // fixture above uses optimistic-destroy instead). The watchdog fires while launch() is in
    // flight, the student retries, list() cannot see the not-yet-provisioned box, and the retry
    // takes the "launching it fresh" branch. Without launchPending that issues a SECOND launch.
    const pg4 = await b.newPage();
    let live4 = fixture().filter(x => x.labId === 'arctic');
    const launch4 = [];
    await pg4.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg4.setRequestInterception(true);
    pg4.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms) => setTimeout(() => r.respond({ status: 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live4 }, 50);
            const d = u.match(/\/destroy\/([^/?]+)/);
            if (d) { live4 = live4.filter(x => x.sessionId !== d[1]); return J({ status: 'destroyed' }, 50); }
            if (/\/launch/.test(u)) {
                const id = 'sess-slow-' + (launch4.length + 1);
                launch4.push(id);
                // Becomes visible ONLY on ack, like a real provision.
                setTimeout(() => {
                    live4.push({ sessionId: id, labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                    r.respond({ status: 200, headers: CORS, contentType: 'application/json',
                                body: JSON.stringify({ sessionId: id, url: 'https://x/' }) });
                }, 3000);
                return;
            }
            return J({}, 50);
        }
        r.continue();
    });
    await pg4.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type4 = async (cmd) => { await pg4.click('#cmd'); await pg4.type('#cmd', cmd); await pg4.keyboard.press('Enter'); };

    await type4('restart arctic');                    // destroy fast, launch slow (3000ms)
    await new Promise(r => setTimeout(r, 1500));      // watchdog fired at 1000ms
    await pg4.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type4('restart arctic');                    // the retry, while launch is outstanding
    await new Promise(r => setTimeout(r, 900));
    const out4 = await pg4.evaluate(() => document.getElementById('out').innerText);
    chk('a retry during an outstanding LAUNCH does not double-launch', launch4.length === 1, 'launches=' + JSON.stringify(launch4));
    chk('  -> and says why, rather than silently doing nothing', /still outstanding/i.test(out4), out4.slice(0, 120));
    await new Promise(r => setTimeout(r, 2600));      // first launch finally acks
    // Assert on the SETTLEMENT message before clearing it. Omitting this is how the settlement
    // guard first shipped unfalsifiable: removing it still passed, because nothing read what the
    // superseded chain printed. A guard no assertion can see is the recurring defect in this file.
    const settle4 = await pg4.evaluate(() => document.getElementById('out').innerText);
    chk('  -> a superseded launch does not claim "restarted from clean state"',
        !/from clean state/i.test(settle4) && /superseded/i.test(settle4), settle4.slice(-140));
    const ps4 = await (async () => { await pg4.evaluate(() => { document.getElementById('out').innerHTML = ''; });
        await type4('ps'); await new Promise(r => setTimeout(r, 800));
        return pg4.evaluate(() => document.getElementById('out').innerText); })();
    chk('  -> exactly one arctic session exists afterwards', (ps4.match(/arctic/g) || []).length === 1, ps4.slice(0, 120));
    await pg4.close();

    // ── A chain that FAILED must not clear a flag it never set ────────────────────────
    // Until this fixture, no test in this file simulated a rejection at all: every mock
    // returned 2xx, so "33/33" covered the happy and slow-happy surface only. A reviewer found
    // the gap by inspection. Sequence: gen1's destroy is slow and then FAILS, so gen1 never
    // reaches `launchPending = true`; meanwhile gen2 legitimately takes the lab and its launch
    // is outstanding. gen1's catch must not delete gen2's entry, or a third retry starts a
    // second box.
    const pg5 = await b.newPage();
    let live5 = fixture().filter(x => x.labId === 'arctic');
    const launch5 = [];
    let destroyCalls = 0;
    await pg5.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg5.setRequestInterception(true);
    pg5.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms, st) => setTimeout(() => r.respond({ status: st || 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live5 }, 50);
            const d = u.match(/\/destroy\/([^/?]+)/);
            if (d) {
                destroyCalls++;
                // FIRST destroy is slow and then FAILS. Second succeeds fast.
                if (destroyCalls === 1) return J({ error: 'Failed to destroy sandbox' }, 2500, 500);
                live5 = live5.filter(x => x.sessionId !== d[1]);
                return J({ status: 'destroyed' }, 50);
            }
            if (/\/launch/.test(u)) {
                const id = 'sess-rej-' + (launch5.length + 1);
                launch5.push(id);
                setTimeout(() => {
                    live5.push({ sessionId: id, labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                    r.respond({ status: 200, headers: CORS, contentType: 'application/json',
                                body: JSON.stringify({ sessionId: id, url: 'https://x/' }) });
                }, 3000);
                return;
            }
            return J({}, 50);
        }
        r.continue();
    });
    await pg5.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type5 = async (cmd) => { await pg5.click('#cmd'); await pg5.type('#cmd', cmd); await pg5.keyboard.press('Enter'); };

    await type5('restart arctic');                    // gen1: destroy slow, then 500
    await new Promise(r => setTimeout(r, 1400));      // gen1 watchdog fired at 1000
    await type5('restart arctic');                    // gen2: destroy fast, launch slow, owns the flag
    await new Promise(r => setTimeout(r, 1500));      // gen1's destroy rejects at ~2550
    // Read gen1's CATCH output before clearing. The previous version cleared here and inspected
    // only the third command, which is why it could not see that a superseded chain was printing
    // "nothing was destroyed" about a session a later chain had already torn down.
    const catch5 = await pg5.evaluate(() => document.getElementById('out').innerText);
    chk('a superseded chain does not claim "nothing was destroyed"',
        !/nothing was destroyed/i.test(catch5) && /superseded/i.test(catch5), catch5.slice(-150));
    // And the stop-side answer must not say a flat "nothing running" while a launch is in flight.
    await pg5.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type5('stop arctic');
    await new Promise(r => setTimeout(r, 700));
    const stop5 = await pg5.evaluate(() => document.getElementById('out').innerText);
    chk('stop reports an outstanding launch instead of a flat "nothing running"',
        /still outstanding|YET/i.test(stop5), stop5.slice(0, 130));
    await pg5.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type5('restart arctic');                    // gen3, after gen2's watchdog freed the lock
    await new Promise(r => setTimeout(r, 900));
    const out5 = await pg5.evaluate(() => document.getElementById('out').innerText);
    chk('a FAILED chain does not clear a flag it never set', launch5.length === 1, 'launches=' + JSON.stringify(launch5));
    chk('  -> the third attempt is refused as still outstanding', /still outstanding/i.test(out5), out5.slice(0, 130));
    await pg5.close();

    console.log(`\n  ${pass}/${pass + fail} passed`);
    await b.close(); srv.close();
    process.exitCode = fail ? 1 : 0;
});
