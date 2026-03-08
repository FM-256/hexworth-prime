#!/usr/bin/env node
/**
 * migrate-xp.js — One-time XP data cleanup
 *
 * Deduplicates modulesCompleted/labsCompleted arrays and recalculates XP
 * from cleaned Firestore data. XPCalculator becomes the sole XP authority;
 * this script brings stored XP in line with that reality.
 *
 * Usage:
 *   node migrate-xp.js                        # Dry run — all users
 *   node migrate-xp.js --apply                # Live run — all users
 *   node migrate-xp.js --user EQ6             # Dry run — single user (by callsign)
 *   node migrate-xp.js --user EQ6 --apply     # Live run — single user
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

const APPLY = process.argv.includes('--apply');
const userArgIdx = process.argv.indexOf('--user');
const TARGET_CALLSIGN = userArgIdx !== -1 ? process.argv[userArgIdx + 1] : null;

// ─── XP Rates (mirrors XPCalculator.XP_RATES) ──────────────────────
const XP_RATES = {
    PRESENTATION_VIEW: 100,
    TOOL_EXPLORE: 100,
    QUIZ_PASS: 100,
    QUIZ_PERFECT: 200,
    GATE_CLEARED: 500,
    LAB_COMPLETE: 500,
    DAILY_LOGIN: 25
};

function calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
}

/**
 * Classify a module ID by type using available Firestore data.
 * Priority: quizzes map (tier 1) > labsCompleted set (tier 1) > ID suffix heuristic (tier 4)
 */
function resolveType(id, quizIds, labIds) {
    if (quizIds.has(id)) return 'quiz';
    if (labIds.has(id)) return 'lab';
    const lower = id.toLowerCase();
    if (lower.endsWith('-quiz') || lower.includes('-quiz-')) return 'quiz';
    if (lower.endsWith('-lab') || lower.includes('-lab-')) return 'lab';
    if (lower.endsWith('-tool') || lower.endsWith('-applet')) return 'tool';
    return 'presentation';
}

/**
 * Recalculate XP from cleaned Firestore data.
 * Intentionally skips badge XP and game XP (localStorage-only).
 * Those will be filled in by client-side XPCalculator on next login.
 */
function deriveXP(profile) {
    const modules = profile.modulesCompleted || [];
    const labs = profile.labsCompleted || [];
    const quizzes = profile.quizzes || {};
    const achievements = profile.achievements || [];
    const streak = Math.min(profile.streak || 0, 365);

    const quizIds = new Set(Object.keys(quizzes));
    const labIds = new Set(labs);
    const seen = new Set();
    let xp = 0;
    const breakdown = { presentations: 0, labs: 0, quizzes: 0, tools: 0, gates: 0, streak: 0 };

    // Score each unique module
    for (const id of modules) {
        if (seen.has(id)) continue;
        seen.add(id);
        const type = resolveType(id, quizIds, labIds);
        switch (type) {
            case 'quiz': {
                const score = quizzes[id]?.score || 0;
                const award = score >= 90 ? XP_RATES.QUIZ_PERFECT : XP_RATES.QUIZ_PASS;
                xp += award;
                breakdown.quizzes++;
                break;
            }
            case 'lab':
                xp += XP_RATES.LAB_COMPLETE;
                breakdown.labs++;
                break;
            case 'tool':
                xp += XP_RATES.TOOL_EXPLORE;
                breakdown.tools++;
                break;
            default:
                xp += XP_RATES.PRESENTATION_VIEW;
                breakdown.presentations++;
        }
    }

    // Quizzes not in modulesCompleted (passed but not tracked as module)
    for (const [qid, qdata] of Object.entries(quizzes)) {
        if (seen.has(qid)) continue;
        seen.add(qid);
        const score = qdata.score || 0;
        if (score >= 90) {
            xp += XP_RATES.QUIZ_PERFECT;
            breakdown.quizzes++;
        } else if (score >= 70) {
            xp += XP_RATES.QUIZ_PASS;
            breakdown.quizzes++;
        }
    }

    // Labs not in modulesCompleted
    for (const labId of labs) {
        if (seen.has(labId)) continue;
        seen.add(labId);
        xp += XP_RATES.LAB_COMPLETE;
        breakdown.labs++;
    }

    // Gate XP: count gate_N and dark_arts_gateN in achievements
    const gatePattern = /^(gate_\d+|dark_arts_gate\d+)$/;
    let gateCount = 0;
    for (const ach of achievements) {
        const achId = typeof ach === 'string' ? ach : (ach?.id || '');
        if (gatePattern.test(achId)) {
            gateCount++;
        }
    }
    xp += gateCount * XP_RATES.GATE_CLEARED;
    breakdown.gates = gateCount;

    // Streak XP (25/day, capped at 365)
    xp += streak * XP_RATES.DAILY_LOGIN;
    breakdown.streak = streak;

    return { xp, breakdown, uniqueModules: seen.size };
}

