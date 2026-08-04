#!/usr/bin/env node
/**
 * licence-preflight.js — can this tenant safely turn on licence enforcement?
 *
 * WHY THIS EXISTS
 *   A licence says what a tenant MAY teach. Its classes are what it ACTUALLY teaches.
 *   Nothing reconciles the two, so they drift silently. Found on the first run: `test-x`
 *   (Dr. Wallace) licenses only aplus-core2 but still holds a live `network-plus` class
 *   with 18 enrolled students, adrift since March. Switching enforcement on there would
 *   have blocked those students at enrolment with nobody expecting it.
 *
 *   So this runs BEFORE the flag is flipped, not after the complaints.
 *
 * WHAT IT REPORTS
 *   BLOCKED   a class teaches a course the tenant is not licensed for. Enabling enforcement
 *             would refuse enrolments to that class.
 *   MISCONFIG enforce=true with an empty contentAccess.courses list. isCourseLicensed()
 *             fails OPEN there by design, so the flag is silently doing nothing — the case
 *             that is otherwise invisible, since nothing errors and nothing logs.
 *   clean     every class's courseId is licensed; enforcement is safe to enable.
 *
 * EXIT CODES
 *   0  nothing blocking
 *   1  at least one tenant is BLOCKED or MISCONFIG (non-zero so CI or a deploy gate can
 *      consume it; a report that only ever exits 0 gets ignored)
 *
 * READ ONLY. Touches no tenant, writes no Firestore document, changes no flag.
 *
 * USAGE
 *   node _tools/tenant/licence-preflight.js                 # every tenant
 *   node _tools/tenant/licence-preflight.js faculty-testing-primus
 */
const path = require('path');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const only = process.argv[2] || null;

(async () => {
    const snap = await db.collection('tenants').get();
    let blocking = 0;

    console.log('LICENCE PRE-FLIGHT');
    console.log('==================\n');

    for (const doc of snap.docs) {
        if (only && doc.id !== only) continue;

        const t = doc.data();
        const licensing = t.licensing || {};
        const licensed = (licensing.contentAccess && licensing.contentAccess.courses) || [];
        const enforcing = licensing.enforce === true;

        const classes = await doc.ref.collection('classes').get();

        // BLOCKING vs INFORMATIONAL turns on class status, because that is what the code
        // actually does: enrollInClass refuses any class whose status !== 'active' before it
        // ever reaches the licence gate. So a RETIRED class teaching an unlicensed course
        // cannot be harmed by enforcement — nobody can enrol in it either way. Blocking on
        // one would be stricter than the system being modelled, and would push an operator
        // toward deleting history they are deliberately keeping.
        //
        // It is still REPORTED, because reactivating such a class would start refusing
        // enrolments with no obvious cause. Warn, do not block.
        const unlicensed = [];   // live and unlicensed -> blocks
        const dormant = [];      // retired and unlicensed -> informational
        classes.forEach(c => {
            const v = c.data();
            // A class with no courseId cannot be checked; report it rather than pass it.
            const courseId = v.courseId || '(none)';
            if (v.courseId && licensed.includes(v.courseId)) return;
            (v.status === 'active' ? unlicensed : dormant).push({ ...v, id: c.id, courseId });
        });

        const misconfigured = enforcing && licensed.length === 0;
        const status = unlicensed.length ? 'BLOCKED' : (misconfigured ? 'MISCONFIG' : 'clean');
        if (status !== 'clean') blocking++;

        console.log(`${doc.id}`);
        console.log(`  tenant status : ${t.status}`);
        console.log(`  enforcement   : ${enforcing ? 'ON' : 'off (opt-in, no effect)'}`);
        console.log(`  licensed      : ${licensed.join(', ') || '(none)'}`);
        console.log(`  classes       : ${classes.size}`);
        console.log(`  verdict       : ${status}`);

        if (misconfigured) {
            console.log('    ! enforce=true with an empty course list. The gate fails open by');
            console.log('      design, so this licence currently grants every course. Populate');
            console.log('      licensing.contentAccess.courses, or unset licensing.enforce.');
        }
        for (const c of unlicensed) {
            console.log(`    ! class "${c.name}" (${c.id}) teaches "${c.courseId}" — NOT licensed`);
            console.log(`      ${c.studentCount || 0} student(s), status=${c.status} — ACCEPTING ENROLMENTS`);
            console.log(`      Fix: licence "${c.courseId}", set this class's status away from`);
            console.log('           "active" (its data is kept either way), or leave this tenant');
            console.log('           unenforced.');
        }
        for (const c of dormant) {
            console.log(`    - note: retired class "${c.name}" (${c.id}) teaches unlicensed `
                      + `"${c.courseId}" (${c.studentCount || 0} student(s), status=${c.status}).`);
            console.log('      Not blocking: enrolment is already closed on a non-active class, so');
            console.log('      enforcement cannot affect it. Its records are untouched. Reactivating');
            console.log('      it would start refusing enrolments — licence the course first.');
        }
        console.log('');
    }

    if (blocking) {
        console.log(`${blocking} tenant(s) need attention before enforcement is safe.`);
        process.exit(1);
    }
    console.log('All checked tenants are safe to enforce.');
    process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(2); });
