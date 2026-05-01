// READ-ONLY — show what each pysandbox_*_passed key contains
// to determine which modules are fully complete vs partial.
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const sync = await db.collection('users').doc(UID).collection('sync').doc('localStorage').get();
    const data = sync.data().data;

    // Each pysandbox lab module has a *_passed blob — JSON with challengeId -> bool
    const moduleEvidence = {};
    for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('pysandbox_') && k.endsWith('_passed')) {
            const moduleId = k.replace('pysandbox_', '').replace('_passed', '');
            try {
                const passed = JSON.parse(v);
                const passedCount = Object.values(passed).filter(x => x === true).length;
                const totalCount = Object.keys(passed).length;
                moduleEvidence[moduleId] = { passed: passedCount, total: totalCount, ratio: passedCount/totalCount, items: passed };
            } catch (e) {
                moduleEvidence[moduleId] = { error: e.message };
            }
        }
    }

    console.log('=== PFI PYSANDBOX EVIDENCE ===');
    for (const [mod, ev] of Object.entries(moduleEvidence)) {
        console.log(`\n  ${mod}: ${ev.passed}/${ev.total} challenges passed (${(ev.ratio*100).toFixed(0)}%)`);
        for (const [item, p] of Object.entries(ev.items || {})) {
            console.log(`     ${p ? 'PASS' : 'FAIL'}  ${item}`);
        }
    }

    // Also XP and streak for sanity
    console.log('\n=== XP / STREAK PER MODULE ===');
    for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('pysandbox_') && (k.endsWith('_xp') || k.endsWith('_streak'))) {
            console.log(`  ${k} = ${v}`);
        }
    }

    // Setup steps + project progress
    console.log('\n=== SETUP / PROJECT PROGRESS ===');
    for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('pfi-setup-') || k.startsWith('pfi_w')) {
            console.log(`  ${k} = ${v}`);
        }
    }

    // Profile to check existing modules / quizzes (for w1/w2 quizzes)
    const profile = await db.collection('users').doc(UID).get();
    const p = profile.data();
    const allMods = p.modulesCompleted || [];
    const pfiMods = allMods.filter(m => m.toLowerCase().includes('pfi'));
    console.log('\n=== EXISTING PFI ITEMS IN PROFILE ===');
    console.log('Modules:', pfiMods.length, pfiMods);
    const pfiQuizzes = Object.entries(p.quizzes || {}).filter(([k]) => k.toLowerCase().includes('pfi'));
    console.log('Quizzes:', pfiQuizzes.length, pfiQuizzes);
})();
