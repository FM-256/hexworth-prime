#!/usr/bin/env node
'use strict';
// DOES THE LAB'S *JAVASCRIPT* GRADING STILL BEHAVE? -- the half qc-hexgrad.sh cannot see.
//
// WHY THIS EXISTS (Nancy, 2026-07-30, taskboard #256). qc-hexgrad.sh extracts the page's Python
// VERIFY block and runs it. That is the right test for the Python half, and it is the ONLY half it
// tests. accumulates() and builtRealEngine() are JAVASCRIPT, living in the challenge tests[]
// arrays, and nothing exercises them -- so an edit could reintroduce a regex regression and the
// gate would still print PASSED.
//
// The regression is not hypothetical. The FIRST version of accumulates() matched only `.grad +=`,
// so it FAILED an honest, fully-correct engine that wrote `self.grad = self.grad + x` and scored
// GRADCHECK 6/6. Nancy reproduced it. That is the expensive direction of failure -- a false
// NEGATIVE blocks a learner who did everything right, and they have no way to tell.
//
// So this file is mostly a list of SPELLINGS THAT MUST KEEP PASSING. Cheats must fail too, but the
// cheat cases are not the reason it exists.
//
// usage: node _tools/model-forge/qc-js-checks.js [lab.html]
const fs = require('fs');
const path = require('path');

const LAB = process.argv[2] ||
    path.resolve(__dirname, '../../_app/houses/ai/cortex/labs/hexgrad-engine.lab.html');
if (!fs.existsSync(LAB)) { console.error('lab not found: ' + LAB); process.exit(2); }
const html = fs.readFileSync(LAB, 'utf8');

// Pull the two function declarations out of the page and evaluate them in isolation. Extracting
// rather than duplicating is the point: a copy in the test would drift from the page and pass
// while the shipped page was broken.
function extract(name) {
    const i = html.indexOf('function ' + name + '(');
    if (i === -1) return null;
    const j = html.indexOf('{', i);
    let d = 1, k = j + 1;
    while (k < html.length && d > 0) { const c = html[k]; if (c === '{') d++; else if (c === '}') d--; k++; }
    return html.slice(i, k);
}
const srcAcc = extract('accumulates');
const srcBre = extract('builtRealEngine');
if (!srcAcc || !srcBre) {
    console.error('FAIL: could not extract accumulates/builtRealEngine from the page.');
    console.error('  A rename is not automatically a bug, but this gate is now blind. Update it.');
    process.exit(1);
}
let accumulates, builtRealEngine;
try {
    // eslint-disable-next-line no-new-func
    ({ accumulates, builtRealEngine } = new Function(srcAcc + '\n' + srcBre +
        '\nreturn { accumulates: accumulates, builtRealEngine: builtRealEngine };')());
} catch (e) { console.error('FAIL: extracted source did not evaluate: ' + e.message); process.exit(1); }

const ENGINE = 'class Value:\n    def _backward(self): pass\n';

// want=true  -> an honest learner writes this and MUST be credited
// want=false -> a shortcut, and MUST NOT be
const ACC = [
    ['+= spelling',                     'self.grad += x',                              true],
    ['= self.grad + x  (the regression)','self.grad = self.grad + x',                   true],
    ['= x + self.grad  (reversed)',      'self.grad = x + self.grad',                   true],
    ['whitespace around +=',             'self.grad   +=   x',                          true],
    ['other object accumulating',        'other.grad += out.grad * self.data',          true],
    ['no accumulation at all',           'self.grad = x',                               false],
    ['printed answer, no engine',        'print("GRADCHECK 6/6")',                      false],
    ['empty',                            '',                                            false],
    ['grad mentioned but never summed',  'g = self.grad\nprint(g)',                     false],
];
const BRE = [
    ['full engine',                      ENGINE + 'self.grad += x',                     true],
    ['no class Value',                   'def _backward(self): pass\nself.grad += x',   false],
    ['no backward',                      'class Value:\n    pass\nself.grad += x',      false],
    ['engine but no accumulation',       ENGINE + 'self.grad = x',                      false],
];

let fails = 0;
function run(label, fn, cases) {
    console.log('\n  ' + label);
    for (const [name, code, want] of cases) {
        let got;
        try { got = !!fn(code); } catch (e) { got = 'threw: ' + e.message; }
        const ok = got === want;
        if (!ok) fails++;
        console.log('   ' + (ok ? '  ' : 'XX') + ' ' + name.padEnd(34) + ' -> ' + String(got).padEnd(6) + ' (expect ' + want + ')');
    }
}
run('accumulates()', accumulates, ACC);
run('builtRealEngine()', builtRealEngine, BRE);

// KNOWN-OPEN, disclosed by its exact input rather than summarised (taskboard #257). accumulates()
// credits a grad assigned from an UNRELATED Value's grad. It is reachable only in challenge 2's
// disclosed soft check -- challenges 3 and 4 do not call accumulates() at all, so it cannot
// undermine the unforgeable gate. Printed every run so it cannot go quiet, and NOT counted as a
// failure, because failing the suite on a known-accepted limitation trains people to ignore it.
const KNOWN = 'self.grad = other.grad + 0';
console.log('\n  KNOWN-OPEN (disclosed, not counted):');
console.log('     accumulates("' + KNOWN + '") -> ' + accumulates(KNOWN) +
            '   [#257: unrelated Value\'s grad; challenge 2 soft check only]');

console.log('\n  ' + (fails === 0
    ? 'JS CHECKS PASSED: every honest spelling credited, every shortcut rejected.'
    : 'JS CHECKS FAILED: ' + fails + ' case(s). A false NEGATIVE here blocks a correct learner.'));
process.exit(fails === 0 ? 0 : 1);
