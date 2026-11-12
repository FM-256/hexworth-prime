#!/usr/bin/env node
'use strict';

/**
 * Hexworth Runtime Monitor (MVP)
 *
 * Hits live hexworth.com URLs from a real browser and reports pass/fail
 * + first-error diagnostics. Designed to run as a Cloud Run scheduled job
 * (~every 15 min during business hours, every 60 min off-hours).
 *
 * What this catches that the pre-deploy smoke gate doesn't:
 *   - CDN / Firebase Hosting outages
 *   - Third-party degradation (Aminos, Firebase Auth went down post-deploy)
 *   - Slow regressions (page worked yesterday but a Firestore index changed)
 *   - Intermittent JS errors that don't reproduce in local headless
 *
 * Output: structured JSON to stdout (Cloud Logging captures it). Each run
 * emits one top-level object suitable for ingestion into Pulse via Firestore.
 *
 * Usage (local dry-run):
 *   node _tools/runtime-monitor/run.js                 # default targets, prod
 *   TARGET_BASE=https://hexworth.com node ...          # explicit base URL
 *   PRETTY=1 node ...                                  # pretty-print JSON
 *
 * Cloud Run usage (later): Dockerfile + gcloud run deploy + Cloud Scheduler.
 */

const puppeteer = require('puppeteer');

const TARGET_BASE = process.env.TARGET_BASE || 'https://hexworth.com';
const NAV_TIMEOUT_MS = parseInt(process.env.NAV_TIMEOUT_MS || '25000', 10);
// Chrome start-up: per-attempt timeout and attempts before the run is reported as failed.
// Budget (Nancy, 2026-11-12): the job's task timeout is 300 s. 5 targets x (25 s nav + 2 s settle)
// = 135 s worst case, so 3 launches x 40 s = 120 s leaves ~45 s for start-up and the Firestore write.
// A task Cloud Run kills writes NOTHING (no failed run, no Pulse update), worse than a failed run.
const LAUNCH_TIMEOUT_MS = parseInt(process.env.LAUNCH_TIMEOUT_MS || '40000', 10);
const LAUNCH_ATTEMPTS = Math.max(1, parseInt(process.env.LAUNCH_ATTEMPTS || '3', 10));
const SETTLE_MS = parseInt(process.env.SETTLE_MS || '2000', 10);
const PRETTY = process.env.PRETTY === '1';

// ── PROBE MODE ───────────────────────────────────────────────────────
// 'anonymous' (default) — current production behavior, public probes
// 'auth'                — SYM-14 auth-mode (skeleton; not yet shipped)
// Set via PROBE_MODE env var. When PROBE_MODE=auth, run.js loads
// auth-targets.js + auth-client.js and injects sign-in state per target.
const PROBE_MODE = process.env.PROBE_MODE || 'anonymous';

// ── TARGETS ──────────────────────────────────────────────────────────
// Subset of the smoke gate's targets, focused on highest-blast-radius pages.
// Runtime monitor pings these continuously — keep the list tight for cost +
// signal-to-noise. Add only after a real outage that the existing list missed.

const TARGETS = [
    {
        name: 'Landing',
        url: '/index.html',
        assertions: []
    },
    {
        name: 'Sorting',
        url: '/sorting.html',
        assertions: []
    },
    {
        name: 'Dashboard (housed user)',
        url: '/dashboard.html',
        seedLocalStorage: { hexworth_house: 'web' },
        assertions: [
            { type: 'selector-count', selector: '.mini-house-card', min: 5 }
        ]
    },
    {
        name: 'House of Web',
        url: '/houses/web/index.html',
        seedLocalStorage: { hexworth_house: 'web' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1 }
        ]
    },
    {
        name: 'WSA Hub',
        url: '/houses/cloud/modules/wsa/index.html',
        seedLocalStorage: { hexworth_house: 'cloud' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 10 }
        ]
    }
];

// ── ERROR FILTERING ──────────────────────────────────────────────────
// Mirror the smoke gate's filter — same external services that aren't
// render blockers should not be flagged in production either.

