#!/usr/bin/env node
/**
 * ctf-perteam-flags.test.js
 *
 * @catalog what   Proves per-team flags actually isolate scoring: a team's flag is CORRECT for that
 *                 team and INCORRECT for every other, and a team with no entry is refused.
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-perteam-flags.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS (taskboard 407). Engine 1 gives every team its own Windows box, and every box carried
 * the SAME flag: measured by hashing the proof file on all six clones and getting one identical
 * digest. So the first team to escalate could hand the string to the rest and the scoreboard measured
 * who pasted fastest. Per-team boxes with a shared flag is isolation in the infrastructure and none
 * in the scoring, which is the half that decides who wins.
 *
 * THE ASSERTION THAT MATTERS is the negative one: team B submitting team A's flag must be marked
 * WRONG. A suite that only checked "each team's own flag works" would pass just as happily on the
 * shared-flag code this replaces, because there every flag works for everyone. So the cross-team
 * rejection is asserted for every ordered pair, not once.
 *
 * It also asserts the REFUSAL for a team with no per-team entry. Grading such a team against the
 * shared value would be the posture fallback that made TOURN-03's joinCode gap permanent, and it
 * would hand one team a flag that no box of theirs contains.
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

async function identity() {
    const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
    });
    const d = await r.json();
    if (!d.idToken) throw new Error('auth emulator minted no token');
    return d;
}
async function call(fn, token, data) {
    const r = await fetch(CALL(fn), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
    });
    const d = await r.json().catch(() => ({}));
    return { status: r.status, body: d };
}
const hash = (salt, flag) => 'sha256:' + crypto.createHash('sha256').update(salt + ':' + flag).digest('hex');

const TEAMS = ['team-red', 'team-blue', 'team-green'];
const FLAG = (t) => `flag{engine1_${t}_${t.length}aa}`;

(async () => {
    console.log('\n== per-team flags (real ctfSubmitFlag) ==');

    /* T1: per-team flags. Each team gets its own flag AND its own salt, so two teams with the same
     * flag text would still hash differently. */
    const perTeam = {};
    for (const t of TEAMS) {
        const salt = crypto.randomBytes(16).toString('hex');
        perTeam[t] = { flagSalt: salt, flagHash: hash(salt, FLAG(t)) };
    }
    /* team-gold exists as a team but deliberately has NO per-team entry. */
    const ALL = TEAMS.concat(['team-gold']);
    const uid = {};
    for (const t of ALL) uid[t] = await identity();

    await db.doc('tournaments/t-pt').set({ name: 'PerTeam', status: 'active', hasJoinCode: false });
    for (const t of ALL) {
        await db.doc(`tournaments/t-pt/teams/${t}`).set({ name: t, members: [uid[t].localId], score: 0, solves: [] });
    }
    await db.doc('tournaments/t-pt/challenges/ch-01').set({ title: 'Real box', points: 500, currentPoints: 500, visible: true, solveCount: 0 });
    /* No top-level flagSalt/flagHash at all: a per-team challenge should not need one, and leaving a
     * shared secret lying around is a gradeable value no box contains. */
    await db.doc('tournaments/t-pt/flagSecrets/ch-01').set({ perTeam });

    // Each team's OWN flag must be accepted.
    for (const t of TEAMS) {
        const r = await call('ctfSubmitFlag', uid[t].idToken, { tournamentId: 't-pt', challengeId: 'ch-01', flag: FLAG(t) });
        chk(`${t}: its own flag is CORRECT`, r.body && r.body.result && r.body.result.correct === true,
            JSON.stringify(r.body && r.body.result || r.body).slice(0, 80));
    }

    /* THE POINT OF THE WHOLE CHANGE. Every ordered cross pair must be rejected. Under the old shared
     * flag every one of these would have been accepted. Fresh identities, because a team that has
     * already solved is short-circuited by the solves check and would pass for the wrong reason. */
    await db.doc('tournaments/t-pt2').set({ name: 'PerTeam2', status: 'active', hasJoinCode: false });
    const uid2 = {};
    for (const t of ALL) {
        uid2[t] = await identity();
        await db.doc(`tournaments/t-pt2/teams/${t}`).set({ name: t, members: [uid2[t].localId], score: 0, solves: [] });
    }
    await db.doc('tournaments/t-pt2/challenges/ch-01').set({ title: 'Real box', points: 500, currentPoints: 500, visible: true, solveCount: 0 });
    await db.doc('tournaments/t-pt2/flagSecrets/ch-01').set({ perTeam });

    /* ONE CHALLENGE PER SUBMISSION SLOT, and this is a correction to the first version of this test.
     * The submission rate limit is keyed `tc_{teamId}_{challengeId}` with a 10s cooldown, so when all
     * six cross pairs ran against a single challenge only THREE were ever graded -- the rest came
     * back 429, and `correct !== true` is true of a 429, so those pairs "passed" without the grading
     * logic being reached at all. The assertion I was most confident in was matching the wrong
     * wrong-answer. Each team's k-th borrowed flag therefore goes to its own challenge, which makes
     * every (team, challenge) pair unique and every submission a real graded attempt, and the check
     * below now demands the GRADED shape (200 with correct:false) rather than merely "not correct".
     * Identical configs, so the response bodies are comparable. */
    const SLOTS = TEAMS.length - 1;
    for (let k = 0; k < SLOTS; k++) {
        await db.doc(`tournaments/t-pt2/challenges/ch-x${k}`)
            .set({ title: 'Real box', points: 500, currentPoints: 500, visible: true, solveCount: 0 });
        await db.doc(`tournaments/t-pt2/flagSecrets/ch-x${k}`).set({ perTeam });
    }

    const crossAccepted = [], notGraded = [], crossBodies = [];
    for (const submitter of TEAMS) {
        let k = 0;
        for (const owner of TEAMS) {
            if (submitter === owner) continue;
            const chId = `ch-x${k++}`;
            const r = await call('ctfSubmitFlag', uid2[submitter].idToken,
                { tournamentId: 't-pt2', challengeId: chId, flag: FLAG(owner) });
            const res = r.body && r.body.result;
            if (res && res.correct === true) crossAccepted.push(`${submitter} accepted ${owner}'s flag`);
            /* A refusal, a 429 or an error is NOT evidence of isolation: it means the comparison never
             * happened. Tracked separately so it can never be mistaken for a rejection. */
            if (r.status !== 200 || !res || res.correct !== false) {
                notGraded.push(`${submitter}<-${owner} status=${r.status} ${JSON.stringify(r.body).slice(0, 80)}`);
            }
            crossBodies.push({ pair: `${submitter}<-${owner}`, status: r.status, body: JSON.stringify(r.body) });
        }
    }
    const pairCount = TEAMS.length * (TEAMS.length - 1);
    chk('every cross pair was actually GRADED, not refused or rate limited',
        notGraded.length === 0 && crossBodies.length === pairCount,
        notGraded.join(' | ') || `${crossBodies.length}/${pairCount} graded`);
    chk('NO team can submit another team\'s flag', crossAccepted.length === 0,
        crossAccepted.join(' | ') || `${pairCount} cross pairs all graded and all rejected`);

    /* NO ORACLE. Grading now logs a collusion signal when a wrong flag matches another team's
     * registered hash, and that signal must be invisible to the submitter: if a borrowed flag drew
     * any different status, message or shape than a typo does, the response would CONFIRM the flag
     * was genuine and tell a cheating team to keep hunting for the right box rather than that their
     * guess was junk. So a recognised flag and pure garbage must be byte identical.
     *
     * Same challenge and same identity, so the flag is the ONLY difference -- which means waiting out
     * the 10s team+challenge cooldown rather than comparing across two challenges, because a
     * difference in points or config would make a matching body prove nothing. */
    const OCH = 'ch-oracle';
    await db.doc(`tournaments/t-pt2/challenges/${OCH}`)
        .set({ title: 'Real box', points: 500, currentPoints: 500, visible: true, solveCount: 0 });
    await db.doc(`tournaments/t-pt2/flagSecrets/${OCH}`).set({ perTeam });
    const borrowed = await call('ctfSubmitFlag', uid2[TEAMS[1]].idToken,
        { tournamentId: 't-pt2', challengeId: OCH, flag: FLAG(TEAMS[0]) });
    await new Promise(r => setTimeout(r, 10500));
    const garbage = await call('ctfSubmitFlag', uid2[TEAMS[1]].idToken,
        { tournamentId: 't-pt2', challengeId: OCH, flag: 'flag{not_a_real_flag_at_all}' });
    chk('a BORROWED flag is indistinguishable from garbage (the collusion log is not an oracle)',
        borrowed.status === 200 && garbage.status === 200
        && JSON.stringify(borrowed.body) === JSON.stringify(garbage.body),
        `borrowed ${borrowed.status} ${JSON.stringify(borrowed.body)} | garbage ${garbage.status} ${JSON.stringify(garbage.body)}`);

    // A team with no per-team entry is REFUSED, not graded against anything.
    const goldTok = (await identity());
    await db.doc('tournaments/t-pt3').set({ name: 'PerTeam3', status: 'active', hasJoinCode: false });
    await db.doc('tournaments/t-pt3/teams/team-gold').set({ name: 'gold', members: [goldTok.localId], score: 0, solves: [] });
    await db.doc('tournaments/t-pt3/challenges/ch-01').set({ title: 'Real box', points: 500, currentPoints: 500, visible: true, solveCount: 0 });
    await db.doc('tournaments/t-pt3/flagSecrets/ch-01').set({ perTeam, flagSalt: 'sharedsalt', flagHash: hash('sharedsalt', 'flag{shared_leftover}') });
    const g1 = await call('ctfSubmitFlag', goldTok.idToken, { tournamentId: 't-pt3', challengeId: 'ch-01', flag: 'flag{shared_leftover}' });
    /* Asserted as a REFUSAL, not merely as "not correct". The looser form (status !== 200 || !correct)
     * passed against a mutant that graded this team against ANOTHER team's entry and returned
     * "Incorrect flag." -- the right verdict for the wrong reason, and indistinguishable from a
     * student who simply typed the flag wrong. A misconfigured team must be TOLD, or it burns the
     * event hammering a flag that can never be accepted. So: non-200, and a message that says so. */
    const g1msg = (g1.body && g1.body.error && g1.body.error.message) || '';
    chk('a team with NO per-team entry is REFUSED, not graded on the shared value',
        g1.status !== 200 && /no flag configured/i.test(g1msg),
        `status=${g1.status} ${JSON.stringify(g1.body).slice(0, 90)}`);

    /* CONTROL: a challenge with NO perTeam must still grade on the single shared flag. Without this,
     * the assertions above could pass on code that simply refuses everything. */
    const legTok = await identity();
    const lsalt = crypto.randomBytes(16).toString('hex');
    await db.doc('tournaments/t-leg').set({ name: 'Legacy', status: 'active', hasJoinCode: false });
    await db.doc('tournaments/t-leg/teams/team-red').set({ name: 'red', members: [legTok.localId], score: 0, solves: [] });
    await db.doc('tournaments/t-leg/challenges/ch-01').set({ title: 'Simulated', points: 100, currentPoints: 100, visible: true, solveCount: 0 });
    await db.doc('tournaments/t-leg/flagSecrets/ch-01').set({ flagSalt: lsalt, flagHash: hash(lsalt, 'flag{one_box_one_flag}') });
    const lr = await call('ctfSubmitFlag', legTok.idToken, { tournamentId: 't-leg', challengeId: 'ch-01', flag: 'flag{one_box_one_flag}' });
    chk('CONTROL: a shared-flag challenge still grades correctly', lr.body && lr.body.result && lr.body.result.correct === true,
        JSON.stringify(lr.body && lr.body.result || lr.body).slice(0, 80));

    const lw = await call('ctfSubmitFlag', (await identity()).idToken, { tournamentId: 't-leg', challengeId: 'ch-01', flag: 'flag{wrong}' });
    chk('CONTROL: a wrong flag is still wrong', lw.status !== 200 || !(lw.body && lw.body.result && lw.body.result.correct));

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e.message); process.exit(1); });
