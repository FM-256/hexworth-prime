const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const UID = 'XymKK83U2AMja5TCsKpRym8p0S12';

(async () => {
    // Look at quiz_attempts subcollection entries
    const attempts = await db.collection('users').doc(UID).collection('quiz_attempts').get();
    const attemptDocs = [];
    attempts.forEach(d => attemptDocs.push({ id: d.id, ...d.data() }));

    // Group by quiz/module ID
    const byQuiz = {};
    for (const a of attemptDocs) {
        const qid = a.quizId || a.moduleId || a.itemId || 'unknown';
        if (!byQuiz[qid]) byQuiz[qid] = [];
        byQuiz[qid].push(a);
    }

    console.log('=== UNIQUE QUIZ IDs IN quiz_attempts ===');
    console.log('Total unique quiz IDs:', Object.keys(byQuiz).length);
    for (const [qid, list] of Object.entries(byQuiz).sort()) {
        const passed = list.filter(a => a.passed || a.correct >= a.total * 0.7);
        const best = list.reduce((m, a) => Math.max(m, a.score || 0), 0);
        console.log(`  ${qid}: ${list.length} attempts, best score ${best}, ${passed.length} passing`);
    }

    // Filter for PFI/python ones
    console.log('\n=== PFI / PYTHON QUIZ ATTEMPTS ===');
    const pfi = attemptDocs.filter(a => {
        const id = (a.quizId || a.moduleId || '').toLowerCase();
        return id.includes('pfi') || id.includes('python') || id.startsWith('pyit') || id.includes('coppy');
    });
    console.log('Count:', pfi.length);
    pfi.slice(0, 5).forEach(a => console.log(' ', a.id, JSON.stringify(a, null, 2).substring(0, 300)));

    // Sample one attempt to see schema
    console.log('\n=== SAMPLE quiz_attempts SCHEMA ===');
    if (attemptDocs.length) {
        const sample = attemptDocs[0];
        console.log(Object.keys(sample));
        console.log(JSON.stringify(sample, null, 2));
    }

    // Same for challenge_attempts
    console.log('\n=== CHALLENGE_ATTEMPTS SAMPLE ===');
    const challenges = await db.collection('users').doc(UID).collection('challenge_attempts').limit(3).get();
    challenges.forEach(d => {
        const data = d.data();
        console.log(' ', d.id, 'keys:', Object.keys(data));
        console.log(JSON.stringify(data, null, 2).substring(0, 400));
    });
})();
