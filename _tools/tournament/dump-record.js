#!/usr/bin/env node
/**
 * dump-record.js — produce a REAL results-of-record document for render verification
 *
 * @catalog what    Runs the actual finalization transaction against the Firestore emulator and
 * @catalog what    dumps the resulting results/final (v1 and a corrected v2) to JSON, so the render
 * @catalog what    harness drives the pages with data the real function produced, not a hand-typed
 * @catalog what    fixture that could quietly disagree with the schema.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/dump-record.js <outdir>"
 * @catalog status  TOOL
 *
 * WHY NOT JUST HAND-WRITE THE FIXTURE: because then the render test proves the pages can render
 * MY IDEA of the record, which is exactly the failure mode where a consumer and a producer agree in
 * review and disagree in production. The schema has already bitten this change once — a first draft
 * dropped `color`/`memberNames` and would have flattened team identity on the projector.
 *
 * SAFETY: refuses to run unless FIRESTORE_EMULATOR_HOST is set. It writes.
 *
 * EXIT: 0 dumped, 2 could not run.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '../..');

async function main() {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.error('  CRITICAL: FIRESTORE_EMULATOR_HOST is not set — refusing to run (this writes).');
        return 2;
    }
    const outDir = process.argv[2];
    if (!outDir) { console.error('  usage: dump-record.js <outdir>'); return 2; }

    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const { finalizeTournament } = require(path.join(REPO, 'functions/ctf-finalize.js'));
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime-test' });
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;
    const Timestamp = admin.firestore.Timestamp;

    const TID = 'render-verify-tournament';
    const tRef = db.collection('tournaments').doc(TID);

    // Same fixture shape as finalize.test.js: a genuine score tie resolved by earliest solve.
    await tRef.set({ name: 'Hexworth Inaugural (render check)', status: 'active', scoringModel: 'static' });
    await tRef.collection('teams').doc('alpha').set({
        name: 'Alpha Squad', color: '#ff4d4d', score: 300, solves: ['c1', 'c2'],
        members: ['uid-a1'], memberNames: ['Ann Reyes'],
        lastSolveTime: Timestamp.fromDate(new Date('2026-10-01T10:09:00Z'))
    });
    await tRef.collection('teams').doc('zulu').set({
        name: 'Zulu Cell', color: '#4dff88', score: 300, solves: ['c1', 'c2'],
        members: ['uid-z1', 'uid-z2'], memberNames: ['Zed Okafor', 'Zoe Lin'],
        lastSolveTime: Timestamp.fromDate(new Date('2026-10-01T10:01:00Z'))
    });
    await tRef.collection('teams').doc('bravo').set({
        name: 'Bravo Unit', color: '#4db8ff', score: 100, solves: ['c1'],
        members: ['uid-b1'], memberNames: ['Bo Tran'], lastSolveTime: null
    });

    // v1 — the witnessed finalize.
    await finalizeTournament({ db, FieldValue, tournamentId: TID, actorUid: 'admin-render' });
    const v1 = (await tRef.collection('results').doc('final').get()).data();

    // v2 — a correction, so the harness can prove a corrected board renders too.
    await tRef.collection('teams').doc('zulu').update({ score: 0 });
    await finalizeTournament({
        db, FieldValue, tournamentId: TID,
        reason: 'Zulu Cell disqualified: flag sharing', actorUid: 'admin-render'
    });
    const v2 = (await tRef.collection('results').doc('final').get()).data();

    /* Timestamps are serialized to plain {seconds} — the shape the browser rule already accepts via
       solveMs(), and the shape a JSON round-trip actually produces. Using it here means the render
       harness exercises a real deserialization path rather than a convenient one. */
    const plain = (rec) => JSON.parse(JSON.stringify(rec, (k, v) =>
        (v && typeof v === 'object' && typeof v._seconds === 'number')
            ? { seconds: v._seconds } : v));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'record-v1.json'), JSON.stringify(plain(v1), null, 1));
    fs.writeFileSync(path.join(outDir, 'record-v2.json'), JSON.stringify(plain(v2), null, 1));

    console.log('  dumped v1:', v1.standings.map(s => s.position + '.' + s.name).join('  '));
    console.log('  dumped v2:', v2.standings.map(s => s.position + '.' + s.name).join('  '));

    for (const sub of ['teams', 'results']) {
        const s = await tRef.collection(sub).get();
        await Promise.all(s.docs.map(d => d.ref.delete()));
    }
    await tRef.delete().catch(() => {});
    return 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  dump-record failed:', e && e.stack ? e.stack : e);
    process.exit(2);
});
