#!/usr/bin/env node
'use strict';
/**
 * ctf-roster-selfheal.test.js
 *
 * @catalog what   Proves a roster lock without a members[] entry is REPAIRED rather than being a
 *                 permanent lockout, and that no uid or email is ever published as a display name
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-roster-selfheal.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS (taskboard 420). Found in production on the LIVE tournament: rosterLocks named three
 * users, members[] listed one. The two others held valid locks, were absent from members[], and were
 * therefore unable to score at all -- ctfSubmitFlag resolves a team from members.includes(uid) -- with
 * no way to repair it themselves, because ctfJoinTeam's idempotent branch returned on the lock BEFORE
 * looking at members and told them "already on this team" forever.
 *
 * The asymmetry is the lesson: the same function already backfilled the OPPOSITE case (in members[],
 * no lock). One direction was handled and its mirror was not, which is why the failure survived.
 *
 * The second half of the suite is about what gets PUBLISHED. memberNames lands on teams/{teamId},
 * which firestore.rules makes `allow read: if true` for the podium, and the old name resolver ended
 * `|| token.email || uid`. Two UID-shaped entries were already live. An email would have been worse.
 */
const admin = require('firebase-admin');
const crypto = require('crypto');

const PROJECT = 'demo-hexworth';
const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const CALL = (fn) => `http://${FN_HOST}/${PROJECT}/us-central1/${fn}`;

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

async function identity(email) {
    const body = { returnSecureToken: true };
    if (email) { body.email = email; body.password = 'passw0rd!'; }
    const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!d.idToken) throw new Error('auth emulator minted no token: ' + JSON.stringify(d));
    return d;
}
async function call(fn, token, data) {
    const r = await fetch(CALL(fn), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
    });
    return { status: r.status, body: await r.json().catch(() => ({})) };
}
const placeholder = (uid) => 'Player-' + crypto.createHash('sha256').update(uid).digest('hex').slice(0, 4);

async function mkTournament(tid, maxTeamSize = 4) {
    await db.doc(`tournaments/${tid}`).set({ name: tid, status: 'lobby', hasJoinCode: false, maxTeamSize });
    for (const t of ['team-a', 'team-b']) {
        await db.doc(`tournaments/${tid}/teams/${t}`).set({ name: t.toUpperCase(), members: [], memberNames: [], score: 0, solves: [] });
    }
}

(async () => {
    console.log('\n== roster self-heal and display-name privacy ==');

    /* 1. THE PRODUCTION FAILURE, reproduced then fixed: lock points here, members[] does not list them. */
    {
        const TID = 't-heal';
        await mkTournament(TID);
        const u = await identity();
        // Exactly the live state: a valid lock, and no members entry.
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-a', joinedAt: new Date() });
        const before = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const after = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        chk('a lock with NO members entry is REPAIRED by re-joining (was a permanent lockout)',
            before.length === 0 && after.includes(u.localId) && r.status === 200,
            `status=${r.status} members ${before.length} -> ${after.length}`);
        const names = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        chk('the repair keeps members[] and memberNames[] index-aligned',
            names.length === after.length, `members=${after.length} names=${names.length}`);
    }

    /* 2. IDEMPOTENCE still holds: a healthy member re-joining must not be duplicated. */
    {
        const TID = 't-idem';
        await mkTournament(TID);
        const u = await identity();
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const m = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const n = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        chk('CONTROL: re-joining a team you are properly on does NOT duplicate you',
            m.filter(x => x === u.localId).length === 1 && n.length === 1, `members=${m.length} names=${n.length}`);
    }

    /* 3. The OPPOSITE direction: in members[], no lock.
     *
     * MY FIRST VERSION OF THIS ASSERTED THE WRONG THING, and the code was right. I expected the lock to
     * be backfilled, because the in-transaction branch at functions/index.js:8130 says it does exactly
     * that. It is unreachable on this path: a scan of every team's members[] runs BEFORE the
     * transaction and returns idempotent success as soon as it finds the user on the target team, so
     * the transaction is never entered. I corrected the test rather than changing production to match
     * my expectation of it.
     *
     * The missing lock is benign, which is why this is a documentation finding and not a defect:
     * members[] is the authoritative list, so the user can score; the pre-scan still stops them joining
     * a second team; and leaving works because ctfLeaveTeam keys off members and deletes the lock
     * only as a no-op-safe extra. Asserted here as what it ACTUALLY does, so the next person reading
     * the misleading comment has a test telling them the truth. */
    {
        const TID = 't-backfill';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`tournaments/${TID}/teams/team-a`).set({ name: 'A', members: [u.localId], memberNames: ['Someone'], score: 0, solves: [] });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const m = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const n = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        chk('CONTROL: in members[] with no lock is idempotent success and does NOT duplicate',
            r.status === 200 && m.length === 1 && n.length === 1, `status=${r.status} members=${m.length} names=${n.length}`);
        /* And the user is still CONSTRAINED to one team despite having no lock, which is the property
         * that actually matters and the reason the absent lock is harmless. */
        const r2 = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const mb = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        chk('and with no lock they are STILL refused a second team (members[] carries that constraint)',
            r2.status !== 200 && mb.length === 0, `status=${r2.status} team-b members=${mb.length}`);
    }

    /* 4. A lock on a DIFFERENT team must still be refused, not silently healed onto this one. */
    {
        const TID = 't-other';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-b', joinedAt: new Date() });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const m = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        chk('CONTROL: a lock on ANOTHER team is still refused and does not join this one',
            r.status !== 200 && m.length === 0, `status=${r.status} members=${m.length}`);
    }

    /* 5. A full team cannot be silently over-filled by the repair, and the user is TOLD. */
    {
        const TID = 't-full';
        await mkTournament(TID, 1);
        const other = await identity();
        const u = await identity();
        await db.doc(`tournaments/${TID}/teams/team-a`).set({ name: 'A', members: [other.localId], memberNames: ['X'], score: 0, solves: [] });
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-a', joinedAt: new Date() });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const m = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const msg = (r.body && r.body.error && r.body.error.message) || '';
        chk('a FULL team is not over-filled by the repair, and says so instead of failing silently',
            m.length === 1 && r.status !== 200 && /full/i.test(msg), `status=${r.status} members=${m.length} "${msg.slice(0, 60)}"`);
    }

    /* 6. THE PUBLISHED-PII HALF. memberNames is world-readable; a uid or an email there is a leak. */
    {
        const TID = 't-name-anon';
        await mkTournament(TID);
        const u = await identity('leaky.person@example.com');   // has an email, no callsign, no displayName
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const names = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        const n = names[0] || '';
        chk('a user with no callsign gets a placeholder, NOT their uid and NOT their email',
            n !== u.localId && !n.includes('@') && n === placeholder(u.localId), `got "${n}"`);
        chk('and the placeholder is stable and non-identifying in shape',
            /^Player-[0-9a-f]{4}$/.test(n), n);
    }

    /* 7. A real callsign must still win: the fix must not anonymise people who have a name. */
    {
        const TID = 't-name-real';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`users/${u.localId}`).set({ callsign: 'Ghostwire' });
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const names = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        chk('CONTROL: a real callsign is still used as the display name',
            names[0] === 'Ghostwire', JSON.stringify(names));
    }

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
