'use strict';

/**
 * Security+ QUIZ-011 rebalance — ATOMIC key seeder.
 *
 * RULE-#10 GATED: writes production Firestore. Run ONLY with explicit
 * operator authorization, from master, in the same turn as the paired
 * hosting deploy of the 16 rebalanced pages (commit carrying the new
 * option order). Pages and keys are coupled: old pages + new keys, or
 * new pages + old keys, both grade wrongly per-question during the gap.
 *
 * Writes all 16 quiz_keys/{id} docs in ONE Firestore batch commit
 * (atomic — all keys flip together), sourced from functions/quiz_keys.json
 * (already updated by the staging pass; snapshots of the old keys at
 * ~/hexworth-shared/secplus-quiz-rebalance-2026-07-02/).
 *
 * Usage:
 *   node seed-secplus-rebalance-2026-07-02.js            # dry run (prints plan)
 *   node seed-secplus-rebalance-2026-07-02.js --execute  # atomic batch write
 *
 * Post-seed gate (mandatory): node verify-quiz-keys.js <all 16 ids>
 */
const admin = require('firebase-admin');
const fs = require('fs');

// The 16 rebalanced ids — 15 domain quizzes + practice exam 1.
const IDS = [
    'shield-secplus-d1-change-management-quiz',
    'shield-secplus-d1-crypto-solutions-quiz',
    'shield-secplus-d1-design-principles-quiz',
    'shield-secplus-d1-governance-asset-quiz',
    'shield-secplus-d2-app-injection-quiz',
    'shield-secplus-d2-malware-quiz',
    'shield-secplus-d2-network-social-quiz',
    'shield-secplus-d2-threat-actors-quiz',
    'shield-secplus-d3-crypto-pki-quiz',
    'shield-secplus-d3-iam-quiz',
    'shield-secplus-d4-vuln-mgmt-quiz',
    'shield-secplus-d5-compliance-quiz',
    'shield-secplus-d5-governance-quiz',
    'shield-secplus-d5-risk-mgmt-quiz',
    'shield-secplus-d5-vendor-risk-quiz',
    'shield-sy0-701-practice-exam-1',
];

// Source of truth for the NEW keys: the staged quiz_keys.json in this directory.
const keys = JSON.parse(fs.readFileSync(__dirname + '/quiz_keys.json', 'utf8'));
const execute = process.argv.includes('--execute');

// Detect the old placeholder layout ([0,1,2,3,0,1,...]). Seeding a cyclic
// key means the wrong (pre-rebalance) quiz_keys.json is checked out — the
// whole point of this seed is to replace that pattern.
function isCyclic(a) { return a.every((v, i) => v === i % 4); }

// Preflight every id BEFORE any write: entry must exist, be well-formed,
// and be the rebalanced (non-cyclic) version. Any failure aborts pre-write.
for (const id of IDS) {
    const entry = keys[id];
    if (!entry || !Array.isArray(entry.answers)) throw new Error('missing key: ' + id);
    if (isCyclic(entry.answers)) throw new Error(id + ' is still CYCLIC — staged quiz_keys.json not checked out?');
    console.log(`${execute ? 'WILL SEED' : 'DRY RUN '} ${id}: ${entry.answers.length} answers, pass ${entry.passingScore}`);
}

// Dry-run guard: without --execute nothing touches Firestore.
if (!execute) {
    console.log('\nDry run only. Re-run with --execute (operator authorization required).');
    process.exit(0);
}

// Atomic seed: one batch, all 16 docs — either every key flips or none does.
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const batch = db.batch();
for (const id of IDS) {
    batch.set(db.doc(`quiz_keys/${id}`), keys[id], { merge: false });
}
batch.commit().then(() => {
    console.log('\nATOMIC BATCH COMMITTED — all 16 keys flipped together.');
    console.log('NOW RUN: node verify-quiz-keys.js ' + IDS.join(' '));
    console.log('THEN DEPLOY the paired hosting commit immediately (./deploy.sh).');
    process.exit(0);
}).catch(e => { console.error('BATCH FAILED (nothing written):', e.message); process.exit(1); });
