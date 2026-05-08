#!/usr/bin/env node
/**
 * seed-placeholder-fix-2026-05-08.js
 *
 * P0 reseed of 72 STATIC-NEWER quiz keys identified by Karl audit
 * 2026-05-08 (`~/hexworth-shared/Solutions/_audit/karl-placeholder-key-drift-audit.md`).
 *
 * Each of these quiz IDs has REAL answers in `functions/quiz_keys.json` but
 * a placeholder in production Firestore (ALL-ZEROS or [0,1,2,3] cycling).
 * Students taking these quizzes are graded against the placeholder, scoring
 * 0% (or near-random) regardless of their actual answer correctness.
 *
 * This script reseeds Firestore with the static (correct) values.
 *
 * Separately, this also patches Q31/Q35/Q38 in `shield-pis-final` per Karl's
 * QC-47 audit. Those three questions had wrong answer indices in BOTH static
 * AND Firestore. Static is corrected first (commit), then this script seeds
 * the corrected values to Firestore.
 *
 * Usage:
 *   cd functions
 *   node seed-placeholder-fix-2026-05-08.js --dry-run                # preview FULL 73 set
 *   node seed-placeholder-fix-2026-05-08.js --safe-subset --dry-run  # preview 8 verified-safe
 *   node seed-placeholder-fix-2026-05-08.js --safe-subset            # LIVE 8 verified-safe
 *   node seed-placeholder-fix-2026-05-08.js                          # LIVE FULL 73
 *
 * Per CLAUDE.md rule 10: explicit user authorization required before live run.
 *
 * SAFE-SUBSET (added 2026-05-08 after pv-mp-04 spot-check exposed heuristic-derived
 * static answers in pc-esp/pv-* series). The 8 safe IDs have manually-verified
 * static answers per project_placeholder_keys_audit.md memory + Karl QC-46/47:
 *   - divergent-eth-final / divergent-eth-midterm  (Karl QC-46 confirmed real)
 *   - ms900-ch02-quiz                              (memory: manually verified)
 *   - pc-ard-01/03/11/16-quiz                      (memory: manually verified, 4 of 19)
 *   - shield-pis-final                             (Karl QC-47 verified, Q31/35/38 corrected)
 * The other 65 STATIC-NEWER IDs (pc-esp + pv-b + pv-e + pv-f + pv-m + pv-mp)
 * await Karl content-verify pass before they can join the seed.
 */

'use strict';
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const DRY_RUN = process.argv.includes('--dry-run');
const SAFE_SUBSET = process.argv.includes('--safe-subset');
const STATIC_KEYS_PATH = path.join(__dirname, 'quiz_keys.json');

// Quizzes whose static answers are MANUALLY VERIFIED to match the original-
// position-index convention (NOT options[0]=correct). Seed-safe.
// REMOVED 2026-05-08: divergent-eth-final, divergent-eth-midterm — those use
// options[0]=correct convention; their static was heuristic-wrong; static
// has been corrected to all-zeros (matching Firestore canonical) — no seed
// needed because Firestore is already correct.
const SAFE_TO_SEED_IDS = new Set([
    'ms900-ch02-quiz',     // verified Q1 (Entra ID = option 1 = static value)
    'pc-ard-01-quiz',      // verified Q1-3 (matches static [1,0,2,...])
    'pc-ard-03-quiz',      // memory: manually verified
    'pc-ard-11-quiz',      // memory: manually verified
    'pc-ard-16-quiz',      // memory: manually verified
    'shield-pis-final',    // Karl QC-47 verified, Q31/35/38 corrected
    'security',            // Karl QC-48 corrected array; count fixed 25->15
]);

// 72 STATIC-NEWER quiz IDs from Karl audit 2026-05-08.
// Order preserves the audit table for traceability.
const P0_RESEED_IDS = [
    // ALL-ZEROS placeholders in Firestore
    'divergent-eth-final',
    'divergent-eth-midterm',
    // CYCLING placeholders in Firestore
    'ms900-ch02-quiz',
    'pc-ard-01-quiz', 'pc-ard-03-quiz', 'pc-ard-11-quiz', 'pc-ard-16-quiz',
    'pc-esp-01-quiz','pc-esp-02-quiz','pc-esp-03-quiz','pc-esp-04-quiz','pc-esp-05-quiz',
    'pc-esp-06-quiz','pc-esp-07-quiz','pc-esp-08-quiz','pc-esp-09-quiz','pc-esp-10-quiz',
    'pc-esp-11-quiz','pc-esp-12-quiz','pc-esp-13-quiz','pc-esp-14-quiz','pc-esp-15-quiz',
    'pv-b-01-quiz','pv-b-02-quiz','pv-b-03-quiz','pv-b-04-quiz',
    'pv-b-05-quiz','pv-b-06-quiz','pv-b-07-quiz','pv-b-08-quiz',
    'pv-e-01-quiz','pv-e-02-quiz','pv-e-03-quiz','pv-e-04-quiz','pv-e-05-quiz',
    'pv-e-06-quiz','pv-e-07-quiz','pv-e-08-quiz','pv-e-09-quiz','pv-e-10-quiz',
    'pv-f-01-quiz','pv-f-02-quiz','pv-f-03-quiz','pv-f-04-quiz','pv-f-05-quiz',
    'pv-f-06-quiz','pv-f-07-quiz','pv-f-08-quiz','pv-f-09-quiz','pv-f-10-quiz',
    'pv-m-01-quiz','pv-m-02-quiz','pv-m-03-quiz','pv-m-04-quiz','pv-m-05-quiz',
    'pv-m-06-quiz','pv-m-07-quiz','pv-m-08-quiz','pv-m-09-quiz','pv-m-10-quiz',
    'pv-mp-01-quiz','pv-mp-02-quiz','pv-mp-03-quiz','pv-mp-04-quiz','pv-mp-05-quiz',
    'pv-mp-06-quiz','pv-mp-07-quiz','pv-mp-08-quiz','pv-mp-09-quiz','pv-mp-10-quiz',
    'pv-mp-11-quiz','pv-mp-12-quiz',
];

