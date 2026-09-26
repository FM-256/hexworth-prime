#!/usr/bin/env node
'use strict';
/**
 * swap-box-pool.test.js
 *
 * @catalog what   Drives the real swap-box-pool.js against the emulator: the happy swap, and every
 *                 refusal that stops one physical machine reaching two teams
 * @catalog run    firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/swap-box-pool.test.js"
 * @catalog status TOOL
 *
 * WHY THE REFUSALS ARE THE SUBJECT. The happy path is a few writes; the value is in what it declines.
 * The console's equivalent took four review rounds and every refusal in it exists because a reviewer
 * PROVED the alternative: two tournaments wired from one pool put two teams on one physical machine,
 * each able to watch or sabotage the other's work. A reimplementation that kept the writes and lost
 * the refusals would look correct on the day and fail exactly once, during an event.
 *
 * So each refusal gets a fixture that triggers it, and each is asserted to write NOTHING.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const admin = require('firebase-admin');

if (!process.env.FIRESTORE_EMULATOR_HOST) { console.error('REFUSING: emulator only.'); process.exit(1); }
const PROJECT = 'demo-hexworth';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const SCRIPT = path.join(__dirname, '..', 'tournament', 'swap-box-pool.js');

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };
const run = (args) => {
    try { return { out: execFileSync('node', [SCRIPT, '--project', PROJECT, ...args], { encoding: 'utf8', env: process.env }), code: 0 }; }
    catch (e) { return { out: (e.stdout || '') + (e.stderr || ''), code: e.status || 1 }; }
};

const TEAMS = ['team-red', 'team-blue'];
async function wipe() {
    for (const c of ['box_pool']) {
        for (const d of (await db.collection(c).get()).docs) await d.ref.delete();
    }
    for (const t of (await db.collection('tournaments').get()).docs) {
        for (const tm of (await t.ref.collection('teams').get()).docs) {
            for (const a of (await tm.ref.collection('assignments').get()).docs) await a.ref.delete();
            await tm.ref.delete();
        }
        await t.ref.delete();
    }
}
/* A fresh world per case: a shared one let an earlier refusal's leftovers decide a later case. */
async function world({ fromStatus = 'ended', poolCount = 2, sameUrl = false, claimedBy = null, wired = true } = {}) {
    await wipe();
    await db.doc('tournaments/t-old').set({ name: 'Old', status: fromStatus });
    await db.doc('tournaments/t-new').set({ name: 'New', status: 'lobby' });
    for (const t of TEAMS) {
        await db.doc(`tournaments/t-old/teams/${t}`).set({ name: t, members: [], memberNames: [] });
        await db.doc(`tournaments/t-new/teams/${t}`).set({ name: t, members: [], memberNames: [] });
    }
    for (let i = 0; i < poolCount; i++) {
        const t = TEAMS[i] || null;
        await db.doc(`box_pool/box-${i}`).set({
            url: sameUrl ? 'https://x/t/same/' : `https://x/t/tok${i}/`,
            teamId: t, username: 'player',
            assignedTo: claimedBy ? { tournamentId: claimedBy, teamId: t, challengeId: 'ch-01' } : (wired && t ? { tournamentId: 't-old', teamId: t, challengeId: 'ch-01' } : null),
        });
        if (wired && t && !claimedBy) {
            await db.doc(`tournaments/t-old/teams/${t}/assignments/ch-01`)
                .set({ challengeId: 'ch-01', url: `https://x/t/tok${i}/`, fromPool: `box-${i}` });
        }
    }
}
const wroteNothing = async () => {
    for (const t of TEAMS) {
        if ((await db.doc(`tournaments/t-new/teams/${t}/assignments/ch-01`).get()).exists) return false;
    }
    return true;
};

(async () => {
    console.log('\n== swap-box-pool: the happy swap, and every refusal ==');

    /* 1. HAPPY PATH. */
    await world();
    const dry = run(['--from', 't-old', '--to', 't-new']);
    chk('dry run plans the swap and writes nothing', dry.code === 0 && await wroteNothing(),
        `exit=${dry.code}`);
    const w = run(['--from', 't-old', '--to', 't-new', '--write']);
    chk('the swap succeeds and verifies itself', w.code === 0 && /SWAPPED and verified/.test(w.out),
        `exit=${w.code} ${w.out.trim().split('\n').pop()}`);
    {
        const a = await db.doc('tournaments/t-new/teams/team-red/assignments/ch-01').get();
        const b = await db.doc('box_pool/box-0').get();
        const old = await db.doc('tournaments/t-old/teams/team-red/assignments/ch-01').get();
        chk('the new tournament holds the assignment, the claim moved, the old assignment is revoked',
            a.exists && b.get('assignedTo').tournamentId === 't-new' && !old.exists,
            `new=${a.exists} claim=${b.get('assignedTo').tournamentId} oldGone=${!old.exists}`);
        chk('each team kept the box PINNED to it', a.get('fromPool') === 'box-0',
            `team-red -> ${a.get('fromPool')}`);
    }

    /* 2. A LIVE tournament must not have its machines pulled out from under it. */
    await world({ fromStatus: 'active' });
    const live = run(['--from', 't-old', '--to', 't-new', '--write']);
    chk('REFUSES to release from an ACTIVE tournament, and writes nothing',
        live.code !== 0 && /only allowed from ended/.test(live.out) && await wroteNothing(), `exit=${live.code}`);

    /* 3. Fewer boxes than teams: unfair, not partially ready. */
    await world({ poolCount: 1 });
    const short = run(['--from', 't-old', '--to', 't-new', '--write']);
    chk('REFUSES when the pool is shorter than the roster, and writes nothing',
        short.code !== 0 && /unfair rather than partially ready/.test(short.out) && await wroteNothing(), `exit=${short.code}`);

    /* 4. THE ONE THAT MATTERS MOST: two teams pointed at one machine. */
    await world({ sameUrl: true });
    const dup = run(['--from', 't-old', '--to', 't-new', '--write']);
    chk('REFUSES two pool entries sharing a URL, and writes nothing',
        dup.code !== 0 && /share a URL/.test(dup.out) && await wroteNothing(), `exit=${dup.code}`);

    /* 5. A box another event is still holding. */
    await world({ claimedBy: 't-other' });
    const held = run(['--from', 't-old', '--to', 't-new', '--write']);
    chk('REFUSES a box claimed by a THIRD tournament, and writes nothing',
        held.code !== 0 && /claimed by another event/.test(held.out) && await wroteNothing(), `exit=${held.code}`);

    /* 6. The production-write gate. */
    let refused = false;
    try {
        execFileSync('node', [SCRIPT, '--project', PROJECT, '--from', 't-old', '--to', 't-new', '--write'],
            { encoding: 'utf8', env: { ...process.env, FIRESTORE_EMULATOR_HOST: '' } });
    } catch (e) { refused = /PRODUCTION write/.test((e.stdout || '') + (e.stderr || '')); }
    chk('a --write with no emulator host REFUSES without --production', refused);

    /* 7. Idempotence: re-running a completed swap must not corrupt it. */
    await world();
    run(['--from', 't-old', '--to', 't-new', '--write']);
    const again = run(['--from', 't-old', '--to', 't-new', '--write']);
    const a2 = await db.doc('tournaments/t-new/teams/team-red/assignments/ch-01').get();
    chk('re-running the same swap is safe and leaves the wiring intact',
        again.code === 0 && a2.exists && a2.get('fromPool') === 'box-0', `exit=${again.code}`);

    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
