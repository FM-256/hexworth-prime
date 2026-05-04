/**
 * India PFI Restore — Round 2 (additive)
 *
 * Backfills 15 more PFI modules based on her hexworth_completion_stamps
 * (which had 20 PFI completions with timestamps that I missed in round 1).
 *
 * Round 1 already wrote: pfi-sandbox-tour, pfi-setup-guide, pfi-w1-sandbox,
 *                        pfi-w1-checkpoint, pfi-w2-sandbox, pfi-w2-checkpoint
 * This round adds:        pfi-course-intro, pfi-w1-datatypes, pfi-w1-conditionals,
 *                        pfi-w1-loops, pfi-w1-quiz, pfi-w1-project, pfi-w2-strings,
 *                        pfi-w2-lists, pfi-w2-dicts, pfi-w2-quiz, pfi-w2-project,
 *                        pfi-w2-builtins, pfi-w3-functions, pfi-w3-graphics, pfi-w3-oop
 *
 * Total after this round: 21 PFI modules complete.
 *
 * Run modes:
 *   node india-restore-pfi-2.js            — DRY RUN
 *   node india-restore-pfi-2.js --execute  — perform writes
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';
const TENANT_ID = 'python-april-2026';
const CLASS_ID = 'FRXlV8zW95eQ3CL6eWdc';
const SNAPSHOT_DIR = '/home/eq/hexworth-shared/india-restore-2026-04-28';

// Pulled from her hexworth_completion_stamps blob — 20 PFI completions with
// real timestamps spanning 2026-04-07 to 2026-04-28. Excluding the 6 already
// written in round 1.
const NEW_MODULES = [
    { id: 'pfi-course-intro',     ts: '2026-04-09T13:22:56.735Z' },
    { id: 'pfi-w1-datatypes',     ts: '2026-04-11T01:38:30.734Z' },
    { id: 'pfi-w1-conditionals',  ts: '2026-04-12T19:59:23.384Z' },
    { id: 'pfi-w1-loops',         ts: '2026-04-12T20:04:08.007Z' },
    { id: 'pfi-w1-quiz',          ts: '2026-04-12T20:26:53.529Z' },
    { id: 'pfi-w1-project',       ts: '2026-04-13T13:03:45.849Z' },
    { id: 'pfi-w2-strings',       ts: '2026-04-13T14:45:24.846Z' },
    { id: 'pfi-w2-lists',         ts: '2026-04-13T15:01:47.004Z' },
    { id: 'pfi-w2-dicts',         ts: '2026-04-13T15:59:01.816Z' },
    { id: 'pfi-w2-quiz',          ts: '2026-04-14T04:33:14.588Z' },
    { id: 'pfi-w2-project',       ts: '2026-04-16T16:39:34.379Z' },
    { id: 'pfi-w2-builtins',      ts: '2026-04-18T02:16:24.771Z' },
    { id: 'pfi-w3-functions',     ts: '2026-04-20T14:28:32.124Z' },
    { id: 'pfi-w3-graphics',      ts: '2026-04-20T14:36:52.065Z' },
    { id: 'pfi-w3-oop',           ts: '2026-04-28T13:48:19.421Z' },
];
const MODULE_IDS = NEW_MODULES.map(m => m.id);

const EXECUTE = process.argv.includes('--execute');

(async () => {
    console.log('============================================================');
    console.log(`MODE: ${EXECUTE ? 'EXECUTE' : 'DRY RUN'}`);
    console.log('UID:', UID);
    console.log('Adding', MODULE_IDS.length, 'modules');
    console.log('============================================================\n');

    const profileRef = db.collection('users').doc(UID);
    const syncRef = profileRef.collection('sync').doc('localStorage');
    const classProgressRef = db.collection('tenants').doc(TENANT_ID)
        .collection('classes').doc(CLASS_ID)
        .collection('progress').doc(UID);

    const profile = (await profileRef.get()).data();
    const syncDoc = (await syncRef.get()).data();
    const classDoc = (await classProgressRef.get()).data();

    // Snapshot round-2 starting state alongside round-1 snapshot
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'profile-r2-pre.json'),
        JSON.stringify(profile, replacer, 2));
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'sync-r2-pre.json'),
        JSON.stringify(syncDoc, replacer, 2));
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'class-r2-pre.json'),
        JSON.stringify(classDoc, replacer, 2));
    console.log('[snapshot] Round-2 pre-state saved\n');

    // ── PROFILE ──
    const existingMods = profile.modulesCompleted || [];
    const newMods = MODULE_IDS.filter(m => !existingMods.includes(m));
    console.log('=== PROFILE ===');
    console.log('  Current PFI modules:', existingMods.filter(m => m.startsWith('pfi-')).length);
    console.log('  Will add:', newMods.length, '— [' + newMods.join(', ') + ']');

    // ── SYNC BLOB ──
    const data = syncDoc.data || {};
    const hp = JSON.parse(data.hexworth_progress);
    if (!hp.houses.code) {
        hp.houses.code = { unlocked: true, modulesCompleted: [], quizzesPassed: [],
                           labsCompleted: [], currentModule: null, progressPercent: 0,
                           lastAccessed: null };
    }
    if (!Array.isArray(hp.houses.code.modulesCompleted)) hp.houses.code.modulesCompleted = [];
    if (!Array.isArray(hp.completedModules)) hp.completedModules = [];
    if (!hp.code) hp.code = {};

    const beforeHC = hp.houses.code.modulesCompleted.length;
    const beforeCM = hp.completedModules.length;
    const beforeFC = Object.keys(hp.code).length;

    for (const m of NEW_MODULES) {
        if (!hp.houses.code.modulesCompleted.includes(m.id)) hp.houses.code.modulesCompleted.push(m.id);
        if (!hp.completedModules.includes(m.id)) hp.completedModules.push(m.id);
        if (!hp.code[m.id]) hp.code[m.id] = { completed: true, date: m.ts };
    }

    console.log('\n=== SYNC BLOB hexworth_progress ===');
    console.log('  houses.code.modulesCompleted: ' + beforeHC + ' → ' + hp.houses.code.modulesCompleted.length);
    console.log('  completedModules: ' + beforeCM + ' → ' + hp.completedModules.length);
    console.log('  flat code[] keys: ' + beforeFC + ' → ' + Object.keys(hp.code).length);

    // ── CLASS PROGRESS ──
    const completionsUpdate = {};
    let newCompletions = 0;
    for (const m of NEW_MODULES) {
        const existing = (classDoc.completions || {})[m.id];
        if (!existing || !existing.completed) {
            completionsUpdate[`completions.${m.id}`] = {
                completed: true,
                completedAt: m.ts,
                score: null,
                duration: null
            };
            newCompletions++;
        }
    }
    console.log('\n=== CLASS PROGRESS ===');
    console.log('  New completions to add:', newCompletions);

    if (!EXECUTE) {
        console.log('\n[DRY RUN] No writes. Re-run with --execute to apply.');
        return;
    }

    console.log('\n[EXECUTE] Writing...');

    if (newMods.length > 0) {
        await profileRef.update({
            modulesCompleted: admin.firestore.FieldValue.arrayUnion(...newMods),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('  ✓ Profile: +' + newMods.length + ' modules');
    }

    data.hexworth_progress = JSON.stringify(hp);
    await syncRef.set({
        data,
        keyCount: Object.keys(data).length,
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('  ✓ Sync blob updated');

    if (newCompletions > 0) {
        completionsUpdate['updatedAt'] = admin.firestore.FieldValue.serverTimestamp();
        await classProgressRef.update(completionsUpdate);
        console.log('  ✓ Class progress: +' + newCompletions + ' completions');
    }

    console.log('\n✓ DONE. India: refresh PFI hub (or sign out + sign in via /).');
})();

function replacer(_k, v) {
    if (v && typeof v === 'object' && typeof v._seconds === 'number')
        return new Date(v._seconds * 1000).toISOString();
    return v;
}
