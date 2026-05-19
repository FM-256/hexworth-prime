#!/usr/bin/env node
'use strict';

/**
 * Targeted browser smoke for eth-l14 capstone "The Reckoning".
 * Spins local HTTP server on _app/, launches puppeteer, navigates the
 * capstone URL with house=divergent seeded, checks the EDT engine renders
 * all phases. Exit 0 on pass, 1 on fail.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const APP_DIR = path.resolve(__dirname, '../../../_app');
const PORT = 8765;
const URL_PATH = '/houses/divergent/ethics-it/labs/eth-l14-the-reckoning/index.html';

const MIME = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let urlPath = req.url.split('?')[0];
            if (urlPath === '/') urlPath = '/index.html';
            const filePath = path.join(APP_DIR, urlPath);
            if (!filePath.startsWith(APP_DIR)) { res.writeHead(403).end(); return; }
            fs.readFile(filePath, (err, data) => {
                if (err) { res.writeHead(404).end('not found'); return; }
                const ext = path.extname(filePath);
                res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
                res.end(data);
            });
        });
        server.listen(PORT, () => resolve(server));
    });
}

(async () => {
    const server = await startServer();
    console.log(`[smoke] local server on :${PORT}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const jsErrors = [];
    const consoleErrors = [];
    page.on('pageerror', err => jsErrors.push(err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed localStorage so AccessGuard.require('sorted') passes
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        localStorage.setItem('hexworth_house', 'divergent');
    });

    console.log('[smoke] navigating to capstone...');
    const url = `http://localhost:${PORT}${URL_PATH}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2500)); // settle for engine render

    const results = await page.evaluate(() => {
        const r = {};
        r.title = document.title;
        r.url = window.location.pathname;
        r.caseroomExists = !!document.getElementById('caseroom');
        r.caseroomHasContent = (document.getElementById('caseroom')?.innerHTML.length || 0) > 1000;
        r.h1Text = document.querySelector('h1')?.textContent || '';
        r.briefVisible = document.body.textContent.includes('Chief Ethics & Compliance Officer');
        r.containsApex = document.body.textContent.includes('Apex Cloud Services');
        r.containsCompound = document.body.textContent.includes('Five dimensions');
        r.evidenceMentioned = document.body.textContent.includes('Evidence');
        r.decisionsMentioned = document.body.textContent.includes('Decisions') || document.body.textContent.includes('decisions');
        // Probe rendered evidence/stakeholder/decision counts via EDT engine output.
        // The engine renders evidence cards, stakeholder picker items, decisions,
        // and code-provision cards. We sample by text content since the engine's
        // DOM structure varies by phase.
        const bodyText = document.body.textContent;
        // Apex Co-Pilot patient deaths (E1), OAuth misconfig (E3), Tomas Reyes (E4),
        // CDC report (E6), SEC 10-Q (E13 red herring), IoT vulnerability (E14 red herring)
        r.evidenceMarkers = [
            bodyText.includes('Clinical Co-Pilot') || bodyText.includes('Apex Clinical'),
            bodyText.includes('OAuth') || bodyText.includes('Northpoint'),
            bodyText.includes('Tomas Reyes') || bodyText.includes('Reyes'),
            bodyText.includes('CDC') || bodyText.includes('Variant-Z'),
            bodyText.includes('SEC') || bodyText.includes('10-Q'),
            bodyText.includes('IoT')
        ].filter(Boolean).length;
        // Decision text markers (one from each of 6 decisions)
        r.decisionMarkers = [
            bodyText.includes('Sign the General Counsel') || bodyText.includes('General Counsel’s draft'),
            bodyText.includes('alternative memorandum'),
            bodyText.includes('Refuse to sign'),
            bodyText.includes('Resign from the Senior Director'),
            bodyText.includes('Co-Pilot offline'),
            bodyText.includes('reclassify Mr. Reyes') || bodyText.includes('reclassify Mr. Reyes')
        ].filter(Boolean).length;
        // Code provision markers
        r.codeMarkers = [
            bodyText.includes('ACM 1.1') || bodyText.includes('Contribute to society'),
            bodyText.includes('Avoid harm'),
            bodyText.includes('Be honest and trustworthy'),
            bodyText.includes('not to discriminate'),
            bodyText.includes('comprehensive and thorough'),
            bodyText.includes('Ensure that the public good'),
            bodyText.includes('Hold paramount the safety')
        ].filter(Boolean).length;
        // EDT engine UI elements
        r.briefPhaseRendered = !!document.querySelector('.edt-brief, [class*="brief"]');
        r.phaseTabsRendered = document.querySelectorAll('[class*="edt-phase"], [class*="phase-"]').length;
        return r;
    });

    await browser.close();
    server.close();

    // Filter ignorable errors
    const IGNORED = [/firebase/i, /firestore/i, /aminos/i, /\.cloudfunctions\.net/i,
                     /tripwire/i, /Failed to load resource/i, /favicon/i, /mascot/i,
                     /AmbientMusic/i, /unknown house/i, /TELEMETRY/i, /\[HEXWORTH/i,
                     /websocket/i, /MessagingWidget/i, /Firestore not available/i];
    const isIgnorable = (msg) => IGNORED.some(re => re.test(msg));
    const realJsErrors = jsErrors.filter(e => !isIgnorable(e));
    const realConsoleErrors = consoleErrors.filter(e => !isIgnorable(e));

    console.log('\n────── L14 CAPSTONE SMOKE RESULTS ──────');
    console.log('URL                     :', results.url);
    console.log('Page title              :', results.title);
    console.log('H1                      :', results.h1Text);
    console.log('Caseroom element        :', results.caseroomExists ? 'yes' : 'NO');
    console.log('Caseroom rendered       :', results.caseroomHasContent ? 'yes (>1KB content)' : 'NO');
    console.log('Brief visible (CECO)    :', results.briefVisible ? 'yes' : 'NO');
    console.log('Apex Cloud mentioned    :', results.containsApex ? 'yes' : 'NO');
    console.log('Five dimensions in DOM  :', results.containsCompound ? 'yes' : 'NO');
    console.log('Evidence markers in DOM :', results.evidenceMarkers, '/ 6 (Co-Pilot, OAuth, Reyes, CDC, SEC, IoT)');
    console.log('Decision markers in DOM :', results.decisionMarkers, '/ 6 (D1-D6 text)');
    console.log('Code provision markers  :', results.codeMarkers, '/ 7 (ACM 1.1/1.2/1.3/1.4/2.5/3.1 + IEEE 1)');
    console.log('EDT phase elements      :', results.phaseTabsRendered);
    console.log('JS pageerrors (real)    :', realJsErrors.length);
    console.log('Console errors (real)   :', realConsoleErrors.length);

    if (realJsErrors.length) realJsErrors.forEach(e => console.log('  pageerror:', e));
    if (realConsoleErrors.length) realConsoleErrors.slice(0, 10).forEach(e => console.log('  console:', e));

    const pass =
        results.caseroomExists &&
        results.caseroomHasContent &&
        results.briefVisible &&
        results.containsApex &&
        results.evidenceMarkers >= 4 &&
        results.codeMarkers >= 5 &&
        results.phaseTabsRendered >= 3 &&
        realJsErrors.length === 0;

    console.log('\n', pass ? '✓ PASS' : '✗ FAIL');
    process.exit(pass ? 0 : 1);
})().catch(err => {
    console.error('[smoke] crashed:', err);
    process.exit(2);
});
