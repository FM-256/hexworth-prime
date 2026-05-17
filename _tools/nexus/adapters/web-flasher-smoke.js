#!/usr/bin/env node
'use strict';

const path = require('path');

/**
 * Web Flasher Server-Smoke Spoke Adapter
 *
 * Wraps functions/_smoke_web_flasher_cf.js (38 assertions exercising
 * c2RequestStudentPairingCode + c2RegisterWithCode + c2DecommissionDevice
 * + c2Dispatch admin gate + Firestore rules for c2_devices,
 * c2_pairing_codes, student_pairing_state).
 *
 * Findings emit with `transient: true` so they do NOT pollute the
 * _triage_queue (smoke flakes are not sprint items), but they DO
 * count toward deploy-gate severity (a real backend regression CAN
 * block a deploy).
 *
 * Severity per assertion category (set in the smoke itself):
 *   - 'rules'         → CRITICAL  (Firestore rule access-control regression)
 *   - 'cf-behavioral' → HIGH      (CF logic regression, may be flake)
 *
 * Off-switch: NEXUS_SMOKE_DISABLED=1 env var skips the actual run and
 * returns an "available: false, reason: disabled" status. Useful during
 * known external-dependency outages or when the operator just wants a
 * dry-run of nexus full without the production-write cost.
 *
 * Cleanup: every smoke run cleans up its own ephemeral test artifacts
 * in a try/finally block. Each run uses fresh anonymous-signUp uids,
 * so concurrent / overlapping runs don't collide. A crashed prior run
 * leaves orphans that don't break subsequent runs (different uid
 * space) — operator can run `node functions/_cleanup_smoke_zombies.js`
 * periodically if residue is noticed.
 *
 * Nexus integration:
 *   nexus web-flasher-smoke           Run + pretty-print
 *   nexus web-flasher-smoke --json    Run + machine-readable
 *   alias: nexus wfs
 */
