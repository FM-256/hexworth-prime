#!/usr/bin/env node
/**
 * FUNC-CTF-COMMAND-SMOKE
 *
 * Runtime gate complementing HEUR-CTF-CFG-MISACCESS. For every CTF lab
 * config.js with a `commands: { ... }` block, vm-loads the config and
 * invokes each command function with empty args + a fake engine of the
 * shape `{config: cfg}` (matching how BoxEngine actually exposes config
 * state to command handlers).
 *
 * Catches the entire class of "command throws at runtime due to wrong
 * config-state access" bugs. The static HEUR-CTF-CFG-MISACCESS catches
 * the specific `engine._X` vs `engine.config._X` shape; this runtime
 * gate catches anything else (typos, undefined-references, off-by-one
 * in inner state, etc) that would silently throw for a student.
 *
 * Pass criteria per command:
 *   - Function executes without throwing
 *   - Return value is a string (most commands return text) OR null (some
 *     commands return null to fall through to default handlers — valid
 *     pattern per Terminal.js:227)
 *
 * Usage:
 *   node _tools/eduscan/smoke/ctf-commands.js              # text output
 *   node _tools/eduscan/smoke/ctf-commands.js --json       # machine
 *
 * Exit 0 on all pass, exit 1 if any command throws.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../../..');
const APP = path.join(ROOT, '_app');
const wantJson = process.argv.includes('--json');
const verbose = process.argv.includes('--verbose');

// ── Locate every CTF lab config.js ──
function walkLabs(dir, out) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walkLabs(full, out);
        else if (ent.isFile() && ent.name === 'config.js' && /\/labs\//.test(full)) out.push(full);
    }
}
const labs = [];
walkLabs(path.join(APP, 'houses'), labs);

// ── Load a config.js as a value via vm sandbox ──
function loadConfig(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    // Anchor: `const NAME = { ... };` — extract NAME from the source so we
    // can return that binding from the sandbox.
    const m = src.match(/\b(?:const|var|let)\s+(\w+)\s*=\s*\{/);
    if (!m) return null;
    const ctxName = m[1];
    const code = src + `\n;module.exports = ${ctxName};`;
    // Use a module-style sandbox so const declarations work
    const sandbox = { module: { exports: {} }, exports: {}, console };
    try {
        vm.runInNewContext(code, sandbox, { filename: filePath, timeout: 5000 });
        return sandbox.module.exports;
    } catch (e) {
        return { __loadError: e.message };
    }
}

// ── Invoke each command with empty args + fake engine ──
function probeCommands(filePath) {
    const cfg = loadConfig(filePath);
    if (cfg === null) return { skipped: 'no-anchor' };
    if (cfg && cfg.__loadError) return { loadError: cfg.__loadError };
    if (!cfg || typeof cfg !== 'object') return { skipped: 'no-config' };
    if (!cfg.commands || typeof cfg.commands !== 'object') return { skipped: 'no-commands' };

    const fakeTerm = {
        // Minimal terminal stub — most commands don't reach into it, but the
        // contract is `function(args, term, engine)` so we must pass something.
        // `fs` is a deep-clone of cfg.filesystem matching Terminal._buildFS,
        // so commands that read/mutate `term.fs` find a structurally valid tree.
        _appendOutput: () => {},
        _scrollToBottom: () => {},
        config: cfg,
        fs: cfg.filesystem ? JSON.parse(JSON.stringify(cfg.filesystem)) : {},
        engine: null,                  // some commands check `term.engine`
    };
    // Construct a fake engine matching BoxEngine instance shape STRICTLY: it
    // has `.config` pointing to the lab config + a few legitimate runtime
    // helpers (awardFlag, _logEvent). Anything else (commands, filesystem,
    // _classifications, etc) lives on `engine.config.X` — labs that read
    // those off the bare engine are buggy and SHOULD throw here.
    //
    // Don't shadow config keys onto the fake engine — that would mask real
    // bugs. The point of this gate is to catch them.
    const fakeEngine = {
        config: cfg,
        awardFlag: () => {},
        _logEvent: () => {},
        _classifyCommand: () => 'OTHER',
    };
    fakeTerm.engine = fakeEngine;

    // Skip private-helper entries that happen to live in commands: but aren't
    // user-callable (convention: leading underscore). Terminal would still
    // dispatch them if a student typed the exact name, but the failure mode
    // for those is a separate concern — these aren't normal command bugs.
    const cmdNames = Object.keys(cfg.commands).filter(n => !n.startsWith('_'));
    const results = [];
    for (const name of cmdNames) {
        const fn = cfg.commands[name];
        if (typeof fn !== 'function') {
            results.push({ name, skipped: 'not-a-function' });
            continue;
        }
        try {
            const out = fn([], fakeTerm, fakeEngine);
            // Acceptable returns: string (most commands) or null (fall-through pattern)
            const ok = typeof out === 'string' || out === null || typeof out === 'undefined';
            results.push({ name, ok, returnType: out === null ? 'null' : typeof out, length: typeof out === 'string' ? out.length : 0 });
        } catch (e) {
            results.push({
                name,
                ok: false,
                threw: e.message.substring(0, 200),
                stack: e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : null
            });
        }
    }
    return { results };
}

// ── Main ──
const summary = { totalLabs: 0, totalCommands: 0, passed: 0, failed: 0, skipped: 0, byLab: [] };
for (const labPath of labs) {
    const rel = labPath.replace(APP + '/', '');
    summary.totalLabs++;
    const r = probeCommands(labPath);
    if (r.skipped) {
        summary.skipped++;
        summary.byLab.push({ lab: rel, skipped: r.skipped });
        continue;
    }
    if (r.loadError) {
        summary.failed++;
        summary.byLab.push({ lab: rel, loadError: r.loadError });
        continue;
    }
    const labFails = [];
    for (const c of r.results) {
        summary.totalCommands++;
        if (c.skipped) continue;
        if (c.ok) { summary.passed++; }
        else { summary.failed++; labFails.push(c); }
    }
    summary.byLab.push({ lab: rel, totalCmds: r.results.length, fails: labFails });
}

if (wantJson) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.failed === 0 ? 0 : 1);
}

console.log('');
console.log('═══ FUNC-CTF-COMMAND-SMOKE ═══');
console.log('');
console.log(`Labs scanned:      ${summary.totalLabs}`);
console.log(`Commands probed:   ${summary.totalCommands}`);
console.log(`  passed:          ${summary.passed}`);
console.log(`  failed:          ${summary.failed}`);
console.log(`  skipped (lab):   ${summary.skipped}`);
console.log('');

const failedLabs = summary.byLab.filter(l => (l.fails && l.fails.length > 0) || l.loadError);
if (failedLabs.length > 0) {
    console.log('--- FAILURES ---');
    for (const l of failedLabs) {
        if (l.loadError) {
            console.log(`✗ ${l.lab}`);
            console.log(`    load error: ${l.loadError}`);
        } else {
            console.log(`✗ ${l.lab} (${l.fails.length}/${l.totalCmds} cmds failed)`);
            for (const c of l.fails) {
                console.log(`    ${c.name}: ${c.threw || '(returned non-string non-null)'}`);
                if (verbose && c.stack) console.log(`      ${c.stack}`);
            }
        }
    }
    console.log('');
    process.exit(1);
}

console.log('All commands pass: zero throws across all CTF labs.');
process.exit(0);
