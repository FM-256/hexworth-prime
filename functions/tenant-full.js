const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const t = await db.collection('tenants').doc('python-april-2026').get();
    if (t.exists) {
        const td = t.data();
        console.log('python-april-2026 keys:', Object.keys(td));
        console.log(JSON.stringify(td, null, 2).substring(0, 2000));
    }
    // Subcollections of tenant
    const subs = await db.collection('tenants').doc('python-april-2026').listCollections();
    console.log('\nSubcollections:');
    for (const s of subs) {
        const docs = await s.get();
        console.log(' ', s.id, docs.size, 'docs');
        // If there's a roster/students/progress
        if (s.id === 'progress' || s.id === 'students' || s.id === 'roster') {
            for (const d of docs.docs) {
                if (d.id === UID) {
                    console.log('  INDIA FOUND:', d.id);
                    const data = d.data();
                    const completions = data.completions || {};
                    console.log('  completion keys:', Object.keys(completions).length);
                    console.log('  sample:', Object.keys(completions).slice(0, 10));
                    break;
                }
            }
        }
    }
    // Search any tenant for India
    console.log('\n=== Searching all tenants for India ===');
    for (const tid of ['keiser-university', 'python-april-2026', 'test-x']) {
        const subs2 = await db.collection('tenants').doc(tid).listCollections();
        for (const s of subs2) {
            try {
                const d = await db.collection('tenants').doc(tid).collection(s.id).doc(UID).get();
                if (d.exists) {
                    console.log(`Found in tenants/${tid}/${s.id}/${UID}`);
                    const data = d.data();
                    if (data.completions) console.log('  completions:', Object.keys(data.completions).length);
                }
            } catch (e) {}
        }
    }
})();
