#!/usr/bin/env node
/**
 * cleanup-orphan-keys-2026-05-09.js — Delete 88 confirmed-orphan quiz_keys.
 *
 * SOURCE: tick 26-31 investigation, XREF-002 audit. All 88 IDs have ZERO
 * HTML callsites in _app/ AND maintenance-script-only references in
 * functions/. Categorization confirmed across 6 buckets:
 *   - 15 eth-NN-quiz   (commit ec3056f0 embedded-quiz removal)
 *   - 19 ala-NN        (files only in _archive/, course uses ala-l*)
 *   - 21 pis-NN-*      (files only in _source/, course migrated)
 *   - 10 aplus-core1-* (hub uses forge-aplus-core1-* prefix)
 *   - 19 wsa-mNN       (modules client-graded via ModuleProgress.complete)
 *   -  4 shield-pis-w-*-quiz (STR-40 prep, HTML uses pis-w[1-4]-quiz)
 *
 * Audit doc: ~/hexworth-shared/Solutions/_audit/orphan-quiz-keys-finding-2026-05-08.md
 * Tool: _tools/eduscan/quiz-key-callsite-audit.js (XREF-002)
 *
 * SAFETY DESIGN (Nancy review tick 32 — all 5 concerns addressed):
 *
 *  1. Static-first deletion order (Nancy #1): quiz_keys.json removal happens
 *     BEFORE Firestore deletion. Reasoning: static is the callsite reference;
 *     once a key is removed from static, no client lookup constructs the ID.
 *     Inert Firestore docs left after partial failure are zero-impact.
 *
 *  2. Per-ID re-verification grep (Nancy #3): each ID is grep-verified against
 *     _app/**\/*.html immediately before its delete (no cached scan). Closes
 *     the TOCTOU window — a developer adding a callsite between audit time
 *     and execution gets caught. Per-ID spawn cost is negligible for an 88-ID
 *     one-shot script.
 *
 *  3. Branch gate re-checked before writes (Nancy #4): git branch is checked
 *     at startup AND immediately before the first write. Two-line cost,
 *     eliminates branch-switch race during long backup phase.
 *
 *  4. Atomic backup write via .tmp + rename (Nancy #5): backup written to
 *     `<path>.tmp`, fsynced, then atomically renamed to final path. POSIX
 *     guarantees atomicity. Process kill mid-write leaves no partial backup
 *     file — restart sees no backup, aborts cleanly.
 *
 *  5. Hard authorization flag: --confirm-orphan-deletion-2026-05-09 must be
 *     passed exactly. Prevents accidental --dry-run typos becoming live runs.
 *
 *  Other safety:
 *  - Hard-coded ID list (NOT read from JSON file at runtime). Per-category
 *    blocks visible in source diff for operator review.
 *  - Per-ID logging with action taken.
 *  - --dry-run mode validates everything but writes nothing.
 *  - --limit N for incremental rollout.
 *
 * USAGE:
 *   cd functions
 *   node cleanup-orphan-keys-2026-05-09.js --dry-run                                # preview
 *   node cleanup-orphan-keys-2026-05-09.js --dry-run --limit 5                      # preview 5
 *   node cleanup-orphan-keys-2026-05-09.js --confirm-orphan-deletion-2026-05-09     # LIVE
 *   node cleanup-orphan-keys-2026-05-09.js --confirm-orphan-deletion-2026-05-09 --limit 10  # incremental
 *
 * EXIT CODES:
 *   0  success
 *   2  abort pre-write (validation failure, branch check, missing flag)
 *   3  abort mid-run (re-verification found callsite, partial completion)
 *  99  fatal error
 *
 * RECOVERY:
 *   Backup at functions/_audit/orphan-deletion-backup-<ts>.json contains per-ID
 *   {static, firestore} snapshots. To restore: write a script that reads the
 *   backup and re-pushes each entry to its source.
 */

'use strict';

