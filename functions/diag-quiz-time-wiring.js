#!/usr/bin/env node
/**
 * diag-quiz-time-wiring.js — platform-wide check for quiz score + time-spent
 * tracking in tenant class progress docs.
 *
 * Reads ALL tenants/{slug}/classes/{classId}/progress/{uid} docs and reports:
 *   - How many docs have non-empty quizScores → confirms quiz wiring works
 *   - How many docs have totalTimeSpent > 0 → confirms time tracking works
 *
 * Read-only.
 */

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

async function main() {
    const tenants = await db.collection('tenants').get();
    let totalDocs = 0;
    let docsWithQuizScores = 0;
    let docsWithTime = 0;
    const sampleQuiz = [];
    const sampleTime = [];

    for (const tenantDoc of tenants.docs) {
        const tenantSlug = tenantDoc.id;
        const classes = await db.collection(`tenants/${tenantSlug}/classes`).get();
        for (const classDoc of classes.docs) {
            const classId = classDoc.id;
            const progress = await db.collection(`tenants/${tenantSlug}/classes/${classId}/progress`).get();
            for (const pDoc of progress.docs) {
                totalDocs++;
                const data = pDoc.data();
                const quizCount = Object.keys(data.quizScores || {}).length;
                // totalSessionMs is the Analytics v2 canonical field (ms);
                // totalTimeSpent is legacy (seconds, never written in production).
                const timeMs = data.totalSessionMs || 0;
                const timeSec = data.totalTimeSpent || 0;
                const time = timeMs + (timeSec * 1000);  // unified ms view
                if (quizCount > 0) {
                    docsWithQuizScores++;
                    if (sampleQuiz.length < 5) {
                        sampleQuiz.push({
                            tenant: tenantSlug, classId,
                            uid: pDoc.id,
                            name: data.displayName || data.email,
                            quizCount,
                            sample: Object.entries(data.quizScores).slice(0, 3)
                        });
                    }
                }
                if (time > 0) {
                    docsWithTime++;
                    if (sampleTime.length < 5) {
                        sampleTime.push({
                            tenant: tenantSlug, classId,
                            uid: pDoc.id,
                            name: data.displayName || data.email,
                            totalSessionMs: timeMs,
                            totalTimeSpentSec: timeSec,
                            unifiedMin: Math.round(time / 60000)
                        });
                    }
                }
            }
        }
    }

    console.log('Total class-progress docs platform-wide: ' + totalDocs);
    console.log();
    console.log('QUIZ SCORES:');
    console.log('  Docs with non-empty quizScores:  ' + docsWithQuizScores + '/' + totalDocs);
    if (sampleQuiz.length > 0) {
        console.log('  Sample (up to 5):');
        sampleQuiz.forEach(s => {
            console.log('    ' + s.name + ' (' + s.tenant + '/' + s.classId + '): ' + s.quizCount + ' quiz scores');
            s.sample.forEach(([k,v]) => console.log('      • ' + k + ' = ' + v));
        });
    } else {
        console.log('  ⚠ ZERO docs have any quiz scores — quiz wiring likely broken');
    }
    console.log();
    console.log('TIME TRACKING (totalSessionMs + legacy totalTimeSpent):');
    console.log('  Docs with any time > 0:          ' + docsWithTime + '/' + totalDocs);
    if (sampleTime.length > 0) {
        console.log('  Sample (up to 5):');
        sampleTime.forEach(s => {
            console.log('    ' + s.name + ' (' + s.tenant + '/' + s.classId + '): ' +
                        s.unifiedMin + ' min  [totalSessionMs=' + s.totalSessionMs +
                        '  legacy.totalTimeSpent=' + s.totalTimeSpentSec + 's]');
        });
    } else {
        console.log('  No sessions have ended since the time-tracking fix.');
        console.log('  Expected: this number grows organically as students end sessions.');
    }
    process.exit(0);
}

main().catch(e => { console.error('FAILED:', e); process.exit(2); });
