#!/usr/bin/env node
/**
 * check-render.js -- assert that pages actually RENDER, not just parse.
 *
 * WHY THIS EXISTS
 *   On 2026-08-03 a rewrite of cloud-the-nines.html dropped its
 *   `AccessGuard.require('sorted')` line. AccessGuard.js injects
 *   `body { visibility: hidden }` on load and ONLY showContent() -- reachable through
 *   require() -- ever removes it. The result was a permanently blank tab in production:
 *   no console error, canvas present, game loop running, body invisible forever.
 *
 *   Everything else passed. `node --check` passed. Tag-balance parsing passed. Every link
 *   resolved. The bug was caught by a reviewer, not by any check in this repo, and it was
 *   very nearly shipped because the same blank-page symptom occurs harmlessly over file://
 *   and I attributed it to that.
 *
 *   This closes that gap: it serves _app over http (where the guard behaves normally), loads
 *   each page as a sorted student, and fails if the body is invisible, the guard's preload
 *   style survived, the page collapsed to the access-denied shell, or anything threw.
 *
 * USAGE
 *   node _tools/qa/check-render.js                       # a default sweep of representative pages
 *   node _tools/qa/check-render.js path/to/page.html ... # paths relative to _app
 *   node _tools/qa/check-render.js --house script        # pose as a different house
 *
 * EXIT CODE
 *   0 if every page rendered, 1 otherwise -- safe to wire into a gate.
 */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require(path.join(__dirname, '..', '..', 'node_modules', 'puppeteer'));

const APP = path.join(__dirname, '..', '..', '_app');
const PORT = 8811 + Math.floor(process.uptime() * 7) % 40;   // avoid collisions between runs

const args = process.argv.slice(2);
let house = 'cloud';
const hi = args.indexOf('--house');
if (hi !== -1) { house = args[hi + 1] || 'cloud'; args.splice(hi, 2); }

/* A representative page of each shape that carries an access guard. Not exhaustive -- the point
   is one of every KIND, because the failure is per-page-template, not per-page. */
const DEFAULT_PAGES = [
    'games.html',
    'houses/cloud/openstack/index.html',
    'houses/cloud/games/cloud-the-nines.html',
    'houses/cloud/openstack/labs/cloud-openstack-neutron-live.lab.html',
    'houses/cloud/openstack/labs/cloud-openstack-launch-vm.lab.html',
    'houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html',
    'houses/cloud/openstack/handouts/openstack-build-reference.html'
];
const pages = args.length ? args : DEFAULT_PAGES;

/* The access-denied shell is ~12KB. A real page is far larger; anything at or under this after
   load means the guard replaced the document. Measured across every lab on 2026-08-03. */
const DENIED_SHELL_MAX = 13000;

(async () => {
    const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
        { cwd: APP, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let failed = 0;

    for (const rel of pages) {
        const pg = await browser.newPage();
        const errs = [];
        pg.on('pageerror', (e) => errs.push(e.message));
        await pg.evaluateOnNewDocument((h) => {
            try { localStorage.setItem('hexworth_house', h); } catch (e) { /* private mode */ }
        }, house);
        await pg.setViewport({ width: 1280, height: 800 });

        let r;
        try {
            await pg.goto(`http://127.0.0.1:${PORT}/${rel}`, { waitUntil: 'networkidle2', timeout: 25000 });
            await new Promise((x) => setTimeout(x, 2200));
            r = await pg.evaluate(() => ({
                visibility: getComputedStyle(document.body).visibility,
                preloadSurvived: !!document.getElementById('access-guard-preload'),
                bodyLen: document.body.innerHTML.length,
                landedOn: location.pathname.split('/').pop()
            }));
        } catch (e) {
            r = { visibility: 'ERROR', preloadSurvived: true, bodyLen: 0, landedOn: e.message.slice(0, 40) };
        }

        const redirected = !rel.endsWith(r.landedOn);
        const problems = [];
        if (r.visibility !== 'visible') problems.push(`body ${r.visibility}`);
        if (r.preloadSurvived) problems.push('access-guard-preload never removed');
        if (r.bodyLen <= DENIED_SHELL_MAX && !redirected) problems.push(`body only ${r.bodyLen}B (access-denied shell?)`);
        if (errs.length) problems.push(`${errs.length} pageerror: ${errs[0].slice(0, 60)}`);

        const ok = problems.length === 0;
        if (!ok) failed++;
        console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${rel}`);
        console.log(`        visible=${r.visibility} bodyLen=${r.bodyLen}${redirected ? ' -> ' + r.landedOn : ''}`);
        problems.forEach((p) => console.log(`        ! ${p}`));
        await pg.close();
    }

    await browser.close();
    server.kill();

    console.log(`\n  ${pages.length - failed}/${pages.length} pages rendered`);
    if (failed) console.log('  A blank page here is the AccessGuard.require() failure -- see the header of this file.');
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('check-render FAILED:', e.message); process.exit(1); });
