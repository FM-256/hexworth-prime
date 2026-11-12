// Firestore security-rules test for site_notice (the site-wide banner, components/SiteNotice.js).
// Run against the Firestore emulator (local only, demo project):
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/site-notice-rules.test.js"
//
// @catalog what    site_notice rules: public get of 'current' only, no list, admin-only write of the
// @catalog what    five allowed fields with their types and the 280-character message cap, no delete.
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/site-notice-rules.test.js"
// @catalog status  TOOL
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, collection } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const GOOD = { active: true, level: 'warning', message: 'Maintenance tonight 9:00 to 9:30 pm Eastern.', endsAt: 1900000000000, updatedAt: 1800000000000 };

let pass = 0, fail = 0; const out = [];
/* expects the operation to be allowed */
async function ok(name, p) { try { await assertSucceeds(p); out.push(['PASS', name]); pass++; } catch (e) { out.push(['FAIL (expected ALLOW, got DENY)', name]); fail++; } }
/* expects the operation to be denied */
async function no(name, p) { try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; } catch (e) { out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }

(async () => {
    const testEnv = await initializeTestEnvironment({ projectId: 'demo-hexworth', firestore: { rules: RULES, host: '127.0.0.1', port: 8181 } });
    const seed = () => testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), 'site_notice/current'), GOOD);
        await setDoc(doc(c.firestore(), 'site_notice/other'), GOOD);
    });
    const admin = testEnv.authenticatedContext('adminUid', { admin: true }).firestore();
    const stu = testEnv.authenticatedContext('stu1').firestore();
    const anon = testEnv.unauthenticatedContext().firestore();

    await seed();
    /* reads: the banner reads signed out */
    await ok('signed-out visitor gets site_notice/current', getDoc(doc(anon, 'site_notice/current')));
    await ok('student gets site_notice/current', getDoc(doc(stu, 'site_notice/current')));
    await no('signed-out visitor gets another id', getDoc(doc(anon, 'site_notice/other')));
    await no('signed-out visitor lists the collection', getDocs(collection(anon, 'site_notice')));
    await no('admin lists the collection', getDocs(collection(admin, 'site_notice')));

    /* writes: admin only, exact shape */
    await ok('admin writes a valid notice', setDoc(doc(admin, 'site_notice/current'), GOOD));
    await ok('admin turns it off (endsAt null)', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { active: false, endsAt: null })));
    await ok('admin writes a 280-character message', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { message: 'x'.repeat(280) })));
    await no('student writes', setDoc(doc(stu, 'site_notice/current'), GOOD));
    await no('signed-out visitor writes', setDoc(doc(anon, 'site_notice/current'), GOOD));
    await no('student updates one field', updateDoc(doc(stu, 'site_notice/current'), { message: 'pwned' }));
    await no('admin writes another id', setDoc(doc(admin, 'site_notice/other2'), GOOD));
    await no('admin writes a 281-character message', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { message: 'x'.repeat(281) })));
    await no('admin writes an extra field (an author)', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { updatedBy: 'someone' })));
    await no('admin omits a field', setDoc(doc(admin, 'site_notice/current'), { active: true, level: 'info', message: 'x', updatedAt: 1 }));
    await no('admin writes an unknown level', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { level: 'danger' })));
    await no('admin writes active as a string', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { active: 'true' })));
    await no('admin writes endsAt as a string', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { endsAt: 'tonight' })));
    await no('admin writes a non-number updatedAt', setDoc(doc(admin, 'site_notice/current'), Object.assign({}, GOOD, { updatedAt: 'now' })));
    await no('admin deletes it', deleteDoc(doc(admin, 'site_notice/current')));
    /* the verified-email admin route the console uses. The allowlisted address is read from
     * firestore.rules at run time, so no address is written into this (public) file. */
    const allowEmail = (RULES.match(/request\.auth\.token\.email == '([^']+)'/) || [])[1];
    if (!allowEmail) { throw new Error('no allowlisted admin email found in firestore.rules isAdmin()'); }
    const emailAdmin = testEnv.authenticatedContext('opUid', { email: allowEmail, email_verified: true }).firestore();
    await ok('verified-email admin writes a valid notice', setDoc(doc(emailAdmin, 'site_notice/current'), GOOD));
    const unverified = testEnv.authenticatedContext('opUid2', { email: allowEmail, email_verified: false }).firestore();
    await no('unverified-email lookalike writes', setDoc(doc(unverified, 'site_notice/current'), GOOD));

    await testEnv.cleanup();
    out.forEach(([s, n]) => console.log(s.padEnd(34) + ' ' + n));
    console.log('\nsite-notice rules: ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
