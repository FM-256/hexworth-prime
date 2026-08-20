/**
 * seed-one-box.js <boxId>
 *
 * Seeds flag_registry/{boxId} in Firestore from the canonical functions/box_flags.json
 * entry for that box, so the validateFlag Cloud Function can validate submissions.
 * Reusable across boxes — pass the boxId (== config.registryId == dir basename).
 *
 * Usage:
 *   node seed-one-box.js <boxId> --dry-run   # preview, no write
 *   node seed-one-box.js <boxId>             # write to Firestore (ADC creds)
 */
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Parse args: first non-flag arg is the boxId; --dry-run previews only.
const DRY_RUN = process.argv.includes('--dry-run');
const BOX_ID = process.argv.slice(2).find(a => !a.startsWith('--'));

// Seed (or preview) one box's flags from box_flags.json into flag_registry/{boxId}.
async function main() {
    // Validate input + load the canonical flag export.
    if (!BOX_ID) { console.error('Usage: node seed-one-box.js <boxId> [--dry-run]'); process.exit(1); }
    const boxFlags = JSON.parse(fs.readFileSync(path.join(__dirname, 'box_flags.json'), 'utf8'));
    const entry = boxFlags[BOX_ID];
    if (!entry || !entry.flags) { console.error('No box_flags.json entry for', BOX_ID); process.exit(1); }
    // Print what will be written (audit trail).
    console.log(`flag_registry/${BOX_ID}`);
    for (const [id, val] of Object.entries(entry.flags)) console.log(`  ${id} -> ${val}`);
    // Dry-run guard: never touch Firestore.
    if (DRY_RUN) { console.log('\n=== DRY RUN — no write ==='); return; }
    // Initialize firebase-admin (ADC) and write the registry doc (merge-safe).
    initializeApp();
    const db = getFirestore();
    /* Carry deliveryDisabled, exactly as seed-box-flags.js does.
     *
     * This tool did not, and that is a silent hole rather than a visible one: merge:true means
     * running it over an ALREADY-locked box leaves the field intact, so nothing breaks today.
     * The exposure is the FIRST seed of a new competition box — an operator reaching for this
     * tool instead of `seed-box-flags.js --only`, plausibly mid-event under time pressure,
     * would create the registry doc with no deliveryDisabled at all. deliverFlag's guard is
     * then simply false and the box discloses its flag to anyone signed in, while this tool
     * prints "Write OK" and a readback of the flags. Found by adversarial audit, by source.
     *
     * Two tools that both seed flag_registry must agree on every security-relevant field, or
     * the safe one is only safe when someone remembers which is which.
     *
     * TRUE only, never false: the write is merged, and writing false here would silently
     * re-enable disclosure on a box locked down by hand.
     */
    const payload = {
        flags: entry.flags, registryId: BOX_ID,
        source: 'seed-one-box.js', seededAt: FieldValue.serverTimestamp()
    };
    if (entry.deliveryDisabled === true) payload.deliveryDisabled = true;
    await db.doc(`flag_registry/${BOX_ID}`).set(payload, { merge: true });
    // Read back to confirm the write landed.
    const snap = await db.doc(`flag_registry/${BOX_ID}`).get();
    console.log('\nWrite OK. Readback flags:', JSON.stringify(snap.data().flags));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
