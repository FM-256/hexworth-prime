#!/usr/bin/env node
/**
 * ctf-flag-secrets.test.js
 *
 * @catalog what   Proves tournament flag crypto is unreachable by clients and that a challenge
 *                 with no flagSecrets entry REFUSES rather than silently mis-grading; also that
 *                 deliverFlag will not disclose a box used as a live tournament challenge.
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-flag-secrets.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS (taskboard 401 + 405).
 * Measured on production 2026-09-17 by an unauthenticated Firestore REST GET: all 5 challenge
 * docs across both live tournaments published `flagSalt` AND `flagHash`, and all 5 flags were
 * then recovered by hashing a handful of known candidates from functions/box_flags.json against
 * those published salts. Rules hide a DOCUMENT, never a FIELD — the same reasoning TOURN-03
 * wrote down for the join code and that nobody carried to these two fields.
 *
 * Mallory then found a second route that no amount of flag entropy closes: deliverFlag handed
 * the same plaintext to a freshly created ANONYMOUS account, because the console's own
 * "Import from Boxes" flow never sets `deliveryDisabled`.
 *
 * WHAT THIS ASSERTS THAT NOTHING ELSE DOES:
 *   1. A client cannot read flagSecrets — the whole point of the move.
 *   2. A correct flag is still credited, graded from the new location.
 *   3. A challenge whose flagSecrets entry is MISSING is REFUSED, not mis-graded. This is the
 *      assertion that matters most and the one with no prior coverage: comparing against an
 *      absent hash never throws, so the old shape would mark a CORRECT flag wrong and then
 *      write that correct flag into `submissions`, which any signed-in account can read.
 *   4. Crypto fields are absent from the challenge doc a client actually reads.
 *   5. deliverFlag refuses a box that is a challenge of a live tournament, and still serves one
 *      whose only tournament is a DRAFT (authoring is not competing).
 */
'use strict';
const admin = require('firebase-admin');
const crypto = require('crypto');

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
    if (!d.idToken) throw new Error('auth emulator minted no token: ' + JSON.stringify(d).slice(0, 160));
    return d;
}

async function call(fn, token, data) {
    const r = await fetch(CALL(fn), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
    });
    const d = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.status === 200, body: d, err: d && d.error && (d.error.status || d.error.message) };
}

const hash = (salt, flag) => 'sha256:' + crypto.createHash('sha256').update(salt + ':' + flag).digest('hex');

/* withSecret=false seeds the BROKEN shape on purpose: a challenge with no flagSecrets entry.
 * Case 3 depends on it, and a fixture that can only build the healthy shape cannot prove the
 * unhealthy one is refused. */
async function seedTournament(id, { status = 'active', withSecret = true, boxId = null } = {}) {
    const tRef = db.collection('tournaments').doc(id);
    await tRef.set({ name: id, status, maxTeamSize: 4, maxTeams: 4, scoringModel: 'static', teamCount: 1 });
    await tRef.collection('teams').doc('team-red').set({ name: 'Red', members: [], memberNames: [], score: 0, solves: [] });
    const salt = crypto.randomBytes(16).toString('hex');
    const flag = 'HEX{secrets_move_test}';
    await tRef.collection('challenges').doc('ch-01').set({
        title: 'C1', category: 'misc', points: 100, currentPoints: 100,
        visible: true, solveCount: 0, order: 0, hints: [], boxId,
    });
    if (withSecret) {
        await tRef.collection('flagSecrets').doc('ch-01').set({ flagSalt: salt, flagHash: hash(salt, flag) });
    }
    /* A SECOND challenge, so the wrong-flag case does not share a (team, challenge) pair with
     * the correct-flag case. Both guards that bit earlier runs of this suite are per-pair: the
     * already-solved refusal and the 10-second submission throttle. Sharing one challenge made
     * the harness measure those guards instead of grading. */
    await tRef.collection('challenges').doc('ch-02').set({
        title: 'C2', category: 'misc', points: 100, currentPoints: 100,
        visible: true, solveCount: 0, order: 1, hints: [], boxId: null,
    });
    if (withSecret) {
        const salt2 = crypto.randomBytes(16).toString('hex');
        await tRef.collection('flagSecrets').doc('ch-02').set({ flagSalt: salt2, flagHash: hash(salt2, 'HEX{second}') });
    }
    return { tRef, flag };
}

async function addMember(tRef, uid) {
    await tRef.collection('teams').doc('team-red').update({ members: [uid], memberNames: ['P'] });
}

