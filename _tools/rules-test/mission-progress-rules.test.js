/*
 * @catalog what    Proves users/{uid}/mission_progress is READ-ONLY to clients (#306).
 * @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/mission-progress-rules.test.js"
 * @catalog status  GATE
 *
 * WHY THIS IS THE LOAD-BEARING TEST FOR #306.
 *
 * The reveal gate is evaluated server-side against users/{uid}/mission_progress, which
 * recordMissionFinding writes only after verifying each claim against the server's own copy of
 * the mission provenance. All of that careful verification is worth exactly nothing if a client
 * can write the document itself: it would post {findings: {...: true}} and every gate opens.
 * The rule is the control; the verification is only the thing the rule makes unavoidable.
 *
 * So this proves the negative. A signed-in owner may READ their ledger and may not create,
 * update, merge into, or delete it. Neither may anyone else. Mallory proved the original #306
 * by submitting a flag on frame one; this proves the fix cannot be walked around the same way.
 */
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, deleteDoc, getDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const BOX = 'le-01-cold-horizon';
const DOC = `${BOX}_m6-dead-air`;

let pass = 0, fail = 0;
async function ok(name, p) { try { await assertSucceeds(p); console.log('  PASS  ' + name); pass++; }
                             catch (e) { console.log('  FAIL  ' + name + '  -> ' + e.message.slice(0, 90)); fail++; } }
async function no(name, p) { try { await assertFails(p); console.log('  PASS  ' + name); pass++; }
                             catch (e) { console.log('  FAIL  ' + name + '  -> ' + e.message.slice(0, 90)); fail++; } }

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 }
  });
  await env.clearFirestore();

  const uid = 'student-alice', other = 'student-bob';
  const alice = env.authenticatedContext(uid).firestore();
  const bob = env.authenticatedContext(other).firestore();
  const anon = env.unauthenticatedContext().firestore();

  // Seed a ledger the way the Cloud Function would: with admin privileges, bypassing rules.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${uid}/mission_progress/${DOC}`), {
      boxId: BOX, flagId: 'm6-dead-air',
      findings: { 'three-channels-one-front-end': true },
      corroborators: { 'ch-rf-topology': true }
    });
  });

  console.log('\n--- mission_progress: the owner may look, nobody may write ---\n');

  await ok('the owner can READ their own evidence ledger',
    getDoc(doc(alice, `users/${uid}/mission_progress/${DOC}`)));

  /* THE ATTACK #306 EXISTS TO STOP. Forge the ledger, then any flag you hold from any
     out-of-band source is creditable without doing a single piece of evidence work. */
  await no('the owner CANNOT forge a findings map',
    setDoc(doc(alice, `users/${uid}/mission_progress/${DOC}`),
           { findings: { 'three-channels-one-front-end': true,
                         'emergency-beacon-separate-chain': true },
             corroborators: { 'ch-rf-topology': true } }));

  await no('the owner CANNOT merge a single finding in',
    updateDoc(doc(alice, `users/${uid}/mission_progress/${DOC}`),
              { 'findings.emergency-beacon-separate-chain': true }));

  await no('the owner CANNOT nominate their own corroborator',
    updateDoc(doc(alice, `users/${uid}/mission_progress/${DOC}`),
              { 'corroborators.ch-status': true }));

  await no('the owner CANNOT create a ledger for a mission they never opened',
    setDoc(doc(alice, `users/${uid}/mission_progress/${BOX}_m2-ghost-session`),
           { findings: { 'token-and-audit-share-issuer': true } }));

  /* Deleting is its own attack: a ledger recording a WRONG earlier answer could otherwise be
     wiped to escape a penalty, and a gate that can be reset is not a record. */
  await no('the owner CANNOT delete their ledger',
    deleteDoc(doc(alice, `users/${uid}/mission_progress/${DOC}`)));

  await no('another student cannot read someone else\'s ledger',
    getDoc(doc(bob, `users/${uid}/mission_progress/${DOC}`)));

  await no('another student cannot write someone else\'s ledger',
    setDoc(doc(bob, `users/${uid}/mission_progress/${DOC}`), { findings: { x: true } }));

  await no('an anonymous caller cannot read it',
    getDoc(doc(anon, `users/${uid}/mission_progress/${DOC}`)));

  await no('an anonymous caller cannot write it',
    setDoc(doc(anon, `users/${uid}/mission_progress/${DOC}`), { findings: { x: true } }));

  /* The Cloud Function path must still work, or the gate is unsatisfiable rather than secure.
     A control that also blocks the legitimate writer is an outage, not a fix. */
  await ok('the admin SDK (recordMissionFinding) CAN still write',
    env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), `users/${uid}/mission_progress/${DOC}`),
             { findings: { 'emergency-beacon-separate-chain': true } }, { merge: true })));

  console.log(`\n${pass}/${pass + fail} checks passed`);
  await env.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
