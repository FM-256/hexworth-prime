#!/usr/bin/env node
/**
 * @catalog what    Runs every A+ lab/quiz suite; exits non-zero if any fails
 * @catalog run     node _tools/lab-tests/run-all.js
 * @catalog status  TOOL
 *
 * These suites lived in a session scratchpad until 2026-08-07, which meant the checks that
 * caught ten review-round defects vanished with the session and had to be rewritten by a
 * reviewer each time. Run this before touching any A+ lab.
 */
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const DIR = __dirname;
const suites = fs.readdirSync(DIR).filter(f => f.endsWith('.js') && f !== 'run-all.js').sort();
let failed = [];
for (const s of suites) {
    process.stdout.write(s.padEnd(20));
    try {
        const out = execFileSync('node', [path.join(DIR, s)], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
        const last = out.trim().split('\n').filter(Boolean).pop() || '';
        console.log(last.trim());
    } catch (e) {
        const out = ((e.stdout || '') + (e.stderr || '')).trim().split('\n').filter(Boolean).pop() || e.message;
        console.log('FAILED  ' + out.trim().slice(0, 100));
        failed.push(s);
    }
}
console.log('');
console.log(failed.length ? `FAILED: ${failed.join(', ')}` : `all ${suites.length} suites passed`);
process.exit(failed.length ? 1 : 0);
