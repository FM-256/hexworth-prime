#!/usr/bin/env node
/**
 * ctf-box-assignment.test.js
 *
 * @catalog what   Proves a team gets its OWN real-box credential and nobody else's: the callable
 *                 returns the right details to a member, refuses a non-member, the document is
 *                 unreadable by any client, and a corrupt assignment fails loudly instead of
 *                 handing the right team the wrong box.
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-box-assignment.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS. Engine 1 is a real Windows VM, one instance per team. The seam between the
 * platform and the machine is "which box is mine and how do I log in", and this endpoint is the
 * only thing that crosses it. It discloses a live interactive login, so the standard here is the
 * one the VM side was held to: both directions counted, not just denial. The VM side reported
 * 6/6 own-box logins AND 30/30 cross-team refusals; a suite that only proves outsiders are denied
 * is half of that.
 *
 * FOUR COUNTS, reported separately:
 *   1. POSITIVE  a member gets the CORRECT url/username/password for their own team
 *   2. DENY      a member of another team is refused by the callable
 *   3. DENY      no client can read the assignment document directly
 *   4. CORRUPT   a mismatched OR MISSING challengeId fails loudly rather than returning
 *                another box's credentials to the right team
 * Case 4 includes the MISSING variant deliberately: the document id already encodes the
 * challenge, so an authoring path has no forcing function to write the field, and the first
 * version of the guard only caught a WRONG value.
 */
'use strict';
const admin = require('firebase-admin');

const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const PROJECT = 'demo-hexworth';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const CALL = (fn) => `http://${FN_HOST}/${PROJECT}/us-central1/${fn}`;

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

async function identity() {
    const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
    });
    const d = await r.json();
    if (!d.idToken) throw new Error('auth emulator minted no token');
    return d;
}

async function getCred(token, tournamentId, challengeId) {
    const r = await fetch(CALL('ctfGetBoxCredential'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: { tournamentId, challengeId } }),
    });
    const d = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.status === 200, body: d,
             err: d && d.error && (d.error.status || d.error.message) };
}

const T = 'boxasg1';
const CRED = {
    alpha: { url: 'https://engine1-alpha.example.test', username: 'player', password: 'alpha-pw-aaa' },
    bravo: { url: 'https://engine1-bravo.example.test', username: 'player', password: 'bravo-pw-bbb' },
};

