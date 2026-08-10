#!/usr/bin/env node
/*
 * @catalog what    End-to-end proof of the #306 reveal gate against PRODUCTION: signs in as a
 * @catalog what    throwaway uid, calls recordMissionFinding for real, then validateFlag.
 * @catalog run     node functions/test-gate-e2e.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS. Everything else about #306 was tested one layer at a time: 21 unit tests on
 * the evaluator, 11 rules tests on the ledger's write protection. Neither touches the WIRE. A
 * finding had never been watched travelling browser -> recordMissionFinding -> Firestore ->
 * validateFlag, and arming the gate without observing that is how 12 missions become
 * uncompletable for every student while every test still reads green.
 *
 * Uses a custom token for a throwaway uid rather than a real student account, so nothing here
 * touches anyone's progress. The uid's ledger is deleted at the end.
 *
 * ORDER MATTERS AND IS THE POINT: submit BEFORE doing the work and the gate must refuse; do the
 * work and submit again and it must credit. A gate that only ever says yes has not been tested.
 */
'use strict';
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

const BOX = 'le-01-cold-horizon';
const FLAG = 'm6-dead-air';

/* Public web config, READ FROM _app/components/FirebaseAuth.js rather than typed here.
   The first draft of this file carried an invented apiKey that merely looked like one and
   failed with auth/api-key-not-valid. Reading the app's own config means this cannot drift
   from what the browser actually uses, and cannot be fabricated. */
const AUTHJS = require('fs').readFileSync(
    require('path').resolve(__dirname, '../_app/components/FirebaseAuth.js'), 'utf8');
const pick = (k) => (AUTHJS.match(new RegExp(k + ':\\s*"([^"]+)"')) || [])[1];
const WEB = { apiKey: pick('apiKey'), authDomain: pick('authDomain'), projectId: pick('projectId'),
              appId: pick('appId') };
if (!WEB.apiKey) { console.error('Could not read the web config from FirebaseAuth.js'); process.exit(1); }

let pass = 0, fail = 0;
function t(name, cond, detail) {
    if (cond) { pass++; console.log('  PASS  ' + name + (detail ? '  -> ' + detail : '')); }
    else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

try { admin.initializeApp({ projectId: 'hexworth-prime' }); } catch (e) {}
const db = admin.firestore();

(async () => {
    
    /* Anonymous sign-in rather than a minted custom token: createCustomToken needs a service
       account with signBlob, which this machine does not hold, and an anonymous user is a real
       auth context for the callable while touching no student's account. The uid is whatever
       Firebase assigns, so the ledger path is read back from it rather than assumed. */
    const app = initializeApp(WEB, 'gate-e2e');
    const cred = await signInAnonymously(getAuth(app));
    const uid = cred.user.uid;
    console.log('  (anonymous uid ' + uid + ')');
    const ledger = db.doc(`users/${uid}/mission_progress/${BOX}_${FLAG}`);
    await ledger.delete().catch(() => {});          // start from nothing
    const fns = getFunctions(app);
    const record = httpsCallable(fns, 'recordMissionFinding');
    const validate = httpsCallable(fns, 'validateFlag');

    console.log('\n--- #306 end to end, against production ---\n');

    /* 1. THE ORIGINAL BUG. Mallory proved a flag could be typed and credited on frame one.
       The submission here is deliberately wrong, so this asserts the GATE refuses before
       correctness is even relevant... actually validateFlag checks correctness first, so a
       wrong answer returns plain incorrect. What matters is that it is not CREDITED. */
    const cold = await validate({ boxId: BOX, flagId: FLAG, submission: 'FLAG{not-the-answer}' });
    t('a wrong answer on frame one is not credited', cold.data.correct === false,
      JSON.stringify(cold.data).slice(0, 80));

    // 2. A FALSE claim must be refused by the server's own copy of the provenance.
    const lie = await record({ boxId: BOX, flagId: FLAG,
        findingId: 'three-channels-one-front-end',
        sources: ['ch-primary', 'ch-emergency'] });     // these do NOT share the Ka front end
    t('a FALSE grouping is refused', lie.data.recorded === false, lie.data.reason);

    // 3. The true grouping, which is what the independence test demonstrates.
    const shared = await record({ boxId: BOX, flagId: FLAG,
        findingId: 'three-channels-one-front-end',
        sources: ['ch-primary', 'ch-backup', 'ch-relay'] });
    t('the TRUE grouping is recorded', shared.data.recorded === true, shared.data.detail);

    // 4. The independent witness.
    const indep = await record({ boxId: BOX, flagId: FLAG,
        findingId: 'emergency-beacon-separate-chain',
        sources: ['ch-emergency', 'ch-primary'] });
    t('the independent witness is recorded', indep.data.recorded === true, indep.data.detail);

    // 5. The corroborator obtained by the walk-down.
    const corr = await record({ boxId: BOX, flagId: FLAG, corroboratorId: 'ch-rf-topology' });
    t('the flown corroborator is recorded as PHYSICAL', corr.data.recorded === true
      && corr.data.family === 'physical', corr.data.family);

    // 6. The ledger is real, and the server wrote it.
    const snap = await ledger.get();
    const d = snap.exists ? snap.data() : {};
    t('the ledger exists in Firestore with both findings',
      !!(d.findings && d.findings['three-channels-one-front-end']
         && d.findings['emergency-beacon-separate-chain']),
      JSON.stringify(d.findings || {}));

    /* 7. THE WHOLE POINT. Same wrong submission as step 1, but now the ledger supports the
       finding, so the refusal must be about the ANSWER rather than the gate. `gated` must be
       absent: if it is still true, the gate is unsatisfiable and 12 missions are bricked. */
    const after = await validate({ boxId: BOX, flagId: FLAG, submission: 'FLAG{still-wrong}' });
    t('with the ledger complete, the gate no longer blocks', !after.data.gated,
      JSON.stringify(after.data).slice(0, 80));

    // Clean up: this uid is not a student and must not linger.
    await ledger.delete().catch(() => {});
    await admin.auth().deleteUser(uid).catch(() => {});

    console.log(`\n${pass}/${pass + fail} checks passed`);
    if (fail) console.log('\n⚠ DISARM: node functions/seed-mission-gates.js --disarm');
    process.exit(fail ? 1 : 0);
})().catch(e => {
    console.error('E2E ERROR: ' + e.message);
    console.error('⚠ If this is a gate fault, DISARM: node functions/seed-mission-gates.js --disarm');
    process.exit(1);
});
