const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    // 1. Profile
    const profile = (await db.collection('users').doc(UID).get()).data();
    const allMods = profile.modulesCompleted || [];
    const pfiInProfile = allMods.filter(m => m.startsWith('pfi-'));
    console.log('=== PROFILE ===');
    console.log('Total modulesCompleted:', allMods.length);
    console.log('PFI modules in profile:', pfiInProfile.length);
    pfiInProfile.forEach(m => console.log('  -', m));

    // 2. Sync blob
    const sync = (await db.collection('users').doc(UID).collection('sync').doc('localStorage').get()).data();
    const hp = JSON.parse(sync.data.hexworth_progress);
    console.log('\n=== SYNC BLOB hexworth_progress ===');
    console.log('houses.code.modulesCompleted:', (hp.houses?.code?.modulesCompleted || []).length, hp.houses?.code?.modulesCompleted);
    console.log('completedModules (top-level):', (hp.completedModules || []).length);
    console.log('flat code[] keys:', Object.keys(hp.code || {}));
    console.log('Sync syncedAt:', sync.syncedAt?.toDate?.());

    // 3. Class progress
    const cp = (await db.collection('tenants').doc('python-april-2026').collection('classes').doc('FRXlV8zW95eQ3CL6eWdc').collection('progress').doc(UID).get()).data();
    console.log('\n=== CLASS PROGRESS (python-april-2026 / Python For IT) ===');
    const completions = cp.completions || {};
    console.log('Total completion keys:', Object.keys(completions).length);
    Object.entries(completions).forEach(([k, v]) => {
        console.log(`  - ${k}: completed=${v.completed}, completedAt=${v.completedAt}`);
    });
    console.log('updatedAt:', cp.updatedAt?.toDate?.());
})();
