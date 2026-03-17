#!/usr/bin/env node
/**
 * bulk-unlock.js — Clear all integrity violations in Firestore.
 * Run from the functions/ directory:
 *   node bulk-unlock.js
 *
 * Uses Application Default Credentials (gcloud auth) or GOOGLE_APPLICATION_CREDENTIALS.
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp({
    credential: applicationDefault(),
    projectId: 'hexworth-prime'
});

const db = getFirestore();

async function bulkUnlock() {
    // Find all users with integrity.status === 'violated'
    const snapshot = await db.collection('users')
        .where('integrity.status', '==', 'violated')
        .get();

    if (snapshot.empty) {
        console.log('No locked-out users found.');
        return;
    }

    console.log(`Found ${snapshot.size} locked-out user(s):\n`);

    const batch = db.batch();
    const users = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        users.push({
            uid: doc.id,
            callsign: data.callsign || 'Unknown',
            email: data.email || 'N/A',
            integrity: data.integrity || {}
        });

        batch.update(doc.ref, {
            integrity: FieldValue.delete(),
            integrityResetAt: FieldValue.serverTimestamp(),
            integrityResetBy: 'bulk-unlock-script'
        });
    });

    // Print who's locked out
    for (const u of users) {
        console.log(`  - ${u.callsign} (${u.email})`);
        console.log(`    Detected: ${u.integrity.detectedAt || 'unknown'}`);
        console.log(`    Garbage count: ${u.integrity.garbageCount || 'unknown'}`);
        console.log('');
    }

    // Commit the batch
    await batch.commit();
    console.log(`Unlocked ${users.length} user(s). Integrity fields cleared.`);
}

bulkUnlock().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
