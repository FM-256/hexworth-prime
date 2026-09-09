#!/usr/bin/env node
/**
 * box-contract-lint.js
 *
 * @catalog what   Gate. Checks every BoxEngine box against the contracts a student can see
 *                 but no existing gate reads: hint prices must be numbers, a Windows box
 *                 must not advertise directories its `cd` cannot enter, a command handler
 *                 must not return bare null, and a walkthrough must not promise commands
 *                 the box does not implement.
 * @catalog run    node _tools/hexos/box-contract-lint.js [--json] [--box <name>]
 * @catalog status GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * The operator found four defects in NT1 by PLAYING it, after every gate passed. The gate
 * inventory explains why: of 46 gates, the BOX_* audits are static and check DATA SHAPE
 * (flag leaks, storage keys, registry ids, scoring floors), the smoke gate checks that a
 * page renders, and exactly one gate drives every dispatch box — terminal-async-output —
 * which asserts a single string, "[object Promise]". BOX_WALKTHROUGH_AUDIT confirms a
 * walkthrough EXISTS; nothing compares its claims to the box. So nothing on this platform
 * checked whether a box behaves the way it tells a student it behaves.
 *
 * The four NT1 defects and the rule each one earns:
 *   `dir` listed Desktop/Documents/Downloads, `cd` was never overridden and fell through to
 *   Terminal.js's POSIX builtin walking an EMPTY filesystem      -> SHELL-001 / SHELL-002
 *   `cls` returned null, which Terminal.js reads as "fall through to the builtin", and
 *   there is no case 'cls' — so it printed a bash error after clearing the screen
 *                                                                 -> SHELL-003
 *   hint 1 rendered "Reveal Hint (true pts)" and scored +1        -> HINT-001
 *   the walkthrough advertised commands and locations the sim did not provide
 *                                                                 -> DOC-001
 *
 * STATIC ON PURPOSE. Every rule here is computed from the config, so the gate costs
 * seconds and can run on every deploy across all boxes. HINT-001 mirrors BoxEngine's own
 * expression; CANARY-001 fails if that expression changes underneath us, so the mirror
 * cannot silently drift out of agreement with the engine — the render-vs-generator trap.
 *
 * Exit 0 = clean. Exit 1 = at least one HIGH finding. Exit 2 = the canary broke.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// BOX_LINT_ROOT lets the gate be pointed at a checkout of older code, so it can be proven
// to FAIL on known-bad input before it is trusted to pass. A gate that has only ever been
// run against a fixed tree has not demonstrated that it detects anything.
const ROOT = process.env.BOX_LINT_ROOT || path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');
const ENGINE = path.join(APP, 'arena/engine/BoxEngine.js');
const TERMINAL = path.join(APP, 'arena/engine/Terminal.js');
const SOLUTIONS = path.join(process.env.HOME || '', 'hexworth-shared/Solutions');

const argv = process.argv.slice(2);
const AS_JSON = argv.includes('--json');
const onlyIdx = argv.indexOf('--box');
const ONLY = onlyIdx > -1 ? argv[onlyIdx + 1] : null;

const findings = [];
/** Record one finding. HIGH fails the gate; LOW is reported and does not block. */
const add = (sev, rule, box, message, detail) =>
    findings.push({ severity: sev, rule, box, message, detail: detail || null });

