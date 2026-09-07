#!/usr/bin/env node
/**
 * results-rules.test.js — the tournament results-of-record rules, executed
 *
 * @catalog what    Runs firestore.rules against the emulator and proves a client cannot land a
 * @catalog what    tournament in 'ended' by ANY verb, and cannot write the certified record —
 * @catalog what    while legitimate admin transitions still work.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/results-rules.test.js"
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * The whole trustworthiness of a placement rests on two clauses in `firestore.rules`, and BOTH were
 * written in response to a bypass an adversarial review demonstrated rather than theorised:
 *
 * 1. The first version of the fix routed the console's "End Tournament" button through the
 *    ctfEndTournament callable and stopped there. That left the guarantee resting on a single `if`
 *    in a page: a plain `updateDoc({status:'ended'})` from any admin session skipped the callable,
 *    wrote no record, and every consumer fell back to the live re-sort of the admin-writable
 *    `teams` collection — the exact defect the feature exists to remove. So `update` was fenced.
 *
 * 2. FENCING `update` ALONE WAS STILL A COMPLETE BYPASS. Firestore classifies a write as create or
 *    update purely on whether the document exists at that instant, so `deleteDoc(tRef)` followed by
 *    `setDoc(tRef, {status:'ended'})` reaches the identical end state with the update guard never
 *    running. `deleteTournament` is already a one-click console button, and Firestore does not
 *    cascade-delete subcollections (this project has NO onDocumentDeleted trigger), so `teams`
 *    survives fully intact — the recreated tournament reads `ended`, has no record, and the boards
 *    re-sort live data on a tournament real students played.
 *
 * A rule that is reasoned about but never executed is how both of those survived a review. This
 * file executes them.
 *
 * SAFETY: talks only to the emulator via @firebase/rules-unit-testing, which requires an emulator
 * host and never reaches production.
 *
 * EXIT: 0 all assertions hold, 1 a rule is wrong, 2 could not run.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '../..');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 160)}`);
};

// The admin identity the rules recognise. `isAdmin()` accepts the custom claim.
const ADMIN = { admin: true, email: 'admin@example.com' };

async function main() {
    let rut;
    try { rut = require(path.join(REPO, 'node_modules/@firebase/rules-unit-testing')); }
    catch (e) { console.error('  could not load @firebase/rules-unit-testing:', e.message); return 2; }

    const host = process.env.FIRESTORE_EMULATOR_HOST || '';
    if (!host) {
        console.error('  CRITICAL: FIRESTORE_EMULATOR_HOST is not set — refusing to run.');
        return 2;
    }
    const [h, p] = host.split(':');

    const env = await rut.initializeTestEnvironment({
        projectId: 'hexworth-rules-test',
        firestore: { rules: fs.readFileSync(path.join(REPO, 'firestore.rules'), 'utf8'),
                     host: h, port: Number(p) }
    });

    try {
        const admin = env.authenticatedContext('admin-uid', ADMIN).firestore();
        const student = env.authenticatedContext('student-uid', { email: 's@example.com' }).firestore();
        const { doc, setDoc, updateDoc, deleteDoc, getDoc } = require(path.join(REPO, 'node_modules/firebase/firestore'));

        const TID = 'rules-probe-tournament';
        const tPath = (db) => doc(db, 'tournaments', TID);

        // Seed past the rules, so the starting state is not itself under test.
        await env.withSecurityRulesDisabled(async (ctx) => {
            const d = ctx.firestore();
            await setDoc(doc(d, 'tournaments', TID), { name: 'Probe', status: 'active' });
            await setDoc(doc(d, 'tournaments', TID, 'teams', 'red'), { name: 'Red', score: 10 });
        });

        // ── legitimate transitions must still work ────────────────────────────────────────
        await rut.assertSucceeds(updateDoc(tPath(admin), { status: 'frozen' }))
            .then(() => chk('admin CAN transition active -> frozen', true))
            .catch(e => chk('admin CAN transition active -> frozen', false, e.message));

        await rut.assertSucceeds(updateDoc(tPath(admin), { status: 'active' }))
            .then(() => chk('admin CAN transition frozen -> active', true))
            .catch(e => chk('admin CAN transition frozen -> active', false, e.message));

        await rut.assertSucceeds(updateDoc(tPath(admin), { name: 'Renamed Probe' }))
            .then(() => chk('admin CAN edit a non-status field', true))
            .catch(e => chk('admin CAN edit a non-status field', false, e.message));

        // ── THE FENCE: no client may land 'ended', by ANY verb ────────────────────────────
        await rut.assertFails(updateDoc(tPath(admin), { status: 'ended' }))
            .then(() => chk('admin CANNOT update status -> ended (must use ctfEndTournament)', true))
            .catch(e => chk('admin CANNOT update status -> ended (must use ctfEndTournament)', false, e.message));

        /* THE DELETE+CREATE BYPASS. Deleting is legal; RECREATING as `ended` must not be. Without
           the create fence this pair reaches `ended` with no record while `teams` survives intact,
           and the boards silently return to live re-sorting. */
        await rut.assertSucceeds(deleteDoc(tPath(admin)))
            .then(() => chk('admin CAN delete a tournament (unchanged, legitimate)', true))
            .catch(e => chk('admin CAN delete a tournament (unchanged, legitimate)', false, e.message));

        await rut.assertFails(setDoc(tPath(admin), { name: 'Probe', status: 'ended' }))
            .then(() => chk('admin CANNOT recreate a tournament already ended (delete+create bypass)', true))
            .catch(e => chk('admin CANNOT recreate a tournament already ended (delete+create bypass)', false, e.message));

        await rut.assertSucceeds(setDoc(tPath(admin), { name: 'Probe', status: 'draft' }))
            .then(() => chk('admin CAN create a normal (non-ended) tournament', true))
            .catch(e => chk('admin CAN create a normal (non-ended) tournament', false, e.message));

        // The orphaned teams the bypass would have exploited: confirm they really do survive a
        // parent delete, which is WHY the create fence is necessary rather than merely tidy.
        await env.withSecurityRulesDisabled(async (ctx) => {
            const s = await getDoc(doc(ctx.firestore(), 'tournaments', TID, 'teams', 'red'));
            chk('subcollection SURVIVES a parent delete (no cascade) — why the create fence matters',
                s.exists(), 'teams/red vanished; the premise of the bypass would not hold');
        });

        // ── the record itself is unwritable by any client ─────────────────────────────────
        const rPath = (db) => doc(db, 'tournaments', TID, 'results', 'final');
        await rut.assertFails(setDoc(rPath(admin), { version: 99, standings: [] }))
            .then(() => chk('admin CANNOT write results/final', true))
            .catch(e => chk('admin CANNOT write results/final', false, e.message));

        await rut.assertFails(setDoc(rPath(student), { version: 99, standings: [] }))
            .then(() => chk('student CANNOT write results/final', true))
            .catch(e => chk('student CANNOT write results/final', false, e.message));

        await env.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'tournaments', TID, 'results', 'final'),
                         { version: 1, standings: [] });
        });
        const unauth = env.unauthenticatedContext().firestore();
        await rut.assertSucceeds(getDoc(doc(unauth, 'tournaments', TID, 'results', 'final')))
            .then(() => chk('UNAUTHENTICATED read of results/final succeeds (public verification)', true))
            .catch(e => chk('UNAUTHENTICATED read of results/final succeeds (public verification)', false, e.message));

        // ── a non-admin must not touch status at all ──────────────────────────────────────
        await rut.assertFails(updateDoc(tPath(student), { status: 'frozen' }))
            .then(() => chk('student CANNOT change tournament status', true))
            .catch(e => chk('student CANNOT change tournament status', false, e.message));

    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        await env.cleanup();
        return 2;
    }
    await env.cleanup();

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  results-rules.test could not run:', e && e.message);
    process.exit(2);
});
