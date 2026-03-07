#!/usr/bin/env node
/**
 * XP Audit Script — pulls Firestore profile for a user and calculates
 * what XPCalculator would derive from the same data.
 *
 * Usage: node audit-xp.js [callsign|uid]
 * Default: looks up callsign "EQ6"
 */
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Init with default credentials (uses GOOGLE_APPLICATION_CREDENTIALS or gcloud auth)
initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

// XP rates (must match XPCalculator.js after fix)
const XP_RATES = {
    PRESENTATION_VIEW: 100,
    TOOL_EXPLORE: 100,
    QUIZ_PASS: 100,
    QUIZ_PERFECT: 200,
    GATE_CLEARED: 500,
    LAB_COMPLETE: 500,
    GAME_PLAYED: 100,
    MODULE_COMPLETE: 1000,
    COURSE_COMPLETE: 10000,
    DAILY_LOGIN: 25
};

function calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
}

function resolveType(id, quizIds, labIds) {
    if (quizIds.has(id)) return 'quiz';
    if (labIds.has(id)) return 'lab';

    const lower = id.toLowerCase();
    if (lower.endsWith('-quiz') || lower.includes('-quiz-')) return 'quiz';
    if (lower.endsWith('-lab') || lower.includes('-lab-')) return 'lab';
    if (lower.endsWith('-tool') || lower.endsWith('-applet')) return 'tool';
    if (lower.endsWith('-presentation') || lower.endsWith('-pres')) return 'presentation';

    return 'presentation'; // default
}

