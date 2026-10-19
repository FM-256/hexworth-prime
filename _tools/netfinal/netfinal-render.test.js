#!/usr/bin/env node
/**
 * netfinal-render.test.js — the Network+ final, PAINTED, in a real browser.
 *
 * @catalog what    Serves the REAL exam page to headless Chrome and drives a student sitting
 * @catalog what    against the REAL server modules over a local bridge: brief, tabs, answers,
 * @catalog what    reload-restore, the review table, the half-answer warning, and submit.
 * @catalog run     node _tools/netfinal/netfinal-render.test.js
 * @catalog note    Nothing here touches production. No Firestore, no Cloud Functions, no emulator,
 * @catalog note    no functions/.env, so no webhook can fire. The store is NETFINAL.memoryStore().
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * The other eight netfinal suites carry 1440 assertions and every one of them measures the ENGINE,
 * the page's functions extracted and run in isolation, or the page's TEXT. None of them can tell
 * whether the page PAINTS. That gap is not theoretical: this exam went live and was completely dead
 * for about 25 minutes because `netfinalStart` was called before FirebaseAuth had resolved, and the
 * suites were green throughout, because nothing loaded the page. Then the brief and the answer
 * review shipped through two gate rounds without any browser having rendered either one.
 *
 * Taskboard 441 asks for a human to sit the exam, and that is still owed. This closes the part a
 * machine can close: that the document loads, the surfaces paint with non-zero boxes, the tabs
 * respond to a real click, a typed answer survives a real reload, and the warnings a student is
 * supposed to see are actually on the screen.
 *
 * WHAT IS REAL HERE, AND WHAT IS NOT
 * ----------------------------------
 * REAL: the served page, byte for byte from _app. The browser. Every netfinal server module, called
 * through the same argument mapping production uses (functions/index.js:11395-11428, copied field
 * for field, not paraphrased). The generated lab, its faults, its 50 questions, its grading.
 *
 * STUBBED: exactly three component scripts, and only by INTERCEPTING THEIR REQUESTS. Nothing in this
 * file assigns a global on the page. That rule is borrowed from _tools/hexos/hex-shell-process.test.js,
 * whose header records why: an earlier harness assigned `window.SandboxLauncher` itself, which made
 * the most basic wiring fact -- whether the page loads the script at all -- unfalsifiable, and a
 * dead page shipped with a green suite. So `FirebaseAuth` arrives as a served script, and the first
 * assertion below is that the page's own three <script src> tags were all requested.
 *
 * NOT REAL, and so NOT CLAIMED: Firebase Auth, Firestore, the Cloud Functions transport, and real
 * network latency. A student's session in production is held in Firestore behind optimistic
 * concurrency; here it is a memory store with the same copy-on-write contract. This suite cannot
 * prove the deployed callables are wired, which is what netfinal-page.test.js section 1 is for.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const NF = path.join(REPO, 'functions/netfinal');

const NETFINAL = require(path.join(NF, 'netfinal-exam.js'));
const EXAMS = require(path.join(NF, 'netfinal-exams.js'));
const QUESTIONS = require(path.join(NF, 'netfinal-questions.js'));

const PAGE_URL = '/houses/web/network-plus/exams/network-final.exam.html';
const UID = 'render-test-student';

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};
const section = (t) => console.log('\n' + t);

/* The three component scripts the page loads, stubbed by interception. AccessGuard and
 * ObservatoryTelemetry become no-ops: the first would redirect a signed-out visitor away before
 * anything painted, and the second posts telemetry nobody is collecting here. FirebaseAuth gets a
 * real implementation of the two methods the page uses, pointed at the local bridge. */
