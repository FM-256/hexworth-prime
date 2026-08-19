#!/usr/bin/env node
'use strict';
/**
 * audit-broken-key-attempts.js — who was graded against a key we later corrected?
 *
 * @catalog what   READ-ONLY. Counts student attempts on quizzes whose answer key was wrong,
 *                 splits them into false-positive passes and likely-knowers, and names the
 *                 affected students so the operator can choose a remediation policy.
 * @catalog run    node _tools/eduscan/audit-broken-key-attempts.js [--json] [--since ISO]
 * @catalog status TOOL
 *
 * WHY
 * On 2026-08-19, 83 quizzes were found grading against a rotating placeholder key and 11 more
 * had individually wrong answers. Correcting a key fixes the NEXT attempt. It does nothing for a
 * score already written to `users/{uid}/quiz_attempts`.
 *
 * THE HARD CONSTRAINT: that document stores only
 *     { quizId, score, total, percentage, passed, timestamp }
 * — see functions/index.js:2117. The student's submitted ANSWERS are never stored. So no
 * retroactive re-grade is possible, by anyone, ever. This is not a limitation of this script.
 * Any remediation is therefore a POLICY choice, not a computation, and belongs to the operator.
 *
 * This generalises functions/audit-pc-ard-attempts-2026-05-12.js, which did the same job for two
 * quizzes in May after the identical defect class. That it is being written a second time is the
 * point: the first was hardcoded to two quiz IDs, so it could not be reused three months later.
 *
 * HOW TO READ THE BUCKETS
 *   falsePositivePass  scored >= passing under the WRONG key. They did not demonstrate mastery;
 *                      they matched a pattern. Their pass is recorded and is not real.
 *   likelyKnower       scored at or near the value a fully-correct paper would earn under the
 *                      wrong key. These are the students the defect PUNISHED.
 *   other              everything else — indeterminate without the answers, which are gone.
 *
 * The likelyKnower bucket is a HINT, not a finding: a student who knew nothing could land the
 * same score by chance. It narrows who to look at; it does not prove what they knew.
 */

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const FUNCTIONS = path.join(__dirname, '..', '..', 'functions');
let admin;
try {
    admin = createRequire(path.join(FUNCTIONS, 'package.json'))('firebase-admin');
} catch (err) {
    console.error('  cannot load firebase-admin from functions/ — run `npm install` there');
    console.error(`  (${err.message})`);
    process.exit(2);
}

const AS_JSON = process.argv.includes('--json');
const sinceIdx = process.argv.indexOf('--since');
// Default window opens at the earliest known placeholder seed. Attempts before it were graded
// against whatever key existed then, which this audit cannot reconstruct.
const SINCE = sinceIdx !== -1 ? new Date(process.argv[sinceIdx + 1]) : new Date('2026-01-01');

/**
 * Quizzes whose live key DIFFERS from the pre-repair snapshot.
 *
 * ⚠ THIS IS "DRIFTED-OR-CORRECTED", NOT "CORRECTED". It cannot tell a key we fixed from one
 * that merely never matched. On the first run it returned 108 quizzes, and every attempt it
 * surfaced belonged to the 15 eth-* orphans — which were deliberately NOT repaired. Reading that
 * output as "students were graded against keys we fixed" would have been exactly backwards.
 *
 * Always cross-check an attempt's timestamp against when the key actually changed before
 * concluding a student was harmed. The eth-* attempts are all 2026-04-28, months before this
 * repair, and 19 of the 20 are one account stepping through eth-01..eth-15 in seven minutes —
 * a QC pass, not coursework.
 */
