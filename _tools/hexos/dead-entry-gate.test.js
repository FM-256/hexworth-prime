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

// Require the SHIPPED module rather than slicing its source. The old approach extracted
// stripDead() with a regex and eval'd it standalone, which broke the moment it gained a helper,
// and more importantly it tested a COPY: a function lifted out of its module is not the function
// that runs. Requiring it exercises the real thing, dependencies included.
const { stripDead } = require('./dead-entry-gate.js');
assert(typeof stripDead === 'function', 'dead-entry-gate.js must export stripDead');

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

    // KEYWORD-PRECEDED REGEX. The fifth instance, and the one that proved 25/25 was a
    // non-regression bar rather than a correctness bar: every case in this suite had been added
    // reactively after a reviewer broke that exact shape, so a shape nobody had tried still
    // defeated it. A previous-CHARACTER lookback cannot see these, because a keyword ends in a
    // letter. Tokenising removes the whole question.
    ['return-preceded regex',
        `if (false) { return /\\{x/.test(y); go("/${TARGET}"); }`,                       false],
    ['typeof-preceded regex',
        `if (false) { if (typeof /\\{x/ === "object") go("/${TARGET}"); }`,              false],
    ['live link after a keyword-regex dead block',
        `if (false) { return /\\{x/.test(y); }\ncourseHref: '${TARGET}',`,               true],

    // NON-COMMENT `/*`. The sixth instance, and it lived one level ABOVE the code the tokenizer
    // rewrite fixed: a JS block-comment regex run across HTML markup treated `accept="image/*"`
    // as a comment opener and ran 85,324 characters to the next `*/`, deleting 9 script tags and
    // 4 hrefs from admin/console.html. Two more files lost script tags the same way while the
    // unparsed counter read 0. None of the 29 prior cases exercised this shape.
    ['MIME wildcard is not a comment',
        `<input accept="image/*"><a href="/${TARGET}">go</a>`,                           true],
    ['MIME wildcard then a real JS comment',
        `<input accept="image/*">\n<script>/* real */ var x=1;</script>\n<a href="/${TARGET}">g</a>`, true],
    ['glob-ish attribute is not a comment',
        `<meta content="application/*"><a href="/${TARGET}">go</a>`,                     true],
    // A real comment INSIDE a script must still be stripped.
    ['comment inside script still stripped',
        `<script>// href: "/${TARGET}"\nvar a=1;</script>`,                              false],

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
stripDead.unparsed = 0;
stripDead('if (false) { `${');                 // will not tokenise
const counted = stripDead.unparsed || 0;
const ok = counted >= 1;
ok ? pass++ : fail++;
console.log(`    ${ok ? 'ok  ' : 'FAIL'} an unparseable dead block is counted, not guessed at`);

// THE FALLBACK PATH. A reviewer found esprima was only present as a transitive dependency of
// degenerator/escodegen, so a clean `npm ci` could have removed it and silently degraded this
// gate platform-wide with nothing failing. It is now declared in package.json, and this asserts
// the absence path does the safe thing: strip nothing, count the occurrence, never claim a dead
// block was handled when it was not.
{
    const gsrc = fs.readFileSync(GATE, 'utf8');
    const noEsprima = gsrc.replace("try { esprima = require('esprima'); }", 'try { throw new Error(); }');
    const tmp = path.join(require('os').tmpdir(), 'deg-no-esprima-' + process.pid + '.js');
    fs.writeFileSync(tmp, noEsprima);
    const mod = require(tmp);
    mod.stripDead.unparsed = 0;
    const kept = mod.stripDead(`if (false) { go("/${TARGET}"); }`);
    const counted = mod.stripDead.unparsed || 0;
    const ok = kept.includes('dead-entry-probe') && counted >= 1;
    ok ? pass++ : fail++;
    console.log(`    ${ok ? 'ok  ' : 'FAIL'} without esprima: strips nothing AND counts it` +
        (ok ? '' : `  <- kept=${kept.includes('dead-entry-probe')} counted=${counted}`));
    fs.unlinkSync(tmp);
}

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
