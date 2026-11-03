/**
 * mdfinal-test-kit.js — shared fixtures for the MD-100 final suites.
 *
 * @catalog what    Fixed test secret, fixed test uids and a tiny check() harness for _tools/mdfinal.
 * @catalog run     (library; required by the mdfinal suites)
 * @catalog status  TOOL
 *
 * FIXED, NOT RANDOM (spec 13.5 item 10): every statistic in these suites is computed over the same
 * uids and the same secret on every run, so a pass or fail is reproducible rather than a coin flip.
 * The secret is a test value; it is not, and must never be, the bound production secret.
 */
const path = require('path');

const MD = path.join(__dirname, '..', '..', 'functions', 'mdfinal');
const TEST_SECRET = 'mdfinal-test-only-4b9e2c71f0a35d86e1c7';
const ALT_SECRET = 'mdfinal-test-alt-93d1a6f2c08e4b75a2fd';

/* Fixed uid list: test-uid-00000 .. test-uid-<n-1>. */
function uids(n) {
    const out = [];
    for (let i = 0; i < n; i++) { out.push('test-uid-' + String(i).padStart(5, '0')); }
    return out;
}

/* Minimal harness: counts failures, prints each, sets the exit code at the end. */
function harness(name) {
    let fails = 0, passes = 0;
    return {
        check(cond, label) {
            if (cond) { passes++; } else { fails++; console.log('FAIL ' + label); }
        },
        done() {
            console.log(name + ': ' + passes + ' passed, ' + fails + ' failed');
            process.exitCode = fails ? 1 : 0;
        }
    };
}

module.exports = { MD, TEST_SECRET, ALT_SECRET, uids, harness, req: (f) => require(path.join(MD, f)) };