const IGNORED_ERROR_PATTERNS = [
    /aminos\.ai/i,
    /platform\.aminos/i,
    /firebase/i,
    /firestore/i,
    /api\.github\.com/i,
    /raw\.githubusercontent/i,
    /\.cloudfunctions\.net/i,
    /Failed to load resource/i,
    /bot settings/i,
    /\[object ge\]/,
    /tripwire/i,
    /honeypot/i,
    /\[ORACLE\]/i,
    /\[HEXWORTH SECURITY\]/i,
    /TELEMETRY/i,
    /favicon/i,
    /mascot/i,
    /hero-animated/i,
    /update.*check/i,
    /UpdateManager/i,
    /version\.json/i,
    /unknown house/i,
    /\bfetch failed\b/i,
    /websocket connection/i,
    /MessagingWidget/i,
    /Firestore not available/i,
    /Quiz key not found/i,
    /quiz_keys/i,
    /Signed out/i,
    /not authenticated/i,
    /No active user/i
];

function isIgnoredError(text) {
    if (!text) return true;
    return IGNORED_ERROR_PATTERNS.some(p => p.test(text));
}

// ── CHECK A SINGLE TARGET ────────────────────────────────────────────

async function checkTarget(browser, target, baseUrl, authState) {
    const page = await browser.newPage();
    const errors = [];
    const failures = [];

    // SYM-14: if this target requires auth, attach auth state to the page
    // BEFORE seedLocalStorage runs (so Firebase SDK sees the auth state on
    // first script execution). Stub call — see auth-client.js for TODOs.
    if (target.requiresAuth) {
        if (!authState) {
            failures.push('AUTH: target requires auth but no authState provided (PROBE_MODE != auth?)');
        } else {
            const authClient = require('./auth-client');
            await authClient.attachAuthToPage(page, authState);  // throws until SYM-14 ships
        }
    }

    page.on('pageerror', e => {
        const msg = 'pageerror: ' + (e.message || String(e));
        if (!isIgnoredError(msg)) errors.push(msg);
    });
    page.on('console', m => {
        if (m.type() !== 'error') return;
        const txt = m.text();
        if (!isIgnoredError(txt)) errors.push('console.error: ' + txt);
    });
    page.on('requestfailed', r => {
        const url = r.url();
        const reason = r.failure() ? r.failure().errorText : 'unknown';
        if (isIgnoredError(url) || reason === 'net::ERR_ABORTED') return;
        errors.push(`reqfail: ${reason} ${url.substring(0, 100)}`);
    });

    if (target.seedLocalStorage) {
        await page.evaluateOnNewDocument((seed) => {
            for (const [k, v] of Object.entries(seed)) {
                try { localStorage.setItem(k, v); } catch (_) {}
            }
        }, target.seedLocalStorage);
    }

    const startedAt = Date.now();
    let httpStatus = null;
    try {
        const response = await page.goto(`${baseUrl}${target.url}`, {
            waitUntil: 'networkidle2',
            timeout: NAV_TIMEOUT_MS
        });
        httpStatus = response ? response.status() : null;
        await new Promise(r => setTimeout(r, SETTLE_MS));
    } catch (e) {
        failures.push('NAV: ' + (e.message || String(e)).substring(0, 200));
    }
    const navMs = Date.now() - startedAt;

    if (errors.length > 0) {
        failures.push(...errors.map(e => 'JS: ' + e));
    }

    for (const a of target.assertions) {
        if (a.type === 'selector-count') {
            try {
                const count = await page.evaluate(s => document.querySelectorAll(s).length, a.selector);
                if (count < a.min) {
                    failures.push(`ASSERT: "${a.selector}" found ${count}, expected >= ${a.min}`);
                }
            } catch (e) {
                failures.push(`ASSERT-ERR: ${a.selector}: ${e.message}`);
            }
        }
    }

    await page.close();

    return {
        target: target.name,
        url: target.url,
        httpStatus,
        navMs,
        passed: failures.length === 0,
        failures: failures.slice(0, 5)  // cap detail per target
    };
}

