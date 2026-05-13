#!/usr/bin/env node
'use strict';

/**
 * smoke-lab-content-leaks.js
 *
 * Standing regression smoke for CTF lab content. Loads each lab in the
 * CHECKS array on production (or a preview channel), waits for its config
 * global to attach, and asserts that known answer-leak vectors are absent
 * and known fix strings are present. Originally seeded with the 6 fixes
 * from commit 61994e05 (2026-05-13); grow over time as future lab-content
 * regressions are caught.
 *
 * Does NOT play through each lab end-to-end — that's a different test.
 * This is a deploy-correctness smoke: did the right bytes ship.
 *
 * Exit codes:
 *   0 — all assertions passed
 *   1 — one or more assertions failed (regression detected)
 *   2 — infrastructure failure (puppeteer launch, network, missing deps)
 *
 * Usage:
 *   node _tools/smoke-lab-content-leaks.js
 *   BASE=https://master--hexworth-prime.web.app node _tools/smoke-lab-content-leaks.js   (preview channel)
 */

const puppeteer = require('puppeteer');

const BASE = process.env.BASE || 'https://hexworth.com';
const NAV_TIMEOUT = 30000;

const CHECKS = [
    {
        lab: 'pis-l09-outbreak-detection',
        config: 'PISL09Config',
        url: '/houses/shield/infosec/labs/pis-l09-outbreak-detection/index.html',
        assertions: [
            { type: 'absent', cmd: 'help',
              needle: 'Focus on: ALT-023, ALT-071, ALT-158',
              label: 'L09 help no longer leaks answer IDs' }
        ]
    },
    {
        lab: 'pis-l12-full-facility-inspection',
        config: 'PISL12Config',
        url: '/houses/shield/infosec/labs/pis-l12-full-facility-inspection/index.html',
        assertions: [
            { type: 'present', path: 'lore.intro',
              needle: 'five domains',
              label: 'L12 intro says "five domains"' },
            { type: 'absent', path: 'lore.intro',
              needle: 'four domains',
              label: 'L12 intro no longer says "four domains"' }
        ]
    },
    {
        lab: 'pis-l02-human-vector-drill',
        config: 'PISL02Config',
        url: '/houses/shield/infosec/labs/pis-l02-human-vector-drill/index.html',
        assertions: [
            { type: 'toolkit-sample-includes', toolkitName: 'flag',
              needle: 'phishing',
              label: 'L02 toolkit flag sample includes technique arg' }
        ]
    },
    {
        lab: 'pis-l06-vault-seal-operations',
        config: 'PISL06Config',
        url: '/houses/shield/infosec/labs/pis-l06-vault-seal-operations/index.html',
        assertions: [
            { type: 'absent-cmd', cmd: 'sha256sum', cmdArgs: ['-c', '/vault/manifest-hashes.txt'],
              needle: 'DAMAGED_HASH_PLACEHOLDER',
              label: 'L06 sha256sum -c output no longer contains DAMAGED_HASH_PLACEHOLDER' },
            { type: 'present-fs', path: '/vault/manifest-hashes.txt',
              needle: '8f3e4d2a916b5c7e0d8a4f9b3c2e1f0a6d5b8e7c9a4f3b1e2d6c0a5f8b9e3c2d',
              label: 'L06 manifest-hashes.txt has new realistic SHA-256' }
        ]
    }
];

