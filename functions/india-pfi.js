const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    // pfi_submissions — try uid then userId
    for (const f of ['uid', 'userId', 'studentUid']) {
        const r = await db.collection('pfi_submissions').where(f, '==', UID).get().catch(() => ({size: 0, empty: true, docs: []}));
        console.log(`pfi_submissions where ${f} == UID:`, r.size);
        r.forEach(d => {
            const data = d.data();
            console.log('  doc:', d.id, 'keys:', Object.keys(data));
            console.log('  ', JSON.stringify(data, null, 2).substring(0, 500));
        });
        if (r.size > 0) break;
    }

    // sync blob full dump for pysandbox + pfi keys
    const sync = await db.collection('users').doc(UID).collection('sync').doc('localStorage').get();
    if (sync.exists) {
        const d = sync.data();
        const keys = Object.keys(d.data || {});
        console.log('\n=== ALL PFI/SANDBOX/CODE-RELATED localStorage keys in sync blob ===');
        const pfiKeys = keys.filter(k => {
            const lk = k.toLowerCase();
            return lk.includes('pfi') || lk.includes('sandbox') || lk.includes('code-pfi') || lk.includes('python');
        });
        for (const k of pfiKeys) {
            const v = d.data[k];
            console.log(`  ${k} = ${typeof v === 'string' ? (v.length > 60 ? v.substring(0,60)+'...' : v) : v}`);
        }

        // Also show ALL keys that are ModuleProgress-shaped (start with hexworth_)
        console.log('\n=== ALL hexworth_* localStorage keys ===');
        for (const k of keys.filter(k => k.startsWith('hexworth_')).sort()) {
            const v = d.data[k];
            const len = typeof v === 'string' ? v.length : 0;
            console.log(`  ${k} (${len} chars)`);
        }

        // Check pfi-setup-* keys
        console.log('\n=== pfi-setup-* keys ===');
        for (const k of keys.filter(k => k.startsWith('pfi-')).sort()) {
            console.log(`  ${k} = ${d.data[k]}`);
        }
    }

    // Also dump the flat[code] subtree (PFI lives in code house)
    if (sync.exists) {
        const d = sync.data();
        if (d.data.hexworth_progress) {
            const hp = JSON.parse(d.data.hexworth_progress);
            console.log('\n=== flat[code] subtree ===');
            console.log('Has hp.code:', !!hp.code);
            if (hp.code) console.log('  keys:', Object.keys(hp.code));
            console.log('Has hp.houses.code:', !!hp.houses?.code);
            console.log('  houses.code:', JSON.stringify(hp.houses?.code, null, 2).substring(0, 300));
        }
    }
})();
