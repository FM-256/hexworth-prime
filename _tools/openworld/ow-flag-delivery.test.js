#!/usr/bin/env node
/**
 * ow-flag-delivery.test.js — Open World flags reach the CaseBoard and the Hub accepts them.
 *
 * @catalog what    Real Chrome over _app/arena/boxes/ow-*: pins on Exchange and Comms, Confirm
 * @catalog what    Connection on the CaseBoard, the flag shown from deliverFlag, a flag confirmed
 * @catalog what    earlier fetched on load, signed-out behaviour, and the Hub submit on OW-02/03/04.
 * @catalog run     node _tools/openworld/ow-flag-delivery.test.js
 * @catalog status  TOOL
 *
 * No Open World page includes FirebaseAuth.js; OpenWorldEngine.ensureAuth() loads it. Here that
 * request is answered with a stand-in that records every callable call, so nothing reaches
 * production. Everything else is served from _app/ or aborted.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));

const APP = path.join(__dirname, '../../_app');
const ORIGIN = 'http://hx.test';
const BOX = '/arena/boxes/ow-02-dead-drop/';

let pass = 0, fail = 0;
/* records one assertion */
function check(name, cond, extra) { if (cond) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); } }

/* A FirebaseAuth stand-in: signed in or not, records calls in window.__calls, answers deliverFlag
 * and validateFlag like the server for the boxes under test. */
