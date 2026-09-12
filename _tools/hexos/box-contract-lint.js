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
        window: {},
        // Silenced: several configs log at load, and in --json mode that text landed in the
        // middle of the JSON document and made the output unparseable.
        console: { log() {}, warn() {}, error() {}, info() {}, debug() {} },
        document: { createElement: () => ({ set textContent(v) { this.innerHTML = v; }, innerHTML: '' }) },
        BoxEngine: { requestFlagText: async () => 'flag{x}', getDeliveredFlag: () => 'flag{x}' },
        navigator: { userAgent: '' }, location: { href: '' }
    };
    vm.createContext(sandbox);
    /* Boxes declare their config in THREE forms, measured across the tree:
     *     const <Name>Config = {     189 boxes
     *     var   <Name>Config = {      84 boxes
     *     window.<Name>Config = {     20 boxes
     * Matching only `const` silently skipped 105 of 293 configs — every house lab among
     * them — and a skipped config contributes no findings, so the gate reported a clean
     * sweep over boxes it had never opened. A detector that cannot parse its subject
     * reports agreement, which is the most dangerous way to be wrong. */
    const m = src.match(/(?:^|\n)\s*(?:const|var|let)\s+([A-Za-z0-9_]*Config)\s*=\s*\{/)
           || src.match(/(?:^|\n)\s*window\.([A-Za-z0-9_]*Config)\s*=\s*\{/);
    if (!m) return null;
    const ref = /window\./.test(m[0]) ? `window.${m[1]}` : m[1];
    vm.runInContext(src + `\n;globalThis.__CFG = ${ref};`, sandbox, { filename: file, timeout: 5000 });
    return sandbox.__CFG || null;
}

/**
 * Every box config in the tree: dispatch, arena AND the house labs.
 *
 * The house labs (under _app/houses, any depth, path containing /labs/ — dark-arts CEH,
 * shield security-plus and infosec-PIS, matrix adv-linux) load the SAME shared
 * BoxEngine.js and 38 of them carry `hintPenalty: true`. An earlier version of this
 * function walked only dispatch and arena while the docstring above it claimed house-lab
 * coverage — so ~62 boxes were permanently invisible to a gate whose stated purpose is
 * catching this class of defect, and the docstring vouched for a scope the code did not
 * have. Nancy caught it. Walk the tree, do not enumerate two roots and hope.
 */
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
    // House labs live at varying depths, so recurse rather than assume a shape.
    const housesRoot = path.join(APP, 'houses');
    const stack = fs.existsSync(housesRoot) ? [housesRoot] : [];
    while (stack.length) {
        const d = stack.pop();
        let entries = [];
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const e of entries) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) { stack.push(p); continue; }
            if (e.name !== 'config.js') continue;
            if (!/[\\/]labs[\\/]/.test(p)) continue;
            out.push({ name: path.basename(path.dirname(p)), area: 'houses', file: p });
        }
    }
    return ONLY ? out.filter(b => b.name === ONLY) : out;
}

// ── CANARY ──────────────────────────────────────────────────────────────────────────────
// HINT-001 re-implements BoxEngine's price expression. If the engine's line changes, this
// lint's mirror is stale and its verdicts are worthless — so say so loudly rather than keep
// reporting confidently against an expression that no longer exists.
const ENGINE_SRC = fs.readFileSync(ENGINE, 'utf8');

/* THE MIRROR MUST TRACK WHICHEVER ENGINE IT IS ACTUALLY LOOKING AT.
 *
 * Pinning ONE expression made this gate unusable on any tree where that exact line was not
 * present. It pinned task 378's `??` rewrite, which lives on a separate unmerged branch —
 * so on master and on this branch the canary fired, the lint exited 2, and because
 * deploy.sh's gate loop treats ANY non-zero exit as a hard failure, wiring this lint into
 * deploy.sh made `./deploy.sh` fail immediately. I called that exit "by design" and never
 * ran it through the wrapper I had modified in the same commit; Chris did, and it printed
 * DEPLOY BLOCKED. A gate that cannot be shipped past is not a gate, it is an outage.
 *
 * So the known pricing expressions are listed, newest first, each with the mirror that
 * matches it. CANARY-001 now fires only when the engine matches NONE of them — a genuinely
 * unknown expression, which is the case the canary was always meant to catch. */
