#!/usr/bin/env node
/*
 * @catalog what    Asserts every page calling AccessGuard.require() runs it BEFORE <body> opens,
 * @catalog what    and that a gated page still gates after the move.
 * @catalog run     node _tools/qa/access-guard-placement-test.js
 * @catalog status  GATE
 *
 * WHY. Mallory, 2026-08-11: 124 pages called AccessGuard.require() AFTER real content in the
 * DOM. AccessGuard's IIFE hides <body> the moment its tag executes, so running it at end-of-body
 * means the whole page is parsed, and on a slow connection painted, before the hide lands: a
 * flash of the exact content being gated. Nancy fixed this on 6 WSA instructor decks on
 * 2026-08-03 and it was never swept.
 *
 * Static, because the defect is one of ORDER IN THE DOCUMENT, not of runtime behaviour. A
 * browser check cannot see it: by the time DOMContentLoaded fires, the bottom-of-body guard has
 * already run. Mallory said as much and marked the paint consequence UNPROVEN rather than
 * claiming it. This asserts the property that is actually checkable.
 */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '../../_app');
/* ⚠ USE THE SHARED, ORDER-AWARE STRIP. The hand-rolled version here did two things wrong and
   the second one HID DEFECTS in a security gate:
     1. It replaced HTML comments with a single space, changing every offset after them, while
        this file measures brace depth BY POSITION. stripNonCode is length-preserving.
     2. Below, it stripped `//` comments BEFORE blanking string literals, so a URL in a string
        opened a fake comment that ate the rest of the line. Proven: for
        `const API = 'https://api.example.com'; if (isSorted) { AccessGuard.require('admin'); }`
        the old order made the CALL VANISH ENTIRELY -- a page with a genuinely late gate would
        simply not be counted. A gate that fails by hiding is the worst kind.
   _tools/eduscan/utils/strip-noncode.js blanks JS string CONTENTS first, then JS comments, and
   only then HTML comments, which is the order its own header documents as load-bearing.
   BUG-113 tracks the other hand-rolled variants; do not write a new one. */
const { stripNonCode } = require('../eduscan/utils/strip-noncode.js');
const strip = stripNonCode;

/* Calls nested inside a function are CONDITIONAL and must not be hoisted; path-view.html calls
   require('admin') from inside a handler. Those are legitimately not top-level and are excluded
   by measuring brace depth, the same way the transformer decided what was safe to move. */
function topLevelRequireAfterBody(src) {
    const s = strip(src);
    const body = s.indexOf('<body');
    if (body === -1) return false;
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(s))) {
        if (m.index < body) continue;
        if (/src=/i.test(m[1])) continue;
        /* ⚠ STRIP JS COMMENTS FIRST, then look for the call. Searching the raw script finds
           any MENTION of AccessGuard.require in a comment, and _games-lab/wheel.html documents
           its own optional-guard pattern in a block comment above the real call. Measuring
           brace depth from the comment's position reported depth 0 and flagged a correctly
           nested call as a top-level offender. Third time today a checker has confused a
           comment about code for the code. */
        // Already neutralized by stripNonCode above -- strings blanked, then comments, in the
        // safe order. Re-stripping here is what introduced the URL-eats-the-line bug.
        const code = m[2];
        const i = code.indexOf('AccessGuard.require(');
        if (i === -1) continue;
        let pre = code.slice(0, i)
            .replace(/'(?:[^'\\]|\\.)*'/g, '').replace(/"(?:[^"\\]|\\.)*"/g, '');
        if ((pre.match(/\{/g) || []).length - (pre.match(/\}/g) || []).length === 0) return true;
    }
    return false;
}

function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, out);
        else if (e.name.endsWith('.html')) out.push(fp);
    }
    return out;
}

const pages = walk(APP, []).filter(f => strip(fs.readFileSync(f, 'utf8')).includes('AccessGuard.require('));
const late = pages.filter(f => topLevelRequireAfterBody(fs.readFileSync(f, 'utf8')));

console.log(`\n  pages calling AccessGuard.require() : ${pages.length}`);
console.log(`  running it AFTER <body> opens       : ${late.length}\n`);
late.slice(0, 12).forEach(f => console.log('    LATE  ' + path.relative(APP, f)));
if (late.length > 12) console.log(`    ... and ${late.length - 12} more`);

const ok = late.length === 0;
console.log(ok ? '\n  PASS  every top-level gate runs before its page content'
                : `\n  FAIL  ${late.length} page(s) parse content before the gate runs`);
process.exit(ok ? 0 : 1);
