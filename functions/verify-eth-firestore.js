const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
    let totals = [0,0,0,0], qTotal = 0;
    for (let i = 1; i <= 15; i++) {
        const id = 'eth-' + String(i).padStart(2,'0') + '-quiz';
        const d = (await db.collection('quiz_keys').doc(id).get()).data();
        const a = d.answers || [];
        const c = [0,0,0,0];
        for (const x of a) c[x]++;
        for (let j=0;j<4;j++) totals[j] += c[j];
        qTotal += a.length;
        console.log(`  ${id}: shuffled=${d.shuffled || false} | answers=[${a.join(',')}] | A:${c[0]} B:${c[1]} C:${c[2]} D:${c[3]}`);
    }
    console.log(`\n  TOTAL ${qTotal}q: A:${totals[0]} (${(100*totals[0]/qTotal).toFixed(0)}%) B:${totals[1]} (${(100*totals[1]/qTotal).toFixed(0)}%) C:${totals[2]} (${(100*totals[2]/qTotal).toFixed(0)}%) D:${totals[3]} (${(100*totals[3]/qTotal).toFixed(0)}%)`);
})();
