#!/usr/bin/env node
/**
 * badges.test.js: EXECUTES the tournament badge award logic
 *
 * @catalog what    Runs functions/ctf-badges.js against the FIRESTORE emulator: participation on
 * @catalog what    join, placements from the certified record, and the case that drove the whole
 * @catalog what    design, a corrected result must REVOKE a champion without touching a champion
 * @catalog what    legitimately earned at a different tournament.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/badges.test.js"
 * @catalog status  TOOL
 *
 * WHY THE REVOCATION CASES ARE THE POINT
 * --------------------------------------
 * An adversarial review BLOCKED the first design of this feature. It proposed revoking by removing
 * the badge id from `users/{uid}.achievements`, and that array is union-merged on every sync and
 * never subtracted (GUARD-04, written after BUG-266 deleted earned work). A removed id would be
 * re-uploaded from any stale device's localStorage and unioned straight back, so the revocation
 * would silently reverse itself with no error and no distinguishing log line.
 *
 * The fix is structural. Revocable badges live ONLY in `server_awards`, which no client ever merges.
 * These tests assert both halves of that: that a revocation sticks, and that participation (which
 * is never revoked, so the union is harmless) is the only kind that reaches `achievements`.
 *
 * The cross-tournament case is the one that would cost a student something real: winning tournament
 * A and being corrected out of tournament B must not strip the A trophy.
 *
 * SAFETY: refuses to run unless FIRESTORE_EMULATOR_HOST is set. It writes.
 *
 * EXIT: 0 pass, 1 an assertion failed, 2 could not run.
 */
