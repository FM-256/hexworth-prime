#!/usr/bin/env node
/**
 * EduScan — Box State Reset Hook Audit (BOX-006)
 *
 * For configs that maintain MUTABLE config-side state (anything that
 * gets written-to after initial load and outlives a single page render),
 * require an explicit reset mechanism so state does not bleed across
 * student sessions when the config singleton is loaded once but reused.
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 2 (2026-05-21) BLOCK finding:
 *
 *     "The `_db` object is a singleton on the config literal — state
 *      persists across page navigations and between two students on the
 *      same browser session. If two students use the same browser
 *      profile, or if a student navigates away and returns, state from
 *      the previous session bleeds through. For an Eclipse-tier final
 *      practical exam, this could produce false completions or false
 *      blocks with no way for the student to reset."
 *
 *   The fix was a `resetState()` method on the config that BoxEngine
 *   could invoke on lab-init. Without this hook, a second student on
 *   a kiosk machine could see the first student's patch_state, mail
 *   filter rules, or Rapid7 scan results.
 *
 *   This rule catches boxes that have mutable state-bearing fields
 *   (typically `_db: { patch_state, mail_filter_state, scan_state }`
 *   or similar) but no reset hook.
 *
 *   Dispatch boxes implementing `_applyScenario(engine, idx)` get a free
 *   pass: that method re-initializes engine.state.* on each scenario
 *   selection, which functionally resets the box. PIS-FINAL-style boxes
 *   that DON'T have a scenario-selection re-init flow MUST have an
 *   explicit `resetState`.
 *
 * Issue codes:
 *   BOX-006-MISSING-RESET-STATE   Config has mutable _db / _state /
 *                                 _phaseState block with non-trivial
 *                                 initial values, but no resetState()
 *                                 method AND no _applyScenario fallback.
 *                                 Severity: HIGH.
 *
 * Detection logic per box:
 *   1. Find any top-level field whose name starts with `_` and is
 *      initialized to an object literal containing nested mutable
 *      structures (objects with default-zero/empty/false values that
 *      get mutated by form handlers or commands).
 *   2. If such state exists, check for `resetState:` method declared
 *      on the config, OR an `_applyScenario:` function (common in
 *      dispatch boxes — re-initializes engine.state.* per scenario).
 *   3. If neither, emit BOX-006-MISSING-RESET-STATE.
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-state-reset-audit.js [--report-only]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_STATE_RESET_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Config-level state field patterns. These names are conventional in
// BoxEngine configs for mutable-singleton state that persists across
// page lifecycle without explicit reset.
const STATE_FIELD_NAMES = ['_db', '_state', '_phaseState'];

// Reset mechanisms that satisfy the rule:
//   - `resetState:` declared as a config method
//   - `_applyScenario:` declared as a config method (re-initializes engine.state
//     on scenario selection — functionally equivalent for dispatch boxes)
const RESET_METHOD_PATTERNS = [
    /(^|[^_$])resetState\s*[:=]/m,           // resetState: function() {} OR resetState = ...
    /(^|[^_$])_applyScenario\s*[:=]/m,        // _applyScenario: function(engine, idx) {}
    /(^|[^_$])_initState\s*[:=]/m,            // alternative naming
    /(^|[^_$])_resetLab\s*[:=]/m              // alternative naming
];

const SELF_VALIDATION = {
    // PIS-FINAL added resetState in Nancy round 2 fix
    'pis-final-patient-zero':   { expectedFinding: null,                    reason: 'has resetState()' },
    // PIS-M2 uses _state phase tracking + commands — check what it does
    // (will be auto-discovered by the validator; this expectation may need
    // tightening once we see the result)
    // CTF Arena boxes typically don't have config-side mutable state — they
    // rely on engine.state which auto-resets
    'a1-ancient-ledger':        { expectedFinding: null,                    reason: 'no mutable config-side state' }
};

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

/**
 * Check if config has a top-level mutable state field that is actually
 * WRITTEN TO somewhere in the file (form handlers, command handlers,
 * or anywhere). Read-only scenario data (e.g., A1's _db.allocations
 * which is never assigned to) is NOT flagged as mutable state.
 *
 * Detection of "mutable":
 *   - The field name appears as the LHS of an assignment somewhere
 *     (e.g., `cfg._db.patch_state = ...`, `db.scan_state.result = ...`,
 *     `this._db.xxx = ...`, `<varname>.<state>.<sub> = ...`)
 *   - OR an array push/pop/splice on a nested path
 *
 * Returns list of detected MUTABLE state-field names.
 */
