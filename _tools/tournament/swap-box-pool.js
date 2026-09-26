#!/usr/bin/env node
'use strict';
/**
 * swap-box-pool.js
 *
 * @catalog what   Releases the real-box pool from one tournament and wires it to another, carrying the
 *                 admin console's refusals so a swap cannot put two teams on one machine
 * @catalog run    node _tools/tournament/swap-box-pool.js --from <tid> --to <tid> --challenge <chId> [--write]
 * @catalog status TOOL
 *
 * WHY NOT JUST REUSE THE CONSOLE'S FUNCTION. wirePoolToTeams is the audited implementation and I would
 * rather run it than retype it -- ctf-box-pool.test.js does exactly that, shimming `_firestoreModule`
 * and evaluating the shipped bytes. That harness is built on the CLIENT modular SDK though, and this
 * has to run as an admin from a shell, so reusing it would mean writing an admin-SDK adapter for
 * `doc`/`getDocs`/`runTransaction`/`deleteField` and trusting that adapter on a production write. A new
 * translation layer is its own defect surface, introduced at the worst moment.
 *
 * So the REFUSALS are reproduced explicitly instead, and named after what they prevent rather than
 * copied blind. They are the part that took four review rounds:
 *   - pool shorter than the roster            a tournament where some teams have a machine and others
 *                                             do not is unfair, not partially ready
 *   - the same URL twice inside the plan      one physical machine handed to two teams
 *   - a URL twin claimed by another event     same outcome by the back door, across pools
 *   - a box still claimed elsewhere           the claim is what stops a second event taking it
 * If any fires, nothing is written and the operator is told to use the console, which is where the
 * transactional version lives.
 *
 * DRY RUN BY DEFAULT. A write outside the emulator needs --production, same contract as the other two
 * tools in this directory.
 */
const admin = require('firebase-admin');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FROM = arg('--from');
const TO = arg('--to');
const CHID = arg('--challenge', 'ch-01');
const PROJECT = arg('--project', 'hexworth-prime');
const WRITE = process.argv.includes('--write');
const PROD = process.argv.includes('--production');
if (!FROM || !TO) { console.error('usage: --from <tid> --to <tid> [--challenge ch-01] [--write] [--production]'); process.exit(2); }
if (FROM === TO) { console.error('--from and --to are the same tournament'); process.exit(2); }
const EMU = !!process.env.FIRESTORE_EMULATOR_HOST;
if (WRITE && !EMU && !PROD) {
    console.error('REFUSING: --write with no FIRESTORE_EMULATOR_HOST is a PRODUCTION write. Add --production.');
    process.exit(1);
}
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const norm = (u) => String(u == null ? '' : u).trim();

