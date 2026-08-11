// READ ONLY. Reads the hubRegistry collection to find the cloud-master hub definition --
// the one the repo cannot show because it is admin-created and lives in Firestore.
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
(async () => {
  const snap = await db.collection('hubRegistry').get();
  console.log(`hubRegistry docs: ${snap.size}`);
  snap.forEach(d => {
    const v = d.data();
    const isCM = d.id.includes('cloud-master') || (v.parent === 'cloud-master') || /cloud.?master/i.test(v.label || '');
    if (isCM) {
      console.log(`\n--- ${d.id} ---`);
      console.log(JSON.stringify(v, null, 2).slice(0, 1200));
    }
  });
  const ids = snap.docs.map(d => d.id);
  console.log('\nall hub ids:', ids.join(', ').slice(0, 600));
  process.exit(0);
})().catch(e => { console.error('READ FAILED:', e.message); process.exit(1); });
