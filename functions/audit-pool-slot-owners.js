// REPORT-ONLY. Classifies every OpenStack pool slot by whether its bound Firebase uid still
// exists, so a cleanup decision can be made on a fact rather than a guess.
//
// WHY THIS EXISTS: the pool is 30 slots and 27 are bound. Deciding which to reclaim by RESOURCE
// NAME is unsafe — the labs instruct students to create servers named exactly what the QC
// harnesses create (chain-vm, guard-vm, lab5-vm, proj-vm), so a name match proves nothing.
//
// The safe discriminator: a slot bound to a uid that NO LONGER EXISTS in Firebase Auth cannot
// belong to a live student. Account existence is checkable; intent is not.
//
// Deliberately has NO --apply. It deletes nothing and releases nothing. Reclaiming touches
// shared cloud state and is an operator decision; this only produces the evidence for it.
//
// usage:
//   node audit-pool-slot-owners.js <uids.json>
// where uids.json is [{slot:'student-01', uid:'...'}, ...] produced on bc2, e.g.:
//   ssh bc2 'cd ~/openstack-stage1 && python3 dump-slot-uids.py' > uids.json
const admin = require('firebase-admin');
const fs = require('fs');

const IN = process.argv[2];
if (!IN) { console.error('usage: node audit-pool-slot-owners.js <uids.json>'); process.exit(2); }

(async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
  const auth = admin.auth();
  const rows = JSON.parse(fs.readFileSync(IN, 'utf8'));

  const live = [], dead = [], unbound = [];
  for (const r of rows) {
    if (!r.uid) { unbound.push(r); continue; }
    try {
      const u = await auth.getUser(r.uid);
      live.push({ ...r, email: u.email || '(no email)', lastSignIn: (u.metadata || {}).lastSignInTime || null });
    } catch (e) {
      // auth/user-not-found is the signal we want; anything else is an error we must not
      // silently treat as "dead", or we would recommend reclaiming a live student's slot.
      if (e.code === 'auth/user-not-found') dead.push(r);
      else { console.error(`  ERROR checking ${r.slot} (${r.uid}): ${e.code || e.message} — treating as LIVE`); live.push({ ...r, email: '(lookup failed)' }); }
    }
  }

  console.log(`slots total      : ${rows.length}`);
  console.log(`unbound          : ${unbound.length}`);
  console.log(`bound, uid LIVE  : ${live.length}`);
  console.log(`bound, uid DEAD  : ${dead.length}   <- reclaimable on the account-existence rule`);
  console.log('');
  if (live.length) {
    console.log('LIVE owners (do NOT reclaim):');
    for (const r of live) console.log(`   ${r.slot}  ${r.email}  lastSignIn=${r.lastSignIn || 'n/a'}`);
    console.log('');
  }
  if (dead.length) {
    console.log('DEAD-uid slots (evidence for reclaim, NOT reclaimed here):');
    for (const r of dead) console.log(`   ${r.slot}  uid=${r.uid}`);
  }
  console.log('\nREPORT ONLY — nothing was released. Reclaiming is an operator decision.');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
