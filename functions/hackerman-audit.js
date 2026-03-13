const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const uid = '51ps4GhN2Td9UEswkgXri194t9i1';

async function main() {
    // Get profile
    const profile = await db.collection('users').doc(uid).get();
    const d = profile.data();
    console.log('=== PROFILE SUMMARY ===');
    console.log('Callsign:', d.callsign);
    console.log('House:', d.house);
    console.log('XP:', d.xp, '| Level:', d.level);
    console.log('modulesCompleted:', (d.modulesCompleted || []).length);
    console.log('labsCompleted:', (d.labsCompleted || []).length);
    console.log('achievements:', JSON.stringify(d.achievements));
    console.log('streak:', d.streak);
    console.log('gamesPlayed:', d.gamesPlayed);
    console.log('ctfBoxesPwned:', d.ctfBoxesPwned);
    console.log('ctfFlagsCaptured:', d.ctfFlagsCaptured);

    // Get server-validated gate completions
    const gates = await db.collection('users').doc(uid).collection('gates').get();
    console.log('\n=== SERVER-VALIDATED: Gates (' + gates.size + ') ===');
    gates.docs.forEach(g => console.log('  ', g.id, JSON.stringify(g.data())));

    // Get server-validated flag captures
    const flags = await db.collection('users').doc(uid).collection('flag_captures').get();
    console.log('\n=== SERVER-VALIDATED: Flags (' + flags.size + ') ===');
    flags.docs.forEach(f => console.log('  ', f.id, JSON.stringify(f.data())));

    // Get score submissions
    const scores = await db.collection('users').doc(uid).collection('score_submissions').get();
    console.log('\n=== SERVER-VALIDATED: Scores (' + scores.size + ') ===');
    scores.docs.forEach(s => console.log('  ', s.id, JSON.stringify(s.data())));

    // Check sync blob for what he's claiming
    const sync = await db.collection('users').doc(uid).collection('sync').doc('localStorage').get();
    if (sync.exists) {
        const s = sync.data();
        console.log('\n=== SYNC BLOB ===');
        console.log('Synced at:', s.syncedAt ? s.syncedAt.toDate() : 'n/a');
        console.log('Key count:', s.keyCount);
        const data = s.data || {};
        if (data.hexworth_progress) {
            try {
                const progress = JSON.parse(data.hexworth_progress);
                console.log('Claimed XP:', progress.xp);
                console.log('Claimed Level:', progress.level);
                console.log('Claimed completedModules:', (progress.completedModules || []).length);
            } catch(e) { console.log('Parse error'); }
        }
    }
}
main().catch(console.error).finally(() => setTimeout(() => process.exit(0), 3000));
