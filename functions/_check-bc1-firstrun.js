/**
 * Verify bc1 first scheduled scan post-fire (Task #58).
 * Run after 07:00 UTC 2026-05-08 to confirm cron worked.
 * Read-only — no writes.
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const expectedAt = new Date('2026-05-08T07:00:00Z');
    const tolerance = 30 * 60 * 1000; // 30min

    const hb = await db.doc('_quality_reports/scanHeartbeat').get();
    if (!hb.exists) { console.log('FAIL: no scanHeartbeat doc'); process.exit(1); }
    const d = hb.data();
    const scannedAt = d.scannedAt && d.scannedAt.toDate ? d.scannedAt.toDate() : null;
    const scannedBy = d.scannedBy || d.host || '?';
    const gate = d.gatePass;
    const dur = d.durationMs;
    const total = d.totalFindings;

    console.log('scanHeartbeat:');
    console.log('  scannedAt:    ' + (scannedAt ? scannedAt.toISOString() : '?'));
    console.log('  scannedBy:    ' + scannedBy);
    console.log('  gatePass:     ' + gate);
    console.log('  durationMs:   ' + dur);
    console.log('  totalFindings:' + total);

    if (!scannedAt) { console.log('FAIL: scannedAt missing'); process.exit(2); }
    const delta = Math.abs(scannedAt - expectedAt);
    console.log('  Δ from 07:00 UTC: ' + Math.round(delta / 60000) + ' min');

    const now = new Date();
    if (now < expectedAt) { console.log('PENDING: expected fire is in the future'); process.exit(0); }

    if (delta > tolerance) {
        console.log('FAIL: latest scan is ' + Math.round(delta / 60000) + ' min from expected fire (>30min tolerance)');
        console.log('   bc1 cron may not have fired, or fired but did not write heartbeat');
        process.exit(3);
    }

    if (scannedBy !== 'bc1') {
        console.log('WARN: scannedBy=' + scannedBy + ' (expected bc1)');
    }

    if (gate === false) {
        console.log('WARN: gatePass=false on this run');
    }

    console.log('PASS: bc1 scheduled scan fired within tolerance');
    process.exit(0);
})().catch(err => { console.error(err.message); process.exit(99); });
