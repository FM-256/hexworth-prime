const admin = require('firebase-admin');
admin.initializeApp({projectId: 'hexworth-prime'});
const db = admin.firestore();
(async () => {
    for (const id of ['divergent-eth-midterm', 'divergent-eth-final']) {
        const d = (await db.collection('quiz_keys').doc(id).get()).data();
        const a = d.answers || [];
        const c = [0,0,0,0]; for (const x of a) if (x>=0&&x<=3) c[x]++;
        console.log(`${id}: len=${a.length}, distribution A:${c[0]} B:${c[1]} C:${c[2]} D:${c[3]}, alignedAt=${d.alignedAt?.toDate?.() || '-'}`);
        console.log(`  answers: ${JSON.stringify(a)}`);
    }
})();
