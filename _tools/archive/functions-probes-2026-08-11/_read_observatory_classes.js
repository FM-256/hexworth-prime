// READ-ONLY: dump observatory_classes + classId usage across enrollments. No writes.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
    // (1) Dump the admin-managed class list the consent dropdown reads (empty => dropdown falls back
    // to the built-in DEFAULT_CLASSES in ObservatoryConsent.js).
    const cls = await db.collection('observatory_classes').get();
    console.log('observatory_classes docs: ' + cls.size);
    cls.forEach(d => console.log('  - id="' + d.id + '"  label="' + (d.data().label || '') + '"'));

    // (2) Aggregate existing enrollments by classId so we can see which class options are actually in
    // use — deleting/renaming a class option must not orphan real students.
    const enr = await db.collection('observatory_enrollment').get();
    const byClass = {};
    enr.forEach(d => { const c = d.data().classId || '(none)'; byClass[c] = (byClass[c] || 0) + 1; });

    // (3) Print the usage counts, sorted by classId, for a readable snapshot.
    console.log('\nenrollments by classId (' + enr.size + ' total):');
    Object.keys(byClass).sort().forEach(k => console.log('  - ' + k + ': ' + byClass[k]));
    process.exit(0);
})().catch(e => { console.error('READ FAILED:', e.message); process.exit(1); });
