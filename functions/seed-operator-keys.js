#!/usr/bin/env node
/**
 * seed-operator-keys.js -- SEC-4: seed operator_keys/{missionId} from operator_keys.json.
 *
 * Companion to migrate-operator-keys.js: that script EXTRACTS keys from the mission
 * configs into operator_keys.json; this one WRITES them to production Firestore so
 * validateMissionCompletion can validate (an empty operator_keys collection means every
 * mission silently falls back to local-only completion -- the 2026-07-28 Operator bug).
 *
 * PRODUCTION WRITE -- run only with explicit operator authorization (CLAUDE.md rule 10).
 *
 * Semantics: full-replace per doc (set without merge). Re-seeding after a config edit
 * replaces the doc atomically; a mission attempt in flight validates against whichever
 * version is present when the student finishes. A reseed can therefore invalidate an
 * in-flight attempt started under old checks -- reseed at low-traffic times and only
 * after the corresponding config change has shipped to hosting.
 *
 * Usage:
 *   node migrate-operator-keys.js --export-keys   # regenerate operator_keys.json first
 *   node seed-operator-keys.js --dry-run          # show what would be written
 *   node seed-operator-keys.js --apply            # write to Firestore
 */
'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const KEYS_FILE = path.resolve(__dirname, 'operator_keys.json');
const APPLY = process.argv.includes('--apply');
const DRY = process.argv.includes('--dry-run');

if (!APPLY && !DRY) {
    console.log('Usage: node seed-operator-keys.js --dry-run | --apply');
    process.exit(0);
}

if (!fs.existsSync(KEYS_FILE)) {
    console.error('operator_keys.json not found. Run: node migrate-operator-keys.js --export-keys');
    process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
const ids = Object.keys(registry);

// Sanity gates: refuse to seed an obviously broken export.
let bad = 0;
for (const [id, doc] of Object.entries(registry)) {
    if (!Array.isArray(doc.objectives) || doc.objectives.length === 0) { console.error('EMPTY objectives:', id); bad++; }
    if (!Array.isArray(doc.stateKeys)) { console.error('MISSING stateKeys:', id); bad++; }
    for (const o of doc.objectives || []) {
        if (!o.id || !o.check) { console.error('MALFORMED objective in', id, JSON.stringify(o)); bad++; }
    }
}
if (bad) { console.error('ABORT:', bad, 'validation failure(s) in operator_keys.json'); process.exit(1); }
console.log('operator_keys.json valid:', ids.length, 'missions,',
    Object.values(registry).reduce((n, d) => n + d.objectives.length, 0), 'objectives');

if (DRY && !APPLY) {
    ids.slice(0, 5).forEach((id) => console.log('  would write operator_keys/' + id +
        ' (' + registry[id].objectives.length + ' objectives, ' + registry[id].stateKeys.length + ' stateKeys)'));
    console.log('  ... and ' + (ids.length - 5) + ' more. Re-run with --apply to write.');
    process.exit(0);
}

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

(async () => {
    let written = 0;
    // Firestore batches cap at 500 ops; 124 fits in one, but chunk defensively.
    const CHUNK = 400;
    for (let i = 0; i < ids.length; i += CHUNK) {
        const batch = db.batch();
        for (const id of ids.slice(i, i + CHUNK)) {
            batch.set(db.doc('operator_keys/' + id), registry[id]);   // full replace, intended
            written++;
        }
        await batch.commit();
    }
    console.log('Wrote', written, 'docs to operator_keys/.');
    const check = await db.collection('operator_keys').get();
    console.log('Post-write collection count:', check.size, check.size === ids.length ? '(MATCH)' : '(MISMATCH!)');
    process.exit(check.size === ids.length ? 0 : 1);
})().catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
