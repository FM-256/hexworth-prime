const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

// Exact replica of validateFlag MODE 1 logic (functions/index.js lines 264-280)
function mode1(flags, flagId, submission) {
  const correctFlag = flags[flagId];
  if (!correctFlag) return { error: 'not-found' };
  const normalizedSubmission = submission.trim().toLowerCase();
  const isCorrect = normalizedSubmission === correctFlag.trim().toLowerCase();
  return { correct: isCorrect, flagId: isCorrect ? flagId : null };
}

db.doc('flag_registry/le-01-cold-horizon').get().then(d => {
  const x = d.data();
  const flags = x.flags, aliases = x.aliases || {};
  // group alt entries by canonical id
  const byCanon = {};
  for (const [k, v] of Object.entries(flags)) {
    const canon = aliases[k] || k;
    (byCanon[canon] = byCanon[canon] || []).push([k, v]);
  }
  console.log('Simulating mode-1 (flagId supplied) submission of each ALT value, using the CANONICAL flagId the page always sends:\n');
  let brokenCount = 0;
  for (const [canon, entries] of Object.entries(byCanon)) {
    if (entries.length < 2) continue; // no alternates
    for (const [altKey, altVal] of entries) {
      if (altKey === canon) continue;
      const r = mode1(flags, canon, altVal); // page sends canonical flagId, student typed the alt VALUE
      const verdict = r.correct ? 'ACCEPTED (ok)' : 'REJECTED  <-- alt answer marked WRONG';
      if (!r.correct) brokenCount++;
      console.log(`  ${canon}: student types "${altVal}" (from ${altKey})  =>  ${verdict}`);
    }
  }
  console.log('\nTotal alt-answer submissions that would be wrongly REJECTED under mode-1 with flagId:', brokenCount);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
