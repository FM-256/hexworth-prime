#!/usr/bin/env node
/**
 * diff-class-triage-2026-05-08.js — Bucketize DIFFERENT-class drift findings.
 *
 * Reads the placeholder-drift-audit.js report (DIFFERENT + LENGTH-MISMATCH
 * sections), pulls each quiz's current Firestore answers, and classifies
 * by drift direction:
 *
 *   sub-class 1 STATIC-NEWER-MISSED  — Firestore has near-cycling placeholder
 *                                       (audit's exact-pattern matcher missed)
 *   sub-class 2 FIRESTORE-NEWER      — Static is placeholder, Firestore is real
 *   sub-class 3 BOTH-REAL-DIVERGENT  — Both real, mid-array drift (Karl needed)
 *   length-mismatch                  — Length differs (separate handling)
 *
 * Read-only — no writes. Outputs JSON triage file alongside report.
 *
 * Usage:
 *   cd functions
 *   node diff-class-triage-2026-05-08.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const OUT_FILE = path.join(__dirname, '_diff-class-triage-2026-05-08.json');

const DIFFERENT_IDS = [
    'db-33-sql-quiz',
    'eth-01-quiz', 'eth-02-quiz', 'eth-03-quiz', 'eth-04-quiz', 'eth-05-quiz',
    'eth-06-quiz', 'eth-07-quiz', 'eth-08-quiz', 'eth-09-quiz', 'eth-10-quiz',
    'eth-11-quiz', 'eth-12-quiz', 'eth-13-quiz', 'eth-14-quiz', 'eth-15-quiz',
    'ms102-ch01-quiz', 'ms102-ch02-quiz', 'ms102-ch03-quiz', 'ms102-ch07-quiz',
    'ms900-ch01-quiz', 'ms900-ch03-quiz',
    'pc-ard-02-quiz', 'pc-ard-06-quiz', 'pc-ard-07-quiz', 'pc-ard-08-quiz',
    'pc-ard-09-quiz', 'pc-ard-10-quiz', 'pc-ard-12-quiz', 'pc-ard-13-quiz',
    'pc-ard-15-quiz', 'pc-ard-17-quiz', 'pc-ard-18-quiz', 'pc-ard-19-quiz',
    'pl300-ch01-quiz', 'pl300-ch02-quiz',
    'sc200-ch01-quiz', 'sc200-ch02-quiz',
    'sc900-ch03-quiz', 'sc900-ch04-quiz',
];
const LENGTH_MISMATCH_IDS = ['az104-ch06-quiz'];

// Placeholder shape detectors (refined tick 31 — period-N rotation aware)
function isStrictCycling(answers) {
    if (!Array.isArray(answers)) return false;
    return answers.length >= 4 && answers.every((v, i) => v === (i % 4));
}
function isNearCycling(answers) {
    if (!Array.isArray(answers) || answers.length < 5) return false;
    const head = answers.slice(0, answers.length - 2);
    return head.every((v, i) => v === (i % 4));
}
function isAllSame(answers) {
    if (!Array.isArray(answers) || answers.length === 0) return false;
    return answers.every(v => v === answers[0]);
}
// Period-N cycling for any rotation [a,b,c,...] repeating. Length>=8 confidence
// threshold avoids short-array false positives. Catches ms900-ch01/ch03 hidden
// P0 student-impact bugs where Firestore had [1,2,0,3,...] and [2,0,1,3,...].
function isPeriodCycling(answers) {
    if (!Array.isArray(answers) || answers.length < 8) return false;
    for (let p = 2; p <= 6; p++) {
        if (answers.length < p * 2) continue;
        const period = answers.slice(0, p);
        if (answers.every((v, i) => v === period[i % p])) return true;
    }
    return false;
}
function isPlaceholderShape(answers) {
    return isStrictCycling(answers) || isNearCycling(answers) || isAllSame(answers) || isPeriodCycling(answers);
}

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const result = {
        generatedAt: new Date().toISOString(),
        subClass1_staticNewerMissed: [],
        subClass2_firestoreNewer: [],
        subClass3_bothRealDivergent: [],
        lengthMismatch: [],
        unknown: [],
    };

    const allIds = [...DIFFERENT_IDS, ...LENGTH_MISMATCH_IDS];

    for (const id of allIds) {
        const staticEntry = keys[id];
        if (!staticEntry || !Array.isArray(staticEntry.answers)) {
            result.unknown.push({ id, reason: 'no static entry' });
            continue;
        }

        const snap = await db.doc('quiz_keys/' + id).get();
        if (!snap.exists) {
            result.unknown.push({ id, reason: 'no firestore doc' });
            continue;
        }
        const fs_ = snap.data();
        if (!Array.isArray(fs_.answers)) {
            result.unknown.push({ id, reason: 'firestore has no answers array' });
            continue;
        }

        const sLen = staticEntry.answers.length;
        const fLen = fs_.answers.length;

        if (sLen !== fLen) {
            result.lengthMismatch.push({
                id,
                static: staticEntry.answers,
                firestore: fs_.answers,
                staticLen: sLen,
                firestoreLen: fLen,
            });
            continue;
        }

        const staticIsPlaceholder = isPlaceholderShape(staticEntry.answers);
        const firestoreIsPlaceholder = isPlaceholderShape(fs_.answers);

        const entry = {
            id,
            static: staticEntry.answers,
            firestore: fs_.answers,
            staticIsPlaceholder,
            firestoreIsPlaceholder,
            staticHasFixNote: !!staticEntry.fixNote,
            staticLastFixedAt: staticEntry.lastFixedAt || null,
        };

        if (firestoreIsPlaceholder && !staticIsPlaceholder) {
            result.subClass1_staticNewerMissed.push(entry);
        } else if (staticIsPlaceholder && !firestoreIsPlaceholder) {
            result.subClass2_firestoreNewer.push(entry);
        } else if (!staticIsPlaceholder && !firestoreIsPlaceholder) {
            result.subClass3_bothRealDivergent.push(entry);
        } else {
            // Both placeholder (shouldn't happen for DIFFERENT class)
            result.unknown.push({ id, reason: 'both placeholder', static: staticEntry.answers, firestore: fs_.answers });
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
    console.log('Sub-class triage complete.');
    console.log('  Sub-class 1 (STATIC-NEWER-MISSED, reseed Firestore):    ' + result.subClass1_staticNewerMissed.length);
    console.log('  Sub-class 2 (FIRESTORE-NEWER, reseed STATIC):           ' + result.subClass2_firestoreNewer.length);
    console.log('  Sub-class 3 (BOTH-REAL-DIVERGENT, Karl needed):         ' + result.subClass3_bothRealDivergent.length);
    console.log('  LENGTH-MISMATCH (separate single-key fixes):            ' + result.lengthMismatch.length);
    console.log('  UNKNOWN (manual triage):                                ' + result.unknown.length);
    console.log('  Total processed: ' + allIds.length);
    console.log('Written to: ' + OUT_FILE);
    process.exit(0);
})().catch(err => { console.error('FATAL: ' + err.message); process.exit(99); });
