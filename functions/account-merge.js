/**
 * Account Merge Script — Merge two student accounts into one.
 *
 * Merges UID-A (old account) INTO UID-B (account to keep).
 * After merge, UID-B has the union of all progress from both accounts.
 * UID-A's profile is NOT deleted (manual step).
 *
 * What gets merged:
 *   - modulesCompleted, labsCompleted, achievements (array union)
 *   - quizzes (merge, keep highest score per quiz)
 *   - gate completions (subcollection copy)
 *   - flag captures (subcollection copy)
 *   - score submissions (subcollection copy)
 *   - XP recalculated from merged state
 *   - streak (take max)
 *   - gamesPlayed, ctfBoxesPwned, ctfFlagsCaptured (take max)
 *   - createdAt (keep earliest)
 *   - callsign, house, theme (keep UID-B's values)
 *
 * Usage:
 *   node account-merge.js <uid-a> <uid-b> [--dry-run]
 *
 * Examples:
 *   node account-merge.js abc123 def456 --dry-run   # Preview only
 *   node account-merge.js abc123 def456              # Live merge
 *
 * Finding UIDs:
 *   node account-lookup.js --callsign SCOTTYKNOWS
 *   node account-lookup.js --email scott@example.com
 *   Or: Firebase Console > Authentication > search by email
 *   Or: Firestore Console > users collection > browse documents
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const uidA = process.argv[2];
const uidB = process.argv[3];
const DRY_RUN = process.argv.includes('--dry-run');

if (!uidA || !uidB) {
    console.error('Usage: node account-merge.js <uid-a> <uid-b> [--dry-run]');
    console.error('  uid-a = old account (merge FROM)');
    console.error('  uid-b = keep account (merge INTO)');
    process.exit(1);
}

if (uidA === uidB) {
    console.error('ERROR: uid-a and uid-b are the same. Nothing to merge.');
    process.exit(1);
}

// XP rates (match XPCalculator.js)
const XP_RATES = {
    MODULE_COMPLETE: 100,
    LAB_COMPLETE: 500,
    QUIZ_PASS: 100,
    QUIZ_PERFECT: 200,
    GATE_CLEARED: 500,
    GAME_PLAYED: 100,
    PRESENTATION_VIEW: 100,
    DAILY_LOGIN: 25
};

function calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
}

function unionArrays(a, b) {
    return [...new Set([...(a || []), ...(b || [])])];
}

function mergeQuizzes(a, b) {
    const merged = { ...(a || {}) };
    const bQuizzes = b || {};
    for (const [quizId, bData] of Object.entries(bQuizzes)) {
        if (!merged[quizId]) {
            merged[quizId] = bData;
        } else {
            // Keep highest score
            if ((bData.score || 0) > (merged[quizId].score || 0)) {
                merged[quizId] = bData;
            }
        }
    }
    return merged;
}

async function copySubcollection(sourceUid, targetUid, collectionName) {
    const source = await db.collection('users').doc(sourceUid)
        .collection(collectionName).get();

    if (source.empty) return { copied: 0, skipped: 0 };

    let copied = 0;
    let skipped = 0;

    for (const doc of source.docs) {
        // Skip internal docs like _reset_log
        if (doc.id.startsWith('_')) {
            skipped++;
            continue;
        }

        const targetRef = db.collection('users').doc(targetUid)
            .collection(collectionName).doc(doc.id);
        const existing = await targetRef.get();

        if (!existing.exists) {
            if (!DRY_RUN) {
                await targetRef.set(doc.data());
            }
            copied++;
        } else {
            skipped++;
        }
    }

    return { copied, skipped };
}

async function main() {
    console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE MERGE ===');
    console.log('UID-A (merge from):', uidA);
    console.log('UID-B (keep):      ', uidB);
    console.log();

    // 1. Read both profiles
    const profileA = await db.collection('users').doc(uidA).get();
    const profileB = await db.collection('users').doc(uidB).get();

    if (!profileA.exists) {
        console.error('ERROR: UID-A not found in Firestore:', uidA);
        process.exit(1);
    }
    if (!profileB.exists) {
        console.error('ERROR: UID-B not found in Firestore:', uidB);
        process.exit(1);
    }

    const a = profileA.data();
    const b = profileB.data();

    console.log('=== ACCOUNT A (merge from) ===');
    console.log('  Callsign:', a.callsign || '(none)');
    console.log('  Email:', a.email || '(none)');
    console.log('  House:', a.house || '(none)');
    console.log('  XP:', a.xp || 0, '| Level:', a.level || 1);
    console.log('  Modules:', (a.modulesCompleted || []).length);
    console.log('  Labs:', (a.labsCompleted || []).length);
    console.log('  Achievements:', (a.achievements || []).length);
    console.log('  Streak:', a.streak || 0);
    console.log();

    console.log('=== ACCOUNT B (keep) ===');
    console.log('  Callsign:', b.callsign || '(none)');
    console.log('  Email:', b.email || '(none)');
    console.log('  House:', b.house || '(none)');
    console.log('  XP:', b.xp || 0, '| Level:', b.level || 1);
    console.log('  Modules:', (b.modulesCompleted || []).length);
    console.log('  Labs:', (b.labsCompleted || []).length);
    console.log('  Achievements:', (b.achievements || []).length);
    console.log('  Streak:', b.streak || 0);
    console.log();

    // 2. Merge arrays
    const mergedModules = unionArrays(a.modulesCompleted, b.modulesCompleted);
    const mergedLabs = unionArrays(a.labsCompleted, b.labsCompleted);
    const mergedAchievements = unionArrays(a.achievements, b.achievements);
    const mergedQuizzes = mergeQuizzes(a.quizzes, b.quizzes);

    // 3. Merge scalars (take best)
    const mergedStreak = Math.max(a.streak || 0, b.streak || 0);
    const mergedGamesPlayed = Math.max(a.gamesPlayed || 0, b.gamesPlayed || 0);
    const mergedCtfBoxes = Math.max(a.ctfBoxesPwned || 0, b.ctfBoxesPwned || 0);
    const mergedCtfFlags = Math.max(a.ctfFlagsCaptured || 0, b.ctfFlagsCaptured || 0);

    // Inherit identity fields from A if B has none
    const mergedHouse = b.house || a.house || null;
    const mergedEmail = b.email || a.email || null;
    const mergedTheme = b.theme || a.theme || null;
    const mergedFavorites = unionArrays(a.favorites, b.favorites);

    // 4. XP: take the higher value (recalc doesn't capture all XP sources)
    const xp = Math.max(a.xp || 0, b.xp || 0);
    const level = calculateLevel(xp);

    // 5. Copy subcollections
    console.log('=== SUBCOLLECTION MERGE ===');
    const gateResult = await copySubcollection(uidA, uidB, 'gates');
    console.log('  Gates: copied', gateResult.copied, '| skipped', gateResult.skipped);

    const flagResult = await copySubcollection(uidA, uidB, 'flag_captures');
    console.log('  Flag captures: copied', flagResult.copied, '| skipped', flagResult.skipped);

    const scoreResult = await copySubcollection(uidA, uidB, 'score_submissions');
    console.log('  Score submissions: copied', scoreResult.copied, '| skipped', scoreResult.skipped);
    console.log();

    // 6. Report
    console.log('=== MERGED RESULT ===');
    console.log('  Callsign:', b.callsign || a.callsign || '(none)');
    console.log('  House:', mergedHouse || '(none)', mergedHouse === a.house && !b.house ? '(inherited from A)' : '(from B)');
    console.log('  Modules:', mergedModules.length,
        '(was A:', (a.modulesCompleted || []).length,
        '+ B:', (b.modulesCompleted || []).length + ')');
    console.log('  Labs:', mergedLabs.length,
        '(was A:', (a.labsCompleted || []).length,
        '+ B:', (b.labsCompleted || []).length + ')');
    console.log('  Achievements:', mergedAchievements.length,
        '(was A:', (a.achievements || []).length,
        '+ B:', (b.achievements || []).length + ')');
    console.log('  Quizzes:', Object.keys(mergedQuizzes).length);
    console.log('  Streak:', mergedStreak);
    console.log('  XP:', xp, '| Level:', level);
    console.log();

    if (DRY_RUN) {
        console.log('DRY RUN -- no changes made. Run without --dry-run to apply.');
        return;
    }

    // 7. Apply merge to UID-B
    console.log('Applying merge to UID-B...');
    await db.collection('users').doc(uidB).update({
        modulesCompleted: mergedModules,
        labsCompleted: mergedLabs,
        achievements: mergedAchievements,
        quizzes: mergedQuizzes,
        streak: mergedStreak,
        xp: xp,
        level: level,
        gamesPlayed: mergedGamesPlayed,
        ctfBoxesPwned: mergedCtfBoxes,
        ctfFlagsCaptured: mergedCtfFlags,
        // Inherit identity fields from A if B has none
        ...(mergedHouse && !b.house ? { house: mergedHouse } : {}),
        ...(mergedEmail && !b.email ? { email: mergedEmail } : {}),
        ...(mergedTheme && !b.theme ? { theme: mergedTheme } : {}),
        ...(mergedFavorites.length > 0 ? { favorites: mergedFavorites } : {}),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('  Profile updated.');

    // 8. Delete UID-A's sync blob (prevent ghost re-sync)
    const syncRef = db.collection('users').doc(uidA).collection('sync').doc('localStorage');
    const syncDoc = await syncRef.get();
    if (syncDoc.exists) {
        await syncRef.delete();
        console.log('  UID-A sync blob deleted.');
    }

    // 9. Log the merge event on both accounts
    const mergeLog = {
        action: 'account_merge',
        mergedFrom: uidA,
        mergedInto: uidB,
        callsignA: a.callsign || null,
        callsignB: b.callsign || null,
        previousXP_A: a.xp || 0,
        previousXP_B: b.xp || 0,
        newXP: xp,
        newLevel: level,
        modulesAdded: mergedModules.length - (b.modulesCompleted || []).length,
        mergedAt: admin.firestore.FieldValue.serverTimestamp(),
        mergedBy: 'admin-script'
    };

    await db.collection('users').doc(uidB)
        .collection('gates').doc('_merge_log').set(mergeLog);
    await db.collection('users').doc(uidA)
        .collection('gates').doc('_merge_log').set({
            ...mergeLog,
            note: 'This account was merged into ' + uidB
        });
    console.log('  Merge event logged on both accounts.');

    console.log();
    console.log('DONE. Accounts merged.');
    console.log('UID-B (' + (b.callsign || uidB) + ') now has all progress from both accounts.');
    console.log('Next login will show XP:', xp, '| Level:', level);
    console.log();
    console.log('MANUAL STEPS REMAINING:');
    console.log('  1. Verify UID-B data in Firestore console');
    console.log('  2. If UID-A was in any classes, update class membership');
    console.log('  3. Optionally delete UID-A from Firebase Auth');
    console.log('     (Firebase Console > Authentication > find by email > delete)');
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 3000));
