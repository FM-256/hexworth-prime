#!/usr/bin/env node
/**
 * EduScan — Box Recoverable-Action Audit (BOX-007)
 *
 * Detects configs that levy penalties (`engine.addScore(<negative>, ...)`)
 * for player actions but provide NO undo/reset/revert path. This is the
 * soft-lock-risk class — student takes a wrong action, pays the penalty,
 * but cannot recover from the wrong state.
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 1 (2026-05-21) BLOCK finding:
 *
 *     "Phase 6 patch re-application state is unspecified. If a student
 *      applies the wrong CVE first (CVE-2024-21412), the walkthrough
 *      doesn't specify whether they can re-apply the correct one
 *      without a state reset. If the engine's patch dashboard does
 *      not offer 're-apply a different patch after you've already
 *      applied one', a student who applies CVE-2024-21412 first may
 *      be locked in a state where:
 *        - CVE-2024-21412 is already patched (cost -40)
 *        - CVE-2022-30190 is still present (Rapid7 scan fails)
 *        - The patch dashboard may not offer CVE-2022-30190 as
 *          re-patchable
 *        → SOFT-LOCK. Student stuck on phase, has spent points, can't
 *          progress."
 *
 *   The fix added an Undo / Re-evaluate button to the patch dashboard,
 *   plus an `undo_patch` action handler that reverses applied state.
 *
 * Detection heuristic:
 *   1. Find configs with `engine.addScore(<negative>, ...)` calls.
 *   2. For each such config, look for ANY undo/reset/revert mechanism:
 *      - action handler key matching /^(undo|reset|revert|clear|remove|delete)_/
 *      - `data.action === 'undo*'` or similar branch in a form handler
 *      - `_db.<state>.undone` or similar undone-tracker array
 *      - `_handle.*Undo` or `_handle.*Reset` method on config
 *   3. If penalty present but no reverse path → finding.
 *
 * Issue codes:
 *   BOX-007-NO-RECOVERY    Config has penalty actions but no detectable
 *                          undo/reset/revert handler. Soft-lock risk.
 *                          Severity: HIGH.
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_RECOVERABLE_ACTION_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Penalty pattern: engine.addScore(<negative>, ...) with literal negative number
const PENALTY_RE = /engine\.addScore\s*\(\s*-\d+/g;

// Recovery patterns — any one of these means the config has some
// reverse-action mechanism. Operator review still recommended to confirm
// the recovery actually undoes the SAME state mutation that triggered
// the penalty.
const RECOVERY_PATTERNS = [
    /['"](?:undo|reset|revert|clear|remove|delete)_[\w]+['"]/i,
    /(?:_handle\w*|action\s*===?\s*['"])(?:undo|reset|revert|clear)/i,
    /\.undone\s*\.\s*push/,                  // _db.<state>.undone.push(cve) pattern
    /\.applied\s*\.\s*splice/,                // splice/pop removal pattern
    /resetState\s*[:=]/,                      // explicit resetState (handles full lab reset)
    /_applyScenario\s*[:=]/                   // dispatch boxes re-init on scenario selection
];

const SELF_VALIDATION = {
    // PIS-FINAL has Undo button + undo_patch handler + db.patch_state.undone tracker
    'pis-final-patient-zero': { expectFindings: false, reason: 'Phase 6 Undo path added Nancy round 1' }
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
                        configFile: path.join(d, 'config.js'),
                        relDir: path.relative(ROOT, d) + path.sep
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
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
        // Count penalties
        const penaltyMatches = content.match(PENALTY_RE) || [];
        if (penaltyMatches.length === 0) {
            verdicts.push({ boxName: box.boxName, class: 'no-penalties', severity: null });
            continue;
        }

        // Check for recovery mechanism
        const recoveryHits = [];
        for (const pat of RECOVERY_PATTERNS) {
            const m = content.match(pat);
            if (m) recoveryHits.push(pat.toString());
        }

        if (recoveryHits.length > 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'recovery-present',
                severity: null,
                penaltyCount: penaltyMatches.length,
                recoveryHits
            });
        } else {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'no-recovery',
                severity: 'high',
                code: 'BOX-007-NO-RECOVERY',
                penaltyCount: penaltyMatches.length,
                message: `${penaltyMatches.length} penalty action(s) detected (engine.addScore with negative delta) but no undo/reset/revert handler found. Soft-lock risk if penalty causes student to enter a stuck state.`,
                fix: `Add an undo path: action handler key like 'undo_<state>', or _db.<state>.undone tracker, or resetState() / _applyScenario() that clears the penalized state on student request.`
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
        const hasFindings = v.class === 'no-recovery';
        if (hasFindings !== exp.expectFindings) {
            selfFailures.push({
                box,
                reason: 'mismatch',
                expectFindings: exp.expectFindings,
                got: v.class,
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

    const findings = verdicts.filter(v => v.class === 'no-recovery');
    const safe = verdicts.filter(v => v.class === 'recovery-present');
    const none = verdicts.filter(v => v.class === 'no-penalties');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-recoverable-action-audit',
        validatorCode: 'BOX-007',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        totals: {
            boxesScanned: boxes.length,
            noPenalties: none.length,
            recoveryPresent: safe.length,
            noRecovery: findings.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-recoverable-action-audit (BOX-007)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  No penalties (N/A):      ' + none.length);
    console.log('  Recovery present:        ' + safe.length);
    console.log('  NO recovery (HIGH):      ' + findings.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (findings.length > 0) {
        console.log('---');
        console.log('NO recovery (' + findings.length + ' boxes):');
        findings.slice(0, 15).forEach(v => {
            console.log('  ' + v.boxName + ' (' + v.penaltyCount + ' penalty calls)');
        });
        if (findings.length > 15) console.log('  ... and ' + (findings.length - 15) + ' more');
    }

    if (REPORT_ONLY || findings.length === 0) process.exit(0);
    process.exit(1);
}

main();
