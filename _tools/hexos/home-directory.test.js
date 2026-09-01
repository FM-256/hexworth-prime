#!/usr/bin/env node
/**
 * home-directory.test.js
 *
 * @catalog what    Proves HomeDirectory.js can never write to any store, and that it SURFACES
 * @catalog what    source disagreements instead of silently picking a winner (HEXOS-4).
 * @catalog run     node _tools/hexos/home-directory.test.js
 * @catalog status  GATE
 *
 * WHY THE CENTRAL ASSERTION IS AN ABSENCE
 * ---------------------------------------
 * HEXOS-4 was specified as unifying per-user state into one object. The stores it unifies already
 * disagree (BUG-236..242), so a unified WRITE store would launder the disagreement into a single
 * authoritative record rather than resolve it. The design is therefore a read model, and "it never
 * writes" is the property the whole safety argument rests on.
 *
 * A comment saying so is not a mechanism. This file greps the shipped source for every write form
 * -- Firestore setDoc/updateDoc/addDoc/deleteDoc/runTransaction, localStorage/sessionStorage
 * setItem/removeItem/clear -- and fails if any appears. TrophyCabinet.js, the precedent this
 * follows, made the same promise in prose and kept it; this one is enforced.
 *
 * THE SECOND THING TESTED is that a disagreement actually reaches the reader. Five of the six
 * logged bugs survived for months because nothing displayed the contradiction, so a model that
 * quietly resolved conflicts would reproduce the exact condition that hid them.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.resolve(__dirname, '../..');
const SRC = path.join(REPO, '_app/components/HomeDirectory.js');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 120)}`);
};

const src = fs.readFileSync(SRC, 'utf8');

// ---- 1. IT MUST NOT BE ABLE TO WRITE ----
// Each pattern is a real write form used elsewhere in this codebase, not a hypothetical.
const WRITE_FORMS = [
    [/\.setItem\s*\(/, 'localStorage/sessionStorage setItem'],
    [/\.removeItem\s*\(/, 'storage removeItem'],
    [/localStorage\s*\.\s*clear|sessionStorage\s*\.\s*clear/, 'storage clear'],
    [/\bsetDoc\s*\(|\bupdateDoc\s*\(|\baddDoc\s*\(|\bdeleteDoc\s*\(/, 'Firestore write'],
    [/\brunTransaction\s*\(|\bwriteBatch\s*\(/, 'Firestore transaction/batch'],
    [/\.set\s*\(\s*\{|\.update\s*\(\s*\{/, 'admin-style .set/.update'],
    [/httpsCallable\s*\(|callFunction\s*\(/, 'Cloud Function invocation']
];
WRITE_FORMS.forEach(([re, label]) => {
    chk(`HomeDirectory.js contains no ${label}`, !re.test(src),
        'a read model that can write is not a read model');
});

// Loading it must not touch storage either. A stub that throws on any write proves the module
// does not write AT LOAD TIME, which the static scan alone cannot show.
const throwOnWrite = (name) => new Proxy({}, {
    get(_, prop) {
        if (['setItem', 'removeItem', 'clear'].includes(prop)) {
            return () => { throw new Error(`${name}.${String(prop)} was called`); };
        }
        return () => null;
    }
});
const sandbox = {
    window: {}, console,
    localStorage: throwOnWrite('localStorage'),
    sessionStorage: throwOnWrite('sessionStorage')
};
sandbox.globalThis = sandbox;
let loadErr = null;
try { vm.createContext(sandbox); vm.runInContext(src, sandbox); }
catch (e) { loadErr = e.message; }
chk('loading the module writes to no storage', loadErr === null, loadErr);
chk('it exposes window.HomeDirectory', !!(sandbox.window && sandbox.window.HomeDirectory));

const HD = sandbox.window.HomeDirectory;

// If the module failed to load, every assertion below would throw on `HD.build` and the run would
// CRASH rather than report. A crashed gate reads as "something is broken" without saying what, and
// an operator cannot tell it apart from a harness fault. Report and exit deliberately instead.
// Found by mutation testing: injecting a storage write made the module fail to load, and this file
// died mid-run with no pass count.
/**
 * Call build() without letting a throw kill the run. A module that writes to storage under the
 * write-trapping proxy throws HERE, not at load, so guarding only the load left the run crashing
 * with no pass count -- ambiguous between "the product is broken" and "the harness is broken".
 */
function safeBuild(label, src) {
    try {
        return HD.build(src);
    } catch (e) {
        fail++;
        console.log(`  FAIL ${label} threw: ${e.message}`);
        return null;
    }
}

