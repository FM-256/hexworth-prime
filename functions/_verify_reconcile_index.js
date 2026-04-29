#!/usr/bin/env node
// Slice 3b verification — confirm new (source, status) composite index is built.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    try {
        const t = await db.collection('_triage_queue')
            .where('source', '==', 'nexus')
            .where('status', 'in', ['open', 'claimed', 'in-progress', 'resolved'])
            .limit(1)
            .get();
        const a = await db.collection('_auto_fix_queue')
            .where('source', '==', 'nexus')
            .where('status', 'in', ['open', 'claimed', 'in-progress', 'resolved'])
            .limit(1)
            .get();
        console.log('Index ready');
        console.log('  _triage_queue (active+resolved nexus items):', t.size);
        console.log('  _auto_fix_queue (active+resolved nexus items):', a.size);
        process.exit(0);
    } catch (err) {
        console.error('Index NOT ready:', err.message);
        process.exit(1);
    }
})();
