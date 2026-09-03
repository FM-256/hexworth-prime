#!/usr/bin/env node
/**
 * @catalog what    BUG-248 gate: every live Operator mission must load ModuleProgress.js
 * @catalog run     node _tools/operator/mission-progress-wiring.gate.js
 * @catalog status  GATE
 *
 * WHY THIS GATE EXISTS
 * --------------------
 * 52 of 124 live Operator missions shipped without a ModuleProgress.js script tag, so finishing
 * them recorded no XP and no progress. Nobody noticed because the completion hook is GUARDED:
 *
 *     // OperatorEngine.js, fireCompletionHooks()
 *     if (typeof window.ModuleProgress !== 'undefined' &&
 *         typeof window.ModuleProgress.complete === 'function') { ... }
 *
 * A missing script tag therefore throws nothing and logs nothing. The mission plays correctly,
 * the reward card appears, and the student's progress silently is not written. That is the worst
 * shape a defect can have: invisible from the page, invisible from the console, and only findable
 * by asking a question nobody was asking.
 *
 * A guarded integration needs a gate precisely BECAUSE it degrades silently. The guard is correct
 * defensive code and should stay; this file is the thing that notices the guard is doing work it
 * was never meant to do.
 *
 * WHAT IT CHECKS. Static, on source, deliberately: this must run in the deploy chain without a
 * browser, and the failure mode is a missing tag, which is a source-level fact. The end-to-end
 * behaviour (progress actually lands under house 'operator', and silent:true suppresses the
 * overlay that would cover the mission's own reward card) was verified in a browser at fix time.
 *
 * _archive is EXCLUDED. Those are retired copies kept as they were; "we do not destroy" cuts both
 * ways, and quietly upgrading an archived file to current conventions is its own kind of edit.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, '_app', 'operator', 'missions');
const EXPECTED_SRC = '../../components/ModuleProgress.js';

let failures = [];
let checked = 0;

const names = fs.readdirSync(DIR).filter((n) => n.endsWith('.mission.html')).sort();

// CHECK THE DETECTOR BEFORE THE DATA. If the directory moved or the suffix changed, an empty
// listing would sail through as "0 failures" and report a clean pass while checking nothing.
if (names.length < 100) {
    console.error(`  mission-progress-wiring: only ${names.length} mission page(s) found in ` +
        `${path.relative(ROOT, DIR)} -- expected 100+. The scan target moved; refusing to pass.`);
    process.exit(1);
}

for (const name of names) {
    const file = path.join(DIR, name);
    const text = fs.readFileSync(file, 'utf8');
    checked++;

    // Assert the RESOLVED path, not merely the substring "ModuleProgress". A tag pointing at the
    // wrong depth (../components vs ../../components) 404s and leaves the guard false, which is
    // the same silent failure with a tag present to reassure the next reader.
    if (!text.includes(EXPECTED_SRC)) {
        const loose = /ModuleProgress\.js/.test(text);
        failures.push({
            name,
            why: loose ? 'loads ModuleProgress.js at an UNEXPECTED path (check the ../ depth)'
                       : 'does not load ModuleProgress.js at all'
        });
        continue;
    }

    // The tag must resolve to a file that exists on disk. A correct-looking src pointing at a
    // deleted or renamed component is the same silent no-op.
    const resolved = path.resolve(DIR, EXPECTED_SRC);
    if (!fs.existsSync(resolved)) {
        failures.push({ name, why: `src resolves to ${path.relative(ROOT, resolved)}, which does not exist` });
    }
}

if (failures.length) {
    console.error(`  mission-progress-wiring: ${failures.length} of ${checked} Operator mission(s) ` +
        `cannot record progress (BUG-248 class):`);
    for (const f of failures.slice(0, 12)) console.error(`      ${f.name}: ${f.why}`);
    if (failures.length > 12) console.error(`      ... and ${failures.length - 12} more`);
    console.error('  Finishing these records no XP and no progress, silently, because the completion');
    console.error('  hook in OperatorEngine.js is guarded on window.ModuleProgress being present.');
    process.exit(1);
}

console.log(`  OK: all ${checked} Operator missions load ModuleProgress.js and can record progress.`);
