/**
 * Fix midterm + final Firestore answer keys to match HTML source-of-truth.
 *
 * Verification (subagent across all 60 questions): HTML position 0 is the
 * canonically correct answer in EVERY question. Firestore was set with
 * cycling placeholder data, mismatching HTML on 49/60 questions.
 *
 * Fix: set both Firestore answer arrays to [0,0,0,...] of correct length.
 * The HTML's runtime shuffle (lines 491-515) randomizes student-visible
 * order; the radio input value="${origIdx}" carries the source-index, so
 * gradeQuiz compares the original index (always 0 for correct) to Firestore.
 */
const admin = require('firebase-admin');
const fs = require('fs');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const SNAP = '/home/eq/hexworth-shared/eth-quiz-rebalance-2026-04-28';
const EXEC = process.argv.includes('--execute');

(async () => {
    const docs = [
        { id: 'divergent-eth-midterm', expectedLen: 25 },
        { id: 'divergent-eth-final',   expectedLen: 35 }
    ];

    for (const d of docs) {
        const ref = db.collection('quiz_keys').doc(d.id);
        const snap = await ref.get();
        if (!snap.exists) { console.log(`  ${d.id}: not found`); continue; }
        const data = snap.data();
        const oldAnswers = (data.answers || []).slice();
        if (oldAnswers.length !== d.expectedLen) {
            console.log(`  ${d.id}: WARN length ${oldAnswers.length} != expected ${d.expectedLen}`);
        }
        const newAnswers = Array(d.expectedLen).fill(0);

        // Snapshot pre-state
        if (EXEC) {
            fs.writeFileSync(`${SNAP}/${d.id}-firestore.pre.json`, JSON.stringify(data, null, 2));
        }

        // Distribution comparison
        const distrib = arr => {
            const c = [0,0,0,0];
            for (const x of arr) if (x >= 0 && x <= 3) c[x]++;
            return `A:${c[0]} B:${c[1]} C:${c[2]} D:${c[3]}`;
        };

        console.log(`  ${d.id}:`);
        console.log(`    BEFORE [${distrib(oldAnswers)}]: ${JSON.stringify(oldAnswers)}`);
        console.log(`    AFTER  [${distrib(newAnswers)}]: ${JSON.stringify(newAnswers)}`);
        console.log(`    Mismatched questions: ${oldAnswers.filter(x => x !== 0).length} of ${d.expectedLen}`);

        if (!EXEC) continue;

        await ref.update({
            answers: newAnswers,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            alignedAt: admin.firestore.FieldValue.serverTimestamp(),
            alignmentNote: 'Reset to all-zeros to match HTML source-of-truth (position 0 = correct). Runtime shuffle in exam HTML randomizes student-visible positions.'
        });
        console.log(`    ✓ Firestore updated`);
    }

    if (!EXEC) console.log('\n[DRY RUN] Re-run with --execute to apply.');
})();