async function runOne(browser, check) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('console.error: ' + msg.text()); });

    const url = BASE + check.url;
    const results = [];

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });

        // Wait for the config global to attach. Configs are declared `const` at
        // script top-level so they live in script scope, not on window. Access via
        // eval — which lifts to the outer scope where `const` is visible.
        await page.waitForFunction(
            (cfgName) => {
                try { return typeof eval(cfgName) === 'object' && eval(cfgName) !== null; }
                catch { return false; }
            },
            { timeout: NAV_TIMEOUT },
            check.config
        );

        for (const a of check.assertions) {
            let pass = false;
            let detail = '';

            if (a.type === 'absent' && a.cmd) {
                // Invoke a command handler in-page and check its output string
                const output = await page.evaluate((cfgName, cmd) => {
                    const cfg = eval(cfgName);
                    const fn = cfg.commands && cfg.commands[cmd];
                    if (!fn) return '__NO_CMD__';
                    try {
                        // Mock engine: provide config back-reference
                        const mockEngine = { config: cfg, awardFlag: () => {}, terminal: null };
                        return fn([], null, mockEngine);
                    } catch (e) { return '__ERR__: ' + e.message; }
                }, check.config, a.cmd);
                pass = typeof output === 'string' && !output.includes(a.needle);
                detail = pass ? `output ok (len=${output.length})` : `LEAK: ${a.needle} found in ${a.cmd} output`;
            }
            else if (a.type === 'present' && a.path) {
                const val = await page.evaluate((cfgName, path) => {
                    const parts = path.split('.');
                    let v = eval(cfgName);
                    for (const p of parts) v = v && v[p];
                    return v;
                }, check.config, a.path);
                pass = typeof val === 'string' && val.includes(a.needle);
                detail = pass ? `present in ${a.path}` : `MISSING: "${a.needle}" not in ${a.path}`;
            }
            else if (a.type === 'absent' && a.path) {
                const val = await page.evaluate((cfgName, path) => {
                    const parts = path.split('.');
                    let v = eval(cfgName);
                    for (const p of parts) v = v && v[p];
                    return v;
                }, check.config, a.path);
                pass = typeof val === 'string' && !val.includes(a.needle);
                detail = pass ? `not present in ${a.path}` : `STILL THERE: "${a.needle}" still in ${a.path}`;
            }
            else if (a.type === 'toolkit-sample-includes') {
                const sample = await page.evaluate((cfgName, toolkitName) => {
                    const cfg = eval(cfgName);
                    const tk = (cfg.lore && cfg.lore.toolkit) || [];
                    const entry = tk.find(t => t.name === toolkitName);
                    return entry ? entry.sample : null;
                }, check.config, a.toolkitName);
                pass = typeof sample === 'string' && sample.includes(a.needle);
                detail = pass ? `sample="${sample}"` : `BAD SAMPLE: "${sample}" missing "${a.needle}"`;
            }
            else if (a.type === 'absent-cmd') {
                const output = await page.evaluate((cfgName, cmd, args) => {
                    const cfg = eval(cfgName);
                    const fn = cfg.commands && cfg.commands[cmd];
                    if (!fn) return '__NO_CMD__';
                    try {
                        const mockEngine = { config: cfg, awardFlag: () => {}, terminal: null };
                        return fn(args, null, mockEngine);
                    } catch (e) { return '__ERR__: ' + e.message; }
                }, check.config, a.cmd, a.cmdArgs);
                pass = typeof output === 'string' && !output.includes(a.needle);
                detail = pass ? `output ok (len=${output.length})` : `LEAK: ${a.needle} still in ${a.cmd} output`;
            }
            else if (a.type === 'present-fs') {
                // Walk the in-lab filesystem object to find the file content
                const content = await page.evaluate((cfgName, target) => {
                    const cfg = eval(cfgName);
                    const fs = cfg.filesystem || {};
                    // Filesystem root is keyed under '/'. Walk from there.
                    let node = fs['/'];
                    const segments = target.split('/').filter(Boolean);
                    for (const seg of segments) {
                        node = node && node.children && node.children[seg];
                        if (!node) return null;
                    }
                    return node && node.content;
                }, check.config, a.path);
                pass = typeof content === 'string' && content.includes(a.needle);
                detail = pass ? `found in ${a.path}` : `NOT FOUND in ${a.path}`;
            }

            results.push({ label: a.label, pass, detail });
        }
    } catch (e) {
        results.push({ label: 'load', pass: false, detail: 'EXCEPTION: ' + e.message });
    }

    if (errors.length > 0) {
        results.push({ label: 'no js errors', pass: false, detail: errors.slice(0, 3).join(' | ') });
    } else {
        results.push({ label: 'no js errors', pass: true, detail: '' });
    }

    await page.close();
    return { lab: check.lab, results };
}

(async () => {
    console.log(`\n══ LAB CONTENT-LEAK SMOKE ══`);
    console.log(`Base: ${BASE}\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let totalPass = 0, totalFail = 0;

    for (const check of CHECKS) {
        const { lab, results } = await runOne(browser, check);
        console.log(`[${lab}]`);
        for (const r of results) {
            const mark = r.pass ? '  PASS' : '  FAIL';
            console.log(`${mark}  ${r.label}${r.detail ? ' — ' + r.detail : ''}`);
            if (r.pass) totalPass++; else totalFail++;
        }
        console.log('');
    }

    await browser.close();

    console.log(`══ ${totalPass} PASS / ${totalFail} FAIL ══`);
    process.exit(totalFail === 0 ? 0 : 1);
})().catch(e => { console.error('SMOKE ERROR:', e); process.exit(2); });
