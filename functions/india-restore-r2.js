/**
 * India PFI Restore — Round 2: 15 modules from her completion_stamps
 * (3 docs: profile, sync blob, class progress).
 */
const admin = require('firebase-admin');
const fs = require('fs');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';
const TENANT = 'python-april-2026';
const CLASS  = 'FRXlV8zW95eQ3CL6eWdc';
const SNAP   = '/home/eq/hexworth-shared/india-restore-2026-04-28';

// All 21 PFI modules — 6 from round 1 (wiped from profile by sync race) +
// 15 from her hexworth_completion_stamps. Defensive full backfill.
const NEW = [
    // Round 1 — sandbox/checkpoint modules from pysandbox _passed evidence
    ['pfi-sandbox-tour',     '2026-04-07T16:28:15.428Z'],  // tour passed all 6
    ['pfi-setup-guide',      '2026-04-07T16:28:15.428Z'],  // 8 setup steps
    ['pfi-w1-sandbox',       '2026-04-12T20:25:10.491Z'],  // 10/10 challenges
    ['pfi-w1-checkpoint',    '2026-04-12T20:27:32.714Z'],  // 3/3 checkpoints
    ['pfi-w2-sandbox',       '2026-04-14T04:22:52.590Z'],  // 10/10 challenges
    ['pfi-w2-checkpoint',    '2026-04-14T04:42:04.996Z'],  // 3/3 checkpoints
    // Round 2 — modules from hexworth_completion_stamps blob
    ['pfi-course-intro',     '2026-04-09T13:22:56.735Z'],
    ['pfi-w1-datatypes',     '2026-04-11T01:38:30.734Z'],
    ['pfi-w1-conditionals',  '2026-04-12T19:59:23.384Z'],
    ['pfi-w1-loops',         '2026-04-12T20:04:08.007Z'],
    ['pfi-w1-quiz',          '2026-04-12T20:26:53.529Z'],
    ['pfi-w1-project',       '2026-04-13T13:03:45.849Z'],
    ['pfi-w2-strings',       '2026-04-13T14:45:24.846Z'],
    ['pfi-w2-lists',         '2026-04-13T15:01:47.004Z'],
    ['pfi-w2-dicts',         '2026-04-13T15:59:01.816Z'],
    ['pfi-w2-quiz',          '2026-04-14T04:33:14.588Z'],
    ['pfi-w2-project',       '2026-04-16T16:39:34.379Z'],
    ['pfi-w2-builtins',      '2026-04-18T02:16:24.771Z'],
    ['pfi-w3-functions',     '2026-04-20T14:28:32.124Z'],
    ['pfi-w3-graphics',      '2026-04-20T14:36:52.065Z'],
    ['pfi-w3-oop',           '2026-04-28T13:48:19.421Z'],
];
const IDS = NEW.map(([id]) => id);
const EXEC = process.argv.includes('--execute');

(async () => {
    const profileRef = db.collection('users').doc(UID);
    const syncRef = profileRef.collection('sync').doc('localStorage');
    const classRef = db.collection('tenants').doc(TENANT).collection('classes').doc(CLASS).collection('progress').doc(UID);

    const profile = (await profileRef.get()).data();
    const syncDoc = (await syncRef.get()).data();
    const classDoc = (await classRef.get()).data();

    fs.writeFileSync(SNAP+'/profile-r2-pre.json', JSON.stringify(profile, rep, 2));
    fs.writeFileSync(SNAP+'/sync-r2-pre.json',    JSON.stringify(syncDoc, rep, 2));
    fs.writeFileSync(SNAP+'/class-r2-pre.json',   JSON.stringify(classDoc, rep, 2));

    const existing = profile.modulesCompleted || [];
    const newToAdd = IDS.filter(m => !existing.includes(m));
    console.log('PROFILE: PFI before=' + existing.filter(m=>m.startsWith('pfi-')).length, '+', newToAdd.length, '→', existing.filter(m=>m.startsWith('pfi-')).length + newToAdd.length);

    const data = syncDoc.data;
    const hp = JSON.parse(data.hexworth_progress);
    if (!hp.houses.code) hp.houses.code = {unlocked:true,modulesCompleted:[],quizzesPassed:[],labsCompleted:[],currentModule:null,progressPercent:0,lastAccessed:null};
    if (!Array.isArray(hp.houses.code.modulesCompleted)) hp.houses.code.modulesCompleted = [];
    if (!Array.isArray(hp.completedModules)) hp.completedModules = [];
    if (!hp.code) hp.code = {};
    const hcBefore = hp.houses.code.modulesCompleted.length;
    for (const [id, ts] of NEW) {
        if (!hp.houses.code.modulesCompleted.includes(id)) hp.houses.code.modulesCompleted.push(id);
        if (!hp.completedModules.includes(id)) hp.completedModules.push(id);
        if (!hp.code[id]) hp.code[id] = { completed: true, date: ts };
    }
    console.log('SYNC houses.code.modulesCompleted: ' + hcBefore + ' → ' + hp.houses.code.modulesCompleted.length);

    const upd = {};
    let cls = 0;
    const cur = classDoc.completions || {};
    for (const [id, ts] of NEW) {
        if (!cur[id] || !cur[id].completed) {
            upd[`completions.${id}`] = { completed: true, completedAt: ts, score: null, duration: null };
            cls++;
        }
    }
    console.log('CLASS new completions:', cls);

    if (!EXEC) { console.log('\n[DRY RUN]'); return; }

    if (newToAdd.length) {
        await profileRef.update({
            modulesCompleted: admin.firestore.FieldValue.arrayUnion(...newToAdd),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    data.hexworth_progress = JSON.stringify(hp);
    await syncRef.set({ data, keyCount: Object.keys(data).length, syncedAt: admin.firestore.FieldValue.serverTimestamp() });
    if (cls) {
        upd.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await classRef.update(upd);
    }
    console.log('\n✓ DONE');
})();

function rep(_k,v) { return (v && typeof v==='object' && typeof v._seconds==='number') ? new Date(v._seconds*1000).toISOString() : v; }
