// End-to-end browser check of the Observatory consent-gating flow.
//
// Drives the REAL _app/components/ObservatoryConsent.js in a headless browser, stubbing
// only the Firebase layer (a non-anonymous signed-in user + an in-memory Firestore).
// Proves, against the actual code (not a reimplementation), the PI-decided policy (2026-07-06):
//   Scenario 1 (v1 GRANDFATHERED): a stored consent on cerbi-v1 is HONORED — no form shown,
//     onGranted fires immediately, the record stays v1 (existing signers are not disrupted).
//   Scenario 2 (already current v2): a stored v2 consent grants immediately, no form shown.
//   Scenario 3 (new sign-in): a participant with NO record is shown the current (v2) form;
//     submitting writes a consent doc AND an enrollment doc both on the current version.
//   Scenario 4 (unaccepted version): a record on a version NOT in ACCEPTED_FORM_VERSIONS is
//     re-prompted — the re-consent mechanism still works for versions removed from the allowlist.
//
// The CF gate (functions/index.js) admits behavioral events only when the consent doc's
// formVersion === OBSERVATORY_FORM_VERSION; grandfathered v1 records therefore keep Phase-2
// uncollected (correct — they never saw the v2 "Data Collected" disclosure), while a new v2
// sign-in writes exactly the field/value the server gate requires to admit Phase-2.
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

    // ---- Scenario 1: stored consent on cerbi-v1 -> GRANDFATHERED, no re-prompt ----
    console.log('\nScenario 1: participant previously signed cerbi-v1 (grandfathered)');
    const s1 = await bootPage(browser, port, { formVersion: 'cerbi-v1-2026-06-21', classId: 'summer-2026-aplus', name: 'Old Name', signature: 'Old Name' });
    await s1.pg.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(!(await formShown(s1.pg)), 'NO form shown for a v1 record (grandfathered, not re-prompted)');
    check(await s1.pg.evaluate(() => window.__granted === true), 'onGranted fired immediately for the v1 signer');
    const s1consent = await s1.pg.evaluate((uid) => window.__store['observatory_consent/' + uid], UID);
    check(s1consent && s1consent.formVersion === 'cerbi-v1-2026-06-21', 'v1 record UNCHANGED (stays on v1, not rewritten to v2)');
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

    // ---- Scenario 3: NEW sign-in (no record) -> shown the current (v2) form, writes v2 ----
    console.log('\nScenario 3: new sign-in with no prior consent');
    const s3 = await bootPage(browser, port, null);
    await s3.pg.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(await formShown(s3.pg), 'consent FORM shown for a new participant');
    check(await s3.pg.evaluate(() => window.__granted === false), 'onGranted did NOT fire yet (pending consent)');
    check(await s3.pg.evaluate(() => /periods of inactivity/i.test(document.querySelector('.obs-consent-body').textContent)), 'new form shows the v2 "Data Collected" language');
    await s3.pg.evaluate(() => {
        const set = (id, v) => { const el = document.querySelector(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
        set('#obsName', 'Jordan Rivera');
        set('#obsSig', 'Jordan Rivera');
        const chk = document.querySelector('#obsAgree'); chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true }));
    });
    check(await s3.pg.evaluate(() => !document.querySelector('#obsSubmit').disabled), 'submit enables once name + signature + agree are set');
    await s3.pg.evaluate(() => document.querySelector('#obsSubmit').click());
    await sleep(300);
    check(await s3.pg.evaluate(() => window.__granted === true), 'onGranted fired after submit');
    const s3consent = await s3.pg.evaluate((uid) => window.__store['observatory_consent/' + uid], UID);
    const s3enroll = await s3.pg.evaluate((uid) => window.__store['observatory_enrollment/' + uid], UID);
    check(s3consent && s3consent.formVersion === CUR, 'new consent doc written on current version (' + (s3consent && s3consent.formVersion) + ')');
    check(s3enroll && s3enroll.formVersion === CUR, 'new enrollment doc written on current version');
    check(s3consent && s3consent.agreements && s3consent.agreements.understoodStudy === true && s3consent.agreements.agreedToParticipate === true, 'consent records understanding + agreement to participate');
    await s3.pg.close();

    // ---- Scenario 4: record on an UNACCEPTED version -> still re-prompted ----
    console.log('\nScenario 4: record on a version no longer accepted');
    const s4 = await bootPage(browser, port, { formVersion: 'cerbi-v0-2026-01-01', classId: 'summer-2026-aplus', name: 'Ancient Signer' });
    await s4.pg.evaluate(() => { window.__granted = false; window.ObservatoryConsent.ensureConsent(() => { window.__granted = true; }); });
    await sleep(250);
    check(await formShown(s4.pg), 're-consent form shown for a version NOT in the accepted allowlist');
    check(await s4.pg.evaluate(() => window.__granted === false), 'onGranted blocked pending re-consent for an unaccepted version');
    await s4.pg.close();

    await browser.close();
    await new Promise(r => srv.close(r));
    console.log(pass ? '\n*** RE-CONSENT FLOW OK (end to end in browser) ***' : '\n*** RE-CONSENT CHECK FAILED ***');
    process.exit(pass ? 0 : 1);
})();