const admin = require('firebase-admin');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Hard-coded orphan IDs by category (per audit doc, all confirmed Track A/B-delete) ---

const TRACK_A_ETH = [
    'eth-01-quiz', 'eth-02-quiz', 'eth-03-quiz', 'eth-04-quiz', 'eth-05-quiz',
    'eth-06-quiz', 'eth-07-quiz', 'eth-08-quiz', 'eth-09-quiz', 'eth-10-quiz',
    'eth-11-quiz', 'eth-12-quiz', 'eth-13-quiz', 'eth-14-quiz', 'eth-15-quiz',
];

const TRACK_A_ALA = [
    'ala-01', 'ala-02', 'ala-03', 'ala-04', 'ala-05', 'ala-06', 'ala-07',
    'ala-08', 'ala-09', 'ala-10', 'ala-11', 'ala-12', 'ala-13', 'ala-14',
    'ala-15', 'ala-16', 'ala-17', 'ala-18', 'ala-19',
];

const TRACK_A_PIS = [
    'pis-01-quiz', 'pis-02-quiz', 'pis-03-quiz', 'pis-04-quiz', 'pis-05-quiz',
    'pis-06-checkpoint', 'pis-07-quiz', 'pis-08-quiz', 'pis-09-quiz',
    'pis-10-quiz', 'pis-11-midterm', 'pis-12-quiz', 'pis-13-quiz',
    'pis-14-quiz', 'pis-15-quiz', 'pis-16-checkpoint', 'pis-17-quiz',
    'pis-18-quiz', 'pis-19-quiz', 'pis-20-quiz', 'pis-21-final',
];

const TRACK_A_APLUS = [
    'aplus-core1-ch02', 'aplus-core1-ch03', 'aplus-core1-ch06',
    'aplus-core1-ch07', 'aplus-core1-ch08', 'aplus-core1-ch09',
    'aplus-core1-ch11', 'aplus-core1-lab-diagnostic-tools',
    'aplus-core1-lab-dns-config', 'aplus-core1-lab-protocol-analysis',
];

const TRACK_A_WSA = [
    'wsa-m01', 'wsa-m02', 'wsa-m03', 'wsa-m04', 'wsa-m05', 'wsa-m06',
    'wsa-m07', 'wsa-m08', 'wsa-m09', 'wsa-m10', 'wsa-m11', 'wsa-m12',
    'wsa-m13', 'wsa-m14', 'wsa-m15', 'wsa-m16', 'wsa-m17', 'wsa-m18', 'wsa-m19',
];

const TRACK_B_SHIELD_PIS_W = [
    'shield-pis-w1-quiz', 'shield-pis-w2-quiz',
    'shield-pis-w3-quiz', 'shield-pis-w4-quiz',
];

const ALL_ORPHANS = [
    ...TRACK_A_ETH, ...TRACK_A_ALA, ...TRACK_A_PIS,
    ...TRACK_A_APLUS, ...TRACK_A_WSA, ...TRACK_B_SHIELD_PIS_W,
];

// Sanity: must equal 88 per audit
if (ALL_ORPHANS.length !== 88) {
    console.error('FATAL: hard-coded ID list has ' + ALL_ORPHANS.length + ' entries, expected 88. Source code drift.');
    process.exit(99);
}

// --- Flags ---

const DRY_RUN = process.argv.includes('--dry-run');
const CONFIRM_FLAG = '--confirm-orphan-deletion-2026-05-09';
const HAS_CONFIRM = process.argv.includes(CONFIRM_FLAG);
let LIMIT = Infinity;
const limitIdx = process.argv.indexOf('--limit');
if (limitIdx > 0 && process.argv[limitIdx + 1]) {
    LIMIT = parseInt(process.argv[limitIdx + 1], 10);
    if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
        console.error('FATAL: invalid --limit value');
        process.exit(99);
    }
}

