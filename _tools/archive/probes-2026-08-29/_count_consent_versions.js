// READ-ONLY: count observatory_consent records by formVersion (fresh re-consent blast radius). No writes.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
    // Tally every consent record by its stamped formVersion; v1 records are the ones a v2 bump re-prompts.
    const snap = await db.collection('observatory_consent').get();
    const byVer = {};
    snap.forEach(d => { const v = d.data().formVersion || '(none)'; byVer[v] = (byVer[v] || 0) + 1; });
    console.log('observatory_consent records: ' + snap.size);
    Object.keys(byVer).sort().forEach(v => console.log('  - ' + v + ': ' + byVer[v] + (v.indexOf('v1') !== -1 ? '  <-- re-prompted by the v2 bump' : '')));
    process.exit(0);
})().catch(e => { console.error('READ FAILED:', e.message); process.exit(1); });
