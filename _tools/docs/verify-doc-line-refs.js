#!/usr/bin/env node
'use strict';
/**
 * verify-doc-line-refs.js
 *
 * @catalog what    Flags `file.ext:123` references in docs that no longer point at real code
 * @catalog run     node _tools/docs/verify-doc-line-refs.js [<doc paths>...] [--all] [--quiet]
 * @catalog status  GATE
 *
 * GATE, not TOOL: _tools/confluence/sync-published-docs.sh:70 runs this before publishing any
 * registered runbook and REFUSES to publish one whose refs have rotted, and deploy.sh:675 calls
 * that on every hosting deploy. The header said TOOL, which is the one thing CATALOG.md exists to
 * get right -- whether anything actually runs a script.
 *
 * WHY THIS EXISTS. A `file:line` citation is the convention for every technical claim in
 * `_docs/`, and it silently rots the moment anyone inserts a line above it. On 2026-09-19 that
 * happened twice in one day to a single document: writing the tournament runbook while editing
 * `console.html` in the same session left three refs pointing at a BLANK LINE, a bare `//`, and
 * the wrong function entirely. Hand-fixing those, then editing the same file twice more, broke
 * six more. A reader who chases a rotted ref concludes the document is careless, and they are
 * right to.
 *
 * WHAT IT CAN AND CANNOT PROVE. It cannot know what a ref MEANT, so it does not pretend to check
 * semantics. It catches the failure mode that actually occurs: a ref landing somewhere that
 * cannot possibly be the cited subject, such as a blank line, a bare brace, a lone comment
 * marker, or past end of file. Those are cheap and unambiguous, and they are what drift
 * produces. Everything else is printed with its current content so a human can eyeball it, which
 * is the honest division of labour rather than a green tick that means less than it looks like.
 *
 * A ref that survives this check can still be WRONG. Read the printed line.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const QUIET = args.includes('--quiet');
const ALL = args.includes('--all');
let docs = args.filter(a => !a.startsWith('--'));

if (ALL || docs.length === 0) {
    docs = execSync('find _docs -name "*.md" -type f', { cwd: ROOT, encoding: 'utf8' })
        .split('\n').filter(Boolean)
        /* Skip `_`-prefixed files in a SWEEP only. `_docs/_sync_gate_fixture.md` deliberately
         * contains a rotted ref so the sync gate's refusal path can be tested, and letting it
         * count would leave the platform total permanently non-zero — which is how a number
         * teaches people to ignore it. An EXPLICIT path is always checked, so the fixture stays
         * usable as a fixture. */
        .filter(f => !path.basename(f).startsWith('_'));
}

/* Resolve a cited path. Docs cite both full paths and bare basenames, so fall back to a unique
 * suffix match over the tree rather than guessing a directory. */
let tracked = null;
function resolve(ref) {
    if (fs.existsSync(path.join(ROOT, ref))) return ref;
    if (!tracked) {
        tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
        /* _tools is gitignored, so without this every _tools ref reads as unresolved. */
        try {
            tracked = tracked.concat(execSync('find _tools -type f \\( -name "*.js" -o -name "*.sh" \\)',
                { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean));
        } catch (e) { void e; }
    }
    const hits = tracked.filter(f => f === ref || f.endsWith('/' + ref));
    return hits.length === 1 ? hits[0] : null;
}

/* A line that cannot be the subject of a citation, however that citation was worded. */
function isImpossible(line) {
    const t = line.trim();
    if (t === '') return 'blank line';
    if (/^[{}();,]+$/.test(t)) return 'bare punctuation';
    if (/^(\/\/|\*|\/\*)$/.test(t)) return 'lone comment marker';
    return null;
}

const REF = /([A-Za-z0-9_][A-Za-z0-9_/.-]*\.(?:html|js|rules|json|css|sh|py)):(\d+)/g;
const cache = new Map();
let checked = 0, broken = 0, unresolved = 0;
const problems = [];

for (const doc of docs) {
    const text = fs.readFileSync(path.join(ROOT, doc), 'utf8');
    const seen = new Set();
    let m;
    REF.lastIndex = 0;
    while ((m = REF.exec(text)) !== null) {
        const ref = m[1], ln = parseInt(m[2], 10);
        const key = ref + ':' + ln;
        if (seen.has(key)) continue;
        seen.add(key);
        const real = resolve(ref);
        if (!real) { unresolved++; if (!QUIET) problems.push(`  UNRESOLVED  ${doc} -> ${key}`); continue; }
        if (!cache.has(real)) cache.set(real, fs.readFileSync(path.join(ROOT, real), 'utf8').split('\n'));
        const lines = cache.get(real);
        checked++;
        if (ln > lines.length) { broken++; problems.push(`  PAST EOF    ${doc} -> ${key} (file has ${lines.length} lines)`); continue; }
        const why = isImpossible(lines[ln - 1]);
        if (why) { broken++; problems.push(`  BROKEN      ${doc} -> ${key} (${why})`); }
        else if (!QUIET) console.log(`  ok  ${key}  ${lines[ln - 1].trim().slice(0, 84)}`);
    }
}

if (problems.length) { console.log(''); problems.forEach(p => console.log(p)); }
console.log(`\n  ${checked} ref(s) checked, ${broken} impossible, ${unresolved} unresolved path(s)`);
if (broken) console.log('  A ref landing on a blank line or a bare brace cannot be the subject it cites. Fix or remove it.');
process.exitCode = broken > 0 ? 1 : 0;
