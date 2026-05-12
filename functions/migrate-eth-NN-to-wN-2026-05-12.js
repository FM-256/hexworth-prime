#!/usr/bin/env node
/**
 * migrate-eth-NN-to-wN-2026-05-12.js
 *
 * Server-side migration to alias legacy ethics module IDs (eth-01..15)
 * onto canonical week-organized IDs (eth-wN-*) so student progress isn't
 * lost when the duplicate hub cards are removed.
 *
 * Strategy (progress-maximizing, per Nancy review):
 *   - For each user doc in `users/`:
 *     - If a legacy `divergent-eth-NN` entry exists in modulesCompleted/labsCompleted/quizzes
 *       AND the canonical `divergent-eth-wN-*` entry is missing or LESS complete
 *     - Copy the legacy completion into the canonical key
 *   - Legacy entries are NEVER deleted in this script (additive only)
 *   - "More complete" = passed > unpassed, or higher score, or any-completed > none
 *
 * Mapping (legacy -> canonical):
 *   eth-01 -> eth-w1-ethics-overview     (presentation)
 *   eth-02 -> eth-w1-it-professionals    (presentation)
 *   eth-03 -> eth-w1-cybersecurity-ethics (presentation)
 *   eth-04 -> eth-w1-quiz                (checkpoint slides -> weekly quiz)
 *   eth-05 -> eth-w2-privacy             (presentation)
 *   eth-06 -> eth-w2-freedom-expression  (presentation)
 *   eth-07 -> eth-w2-intellectual-property (presentation)
 *   eth-08 -> eth-w2-quiz                (checkpoint -> weekly quiz)
 *   eth-09 -> eth-w3-software-ethics     (presentation)
 *   eth-10 -> eth-w3-it-impact           (presentation)
 *   eth-11 -> eth-w3-quiz                (checkpoint -> weekly quiz)
 *   eth-12 -> eth-w4-social-media        (presentation)
 *   eth-13 -> eth-w4-it-organizations    (presentation)
 *   eth-14 -> eth-w4-codes-of-ethics     (presentation)
 *   eth-15 -> eth-final                  (final assessment slides -> exam)
 *
 * Audit lineage: Card duplication discovered 2026-05-12 during
 * pis-w1-lecture work. Nancy reviewed plan, flagged 4 concerns, all addressed:
 *   1. Progress-maximizing merge (NOT recency)        - implemented
 *   2. Phase 1.5 reconciliation gate                  - script outputs report
 *   3. Checkpoint deck quiz keys verified             - already seeded
 *   4. Direct URL callsite audit                      - 0 internal callsites
 *
 * Usage:
 *   cd functions
 *   node migrate-eth-NN-to-wN-2026-05-12.js --dry-run       # report only
 *   node migrate-eth-NN-to-wN-2026-05-12.js --live          # mutate Firestore
 *   node migrate-eth-NN-to-wN-2026-05-12.js --dry-run --json # machine-readable
 *
 * Per CLAUDE.md rule 10: live run requires explicit operator authorization.
 */

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const HOUSE = 'divergent';

const MAP = {
    'eth-01': 'eth-w1-ethics-overview',
    'eth-02': 'eth-w1-it-professionals',
    'eth-03': 'eth-w1-cybersecurity-ethics',
    'eth-04': 'eth-w1-quiz',
    'eth-05': 'eth-w2-privacy',
    'eth-06': 'eth-w2-freedom-expression',
    'eth-07': 'eth-w2-intellectual-property',
    'eth-08': 'eth-w2-quiz',
    'eth-09': 'eth-w3-software-ethics',
    'eth-10': 'eth-w3-it-impact',
    'eth-11': 'eth-w3-quiz',
    'eth-12': 'eth-w4-social-media',
    'eth-13': 'eth-w4-it-organizations',
    'eth-14': 'eth-w4-codes-of-ethics',
    'eth-15': 'eth-final',
};

// Checkpoint/exam mappings — legacy slide-deck completion must NOT phantom-pass
// the canonical server-graded quiz. These are migrated ONLY via quizzes{} path
// (if a real quiz score record exists) — never via modulesCompleted[].
// Per Nancy review 2026-05-12: syncBidirectional restores modulesCompleted[]
// entries as `completed:true` without checking the 70-point gate.
const QUIZ_GATED_CANONICALS = new Set([
    'eth-w1-quiz',
    'eth-w2-quiz',
    'eth-w3-quiz',
    'eth-final',
]);

// Build prefixed legacy -> canonical strings for modulesCompleted[] / labsCompleted[]
const PREFIXED_MAP = {};
for (const [legacy, canon] of Object.entries(MAP)) {
    PREFIXED_MAP[`${HOUSE}-${legacy}`] = `${HOUSE}-${canon}`;
}

const LIVE = process.argv.includes('--live');
const DRY_RUN = !LIVE || process.argv.includes('--dry-run');
const JSON_OUT = process.argv.includes('--json');

if (!DRY_RUN && !LIVE) {
    console.error('FATAL: must specify either --dry-run or --live');
    process.exit(2);
}

function isMoreComplete(candidate, existing) {
    // "More complete" comparison for quiz entries.
    // candidate, existing are objects from cloudProfile.quizzes[id]
    // shape: { score, passed, passedAt }
    if (!existing) return true;  // any > none
    const candPassed = candidate.passed === true || (candidate.score || 0) >= 70;
    const exisPassed = existing.passed === true || (existing.score || 0) >= 70;
    if (candPassed && !exisPassed) return true;
    if (!candPassed && exisPassed) return false;
    // Both passed or both failed: prefer higher score
    const candScore = candidate.score || 0;
    const exisScore = existing.score || 0;
    return candScore > exisScore;
}

