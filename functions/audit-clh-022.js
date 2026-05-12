const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
(async () => {
  const usersSnap = await db.collection('users').get();
  let attempts = 0;
  let usersAffected = 0;
  for (const u of usersSnap.docs) {
    const data = u.data();
    const qs = (data.quizzes && typeof data.quizzes === 'object') ? data.quizzes : {};
    if (qs['clh-022'] || qs['script-clh-022']) {
      usersAffected++;
      attempts++;
      console.log(`uid=${u.id} callsign=${data.callsign || '?'} clh-022=${JSON.stringify(qs['clh-022'] || qs['script-clh-022'])}`);
    }
    // also check by collection-group scan equivalent
    const sub = await db.collection(`users/${u.id}/quiz_attempts`).where('quizId', 'in', ['clh-022', 'script-clh-022']).get().catch(() => ({ size: 0, forEach: () => {} }));
    sub.forEach(d => {
      attempts++;
      const r = d.data();
      console.log(`  attempt: uid=${u.id} score=${r.score}/${r.total} pct=${r.percentage} passed=${r.passed}`);
    });
  }
  console.log(`\nTotal users w/ clh-022 record: ${usersAffected}`);
  console.log(`Total attempt records:        ${attempts}`);
})().catch(e => { console.error(e); process.exit(2); });
