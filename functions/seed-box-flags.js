/**
 * seed-box-flags.js -- Seeds flag_registry collection in Firestore from box_flags.json
 *
 * Reads the authoritative box_flags.json export and writes each box's flags,
 * hashStubs, and migratedAt timestamp to flag_registry/{boxId}.
 *
 * Usage:
 *   node seed-box-flags.js              # seed all boxes
 *   node seed-box-flags.js --dry-run    # preview without writing
 *
 * Requires: firebase-admin (already in functions/package.json)
 * Auth: Uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS
 */
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ── Parse args ──────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');

/* --only <boxId> narrows the write to a single box. Added 2026-08-19: seeding one competition
 * box previously rewrote all 242 registry documents. The batch is idempotent, so that was safe
 * rather than harmful — but a production write should touch what it means to touch, and a
 * 242-document blast radius makes the audit trail useless for answering "what did that run
 * change?". Absent, behaviour is unchanged: every box is seeded. */
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;
if (onlyIdx !== -1 && (!ONLY || ONLY.startsWith('--'))) {
    console.error('ERROR: --only requires a boxId. Refusing to run: a valueless --only would seed ALL boxes.');
    process.exit(1);
}

// ── Dispatch alias map (scenario IDs -> canonical config flag ID) ──
const DISPATCH_ALIASES = {
    'nt1-network-troubleshoot': {
        configFlagId: 'fixed',
        scenarioIds: ['dns_poisoned', 'disabled_adapter', 'firewall_block', 'wrong_subnet', 'dhcp_stopped']
    },
    'os001-boot-failure': {
        configFlagId: 'repaired',
        scenarioIds: ['corrupted_bcd', 'bad_driver', 'stuck_update', 'disk_corruption', 'missing_bootloader']
    },
    'hw001-dead-workstation': {
        configFlagId: 'repaired',
        scenarioIds: ['unseated_ram', 'dead_gpu', 'failed_psu', 'cpu_overheat', 'bad_sata']
    },
    'ad001-lockout-storm': {
        configFlagId: 'fixed',
        scenarioIds: ['stale_creds', 'expired_svc', 'brute_force', 'gpo_misconfig', 'rogue_task']
    },
    'pr001-printer-nightmare': {
        configFlagId: 'fixed',
        scenarioIds: ['spooler_crash', 'wrong_driver', 'ip_changed', 'perms_denied', 'stuck_queue']
    }
};

async function seed() {
    // Load box_flags.json
    const jsonPath = path.join(__dirname, 'box_flags.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('ERROR: box_flags.json not found at', jsonPath);
        process.exit(1);
    }

    const boxFlags = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let boxIds = Object.keys(boxFlags);
    console.log(`Loaded ${boxIds.length} boxes from box_flags.json`);
    if (ONLY) {
        if (!boxFlags[ONLY]) {
            console.error(`ERROR: --only ${ONLY} is not in box_flags.json.`);
            process.exit(1);
        }
        boxIds = [ONLY];
        console.log(`--only ${ONLY}: seeding 1 box, leaving the other ${Object.keys(boxFlags).length - 1} untouched`);
    }

    if (DRY_RUN) {
        console.log('\n=== DRY RUN -- no writes will be made ===\n');
        for (const boxId of boxIds) {
            const entry = boxFlags[boxId];
            const flagCount = Object.keys(entry.flags || {}).length;
            const hasAliases = !!DISPATCH_ALIASES[boxId];
            console.log(`  ${boxId}: ${flagCount} flags${hasAliases ? ' + dispatch aliases' : ''}`);
        }
        console.log(`\nTotal: ${boxIds.length} boxes, would write to flag_registry/{boxId}`);
        return;
    }

    // Init Firebase Admin
    initializeApp({ projectId: 'hexworth-prime' });
    const db = getFirestore();

    let success = 0;
    let failed = 0;

    // Firestore batches max 500 ops -- we have ~25 boxes, single batch is fine
    const batch = db.batch();

    for (const boxId of boxIds) {
        try {
            const entry = boxFlags[boxId];
            const docData = {
                flags: entry.flags,
                hashStubs: entry.hashStubs || {},
                migratedAt: entry.migratedAt || new Date().toISOString()
            };

            /* Competition boxes declare `deliveryDisabled: true` here, in box_flags.json — the
             * authoritative source — so the control travels with the box definition instead of
             * being a manual Firestore edit somebody has to remember. deliverFlag refuses to
             * disclose a value when it is set (functions/index.js), which is what stops a signed-in
             * caller collecting flags straight from the console without doing the work.
             *
             * Written explicitly rather than spread from `entry`, so a stray key in box_flags.json
             * can never become a registry field nobody reviewed.
             *
             * Only ever set TRUE from here. If the source omits it the field is left alone rather
             * than written false, because the batch uses { merge: true } and writing false would
             * silently RE-ENABLE disclosure on a box someone had locked down by hand — a reseed
             * quietly undoing a security decision is exactly the kind of regression that hides.
             */
            if (entry.deliveryDisabled === true) {
                docData.deliveryDisabled = true;
            }

            // Add dispatch aliases if applicable
            const aliasConfig = DISPATCH_ALIASES[boxId];
            if (aliasConfig) {
                const aliases = {};
                for (const sid of aliasConfig.scenarioIds) {
                    aliases[sid] = aliasConfig.configFlagId;
                }
                docData.aliases = aliases;
            }

            batch.set(db.doc(`flag_registry/${boxId}`), docData, { merge: true });
            success++;
        } catch (err) {
            console.error(`FAILED: ${boxId} -- ${err.message}`);
            failed++;
        }
    }

    await batch.commit();

    console.log(`\nSeeded flag_registry: ${success} succeeded, ${failed} failed`);
    if (Object.keys(DISPATCH_ALIASES).length > 0) {
        const aliasedCount = boxIds.filter(id => DISPATCH_ALIASES[id]).length;
        console.log(`  ${aliasedCount} dispatch boxes include scenario aliases`);
    }
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
