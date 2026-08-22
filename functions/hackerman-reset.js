/**
 * Hackerman Reset — Option 3: Recalculate from server-validated events only.
 *
 * Keeps: callsign, house, displayName, account fields, first_visit, sorted, first_module
 * Wipes: XP, level, modulesCompleted, labsCompleted, fake achievements, streak inflation
 * Recalculates: XP from server-validated gates + flags + scores only
 *
 * Usage: node hackerman-reset.js <uid> [--dry-run]
 *
 * ⚠ THE UID IS NOW AN ARGUMENT (2026-08-21). It was hardcoded, which published a real student's
 * Firebase UID in a PUBLIC repo. Taking it as an argument fixes that, but it also means THIS
 * DESTRUCTIVE TOOL CAN NOW BE POINTED AT THE WRONG PERSON, which was impossible before. Two
 * guards below exist for exactly that: the uid is required with no default, and a uid that does
 * not resolve to an existing profile aborts before any write. Run --dry-run first.
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

// First non-flag argument, so it cannot be confused with --dry-run.
const uid = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!uid) {
    console.error('usage: node hackerman-reset.js <uid> [--dry-run]');
    process.exit(1);
}
const DRY_RUN = process.argv.includes('--dry-run');

// XP rates (match XPCalculator.js)
const XP_RATES = {
    GATE_CLEARED: 500,
    LAB_COMPLETE: 500,
    QUIZ_PASS: 100,
    QUIZ_PERFECT: 200,
    GAME_PLAYED: 100,
    PRESENTATION_VIEW: 100,
    MODULE_COMPLETE: 1000,
    DAILY_LOGIN: 25
};

function calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
}

// Only these achievements can survive without server validation
const LEGIT_ACHIEVEMENTS = ['first_visit', 'sorted', 'first_module'];

async function main() {
    console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RESET ===');
    console.log('Target UID:', uid);
    console.log();

    // 1. Read current state
    const profile = await db.collection('users').doc(uid).get();
    // ABORT before any write if the uid does not resolve. Previously the uid was hardcoded and
    // always valid, so profile.data() being undefined could not happen; now a mistyped argument
    // would reach the wipe below with `current` undefined.
    if (!profile.exists) {
        console.error(`No such user: ${uid} — aborting before any write.`);
        process.exit(1);
    }
    const current = profile.data();
    console.log('BEFORE:');
    console.log('  XP:', current.xp, '| Level:', current.level);
    console.log('  modulesCompleted:', current.modulesCompleted);
    console.log('  labsCompleted:', current.labsCompleted);
    console.log('  achievements:', JSON.stringify(current.achievements));
    console.log('  streak:', current.streak);
    console.log();

    // 2. Count server-validated events
    const gates = await db.collection('users').doc(uid).collection('gates').get();
    const flags = await db.collection('users').doc(uid).collection('flag_captures').get();
    const scores = await db.collection('users').doc(uid).collection('score_submissions').get();

    console.log('SERVER-VALIDATED EVENTS:');
    console.log('  Gates:', gates.size);
    console.log('  Flags:', flags.size);
    console.log('  Scores:', scores.size);
    console.log();

    // 3. Calculate XP from server-validated events only
    let xp = 0;

    // Gates: 500 XP each
    xp += gates.size * XP_RATES.GATE_CLEARED;

    // Flags: count total flags across all captures
    let totalFlags = 0;
    flags.docs.forEach(f => {
        const data = f.data();
        totalFlags += data.flagCount || 1;
    });
    xp += totalFlags * XP_RATES.LAB_COMPLETE;

    // Game scores: 100 XP per unique game
    const uniqueGames = new Set();
    scores.docs.forEach(s => {
        const data = s.data();
        if (data.gameId) uniqueGames.add(data.gameId);
    });
    xp += uniqueGames.size * XP_RATES.GAME_PLAYED;

    // Base XP for having an account (first_visit + sorted + first_module)
    xp += XP_RATES.PRESENTATION_VIEW * 3; // 300 XP for 3 legit achievements

    const level = calculateLevel(xp);

    // 4. Filter achievements to only legit ones
    const currentAch = Array.isArray(current.achievements) ? current.achievements : [];
    const cleanAch = currentAch.filter(a => LEGIT_ACHIEVEMENTS.includes(a));

    // 5. Build the sync blob cleanup - read and sanitize
    const syncRef = db.collection('users').doc(uid).collection('sync').doc('localStorage');
    const syncDoc = await syncRef.get();

    console.log('RESET VALUES:');
    console.log('  XP:', xp, '(was', current.xp + ')');
    console.log('  Level:', level, '(was', current.level + ')');
    console.log('  modulesCompleted: 0 (was', current.modulesCompleted + ')');
    console.log('  labsCompleted: 0 (was', current.labsCompleted + ')');
    console.log('  achievements:', JSON.stringify(cleanAch), '(was', currentAch.length, 'items)');
    console.log('  streak: 1 (was', current.streak + ')');
    console.log();

    if (DRY_RUN) {
        console.log('DRY RUN — no changes made. Run without --dry-run to apply.');
        return;
    }

    // 6. Apply the reset
    console.log('Applying reset...');

    // Update profile
    await db.collection('users').doc(uid).update({
        xp: xp,
        level: level,
        modulesCompleted: 0,
        labsCompleted: 0,
        achievements: cleanAch,
        streak: 1,
        gamesPlayed: uniqueGames.size,
        ctfBoxesPwned: flags.size > 0 ? 1 : 0,
        ctfFlagsCaptured: totalFlags,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('  Profile updated.');

    // Wipe sync blob so his inflated localStorage doesn't re-sync
    if (syncDoc.exists) {
        await syncRef.delete();
        console.log('  Sync blob deleted (will re-sync clean on next login).');
    }

    // 7. Log the reset event
    await db.collection('users').doc(uid).collection('gates').doc('_reset_log').set({
        action: 'integrity_reset',
        reason: 'Option 3: Recalculate from server-validated events only',
        previousXP: current.xp,
        previousLevel: current.level,
        previousModules: current.modulesCompleted,
        newXP: xp,
        newLevel: level,
        resetAt: admin.firestore.FieldValue.serverTimestamp(),
        resetBy: 'admin-script'
    });
    console.log('  Reset event logged.');

    console.log();
    console.log('DONE. Hackerman has been reset to server-validated state.');
    console.log('Next login will show XP:', xp, '| Level:', level);
    console.log('His localStorage will be overwritten by TripWire on any tampering attempt.');
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 3000));
