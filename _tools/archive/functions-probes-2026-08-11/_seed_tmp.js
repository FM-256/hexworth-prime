/* Seed flag_registry/le-01-cold-horizon for missions 2-15.
   merge:true — mission 1's entries are NOT touched. Values are DERIVED from the
   fixtures, and alternates alias to one canonical id exactly as m1 does. */
const admin = require('firebase-admin');
const D = require('/home/eq/ai-content/hexworth-prime/_tools/qa/cold-horizon/derive-flag-values.js');
const C = require('/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/config-shared.js');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const flags = {}, aliases = {};
for (const [n, vals] of Object.entries(D)) {
  const m = C.missions.find(x => x.id === Number(n));
  if (!m) throw new Error('no mission ' + n);
  vals.forEach((v, i) => {
    const id = i === 0 ? m.flagId : `${m.flagId}-alt${i}`;
    flags[id] = v;
    if (i > 0) aliases[id] = m.flagId;      // alternates resolve to ONE capture
  });
}
console.log('seeding', Object.keys(flags).length, 'entries across',
            Object.keys(D).length, 'missions;', Object.keys(aliases).length, 'aliases');

db.doc('flag_registry/le-01-cold-horizon').set({
  flags, aliases,
  note: 'm1 seeded 2026-08-05 (MVP-0). m2-m15 seeded 2026-08-09: values DERIVED from '
      + 'missions-held.js so an answer cannot drift from the evidence a player sees. '
      + 'Answer convention = the shared dependency the trap pair has in common; '
      + 'alternates alias to one canonical capture, as m1 does.',
  seededAt: admin.firestore.FieldValue.serverTimestamp(),
}, { merge: true }).then(async () => {
  const d = await db.doc('flag_registry/le-01-cold-horizon').get();
  const x = d.data();
  const ids = Object.keys(x.flags);
  console.log('READ BACK:', ids.length, 'flag entries');
  console.log('  m1 preserved:', ['m1-independence','m1-alt-path','m1-alt-ca'].every(k => k in x.flags));
  const canon = new Set(Object.values(x.aliases || {}));
  console.log('  canonical ids yielded:',
    ids.filter(i => !(i in (x.aliases||{}))).length, '(should equal mission count)');
  process.exit(0);
}).catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });
