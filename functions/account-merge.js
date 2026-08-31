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
 *   - EVERY subcollection under users/{uid}, enumerated at runtime, except an explicit
 *     SKIP list with a stated reason per entry (see step 5). It previously copied only
 *     gates, flag_captures and score_submissions by name and silently dropped the rest,
 *     including server_awards -- the tamper-evident badge proofs, which cannot be
 *     re-derived from client state. BUG-240.
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
const { recomputeCtfStats } = require('./ctf-stats');
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
    /* CTF counters are NOT merged by Math.max — see below. Taking the larger of two stored
       values would resurrect exactly the client-derived numbers that Phase B retired: the
       server is the sole writer of these fields, and a merge that copies stored values back
       in would silently undo that for every merged account. They are recomputed from the
       MERGED flag_captures instead, after the subcollection copy. */

    // Inherit identity fields from A if B has none
    const mergedHouse = b.house || a.house || null;
    const mergedEmail = b.email || a.email || null;
    const mergedTheme = b.theme || a.theme || null;
    const mergedFavorites = unionArrays(a.favorites, b.favorites);

    // 4. XP: take the higher value (recalc doesn't capture all XP sources)
    const xp = Math.max(a.xp || 0, b.xp || 0);
    const level = calculateLevel(xp);

    // 5. Copy subcollections
    //
    // ENUMERATED, NOT NAMED. This used to call copySubcollection three times with literal names
    // -- 'gates', 'flag_captures', 'score_submissions' -- and silently dropped everything else the
    // student had earned. Among the casualties was users/{uid}/server_awards, the tamper-evident
    // badge proof store, which is precisely the record that CANNOT be re-derived from client
    // state. It was an allowlist that nobody updated when a new subcollection shipped, so it went
    // stale by default rather than by decision. BUG-240.
    //
    // Default is now COPY. Anything not copied must appear in SKIP with a reason, and every
    // collection encountered is printed either way, so a merge can never quietly lose something.
    // The asymmetry is deliberate: copying a cooldown doc is a nuisance, losing a ledger is
    // permanent.
    //
    // Do NOT build this skip-list from name shape. "_attempts" looks like a rate limiter but
    // quiz_attempts, mission_attempts and lab_attempts are ledgers of what the student actually
    // did -- HEXOS-4 treats quiz_attempts as the authoritative record of every submission. Skip on
    // what a collection DOES, not what it is called.
    const SKIP = {
        sync: 'device cache, not a user fact. Copying uid-A\'s localStorage blob into uid-B '
            + 'contaminates B\'s next restore with A\'s local state, and step 8 below already '
            + 'DELETES A\'s copy for exactly that reason (ghost re-sync).',
        flag_attempts: 'rate-limit / cooldown bookkeeping for validateFlag. Carries no earned '
            + 'fact; importing it would import a stale cooldown.',
        gate_attempts: 'rate-limit / cooldown bookkeeping for gate submission. Same reasoning.',
        activation_attempts: 'rate-limit / cooldown bookkeeping. Same reasoning.'
    };

    console.log('=== SUBCOLLECTION MERGE ===');
    const sourceCollections = await db.collection('users').doc(uidA).listCollections();
    console.log('  uid-A has', sourceCollections.length, 'subcollection(s)');

    const copyResults = {};
    for (const col of sourceCollections) {
        const name = col.id;
        if (SKIP[name]) {
            console.log(`  ${name}: SKIPPED -- ${SKIP[name]}`);
            continue;
        }
        const res = await copySubcollection(uidA, uidB, name);
        copyResults[name] = res;
        console.log(`  ${name}: copied ${res.copied} | skipped ${res.skipped}`);
    }

    // The dry-run CTF line below needs the flag-capture count. Absent reads as zero rather than
    // throwing, because a student may legitimately never have captured a flag.
    const flagResult = copyResults.flag_captures || { copied: 0, skipped: 0 };

    /* Recompute the CTF counters from the MERGED capture set. This runs AFTER the
       flag_captures copy above, so it sees the union of both accounts. Capture doc ids are
       deterministic ({boxId}_{flagId}), so the copy de-duplicates naturally and a flag both
       accounts captured is counted once — which Math.max could never express, and which is
       strictly more accurate than either account's stored figure.
       Uses the same ctf-stats module the Cloud Functions use; there is one definition. */
    let mergedCtfBoxes = 0, mergedCtfFlags = 0;
    if (!DRY_RUN) {
        const stats = await recomputeCtfStats(db, admin.firestore.FieldValue, uidB);
        mergedCtfBoxes = stats.boxesPwned;
        mergedCtfFlags = stats.flagsCaptured;
        console.log(`  CTF recomputed from merged captures: ${mergedCtfFlags} flags, ${mergedCtfBoxes} boxes`);
    } else {
        const caps = await db.collection('users').doc(uidB).collection('flag_captures').get();
        console.log(`  [DRY] would recompute CTF from ${caps.size} existing + ${flagResult.copied || 0} copied captures`);
    }
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
