#!/usr/bin/env node
'use strict';
/**
 * create-tournament.test.js
 *
 * @catalog what   Runs the real create-tournament.js against the emulator and proves its output matches
 *                 the shape the admin console produces, then plays the tournament end to end
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/create-tournament.test.js"
 * @catalog status TOOL
 *
 * WHY THE SHAPE REFERENCE IS TRUSTWORTHY. It is not my opinion of what the console writes: the field
 * lists below were read out of `tournaments/1mA2hvZTZDC0KJGSzcCD` in production, a tournament the
 * ADMIN CONSOLE created on 2026-09-21. So this compares a scripted creator against the audited path's
 * own output. A reimplementation that drifts from it fails here.
 *
 * AND SHAPE IS NOT ENOUGH, which is the point of the second half. Every field can be present and
 * correctly named while the tournament is unplayable -- the defect that shape cannot see is a salt and
 * hash that disagree, which grades every correct flag as wrong and is invisible until a student is
 * already losing. So the suite JOINS a team and SUBMITS the flag through the real ctfSubmitFlag, and
 * requires the points to land.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('REFUSING: run under firebase emulators:exec — this creates tournaments.');
    process.exit(1);
}
/* The emulator serves Firestore namespaces AND callable URLs per project, so the creator must be told
 * to use the SAME project the emulator runs as. The first run of this suite did not, and the functions
 * emulator answered 404 while the documents sat in a namespace it could not see. */
const PROJECT = 'demo-hexworth';
const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* Captured from the console-created production tournament. See the header. */
const REF = {
    tournament: ['boardStyle', 'createdAt', 'createdBy', 'description', 'duration', 'hasJoinCode',
        'maxTeamSize', 'maxTeams', 'name', 'scoringModel', 'status', 'teamCount', 'totalSolves', 'totalSubmissions'],
    privateConfig: ['createdAt', 'joinCode'],
    /* boxId is in the console's write but was deleted by hand from the live doc after the Launch Box
     * incident (taskboard 418), so the production reference lacks it while the console still writes it.
     * Stated rather than quietly dropped from the comparison. */
    challenge: ['boxId', 'category', 'currentPoints', 'description', 'hints', 'order', 'points',
        'solveCount', 'title', 'visible'],
    team: ['captain', 'color', 'createdAt', 'hintPenalty', 'lastSolveTime', 'memberNames', 'members',
        'name', 'score', 'solves'],
};

const FLAG = 'flag{emulator_create_test_' + crypto.randomBytes(4).toString('hex') + '}';
const CODE = 'TSTCODE1';

