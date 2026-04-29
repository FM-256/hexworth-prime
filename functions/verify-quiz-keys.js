#!/usr/bin/env node
/**
 * verify-quiz-keys.js — Verify the bridge between exam HTML and live Firestore quiz_keys.
 *
 * Server-graded exams call gradeQuiz Cloud Function which reads quiz_keys/{quizId}
 * from Firestore. EduScan validates against the static functions/quiz_keys.json
 * registry — but live Firestore is the source of truth at runtime.
 *
 * This tool reads live Firestore directly to confirm:
 *   1. The expected key documents exist
 *   2. They have the right format (answers array, questionCount, passingScore)
 *   3. answers.length matches questionCount
 *   4. The static registry (functions/quiz_keys.json) matches live state
 *
 * USAGE (from functions/ directory):
 *   node verify-quiz-keys.js                            # verify ALL static-registry IDs against live Firestore
 *   node verify-quiz-keys.js <quizId> [<quizId> ...]    # verify specific IDs
 *   node verify-quiz-keys.js --missing                  # list IDs in static but not Firestore (and vice versa)
 *   node verify-quiz-keys.js --static-only              # check static registry format only (no Firestore call)
 *
 * EXIT CODES (CI-friendly):
 *   0 = all verified IDs OK
 *   1 = one or more verification failures
 *   2 = script error (Firebase Admin failure, missing file, etc.)
 *
 * EXAMPLES:
 *   # Pre-deploy gate for new server-graded exam
 *   node verify-quiz-keys.js divergent-cse-midterm divergent-cse-final
 *
 *   # Find platform-wide bridge gaps
 *   node verify-quiz-keys.js --missing
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const STATIC_REGISTRY = path.join(__dirname, 'quiz_keys.json');

const args = process.argv.slice(2);
const MODE_MISSING = args.includes('--missing');
const MODE_STATIC_ONLY = args.includes('--static-only');
const QUIZ_IDS = args.filter(a => !a.startsWith('--'));

function loadStaticRegistry() {
    if (!fs.existsSync(STATIC_REGISTRY)) {
        console.error(`ERROR: static registry not found at ${STATIC_REGISTRY}`);
        process.exit(2);
    }
    return JSON.parse(fs.readFileSync(STATIC_REGISTRY, 'utf8'));
}

function checkRegistryFormat(staticRegistry) {
    let problems = 0;
    for (const [id, d] of Object.entries(staticRegistry)) {
        const issues = [];
        if (!Array.isArray(d.answers)) issues.push('answers not array');
        if (typeof d.questionCount !== 'number') issues.push('missing questionCount');
        if (typeof d.passingScore !== 'number') issues.push('missing passingScore');
        if (Array.isArray(d.answers) && d.answers.length !== d.questionCount) {
            issues.push(`length mismatch: answers=${d.answers.length} count=${d.questionCount}`);
        }
        if (issues.length) {
            console.log(`  X ${id}: ${issues.join('; ')}`);
            problems++;
        }
    }
    console.log(`\nStatic registry: ${Object.keys(staticRegistry).length} entries, ${problems} format problems.`);
    return problems === 0;
}

async function checkFirestoreLive(db, ids, staticRegistry) {
    let allGood = true;
    let mismatches = 0;
    for (const id of ids) {
        const doc = await db.doc(`quiz_keys/${id}`).get();
        if (!doc.exists) {
            console.log(`  X ${id}: NOT FOUND in Firestore`);
            allGood = false;
            continue;
        }
        const d = doc.data();
        const ansLen = Array.isArray(d.answers) ? d.answers.length : 'NOT_ARRAY';
        const ok = Array.isArray(d.answers) && ansLen === d.questionCount;
        const status = ok ? 'OK' : 'MALFORMED';
        console.log(`  ${ok ? 'OK' : 'X'} ${id}: answers=${ansLen}, questionCount=${d.questionCount}, passingScore=${d.passingScore} [${status}]`);
        if (!ok) allGood = false;

        // Cross-check against static registry
        const stat = staticRegistry[id];
        if (stat && Array.isArray(stat.answers) && Array.isArray(d.answers)) {
            const sameLen = stat.answers.length === d.answers.length;
            const sameVals = sameLen && stat.answers.every((v, i) => v === d.answers[i]);
            if (!sameVals) {
                console.log(`     ! static registry differs from live Firestore`);
                mismatches++;
            }
        } else if (!stat) {
            console.log(`     ! id present in Firestore but missing from static registry — EduScan will not see it`);
            mismatches++;
        }
    }
    if (mismatches) console.log(`\n${mismatches} static-vs-live mismatches detected.`);
    return allGood && mismatches === 0;
}

async function checkMissingDelta(db, staticRegistry) {
    const staticIds = Object.keys(staticRegistry);
    const liveSnap = await db.collection('quiz_keys').get();
    const liveIds = new Set(liveSnap.docs.map(d => d.id));
    const inStaticNotLive = staticIds.filter(id => !liveIds.has(id));
    const inLiveNotStatic = [...liveIds].filter(id => !staticRegistry[id]);
    console.log(`\nStatic registry: ${staticIds.length} entries`);
    console.log(`Live Firestore:   ${liveIds.size} entries`);
    console.log(`\nIn static but NOT in Firestore (${inStaticNotLive.length}):`);
    inStaticNotLive.forEach(id => console.log(`  - ${id}`));
    console.log(`\nIn Firestore but NOT in static registry (${inLiveNotStatic.length}):`);
    inLiveNotStatic.forEach(id => console.log(`  + ${id}`));
    return inStaticNotLive.length === 0 && inLiveNotStatic.length === 0;
}

async function main() {
    console.log('verify-quiz-keys.js');
    console.log('===================');
    const staticRegistry = loadStaticRegistry();

    if (MODE_STATIC_ONLY) {
        const ok = checkRegistryFormat(staticRegistry);
        process.exit(ok ? 0 : 1);
    }

    if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'hexworth-prime' });
    }
    const db = admin.firestore();

    if (MODE_MISSING) {
        const ok = await checkMissingDelta(db, staticRegistry);
        process.exit(ok ? 0 : 1);
    }

    const idsToVerify = QUIZ_IDS.length > 0 ? QUIZ_IDS : Object.keys(staticRegistry);
    console.log(`Verifying ${idsToVerify.length} quizId${idsToVerify.length === 1 ? '' : 's'}:\n`);
    const ok = await checkFirestoreLive(db, idsToVerify, staticRegistry);
    console.log(ok ? '\nVerification PASSED.' : '\nVerification FAILED.');
    process.exit(ok ? 0 : 1);
}

main().catch(err => {
    console.error('verify-quiz-keys error:', err.message);
    process.exit(2);
});
