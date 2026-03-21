/**
 * XP Audit — Full User Integrity Scan
 *
 * Reads every user profile from Firestore, checks:
 *   1. Module ID validity (same _isValidId logic as XPCalculator)
 *   2. XP vs server-validated events (flags, gates, scores)
 *   3. Suspicious XP levels (>10K with 0 server-validated events)
 *   4. Garbage count that would trigger Roxy (threshold > 5)
 *
 * Output: summary table + flagged users
 *
 * Usage: GOOGLE_CLOUD_PROJECT=hexworth-prime node xp-audit.js
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const KNOWN_HOUSES = ['web','shield','forge','script','cloud','code','key','eye','ai','linux','arena'];

function isValidId(id) {
    if (!id || typeof id !== 'string') return false;
    if (id.startsWith('dark-arts-') && id.length > 10) return true;
    const dash = id.indexOf('-');
    if (dash < 1) return false;
    const house = id.slice(0, dash);
    const key = id.slice(dash + 1);
    if (!key || !KNOWN_HOUSES.includes(house)) return false;
    if (key.startsWith(house + '-')) return false;
    if (KNOWN_HOUSES.includes(key)) return false;
    return true;
}

async function main() {
    console.log('=== XP AUDIT — ALL USERS ===');
    console.log('Date:', new Date().toISOString());
    console.log();

    const users = await db.collection('users').get();
    console.log('Total users:', users.size);
    console.log();

    const flagged = [];
    const clean = [];
    const summary = {
        total: users.size,
        clean: 0,
        flagged: 0,
        wouldTriggerRoxy: 0,
        suspiciousXP: 0,
        totalGarbage: 0
    };

    for (const doc of users.docs) {
        const uid = doc.id;
        const d = doc.data();
        const callsign = d.callsign || d.displayName || uid.substring(0, 8);
        const xp = d.xp || 0;
        const level = d.level || 0;

        // Count garbage module IDs
        const modules = Array.isArray(d.modulesCompleted) ? d.modulesCompleted : [];
        const garbage = modules.filter(id => !isValidId(id));
        const garbageCount = garbage.length;

        // Check house_completions (from sync blob if available)
        let badHouseKeys = 0;
        // We can't check localStorage from server, but Firestore profile
        // may have house_completions synced

        // Get server-validated events
        const [gates, flags, scores] = await Promise.all([
            db.collection('users').doc(uid).collection('gates').get(),
            db.collection('users').doc(uid).collection('flag_captures').get(),
            db.collection('users').doc(uid).collection('score_submissions').get()
        ]);

        // Filter out _reset_log from gate count
        const realGates = gates.docs.filter(g => !g.id.startsWith('_'));

        const serverEvents = realGates.size + flags.size + scores.size;

        // Suspicious: high XP with no server-validated events
        const suspicious = xp > 10000 && serverEvents === 0;

        // Would trigger Roxy (garbage > 5)
        const wouldTrigger = garbageCount > 5;

        const record = {
            uid,
            callsign,
            xp,
            level,
            modulesCount: modules.length,
            garbageCount,
            garbageSamples: garbage.slice(0, 5),
            serverGates: realGates.size,
            serverFlags: flags.size,
            serverScores: scores.size,
            suspicious,
            wouldTriggerRoxy: wouldTrigger
        };

        if (garbageCount > 0 || suspicious) {
            flagged.push(record);
            summary.flagged++;
            summary.totalGarbage += garbageCount;
            if (wouldTrigger) summary.wouldTriggerRoxy++;
            if (suspicious) summary.suspiciousXP++;
        } else {
            clean.push(record);
            summary.clean++;
        }
    }

    // Print clean users summary
    console.log('=== CLEAN USERS (' + summary.clean + ') ===');
    clean.sort((a, b) => b.xp - a.xp);
    clean.forEach(u => {
        console.log('  ' + u.callsign.padEnd(25) +
            'XP: ' + String(u.xp).padStart(7) +
            '  L' + String(u.level).padStart(3) +
            '  Modules: ' + String(u.modulesCount).padStart(4) +
            '  Gates: ' + u.serverGates +
            '  Flags: ' + u.serverFlags +
            '  Scores: ' + u.serverScores);
    });

    // Print flagged users
    if (flagged.length > 0) {
        console.log();
        console.log('=== FLAGGED USERS (' + summary.flagged + ') ===');
        flagged.sort((a, b) => b.garbageCount - a.garbageCount);
        flagged.forEach(u => {
            const tags = [];
            if (u.wouldTriggerRoxy) tags.push('ROXY-TRIGGER');
            if (u.suspicious) tags.push('SUSPICIOUS-XP');
            console.log('  [' + tags.join(', ') + '] ' + u.callsign);
            console.log('    UID: ' + u.uid);
            console.log('    XP: ' + u.xp + ' | Level: ' + u.level + ' | Modules: ' + u.modulesCount);
            console.log('    Garbage IDs: ' + u.garbageCount);
            if (u.garbageSamples.length > 0) {
                console.log('    Samples: ' + u.garbageSamples.join(', '));
            }
            console.log('    Server-validated: Gates=' + u.serverGates + ' Flags=' + u.serverFlags + ' Scores=' + u.serverScores);
            console.log();
        });
    }

    // Summary
    console.log('=== SUMMARY ===');
    console.log('Total users:          ' + summary.total);
    console.log('Clean:                ' + summary.clean);
    console.log('Flagged:              ' + summary.flagged);
    console.log('Would trigger Roxy:   ' + summary.wouldTriggerRoxy);
    console.log('Suspicious XP:        ' + summary.suspiciousXP);
    console.log('Total garbage IDs:    ' + summary.totalGarbage);
}

main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 10000));
