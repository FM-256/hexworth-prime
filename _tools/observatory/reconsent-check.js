// End-to-end browser check of the Observatory re-consent flow.
//
// Drives the REAL _app/components/ObservatoryConsent.js in a headless browser, stubbing
// only the Firebase layer (a non-anonymous signed-in user + an in-memory Firestore).
// Proves, against the actual code (not a reimplementation):
//   Scenario 1 (re-consent): a stored consent on the OLD form version (cerbi-v1) is NOT
//     honored - the form is re-shown; submitting it writes a consent doc AND an enrollment
//     doc both carrying the CURRENT form version, and only then fires onGranted.
//   Scenario 2 (already current): a stored consent already on the current version grants
//     immediately with no form shown (so re-consent triggers on a version bump, not always).
//
// The CF gate (functions/index.js) admits behavioral events only when the consent doc's
// formVersion === OBSERVATORY_FORM_VERSION; this harness proves the client writes exactly
// that field/value on re-consent, which is the fact the server gate depends on.
const fs = require('fs'), path = require('path'), http = require('http'), pup = require('puppeteer');
const SRC = fs.readFileSync(path.resolve('_app/components/ObservatoryConsent.js'), 'utf8');
const srv = http.createServer((q, s) => { s.writeHead(200, { 'Content-Type': 'text/html' }); s.end('<!doctype html><html><head></head><body>reconsent-harness</body></html>'); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UID = 'stu-reconsent-1';

// Install the Firebase stubs + an in-memory Firestore seeded with `seedConsent`, then load
// the real component. Returns a page whose window.__store is the live Firestore mirror.
async function bootPage(browser, port, seedConsent) {
    const pg = await browser.newPage();
    const logs = [];
    pg.on('console', m => logs.push(m.text()));
    pg.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
    await pg.goto('http://localhost:' + port + '/', { waitUntil: 'domcontentloaded' });
    await pg.evaluate((uid, seed) => {
        // In-memory Firestore keyed by "collection/id".
        window.__store = {};
        if (seed) window.__store['observatory_consent/' + uid] = seed;
        const refPath = r => r.coll + '/' + r.id;
        window.firebaseFirestore = {
            doc: (db, coll, id) => ({ coll, id }),
            getDoc: async (ref) => ({ exists: () => (refPath(ref) in window.__store), data: () => window.__store[refPath(ref)] }),
            writeBatch: () => { const ops = []; return { set: (ref, data) => ops.push([refPath(ref), data]), commit: async () => { ops.forEach(([k, v]) => { window.__store[k] = v; }); } }; },
            serverTimestamp: () => '__ts__',
            collection: (db, coll) => ({ coll }),
            getDocs: async () => ({ forEach: () => {} })   // no admin class list -> DEFAULT_CLASSES
        };
        // A real (non-anonymous) signed-in user.
        window.ArenaFirebase = {
            isReady: async () => {},
            auth: { currentUser: { uid: uid, isAnonymous: false, displayName: 'Old Display', email: 'stu@example.edu' } },
            db: {}
        };
        // Neutralize the participant-copy download side effect (anchor click / blob URL).
        try { URL.createObjectURL = () => 'blob:stub'; } catch (e) {}
        try { HTMLAnchorElement.prototype.click = function () {}; } catch (e) {}
    }, UID, seedConsent);
    await pg.addScriptTag({ content: SRC });
    await sleep(100);
    return { pg, logs };
}

// Is the consent FORM (not the sign-in card) currently shown?
async function formShown(pg) {
    return pg.evaluate(() => !!(document.querySelector('.obs-consent-overlay') && document.querySelector('#obsSubmit') && document.querySelector('#obsAgree')));
}

(async () => {
    await new Promise(r => srv.listen(0, r));
    const port = srv.address().port;
    const browser = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    let pass = true;
    const check = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) pass = false; };

    // Read the two versions straight from the source so the harness can't drift from it.
    const CUR = (SRC.match(/FORM_VERSION\s*=\s*'([^']+)'/) || [])[1];
    console.log('Current FORM_VERSION from source =', CUR);
    check(!!CUR && /^cerbi-v2-/.test(CUR), 'source is on a v2 form version');

    // ---- Scenario 1: stored consent on the OLD version -> must re-prompt ----
    console.log('\nScenario 1: participant previously signed cerbi-v1 (older wording)');
    const s1 = await bootPage(browser, port, { formVersion: 'cerbi-v1-2026-06-21', classId: 'summer-2026-aplus', name: 'Old Name', signature: 'Old Name' });
    await s1.pg.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(await formShown(s1.pg), 're-consent FORM is shown for a v1 record');
    check(await s1.pg.evaluate(() => window.__granted === false), 'onGranted did NOT fire yet (blocked pending re-consent)');
    // The form must carry the v2 "Data Collected" wording the participant is agreeing to.
    check(await s1.pg.evaluate(() => /periods of inactivity/i.test(document.querySelector('.obs-consent-body').textContent)), 'form shows the v2 "Data Collected" language');
    // Fill + submit the real form.
    await s1.pg.evaluate(() => {
        const set = (id, v) => { const el = document.querySelector(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
        set('#obsName', 'Jordan Rivera');
        set('#obsSig', 'Jordan Rivera');
        const chk = document.querySelector('#obsAgree'); chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const enabled = await s1.pg.evaluate(() => !document.querySelector('#obsSubmit').disabled);
    check(enabled, 'submit enables once name + signature + agree are set');
    await s1.pg.evaluate(() => document.querySelector('#obsSubmit').click());
    await sleep(300);
    check(await s1.pg.evaluate(() => window.__granted === true), 'onGranted fired after submit');
    check(!(await formShown(s1.pg)), 'consent form removed after submit');
    const consentDoc = await s1.pg.evaluate((uid) => window.__store['observatory_consent/' + uid], UID);
    const enrollDoc = await s1.pg.evaluate((uid) => window.__store['observatory_enrollment/' + uid], UID);
    check(consentDoc && consentDoc.formVersion === CUR, 'consent doc rewritten to current form version (' + (consentDoc && consentDoc.formVersion) + ')');
    check(enrollDoc && enrollDoc.formVersion === CUR, 'enrollment roster doc written with current form version (the doc the CF/dashboard read)');
    check(consentDoc && consentDoc.name === 'Jordan Rivera' && consentDoc.signature === 'Jordan Rivera', 'consent captured the new name + signature');
    check(consentDoc && consentDoc.agreements && consentDoc.agreements.understoodStudy === true && consentDoc.agreements.agreedToParticipate === true, 'consent records explicit understanding + agreement to participate');
    check(consentDoc && consentDoc.participates === true, 'consent doc records participates=true for the agree path');
    check(await s1.pg.evaluate((uid) => { try { return JSON.parse(localStorage.getItem('observatory_consent_' + uid)).formVersion; } catch (e) { return null; } }, UID) === CUR, 'localStorage mirror also on current version');
    check(s1.logs.filter(l => /PAGEERROR/.test(l)).length === 0, 'no page errors in scenario 1 (' + (s1.logs.find(l => /PAGEERROR/.test(l)) || 'none') + ')');
    await s1.pg.close();

    // ---- Scenario 2: stored consent already on the CURRENT version -> no re-prompt ----
    console.log('\nScenario 2: participant already on the current version');
    const s2 = await bootPage(browser, port, { formVersion: CUR, classId: 'summer-2026-aplus', name: 'Current Signer' });
    await s2.pg.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(await s2.pg.evaluate(() => window.__granted === true), 'onGranted fired immediately (no re-prompt)');
    check(!(await formShown(s2.pg)), 'no consent form shown for an up-to-date record');
    await s2.pg.close();

    await browser.close();
    await new Promise(r => srv.close(r));
    console.log(pass ? '\n*** RE-CONSENT FLOW OK (end to end in browser) ***' : '\n*** RE-CONSENT CHECK FAILED ***');
    process.exit(pass ? 0 : 1);
})();
