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
function fakeAuth(signedIn) {
    return 'window.__calls = [];\n' +
        'const FirebaseAuth = { init: async function () {}, isSignedIn: function () { return ' + signedIn + '; },\n' +
        '  waitForAuth: async function () { return ' + (signedIn ? '{ uid: "stu" }' : 'null') + '; },\n' +
        '  callFunction: async function (name, data) { window.__calls.push([name, data]);\n' +
        '    if (name === "deliverFlag") return { data: { flagText: "FLAG{test_" + data.boxId + "_" + data.flagId + "}" } };\n' +
        '    if (name === "validateFlag") return { data: /^FLAG\\{test_/.test(data.submission) ? { correct: true, flagId: "attacker" } : { correct: false } };\n' +
        '    return { data: {} }; } };';
}

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let signedIn = true, authLoads = 0, errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const u = req.url();
        if (!u.startsWith(ORIGIN)) { return req.abort('blockedbyclient'); }
        const p = decodeURIComponent(new URL(u).pathname);
        if (p === '/components/FirebaseAuth.js') { authLoads++; return req.respond({ status: 200, contentType: 'application/javascript', body: fakeAuth(signedIn) }); }
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

    /* 1. the student path: pin on Exchange, pin on Comms */
    await go(BOX + 'exchange.html');
    await page.evaluate(() => { const el = [...document.querySelectorAll('[onclick]')].find((e) => /pin\('ex-kyc-name'\)/.test(e.getAttribute('onclick'))); el.click(); });
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
    check('signed out: no server call, the card still waits, no page error', (await calls()).length === 0 && /Flag loading/.test(card) && errors.length === 0, card + ' ' + errors.join('|'));
    signedIn = true;

    /* 6. the Hub accepts the flag (OW-02, 03, 04 read a Promise synchronously before) */
    for (const [box, key] of [['ow-02-dead-drop', 'hexworth_ow02'], ['ow-03-glass-house', 'hexworth_ow03'], ['ow-04-burned-source', 'hexworth_ow04']]) {
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

    await browser.close();
    console.log('\now-flag-delivery: ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
