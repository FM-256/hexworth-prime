#!/usr/bin/env node
/**
 * EduScan — Box Engine API Correctness Lint (BOX-003)
 *
 * Static lint for box configs that call BoxEngine API methods or access
 * BoxEngine state properties that do NOT exist on the engine.
 *
 * Why this rule matters:
 *   During PIS-FINAL build (2026-05-22), the interactive-code-architect
 *   subagent self-caught two bugs during post-write review:
 *
 *     "Line 1501: engine.subtractPoints(40) — method does not exist on
 *      BoxEngine. Replaced with engine.addScore(-40, 'Wrong patch action')."
 *     "Line 2020: engine.submittedFlags || {} — BoxEngine tracks flag
 *      state as engine.state.flagsFound (array), not a keyed object."
 *
 *   Both were silent failures — the calls would have thrown TypeError at
 *   runtime ("engine.subtractPoints is not a function") visible only in
 *   the browser console while students experienced unexplained behavior.
 *
 *   It did NOT prevent that class of bug, and on 2026-09-12 the same class
 *   shipped again: engine.resetLab() was called by 46 box configs, has never
 *   existed on BoxEngine, and the "Reset Lab" desktop icon was dead in every
 *   one of them — student confirms, TypeError, nothing happens. This lint
 *   passed all 46, because KNOWN_INVALID is a DENYLIST of names already known
 *   to be wrong. A denylist catches nothing new BY CONSTRUCTION: a name has to
 *   have already hurt someone before it can be on the list.
 *
 *   Task 384. The fix is the shape SHELL-004 uses in box-contract-lint.js —
 *   derive the truth from the engine instead of enumerating it by hand. The
 *   valid member set is now READ OUT OF BoxEngine.js at run time (evaluated in
 *   a vm, plus a scan for `this.X =` assignments), so any engine.<name> the
 *   engine does not actually have is a finding whether or not anyone has seen
 *   it before. KNOWN_INVALID is kept because it carries a specific "use this
 *   instead" suggestion the allowlist cannot infer.
 *
 *   KNOWN LIMITATION — the ownAssigned exemption. A config that writes
 *   `engine.someName = ...` anywhere in the file has `someName` treated as
 *   box-local state for the rest of that file, because boxes legitimately park
 *   their own state on the engine object. That is also, unavoidably, a one-line
 *   way to silence a genuine typo. No box does this today (checked). It is
 *   named here rather than left implicit so the next person reads it as a known
 *   hole and not as a discovery.
 *
 * Issue codes:
 *   BOX-003-NONEXISTENT-API     Config calls engine.<name> where <name>
 *                               is in the known-invalid list. Severity: HIGH.
 *   BOX-003-UNKNOWN-API         Config calls engine.<name> where <name> is not
 *                               a member of BoxEngine at all, and the box does
 *                               not assign it itself. Severity: HIGH.
 *   BOX-003-SUSPICIOUS-API      Config calls engine.<name> where <name>
 *                               is uncommon — possible typo. Severity: MEDIUM.
 *
 * Read-only. No edits.
 *
 * Usage:
 *   node _tools/eduscan/box-engine-api-lint.js [--report-only] [--update-baseline]
 *   node _tools/eduscan/box-engine-api-lint.js --self-test
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_ENGINE_API_LINT.json');

const REPORT_ONLY = process.argv.includes('--report-only');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const SELF_TEST = process.argv.includes('--self-test');
const ENGINE_FILE = path.join(APP_DIR, 'arena/engine/BoxEngine.js');
const BASELINE = path.join(REPORTS_DIR, 'BOX_ENGINE_API_BASELINE.json');

// Known-invalid: names that look like API calls but aren't, with a
// specific real-method suggestion. Updates as new mistakes are discovered.
const KNOWN_INVALID = {
    'subtractPoints':    { suggest: 'addScore(<negative>)', reason: 'method does not exist; use addScore(-N, reason)' },
    'submittedFlags':    { suggest: 'state.flagsFound',     reason: 'flag-capture state is engine.state.flagsFound (array), not engine.submittedFlags' },
    'addPoints':         { suggest: 'addScore(<positive>)', reason: 'method does not exist; use addScore(+N, reason)' },
    'awardPoints':       { suggest: 'addScore(<positive>)', reason: 'method does not exist; use addScore(N, reason)' },
    'incrementScore':    { suggest: 'addScore(<delta>)',    reason: 'method does not exist; use addScore(delta, reason)' },
    'penalize':          { suggest: 'addScore(<negative>)', reason: 'method does not exist; use addScore(-N, reason)' },
    'completeFlag':      { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'captureFlag':       { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'grantFlag':         { suggest: 'awardFlag(<flagId>)',  reason: 'method does not exist; use awardFlag(flagId)' },
    'completionLogs':    { suggest: '_logEvent("complete", ...)', reason: 'no such property; use engine._logEvent for event log' },
    'getScore':          { suggest: 'state.score',          reason: 'access engine.state.score directly' },
    'setScore':          { suggest: 'addScore(<delta>)',    reason: 'use relative addScore; absolute setter is not exposed' }
};

// Suspicious list: emptied after initial run revealed the entries below were
// all false positives:
//   - engine.reset: valid BoxEngine method (line 481 of BoxEngine.js)
//   - engine.log: filename in simulated filesystem (e.g., F1 box has
//     /var/log/veritas/engine.log entry), not an engine method call
//   - engine.py: filename in simulated filesystem (Python file refs),
//     not an engine method call
// Keep SUSPICIOUS empty until a real recurring false-negative pattern emerges.
const SUSPICIOUS = {};


/* ── THE ALLOWLIST, DERIVED FROM THE ENGINE ───────────────────────────────────────────
 * Object.keys() of the evaluated BoxEngine literal, plus every `this.X =` the engine
 * assigns at run time (e.g. _coOpMode, _userEngaged) which the literal does not declare.
 *
 * Evaluated in a vm with no DOM: BoxEngine.js is a bare object literal with no load-time
 * side effects, so nothing executes but the literal itself.
 */