/** Load a box config.js in an isolated context and return its exported config object. */
function loadConfig(file) {
    const src = fs.readFileSync(file, 'utf8');
    const sandbox = {
        window: {}, console,
        document: { createElement: () => ({ set textContent(v) { this.innerHTML = v; }, innerHTML: '' }) },
        BoxEngine: { requestFlagText: async () => 'flag{x}', getDeliveredFlag: () => 'flag{x}' },
        navigator: { userAgent: '' }, location: { href: '' }
    };
    vm.createContext(sandbox);
    // The config object is a top-level `const <Name>Config = {...}` in a classic script.
    const m = src.match(/const\s+([A-Za-z0-9_]*Config)\s*=\s*\{/);
    if (!m) return null;
    vm.runInContext(src + `\n;globalThis.__CFG = ${m[1]};`, sandbox, { filename: file, timeout: 5000 });
    return sandbox.__CFG || null;
}

/** Every box config in the tree, dispatch + arena + house labs. */
function boxConfigs() {
    const out = [];
    for (const base of ['dispatch/boxes', 'arena/boxes']) {
        const dir = path.join(APP, base);
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            const cfg = path.join(dir, name, 'config.js');
            if (fs.existsSync(cfg)) out.push({ name, area: base.split('/')[0], file: cfg });
        }
    }
    return ONLY ? out.filter(b => b.name === ONLY) : out;
}

// ── CANARY ──────────────────────────────────────────────────────────────────────────────
// HINT-001 re-implements BoxEngine's price expression. If the engine's line changes, this
// lint's mirror is stale and its verdicts are worthless — so say so loudly rather than keep
// reporting confidently against an expression that no longer exists.
const ENGINE_SRC = fs.readFileSync(ENGINE, 'utf8');
const PRICE_EXPR = 'const base = hint.penalty || scoring.hintPenalty || -50;';
const canaryOk = ENGINE_SRC.includes(PRICE_EXPR);
if (!canaryOk) {
    add('HIGH', 'CANARY-001', '(engine)',
        'BoxEngine hint-price expression changed; HINT-001 mirrors it and is now unverified',
        'expected: ' + PRICE_EXPR);
}

// Terminal.js builtins a box inherits for free, used by DOC-001.
const TERMINAL_SRC = fs.readFileSync(TERMINAL, 'utf8');
const BUILTINS = [...TERMINAL_SRC.matchAll(/case '([a-z0-9_-]+)':/g)].map(m => m[1]);

/** Walkthrough text for a box, if one exists, for DOC-001. */
function walkthroughText(box) {
    if (!fs.existsSync(SOLUTIONS)) return null;
    const stack = [SOLUTIONS];
    const key = box.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 8);
    while (stack.length) {
        const d = stack.pop();
        let entries = [];
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const e of entries) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) { stack.push(p); continue; }
            if (!e.name.endsWith('.md')) continue;
            if (e.name.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(key)) {
                try { return fs.readFileSync(p, 'utf8'); } catch (e2) { return null; }
            }
        }
    }
    return null;
}

