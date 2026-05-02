#!/usr/bin/env node
/**
 * snapshot-prog003-affected-progress.js — Pre-deploy backup tool.
 *
 * Snapshots all Firestore user progress records that COULD be affected by the
 * Stragglers PROG-003 fix. Run BEFORE the Stragglers deploy. If anything goes
 * wrong, the snapshot provides a recovery path.
 *
 * What it captures (per stragglers-progress-safety-audit.md Category A):
 *   For every user with progress records under the OLD shared keys
 *   (cloud-guilab, cloud-pslab, cloud-presentation, forge/index), export
 *   their full progress document so the operator can:
 *     1. Identify how many users are affected
 *     2. Restore individual records if recovery is needed
 *     3. Prove "no data loss occurred" if questioned
 *
 * Output: snapshots/prog003-pre-deploy-YYYYMMDD-HHMM.json
 *
 * Usage (from functions/ directory):
 *   node snapshot-prog003-affected-progress.js
 *   node snapshot-prog003-affected-progress.js --dry-run    # Count affected users only
 *
 * Prerequisites:
 *   - Firebase Admin SDK + service account configured for hexworth-prime
 *
 * Per CLAUDE.md Rule #10: this script READS from production Firestore but
 * does NOT WRITE. Safe to run from any branch. Output is local-only.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const DRY_RUN = process.argv.includes('--dry-run');

// PROG-003 affected old shared keys (per stragglers-progress-safety-audit.md)
const AFFECTED_KEYS = {
    cloud: ['cloud-guilab', 'cloud-pslab', 'cloud-presentation'],
    forge: ['index'],  // 12 A+ Core 2 chapters all wrote to ('forge', 'index')
};

(async () => {
    console.log('');
    console.log('  Stragglers PROG-003 pre-deploy snapshot');
    console.log('  Mode: ' + (DRY_RUN ? 'DRY RUN (count only)' : 'EXPORT'));
    console.log('');

    const usersRef = db.collection('users');
    let scanned = 0;
    let affected = [];

    try {
        const snapshot = await usersRef.get();
        scanned = snapshot.size;
        console.log(`  Scanned ${scanned} user docs`);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const progress = data.progress || data.hexworth_progress || {};
            const hits = [];

            for (const [house, keys] of Object.entries(AFFECTED_KEYS)) {
                const housePct = progress[house] || {};
                for (const key of keys) {
                    if (housePct[key]) {
                        hits.push({ house, key, record: housePct[key] });
                    }
                }
            }

            if (hits.length > 0) {
                affected.push({
                    uid: doc.id,
                    email: data.email || '(no email)',
                    displayName: data.displayName || '(none)',
                    affectedKeys: hits,
                    fullProgress: progress,  // full backup for restore if needed
                });
            }
        }

        console.log(`  Users with affected-key progress records: ${affected.length}`);
        console.log('');

        if (DRY_RUN) {
            console.log('  Dry run complete. Re-run without --dry-run to export full snapshot.');
            return;
        }

        // Write snapshot
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
        const outDir = path.join(__dirname, 'snapshots');
        fs.mkdirSync(outDir, { recursive: true });
        const outFile = path.join(outDir, `prog003-pre-deploy-${ts}.json`);
        fs.writeFileSync(outFile, JSON.stringify({
            generated: new Date().toISOString(),
            purpose: 'Pre-Stragglers-deploy snapshot of users whose progress could be affected by PROG-003 key rename. Per stragglers-progress-safety-audit.md.',
            affectedKeys: AFFECTED_KEYS,
            usersScanned: scanned,
            usersAffected: affected.length,
            users: affected,
        }, null, 2));

        console.log(`  Snapshot written: ${outFile}`);
        console.log(`  File size: ${(fs.statSync(outFile).size / 1024).toFixed(0)} KB`);
        console.log('');
        console.log('  This file is the recovery source for individual user progress restoration');
        console.log('  if the deploy produces unexpected progress damage. Keep it until the deploy');
        console.log('  is verified safe (e.g., 1 week post-deploy, no support tickets reported).');

    } catch (e) {
        console.error('  ERROR:', e.message);
        console.error('  If this is "permission-denied", verify Firebase Admin SDK credentials.');
        console.error('  If this is "could not load default credentials", run:');
        console.error('    gcloud auth application-default login');
        process.exit(1);
    }
})();
