#!/usr/bin/env node
'use strict';
/**
 * inspect-perteam-preflight.test.js
 *
 * @catalog what   Drives the real inspect-tournaments.js against seeded fixtures to prove the
 *                 pre-flight gate recognises per-team flags, catches a PARTIAL map, catches
 *                 provenance drift, and still fails a challenge with no secret at all
 * @catalog run    firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/inspect-perteam-preflight.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS. `_docs/operations/running-a-tournament.md` section 9 tells the operator to trust
 * inspect-tournaments.js unconditionally before every event. Per-team flags broke it in BOTH
 * directions and Chris caught it: a CORRECT per-team challenge has no top-level flagSalt/flagHash,
 * so the doc-level check reported it as having no secret at all -- the crying-wolf failure that
 * file's own comment warns about -- while a PARTIAL perTeam map, where some teams cannot score for
 * the whole event, passed in silence.
 *
 * The fix makes the check look inside perTeam, which is also how a check gets accidentally loosened
 * into uselessness. So the controls here matter as much as the new assertions: a challenge with NO
 * secret of either shape must still fail, and a legacy shared-flag challenge must still pass.
 *
 * Runs the SHIPPED script as a subprocess against the emulator rather than reimplementing its logic.
 */
/* HARD SAFETY GUARD, and it is not decorative. The script under test hardcodes
 * `projectId: 'hexworth-prime'`, so the fixtures must be seeded under that SAME id or the subprocess
 * reads a different project namespace inside the emulator and sees nothing -- which is exactly what
 * happened first, and every assertion "passed" because no problem lines existed at all.
 *
 * But a real project id with no emulator host points at PRODUCTION. The emulator is what makes that
 * id harmless, so its presence is checked rather than assumed: this repo has already had a test reach
 * a live surface because the environment was assumed rather than verified. No host, no run.
 *
 * FIRST STATEMENT IN THE FILE, before the requires: placed after them, a missing module threw before
 * the guard could speak, so the one situation where a mistake is most likely was the one situation
 * where the guard was silent. */
if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('REFUSING TO RUN: FIRESTORE_EMULATOR_HOST is not set, and this suite seeds fixtures\n'
        + 'under projectId "hexworth-prime" so the script under test can see them. Without the emulator\n'
        + 'that id is PRODUCTION. Run it through: firebase emulators:exec --only firestore --project=demo-hexworth');
    process.exit(1);
}

const { execFileSync } = require('child_process');
const path = require('path');
const admin = require('firebase-admin');

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const H = (n) => 'sha256:' + String(n).repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a');
const S = (n) => String(n).repeat(32).slice(0, 32).replace(/[^0-9a-f]/g, 'b');

async function seed() {
    const TID = 't-preflight';
    await db.doc(`tournaments/${TID}`).set({ name: 'Preflight', status: 'active' });
    const teams = ['team-a', 'team-b'];
    for (const t of teams) {
        await db.doc(`tournaments/${TID}/teams/${t}`).set({ name: t.toUpperCase(), members: [], score: 0, solves: [] });
    }

    /* ch-ok: per-team, COMPLETE, provenance matches the wiring. The false-alarm case. */
    await db.doc(`tournaments/${TID}/challenges/ch-ok`).set({ title: 'ok', points: 500, visible: true });
    await db.doc(`tournaments/${TID}/flagSecrets/ch-ok`).set({
        perTeam: { 'team-a': { flagSalt: S(1), flagHash: H(1), box: 'e1-a' },
                   'team-b': { flagSalt: S(2), flagHash: H(2), box: 'e1-b' } } });
    await db.doc(`tournaments/${TID}/teams/team-a/assignments/ch-ok`).set({ challengeId: 'ch-ok', fromPool: 'e1-a' });
    await db.doc(`tournaments/${TID}/teams/team-b/assignments/ch-ok`).set({ challengeId: 'ch-ok', fromPool: 'e1-b' });

    /* ch-partial: team-b has NO entry, so team-b cannot score for the whole event. Silent before. */
    await db.doc(`tournaments/${TID}/challenges/ch-partial`).set({ title: 'partial', points: 500, visible: true });
    await db.doc(`tournaments/${TID}/flagSecrets/ch-partial`).set({
        perTeam: { 'team-a': { flagSalt: S(3), flagHash: H(3), box: 'e1-a' } } });
    await db.doc(`tournaments/${TID}/teams/team-a/assignments/ch-partial`).set({ challengeId: 'ch-partial', fromPool: 'e1-a' });
    await db.doc(`tournaments/${TID}/teams/team-b/assignments/ch-partial`).set({ challengeId: 'ch-partial', fromPool: 'e1-b' });

    /* ch-stale: team-a's flag was minted on e1-a but the team is wired to e1-z now. */
    await db.doc(`tournaments/${TID}/challenges/ch-stale`).set({ title: 'stale', points: 500, visible: true });
    await db.doc(`tournaments/${TID}/flagSecrets/ch-stale`).set({
        perTeam: { 'team-a': { flagSalt: S(4), flagHash: H(4), box: 'e1-a' },
                   'team-b': { flagSalt: S(5), flagHash: H(5), box: 'e1-b' } } });
    await db.doc(`tournaments/${TID}/teams/team-a/assignments/ch-stale`).set({ challengeId: 'ch-stale', fromPool: 'e1-z' });
    await db.doc(`tournaments/${TID}/teams/team-b/assignments/ch-stale`).set({ challengeId: 'ch-stale', fromPool: 'e1-b' });

    /* ch-noprov: entries written before provenance existed. Must be reported as UNVERIFIABLE, not OK. */
    await db.doc(`tournaments/${TID}/challenges/ch-noprov`).set({ title: 'noprov', points: 500, visible: true });
    await db.doc(`tournaments/${TID}/flagSecrets/ch-noprov`).set({
        perTeam: { 'team-a': { flagSalt: S(6), flagHash: H(6) }, 'team-b': { flagSalt: S(7), flagHash: H(7) } } });
    await db.doc(`tournaments/${TID}/teams/team-a/assignments/ch-noprov`).set({ challengeId: 'ch-noprov', fromPool: 'e1-a' });
    await db.doc(`tournaments/${TID}/teams/team-b/assignments/ch-noprov`).set({ challengeId: 'ch-noprov', fromPool: 'e1-b' });

    /* CONTROLS. ch-shared is a legacy simulated challenge and must stay clean; ch-none has no
     * secret of either shape and must STILL be reported, or the fix has loosened the gate away. */
    await db.doc(`tournaments/${TID}/challenges/ch-shared`).set({ title: 'shared', points: 100, visible: true });
    await db.doc(`tournaments/${TID}/flagSecrets/ch-shared`).set({ flagSalt: S(8), flagHash: H(8) });
    await db.doc(`tournaments/${TID}/challenges/ch-none`).set({ title: 'none', points: 100, visible: true });
    return TID;
}

