const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const cs = await db.collection('tenants').doc('python-april-2026').collection('classes').get();
    for (const c of cs.docs) {
        const cd = c.data();
        console.log('Class:', c.id, '| name:', cd.name || cd.className);
        const sub = await db.collection('tenants').doc('python-april-2026').collection('classes').doc(c.id).listCollections();
        for (const s of sub) {
            const docs = await s.get();
            console.log(' ', s.id, ':', docs.size, 'docs');
            const indiaDoc = await s.doc(UID).get();
            if (indiaDoc.exists) {
                console.log('   INDIA IN', s.id);
                const data = indiaDoc.data();
                const completions = data.completions || {};
                console.log('   completion keys:', Object.keys(completions).length);
                const all = Object.keys(completions).sort();
                console.log('   first 20:', all.slice(0, 20));
                console.log('   last 10:', all.slice(-10));
                // PFI ones specifically
                const pfi = all.filter(k => k.toLowerCase().includes('pfi') || k.toLowerCase().includes('python'));
                console.log('   PFI/python:', pfi.length, '| sample:', pfi.slice(0, 10));
                // Show update time
                if (data.updatedAt) console.log('   updatedAt:', data.updatedAt.toDate?.());
            }
        }
    }
})();
