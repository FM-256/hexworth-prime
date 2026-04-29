#!/usr/bin/env node
// Slice 1.4 verification — read _triage_queue from Firestore and sanity-check.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const snap = await db.collection('_triage_queue').get();
    console.log(`_triage_queue items: ${snap.size}\n`);

    const fingerprints = new Set();
    let bad = 0;
    snap.forEach(doc => {
        const d = doc.data();
        const fp = d.defectFingerprint || '';
        const ok = fp.length === 64
            && d.source === 'nexus'
            && (d.severity === 'critical' || d.severity === 'high')
            && d.status === 'open'
            && typeof d.priority === 'number'
            && d.priority >= 0 && d.priority <= 100
            && typeof d.autoFixEligible === 'boolean'
            && d.createdAt && d.updatedAt;
        if (!ok) {
            bad++;
            console.log(`  BAD ${doc.id.slice(0,8)}: severity=${d.severity} status=${d.status} fp.length=${fp.length} priority=${d.priority}`);
        }
        fingerprints.add(fp);
        console.log(`  ${d.severity.toUpperCase().padEnd(8)} ${d.groupKey.padEnd(45)} (${d.childCount} findings)  fp=${fp.slice(0, 12)}...  pri=${d.priority}`);
    });

    console.log(`\nUnique fingerprints: ${fingerprints.size} (should equal ${snap.size})`);
    console.log(`Schema-valid items: ${snap.size - bad} / ${snap.size}`);

    const autoFixSnap = await db.collection('_auto_fix_queue').get();
    console.log(`\n_auto_fix_queue items: ${autoFixSnap.size} (should be 0 in Slice 1)`);

    process.exit(bad === 0 && fingerprints.size === snap.size ? 0 : 1);
})();
