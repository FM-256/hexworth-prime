#!/usr/bin/env node
/**
 * onboarding-state.js — CLI runner for the userOnboardingState diagnostic.
 *
 * Same logic as the userOnboardingState CF (functions/index.js), but runs
 * locally with firebase-admin credentials instead of going through the
 * CF auth gate. Useful for terminal-driven investigation — same output
 * shape, so anything you learn here informs what the in-browser UI will
 * surface.
 *
 * Usage:
 *   cd functions
 *   node onboarding-state.js --email wnorfleet@norfleetsolutions.com
 *   node onboarding-state.js --uid XkBHtRgGyeWrsyVNxPXHl5wT51w1
 *   node onboarding-state.js --email <addr> --json    # raw JSON output
 */
'use strict';

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
const db = admin.firestore();

function arg(name) {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : null;
}
const queryEmail = arg('email');
const queryUid = arg('uid');
const asJson = process.argv.includes('--json');

if (!queryEmail && !queryUid) {
    console.error('Usage: node onboarding-state.js --email <addr> | --uid <uid> [--json]');
    process.exit(2);
}

(async () => {
    let resolvedUid = queryUid || null;
    let authRecord = null;
    const gaps = [];

    try {
        if (queryUid) {
            authRecord = await admin.auth().getUser(queryUid);
        } else {
            authRecord = await admin.auth().getUserByEmail(queryEmail);
        }
        resolvedUid = authRecord.uid;
    } catch (e) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/email-not-found') {
            gaps.push('not_in_firebase_auth');
        } else {
            gaps.push('auth_lookup_error:' + e.code);
        }
    }

    const auth = authRecord ? {
        exists: true,
        uid: authRecord.uid,
        email: authRecord.email || null,
        displayName: authRecord.displayName || null,
        emailVerified: authRecord.emailVerified,
        providers: authRecord.providerData.map(p => p.providerId),
        createdAt: authRecord.metadata.creationTime,
        lastSignIn: authRecord.metadata.lastSignInTime
    } : null;

    let usersDoc = null;
    if (resolvedUid) {
        const snap = await db.doc('users/' + resolvedUid).get();
        if (snap.exists) {
            const d = snap.data();
            usersDoc = {
                exists: true,
                hasEmail: !!d.email,
                hasDisplayName: !!d.displayName,
                hasCallsign: !!d.callsign,
                fieldCount: Object.keys(d).length,
                data: {
                    email: d.email || null,
                    displayName: d.displayName || null,
                    callsign: d.callsign || null,
                    accountType: d.accountType || null,
                    tier: d.tier || null
                }
            };
            if (!d.email) gaps.push('users_doc_no_email');
            if (!d.displayName) gaps.push('users_doc_no_displayName');
        } else {
            usersDoc = { exists: false };
            if (auth) gaps.push('users_doc_missing');
        }
    }

    const enrollments = [];
    if (resolvedUid) {
        const enrollSnap = await db.doc('enrollments/' + resolvedUid).get();
        if (enrollSnap.exists) {
            const data = enrollSnap.data();
            if (Array.isArray(data.enrollments)) {
                enrollments.push(...data.enrollments);
            } else if (data.tenantSlug) {
                enrollments.push({
                    tenantSlug: data.tenantSlug,
                    classId: data.classId,
                    courseId: data.courseId || ''
                });
            }
        }
        if (enrollments.length > 0 && usersDoc && !usersDoc.exists) {
            gaps.push('enrolled_without_users_doc');
        }
    }

    const progressDocs = [];
    if (resolvedUid) {
        for (const e of enrollments) {
            const path = `tenants/${e.tenantSlug}/classes/${e.classId}/progress/${resolvedUid}`;
            const pgSnap = await db.doc(path).get();
            if (pgSnap.exists) {
                const d = pgSnap.data();
                progressDocs.push({
                    path,
                    tenantSlug: e.tenantSlug,
                    classId: e.classId,
                    displayName: d.displayName || null,
                    email: d.email || null,
                    lastActive: d.lastActive && d.lastActive.toDate
                        ? d.lastActive.toDate().toISOString()
                        : (d.lastActive || null),
                    isGuest: !!d.isGuest
                });
            }
        }
        if (progressDocs.length > 0 && usersDoc && !usersDoc.exists) {
            gaps.push('progress_without_users_doc');
        }
    }

    const tenantAdminships = [];
    if (resolvedUid) {
        const tenSnap = await db.collection('tenants').get();
        tenSnap.forEach(t => {
            const adminUids = t.data().adminUids || [];
            if (adminUids.includes(resolvedUid)) {
                tenantAdminships.push({ tenantId: t.id, tenantName: t.data().name || t.id });
            }
        });
    }

    const out = {
        query: { email: queryEmail || null, uid: queryUid || null },
        resolvedUid,
        auth,
        usersDoc,
        enrollments,
        progressDocs,
        tenantAdminships,
        gaps
    };

    if (asJson) {
        console.log(JSON.stringify(out, null, 2));
        return;
    }

    // Pretty print
    console.log('═══ User Onboarding State ═══');
    console.log('Query:           ', queryEmail || queryUid);
    console.log('Resolved UID:    ', resolvedUid || '(none)');
    console.log();
    console.log('Firebase Auth:   ', auth ? '✓ exists' : '✗ NOT FOUND');
    if (auth) {
        console.log('  email:         ', auth.email);
        console.log('  displayName:   ', auth.displayName);
        console.log('  emailVerified: ', auth.emailVerified);
        console.log('  providers:     ', auth.providers.join(', '));
        console.log('  createdAt:     ', auth.createdAt);
        console.log('  lastSignIn:    ', auth.lastSignIn);
    }
    console.log();
    console.log('users/{uid}:     ', usersDoc && usersDoc.exists ? '✓ exists (' + usersDoc.fieldCount + ' fields)' : '✗ MISSING');
    if (usersDoc && usersDoc.exists) {
        console.log('  email:         ', usersDoc.data.email);
        console.log('  displayName:   ', usersDoc.data.displayName);
        console.log('  callsign:      ', usersDoc.data.callsign);
        console.log('  accountType:   ', usersDoc.data.accountType);
        console.log('  tier:          ', usersDoc.data.tier);
    }
    console.log();
    console.log('Enrollments:     ', enrollments.length);
    enrollments.forEach(e => console.log('  - ' + e.tenantSlug + ' / ' + e.classId + (e.courseId ? ' (' + e.courseId + ')' : '')));
    console.log();
    console.log('Progress docs:   ', progressDocs.length);
    progressDocs.forEach(p => console.log('  - ' + p.path + '  lastActive=' + (p.lastActive || 'n/a')));
    console.log();
    console.log('Tenant admin in: ', tenantAdminships.length);
    tenantAdminships.forEach(t => console.log('  - ' + t.tenantId + '  (' + t.tenantName + ')'));
    console.log();
    console.log('Gaps:            ', gaps.length === 0 ? '(none)' : gaps.join(', '));
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
