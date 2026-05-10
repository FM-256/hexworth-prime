#!/usr/bin/env node
/**
 * orphan-classifier.js — Reconcile XREF-002 orphan list with actual HTML usage.
 *
 * For each XREF-002 orphan (key with no `gradeQuiz()` callsite), check whether:
 *   - moduleId/QUIZ_ID reference exists in any _app/ HTML (client-graded)
 *   - gradeQuiz call exists somewhere XREF-002 missed (detector improvement)
 *   - no reference exists at all (true orphan, deletion candidate)
 *
 * Inputs:
 *   - _tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json (XREF-002 output)
 *   - _app/ HTML tree (greppable)
 *
 * Output: stdout report + optional JSON.
 *
 * Usage:
 *   node _tools/eduscan/orphan-classifier.js                  # human-readable
 *   node _tools/eduscan/orphan-classifier.js --json           # machine-readable
 *
 * Authoritative reference: _docs/operations/quiz-keys-orphan-reconciliation-2026-05-09.md
 */

const fs = require('fs');
const path = require('path');
const cmd = require('child_process').execSync;

const ROOT = path.resolve(__dirname, '../..');
const AUDIT_PATH = path.join(ROOT, '_tools/reports/QUIZ_KEY_CALLSITE_AUDIT.json');
const APP_DIR = path.join(ROOT, '_app');

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
const wantJson = process.argv.includes('--json');

const results = { clientGraded: [], serverGradedMissed: [], noReference: [] };

for (const id of audit.orphanIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let cs = [], gs = [];
    try {
        cs = cmd(
            `grep -rln "moduleId.*['\\"]${escaped}['\\"]\\|QUIZ_ID.*['\\"]${escaped}['\\"]" ${APP_DIR}/ 2>/dev/null || true`,
            { encoding: 'utf8' }
        ).trim().split('\n').filter(Boolean);
    } catch (e) {}
    try {
        gs = cmd(
            `grep -rln "gradeQuiz.*['\\"]${escaped}['\\"]" ${APP_DIR}/ 2>/dev/null || true`,
            { encoding: 'utf8' }
        ).trim().split('\n').filter(Boolean);
    } catch (e) {}

    if (cs.length > 0 && gs.length === 0) {
        results.clientGraded.push({ id, files: cs });
    } else if (cs.length > 0 && gs.length > 0) {
        results.serverGradedMissed.push({ id, files: gs });
    } else {
        results.noReference.push(id);
    }
}

if (wantJson) {
    console.log(JSON.stringify({
        totalOrphans: audit.orphanIds.length,
        classification: {
            clientGraded: results.clientGraded.length,
            serverGradedMissed: results.serverGradedMissed.length,
            trueOrphans: results.noReference.length,
        },
        details: results,
    }, null, 2));
    process.exit(0);
}

console.log('Of ' + audit.orphanIds.length + ' XREF-002 orphans:');
console.log('  Client-graded (moduleId, no gradeQuiz):              ' + results.clientGraded.length);
console.log('  Server-graded but XREF-002 missed callsite:          ' + results.serverGradedMissed.length);
console.log('  No HTML reference at all (true orphan candidates):   ' + results.noReference.length);

if (results.serverGradedMissed.length > 0) {
    console.log('\nServer-graded missed (XREF-002 detector improvement opportunities):');
    results.serverGradedMissed.forEach(r =>
        console.log('  ' + r.id + '  ' + r.files[0])
    );
}

console.log('\nTrue orphans (deletion candidates — operator authorization required):');
results.noReference.forEach(id => console.log('  ' + id));

console.log('\nClient-graded (legitimate — keep for static/Firestore parity):');
results.clientGraded.forEach(r =>
    console.log('  ' + r.id + '  ' + r.files[0].replace(APP_DIR, '_app'))
);