async function identity() {
    const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
    const d = await r.json();
    if (!d.idToken) throw new Error('no token');
    return d;
}
async function call(fn, token, data) {
    const r = await fetch(`http://${FN_HOST}/${PROJECT}/us-central1/${fn}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
    });
    return { status: r.status, body: await r.json().catch(() => ({})) };
}

(async () => {
    console.log('\n== create-tournament.js fidelity + playability ==');

    const script = path.join(__dirname, '..', 'tournament', 'create-tournament.js');
    const run = (extra) => execFileSync('node', [script,
        '--name', 'Emulator Fidelity Check', '--join-code', CODE, '--flag', FLAG,
        '--teams', '6', '--points', '500', '--project', PROJECT, ...extra], { encoding: 'utf8', env: process.env });

    /* 1. Dry run must write nothing. */
    const before = (await db.collection('tournaments').get()).size;
    run([]);
    chk('dry run creates nothing', (await db.collection('tournaments').get()).size === before,
        `tournaments still ${before}`);

    /* 2. Create for real, in the emulator. */
    const out = run(['--write']);
    const tid = (out.match(/CREATED (\S+)/) || [])[1];
    chk('created and reported an id', !!tid, tid || out.slice(-160));
    if (!tid) { console.log(`\n  ${pass} passed, ${fail + 1} failed\n`); process.exit(1); }

    const tRef = db.doc(`tournaments/${tid}`);
    const t = await tRef.get();
    const priv = await tRef.collection('private').doc('config').get();
    const ch = await tRef.collection('challenges').doc('ch-01').get();
    const sec = await tRef.collection('flagSecrets').doc('ch-01').get();
    const teams = await tRef.collection('teams').get();

    /* 3. SHAPE, against the console's own production output. */
    chk('tournament field set matches the CONSOLE-created reference exactly',
        eq(Object.keys(t.data()).sort(), REF.tournament), Object.keys(t.data()).sort().join(','));
    chk('private/config field set matches', eq(Object.keys(priv.data()).sort(), REF.privateConfig),
        Object.keys(priv.data()).sort().join(','));
    chk('challenge field set matches (boxId included, see header)',
        eq(Object.keys(ch.data()).sort(), REF.challenge), Object.keys(ch.data()).sort().join(','));
    chk('team field set matches', eq(Object.keys(teams.docs[0].data()).sort(), REF.team),
        Object.keys(teams.docs[0].data()).sort().join(','));

    /* 4. The two failures that shape alone would pass. */
    chk('the PUBLIC challenge doc carries NO flagHash and NO flagSalt',
        !('flagHash' in ch.data()) && !('flagSalt' in ch.data()), Object.keys(ch.data()).join(','));
    chk('the PUBLIC tournament doc carries NO joinCode, only hasJoinCode',
        !('joinCode' in t.data()) && t.get('hasJoinCode') === true, `hasJoinCode=${t.get('hasJoinCode')}`);
    chk('the join code IS in private/config', priv.get('joinCode') === CODE);

    /* 5. Team ids must be the SHIPPED roster, because box_pool pins to these exact ids. */
    chk('team ids are the console roster, in the ids box_pool pins to',
        eq(teams.docs.map(d => d.id).sort(), ['team-blue', 'team-cyan', 'team-gold', 'team-green', 'team-purple', 'team-red']),
        teams.docs.map(d => d.id).sort().join(','));
    chk('every team starts empty and scoreless',
        teams.docs.every(d => (d.get('members') || []).length === 0 && d.get('score') === 0 && (d.get('memberNames') || []).length === 0));
    chk('teamCount starts at 0 and status is lobby', t.get('teamCount') === 0 && t.get('status') === 'lobby',
        `${t.get('teamCount')} / ${t.get('status')}`);

    /* 6. THE SALT AND HASH AGREE. This is the defect shape cannot see. */
    const recomputed = 'sha256:' + crypto.createHash('sha256').update(sec.get('flagSalt') + ':' + FLAG).digest('hex');
    chk('flagSecrets hash recomputes from salt + flag (a disagreeing pair grades every flag wrong)',
        sec.get('flagHash') === recomputed, sec.get('flagHash') === recomputed ? 'agree' : 'MISMATCH');

    /* 7. PLAYABILITY, end to end through the real functions. Shape proves nothing about this. */
    await tRef.update({ status: 'active' });
    const u = await identity();
    const join = await call('ctfJoinTeam', u.idToken, { tournamentId: tid, teamId: 'team-red', joinCode: CODE });
    chk('a student can JOIN with the private join code', join.status === 200,
        `status=${join.status} ${JSON.stringify(join.body).slice(0, 80)}`);
    const wrongCode = await call('ctfJoinTeam', (await identity()).idToken, { tournamentId: tid, teamId: 'team-blue', joinCode: 'NOPE' });
    chk('and is REFUSED with the wrong code (the gate is real)', wrongCode.status !== 200, `status=${wrongCode.status}`);

    const bad = await call('ctfSubmitFlag', u.idToken, { tournamentId: tid, challengeId: 'ch-01', flag: 'flag{nope}' });
    chk('a WRONG flag is graded incorrect', bad.body && bad.body.result && bad.body.result.correct === false,
        JSON.stringify(bad.body).slice(0, 70));
    await new Promise(r => setTimeout(r, 10500));   // the 10s team+challenge cooldown is real
    const good = await call('ctfSubmitFlag', u.idToken, { tournamentId: tid, challengeId: 'ch-01', flag: FLAG });
    chk('the CORRECT flag scores, so the tournament is actually playable',
        good.body && good.body.result && good.body.result.correct === true && good.body.result.points === 500,
        JSON.stringify(good.body).slice(0, 90));
    const red = await tRef.collection('teams').doc('team-red').get();
    chk('and the team was really credited (read back, not the callable response)', red.get('score') === 500,
        `score=${red.get('score')}`);

    /* 8. The safety refusal must actually fire. */
    let refused = false;
    try {
        execFileSync('node', [script, '--name', 'X', '--join-code', 'X', '--flag', 'f', '--project', PROJECT, '--write'],
            { encoding: 'utf8', env: { ...process.env, FIRESTORE_EMULATOR_HOST: '' } });
    } catch (e) { refused = /PRODUCTION write/.test((e.stdout || '') + (e.stderr || '')); }
    chk('a --write with no emulator host REFUSES unless --production is passed', refused);

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
