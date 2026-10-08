#!/usr/bin/env node
'use strict';
/*
 * @catalog what    Measures whether functions/completion-registry.json covers every completion id
 * @catalog what    students actually hold, per surface. Answers ONE question: would turning on
 * @catalog what    _ENFORCE_COMPLETION_REGISTRY reject work a real student already earned?
 * @catalog run     node _tools/content/registry-coverage.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. `_ENFORCE_COMPLETION_REGISTRY` (functions/index.js:414) is OFF because switching
 * it on broke 74 live AI-102 pages on 2026-09-07. The question "is it safe to flip now?" has been
 * asked more than once and answered each time with an ad-hoc script that was then thrown away, so
 * the next person re-derives it from nothing. This is that measurement, kept.
 *
 * ── READ THIS BEFORE QUOTING exit 0 AS PERMISSION TO FLIP THE FLAG ───────────────────────────────
 * This check is PARTLY CIRCULAR and cannot by itself justify enabling enforcement. The registry is
 * built from the legacy floor, and the floor is refreshed FROM live data by
 * refresh-legacy-floor.js. Run that, regenerate, and full coverage here is close to tautological —
 * of course the allowlist covers the data it was just built from.
 *
 * What exit 0 DOES establish, and it is worth having:
 *   - the generator actually consumed the floor (a build that silently dropped it shows up here)
 *   - no surface is missed: ids are counted per surface, so a collection the floor's query never
 *     reached cannot hide inside an aggregate "full coverage"
 *   - a REGRESSION tripwire: run it later, with no refresh, and any gap is new content shipped
 *     without regenerating — which is precisely the 2026-09-07 failure, caught before enforcement
 *     turns it into a student-facing rejection
 *
 * THE BLIND SPOT THAT MADE THIS TOOL LIE, AND WHY THERE IS NOW A SECOND ARM. Coverage measured
 * against LIVE data says nothing about content no student has completed yet. The first version of
 * this probe printed "NO BLOCKERS" while all 22 Python-for-IT (`pyh-`) lab and quiz ids — the
 * ACTIVE course — were absent from the registry, because enrolment is zero so the live id set is
 * empty. Zero live ids trivially yields zero gaps. Enforcement switched on would have rejected
 * every Python student's first completion: the 2026-09-07 AI-102 incident, queued up again.
 *
 * The cause is two blind spots meeting. `gen-completion-registry.js` parses call sites STATICALLY,
 * so `ModuleProgress.complete('code', 'pyh-' + LAB_ID)` is unresolvable and it stores the literal
 * expression text (the registry holds 8 such entries, e.g. "code-pyh-' + LAB_ID"). The live arm
 * cannot see unused content. So ARM B resolves those concatenations the way the page does — find
 * the `const LAB_ID = '...'` in the same file — and checks the resolved id against the registry.
 * It needs no enrolment, so it catches the gap before a student does.
 *
 * What it does NOT establish: that enforcement is safe for FUTURE writes. Ship new content without
 * regenerating the registry and every student who completes it is rejected. Enforcement is only safe
 * with the drift gate (deploy.sh:493) genuinely blocking, and that gate is static — it compares the
 * registry to the sources, and CANNOT see ids that exist only in live data. So flipping the flag
 * needs this probe run against production as a separate, recurring step, not a one-time clearance.
 *
 * READ-ONLY. CONTENT IDS ONLY — never a uid, never a display name, never a score. Nothing is
 * written, so this is safe to run from any branch.
 *
 * EXIT: 0 full coverage. 1 gaps — enforcement would reject earned work. 2 could not run.
 */
const fs = require('fs');
const path = require('path');

function loadAdmin() {
    try { return require('firebase-admin'); } catch (e) {
        if (e && e.code !== 'MODULE_NOT_FOUND') throw e;
    }
    const p = path.join(__dirname, '..', '..', 'functions', 'node_modules', 'firebase-admin');
    try { return require(p); } catch (e) {
        if (e && e.code !== 'MODULE_NOT_FOUND') throw e;
        console.error('  firebase-admin not resolvable — run `npm install` in functions/.');
        process.exit(2);
    }
}

const REG = path.join(__dirname, '..', '..', 'functions', 'completion-registry.json');

