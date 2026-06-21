/**
 * seed-secplus-blueteam-siem-triage.js
 *
 * Seeds flag_registry/{boxId} for the Security+ Cert Prep blue-team box
 * "shield-sp-blueteam-siem-triage" so validateFlag can validate submissions.
 * boxId = config.registryId. Same pattern as seed-secplus-blueteam-log-hunt.js.
 *
 * Usage:
 *   node seed-secplus-blueteam-siem-triage.js --dry-run
 *   node seed-secplus-blueteam-siem-triage.js
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const DRY_RUN = process.argv.includes('--dry-run');
const BOX_ID = 'shield-sp-blueteam-siem-triage';
const FLAGS = {
    c2_ip: '203.0.113.88',
    beaconing_host: '10.10.20.31',
    attack_signature: 'ET MALWARE Cobalt Strike Beacon',
    fp_source_ip: '10.10.5.77',
    exfil_bytes: '5242880'
};

// Seed (or with --dry-run, preview) the box's flag answers into Firestore so the
// validateFlag Cloud Function can validate student submissions for this box.
async function main() {
    // Print the boxId + flag map being written (audit trail).
    console.log(`flag_registry/${BOX_ID}`);
    for (const [id, val] of Object.entries(FLAGS)) console.log(`  ${id} -> ${val}`);
    // Dry-run guard: preview only, never touch Firestore.
    if (DRY_RUN) { console.log('\n=== DRY RUN — no write ==='); return; }
    // Initialize firebase-admin (Application Default Credentials) and write the
    // flag_registry doc, merging so existing fields are preserved.
    initializeApp();
    const db = getFirestore();
    await db.doc(`flag_registry/${BOX_ID}`).set({
        flags: FLAGS, registryId: BOX_ID,
        source: 'seed-secplus-blueteam-siem-triage.js', seededAt: FieldValue.serverTimestamp()
    }, { merge: true });
    // Read back the doc to confirm the write landed.
    const snap = await db.doc(`flag_registry/${BOX_ID}`).get();
    console.log('\nWrite OK. Readback flags:', JSON.stringify(snap.data().flags));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
