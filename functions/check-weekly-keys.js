const admin = require('firebase-admin');
admin.initializeApp({projectId: 'hexworth-prime'});
const db = admin.firestore();
(async () => {
    for (const id of ['eth-w1', 'eth-w2', 'eth-w3', 'eth-w1-quiz', 'eth-w2-quiz', 'eth-w3-quiz', 'divergent-eth-w1', 'divergent-eth-w2', 'divergent-eth-w3']) {
        const d = await db.collection('quiz_keys').doc(id).get();
        if (d.exists) console.log(id, '→ exists, keys:', Object.keys(d.data()), 'answers length:', (d.data().answers||[]).length, 'sample:', JSON.stringify(d.data().answers||[]).substring(0,80));
        else console.log(id, '→ not in Firestore');
    }
})();
