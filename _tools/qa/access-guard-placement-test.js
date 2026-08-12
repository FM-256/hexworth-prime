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
const strip = t => t.replace(/<!--[\s\S]*?-->/g, ' ');

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
        const code = m[2]
            .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
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
