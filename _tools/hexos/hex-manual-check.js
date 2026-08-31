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
    const body = src.slice(i + 1, end);
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

    if (problems.length) {
        console.error('HEX MANUAL DRIFT');
        problems.forEach(p => console.error('  ' + p));
        console.error('\nFix _app/hex/index.html so MANUAL and COMMANDS describe the same set.');
        process.exit(1);
    }
    console.log(`OK: ${commands.length} commands, ${manual.length} manual pages, ` +
        `no shadowed app ids, all manifest readers guarded.`);
}

if (require.main === module) main();
module.exports = { keysOf };
