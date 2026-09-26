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
const placeholder = (uid, tid) => 'Player-' + crypto.createHash('sha256').update(uid + ':' + tid).digest('hex').slice(0, 4);
/* Kept so a test can assert the new value is NOT the old one, rather than only that it looks right. */
const placeholderUnsalted = (uid) => 'Player-' + crypto.createHash('sha256').update(uid).digest('hex').slice(0, 4);

async function mkTournament(tid, maxTeamSize = 4) {
    await db.doc(`tournaments/${tid}`).set({ name: tid, status: 'lobby', hasJoinCode: false, maxTeamSize });
    for (const t of ['team-a', 'team-b']) {
        /* createdAt is set because BOTH real creators set it (the console's batch write and
         * create-tournament.js) and the lock's team-identity check compares against it. A fixture that
         * omitted it made that check unverifiable while looking like a code failure -- the first run of
         * the lock-shape assertion reported team=false, which was this, not the product. */
        await db.doc(`tournaments/${tid}/teams/${t}`).set({
            name: t.toUpperCase(), members: [], memberNames: [], score: 0, solves: [],
            createdAt: admin.firestore.Timestamp.now(),
        });
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

    /* 4. A lock on a DIFFERENT team must not seat them on the team they CLICKED.
     *
     * THIS CONTROL ASSERTED THE OLD BEHAVIOUR and I corrected it rather than the code. It required a
     * flat refusal, which was right when the clicked team decided everything. Now the LOCK decides: an
     * orphaned student is healed onto the team their lock names, precisely so a wrong guess in a lobby
     * that cannot show them the right one is not a dead end. The property worth guarding is unchanged
     * and is what this now asserts -- they are NOT added to the team they clicked. */
    {
        const TID = 't-other';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-b', joinedAt: new Date() });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const b = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        chk('a lock on ANOTHER team never seats them on the team they clicked',
            a.length === 0, `team-a=${a.length}`);
        chk('and they end up on the LOCKED team instead of nowhere',
            r.status === 200 && b.includes(u.localId) && r.body.result.teamId === 'team-b',
            `status=${r.status} team-b=${b.length}`);
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
            n !== u.localId && !n.includes('@') && n === placeholder(u.localId, TID), `got "${n}"`);
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

    /* ── THE CASE THE REAL UI PRODUCES, which Chris blocked the first version for. ─────────────
     * A student whose lock exists but whose members entry does not sees "NO TEAM" in the lobby: it
     * derives myTeamId by scanning members[], and it cannot do otherwise because rules deny
     * rosterLocks to every client including its owner. So a Join button renders on EVERY card and the
     * student has no way to know which team their lock names. The first fix only healed when the click
     * happened to match, so a wrong guess -- five times in six on a six-team event -- hit "leave it
     * first" with no team named and no Leave button on screen. Every server-side test passed because
     * every server-side test sends the matching teamId. These send the WRONG one on purpose. */
    {
        const TID = 't-mismatch';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-a', joinedAt: new Date() });
        // Orphaned, and clicks the OTHER team.
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const b = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        chk('clicking the WRONG team heals onto the LOCKED team, not the clicked one',
            r.status === 200 && a.includes(u.localId) && b.length === 0,
            `status=${r.status} team-a=${a.length} team-b=${b.length}`);
        chk('and the response says which team they actually landed on',
            r.body && r.body.result && r.body.result.teamId === 'team-a' && r.body.result.healed === true
            && r.body.result.requestedTeamId === 'team-b', JSON.stringify(r.body && r.body.result));
        const names = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [];
        chk('the healed team stays index-aligned', names.length === a.length, `members=${a.length} names=${names.length}`);
    }

    /* A student GENUINELY on another team must still be refused -- but the refusal has to name the
     * team, or the client cannot render the Leave button it is telling them to use. */
    {
        const TID = 't-mismatch-legit';
        await mkTournament(TID);
        const u = await identity();
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });   // properly joined
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const b = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        const err = (r.body && r.body.error) || {};
        chk('a student really on another team is still refused, and NOT moved',
            r.status !== 200 && b.length === 0, `status=${r.status} team-b=${b.length}`);
        chk('and the refusal NAMES the team so the client can offer Leave',
            /team-a|A\b/i.test(String(err.message || '')) && err.details && err.details.teamId === 'team-a',
            `${String(err.message || '').slice(0, 60)} details=${JSON.stringify(err.details)}`);
    }

    /* A lock pointing at a team that no longer exists is debris, not a life sentence. */
    {
        const TID = 't-mismatch-gone';
        await mkTournament(TID);
        const u = await identity();
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-gone', joinedAt: new Date() });
        const r1 = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const lock = await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).get();
        /* Falls through to a normal join in the SAME call: no delete-then-throw, which would roll the
         * delete back with the abort. The stale lock is overwritten by the normal path's own tx.set. */
        chk('a lock on a DELETED team does not refuse: the student joins the team they clicked',
            r1.status === 200 && a.includes(u.localId), `status=${r1.status} team-a=${a.length}`);
        chk('and the stale lock is replaced, now pointing at the team they actually joined',
            lock.exists && lock.get('teamId') === 'team-a', `lock=${lock.exists} -> ${lock.get('teamId')}`);
    }

    /* Orphaned, locked team FULL, clicked elsewhere: must refuse and name the locked team, not
     * silently seat them on the team they clicked. */
    {
        const TID = 't-mismatch-full';
        await mkTournament(TID, 1);
        const other = await identity();
        const u = await identity();
        await db.doc(`tournaments/${TID}/teams/team-a`).set({ name: 'A', members: [other.localId], memberNames: ['X'], score: 0, solves: [] });
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).set({ teamId: 'team-a', joinedAt: new Date() });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const b = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        const err = (r.body && r.body.error) || {};
        chk('orphaned but locked team FULL: refused, names the locked team, seats them nowhere',
            r.status !== 200 && a.length === 1 && b.length === 0 && err.details && err.details.teamId === 'team-a',
            `status=${r.status} a=${a.length} b=${b.length} details=${JSON.stringify(err.details)}`);
    }

    /* ── THE PLACEHOLDER IS NOW TOURNAMENT-SALTED (Mallory, Nancy). ────────────────────────────
     * Unsalted it was the same string on every event the same account joined unnamed, so the public
     * podium docs became a durable cross-event pseudonym. */
    {
        const u = await identity();
        const ids = ['t-salt-1', 't-salt-2'];
        const got = [];
        for (const TID of ids) {
            await mkTournament(TID);
            await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
            got.push(((await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('memberNames') || [])[0]);
        }
        chk('the same account gets DIFFERENT placeholders in different tournaments (no cross-event link)',
            got[0] !== got[1] && got.every(n => /^Player-[0-9a-f]{4}$/.test(String(n))), got.join(' vs '));
        chk('and it matches the salted derivation, not the bare-uid one',
            got[0] === placeholder(u.localId, ids[0]) && got[0] !== placeholderUnsalted(u.localId),
            `${got[0]} salted=${placeholder(u.localId, ids[0])} unsalted=${placeholderUnsalted(u.localId)}`);
    }

    /* ── SAME ID IS NOT THE SAME TEAM (Mallory's reproduction). ────────────────────────────────
     * Delete a team and recreate it as an unrelated roster, and a stale lock from the old one used to
     * reattach its holder to strangers while reporting "healed". The id is a name, not an identity, so
     * the lock records the team's createdAt and a mismatch is treated as debris. */
    {
        const TID = 't-recreated';
        await mkTournament(TID);
        const u = await identity();
        const oldCreated = admin.firestore.Timestamp.fromMillis(Date.now() - 600000);
        // A lock from the ORIGINAL team-a, recorded against that team's creation time.
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`)
            .set({ teamId: 'team-a', teamCreatedAt: oldCreated, joinedAt: oldCreated });
        // team-a is now a DIFFERENT roster, created later, already holding an unrelated member.
        const stranger = await identity();
        await db.doc(`tournaments/${TID}/teams/team-a`).set({
            name: 'A (round 2)', members: [stranger.localId], memberNames: ['Stranger'],
            score: 0, solves: [], createdAt: admin.firestore.Timestamp.fromMillis(Date.now()),
        });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        const b = (await db.doc(`tournaments/${TID}/teams/team-b`).get()).get('members') || [];
        chk('a RECREATED team at the same id does NOT absorb the stale lock holder',
            !a.includes(u.localId) && a.length === 1, `team-a members=${a.length}`);
        chk('and they join the team they actually clicked instead',
            r.status === 200 && b.includes(u.localId), `status=${r.status} team-b=${b.length}`);
        const lock = await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).get();
        chk('the debris lock is replaced, now naming the team they joined',
            lock.exists && lock.get('teamId') === 'team-b', `lock -> ${lock.get('teamId')}`);
    }

    /* The SAME team must still be honoured: the identity check must not break ordinary healing. */
    {
        const TID = 't-sameteam';
        await mkTournament(TID);
        const u = await identity();
        const teamDoc = await db.doc(`tournaments/${TID}/teams/team-a`).get();
        await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`)
            .set({ teamId: 'team-a', teamCreatedAt: teamDoc.get('createdAt') || null, joinedAt: new Date() });
        const r = await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-b' });
        const a = (await db.doc(`tournaments/${TID}/teams/team-a`).get()).get('members') || [];
        chk('CONTROL: a lock matching the CURRENT team still heals onto it',
            r.status === 200 && a.includes(u.localId) && r.body.result.healed === true,
            `status=${r.status} team-a=${a.length}`);
    }

    /* A normal join must now RECORD the team identity, or the check above has nothing to compare. */
    {
        const TID = 't-lockshape';
        await mkTournament(TID);
        const u = await identity();
        await call('ctfJoinTeam', u.idToken, { tournamentId: TID, teamId: 'team-a' });
        const lock = await db.doc(`tournaments/${TID}/rosterLocks/${u.localId}`).get();
        const team = await db.doc(`tournaments/${TID}/teams/team-a`).get();
        const lt = lock.get('teamCreatedAt'), tt = team.get('createdAt');
        chk('a normal join records teamCreatedAt on the lock, matching the team',
            !!lt && !!tt && lt.toMillis() === tt.toMillis(), `lock=${!!lt} team=${!!tt}`);
    }

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
