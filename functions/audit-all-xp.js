#!/usr/bin/env node
/**
 * XP Audit — ALL USERS
 * Scans every user in Firestore and compares stored XP to derived XP.
 *
 * Usage:
 *   node audit-all-xp.js           # Report only
 *   node audit-all-xp.js --fix     # Fix inflated XP (reset to derived)
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

const FIX_MODE = process.argv.includes('--fix');

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
    return 'presentation';
}

function deriveXP(p) {
    const modules = Array.isArray(p.modulesCompleted) ? p.modulesCompleted : [];
    const labs = Array.isArray(p.labsCompleted) ? p.labsCompleted : [];
    const quizzes = p.quizzes || {};
    const achievements = Array.isArray(p.achievements) ? p.achievements : [];
    const streak = Math.min(p.streak || 0, 365);

    const quizIds = new Set(Object.keys(quizzes));
    const labIds = new Set(labs);
    const seen = new Set();
    let xp = 0;

    for (const id of modules) {
        if (seen.has(id)) continue;
        seen.add(id);
        const type = resolveType(id, quizIds, labIds);
        switch (type) {
            case 'quiz': {
                const score = quizzes[id]?.score || 0;
                xp += score >= 90 ? XP_RATES.QUIZ_PERFECT : XP_RATES.QUIZ_PASS;
                break;
            }
            case 'lab': xp += XP_RATES.LAB_COMPLETE; break;
            case 'tool': xp += XP_RATES.TOOL_EXPLORE; break;
            default: xp += XP_RATES.PRESENTATION_VIEW;
        }
    }

    for (const [qid, qdata] of Object.entries(quizzes)) {
        if (seen.has(qid)) continue;
        seen.add(qid);
        const score = qdata.score || 0;
        if (score >= 90) xp += XP_RATES.QUIZ_PERFECT;
        else if (score >= 70) xp += XP_RATES.QUIZ_PASS;
    }

    for (const labId of labs) {
        if (seen.has(labId)) continue;
        seen.add(labId);
        xp += XP_RATES.LAB_COMPLETE;
    }

    xp += achievements.length * 50;
    xp += streak * XP_RATES.DAILY_LOGIN;

    return xp;
}

async function auditAll() {
    const snap = await db.collection('users').get();

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`  XP AUDIT — ALL USERS  ${FIX_MODE ? '(FIX MODE)' : '(REPORT ONLY)'}`);
    console.log(`  ${snap.size} users found`);
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    const results = [];

    for (const doc of snap.docs) {
        const p = doc.data();
        const storedXP = p.xp || 0;
        const derivedXP = deriveXP(p);
        const delta = storedXP - derivedXP;
        const ratio = derivedXP > 0 ? (storedXP / derivedXP).toFixed(1) : (storedXP > 0 ? 'Inf' : '1.0');

        results.push({
            uid: doc.id,
            callsign: p.callsign || p.displayName || doc.id.slice(0, 8),
            storedXP,
            derivedXP,
            delta,
            ratio,
            storedLevel: p.level || 0,
            derivedLevel: calculateLevel(derivedXP),
            modules: Array.isArray(p.modulesCompleted) ? p.modulesCompleted.length : 0,
        });
    }

    // Sort by delta descending (most inflated first)
    results.sort((a, b) => b.delta - a.delta);

    // Table header
    console.log(`  ${'CALLSIGN'.padEnd(20)} ${'STORED'.padStart(10)} ${'DERIVED'.padStart(10)} ${'DELTA'.padStart(10)} ${'RATIO'.padStart(6)} ${'LVL→'.padStart(5)} ${'MODS'.padStart(5)}`);
    console.log(`  ${'─'.repeat(20)} ${'─'.repeat(10)} ${'─'.repeat(10)} ${'─'.repeat(10)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(5)}`);

    let inflatedCount = 0;
    let deflatedCount = 0;
    let matchCount = 0;
    const fixes = [];

    for (const r of results) {
        const flag = r.delta > 0 ? ' !!!' : r.delta < 0 ? ' (low)' : '';
        console.log(`  ${r.callsign.padEnd(20)} ${r.storedXP.toLocaleString().padStart(10)} ${r.derivedXP.toLocaleString().padStart(10)} ${r.delta.toLocaleString().padStart(10)} ${r.ratio.toString().padStart(5)}x ${`${r.storedLevel}→${r.derivedLevel}`.padStart(5)} ${r.modules.toString().padStart(5)}${flag}`);

        if (r.delta > 100) {
            inflatedCount++;
            fixes.push(r);
        } else if (r.delta < -100) {
            deflatedCount++;
        } else {
            matchCount++;
        }
    }

    console.log('');
    console.log('─── Summary ───');
    console.log(`  Inflated (stored > derived + 100): ${inflatedCount}`);
    console.log(`  Deflated (stored < derived - 100): ${deflatedCount}`);
    console.log(`  Match (within ±100):               ${matchCount}`);
    console.log(`  Total users:                       ${results.length}`);

    // Collect all accounts that are off by > 100
    const allFixes = results.filter(r => Math.abs(r.delta) > 100);

    if (FIX_MODE && allFixes.length > 0) {
        console.log(`\n─── Fixing ${allFixes.length} accounts (${inflatedCount} inflated, ${deflatedCount} deflated) ───`);
        // Firestore batches max 500 ops
        for (let i = 0; i < allFixes.length; i += 400) {
            const chunk = allFixes.slice(i, i + 400);
            const batch = db.batch();
            for (const r of chunk) {
                const newLevel = calculateLevel(r.derivedXP);
                const dir = r.delta > 0 ? '↓' : '↑';
                console.log(`  ${dir} ${r.callsign}: ${r.storedXP.toLocaleString()} → ${r.derivedXP.toLocaleString()} XP (Level ${r.storedLevel} → ${newLevel})`);
                batch.update(db.doc(`users/${r.uid}`), {
                    xp: r.derivedXP,
                    level: newLevel,
                    updatedAt: new Date()
                });
            }
            await batch.commit();
        }
        console.log(`\n  ✓ ${allFixes.length} accounts corrected.`);
    } else if (FIX_MODE && allFixes.length === 0) {
        console.log('\n  All accounts within tolerance.');
    } else if (allFixes.length > 0) {
        console.log(`\n  Run with --fix to correct ${allFixes.length} accounts.`);
    }
}

auditAll().then(() => process.exit(0)).catch(err => {
    console.error('Audit failed:', err.message);
    process.exit(1);
});
