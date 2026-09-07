#!/usr/bin/env node
/**
 * finalize.test.js — EXECUTES the tournament finalization transaction
 *
 * @catalog what    Runs functions/ctf-finalize.js against the FIRESTORE emulator through the four
 * @catalog what    cases that matter: fresh finalize, idempotent retry, backfill of an already-
 * @catalog what    ended tournament, and a versioned correction. Proves behaviour, not shape.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/finalize.test.js"
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * A quality gate BLOCKED this feature because the finalization function had never been executed
 * once — not in an emulator, not by a test, not by hand. The reasoning was right: idempotent-retry,
 * the guard's branch ORDER, and `transaction.get()` on a CollectionReference are exactly the
 * properties that read correctly and behave differently. This is a versioned, admin-triggered write
 * that a credential is meant to rest on. Sound-on-reading is not the bar.
 *
 * WHY THE FIRESTORE EMULATOR AND NOT THE FUNCTIONS EMULATOR
 * ---------------------------------------------------------
 * The functions emulator loads `functions/.env`. This repo has a logged incident where that fired
 * real Discord webhooks at a live channel for hours (`feedback_tests_must_not_reach_production_
 * side_effects`). So this test requires ONLY functions/ctf-finalize.js and firebase-admin pointed at
 * the Firestore emulator: `functions/index.js` is never loaded, no callable is registered, no
 * secret is read, and no webhook can fire even by accident. That isolation is the reason the
 * transaction was extracted into its own module.
 *
 * SAFETY: refuses to run unless FIRESTORE_EMULATOR_HOST is set, so it can never touch production.
 *
 * EXIT: 0 all cases pass, 1 a case failed, 2 could not run.
 */
'use strict';