const PRICE_VARIANTS = [
    {
        id: 'guarded',            // task 378 and later
        expr: 'const raw = hint.penalty ?? this._scoringHintPenalty(scoring);',
        price: function (h, scoring) {
            const cfgRaw = scoring.hintPenalty;
            const cfgPen = (typeof cfgRaw === 'number' && isFinite(cfgRaw)) ? cfgRaw : -50;
            const raw = (h.penalty !== undefined && h.penalty !== null) ? h.penalty : cfgPen;
            return (typeof raw === 'number' && isFinite(raw)) ? raw : -50;
        }
    },
    {
        id: 'legacy-or',          // before 378: `0` is falsy and falls through
        expr: 'const base = hint.penalty || scoring.hintPenalty || -50;',
        price: function (h, scoring) {
            return h.penalty || scoring.hintPenalty || -50;
        }
    }
];

const VARIANT = PRICE_VARIANTS.find(function (v) { return ENGINE_SRC.includes(v.expr); }) || null;
const canaryOk = !!VARIANT;
if (!canaryOk) {
    add('HIGH', 'CANARY-001', '(engine)',
        'BoxEngine hint-price expression matches no known variant; HINT-001 is unverified',
        'known: ' + PRICE_VARIANTS.map(function (v) { return v.id; }).join(', '));
}

// Terminal.js builtins a box inherits for free, used by DOC-001.
const TERMINAL_SRC = fs.readFileSync(TERMINAL, 'utf8');
const BUILTINS = [...TERMINAL_SRC.matchAll(/case '([a-z0-9_-]+)':/g)].map(m => m[1]);

/* The REQUIRED surface for SHELL-004, read from Terminal.js rather than written here — a
 * hand-written enumeration is what let `id` leak fleet-wide unnoticed.
 *
 * Scoped to the BUILTIN DISPATCHER only, between its "// Built-in commands" marker and the
 * `default:` that closes it. A first version matched every `case '...'` in the file and
 * swept in awk/tr/wc/sort from the PIPELINE handler, which are a different surface reachable
 * only inside a pipe — so the rule demanded boxes override commands they never receive
 * directly, and reported 68 findings that were noise. (Those pipeline commands are arguably
 * the same defect class in a Windows shell; they are NOT covered here and are flagged
 * separately rather than silently folded in.) */
