#!/usr/bin/env node
'use strict';
/**
 * register-perteam-flags.js
 *
 * @catalog what   Registers per-team flag salts/hashes into flagSecrets/{chId}.perTeam by running the
 *                 SHIPPED console resolver, not a reimplementation of it. Dry-run by default.
 * @catalog run    node _tools/tournament/register-perteam-flags.js --tournament <id> --challenge <id> --json <file> [--write]
 * @catalog status TOOL
 *
 * WHY THIS EXISTS AND WHY IT IS NOT A SHORTCUT. The audited path for this is the admin console's
 * Per-Team Flags card, which needs a browser and an admin session. Asked to complete it from here, the
 * lazy version would be a setDoc with the pasted map -- and that would bypass the resolver, the
 * all-or-nothing rule, the box-assignment requirement, the provenance field and the transaction, which
 * is every safeguard taskboard 419 built and three reviewers examined. A bypass that happens to
 * produce the right document today is still the wrong instrument.
 *
 * So the safeguard is REUSED rather than trusted-by-restatement: planPerTeamFlags is extracted from
 * the shipped `_app/admin/console.html` and executed here. If the console would refuse this paste,
 * this refuses it, for the same reason, in the same words. A reimplementation would be a second
 * opinion; this is the same one.
 *
 * WHERE IT IS STRONGER THAN THE CONSOLE: the Admin SDK's transaction CAN read a query, which the web
 * SDK cannot, so the team roster is read INSIDE the transaction. The console documents that gap
 * honestly and narrows it; here it is actually closed.
 *
 * DRY-RUN BY DEFAULT. Nothing is written without --write, so the plan can be inspected first exactly
 * as the console's Preview does.
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { extractDecl } = require(path.join(__dirname, '..', 'rules-test', 'lib', 'extract-shipped'));

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TID = arg('--tournament');
const CHID = arg('--challenge');
const JSONF = arg('--json');
const WRITE = process.argv.includes('--write');
if (!TID || !JSONF) {
    console.error('usage: --tournament <id> --challenge <id> --json <file> [--write]');
    console.error('  omit --challenge to list the tournament\'s challenges and exit');
    process.exit(2);
}

/* The SHIPPED resolver, brace-matched out of the deployed page. Not a copy of its logic. */
const PAGE = path.join(__dirname, '..', '..', '_app', 'admin', 'console.html');
const planPerTeamFlags = new Function(extractDecl(PAGE, 'planPerTeamFlags') + '\nreturn planPerTeamFlags;')();
const describePerTeamDrift = new Function(extractDecl(PAGE, 'describePerTeamDrift') + '\nreturn describePerTeamDrift;')();

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const tSnap = await db.doc(`tournaments/${TID}`).get();
    if (!tSnap.exists) { console.error(`tournament ${TID} not found`); process.exit(1); }
    console.log(`tournament : ${tSnap.get('name')}  status=${tSnap.get('status')}`);

    const chs = await db.collection(`tournaments/${TID}/challenges`).get();
    if (!CHID) {
        console.log('\nchallenges:');
        chs.forEach(d => console.log(`  ${d.id}  ${JSON.stringify(d.get('title'))}  points=${d.get('points')}`));
        console.log('\nRe-run with --challenge <id>.');
        process.exit(0);
    }
    if (!chs.docs.some(d => d.id === CHID)) {
        console.error(`challenge ${CHID} does not exist in this tournament`); process.exit(1);
    }

    const teamSnap = await db.collection(`tournaments/${TID}/teams`).get();
    const teams = teamSnap.docs.map(d => ({ id: d.id, name: d.get('name') || d.id }))
        .sort((a, b) => a.id.localeCompare(b.id));
    const poolByTeam = new Map();
    for (const t of teams) {
        const a = await db.doc(`tournaments/${TID}/teams/${t.id}/assignments/${CHID}`).get();
        if (a.exists && a.get('fromPool')) poolByTeam.set(t.id, a.get('fromPool'));
    }
    console.log(`teams      : ${teams.length}`);
    for (const t of teams) console.log(`  ${t.id.padEnd(24)} ${t.name.padEnd(18)} box=${poolByTeam.get(t.id) || 'NONE'}`);

    const secretRef = db.doc(`tournaments/${TID}/flagSecrets/${CHID}`);
    const before = await secretRef.get();
    const drift = describePerTeamDrift(before.exists ? before.get('perTeam') : null, teams, poolByTeam);
    console.log(`\nalready registered: ${drift.registered} entr(ies)`);
    ['drifted', 'missing', 'orphaned', 'unknown'].forEach(k => {
        if (drift[k].length) console.log(`  ${k}: ${drift[k].join(' | ')}`);
    });
    const hadShared = before.exists && before.get('flagSalt') && before.get('flagHash');
    if (hadShared) console.log('  NOTE: a shared flag is present and becomes INERT once perTeam exists (left, not removed).');

    const res = planPerTeamFlags(fs.readFileSync(JSONF, 'utf8'), teams, poolByTeam);
    if (res.refusals.length) {
        console.error(`\nREFUSED by the SHIPPED resolver (${res.refusals.length}). NOTHING written:`);
        res.refusals.forEach(r => console.error('  - ' + r));
        process.exit(1);
    }
    console.log(`\nPLAN (${res.plan.length} teams):`);
    res.plan.forEach(r => console.log(`  ${r.teamName.padEnd(18)} <- "${r.key}"  box=${r.poolId}  ${r.flagHash.slice(0, 20)}...`));

    if (!WRITE) { console.log('\nDRY RUN. Nothing written. Re-run with --write.'); process.exit(0); }

    const fingerprint = (pt) => JSON.stringify(pt ? Object.keys(pt).sort().map(k => k + ':' + (pt[k] || {}).flagHash) : null);
    const beforeFp = fingerprint(before.exists ? before.get('perTeam') : null);

    await db.runTransaction(async (tx) => {
        const live = await tx.get(secretRef);
        if (fingerprint(live.exists ? live.get('perTeam') : null) !== beforeFp) {
            throw new Error('perTeam CHANGED between plan and commit. Nothing written.');
        }
        /* The roster read INSIDE the transaction, which the web SDK cannot do. */
        const fresh = await tx.get(db.collection(`tournaments/${TID}/teams`));
        const freshIds = fresh.docs.map(d => d.id).sort().join(',');
        if (freshIds !== teams.map(t => t.id).sort().join(',')) {
            throw new Error('team roster CHANGED between plan and commit. Nothing written.');
        }
        const perTeam = {};
        for (const r of res.plan) perTeam[r.teamId] = { flagSalt: r.flagSalt, flagHash: r.flagHash, box: r.poolId || null };
        tx.set(secretRef, { perTeam, perTeamWrittenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });

    /* Verify against the document, not against the write returning. */
    const after = await secretRef.get();
    const pt = after.get('perTeam') || {};
    const ok = res.plan.every(r => pt[r.teamId] && pt[r.teamId].flagHash === r.flagHash && pt[r.teamId].box === r.poolId);
    console.log(`\nWROTE. read back ${Object.keys(pt).length} entr(ies); every planned hash+box present: ${ok ? 'YES' : 'NO'}`);
    const d2 = describePerTeamDrift(pt, teams, poolByTeam);
    console.log(`drift after write: drifted=${d2.drifted.length} missing=${d2.missing.length} orphaned=${d2.orphaned.length} unknown=${d2.unknown.length}`);
    process.exit(ok && !d2.drifted.length && !d2.missing.length ? 0 : 1);
})().catch(e => { console.error('FAILED, nothing partial (single transaction):', e.message); process.exit(1); });