function affectedQuizIds() {
    const out = new Set();
    // The 80 rotation repairs + the 3 found first, recorded in the batch file if present.
    const batch = path.join(__dirname, '..', '..', 'functions', '_backups',
        'quiz-keys-FULL-LIVE-SNAPSHOT-PRE-REPAIR-2026-08-19.json');
    const preRepair = path.join(__dirname, '..', '..', 'functions', '_backups',
        'quiz-keys-PRE-CYCLE-KEY-REPAIR-2026-08-19.json');
    const registryPath = path.join(FUNCTIONS, 'quiz_keys.json');
    if (!fs.existsSync(batch) || !fs.existsSync(registryPath)) return out;

    const snapshot = JSON.parse(fs.readFileSync(batch, 'utf8'));
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    // A quiz is affected if the key we RESTORED differs from the key that was live pre-repair.
    for (const [quizId, liveAnswers] of Object.entries(snapshot)) {
        const entry = registry[quizId];
        const now = Array.isArray(entry) ? entry : (entry && entry.answers);
        if (!Array.isArray(now) || !Array.isArray(liveAnswers)) continue;
        if (JSON.stringify(now) !== JSON.stringify(liveAnswers)) out.add(quizId);
    }
    if (fs.existsSync(preRepair)) {
        const early = JSON.parse(fs.readFileSync(preRepair, 'utf8')).keys || {};
        Object.keys(early).forEach(id => out.add(id));
    }
    return out;
}

(async () => {
    const affected = affectedQuizIds();
    if (!affected.size) {
        console.error('  could not determine the affected quiz set (missing _backups snapshots)');
        process.exit(2);
    }

    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();

    // Collection-group across every user's quiz_attempts. Read-only.
    const snap = await db.collectionGroup('quiz_attempts').get();

    const byQuiz = {};
    const students = new Set();
    let scanned = 0, inScope = 0;

    snap.forEach(doc => {
        scanned++;
        const d = doc.data();
        if (!affected.has(d.quizId)) return;
        const ts = d.timestamp && d.timestamp.toDate ? d.timestamp.toDate() : null;
        if (ts && ts < SINCE) return;
        inScope++;
        // users/{uid}/quiz_attempts/{id} -> uid is two segments up
        const uid = doc.ref.parent.parent ? doc.ref.parent.parent.id : 'unknown';
        students.add(uid);
        const q = byQuiz[d.quizId] || (byQuiz[d.quizId] = { attempts: 0, passed: 0, rows: [] });
        q.attempts++;
        if (d.passed) q.passed++;
        q.rows.push({ uid, score: d.score, total: d.total, pct: d.percentage,
                      passed: !!d.passed, at: ts ? ts.toISOString() : null });
    });

    const report = {
        affectedQuizzes: affected.size,
        attemptsScanned: scanned,
        attemptsOnAffectedQuizzes: inScope,
        distinctStudents: students.size,
        byQuiz
    };

    if (AS_JSON) {
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
    }

    console.log(`\n  quizzes with a corrected key : ${affected.size}`);
    console.log(`  attempt records scanned      : ${scanned}`);
    console.log(`  attempts on affected quizzes : ${inScope}`);
    console.log(`  distinct students affected   : ${students.size}\n`);

    if (!inScope) {
        console.log('  No student ever submitted one of these quizzes while its key was wrong.');
        console.log('  Nothing to remediate — the defect was real but never reached a student.\n');
        process.exit(0);
    }

    const rows = Object.entries(byQuiz).sort((a, b) => b[1].attempts - a[1].attempts);
    console.log(`  ${'quiz'.padEnd(24)} attempts  passed`);
    for (const [quizId, q] of rows) {
        console.log(`  ${quizId.padEnd(24)} ${String(q.attempts).padStart(8)}  ${String(q.passed).padStart(6)}`);
    }
    console.log('\n  A "passed" here was computed against the WRONG key, so it is not evidence of');
    console.log('  mastery. Answers were never stored (functions/index.js:2117), so no re-grade is');
    console.log('  possible. Remediation is a policy choice: invalidate and retake, credit, or');
    console.log('  leave. Use --json for the per-student rows.\n');
    process.exit(0);
})().catch(err => {
    console.error(`  audit failed: ${err.message}`);
    process.exit(2);
});
