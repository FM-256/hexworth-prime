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

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