(async () => {
    console.log('\n== ctf-flag-secrets ==');

    // ── 1. A client cannot read flagSecrets. ────────────────────────────────────────────────
    // Rules are exercised through the REST surface an attacker actually has, not through the
    // admin SDK (which bypasses rules and would report a false PASS).
    const healthy = await seedTournament('t-healthy', { withSecret: true });
    const anon = await identity();
    const restBase = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;

    const readAnon = await fetch(`${restBase}/tournaments/t-healthy/flagSecrets/ch-01`, {
        headers: { Authorization: `Bearer ${anon.idToken}` },
    });
    chk('an authenticated non-admin client CANNOT read flagSecrets', readAnon.status === 403, `http ${readAnon.status}`);

    const readNoAuth = await fetch(`${restBase}/tournaments/t-healthy/flagSecrets/ch-01`);
    chk('an UNAUTHENTICATED client cannot read flagSecrets', readNoAuth.status === 403, `http ${readNoAuth.status}`);

    // ── 4. And the doc a client CAN read carries no crypto. ─────────────────────────────────
    const chPublic = await fetch(`${restBase}/tournaments/t-healthy/challenges/ch-01`);
    const chBody = await chPublic.json().catch(() => ({}));
    const fields = Object.keys((chBody && chBody.fields) || {});
    chk('the publicly readable challenge doc has NO flagHash', !fields.includes('flagHash'), fields.join(','));
    chk('the publicly readable challenge doc has NO flagSalt', !fields.includes('flagSalt'), fields.join(','));

    // ── 2. A correct flag is still credited, graded from the new location. ──────────────────
    await addMember(healthy.tRef, anon.localId);

    /* The WRONG flag goes first, deliberately. Submitted after a correct solve it hits the
     * already-solved guard (ALREADY_EXISTS) and proves nothing about grading — which is exactly
     * what the first run of this suite reported, and the harness was wrong, not the product. */
    const bad = await call('ctfSubmitFlag', anon.idToken, {
        tournamentId: 't-healthy', teamId: 'team-red', challengeId: 'ch-02', flag: 'HEX{wrong}',
    });
    chk('a WRONG flag is marked incorrect', bad.ok && bad.body.result && bad.body.result.correct === false,
        bad.err || JSON.stringify(bad.body).slice(0, 120));

    const good = await call('ctfSubmitFlag', anon.idToken, {
        tournamentId: 't-healthy', teamId: 'team-red', challengeId: 'ch-01', flag: healthy.flag,
    });
    chk('a correct flag is accepted, graded from flagSecrets', good.ok && good.body.result && good.body.result.correct === true,
        good.err || JSON.stringify(good.body).slice(0, 120));

    const teamAfter = await healthy.tRef.collection('teams').doc('team-red').get();
    chk('the team was actually credited (second channel, not the callable response)',
        (teamAfter.data().score || 0) > 0, 'score=' + (teamAfter.data().score || 0));

    // ── 3. THE ONE THAT MATTERS: no secret means REFUSE, never mis-grade. ───────────────────
    const broken = await seedTournament('t-nosecret', { withSecret: false });
    const anon2 = await identity();
    await addMember(broken.tRef, anon2.localId);
    const orphan = await call('ctfSubmitFlag', anon2.idToken, {
        tournamentId: 't-nosecret', teamId: 'team-red', challengeId: 'ch-01', flag: broken.flag,
    });
    /* Accept BOTH spellings: HttpsError throws 'failed-precondition', the callable protocol
      * reports 'FAILED_PRECONDITION'. Matching one made a correct refusal look like a defect. */
    chk('a challenge with NO flagSecrets entry is REFUSED', orphan.status !== 200 && /failed[-_]precondition|not fully configured/i.test(String(orphan.err || JSON.stringify(orphan.body))),
        'http ' + orphan.status + ' ' + String(orphan.err || '').slice(0, 80));
    chk('and it was NOT silently marked incorrect', !(orphan.ok && orphan.body.result && orphan.body.result.correct === false),
        orphan.ok ? 'returned 200 with correct=' + JSON.stringify(orphan.body.result) : 'refused');

    const brokenTeam = await broken.tRef.collection('teams').doc('team-red').get();
    chk('no submission was recorded against the unconfigured challenge',
        (brokenTeam.data().score || 0) === 0, 'score=' + (brokenTeam.data().score || 0));

    // ── 5. deliverFlag must not disclose a box used as a LIVE tournament challenge. ─────────
    await db.doc('flag_registry/qa-box-live').set({ flags: { user: 'flag{qa_live_box}' } });
    await db.doc('flag_registry/qa-box-draft').set({ flags: { user: 'flag{qa_draft_box}' } });
    await seedTournament('t-live-box', { status: 'active', boxId: 'qa-box-live' });
    await seedTournament('t-draft-box', { status: 'draft', boxId: 'qa-box-draft' });

    const anon3 = await identity();
    const liveDeliver = await call('deliverFlag', anon3.idToken, { boxId: 'qa-box-live', flagId: 'user' });
    chk('deliverFlag REFUSES a box that is a live tournament challenge',
        !liveDeliver.ok && /permission[-_]denied|tournament challenge/i.test(String(liveDeliver.err || JSON.stringify(liveDeliver.body))),
        'http ' + liveDeliver.status + ' ' + String(liveDeliver.err || '').slice(0, 80));
    chk('and no flag text leaked in the refusal body',
        !/flag\{qa_live_box\}/.test(JSON.stringify(liveDeliver.body)), 'body checked');

    const draftDeliver = await call('deliverFlag', anon3.idToken, { boxId: 'qa-box-draft', flagId: 'user' });
    chk('deliverFlag still SERVES a box whose only tournament is a DRAFT (authoring is not competing)',
        draftDeliver.ok && draftDeliver.body.result && draftDeliver.body.result.flagText === 'flag{qa_draft_box}',
        draftDeliver.err || JSON.stringify(draftDeliver.body).slice(0, 120));

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