module.exports = function createWebFlasherSmokeAdapter({ name, dataPath, projectRoot }) {

    const smokePath = path.join(projectRoot, 'functions/_smoke_web_flasher_cf.js');
    let _smokeModule = null;
    function loadSmoke() {
        if (!_smokeModule) _smokeModule = require(smokePath);
        return _smokeModule;
    }

    // Memo last result for this process — getStatus() and the CLI
    // command both call into the same runner; without memoization a
    // single `nexus full` would run the smoke twice (once for status
    // polling, once for the spoke command).
    let _lastRun = null;
    let _lastRunAt = 0;
    const MEMO_TTL_MS = 60 * 1000;

    async function runSmoke(force = false) {
        if (process.env.NEXUS_SMOKE_DISABLED === '1') {
            return { skipped: true, reason: 'NEXUS_SMOKE_DISABLED=1', findings: [] };
        }
        if (!force && _lastRun && (Date.now() - _lastRunAt) < MEMO_TTL_MS) {
            return _lastRun;
        }
        // Identity Toolkit needs an explicit quota project when run
        // against user-creds ADC. Set it here so callers don't have to.
        if (!process.env.GOOGLE_CLOUD_QUOTA_PROJECT) {
            process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';
        }
        const mod = loadSmoke();
        try {
            const result = await mod.runSmoke({ verbose: false });
            _lastRun = result;
            _lastRunAt = Date.now();
            return result;
        } catch (e) {
            const errResult = {
                passed: false,
                total: 0,
                passedCount: 0,
                failedCount: 1,
                criticalFailures: 0,
                highFailures: 1,
                durationMs: 0,
                findings: [{
                    label: 'smoke runner crashed',
                    category: 'cf-behavioral',
                    severity: 'high',
                    passed: false,
                    detail: String(e && e.message || e).slice(0, 400),
                }],
                setupError: String(e && e.message || e).slice(0, 400),
            };
            _lastRun = errResult;
            _lastRunAt = Date.now();
            return errResult;
        }
    }

    function findingsFromResult(result) {
        if (!result || result.skipped || !Array.isArray(result.findings)) return [];
        return result.findings
            .filter(f => !f.passed)
            .map((f, i) => ({
                id: `web-flasher-smoke_${f.category}_${(f.label || '').replace(/[^a-z0-9]+/gi, '_').slice(0, 60)}_${i}`,
                code: 'SMOKE-WF-' + (f.category === 'rules' ? 'RULES' : 'BEHAV'),
                severity: f.severity,
                category: 'web-flasher-smoke',
                source: 'web-flasher-smoke',
                file: 'functions/_smoke_web_flasher_cf.js',
                message: '[smoke] ' + f.label + (f.detail ? ' — ' + f.detail : ''),
                fix: f.category === 'rules'
                    ? 'Access-control regression. Re-check firestore.rules diff against last green deploy. May require hot-fix.'
                    : 'Cloud Function behavioral failure. Check Cloud Logging for errors; may be a transient flake — re-run the smoke. If persistent, inspect the relevant CF in functions/index.js.',
                transient: true,
            }));
    }

    function getStatus() {
        // getStatus() must be synchronous in some Nexus invocations.
        // If we have a memoized result, return it; otherwise return
        // a "needs-run" status. The actual run happens via the spoke
        // command path.
        if (process.env.NEXUS_SMOKE_DISABLED === '1') {
            return {
                available: false,
                reason: 'NEXUS_SMOKE_DISABLED=1',
                name: 'Web-Flasher Smoke',
            };
        }
        if (_lastRun && (Date.now() - _lastRunAt) < MEMO_TTL_MS) {
            const failed = _lastRun.failedCount || 0;
            return {
                available: true,
                name: 'Web-Flasher Smoke',
                issueCount: failed,
                bySeverity: {
                    critical: _lastRun.criticalFailures || 0,
                    high:     _lastRun.highFailures     || 0,
                    medium:   0,
                    low:      0,
                    info:     0,
                },
                lastRunMs: Date.now() - _lastRunAt,
                durationMs: _lastRun.durationMs,
                assertions: _lastRun.total,
                passed: _lastRun.passedCount,
            };
        }
        // No fresh result — getStatus should not block on a network
        // call, so signal not-yet-run.
        return {
            available: false,
            reason: 'smoke has not run yet this process — invoke `nexus web-flasher-smoke` first or call via full pipeline',
            name: 'Web-Flasher Smoke',
        };
    }

    return {
        name,
        // prepare() is an optional hook called by `nexus full` (and other
        // pipelines that may add it) before the synchronous status/sync/gate
        // phases. The spoke runs the smoke once here, populating _lastRun,
        // so subsequent getStatus() / getFindings() calls hit the memo and
        // return synchronously — the gate sees real data, not a "not yet
        // run" skip.
        prepare: async () => { await runSmoke(false); },
        getStatus,
        getFindings: () => findingsFromResult(_lastRun),
        commands: {
            '': async (args, flags) => {
                const C = {
                    red:    '\x1b[31m',
                    yellow: '\x1b[33m',
                    cyan:   '\x1b[36m',
                    green:  '\x1b[32m',
                    bold:   '\x1b[1m',
                    dim:    '\x1b[2m',
                    reset:  '\x1b[0m'
                };

                const result = await runSmoke(true);

                if (flags.json) {
                    console.log(JSON.stringify(result, null, 2));
                    return result;
                }

                console.log('');
                console.log(`${C.bold}WEB-FLASHER SMOKE${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);

                if (result.skipped) {
                    console.log(`  ${C.yellow}skipped:${C.reset} ${result.reason}`);
                    console.log('');
                    return result;
                }

                const passColor = result.passed ? C.green : C.red;
                console.log(`  Assertions:      ${result.total}`);
                console.log(`  ${C.green}Passed:${C.reset}          ${result.passedCount}`);
                console.log(`  ${C.red}Failed:${C.reset}          ${result.failedCount}`);
                if (result.failedCount > 0) {
                    console.log(`    ${C.red}critical:${C.reset}      ${result.criticalFailures}`);
                    console.log(`    ${C.yellow}high:${C.reset}          ${result.highFailures}`);
                }
                console.log(`  Duration:        ${result.durationMs}ms`);
                console.log(`  Result:          ${passColor}${result.passed ? 'PASS' : 'FAIL'}${C.reset}`);

                if (result.failedCount > 0) {
                    console.log('');
                    console.log(`  ${C.bold}Failing assertions:${C.reset}`);
                    for (const f of result.findings.filter(x => !x.passed).slice(0, 20)) {
                        const tag = f.severity === 'critical'
                            ? `${C.red}[${f.category}]${C.reset}`
                            : `${C.yellow}[${f.category}]${C.reset}`;
                        console.log(`    ${tag} ${f.label}${f.detail ? ' — ' + f.detail.slice(0, 100) : ''}`);
                    }
                }
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log('');
                return result;
            }
        },
    };
};