const path = require('path');
const REPO = path.resolve(__dirname, '../..');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 200)}`);
}

async function main() {
    /* HARD SAFETY GATE. Without FIRESTORE_EMULATOR_HOST the admin SDK talks to PRODUCTION, and this
       test writes tournaments and deletes them. Refusing to run is the only acceptable default. */
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.error('  CRITICAL: FIRESTORE_EMULATOR_HOST is not set — refusing to run.');
        console.error('  This test WRITES. Run it under the emulator:');
        console.error('    firebase emulators:exec --only firestore "node _tools/tournament/finalize.test.js"');
        return 2;
    }

    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const { finalizeTournament } = require(path.join(REPO, 'functions/ctf-finalize.js'));

    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime-test' });
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;
    const Timestamp = admin.firestore.Timestamp;

    const TID = 'test-tournament-362';
    const tRef = db.collection('tournaments').doc(TID);

    // ── helpers ──────────────────────────────────────────────────────────────────────────────
    async function wipe() {
        for (const sub of ['teams', 'results']) {
            const s = await tRef.collection(sub).get();
            await Promise.all(s.docs.map(d => d.ref.delete()));
        }
        await tRef.delete().catch(() => {});
    }
    // Two teams TIED on score. `zulu` solved EARLIER, so the canonical rule must rank it first even
    // though 'alpha' wins alphabetically — this is the BUG-022 shape, asserted end-to-end through
    // the real transaction rather than against the ranking helper in isolation.
    async function seed(status) {
        await tRef.set({ name: 'Test Tournament', status, scoringModel: 'static' });
        await tRef.collection('teams').doc('alpha').set({
            name: 'Alpha', color: '#ff0000', score: 300, solves: ['c1', 'c2'],
            members: ['uid-a1'], memberNames: ['Ann'],
            lastSolveTime: Timestamp.fromDate(new Date('2026-10-01T10:09:00Z'))
        });
        await tRef.collection('teams').doc('zulu').set({
            name: 'Zulu', color: '#00ff00', score: 300, solves: ['c1', 'c2'],
            members: ['uid-z1', 'uid-z2'], memberNames: ['Zed', 'Zoe'],
            lastSolveTime: Timestamp.fromDate(new Date('2026-10-01T10:01:00Z'))
        });
        await tRef.collection('teams').doc('bravo').set({
            name: 'Bravo', color: '#0000ff', score: 100, solves: ['c1'],
            members: ['uid-b1'], memberNames: ['Bob'], lastSolveTime: null
        });
    }

    try {
        // ── CASE 1: fresh finalize from 'active' ─────────────────────────────────────────────
        await wipe(); await seed('active');
        const r1 = await finalizeTournament({ db, FieldValue, tournamentId: TID, actorUid: 'admin-1' });

        chk('C1 fresh finalize succeeds', r1.ok === true, JSON.stringify(r1));
        chk('C1 version is 1', r1.version === 1, r1.version);
        chk('C1 provenance is live', r1.provenance === 'live', r1.provenance);
        chk('C1 not flagged alreadyFinalized', r1.alreadyFinalized === false, r1.alreadyFinalized);
        chk('C1 canonical tie-break applied (Zulu first: equal score, earlier solve)',
            r1.standings[0].teamId === 'zulu', r1.standings.map(s => s.teamId).join(','));
        chk('C1 positions are 1..n in order',
            r1.standings.every((s, i) => s.position === i + 1), JSON.stringify(r1.standings.map(s => s.position)));
        chk('C1 record carries color (consumers render it)',
            r1.standings[0].color === '#00ff00', r1.standings[0].color);
        chk('C1 record carries memberNames',
            Array.isArray(r1.standings[0].memberNames) && r1.standings[0].memberNames.length === 2,
            JSON.stringify(r1.standings[0].memberNames));
        chk('C1 record carries member uids (attribution bridge)',
            r1.standings[0].members.join(',') === 'uid-z1,uid-z2', JSON.stringify(r1.standings[0].members));

        const tAfter = (await tRef.get()).data();
        chk('C1 tournament status flipped to ended', tAfter.status === 'ended', tAfter.status);
        const v1 = await tRef.collection('results').doc('v1').get();
        chk('C1 immutable v1 copy written', v1.exists, 'no results/v1');
        const fin1 = await tRef.collection('results').doc('final').get();
        chk('C1 final pointer written', fin1.exists && fin1.data().version === 1,
            fin1.exists ? fin1.data().version : 'missing');

        // ── CASE 2: idempotent retry — THE ORDERING BUG THIS WAS BLOCKED ON ──────────────────
        // Status is now 'ended'. If the status guard ran before the existence check, this throws
        // failed-precondition instead of returning the record.
        const r2 = await finalizeTournament({ db, FieldValue, tournamentId: TID, actorUid: 'admin-1' });
        chk('C2 retry SUCCEEDS (does not throw failed-precondition)', r2.ok === true, JSON.stringify(r2));
        chk('C2 retry reports alreadyFinalized', r2.alreadyFinalized === true, r2.alreadyFinalized);
        chk('C2 retry did NOT bump the version', r2.version === 1, r2.version);
        const afterRetry = await tRef.collection('results').get();
        chk('C2 retry created no extra version docs', afterRetry.size === 2,
            afterRetry.docs.map(d => d.id).join(','));   // final + v1

        // ── CASE 3: correction (re-finalize WITH a reason) ───────────────────────────────────
        await tRef.collection('teams').doc('zulu').update({ score: 0 });   // simulate a DQ
        const r3 = await finalizeTournament({
            db, FieldValue, tournamentId: TID, reason: 'Zulu disqualified: flag sharing', actorUid: 'admin-1'
        });
        chk('C3 correction succeeds with a reason', r3.ok === true, JSON.stringify(r3));
        chk('C3 version incremented to 2', r3.version === 2, r3.version);
        chk('C3 provenance is correction', r3.provenance === 'correction', r3.provenance);
        chk('C3 new standings reflect the DQ (Alpha now first)',
            r3.standings[0].teamId === 'alpha', r3.standings.map(s => s.teamId).join(','));
        const v1Still = await tRef.collection('results').doc('v1').get();
        chk('C3 HISTORY PRESERVED — v1 still intact and unchanged',
            v1Still.exists && v1Still.data().standings[0].teamId === 'zulu',
            v1Still.exists ? v1Still.data().standings[0].teamId : 'v1 GONE');
        const finNow = await tRef.collection('results').doc('final').get();
        chk('C3 final pointer advanced to v2', finNow.data().version === 2, finNow.data().version);
        chk('C3 reason recorded on the record',
            /disqualified/i.test(finNow.data().reason || ''), finNow.data().reason);

        // ── CASE 4: backfill of a tournament that ended before this existed ──────────────────
        await wipe(); await seed('ended');           // ended, and NO results/final
        const r4 = await finalizeTournament({ db, FieldValue, tournamentId: TID, actorUid: 'admin-1' });
        chk('C4 backfill of an already-ended tournament succeeds', r4.ok === true, JSON.stringify(r4));
        chk('C4 provenance is backfill, NOT live (weaker evidence, labelled)',
            r4.provenance === 'backfill', r4.provenance);
        chk('C4 version starts at 1', r4.version === 1, r4.version);

        // ── CASE 5: refusals ─────────────────────────────────────────────────────────────────
        await wipe(); await seed('draft');
        let threw = null;
        try { await finalizeTournament({ db, FieldValue, tournamentId: TID }); }
        catch (e) { threw = e; }
        chk('C5 refuses to finalize a draft tournament',
            threw && threw.code === 'failed-precondition', threw ? threw.code : 'did not throw');

        threw = null;
        try { await finalizeTournament({ db, FieldValue, tournamentId: 'does-not-exist' }); }
        catch (e) { threw = e; }
        chk('C5 refuses a missing tournament',
            threw && threw.code === 'not-found', threw ? threw.code : 'did not throw');

        threw = null;
        try { await finalizeTournament({ db, FieldValue, tournamentId: '' }); }
        catch (e) { threw = e; }
        chk('C5 refuses an empty tournamentId',
            threw && threw.code === 'invalid-argument', threw ? threw.code : 'did not throw');

        await wipe();
    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        return 2;
    }

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  finalize.test could not run:', e && e.message);
    process.exit(2);
});