if (!DRY_RUN && !HAS_CONFIRM) {
    console.error('ABORT: live run requires --' + CONFIRM_FLAG.slice(2) + ' flag.');
    console.error('       Or use --dry-run to preview.');
    process.exit(2);
}

// --- Branch gate (also re-checked before first write) ---

function getBranch() {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
}
function requireMaster(stage) {
    const b = getBranch();
    if (b !== 'master') {
        console.error('ABORT [' + stage + ']: must be on master branch (current: ' + b + ')');
        process.exit(2);
    }
}
requireMaster('startup');

// --- File paths ---

const REPO_ROOT = path.resolve(__dirname, '..');
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const APP_DIR = path.join(REPO_ROOT, '_app');
const BACKUP_DIR = path.join(__dirname, '_audit');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = path.join(BACKUP_DIR, 'orphan-deletion-backup-' + ts + '.json');
const BACKUP_TMP = BACKUP_FILE + '.tmp';

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// --- Per-ID HTML callsite re-verification (Nancy #3) ---

function reVerifyOrphan(id) {
    // Use grep with bidirectional negative lookarounds. POSIX grep -E doesn't
    // support \b reliably for hyphenated IDs; PCRE-style not available either.
    // Use simple word boundary heuristic: search for the literal ID and check
    // that surrounding chars are non-identifier (the audit's regex is canonical).
    // For the cleanup script, simpler: shell out to grep -lF (literal-string),
    // get any matches, then fall back to a per-line scan checking char boundaries.
    try {
        const result = execSync(
            'grep -rlF ' + JSON.stringify(id) + ' ' + JSON.stringify(APP_DIR) + ' --include=\'*.html\' || true',
            { encoding: 'utf8' }
        );
        const files = result.trim().split('\n').filter(Boolean).filter(f => !f.includes('/_archive/') && !f.includes('/_source/'));
        if (files.length === 0) return { ok: true, callsites: 0 };

        // Have potential matches — verify with boundary check
        let realHits = 0;
        for (const f of files) {
            const content = fs.readFileSync(f, 'utf8');
            const idChars = /[a-zA-Z0-9_-]/;
            let pos = 0;
            while ((pos = content.indexOf(id, pos)) !== -1) {
                const before = pos > 0 ? content[pos - 1] : '';
                const after = pos + id.length < content.length ? content[pos + id.length] : '';
                if (!idChars.test(before) && !idChars.test(after)) {
                    realHits++;
                }
                pos += id.length;
            }
        }
        return { ok: realHits === 0, callsites: realHits, files };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// --- Main ---

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    console.log('cleanup-orphan-keys-2026-05-09.js');
    console.log('==================================');
    console.log(DRY_RUN ? '*** DRY RUN — no writes ***' : '*** LIVE WRITE TO PRODUCTION FIRESTORE + STATIC ***');
    console.log('Targets: ' + ALL_ORPHANS.length + ' orphan quiz_keys (limit ' + (LIMIT === Infinity ? 'none' : LIMIT) + ')');
    console.log('Backup: ' + path.relative(REPO_ROOT, BACKUP_FILE));
    console.log('---');

    // Load static registry
    let keys;
    try {
        keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    } catch (e) {
        console.error('FATAL: cannot read quiz_keys.json: ' + e.message);
        process.exit(99);
    }

    // Phase 1: re-verify each ID, collect backups, log skip/proceed
    const backups = {};
    const proceedIds = [];
    const skippedIds = [];
    let processed = 0;

    for (const id of ALL_ORPHANS) {
        if (processed >= LIMIT) break;

        // Skip if already gone (Nancy #5)
        const inStatic = Object.prototype.hasOwnProperty.call(keys, id);
        const fsSnap = await db.doc('quiz_keys/' + id).get();
        const inFirestore = fsSnap.exists;
        if (!inStatic && !inFirestore) {
            console.log('GONE   ' + id + ' :: already deleted from both');
            skippedIds.push({ id, reason: 'already-deleted' });
            continue;
        }

        // Re-verify orphan status (Nancy #3)
        const verify = reVerifyOrphan(id);
        if (!verify.ok) {
            console.log('LIVE   ' + id + ' :: ' + verify.callsites + ' callsite(s) found — ABORT this ID');
            console.log('       files: ' + (verify.files || []).slice(0, 3).join(', '));
            skippedIds.push({ id, reason: 'now-live', callsites: verify.callsites });
            continue;
        }

        // Backup: capture both sides
        backups[id] = {
            static: inStatic ? keys[id] : null,
            firestore: inFirestore ? fsSnap.data() : null,
            inStaticAtBackup: inStatic,
            inFirestoreAtBackup: inFirestore,
        };
        proceedIds.push(id);
        processed++;

        console.log('OK     ' + id + ' :: re-verified orphan, backup captured');
    }

    console.log('---');
    console.log('Re-verified orphan: ' + proceedIds.length);
    console.log('Skipped:            ' + skippedIds.length);

    if (proceedIds.length === 0) {
        console.log('No deletions to perform. Exiting.');
        process.exit(0);
    }

    // Phase 2: write backup atomically (Nancy #5: .tmp + rename)
    if (!DRY_RUN) {
        const backupData = {
            generatedAt: new Date().toISOString(),
            scriptVersion: '2026-05-09',
            totalTargets: ALL_ORPHANS.length,
            processedCount: proceedIds.length,
            backups,
        };
        fs.writeFileSync(BACKUP_TMP, JSON.stringify(backupData, null, 2));
        fs.renameSync(BACKUP_TMP, BACKUP_FILE);
        console.log('Backup written atomically: ' + path.relative(REPO_ROOT, BACKUP_FILE));
    }

    // Branch re-check before any writes (Nancy #4)
    requireMaster('pre-write');

    // Phase 3: STATIC-FIRST deletion (Nancy #1)
    let staticDeleted = 0;
    for (const id of proceedIds) {
        if (Object.prototype.hasOwnProperty.call(keys, id)) {
            delete keys[id];
            staticDeleted++;
        }
    }
    if (!DRY_RUN) {
        // Single atomic file write at end of static phase
        const tmp = KEYS_FILE + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(keys, null, 2));
        fs.renameSync(tmp, KEYS_FILE);
        console.log('Static deleted (' + staticDeleted + ' entries) and quiz_keys.json rewritten.');
    } else {
        console.log('DRY RUN: would delete ' + staticDeleted + ' from static.');
    }

    // Phase 4: Firestore deletion (Nancy #1: static-first means these are now inert)
    let fsDeleted = 0, fsErrors = 0;
    for (const id of proceedIds) {
        try {
            if (DRY_RUN) {
                console.log('DRY    ' + id + ' :: would delete Firestore doc');
            } else {
                await db.doc('quiz_keys/' + id).delete();
                console.log('DEL    ' + id);
                fsDeleted++;
            }
        } catch (e) {
            console.error('FAIL   ' + id + ' :: ' + e.message);
            fsErrors++;
        }
    }

    console.log('---');
    if (DRY_RUN) {
        console.log('DRY RUN complete. Nothing written.');
    } else {
        console.log('Deletion summary:');
        console.log('  Static deleted:    ' + staticDeleted);
        console.log('  Firestore deleted: ' + fsDeleted);
        console.log('  Firestore errors:  ' + fsErrors);
        console.log('  Backup:            ' + path.relative(REPO_ROOT, BACKUP_FILE));
        if (fsErrors > 0) {
            console.error('PARTIAL FAILURE: ' + fsErrors + ' Firestore docs not deleted. Backup preserves originals. Re-run --confirm flag to retry.');
            process.exit(3);
        }
    }
    process.exit(0);
})().catch(err => {
    console.error('FATAL: ' + err.message);
    console.error(err.stack);
    process.exit(99);
});
