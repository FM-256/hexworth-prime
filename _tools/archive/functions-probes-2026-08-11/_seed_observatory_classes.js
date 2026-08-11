// Seed observatory_classes with the operator-confirmed go-forward class list (2026-07-06).
// Additive/idempotent: writes each observatory_classes/{id} = {label} exactly as the admin "Add
// class" editor does. observatory_classes was empty, so the consent dropdown was falling back to the
// built-in DEFAULT_CLASSES; seeding makes this collection the live source. Nothing is removed —
// existing enrollments (cis2350c, other) keep their classId. Confirmed labels/IDs by the operator.
// Course codes sourced: CET1171C (~/hexworth-shared/.../TECH_CURRICULUM_REPORT.md),
// CTS2106C (syllabus 'CTS2106C MS Multiuser Operating Systems.docx').
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

// The confirmed dropdown: 2 new cohorts starting this week + the 3 existing options kept.
const CLASSES = [
    { id: 'cet1171c', label: 'CET1171C — Computer Service and Support PC Systems I (A+ Core 1)' },
    { id: 'cts2106c', label: 'CTS2106C — Multiuser Operating Systems (Linux)' },
    { id: 'cis2350c', label: 'CIS2350C — Principles of Information Security' },
    { id: 'cop1034c', label: 'COP1034C — Python for IT' },
    { id: 'other',    label: 'Other / Not listed' }
];

(async () => {
    // Guard: show what already exists so a re-run can't silently clobber a later admin-UI edit.
    const before = await db.collection('observatory_classes').get();
    console.log('observatory_classes BEFORE: ' + before.size + ' doc(s)');
    before.forEach(d => console.log('  - ' + d.id + ' = "' + (d.data().label || '') + '"'));

    // Write each class (merge:true so a pre-existing label is updated, not other fields wiped).
    for (const c of CLASSES) {
        await db.collection('observatory_classes').doc(c.id).set({ label: c.label }, { merge: true });
        console.log('  seeded ' + c.id);
    }

    // Confirm the resulting state.
    const after = await db.collection('observatory_classes').get();
    console.log('\nobservatory_classes AFTER: ' + after.size + ' doc(s)');
    after.forEach(d => console.log('  - ' + d.id + ' = "' + (d.data().label || '') + '"'));
    process.exit(0);
})().catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });
