#!/usr/bin/env node
/**
 * case-fold-lint.js
 *
 * @catalog what    INCOMPLETE. Aims to flag user-typed identifiers compared or looked up WITHOUT
 * @catalog what    a case fold in the Hex OS shell. Its own selftest says it catches 2 of 5 known
 * @catalog what    bugs, so it is NOT wired into anything and must not be trusted as coverage.
 * @catalog run     node _tools/hexos/case-fold-lint.js --selftest
 * @catalog status  PROBE
 *
 * STATUS: INCOMPLETE, AND DELIBERATELY NOT A GATE.
 * ------------------------------------------------
 * `--selftest` currently reports 2/5. It is committed in this state on purpose, because the idea
 * is worth keeping and the archive exists to stop the next person rebuilding it from scratch, but
 * a lint that catches one bug in five and is labelled GATE is worse than no lint: it converts
 * "nobody checked" into "the checker said it was fine". Two concrete gaps, both diagnosed:
 *
 *   1. It only knows identifiers in INPUTS. Case #6 compares `rowLab === labKey`, where `rowLab`
 *      holds a value off the wire rather than something typed, so nothing flags it. Fixing this
 *      means reasoning about where a value CAME FROM, not just what it is named.
 *   2. The reassignment rule clears an identifier for the whole function. In `resolveProcess`,
 *      `labKey` is cleared by its own declaration, which is right, but the rule is too coarse to
 *      notice that the RAW `arg` is still being used two lines later.
 *   3. SCOPE, and this one was introduced by the fix for the IIFE problem. Narrowing to the
 *      innermost enclosing function means a CLOSURE cannot see a fold that happened in its
 *      parent. `cd` does `arg = String(arg).toLowerCase()` and then filters with
 *      `function (p) { return p.indexOf(arg) === 0; }`; the closure body has no reassignment, so
 *      the lint flags correct code. ALL FIVE findings on the current file are this shape, and all
 *      five were checked by hand and are false:
 *          line  342  LAB_INFO[labKey]        labKey IS the folded value
 *          line  683  .indexOf(q)             q = arg.toLowerCase(), haystack folded too
 *          line  762  .indexOf(arg) === 0     cd reassigns arg to its folded form above
 *          line  763  .indexOf(arg) !== -1    same, the infix fallback
 *          line 1015  .indexOf(manKey)        manKey IS the folded value
 *      Fixing the outermost-match bug created the innermost-match bug: the right answer is to
 *      walk OUTWARD from the site collecting folds, not to pick one function and stop.
 *
 * THE NUMBERS ABOVE ARE PASTED FROM THE TOOL, NOT REMEMBERED. An earlier revision of this header
 * said 1/5 and three findings. Both were true when written and both went stale the moment the
 * scanner changed, and the wrong figures propagated into the SITREP before a reviewer re-ran the
 * tool and caught them. On a file whose entire purpose is an honest self-reported accuracy
 * number, restating that number from memory is the one thing it must not do. Re-run both
 * commands and paste, every time this file is touched.
 *
 * Two bugs already found and fixed inside this file, both by the selftest and neither by reading:
 *   - "folded anywhere in the function" as the clearing rule caught 0/5, because a folded COPY
 *     under a new name beside a still-raw original is the exact shape of every one of these bugs.
 *   - `.find()` on the enclosing function returned the OUTERMOST match, which is the one big IIFE
 *     the whole shell lives in, so `exec()`'s single `verb = ...toLowerCase()` cleared `verb`
 *     for the entire file. Innermost range wins.
 *
 * That is the argument for the selftest, not for the lint. Both defects would have shipped
 * invisibly; a scanner reporting "0 findings" reads identically whether the file is clean or the
 * scanner is broken.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Hex OS shell matches ids case-insensitively. Getting that right requires a fold at EVERY
 * comparison, and eight separate sites were found missing one, across five review rounds, one
 * site at a time. The pattern of discovery is the problem, not any individual bug:
 *
 *   1-5  run / info / ls / cd / tab-completion candidate matching
 *   6    resolveProcess(), found by Chris, LIVE: "restart LINUX-MASTERY" on a running lab
 *        answered "there is nothing to stop; just navigate away"
 *   7    man, found by Nancy, in a round whose stated job was to sweep for exactly this
 *   8    completionContext(), found by Chris, inside a function I had called "already fixed"
 *        for three rounds, because what was fixed was candidate MATCHING and not the verb
 *        PARSING that decides whether matching ever runs
 *
 * Twice the new site sat in code someone had already declared clean. A human sweep of this file
 * has now failed four times running. So the sweep gets mechanised: not because a lint is smarter,
 * but because it is exhaustive and it does not get bored on the second pass.
 *
 * WHAT IT CHECKS, and honestly what it cannot
 * -------------------------------------------
 * For each identifier that holds user-typed text (see INPUTS), find every comparison against a
 * lowercase string literal, every object-key lookup, and every indexOf, then check whether that
 * identifier was REASSIGNED to its own folded form in the innermost enclosing function. Only
 * reassignment clears it; a folded copy under a new name does not, for the reason given above
 * FOLDED. It is a regex-and-brace scanner, not a parser, so:
 *   - it can produce FALSE POSITIVES where a value is folded through an alias it cannot follow
 *   - it can MISS a site whose variable is not in INPUTS, which is gap 1 above
 * What is NOT acceptable is a lint that cannot fail, so `--selftest` reverts each of the fixes
 * listed in KNOWN (5 of the 8 sites; the first five predate this file and have no stable anchor)
 * and asserts the scan count RISES. A detector that has never been shown to catch the bug it was
 * written for is decoration, and this one currently catches 1 of the 5 it tests.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const TARGET = path.resolve(__dirname, '../../_app/hex/index.html');

// Identifiers that hold something a student typed. A site is only interesting if one of these
// reaches a comparison unfolded.
const INPUTS = ['arg', 'verb', 'frag', 'labKey', 'manKey', 'id', 'cwd', 'q', 'name', 'term'];

/* Folding evidence is REASSIGNMENT, and nothing else.
 *
 * The first version of this asked "is this identifier folded anywhere in the enclosing function?"
 * and caught 0 of 5 known bugs, because that is the exact shape of every one of them: a folded
 * COPY exists nearby (`labKey`, `manKey`, `rowLab`) while a specific site still reads the raw
 * value. Any fold in the function suppressed every site in it, including the broken one. The
 * detector was blind to precisely the thing it was built for, and the selftest is the only reason
 * that is a paragraph in a comment rather than a lint everyone trusts.
 *
 * So the only thing that clears an identifier is being REASSIGNED to its own folded form, which
 * is `cd`'s pattern (`arg = String(arg).toLowerCase()`): after that, every later read is folded.
 * Creating a folded copy under a NEW name clears nothing, because the raw one is still in scope
 * and still reachable, which is how six of these shipped. */
