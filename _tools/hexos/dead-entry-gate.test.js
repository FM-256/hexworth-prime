#!/usr/bin/env node
/**
 * dead-entry-gate.test.js
 *
 * @catalog what    Locks the dead-entry gate's link scanner: which text counts as an inbound link
 * @catalog what    and which does not. Every shape here was a live over-match at some point.
 * @catalog run     node _tools/hexos/dead-entry-gate.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * The gate shipped twice with the scanner wrong, in opposite directions, and neither had a test.
 *
 *   v1 under-matched: it read HTML only, so LearningPaths.js and HubRegistry.js -- which build
 *   most of the platform's navigation -- were invisible. 19 of 21 reported orphans were false,
 *   and I wrote them into a baseline asserting nothing linked to them.
 *
 *   v2 over-matched: sweeping .js counted any path-shaped string as a link, including one inside
 *   a comment, an `if (false)` branch, or an EXCLUDE_LIST.
 *
 *   v3 fixed comments and I reported all four shapes closed. Two reviewers independently
 *   disproved that in the same round: `if (false) {...}` and `const EXCLUDE_LIST = [...]` are
 *   live, syntactically valid code, and no comment regex can touch them. One proved it against
 *   the real gate by breaking the genuine link to /wall-of-shame/ and watching it still be
 *   called reachable.
 *
 * The verification for each of those rounds lived in a session and vanished. This file is that
 * verification made durable, which is the standard this project already applies to probes.
 *
 * OVER-MATCHING IS THE DANGEROUS DIRECTION. Under-matching produces noise a human triages.
 * Over-matching silently reports an unreachable page as reached, removing the only coverage
 * this gate provides, which is exactly how a real orphan (comptia-network) went unnoticed.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const GATE = path.resolve(__dirname, 'dead-entry-gate.js');
const src = fs.readFileSync(GATE, 'utf8');

// Exercise the SHIPPED implementation, not a restatement of it.
const m = src.match(/function stripDead\(src\) \{[\s\S]*?\n\}/);
assert(m, 'stripDead() not found in dead-entry-gate.js');
const stripDead = new Function('src', 'return (' + m[0] + ')(src)');

const TARGET = 'houses/dead-entry-probe/index.html';

const CASES = [
    // [name, source text, should the path survive as a real link?]
    ['live href attribute',      `<a href="/${TARGET}">go</a>`,                         true],
    ['live courseHref field',    `courseHref: '${TARGET}',`,                            true],
    ['live hubHref field',       `hubHref: '/${TARGET}',`,                              true],
    ['line-comment href',        `// href: '/${TARGET}',`,                              false],
    ['block-comment href',       `/* href: "/${TARGET}" */`,                            false],
    ['html comment',             `<!-- <a href="/${TARGET}">old</a> -->`,               false],
    ['if (false) branch',        `if (false) { link.href = "/${TARGET}"; }`,            false],
    ['if (0) branch',            `if (0) { go("/${TARGET}"); }`,                        false],
    ['EXCLUDE_LIST array',       `const EXCLUDE_LIST = ["/${TARGET}"];`,                false],
    ['DEPRECATED_ROUTES array',  `const DEPRECATED_ROUTES = ['/${TARGET}'];`,           false],
    ['legacy skip list',         `var SKIP_PATHS = ["/${TARGET}", "/x/"];`,             false],
    // Nested braces inside a dead branch must not swallow the code that follows it.
    ['if(false) then live link',
        `if (false) { if (a) { b(); } }\ncourseHref: '${TARGET}',`,                     true],
    // A lone brace inside a STRING in a dead block desynced the depth counter, which then ran
    // off the end and deleted every live link after it. Over-matching, the dangerous direction,
    // and the nested-brace case above could not catch it: that proves CODE braces nest, not that
    // string braces are skipped. Error messages and CSS-in-JS carry stray braces routinely.
    ['dead block with "{" in a string',
        `if (false) { const s = "{"; }\ncourseHref: '${TARGET}',`,                      true],
    ['dead block with "}" in a string',
        `if (false) { warn("missing }"); }\nhubHref: '/${TARGET}',`,                    true],
    ['dead block with a template brace',
        'if (false) { t(`${x}`); }\ncourseHref: \'' + TARGET + '\',',                 true],
    // THIS is the case that isolates literal-awareness. A `"}"` inside the dead block closes the
    // depth counter EARLY for a literal-blind scanner, so removal stops mid-block and the dead
    // link after it survives and gets counted as real. The three cases above do NOT prove
    // literal-awareness: they pass either way, because the unbalanced-depth guard rescues them.
    // I nearly recorded them as proof of a fix they never exercised.
    ['dead block, "}" closes counter early',
        `if (false) { const s = "}"; go("/${TARGET}"); }`,                              false],

    // REGEX LITERALS. Third instance of the same over-match in this one function, and the shape
    // with zero coverage until a reviewer found it: `/\{abc/` pushes depth up with no matching
    // close, the counter never balances, and the non-destructive fallback then leaves the whole
    // dead block in place to be counted as a real link.
    ['regex with escaped brace',
        `if (false) { const re = /\\{abc/; go("/${TARGET}"); }`,                        false],
    ['regex char class with brace',
        `if (false) { const re = /[{]/; go("/${TARGET}"); }`,                            false],
    // Division must NOT be mistaken for a regex, or the skip runs past the block end.
    ['division is not a regex',
        `if (false) { const x = a / b; go("/${TARGET}"); }`,                             false],
    ['live link after a regex dead block',
        `if (false) { const re = /\\{x/; }\ncourseHref: '${TARGET}',`,                  true],

    // FALSE-POSITIVE direction for the name heuristic, which previously had only true positives.
    // `.*EXCLUDE.*` also swallowed ordinary names; this codebase already ships
    // SYNC_EXCLUDED_PREFIXES, BLOCKED_GLOBALS and skipPrefixes.
    ['camelCase legacyHouses survives',
        `const legacyHouses = ['${TARGET}'];`,                                          true],
    ['camelCase skipNavTargets survives',
        `const skipNavTargets = ['/${TARGET}'];`,                                        true],
];

let pass = 0, fail = 0;
console.log('  which text counts as an inbound link:');
for (const [name, text, shouldSurvive] of CASES) {
    const survived = stripDead(text).includes('dead-entry-probe');
    const ok = survived === shouldSurvive;
    ok ? pass++ : fail++;
    console.log(`    ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(24)} ` +
        `${survived ? 'counts as a link' : 'ignored'}` +
        `${ok ? '' : `  <- expected ${shouldSurvive ? 'counts as a link' : 'ignored'}`}`);
}

// The scanner must still see the real navigation sources. If this breaks, the gate has swung
// back to under-matching and will manufacture orphans, which is how v1 produced a bad baseline.
const APP = path.resolve(__dirname, '../../_app');
for (const rel of ['components/HubRegistry.js', 'components/LearningPaths.js']) {
    const f = path.join(APP, rel);
    if (!fs.existsSync(f)) continue;
    const kept = stripDead(fs.readFileSync(f, 'utf8'));
    const ok = kept.includes('houses/') && kept.length > fs.readFileSync(f, 'utf8').length * 0.5;
    ok ? pass++ : fail++;
    console.log(`    ${ok ? 'ok  ' : 'FAIL'} ${rel} survives stripping`);
}

// An unparseable dead block must be COUNTED, not silently resolved. Neither resolution is safe
// (deleting removes live links, keeping counts a dead one as real), so the gate reports instead
// of guessing. Locking that here means a future change to the fallback cannot quietly make it
// worse, which is what happened the last three times.
const sdSrc = src.match(/function stripDead\(src\) \{[\s\S]*?\n\}/)[0];
const counted = new Function(
    'return (function () { ' + sdSrc +
    ' stripDead("if (false) { `${"); return stripDead.unparsed || 0; })()')();
const ok = counted >= 1;
ok ? pass++ : fail++;
console.log(`    ${ok ? 'ok  ' : 'FAIL'} an unparseable dead block is counted, not guessed at`);

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
