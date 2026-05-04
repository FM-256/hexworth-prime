const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const snap = await db.collection('quiz_keys').get();
    const all = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    console.log('Total quiz_keys docs:', all.length);

    const eth = all.filter(d => d.id.toLowerCase().includes('eth'));
    console.log('\nEth-related quiz_keys docs:', eth.length);
    for (const d of eth) {
        console.log(' ', d.id, 'keys:', Object.keys(d.data || {}));
        if (d.data.answers) {
            console.log('    answers:', d.data.answers);
        }
        if (d.data.key) {
            console.log('    key:', d.data.key);
        }
    }

    // Sample doc shape
    if (all.length > 0) {
        console.log('\nSample doc shape (first non-eth):');
        const sample = all.find(d => !d.id.toLowerCase().includes('eth')) || all[0];
        console.log(' ', sample.id, JSON.stringify(sample.data, null, 2).substring(0, 400));
    }
})();
