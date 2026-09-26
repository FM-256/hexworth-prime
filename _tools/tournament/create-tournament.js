#!/usr/bin/env node
'use strict';
/**
 * create-tournament.js
 *
 * @catalog what   Creates a tournament with the SAME shape the admin console produces, by running the
 *                 console's own roster and hashing code rather than reimplementing it
 * @catalog run    node _tools/tournament/create-tournament.js --name "X" --teams 6 --join-code ABCD --flag 'flag{...}' [--write]
 * @catalog status TOOL
 *
 * WHY THIS IS NOT A SECOND IMPLEMENTATION, which is the thing that makes a tool like this dangerous.
 * The admin console is the audited create path, and re-typing it in Node is how the two drift: the
 * console's own history has three such defects recorded in comments (maxTeams stored unclamped,
 * maxTeamSize accepting a negative that made every team report full, and a challenge salt derived from
 * the join code, which published it). So the parts that decide DATA are extracted from the shipped
 * page and executed here: NAMED_TEAMS, buildTeamRoster, hslToHex and hashFlag. If the console changes
 * its roster or its hashing, this changes with it.
 *
 * NAMED_TEAMS matters more than it looks: it fixes the team DOCUMENT IDS, and box_pool entries are
 * pinned to those exact ids. A hand-written list that drifted would wire real machines to teams that
 * do not exist.
 *
 * WHAT IT DELIBERATELY DOES NOT COPY. The console wrote flagHash and flagSalt onto the CHALLENGE
 * document as well as flagSecrets, a temporary dual-write removed in d872c16f0 because a challenge doc
 * is `allow read: if true` and that published the crypto. This never writes it there.
 *
 * SAFETY. Dry run by default. A write with no FIRESTORE_EMULATOR_HOST set is a PRODUCTION write and
 * must say so with --production, so an emulator run can never become a live one by omission.
 */
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');
const admin = require('firebase-admin');
const { extractDecl, extractConst } = require(path.join(__dirname, '..', 'rules-test', 'lib', 'extract-shipped'));

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const NAME = arg('--name');
const TEAMS = parseInt(arg('--teams', '6'), 10);
const CODE = arg('--join-code');
const FLAG = arg('--flag');
const TITLE = arg('--challenge-title', 'Engine 1: Foothold to Loot');
/* VALIDATED, because `parseInt('foo')` is NaN and nothing downstream rescues it. Nancy traced the
 * consequence: ctfSubmitFlag awards `currentPoints || points || 0`, and NaN is falsy, so both fields
 * being NaN makes the challenge score ZERO forever -- it degrades rather than corrupting, but silently,
 * and a challenge that can never award anything is indistinguishable from a scoring bug at the event.
 * --teams escaped this only because buildTeamRoster clamps internally; points is a raw passthrough,
 * which is exactly the gap "extract, don't reimplement" does not cover. */
const POINTS = parseInt(arg('--points', '500'), 10);
if (!Number.isFinite(POINTS) || POINTS <= 0 || POINTS > 100000) {
    console.error(`--points must be a positive number under 100000; got ${JSON.stringify(arg('--points', '500'))}`);
    process.exit(2);
}
if (!Number.isFinite(TEAMS) || TEAMS < 1) {
    console.error(`--teams must be a positive number; got ${JSON.stringify(arg('--teams', '6'))}`);
    process.exit(2);
}
const DESC = arg('--description', 'A real Windows box per team. Get a foothold, escalate, take the loot.');
const WRITE = process.argv.includes('--write');
const PROD = process.argv.includes('--production');

if (!NAME || !CODE || !FLAG) {
    console.error('usage: --name "X" --join-code ABCD --flag \'flag{...}\' [--teams 6] [--points 500]');
    console.error('       [--challenge-title "..."] [--description "..."] [--write] [--production]');
    process.exit(2);
}
const EMU = !!process.env.FIRESTORE_EMULATOR_HOST;
if (WRITE && !EMU && !PROD) {
    console.error('REFUSING: --write with no FIRESTORE_EMULATOR_HOST is a PRODUCTION write.');
    console.error('Add --production to say so deliberately, or run under firebase emulators:exec.');
    process.exit(1);
}

/* The console's own code, executed rather than described. `crypto` is bound to Node's webcrypto so the
 * extracted hashFlag (which uses crypto.subtle) runs unmodified. */
const PAGE = path.join(__dirname, '..', '..', '_app', 'admin', 'console.html');
const shipped = new Function('crypto', 'TextEncoder',
    'const NAMED_TEAMS = ' + extractConst(PAGE, 'NAMED_TEAMS') + ';\n'
    + extractDecl(PAGE, 'hslToHex') + '\n'
    + extractDecl(PAGE, 'buildTeamRoster') + '\n'
    + extractDecl(PAGE, 'hashFlag') + '\n'
    + 'return { buildTeamRoster, hashFlag };')(webcrypto, TextEncoder);