// shield-pis-final correctness fix per Karl QC-47 audit. Static must be
// corrected and committed BEFORE this script runs in live mode, otherwise
// the seed will write the still-wrong values from static back to Firestore.
const PIS_FINAL_PRECHECK = {
    id: 'shield-pis-final',
    expectedAt: { 30: 1, 34: 2, 37: 2 }, // 0-indexed Q31/Q35/Q38
};

// Additional fixes discovered post-original-drift-audit (Karl QC-48 etc.).
// These IDs were NOT in P0_RESEED_IDS but Karl's content-aware audit found
// them needing correction. Each entry must already be corrected in static.
const EXTRA_FIXES = [
    'security',  // Karl QC-48: count 25->15, options[0]=correct convention
                 // violated by author error; corrected array seeded
];

function isPlaceholder(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (arr.every(v => v === 0)) return 'all-zeros';
    let cycling = true;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== (i % 4)) { cycling = false; break; }
    }
    if (cycling) return 'cycling';
    return false;
}

(async () => {
    console.log('seed-placeholder-fix 2026-05-08');
    console.log('================================');
    console.log('Mode: ' + (DRY_RUN ? 'DRY RUN' : 'LIVE'));
    console.log('Reseed targets: ' + P0_RESEED_IDS.length);
    console.log('');

    if (!fs.existsSync(STATIC_KEYS_PATH)) {
        console.error('ERROR: static keys file not found at ' + STATIC_KEYS_PATH);
        process.exit(1);
    }
    const staticKeys = JSON.parse(fs.readFileSync(STATIC_KEYS_PATH, 'utf8'));

    // Pre-flight: confirm PIS-final correctness fix has been committed to static.
    const pisFinal = staticKeys[PIS_FINAL_PRECHECK.id];
    if (!pisFinal || !Array.isArray(pisFinal.answers)) {
        console.error('ABORT: ' + PIS_FINAL_PRECHECK.id + ' missing from static');
        process.exit(2);
    }
    let pisFinalReady = true;
    for (const [idx, expected] of Object.entries(PIS_FINAL_PRECHECK.expectedAt)) {
        const actual = pisFinal.answers[Number(idx)];
        if (actual !== expected) {
            console.error('ABORT: ' + PIS_FINAL_PRECHECK.id + ' static[' + idx + '] = ' + actual + ', expected ' + expected);
            pisFinalReady = false;
        }
    }
    if (!pisFinalReady) {
        console.error('Static fix for shield-pis-final NOT yet committed. Run the static patch first.');
        process.exit(3);
    }
    console.log('PIS-final precheck: PASS (Q31=1, Q35=2, Q38=2 in static)');
    console.log('');

    // Build the seed list. Default: full 74 (72 + pis-final + security).
    // With --safe-subset: only the 7 IDs whose static answers are manually
    // verified (Karl QC + memory + spot-check).
    const fullList = [...P0_RESEED_IDS, PIS_FINAL_PRECHECK.id, ...EXTRA_FIXES];
    const seedList = SAFE_SUBSET
        ? fullList.filter(id => SAFE_TO_SEED_IDS.has(id))
        : fullList;
    console.log('Seed scope: ' + (SAFE_SUBSET ? 'SAFE-SUBSET' : 'FULL') + ' (' + seedList.length + ' / ' + fullList.length + ')');
    console.log('');
    let written = 0, skipped = 0, errors = 0;
    for (const qid of seedList) {
        const entry = staticKeys[qid];
        if (!entry || !Array.isArray(entry.answers)) {
            console.warn('SKIP ' + qid + ' (missing in static)');
            skipped++;
            continue;
        }
        const placeholder = isPlaceholder(entry.answers);
        if (placeholder) {
            console.warn('SKIP ' + qid + ' (static is also placeholder: ' + placeholder + ')');
            skipped++;
            continue;
        }
        const payload = {
            answers: entry.answers,
            questionCount: entry.questionCount || entry.answers.length,
            passingScore: entry.passingScore || 70,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'seed-placeholder-fix-2026-05-08',
            source: 'static-quiz_keys.json',
        };
        if (DRY_RUN) {
            console.log('DRY ' + qid + ' answers.length=' + entry.answers.length + ' first5=[' + entry.answers.slice(0, 5).join(',') + ']');
        } else {
            try {
                await db.doc('quiz_keys/' + qid).set(payload, { merge: true });
                written++;
                console.log('OK  ' + qid);
            } catch (err) {
                errors++;
                console.error('ERR ' + qid + ' ' + err.message);
            }
        }
    }

    console.log('');
    console.log('Summary: written=' + written + ' skipped=' + skipped + ' errors=' + errors + ' total=' + seedList.length);
    process.exit(errors > 0 ? 4 : 0);
})().catch(err => { console.error(err); process.exit(5); });