const FOLDED = (fnBody, id) =>
    new RegExp(`\\b${id}\\s*=\\s*(?!=)[^;]*(toLowerCase|low\\s*\\(|pKey\\s*\\()`).test(fnBody);

/** Split the file into rough function bodies by brace depth, so "enclosing function" means something. */
function functions(src) {
    const out = [];
    const re = /function\s+([A-Za-z_$][\w$]*)?\s*\(([^)]*)\)\s*\{/g;
    let m;
    while ((m = re.exec(src))) {
        let depth = 1, i = re.lastIndex;
        while (i < src.length && depth > 0) {
            const c = src[i];
            if (c === '{') depth++;
            else if (c === '}') depth--;
            i++;
        }
        out.push({ name: m[1] || '(anonymous)', start: m.index, end: i, body: src.slice(m.index, i) });
    }
    return out;
}

function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }

/** Every unfolded comparison/lookup of a user-input identifier. */
function scan(src) {
    const fns = functions(src);
    const findings = [];
    const seen = new Set();

    for (const id of INPUTS) {
        const pats = [
            // x === 'lowercase'   /  'lowercase' === x
            { re: new RegExp(`\\b${id}\\s*===?\\s*'([a-z][a-z0-9_-]*)'`, 'g'), kind: 'compare' },
            { re: new RegExp(`'([a-z][a-z0-9_-]*)'\\s*===?\\s*\\b${id}\\b`, 'g'), kind: 'compare' },
            // OBJ[x]  -- an object keyed by a lowercase convention
            { re: new RegExp(`\\b([A-Z][\\w$]*|[a-z][\\w$]*)\\s*\\[\\s*${id}\\s*\\]`, 'g'), kind: 'lookup' },
            // n.indexOf(x) === 0  -- prefix matching, the did-you-mean shape
            { re: new RegExp(`\\.indexOf\\s*\\(\\s*${id}\\s*\\)`, 'g'), kind: 'indexOf' },
        ];
        for (const { re, kind } of pats) {
            let m;
            while ((m = re.exec(src))) {
                const idx = m.index;
                /* INNERMOST enclosing function, not the first match. The whole shell lives inside
                   one big IIFE, so a plain .find() returned that IIFE for every site, and its body
                   contains exec()'s `var verb = String(...).toLowerCase()`. That single line
                   cleared `verb` for the entire file and made the lint report 0 findings on code
                   with five reverted bugs in it. Narrowest range wins. */
                const fn = fns
                    .filter(f => idx >= f.start && idx < f.end)
                    .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
                const body = fn ? fn.body : src;
                if (FOLDED(body, id)) continue;
                const key = `${id}:${idx}`;
                if (seen.has(key)) continue;
                seen.add(key);
                findings.push({
                    line: lineOf(src, idx), id, kind,
                    fn: fn ? fn.name : '(top level)',
                    text: src.slice(idx, idx + 74).split('\n')[0].trim()
                });
            }
        }
    }
    return findings.sort((a, b) => a.line - b.line);
}

