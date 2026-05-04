const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    // Find any class she's enrolled in
    console.log('=== ENROLLMENTS ===');
    const enroll = await db.collection('enrollments').where('uid', '==', UID).get();
    console.log('Direct enrollments where uid==:', enroll.size);
    enroll.forEach(d => console.log(' ', d.id, JSON.stringify(d.data()).substring(0, 250)));

    // Search all classes for her in a roster or members subcollection
    console.log('\n=== ALL CLASSES (looking for India) ===');
    const classes = await db.collection('classes').get();
    console.log('Total classes:', classes.size);
    for (const c of classes.docs) {
        const cd = c.data();
        const members = cd.memberUids || cd.studentUids || cd.students || [];
        if (Array.isArray(members) && members.includes(UID)) {
            console.log('  IN CLASS:', c.id, '| name:', cd.name || cd.className, '| handler:', cd.handlerEmail || cd.handlerUid);
        }
        // Also check progress subcollection for her UID
        try {
            const prog = await db.collection('classes').doc(c.id).collection('progress').doc(UID).get();
            if (prog.exists) {
                const data = prog.data();
                const completions = data.completions || {};
                console.log(`  PROGRESS DOC IN CLASS ${c.id}: ${Object.keys(completions).length} completions`);
                // Show PFI ones
                const pfi = Object.entries(completions).filter(([k]) => k.toLowerCase().includes('pfi') || k.startsWith('pyit'));
                if (pfi.length > 0) {
                    console.log('  PFI completions:', pfi.length);
                    pfi.slice(0, 10).forEach(([k, v]) => console.log(`     - ${k}: completed=${v.completed}, score=${v.score || '-'}`));
                }
                // Show all completions briefly
                const allKeys = Object.keys(completions);
                console.log(`  All completion keys (${allKeys.length}):`, allKeys.slice(0, 10));
                if (allKeys.length > 10) console.log('     ... +', allKeys.length - 10, 'more');
            }
        } catch (e) {}
    }

    // Also check tenants
    console.log('\n=== TENANTS ===');
    const tenants = await db.collection('tenants').get();
    console.log('Total tenants:', tenants.size);
    for (const t of tenants.docs) {
        const td = t.data();
        if ((td.studentUids || []).includes(UID) || (td.memberUids || []).includes(UID)) {
            console.log('  IN TENANT:', t.id, td.name || td.slug);
        }
    }
})();
