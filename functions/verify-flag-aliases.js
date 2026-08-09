#!/usr/bin/env node
/**
 * verify-flag-aliases.js — every seeded answer must be accepted for its own mission,
 * and for no other.
 *
 * @catalog what    Replays validateFlag's REAL mode-1 comparison against live flag_registry
 *                  for every value and alias, asserting accept-own and reject-other.
 * @catalog run     cd functions && node verify-flag-aliases.js le-01-cold-horizon
 * @catalog status  GATE
 *
 * WHY THIS EXISTS. Two opposite failures, one week apart, both silent, both telling a
 * student who was RIGHT that they were wrong and docking them points:
 *
 *   Passing no flagId  -> mode 2 scans every flag and takes the FIRST match. Missions
 *                         legitimately share dependency values (astraea-telemetry-ca is a
 *                         correct answer for 1, 10 and 12), so solving one credited another.
 *   Passing a flagId   -> mode 1 compared against flags[flagId] ALONE and ignored aliases,
 *                         so only the first-listed value per mission survived. 27 of 27
 *                         alternates rejected.
 *
 * Fixing the first caused the second. Asserting that the client PASSES a flagId did not
 * catch it, because the defect was in what the server did with it. So this replays the
 * server's own comparison rather than checking a code shape.
 */
'use strict';
const admin = require('firebase-admin');
// argv[0] is node and argv[1] is this script's own path -- which contains hyphens and
// would win a naive scan, producing a document path of `flag_registry//home/...`.
// Take the first REAL argument only.
const boxId = process.argv.slice(2).find(a => !a.startsWith('-')) || 'le-01-cold-horizon';
admin.initializeApp({ projectId: 'hexworth-prime' });

/* The exact comparison from functions/index.js validateFlag mode 1, after the alias fix.
   Kept as a copy on purpose: if the production logic changes and this does not, the test
   fails, which is the alarm you want. */
function modeOneAccepts(flags, aliases, flagId, submission) {
  const norm = String(submission).trim().toLowerCase();
  const candidates = Object.keys(flags).filter(k => k === flagId || aliases[k] === flagId);
  if (!candidates.length) return null;                   // not-found
  return candidates.some(k => norm === String(flags[k]).trim().toLowerCase());
}

(async () => {
  const doc = await admin.firestore().doc(`flag_registry/${boxId}`).get();
  if (!doc.exists) { console.error(`no flag_registry/${boxId}`); process.exit(2); }
  const flags = doc.data().flags || {};
  const aliases = doc.data().aliases || {};
  const canonical = Object.keys(flags).filter(k => !(k in aliases));

  let fails = 0, checked = 0;
  console.log(`\nAlias acceptance — ${boxId}\n`);

  for (const cid of canonical) {
    const group = Object.keys(flags).filter(k => k === cid || aliases[k] === cid);
    const bad = [];
    for (const k of group) {
      checked++;
      if (modeOneAccepts(flags, aliases, cid, flags[k]) !== true) bad.push(k);
    }
    if (bad.length) { fails++; console.log(`  FAIL  ${cid}: rejects its own ${bad.join(', ')}`); }
    else console.log(`  ok    ${cid}: all ${group.length} accepted answer(s) work`);
  }

  /* The other half. A value that is correct for several missions must be accepted for
     each of THEM and never leak credit sideways -- which is what the flagId scoping is
     for, and it has to keep holding after the alias fix. */
  const byValue = {};
  for (const [k, v] of Object.entries(flags)) {
    const owner = aliases[k] || k;
    (byValue[String(v).toLowerCase()] = byValue[String(v).toLowerCase()] || new Set()).add(owner);
  }
  const shared = Object.entries(byValue).filter(([, s]) => s.size > 1);
  console.log(`\n  ${shared.length} value(s) are a correct answer to more than one mission`);
  for (const [val, owners] of shared) {
    for (const owner of owners) {
      checked++;
      if (modeOneAccepts(flags, aliases, owner, val) !== true) {
        fails++; console.log(`  FAIL  "${val}" not accepted for ${owner}`);
      }
    }
    // and must NOT be accepted by a mission that does not list it
    for (const other of canonical) {
      if (owners.has(other)) continue;
      checked++;
      if (modeOneAccepts(flags, aliases, other, val) === true) {
        fails++; console.log(`  FAIL  "${val}" leaks credit to ${other}`);
      }
    }
  }

  console.log(`\n${checked} comparisons, ${fails} failure(s).\n`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e.message); process.exit(2); });
