#!/usr/bin/env node
/*
 * Registry-aware audit for the data-driven hub scaffolder (task #225, step 5).
 *
 * Firestore-only hubs are INVISIBLE to the filesystem-rooted QC (gen-content-audit, EduScan,
 * the smoke gate), so a broken published hub could ship unseen. This closes that gap. It checks:
 *
 *   A. Reserved-id PARITY: the hardcoded reserved-id list in firestore.rules must equal
 *      HubRegistry.all() ids. (Same assertion as the rules-test's drift check, but STATIC /
 *      no-emulator, so it is cheap enough to run in the deploy gate — the authoritative fix for
 *      the two-sources-of-truth drift risk. A dynamic hub must never be able to shadow a static
 *      course id.)
 *   B. The dynamic renderer + the firebase.json rewrite are present.
 *   C. [only when admin credentials are available] every hubRegistry doc is well-formed, and every
 *      PUBLISHED hub resolves to a real, AccessGuard.require('sorted')-gated house (the shared
 *      renderer applies exactly that one gate, so a published hub in a differently-gated house
 *      would be a leak/mismatch).
 *
 * Exit non-zero on any failure (parity drift, missing renderer/rewrite, invalid published hub).
 * Warnings do not fail the run. Run:  node _tools/eduscan/hub-registry-audit.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const A = (p) => path.join(ROOT, p);

let failures = 0, warnings = 0;
const fail = (m) => { console.log('  FAIL  ' + m); failures++; };
const warn = (m) => { console.log('  WARN  ' + m); warnings++; };
const ok = (m) => console.log('  OK    ' + m);

console.log('── hub-registry-audit (task #225) ──');

// ── A. Reserved-id parity: firestore.rules literal <-> HubRegistry.all() ──
const rules = fs.readFileSync(A('firestore.rules'), 'utf8');
const HubRegistry = require(A('_app/components/HubRegistry.js'));
const m = rules.match(/hubId in \[([\s\S]*?)\]/);
const reserved = m ? (m[1].match(/'[^']+'/g) || []).map((s) => s.replace(/'/g, '')) : [];
const staticIds = HubRegistry.all().map((h) => h.id);
const missing = staticIds.filter((id) => reserved.indexOf(id) === -1);
const extra = reserved.filter((id) => staticIds.indexOf(id) === -1);
if (!reserved.length) {
    fail('could not parse the reserved-id list from firestore.rules (hubRegistry create rule)');
} else if (missing.length || extra.length) {
    fail('reserved-id DRIFT: rules(' + reserved.length + ') vs HubRegistry(' + staticIds.length +
        '); missing=[' + missing + '] extra=[' + extra + ']');
} else {
    ok('reserved-id parity: firestore.rules == HubRegistry (' + reserved.length + ' ids)');
}

// ── B. Renderer + rewrite present ──
if (!fs.existsSync(A('_app/houses/hub/index.html'))) fail('dynamic renderer _app/houses/hub/index.html is missing');
else ok('dynamic renderer present');
let fbjson = {};
try { fbjson = JSON.parse(fs.readFileSync(A('firebase.json'), 'utf8')); } catch (e) { fail('firebase.json unparseable: ' + e.message); }
const rewrites = (fbjson.hosting && fbjson.hosting.rewrites) || [];
if (!rewrites.some((r) => r.source === '/houses/hub/**' && r.destination === '/houses/hub/index.html')) {
    fail('firebase.json rewrite /houses/hub/** -> /houses/hub/index.html is missing');
} else {
    ok('firebase.json hub rewrite present');
}

// ── doc-validation helpers ──
const icons = new Set(fs.readdirSync(A('_app/assets/images/icons')).filter((f) => f.endsWith('.webp')));
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
function houseGateIsSorted(houseId) {
    if (typeof houseId !== 'string' || !SLUG.test(houseId)) return 'badid';
    const idx = A('_app/houses/' + houseId + '/index.html');
    if (!fs.existsSync(idx)) return 'nohouse';
    return /AccessGuard\.require\(\s*['"]sorted['"]\s*\)/.test(fs.readFileSync(idx, 'utf8')) ? 'sorted' : 'other';
}
function validateDoc(id, d) {
    if (!SLUG.test(id)) fail("hub '" + id + "': invalid slug id");
    if (['draft', 'published'].indexOf(d.status) === -1) fail("hub '" + id + "': invalid status '" + d.status + "'");
    const iconBase = (typeof d.icon === 'string') ? d.icon.replace(/^.*\//, '') : '';
    if (!icons.has(iconBase)) warn("hub '" + id + "': icon '" + d.icon + "' not in the icon allowlist (would show a broken image)");
    const secs = d.sections || {};
    ['slides', 'labs', 'quizzes', 'exams', 'projects', 'games'].forEach((k) => {
        if (!Array.isArray(secs[k])) warn("hub '" + id + "': sections." + k + ' is not an array');
    });
    if (typeof d.sortOrder !== 'number') warn("hub '" + id + "': sortOrder is not a number");
    const gate = houseGateIsSorted(d.houseId);
    if (gate === 'badid' || gate === 'nohouse') {
        fail("hub '" + id + "': houseId '" + d.houseId + "' has no house index (_app/houses/<id>/index.html)");
    } else if (d.status === 'published' && gate === 'other') {
        fail("hub '" + id + "': PUBLISHED but house '" + d.houseId + "' is not AccessGuard.require('sorted')-gated " +
            '(the shared renderer only applies the sorted gate)');
    }
}

// ── C. Firestore docs (optional; needs admin credentials) ──
(async () => {
    try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
        const snap = await admin.firestore().collection('hubRegistry').get();
        if (snap.empty) ok('hubRegistry: no dynamic hubs yet (nothing to validate)');
        else {
            ok('hubRegistry: validating ' + snap.size + ' dynamic hub(s)');
            snap.forEach((doc) => validateDoc(doc.id, doc.data() || {}));
        }
    } catch (e) {
        warn('Firestore validation skipped (no admin credentials / offline): ' + String(e.message || e).split('\n')[0]);
    }
    console.log('\nhub-registry-audit: ' + failures + ' failure(s), ' + warnings + ' warning(s)');
    process.exit(failures ? 1 : 0);
})();
