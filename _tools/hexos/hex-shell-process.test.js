#!/usr/bin/env node
/**
 * hex-shell-process.test.js
 *
 * @catalog what    Drives ps/stop/restart in a headless browser against the REAL _app/hex/index.html
 * @catalog what    and the REAL lab-manager response shape. Catches wiring and destructive-ordering bugs.
 * @catalog run     node _tools/hexos/hex-shell-process.test.js
 * @catalog note    Pre-deploy gate 3.7 in deploy.sh, plus post-verify check 4f. This lock has
 * @catalog note    produced a new concurrency defect in every review round it has been through;
 * @catalog note    a suite only a human remembers to run is not coverage that survives an edit.
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
 * ON THE FLAKINESS QUESTION, recorded rather than dismissed. A reviewer saw two unrelated
 * assertions ("a FAILED chain does not clear a flag it never set", "the third attempt is refused
 * as still outstanding") go red on ONE run out of three, while running a MUTATED copy of
 * index.html with the man fold reverted; his two runs against unmodified HEAD were clean. Four
 * further consecutive runs against HEAD were also clean, so six clean runs total and no
 * reproduction on the real file. That is NOT a proof of absence: both assertions live in the
 * timing-sensitive watchdog block, which uses real timers.
 *
 * ACTED ON RATHER THAN PARKED, after a second reviewer pointed out that parking a diagnosed flake
 * in a GATE-status file wired into deploy.sh gate 3.7 is the worst of both worlds: an intermittent
 * red either blocks a good deploy or teaches someone to re-run until green. The named suspect was
 * the gen3 read in the pg5 block, which waited 900ms against this page's HEX_PROC_TIMEOUT_MS of
 * 1000. A 100ms margin, and I had personally narrowed it earlier the same round by inserting a
 * `stop ARCTIC` case into that sequence. The refusal being asserted is printed SYNCHRONOUSLY when
 * the launchPending check rejects gen3, so the wait bought nothing except a chance for the
 * watchdog to fire mid-read. Now 400ms: waiting LESS is what widens the margin here, which is
 * backwards from the usual instinct and is why it is written down.
 *
 * IT STILL FLAKES, and the claim that it was fixed was made on three clean runs. Observed again
 * 2026-09-03 at 101/103, then 11 consecutive clean runs after it, so roughly 1 in 12. Three clean
 * runs was never enough evidence to call a 1-in-12 event closed, and saying "the hypothesis was
 * tested" let a narrowed margin pass for a fix. The margin change was real and the flake is
 * narrower than it was; it is not gone.
 * This matters because deploy.sh gate 3.7 runs this suite: an intermittent red either blocks a
 * good deploy or teaches an operator to re-run until green, and the second is worse. Tracked as a
 * task rather than left as a comment, because a known flake in a deploy gate is work, not a note.
 * The suspects remain the two assertions in the pg5 watchdog block, which depend on real timers
 * racing a 1000ms watchdog; the durable fix is to make them observe state transitions rather than
 * sleep for a duration.
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
    // Bodies of every POST /launch, so a test can assert WHICH lab id the shell forwarded.
    const launchBodies = [];
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
                'signOut:function(){window.__signedOut=true;return Promise.resolve();},' +
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
                // Record the BODY, not just that a launch happened. SandboxLauncher.js:110 does
                // `if (!LAB_INFO[labId]) throw new Error("Unknown lab: " + labId)` against
                // all-lowercase keys, so the exact spelling the shell forwards is the difference
                // between a relaunch and a thrown error the student sees as
                // "restart failed: Unknown lab: LINUX-MASTERY".
                try { launchBodies.push(JSON.parse(r.postData() || '{}')); } catch (e) { launchBodies.push({}); }
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

    /* ── CASE. Two namespaces reach resolveProcess and only ONE may fold. ────────────────────
     * A reviewer found the sixth case-sensitivity site here, after five others had been fixed
     * in the same commit, and the commit had dismissed this one in writing as "a different
     * namespace, not manifest-convention lowercase". Half true: sessionId is opaque, labId is
     * the identical lowercase manifest space that run/info/ls/cd/tab all match case-insensitively.
     *
     * The cost, reproduced: with arctic RUNNING, `restart ARCTIC` answered "ARCTIC is a page,
     * not a running process. There is nothing to stop; just navigate away." A student who has
     * just learned from tab-completion that capitals are fine, looking at a frozen lab, is told
     * the lab is not running and to walk away from it. False, not merely unhelpful.
     *
     * Both directions are pinned, because they fail oppositely: fold labId or the message above
     * comes back; fold sessionId and the shell claims to match a server handle on a spelling the
     * server never issued. */
    live = fixture();
    const caseBefore = calls.length;
    o = await run('restart ARCTIC');
    await new Promise(r => setTimeout(r, 1400));
    /* ASSERT THE RIGHT OUTCOME, NOT THE ABSENCE OF ONE WRONG ONE. The first version of this line
     * was `!/not a running process/i.test(o)` and it stayed GREEN against the unfixed code: with
     * the fold reverted the shell fell through to a DIFFERENT wrong answer ("no lab or session
     * called ARCTIC"), which the negative did not match. A check that only rules out one of the
     * several ways a thing can be wrong is not a check. */
    chk('restart accepts a CAPITALISED lab id',
        /stopped|relaunch|restarted|clean state/i.test(o) && !/not a running process|no lab or session/i.test(o), o);
    chk('  -> and actually destroyed the running session',
        calls.slice(caseBefore).includes('DELETE /destroy/sess-abc'), calls.slice(caseBefore).join('|'));
    chk('  -> and relaunched it',
        calls.slice(caseBefore).some(c => /POST \/launch/.test(c)), calls.slice(caseBefore).join('|'));

    live = fixture();
    const stopBefore = calls.length;
    o = await run('stop ArCtIc');
    chk('stop accepts a mixed-case lab id',
        /stopping|stopped/i.test(o) && !/not a running process|no lab or session/i.test(o), o);
    chk('  -> and destroyed the right session',
        calls.slice(stopBefore).includes('DELETE /destroy/sess-abc'), calls.slice(stopBefore).join('|'));

    /* The other direction. sessionId is server-issued and copied out of `ps`; matching a
     * DIFFERENT spelling of it would be inventing a promise the server never made. */
    live = fixture();
    const sessBefore = calls.length;
    o = await run('stop SESS-ABC');
    chk('a session id is NOT case-folded',
        /case-sensitive/i.test(o) && /sess-abc/.test(o), o);
    chk('  -> and nothing was destroyed on a near-miss',
        !calls.slice(sessBefore).some(c => /DELETE/.test(c)), calls.slice(sessBefore).join('|'));

    /* THE labKey FALLBACK BRANCH -- a lab that EXISTS in LAB_INFO but is absent from list(),
     * i.e. never launched. A reviewer pointed out that every restart case above targets a lab
     * already in the fixture, so all of them take the loop-match branch and NONE reach the line
     * this round actually changed:
     *     if (allowStopped) return { labId: labKey, sessionId: null, status: 'none' };
     * That line is load-bearing, not cosmetic. Downstream, restart calls SL.launch(t.labId), and
     * SandboxLauncher.js:110 is `if (!LAB_INFO[labId]) throw new Error("Unknown lab: " + labId)`
     * against all-lowercase keys. Returning the raw arg here meant `restart LINUX-MASTERY` on a
     * never-launched lab threw, and the student read "restart failed: Unknown lab: LINUX-MASTERY"
     * -- a SECOND case bug one layer below the one that started this round.
     * `linux-mastery` is a real LAB_INFO id (SandboxLauncher.js:32-49), not an invented fixture. */
    live = fixture();
    const neverBefore = launchBodies.length;
    o = await run('restart LINUX-MASTERY');
    await new Promise(r => setTimeout(r, 1400));
    /* Names the message the BROKEN path actually produces. The first draft of this line ruled out
     * "unknown lab" and "no lab or session" and stayed green against the reverted code, because
     * the failure surfaced as the destructive-refusal branch instead -- "this shell does not know
     * how to launch LINUX-MASTERY". Third time this round that a negative assertion matched the
     * wrong wrong-answer; a check has to name the failure it is guarding against. */
    chk('restart a NEVER-LAUNCHED lab, capitalised, is not refused as unlaunchable',
        !/does not know how to launch/i.test(o) && !/unknown lab/i.test(o)
        && !/no lab or session/i.test(o), o);
    chk('  -> it reports launching fresh rather than claiming nothing to stop',
        /was not running/i.test(o) && /launching it fresh/i.test(o), o);
    chk('  -> and forwards the FOLDED id to launch, which is the spelling LAB_INFO has',
        launchBodies.slice(neverBefore).some(bd => bd.labId === 'linux-mastery'),
        JSON.stringify(launchBodies.slice(neverBefore)));

    /* `man` -- the SEVENTH case-sensitivity site, found by a reviewer sweeping the file after six
     * were fixed. MANUAL's keys are command names, and the shell lowercases the VERB before
     * dispatch, so `man RUN` reached a case-sensitive lookup that contradicted the command line
     * that accepted it. It failed twice: no page, and the near-miss suggester was an indexOf on
     * the same raw argument, so there was no "did you mean" either. */
    o = await run('man RUN');
    chk('man accepts a capitalised command name', /SYNOPSIS/.test(o) && /DESCRIPTION/.test(o), o.slice(0, 120));
    chk('  -> and prints the canonical lowercase NAME', /NAME\s*\n?\s*run\b/.test(o), o.slice(0, 90));
    o = await run('man CD');
    chk('man CD resolves too', /SYNOPSIS/.test(o) && !/no manual page/i.test(o), o.slice(0, 100));
    o = await run('man ST');
    chk('a capitalised PREFIX still gets a did-you-mean', /did you mean/i.test(o) && /stop/.test(o), o.slice(0, 120));
    /* ''.indexOf('') === 0 is true for every key, so an empty argument would otherwise offer the
     * entire manual as near-misses. `man` with no argument is the list command, so drive the guard
     * with whitespace, which is what a fat-fingered student actually sends. */
    o = await run('man    ');
    chk('a blank man argument does not dump every page as a suggestion',
        !/did you mean/i.test(o) || (o.match(/,/g) || []).length < 5, o.slice(0, 120));

    /* TAB. This suite pressed Enter thousands of times and Tab zero times, and that is precisely
     * how an EIGHTH case-sensitivity site survived three rounds of sweeping this file. A reviewer
     * found it by pressing Tab: `completionContext()` read the verb raw and compared it against
     * lowercase literals, so `RUN ar` matched no branch, returned null, and complete() returned
     * silently. Not a wrong completion, NO completion, and no message either, which is
     * indistinguishable from a dead key.
     *
     * The lowercase control is not optional. Asserting only that `RUN ar` completes cannot
     * distinguish a working fold from a Tab handler that offers everything to everyone. */
    async function tab(s) {
        await pg.evaluate(() => { document.getElementById('out').innerHTML = ''; });
        await pg.evaluate(() => { document.getElementById('cmd').value = ''; });
        await pg.click('#cmd'); await pg.type('#cmd', s);
        await pg.keyboard.press('Tab');
        await new Promise(r => setTimeout(r, 350));
        const res = await pg.evaluate(() => ({
            value: document.getElementById('cmd').value,
            out: document.getElementById('out').innerText.trim()
        }));
        /* CLEAR THE INPUT. Tab does not submit, so whatever it completed stays in the box, and
           the next run() types onto the end of it. The first version of this helper left "ps "
           behind and turned the very next command into `ps restart server-only-lab`, failing two
           assertions that had nothing to do with Tab. A helper that leaks state into its
           successors produces failures in innocent tests, which is the worst kind to debug.

           WHAT THIS LINE DOES NOT DO, since a reviewer caught the comment claiming credit it had
           not earned: it does not reset `tabState`, the cycling state that makes a second Tab
           advance to the next candidate. That is only cleared by a non-Tab keydown (see the
           keydown handler in index.html). What actually protects the next call is `pg.type()`,
           which dispatches a real keydown PER CHARACTER and nulls the stale state before the next
           Tab press. So every current call site is safe because it re-types a non-empty string,
           not because of this assignment. A future `tab('')`, or a variant that presses Tab twice
           without retyping, would silently inherit the previous cycle. */
        await pg.evaluate(() => { document.getElementById('cmd').value = ''; });
        return res;
    }
    let t = await tab('run ar');
    const lowerWorks = /arctic|arena/.test(t.out) || /arctic|arena/.test(t.value);
    chk('CONTROL: lowercase `run ar` + Tab completes', lowerWorks, JSON.stringify(t));
    t = await tab('RUN ar');
    chk('`RUN ar` + Tab completes the same way',
        /arctic|arena/.test(t.out) || /arctic|arena/.test(t.value), JSON.stringify(t));
    t = await tab('CD cl');
    chk('`CD cl` + Tab offers places', /cloud/.test(t.out) || /cloud/.test(t.value), JSON.stringify(t));
    t = await tab('Man r');
    chk('`Man r` + Tab offers manual pages', /run/.test(t.out) || /run/.test(t.value), JSON.stringify(t));
    t = await tab('LS clo');
    chk('`LS clo` + Tab offers houses and categories',
        /cloud/.test(t.out) || /cloud/.test(t.value), JSON.stringify(t));
    /* And the silence that hid it. A verb with no completion pool must SAY so, not return
     * nothing: this file's own comment calls silence a first-class bug, and the branch that
     * asserted it sat three lines below a silent return. */
    t = await tab('ps ');
    chk('a verb with no completion pool says so instead of going silent',
        /nothing to complete/i.test(t.out), JSON.stringify(t));
    /* The two null-ctx reasons must not share a sentence. A reviewer caught the first draft
       telling a student "nothing to complete for cd" after `cd cloud extra`, which is false:
       `cd ` completes fine, it is that POSITION that has nothing left. `cd` is a verb WITH a
       pool, so this can only pass if the position case is reported separately. */
    t = await tab('cd cloud extra');
    chk('past the first argument reports POSITION, not a dead verb',
        /nothing more to complete on this line/i.test(t.out)
        && !/nothing to complete for/i.test(t.out), JSON.stringify(t));

    /* TRUE-AND-USELESS ANSWERS, the class the operator's original bug report opened.
     * `run incubator` used to say "no app called incubator" because incubator is a category; that
     * was fixed. The MIRROR was not: `ls games` said "nothing matched" although games is a real
     * app, The Arcade. And the shell offered six suggestions for a mistyped APP while offering
     * none for a mistyped COMMAND, which is its own vocabulary applied unevenly.
     * Found by driving the live shell as a student rather than as a test. */
    o = await run('ls games');
    chk('ls <app-id> explains itself instead of "nothing matched"',
        /is an app, not a category/i.test(o) && /run games/.test(o), o.slice(0, 130));
    o = await run('ls incubator');
    chk('  CONTROL: ls <real category> still lists', /incubator/.test(o) && !/is an app/i.test(o), o.slice(0, 90));
    o = await run('hlep');
    chk('a mistyped command suggests the real one', /did you mean/i.test(o) && /help/.test(o), o.slice(0, 110));
    /* Reworded after a reviewer showed the original compound condition did no work: it checked
       o.split('\n')[1], which is the FIRST response line because line 0 is the echoed command,
       and it only ever passed because neither line contains the literal "try help". `exit` is
       also no longer a synonym at all, so this now asserts the honest answer directly. */
    o = await run('list');
    // Pattern simplified: the tag fragment was applied to an already-stripped string, so it was
    // inert and made the check look stricter than it was.
    chk('a command from another shell is translated, not refused',
        /try ls\b/i.test(o.replace(/<[^>]+>/g, '')) && /not a command here/i.test(o),
        o.slice(0, 120));
    o = await run('open arena');
    /* Was `/run/.test(o)`, which matches the bare substring anywhere and passed even while the
       argument was being dropped. Asserts the whole suggestion. */
    chk('`open arena` suggests `run arena`, argument included',
        /run arena/.test(o) && /not a command here/i.test(o), o.slice(0, 110));
    o = await run('zzzznotathing');
    chk('an unrecognised word gets a model of the shell, not just "try help"',
        /command line, not a search box/i.test(o) && /search zzzznotathing/.test(o), o.slice(0, 140));

    /* THE OTHER THREE MIRRORS. A reviewer asked whether `ls <app>` was the only one. It was not:
     * `info <category>`, `cd <app-id>` and `search <category>` all told a student that a real
     * thing did not exist. `search` was the worst of them, silently returning nothing for 5 of
     * the 7 categories, with no error to notice. */
    /* `run <unknown>` was covered by NO assertion in this suite. A refactor deleted a variable
       the did-you-mean filter used, every failed run threw a ReferenceError and answered
       "something went wrong running that", and 84 assertions here stayed green: only the
       doc-examples gate caught it, on the FAQ's own transcript. Two gates disagreeing is how it
       was found; one of them being blind to the shell's single most common failure path is worth
       fixing rather than relying on the other. */
    o = await run('run arctic');
    chk('run <unknown> suggests real ids and does not throw',
        /no app called/i.test(o) && /arctic-cli/.test(o) && !/something went wrong/i.test(o),
        o.slice(0, 130));

    /* Adding `category` to the search haystack made `search course` return 103 of 192 apps: a
       correct answer and an unusable one. The cap ANNOUNCES itself rather than silently
       truncating, because a top-N that does not say so is how a cap becomes a lie about how much
       there is. Assert both halves: the wall is cut, and the real total is still stated. */
    o = await run('search course');
    chk('a huge result set is capped', !/nothing matched/i.test(o) && /showing the first/i.test(o), o.slice(-120));
    /* DERIVED, NOT FROZEN. This asserted the literal "103 matched", which is the manifest's
       course count TODAY. This suite is deploy.sh gate 3.7, and courses are added routinely, so
       the next course addition would have false-failed a deploy for a reason unrelated to shell
       correctness. A reviewer caught it. The property that matters is that the stated total is
       the REAL total and larger than what is shown, so it is computed from the manifest the
       shell itself reads. */
    const courseTotal = JSON.parse(fs.readFileSync(
        path.join(APP, 'data/hex-apps.json'), 'utf8'))
        .apps.filter((a) => String(a.category).toLowerCase() === 'course').length;
    const statedTotal = parseInt((o.match(/(\d+)\s+matched/) || [])[1], 10);
    chk('  -> and reports the manifest\'s real total, not a frozen number',
        statedTotal === courseTotal && courseTotal > 40,
        `stated ${statedTotal}, manifest has ${courseTotal}`);
    o = await run('search arena');
    chk('  CONTROL: a small result set is not capped', !/showing the first/i.test(o), o.slice(0, 80));

    o = await run('info incubator');
    chk('info <category> explains instead of "no app called"',
        /is a category, not an app/i.test(o) && /ls incubator/.test(o), o.slice(0, 130));
    o = await run('cd games');
    chk('cd <app-id> explains instead of "no such place"',
        /is an app, not a place/i.test(o) && /run games/.test(o), o.slice(0, 130));
    /* Asserts a KNOWN MEMBER of each category comes back, not merely that the output is long and
       does not say "nothing matched". A reviewer pointed out the first version could not tell a
       correct result set from a swamped or wrong one, which is exactly how the `search hub`
       precision regression shipped past it. */
    for (const [cat, member] of [['cert-prep', 'az-104'], ['course', 'adv-linux'],
                                 ['platform', 'arena'], ['incubator', 'cloud-incubator']]) {
        o = await run('search ' + cat);
        chk(`search <${cat}> returns its real members`, o.includes(member), o.slice(0, 90));
    }
    /* PRECISION, the other half. Concatenating category into the haystack made `platform-hub`
       match a search for "hub", so 6 results became 17 and the app actually called `hub` was
       buried among apps whose id and name contain no "hub" at all. */
    o = await run('search hub');
    chk('search hub finds the app called hub', /\bhub\b/.test(o), o.slice(0, 90));
    chk('  -> and is not swamped by the platform-hub category',
        !o.includes('algorithm-chamber') && !o.includes('bug-hunting'), o.slice(0, 140));

    /* SAFETY: a GUESS must never put a destructive verb in front of someone who typed something
     * else. A reviewer reproduced `strt` (a slip for "start") and `top` both suggesting `stop`,
     * the one command that tears down a student's running lab. Mutating commands are now barred
     * from fuzzy matching entirely; they are reachable by typing them, not by being guessed at. */
    /* THE POLICY CHANGED after a reviewer showed the blanket ban stranded the real typo:
       `restrt` is distance 1 from `restart`, closer than `hlep` is to `help`, and the shell
       suggested one while stonewalling the other into a dead end. So mutating commands ARE
       suggested, but only at distance 1, and the suggestion says what they do.
       Both directions are asserted, because either alone is half a policy. */
    for (const [typo, want] of [['restrt', 'restart'], ['sotp', 'stop']]) {
        o = await run(typo);
        chk(`a genuine typo of a destructive command still suggests it (${typo})`,
            new RegExp('did you mean[\\s\\S]*' + want).test(o), o.slice(0, 120));
        chk(`  -> and warns what ${want} does`,
            /ends a running lab session/i.test(o) && /\bps\b/.test(o), o.slice(0, 140));
    }
    for (const typo of ['strt', 'reset']) {
        o = await run(typo);
        chk(`a typo that is NOT close to one (${typo}) never offers a destructive command`,
            !/did you mean[^\n]*\b(stop|restart)\b/i.test(o), o.slice(0, 110));
    }

    /* The FIFTH mirror, found after four were closed and I had said that was all of them. */
    /* SEARCH COVERAGE, both directions, after three attempts at this predicate. Substring was
       too blunt (`hub` matched platform-hub, 17 results); exact was too strict and SILENT
       (`plat` and `cour` returned nothing for 33 and 103 real apps); prefix keeps both. */
    o = await run('search plat');
    chk('search by partial category still finds its apps', /platform/.test(o) && !/nothing matched/i.test(o), o.slice(0, 90));
    o = await run('search cour');
    chk('  -> and for the largest category too', /course/.test(o) && !/nothing matched/i.test(o), o.slice(0, 90));
    o = await run('search hub');
    chk('  -> while `hub` is still not swamped by platform-hub',
        !o.includes('algorithm-chamber') && !o.includes('bug-hunting'), o.slice(0, 130));
    /* THE EXCLUSION ASSERTION APPLIED WHERE IT WAS NEEDED. A reviewer pointed out this exact
       pattern sat three lines above, run only against `hub`, while `platform` was checked with
       "a known member is present" alone. Presence cannot detect swamping, which is why
       platform-hub merging into `search platform` shipped past 93 green checks. */
    o = await run('search platform');
    chk('search <exact category> returns only that category',
        o.includes('arena') && !o.includes('algorithm-chamber'), o.slice(0, 130));
    o = await run('search plat');
    chk('  -> but a partial still spans both, since it names neither exactly',
        o.includes('algorithm-chamber'), o.slice(0, 110));

    /* Short destructive names have real-word neighbours at distance 1. `atop` is a Linux
       monitoring tool this platform actually teaches, and it was landing on `stop`. */
    o = await run('atop');
    chk('a real word one edit from a destructive command does not suggest it',
        !/did you mean[^\n]*stop/i.test(o), o.slice(0, 110));

    /* ONE POLICY FOR DESTRUCTIVE SUGGESTIONS, across all three stages. The earlier claim was true
       only of the typo stage: a single `s` offered `stop` and a single `r` offered `restart`,
       because the prefix and substring stages had no filter at all. */
    o = await run('s');
    chk('a single keystroke never offers a destructive command', !/\bstop\b/.test(o), o.slice(0, 90));
    o = await run('r');
    chk('  -> nor does `r` offer restart', !/\brestart\b/.test(o), o.slice(0, 90));
    o = await run('sto');
    chk('  CONTROL: three characters of prefix still reaches stop', /\bstop\b/.test(o), o.slice(0, 90));

    o = await run('stop incubator');
    chk('stop <group> names what the word is instead of a bare denial',
        /is a category of apps, not a lab/i.test(o), o.slice(0, 130));

    /* Tab on stop/restart had no branch at all, so it returned in silence: the dead-key symptom
       this shell calls a first-class bug, on the two commands most scrutinised this round. */
    {
        await pg.evaluate(() => { document.getElementById('out').innerHTML = '';
                                  document.getElementById('cmd').value = ''; });
        await pg.click('#cmd'); await pg.type('#cmd', 'stop lin'); await pg.keyboard.press('Tab');
        /* WAITS ON THE STATE, NOT ON A DURATION. My first version slept 500ms and read once,
           which is the exact pattern this file's own flake note names as the root cause of the
           1-in-12 intermittent red. A reviewer caught me reintroducing the diagnosed defect in
           the same commit that diagnosed it. Polling for the observable change and giving up
           after a bound cannot lose the race: it either sees the completion or reports honestly
           that nothing arrived. */
        const t = await pg.waitForFunction(() => {
            const v = document.getElementById('cmd').value;
            const o = document.getElementById('out').innerText;
            if (/linux/.test(v) || /linux-mastery/.test(o)) return { v: v, o: o };
            return false;
        }, { timeout: 4000, polling: 50 })
            .then((h) => h.jsonValue())
            .catch(async () => await pg.evaluate(() => ({
                v: document.getElementById('cmd').value,
                o: document.getElementById('out').innerText
            })));
        chk('Tab after `stop` offers lab ids instead of silence',
            /linux-mastery/.test(t.o) || /linux/.test(t.v), JSON.stringify(t));
        await pg.evaluate(() => { document.getElementById('cmd').value = ''; });
    }

    /* THE ACCOUNT-VOCABULARY FUZZY BRANCH, which shipped a regression past a fully green suite
       because not one of these inputs was tested. A reviewer reproduced five broken cases by
       hand. The branch resolves a typo of exit/logout/quit and the other-shell synonyms, and the
       rule that makes it safe is that A REAL COMMAND ALWAYS OUTRANKS IT: my first version checked
       21 words blind to the 12 command names and there are 38 one-edit collisions between them.
       Both directions are pinned, because either alone is half the rule. */
    for (const [typo, want] of [['lgout', /signing out|signed out/i],
                                ['eixt', /nothing to exit/i],
                                ['qiut', /nothing to exit/i]]) {
        o = await run(typo);
        chk(`a typo of an account verb resolves (${typo})`, want.test(o), o.slice(0, 100));
    }
    for (const [typo, cmd] of [['cad', 'cd'], ['can', 'man'], ['mat', 'man']]) {
        o = await run(typo);
        chk(`a real command outranks the account pool (${typo} -> ${cmd})`,
            new RegExp('did you mean[\\s\\S]*\\b' + cmd + '\\b').test(o), o.slice(0, 100));
    }
    /* The worst of the five: these stopped reaching `stop` entirely, so the destructive-action
       warning THIS SAME ROUND added was suppressed from the other direction. */
    for (const typo of ['shop', 'stow']) {
        o = await run(typo);
        chk(`${typo} still reaches stop and keeps its warning`,
            /did you mean[\s\S]*stop/.test(o) && /ends a running lab session/i.test(o), o.slice(0, 130));
    }
    o = await run('top');
    chk('an EXACT synonym still wins over any fuzzy match', /\bps\b/.test(o) && !/stop/.test(o), o.slice(0, 90));
    /* And the shell must quote what was TYPED. The old code assigned through `verb`, and the error
       line echoes it, so `cad` was answered with "cat is not a command" -- a word the student
       never typed. Misquoting someone back to themselves is its own bug. */
    o = await run('dirr');
    chk('the error quotes the typed word, not the correction',
        /\bdirr\b/.test(o) && !/^hex> dirr\s*\n\s*dir is not/m.test(o), o.slice(0, 100));

    /* Tab on `search` was never exercised by this harness, so A2's category pool was asserted and
       not verified. */
    {
        const t2 = await tab('search inc');
        chk('Tab after `search` completes a category',
            /incubator/.test(t2.out) || /incubator/.test(t2.value), JSON.stringify(t2));
    }

    /* THE INVARIANT THE SEARCH FIX SILENTLY DEPENDS ON. `search` resolves a category by exact
       match first and prefix second, and that is only unambiguous while no two category names
       share a prefix. Exactly one such pair exists today (platform / platform-hub) and the
       exact-wins rule handles it. Add an 8th category that prefixes an existing one, say
       `course-advanced` beside `course`, and the ambiguity returns with no guard.
       A reviewer pointed out this predicate has now been wrong three times in three attempts, so
       the invariant is asserted rather than assumed. If this fails, the search predicate needs
       revisiting, not the manifest. */
    {
        const cats = [...new Set(JSON.parse(fs.readFileSync(path.join(APP, 'data/hex-apps.json'), 'utf8'))
            .apps.map((a) => String(a.category || '').toLowerCase()).filter(Boolean))];
        const pairs = [];
        for (const a of cats) {
            for (const b of cats) {
                if (a !== b && b.indexOf(a) === 0) pairs.push(`${a} prefixes ${b}`);
            }
        }
        chk('at most one category-prefix pair exists, which the exact-wins rule handles',
            pairs.length <= 1, `prefix pairs: ${JSON.stringify(pairs)}`);
    }

    /* PRECEDENCE ON A NAME THAT IS BOTH. All 13 houses also exist as app ids (the house-index
       pages), so `cloud` is a valid group AND a valid app. Container verbs must resolve the
       group; thing verbs must resolve the app. A reviewer found this ordering undocumented and
       untested across six call sites, which meant a "let's make these consistent" refactor could
       have flipped `ls cloud` into "cloud is an app, not a category" -- false, and exactly the
       regression class this round has caught four times. Both halves are pinned here. */
    o = await run('ls cloud');
    chk('CONTAINER verb: ls <house> lists the house, not the index page',
        !/is an app, not a category/i.test(o) && /\bapi\b|\baz-104\b/.test(o), o.slice(0, 110));
    o = await run('cd cloud');
    chk('  -> cd <house> scopes to it', /now in cloud/i.test(o) && /house/i.test(o), o.slice(0, 110));
    o = await run('cd /');
    o = await run('info cloud');
    chk('THING verb: info <house> shows the index page record, not the group',
        /\bid\b[\s\S]*cloud/.test(o) && !/is a house, not an app/i.test(o), o.slice(0, 110));

    o = await run('man incubator');
    chk('man <group> explains instead of "no manual page"',
        /is a category, not a command or an app/i.test(o) && /ls incubator/.test(o), o.slice(0, 140));
    o = await run('hlep');
    chk('  CONTROL: a transposition still suggests, so the bar is not just silence',
        /did you mean/i.test(o) && /help/.test(o), o.slice(0, 90));
    o = await run('top');
    chk('`top` points at ps, the read-only one', /\bps\b/.test(o) && !/stop/.test(o), o.slice(0, 100));

    /* Honesty about leaving vs signing out. `logout` used to claim `cd /` "does what you mean",
     * which is false: cd / clears the shell's scope and leaves the student signed in. */
    o = await run('exit');
    /* Second conjunct removed: it tested for a string deleted from the codebase, so it was
       permanently true and rode along with the one real check. Now asserts what the answer must
       CONTAIN, including that it names logout as the thing that actually signs you out. */
    chk('exit does not claim to end a session it cannot end',
        /nothing to exit/i.test(o) && /logout/.test(o), o.slice(0, 130));
    o = await run('logout');
    const signedOut = await pg.evaluate(() => window.__signedOut === true);
    chk('logout actually signs out rather than describing something else', signedOut, o.slice(0, 110));
    o = await run('open arena');
    chk('a synonym carries the argument through', /run arena/.test(o), o.slice(0, 110));

    const before = calls.length;
    o = await run('restart server-only-lab');
    chk('restart REFUSES a lab it cannot relaunch', /would destroy|does not know how to launch/i.test(o), o);
    chk('  -> and destroyed nothing', !calls.slice(before).some(c => /DELETE/.test(c)), calls.slice(before).join('|'));
    chk('  -> and says nothing was changed', /nothing was changed/i.test(o), o);

    /* SLICED. This read the whole cumulative `calls` array, which was a real check only while it
     * happened to be the first launch in the run. The CASE block inserted above it fires its own
     * POST /launch, so `calls.some(...)` became unconditionally true and the launch half of this
     * assertion could no longer fail -- a pre-existing check quietly turned into a proxy by
     * nothing more than insertion order. Found by a reviewer. Scoping it to this command's own
     * window is what makes it independent of whatever runs before it. */
    const stopLabBefore = calls.length;
    o = await run('restart db-sql'); await new Promise(r => setTimeout(r, 1400));
    chk('restart a stopped lab: destroy THEN launch',
        calls.slice(stopLabBefore).includes('DELETE /destroy/sess-frz')
        && calls.slice(stopLabBefore).some(c => /POST \/launch/.test(c)),
        calls.slice(stopLabBefore).join('|'));
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
    /* THE SAME ANSWER IN CAPITALS. launchPending is written from the id the SERVER returned and
     * read from the id the STUDENT typed, so a read keyed one way against a write keyed the other
     * reports "nothing pending" and the student is told their box is simply gone -- while a launch
     * for it is in flight. Every key now goes through pKey(); this is what proves it, and the
     * lowercase case above is kept rather than replaced, since the two spellings take different
     * paths to the same map. */
    await pg5.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type5('stop ARCTIC');
    await new Promise(r => setTimeout(r, 700));
    const stopCaps5 = await pg5.evaluate(() => document.getElementById('out').innerText);
    chk('  -> and reports it for a CAPITALISED id too',
        /still outstanding|YET/i.test(stopCaps5), stopCaps5.slice(0, 130));
    await pg5.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await type5('restart arctic');                    // gen3, after gen2's watchdog freed the lock
    /* READ EARLY, not late. This was 900ms against this page's HEX_PROC_TIMEOUT_MS of 1000, a
       100ms margin, and a reviewer named it as the suspect behind two assertions that went red
       once in three runs on a mutated tree. The refusal being asserted is printed SYNCHRONOUSLY
       when the launchPending check rejects gen3, so there is nothing to wait for; the only thing
       the extra delay bought was a chance for the watchdog to fire mid-read. Waiting less is
       strictly safer here, which is the opposite of the usual fix and the reason it is worth a
       comment. I also lengthened this sequence earlier in the round by inserting a `stop ARCTIC`
       case above, so the margin was mine to tighten and mine to restore. */
    await new Promise(r => setTimeout(r, 400));
    const out5 = await pg5.evaluate(() => document.getElementById('out').innerText);
    chk('a FAILED chain does not clear a flag it never set', launch5.length === 1, 'launches=' + JSON.stringify(launch5));
    chk('  -> the third attempt is refused as still outstanding', /still outstanding/i.test(out5), out5.slice(0, 130));
    await pg5.close();

    // ── A superseded STOP must not narrate the box either ──────────────────────────────
    // The pg2 fixture races stop against a stop of a DIFFERENT lab, so its stale settlement is
    // cosmetically harmless and gets wiped before any assertion sees it. Point the race at the
    // SAME lab and the stale chain claims the slot is back in the pool while a fresh box runs.
    // Both reviewers found this; one reproduced it. Nothing in the suite covered it.
    const pg6 = await b.newPage();
    let live6 = fixture().filter(x => x.labId === 'arctic');
    await pg6.evaluateOnNewDocument(() => { window.HEX_PROC_TIMEOUT_MS = 1000; });
    await pg6.setRequestInterception(true);
    pg6.on('request', r => {
        const u = r.url(), m = r.method();
        if (/AccessGuard\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){}};' });
        if (/FirebaseAuth\.js$/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body:
            'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve();},isSignedIn:function(){return true;},refreshToken:function(){return Promise.resolve("t");}};' });
        if (/sandbox\.hexworth\.tech/.test(u)) {
            if (m === 'OPTIONS') return r.respond({ status: 204, headers: CORS });
            const J = (o, ms) => setTimeout(() => r.respond({ status: 200, headers: CORS,
                contentType: 'application/json', body: JSON.stringify(o) }), ms);
            if (/\/list/.test(u)) return J({ sandboxes: live6 }, 50);
            const d = u.match(/\/destroy\/([^/?]+)/);
            // Lands server-side at once; the RESPONSE is what is slow.
            if (d) { live6 = live6.filter(x => x.sessionId !== d[1]); return J({ status: 'destroyed' }, 4000); }
            if (/\/launch/.test(u)) {
                live6.push({ sessionId: 'sess-fresh', labId: 'arctic', lab: 'Arctic', status: 'running', ageMinutes: 0, url: 'https://x/' });
                return J({ sessionId: 'sess-fresh', url: 'https://x/' }, 50);
            }
            return J({}, 50);
        }
        r.continue();
    });
    await pg6.goto(`http://127.0.0.1:${PORT}/hex/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const type6 = async (cmd) => { await pg6.click('#cmd'); await pg6.type('#cmd', cmd); await pg6.keyboard.press('Enter'); };

    await type6('stop arctic');                       // gen1; destroy response takes 4000ms
    await new Promise(r => setTimeout(r, 1400));      // watchdog fired at 1000ms
    await type6('restart arctic');                    // gen2 relaunches the SAME lab, legitimately
    await new Promise(r => setTimeout(r, 1200));
    await pg6.evaluate(() => { document.getElementById('out').innerHTML = ''; });
    await new Promise(r => setTimeout(r, 2600));      // gen1's stale destroy settles ~4100ms
    const stale6 = await pg6.evaluate(() => document.getElementById('out').innerText);
    chk('a superseded STOP does not claim the slot is back in the pool',
        !/slot is back in the pool/i.test(stale6), stale6.slice(0, 140));
    // `|| stale6.trim() === ''` used to be here and made this assertion unable to distinguish
    // "correctly reported as superseded" from "said nothing at all" -- a silent `return` with no
    // say() is a worse bug than a wrong message, and this would have passed it. Demand the text.
    chk('  -> it says it was superseded instead', /superseded/i.test(stale6), stale6.slice(0, 140));
    await pg6.close();

    console.log(`\n  ${pass}/${pass + fail} passed`);
    await b.close(); srv.close();
    process.exitCode = fail ? 1 : 0;
});
