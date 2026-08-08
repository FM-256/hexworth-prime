#!/usr/bin/env node
/**
 * @catalog what    Proves ModuleProgress.complete() cannot double-count the lifetime counter (#296)
 * @catalog run     node _tools/eduscan/moduleprogress-idempotency.test.js
 * @catalog status  TOOL
 *
 * ModuleProgress.js is a browser IIFE with no module system, so this loads it into a
 * minimal DOM-less sandbox with a real localStorage implementation and drives the public
 * API. That is the point: a test that re-implemented the counter logic would pass against
 * code that exists nowhere, which this repo has been bitten by before.
 *
 * The sequences that matter, and why:
 *
 *   complete, complete            -> 1. The #296 defect. A lab whose Finish button can be
 *                                   re-reached awarded lifetime credit twice.
 *   complete, reset, complete     -> 1. The regression the #296 fix could have introduced:
 *                                   gating the increment on isFirstCompletion is only safe
 *                                   if reset() actually clears the structured array it reads.
 *   complete, reset               -> 0. reset() decrements by exactly one.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, '_app', 'components', 'ModuleProgress.js');

let pass = 0;
const results = [];

function check(name, cond, detail) {
    results.push(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
    if (cond) pass++;
}

/** A localStorage good enough for this component: string keys, string values. */
function makeStorage() {
    const map = new Map();
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: (k) => map.delete(k),
        clear: () => map.clear(),
        _dump: () => Object.fromEntries(map),
    };
}

/** Load ModuleProgress into a fresh sandbox and return { MP, storage }. */
function load() {
    const storage = makeStorage();
    const sandbox = {
        localStorage: storage,
        sessionStorage: makeStorage(),
        console: { log() {}, warn() {}, error() {}, info() {} },
        setTimeout, clearTimeout, setInterval, clearInterval,
        Date, JSON, Math, parseInt, parseFloat, Array, Object, String, Number, Boolean,
        Promise, isNaN,
        // AchievementManager and FirebaseAuth are deliberately absent: complete() guards
        // both with typeof, so their absence exercises the same path a page without them
        // would take.
        //
        // `document` is NOT optional, though it looks it. ModuleProgress.js:1785 has a
        // top-level `document.addEventListener('DOMContentLoaded', ...)` OUTSIDE the IIFE
        // and with no typeof guard, so omitting it throws during evaluation and the whole
        // test dies before a single assertion runs -- proving nothing while exiting 1.
        document: {
            addEventListener() {},
            removeEventListener() {},
            querySelector() { return null; },
            querySelectorAll() { return []; },
            getElementById() { return null; },
            readyState: 'complete',
            body: null,
        },
        navigator: { onLine: false },
        location: { href: 'http://localhost/', pathname: '/' },
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    // Surface an evaluation error as a return value, not a thrown exception: a test that
    // dies on load looks the same as a test that never existed.
    try {
        vm.runInContext(fs.readFileSync(SRC, 'utf8'), sandbox, { filename: 'ModuleProgress.js' });
    } catch (e) {
        return { MP: null, storage, sandbox, loadError: e.message };
    }
    const MP = sandbox.ModuleProgress || sandbox.window.ModuleProgress;
    return { MP, storage, sandbox, loadError: null };
}

const KEY = 'hexworth_modules_completed';
const counter = (s) => parseInt(s.getItem(KEY) || '0', 10);

// ─── the component loads at all ───
const first = load();
check('ModuleProgress loads in a sandbox', !!first.MP && typeof first.MP.complete === 'function',
    first.loadError ? `threw: ${first.loadError}` : (first.MP ? '' : 'the IIFE did not export'));

if (!first.MP || typeof first.MP.complete !== 'function') {
    console.log('\nModuleProgress idempotency (#296)\n');
    console.log(results.join('\n'));
    console.error('\nCannot continue: the component did not load. This test proves nothing.');
    process.exit(1);
}

// ─── one completion ───
{
    const { MP, storage } = load();
    MP.complete('forge', 'lab-a', { silent: true, returnToDashboard: false, type: 'lab' });
    check('a single completion increments the counter to 1', counter(storage) === 1,
        `counter=${counter(storage)}`);
}

// ─── THE #296 DEFECT ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    MP.complete('forge', 'lab-a', opts);
    MP.complete('forge', 'lab-a', opts);
    check('completing the SAME module twice still counts 1 (#296)', counter(storage) === 1,
        `counter=${counter(storage)}`);

    MP.complete('forge', 'lab-a', opts);
    MP.complete('forge', 'lab-a', opts);
    check('five completions of one module still count 1', counter(storage) === 1,
        `counter=${counter(storage)}`);
}

// ─── distinct modules must still each count ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    MP.complete('forge', 'lab-a', opts);
    MP.complete('forge', 'lab-b', opts);
    MP.complete('web', 'lab-c', opts);
    check('three DIFFERENT modules count 3 (the fix is not just "never increment")',
        counter(storage) === 3, `counter=${counter(storage)}`);
}

// ─── reset ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    MP.complete('forge', 'lab-a', opts);
    MP.reset('forge', 'lab-a');
    check('reset decrements the counter back to 0', counter(storage) === 0,
        `counter=${counter(storage)}`);
}

// ─── THE REGRESSION THE FIX COULD HAVE CAUSED ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    MP.complete('forge', 'lab-a', opts);
    MP.reset('forge', 'lab-a');
    MP.complete('forge', 'lab-a', opts);
    check('complete -> reset -> complete returns to 1, NOT 0', counter(storage) === 1,
        `counter=${counter(storage)} (0 means reset failed to clear completedModules)`);
}

// ─── reset really clears the structured arrays ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    MP.complete('forge', 'lab-a', opts);
    const before = JSON.parse(storage.getItem('hexworth_progress') || '{}');
    check('completion puts the module in completedModules',
        Array.isArray(before.completedModules) && before.completedModules.includes('lab-a'),
        JSON.stringify(before.completedModules));

    MP.reset('forge', 'lab-a');
    const after = JSON.parse(storage.getItem('hexworth_progress') || '{}');
    check('reset REMOVES it from completedModules',
        !(after.completedModules || []).includes('lab-a'),
        JSON.stringify(after.completedModules));
    check('reset removes it from the house modulesCompleted array',
        !(((after.forge || {}).modulesCompleted) || []).includes('lab-a'),
        JSON.stringify((after.forge || {}).modulesCompleted));
    check('reset clears completionCounts so a redo is not treated as a repeat',
        !((after.completionCounts || {})['lab-a']),
        JSON.stringify(after.completionCounts));
}

// ─── the counter can never exceed the number of distinct completed modules ───
{
    const { MP, storage } = load();
    const opts = { silent: true, returnToDashboard: false, type: 'lab' };
    for (const id of ['m1', 'm2', 'm3']) for (let i = 0; i < 4; i++) MP.complete('forge', id, opts);
    const p = JSON.parse(storage.getItem('hexworth_progress') || '{}');
    const distinct = (p.completedModules || []).length;
    check('counter equals distinct completed modules after 12 calls',
        counter(storage) === distinct && distinct === 3,
        `counter=${counter(storage)} distinct=${distinct}`);
}

console.log('\nModuleProgress idempotency (#296)\n');
console.log(results.join('\n'));
const failed = results.length - pass;
console.log(`\n${pass}/${results.length} passed`);
if (failed) { console.error(`${failed} FAILED`); process.exit(1); }
console.log('MODULEPROGRESS IDEMPOTENCY PASSED\n');
