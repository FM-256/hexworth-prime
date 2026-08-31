#!/usr/bin/env node
/**
 * corpus-preservation.test.js
 *
 * @catalog what    Sweeps every HTML file under _app and fails if stripDead() removes an href
 * @catalog what    that was NOT inside a comment. Catches content deletion the unit tests cannot.
 * @catalog run     node _tools/hexos/corpus-preservation.test.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * The comment-stripping in dead-entry-gate.js deleted real markup TWICE, and both times the unit
 * suite was green. It was green because every fixture is synthetic and short: a 33-case suite
 * cannot contain the shape where `accept="image/*"` pairs with a `*&#47;` 85,324 characters away,
 * or where a JS string holding the text '&lt;!--' pairs with a real '--&gt;' 5,174 characters later.
 *
 * A reviewer found both by sweeping the corpus, which takes under a minute, and which I had not
 * run before asserting the class was closed. This is that sweep, made permanent.
 *
 * It CLASSIFIES rather than counts. An href that disappears because it was commented out is
 * correct and must not fail. An href that disappears from live markup is content deletion. My
 * first hand-run of this counted deltas instead, reported 8 files "losing content", and 5 of
 * those were comment-stripping working exactly as designed. Counting would have made this gate
 * cry wolf until someone switched it off.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { stripDead } = require('./dead-entry-gate.js');

const APP = path.resolve(__dirname, '../../_app');

function walk(dir, out) {
    out = out || [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_archive') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.html')) out.push(p);
    }
    return out;
}


/** Byte ranges of every <script> body, so markup checks can ignore their contents. */
function scriptRanges(src) {
    const re = /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
    const out = [];
    let m;
    while ((m = re.exec(src))) {
        const start = m.index + m[1].length;
        out.push([start, start + m[2].length]);
    }
    return out;
}

/** Same string with script bodies replaced by spaces, preserving all offsets. */
function maskScripts(src) {
    let out = src;
    for (const [a, b] of scriptRanges(src)) {
        out = out.slice(0, a) + ' '.repeat(b - a) + out.slice(b);
    }
    return out;
}

const files = walk(APP);
const losses = [];
let commented = 0;

for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const fbBefore = stripDead.fellBack || 0;
    const out = stripDead(src, f);
    const usedFallback = (stripDead.fellBack || 0) > fbBefore;
    const A = src.match(/href\s*=\s*["'][^"']*["']/g) || [];
    const B = out.match(/href\s*=\s*["'][^"']*["']/g) || [];
    for (const a of A) {
        if (B.indexOf(a) !== -1) continue;
        const at = src.indexOf(a);
        // Classify by SEGMENT first. An earlier version asked
        //   before.lastIndexOf('<!--') > before.lastIndexOf('-->')
        // which is the exact naive logic that CAUSED the bug: an href swallowed by a fake '<!--'
        // inside a script string was classified as legitimately commented, so this gate passed
        // while the broken stripper was restored. A detector keyed on the wrong surface, inside
        // the gate written to catch that. Verified: with that version, reverting the fix did not
        // fail this test.
        const inScript = scriptRanges(src).some(r => at >= r[0] && at < r[1]);
        let legitimate;
        if (inScript) {
            // FAIL CLOSED when the file needed the fallback stripper. This classifier's own
            // "is there a // on this line" test has the SAME blind spot as the thing it judges,
            // so on a file where esprima could not tokenise, it cannot be trusted to tell a real
            // comment from `"see docs // not real"`. A reviewer reproduced live href deletion
            // through exactly that pair, with this gate reporting legitimate=true. Where the
            // judge shares the defendant's blind spot, the judge must not acquit.
            if (usedFallback) legitimate = false;
            else {
                const line = src.slice(src.lastIndexOf('\n', at) + 1, at);
                legitimate = /(^|[^:])\/\//.test(line);
            }
        } else {
            // In markup: look for an enclosing <!-- --> considering MARKUP ONLY, with script
            // bodies blanked out so their contents cannot open or close a comment.
            const masked = maskScripts(src).slice(0, at);
            legitimate = masked.lastIndexOf('<!--') > masked.lastIndexOf('-->');
        }
        if (legitimate) commented++;
        else losses.push(path.relative(APP, f) + '  ' + a.slice(0, 70));
    }
}

console.log('  swept ' + files.length + ' html files');
console.log('  ok   ' + commented + ' href(s) removed because they were commented out');

if (losses.length) {
    console.error('  FAIL ' + losses.length + ' href(s) removed from LIVE markup:');
    losses.slice(0, 20).forEach(function (l) { console.error('    ' + l); });
    console.error('');
    console.error('  stripDead() is deleting real content. That silently removes edges from the');
    console.error('  link graph, and a false "unreached" can then be baselined into permanent');
    console.error('  blindness, which is the exact incident this gate exists to prevent.');
    process.exitCode = 1;
} else {
    console.log('  ok   0 href(s) removed from live markup');
}