if (!HD || typeof HD.build !== 'function') {
    console.log('\n  ABORT: HomeDirectory did not load, so the behavioural assertions below could');
    console.log('  not run. The failures printed above are the real finding.');
    console.log(`\n  ${pass}/${pass + fail} passed (behavioural assertions SKIPPED, not passed)`);
    process.exit(1);
}

// ---- 2. CONFLICTS MUST REACH THE READER ----
// The disagreement that hid BUG-238 for months: recomputed XP vs a stored value.
const conflicted = safeBuild('conflicted model', {
    profile: { xp: 45000, streak: 3, achievements: ['a', 'b', 'c'], quizzes: { q1: {}, q2: {} } },
    derivedXp: { xp: 12000 },
    serverAwards: [{ badgeId: 'obs_mission_18' }],
    gates: [
        { gateNumber: 1, completed: true, verified: true },
        { gateNumber: 6, completed: true, verified: false }
    ],
    quizAttempts: [{ quizId: 'q1', passed: true }],
    local: { streak: 9 },
    flagCaptures: 4
});

if (!conflicted) {
    console.log('\n  ABORT: build() threw, so the conflict assertions could not run.');
    console.log(`\n  ${pass}/${pass + fail} passed (remaining assertions SKIPPED, not passed)`);
    process.exit(1);
}

chk('a recomputed/stored XP disagreement is reported, not hidden',
    conflicted.facts.xp.value === 12000 && conflicted.facts.xp.otherValue === 45000,
    JSON.stringify(conflicted.facts.xp));
chk('the authoritative XP is the DERIVED one', conflicted.facts.xp.authority === 'derived');
chk('a local/cloud streak difference is reported',
    conflicted.facts.streak.otherValue === 9, JSON.stringify(conflicted.facts.streak));
chk('badges show server-PROVEN, with the larger claimed count beside it',
    conflicted.facts.badges.value === 1 && conflicted.facts.badges.otherValue === 3,
    JSON.stringify(conflicted.facts.badges));
chk('gate provenance is carried, not flattened',
    conflicted.facts.gates.value === 2 && conflicted.facts.gates.otherValue === 1,
    JSON.stringify(conflicted.facts.gates));
chk('the gate note says client-attestation is BY DESIGN, so a gap is not read as forgery',
    /by design/i.test(conflicted.facts.gates.note || ''));
chk('quiz summary and ledger are shown separately when they differ',
    conflicted.facts.quizzes.value === 2 && conflicted.facts.quizzes.otherValue === 1,
    JSON.stringify(conflicted.facts.quizzes));
chk('every conflict is collected', conflicted.conflicts.length >= 5,
    `${conflicted.conflicts.length} collected`);

// ---- 3. AGREEMENT MUST NOT MANUFACTURE A CONFLICT ----
const agreeing = safeBuild('agreeing model', {
    profile: { xp: 12000, streak: 9, achievements: ['x'], quizzes: { q1: {} } },
    derivedXp: { xp: 12000 },
    serverAwards: [{ badgeId: 'x' }],
    gates: [{ gateNumber: 1, completed: true, verified: true }],
    quizAttempts: [{ quizId: 'q1', passed: true }],
    local: { streak: 9 },
    flagCaptures: 0
});
chk('identical sources produce ZERO conflicts', agreeing.conflicts.length === 0,
    JSON.stringify(agreeing.conflicts.map(c => c.label)));

// A real zero must not read as "absent" and invent a disagreement. This is the falsiness trap that
// BUG-241's policy function also had to handle.
const zeros = safeBuild('all-zero model', {
    profile: { xp: 0, streak: 0, achievements: [], quizzes: {} },
    derivedXp: { xp: 0 }, serverAwards: [], gates: [], quizAttempts: [],
    local: { streak: 0 }, flagCaptures: 0
});
chk('a genuine zero on both sides is not a conflict', zeros.conflicts.length === 0,
    JSON.stringify(zeros.conflicts.map(c => c.label)));

// ---- 4. IT MUST NOT INVENT A TRANSCRIPT ----
chk('transcript is reported as NOT EXISTING, not as empty',
    zeros.transcript.exists === false && /not built/i.test(zeros.transcript.reason),
    JSON.stringify(zeros.transcript));

// ---- 5. MISSING SOURCES MUST NOT THROW ----
let emptyErr = null;
try { HD.build(); HD.build({}); } catch (e) { emptyErr = e.message; }
chk('build() survives absent/partial sources', emptyErr === null, emptyErr);