'use strict';
const path = require('path');
const REPO = path.resolve(__dirname, '../..');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 200)}`);
};

async function main() {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.error('  CRITICAL: FIRESTORE_EMULATOR_HOST is not set, refusing to run (this writes).');
        return 2;
    }
    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const B = require(path.join(REPO, 'functions/ctf-badges.js'));
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-badges-test' });
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;

    const A = 'tourn-A', C = 'tourn-C';
    const uidZ = 'uid-zulu-1', uidA = 'uid-alpha-1';
    const award = (uid, badge) => db.doc(`users/${uid}/server_awards/${badge}`).get();
    const userDoc = (uid) => db.doc(`users/${uid}`).get();

    const wipe = async () => {
        for (const uid of [uidZ, uidA]) {
            const s = await db.collection(`users/${uid}/server_awards`).get();
            await Promise.all(s.docs.map(d => d.ref.delete()));
            await db.doc(`users/${uid}`).delete().catch(() => {});
        }
    };
    // A record shaped exactly like ctf-finalize.js writes one.
    const record = (version, provenance, order, reason) => ({
        version, provenance, reason: reason || null, tournamentName: 'Test Cup',
        standings: order.map((t, i) => ({
            position: i + 1, teamId: t.id, name: t.name, color: '#fff',
            score: t.score, solves: [], members: t.members, memberNames: [], lastSolveTime: null,
        })),
    });
    const ZULU  = { id: 'zulu',  name: 'Zulu Cell',   score: 300, members: [uidZ] };
    const ALPHA = { id: 'alpha', name: 'Alpha Squad', score: 300, members: [uidA] };

    try {
        await wipe();

        // ── PARTICIPATION, awarded on join ───────────────────────────────────────────────
        const okJoin = await B.awardParticipation({
            db, FieldValue, uid: uidZ, tournamentId: A, tournamentName: 'Test Cup',
            teamId: 'zulu', verifiedJoin: true });
        chk('participation award returns true', okJoin === true, okJoin);
        const comp = await award(uidZ, B.BADGE.COMPETITOR);
        chk('participation written to server_awards', comp.exists, 'missing');
        chk('participation records the tournament', !!comp.data().placements[A], JSON.stringify(comp.data().placements));
        chk('participation records verifiedJoin=true', comp.data().placements[A].verifiedJoin === true, 'not recorded');

        const u = await userDoc(uidZ);
        chk('participation IS in achievements (never revoked, so the union is safe)',
            (u.data().achievements || []).includes(B.BADGE.COMPETITOR), JSON.stringify(u.data().achievements));

        // An UNCODED join must be recorded as unverified, not silently conflated.
        await B.awardParticipation({ db, FieldValue, uid: uidZ, tournamentId: C,
            tournamentName: 'Open Cup', teamId: 'zulu', verifiedJoin: false });
        const comp2 = await award(uidZ, B.BADGE.COMPETITOR);
        chk('a second tournament ADDS a key rather than replacing the map',
            !!comp2.data().placements[A] && !!comp2.data().placements[C], JSON.stringify(Object.keys(comp2.data().placements)));
        chk('uncoded join recorded verifiedJoin=false (walk-in is distinguishable)',
            comp2.data().placements[C].verifiedJoin === false, 'conflated with a verified join');

        // ── PLACEMENTS v1: Zulu wins tournament A ────────────────────────────────────────
        const r1 = await B.awardPlacements({ db, FieldValue, tournamentId: A,
            record: record(1, 'live', [ZULU, ALPHA]) });
        chk('v1 awarded two placements', r1.awarded === 2, JSON.stringify(r1));
        const champZ = await award(uidZ, B.BADGE.CHAMPION);
        chk('Zulu holds champion for A', champZ.exists && champZ.data().placements[A].position === 1,
            champZ.exists ? JSON.stringify(champZ.data().placements) : 'missing');

        const uZ = await userDoc(uidZ);
        chk('placements are NOT in achievements (the whole point: revocable ids must stay out)',
            !(uZ.data().achievements || []).includes(B.BADGE.CHAMPION), JSON.stringify(uZ.data().achievements));

        // ── IDEMPOTENCY: a re-run on an unchanged record writes nothing ──────────────────
        const rSame = await B.awardPlacements({ db, FieldValue, tournamentId: A,
            record: record(1, 'live', [ZULU, ALPHA]) });
        chk('re-run on an unchanged record writes NOTHING (no write storm)',
            rSame.awarded === 0 && rSame.revoked === 0 && rSame.unchanged === 2, JSON.stringify(rSame));

        // ── Zulu ALSO wins a different tournament C ──────────────────────────────────────
        await B.awardPlacements({ db, FieldValue, tournamentId: C,
            record: record(1, 'live', [ZULU, ALPHA]) });
        const champBoth = await award(uidZ, B.BADGE.CHAMPION);
        chk('one static badge id accumulates BOTH tournaments',
            !!champBoth.data().placements[A] && !!champBoth.data().placements[C],
            JSON.stringify(Object.keys(champBoth.data().placements)));

        // ── CORRECTION on A: Zulu disqualified, Alpha promoted ───────────────────────────
        const r2 = await B.awardPlacements({ db, FieldValue, tournamentId: A,
            record: record(2, 'correction', [ALPHA, ZULU], 'Zulu disqualified: flag sharing') });
        chk('correction both revokes and awards', r2.revoked >= 1 && r2.awarded >= 1, JSON.stringify(r2));

        const champZ2 = await award(uidZ, B.BADGE.CHAMPION);
        chk('A is REVOKED for Zulu', champZ2.data().placements[A].revoked === true,
            JSON.stringify(champZ2.data().placements[A]));
        chk('revocation records the superseding version', champZ2.data().placements[A].revokedAtVersion === 2,
            champZ2.data().placements[A].revokedAtVersion);
        chk('revocation records a reason', /disqualified/i.test(champZ2.data().placements[A].revokedReason || ''),
            champZ2.data().placements[A].revokedReason);
        chk('HISTORY PRESERVED: the revoked entry still records the original position',
            champZ2.data().placements[A].position === 1, JSON.stringify(champZ2.data().placements[A]));

        /* THE CASE THAT WOULD COST A STUDENT SOMETHING REAL. Being corrected out of tournament A
           must not strip the champion legitimately earned at tournament C. */
        chk('the OTHER tournament\'s championship SURVIVES the correction',
            champZ2.data().placements[C] && champZ2.data().placements[C].revoked !== true,
            JSON.stringify(champZ2.data().placements[C]));

        const champA = await award(uidA, B.BADGE.CHAMPION);
        chk('Alpha promoted to champion for A', champA.exists && champA.data().placements[A].position === 1,
            champA.exists ? JSON.stringify(champA.data().placements[A]) : 'missing');
        const runnerZ = await award(uidZ, B.BADGE.RUNNER_UP);
        chk('Zulu now holds runner-up for A (demoted, not erased)',
            runnerZ.exists && runnerZ.data().placements[A].position === 2,
            runnerZ.exists ? JSON.stringify(runnerZ.data().placements[A]) : 'missing');

        // ── refusal ──────────────────────────────────────────────────────────────────────
        let threw = null;
        try { await B.awardPlacements({ db, FieldValue, tournamentId: A, record: null }); }
        catch (e) { threw = e; }
        chk('refuses to award with no certified record',
            threw && threw.code === 'failed-precondition', threw ? threw.code : 'did not throw');

        await wipe();
    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        return 2;
    }

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  badges.test could not run:', e && e.message);
    process.exit(2);
});
