#!/usr/bin/env node
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const snap = await db.collection('_auto_fix_queue')
        .where('status', '==', 'open')
        .orderBy('priority', 'desc')
        .get();
    console.log(`_auto_fix_queue open items: ${snap.size}\n`);
    snap.forEach(doc => {
        const d = doc.data();
        const idShort = doc.id.slice(0, 12) + '...';
        const childCount = d.childCount || 0;
        const sample = (d.childPaths && d.childPaths[0]) || '(none)';
        console.log(`  ${idShort}  ${d.rule}  ${d.groupKey}  (${childCount} files)`);
        console.log(`              first file: ${sample}`);
        console.log(`              full id: ${doc.id}`);
        console.log('');
    });
    process.exit(0);
})();
