/**
 * India PFI Restore — 2026-04-28
 *
 * Backfills 6 PFI modules into India's profile, sync blob, and class progress doc
 * based on her existing pysandbox_*_passed evidence (all 100% complete).
 *
 * Modules: pfi-sandbox-tour, pfi-setup-guide, pfi-w1-sandbox, pfi-w1-checkpoint,
 *          pfi-w2-sandbox, pfi-w2-checkpoint
 *
 * Steps:
 *   1. Snapshot CURRENT state to /home/eq/hexworth-shared/india-restore-2026-04-28/
 *   2. Update users/{UID}.modulesCompleted (arrayUnion)
 *   3. Update users/{UID}/sync/localStorage.data.hexworth_progress (parsed JSON)
 *   4. Update tenants/python-april-2026/classes/FRXlV8zW95eQ3CL6eWdc/progress/{UID}.completions
 *
 * Run modes:
 *   node india-restore-pfi.js            — DRY RUN (read + show diffs, no writes)
 *   node india-restore-pfi.js --execute  — perform the writes
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

const MODULES_TO_RESTORE = [
    { id: 'pfi-sandbox-tour',  evidence: '6/6 challenges passed, XP 95'  },
    { id: 'pfi-setup-guide',   evidence: 'all 8 setup steps = 1'         },
    { id: 'pfi-w1-sandbox',    evidence: '10/10 challenges, XP 325, streak 10' },
    { id: 'pfi-w1-checkpoint', evidence: '3/3 checkpoints, XP 85'        },
    { id: 'pfi-w2-sandbox',    evidence: '10/10 challenges, XP 285'      },
    { id: 'pfi-w2-checkpoint', evidence: '3/3 checkpoints, XP 115'       },
];
const MODULE_IDS = MODULES_TO_RESTORE.map(m => m.id);

const EXECUTE = process.argv.includes('--execute');
const NOW_ISO = new Date().toISOString();

(async () => {
    console.log('============================================================');
    console.log(`MODE: ${EXECUTE ? 'EXECUTE (will write)' : 'DRY RUN (read-only)'}`);
    console.log('UID:', UID);
    console.log('Modules:', MODULE_IDS.join(', '));
    console.log('============================================================\n');

    // ── 1. SNAPSHOT ──────────────────────────────────────────────────
    const profileRef = db.collection('users').doc(UID);
    const syncRef = profileRef.collection('sync').doc('localStorage');
    const classProgressRef = db.collection('tenants').doc(TENANT_ID)
        .collection('classes').doc(CLASS_ID)
        .collection('progress').doc(UID);

    const profileSnap = await profileRef.get();
    const syncSnap = await syncRef.get();
    const classSnap = await classProgressRef.get();

    if (!profileSnap.exists) { console.error('PROFILE MISSING'); process.exit(1); }
    if (!syncSnap.exists)    { console.error('SYNC BLOB MISSING'); process.exit(1); }
    if (!classSnap.exists)   { console.error('CLASS PROGRESS DOC MISSING'); process.exit(1); }

    const profile = profileSnap.data();
    const syncDoc = syncSnap.data();
    const classDoc = classSnap.data();

    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'profile.json'),
        JSON.stringify(profile, replacer, 2));
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'sync-localStorage.json'),
        JSON.stringify(syncDoc, replacer, 2));
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'class-progress.json'),
        JSON.stringify(classDoc, replacer, 2));
    console.log(`[snapshot] Saved 3 docs to ${SNAPSHOT_DIR}/\n`);

    // ── 2. PROFILE: arrayUnion modulesCompleted ─────────────────────
    const existingMods = profile.modulesCompleted || [];
    const newMods = MODULE_IDS.filter(m => !existingMods.includes(m));
    console.log('=== PROFILE.modulesCompleted ===');
    console.log('  Before:', existingMods.length, 'modules');
    console.log('  Will add:', newMods.length, '— [' + newMods.join(', ') + ']');
    console.log('  After:', existingMods.length + newMods.length, 'modules');

    // ── 3. SYNC BLOB: hexworth_progress JSON ────────────────────────
    const data = syncDoc.data || {};
    let hp;
    try { hp = JSON.parse(data.hexworth_progress || '{}'); }
    catch (e) { console.error('hexworth_progress JSON parse failed:', e); process.exit(1); }

    if (!hp.houses) hp.houses = {};
    if (!hp.houses.code) {
        hp.houses.code = {
            unlocked: true, modulesCompleted: [], quizzesPassed: [],
            labsCompleted: [], currentModule: null, progressPercent: 0,
            lastAccessed: null
        };
    }
    if (!Array.isArray(hp.houses.code.modulesCompleted)) hp.houses.code.modulesCompleted = [];
    if (!Array.isArray(hp.completedModules)) hp.completedModules = [];
    if (!hp.code) hp.code = {};

    const beforeHousesCode = [...hp.houses.code.modulesCompleted];
    const beforeCompletedModules = [...hp.completedModules];
    const beforeFlatCodeKeys = Object.keys(hp.code).length;

    for (const mid of MODULE_IDS) {
        if (!hp.houses.code.modulesCompleted.includes(mid)) hp.houses.code.modulesCompleted.push(mid);
        if (!hp.completedModules.includes(mid)) hp.completedModules.push(mid);
        if (!hp.code[mid]) hp.code[mid] = { completed: true, date: NOW_ISO };
    }
    hp.houses.code.lastAccessed = NOW_ISO;

    console.log('\n=== SYNC BLOB hexworth_progress ===');
    console.log('  houses.code.modulesCompleted: ' + beforeHousesCode.length + ' → ' + hp.houses.code.modulesCompleted.length);
    console.log('  completedModules: ' + beforeCompletedModules.length + ' → ' + hp.completedModules.length);
    console.log('  flat code[] keys: ' + beforeFlatCodeKeys + ' → ' + Object.keys(hp.code).length);

    // ── 4. CLASS PROGRESS: completions map ──────────────────────────
    const existingCompletions = classDoc.completions || {};
    const completionsUpdate = {};
    let classProgressNew = 0;
    for (const mid of MODULE_IDS) {
        if (!existingCompletions[mid] || !existingCompletions[mid].completed) {
            completionsUpdate[`completions.${mid}`] = {
                completed: true,
                completedAt: NOW_ISO,
                score: null,
                duration: null
            };
            classProgressNew++;
        }
    }
    console.log('\n=== CLASS PROGRESS ' + TENANT_ID + '/' + CLASS_ID + '/' + UID + ' ===');
    console.log('  completions: ' + Object.keys(existingCompletions).length + ' → ' + (Object.keys(existingCompletions).length + classProgressNew));
    console.log('  Will set:', Object.keys(completionsUpdate));

    // ── 5. EXECUTE OR EXIT ─────────────────────────────────────────
    if (!EXECUTE) {
        console.log('\n[DRY RUN] No writes performed. Re-run with --execute to apply.');
        return;
    }

    console.log('\n[EXECUTE] Writing 3 docs...');

    // 1. Profile arrayUnion
    if (newMods.length > 0) {
        await profileRef.update({
            modulesCompleted: admin.firestore.FieldValue.arrayUnion(...newMods),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('  ✓ Profile updated (' + newMods.length + ' modules added)');
    } else {
        console.log('  · Profile already has all 6 modules — skipping');
    }

    // 2. Sync blob — write merged data back
    data.hexworth_progress = JSON.stringify(hp);
    await syncRef.set({
        data,
        keyCount: Object.keys(data).length,
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('  ✓ Sync blob updated');

    // 3. Class progress completions
    if (Object.keys(completionsUpdate).length > 0) {
        completionsUpdate['updatedAt'] = admin.firestore.FieldValue.serverTimestamp();
        await classProgressRef.update(completionsUpdate);
        console.log('  ✓ Class progress doc updated (' + classProgressNew + ' completions added)');
    } else {
        console.log('  · Class progress already has all 6 completions — skipping');
    }

    console.log('\n✓ DONE. Have India sign in via the main landing (hexworth.academy /).');
    console.log('  That triggers restoreFromCloud → her PFI hub will show 6 modules complete.');
})();

function replacer(_k, v) {
    if (v && typeof v === 'object' && typeof v._seconds === 'number')
        return new Date(v._seconds * 1000).toISOString();
    return v;
}
