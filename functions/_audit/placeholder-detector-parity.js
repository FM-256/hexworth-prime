#!/usr/bin/env node
/**
 * Phase B preflight — parity check between current (per-caller) detector
 * implementations and the new shared module.
 *
 * For each caller's predicate, runs both implementations against a fixture
 * set drawn from functions/quiz_keys.json. Reports diffs.
 *
 * Expected diff classes:
 *  - SAME              identical output (parity passes)
 *  - NEW_CATCH         new module flags as placeholder; old missed
 *                      (= documented blind-spot fix; should be expected)
 *  - REGRESSION        old caught; new missed (BLOCK — must investigate)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const D = require('../placeholder-detector');

const KEYS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'quiz_keys.json'), 'utf8'));

// === Inline copies of each caller's CURRENT detection logic ===
// Captured verbatim from the source files at the time of this audit so the
// comparison is honest. Do not "improve" these — they are baseline.

// placeholder-drift-audit.js
function pda_isAllZeros(arr) { return Array.isArray(arr) && arr.length > 0 && arr.every(v => v === 0); }
function pda_isClassicCycling(arr) { if (arr.length < 4) return false; return arr.every((v, i) => v === i % 4); }
function pda_isPeriodCycling(arr) {
    if (arr.length < 8) return false;
    for (let p = 2; p <= 6; p++) {
        if (arr.length < p * 2) continue;
        const period = arr.slice(0, p);
        if (arr.every((v, i) => v === period[i % p])) return true;
    }
    return false;
}
function pda_isPlaceholder(arr) {
    return pda_isAllZeros(arr) || pda_isClassicCycling(arr) || pda_isPeriodCycling(arr);
}

// quiz-quality-monitor.js (deployed CF) — inline allSame + isCycle period 2-4 only
function qqm_isPlaceholder(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const allSame = arr.every(v => v === arr[0]);
    if (allSame) return true;
    if (arr.length < 8) return false;
    for (let p = 2; p <= 4; p++) {
        let cyc = true;
        for (let i = p; i < arr.length; i++) {
            if (arr[i] !== arr[i % p]) { cyc = false; break; }
        }
        if (cyc) return true;
    }
    return false;
}

// diff-class-triage-2026-05-08.js
function dct_isStrictCycling(arr) { return Array.isArray(arr) && arr.length >= 4 && arr.every((v, i) => v === (i % 4)); }
function dct_isNearCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 5) return false;
    const head = arr.slice(0, arr.length - 2);
    return head.every((v, i) => v === (i % 4));
}
function dct_isAllSame(arr) { return Array.isArray(arr) && arr.length > 0 && arr.every(v => v === arr[0]); }
function dct_isPeriodCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 8) return false;
    for (let p = 2; p <= 6; p++) {
        if (arr.length < p * 2) continue;
        const period = arr.slice(0, p);
        if (arr.every((v, i) => v === period[i % p])) return true;
    }
    return false;
}
function dct_isPlaceholderShape(arr) {
    return dct_isStrictCycling(arr) || dct_isNearCycling(arr) || dct_isAllSame(arr) || dct_isPeriodCycling(arr);
}

// seed-placeholder-fix-2026-05-08.js — weakest coverage
function spf_isPlaceholder(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (arr.every(v => v === 0)) return 'all-zeros';
    let cycling = true;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== (i % 4)) { cycling = false; break; }
    }
    if (cycling) return 'cycling';
    return false;
}

// seed-p0-batch-2026-05-08.js
const SP0_PATTERNS = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,2,3,0,1,2,3,0,1,2,3,0,1,2],
];
function sp0_isExactPlaceholder(arr) {
    return SP0_PATTERNS.some(p => p.length === arr.length && p.every((v, i) => v === arr[i]));
}
function sp0_isPeriodCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 8) return false;
    for (let p = 2; p <= 6; p++) {
        if (arr.length < p * 2) continue;
        const period = arr.slice(0, p);
        if (arr.every((v, i) => v === period[i % p])) return true;
    }
    return false;
}
function sp0_isNearCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 5) return false;
    const head = arr.slice(0, arr.length - 2);
    return head.every((v, i) => v === (i % 4));
}
function sp0_isPlaceholderArray(arr) {
    return sp0_isExactPlaceholder(arr) || sp0_isPeriodCycling(arr) || sp0_isNearCycling(arr);
}

// === Comparison runner ===
const CALLERS = [
    {
        name: 'placeholder-drift-audit.isPlaceholder',
        old: pda_isPlaceholder,
        // new module: same coverage signature (default minLength=8, no patterns).
        // NOTE: new module ALSO catches isAllSame + isNearCycling; that's the documented blind-spot fix.
        new: arr => D.isPlaceholder(arr),
    },
    {
        name: 'quiz-quality-monitor (deployed CF)',
        old: qqm_isPlaceholder,
        new: arr => D.isPlaceholder(arr),
    },
    {
        name: 'diff-class-triage.isPlaceholderShape',
        old: dct_isPlaceholderShape,
        new: arr => D.isPlaceholder(arr),
    },
    {
        name: 'seed-placeholder-fix.isPlaceholder',
        old: arr => Boolean(spf_isPlaceholder(arr)),
        new: arr => D.isPlaceholder(arr),
    },
    {
        name: 'seed-p0-batch.isPlaceholderArray',
        old: sp0_isPlaceholderArray,
        new: arr => D.isPlaceholder(arr, { patterns: SP0_PATTERNS }),
    },
];

const fixtures = [];
for (const [id, entry] of Object.entries(KEYS)) {
    if (entry && Array.isArray(entry.answers)) {
        fixtures.push({ id, answers: entry.answers });
    }
}
console.log('Fixture count: ' + fixtures.length);

let totalRegressions = 0;
const summary = [];

for (const caller of CALLERS) {
    let same = 0, newCatch = 0, regression = 0;
    const newCatchExamples = [];
    const regressionExamples = [];
    for (const f of fixtures) {
        const o = Boolean(caller.old(f.answers));
        const n = Boolean(caller.new(f.answers));
        if (o === n) same++;
        else if (!o && n) {
            newCatch++;
            if (newCatchExamples.length < 5) newCatchExamples.push(f.id + ' (' + D.classify(f.answers) + ')');
        } else {
            regression++;
            if (regressionExamples.length < 5) regressionExamples.push(f.id);
        }
    }
    totalRegressions += regression;
    summary.push({ name: caller.name, same, newCatch, regression });
    console.log('\n' + caller.name);
    console.log('  SAME       ' + same);
    console.log('  NEW_CATCH  ' + newCatch + (newCatchExamples.length ? '  ex: ' + newCatchExamples.join(', ') : ''));
    console.log('  REGRESSION ' + regression + (regressionExamples.length ? '  ex: ' + regressionExamples.join(', ') : ''));
}

console.log('\n=== Summary ===');
console.table(summary);
if (totalRegressions > 0) {
    console.log('\nFAIL: ' + totalRegressions + ' regression(s) — BLOCK Phase B until investigated.');
    process.exit(1);
}
console.log('\nPASS: zero regressions across all 5 callers. Phase B safe to proceed.');
