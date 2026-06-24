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

async function main() {
    const startedAt = new Date().toISOString();

    let browser;
    let targetResults = [];
    let runError = null;

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

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

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
        // Latest status — overwritten each run; Pulse onSnapshots this for real-time.
        await db.collection('_quality_reports').doc('runtime_latest').set(report);
        // Rolling history (~48 runs = ~12h) for the trend strip — compact summaries.
        const maxNavMs = targetResults.reduce((m, r) => Math.max(m, r.navMs || 0), 0);
        const summary = { t: completedAt, ok: allPassed, passed, failed, maxNavMs };
        const histRef = db.collection('_quality_reports').doc('runtime_history');
        const snap = await histRef.get();
        const runs = (snap.exists && Array.isArray(snap.data().runs)) ? snap.data().runs : [];
        runs.push(summary);
        await histRef.set({ runs: runs.slice(-48), updatedAt: completedAt });
    } catch (e) {
        // Surface to Cloud Logging but never fail the run on a write error.
        console.error(JSON.stringify({ firestoreWriteError: e.message || String(e) }));
    }

    // Exit code reflects health: 0 = all green, 1 = at least one failure
    process.exit(allPassed ? 0 : 1);
}

main().catch(e => {
    console.error(JSON.stringify({
        schema: 'hexworth.runtime-monitor/v1',
        fatalError: e.message || String(e),
        startedAt: new Date().toISOString()
    }));
    process.exit(2);
});
