const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const profile = await db.collection('users').doc(UID).get();
    const p = profile.data();

    console.log('=== ALL MODULE IDs (sorted) ===');
    const all = (p.modulesCompleted || []).sort();
    all.forEach(m => console.log(' ', m));

    console.log('\n=== CHECK PROFILE FOR ANY PFI/PYTHON SHAPED IDs ===');
    const allKeys = Object.keys(p);
    console.log('Profile top-level keys:', allKeys);
    // any field name containing 'pfi' or 'python'?
    for (const k of allKeys) {
        if (k.toLowerCase().includes('pfi') || k.toLowerCase().includes('python')) {
            console.log('  match:', k, '=', JSON.stringify(p[k]).substring(0, 200));
        }
    }

    // Look at sync blob actual contents — for any pfi-shaped keys
    const sync = await db.collection('users').doc(UID).collection('sync').doc('localStorage').get();
    if (sync.exists) {
        const d = sync.data();
        console.log('\n=== SYNC BLOB STORAGE KEYS ===');
        const keys = Object.keys(d.data || {});
        console.log('Total keys:', keys.length);
        // Filter for anything PFI/python/code-pfi shaped
        const interesting = keys.filter(k => {
            const lk = k.toLowerCase();
            return lk.includes('pfi') || lk.includes('python') || lk.includes('progress') || lk.includes('code') || lk.includes('mission') || lk.includes('operator');
        });
        console.log('Interesting keys:');
        for (const k of interesting) {
            const val = d.data[k];
            const len = typeof val === 'string' ? val.length : 0;
            console.log(`  ${k}: ${typeof val} (${len} chars)`);
        }
        // Show full hexworth_progress blob structure
        if (d.data.hexworth_progress) {
            const hp = JSON.parse(d.data.hexworth_progress);
            console.log('\n=== FULL hexworth_progress STRUCTURE ===');
            console.log('houses keys:', Object.keys(hp.houses || {}));
            for (const h of Object.keys(hp.houses || {})) {
                const hd = hp.houses[h];
                if (Array.isArray(hd.modulesCompleted) && hd.modulesCompleted.length > 0) {
                    console.log(`houses.${h}.modulesCompleted (${hd.modulesCompleted.length}):`);
                    hd.modulesCompleted.forEach(m => console.log('   -', m));
                }
            }
            // Show flat-level progress[house][moduleId] keys
            for (const h of Object.keys(hp)) {
                if (typeof hp[h] === 'object' && !Array.isArray(hp[h]) && hp[h] !== null && !['houses', 'completionCounts', 'currentPath', 'divergentBranches'].includes(h) && Object.keys(hp[h]).length < 50) {
                    const keys = Object.keys(hp[h]);
                    if (keys.length > 0 && typeof hp[h][keys[0]] === 'object') {
                        console.log(`flat[${h}] (${keys.length} keys):`, keys.slice(0, 10));
                    }
                }
            }
        }
    }

    // Check if there's a separate operator/PFI progress doc
    const opProgress = await db.collection('operator_progress').where('uid', '==', UID).get().catch(() => ({size: 0, empty: true}));
    console.log('\noperator_progress collection size for India:', opProgress.size);

    // Check pfi grader submissions
    const pfiSub = await db.collection('pfi_grader_submissions').where('uid', '==', UID).get().catch(() => ({size: 0, empty: true}));
    console.log('pfi_grader_submissions size:', pfiSub.size);
    pfiSub.forEach(d => console.log(' ', d.id, JSON.stringify(d.data()).substring(0, 200)));

    // List all top-level collections
    console.log('\n=== TOP-LEVEL COLLECTIONS ===');
    const allCols = await db.listCollections();
    for (const c of allCols) {
        console.log(' ', c.id);
    }
})();
