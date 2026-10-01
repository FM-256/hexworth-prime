#!/usr/bin/env node
'use strict';
/**
 * @catalog what    Proves the classes/{id}/progress field allowlist blocks forged fields, preserves both
 *                  real writers, and DENIES a doc carrying a pre-existing stray field (the outage case)
 * @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/legacy-progress-allowlist.test.js"
 * @catalog status  TOOL
 *
 * WHY THE STRAY-FIELD CASE IS HERE AND IS THE POINT. hasOnly() constrains the RESULTING document, not
 * the delta. A production census found ONE of 69 progress documents carrying two literal dotted keys
 * (`completions.shield-cia-triad`, `completions.code-git-basics`) left by code that no longer exists.
 * Under the new rule that document's owner cannot write again until those fields are removed. The test
 * asserts that denial explicitly, so the required data cleanup is a proven precondition rather than a
 * line in a commit message someone may skip.
 *
 * Every attack also runs against the PRE-FIX rule (uid check only) and must SUCCEED there, so a pass
 * cannot come from a rule that denies everything or a path that matches nothing.
 */
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const fs = require('fs'), path = require('path');

const RULES_NOW = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const NEWRULE = `allow create, update: if request.auth != null
          && request.auth.uid == studentUid
          && request.resource.data.keys().hasOnly(['uid', 'displayName', 'completions', 'updatedAt', 'mergedFrom'])
          && request.resource.data.uid == studentUid;`;
if (!RULES_NOW.includes(NEWRULE)) {
    console.error('SETUP FAILED: the allowlist rule text was not found, so the A/B baseline cannot be built.');
    process.exit(2);
}
const RULES_PRE = RULES_NOW.replace(NEWRULE, 'allow create, update: if request.auth != null && request.auth.uid == studentUid;');
if (RULES_PRE === RULES_NOW) { console.error('SETUP FAILED: pre-fix reconstruction was a no-op.'); process.exit(2); }
if (RULES_PRE.includes('hasOnly([\'uid\', \'displayName\'')) { console.error('SETUP FAILED: allowlist survived reconstruction.'); process.exit(2); }

const CLASS = 'class-1', ME = 'student-me', OTHER = 'student-other', HANDLER = 'handler-1';
const MINE = `classes/${CLASS}/progress/${ME}`;
const STRAY = `classes/${CLASS}/progress/stray-student`;

let pass = 0, fail = 0;
async function ok(n, p) { try { await assertSucceeds(p); console.log(`  \x1b[32mPASS\x1b[0m  ${n}`); pass++; }
  catch (e) { console.log(`  \x1b[31mFAIL (expected ALLOW, got DENY)\x1b[0m  ${n} :: ${(e.message||'').slice(0,120)}`); fail++; } }
async function no(n, p) { try { await assertFails(p); console.log(`  \x1b[32mPASS\x1b[0m  ${n} [denied]`); pass++; }
  catch (e) { console.log(`  \x1b[31mFAIL (expected DENY, got ALLOW)\x1b[0m  ${n}`); fail++; } }

// exactly what AssignmentManager.submitProgress sends
const LEGIT = { uid: ME, displayName: 'A Student', completions: { 'web-osi': { completed: true, score: 90, completedAt: '2026-10-01', duration: 120 } }, updatedAt: new Date() };

async function run(label, rules, expectForged) {
  const env = await initializeTestEnvironment({ projectId: 'demo-hexworth', firestore: { rules, host: '127.0.0.1', port: 8181 } });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, `classes/${CLASS}`), { handlerUid: HANDLER });
    await setDoc(doc(db, MINE), { uid: ME, displayName: 'A Student', completions: {}, updatedAt: new Date() });
    // the real production artifact: a doc carrying literal dotted keys
    await setDoc(doc(db, STRAY), { uid: 'stray-student', displayName: 'S', completions: { x: { completed: true } },
      updatedAt: new Date(), 'completions.shield-cia-triad': { completed: true } });
  });
  const me = env.authenticatedContext(ME).firestore();
  const other = env.authenticatedContext(OTHER).firestore();
  const stray = env.authenticatedContext('stray-student').firestore();
  const t = (n) => `[${label}] ${n}`;

  // legitimate writer must work in BOTH versions — the allowlist must cost nothing real
  await ok(t('submitProgress shape is accepted'), setDoc(doc(me, MINE), LEGIT, { merge: true }));

  if (expectForged) {
    await ok(t('FORGERY: arbitrary extra field accepted'), setDoc(doc(me, MINE), { ...LEGIT, xp: 999999, role: 'admin' }, { merge: true }));
    await ok(t("FORGERY: writing someone else's uid into own row"), setDoc(doc(me, MINE), { ...LEGIT, uid: OTHER }, { merge: true }));
    await ok(t('STRAY-FIELD doc can still write'), setDoc(doc(stray, STRAY), { updatedAt: new Date(), uid: 'stray-student' }, { merge: true }));
  } else {
    await no(t('FORGERY: arbitrary extra field'), setDoc(doc(me, MINE), { ...LEGIT, xp: 999999, role: 'admin' }, { merge: true }));
    await no(t("FORGERY: writing someone else's uid into own row"), setDoc(doc(me, MINE), { ...LEGIT, uid: OTHER }, { merge: true }));
    // THE OUTAGE CASE the census exists to prove
    await no(t('STRAY-FIELD doc is BLOCKED until cleaned (census precondition)'), setDoc(doc(stray, STRAY), { updatedAt: new Date(), uid: 'stray-student' }, { merge: true }));
  }
  /* SEC-10 / BUG-272, KNOWN OPEN AND ASSERTED AS SUCH. The allowlist constrains TOP-LEVEL keys, and
     `completions` is a free-form map ON the list, so hasOnly() never inspects it. A student can
     therefore fabricate a completion and a perfect score for a REAL assignment id, and can overwrite
     an existing honest score upward. Both are asserted here with ok() rather than no(), deliberately:
     the suite was previously SILENT on the residual, so a future edit that widened the hole further —
     or a tightening attempt that closed it — would have produced no signal either way. These two
     assertions are the ones to FLIP to no() when SEC-10 is fixed. Nancy's gate finding. */
  await ok(t('SEC-10 OPEN: fabricate completed+perfect score for a REAL assignment id'),
           setDoc(doc(me, MINE), { ...LEGIT, completions: { 'aplus-core1-ch05': { completed: true, score: 100, completedAt: '2026-10-01', duration: 1 } } }, { merge: true }));
  await ok(t('SEC-10 OPEN: overwrite an existing honest score upward'),
           setDoc(doc(me, MINE), { ...LEGIT, completions: { 'web-osi': { completed: true, score: 100, completedAt: '2026-10-01', duration: 1 } } }, { merge: true }));

  // unchanged in both: nobody writes another student's row
  await no(t("another student cannot write my row"), setDoc(doc(other, MINE), LEGIT, { merge: true }));
  await env.cleanup();
}

(async () => {
  await run('PRE-FIX', RULES_PRE, true);
  await run('CURRENT', RULES_NOW, false);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