const STUBS = {
    'AccessGuard.js':
        'window.AccessGuard = { require: function () { /* no-op: auth is stubbed below */ } };',
    'ObservatoryTelemetry.js':
        'window.ObservatoryTelemetry = { log: function () {} };',
    /* waitForAuth resolves a user, because a signed-out page is a one-line "sign in" notice and
     * there would be nothing to render. callFunction speaks to the bridge, which runs the REAL
     * server modules. The page's own `call()` unwraps `.data`, so the shape matches production. */
    'FirebaseAuth.js': [
        'window.FirebaseAuth = {',
        '  waitForAuth: function () { return Promise.resolve({ uid: ' + JSON.stringify(UID) + ' }); },',
        '  callFunction: function (name, data) {',
        '    return fetch("/__call/" + encodeURIComponent(name), {',
        '      method: "POST", headers: { "Content-Type": "application/json" },',
        '      body: JSON.stringify(data || {})',
        '    }).then(function (r) { return r.json(); }).then(function (j) {',
        '      if (j && j.__error) { var e = new Error(j.__error.message); e.code = j.__error.code; throw e; }',
        '      return { data: j };',
        '    });',
        '  }',
        '};'
    ].join('\n')
};

/* THE SAME ARGUMENT MAPPING PRODUCTION USES. Copied from functions/index.js:11395-11428 rather than
 * reconstructed from the page's calls, because a bridge that invents its own mapping tests only
 * itself. `studentId` and `sessionId` are DERIVED here exactly as netfinalCall derives them, and
 * `minutes` comes from the server's duration table, never from the request. */
const store = NETFINAL.memoryStore();
const OPTS = { secret: 'render-test-secret' };
const requested = [];

