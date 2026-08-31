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
        // .js TOO. dead-entry-gate's own main() runs stripDead over .js via allSource(), so a
        // sweep limited to .html cannot see a defect in the path that reads them. A reviewer found
        // the regex-literal desync in _app/scripts/migrate-to-content-registry.js, a .js file this
        // sweep was structurally unable to reach, and the unit fixture caught it while this gate
        // stayed green.
        else if (e.name.endsWith('.html') || e.name.endsWith('.js')) out.push(p);
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

// Skip what hosting already excludes. A leftover review probe under _app deliberately contains
// `if (false)` and EXCLUDE_LIST shapes, so stripping them is CORRECT, but this sweep flagged it as
// content loss. A gate that judges files which never ship reports defects that are not defects,
// and the fix for a non-defect is how real ones get introduced.
const IGNORED = (function () {
    try {
        const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../firebase.json'), 'utf8'));
        const h = Array.isArray(cfg.hosting) ? cfg.hosting[0] : cfg.hosting;
        return (h.ignore || []).map(function (g) {
            return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&')
                .replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*')
                .replace(/\u0000/g, '.*') + '$');
        });
    } catch (e) { return []; }
})();

const files = walk(APP).filter(function (f) {
    const rel = path.relative(APP, f).split(path.sep).join('/');
    return !IGNORED.some(function (re) { return re.test(rel); });
});
const losses = [];
let commented = 0;