function deriveEngineMembers() {
    /* Every failure here must return null so checkCanary reports "gate broken" (exit 2).
     * Letting the throw escape exited 1 instead — which is the code for "findings block",
     * so a syntactically broken engine would have looked like a box defect. An exit code
     * that misreports WHY it failed sends the next person to the wrong file. */
    let src, sandbox;
    try {
        src = fs.readFileSync(ENGINE_FILE, 'utf8');
        sandbox = { window: {}, console: { log() {}, warn() {}, error() {} }, navigator: {} };
        vm.createContext(sandbox);
        vm.runInContext(src + '\n;globalThis.__BE = (typeof BoxEngine !== "undefined") ? BoxEngine : null;',
                        sandbox, { timeout: 10000 });
    } catch (e) {
        return null;
    }
    if (!sandbox.__BE || typeof sandbox.__BE !== 'object') return null;
    const set = new Set(Object.keys(sandbox.__BE));
    let m;
    const re = /this\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
    while ((m = re.exec(src)) !== null) set.add(m[1]);

    /* MIXINS. BoxEngine is not only what BoxEngine.js declares: other engine files bolt
     * members onto it at load time. BlueTeam.js:1647 does `BoxEngine._launchApp = ...`,
     * and it is loaded by 12 box pages. That one is currently harmless because
     * _launchApp is also in the literal — but the day a mixin adds a NEW capability and a
     * box calls it, this gate would fire on a real, working call and block the deploy.
     * A gate that blocks correct work is how a gate gets bypassed, so scan the whole
     * engine directory for `BoxEngine.X =` rather than only the main file.
     * (Nancy, task 384 review: named as a latent false positive, fixed rather than noted.) */
    try {
        const dir = path.dirname(ENGINE_FILE);
        for (const f of fs.readdirSync(dir)) {
            if (!f.endsWith('.js') || f === path.basename(ENGINE_FILE)) continue;
            const txt = fs.readFileSync(path.join(dir, f), 'utf8');
            const mr = /(?<![_$\w])BoxEngine\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
            let mm;
            while ((mm = mr.exec(txt)) !== null) set.add(mm[1]);
        }
    } catch (e) { /* a missing sibling is not a reason to fail the whole gate */ }

    return set;
}

/* CANARY. A derivation that silently returns the wrong set makes this gate useless in one
 * of two ways: too small and it screams about every valid call until someone bypasses it,
 * too large and it goes quietly blind — which is exactly the failure mode that let
 * resetLab through for months. So the derived set must contain members we KNOW exist. If
 * it does not, the gate refuses to render a verdict at all rather than report "clean".
 */
const CANARY_MEMBERS = ['init', 'state', 'config', 'load', 'save', 'reset', 'addScore', 'awardFlag', 'notify'];

