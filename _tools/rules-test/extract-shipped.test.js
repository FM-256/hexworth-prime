#!/usr/bin/env node
'use strict';
/**
 * extract-shipped.test.js
 *
 * @catalog what   Tests the extractor two suites depend on: that it finds the RIGHT span, ignores
 *                 comment mentions, and refuses ambiguity instead of certifying one of several
 * @catalog run    node _tools/rules-test/extract-shipped.test.js
 * @catalog status TOOL
 *
 * WHY IT EXISTS, and it is a correction. The commit that anchored extractDecl claimed it was "proven
 * both ways against fixtures" -- and it had been, in ad-hoc scratch checks that were never committed.
 * Chris could not re-run any of it, which makes "proven" a word with no artifact behind it. A claim
 * whose evidence cannot be re-executed is an assertion, so here is the artifact.
 *
 * WHAT THIS MODULE IS FOR. Two suites run admin-console functions extracted from a 14,000-line inline
 * script rather than reimplementing them, so a suite cannot pass while the page does something else.
 * The risk is the extractor handing back the WRONG span while still reporting PASS -- a suite
 * confidently certifying a function nobody ships. The matcher has already been wrong once (it tracked
 * quotes but not comments and ran 43,230 characters past the end of a function), which is the whole
 * reason it lives in one shared place.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { extractShipped, extractDecl } = require('./lib/extract-shipped');

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-shipped-'));
/* Bodies are padded past the 200-char sanity floor: that floor exists to catch a broken matcher
 * returning a tiny "successful" span, and a fixture under it would trip the floor rather than the
 * behaviour under test. A fresh file per case, because a shared fixture is how one case ends up
 * deciding another. */
const pad = '            // padding to clear the 200-char sanity floor, which is not what is under test\n'.repeat(4);
function fixture(name, body) {
    const f = path.join(TMP, name);
    fs.writeFileSync(f, '<script>\n' + body + '\n</script>\n');
    return f;
}

console.log('\n== extract-shipped ==');

// 1. The ordinary cases: a plain declaration, an async one, and a window handler.
{
    const f = fixture('plain.html', `        function target(a) {\n${pad}            return a + 1;\n        }`);
    const b = extractDecl(f, 'target');
    chk('finds a plain declaration', /function target\(a\)/.test(b) && /return a \+ 1;/.test(b) && b.trim().endsWith('};'), b.length + ' chars');
}
{
    const f = fixture('async.html', `        async function target() {\n${pad}            return 2;\n        }`);
    const b = extractDecl(f, 'target');
    /* The `async` keyword must be INSIDE the span, not trimmed off it: a caller wraps this in
     * new Function(), and a body containing `await` without its `async` is a SyntaxError. That was
     * the state of things until this test existed. */
    chk('finds an async declaration AND keeps the async keyword', /^async function target\(\)/.test(b.trim()), b.slice(0, 32));
}
{
    const f = fixture('await.html', `        async function target() {\n${pad}            await Promise.resolve();\n            return 3;\n        }`);
    let ok = false, why = '';
    try { new Function(extractDecl(f, 'target') + '\nreturn target;')(); ok = true; }
    catch (e) { why = e.message; }
    chk('an extracted async function with `await` actually PARSES', ok, why.slice(0, 70));
}
{
    const f = fixture('win.html', `        window.target = async function(x) {\n${pad}            return x;\n        };`);
    chk('extractShipped still finds a window handler', /window.target = async function/.test(extractShipped(f, 'target')));
}

/* 2. THE FAILURE THIS GUARDS AGAINST: handing back a span that is not the shipped function while
 * still reporting success. A mention in a line comment must not be picked. */
{
    const f = fixture('linecomment.html',
        `        // function target(decoy) -- a mention in a line comment\n`
        + `        function target(real) {\n${pad}            return 'REALBODY';\n        }`);
    const b = extractDecl(f, 'target');
    chk('a mention in a // line comment is NOT picked', /REALBODY/.test(b) && /function target\(real\)/.test(b) && !/decoy/.test(b));
}
{
    /* Indented inside a block comment: the anchor requires the line to begin with the declaration
     * after whitespace only, and a leading `*` is not whitespace, so the ordinary block-comment
     * shape is correctly ignored. */
    const f = fixture('blockcomment-indented.html',
        `        /* WHY: function target(decoy) is described here\n         * function target(decoy) again\n         */\n`
        + `        function target(real) {\n${pad}            return 'REALBODY';\n        }`);
    const b = extractDecl(f, 'target');
    chk('a mention inside a normal /* */ block comment is NOT picked', /REALBODY/.test(b) && !/decoy/.test(b));
}

