/**
 * seed-secplus-blueteam-log-hunt.js
 *
 * Seeds flag_registry/{boxId} for the Security+ Cert Prep blue-team box
 * "blueteam-log-intrusion-hunt" so the validateFlag Cloud Function can
 * validate student submissions (validateFlag reads flag_registry/{boxId}.flags
 * and compares submission.trim().toLowerCase() to value.trim().toLowerCase()).
 *
 * boxId = the box config.registryId (the id BoxEngine sends to validateFlag).
 *
 * Usage:
 *   node seed-secplus-blueteam-log-hunt.js --dry-run   # preview, no write
 *   node seed-secplus-blueteam-log-hunt.js             # write to Firestore
 *
 * Auth: Application Default Credentials / GOOGLE_APPLICATION_CREDENTIALS
 * (same pattern as seed-box-flags.js).
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const DRY_RUN = process.argv.includes('--dry-run');

// Canonical boxId — MUST equal config.registryId in the box's config.js.
const BOX_ID = 'shield-sp-blueteam-log-intrusion-hunt';

// flagId -> discoverable value (case-insensitive match server-side).
const FLAGS = {
    attacker_ip: '198.51.100.47',
    compromised_account: 'jgarcia',
    webshell_path: '/var/www/html/uploads/shell.php',
    lateral_target: '10.10.20.15',
    exfil_bytes: '1048576'
};

async function main() {
    console.log(`flag_registry/${BOX_ID}`);
    for (const [id, val] of Object.entries(FLAGS)) {
        console.log(`  ${id} -> ${val}`);
    }
    if (DRY_RUN) {
        console.log('\n=== DRY RUN — no write performed ===');
        return;
    }
    initializeApp();
    const db = getFirestore();
    await db.doc(`flag_registry/${BOX_ID}`).set({
        flags: FLAGS,
        registryId: BOX_ID,
        source: 'seed-secplus-blueteam-log-hunt.js',
        seededAt: FieldValue.serverTimestamp()
    }, { merge: true });
    // Read back to confirm.
    const snap = await db.doc(`flag_registry/${BOX_ID}`).get();
    console.log('\nWrite OK. Readback flags:', JSON.stringify(snap.data().flags));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
