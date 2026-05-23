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
    },
    // QC-46 sub-task 7 + QC-47 (Ethics in IT + PIS hub coverage). Both
    // hubs have 41-45 static data-module nodes — min: 30 catches partial-
    // render regressions (ZION pattern) with headroom for legitimate
    // catalog fluctuation.
    {
        name: 'Ethics in IT Hub (CIS4253)',
        url: '/houses/divergent/ethics-it/index.html',
        seedLocalStorage: { hexworth_house: 'divergent' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 30,
              note: 'Ethics IT hub should render 45+ static data-module nodes (presentations + labs + quizzes + reviews)' }
        ]
    },
    {
        name: 'PIS Hub (CIS2350C)',
        url: '/houses/shield/infosec/index.html',
        seedLocalStorage: { hexworth_house: 'shield' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 30,
              note: 'PIS hub should render 41+ static data-module nodes (17 presentations + 4 quizzes + 12 labs + reviews)' }
        ]
    },
    // Active-course coverage extension (2026-05-09): two largest active-course
    // hubs not yet smoke-gated. Same min: 30 threshold per Nancy precedent —
    // catches catastrophic partial-render uniformly across courses regardless
    // of the hub's full node count (PFI: 40, Network+: 115).
    {
        name: 'Python for IT Hub (COP1034C)',
        url: '/houses/code/python-for-it/index.html',
        seedLocalStorage: { hexworth_house: 'code' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 30,
              note: 'PFI hub should render 40+ static data-module nodes (W1-W4 presentations + labs + quizzes + final exam)' }
        ]
    },
    {
        name: 'Network+ Hub (N10-009)',
        url: '/houses/web/network-plus/index.html',
        seedLocalStorage: { hexworth_house: 'web' },
        assertions: [
            { type: 'selector-count', selector: '[data-module]', min: 50,
              note: 'Network+ hub should render 115+ static data-module nodes (largest active course hub on the platform)' }
        ]
    },
    // CIS4253 capstone coverage (2026-05-19). The eth-l14 "The Reckoning"
    // mega-lab is the course closeout EDT case room with 15 evidence items,
    // 16 stakeholders, 6 decisions, 7 codeProvisions. Single-page lab smoke
    // -- the existing TARGETS list is hub-level only. Three assertions catch
    // any catastrophic engine-render regression on the largest EDT artifact
    // on the platform. Thresholds are set to exact expected counts; the
    // capstone has fixed structure so any reduction is a regression, not a
    // legitimate fluctuation.
    {
        name: 'Ethics in IT Capstone — The Reckoning (eth-l14)',
        url: '/houses/divergent/ethics-it/labs/eth-l14-the-reckoning/index.html',
        seedLocalStorage: { hexworth_house: 'divergent' },
        assertions: [
            { type: 'selector-count', selector: '.edt-evidence-card', min: 15,
              note: 'Capstone should render all 15 evidence cards (E1-E15)' },
            { type: 'selector-count', selector: '.edt-decision-item', min: 6,
              note: 'Capstone should render all 6 decisions (D1-D6)' },
            { type: 'selector-count', selector: '.edt-stakeholder-item', min: 16,
              note: 'Capstone should render all 16 stakeholders (S1-S16)' }
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

        // ── Functional smoke: PIS-M2 midterm (Vault Breach) ──────────
        // Walks all 11 command handlers in Node directly (no browser), verifies
        // the 4-flag gating chain end-to-end. Catches regressions that the
        // selector-based TARGETS checks above cannot see (flag-gating bugs,
        // T1486 gaming bypass, etc.). 26 checkpoints, ~1s runtime.
        try {
            const { execFileSync } = require('child_process');
            execFileSync('node', [path.join(__dirname, 'test-pis-m2-functional.js')],
                { stdio: 'pipe' });
            console.log('  ✓ PIS-M2 midterm functional smoke (26 checkpoints)');
        } catch (e) {
            console.log('  ✗ PIS-M2 midterm functional smoke — FAILED');
            const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
            // Surface only the failing checkpoints (lines starting with ✗)
            out.split('\n').filter(l => l.includes('✗') || l.includes('FAIL'))
               .slice(0, 10).forEach(l => console.log('      ' + l.trim()));
            allPassed = false;
        }

        // ── Functional smoke: PIS-FINAL practical (Patient Zero — Eclipse) ──
        // Walks 7 phases via terminal commands + form handlers in Node.
        // Verifies all 7 flag values match locked spec, Phase 6 composite gate,
        // Phase 7 SHA256 synthesis, score floor at 0, hint Help Levels.
        // ~45 checkpoints, ~1s runtime.
        try {
            const { execFileSync } = require('child_process');
            execFileSync('node', [path.join(__dirname, 'test-pis-final-functional.js')],
                { stdio: 'pipe' });
            console.log('  ✓ PIS-FINAL practical functional smoke (Patient Zero, Eclipse)');
        } catch (e) {
            console.log('  ✗ PIS-FINAL practical functional smoke — FAILED');
            const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
            out.split('\n').filter(l => l.includes('✗') || l.includes('FAIL'))
               .slice(0, 10).forEach(l => console.log('      ' + l.trim()));
            allPassed = false;
        }

        // ── BOX-* validator cascade ──────────────────────────────────
        // 11 validators built 2026-05-22 catching the PIS-FINAL defect classes:
        //   - BOX-001: flag_registry seed coverage (blocking)
        //   - BOX-002a: walkthrough existence (informational — 1 deferred for nt1 duplicate)
        //   - BOX-002b: walkthrough has flag values per scenario (informational)
        //   - BOX-002c: walkthrough ↔ box_flags.json drift (blocking)
        //   - BOX-003: engine API correctness lint (blocking)
        //   - BOX-004: multi-action gate exclusivity (blocking)
        //   - BOX-005: scoring.minScore floor presence (blocking)
        //   - BOX-006: mutable-state resetState hook (informational — 24 legacy boxes pending backfill)
        //   - BOX-007: recoverable-action presence (blocking)
        //   - BOX-008: flag value shell-safety (informational — PIS-FINAL flag1 documented)
        //   - BOX-009: decoy provenance surfaced (informational — heuristic)
        //   - BOX-010: hint Help Level honesty (informational — heuristic, 252 boxes opt out)
        //   - BOX-011: client-side flag literal leak (informational — narrative boxes expected)
        //   - BOX-013: registryId == directory basename (blocking — typo catcher)
        //   - BOX-014: discoverability orphan (informational — 90 known orphan dispatch boxes)
        //   - BOX-016: index.html bootstrap scripts (blocking — engine/config/auth essentials)
        //   - BOX-020: flag count consistency vs box_flags.json (blocking — mechanism-aware)
        //   - BOX-024: duplicate flag values within a box (blocking — Mode-2 CF ambiguity)
        //   - BOX-035: asset existence (informational — 5 WIP-author boxes with placeholder assets)
        //   - BOX-037: localStorage flag bypass detection (blocking — security regression class)
        //   - BOX-042: storageKey uniqueness (informational — 1 known nt1 dispatch/arena duplicate)
        //
        // Each validator has a self-validation gate (exit 2 if its logic
        // misclassifies PIS-FINAL); deploy-gate treats exit 2 as a hard fail.
        const EDUSCAN_DIR = path.join(__dirname, '..');
        const BOX_VALIDATORS = [
            { code: 'BOX-001',  script: 'box-flag-registry-audit.js',      blocking: true,  desc: 'flag_registry seed coverage' },
            { code: 'BOX-002a', script: 'box-walkthrough-audit.js',        blocking: false, desc: 'walkthrough existence' },
            { code: 'BOX-002b', script: 'box-walkthrough-flag-audit.js',   blocking: false, desc: 'walkthrough has flag values' },
            { code: 'BOX-002c', script: 'box-walkthrough-flag-drift.js',   blocking: true,  desc: 'walkthrough ↔ box_flags drift' },
            { code: 'BOX-003',  script: 'box-engine-api-lint.js',          blocking: true,  desc: 'engine API correctness' },
            { code: 'BOX-004',  script: 'box-gate-exclusivity-lint.js',    blocking: true,  desc: 'multi-action gate exclusivity' },
            { code: 'BOX-005',  script: 'box-scoring-floor-audit.js',      blocking: true,  desc: 'scoring.minScore floor' },
            { code: 'BOX-006',  script: 'box-state-reset-audit.js',        blocking: false, desc: 'state-reset hook' },
            { code: 'BOX-007',  script: 'box-recoverable-action-audit.js', blocking: true,  desc: 'recoverable-action presence' },
            { code: 'BOX-008',  script: 'box-flag-shell-safety.js',        blocking: false, desc: 'flag shell-safety' },
            { code: 'BOX-009',  script: 'box-decoy-provenance-lint.js',    blocking: false, desc: 'decoy provenance surfaced' },
            { code: 'BOX-010',  script: 'box-hint-help-level-lint.js',     blocking: false, desc: 'hint Help Level honesty' },
            { code: 'BOX-011',  script: 'box-flag-leak-audit.js',          blocking: false, desc: 'client-side flag literal leak' },
            { code: 'BOX-013',  script: 'box-registry-id-dirname.js',      blocking: true,  desc: 'registryId == dirname' },
            { code: 'BOX-014',  script: 'box-content-catalog-orphan.js',   blocking: false, desc: 'discoverability orphan' },
            { code: 'BOX-016',  script: 'box-html-bootstrap-audit.js',     blocking: true,  desc: 'index.html bootstrap scripts' },
            { code: 'BOX-020',  script: 'box-flag-count-consistency.js',   blocking: true,  desc: 'flag count consistency' },
            { code: 'BOX-024',  script: 'box-flag-value-duplicates.js',    blocking: true,  desc: 'duplicate flag values' },
            { code: 'BOX-035',  script: 'box-asset-existence-audit.js',    blocking: false, desc: 'asset existence' },
            { code: 'BOX-037',  script: 'box-localstorage-flag-bypass.js', blocking: true,  desc: 'localStorage flag bypass' },
            { code: 'BOX-042',  script: 'box-storage-key-uniqueness.js',   blocking: false, desc: 'storageKey uniqueness' }
        ];

        const { execFileSync } = require('child_process');
        for (const v of BOX_VALIDATORS) {
            // Always run WITHOUT --report-only so the validator exits non-zero on findings.
            // Catch differentiates blocking (fail the gate) vs informational (log + continue).
            try {
                execFileSync('node', [path.join(EDUSCAN_DIR, v.script)], { stdio: 'pipe' });
                console.log(`  ✓ ${v.code} ${v.desc}`);
            } catch (e) {
                const code = e.status;
                const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
                // Extract the per-rule findings count line for context
                const summary = out.split('\n').filter(l =>
                    /^\s*(CRITICAL|HIGH|MEDIUM|MISSING|drift|AT-RISK|NEGATIVE|NO recovery|Under-disclosed|Has unsafe|Context only):/.test(l)
                ).slice(0, 3);

                if (code === 2) {
                    // Self-validation failure — validator logic broken; always blocking
                    console.log(`  ✗ ${v.code} ${v.desc} — SELF-VALIDATION FAILED (logic broken)`);
                    summary.forEach(l => console.log('      ' + l.trim()));
                    allPassed = false;
                } else if (v.blocking) {
                    console.log(`  ✗ ${v.code} ${v.desc} — FAILED (deploy-blocking)`);
                    summary.forEach(l => console.log('      ' + l.trim()));
                    allPassed = false;
                } else {
                    console.log(`  ⚠ ${v.code} ${v.desc} — informational findings (not blocking)`);
                    summary.forEach(l => console.log('      ' + l.trim()));
                }
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
