#!/usr/bin/env node
/**
 * fix-wendy-norfleet-onboarding-2026-05-13.js
 *
 * ONE-SHOT REPAIR for Wendy Norfleet's onboarding state.
 *
 * Symptom: Admin tried to add her as instructor on tenant dr-norfleet, but
 * searchUsers CF returned "No user found" — even though she had:
 *   - Firebase Auth record (Google sign-in 2026-05-13 16:44 GMT)
 *   - Class enrollment in tenants/dr-norfleet/classes/H5a7Mg2YScesZw9kUR4s
 *
 * Root cause: enrollInClass CF writes per-class progress + global enrollments,
 * but does NOT upsert users/{uid}. Until the student visits dashboard.html or
 * a lab page, their global profile is missing. searchUsers only scans users/,
 * so Auth-only / progress-doc-only users are invisible.
 *
 * This script:
 *   1. Pulls Wendy's Auth data (email, displayName, photoURL, createdAt).
 *   2. Writes users/XkBHtRgGyeWrsyVNxPXHl5wT51w1 with the same shape that
 *      dashboard.html / FirestoreManager.setUserProfile would produce on
 *      first dashboard visit. Merge: true — won't clobber if it somehow
 *      already exists.
 *   3. Adds her UID to tenants/dr-norfleet.adminUids via arrayUnion.
 *   4. Re-reads + prints both docs for verification.
 *
 * Dry-run by default. Pass --apply to actually write.
 *
 * Usage:
 *   cd functions
 *   node fix-wendy-norfleet-onboarding-2026-05-13.js          # dry-run
 *   node fix-wendy-norfleet-onboarding-2026-05-13.js --apply  # writes to prod
 *
 * Kept per "we do not destroy" rule — this is the documented one-shot fix.
 * The permanent fix (enrollInClass upsert + searchUsers Auth fallback) ships
 * separately as code changes.
 */
'use strict';

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const APPLY = process.argv.includes('--apply');

const WENDY_UID    = 'XkBHtRgGyeWrsyVNxPXHl5wT51w1';
const WENDY_EMAIL  = 'wnorfleet@norfleetsolutions.com';
const TENANT_ID    = 'dr-norfleet';

(async () => {
    console.log('═══ Wendy Norfleet onboarding repair ═══');
    console.log('Mode:', APPLY ? 'APPLY (writes to prod)' : 'DRY-RUN');
    console.log();

    // 1. Pull Auth record (source of truth for email/displayName)
    process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
    let authUser;
    try {
        authUser = await admin.auth().getUserByEmail(WENDY_EMAIL);
    } catch (e) {
        console.error('FATAL: Auth lookup failed for ' + WENDY_EMAIL);
        console.error(e.message);
        process.exit(1);
    }
    if (authUser.uid !== WENDY_UID) {
        console.error('FATAL: Auth UID ' + authUser.uid + ' does not match expected ' + WENDY_UID);
        console.error('Has she been recreated? Aborting.');
        process.exit(1);
    }
    console.log('Auth record confirmed:');
    console.log('  uid:        ', authUser.uid);
    console.log('  email:      ', authUser.email);
    console.log('  displayName:', authUser.displayName);
    console.log('  photoURL:   ', authUser.photoURL || '(none)');
    console.log('  createdAt:  ', authUser.metadata.creationTime);
    console.log();

    // 2. Read current state
    const userDocRef = db.doc('users/' + WENDY_UID);
    const tenantRef  = db.doc('tenants/' + TENANT_ID);

    const [userDoc, tenantDoc] = await Promise.all([userDocRef.get(), tenantRef.get()]);

    console.log('Current state:');
    console.log('  users/' + WENDY_UID + ' exists:', userDoc.exists);
    console.log('  tenant adminUids:', tenantDoc.exists ? JSON.stringify(tenantDoc.data().adminUids) : '(tenant missing!)');
    console.log();
    if (!tenantDoc.exists) {
        console.error('FATAL: tenants/' + TENANT_ID + ' does not exist. Aborting.');
        process.exit(1);
    }

    const alreadyAdmin = (tenantDoc.data().adminUids || []).includes(WENDY_UID);

    // 3. Build the patch for users/{uid}
    //    EXACTLY mirrors FirestoreManager.js:1594-1607 — the canonical shape
    //    produced on a fresh Google first-visit. Do NOT add fields the normal
    //    flow doesn't write: under merge:true they'd orphan in Firestore and
    //    never be cleared by syncBidirectional (Nancy 2026-05-13).
    const profilePatch = {
        email:        authUser.email,
        displayName:  authUser.displayName || null,
        photoURL:     authUser.photoURL || null,
        tier:         'free',
        grandfathered: false,
        xp:           0,
        streak:       0,
        modulesCompleted: [],
        labsCompleted: [],
        achievements: [],
        quizzes:      {},
        createdAt:    admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.creationTime)),
        // Provenance for audit — non-canonical but intentional. Lets us find
        // backfill-created profiles later via where('_profileCreatedBy', '==', ...).
        _profileCreatedBy: 'fix-wendy-norfleet-onboarding-2026-05-13.js'
    };

    console.log('Planned writes:');
    console.log();
    console.log('  WRITE  users/' + WENDY_UID + '  (merge: true)');
    console.log('    fields:', Object.keys(profilePatch).join(', '));
    console.log('    email =', JSON.stringify(profilePatch.email));
    console.log('    displayName =', JSON.stringify(profilePatch.displayName));
    console.log();
    if (alreadyAdmin) {
        console.log('  SKIP   tenants/' + TENANT_ID + '.adminUids — already contains UID');
    } else {
        console.log('  WRITE  tenants/' + TENANT_ID + '.adminUids ← arrayUnion(' + WENDY_UID + ')');
    }
    console.log();

    if (!APPLY) {
        console.log('Dry-run — no writes performed. Re-run with --apply to commit.');
        return;
    }

    // 4. APPLY
    console.log('Applying...');
    const batch = db.batch();
    batch.set(userDocRef, profilePatch, { merge: true });
    if (!alreadyAdmin) {
        // set+merge is safer than update — works whether updatedAt currently exists or not.
        batch.set(tenantRef, {
            adminUids: FieldValue.arrayUnion(WENDY_UID),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
    }
    await batch.commit();
    console.log('  ✓ commit complete');
    console.log();

    // 5. Re-read and print for confirmation
    const [verifyUser, verifyTenant] = await Promise.all([userDocRef.get(), tenantRef.get()]);
    console.log('Post-write verification:');
    console.log('  users/' + WENDY_UID + ' exists:', verifyUser.exists);
    if (verifyUser.exists) {
        const d = verifyUser.data();
        console.log('    email:      ', d.email);
        console.log('    displayName:', d.displayName);
        console.log('    fields:     ', Object.keys(d).join(', '));
    }
    console.log('  tenant adminUids:', JSON.stringify(verifyTenant.data().adminUids));
    console.log();
    console.log('═══ Done ═══');
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
