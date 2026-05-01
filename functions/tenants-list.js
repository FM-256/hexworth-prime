const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const tenants = await db.collection('tenants').get();
    console.log('All tenants:');
    for (const t of tenants.docs) {
        const td = t.data();
        const students = td.studentUids || td.memberUids || td.students || td.roster || [];
        const inTenant = (Array.isArray(students) && students.includes(UID)) || (typeof students === 'object' && students[UID]);
        console.log(' ', t.id, td.name || td.slug, '|', td.courseCode || '?', '| students:', Array.isArray(students) ? students.length : 'map', '| India in tenant:', inTenant);
    }

    // Check classes in detail for course code
    const classes = await db.collection('classes').get();
    console.log('\nAll classes:');
    for (const c of classes.docs) {
        const cd = c.data();
        console.log(' ', c.id, '| name:', cd.name || cd.className, '| course:', cd.courseCode, '| courseId:', cd.courseId, '| moduleSet:', cd.moduleSet, '| creator:', cd.handlerEmail || cd.creatorEmail);
    }
})();
