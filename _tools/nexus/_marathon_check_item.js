#!/usr/bin/env node
// Print the status of one _auto_fix_queue item, or 'missing' if not found.
const path = require('path');
const FUNCTIONS_DIR = path.resolve(__dirname, '../../functions');
const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
admin.initializeApp({ projectId: 'hexworth-prime' });
const itemId = process.argv[2];
if (!itemId) { console.error('usage: _marathon_check_item.js <itemId>'); process.exit(1); }
admin.firestore().doc(`_auto_fix_queue/${itemId}`).get().then(snap => {
    if (!snap.exists) { console.log('missing'); process.exit(0); }
    console.log(snap.data().status || 'unknown');
    process.exit(0);
});