/* SHARED, NOT COPIED. Same predicate refresh-legacy-floor.js rejects on — required from it rather
 * than restated here, so the two can never disagree about what counts as malformed. That sharing is
 * also why a wrong predicate is doubly dangerous: Nancy blocked a first version whose blanket
 * dot-rejection would have mis-filed the real ids `dark-arts-redteam.barricade` and
 * `shield-eh-exam-1-a.exam` as malformed in BOTH tools at once. See that file for the full account.
 *
 * THIS SPLIT IS THE POINT OF THE PROBE, AND I GOT IT WRONG ONCE. The first version of this
 * measurement applied the reject filter to the LIVE ids before comparing, which deleted exactly the
 * ids that would have failed and printed a confident "541/541 MISSING=0". The probe handed itself
 * the key. Live ids are now counted RAW, and the missing ones are classified:
 *
 *   LEGITIMATE and missing  -> a real blocker. A student earned it and enforcement would reject it.
 *   MALFORMED and missing   -> NOT a blocker. `undefined` and `[object Object]` are what
 *                              AssignmentManager.submitProgress writes when handed a missing or
 *                              non-string contentId. Enforcement refusing to award those is the
 *                              feature, not the regression, and _isKnownCompletion gates WRITES —
 *                              keys already stored are not re-validated, so nobody loses anything.
 *                              Adding them to the allowlist would make the allowlist bless
 *                              malformed writes, which is the opposite of its purpose.
 *
 * So they are reported loudly and separately, never filtered out of the count. */
const { rejectReason } = require(path.join(__dirname, 'refresh-legacy-floor.js'));

/* Resolves `ModuleProgress.complete('<house>', '<prefix>' + <IDENT>)` by finding `const <IDENT> =
 * '<literal>'` in the SAME file — exactly the resolution the page performs at runtime and the one
 * the static extractor gives up on. Both the bare and house-prefixed forms count as registered,
 * because the writers differ in which they store. */