(async () => {
    const [fromSnap, toSnap] = await Promise.all([db.doc(`tournaments/${FROM}`).get(), db.doc(`tournaments/${TO}`).get()]);
    if (!fromSnap.exists) { console.error(`--from ${FROM} not found`); process.exit(1); }
    if (!toSnap.exists) { console.error(`--to ${TO} not found`); process.exit(1); }
    console.log(`target : ${EMU ? 'EMULATOR' : 'PRODUCTION'} project=${PROJECT}`);
    console.log(`from   : ${fromSnap.get('name')}  status=${fromSnap.get('status')}`);
    console.log(`to     : ${toSnap.get('name')}  status=${toSnap.get('status')}  challenge=${CHID}`);

    /* The console releases only from a tournament that is ended/draft/missing, an ALLOWLIST rather than
     * a blocklist, so a live event cannot have its machines pulled out from under it. Same rule here. */
    const fromStatus = fromSnap.get('status');
    if (!['ended', 'draft', 'missing'].includes(fromStatus)) {
        console.error(`\nREFUSED: --from is "${fromStatus}". Release is only allowed from ended/draft/missing, `
            + 'so a live event cannot lose its machines mid-play. End it first.');
        process.exit(1);
    }

    const [pool, toTeams] = await Promise.all([
        db.collection('box_pool').get(),
        db.collection(`tournaments/${TO}/teams`).get(),
    ]);
    const boxes = pool.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.url);
    const teams = toTeams.docs.map(d => ({ id: d.id, name: d.get('name') || d.id })).sort((a, b) => a.id.localeCompare(b.id));

    if (!boxes.length) { console.error('\nREFUSED: the pool has no entries with a URL.'); process.exit(1); }
    if (boxes.length < teams.length) {
        console.error(`\nREFUSED: ${teams.length} team(s) but only ${boxes.length} box(es) with a URL. `
            + 'A tournament where some teams have a machine and others do not is unfair rather than partially ready.');
        process.exit(1);
    }

    /* Plan: pinned box first, exactly as the console does, so a clone named for a team lands on it. */
    const byTeam = new Map(boxes.filter(b => b.teamId).map(b => [b.teamId, b]));
    const spare = boxes.filter(b => !b.teamId || !teams.some(t => t.id === b.teamId));
    let si = 0;
    const plan = [];
    for (const t of teams) {
        const pick = byTeam.get(t.id) || spare[si++];
        if (!pick) { console.error('\nREFUSED: ran out of boxes while planning.'); process.exit(1); }
        plan.push({ team: t, box: pick });
    }

    // Two teams pointed at one machine, inside this plan.
    const seen = new Map();
    const dupes = [];
    for (const r of plan) {
        const u = norm(r.box.url);
        if (seen.has(u)) dupes.push(`${seen.get(u)} and ${r.box.id} share a URL`);
        else seen.set(u, r.box.id);
    }
    if (dupes.length) { console.error('\nREFUSED: ' + dupes.join(' | ')); process.exit(1); }

    // A box still claimed by anything other than the tournament we are releasing.
    const heldElsewhere = plan.filter(r => r.box.assignedTo && r.box.assignedTo.tournamentId
        && r.box.assignedTo.tournamentId !== FROM && r.box.assignedTo.tournamentId !== TO);
    // The same machine present twice in the POOL and claimed under a different id.
    const twins = [];
    for (const r of plan) {
        const u = norm(r.box.url);
        for (const b of boxes) {
            if (b.id === r.box.id || norm(b.url) !== u) continue;
            if (b.assignedTo && b.assignedTo.tournamentId && b.assignedTo.tournamentId !== FROM) {
                twins.push(`${r.box.id} shares a URL with ${b.id}, which is claimed by ${b.assignedTo.tournamentId}`);
            }
        }
    }
    if (heldElsewhere.length || twins.length) {
        console.error('\nREFUSED: machines are claimed by another event, so wiring would hand one box to two teams.');
        heldElsewhere.forEach(r => console.error(`  ${r.box.id} -> ${r.box.assignedTo.tournamentId}`));
        twins.forEach(t => console.error(`  ${t}`));
        console.error('Use the admin console, which resolves this transactionally.');
        process.exit(1);
    }

    // What release will revoke: assignments under FROM that came from these pool entries.
    const ids = plan.map(r => r.box.id);
    const revoke = [];
    for (const d of (await db.collection(`tournaments/${FROM}/teams`).get()).docs) {
        const a = await db.doc(`tournaments/${FROM}/teams/${d.id}/assignments/${CHID}`).get();
        if (a.exists && ids.includes(a.get('fromPool'))) revoke.push({ ref: a.ref, team: d.id, box: a.get('fromPool') });
    }

    console.log(`\nRELEASE from ${FROM}: ${revoke.length} assignment(s), ${ids.length} claim(s)`);
    revoke.forEach(r => console.log(`  revoke ${r.team} -> ${r.box}`));
    console.log(`\nWIRE to ${TO} on ${CHID}:`);
    plan.forEach(r => console.log(`  ${r.team.name.padEnd(14)} <- ${r.box.id}${r.box.teamId === r.team.id ? ' (pinned)' : ''}`));
    if (!WRITE) { console.log('\nDRY RUN. Nothing written. Re-run with --write.'); process.exit(0); }

    await db.runTransaction(async (tx) => {
        /* Re-read every pool doc inside the transaction: a claim appearing between the plan and the
         * commit must abort rather than be overwritten, which is the race the console's own wiring was
         * rewritten to close. */
        for (const r of plan) {
            const live = await tx.get(db.doc(`box_pool/${r.box.id}`));
            const at = live.exists ? live.get('assignedTo') : null;
            if (at && at.tournamentId && at.tournamentId !== FROM && at.tournamentId !== TO) {
                throw new Error(`${r.box.id} was claimed by ${at.tournamentId} between plan and commit. Nothing written.`);
            }
        }
        for (const r of revoke) tx.delete(r.ref);
        for (const r of plan) {
            tx.set(db.doc(`tournaments/${TO}/teams/${r.team.id}/assignments/${CHID}`), {
                challengeId: CHID, url: r.box.url,
                username: r.box.username || null, password: r.box.password || null,
                note: r.box.note || null, fromPool: r.box.id, assignedAt: FieldValue.serverTimestamp(),
            });
            tx.set(db.doc(`box_pool/${r.box.id}`), {
                assignedTo: { tournamentId: TO, teamId: r.team.id, challengeId: CHID },
                assignedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        }
    });

    /* Verify against the documents, not the write returning. */
    let ok = true;
    for (const r of plan) {
        const a = await db.doc(`tournaments/${TO}/teams/${r.team.id}/assignments/${CHID}`).get();
        const b = await db.doc(`box_pool/${r.box.id}`).get();
        const good = a.exists && a.get('fromPool') === r.box.id
            && b.get('assignedTo') && b.get('assignedTo').tournamentId === TO;
        if (!good) ok = false;
        console.log(`  ${r.team.id.padEnd(12)} assignment=${a.exists} claim=${b.get('assignedTo') ? b.get('assignedTo').tournamentId : 'none'}`);
    }
    const left = [];
    for (const r of revoke) if ((await r.ref.get()).exists) left.push(r.team);
    if (left.length) { ok = false; console.error(`  STALE assignments still under ${FROM}: ${left.join(', ')}`); }
    console.log(ok ? '\nSWAPPED and verified.' : '\nVERIFICATION FAILED.');
    process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FAILED, nothing partial (single transaction):', e.message); process.exit(1); });