// ---- 6. THE PAGE MUST EXIST AND MUST CONSUME THE MODULE ----
// A projection nothing renders is not "addressable", which is the word the scope doc uses. A QC
// gate blocked this work for exactly that: steps 1-2 shipped and step 3, the page, did not, while
// the commit said "HEXOS-4 built". So the phase's own deliverable is asserted here.
const PAGE = path.join(REPO, '_app/home.html');
chk('the home directory page exists', fs.existsSync(PAGE),
    'HomeDirectory.js with no consumer is not a finished phase');
if (fs.existsSync(PAGE)) {
    const page = fs.readFileSync(PAGE, 'utf8');
    chk('the page loads the projection module', /components\/HomeDirectory\.js/.test(page));
    chk('the page actually calls build()', /HomeDirectory\.build\(/.test(page));
    chk('the page renders conflicts, not just values', /isConflict\(|conflicts/.test(page));
    // The read-only guarantee has to hold at the consumer too, or the module's purity is moot.
    chk('the page writes to no store',
        !/\.setItem\s*\(|setDoc\s*\(|updateDoc\s*\(|addDoc\s*\(/.test(page),
        'the page must read the projection, never write state');
    chk('the page is access-gated', /AccessGuard/.test(page));
}

// ---- 7. THE PAGE MUST ACTUALLY FETCH THE SERVER RECORDS ----
// Static checks passed while the page never queried server_awards, gates, quiz_attempts or
// flag_captures. That did not render as "unknown" -- it rendered as WRONG: badges 0-proven against
// a real claimed count, a manufactured BUG-241 quiz conflict, and gates/flags silently zero with
// no signal, inverting the design's "server wins" promise. A QC gate caught it by driving the real
// page; every assertion in section 6 stayed green. So these assert the reads exist and are wired
// into the projection input, keyed on the four field names build() consumes.
if (fs.existsSync(PAGE)) {
    const page = fs.readFileSync(PAGE, 'utf8');
    [['server_awards', 'serverAwards'], ['gates', 'gates'],
     ['quiz_attempts', 'quizAttempts'], ['flag_captures', 'flagCaptures']].forEach(([col, field]) => {
        chk(`the page reads users/{uid}/${col}`, page.includes(`'${col}'`),
            'unfetched server records render as a real zero and manufacture false conflicts');
        chk(`...and assigns it to src.${field}`,
            new RegExp(`src\\.${field}\\s*=`).test(page),
            `${col} is read but never reaches build()`);
    });
    // A read failure must be distinguishable from a genuine zero, or the page lies quietly.
    chk('a failed read is reported, not silently rendered as zero',
        /readFailures/.test(page) && /read failure, not/.test(page),
        'the defect was exactly this: absent data presented as real data');
}

// ---- 8. THE const/window TRAP ----
// AccessGuard, FirebaseAuth and FirestoreManager are declared as top-level `const`, which creates
// a lexical binding and NOT a property on window. Every `window.X &&` guard against them is
// therefore permanently false. This shipped: the page went live ungated and permanently showing
// "Sign in to see your records", and EduScan HEUR-041 caught it after the deploy, not before.
// The browser probe missed it because it stubbed those files with `window.X = ...` assignments the
// real files never make -- the mock manufactured the globals whose absence WAS the defect.
if (fs.existsSync(PAGE)) {
    const page = fs.readFileSync(PAGE, 'utf8');
    ['AccessGuard', 'FirebaseAuth', 'FirestoreManager'].forEach((mod) => {
        const src = fs.readFileSync(path.join(REPO, `_app/components/${mod}.js`), 'utf8');
        // Negative lookahead on `=`, because `window.X\\s*=` also matches `window.X === y`, which
        // is a COMPARISON, not an assignment. A stray comparison would make this file believe the
        // module is on window and silently stop checking the guard style. Flagged by a reviewer as
        // latent (no such comparison exists in any of the five files today) and closed before it
        // could be relied on.
        const onWindow = new RegExp(`window\\.${mod}\\s*=(?!=)`).test(src);
        // Only assert the guard style for modules that genuinely are NOT on window. If one is
        // later changed to assign window.X, a window guard becomes correct and this must not
        // start failing for the wrong reason.
        if (!onWindow) {
            chk(`${mod} is guarded with typeof, not window.${mod}`,
                !new RegExp(`window\\.${mod}\\s*&&|window\\.${mod}\\s*\\?`).test(page),
                `${mod} is a top-level const, so window.${mod} is permanently undefined`);
        }
    });
    // Every module the page uses must actually be loaded, or the guard is moot either way.
    ['AccessGuard', 'FirebaseAuth', 'FirestoreManager', 'XPCalculator', 'HomeDirectory'].forEach((mod) => {
        chk(`the page loads ${mod}.js`, page.includes(`/components/${mod}.js`),
            'a guarded call to a script that was never loaded silently does nothing');
    });
}

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