function detectStateFields(content) {
    const detected = [];
    for (const name of STATE_FIELD_NAMES) {
        const escName = name.replace(/[$]/g, '\\$');

        // First: must exist as a top-level field (declared in config object)
        const declRe = new RegExp(`^\\s{4}${escName}\\s*:\\s*[\\[\\{]`, 'm');
        if (!declRe.test(content)) continue;

        // Second: must be WRITTEN TO somewhere — assignment LHS or array mutation
        // Patterns:
        //   xxx._db.<sub> = ... (any prefix before _db)
        //   xxx._db.<sub>.<sub2> = ...
        //   xxx._db.<sub>.push/pop/splice/shift/unshift(
        //   _db.<sub> = ...  (bare reference, unusual but possible)
        const mutationRe = new RegExp(
            `[\\w.]*${escName}\\.[\\w.\\[\\]]+\\s*(?:=[^=]|\\.(?:push|pop|splice|shift|unshift)\\s*\\()`,
            'g'
        );
        if (mutationRe.test(content)) {
            detected.push(name);
        }
    }
    return detected;
}

/**
 * Check if config has any reset/init mechanism for state.
 * Returns the list of matched mechanisms (e.g., ['resetState'], ['_applyScenario']).
 */
function detectResetMechanisms(content) {
    const found = [];
    for (const pattern of RESET_METHOD_PATTERNS) {
        const m = content.match(pattern);
        if (m) {
            // Extract the method name from the matched text
            const nameMatch = m[0].match(/(?:resetState|_applyScenario|_initState|_resetLab)/);
            if (nameMatch && !found.includes(nameMatch[0])) {
                found.push(nameMatch[0]);
            }
        }
    }
    return found;
}

function main() {
    const startMs = Date.now();
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

        const stateFields = detectStateFields(content);
        const resetMechanisms = detectResetMechanisms(content);

        if (stateFields.length === 0) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'no-state',
                severity: null,
                note: 'No config-side mutable state detected. Rule N/A.'
            });
        } else if (resetMechanisms.length > 0) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'reset-present',
                severity: null,
                stateFields,
                resetMechanisms
            });
        } else {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'missing-reset',
                severity: 'high',
                code: 'BOX-006-MISSING-RESET-STATE',
                stateFields,
                message: `Config has mutable state field(s) [${stateFields.join(', ')}] but no resetState() or _applyScenario() method. Session-state will bleed across student sessions when the config singleton is reused.`,
                fix: `Add a resetState() method that re-initializes the state fields to their default values. BoxEngine should call this on lab-init.`
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not discovered' });
            continue;
        }
        const actual = v.code || null;
        if (actual !== exp.expectedFinding) {
            selfFailures.push({
                box,
                reason: 'verdict mismatch',
                expected: exp.expectedFinding,
                got: actual,
                note: exp.reason,
                detail: v
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const missing = verdicts.filter(v => v.class === 'missing-reset');
    const present = verdicts.filter(v => v.class === 'reset-present');
    const noState = verdicts.filter(v => v.class === 'no-state');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-state-reset-audit',
        validatorCode: 'BOX-006',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            noState: noState.length,
            resetPresent: present.length,
            missingReset: missing.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: verdicts.filter(v => v.severity !== null),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-state-reset-audit (BOX-006)');
    console.log('================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  No state (N/A):          ' + noState.length);
    console.log('  Reset mechanism present: ' + present.length);
    console.log('  MISSING reset:           ' + missing.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (missing.length > 0) {
        console.log('---');
        console.log('MISSING reset state (' + missing.length + ' boxes):');
        missing.slice(0, 15).forEach(v => {
            console.log('  ' + v.boxName + ' (state: ' + v.stateFields.join(', ') + ')');
        });
        if (missing.length > 15) console.log('  ... and ' + (missing.length - 15) + ' more');
    }

    if (REPORT_ONLY || missing.length === 0) process.exit(0);
    process.exit(1);
}

main();