async function main() {
    const usersSnap = await db.collection('users').get();
    const report = {
        mode: DRY_RUN ? 'DRY_RUN' : 'LIVE',
        timestamp: new Date().toISOString(),
        totalUsers: usersSnap.size,
        usersWithLegacyData: 0,
        plannedWrites: 0,
        executedWrites: 0,
        usersDetail: [],
    };

    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const data = userDoc.data();
        const userActions = {
            uid,
            callsign: data.callsign || null,
            modulesAdd: [],       // canonical IDs to add to modulesCompleted[]
            labsAdd: [],          // canonical IDs to add to labsCompleted[]
            quizzesUpdate: {},    // canonical-id -> quiz record
            notes: [],
        };

        // --- modulesCompleted[] ---
        const modules = Array.isArray(data.modulesCompleted) ? data.modulesCompleted : [];
        for (const moduleId of modules) {
            const canonical = PREFIXED_MAP[moduleId];
            if (!canonical) continue;
            // Already in canonical form? skip
            if (modules.includes(canonical)) {
                userActions.notes.push(`${moduleId}: canonical ${canonical} already present in modulesCompleted - skip`);
                continue;
            }
            // Skip quiz-gated canonicals — these must only be marked complete via
            // the quizzes{} map with a passing score. Slide-deck completion of the
            // legacy checkpoint deck does NOT entitle credit on the server-graded quiz.
            const canonBare = canonical.slice(HOUSE.length + 1);  // strip "divergent-"
            if (QUIZ_GATED_CANONICALS.has(canonBare)) {
                userActions.notes.push(`${moduleId} -> canonical ${canonical} is QUIZ-GATED - SKIP modulesAdd (would bypass score gate)`);
                continue;
            }
            userActions.modulesAdd.push(canonical);
            userActions.notes.push(`${moduleId} -> ADD ${canonical} to modulesCompleted`);
        }

        // --- labsCompleted[] (eth-NN are NOT labs; eth-lNN are unaffected) ---
        // No-op: lab IDs aren't in MAP. Confirms migration scope.

        // --- quizzes{} ---
        const quizzes = (data.quizzes && typeof data.quizzes === 'object') ? data.quizzes : {};
        for (const [qid, qrec] of Object.entries(quizzes)) {
            const canonical = PREFIXED_MAP[qid];
            if (!canonical) continue;
            const existing = quizzes[canonical];
            if (isMoreComplete(qrec, existing)) {
                userActions.quizzesUpdate[canonical] = {
                    ...qrec,
                    migratedFrom: qid,
                    migratedAt: new Date().toISOString(),
                };
                userActions.notes.push(`${qid} (score=${qrec.score}, passed=${qrec.passed}) -> ${canonical} (existing: ${existing ? `score=${existing.score}` : 'none'})`);
            } else {
                userActions.notes.push(`${qid}: canonical ${canonical} already more complete - skip`);
            }
        }

        // If this user has any planned changes, count + record
        const writeCount = userActions.modulesAdd.length + Object.keys(userActions.quizzesUpdate).length;
        if (writeCount > 0) {
            report.usersWithLegacyData++;
            report.plannedWrites += writeCount;

            if (!DRY_RUN) {
                // Live write: append to arrays, merge quizzes
                const updates = {};
                if (userActions.modulesAdd.length > 0) {
                    updates.modulesCompleted = admin.firestore.FieldValue.arrayUnion(...userActions.modulesAdd);
                }
                if (Object.keys(userActions.quizzesUpdate).length > 0) {
                    for (const [canon, rec] of Object.entries(userActions.quizzesUpdate)) {
                        updates[`quizzes.${canon}`] = rec;
                    }
                }
                updates.lastEthMigrationAt = admin.firestore.FieldValue.serverTimestamp();
                updates.lastEthMigrationBy = 'migrate-eth-NN-to-wN-2026-05-12';

                try {
                    await db.collection('users').doc(uid).update(updates);
                    report.executedWrites += writeCount;
                    userActions.status = 'OK';
                } catch (e) {
                    userActions.status = 'FAILED';
                    userActions.error = e.message;
                }
            } else {
                userActions.status = 'DRY_RUN_planned';
            }
            report.usersDetail.push(userActions);
        }
    }

    if (JSON_OUT) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    console.log('=== eth-NN -> eth-wN-* progress migration ===');
    console.log('Mode:                 ' + report.mode);
    console.log('Total users scanned:  ' + report.totalUsers);
    console.log('Users w/ legacy data: ' + report.usersWithLegacyData);
    console.log('Planned writes:       ' + report.plannedWrites);
    if (!DRY_RUN) {
        console.log('Executed writes:      ' + report.executedWrites);
    }
    console.log();
    if (report.usersDetail.length === 0) {
        console.log('No users with legacy eth-NN progress entries found. Migration is a no-op.');
        return;
    }
    console.log('=== Per-user reconciliation ===');
    for (const u of report.usersDetail) {
        console.log(`\n${u.callsign || '(no callsign)'} (uid=${u.uid}) [${u.status}]`);
        if (u.modulesAdd.length) console.log('  modulesCompleted ADD: ' + u.modulesAdd.join(', '));
        if (Object.keys(u.quizzesUpdate).length) console.log('  quizzes UPDATE: ' + Object.keys(u.quizzesUpdate).join(', '));
        if (u.error) console.log('  ERROR: ' + u.error);
        u.notes.forEach(n => console.log('  - ' + n));
    }
    console.log();
    if (DRY_RUN) {
        console.log('DRY RUN COMPLETE - no writes performed. Review above, then re-run with --live.');
    } else {
        console.log('LIVE MIGRATION COMPLETE - ' + report.executedWrites + ' writes succeeded.');
    }
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