for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const fbBefore = stripDead.fellBack || 0;
    const out = stripDead(src, f);
    const usedFallback = (stripDead.fellBack || 0) > fbBefore;
    // MATCH WHAT THE GATE MATCHES. This checked only `href=`, but dead-entry-gate's .js scanner
    // also picks up bare quoted site paths under keys like courseHref, entry and url. A deletion
    // of `entry: "/foo.html"` in a .js file would have corrupted exactly what the gate depends on
    // while this sweep reported clean. A safety net woven to a different pattern than the thing
    // it catches is not a safety net.
    // The gate's FULL .js alternation, copied rather than paraphrased. An earlier version dropped
    // its second branch, `\/[A-Za-z0-9_\-\/]+\/` (a bare directory path like "/houses/cloud/"),
    // and ORed in an `href=` match the gate's .js branch never uses. So a deletion of a
    // directory-style path would have been invisible to this sweep in both src and out: silence,
    // not a caught regression. That is the same "net woven to a different pattern than the thing
    // it catches" defect this file was written to close, surviving in the file that closed it.
    const PAT = f.endsWith('.js')
        ? /["'`]((?:\/|(?:houses|labs|games|arcade|dark-arts|cloud|signal|career)\/)[^"'`\s]*\.html|\/[A-Za-z0-9_\-\/]+\/)["'`]/g
        // HTML branch copied byte-for-byte from the gate as well. A reviewer diffed the WHOLE
        // pattern rather than only the branch that broke last time, and found this one still
        // paraphrased: `*` where the gate has `+`, non-capturing where the gate captures. Inert
        // today, since an empty href fails the gate's own check anyway, but it is the same
        // copied-vs-paraphrased drift that finding was about.
        : /href\s*=\s*["']([^"']+)["']/g;
    const A = src.match(PAT) || [];
    const B = out.match(PAT) || [];
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
        const isJsFile = f.endsWith('.js');
        const inScript = isJsFile || scriptRanges(src).some(r => at >= r[0] && at < r[1]);
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
                // Ask ESPRIMA, which is INDEPENDENT of the scanner being judged.
                //
                // Two wrong answers preceded this. First a hand-written `//` test, which reported
                // JSDoc usage examples in TenantRouter.js and TenantShell.js as content loss the
                // moment this sweep began reading .js. Then the shared scanner itself, which made
                // judge and defendant share a blind spot: removing regex awareness broke BOTH, so
                // they agreed and this gate stayed green while the unit fixture went red. That is
                // the exact failure a reviewer named at the start of this round, reintroduced by
                // my fix for it. esprima is a separate implementation, so a defect in the fallback
                // scanner shows up here instead of being mirrored.
                const region = isJsFile
                    ? [0, src.length]
                    : (scriptRanges(src).find(r => at >= r[0] && at < r[1]) || [0, src.length]);
                const code = src.slice(region[0], region[1]);
                const rel = at - region[0];
                let ranges = null;
                try {
                    ranges = require('esprima').tokenize(code, { comment: true, range: true })
                        .filter(function (t) { return t.type === 'LineComment' || t.type === 'BlockComment'; })
                        .map(function (t) { return t.range; });
                } catch (e) { ranges = null; }
                // esprima cannot read it either: fail closed rather than guess.
                legitimate = ranges === null
                    ? false
                    : ranges.some(function (r) { return rel >= r[0] && rel < r[1]; });
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

// THE OPPOSITE DIRECTION, asked directly rather than by pattern.
// The first version of this check looked for a quoted .html path inside a `//` line, which was
// too narrow to see the real case: a reviewer's regex-literal desync left whole comments standing
// in a file whose comments contain no such path. So ask esprima for every comment range in the
// SOURCE, then check whether that comment's text is still present in the stripped output. A
// comment that survives means any path inside it counts as a live link, which can mask a real
// orphan. esprima is independent of the scanner being judged, which is the point.
let survivors = 0;
let fallbackSkipped = 0;
const survivorFiles = [];
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const out = stripDead(src, f);
    const regions = f.endsWith('.js') ? [[0, src.length]] : scriptRanges(src);
    for (const [a, b] of regions) {
        const code = src.slice(a, b);
        let comments;
        try {
            comments = require('esprima').tokenize(code, { comment: true, range: true })
                .filter(function (t) { return t.type === 'LineComment' || t.type === 'BlockComment'; });
        } catch (e) {
            // STRUCTURAL LIMIT, stated rather than engineered around. On a file esprima cannot
            // tokenise, there is no independent authority on what is a comment, so this check
            // cannot judge the fallback stripper's output. That is exactly where the fallback
            // runs, so this sweep is blind to fallback-path comment bugs BY CONSTRUCTION.
            // I tried three times to make it see them. The reachable coverage is:
            //   - unit fixtures in dead-entry-gate.test.js exercise the fallback directly, and
            //     they DO catch the regex-literal desync (39/40 when it is reverted)
            //   - the corpus href-loss sweep above still covers the deletion direction here,
            //     because the classifier fails closed on fallback files
            // What is NOT covered: a comment SURVIVING in a fallback file. Say so rather than
            // let a green run imply otherwise.
            fallbackSkipped++;
            continue;
        }
        for (const c of comments) {
            const text = code.slice(c.range[0], c.range[1]).trim();
            if (text.length < 25) continue;                     // too short to identify reliably
            // Must be UNIQUE in the source, or a substring match cannot tell which instance
            // survived. Decorative separators like `// ────────` repeat dozens of times and
            // produced a false positive on admin/audit-tool.html before this guard.
            if (src.indexOf(text) !== src.lastIndexOf(text)) continue;
            if (out.indexOf(text) !== -1) {
                survivors++;
                if (survivorFiles.length < 6) survivorFiles.push(path.relative(APP, f) + '  ' + text.slice(0, 55).replace(/\n/g, ' '));
            }
        }
    }
}

console.log('  swept ' + files.length + ' html and js files');
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

if (survivors) {
    console.error('  FAIL ' + survivors + ' commented-out path(s) SURVIVED stripping:');
    survivorFiles.forEach(function (l) { console.error('    ' + l); });
    console.error('');
    console.error('  A path left inside a comment is counted as a real inbound link, which can');
    console.error('  mask a genuine orphan. That is the over-matching direction.');
    process.exitCode = 1;
} else {
    console.log('  ok   0 commented-out path(s) survived stripping');
}
if (fallbackSkipped) {
    console.log('  note: ' + fallbackSkipped + ' region(s) could not be independently checked for');
    console.log('        surviving comments, because esprima cannot tokenise them. Those bodies');
    console.log('        keep their comments by design, so a path inside one counts as a link.');
    console.log('        Declared, printed, and covered by unit fixtures; not silent.');
}