function checkCanary(valid) {
    if (!valid) return { ok: false, why: 'BoxEngine did not evaluate to an object' };
    const missing = CANARY_MEMBERS.filter(k => !valid.has(k));
    if (missing.length) return { ok: false, why: 'derived set is missing known members: ' + missing.join(', ') };
    if (valid.size < 50) return { ok: false, why: 'derived set implausibly small (' + valid.size + ')' };
    return { ok: true };
}

function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) stack.push(path.join(d, e.name));
        }
        const files = entries.filter(e => e.isFile()).map(e => e.name);
        if (files.includes('index.html') && files.includes('config.js')) {
            try {
                const idx = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
                if (/BoxEngine\.init/.test(idx)) {
                    out.push({
                        boxName: path.basename(d),
                        relDir: path.relative(ROOT, d) + path.sep,
                        configFile: path.join(d, 'config.js')
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

function lintConfig(content, valid) {
    const findings = [];
    /* Names the BOX ITSELF assigns onto engine (engine._fileTree = ..., engine.state.x = ...)
     * are box-local state the engine is not expected to declare. Flagging those would be
     * the detector keyed on the wrong surface: they are created, not called. */
    const ownAssigned = new Set();
    let a;
    const assignRe = /(?<![_$\w])engine\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
    while ((a = assignRe.exec(content)) !== null) ownAssigned.add(a[1]);
    // Match engine.<name>( or engine.<name> when accessed as property
    // The negative lookbehind (?<![_$\w]) prevents matching things like
    // myEngine.X — only "engine.X" exactly.
    const re = /(?<![_$\w])engine\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let m;
    const counts = {};
    while ((m = re.exec(content)) !== null) {
        const name = m[1];
        counts[name] = (counts[name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(counts)) {
        if (KNOWN_INVALID[name]) {
            findings.push({
                type: 'invalid',
                code: 'BOX-003-NONEXISTENT-API',
                severity: 'high',
                accessName: name,
                count,
                suggest: KNOWN_INVALID[name].suggest,
                reason: KNOWN_INVALID[name].reason
            });
        } else if (valid && !valid.has(name) && !ownAssigned.has(name)) {
            findings.push({
                type: 'unknown',
                code: 'BOX-003-UNKNOWN-API',
                severity: 'high',
                accessName: name,
                count,
                suggest: null,
                reason: 'BoxEngine has no member "' + name + '"; the call is a silent no-op or a TypeError'
            });
        } else if (SUSPICIOUS[name]) {
            findings.push({
                type: 'suspicious',
                code: 'BOX-003-SUSPICIOUS-API',
                severity: 'medium',
                accessName: name,
                count,
                reason: SUSPICIOUS[name].reason
            });
        }
    }
    return findings;
}

function main() {
    const startMs = Date.now();

    const valid = deriveEngineMembers();
    const canary = checkCanary(valid);
    if (!canary.ok) {
        console.error('BOX-003 CANARY BROKEN: ' + canary.why);
        console.error('Refusing to report a verdict — a wrong allowlist makes this gate blind.');
        process.exit(2);
    }

    if (SELF_TEST) {
        /* Proves the gate can still FAIL. A rule nobody has watched fail is a rule you are
         * trusting, not one you have tested. Injects a name the engine cannot have and
         * requires a finding; then re-checks a real member produces none. */
        const bogus = lintConfig('engine.__surelyNotAMember_384(); engine.notify("x");', valid);
        const caughtBogus = bogus.some(f => f.accessName === '__surelyNotAMember_384' && f.code === 'BOX-003-UNKNOWN-API');
        const quietOnReal = !bogus.some(f => f.accessName === 'notify');
        const assignedOk = lintConfig('engine._boxLocal = 1; engine._boxLocal.push(2);', valid)
            .every(f => f.accessName !== '_boxLocal');
        console.log('self-test: detects unknown member   : ' + (caughtBogus ? 'PASS' : 'FAIL'));
        console.log('self-test: silent on a real member  : ' + (quietOnReal ? 'PASS' : 'FAIL'));
        console.log('self-test: silent on box-assigned   : ' + (assignedOk ? 'PASS' : 'FAIL'));
        console.log('self-test: derived member count     : ' + valid.size);
        process.exit(caughtBogus && quietOnReal && assignedOk ? 0 : 1);
    }

    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        let content;
        try { content = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ boxName: box.boxName, class: 'unreadable', severity: 'medium' });
            continue;
        }
        const findings = lintConfig(content, valid);
        if (findings.length === 0) {
            verdicts.push({ boxName: box.boxName, relDir: box.relDir, class: 'clean', severity: null });
        } else {
            const hasHigh = findings.some(f => f.severity === 'high');
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'has-findings',
                severity: hasHigh ? 'high' : 'medium',
                findings
            });
        }
    }

    const high = verdicts.filter(v => v.severity === 'high');
    const medium = verdicts.filter(v => v.severity === 'medium' && v.class !== 'unreadable');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-engine-api-lint',
        validatorCode: 'BOX-003',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        engineMembersDerived: valid.size,
        knownInvalidList: Object.keys(KNOWN_INVALID),
        suspiciousList: Object.keys(SUSPICIOUS),
        totals: {
            boxesScanned: boxes.length,
            clean: verdicts.filter(v => v.class === 'clean').length,
            high: high.length,
            medium: medium.length,
            durationMs: Date.now() - startMs
        },
        findings: verdicts.filter(v => v.severity !== null && v.class !== 'unreadable'),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-engine-api-lint (BOX-003)');
    console.log('==============================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Clean:                   ' + (boxes.length - high.length - medium.length));
    console.log('  HIGH (invalid API):      ' + high.length);
    console.log('  MEDIUM (suspicious):     ' + medium.length);
    console.log('  Engine members derived:  ' + valid.size + ' (from ' + path.relative(ROOT, ENGINE_FILE) + ')');
    console.log('  Known-invalid list size: ' + Object.keys(KNOWN_INVALID).length);
    console.log('  Suspicious list size:    ' + Object.keys(SUSPICIOUS).length);
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (high.length > 0) {
        console.log('---');
        console.log('HIGH — nonexistent API calls:');
        high.forEach(v => {
            v.findings.filter(f => f.severity === 'high').forEach(f => {
                console.log('  ' + v.boxName + ' uses engine.' + f.accessName + ' (' + f.count + 'x) — ' + f.reason);
                // Allowlist findings carry no suggestion — the engine simply has no such
                // member, and there is nothing to recommend in its place. Printing it
                // unconditionally emitted "suggest: engine.null" 79 times per run.
                if (f.suggest) console.log('    suggest: engine.' + f.suggest);
            });
        });
    }
    if (medium.length > 0) {
        console.log('---');
        console.log('MEDIUM — suspicious API calls:');
        medium.forEach(v => {
            v.findings.filter(f => f.severity === 'medium').forEach(f => {
                console.log('  ' + v.boxName + ' uses engine.' + f.accessName + ' (' + f.count + 'x) — ' + f.reason);
            });
        });
    }

    /* ── BASELINE ────────────────────────────────────────────────────────────────────
     * The allowlist finds pre-existing calls the denylist never could (engine.advancePhase
     * in 71 boxes, among others). Blocking on the total would fail every deploy from the
     * moment this lands, and a gate that always fails gets bypassed — a bypass flag is how
     * a gate dies. So: block on NEW findings only, same shape as box-contract-lint.js.
     * The backlog stays visible in the report and on the taskboard.
     *
     * --update-baseline exists for when a finding is genuinely FIXED and the count drops.
     * Running it to silence a regression is the lazy path.
     */
    const key = v => v.findings.filter(f => f.severity === 'high')
                               .map(f => f.code + '::' + v.boxName + '::' + f.accessName);
    const nowKeys = high.flatMap(key).sort();

    if (UPDATE_BASELINE) {
        fs.writeFileSync(BASELINE, JSON.stringify({
            recordedAt: new Date().toISOString(),
            note: 'Known HIGH engine-API findings when the derived allowlist was wired in (task 384).',
            keys: nowKeys
        }, null, 2));
        console.log('\nbaseline updated: ' + nowKeys.length + ' known finding(s) recorded');
        process.exit(0);
    }

    let known = [];
    if (fs.existsSync(BASELINE)) {
        try { known = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).keys || []; } catch (e) { known = []; }
    }
    const knownSet = new Set(known);
    const introduced = nowKeys.filter(k => !knownSet.has(k));
    const fixed = known.filter(k => !nowKeys.includes(k));

    if (fixed.length) console.log('\n' + fixed.length + ' baseline finding(s) no longer present — run --update-baseline to bank that.');

    if (introduced.length) {
        console.log('\nNEW findings not in the baseline (' + introduced.length + ') — these block:');
        introduced.forEach(k => console.log('  - ' + k));
        if (REPORT_ONLY) process.exit(0);
        process.exit(1);
    }

    console.log('\nno new findings (' + known.length + ' known, baselined)');
    process.exit(0);
}

main();
