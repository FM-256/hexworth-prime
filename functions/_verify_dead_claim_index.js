#!/usr/bin/env node
// Slice 3a verification — issue the reaper's query and confirm it works
// (i.e., index has finished building). Should print "Index ready" or fail.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    try {
        const triageSnap = await db.collection('_triage_queue')
            .where('status', 'in', ['claimed', 'in-progress'])
            .where('claimedAt', '<', cutoff)
            .limit(1)
            .get();
        const autoFixSnap = await db.collection('_auto_fix_queue')
            .where('status', 'in', ['claimed', 'in-progress'])
            .where('claimedAt', '<', cutoff)
            .limit(1)
            .get();
        console.log('Index ready');
        console.log('  _triage_queue stale candidates:', triageSnap.size);
        console.log('  _auto_fix_queue stale candidates:', autoFixSnap.size);
        process.exit(0);
    } catch (err) {
        console.error('Index NOT ready:', err.message);
        if (err.code === 9 || /FAILED_PRECONDITION/i.test(err.message)) {
            console.error('Wait for index build to complete before deploying function.');
        }
        process.exit(1);
    }
})();