// ── MAIN ─────────────────────────────────────────────────────────────

/* Starts Chrome, retrying a stalled or failed launch. Returns { browser, attempts }; on the last
 * failure throws an Error carrying .attempts.
 * Why: Chrome start-up stalls were 83 of 93 failed runs over 2026-10-13..11-12 ("Timed out after
 * 30000 ms while waiting for the WS endpoint"): the MONITOR failed and the site was never checked.
 * Cloud Run's /dev/shm is small, so Chrome is told to use /tmp, and each attempt gets a longer
 * timeout than Puppeteer's 30 s default. */
/* What a failed run's alert says. When no page was checked the MONITOR failed (83 of 93 failed
 * runs 10-13..11-12 were Chrome not starting), so it says so instead of "down:" and an empty list. */
function failureText(monitorError, runError, targetResults) {
    if (monitorError) { return 'MONITOR could not run, the site was NOT checked (' + String(runError).slice(0, 120) + ')'; }
    return 'down: ' + targetResults.filter(r => !r.passed).map(r => r.target).join(', ');
}

async function launchBrowser(pptr, attempts, timeoutMs) {
    for (let n = 1; ; n++) {
        try {
            const browser = await pptr.launch({
                headless: 'new',
                timeout: timeoutMs,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            return { browser, attempts: n };
        } catch (e) {
            if (n >= attempts) {
                const err = new Error('Chrome did not start after ' + n + ' attempt' + (n === 1 ? '' : 's') + ': ' + (e.message || e));
                err.attempts = n;
                throw err;
            }
        }
    }
}

async function main() {
    const startedAt = new Date().toISOString();

    let browser;
    let targetResults = [];
    let runError = null;
    let launchAttempts = 0;   // Chrome launches tried this run (1 = first try worked)

    // SYM-14 mode dispatch — pick target set based on PROBE_MODE.
    // Anonymous mode unchanged from MVP. Auth mode loads stub modules
    // (will throw inside signIn() if invoked — see auth-client.js
    // for TODOs blocking implementation). All errors land in runError.
    let activeTargets = TARGETS;
    let authState = null;

    try {
        if (PROBE_MODE === 'auth') {
            const { AUTH_TARGETS } = require('./auth-targets');
            const authClient = require('./auth-client');
            activeTargets = AUTH_TARGETS;
            authState = await authClient.signIn();  // throws until SYM-14 decisions are made
        } else if (PROBE_MODE !== 'anonymous') {
            throw new Error(`Unknown PROBE_MODE: ${PROBE_MODE} (expected 'anonymous' or 'auth')`);
        }

        const launched = await launchBrowser(puppeteer, LAUNCH_ATTEMPTS, LAUNCH_TIMEOUT_MS)
            .catch((e) => { launchAttempts = e.attempts || 0; throw e; });
        browser = launched.browser;
        launchAttempts = launched.attempts;

        for (const target of activeTargets) {
            const result = await checkTarget(browser, target, TARGET_BASE, authState);
            targetResults.push(result);
        }
    } catch (e) {
        runError = e.message || String(e);
    } finally {
        if (browser) await browser.close().catch(() => {});
    }

    const completedAt = new Date().toISOString();
    const passed = targetResults.filter(r => r.passed).length;
    const failed = targetResults.length - passed;
    const allPassed = failed === 0 && !runError;
    // True when the run errored before checking any page: the monitor failed, the site is unknown.
    const monitorError = !!runError && targetResults.length === 0;

    const report = {
        schema: 'hexworth.runtime-monitor/v1',
        probeMode: PROBE_MODE,
        startedAt,
        completedAt,
        targetBase: TARGET_BASE,
        targetsChecked: targetResults.length,
        passed,
        failed,
        allPassed,
        runError,
        launchAttempts,
        monitorError,
        targets: targetResults
    };

    // Structured JSON to stdout — Cloud Logging captures one log entry per line.
    if (PRETTY) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(JSON.stringify(report));
    }

    // Publish to Firestore for the Pulse "Site Health" panel. Best-effort:
    // a Firestore failure must never change the health exit code. Written as
    // flat docs under _quality_reports (covered by the existing admin-read rule;
    // the admin SDK bypasses write rules via the Cloud Run service account).
    try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) admin.initializeApp();  // ADC / Cloud Run service account
        const db = admin.firestore();
        const maxNavMs = targetResults.reduce((m, r) => Math.max(m, r.navMs || 0), 0);

        // Read history first — needed to count consecutive failures.
        const histRef = db.collection('_quality_reports').doc('runtime_history');
        const snap = await histRef.get();
        const runs = (snap.exists && Array.isArray(snap.data().runs)) ? snap.data().runs : [];

        // Evaluate alert thresholds (env-overridable). A single failed run is a
        // WARNING; ALERT_CONSEC_CRIT consecutive failures escalate to CRITICAL, so a
        // transient blip (e.g. a post-deploy cache miss) does not page. Latency
        // thresholds flag pages that are up but slow.
        const T = {
            latWarnMs: parseInt(process.env.ALERT_LAT_WARN_MS || '15000', 10),
            latCritMs: parseInt(process.env.ALERT_LAT_CRIT_MS || '25000', 10),
            consecCrit: parseInt(process.env.ALERT_CONSEC_CRIT || '2', 10)
        };
        const alerts = [];
        // Count trailing failed runs in history, plus this run if it failed.
        let consec = allPassed ? 0 : 1;
        if (!allPassed) {
            for (let i = runs.length - 1; i >= 0; i--) {
                if (runs[i] && runs[i].ok === false) consec++; else break;
            }
            const what = failureText(monitorError, runError, targetResults);
            if (consec >= T.consecCrit) alerts.push({ severity: 'critical', message: consec + ' consecutive failed runs — ' + what });
            else alerts.push({ severity: 'warning', message: 'failed this run — ' + what });
        }
        // Latency thresholds (only for targets that are up — a failed target is already alerted).
        targetResults.forEach(function (r) {
            if (!r.passed) return;
            if (r.navMs >= T.latCritMs) alerts.push({ severity: 'critical', message: r.target + ' very slow (' + (r.navMs / 1000).toFixed(1) + 's)' });
            else if (r.navMs >= T.latWarnMs) alerts.push({ severity: 'warning', message: r.target + ' slow (' + (r.navMs / 1000).toFixed(1) + 's)' });
        });
        const alertLevel = alerts.some(function (a) { return a.severity === 'critical'; }) ? 'critical' : (alerts.length ? 'warning' : 'none');
        report.alerts = alerts;
        report.alertLevel = alertLevel;
        report.thresholds = T;
        report.consecutiveFailures = consec;

        // Latest status (Pulse onSnapshots this) + rolling history (~48 runs ≈ 12h).
        await db.collection('_quality_reports').doc('runtime_latest').set(report);
        runs.push({ t: completedAt, ok: allPassed, passed, failed, maxNavMs, alertLevel: alertLevel, launchAttempts, monitorError });
        await histRef.set({ runs: runs.slice(-48), updatedAt: completedAt });

        // Structured alert line for log-based GCP alerting / Cloud Logging visibility.
        if (alertLevel !== 'none') {
            console.error(JSON.stringify({ runtimeAlert: alertLevel, alerts: alerts.map(function (a) { return a.message; }) }));
        }
    } catch (e) {
        // Surface to Cloud Logging but never fail the run on a write error.
        console.error(JSON.stringify({ firestoreWriteError: e.message || String(e) }));
    }

    // Exit code reflects health: 0 = all green, 1 = at least one failure
    process.exit(allPassed ? 0 : 1);
}

module.exports = { launchBrowser, failureText };

/* Run only when executed (the Cloud Run entrypoint), not when a test requires the file. */
if (require.main === module) main().catch(e => {
    console.error(JSON.stringify({
        schema: 'hexworth.runtime-monitor/v1',
        fatalError: e.message || String(e),
        startedAt: new Date().toISOString()
    }));
    process.exit(2);
});
