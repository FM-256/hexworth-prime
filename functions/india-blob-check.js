const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const sync = (await db.collection('users').doc(UID).collection('sync').doc('localStorage').get()).data();
    const data = sync.data;
    console.log('Sync syncedAt:', sync.syncedAt?.toDate?.());
    console.log('Total keys in blob:', Object.keys(data).length);
    
    // hexworth_progress
    const hp = JSON.parse(data.hexworth_progress);
    console.log('\nhexworth_progress.houses.code.modulesCompleted:', hp.houses?.code?.modulesCompleted?.length);
    console.log('hexworth_progress.completedModules length:', hp.completedModules?.length);
    console.log('hexworth_progress.code{} keys:', Object.keys(hp.code || {}).length);
    
    // completion stamps for comparison
    const stamps = JSON.parse(data.hexworth_completion_stamps || '{}');
    const pfiStamps = Object.keys(stamps).filter(k => k.includes('pfi'));
    console.log('completion_stamps PFI:', pfiStamps.length);
    
    // What's the last write time on the blob? If it's NEWER than my round 2 (14:20-ish), 
    // she may have written over my changes
    
    // Profile
    const p = (await db.collection('users').doc(UID).get()).data();
    console.log('\nProfile.modulesCompleted total:', (p.modulesCompleted || []).length);
    console.log('Profile PFI:', (p.modulesCompleted || []).filter(m => m.startsWith('pfi-')).length);
    console.log('Profile updatedAt:', p.updatedAt?.toDate?.());
})();