async function audit(target) {
    // Find user
    let userDoc;
    if (target.length > 20) {
        // Looks like a UID
        userDoc = await db.doc(`users/${target}`).get();
    } else {
        // Look up by callsign
        const snap = await db.collection('users')
            .where('callsignLower', '==', target.toLowerCase())
            .limit(1)
            .get();
        if (snap.empty) {
            console.error(`No user found with callsign "${target}"`);
            process.exit(1);
        }
        userDoc = snap.docs[0];
    }

    if (!userDoc.exists) {
        console.error('User document not found');
        process.exit(1);
    }

    const p = userDoc.data();
    const uid = userDoc.id;

    console.log('═══════════════════════════════════════════════');
    console.log(`  XP AUDIT: ${p.callsign || p.displayName || uid}`);
    console.log('═══════════════════════════════════════════════');
    console.log(`  UID: ${uid}`);
    console.log(`  House: ${p.house || 'none'}`);
    console.log(`  Current Firestore XP: ${p.xp || 0}`);
    console.log(`  Current Firestore Level: ${p.level || 0}`);
    console.log('');

    // Raw counts from Firestore
    const modules = Array.isArray(p.modulesCompleted) ? p.modulesCompleted : [];
    const labs = Array.isArray(p.labsCompleted) ? p.labsCompleted : [];
    const quizzes = p.quizzes || {};
    const achievements = Array.isArray(p.achievements) ? p.achievements : [];
    const streak = p.streak || 0;

    console.log('─── Raw Firestore Data ───');
    console.log(`  modulesCompleted[]: ${modules.length} items`);
    console.log(`  labsCompleted[]:    ${labs.length} items`);
    console.log(`  quizzes{}:          ${Object.keys(quizzes).length} items`);
    console.log(`  achievements[]:     ${achievements.length} items`);
    console.log(`  streak:             ${streak} days`);
    console.log('');

    // Build lookup sets
    const quizIds = new Set(Object.keys(quizzes));
    const labIds = new Set(labs);

    // Classify each module
    const breakdown = {
        presentations: { count: 0, xp: 0, items: [] },
        tools: { count: 0, xp: 0, items: [] },
        quizzes: { count: 0, xp: 0, items: [] },
        quizPerfect: { count: 0, xp: 0, items: [] },
        labs: { count: 0, xp: 0, items: [] },
        badges: { count: 0, xp: 0 },
        streak: { count: streak, xp: 0 },
        unclassified: []
    };

    const seen = new Set();

    // 1. Classify completedModules
    for (const id of modules) {
        if (seen.has(id)) continue;
        seen.add(id);

        const type = resolveType(id, quizIds, labIds);

        switch (type) {
            case 'quiz': {
                const score = quizzes[id]?.score || 0;
                if (score >= 90) {
                    breakdown.quizPerfect.count++;
                    breakdown.quizPerfect.xp += XP_RATES.QUIZ_PERFECT;
                    breakdown.quizPerfect.items.push(`${id} (${score}%)`);
                } else {
                    breakdown.quizzes.count++;
                    breakdown.quizzes.xp += XP_RATES.QUIZ_PASS;
                    breakdown.quizzes.items.push(`${id} (${score}%)`);
                }
                break;
            }
            case 'lab':
                breakdown.labs.count++;
                breakdown.labs.xp += XP_RATES.LAB_COMPLETE;
                breakdown.labs.items.push(id);
                break;
            case 'tool':
                breakdown.tools.count++;
                breakdown.tools.xp += XP_RATES.TOOL_EXPLORE;
                breakdown.tools.items.push(id);
                break;
            default:
                breakdown.presentations.count++;
                breakdown.presentations.xp += XP_RATES.PRESENTATION_VIEW;
                breakdown.presentations.items.push(id);
        }
    }

    // 2. Quizzes in quizzes{} but NOT in modulesCompleted
    for (const [qid, qdata] of Object.entries(quizzes)) {
        if (seen.has(qid)) continue;
        seen.add(qid);
        const score = qdata.score || 0;
        if (score >= 90) {
            breakdown.quizPerfect.count++;
            breakdown.quizPerfect.xp += XP_RATES.QUIZ_PERFECT;
            breakdown.quizPerfect.items.push(`${qid} (${score}%) [quiz-only]`);
        } else if (score >= 70) {
            breakdown.quizzes.count++;
            breakdown.quizzes.xp += XP_RATES.QUIZ_PASS;
            breakdown.quizzes.items.push(`${qid} (${score}%) [quiz-only]`);
        }
    }

    // 3. Labs in labsCompleted but NOT in modulesCompleted
    for (const labId of labs) {
        if (seen.has(labId)) continue;
        seen.add(labId);
        breakdown.labs.count++;
        breakdown.labs.xp += XP_RATES.LAB_COMPLETE;
        breakdown.labs.items.push(`${labId} [lab-only]`);
    }

    // 4. Badges — estimate 50 avg per badge (server-side we don't have AchievementSystem point values)
    breakdown.badges.count = achievements.length;
    breakdown.badges.xp = achievements.length * 50; // conservative estimate

    // 5. Streak
    const cappedStreak = Math.min(streak, 365);
    breakdown.streak.count = cappedStreak;
    breakdown.streak.xp = cappedStreak * XP_RATES.DAILY_LOGIN;

    // Sum
    const derivedXP = breakdown.presentations.xp
        + breakdown.tools.xp
        + breakdown.quizzes.xp
        + breakdown.quizPerfect.xp
        + breakdown.labs.xp
        + breakdown.badges.xp
        + breakdown.streak.xp;

    const derivedLevel = calculateLevel(derivedXP);

    console.log('─── XP Breakdown (Derived from Firestore data) ───');
    console.log(`  Presentations:  ${breakdown.presentations.count.toString().padStart(4)} x ${XP_RATES.PRESENTATION_VIEW} = ${breakdown.presentations.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  Tools/Applets:  ${breakdown.tools.count.toString().padStart(4)} x ${XP_RATES.TOOL_EXPLORE} = ${breakdown.tools.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  Quizzes (pass): ${breakdown.quizzes.count.toString().padStart(4)} x ${XP_RATES.QUIZ_PASS} = ${breakdown.quizzes.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  Quizzes (perf): ${breakdown.quizPerfect.count.toString().padStart(4)} x ${XP_RATES.QUIZ_PERFECT} = ${breakdown.quizPerfect.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  Labs:           ${breakdown.labs.count.toString().padStart(4)} x ${XP_RATES.LAB_COMPLETE} = ${breakdown.labs.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  Badges:         ${breakdown.badges.count.toString().padStart(4)} x ~50  = ${breakdown.badges.xp.toLocaleString().padStart(8)} XP (estimate)`);
    console.log(`  Streak:         ${breakdown.streak.count.toString().padStart(4)} x ${XP_RATES.DAILY_LOGIN}  = ${breakdown.streak.xp.toLocaleString().padStart(8)} XP`);
    console.log(`  ${'─'.repeat(50)}`);
    console.log(`  DERIVED TOTAL:                    ${derivedXP.toLocaleString().padStart(8)} XP  (Level ${derivedLevel})`);
    console.log(`  FIRESTORE SHOWS:                  ${(p.xp || 0).toLocaleString().padStart(8)} XP  (Level ${p.level || 0})`);
    console.log(`  DELTA:                            ${(derivedXP - (p.xp || 0)).toLocaleString().padStart(8)} XP`);
    console.log('');

    if (derivedXP > (p.xp || 0)) {
        console.log('  >> XP is DEFLATED. Firestore has less than it should.');
        console.log('  >> Next dashboard load with the fix will correct this.');
    } else if (derivedXP < (p.xp || 0)) {
        console.log('  >> Firestore XP is HIGHER than derived. Likely from CF increments');
        console.log('  >> that accumulated before the XPCalculator took over. Math.max will preserve it.');
    } else {
        console.log('  >> XP matches perfectly.');
    }

    // Detail dumps
    if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
        console.log('');
        console.log('─── Detailed Item Lists ───');
        console.log(`\nPresentations (${breakdown.presentations.count}):`);
        breakdown.presentations.items.forEach(i => console.log(`  - ${i}`));
        console.log(`\nTools (${breakdown.tools.count}):`);
        breakdown.tools.items.forEach(i => console.log(`  - ${i}`));
        console.log(`\nQuizzes Pass (${breakdown.quizzes.count}):`);
        breakdown.quizzes.items.forEach(i => console.log(`  - ${i}`));
        console.log(`\nQuizzes Perfect (${breakdown.quizPerfect.count}):`);
        breakdown.quizPerfect.items.forEach(i => console.log(`  - ${i}`));
        console.log(`\nLabs (${breakdown.labs.count}):`);
        breakdown.labs.items.forEach(i => console.log(`  - ${i}`));
        console.log(`\nAchievements (${achievements.length}):`);
        achievements.forEach(a => console.log(`  - ${a}`));
    } else {
        console.log('\n  (Run with -v for full item lists)');
    }
}

const target = process.argv[2] || 'EQ6';
audit(target).then(() => process.exit(0)).catch(err => {
    console.error('Audit failed:', err.message);
    process.exit(1);
});
