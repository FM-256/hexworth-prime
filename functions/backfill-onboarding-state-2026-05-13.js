#!/usr/bin/env node
/**
 * backfill-onboarding-state-2026-05-13.js
 *
 * Platform-wide PROFILE BACKFILL. Walks every Firebase Auth user, ensures
 * users/{uid} exists with the canonical first-visit shape. Fills MISSING
 * fields only — never overwrites existing data. Idempotent: safe to re-run.
 *
 * Built 2026-05-13 after platform audit showed 67 of 133 Auth users had
 * profile gaps (46 missing users/{uid}, 22 enrolled-without-users-doc,
 * 20 missing email field, 13 missing displayName).
 *
 * Per-user write logic:
 *   - Read current users/{uid}
 *   - Compute canonical shape from Auth (email, displayName, photoURL, etc.)
 *   - Patch ONLY fields where current is undefined, null, or empty string
 *   - If patch is empty (user already complete), no write
 *
 * IMPORTANT — createdAt semantics:
 *   For CREATE writes the backfill uses authUser.metadata.creationTime
 *   (when the Firebase Auth account was first created), not the time the
 *   backfill ran. This is the most accurate timestamp available — it
 *   answers "when did this person first appear on the platform" — but
 *   it differs from the enrollInClass path which uses serverTimestamp().
 *   Anything sorting users by createdAt expecting "when did they join
 *   Hexworth specifically" will see Auth-account-creation time for
 *   backfilled users, which may predate Hexworth use by months for
 *   users who registered on another product first.
 *
 * Dry-run by default — pass --apply to commit.
 *
 * Usage:
 *   cd functions
 *   node backfill-onboarding-state-2026-05-13.js          # dry-run
 *   node backfill-onboarding-state-2026-05-13.js --apply  # writes
 *   node backfill-onboarding-state-2026-05-13.js --limit 5 --apply   # cap writes
 */
'use strict';

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const APPLY = process.argv.includes('--apply');
const limitIdx = process.argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity;

function buildCanonicalFromAuth(authUser) {
    // Mirrors FirestoreManager.js:1594-1607 first-visit shape.
    return {
        email:        authUser.email || null,
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
        createdAt:    admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.creationTime))
    };
}

function computePatch(currentDoc, canonical) {
    // Treat undefined, null, AND empty string ('') as missing — matches the
    // audit's `!d.email` semantics so a user counted as users_doc_no_email
    // actually gets repaired. Empty arrays and empty objects count as "set"
    // (they're valid initial state — don't overwrite).
    const patch = {};
    for (const [field, value] of Object.entries(canonical)) {
        const cur = currentDoc[field];
        const missing = cur == null || cur === '';
        if (missing) patch[field] = value;
    }
    return patch;
}

(async () => {
    console.log('═══ Platform onboarding-state backfill ═══');
    console.log('Mode:', APPLY ? 'APPLY (writes to prod)' : 'DRY-RUN');
    console.log('Limit:', LIMIT === Infinity ? '(unlimited)' : LIMIT);
    console.log();

    // List all Auth users
    const authUsers = [];
    let nextPageToken = null;
    do {
        const result = await admin.auth().listUsers(1000, nextPageToken || undefined);
        result.users.forEach(u => authUsers.push(u));
        nextPageToken = result.pageToken;
    } while (nextPageToken);
    console.log('Auth users:', authUsers.length);

    let createdCount = 0;
    let patchedCount = 0;
    let skippedCount = 0;
    let writeCount = 0;
    const samples = []; // first few writes for visibility

    for (const u of authUsers) {
        if (writeCount >= LIMIT) break;
        const userRef = db.doc('users/' + u.uid);
        const snap = await userRef.get();
        const canonical = buildCanonicalFromAuth(u);

        let action, patch;
        if (!snap.exists) {
            // Brand-new profile — write full canonical
            action = 'CREATE';
            patch = { ...canonical, _profileCreatedBy: 'backfill-onboarding-state-2026-05-13' };
            createdCount++;
        } else {
            patch = computePatch(snap.data(), canonical);
            if (Object.keys(patch).length === 0) {
                skippedCount++;
                continue;
            }
            action = 'PATCH';
            patchedCount++;
        }

        // Sample-log first 5 writes
        if (samples.length < 5) {
            samples.push({
                uid: u.uid,
                authEmail: u.email || null,
                action,
                patchFields: Object.keys(patch)
            });
        }

        if (APPLY) {
            await userRef.set(patch, { merge: true });
        }
        writeCount++;
    }

    console.log();
    console.log('Summary:');
    console.log('  Auth users scanned:    ', authUsers.length);
    console.log('  Would CREATE new docs: ', createdCount);
    console.log('  Would PATCH partial:   ', patchedCount);
    console.log('  Already complete:      ', skippedCount);
    console.log('  Total writes:          ', writeCount);
    console.log();
    console.log('First 5 write samples:');
    samples.forEach(s => {
        console.log('  ' + s.action.padEnd(7) + s.uid + '  email=' + (s.authEmail || '(none)') + '  fields=' + s.patchFields.join(','));
    });
    console.log();
    if (!APPLY) console.log('Dry-run — no writes performed. Re-run with --apply to commit.');
    else        console.log('Done. ' + writeCount + ' writes committed.');
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
