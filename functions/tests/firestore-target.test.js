/**
 * firestore-target.js — the banner must actually DISTINGUISH the two targets.
 *
 * The bug it fixes was not that the old output was wrong, it was that the same string
 * ("LIVE (writing to Firestore)") was printed whether the writes landed on the emulator or
 * on production. So the thing to test is the difference, not the presence of a message: a
 * banner that reads identically in both cases would be the original defect wearing a
 * costume.
 *
 * Run: node functions/tests/firestore-target.test.js
 */

'use strict';

const assert = require('assert');
const { announceTarget, resolveTarget, PROJECT_ID } = require('../firestore-target');

let pass = 0;
const results = [];

function check(name, fn) {
    try {
        fn();
        results.push(`  PASS  ${name}`);
        pass++;
    } catch (e) {
        results.push(`  FAIL  ${name}\n        ${e.message}`);
    }
}

/** Run fn with a given env, capturing stdout. Always restores both. */
function capture(env, fn) {
    const saved = {
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST,
        FIREBASE_FIRESTORE_EMULATOR_ADDRESS: process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS,
    };
    for (const k of Object.keys(saved)) delete process.env[k];
    Object.assign(process.env, env);

    const lines = [];
    const orig = console.log;
    console.log = (...a) => lines.push(a.join(' '));
    try {
        fn();
    } finally {
        // finally, not after the call: a throw inside fn would otherwise leave console.log
        // permanently monkey-patched and every later test would silently write nowhere.
        console.log = orig;
        for (const k of Object.keys(saved)) {
            if (saved[k] === undefined) delete process.env[k];
            else process.env[k] = saved[k];
        }
    }
    return lines.join('\n');
}

// ─── resolveTarget ───
check('no emulator var resolves to PRODUCTION', () => {
    const t = capture({}, () => {});
    void t;
    const r = (() => {
        const saved = process.env.FIRESTORE_EMULATOR_HOST;
        delete process.env.FIRESTORE_EMULATOR_HOST;
        const out = resolveTarget();
        if (saved !== undefined) process.env.FIRESTORE_EMULATOR_HOST = saved;
        return out;
    })();
    assert.strictEqual(r.emulator, false);
    assert.ok(r.label.includes(PROJECT_ID), `label was "${r.label}"`);
});

check('FIRESTORE_EMULATOR_HOST resolves to EMULATOR', () => {
    let r;
    capture({ FIRESTORE_EMULATOR_HOST: 'localhost:8080' }, () => { r = resolveTarget(); });
    assert.strictEqual(r.emulator, true);
    assert.ok(r.label.includes('localhost:8080'), `label was "${r.label}"`);
});

check('the legacy FIREBASE_FIRESTORE_EMULATOR_ADDRESS is honoured too', () => {
    let r;
    capture({ FIREBASE_FIRESTORE_EMULATOR_ADDRESS: '127.0.0.1:9099' },
        () => { r = resolveTarget(); });
    assert.strictEqual(r.emulator, true, 'the older variable name was ignored');
});

// ─── the difference, which is the whole point ───
const prodWriting = capture({}, () => announceTarget({ writing: true }));
const emuWriting = capture({ FIRESTORE_EMULATOR_HOST: 'localhost:8080' },
    () => announceTarget({ writing: true }));

check('production-writing and emulator-writing output DIFFER', () => {
    assert.notStrictEqual(prodWriting, emuWriting,
        'both targets printed the same thing — this is the original bug');
});

check('writing to production names it unmissably', () => {
    assert.ok(/WRITING TO PRODUCTION/.test(prodWriting), prodWriting);
    assert.ok(prodWriting.split('\n').length >= 8,
        'the production warning is a one-liner; it must be hard to skim past');
});

check('writing to the emulator says nothing reaches production', () => {
    assert.ok(/EMULATOR/.test(emuWriting), emuWriting);
    assert.ok(!/WRITING TO PRODUCTION/.test(emuWriting),
        'the emulator path printed the production warning');
});

check('the production banner tells you how to switch to the emulator', () => {
    assert.ok(/FIRESTORE_EMULATOR_HOST=/.test(prodWriting),
        'no remedy given; a warning without a fix just gets ignored');
});

// ─── read-only mode stays quiet but still names the target ───
const prodReading = capture({}, () => announceTarget({ writing: false }));
const emuReading = capture({ FIRESTORE_EMULATOR_HOST: 'localhost:8080' },
    () => announceTarget({ writing: false }));

check('read-only mode is one line, not the banner', () => {
    assert.strictEqual(prodReading.split('\n').length, 1, prodReading);
});

check('read-only mode still distinguishes the targets', () => {
    assert.notStrictEqual(prodReading, emuReading);
    assert.ok(prodReading.includes(PROJECT_ID));
    assert.ok(emuReading.includes('localhost:8080'));
});

check('announceTarget returns the resolved target for callers that need it', () => {
    let r;
    capture({}, () => { r = announceTarget({ writing: false }); });
    assert.ok(r && typeof r.emulator === 'boolean');
});

check('the env is restored after capture (no leakage between tests)', () => {
    assert.strictEqual(process.env.FIRESTORE_EMULATOR_HOST, undefined,
        'capture() leaked FIRESTORE_EMULATOR_HOST into the process');
});

console.log('\nfirestore-target.js\n');
console.log(results.join('\n'));
const failed = results.length - pass;
console.log(`\n${pass}/${results.length} passed`);
if (failed) {
    console.error(`${failed} FAILED`);
    process.exit(1);
}
console.log('FIRESTORE TARGET BANNER PASSED\n');