for (const box of boxConfigs()) {
    let cfg;
    try { cfg = loadConfig(box.file); }
    catch (e) { add('LOW', 'PARSE-001', box.name, 'config could not be evaluated', e.message); continue; }
    if (!cfg) continue;

    const label = `${box.name} (${box.area})`;
    const commands = cfg.commands || {};
    const scoring = cfg.scoring || {};
    const isWindows = (cfg.terminal && cfg.terminal.promptStyle) === 'windows';

    // ── HINT-001 ────────────────────────────────────────────────────────────────────────
    // Mirror BoxEngine: base = hint.penalty || scoring.hintPenalty || -50. A hint with
    // penalty 0 is FALSY, so a free hint falls through to scoring.hintPenalty — and where
    // that is the boolean `true` the student is shown "(true pts)" and scored +1.
    const hintSets = [];
    if (Array.isArray(cfg.hints)) hintSets.push(cfg.hints);
    if (Array.isArray(cfg._defaultHints)) hintSets.push(cfg._defaultHints);
    if (cfg._scenarioHints) for (const k of Object.keys(cfg._scenarioHints)) {
        if (Array.isArray(cfg._scenarioHints[k])) hintSets.push(cfg._scenarioHints[k]);
    }
    const bad = [];
    for (const set of hintSets) {
        for (const h of set) {
            if (!h || typeof h !== 'object') continue;
            const base = h.penalty || scoring.hintPenalty || -50;
            if (typeof base !== 'number') bad.push(`${h.id || '?'} -> ${JSON.stringify(base)}`);
        }
    }
    if (bad.length) {
        add('HIGH', 'HINT-001', label,
            'hint price does not resolve to a number; the student sees it in the button label and it is added to the score',
            bad.slice(0, 4).join(', '));
    }

    // ── SHELL-001 ───────────────────────────────────────────────────────────────────────
    // A Windows box that overrides `dir` but not `cd` sends `cd` to Terminal.js's POSIX
    // builtin, which answers "cd: X: No such file or directory" — a bash error in a CMD sim.
    if (isWindows && typeof commands.dir === 'function' && typeof commands.cd !== 'function') {
        add('HIGH', 'SHELL-001', label,
            'Windows box overrides `dir` but not `cd`; `cd` falls through to the POSIX builtin and answers with a bash error');
    }

    // ── SHELL-002 ───────────────────────────────────────────────────────────────────────
    // Directories a hardcoded `dir` advertises must be reachable. If `dir` returns a literal
    // listing and the box has neither a `cd` override nor a filesystem containing them, the
    // shell names a thing and then refuses to open it.
    if (typeof commands.dir === 'function') {
        const src = commands.dir.toString();
        const advertised = [...src.matchAll(/<DIR>\s*\\?n?\s*([A-Za-z0-9_.-]+)/g)]
            .map(m => m[1]).filter(d => d !== '.' && d !== '..');
        if (advertised.length && typeof commands.cd !== 'function') {
            const fsRoot = (cfg.filesystem && cfg.filesystem['/']) || null;
            const children = (fsRoot && fsRoot.children) ? Object.keys(fsRoot.children) : [];
            const unreachable = advertised.filter(d => !children.includes(d));
            if (unreachable.length) {
                add('HIGH', 'SHELL-002', label,
                    '`dir` advertises directories that nothing can enter',
                    unreachable.slice(0, 5).join(', '));
            }
        }
    }

    // ── SHELL-003 ───────────────────────────────────────────────────────────────────────
    // Terminal.js treats a STRICT null return as "fall through to the builtin". A command
    // that returns bare null silently inherits the builtin's behaviour — or, when no builtin
    // matches, the bash-flavoured `<cmd>: command not found`. Return '' instead.
    for (const name of Object.keys(commands)) {
        const fn = commands[name];
        if (typeof fn !== 'function') continue;
        const src = fn.toString();
        // Only the unconditional trailing `return null` shape; a guarded null is legitimate.
        if (/return\s+null\s*;?\s*\}\s*$/.test(src) && !/if\s*\(/.test(src)) {
            add('HIGH', 'SHELL-003', label,
                `\`${name}\` returns bare null; Terminal.js reads that as "fall through to the builtin"`,
                BUILTINS.includes(name) ? `builtin '${name}' exists — inherits POSIX behaviour`
                                        : `no builtin '${name}' — prints "${name}: command not found"`);
        }
    }

    // ── DOC-001 ─────────────────────────────────────────────────────────────────────────
    // A walkthrough must not promise a command the box cannot answer.
    if (box.area === 'dispatch') {
        const wt = walkthroughText(box.name);
        if (wt) {
            /* Parse ONLY a table whose header column is literally "Command".
             *
             * The first version matched any `| \`token\`` at line start, which swept up the
             * scenario-id column of a completely different table -- it reported
             * cable_unplugged, dns_down and friends as "commands the box does not
             * implement" across ten boxes. Every one of those was noise, and a gate that
             * blocks a deploy on noise gets switched off, which is worse than not having
             * it. Anchor on the header, and require the cell to look like a command. */
            const promised = new Set();
            const lines = wt.split('\n');
            let inCommandTable = false;
            for (const line of lines) {
                if (/^\s*\|\s*Command\s*\|/i.test(line)) { inCommandTable = true; continue; }
                if (inCommandTable && !/^\s*\|/.test(line)) { inCommandTable = false; continue; }
                if (!inCommandTable) continue;
                const cell = line.match(/^\s*\|\s*`?([^|`]+)`?\s*\|/);
                if (!cell) continue;
                const first = cell[1].trim().split(/\s+/)[0].toLowerCase();
                // A command is a bare word: no underscores (those are ids), not a separator.
                if (/^[a-z][a-z0-9-]*$/.test(first)) promised.add(first);
            }
            const missing = [...promised].filter(c =>
                typeof commands[c] !== 'function' && !BUILTINS.includes(c));
            if (missing.length) {
                add('HIGH', 'DOC-001', label,
                    'walkthrough advertises commands the box does not implement',
                    missing.slice(0, 6).join(', '));
            }
        }
    }
}

// ── report ──────────────────────────────────────────────────────────────────────────────
const high = findings.filter(f => f.severity === 'HIGH');
const low = findings.filter(f => f.severity !== 'HIGH');

if (AS_JSON) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));
} else {
    console.log('=== box contract lint ===\n');
    const byRule = {};
    for (const f of findings) (byRule[f.rule] = byRule[f.rule] || []).push(f);
    for (const rule of Object.keys(byRule).sort()) {
        const list = byRule[rule];
        console.log(`${rule}  (${list.length})  ${list[0].severity}`);
        console.log(`  ${list[0].message}`);
        for (const f of list.slice(0, 8)) {
            console.log(`    - ${f.box}${f.detail ? '  [' + f.detail + ']' : ''}`);
        }
        if (list.length > 8) console.log(`    ... and ${list.length - 8} more`);
        console.log('');
    }
    console.log(`${high.length} HIGH, ${low.length} LOW`);
}

/* ── BASELINE ────────────────────────────────────────────────────────────────────────────
 * There are pre-existing HIGH findings across the estate (tasks 373 / 374 / 378), so a gate
 * that blocks on the total count would fail every deploy from the moment it is wired in.
 * A gate that always fails gets bypassed, and a bypass flag is how a gate dies.
 *
 * So the gate blocks on NEW findings only, against a recorded baseline — the same shape as
 * the EduScan drift baseline the deploy already archives. The backlog stays visible in the
 * report and on the taskboard; what cannot happen is a NEW box shipping with a defect of a
 * class we have already paid to learn about.
 *
 * --update-baseline rewrites the record. Doing that to silence a real regression is the
 * lazy path; it exists for when a finding has genuinely been FIXED, so the count drops.
 */
const BASELINE = path.join(ROOT, '_tools/reports/BOX_CONTRACT_BASELINE.json');
const key = f => `${f.rule}::${f.box}`;
const nowKeys = high.map(key).sort();

if (argv.includes('--update-baseline')) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify({
        recordedAt: new Date().toISOString(),
        note: 'Known HIGH findings at the time the gate was wired in. New findings block a deploy; these are tracked as tasks 373/374/378.',
        keys: nowKeys
    }, null, 2));
    console.log(`\nbaseline updated: ${nowKeys.length} known findings recorded`);
    process.exit(canaryOk ? 0 : 2);
}

if (!canaryOk) {
    console.log('\nCANARY BROKEN — the engine expression HINT-001 mirrors has changed.');
    process.exit(2);
}

let known = [];
if (fs.existsSync(BASELINE)) {
    try { known = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).keys || []; } catch (e) { known = []; }
}
const knownSet = new Set(known);
const introduced = nowKeys.filter(k => !knownSet.has(k));
const fixed = known.filter(k => !nowKeys.includes(k));

if (fixed.length) console.log(`\n${fixed.length} baseline finding(s) no longer present — run --update-baseline to bank that.`);

if (introduced.length) {
    console.log(`\nNEW findings not in the baseline (${introduced.length}) — these block:`);
    for (const k of introduced) console.log('  - ' + k);
    process.exit(1);
}

console.log(`\nno new findings (${known.length} known, tracked as tasks 373/374/378)`);
process.exit(0);
