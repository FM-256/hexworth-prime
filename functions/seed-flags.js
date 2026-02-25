/**
 * Seed script — populates flag_registry/a1-ancient-ledger in Firestore
 * so the validateFlag Cloud Function can verify submissions server-side.
 *
 * Usage:  node seed-flags.js
 * Uses Firebase Admin with project ID from .firebaserc
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

async function seed() {
    await db.doc('flag_registry/a1-ancient-ledger').set({
        flags: {
            user: 'flag{4nc13nt_l3dg3r_sql1_d1sc0v3r3d}',
            root: 'flag{st3ll4r_f0rg3_4ll0c4t10n_c0d3s}'
        }
    }, { merge: true });

    console.log('Seeded flag_registry/a1-ancient-ledger');
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
