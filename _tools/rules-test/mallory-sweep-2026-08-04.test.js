// Mallory sweep — firestore.rules candidates from the "verb asymmetry" + "bare auth != null" sweep.
// Run against the Firestore emulator (no production writes):
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/mallory-sweep-2026-08-04.test.js"
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', name + ' :: ' + (e && e.message || e).toString().slice(0,160)]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });

  const userA = testEnv.authenticatedContext('userA').firestore();   // attacker
  const userB = testEnv.authenticatedContext('userB').firestore();   // victim
  const anon  = testEnv.unauthenticatedContext().firestore();

  // ═══════════════════════════════════════════════════════════════
  // PRIORITY 1: edt_submissions verb asymmetry (line 335-341)
  // ═══════════════════════════════════════════════════════════════
  const seedEdt = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'edt_submissions/eth-l01_userB'), {
      labId: 'eth-l01', uid: 'userB', callsign: 'VictimAnalyst',
      frameworkResponse: 'original response text', frameworkGraded: false,
      frameworkScore: null, instructorScore: null, finalTotal: null,
      needsInstructorReview: true
    }));

  // Control check: create-scoping regex. IMPORTANT — must run against a doc that does NOT
  // already exist, because the client SDK's setDoc() on an EXISTING doc is evaluated by
  // Firestore as an `update`, not a `create` (it would otherwise silently exercise the
  // unscoped update rule instead of the scoped create rule and give a false pass/fail here).
  await testEnv.withSecurityRulesDisabled(c => deleteDoc(doc(c.firestore(), 'edt_submissions/eth-l01_freshdoc')));
  await no('userA CREATES a brand-new submission doc id-suffixed with userB\'s uid (create IS scoped to own uid, control check)',
    setDoc(doc(userA, 'edt_submissions/eth-l01_freshdoc_userB'), { labId:'eth-l01', uid:'userA' }));

  // FIXED 2026-08-04: allow update was `if request.auth != null` -> now `if false` (CF-only).
  // Flipped 2026-08-04 verify pass: expectation now DENY. See mallory-verify-fix-2026-08-04.test.js
  // for the full A/B (attack-denied + legitimate-path-preserved) matrix.
  await seedEdt();
  await no('[FIXED] userA UPDATEs userB\'s existing EDT submission directly (was: PASS/allowed, now update:false)',
    updateDoc(doc(userA, 'edt_submissions/eth-l01_userB'), {
      frameworkGraded: true, frameworkScore: 40, instructorScore: 100,
      finalTotal: 100, frameworkResponse: 'TAMPERED BY USERA', gradedBy: 'userA'
    }));

  await seedEdt();
  await no('[FIXED] userA can no longer blank/corrupt userB\'s response via update (was: PASS/allowed, now update:false)',
    updateDoc(doc(userA, 'edt_submissions/eth-l01_userB'), { frameworkResponse: 'pwned' }));

  // ═══════════════════════════════════════════════════════════════
  // PRIORITY 2: bare `if request.auth != null` writes
  // ═══════════════════════════════════════════════════════════════

  // /classes/{classId} — legacy top-level collection
  await no('anon creates a legacy class', setDoc(doc(anon, 'classes/c1'), { handlerUid:'userA', name:'x' }));
  await ok('any signed-in user creates a legacy class with arbitrary handlerUid (impersonation at create)',
    setDoc(doc(userA, 'classes/c2'), { handlerUid: 'userB', name: 'Forged Handler Class', memberUids: [], maxMembers: 30 }));

  const seedClass = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'classes/c3'), { handlerUid: 'userB', name: 'Real Class', memberUids: ['userB'], maxMembers: 30, memberCount: 1 }));
  await seedClass();
  await no('non-handler userA overwrites arbitrary fields on someone else\'s class',
    updateDoc(doc(userA, 'classes/c3'), { name: 'Hijacked' }));
  await seedClass();
  await ok('userA (non-member) can still self-add to memberUids (join) — expected/benign',
    updateDoc(doc(userA, 'classes/c3'), { memberUids: ['userB','userA'], memberCount: 2 }));

  // /classes/{classId}/assignments/{assignmentId} — handlerUid-gated per rule at line ~383
  const seedClass2 = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'classes/c4'), { handlerUid: 'userB', name: 'Class4', memberUids: ['userB'], maxMembers: 30, memberCount: 1 }));
  await seedClass2();
  await no('non-handler userA creates an assignment under someone else\'s legacy class',
    setDoc(doc(userA, 'classes/c4/assignments/a1'), { title: 'forged', points: 999999999 }));
  await seedClass2();
  await ok('actual handler (userB) creates an assignment under their own class',
    setDoc(doc(userB, 'classes/c4/assignments/a2'), { title: 'real', points: 100 }));

  // /rings/{ringId}
  await ok('any signed-in user creates a ring doc with arbitrary shape',
    setDoc(doc(userA, 'rings/r1'), { owner: 'userB-impersonated', score: 999999999, evilField: '<script>' }));
  const seedRing = () => testEnv.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'rings/r2'), { score: 10 }));
  await seedRing();
  await ok('any signed-in user updates ANY ring doc, any field, no ownership',
    updateDoc(doc(userA, 'rings/r2'), { score: 99999999, hijacked: true }));

  // /rings/{ringId}/attempts/{attemptId}
  await ok('any signed-in user creates an attempt under any ring',
    setDoc(doc(userA, 'rings/r2/attempts/at1'), { uid: 'userB-forged', correct: true }));

  // /arena_sessions/{sessionId}
  await ok('any signed-in user creates an arena session with arbitrary hostUid',
    setDoc(doc(userA, 'arena_sessions/s1'), { hostUid: 'userB', createdBy: 'userB', state: 'lobby' }));
  const seedSession = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'arena_sessions/s2'), { hostUid: 'userB', createdBy: 'userB', state: 'lobby', players: ['userB'] }));
  await seedSession();
  // FLIPPED 2026-08-29. This asserted ok() because a sweep RECORDS what is true, not what
  // should be -- it was the evidence for the finding. The finding is now fixed (update
  // requires membership), so the same call must be DENIED, and this assertion is what proves
  // the fix has not been reverted. Original wording kept so the record is not lost:
  //   ok('non-host userA updates someone else's live arena session (no ownership on update)')
  // Note this fixture keys `players` as an ARRAY while the real client writes a MAP
  // (CoOpSync.js:191). `uid in players` is correct for both -- list values and map keys -- so
  // this covers a shape production never sends; the map shape is covered in
  // arena-sessions-membership.test.js.
  await no('non-host userA updates someone else\'s live arena session [FIXED 2026-08-29]',
    updateDoc(doc(userA, 'arena_sessions/s2'), { state: 'finished', players: [] }));
  await seedSession();
  await no('non-host userA deletes someone else\'s arena session (delete IS ownership-gated)',
    deleteDoc(doc(userA, 'arena_sessions/s2')));

  // /arena_sessions/{sessionId}/activity/{activityId}
  // FLIPPED 2026-08-29, same reason as the session update above: this recorded the finding,
  // and the finding is fixed. Creating an entry now requires playerId == uid AND membership of
  // the parent session, so this write -- a non-member, with a forged `actor` and no playerId --
  // fails on both counts. Original wording:
  //   ok('any signed-in user writes an activity log entry into someone else's session')
  await no('any signed-in user writes an activity log entry into someone else\'s session [FIXED 2026-08-29]',
    setDoc(doc(userA, 'arena_sessions/s2/activity/act1'), { actor: 'userB-forged', action: 'cheat' }));

  // /classes/{classId}/activity/{eventId} — has a studentUid self-check
  const seedClass3 = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'classes/c5'), { handlerUid: 'userB', memberUids: ['userA','userB'], maxMembers: 30, memberCount: 2 }));
  await seedClass3();
  await no('userA logs activity claiming to be userB (studentUid check enforced)',
    setDoc(doc(userA, 'classes/c5/activity/ev1'), { studentUid: 'userB', event: 'forged' }));
  await seedClass3();
  await ok('userA logs activity as themself (expected/benign)',
    setDoc(doc(userA, 'classes/c5/activity/ev2'), { studentUid: 'userA', event: 'real' }));

  // /hed_reports/{reportId}
  await ok('any signed-in user creates a hed_report with arbitrary/unbounded fields',
    setDoc(doc(userA, 'hed_reports/h1'), { reporterUid: 'userB-forged', payload: 'x'.repeat(50000), evil: '<img onerror=alert(1)>' }));
  await no('non-admin cannot read hed_reports', getDoc(doc(userA, 'hed_reports/h1')));

  // ═══════════════════════════════════════════════════════════════
  // PRIORITY 3 (found during sweep): handler_messages over-broad READ
  // Read is `if request.auth != null` with no participant check — the client comment
  // ("queries filter by recipientUid or classId") is a CLIENT convention, not a rule.
  // ═══════════════════════════════════════════════════════════════
  // FIXED 2026-08-04: allow read/update were bare `if request.auth != null` -> now
  // participant-scoped (sender/recipient/class handler/class member). Flipped 2026-08-04
  // verify pass: expectation now DENY. See mallory-verify-fix-2026-08-04.test.js for the
  // full A/B matrix, INCLUDING a confirmed regression the fix introduced: class-wide
  // messages (recipientUid stored as null, not absent) are now unreadable/unmarkable via
  // direct doc-id get()/update() for legitimate class members — markAsRead() in
  // ActivityFeed.js:612 hits exactly this path in production.
  const seedHM = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'handler_messages/hm1'), {
      classId: 'c9', senderUid: 'handlerX', recipientType: 'individual',
      recipientUid: 'userB', text: 'Private 1:1 feedback for userB only', readBy: []
    }));
  await seedHM();
  await no('[FIXED] userA (uninvolved third party — not sender, not recipient, not handler) reads a private 1:1 handler-to-student message (was: PASS/allowed)',
    getDoc(doc(userA, 'handler_messages/hm1')));
  await no('[FIXED] userA (uninvolved third party) lists the ENTIRE handler_messages collection unfiltered (was: PASS/allowed)',
    getDocs(collection(userA, 'handler_messages')));
  await seedHM();
  await no('[FIXED] userA (uninvolved third party) marks someone else\'s private message as read (was: PASS/allowed, no ownership check on update)',
    updateDoc(doc(userA, 'handler_messages/hm1'), { readBy: ['userA'] }));

  // Priority 3 (found during sweep): arena_ratings aggregate — schema-typed but not ownership-
  // or relationship-checked. Any signed-in user can overwrite the WHOLE public aggregate.
  const seedAgg = () => testEnv.withSecurityRulesDisabled(c =>
    setDoc(doc(c.firestore(), 'arena_ratings/box1'), { totalScore: 40, count: 10, avg: 4.0, updated: null }));
  await seedAgg();
  await ok('any signed-in user overwrites the PUBLIC rating aggregate for a box with self-serving numbers (no transaction/relationship enforced, despite the comment claiming so)',
    setDoc(doc(userA, 'arena_ratings/box1'), { totalScore: 999999, count: 1, avg: 5.0, updated: null }));

  console.log('\n=== Mallory sweep: edt_submissions / classes / rings / arena_sessions / hed_reports ===');
  out.forEach(r => console.log('  ' + r[0].padEnd(46) + r[1]));
  console.log(`\n${pass} passed, ${fail} failed`);
  await testEnv.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST HARNESS ERROR:', e); process.exit(2); });