(async () => {
    const TID = await seed();
    const script = path.join(__dirname, '..', 'tournament', 'inspect-tournaments.js');
    let out;
    try {
        out = execFileSync('node', [script, '--tournament', TID], {
            encoding: 'utf8', env: { ...process.env, FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080' },
        });
    } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }

    console.log('\n== inspect-tournaments.js per-team pre-flight ==');

    /* THE FALSE ALARM Chris found. A correct per-team challenge must not be named as secret-less. */
    const noSecretLine = (out.match(/have NO flagSecrets entry[^\n]*/) || [''])[0];
    chk('a CORRECT per-team challenge is NOT reported as having no flag secret',
        !/ch-ok/.test(noSecretLine), noSecretLine.slice(0, 120) || '(no such problem line)');

    /* THE SILENT ONE. A partial map must be named, and must name the team that cannot score. */
    const partial = (out.match(/INCOMPLETE perTeam[^\n]*/) || [''])[0];
    chk('a PARTIAL perTeam map is reported and names the team', /ch-partial/.test(partial) && /TEAM-B/i.test(partial),
        partial.slice(0, 150) || '(not reported)');
    chk('the complete challenge is NOT named as incomplete', !/ch-ok/.test(partial), partial.slice(0, 80));

    /* PROVENANCE DRIFT, the one that both locks a team out and implicates them. */
    const stale = (out.match(/minted on a DIFFERENT box[^\n]*/) || [''])[0];
    chk('provenance DRIFT is reported and names both boxes',
        /ch-stale/.test(stale) && /e1-a/.test(stale) && /e1-z/.test(stale), stale.slice(0, 160) || '(not reported)');
    chk('a team whose box still matches is NOT reported as drifted', !/team-b|TEAM-B/.test(stale.replace(/ch-stale\/TEAM-A[^|]*/gi, '')), stale.slice(0, 120));

    const unver = (out.match(/record no box provenance[^\n]*/) || [''])[0];
    chk('entries with NO provenance are reported as unverifiable, not as agreeing',
        /ch-noprov/.test(unver), unver.slice(0, 140) || '(not reported)');

    /* CONTROLS: the gate must still fail what it used to fail. */
    chk('CONTROL: a challenge with NO secret of either shape is STILL reported',
        /ch-none/.test(noSecretLine), noSecretLine.slice(0, 120) || '(no such problem line)');
    chk('CONTROL: a legacy SHARED-flag challenge is reported clean',
        !/ch-shared/.test(noSecretLine) && !/ch-shared/.test(partial) && !/ch-shared/.test(stale),
        'shared challenge unflagged');
    chk('CONTROL: the tool still exits having printed a problem summary for this tournament',
        /ch-none/.test(out), 'problems printed');

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