/* 3. AMBIGUITY IS AN ERROR, not a first-wins guess. Two real declarations of one name means the
 * suite would otherwise certify whichever came first in the file. */
{
    const f = fixture('dupe.html',
        `        function target(a) {\n${pad}            return 'FIRST';\n        }\n`
        + `        function target(b) {\n${pad}            return 'SECOND';\n        }`);
    let msg = '';
    try { extractDecl(f, 'target'); } catch (e) { msg = e.message; }
    chk('two real declarations REFUSE rather than picking one', /declared 2 times/.test(msg), msg.slice(0, 70));
}
{
    /* Chris found this: a block-comment line starting at COLUMN 0 with the declaration counts as a
     * hit, because the anchor is line-based and not comment-aware. Asserted as the LOUD REFUSAL it
     * actually is rather than papered over -- the guarantee this fix owes is "never silently certify
     * the wrong span", and a refusal honours that. The error text says so, so the refusal explains
     * itself instead of looking like a bug. */
    const f = fixture('blockcomment-col0.html',
        `        /*\nfunction target(decoy) {\n*/\n`
        + `        function target(real) {\n${pad}            return 'REALBODY';\n        }`);
    let msg = '';
    try { extractDecl(f, 'target'); } catch (e) { msg = e.message; }
    chk('a column-0 declaration inside a block comment REFUSES loudly (never a silent wrong span)',
        /declared 2 times/.test(msg) && /block comment/.test(msg), msg.slice(0, 64));
}

// 4. Absence and breakage must be loud, since both would otherwise read as a passing suite.
{
    const f = fixture('absent.html', `        function other(a) {\n${pad}            return a;\n        }`);
    let msg = '';
    try { extractDecl(f, 'target'); } catch (e) { msg = e.message; }
    chk('a missing declaration throws rather than returning empty', /not found at a line start/.test(msg), msg.slice(0, 60));
}
{
    // Under the 200-char floor: a matcher that broke and returned a stub must not read as success.
    const f = fixture('tiny.html', '        function target(a) { return a; }');
    let msg = '';
    try { extractDecl(f, 'target'); } catch (e) { msg = e.message; }
    chk('a suspiciously short span trips the sanity floor', /matcher is broken/.test(msg), msg.slice(0, 60));
}
{
    /* The original defect, kept as a regression: an apostrophe inside a block comment used to open a
     * phantom string, desynchronise brace depth, and run far past the end of the function. */
    const f = fixture('apostrophe.html',
        `        function target(a) {\n            /* the card's own claim, and it's a trap */\n${pad}            return 'DONE';\n        }\n`
        + `        function sentinel() { return 'MUST NOT BE INCLUDED'; }`);
    const b = extractDecl(f, 'target');
    chk('an apostrophe in a block comment does not run past the function end',
        /DONE/.test(b) && !/MUST NOT BE INCLUDED/.test(b), b.length + ' chars');
}

// 5. And it must still work on the real page both suites depend on.
{
    const page = path.join(__dirname, '..', '..', '_app', 'admin', 'console.html');
    const names = ['planPerTeamFlags', 'describePerTeamDrift', 'renderPerTeamDrift', 'readPerTeamContext', 'renderPerTeamPlan'];
    const sizes = names.map(n => extractDecl(page, n).length);
    chk('all five console helpers still extract from the shipped page',
        sizes.every(x => x > 200), names.map((n, i) => n + '=' + sizes[i]).join(' '));
    chk('and a window handler still extracts from it', extractShipped(page, 'writePerTeamFlags').length > 200);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exitCode = fail === 0 ? 0 : 1;
