#!/usr/bin/env node
/**
 * derive-flag-values.js — compute each mission's accepted answers from its OWN fixtures.
 *
 * @catalog what    Derives le-01-cold-horizon flag values from missions-held.js so a seeded
 *                  answer can never drift from the evidence a player actually sees.
 * @catalog run     node _tools/qa/cold-horizon/derive-flag-values.js
 * @catalog status  TOOL
 *
 * THE CONVENTION, read off mission 1's live registry rather than invented: the accepted
 * answer IS the shared dependency the player discovered. m1 accepts PLAT-CLK-A,
 * bus-a/thermal/aggregator-1 or astraea-telemetry-ca -- any of the three axes TH-1 and TH-3
 * have in common -- with the alternates aliased to one canonical capture id.
 *
 * So these are DERIVED, never hand-written. A hand-written answer is one edit away from
 * disagreeing with the fixture it is supposed to describe, and the player would be told they
 * were wrong for reading the evidence correctly.
 *
 * The trap pair per mission is declared here because it is a pedagogical choice, not
 * something the data states: it is the pair whose agreement is meant to look like
 * corroboration and is not.
 */
'use strict';
const path = require('path');
const M = require(path.resolve(__dirname, '../../../_app/arena/boxes/le-01-cold-horizon/missions-held.js'));

// The pair whose shared dependency IS the finding, per mission.
const TRAP = {
  2:['sess-token','sso-audit'], 3:['plat-log','moc-log'],    4:['cmd-sig','cmd-cert'],
  5:['gs-cm','gs-approval'],    6:['ch-primary','ch-backup'], 7:['kvm-hostlog','kvm-audit'],
  8:['sm-table','sm-config'],   9:['img-tag','img-attest'],   10:['rep-a','rep-b'],
  11:['eid-conf','eid-selfcheck'], 12:['cap-telemetry','load-forecast'],
  14:['r-narrative','r-session'],  15:['ep-a','ep-b'],
};

/* Mission 13 is a SEQUENCING mission and has no shared-dependency answer, because its
   question is an order rather than a source. Its accepted answers are the two ordering
   principles the constraints encode -- taken from the mission's own revealGate necessaries
   so they cannot drift either. */
const SEQ_ANSWERS = { 13: ['evidence before eradication', 'revoke before restore'] };

function forMission(n) {
  const m = M[n];
  if (!m) return null;
  if (SEQ_ANSWERS[n]) return SEQ_ANSWERS[n];
  const [a, b] = TRAP[n] || [];
  const all = (m.sensors || []).concat(m.corroborators || []);
  const A = all.find(x => x.id === a), B = all.find(x => x.id === b);
  if (!A || !B) throw new Error(`mission ${n}: trap pair ${a}/${b} not found in fixtures`);
  const shared = (m.axes || []).filter(ax => A[ax] !== undefined && A[ax] === B[ax]);
  if (!shared.length) throw new Error(`mission ${n}: trap pair shares NOTHING — it is not a trap`);
  // Every shared axis value is an acceptable answer, exactly as m1 accepts all three of its.
  return shared.map(ax => String(A[ax]));
}

const out = {};
for (const n of Object.keys(M).map(Number).sort((x, y) => x - y)) {
  out[n] = forMission(n);
}

if (require.main === module) {
  for (const [n, vals] of Object.entries(out)) {
    console.log(`  m${n}: ${vals.length} accepted -> ${vals.join('  |  ')}`);
  }
}
module.exports = out;