function dispatch(name, data) {
    const examId = EXAMS.resolveExamId(data.examId);
    const sessionId = UID + '::' + EXAMS.DEFAULT_EXAM_ID;
    switch (name) {
        case 'netfinalStart':
            if (!examId) { throw Object.assign(new Error('Unknown examId.'), { code: 'invalid-argument' }); }
            return NETFINAL.startExam(store,
                { studentId: UID, examId: examId, minutes: EXAMS.durationMinutes(examId) }, OPTS);
        case 'netfinalCommand':
            return NETFINAL.runCommand(store, { sessionId: sessionId, line: data.line }, OPTS);
        case 'netfinalWindow':
            return NETFINAL.renderWindow(store, { sessionId: sessionId, window: data.window }, OPTS);
        case 'netfinalAction':
            return NETFINAL.runAction(store, { sessionId: sessionId, window: data.window,
                action: data.action, params: data.params }, OPTS);
        case 'netfinalRestore':
            return NETFINAL.restoreDevice(store, { sessionId: sessionId, device: data.device }, OPTS);
        case 'netfinalAnswer':
            return NETFINAL.saveAnswer(store, { sessionId: sessionId,
                questionId: data.questionId, value: data.value }, OPTS);
        case 'netfinalSubmit':
            return NETFINAL.submitExam(store, { sessionId: sessionId }, OPTS).then((res) => ({
                submitted: !res.alreadySubmitted, alreadySubmitted: !!res.alreadySubmitted,
                submittedAt: res.submittedAt, report: NETFINAL.studentReport(res.report)
            }));
        default:
            throw Object.assign(new Error('No such callable: ' + name), { code: 'not-found' });
    }
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const srv = http.createServer(async (q, r) => {
    if (q.method === 'POST' && q.url.indexOf('/__call/') === 0) {
        const name = decodeURIComponent(q.url.slice('/__call/'.length));
        let body = '';
        q.on('data', (c) => { body += c; });
        q.on('end', async () => {
            let data = {};
            try { data = body ? JSON.parse(body) : {}; } catch (e) { data = {}; }
            try {
                const out = await dispatch(name, data);
                r.writeHead(200, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify(out === undefined ? null : out));
            } catch (e) {
                /* Shaped like a rejected callable, so the page's own error path runs for real. */
                r.writeHead(200, { 'Content-Type': 'application/json' });
                r.end(JSON.stringify({ __error: { code: e.code || 'internal', message: e.message } }));
            }
        });
        return;
    }
    const clean = q.url.split('?')[0];
    const base = path.basename(clean);
    requested.push(base);
    /* MUTATION TESTING WITHOUT TOUCHING THE TREE. `NETFINAL_RENDER_PAGE` serves a copy of the exam
       page from anywhere, so a mutation can be verified against a scratch file while the real _app
       stays byte-identical. That matters beyond tidiness: mutating a live file while a review agent
       is reading it has already, once, made a reviewer see a defect that did not exist and block a
       correct commit. The page's three component scripts are stubbed by basename above, and its CSS
       is inline, so a lone copy of the one file is a complete fixture. */
    if (process.env.NETFINAL_RENDER_PAGE && clean === PAGE_URL) {
        r.writeHead(200, { 'Content-Type': 'text/html' });
        r.end(fs.readFileSync(process.env.NETFINAL_RENDER_PAGE));
        return;
    }
    if (Object.prototype.hasOwnProperty.call(STUBS, base)) {
        r.writeHead(200, { 'Content-Type': 'application/javascript' });
        r.end(STUBS[base]);
        return;
    }
    const file = path.join(APP, clean.replace(/^\/+/, ''));
    if (!file.startsWith(APP) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        r.writeHead(404); r.end('not found'); return;
    }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    r.end(fs.readFileSync(file));
});

/* Visibility means PAINTED, not merely present in the DOM. A rect is not a paint: an element can
 * have a box and still be invisible behind `visibility`, `opacity` or a zero-height parent, which is
 * why this reads the computed style as well as the rect. */
const VISIBLE = `(el) => {
    if (!el) { return { found: false }; }
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { found: true, w: r.width, h: r.height, display: s.display,
             visibility: s.visibility, opacity: s.opacity,
             text: (el.innerText || '').trim() };
}`;

async function main() {
    await new Promise((res) => srv.listen(0, '127.0.0.1', res));
    const PORT = srv.address().port;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const pg = await browser.newPage();
    await pg.setViewport({ width: 1280, height: 900 });

    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e.message)));
    pg.on('console', (m) => { if (m.type() === 'error') { errors.push('console: ' + m.text()); } });

    const dialogs = [];
    pg.on('dialog', async (d) => { dialogs.push({ type: d.type(), message: d.message() }); await d.dismiss(); });

    try {
        await pg.goto(`http://127.0.0.1:${PORT}${PAGE_URL}`, { waitUntil: 'networkidle0' });

        /* ─── 1. the page loads what it says it loads ─────────────────────────────────────────── */
        section('1. the real page, with only its network stubbed');
        ['AccessGuard.js', 'FirebaseAuth.js', 'ObservatoryTelemetry.js'].forEach((s) => {
            chk('the page requested ' + s, requested.indexOf(s) >= 0,
                'a stub assigned instead of served would make this unfalsifiable');
        });
        chk('no uncaught page error during boot', errors.length === 0, errors.slice(0, 3).join(' | '));

        await pg.waitForSelector('#layout:not([hidden])', { timeout: 10000 });
        const gate = await pg.$eval('#gate', (el) => el.hidden);
        chk('the sign-in gate closed, so the session really started', gate === true);

        /* ─── 2. THE BRIEF PAINTS ─────────────────────────────────────────────────────────────── */
        section('2. the brief, painted');
        const brief = await pg.$eval('#winbody', new Function('return ' + VISIBLE)());
        chk('the window body is visible on load', brief.found && brief.h > 0 && brief.w > 0
            && brief.display !== 'none' && brief.visibility !== 'hidden' && brief.opacity !== '0',
            JSON.stringify(brief).slice(0, 220));
        chk('the page OPENED on the brief, not the terminal',
            /on-call handover/i.test(brief.text), brief.text.slice(0, 120));
        chk('the brief tab is the selected tab',
            await pg.$eval('[data-surface="brief"]', (b) => b.getAttribute('aria-selected')) === 'true');
        chk('the terminal is hidden while the brief is up',
            await pg.$eval('#term', (el) => el.hidden) === true);

        /* The decoy, read from the SERVER's own object and compared with what is on the screen. */
        const started = await store.get(UID + '::' + EXAMS.DEFAULT_EXAM_ID);
        const decoy = started.state.decoyDiagram;
        chk('the stale DNS address is on the screen', brief.text.indexOf(decoy.dnsServer) >= 0,
            'expected ' + decoy.dnsServer);
        chk('the stale switch address is on the screen', brief.text.indexOf(decoy.sw02Mgmt) >= 0,
            'expected ' + decoy.sw02Mgmt);
        chk('the student is told the documentation may be out of date',
            /may be out of date/i.test(brief.text));
        chk('the decoy annotation is NOT on the screen',
            brief.text.indexOf(decoy.note) < 0 && !/intentionally stale/i.test(brief.text),
            'it would announce the trap');
        chk('the real ticket count is on the screen',
            brief.text.indexOf((started.state.tickets || []).length + ' open ticket') >= 0,
            'tickets=' + (started.state.tickets || []).length);

        /* ─── 3. the tabs respond to a REAL click ─────────────────────────────────────────────── */
        section('3. every tab responds to a real click and paints something');
        const tabs = await pg.$$eval('[data-surface]', (bs) => bs.map((b) => b.dataset.surface));
        chk('all nine surfaces are present as tabs', tabs.length === 9, JSON.stringify(tabs));
        for (const t of tabs) {
            await pg.click('[data-surface="' + t + '"]');
            await pg.waitForFunction(
                `(() => { const b = document.getElementById('winbody'), tm = document.getElementById('term');
                   const live = ${JSON.stringify(t)} === 'terminal' ? tm : b;
                   return live && !live.hidden && (live.innerText || '').trim().length > 0
                          && !/^Loading/.test((b.innerText || '').trim()); })()`,
                { timeout: 8000 }).catch(() => {});
            const box = await pg.$eval(t === 'terminal' ? '#term' : '#winbody',
                new Function('return ' + VISIBLE)());
            chk('the ' + t + ' tab paints with content', box.found && box.h > 0 && box.text.length > 0
                && !/^Loading/.test(box.text),
                JSON.stringify({ h: box.h, text: box.text.slice(0, 80) }));
        }

        /* ─── 4. a typed answer, and a REAL reload ────────────────────────────────────────────── */
        section('4. an answer survives a real browser reload');
        const qs = QUESTIONS.forStudent(started.state);
        const textQ = qs.find((q) => q.kind === 'text');
        await pg.click('[data-surface="terminal"]');
        await pg.type('[data-q="' + textQ.id + '"]', '10.20.30.40');
        await pg.$eval('[data-q="' + textQ.id + '"]', (el) => el.blur());
        await pg.waitForFunction(
            `document.getElementById('qq-${textQ.id}').classList.contains('answered')`,
            { timeout: 8000 }).catch(() => {});
        chk('the card is marked answered after a real keystroke and blur',
            await pg.$eval('#qq-' + textQ.id, (el) => el.classList.contains('answered')));
        const saved = await store.get(UID + '::' + EXAMS.DEFAULT_EXAM_ID);
        /* The server stores `{ value, atEvent }`, not the bare value: `atEvent` is the event-log
           position the answer was given at, which `gradeSequence` needs. The page never sees the
           wrapper because `savedAnswers` unwraps it. Asserted on `.value` for that reason, and the
           wrapper is asserted too, so a change of shape shows up here rather than in grading. */
        const stored = (saved.state.answers || {})[textQ.id];
        chk('the SERVER stored what was typed',
            stored && stored.value === '10.20.30.40', JSON.stringify(stored));
        chk('and stored it with the event position grading needs',
            stored && typeof stored.atEvent === 'number', JSON.stringify(stored));

        await pg.reload({ waitUntil: 'networkidle0' });
        await pg.waitForSelector('#layout:not([hidden])', { timeout: 10000 });
        chk('after a reload the answer is back in the control',
            await pg.$eval('[data-q="' + textQ.id + '"]', (el) => el.value) === '10.20.30.40',
            'this is the data-loss case a saved answer must not hit');
        chk('and the card is still marked answered',
            await pg.$eval('#qq-' + textQ.id, (el) => el.classList.contains('answered')));

        /* ─── 5. THE HALF ANSWER, on screen, which is what Chris blocked on ───────────────────── */
        section('5. a half-filled two-field answer, as a student sees it');
        const acl = qs.find((q) => q.kind === 'aclref');
        const nameSel = '[data-q="' + acl.id + '"][data-part="name"]';
        const options = await pg.$eval(nameSel, (el) =>
            Array.prototype.map.call(el.options, (o) => o.value).filter((v) => v !== ''));
        chk('the ACL dropdown has real options to pick', options.length > 0, JSON.stringify(options));
        await pg.select(nameSel, options[0]);
        /* WAIT ON THE SERVER, NOT ON THE CARD. The first version of this waited for the card to NOT
           carry `.answered`, which was ALREADY TRUE before the select -- the question had never been
           answered -- so the wait returned instantly and the header was read before the save had
           round-tripped. A wait whose condition starts satisfied is not a wait, and it produced two
           false failures that looked exactly like product defects. The store is the authority on
           whether the half answer landed, so the harness blocks on that. */
        const sid = UID + '::' + EXAMS.DEFAULT_EXAM_ID;
        const deadline = Date.now() + 8000;
        let half = null;
        while (Date.now() < deadline) {
            const st = await store.get(sid);
            const a = (st.state.answers || {})[acl.id];
            if (a && a.value && a.value.name) { half = a.value; break; }
            await new Promise((r) => setTimeout(r, 50));
        }
        chk('the half answer reached the server, so the checks below are about the UI',
            !!half && half.name === options[0] && (half.seq === '' || half.seq === undefined),
            JSON.stringify(half));
        chk('picking ONLY the ACL name does not mark the question answered',
            await pg.$eval('#qq-' + acl.id, (el) => el.classList.contains('answered')) === false,
            'this is BUG-285: one half of two lit the card and entered the header count');

        /* Now wait for the thing being asserted. On a regression this times out and the assertion
           below fails, which is the point: the wait cannot mask a broken feature. */
        await pg.waitForFunction(`/part-filled/.test(document.getElementById('qcount').textContent)`,
            { timeout: 8000 }).catch(() => {});
        const hdr1 = await pg.$eval('#qcount', (el) => el.textContent);
        chk('the header reports it as part-filled, not as a written answer',
            /part-filled/.test(hdr1) && /1 \/ \d+ written answers/.test(hdr1), hdr1);

        await pg.click('[data-surface="review"]');
        await pg.waitForFunction(`/part answered/i.test(document.getElementById('winbody').innerText)`,
            { timeout: 8000 }).catch(() => {});
        const rev = await pg.$eval('#winbody', (el) => el.innerText);
        chk('the review names the question and the missing half',
            rev.indexOf('Q' + acl.n + ' is only part answered') >= 0
            && /the sequence number/.test(rev), rev.slice(0, 200));
        chk('the review does not give the all-clear', !/has a complete answer recorded/.test(rev));

        /* Now finish the pair and watch every surface agree. */
        await pg.click('[data-surface="terminal"]');
        await pg.type('[data-q="' + acl.id + '"][data-part="seq"]', '20');
        await pg.$eval('[data-q="' + acl.id + '"][data-part="seq"]', (el) => el.blur());
        await pg.waitForFunction(
            `document.getElementById('qq-${acl.id}').classList.contains('answered')`,
            { timeout: 8000 }).catch(() => {});
        chk('filling BOTH halves marks the question answered',
            await pg.$eval('#qq-' + acl.id, (el) => el.classList.contains('answered')));
        const hdr2 = await pg.$eval('#qcount', (el) => el.textContent);
        chk('and the part-filled warning clears from the header',
            !/part-filled/.test(hdr2), hdr2);
        await pg.click('[data-surface="review"]');
        await pg.waitForFunction(
            `!/part answered/i.test(document.getElementById('winbody').innerText)`,
            { timeout: 8000 }).catch(() => {});
        chk('and the review stops calling it part answered',
            !/part answered/i.test(await pg.$eval('#winbody', (el) => el.innerText)));

        /* ─── 6. the review lists all fifty, and the submit warning is real ──────────────────── */
        section('6. the review table and the submit confirmation');
        const revFull = await pg.$eval('#winbody', (el) => el.innerText);
        /* innerText IS RENDERED TEXT, and comparing it against source strings cost me three false
           failures here. It collapses whitespace runs, so Q27 to Q29 -- whose prompts carry a double
           space before the ticket id -- were reported absent while sitting in the DOM; and it applies
           text-transform, so `.panel h2 { text-transform: uppercase }` turned every phase heading
           into DISCOVERY while my check looked for "discovery". Only "fix" passed, and only because
           that word happens to appear in a prompt. Normalize both sides, and compare case-blind. */
        const norm = (t) => String(t).replace(/\s+/g, ' ').trim().toLowerCase();
        const flat = norm(revFull);
        const missingRows = qs.filter((q) => flat.indexOf(norm(q.prompt)) < 0);
        chk('every one of the ' + qs.length + ' questions appears in the review',
            missingRows.length === 0, 'absent: ' + missingRows.slice(0, 3).map((q) => 'Q' + q.n).join(', '));
        chk('the comparison is not vacuous: a prompt that is NOT asked is absent',
            flat.indexOf(norm('Which sandwich did the previous administrator prefer?')) < 0);
        QUESTIONS.PHASES.forEach((ph) => {
            chk('the review shows the ' + ph + ' phase heading', flat.indexOf(norm(ph)) >= 0);
        });
        /* The verdict check measures the PAGE's words, not the questions'. Four prompts legitimately
           ask which value is correct, and scanning the whole table for "correct" failed on them --
           the same mis-aimed assertion I had already fixed once in netfinal-page.test.js, repeated
           here because I wrote a new surface and did not carry the lesson across. */
        const chrome = qs.reduce((acc, q) => acc.split(norm(q.prompt)).join(''), flat);
        chk('stripping the prompts leaves the page chrome, not nothing',
            chrome.length > 100 && chrome.length < flat.length,
            'chrome=' + chrome.length + ' of ' + flat.length);
        chk('the review chrome states no verdict on any answer',
            !/\b(correct|incorrect)\b/.test(chrome.split('not whether it is correct').join('')),
            'grading happens at submission, never during the sitting');

        dialogs.length = 0;
        await pg.click('#submit');
        await pg.waitForFunction('true', { timeout: 500 }).catch(() => {});
        chk('the submit button raised a confirmation', dialogs.length === 1,
            JSON.stringify(dialogs));
        const msg = (dialogs[0] || {}).message || '';
        chk('the confirmation names the unanswered questions', /No answer recorded for \d+ question/.test(msg),
            msg.slice(0, 160));
        chk('it says the attempt cannot be undone', /cannot be undone/.test(msg) && /one attempt/.test(msg));
        chk('and DISMISSING it did not submit',
            !(await store.get(UID + '::' + EXAMS.DEFAULT_EXAM_ID)).submittedAt,
            'a dismissed confirmation must leave the exam open');
        chk('the submit button is still enabled after a dismissal',
            await pg.$eval('#submit', (el) => el.disabled) === false,
            'a disabled button after cancelling would trap the student');

        chk('no uncaught page error across the whole sitting', errors.length === 0,
            errors.slice(0, 3).join(' | '));
    } finally {
        await browser.close();
        srv.close();
    }

    console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
    return fail ? 1 : 0;
}

main().then((c) => process.exit(c)).catch((e) => {
    console.error('\n  harness fault: ' + (e && e.stack ? e.stack : e));
    process.exit(2);
});
