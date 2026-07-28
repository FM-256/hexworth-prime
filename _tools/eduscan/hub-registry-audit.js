#!/usr/bin/env node
/*
 * Registry-aware audit for the data-driven hub scaffolder (task #225, step 5).
 *
 * Firestore-only hubs are INVISIBLE to the filesystem-rooted QC (gen-content-audit, EduScan,
 * the smoke gate), so a broken published hub could ship unseen. This closes that gap. It checks:
 *
 *   A. Reserved-id PARITY: the hardcoded reserved-id list in firestore.rules must equal
 *      HubRegistry.all() ids. (Same assertion as the rules-test's drift check, but STATIC /
 *      no-emulator, so it is cheap enough to run in the deploy gate, the authoritative fix for
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

// ── D. Three-way reconciliation: hubs-in-existence <-> hubs-in-gallery <-> hubs-by-name ──
// (Frank's requirement) Ensures every hub gets a cover and the three sets never silently diverge or
// duplicate. "Existence" = static HubRegistry ids + dynamic Firestore hubs. This SYNC section handles
// everything decidable from the filesystem alone: static coverage, manifest integrity, static dupes.
// The cross-existence orphan check needs the dynamic ids too, so it is COMPLETED in Part C (Firestore):
// offline we cannot tell an orphan cover from a cover for a dynamic hub we can't see, so deferring it
// (WARN) is correct and a hard FAIL here would false-block every deploy once dynamic hubs get covers.
const GAL = A('_app/assets/images/covers');
let manifest = null, galleryIds = [];
try {
    manifest = JSON.parse(fs.readFileSync(path.join(GAL, 'manifest.json'), 'utf8'));
    galleryIds = Object.keys(manifest);
} catch (e) {
    warn('covers/manifest.json unreadable (' + e.message + '); gallery reconciliation skipped');
}
if (manifest) {
    // coverage for STATIC hubs (dynamic coverage is checked in Part C, where dynamic ids are known)
    const missingCover = staticIds.filter((id) => galleryIds.indexOf(id) === -1);
    ok('gallery coverage (static): ' + (staticIds.length - missingCover.length) + '/' + staticIds.length + ' hubs have a cover');
    if (missingCover.length) warn(missingCover.length + ' static hub(s) missing a cover: [' + missingCover + ']');
    // manifest integrity: every referenced cover file must exist on disk (existence-independent -> FAIL)
    galleryIds.forEach((id) => {
        const f = (manifest[id] && manifest[id].file) || (id + '.webp');
        if (!fs.existsSync(path.join(GAL, f))) fail("cover file missing on disk for '" + id + "': " + f);
    });
}
// duplicate static ids (routing-breaking -> FAIL) + duplicate static names (confusing, not corrupting -> WARN)
const dupIds = staticIds.filter((id, i) => staticIds.indexOf(id) !== i);
dupIds.forEach((id) => fail("duplicate hub id: '" + id + "'"));
if (!dupIds.length) ok('no duplicate hub ids (' + staticIds.length + ' unique)');
const nameCount = {};
HubRegistry.all().forEach((h) => {
    const n = String(h.label || '').trim().toLowerCase();
    if (n) (nameCount[n] = nameCount[n] || []).push(h.id);
});
Object.keys(nameCount).filter((n) => nameCount[n].length > 1)
    .forEach((n) => warn("duplicate hub name: '" + n + "' shared by [" + nameCount[n] + ']'));

// ── Parent (container membership) integrity: `parent` values must reference a real hub id
//    (a dangling parent silently breaks the container's cartridge grid), never self, and
//    nesting is capped at depth 1 -- a hub that is itself someone's parent may not carry a
//    parent of its own (see "Container grouping" in _docs/architecture/unified-hub-registry.md).
{
    const idSet = new Set(staticIds);
    const parentsInUse = new Set(HubRegistry.all().filter((h) => h.parent).map((h) => h.parent));
    let parentIssues = 0;
    // parent id -> [child ids] for parents not found in the static registry (candidate
    // dynamic containers). Verified against Firestore in Part C; module-scoped so Part C can see it.
    global.__nonStaticParents = global.__nonStaticParents || new Map();
    const nonStaticParents = global.__nonStaticParents;
    HubRegistry.all().forEach((h) => {
        if (!h.parent) return;
        if (h.parent === h.id) { fail("hub '" + h.id + "' lists itself as parent"); parentIssues++; return; }
        if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(h.parent)) { fail("hub '" + h.id + "' has malformed parent '" + h.parent + "'"); parentIssues++; return; }
        if (parentsInUse.has(h.id)) { fail("hub '" + h.id + "' is both a parent and a child (nesting is capped at depth 1)"); parentIssues++; return; }
        // Dynamic containers (e.g. cloud-master) are legal parents but are not in the static
        // id set; Part C verifies they exist in Firestore when credentials are available. A
        // parent that is neither static nor (per Part C) dynamic is dangling.
        if (!idSet.has(h.parent)) {
            nonStaticParents.set(h.parent, (nonStaticParents.get(h.parent) || []).concat(h.id));
        }
    });
    if (!parentIssues) ok('parent integrity: ' + HubRegistry.all().filter((h) => h.parent).length + ' child hub(s), depth-1, no self/malformed refs');
}

// ── E. House card lists (the 4th source): reconcile each house's config.paths cards against the
//    registry BY LINK TARGET. Surfaces the registry<->house drift the registry/gallery/name three-way
//    cannot see (house lists are hand-maintained, separate from HubRegistry). WARN-level: the drift is
//    large and pre-existing, so this reports scope rather than blocking every deploy. Also flags a
//    house-cards.json that has fallen out of date with the house pages.
try {
    const genHC = require('./gen-house-cards.js');
    const freshFull = genHC.extract();
    const fresh = freshFull.houses;
    let committedFull = null;
    try { committedFull = JSON.parse(fs.readFileSync(A('_app/assets/data/house-cards.json'), 'utf8')); } catch (e) { /* handled below */ }
    if (!committedFull || !committedFull.houses) warn('house-cards.json missing/unreadable; run node _tools/eduscan/gen-house-cards.js');
    // compare cards AND parse-warnings, so a changed warning state also counts as stale
    else if (JSON.stringify({ h: committedFull.houses, w: committedFull.warnings || {} }) !== JSON.stringify({ h: fresh, w: freshFull.warnings || {} })) warn('house-cards.json is STALE vs the house pages; re-run node _tools/eduscan/gen-house-cards.js');
    else ok('house-cards.json is current');
    // Resolve to a rooted path with . and .. segments collapsed (dark-arts uses ../ hrefs); identical to
    // the admin panel's normHref so the gate and the dashboard never disagree.
    const normHref = (href, houseId) => {
        if (!href) return null;
        let h = String(href).trim();
        if (h.charAt(0) !== '/') h = '/houses/' + houseId + '/' + h;
        h = h.split('#')[0].split('?')[0];
        const parts = h.split('/'), out = [];
        for (let pi = 0; pi < parts.length; pi++) {
            const seg = parts[pi];
            if (seg === '.') continue;
            if (seg === '..') { if (out.length > 1) out.pop(); continue; }
            out.push(seg);
        }
        return out.join('/').replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    };
    const regByHref = {}, regById = {};
    HubRegistry.all().forEach((h) => { const n = normHref(h.hubHref, ''); if (n) regByHref[n] = h; regById[h.id] = h; });
    let total = 0, matched = 0, unmatched = 0, noHref = 0, brokenRef = 0; const surfaced = {};
    Object.keys(fresh).forEach((hid) => fresh[hid].forEach((c) => {
        total++;
        if (c.registryRef) {   // a bare-string entry: a direct HubRegistry id reference (cannot drift by design)
            if (regById[c.id]) { matched++; surfaced[c.id] = true; } else { brokenRef++; }
            return;
        }
        if (!c.href) { noHref++; return; }
        const m = regByHref[normHref(c.href, hid)];
        if (m) { matched++; surfaced[m.id] = true; } else { unmatched++; }
    }));
    const notSurfaced = HubRegistry.all().filter((h) => !surfaced[h.id]).map((h) => h.id);
    ok('house cards: ' + total + ' across ' + Object.keys(fresh).length + ' houses (' + matched + ' matched, ' + unmatched + ' link elsewhere, ' + noHref + ' no-link)');
    if (unmatched) warn(unmatched + ' house card(s) link to a target not in HubRegistry');
    if (brokenRef) fail(brokenRef + ' house card(s) reference a HubRegistry id that does not exist');
    if (notSurfaced.length) warn(notSurfaced.length + ' registry hub(s) surfaced on no house page: [' + notSurfaced + ']');
} catch (e) {
    warn('house-card reconciliation skipped: ' + String(e.message || e).split('\n')[0]);
}

