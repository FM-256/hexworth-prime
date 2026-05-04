const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const profile = await db.collection('users').doc(UID).get();
    const p = profile.data();
    console.log('=== USER PROFILE ===');
    console.log('Email:', p.email);
    console.log('Callsign:', p.callsign);
    console.log('House:', p.house);
    console.log('XP:', p.xp);
    console.log('Modules count:', (p.modulesCompleted || []).length);
    console.log('Labs count:', (p.labsCompleted || []).length);
    console.log('Quizzes count:', Object.keys(p.quizzes || {}).length);
    console.log('Achievements:', (p.achievements || []).length);

    const allMods = p.modulesCompleted || [];
    const pfiMods = allMods.filter(m => m.toLowerCase().includes('pfi') || m.startsWith('pfi-') || m.startsWith('pyit-'));
    console.log('\n=== PFI MODULES ===');
    console.log('Total modules:', allMods.length);
    console.log('PFI-tagged:', pfiMods.length);
    if (pfiMods.length) console.log('Sample:', pfiMods.slice(0, 15));

    const pfiQuizzes = Object.entries(p.quizzes || {}).filter(([k]) => k.toLowerCase().includes('pfi') || k.startsWith('pyit-'));
    console.log('PFI quizzes:', pfiQuizzes.length);
    if (pfiQuizzes.length) console.log('  ', pfiQuizzes.slice(0, 10));

    const sync = await db.collection('users').doc(UID).collection('sync').doc('localStorage').get();
    console.log('\n=== SYNC BLOB ===');
    console.log('Exists:', sync.exists);
    if (sync.exists) {
        const d = sync.data();
        console.log('Key count:', d.keyCount);
        if (d.data && d.data.hexworth_progress) {
            const hp = JSON.parse(d.data.hexworth_progress);
            console.log('Sync blob progress top-level keys:', Object.keys(hp));
            if (hp.completedModules) console.log('  completedModules in blob:', hp.completedModules.length);
            if (hp.code) console.log('  flat[code] modules:', Object.keys(hp.code).length, '— sample:', Object.keys(hp.code).slice(0, 5));
            if (hp.web) console.log('  flat[web] modules:', Object.keys(hp.web).length);
            if (hp.houses) {
                for (const h of Object.keys(hp.houses)) {
                    const m = (hp.houses[h].modulesCompleted || []).length;
                    console.log(`  houses.${h} modulesCompleted:`, m);
                }
            }
        }
    }

    if (allMods.length) {
        const prefixes = {};
        for (const m of allMods) {
            const pre = m.split('-')[0] || '?';
            prefixes[pre] = (prefixes[pre] || 0) + 1;
        }
        console.log('\n=== ALL MODULE PREFIX COUNTS ===');
        console.log(prefixes);
    }
})();
