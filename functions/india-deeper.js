// READ-ONLY — search for every signal of PFI progress in her sync blob
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    const sync = (await db.collection('users').doc(UID).collection('sync').doc('localStorage').get()).data();
    const data = sync.data;
    const keys = Object.keys(data);

    // 1. Operator mission completions (PFI hub backfill key pattern)
    console.log('=== OPERATOR MISSION COMPLETIONS (hexworth_operator_*) ===');
    for (const k of keys.filter(k => k.startsWith('hexworth_operator_pfi'))) {
        console.log('  ', k, '=', data[k].substring(0, 80));
    }

    // 2. ALL keys mentioning anything PFI/python/code
    console.log('\n=== ALL PFI-MENTIONING KEYS (excluding pysandbox) ===');
    for (const k of keys.filter(k => {
        const lk = k.toLowerCase();
        return (lk.includes('pfi') || lk.includes('python')) && !k.startsWith('pysandbox_');
    })) {
        console.log('  ', k, '=', String(data[k]).substring(0, 100));
    }

    // 3. Project labs — are these tracked by visit, completion, or step count?
    // pfi_w1_project_progress = [5,1,2,3,4]
    // Let's look at the lab itself to understand
    console.log('\n=== PROJECT PROGRESS ARRAYS ===');
    for (const k of keys.filter(k => k.includes('project'))) {
        console.log('  ', k, '=', data[k]);
    }

    // 4. Quiz scores (any pfi-w1-quiz, pfi-w2-quiz pattern)
    console.log('\n=== QUIZ KEYS (any pattern) ===');
    for (const k of keys.filter(k => k.toLowerCase().includes('quiz'))) {
        console.log('  ', k, '=', String(data[k]).substring(0, 150));
    }

    // 5. Presentation visit tracking
    console.log('\n=== PRESENTATION KEYS ===');
    for (const k of keys.filter(k => k.toLowerCase().includes('presentation'))) {
        console.log('  ', k, '=', String(data[k]).substring(0, 100));
    }

    // 6. completion_stamps or other completion records
    console.log('\n=== COMPLETION STAMPS ===');
    if (data.hexworth_completion_stamps) {
        const stamps = JSON.parse(data.hexworth_completion_stamps);
        const pfiStamps = Object.entries(stamps).filter(([k]) => k.toLowerCase().includes('pfi'));
        console.log('PFI completion stamps:', pfiStamps.length);
        for (const [k, v] of pfiStamps) console.log('  -', k, JSON.stringify(v).substring(0, 100));
    }

    // 7. last_visited list
    if (data.hexworth_last_visited) {
        try {
            const lv = JSON.parse(data.hexworth_last_visited);
            console.log('\n=== LAST VISITED (PFI) ===');
            const pfiVisited = Object.entries(lv).filter(([k]) => k.toLowerCase().includes('pfi') || k.toLowerCase().includes('python'));
            for (const [k, v] of pfiVisited) console.log('  ', k, '→', JSON.stringify(v).substring(0, 100));
        } catch (e) {}
    }

    // 8. quiz_scores key
    if (data.hexworth_quiz_scores) {
        try {
            const qs = JSON.parse(data.hexworth_quiz_scores);
            console.log('\n=== QUIZ_SCORES (PFI) ===');
            const pfiQuizzes = Object.entries(qs).filter(([k]) => k.toLowerCase().includes('pfi'));
            for (const [k, v] of pfiQuizzes) console.log('  ', k, '→', JSON.stringify(v).substring(0, 200));
        } catch (e) {}
    }
})();