function fakeAuth(signedIn, hang, refuse) {
    return 'window.__calls = [];\n' +
        'const FirebaseAuth = { init: async function () {}, isSignedIn: function () { return ' + signedIn + '; },\n' +
        '  waitForAuth: ' + (hang ? 'function () { return new Promise(function () {}); }' : 'async function () { return ' + (signedIn ? '{ uid: "stu" }' : 'null') + '; }') + ',\n' +
        '  callFunction: async function (name, data) { window.__calls.push([name, data]);\n' +
        '    if (name === "deliverFlag") { ' + (refuse ? 'var e = new Error("This box does not disclose flag values."); e.code = "functions/permission-denied"; throw e;' : 'return { data: { flagText: "FLAG{test_" + data.boxId + "_" + data.flagId + "}" } };') + ' }\n' +
        '    if (name === "validateFlag") return { data: /^FLAG\\{test_/.test(data.submission) ? { correct: true, flagId: "attacker" } : { correct: false } };\n' +
        '    return { data: {} }; } };';
}

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let signedIn = true, hang = false, refuse = false, authLoads = 0, errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const u = req.url();
        if (!u.startsWith(ORIGIN)) { return req.abort('blockedbyclient'); }
        const p = decodeURIComponent(new URL(u).pathname);
        if (p === '/components/FirebaseAuth.js') { authLoads++; return req.respond({ status: 200, contentType: 'application/javascript', body: fakeAuth(signedIn, hang, refuse) }); }
        if (p === '/components/SiteNotice.js') { return req.respond({ status: 200, contentType: 'application/javascript', body: '' }); }
        const f = path.join(APP, p);
        if (f.startsWith(APP) && fs.existsSync(f) && fs.statSync(f).isFile()) {
            const t = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' }[path.extname(f)] || 'application/octet-stream';
            return req.respond({ status: 200, contentType: t, body: fs.readFileSync(f) });
        }
        return req.respond({ status: 404, body: '' });
    });
    const go = async (p, wait) => { authLoads = 0; await page.goto(ORIGIN + p, { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, wait || 800)); };
    const calls = () => page.evaluate(() => window.__calls || []);
    const identityCard = () => page.$$eval('.cb-conn', (els) => { const e = els.find((x) => /Identity Link/.test(x.textContent)); return e ? e.textContent : null; });

    /* fresh state */
    await go(BOX + 'index.html'); await page.evaluate(() => localStorage.clear());

    /* 0. locked cards (operator, 2026-11-12): all eight show from the start, with light hints */
    await go(BOX + 'caseboard.html');
    const cards0 = await page.$$eval('.cb-conn', (els) => els.map((e) => ({ locked: e.classList.contains('locked'), text: e.textContent, btn: !!e.querySelector('.cb-conn-btn') })));
    check('fresh board: all 8 connections show, all locked, none confirmable', cards0.length === 8 && cards0.every((c) => c.locked && !c.btn), JSON.stringify(cards0.map((c) => c.text.slice(0, 40))));
    const id0 = cards0.find((c) => /Identity Link/.test(c.text));
    check('a locked card names only the pages (Exchange, Comms), not the items', id0 && /something on Exchange/.test(id0.text) && /something on Comms/.test(id0.text) && !/KYC|Username|Marcus|Discord/.test(id0.text), id0 && id0.text);
    const fo0 = cards0.find((c) => /Fund Flow Origin/.test(c.text));
    /* both Fund Flow Origin pieces are filed under the explorer page, whose nav label is "Blockchain" */
    const mt0 = cards0.find((c) => /Mixer Timing/.test(c.text));
    check('page names are the nav labels students see (Blockchain, Fund Flow)', fo0 && (fo0.text.match(/something on Blockchain/g) || []).length === 2 && mt0 && /something on Fund Flow/.test(mt0.text), (fo0 && fo0.text) + ' | ' + (mt0 && mt0.text));

    /* every hint names a page that really has that item's pin (derived from the page files) */
    {
        const CB = fs.readFileSync(path.join(APP, BOX, 'caseboard.html'), 'utf8');
        const reqs = [...CB.matchAll(/requires: \[([^\]]+)\]/g)].flatMap((m) => m[1].match(/'[^']+'/g).map((x) => x.slice(1, -1)));
        const hints = await page.evaluate((ids) => ids.map((r) => { const ev = DeadDropConfig.evidence[r]; const pid = PIN_PAGE[r] || (ev && ev.source); return [r, pid]; }), [...new Set(reqs)]);
        const bad = hints.filter(([r, pid]) => { const f = path.join(APP, BOX, pid + '.html'); return !fs.existsSync(f) || fs.readFileSync(f, 'utf8').indexOf(r) < 0; });
        check('all ' + hints.length + ' hints point at the page that has the pin', hints.length === 12 && bad.length === 0, JSON.stringify(bad));
    }

    /* 1. the student path: pin on Exchange, pin on Comms */
    await go(BOX + 'exchange.html');
    await page.evaluate(() => { const el = [...document.querySelectorAll('[onclick]')].find((e) => /pin\('ex-kyc-name'\)/.test(e.getAttribute('onclick'))); el.click(); });
    /* half-pinned: the card shows what is pinned and where the rest is, still locked */
    await go(BOX + 'caseboard.html');
    const half = await identityCard();
    check('half-pinned: shows "KYC Identity", still needs something on Comms, still locked', /KYC Identity/.test(half) && /something on Comms/.test(half) && /\(locked\)/.test(half) && !/Confirm Connection/.test(half), half);
    await go(BOX + 'comms.html');
    await page.evaluate(() => { const el = [...document.querySelectorAll('[onclick]')].find((e) => /pinMsg\(\\?'dc-username-match\\?'\)/.test(e.getAttribute('onclick'))); el.click(); });
    const pinned = await page.evaluate(() => engine.state.pinnedEvidence.map((e) => e.id));
    check('both pins land: ex-kyc-name and dc-username-match', pinned.includes('ex-kyc-name') && pinned.includes('dc-username-match'), JSON.stringify(pinned));

    /* 2. the CaseBoard shows the Identity Link, Confirm delivers the flag */
    await go(BOX + 'caseboard.html');
    let card = await identityCard();
    check('CaseBoard shows the Identity Link with a Confirm button', card && /Confirm Connection/.test(card), card);
    check('no auth is loaded before it is needed (nothing pending)', authLoads === 0, 'loads=' + authLoads);
    await page.evaluate(() => makeConnection('conn-identity'));
    await new Promise((r) => setTimeout(r, 600));
    card = await identityCard();
    const c1 = await calls();
    check('Confirm calls deliverFlag once for ow-02-dead-drop / attacker', c1.length === 1 && c1[0][0] === 'deliverFlag' && c1[0][1].boxId === 'ow-02-dead-drop' && c1[0][1].flagId === 'attacker', JSON.stringify(c1));
    check('the card shows the delivered flag, not "loading"', card && /FLAG\{test_ow-02-dead-drop_attacker\}/.test(card) && !/Flag loading/.test(card), card);
    check('FirebaseAuth.js was loaded by the engine exactly once', authLoads === 1, 'loads=' + authLoads);

    /* 3. reload: the delivered flag stays, no second call */
    await go(BOX + 'caseboard.html');
    card = await identityCard();
    check('after reload the flag is still shown, no new server call', /FLAG\{test_ow-02-dead-drop_attacker\}/.test(card) && (await calls()).length === 0, card);

    /* 4. a connection confirmed before this fix (flag never delivered) is fetched on page load */
    await page.evaluate(() => { engine.state.deliveredFlags = {}; engine.save(); });
    await go(BOX + 'caseboard.html', 1200);
    card = await identityCard();
    const c4 = await calls();
    check('a confirmed-but-undelivered flag is fetched on load and shown', c4.some((c) => c[0] === 'deliverFlag' && c[1].flagId === 'attacker') && /FLAG\{test_ow-02-dead-drop_attacker\}/.test(card), JSON.stringify(c4) + ' ' + card);

    /* 5. signed out: no server call, no crash, still pending */
    signedIn = false;
    await page.evaluate(() => { engine.state.deliveredFlags = {}; engine.save(); });
    await go(BOX + 'caseboard.html', 1200);
    card = await identityCard();
    check('signed out: no server call, the card says to sign in, no page error', (await calls()).length === 0 && /Sign in to Hexworth to receive this flag/.test(card) && errors.length === 0, card + ' ' + errors.join('|'));
    signedIn = true;

    /* 5b. sign-in never settles (SDK blocked): the card says to sign in after the timeout, the Hub does not hang */
    hang = true;
    await page.evaluate(() => { engine.state.deliveredFlags = {}; engine.save(); });
    await go(BOX + 'caseboard.html', 11500);
    card = await identityCard();
    check('auth that never settles: after the 10 s cap the card says to sign in (no hang), no call', (await calls()).length === 0 && /Sign in to Hexworth/.test(card), card);
    hang = false;

    /* 5c. the server refuses: the card says so, and the next page does not ask again this session */
    refuse = true;
    await go(BOX + 'caseboard.html', 1200);
    card = await identityCard();
    const r1 = (await calls()).length;
    await go(BOX + 'caseboard.html', 1200);
    const card2 = await identityCard();
    check('server refusal: card says it was not released; the next page makes no call', r1 === 1 && /did not release this flag/.test(card) && (await calls()).length === 0 && /did not release/.test(card2), r1 + ' ' + card);
    refuse = false;
    await page.evaluate(() => sessionStorage.clear());

    /* 6. the Hub accepts the flag (OW-02, 03, 04 read a Promise synchronously before) */
    for (const [box, key] of [['ow-01-mole-hunt', 'hexworth_ow01'], ['ow-02-dead-drop', 'hexworth_ow02'], ['ow-03-glass-house', 'hexworth_ow03'], ['ow-04-burned-source', 'hexworth_ow04']]) {
        const hub = '/arena/boxes/' + box + '/index.html';
        await go(hub);
        /* unlock the submit form: enough confirmed connections for this box */
        await page.evaluate(() => { const n = engine.cfg.minConnectionsToSubmit || 5; for (let i = 0; i < n; i++) engine.state.connections.push({ id: 'seed-' + i, label: 's' }); engine.save(); });
        await go(hub);
        errors = [];
        await page.evaluate(() => { document.getElementById('answerInput').value = 'FLAG{test_anything}'; document.getElementById('submitBtn').click(); });
        await new Promise((r) => setTimeout(r, 500));
        const good = await page.$eval('#submitFeedback', (e) => e.textContent);
        await page.evaluate(() => { document.getElementById('answerInput').value = 'FLAG{wrong}'; document.getElementById('submitBtn').click(); });
        await new Promise((r) => setTimeout(r, 500));
        const bad = await page.$eval('#submitFeedback', (e) => e.textContent);
        const vc = (await calls()).filter((c) => c[0] === 'validateFlag');
        check(box + ' Hub: a right flag says FLAG ACCEPTED, a wrong one "Invalid flag.", both validated server-side, no errors',
            /FLAG ACCEPTED/.test(good) && /Invalid flag\./.test(bad) && !/undefined/.test(good + bad) && vc.length === 2 && vc[0][1].boxId === box && errors.length === 0,
            JSON.stringify({ good, bad, vc: vc.length, errors }));
        await page.evaluate(() => localStorage.clear());
    }

    /* 7. a completed investigation: three accepted flags, then a reload shows the result with no page error
       (OW-01's hub threw on missing submitLock/submitForm once a student could submit, and both hubs
       threw binding a Submit button the completion message had removed) */
    /* every Open World hub (BUG-304: the other ten threw the same way on a completed reload) */
    const ALL_HUBS = fs.readdirSync(path.join(APP, 'arena/boxes')).filter((d) => /^ows?-\d/.test(d)).sort();
    check('found all 12 Open World hubs', ALL_HUBS.length === 12, ALL_HUBS.join(','));
    for (const box of ALL_HUBS) {
        const hub = '/arena/boxes/' + box + '/index.html';
        await go(hub); await page.evaluate(() => localStorage.clear());
        await go(hub);
        await page.evaluate(() => { const n = engine.cfg.minConnectionsToSubmit || 5; for (let i = 0; i < n; i++) engine.state.connections.push({ id: 'seed-' + i, label: 's' }); engine.save(); });
        await go(hub);
        errors = [];
        const nFlags = await page.evaluate(() => Object.keys(engine.cfg.flagConnections || {}).length);
        for (let i = 0; i < nFlags; i++) { await page.evaluate(() => { document.getElementById('answerInput').value = 'FLAG{test_x}'; document.getElementById('submitBtn').click(); }); await new Promise((r) => setTimeout(r, 400)); }
        await go(hub);
        /* each hub words its result its own way (INVESTIGATION COMPLETE, REPORT ACCEPTED, ...): what
           matters is that the form was replaced by a result with the score */
        const res = await page.evaluate(() => ({ completed: engine.state.completed, text: !document.getElementById('submitBtn') && /(COMPLETE|ACCEPTED)[\s\S]*Score: \d+/.test(document.body.textContent) }));
        check(box + ' Hub: after every flag is accepted the investigation completes and a reload shows it, no page error', res.completed && res.text && errors.length === 0, JSON.stringify({ res, errors }));
        await page.evaluate(() => localStorage.clear());
    }

    /* 8. every CaseBoard confirms every connection and shows every flag (2026-11-16: ten boards
       called getDeliveredFlagHtml without defining it, so the first confirm threw and the board
       stopped at 0 / N). Pins go in through the engine here; reachability is the scripted student
       runs' job. */
    for (const box of ALL_HUBS) {
        const cbSrc = fs.readFileSync(path.join(APP, 'arena/boxes', box, 'caseboard.html'), 'utf8');
        const conns = [...cbSrc.matchAll(/id:\s*'(conn-[^']+)'[\s\S]*?requires:\s*\[([^\]]+)\]/g)].map((m) => ({ id: m[1], req: m[2].match(/'[^']+'/g).map((x) => x.slice(1, -1)) }));
        const board = '/arena/boxes/' + box + '/caseboard.html';
        await go(board); await page.evaluate(() => localStorage.clear()); await go(board);
        errors = [];
        await page.evaluate((need) => { need.forEach((id) => { const ev = engine.cfg.evidence[id]; if (ev) engine.pinEvidence(Object.assign({ id: id }, ev)); }); }, [...new Set(conns.flatMap((c) => c.req))]);
        await go(board);
        for (let i = 0; i < 15; i++) { const b = await page.$('.cb-conn-btn:not([disabled])'); if (!b) break; await b.click(); await new Promise((r) => setTimeout(r, 300)); }
        const res = await page.evaluate(() => ({ confirmed: engine.state.connections.length, counter: (document.getElementById('connProgress') || {}).textContent, flagCards: [...document.querySelectorAll('.cb-conn')].filter((e) => /FLAG\{test_/.test(e.textContent)).length, nFlags: Object.keys(engine.cfg.flagConnections || {}).length }));
        check(box + ' CaseBoard: all ' + conns.length + ' connections confirm, counter full, every flag shown, no errors',
            res.confirmed === conns.length && res.counter === conns.length + ' / ' + conns.length && res.flagCards === res.nFlags && errors.length === 0,
            JSON.stringify({ res, errors: errors.slice(0, 2) }));
        await page.evaluate(() => localStorage.clear());
    }

    await browser.close();
    console.log('\now-flag-delivery: ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
