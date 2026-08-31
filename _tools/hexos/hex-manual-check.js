#!/usr/bin/env node
/**
 * hex-manual-check.js
 *
 * @catalog what    Fails if the hex shell's MANUAL pages and its COMMANDS table stop agreeing, or
 * @catalog what    if an app id shadows a command name. Structural defence against manual drift.
 * @catalog run     node _tools/hexos/hex-manual-check.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * Nancy's review of the `man` command made the point that closed this gap: the MANUAL table is
 * "the drifts-silently kind" of registry, and she had the proof in hand because the commit she was
 * reviewing already contained a false statement. `man cd` claimed Tab completion prefers what is
 * nearby, which is true of `run` and `info` and NOT of `cd`. I had written it from intuition about
 * what should be true rather than pressing Tab inside cd's own argument.
 *
 * That was the third false statement about behaviour shipped from this one file in a single
 * session (`help` claiming `ls` lists everything once `cd` existed; `cd` claiming a real house did
 * not exist while the manifest was loading). Prose cannot be made self-checking, but the parts
 * that ARE mechanical can be, and every one of those three began as a structural mismatch that
 * nothing was watching.
 *
 * WHAT THIS CAN AND CANNOT DO
 *   CAN: prove every command has a page, no page documents a command that does not exist, no app
 *        id shadows a command name (which would make `man <id>` silently show the wrong thing
 *        forever, since MANUAL is checked before byId), and that every command reading the
 *        manifest calls notReady() first.
 *   CANNOT: prove the guard actually PRECEDES the assertion. The outside-COMMANDS rule matches
 *        `say(`/`error:` and `notReady()`/`manifestState` as raw strings over a function body, with
 *        no control-flow awareness, so it proves both exist somewhere and nothing about their
 *        order. A function that renders via out.appendChild() directly, or returns its message in a
 *        field named msg:/text:/warning: instead of error:, is invisible to it and would fail
 *        exactly the way `man cd` and `help` did before this gate existed. Reviewer's words, and
 *        they are correct: syntactic pattern-matching that holds today and can rot silently. Widen
 *        the two regexes when either idiom appears rather than assuming the rule still covers it.
 *   CANNOT: prove a page's PROSE describes what the code does. Nothing can, short of a human or a
 *        behavioural test. So this narrows the surface rather than eliminating it, and saying so
 *        plainly matters more than the check itself.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const SHELL = path.join(REPO, '_app/hex/index.html');
const MANIFEST = path.join(REPO, '_app/data/hex-apps.json');

/** Keys of a top-level object literal in the shell source, by brace matching from its opening. */
function keysOf(src, declaration) {
    const start = src.indexOf(declaration);
    if (start === -1) throw new Error('could not find ' + declaration + ' in ' + SHELL);
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end === -1) throw new Error('unbalanced braces after ' + declaration);
    // Strip comments BEFORE extracting keys. Without this, prose like "why resolve() exists:"
    // inside a comment is read as a key named `exists`, and the gate reports a command with no
    // manual page that does not exist. Same comments-read-as-code bug already fixed once today in
    // the manifest generator's guard reader; a detector that misreads its input invents findings,
    // which costs exactly as much trust as missing real ones.
    const body = src.slice(i + 1, end)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    // Only keys at depth 1 of this literal, so nested objects do not leak in.
    const keys = [];
    let d = 0;
    body.replace(/[{}]|(^|[,\s])([a-zA-Z_$][\w$]*)\s*:/g, function (m, _a, name, off) {
        if (m === '{') d++;
        else if (m === '}') d--;
        else if (d === 0 && name) keys.push(name);
        return m;
    });
    return [...new Set(keys)];
}

