/**
 * Push new Room 214 schedule to Firestore — 6-5-26 update.
 *
 * Switches the room-214 board from `classroom-schedule` (2 panels) to
 * `day-night-schedule` (1 day class + 2 night classes with per-block
 * time + instructor).
 *
 * Source: operator-provided image
 *   hexworth-shared/images/e-paper/new-classes 6-5-26.jpg
 *
 * New schedule:
 *   DAY    CIS2218   Human Aspects of Cybersecurity   Wallace   MTR 9 AM – 1 PM
 *   NIGHT  CTS4321   Advanced Linux Administration    Mora      MW 6 PM – 9 PM
 *   NIGHT  CTS1328C  Managing & Maintaining Server OS Mora      TR 6 PM – 9 PM
 *   OPEN LAB                                                       3:00 – 5:00 PM
 *
 * Run: node _tools/scratch/epaper-push-room-214-new-schedule.js
 */
const path = require('path');
const admin = require(path.join('/home/eq/ai-content/hexworth-prime/functions/node_modules/firebase-admin'));

try { admin.initializeApp({ projectId: 'hexworth-prime' }); } catch (e) {
    if (!/already exists/.test(e.message)) throw e;
}
const db = admin.firestore();

const payload = {
    template: 'day-night-schedule',
    label: 'Room 214 Door Display',
    config: {
        room: 'Room 214',
        timezone: 'America/New_York',
        dayBlock: {
            label: 'DAY CLASS',
            time: '9 AM – 1 PM',
            instructor: 'Professor Wallace',
            course: {
                code: 'CIS2218',
                title: 'HUMAN ASPECTS OF CYBERSECURITY',
                days: 'Mon · Tue · Thu',
                dayNums: [1, 2, 4],
            },
        },
        nightBlock: {
            label: 'NIGHT CLASS',
            time: '6 PM – 9 PM',
            instructor: 'Professor Mora',
            courses: [
                {
                    code: 'CTS4321',
                    title: 'ADVANCED LINUX ADMINISTRATION',
                    days: 'Mon · Wed',
                    dayNums: [1, 3],
                    side: 'left',
                },
                {
                    code: 'CTS1328C',
                    title: 'MANAGING & MAINTAINING SERVER OS',
                    days: 'Tue · Thu',
                    dayNums: [2, 4],
                    side: 'right',
                },
            ],
        },
        openLab: { enabled: true, time: '3:00 – 5:00 PM' },
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

(async () => {
    const ref = db.collection('epaper_boards').doc('room-214');
    const before = await ref.get();
    console.log('Existing doc template:', before.exists ? before.data().template : '(none)');
    await ref.set(payload, { merge: true });
    const after = await ref.get();
    console.log('Updated doc template:', after.data().template);
    console.log('Day course:', after.data().config.dayBlock.course.code);
    console.log('Night courses:', after.data().config.nightBlock.courses.map(c => c.code).join(', '));
    console.log('Open lab:', after.data().config.openLab.time);
    console.log('\n✓ Room 214 board doc updated. CF deploy required for live render.');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