async function migrate() {
    let snap;

    if (TARGET_CALLSIGN) {
        // Find user by callsign (case-insensitive)
        snap = await db.collection('users')
            .where('callsignLower', '==', TARGET_CALLSIGN.toLowerCase())
            .get();
        if (snap.empty) {
            // Fallback: try exact callsign match
            snap = await db.collection('users')
                .where('callsign', '==', TARGET_CALLSIGN)
                .get();
        }
        if (snap.empty) {
            console.error(`User "${TARGET_CALLSIGN}" not found.`);
            process.exit(1);
        }
    } else {
        snap = await db.collection('users').get();
    }

    const mode = APPLY ? 'LIVE' : 'DRY RUN';
    console.log('');
    console.log('================================================================');
    console.log(`  XP MIGRATION — ${mode}`);
    console.log(`  ${snap.size} user(s) to process`);
    console.log('================================================================');
    console.log('');

    const results = [];

    for (const doc of snap.docs) {
        const p = doc.data();
        const callsign = p.callsign || p.displayName || doc.id.slice(0, 8);

        // 1. Deduplicate arrays
        const origModules = Array.isArray(p.modulesCompleted) ? p.modulesCompleted : [];
        const origLabs = Array.isArray(p.labsCompleted) ? p.labsCompleted : [];

        const dedupModules = [...new Set(origModules)];
        const dedupLabs = [...new Set(origLabs)];

        const modulesDupes = origModules.length - dedupModules.length;
        const labsDupes = origLabs.length - dedupLabs.length;

        // 2. Recalculate XP from cleaned data
        const cleanProfile = { ...p, modulesCompleted: dedupModules, labsCompleted: dedupLabs };
        const { xp: derivedXP, breakdown, uniqueModules } = deriveXP(cleanProfile);
        const storedXP = p.xp || 0;
        const delta = storedXP - derivedXP;
        const newLevel = calculateLevel(derivedXP);

        results.push({
            uid: doc.id,
            callsign,
            storedXP,
            derivedXP,
            delta,
            storedLevel: p.level || 0,
            newLevel,
            modulesDupes,
            labsDupes,
            origModuleCount: origModules.length,
            dedupModuleCount: dedupModules.length,
            origLabCount: origLabs.length,
            dedupLabCount: dedupLabs.length,
            uniqueModules,
            breakdown,
            dedupModules,
            dedupLabs
        });
    }

    // Sort by delta descending
    results.sort((a, b) => b.delta - a.delta);

    // Print table
    console.log(`  ${'CALLSIGN'.padEnd(16)} ${'STORED'.padStart(8)} ${'DERIVED'.padStart(8)} ${'DELTA'.padStart(8)} ${'LVL'.padStart(6)} ${'MODS'.padStart(6)} ${'DUPES'.padStart(6)}`);
    console.log(`  ${'─'.repeat(16)} ${'─'.repeat(8)} ${'─'.repeat(8)} ${'─'.repeat(8)} ${'─'.repeat(6)} ${'─'.repeat(6)} ${'─'.repeat(6)}`);

    for (const r of results) {
        const flag = r.delta > 100 ? ' !!!' : r.delta < -100 ? ' (low)' : '';
        const lvl = `${r.storedLevel}>${r.newLevel}`;
        const dupes = r.modulesDupes + r.labsDupes;
        console.log(`  ${r.callsign.padEnd(16)} ${r.storedXP.toLocaleString().padStart(8)} ${r.derivedXP.toLocaleString().padStart(8)} ${(r.delta > 0 ? '+' : '') + r.delta.toLocaleString()
            .padStart(r.delta >= 0 ? 7 : 8)} ${lvl.padStart(6)} ${r.dedupModuleCount.toString().padStart(6)} ${dupes.toString().padStart(6)}${flag}`);
    }

    // Detailed breakdown per user
    console.log('');
    for (const r of results) {
        const b = r.breakdown;
        console.log(`  ${r.callsign}: ${b.presentations}p + ${b.labs}L + ${b.quizzes}Q + ${b.tools}T + ${b.gates}G + ${b.streak}d streak = ${r.derivedXP} XP`);
        if (r.modulesDupes > 0) console.log(`    modules: ${r.origModuleCount} → ${r.dedupModuleCount} (-${r.modulesDupes} dupes)`);
        if (r.labsDupes > 0) console.log(`    labs: ${r.origLabCount} → ${r.dedupLabCount} (-${r.labsDupes} dupes)`);
    }

    // Summary
    const totalDupes = results.reduce((s, r) => s + r.modulesDupes + r.labsDupes, 0);
    const inflated = results.filter(r => r.delta > 100).length;
    const deflated = results.filter(r => r.delta < -100).length;

    console.log('');
    console.log('─── Summary ───');
    console.log(`  Users:     ${results.length}`);
    console.log(`  Inflated:  ${inflated}`);
    console.log(`  Deflated:  ${deflated}`);
    console.log(`  Dupes:     ${totalDupes} total (${results.filter(r => r.modulesDupes + r.labsDupes > 0).length} users)`);

    // Apply changes
    if (APPLY) {
        console.log('');
        console.log('─── Applying changes ───');
        for (let i = 0; i < results.length; i += 400) {
            const chunk = results.slice(i, i + 400);
            const batch = db.batch();
            let batchOps = 0;

            for (const r of chunk) {
                const updates = {};
                let changed = false;

                // Deduplicated arrays
                if (r.modulesDupes > 0) {
                    updates.modulesCompleted = r.dedupModules;
                    changed = true;
                }
                if (r.labsDupes > 0) {
                    updates.labsCompleted = r.dedupLabs;
                    changed = true;
                }

                // XP and level
                if (Math.abs(r.delta) > 0) {
                    updates.xp = r.derivedXP;
                    updates.level = r.newLevel;
                    changed = true;
                }

                if (changed) {
                    updates.updatedAt = new Date();
                    updates.xpMigratedAt = new Date().toISOString();
                    batch.update(db.doc(`users/${r.uid}`), updates);
                    batchOps++;
                    const dir = r.delta > 0 ? 'v' : r.delta < 0 ? '^' : '=';
                    console.log(`  ${dir} ${r.callsign}: ${r.storedXP} -> ${r.derivedXP} XP, Level ${r.storedLevel} -> ${r.newLevel}${r.modulesDupes > 0 ? `, -${r.modulesDupes} mod dupes` : ''}${r.labsDupes > 0 ? `, -${r.labsDupes} lab dupes` : ''}`);
                }
            }

            if (batchOps > 0) {
                await batch.commit();
                console.log(`  Batch committed: ${batchOps} users`);
            }
        }

        const changed = results.filter(r => Math.abs(r.delta) > 0 || r.modulesDupes > 0 || r.labsDupes > 0).length;
        console.log(`\n  Done. ${changed} user(s) updated.`);
    } else {
        const wouldChange = results.filter(r => Math.abs(r.delta) > 0 || r.modulesDupes > 0 || r.labsDupes > 0).length;
        console.log(`\n  ${wouldChange} user(s) would be updated. Run with --apply to commit.`);
    }
}

migrate().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
