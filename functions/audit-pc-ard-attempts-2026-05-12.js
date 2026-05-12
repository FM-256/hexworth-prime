#!/usr/bin/env node
/**
 * audit-pc-ard-attempts-2026-05-12.js
 *
 * READ-ONLY audit of student attempts against pc-ard-04-quiz and
 * pc-ard-14-quiz during the broken-key window. Identifies impacted
 * students. No Firestore writes.
 *
 * Background:
 *   - Original Firestore key (both quizzes): [0,1,2,3,0,1,2,3,0,1,2,3,0,1,0]
 *     (cycling placeholder)
 *   - QC-50 audit confirmed actual content: every correct answer is at
 *     options[0] (Discipline A).
 *   - Corrected key pushed to Firestore 2026-05-12 (commit 54b74cd0).
 *
 * Analytical implication of the broken key:
 *   - A student who KNEW THE MATERIAL (picks 0 for all 15) would have hit
 *     the broken-key value of 0 at only positions 0, 4, 8, 12, 14 — scoring
 *     5/15 (33%). Recorded as FAIL (passing threshold is 80%).
 *   - A student who actually scored 80%+ (passing) under the broken key
 *     was NOT picking the correct content (which is always options[0]).
 *     They were picking answers that happened to match the cycling pattern.
 *     Their recorded pass is a FALSE POSITIVE — they did not demonstrate
 *     mastery of the material.
 *   - Without storage of original submitted answers (quiz_attempts schema
 *     only saves score/percentage), exact per-student recomputation is
 *     not possible.
 *
 * What this audit produces:
 *   1. Total attempt counts per quiz
 *   2. Score distribution buckets
 *   3. Pass/fail counts under broken-key grading
 *   4. Per-attempt list (uid, score, percentage, passed, timestamp) for
 *      operator triage. Operator may choose to:
 *        a. Invalidate broken-window attempts and require retakes
 *        b. Manually credit students who score 5/15 (likely knowing-material)
 *        c. Other policy
 *
 * Usage:
 *   cd functions
 *   node audit-pc-ard-attempts-2026-05-12.js                       # console report
 *   node audit-pc-ard-attempts-2026-05-12.js --json > report.json  # machine-readable
 */

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const QUIZ_IDS = ['pc-ard-04-quiz', 'pc-ard-14-quiz'];
const FIX_DATE = '2026-05-12';  // ISO date corrected key was pushed
const BROKEN_KEY = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 0];  // for reference
const CORRECT_KEY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // Discipline A

const JSON_OUT = process.argv.includes('--json');

async function main() {
    // Collection-group query: pull every quiz_attempts doc for these quiz IDs.
    const results = { byQuiz: {}, totals: { attempts: 0, uniqueStudents: 0 } };
    const allStudents = new Set();

    // Iterate users directly (collection-group index not present for quiz_attempts).
    const usersSnap = await db.collection('users').get();

    for (const quizId of QUIZ_IDS) {
        const attempts = [];
        for (const userDoc of usersSnap.docs) {
            const uid = userDoc.id;
            const attemptsSnap = await db
                .collection(`users/${uid}/quiz_attempts`)
                .where('quizId', '==', quizId)
                .get();
            attemptsSnap.forEach(d => {
                const data = d.data();
                allStudents.add(uid);
                attempts.push({
                    uid,
                    score: data.score,
                    total: data.total,
                    percentage: data.percentage,
                    passed: data.passed,
                    timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
                    docId: d.id,
                });
            });
        }

        // Sort by timestamp ascending (oldest first)
        attempts.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

        // Score buckets
        const buckets = { '0-19%': 0, '20-32%': 0, '33%-exactly(5/15)': 0, '34-66%': 0, '67-79%': 0, '80-99%': 0, '100%': 0 };
        const broken = [];
        const suspectKnower = [];  // exactly 5/15 = likely picked-all-zeros
        const falsePositivePass = []; // ≥80% under broken key = wrong content

        for (const a of attempts) {
            const p = a.percentage;
            if (p === 100) buckets['100%']++;
            else if (p >= 80) buckets['80-99%']++;
            else if (p >= 67) buckets['67-79%']++;
            else if (p >= 34) buckets['34-66%']++;
            else if (a.score === 5 && a.total === 15) { buckets['33%-exactly(5/15)']++; suspectKnower.push(a); }
            else if (p >= 20) buckets['20-32%']++;
            else buckets['0-19%']++;

            if (a.passed) falsePositivePass.push(a);
            // Pre-fix attempts (before FIX_DATE) are in the broken window
            if (a.timestamp && a.timestamp < FIX_DATE) broken.push(a);
        }

        results.byQuiz[quizId] = {
            totalAttempts: attempts.length,
            uniqueUids: new Set(attempts.map(a => a.uid)).size,
            buckets,
            falsePositivePassCount: falsePositivePass.length,
            suspectKnowerCount: suspectKnower.length,
            brokenWindowCount: broken.length,
            attempts,
            suspectKnowerSamples: suspectKnower.slice(0, 5),
            falsePositivePassSamples: falsePositivePass.slice(0, 5),
        };
        results.totals.attempts += attempts.length;
    }
    results.totals.uniqueStudents = allStudents.size;

    if (JSON_OUT) {
        console.log(JSON.stringify(results, null, 2));
        return;
    }

    console.log('=== pc-ard quiz attempt audit (broken-key window before ' + FIX_DATE + ') ===');
    console.log();
    console.log('Total attempts across both quizzes: ' + results.totals.attempts);
    console.log('Unique students affected:           ' + results.totals.uniqueStudents);
    console.log();

    for (const quizId of QUIZ_IDS) {
        const r = results.byQuiz[quizId];
        console.log('--- ' + quizId + ' ---');
        console.log('  Total attempts:        ' + r.totalAttempts);
        console.log('  Unique students:       ' + r.uniqueUids);
        console.log('  Broken-window count:   ' + r.brokenWindowCount + ' (timestamps before ' + FIX_DATE + ')');
        console.log('  Score distribution:');
        for (const [b, n] of Object.entries(r.buckets)) {
            console.log('    ' + b.padEnd(28) + ': ' + n);
        }
        console.log('  Suspect "knower" attempts (exactly 5/15 — likely picked all-zeros, mis-graded as FAIL): ' + r.suspectKnowerCount);
        if (r.suspectKnowerSamples.length) {
            console.log('    Sample uids:');
            r.suspectKnowerSamples.forEach(s => console.log('      ' + s.uid + '  ts=' + s.timestamp));
        }
        console.log('  False-positive PASS attempts (≥80% under broken key — content wrong): ' + r.falsePositivePassCount);
        if (r.falsePositivePassSamples.length) {
            console.log('    Sample uids:');
            r.falsePositivePassSamples.forEach(s => console.log('      ' + s.uid + '  pct=' + s.percentage + '  ts=' + s.timestamp));
        }
        console.log();
    }

    console.log('=== Operator triage recommendations ===');
    console.log('  - "Suspect knower" attempts: students who likely knew the material but were graded as FAIL.');
    console.log('    Policy options: credit them as PASS, prompt retake (now grades correctly), or contact directly.');
    console.log('  - "False-positive PASS" attempts: students recorded as PASS but did not pick the correct content.');
    console.log('    Policy options: invalidate the recorded pass and require retake under the corrected key.');
    console.log('  - All other attempts: random/partial-knowledge — operator judgment per academic policy.');
    console.log();
    console.log('NO WRITES PERFORMED. This is a read-only audit.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