// ── F. Hub INVENTORY (derived): the audit's reality check against the pages themselves. gen-hub-inventory
//    detects hub-renderer pages and reconciles them vs the registry; here the deploy gate (a) flags a stale
//    hub-inventory.json and (b) reports the DERIVED count, so "the registry has N" is grounded in real pages
//    rather than the hand-curated list. NOTE: the detector's signal is hub RENDERERS, so it covers the
//    renderer-driven hubs, not yet the plainly-rendered nested course pages (a known, tracked gap).
try {
    const genInv = require('./gen-hub-inventory.js');
    const fresh = genInv.inventory();
    let committed = null;
    try { committed = JSON.parse(fs.readFileSync(A('_app/assets/data/hub-inventory.json'), 'utf8')); } catch (e) { /* handled below */ }
    if (!committed || !committed.counts) warn('hub-inventory.json missing/unreadable; run node _tools/eduscan/gen-hub-inventory.js');
    else if (JSON.stringify(committed.hubPages) !== JSON.stringify(fresh.hubPages)) warn('hub-inventory.json is STALE vs the pages; re-run node _tools/eduscan/gen-hub-inventory.js');
    else ok('hub-inventory.json is current');
    const c = fresh.counts;
    ok('hub inventory (renderer-detected): ' + c.hubPagesDetected + ' pages (' + c.registered + ' registered, ' + c.unregistered + ' unregistered); registry has ' + c.registrySize);
    if (c.unregistered) warn(c.unregistered + ' renderer-detected hub page(s) not in the registry');
} catch (e) {
    warn('hub-inventory reconciliation skipped: ' + String(e.message || e).split('\n')[0]);
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

// ── C. Firestore docs + the dynamic half of the three-way reconciliation (needs admin credentials) ──
(async () => {
    try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
        const snap = await admin.firestore().collection('hubRegistry').get();
        const dynIds = [], dynByName = {};
        if (snap.empty) {
            ok('hubRegistry: no dynamic hubs yet (nothing to validate)');
        } else {
            ok('hubRegistry: validating ' + snap.size + ' dynamic hub(s)');
            snap.forEach((doc) => {
                const d = doc.data() || {};
                validateDoc(doc.id, d);
                dynIds.push(doc.id);
                const lbl = String(d.label || '').trim().toLowerCase();
                if (lbl) (dynByName[lbl] = dynByName[lbl] || []).push(doc.id);
                // a dynamic hub must never shadow a static id (rules reject this on create; belt-and-braces here)
                if (staticIds.indexOf(doc.id) !== -1) fail("dynamic hub '" + doc.id + "' collides with a static hub id");
                // Frank's goal: any new hub gets a cover. A PUBLISHED dynamic hub with none -> WARN (drafts exempt).
                if (d.status === 'published' && galleryIds.indexOf(doc.id) === -1)
                    warn("published dynamic hub '" + doc.id + "' has no cover (cartridge falls back to its icon)");
            });
        }
        // Both halves of "existence" are now known -> complete the cross-existence orphan check.
        if (manifest) {
            const fullExist = staticIds.concat(dynIds);
            galleryIds.filter((id) => fullExist.indexOf(id) === -1)
                .forEach((id) => fail("orphan cover '" + id + "': a cover exists for no hub (static or dynamic)"));
        }
        // Parent integrity, dynamic half: static entries whose parent is not a static id
        // (collected in the Part-D parent check) must reference a REAL dynamic container.
        // Anything else is a dangling parent -> the container cartridge grid renders nowhere.
        if (global.__nonStaticParents && global.__nonStaticParents.size) {
            global.__nonStaticParents.forEach((children, pid) => {
                if (dynIds.indexOf(pid) === -1)
                    fail("dangling parent '" + pid + "' (children: " + children.join(', ') + ") exists neither statically nor dynamically");
                else
                    ok("dynamic container '" + pid + "' verified (" + children.length + " child hub(s))");
            });
        }
        // duplicate names spanning static+dynamic (pure-static dupes already reported in Part D)
        Object.keys(dynByName).forEach((n) => {
            const staticShare = nameCount[n] ? nameCount[n].length : 0;
            if (staticShare + dynByName[n].length > 1 && staticShare < 2)
                warn("duplicate hub name across static+dynamic: '" + n + "'");
        });
    } catch (e) {
        warn('Firestore validation skipped (no admin credentials / offline): ' + String(e.message || e).split('\n')[0]);
        // Same deferral for parents pointing at (claimed) dynamic containers: offline we cannot
        // prove them real, so WARN rather than false-FAIL; the credentialed run decides.
        if (global.__nonStaticParents && global.__nonStaticParents.size) {
            global.__nonStaticParents.forEach((children, pid) => {
                warn("parent '" + pid + "' (children: " + children.join(', ') + ") is not a static hub; dynamic existence NOT verified (offline)");
            });
        }
        // We cannot see dynamic hubs, so an unmatched cover MIGHT belong to one -> DEFER (WARN), never FAIL.
        // A truly bogus cover with no file on disk is still caught by Part D's file-existence FAIL.
        if (manifest) {
            const unmatched = galleryIds.filter((id) => staticIds.indexOf(id) === -1);
            if (unmatched.length) warn(unmatched.length + ' cover(s) not matched to a static hub; orphan check DEFERRED ' +
                '(run with Firestore creds, or use the admin Hub Health panel): [' + unmatched + ']');
        }
    }
    console.log('\nhub-registry-audit: ' + failures + ' failure(s), ' + warnings + ' warning(s)');
    process.exit(failures ? 1 : 0);
})();
