#!/usr/bin/env node
/**
 * mark-legacy-anon-profiles.js — task 372 follow-up. DRY-RUN BY DEFAULT.
 *
 * @catalog what   Marks the legacy users/{uid} profiles that belong to anonymous Firebase Auth
 *                 accounts, so every count, export and audit can exclude them. The 372 fix stops
 *                 NEW ones; this classifies the ones already there.
 * @catalog run    node _tools/anon/mark-legacy-anon-profiles.js            (dry run, writes nothing)
 *                 node _tools/anon/mark-legacy-anon-profiles.js --apply    (PRODUCTION WRITE)
 * @catalog status TOOL
 *
 * ── WE DO NOT DESTROY ───────────────────────────────────────────────────────────────────────
 * This MARKS. It never deletes a profile, never clears a field, never touches xp/progress/
 * achievements. The only mutation is setting `isAnonymous: true` (already whitelisted at
 * firestore.rules:144) plus `_classifiedBy`/`_classifiedAt` provenance. Roughly 30 of these
 * accounts hold REAL coursework — the largest carries 173 modules, 129 labs, 61 quizzes — so
 * deletion is categorically off the table and this script has no delete path at all.
 *
 * ── WHY MARKING IS THE FIX, NOT FILTERING AT READ TIME ──────────────────────────────────────
 * Consumers cannot re-derive this: Firestore has no join to Auth, so a query over users/ cannot
 * tell an anonymous session from a student. Auth is the only source of truth, and it is only
 * reachable from the Admin SDK. Writing the marker once is what lets adminGetStats
 * (functions/index.js:3408, currently reporting 4,071 where ~170 is the real number) and every
 * export filter correctly and cheaply.
 *
 * ── AUTHORIZATION ───────────────────────────────────────────────────────────────────────────
 * --apply is a production write and is gated on branch master plus explicit operator
 * authorization for THIS operation. Dry run is always safe and is the default.
 */
'use strict';

const admin = require('firebase-admin');
const { execSync } = require('child_process');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
const db = admin.firestore();

const APPLY = process.argv.includes('--apply');

(async () => {
    if (APPLY) {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        if (branch !== 'master') {
            console.error('REFUSING: --apply requires branch master, on "' + branch + '"');
            process.exit(2);
        }
    }
    console.log('=== mark legacy anonymous profiles ===');
    console.log('mode:', APPLY ? '*** APPLY — WRITES TO PRODUCTION ***' : 'DRY RUN (writes nothing)');
    console.log('started:', new Date().toISOString(), '\n');

    const users = [];
    let tok = null;
    do {
        const r = await admin.auth().listUsers(1000, tok || undefined);
        r.users.forEach(u => users.push(u));
        tok = r.pageToken;
    } while (tok);
    const isAnon = (u) => (!u.providerData || u.providerData.length === 0) && !u.email;
    const anonUids = new Set(users.filter(isAnon).map(u => u.uid));
    console.log('auth accounts:', users.length, '| anonymous:', anonUids.size);

    const snap = await db.collection('users').get();
    const targets = [];
    let alreadyMarked = 0, withCoursework = 0;
    snap.forEach(d => {
        if (!anonUids.has(d.id)) return;
        const v = d.data();
        if (v.isAnonymous === true) { alreadyMarked++; return; }
        const work = (v.modulesCompleted || []).length + (v.labsCompleted || []).length
            + Object.keys(v.quizzes || {}).length;
        if (work > 0) withCoursework++;
        targets.push({ id: d.id, work, xp: v.xp || 0 });
    });

    console.log('profiles belonging to anonymous accounts :', targets.length + alreadyMarked);
    console.log('  already marked isAnonymous:true        :', alreadyMarked);
    console.log('  TO MARK                                :', targets.length);
    console.log('  of those, carrying real coursework     :', withCoursework,
        '(marked too — the flag records HOW they signed in, not whether they matter)');

    if (!APPLY) {
        console.log('\nDRY RUN — nothing written. Re-run with --apply once authorized.');
        console.log('Sample of 5 targets (uids redacted, never printed in full):');
        targets.slice(0, 5).forEach(t =>
            console.log('   …' + t.id.slice(-4) + '  xp=' + t.xp + ' work=' + t.work));
        process.exit(0);
    }

    let done = 0;
    for (let i = 0; i < targets.length; i += 400) {
        const batch = db.batch();
        targets.slice(i, i + 400).forEach(t => {
            batch.set(db.doc('users/' + t.id), {
                isAnonymous: true,
                _classifiedBy: 'mark-legacy-anon-profiles',
                _classifiedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });   // merge: never clobber xp, progress or achievements
        });
        await batch.commit();
        done += Math.min(400, targets.length - i);
        console.log('  committed', done + '/' + targets.length);
    }
    console.log('\nDONE. Marked', done, 'profiles. Nothing deleted, nothing cleared.');
    process.exit(0);
})().catch(e => { console.error('FAILED: ' + e.message); process.exit(1); });