(async () => {
    console.log('\n== ctf-box-assignment ==');

    const tRef = db.collection('tournaments').doc(T);
    await tRef.set({ name: T, status: 'active', maxTeamSize: 4, maxTeams: 4, scoringModel: 'static' });
    await tRef.collection('challenges').doc('ch-01').set({
        title: 'Engine 1', points: 100, currentPoints: 100, visible: true, solveCount: 0, order: 0, hints: [],
    });
    await tRef.collection('challenges').doc('ch-02').set({
        title: 'Simulated thing', points: 50, currentPoints: 50, visible: true, solveCount: 0, order: 1, hints: [],
    });

    const alphaUser = await identity();
    const bravoUser = await identity();
    await tRef.collection('teams').doc('alpha').set({ name: 'Alpha', members: [alphaUser.localId], memberNames: ['A'], score: 0, solves: [] });
    await tRef.collection('teams').doc('bravo').set({ name: 'Bravo', members: [bravoUser.localId], memberNames: ['B'], score: 0, solves: [] });

    await tRef.collection('teams').doc('alpha').collection('assignments').doc('ch-01')
        .set({ challengeId: 'ch-01', ...CRED.alpha });
    await tRef.collection('teams').doc('bravo').collection('assignments').doc('ch-01')
        .set({ challengeId: 'ch-01', ...CRED.bravo });

    // ── 1. POSITIVE CONTROL: the right team gets the RIGHT box, not merely "a" response ──────
    let positives = 0;
    for (const [team, user, want] of [['alpha', alphaUser, CRED.alpha], ['bravo', bravoUser, CRED.bravo]]) {
        const r = await getCred(user.idToken, T, 'ch-01');
        const got = (r.body && r.body.result) || {};
        const exact = r.ok && got.url === want.url && got.username === want.username && got.password === want.password;
        if (exact) positives++;
        chk(`${team} receives ${team}'s OWN box details exactly`, exact,
            r.ok ? `url=${got.url} user=${got.username} pw=${got.password === want.password ? 'matches' : 'WRONG'}` : (r.err || 'call failed'));
    }
    chk('positive control count', positives === 2, `${positives} / 2`);

    // ── 2. DENY via the callable: a team cannot obtain another team's credential ─────────────
    // There is no teamId parameter, so the only way to "ask as" another team is to be on it.
    // Alpha asking for ch-01 must never yield Bravo's password.
    const alphaAsks = await getCred(alphaUser.idToken, T, 'ch-01');
    const alphaGot = (alphaAsks.body && alphaAsks.body.result) || {};
    chk('alpha can NEVER receive bravo credentials', alphaGot.password !== CRED.bravo.password,
        `got ${alphaGot.password === CRED.alpha.password ? "alpha's own" : alphaGot.password}`);

    // A user on NO team must be refused outright.
    const stranger = await identity();
    const sr = await getCred(stranger.idToken, T, 'ch-01');
    chk('a user on no team is REFUSED', !sr.ok && /failed[-_]precondition|not on a team/i.test(String(sr.err || JSON.stringify(sr.body))),
        `http ${sr.status} ${String(sr.err || '').slice(0, 60)}`);

    // ── 3. DENY the document itself to every client ─────────────────────────────────────────
    const restBase = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
    const asMember = await fetch(`${restBase}/tournaments/${T}/teams/alpha/assignments/ch-01`,
        { headers: { Authorization: `Bearer ${alphaUser.idToken}` } });
    chk('even a MEMBER cannot read the assignment document directly', asMember.status === 403, `http ${asMember.status}`);
    const asOther = await fetch(`${restBase}/tournaments/${T}/teams/alpha/assignments/ch-01`,
        { headers: { Authorization: `Bearer ${bravoUser.idToken}` } });
    chk('another team cannot read it either', asOther.status === 403, `http ${asOther.status}`);
    const asAnon = await fetch(`${restBase}/tournaments/${T}/teams/alpha/assignments/ch-01`);
    chk('unauthenticated cannot read it', asAnon.status === 403, `http ${asAnon.status}`);

    // ── 4. CORRUPT DOC: both variants must fail loudly ──────────────────────────────────────
    // (a) WRONG challengeId in the body.
    await tRef.collection('teams').doc('alpha').collection('assignments').doc('ch-02')
        .set({ challengeId: 'ch-99-wrong', url: 'https://wrong.example.test', username: 'player', password: 'wrong-pw' });
    const wrong = await getCred(alphaUser.idToken, T, 'ch-02');
    chk('a MISMATCHED challengeId is refused', !wrong.ok && /failed[-_]precondition|misconfigured/i.test(String(wrong.err || JSON.stringify(wrong.body))),
        `http ${wrong.status} ${String(wrong.err || '').slice(0, 50)}`);
    chk('and no credential leaked in that refusal', !JSON.stringify(wrong.body).includes('wrong-pw'), 'body checked');

    // (b) MISSING challengeId. The likelier accident, and the first guard could not catch it.
    await tRef.collection('teams').doc('bravo').collection('assignments').doc('ch-02')
        .set({ url: 'https://nofield.example.test', username: 'player', password: 'nofield-pw' });
    const missing = await getCred(bravoUser.idToken, T, 'ch-02');
    chk('a MISSING challengeId is refused', !missing.ok && /failed[-_]precondition|misconfigured/i.test(String(missing.err || JSON.stringify(missing.body))),
        `http ${missing.status} ${String(missing.err || '').slice(0, 50)}`);
    chk('and no credential leaked in that refusal', !JSON.stringify(missing.body).includes('nofield-pw'), 'body checked');

    // (c) An EMPTY doc is not a success of nulls.
    await tRef.collection('teams').doc('alpha').collection('assignments').doc('ch-03')
        .set({ challengeId: 'ch-03' });
    await tRef.collection('challenges').doc('ch-03').set({ title: 'Shell', points: 10, currentPoints: 10, visible: true, solveCount: 0, order: 2, hints: [] });
    const empty = await getCred(alphaUser.idToken, T, 'ch-03');
    chk('an EMPTY assignment is refused rather than returning nulls', !empty.ok,
        `http ${empty.status} ${String(empty.err || '').slice(0, 50)}`);

    // ── absent assignment is the ORDINARY case and must be not-found, which the client treats
    //    as "render as today" rather than as an error ─────────────────────────────────────────
    const none = await getCred(bravoUser.idToken, T, 'ch-03');
    chk('a challenge with NO assignment returns not-found', !none.ok && /not[-_]found/i.test(String(none.err || JSON.stringify(none.body))),
        `http ${none.status} ${String(none.err || '').slice(0, 40)}`);

    // ── the status gate, decided deliberately rather than omitted ────────────────────────────
    await tRef.update({ status: 'lobby' });
    const early = await getCred(alphaUser.idToken, T, 'ch-01');
    chk('credentials are NOT handed out before the tournament is running', !early.ok,
        `status lobby -> http ${early.status}`);
    await tRef.update({ status: 'active' });

    // ── the audit trail recorded the disclosures ─────────────────────────────────────────────
    const audit = await db.collection('ctf_credential_audit').get();
    chk('successful disclosures were audited', audit.size >= positives, `${audit.size} entries`);
    const leaked = audit.docs.some(d => JSON.stringify(d.data()).includes('alpha-pw-aaa'));
    chk('the audit trail does NOT contain the password', !leaked, 'entries checked');

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
