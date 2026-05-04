const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const profile = await db.collection('users').doc(UID).get();
    const p = profile.data();

    console.log('=== ALL 25 QUIZZES ===');
    for (const [k, v] of Object.entries(p.quizzes || {})) {
        console.log(`  ${k}: score=${v.score || v.bestScore || '?'}`);
    }

    console.log('\n=== USER SUBCOLLECTIONS ===');
    const subcols = await db.collection('users').doc(UID).listCollections();
    for (const sc of subcols) {
        const docs = await sc.get();
        console.log(`  ${sc.id}: ${docs.size} docs`);
        docs.forEach(d => console.log(`    - ${d.id}`));
    }

    // Check tenant class progress — find any class she's in
    console.log('\n=== CLASS / TENANT MEMBERSHIPS ===');
    const classMember = await db.collection('class_memberships').where('uid', '==', UID).get();
    console.log('class_memberships:', classMember.size);
    classMember.forEach(d => {
        const m = d.data();
        console.log('  ', d.id, '| class:', m.classId, '| handler:', m.handlerEmail || m.handlerUid);
    });

    // Look in class_progress
    const classProg = await db.collection('class_progress').where('uid', '==', UID).get();
    console.log('class_progress:', classProg.size);
    classProg.forEach(d => {
        const m = d.data();
        console.log('  ', d.id, ' modules:', (m.modulesCompleted || []).length, ' quizzes:', Object.keys(m.quizzes || {}).length);
        const pfi = (m.modulesCompleted || []).filter(x => x.toLowerCase().startsWith('pfi') || x.startsWith('pyit'));
        console.log('     PFI in this class doc:', pfi.length, 'sample:', pfi.slice(0, 5));
    });

    // Look at all top-level collections for India's UID
    console.log('\n=== SCAN OTHER COLLECTIONS ===');
    for (const col of ['progress', 'tenant_progress', 'student_progress', 'pfi_grades', 'pfi_submissions', 'pfi-submissions']) {
        try {
            const r = await db.collection(col).where('uid', '==', UID).get();
            if (!r.empty) {
                console.log(`  ${col}: ${r.size} docs`);
                r.forEach(d => console.log(`    - ${d.id}`));
            }
        } catch (e) { /* collection may not exist */ }
    }

    // Look at handler-side dashboard view if there is one
    const handler = await db.collection('handler_views').where('students', 'array-contains', UID).get().catch(() => ({empty:true,size:0}));
    console.log('handler_views containing student:', handler.size);
})();
