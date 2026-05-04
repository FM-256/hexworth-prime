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

async function checkTarget(browser, target, baseUrl) {
    const page = await browser.newPage();
    const errors = [];
    const failures = [];

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

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        for (const target of TARGETS) {
            const result = await checkTarget(browser, target, TARGET_BASE);
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