const _swStart = TERMINAL_SRC.indexOf('// Built-in commands');
const _swEnd = TERMINAL_SRC.indexOf('default:', _swStart);
const TERMINAL_BUILTINS = (_swStart > -1 && _swEnd > _swStart)
    ? [...TERMINAL_SRC.slice(_swStart, _swEnd).matchAll(/case '([a-z0-9_-]+)':/g)].map(m => m[1])
    : [];

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
    // MIRROR OF BoxEngine._getEffectiveHintPenalty. Must track it exactly; CANARY-001
    // above pins the engine's line so this cannot drift unnoticed. `??` consults the
    // fallback only for null/undefined, so an explicit `penalty: 0` means FREE; the
    // typeof guard means a non-numeric config can never be arithmetic'd into a score.
    const bad = [];
    for (const set of hintSets) {
        for (const h of set) {
            if (!h || typeof h !== 'object') continue;
            // Price it the way the engine in THIS tree prices it.
            const base = VARIANT ? VARIANT.price(h, scoring) : null;
            if (typeof base !== 'number' || !isFinite(base)) {
                bad.push(`${h.id || '?'} -> ${JSON.stringify(base)}`);
            }
        }
    }
    if (bad.length) {
        add('HIGH', 'HINT-001', label,
            'hint price does not resolve to a number; the student sees it in the button label and it is added to the score',
            bad.slice(0, 4).join(', '));
    }

    // HINT-002: the engine now refuses to use a non-numeric hintPenalty, so this is no
    // longer student-visible — but it is meaningless data sitting in the config, and the
    // next author to add a hint WITHOUT an explicit penalty inherits a silent -50 from a
    // field that reads like it configures something. LOW: worth cleaning, never blocking.
    if ('hintPenalty' in scoring && typeof scoring.hintPenalty !== 'number') {
        add('LOW', 'HINT-002', label,
            'scoring.hintPenalty is not a number; the engine ignores it and falls back to -50',
            'value: ' + JSON.stringify(scoring.hintPenalty));
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
        if (!/return\s+null\s*[;\n]/.test(src)) continue;

        /* THE DISCRIMINATOR IS THE BUILTIN, NOT AN `if`.
         *
         * The first version only flagged an UNCONDITIONAL trailing `return null` and
         * excluded any function containing `if (` ANYWHERE in its source. Chris proved that
         * hides real instances: c12-ghost-driver's `ps` returns null for every context but
         * two, with no `ps` builtin to catch it, so a student typing `ps` in the wrong
         * context gets the bash-flavoured "ps: command not found". The unrelated `if`
         * earlier in the function was doing all the hiding. Five such cases were invisible.
         *
         * Returning null is only ever LEGITIMATE as "defer to the builtin", which requires a
         * builtin of that name to exist. Where none does, ANY reachable null — conditional
         * or not — lands on Terminal.js's `default:` and prints a bash error inside the box.
         * So the rule keys on whether the fallthrough target exists. */
        if (!BUILTINS.includes(name)) {
            add('HIGH', 'SHELL-003', label,
                `\`${name}\` can return null and there is NO builtin to fall through to`,
                `Terminal.js prints "${name}: command not found"`);
        }
    }


    // ── SHELL-004 ───────────────────────────────────────────────────────────────────────
    // Every Terminal.js builtin a Windows-family box does not override is inherited, and
    // Terminal.js is a Linux shell. Measured before this rule: `id` answered
    // "uid=1000(Administrator) gid=1000(Administrator) groups=...,27(sudo)" in ALL 67
    // Windows-family boxes, and `find` returned GNU's exact error format.
    //
    // THE LIST IS DERIVED FROM Terminal.js, NOT WRITTEN HERE. The first version of this rule
    // carried a hand-written list of nine commands — the ones one box happened to block — and
    // Chris found `id` leaking fleet-wide precisely because it was not among them. A
    // hand-maintained enumeration guarantees a next variant; reading the engine's own switch
    // statement means adding a builtin there automatically extends coverage here.
    //
    // EXEMPT are the builtins whose inherited behaviour is already correct for that shell:
    // echo, help and exit exist in both; PowerShell additionally aliases clear (Clear-Host),
    // alias (Get-Alias) and history. Exempting them is a judgement, so it is stated in one
    // place and can be argued with, rather than buried in a regex.
    if (isWindows || (cfg.terminal && cfg.terminal.promptStyle) === 'powershell') {
        const ps = (cfg.terminal && cfg.terminal.promptStyle) === 'powershell';
        const EXEMPT = ps
            ? ['echo', 'help', 'exit', 'date', 'clear', 'alias', 'reset']
            : ['echo', 'help', 'exit', 'date', 'reset'];
        const required = TERMINAL_BUILTINS.filter(function (b) { return EXEMPT.indexOf(b) === -1; });
        const uncovered = required.filter(function (n) { return typeof commands[n] !== 'function'; });
        if (uncovered.length) {
            add('HIGH', 'SHELL-004', label,
                'Windows-family box inherits Linux builtins from Terminal.js for commands it does not override',
                'uncovered: ' + uncovered.join(', '));
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

/* ── report ──────────────────────────────────────────────────────────────────────────────
 * Wrapped in a function, and every exit now sets process.exitCode instead of calling
 * process.exit(). process.exit() TERMINATES BEFORE PENDING STDOUT WRITES FLUSH when stdout
 * is a pipe, which silently truncated the --json document mid-object at ~65KB. A gate whose
 * own report can be cut off without saying so is a gate you cannot trust the output of. */
function report() {
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
    process.exitCode = canaryOk ? 0 : 2;
    return;
}

if (!canaryOk) {
    /* Never in --json: it lands AFTER the document and makes it unparseable, so a consumer
     * piping this to a parser gets a syntax error instead of the warning. The finding is in
     * `findings` as CANARY-001, which is where a machine reader should look. This guard has
     * now been lost twice to a wholesale file copy from another branch — if it goes missing
     * again, the symptom is "Extra data" from json.load. */
    if (!AS_JSON) console.log('\nCANARY BROKEN — the engine expression HINT-001 mirrors has changed.');
    process.exitCode = 2;
    return;
}

let known = [];
if (fs.existsSync(BASELINE)) {
    try { known = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).keys || []; } catch (e) { known = []; }
}
const knownSet = new Set(known);
const introduced = nowKeys.filter(k => !knownSet.has(k));
const fixed = known.filter(k => !nowKeys.includes(k));

if (fixed.length && !AS_JSON) console.log(`\n${fixed.length} baseline finding(s) no longer present — run --update-baseline to bank that.`);

if (introduced.length) {
    if (!AS_JSON) {
        console.log(`\nNEW findings not in the baseline (${introduced.length}) — these block:`);
        for (const k of introduced) console.log('  - ' + k);
    }
    process.exitCode = 1;
    return;
}

if (!AS_JSON) console.log(`\nno new findings (${known.length} known, tracked as tasks 373/374/378)`);
}

report();