function main() {
    const src = fs.readFileSync(SHELL, 'utf8');
    const commands = keysOf(src, 'var COMMANDS = {').sort();
    const manual = keysOf(src, 'var MANUAL = {').sort();
    const problems = [];

    const undocumented = commands.filter(c => manual.indexOf(c) === -1);
    const orphaned = manual.filter(m => commands.indexOf(m) === -1);
    if (undocumented.length) problems.push('commands with NO manual page: ' + undocumented.join(', '));
    if (orphaned.length) problems.push('manual pages for commands that do not exist: ' + orphaned.join(', '));

    // `man` checks MANUAL before byId, so an app id equal to a command name would be permanently
    // unreachable through man and would never error.
    if (fs.existsSync(MANIFEST)) {
        const apps = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).apps || [];
        const shadowed = apps.map(a => a.id).filter(id => commands.indexOf(id) !== -1);
        if (shadowed.length) {
            problems.push('app id(s) shadowed by a command name, so `man <id>` shows the command ' +
                'page instead of the app: ' + shadowed.join(', '));
        }
    }

    // Every command that reads the manifest must call notReady() first. Without it, a stalled or
    // failed fetch makes the command assert that something does not exist, when the true fact is
    // that the list has not arrived. Five commands were fixed by hand, a reviewer found a sixth
    // (man), and this audit immediately found a seventh and eighth (stop, restart) that had been
    // written the same hour. Finding them one at a time by review does not scale; this does.
    const cmdBlock = (function () {
        const start = src.indexOf('var COMMANDS = {');
        let i = src.indexOf('{', start), d = 0;
        for (let j = i; j < src.length; j++) {
            if (src[j] === '{') d++;
            else if (src[j] === '}') { d--; if (d === 0) return src.slice(i + 1, j); }
        }
        return '';
    })();
    const marks = [];
    const re = /(\w+): function \([^)]*\) \{/g;
    let mm;
    while ((mm = re.exec(cmdBlock))) marks.push({ name: mm[1], at: mm.index });
    const unguarded = marks.filter(function (mk, k) {
        const seg = cmdBlock.slice(mk.at, (marks[k + 1] || { at: cmdBlock.length }).at);
        return /\bAPPS\b|byId\(|scope\(|places\(/.test(seg) && !/notReady\(\)/.test(seg);
    }).map(function (x) { return x.name; });
    if (unguarded.length) {
        problems.push('command(s) read the manifest without a notReady() guard, so they will ' +
            'assert non-existence while it is still loading: ' + unguarded.join(', '));
    }

    // Manifest reads OUTSIDE the COMMANDS table. The audit above only ever walked cmdBlock, so
    // the dispatcher's own bare-name lookup in exec(), `if (!COMMANDS[verb] && byId(verb))`,
    // was structurally invisible to it. Nancy found that ninth reader by hand, which is precisely
    // what this gate exists to stop being necessary. A detector scoped to one region cannot report
    // on the region it does not read, and its clean output looks identical either way.
    const outside = src.slice(0, src.indexOf('var COMMANDS = {')) +
                    src.slice(src.indexOf('var COMMANDS = {') + cmdBlock.length);
    const fnRe = /function (\w+)\s*\([^)]*\)\s*\{/g;
    let fm;
    const leaks = [];
    while ((fm = fnRe.exec(outside))) {
        let i = outside.indexOf('{', fm.index), d = 0, end = outside.length;
        for (let j = i; j < outside.length; j++) {
            if (outside[j] === '{') d++;
            else if (outside[j] === '}') { d--; if (d === 0) { end = j; break; } }
        }
        const body = outside.slice(fm.index, end)
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
        // notReady/byId/scope are the accessors themselves; they may read APPS by definition.
        if (['notReady', 'byId', 'scope', 'places'].indexOf(fm[1]) !== -1) continue;
        // The harm is ASSERTING a falsehood while the list is loading, not reading it. A silent
        // reader (Tab completion) offering fewer candidates for a moment tells the student
        // nothing untrue, and forcing notReady() on it would print a message on every keystroke.
        // So the trigger is: reads the manifest AND emits user-facing text. Verified against both
        // fixtures, rather than assuming which side of the line each falls on: completionContext
        // emits neither say() nor an error: field, and resolveProcess emits five.
        const speaks = /\bsay\(|\berror:/.test(body);
        // Two legitimate spellings of the same invariant. notReady() both checks and prints, which
        // is right for a command; a function that RETURNS its error text for a caller to render
        // must consult manifestState directly or it would print twice. Accept either, since the
        // invariant is "consulted readiness before asserting", not "called one specific helper".
        const guarded = /notReady\(\)|manifestState/.test(body);
        if (/\bAPPS\b|byId\(|scope\(|places\(/.test(body) && speaks && !guarded) {
            leaks.push(fm[1]);
        }
    }
    if (leaks.length) {
        problems.push('function(s) OUTSIDE the COMMANDS table read the manifest without a ' +
            'notReady() guard: ' + leaks.join(', '));
    }

    if (problems.length) {
        console.error('HEX MANUAL DRIFT');
        problems.forEach(p => console.error('  ' + p));
        console.error('\nFix _app/hex/index.html so MANUAL and COMMANDS describe the same set.');
        process.exit(1);
    }
    console.log(`OK: ${commands.length} commands, ${manual.length} manual pages, ` +
        `no shadowed app ids, all manifest readers guarded (inside AND outside COMMANDS).`);
}

if (require.main === module) main();
module.exports = { keysOf };
