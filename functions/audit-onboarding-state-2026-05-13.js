#!/usr/bin/env node
/**
 * audit-onboarding-state-2026-05-13.js
 *
 * Platform-wide READ-ONLY scan: runs the same logic as onboarding-state.js
 * for EVERY Firebase Auth user + every users/{uid} doc, then reports the
 * gap distribution. Companion to userOnboardingState CF — same gap
 * categories, batched.
 *
 * Output:
 *   - Console: gap-category histogram
 *   - functions/audit-onboarding-state-2026-05-13-report.json (full per-user records)
 *
 * Built 2026-05-13 after Wendy Norfleet incident exposed the
 * enrollInClass-doesn't-upsert-users gap. This audit quantifies the scope
 * of partial profiles platform-wide so we know how big the backfill is.
 *
 * Usage:
 *   cd functions
 *   node audit-onboarding-state-2026-05-13.js
 */
'use strict';

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
const db = admin.firestore();
const fs = require('fs');

(async () => {
    console.log('═══ Platform Onboarding-State Audit ═══');
    console.log('Started:', new Date().toISOString());
    console.log();

    // 1. Pull all Auth users (listUsers is paginated, 1000/page max)
    console.log('[1/3] Listing Firebase Auth users...');
    const authUsers = [];
    let nextPageToken = null;
    do {
        const result = await admin.auth().listUsers(1000, nextPageToken || undefined);
        result.users.forEach(u => authUsers.push(u));
        nextPageToken = result.pageToken;
    } while (nextPageToken);
    console.log('  Found', authUsers.length, 'Auth users');

    // 2. Pull all users/{uid} docs in one snapshot
    console.log('[2/3] Listing Firestore users/ docs...');
    const usersSnap = await db.collection('users').get();
    const usersById = new Map();
    usersSnap.forEach(d => usersById.set(d.id, d.data()));
    console.log('  Found', usersSnap.size, 'users/{uid} docs');

    // 3. Pull all tenants once
    const tenantsSnap = await db.collection('tenants').get();
    const tenantsAdminMap = new Map();  // uid -> [tenantId]
    tenantsSnap.forEach(t => {
        const adminUids = t.data().adminUids || [];
        adminUids.forEach(uid => {
            if (!tenantsAdminMap.has(uid)) tenantsAdminMap.set(uid, []);
            tenantsAdminMap.get(uid).push(t.id);
        });
    });

    // 4. Analyze
    console.log('[3/3] Analyzing each Auth user...');
    const reports = [];
    const histogram = {};

    for (const u of authUsers) {
        const gaps = [];
        const usersDocRaw = usersById.get(u.uid);
        const usersDocExists = !!usersDocRaw;

        if (!usersDocExists) {
            gaps.push('users_doc_missing');
        } else {
            if (!usersDocRaw.email) gaps.push('users_doc_no_email');
            if (!usersDocRaw.displayName) gaps.push('users_doc_no_displayName');
        }

        // enrollments + progress are expensive per-user; only sample for
        // users with gaps (the ones we'll backfill) — the report includes
        // any user with at least one gap.
        let enrollments = [];
        if (gaps.length > 0) {
            try {
                const enrollDoc = await db.doc('enrollments/' + u.uid).get();
                if (enrollDoc.exists) {
                    const data = enrollDoc.data();
                    if (Array.isArray(data.enrollments)) {
                        enrollments = data.enrollments;
                    } else if (data.tenantSlug) {
                        enrollments = [{ tenantSlug: data.tenantSlug, classId: data.classId, courseId: data.courseId || '' }];
                    }
                }
            } catch (_) {}
            if (enrollments.length > 0 && !usersDocExists) {
                gaps.push('enrolled_without_users_doc');
            }
        }

        if (gaps.length === 0) continue;  // skip clean users

        const tenantAdminships = tenantsAdminMap.get(u.uid) || [];

        const report = {
            uid: u.uid,
            authEmail: u.email || null,
            authDisplayName: u.displayName || null,
            authEmailVerified: u.emailVerified,
            authProviders: u.providerData.map(p => p.providerId),
            authCreated: u.metadata.creationTime,
            authLastSignIn: u.metadata.lastSignInTime,
            usersDocExists,
            usersDocEmail: usersDocRaw ? (usersDocRaw.email || null) : null,
            usersDocDisplayName: usersDocRaw ? (usersDocRaw.displayName || null) : null,
            enrollmentCount: enrollments.length,
            enrollments,
            tenantAdminships,
            gaps
        };
        reports.push(report);

        gaps.forEach(g => { histogram[g] = (histogram[g] || 0) + 1; });
    }

    // Reverse-direction check: orphan users/{uid} docs with no matching Auth record
    // (Auth user deleted but Firestore profile left behind)
    const authUidSet = new Set(authUsers.map(u => u.uid));
    const orphanProfiles = [];
    usersById.forEach((data, uid) => {
        if (!authUidSet.has(uid)) {
            orphanProfiles.push({ uid, email: data.email || null, displayName: data.displayName || null });
        }
    });
    if (orphanProfiles.length > 0) histogram['orphan_users_doc_no_auth'] = orphanProfiles.length;

    // 5. Report
    console.log();
    console.log('═══ RESULTS ═══');
    console.log('Total Auth users:    ', authUsers.length);
    console.log('Total users/ docs:   ', usersSnap.size);
    console.log('Users with gaps:     ', reports.length);
    console.log('Orphan profiles:     ', orphanProfiles.length, '(users/ doc with no Auth record)');
    console.log();
    console.log('Gap histogram:');
    Object.entries(histogram).sort((a,b) => b[1] - a[1]).forEach(([g, n]) => {
        console.log('  ' + n.toString().padStart(4) + '  ' + g);
    });
    console.log();
    console.log('Tenant-admin gap intersections (users with gaps who are also tenant admins):');
    const adminWithGaps = reports.filter(r => r.tenantAdminships.length > 0);
    if (adminWithGaps.length === 0) {
        console.log('  (none)');
    } else {
        adminWithGaps.forEach(r => {
            console.log('  ' + r.uid + '  email=' + (r.authEmail || '(none)') + '  tenants=' + r.tenantAdminships.join(',') + '  gaps=' + r.gaps.join(','));
        });
    }
    console.log();

    const outPath = __dirname + '/audit-onboarding-state-2026-05-13-report.json';
    fs.writeFileSync(outPath, JSON.stringify({
        scannedAt: new Date().toISOString(),
        totalAuthUsers: authUsers.length,
        totalUsersDocs: usersSnap.size,
        usersWithGaps: reports.length,
        orphanProfiles,
        histogram,
        reports
    }, null, 2));
    console.log('Full report:', outPath);
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