function armB(known) {
    const APP = path.join(__dirname, '..', '..', '_app');
    const CALL = /ModuleProgress\.complete\(\s*'([^']+)'\s*,\s*'([^']*)'\s*\+\s*([A-Za-z_$][\w$]*)/g;
    const out = [];
    const seen = new Set();
    (function walk(dir) {
        let ents = [];
        try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
        for (const e of ents) {
            const fp = path.join(dir, e.name);
            if (e.isDirectory()) { walk(fp); continue; }
            if (!/\.(html|js)$/.test(e.name)) continue;
            let src = '';
            try { src = fs.readFileSync(fp, 'utf8'); } catch (e2) { continue; }
            if (!src.includes('ModuleProgress.complete(')) continue;
            CALL.lastIndex = 0;
            let m;
            while ((m = CALL.exec(src)) !== null) {
                const [, house, prefix, ident] = m;
                const cm = src.match(new RegExp('const\\s+' + ident + "\\s*=\\s*'([^']+)'"));
                if (!cm) continue;                       // not resolvable here; not a claim either way
                const id = prefix + cm[1];
                if (known.has(id) || known.has(house + '-' + id)) continue;
                const key = id + '|' + house;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push({ id: `${id}  (house '${house}')`, where: path.relative(path.join(APP, '..'), fp) });
            }
        }
    })(APP);
    return out.sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
    if (!fs.existsSync(REG)) { console.error('  completion-registry.json missing'); return 2; }
    const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
    const known = new Set(reg.ids || reg.completions || []);
    if (!known.size) { console.error('  registry parsed but holds 0 ids — refusing to report coverage'); return 2; }

    const admin = loadAdmin();
    admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();

    // Per surface, so a surface the floor's query never reached cannot hide in an aggregate.
    const surfaces = {
        'users/{uid}': new Set(),
        'legacy classes/{c}/progress': new Set(),
        'tenant classes/{c}/progress': new Set()
    };

    const us = await db.collection('users').get();
    for (const d of us.docs) {
        const v = d.data();
        for (const f of ['modulesCompleted', 'labsCompleted']) {
            if (Array.isArray(v[f])) for (const x of v[f]) if (typeof x === 'string' && x) surfaces['users/{uid}'].add(x);
        }
        if (v.quizzes && typeof v.quizzes === 'object') for (const k of Object.keys(v.quizzes)) surfaces['users/{uid}'].add(k);
    }

    const pg = await db.collectionGroup('progress').get();
    for (const d of pg.docs) {
        const segs = d.ref.path.split('/').length;
        const key = segs === 4 ? 'legacy classes/{c}/progress' : 'tenant classes/{c}/progress';
        const v = d.data();
        if (v.completions && typeof v.completions === 'object') for (const k of Object.keys(v.completions)) surfaces[key].add(k);
        for (const f of ['modulesCompleted', 'labsCompleted']) {
            if (Array.isArray(v[f])) for (const x of v[f]) if (typeof x === 'string' && x) surfaces[key].add(x);
        }
        if (v.quizScores && typeof v.quizScores === 'object') for (const k of Object.keys(v.quizScores)) surfaces[key].add(k);
    }

    // DEGRADED-READ GUARD. An empty read must never render as reassuring full coverage.
    if (us.size === 0 || pg.size === 0) {
        console.error(`  DEGRADED READ — users=${us.size} progressDocs=${pg.size}. Coverage NOT measured.`);
        console.error('  An empty query would print "full coverage" and mean nothing. Fix access and re-run.');
        return 2;
    }

    console.log(`  registry: ${known.size} ids   read ${us.size} user docs + ${pg.size} progress docs\n`);
    let blockers = 0;
    const malformed = new Map();
    for (const [name, ids] of Object.entries(surfaces)) {
        const missing = [...ids].filter((i) => !known.has(i)).sort();
        const bad = missing.filter((i) => rejectReason(i) !== null);
        const real = missing.filter((i) => rejectReason(i) === null);
        for (const b of bad) malformed.set(b, rejectReason(b));
        blockers += real.length;
        console.log(`  ${name.padEnd(30)} ids=${String(ids.size).padStart(5)}  covered=${String(ids.size - missing.length).padStart(5)}  missing=${String(missing.length).padStart(3)}  BLOCKERS=${real.length}`);
        if (real.length) console.log(`      earned but unlisted: ${real.slice(0, 12).join(', ')}${real.length > 12 ? ` … +${real.length - 12}` : ''}`);
        if (bad.length) console.log(`      malformed (expected, not a blocker): ${bad.join(', ')}`);
    }
    console.log();
    if (malformed.size) {
        console.log(`  ${malformed.size} MALFORMED id(s) sit in production completion maps. Enforcement rejecting these`);
        console.log('  is correct; they are listed so nobody mistakes them for coverage gaps, and because they');
        console.log('  are evidence of an unfixed client-side defect that writes them (see BUG tracker):');
        for (const [id, why] of malformed) console.log(`     ${JSON.stringify(id)} :: ${why}`);
        console.log();
    }
    if (blockers) {
        console.error(`  ${blockers} id(s) a student EARNED are NOT in the registry — enforcement would reject real work.`);
        console.error('  Run refresh-legacy-floor.js, then gen-completion-registry.js.');
    } else {
        console.log('  ARM A: no live blockers — every legitimately earned id students hold is in the registry.');
    }

    // ── ARM B: STATIC. Ids built at runtime, which no live read can see until someone earns one ──
    console.log('\n  ARM B — runtime-built ids resolved statically (catches unused/new content):');
    const staticMiss = armB(known);
    if (staticMiss.length) {
        console.error(`  ${staticMiss.length} resolvable id(s) are NOT in the registry. These reject on a student's FIRST completion.`);
        for (const m of staticMiss.slice(0, 24)) console.error(`     ${m.id}   (${m.where})`);
        if (staticMiss.length > 24) console.error(`     … +${staticMiss.length - 24} more`);
    } else {
        console.log('    no gaps — every statically resolvable runtime-built id is registered.');
    }

    const total = blockers + staticMiss.length;
    console.log();
    if (total) {
        console.error(`  ${total} TOTAL BLOCKER(S). Enforcement is NOT safe to enable.`);
        return 1;
    }
    console.log('  NO BLOCKERS on either arm.');
    console.log('  This is NOT clearance to flip _ENFORCE_COMPLETION_REGISTRY; read this file\'s header.');
    return 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error('  registry-coverage failed:', e && e.message); process.exit(2); });