/* --project exists so a test can run this under the emulator's own project id. Both namespaces and the
 * callable URLs are per-project inside the emulator, so a creator hardcoded to one while the emulator
 * runs as another writes where nothing can read it -- which is exactly what the first test run showed
 * (404 from the function, empty body). Defaults to the real project; the emulator host is what makes
 * a non-default value safe. (The previous line here was a ternary with identical branches.) */
const PROJECT = arg('--project', 'hexworth-prime');
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

(async () => {
    const roster = shipped.buildTeamRoster(TEAMS);
    const chId = 'ch-01';
    const salt = Array.from(webcrypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    /* ONE salt, ONE hash, written once: the console's comment explains why two computations are wrong
     * even when both are internally valid. */
    const hash = await shipped.hashFlag(salt, FLAG);

    console.log(`target      : ${EMU ? 'EMULATOR ' + process.env.FIRESTORE_EMULATOR_HOST : 'PRODUCTION'} project=${PROJECT}`);
    console.log(`name        : ${NAME}`);
    console.log(`teams       : ${roster.length} -> ${roster.map(t => t.id).join(', ')}`);
    console.log(`challenge   : ${chId} "${TITLE}" ${POINTS}pts`);
    console.log(`join code   : ${CODE.length} chars, written ONLY to private/config`);
    console.log(`flag        : ${FLAG.length} chars, NOT stored; salt+hash go to flagSecrets only`);
    if (!WRITE) { console.log('\nDRY RUN. Nothing written. Re-run with --write.'); process.exit(0); }

    const tournamentData = {
        name: NAME,
        description: DESC,
        status: 'lobby',
        scoringModel: 'static',
        boardStyle: 'default',
        hasJoinCode: true,          // the CODE itself lives in private/config, never here
        maxTeamSize: 4,
        maxTeams: roster.length,
        duration: 120,
        createdBy: 'create-tournament.js',
        createdAt: FieldValue.serverTimestamp(),
        teamCount: 0,
        totalSubmissions: 0,
        totalSolves: 0,
    };
    const tRef = await db.collection('tournaments').add(tournamentData);
    await tRef.collection('private').doc('config').set({ joinCode: CODE, createdAt: FieldValue.serverTimestamp() });
    await tRef.collection('flagSecrets').doc(chId).set({ flagHash: hash, flagSalt: salt, createdAt: FieldValue.serverTimestamp() });
    await tRef.collection('challenges').doc(chId).set({
        title: TITLE, category: 'web', description: DESC,
        points: POINTS, currentPoints: POINTS,
        /* boxId stays NULL for a real-box challenge: a value renders a Launch Box button at
         * /arena/boxes/{boxId}/index.html, which does not exist for a real machine (taskboard 418). */
        boxId: null,
        solveCount: 0, hints: [], order: 0, visible: true,
    });
    const batch = db.batch();
    for (const t of roster) {
        batch.set(tRef.collection('teams').doc(t.id), {
            name: t.name, color: t.color, captain: null,
            members: [], memberNames: [], score: 0, solves: [],
            hintPenalty: 0, lastSolveTime: null, createdAt: FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();

    /* Verify by reading it back, including the two things that would be silent failures: crypto on the
     * public challenge doc, and the join code on the public tournament doc. */
    const t = await tRef.get();
    const ch = await tRef.collection('challenges').doc(chId).get();
    const sec = await tRef.collection('flagSecrets').doc(chId).get();
    const priv = await tRef.collection('private').doc('config').get();
    const teams = await tRef.collection('teams').get();
    const chKeys = Object.keys(ch.data());
    const bad = [];
    if (chKeys.includes('flagHash') || chKeys.includes('flagSalt')) bad.push('challenge doc carries crypto');
    if ('joinCode' in t.data()) bad.push('joinCode on the PUBLIC tournament doc');
    if (!priv.exists || priv.get('joinCode') !== CODE) bad.push('join code missing from private/config');
    if (sec.get('flagHash') !== hash || sec.get('flagSalt') !== salt) bad.push('flagSecrets mismatch');
    if (teams.size !== roster.length) bad.push(`team count ${teams.size} != ${roster.length}`);

    console.log(`\nCREATED ${tRef.id}`);
    console.log(`  teams=${teams.size} challenge=${chId} flagSecrets=present privateConfig=${priv.exists}`);
    console.log(`  challenge fields: ${chKeys.sort().join(', ')}`);
    if (bad.length) { console.error('  PROBLEMS: ' + bad.join(' | ')); process.exit(1); }
    console.log('  verified: no crypto on the public challenge doc, join code private only');
    console.log(`\nnext: wire the box pool to its teams, then register per-team flags.`);
    process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
