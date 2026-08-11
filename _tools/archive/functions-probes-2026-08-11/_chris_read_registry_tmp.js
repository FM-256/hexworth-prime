const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
db.doc('flag_registry/le-01-cold-horizon').get().then(d => {
  const x = d.data();
  console.log('flags:', Object.keys(x.flags).length);
  for (const [k,v] of Object.entries(x.flags)) console.log(' ', k, '=>', v);
  console.log('aliases:', JSON.stringify(x.aliases));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
