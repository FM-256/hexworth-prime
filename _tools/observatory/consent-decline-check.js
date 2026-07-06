// consent-decline-check.js — execution regression test for the Observatory consent DECLINE option.
//
// Loads the REAL _app/components/ObservatoryConsent.js in headless Chrome with a stubbed Firebase +
// ArenaFirebase, drives both the DECLINE and AGREE paths through the actual form, and asserts the
// exact docs the client persists. It then mirrors the Cloud Function's decline-gate logic
// (functions/index.js logObservatoryEvent) against those real docs to prove a decliner would be
// dropped and a consenter would not — closing the gap where the highest-stakes claim (a decliner's
// data is never collected) was previously only grep/code-verified.
//
// Runs green regardless of the FORM_VERSION v1/v2 state: it seeds an EMPTY store, so the form always
// renders as a first-time consent (no version re-prompt path involved). Non-gating; run manually:
//   node _tools/observatory/consent-decline-check.js
// Origin: promoted from the Chris QC gate's throwaway harness (2026-07-06).
const fs = require('fs'), path = require('path'), http = require('http'), pup = require('puppeteer');
const SRC = fs.readFileSync(path.resolve('_app/components/ObservatoryConsent.js'), 'utf8');
const srv = http.createServer((q, s) => { s.writeHead(200, { 'Content-Type': 'text/html' }); s.end('<!doctype html><html><head></head><body></body></html>'); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Mirror of the CF decline gate (functions/index.js): declined if participates===false on EITHER doc.
function cfWouldDrop(enrollData, consentData) {
    let declined = false;
    if (enrollData && enrollData.participates === false) declined = true;
    if (consentData && consentData.participates === false) declined = true;
    return declined;
}

// Boot a page with a stubbed Firebase/ArenaFirebase and the real component loaded; returns the page.
async function bootPage(browser, port, uid) {
    const pg = await browser.newPage();
    const logs = [];
    pg.on('console', m => logs.push(m.text()));
    pg.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
    await pg.goto('http://localhost:' + port + '/', { waitUntil: 'domcontentloaded' });
    await pg.evaluate((u) => {
        window.__store = {};
        const refPath = r => r.coll + '/' + r.id;
        window.firebaseFirestore = {
            doc: (db, coll, id) => ({ coll, id }),
            getDoc: async (ref) => ({ exists: () => (refPath(ref) in window.__store), data: () => window.__store[refPath(ref)] }),
            writeBatch: () => { const ops = []; return { set: (ref, data) => ops.push([refPath(ref), data]), commit: async () => { ops.forEach(([k, v]) => { window.__store[k] = v; }); } }; },
            serverTimestamp: () => '__ts__',
            collection: (db, coll) => ({ coll }),
            getDocs: async () => ({ forEach: () => {} })
        };
        window.ArenaFirebase = {
            isReady: async () => {},
            auth: { currentUser: { uid: u, isAnonymous: false, displayName: 'Test Student', email: 'stu@example.edu' } },
            db: {}
        };
        try { URL.createObjectURL = () => 'blob:stub'; } catch (e) {}
        try { HTMLAnchorElement.prototype.click = function () {}; } catch (e) {}
    }, uid);
    await pg.addScriptTag({ content: SRC });
    await sleep(150);
    pg.__logs = logs;
    return pg;
}

// Fill name + signature and select one of the two radios (#obsAgree | #obsDecline).
async function fillForm(pg, name, radioId) {
    await pg.evaluate((nm, rid) => {
        const set = (id, v) => { const el = document.querySelector(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
        set('#obsName', nm);
        set('#obsSig', nm);
        const chk = document.querySelector(rid); chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true }));
    }, name, radioId);
}

(async () => {
    await new Promise(r => srv.listen(0, r));
    const port = srv.address().port;
    const browser = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    let pass = true;
    const check = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) pass = false; };

    // ---- Scenario 1: DECLINE ----
    console.log('Scenario 1: student declines to participate');
    const dUid = 'stu-decline-1';
    const dp = await bootPage(browser, port, dUid);
    await dp.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(await dp.evaluate(() => !!document.querySelector('#obsDecline')), 'decline radio exists in the rendered form');
    check(await dp.evaluate(() => !document.querySelector('#obsAgree').checked && !document.querySelector('#obsDecline').checked), 'neither radio pre-checked (no dark pattern)');
    await fillForm(dp, 'Casey Decliner', '#obsDecline');
    check(await dp.evaluate(() => !document.querySelector('#obsSubmit').disabled), 'submit enables on decline choice alone');
    check(/without participating/i.test(await dp.evaluate(() => document.querySelector('#obsSubmit').textContent)), 'button label reflects decline');
    check(await dp.evaluate(() => !document.querySelector('#obsAgree').checked), 'agree radio unchecked (radio group exclusivity)');
    await dp.evaluate(() => document.querySelector('#obsSubmit').click());
    await sleep(300);
    check(await dp.evaluate(() => window.__granted === true), 'onGranted fired — decliner is admitted, never blocked');
    check(!(await dp.evaluate(() => !!document.querySelector('.obs-consent-overlay'))), 'consent overlay removed after submit');
    const dConsent = await dp.evaluate((u) => window.__store['observatory_consent/' + u], dUid);
    const dEnroll = await dp.evaluate((u) => window.__store['observatory_enrollment/' + u], dUid);
    check(dConsent && dConsent.participates === false, 'consent doc: participates === false');
    check(dEnroll && dEnroll.participates === false, 'enrollment doc: participates === false (both docs carry the flag)');
    check(dConsent && dConsent.agreements && dConsent.agreements.understoodStudy === true && dConsent.agreements.agreedToParticipate === false,
        'audit trail honest: understoodStudy=true, agreedToParticipate=false (not conflated)');
    check(cfWouldDrop(dEnroll, dConsent) === true, 'CF decline-gate would DROP this decliner\'s events (against the real persisted docs)');
    check(dp.__logs.filter(l => /PAGEERROR/.test(l)).length === 0, 'no page errors in decline scenario (' + (dp.__logs.find(l => /PAGEERROR/.test(l)) || 'none') + ')');

    // ---- Scenario 2: AGREE (guards against a false-drop regression) ----
    console.log('\nScenario 2: student agrees to participate');
    const aUid = 'stu-agree-1';
    const ap = await bootPage(browser, port, aUid);
    await ap.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    await fillForm(ap, 'Jordan Consenter', '#obsAgree');
    check(await ap.evaluate(() => !document.querySelector('#obsSubmit').disabled), 'submit enables on agree choice');
    check(/agree/i.test(await ap.evaluate(() => document.querySelector('#obsSubmit').textContent)), 'button label reflects agree');
    await ap.evaluate(() => document.querySelector('#obsSubmit').click());
    await sleep(300);
    check(await ap.evaluate(() => window.__granted === true), 'onGranted fired for consenter');
    const aConsent = await ap.evaluate((u) => window.__store['observatory_consent/' + u], aUid);
    const aEnroll = await ap.evaluate((u) => window.__store['observatory_enrollment/' + u], aUid);
    check(aConsent && aConsent.participates === true, 'consent doc: participates === true');
    check(aEnroll && aEnroll.participates === true, 'enrollment doc: participates === true');
    check(aConsent && aConsent.agreements && aConsent.agreements.agreedToParticipate === true, 'agreements.agreedToParticipate === true');
    check(cfWouldDrop(aEnroll, aConsent) === false, 'CF decline-gate would NOT drop a consenter (no false-drop)');

    // ---- Scenario 3: legacy record (no participates field) is treated as consented ----
    console.log('\nScenario 3: legacy record without a participates field');
    check(cfWouldDrop({ classId: 'x' }, { classId: 'x' }) === false, 'CF gate treats participates-absent (legacy) as consented — no silent regression');

    await browser.close();
    await new Promise(r => srv.close(r));
    console.log(pass ? '\n*** CONSENT DECLINE/AGREE FLOW OK (end to end vs real ObservatoryConsent.js) ***' : '\n*** CONSENT DECLINE CHECK FAILED ***');
    process.exit(pass ? 0 : 1);
})();