/* ── Selftest: revert each known fix in memory and demand a flag ─────────────────────────────
 * The whole point. Each entry is (description, find, replaceWith) applied to a COPY of the source,
 * never to the file. If reverting a fix does not produce a finding, this lint would not have
 * caught that bug and says so. */
const KNOWN = [
    ['#6 resolveProcess labId row compare',
     'var rowLab = String(rows[i].labId == null ? \'\' : rows[i].labId).toLowerCase();',
     'var rowLab = rows[i].labId;'],
    ['#6b resolveProcess LAB_INFO lookup', 'SL.LAB_INFO[labKey]', 'SL.LAB_INFO[arg]'],
    ['#7 man MANUAL lookup', 'var m = MANUAL[manKey];', 'var m = MANUAL[arg];'],
    ['#7b man near-miss suggester', 'return n.indexOf(manKey) === 0;', 'return n.indexOf(arg) === 0;'],
    ['#8 completionContext verb', 'var verb = low(r[2]), frag = r[3];', 'var verb = r[2], frag = r[3];'],
];

function selftest(src) {
    let pass = 0, fail = 0;
    console.log('  selftest: revert each known fix, demand a flag\n');
    for (const [what, find, repl] of KNOWN) {
        if (src.indexOf(find) === -1) {
            console.log(`  SKIP ${what}\n       anchor not found, so this case is unverified. The fix may have been`);
            console.log('       reworded; update the anchor rather than leaving it silently skipped.');
            fail++;
            continue;
        }
        const before = scan(src).length;
        const after = scan(src.replace(find, repl)).length;
        const caught = after > before;
        console.log(`  ${caught ? 'ok  ' : 'FAIL'} ${what}  (${before} -> ${after} findings)`);
        caught ? pass++ : fail++;
    }
    console.log(`\n  ${pass}/${pass + fail} known bugs would be caught`);
    return fail === 0;
}

const src = fs.readFileSync(TARGET, 'utf8');

if (process.argv.includes('--selftest')) {
    process.exitCode = selftest(src) ? 0 : 1;
} else {
    const found = scan(src);
    if (!found.length) {
        console.log('  no unfolded user-input comparisons in _app/hex/index.html');
    } else {
        console.log(`  ${found.length} possible unfolded comparison(s):\n`);
        for (const f of found) {
            console.log(`  line ${String(f.line).padStart(4)}  ${f.kind.padEnd(7)} ${f.id.padEnd(7)} in ${f.fn}`);
            console.log(`              ${f.text}`);
        }
        console.log('\n  Each is a candidate, not a verdict: this is a scanner, not a parser, and a value');
        console.log('  folded through an alias it cannot follow will show up here. Check, then either fix');
        console.log('  it or fold the value where the scanner can see it.');
    }
    // Report only. A heuristic with false positives must not block a deploy on its own.
    process.exitCode = 0;
}
