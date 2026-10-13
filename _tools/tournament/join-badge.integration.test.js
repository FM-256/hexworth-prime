#!/usr/bin/env node
/**
 * join-badge.integration.test.js: does JOINING actually award the badge?
 *
 * @catalog what    Invokes the REAL ctfJoinTeam callable against the Firestore emulator and asserts
 * @catalog what    the participation badge is written. Covers fresh join, repeat join, and the
 * @catalog what    legacy-member backfill path, which do NOT all take the same route to the award.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/join-badge.integration.test.js"
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS, SEPARATE FROM badges.test.js
 * ---------------------------------------------
 * A quality gate BLOCKED task 364 on exactly this gap. `badges.test.js` proves `ctf-badges.js` is
 * correct in ISOLATION: it calls `awardParticipation()` directly and never touches `ctfJoinTeam`. So
 * 21/21 said nothing about whether the join path actually calls it, which is the one thing the
 * operator asked for ("badges assigned automatically when a user joins").
 *
 * That gap was not academic, and it took two corrections to get right. The comment originally on the
 * award call claimed the idempotent early returns "return before reaching here". A reviewer showed
 * two of them are inside the `db.runTransaction(async (tx) => {...})` CALLBACK, exiting only that
 * callback. But the corrected comment was ALSO wrong, and THIS TEST is what proved it: `existing` is
 * computed by scanning the teams' `members` arrays, so the FUNCTION-level return fires first for
 * anyone already on a roster. The real defect underneath: a student an admin placed directly into
 * `members` could never earn the badge, because every attempt they made returned before the award.
 * The early-return branch now awards too. Neither wrong comment would have been caught by a suite
 * that bypasses the function it describes, which is exactly what badges.test.js does.
 *
 * WHY NO FUNCTIONS EMULATOR. This loads `functions/index.js` in-process and calls the callable's
 * `.run()` directly, with FIRESTORE_EMULATOR_HOST pointed at the Firestore emulator. The functions
 * emulator is what loads `functions/.env`, and this repo has a logged incident where that fired real
 * Discord webhooks at a live channel for hours. Without it, `DISCORD_WEBHOOK_URL` is empty, so the
 * notification path short-circuits on its own guard; the code ALSO bails when FIRESTORE_EMULATOR_HOST
 * is set (functions/index.js). Two independent reasons nothing can reach the wire.
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
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 220)}`);
};

async function main() {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.error('  CRITICAL: FIRESTORE_EMULATOR_HOST is not set, refusing to run (this writes).');
        return 2;
    }
    // Belt and braces: assert the wire cannot be reached before loading anything.
    if (process.env.DISCORD_WEBHOOK_URL) {
        console.error('  CRITICAL: DISCORD_WEBHOOK_URL is set. Refusing: this test loads the full');
        console.error('  functions module and a populated webhook URL is how live posts happened before.');
        return 2;
    }
    process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'hexworth-badges-test';
    process.env.FIREBASE_CONFIG = process.env.FIREBASE_CONFIG ||
        JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const fns = require(path.join(REPO, 'functions/index.js'));
    const db = admin.firestore();

    const TID = 'join-badge-tournament';
    const UID = 'uid-joiner-1';
    const tRef = db.collection('tournaments').doc(TID);
    const badgeRef = db.doc(`users/${UID}/server_awards/tournament_competitor`);

    const wipe = async () => {
        for (const sub of ['teams', 'rosterLocks', 'private']) {
            const s = await tRef.collection(sub).get();
            await Promise.all(s.docs.map(d => d.ref.delete()));
        }
        await tRef.delete().catch(() => {});
        const a = await db.collection(`users/${UID}/server_awards`).get();
        await Promise.all(a.docs.map(d => d.ref.delete()));
        await db.doc(`users/${UID}`).delete().catch(() => {});
    };
    // The callable's request shape. ctfJoinTeam reads request.auth.uid and request.data.
    const call = (data) => fns.ctfJoinTeam.run({
        data,
        auth: { uid: UID, token: { name: 'Joiner One', email: 'joiner@example.com' } },
        rawRequest: { headers: {} },
    });

    try {
        // ── CASE 1: fresh join on a CODED tournament ───────────────────────────────────────
        await wipe();
        await tRef.set({ name: 'Coded Cup', status: 'lobby', hasJoinCode: true, maxTeamSize: 4 });
        await tRef.collection('private').doc('config').set({ joinCode: 'HEX-123' });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });

        const r1 = await call({ tournamentId: TID, teamId: 'red', joinCode: 'HEX-123' });
        chk('C1 join succeeds', r1 && r1.ok === true, JSON.stringify(r1));

        const b1 = await badgeRef.get();
        chk('C1 JOINING AWARDED THE BADGE (the operator ask, end to end)', b1.exists, 'no badge document');
        chk('C1 badge records this tournament', b1.exists && !!b1.data().placements[TID],
            b1.exists ? JSON.stringify(b1.data().placements) : 'n/a');
        chk('C1 a verified (coded) join is recorded verifiedJoin=true',
            b1.exists && b1.data().placements[TID].verifiedJoin === true,
            b1.exists ? JSON.stringify(b1.data().placements[TID]) : 'n/a');
        const u1 = await db.doc(`users/${UID}`).get();
        chk('C1 badge id reached users/{uid}.achievements (so the cabinet can see it)',
            (u1.data().achievements || []).includes('tournament_competitor'),
            JSON.stringify(u1.exists ? u1.data().achievements : null));
        chk('C1 the member really is on the team',
            (await tRef.collection('teams').doc('red').get()).data().members.includes(UID), 'not on roster');

        // ── CASE 2: repeat join. The FUNCTION-level early return fires here. ───────────────
        const r2 = await call({ tournamentId: TID, teamId: 'red', joinCode: 'HEX-123' });
        chk('C2 repeat join is idempotent and still succeeds', r2 && r2.ok === true, JSON.stringify(r2));
        const b2 = await badgeRef.get();
        chk('C2 repeat join leaves exactly ONE tournament key (no duplication)',
            Object.keys(b2.data().placements).length === 1, JSON.stringify(Object.keys(b2.data().placements)));

        // ── CASE 3: a WRONG code must not join and must not award ─────────────────────────
        await wipe();
        await tRef.set({ name: 'Coded Cup', status: 'lobby', hasJoinCode: true, maxTeamSize: 4 });
        await tRef.collection('private').doc('config').set({ joinCode: 'HEX-123' });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });
        let threw = null;
        try { await call({ tournamentId: TID, teamId: 'red', joinCode: 'WRONG' }); } catch (e) { threw = e; }
        chk('C3 a wrong join code is rejected', !!threw, 'join succeeded with a wrong code');
        const b3 = await badgeRef.get();
        chk('C3 NO badge awarded for a rejected join', !b3.exists, 'badge written despite rejection');

        // ── CASE 4: UNCODED tournament. Joins, but must be marked unverified. ─────────────
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('blue').set({ name: 'Blue', members: [], memberNames: [], score: 0 });
        const r4 = await call({ tournamentId: TID, teamId: 'blue' });
        chk('C4 join succeeds on an uncoded tournament', r4 && r4.ok === true, JSON.stringify(r4));
        const b4 = await badgeRef.get();
        chk('C4 walk-in recorded verifiedJoin=FALSE (not conflated with a verified join)',
            b4.exists && b4.data().placements[TID].verifiedJoin === false,
            b4.exists ? JSON.stringify(b4.data().placements[TID]) : 'no badge');

        /* CASE 5: ADMIN-PLACED ROSTER MEMBER. This test is why the feature changed.
           `existing` is computed by scanning the teams' `members` arrays, so a student an admin
           dropped straight into `members` hits the FUNCTION-level early return before the
           transaction ever runs. Originally that path awarded nothing, which meant such a student
           could NEVER earn the badge: every attempt they made returned right there. The test caught
           it (badge simply absent) after two successive comments of mine described the flow wrongly.
           The early-return branch now awards too. */
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('blue')
            .set({ name: 'Blue', members: [UID], memberNames: ['Joiner One'], score: 0 });  // admin-placed, no lock
        const r5 = await call({ tournamentId: TID, teamId: 'blue' });
        chk('C5 an admin-placed roster member gets an idempotent success', r5 && r5.ok === true, JSON.stringify(r5));
        const b5 = await badgeRef.get();
        chk('C5 AN ADMIN-PLACED MEMBER IS STILL AWARDED (they are a competitor, they just never clicked join)',
            b5.exists, 'no badge: the early-return path skipped the award');
        chk('C5 the award records the right tournament', b5.exists && !!b5.data().placements[TID],
            b5.exists ? JSON.stringify(b5.data().placements) : 'n/a');

        /* ── CASE 6-8: THE CALLSIGN PARAMETER (public-enrollment work, 2026-10-11) ────────────
           A tournament may be a public event for people with no Hexworth account. They arrive via
           tournament-join.html, sign in ANONYMOUSLY, and have nothing in users/{uid} and no name on
           their token — so _resolveUserName falls through to _placeholderName and the roster reads
           `Player-3f9a`. Privacy-correct, and useless to a teammate looking for them on the board.
           `callsign` is the parameter that fixes it, and these cases prove the three things that
           matter: it is USED when valid, REFUSED when not, and changes NOTHING when absent.

           The anonymous caller is modelled with a token carrying NO name, which is what Firebase
           actually sends for signInAnonymously. The existing cases above all use a token with
           `name: 'Joiner One'`, so they could never have exercised the placeholder path. */
        const callAnon = (data) => fns.ctfJoinTeam.run({
            data,
            auth: { uid: UID, token: {} },
            rawRequest: { headers: {} },
        });
        const rosterName = async (teamId) => {
            const t = await tRef.collection('teams').doc(teamId).get();
            const names = t.data().memberNames || [];
            return names[0];
        };

        // C6: a valid callsign is what the public roster shows.
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });
        const r6 = await callAnon({ tournamentId: TID, teamId: 'red', callsign: 'ShadowFox' });
        chk('C6 anonymous join with a callsign succeeds', r6 && r6.ok === true, JSON.stringify(r6));
        chk('C6 THE CALLSIGN IS WHAT THE PUBLIC ROSTER SHOWS', (await rosterName('red')) === 'ShadowFox',
            'roster shows ' + JSON.stringify(await rosterName('red')));

        /* C7: a callsign that could break a renderer is REFUSED, and the fallback still names them.
           Both known consumers escape (escHtml in tournament-lobby.html, esc in tournament-join.html)
           but memberNames[] is also read by the podium, the broadcast view and the Discord path, and
           BUG-023/025 were a crafted-team-field XSS class on this very collection. The charset rule
           is the control that does not depend on every future consumer remembering to escape. */
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });
        const r7 = await callAnon({ tournamentId: TID, teamId: 'red', callsign: '<img src=x onerror=alert(1)>' });
        chk('C7 join still succeeds with a refused callsign (never a hard failure for the competitor)',
            r7 && r7.ok === true, JSON.stringify(r7));
        const n7 = await rosterName('red');
        chk('C7 THE MARKUP NEVER REACHES THE ROSTER', typeof n7 === 'string' && n7.indexOf('<') === -1,
            'roster shows ' + JSON.stringify(n7));
        chk('C7 the refused callsign falls back to the placeholder, so they are still named',
            typeof n7 === 'string' && /^Player-/.test(n7), 'roster shows ' + JSON.stringify(n7));

        // C8: absent callsign is the OLD behaviour exactly — the regression guard for every
        // existing caller, none of which sends this parameter.
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });
        const r8 = await callAnon({ tournamentId: TID, teamId: 'red' });
        chk('C8 join with NO callsign still succeeds', r8 && r8.ok === true, JSON.stringify(r8));
        const n8 = await rosterName('red');
        chk('C8 no callsign yields the unchanged placeholder behaviour',
            typeof n8 === 'string' && /^Player-/.test(n8), 'roster shows ' + JSON.stringify(n8));

        // C9: a too-short callsign is refused by the same rule, not silently accepted.
        await wipe();
        await tRef.set({ name: 'Open Cup', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('red').set({ name: 'Red', members: [], memberNames: [], score: 0 });
        await callAnon({ tournamentId: TID, teamId: 'red', callsign: 'X' });
        const n9 = await rosterName('red');
        chk('C9 a 1-char callsign is refused and falls back', typeof n9 === 'string' && /^Player-/.test(n9),
            'roster shows ' + JSON.stringify(n9));

        await wipe();
    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        return 2;
    }

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  join-badge.integration.test could not run:', e && e.message);
    process.exit(2);
});
