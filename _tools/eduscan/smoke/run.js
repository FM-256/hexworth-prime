#!/usr/bin/env node
'use strict';

/**
 * EduScan Pre-Deploy Smoke Gate
 *
 * Spins up a local HTTP server pointed at _app/, launches Puppeteer headless,
 * and verifies a small set of critical pages render correctly with no JS errors.
 *
 * Designed to run BEFORE `firebase deploy hosting` to block deploys that would
 * ship a broken render — exactly the v7.1.0 ZION failure mode.
 *
 * Exit 0 on pass, 1 on failure.
 *
 * Override (for emergencies):
 *   SKIP_SMOKE=1 SKIP_SMOKE_REASON="why" node _tools/eduscan/smoke/run.js
 *
 * Targets: small, high-blast-radius pages — landing, sorting, dashboard, two
 * house indices, and the WSA hub (last incident's blast zone).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const APP_DIR = path.resolve(__dirname, '../../../_app');
const PORT = parseInt(process.env.SMOKE_PORT || '8765', 10);
const NAV_TIMEOUT_MS = 20000;
const SETTLE_MS = 1500;

// ── TARGETS ──────────────────────────────────────────────────────────
// Add targets here as the platform grows. Keep the list small (<15) — this
// is a smoke gate, not a full regression suite. Use selector-count assertions
// to verify the page actually rendered content, not just returned 200.

const TARGETS = [
    {
        name: 'Landing',
        url: '/index.html',
        assertions: []  // no-page-errors is implicit
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
            { type: 'selector-count', selector: '.mini-house-card', min: 5,
              note: 'Dashboard Explore tab should render house cards' }
        ]
    },
    {
        name: 'House of Web',
        url: '/houses/web/index.html',
        seedLocalStorage: { hexworth_house: 'web' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1,
              note: 'House page should render at least one module card' }
        ]
    },
    {
        name: 'House of Forge',
        url: '/houses/forge/index.html',
        seedLocalStorage: { hexworth_house: 'forge' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1 }
        ]
    },
    {
        name: 'WSA Hub (last-incident blast zone)',
        url: '/houses/cloud/modules/wsa/index.html',
        seedLocalStorage: { hexworth_house: 'cloud' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 10,
              note: 'WSA hub should render 20+ module cards via data-module attrs' }
        ]
    },
    // SYM-6 Tier 1 (Minimal): close the missing-house-index coverage gap. Eye,
    // Script, and Dark Arts had ZERO smoke coverage. Each adds ~5s to deploy.
    {
        name: 'House of Eye',
        url: '/houses/eye/index.html',
        seedLocalStorage: { hexworth_house: 'eye' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1,
              note: 'House page should render at least one module card' }
        ]
    },
    {
        name: 'House of Script',
        url: '/houses/script/index.html',
        seedLocalStorage: { hexworth_house: 'script' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1,
              note: 'House page should render at least one module card' }
        ]
    },
    {
        name: 'House of Dark Arts',
        url: '/houses/dark-arts/index.html',
        seedLocalStorage: { hexworth_house: 'dark-arts' },
        assertions: [
            { type: 'selector-count', selector: '.module-card', min: 1,
              note: 'House page should render at least one module card' }
        ]
    }
];

// ── ERROR FILTERING ──────────────────────────────────────────────────
// Ignore errors from external services that may be unavailable in headless
// (Aminos chat plugin, Firebase Auth without prod creds, GitHub release
// checks, TripWire educational warnings). These are NOT signals of broken
// platform code.

const IGNORED_ERROR_PATTERNS = [
    // External services / domains
    /aminos\.ai/i,
    /platform\.aminos/i,
    /firebase/i,
    /firestore/i,
    /api\.github\.com/i,
    /raw\.githubusercontent/i,
    /\.cloudfunctions\.net/i,
    // Browser-generic resource-failure messages (URL is logged separately as requestfailed)
    /Failed to load resource/i,
    // Aminos chat plugin specific noise
    /bot settings/i,
    /\[object ge\]/,            // Serialization quirk in chat plugin error
    // Educational / monitoring noise
    /tripwire/i,
    /honeypot/i,
    /\[ORACLE\]/i,
    /\[HEXWORTH SECURITY\]/i,
    /TELEMETRY/i,
    // Asset noise
    /favicon/i,
    /mascot/i,                  // Mascot mp4s sometimes 404 in dev
    /hero-animated/i,
    // Update / version checks
    /update.*check/i,
    /UpdateManager/i,
    /version\.json/i,
    // AmbientMusic warns on non-canonical houses (e.g., 'web' which isn't a music theme)
    /unknown house/i,
    // Network/external fetch handled gracefully
    /\bfetch failed\b/i,
    /websocket connection/i,
    /MessagingWidget/i,
    /Firestore not available/i,
    /Quiz key not found/i,      // Server-grade only — diag log, not user-visible
    /quiz_keys/i,
    // Auth / session bootstrap (expected in headless without real Firebase Auth)
    /Signed out/i,
    /not authenticated/i,
    /No active user/i
];

function isIgnoredError(text) {
    if (!text) return true;
    return IGNORED_ERROR_PATTERNS.some(p => p.test(text));
}

// ── LOCAL FILE SERVER ────────────────────────────────────────────────

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.woff':  'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':   'font/ttf',
    '.ico':   'image/x-icon'
};

function startServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let urlPath = decodeURIComponent(req.url.split('?')[0]);
            if (urlPath === '/') urlPath = '/index.html';
            const filePath = path.join(APP_DIR, urlPath);
            // Path traversal guard
            if (!filePath.startsWith(APP_DIR)) {
                res.writeHead(403); return res.end('forbidden');
            }
            fs.readFile(filePath, (err, data) => {
                if (err) { res.writeHead(404); return res.end('not found: ' + urlPath); }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, {
                    'Content-Type': MIME[ext] || 'application/octet-stream',
                    'Cache-Control': 'no-store'
                });
                res.end(data);
            });
        });
        server.on('error', reject);
        server.listen(PORT, '127.0.0.1', () => resolve(server));
    });
}

// ── TARGET CHECK ─────────────────────────────────────────────────────

async function checkTarget(browser, target) {
    const page = await browser.newPage();
    const errors = [];

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
        // Ignore failed requests to filtered domains, abort'd requests, and ad blockers
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

    try {
        await page.goto(`http://127.0.0.1:${PORT}${target.url}`, {
            waitUntil: 'networkidle2',
            timeout: NAV_TIMEOUT_MS
        });
        await new Promise(r => setTimeout(r, SETTLE_MS));
    } catch (e) {
        errors.push('NAV: ' + (e.message || String(e)).substring(0, 200));
    }

    const failures = [];

    // Implicit assertion: no JS errors
    if (errors.length > 0) {
        failures.push(...errors.map(e => 'JS: ' + e));
    }

    // Explicit assertions
    for (const a of target.assertions) {
        if (a.type === 'selector-count') {
            try {
                const count = await page.evaluate(s => document.querySelectorAll(s).length, a.selector);
                if (count < a.min) {
                    const note = a.note ? ` — ${a.note}` : '';
                    failures.push(`ASSERT: "${a.selector}" found ${count}, expected >= ${a.min}${note}`);
                }
            } catch (e) {
                failures.push(`ASSERT: error evaluating "${a.selector}": ${e.message}`);
            }
        }
    }

    await page.close();
    return failures;
}

// ── MAIN ─────────────────────────────────────────────────────────────

async function main() {
    if (process.env.SKIP_SMOKE) {
        const reason = process.env.SKIP_SMOKE_REASON || '(no reason provided)';
        console.log('');
        console.log(`⚠️  SMOKE GATE SKIPPED — reason: ${reason}`);
        console.log(`   (Logged to stdout for audit trail.)`);
        console.log('');
        process.exit(0);
    }

    console.log('');
    console.log('═══ EduScan Pre-Deploy Smoke Gate ═══');
    console.log('');

    let server, browser;
    try {
        server = await startServer();
        console.log(`Local server: http://127.0.0.1:${PORT} → ${APP_DIR}`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('');

        let allPassed = true;
        for (const target of TARGETS) {
            const failures = await checkTarget(browser, target);
            if (failures.length === 0) {
                console.log(`  ✓ ${target.name}`);
            } else {
                console.log(`  ✗ ${target.name}  (${target.url})`);
                failures.slice(0, 8).forEach(f => console.log(`      ${f.substring(0, 200)}`));
                if (failures.length > 8) {
                    console.log(`      ... and ${failures.length - 8} more`);
                }
                allPassed = false;
            }
        }

        console.log('');
        if (allPassed) {
            console.log('SMOKE GATE: PASS — deploy may proceed');
            process.exit(0);
        } else {
            console.log('SMOKE GATE: FAIL — deploy BLOCKED');
            console.log('');
            console.log('To override (emergency only):');
            console.log('  SKIP_SMOKE=1 SKIP_SMOKE_REASON="describe why" <your-deploy-command>');
            process.exit(1);
        }
    } catch (e) {
        console.error('FATAL:', e.message);
        process.exit(1);
    } finally {
        if (browser) await browser.close().catch(() => {});
        if (server) server.close();
    }
}

main();
